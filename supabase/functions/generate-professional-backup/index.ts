import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BackupOptions {
  includeClients: boolean;
  includeAppointments: boolean;
  includeServices: boolean;
  includeProducts: boolean;
  includeFinancial: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Não autorizado");
    }

    const { petShopId, options, format } = await req.json();

    if (!petShopId) {
      throw new Error("Pet shop ID é obrigatório");
    }

    // Verify user owns the pet shop
    const { data: petShop, error: petShopError } = await supabase
      .from("pet_shops")
      .select("id, name, owner_id")
      .eq("id", petShopId)
      .eq("owner_id", user.id)
      .single();

    if (petShopError || !petShop) {
      throw new Error("Pet shop não encontrado ou acesso negado");
    }

    console.log(`Generating backup for pet shop: ${petShop.name} (${petShopId})`);

    const backupData: any = {
      metadata: {
        generated_at: new Date().toISOString(),
        pet_shop_name: petShop.name,
        pet_shop_id: petShopId,
        format: format,
        version: "1.0",
      },
      data: {},
    };

    let totalRecords = 0;

    // Fetch Clients and Pets
    if (options.includeClients) {
      console.log("Fetching clients and pets...");
      
      // Get client IDs from appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select("client_id")
        .eq("pet_shop_id", petShopId);

      if (appointments && appointments.length > 0) {
        const clientIds = [...new Set(appointments.map(a => a.client_id))];

        const { data: clients } = await supabase
          .from("profiles")
          .select("id, full_name, phone, email, address, document, contact_preference, created_at, avatar_url")
          .in("id", clientIds);

        const { data: pets } = await supabase
          .from("pets")
          .select("*")
          .in("owner_id", clientIds);

        backupData.data.clients = clients || [];
        backupData.data.pets = pets || [];
        totalRecords += (clients?.length || 0) + (pets?.length || 0);
      }
    }

    // Fetch Appointments
    if (options.includeAppointments) {
      console.log("Fetching appointments...");
      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          *,
          services (name, description, price, duration_minutes),
          pets (name, breed, species)
        `)
        .eq("pet_shop_id", petShopId)
        .order("scheduled_date", { ascending: false });

      backupData.data.appointments = appointments || [];
      totalRecords += appointments?.length || 0;
    }

    // Fetch Services
    if (options.includeServices) {
      console.log("Fetching services...");
      const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("pet_shop_id", petShopId)
        .order("name");

      backupData.data.services = services || [];
      totalRecords += services?.length || 0;
    }

    // Fetch Products
    if (options.includeProducts) {
      console.log("Fetching products...");
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("pet_shop_id", petShopId)
        .order("name");

      const { data: stockMovements } = await supabase
        .from("stock_movements")
        .select("*")
        .in("product_id", (products || []).map(p => p.id))
        .order("created_at", { ascending: false })
        .limit(1000);

      backupData.data.products = products || [];
      backupData.data.stock_movements = stockMovements || [];
      totalRecords += (products?.length || 0) + (stockMovements?.length || 0);
    }

    // Fetch Financial Data
    if (options.includeFinancial) {
      console.log("Fetching financial data...");
      const { data: payments } = await supabase
        .from("payments")
        .select(`
          *,
          appointments (scheduled_date, client_id)
        `)
        .in("appointment_id", 
          backupData.data.appointments?.map((a: any) => a.id) || []
        )
        .order("created_at", { ascending: false });

      const { data: commissions } = await supabase
        .from("commissions")
        .select("*")
        .eq("pet_shop_id", petShopId)
        .order("created_at", { ascending: false });

      // Calculate summary
      const totalRevenue = payments?.filter(p => p.status === 'pago')
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      
      const pendingPayments = payments?.filter(p => p.status === 'pendente')
        .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      backupData.data.payments = payments || [];
      backupData.data.commissions = commissions || [];
      backupData.data.financial_summary = {
        total_revenue: totalRevenue,
        pending_payments: pendingPayments,
        total_payments_count: payments?.length || 0,
        total_commissions: commissions?.reduce((sum, c) => sum + Number(c.commission_value), 0) || 0,
      };
      totalRecords += (payments?.length || 0) + (commissions?.length || 0);
    }

    backupData.metadata.total_records = totalRecords;

    // Save backup record to database
    const backupSize = new Blob([JSON.stringify(backupData)]).size;
    
    const { error: insertError } = await supabase
      .from("professional_backups")
      .insert({
        pet_shop_id: petShopId,
        created_by: user.id,
        backup_type: "full",
        format: format,
        file_size_bytes: backupSize,
        metadata: backupData.metadata,
        status: "completed",
      });

    if (insertError) {
      console.error("Error saving backup record:", insertError);
    }

    console.log(`Backup completed successfully. Total records: ${totalRecords}, Size: ${backupSize} bytes`);

    return new Response(JSON.stringify(backupData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error generating backup:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
