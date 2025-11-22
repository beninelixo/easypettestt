import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verificar se é admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = roleData?.role === 'admin' || roleData?.role === 'super_admin' || user.email === 'beninelixo@gmail.com';
    
    if (!isAdmin) {
      throw new Error('Permission denied: Admin access required');
    }

    // Obter dados do corpo da requisição
    const { userId, reason } = await req.json();

    if (!userId) {
      throw new Error('Missing userId');
    }

    // Não permitir bloquear o próprio God User
    if (userId === user.id && user.email === 'beninelixo@gmail.com') {
      throw new Error('Cannot block God User');
    }

    // Atualizar perfil para bloquear usuário
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_blocked: true,
        blocked_reason: reason || 'Bloqueado por administrador',
        blocked_at: new Date().toISOString(),
        blocked_by: user.id
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Registrar em audit logs
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      table_name: 'profiles',
      operation: 'BLOCK_USER',
      record_id: userId,
      new_data: { is_blocked: true, blocked_reason: reason }
    });

    // Criar alerta de segurança
    await supabase.from('admin_alerts').insert({
      alert_type: 'user_blocked',
      severity: 'medium',
      title: 'Usuário Bloqueado',
      message: `Usuário bloqueado por ${user.email}. Razão: ${reason || 'Não especificada'}`,
      context: { blocked_user_id: userId, blocked_by: user.id, reason }
    });

    console.log(`✅ User ${userId} blocked by ${user.email}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Usuário bloqueado com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error blocking user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});