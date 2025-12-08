import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const blockUserSchema = z.object({
  userId: z.string().uuid("ID de usuário inválido"),
  reason: z.string().min(10, "Motivo deve ter no mínimo 10 caracteres").max(500, "Motivo muito longo")
});

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
      return new Response(
        JSON.stringify({ error: 'Cabeçalho de autorização ausente' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se é admin (suporta múltiplos roles)
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('Error checking admin role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar permissões de admin' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isAdmin = roleData?.some(r => r.role === 'admin' || r.role === 'super_admin') || user.email === 'beninelixo@gmail.com';
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado: você precisa ser admin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const validationResult = blockUserSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return new Response(
        JSON.stringify({ 
          error: "Dados inválidos", 
          details: errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, reason } = validationResult.data;

    // Verificar se usuário alvo existe
    const { data: targetUser, error: targetError } = await supabase.auth.admin.getUserById(userId);
    if (targetError || !targetUser) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Não permitir bloquear o próprio God User
    if (targetUser.user.email === 'beninelixo@gmail.com') {
      return new Response(
        JSON.stringify({ error: 'Não é possível bloquear o usuário god' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Bloquear usuário no perfil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_blocked: true,
        blocked_reason: reason,
        blocked_at: new Date().toISOString(),
        blocked_by: user.id
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error blocking user:', updateError);
      return new Response(
        JSON.stringify({ error: 'Erro ao bloquear usuário', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      message: `Usuário ${targetUser.user.email} bloqueado por ${user.email}`,
      context: { blocked_user_id: userId, blocked_by: user.id, reason }
    });

    console.log(`✅ User ${userId} blocked by ${user.email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário bloqueado com sucesso',
        blocked_email: targetUser.user.email
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error blocking user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});