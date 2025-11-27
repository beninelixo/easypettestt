import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const listUsersSchema = z.object({
  page: z.number().int().positive().default(1),
  perPage: z.number().int().min(1).max(100).default(50),
  search: z.string().optional(),
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Cabeçalho de autorização ausente' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !adminUser) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se é admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUser.id)
      .maybeSingle();

    const isAdmin = roleData?.role === 'admin' || roleData?.role === 'super_admin' || adminUser.email === 'beninelixo@gmail.com';
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado: você precisa ser admin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate body
    const body = await req.json().catch(() => ({}));
    const validationResult = listUsersSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: "Parâmetros inválidos" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { page, perPage, search } = validationResult.data;

    // Fetch all auth users using admin API
    const { data: authData, error: authUsersError } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar usuários', details: authUsersError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const users = authData.users;
    const userIds = users.map(u => u.id);

    // Fetch profiles for all users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    // Fetch roles for all users
    const { data: roles } = await supabase
      .from('user_roles')
      .select('*')
      .in('user_id', userIds);

    // Fetch pet shops for pet_shop role users
    const { data: petShops } = await supabase
      .from('pet_shops')
      .select('id, name, owner_id, subscription_plan, subscription_expires_at')
      .in('owner_id', userIds);

    // Combine data
    const enrichedUsers = users.map(user => {
      const profile = profiles?.find(p => p.id === user.id);
      const roleData = roles?.find(r => r.user_id === user.id);
      const petShop = petShops?.find(ps => ps.owner_id === user.id);

      return {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        full_name: profile?.full_name || user.user_metadata?.full_name || 'Sem nome',
        phone: profile?.phone || '',
        avatar_url: profile?.avatar_url || '',
        role: roleData?.role || null,
        is_blocked: profile?.is_blocked || false,
        pet_shop: petShop || null,
      };
    });

    // Filter by search if provided
    let filteredUsers = enrichedUsers;
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredUsers = enrichedUsers.filter(u => 
        u.full_name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.phone?.includes(searchLower)
      );
    }

    console.log(`✅ Listed ${filteredUsers.length} users for admin ${adminUser.email}`);

    return new Response(
      JSON.stringify({ 
        users: filteredUsers,
        total: authData.total || filteredUsers.length,
        page,
        perPage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error listing users:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
