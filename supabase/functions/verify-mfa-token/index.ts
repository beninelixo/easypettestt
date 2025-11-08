import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { TOTP } from 'https://deno.land/x/god_crypto@v1.4.11/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  token: string;
  enable_mfa?: boolean;
  session_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { token: otpToken, enable_mfa, session_id }: VerifyRequest = await req.json();

    if (!otpToken || otpToken.length !== 6) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Token inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar secret do usuário
    const { data: mfaSecret, error: secretError } = await supabase
      .from('mfa_secrets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (secretError || !mfaSecret) {
      return new Response(
        JSON.stringify({ valid: false, error: 'MFA não configurado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar token TOTP usando god_crypto
    const totp = new TOTP(mfaSecret.secret_key);
    const isValid = totp.verify(otpToken);

    if (!isValid) {
      // Log de tentativa falha
      await supabase.from('system_logs').insert({
        module: 'mfa',
        log_type: 'warning',
        message: 'Token MFA inválido',
        details: { user_id: user.id, email: user.email }
      });

      return new Response(
        JSON.stringify({ valid: false, error: 'Token inválido ou expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Token válido!
    
    // Se é para ativar MFA
    if (enable_mfa) {
      await supabase
        .from('mfa_secrets')
        .update({ 
          enabled: true, 
          verified_at: new Date().toISOString() 
        })
        .eq('user_id', user.id);

      await supabase.from('system_logs').insert({
        module: 'mfa',
        log_type: 'success',
        message: 'MFA ativado com sucesso',
        details: { user_id: user.id, email: user.email }
      });
    }

    // Se tem session_id, criar sessão MFA verificada
    if (session_id) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Expira em 24h

      await supabase.from('mfa_sessions').insert({
        user_id: user.id,
        session_id,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      });
    }

    return new Response(
      JSON.stringify({
        valid: true,
        session_id: session_id || null,
        mfa_enabled: enable_mfa ? true : mfaSecret.enabled,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao verificar token MFA:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return new Response(
      JSON.stringify({ valid: false, error: 'Erro ao verificar token', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
