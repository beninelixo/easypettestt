import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-service-role',
};

const requestSchema = z.object({
  targetEmail: z.string().email('Email inválido'),
  newPassword: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').max(128),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[admin-reset-password] Iniciando requisição');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autorização - aceita JWT ou service role
    const authHeader = req.headers.get('Authorization');
    const serviceRoleHeader = req.headers.get('x-service-role');
    
    let isAuthorized = false;
    let callerEmail = 'system';

    // Check if it's a service role call (internal)
    if (serviceRoleHeader === supabaseServiceKey) {
      isAuthorized = true;
      callerEmail = 'service_role';
      console.log('[admin-reset-password] Autorizado via service role');
    }
    // Check if it's a JWT call from God User
    else if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && caller?.email === 'beninelixo@gmail.com') {
        isAuthorized = true;
        callerEmail = caller.email;
        console.log('[admin-reset-password] Autorizado via God User JWT');
      }
    }

    if (!isAuthorized) {
      console.log('[admin-reset-password] Acesso negado');
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Apenas God User ou Service Role permitido.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar body
    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      console.log('[admin-reset-password] Validação falhou:', validation.error.issues);
      return new Response(
        JSON.stringify({ error: validation.error.issues[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { targetEmail, newPassword } = validation.data;
    console.log('[admin-reset-password] Redefinindo senha para:', targetEmail);

    // Buscar usuário alvo
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('[admin-reset-password] Erro ao listar usuários:', listError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar usuários' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetUser = users?.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());
    
    if (!targetUser) {
      console.log('[admin-reset-password] Usuário não encontrado:', targetEmail);
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atualizar senha
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('[admin-reset-password] Erro ao atualizar senha:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log da ação
    await supabase.from('audit_logs').insert({
      user_id: targetUser.id,
      table_name: 'auth.users',
      operation: 'ADMIN_PASSWORD_RESET',
      record_id: targetUser.id,
      new_data: { 
        action: 'password_reset_by_admin', 
        target_email: targetEmail,
        reset_by: callerEmail,
        timestamp: new Date().toISOString()
      }
    });

    console.log('[admin-reset-password] Senha redefinida com sucesso para:', targetEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Senha redefinida com sucesso para ${targetEmail}` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[admin-reset-password] Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
