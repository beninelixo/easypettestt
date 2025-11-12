import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schema de validação
const acceptInviteSchema = z.object({
  token: z.string().uuid('Token inválido'),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verificar autenticação do usuário
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Autenticação necessária' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Validar payload
    const body = await req.json();
    const validation = acceptInviteSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Dados inválidos', 
          details: validation.error.format() 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { token: inviteToken } = validation.data;

    // 3. Buscar convite
    const { data: invite, error: inviteError } = await supabase
      .from('admin_invites')
      .select('*')
      .eq('token', inviteToken)
      .single();

    if (inviteError || !invite) {
      return new Response(
        JSON.stringify({ error: 'Convite não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Verificar se convite já foi aceito
    if (invite.accepted) {
      return new Response(
        JSON.stringify({ error: 'Este convite já foi utilizado' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Verificar expiração
    if (new Date(invite.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Este convite expirou' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Verificar email match
    if (invite.email !== user.email) {
      return new Response(
        JSON.stringify({ error: 'Este convite foi enviado para outro email' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Executar transação atômica: marcar convite aceito + adicionar role
    const { error: updateError } = await supabase
      .from('admin_invites')
      .update({ 
        accepted: true, 
        accepted_at: new Date().toISOString(),
        accepted_by: user.id 
      })
      .eq('id', invite.id);

    if (updateError) {
      console.error('Error updating invite:', updateError);
      throw updateError;
    }

    // Adicionar role admin
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: user.id, 
        role: 'admin' 
      }, { 
        onConflict: 'user_id' 
      });

    if (roleError) {
      console.error('Error adding admin role:', roleError);
      throw roleError;
    }

    // 8. Registrar auditoria
    await supabase.from('role_changes_audit').insert({
      changed_user_id: user.id,
      changed_by: invite.invited_by,
      old_role: null,
      new_role: 'admin',
      action: 'added',
      metadata: {
        via: 'invite_acceptance',
        invite_id: invite.id,
        invite_token: inviteToken,
      },
    });

    console.log('Admin invite accepted successfully:', {
      user_id: user.id,
      email: user.email,
      invited_by: invite.invited_by,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Convite aceito com sucesso! Você agora é um administrador.' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error accepting invite:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao aceitar convite',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
