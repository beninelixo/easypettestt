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
      return new Response(
        JSON.stringify({ success: false, error: 'Token CAPTCHA é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const secretKey = Deno.env.get('HCAPTCHA_SECRET_KEY');
    if (!secretKey) {
      console.error('HCAPTCHA_SECRET_KEY não configurada');
      return new Response(
        JSON.stringify({ success: false, error: 'CAPTCHA não configurado no servidor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar token com hCaptcha API
    const verifyUrl = 'https://hcaptcha.com/siteverify';
    const formData = new URLSearchParams();
    formData.append('response', captcha_token);
    formData.append('secret', secretKey);

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    const data = await response.json();

    // Log do resultado para debug
    console.log('hCaptcha verification result:', {
      success: data.success,
      action: action || 'none',
      timestamp: new Date().toISOString()
    });

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
        error_codes: data['error-codes'] || []
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
