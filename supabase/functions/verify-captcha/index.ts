import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  captcha_token: string;
  action?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { captcha_token, action }: VerifyRequest = await req.json();

    if (!captcha_token) {
      console.error('❌ Token CAPTCHA não fornecido');
      return new Response(
        JSON.stringify({ success: false, error: 'Token CAPTCHA é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const secretKey = Deno.env.get('HCAPTCHA_SECRET_KEY');
    if (!secretKey || secretKey.length < 30) {
      console.error('❌ HCAPTCHA_SECRET_KEY inválida ou não configurada:', {
        exists: !!secretKey,
        length: secretKey?.length || 0
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'CAPTCHA não configurado no servidor',
          details: 'Secret key inválida'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log detalhado da requisição
    console.log('🔍 Verificando CAPTCHA:', {
      action: action || 'unknown',
      tokenLength: captcha_token.length,
      tokenPrefix: captcha_token.substring(0, 20) + '...',
      timestamp: new Date().toISOString()
    });

    // Verificar token com hCaptcha API (com timeout)
    const verifyUrl = 'https://hcaptcha.com/siteverify';
    const formData = new URLSearchParams();
    formData.append('response', captcha_token);
    formData.append('secret', secretKey);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    const data = await response.json();

    // Log detalhado do resultado
    console.log('📊 Resultado da verificação hCaptcha:', {
      success: data.success,
      error_codes: data['error-codes'] || [],
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
      action: action || 'unknown',
      timestamp: new Date().toISOString()
    });

    // Tratamento específico de erros
    if (!data.success) {
      const errorCodes = data['error-codes'] || [];
      let errorMessage = 'CAPTCHA inválido';
      
      if (errorCodes.includes('invalid-input-secret')) {
        errorMessage = 'Configuração incorreta do CAPTCHA no servidor';
        console.error('❌ Secret Key inválida - verifique HCAPTCHA_SECRET_KEY');
      } else if (errorCodes.includes('invalid-input-response')) {
        errorMessage = 'Token CAPTCHA inválido ou expirado';
        console.error('❌ Token inválido ou expirado');
      } else if (errorCodes.includes('missing-input-secret')) {
        errorMessage = 'CAPTCHA não configurado no servidor';
        console.error('❌ Secret Key não fornecida');
      } else if (errorCodes.includes('missing-input-response')) {
        errorMessage = 'Token CAPTCHA não fornecido';
        console.error('❌ Token não fornecido');
      }
      
      console.error('❌ Falha na verificação:', {
        errorMessage,
        errorCodes,
        action
      });
    }

    // Registrar verificação em logs se necessário
    if (data.success) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase.from('system_logs').insert({
        module: 'captcha',
        log_type: 'info',
        message: `CAPTCHA verificado com sucesso - ${action || 'unknown action'}`,
        details: {
          action,
          timestamp: new Date().toISOString()
        }
      });
    }

    return new Response(
      JSON.stringify({
        success: data.success,
        challenge_ts: data.challenge_ts,
        hostname: data.hostname,
        error_codes: data['error-codes'] || [],
        action: action || 'unknown'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao verificar CAPTCHA:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return new Response(
      JSON.stringify({ success: false, error: 'Erro ao verificar CAPTCHA', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
