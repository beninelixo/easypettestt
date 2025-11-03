import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const thirtyDaysFromNow = futureDate.toISOString().split('T')[0];

    // Produtos já vencidos
    const { data: expired, error: expiredError } = await supabase
      .from('products')
      .select('id, name, expiry_date, pet_shop_id')
      .lt('expiry_date', today)
      .eq('active', true);

    if (expiredError) throw expiredError;

    // Produtos próximos do vencimento (30 dias)
    const { data: expiring, error: expiringError } = await supabase
      .from('products')
      .select('id, name, expiry_date, pet_shop_id, stock_quantity')
      .gte('expiry_date', today)
      .lte('expiry_date', thirtyDaysFromNow)
      .eq('active', true)
      .gt('stock_quantity', 0);

    if (expiringError) throw expiringError;

    const alerts: any[] = [];

    // Desativar produtos vencidos
    if (expired && expired.length > 0) {
      const { error: deactivateError } = await supabase
        .from('products')
        .update({ 
          active: false,
          notes: `Desativado automaticamente por vencimento em ${new Date().toISOString()}`
        })
        .in('id', expired.map(p => p.id));

      if (deactivateError) throw deactivateError;

      alerts.push({
        type: 'expired',
        severity: 'critical',
        count: expired.length,
        products: expired
      });
    }

    // Alertar produtos próximos do vencimento
    if (expiring && expiring.length > 0) {
      alerts.push({
        type: 'expiring_soon',
        severity: 'warning',
        count: expiring.length,
        products: expiring.map(p => ({
          id: p.id,
          name: p.name,
          expiry_date: p.expiry_date,
          days_until_expiry: Math.floor(
            (new Date(p.expiry_date).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)
          ),
          stock_quantity: p.stock_quantity
        }))
      });
    }

    // Registrar log se houver alertas
    if (alerts.length > 0) {
      await supabase.from('system_logs').insert({
        module: 'check_expiring_products',
        log_type: expired && expired.length > 0 ? 'error' : 'warning',
        message: `Alertas de validade: ${expired?.length || 0} vencidos, ${expiring?.length || 0} a vencer`,
        details: { alerts }
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        alerts,
        summary: {
          expired: expired?.length || 0,
          expiring_soon: expiring?.length || 0
        }
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking expiring products:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});