import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { Resend } from 'https://esm.sh/resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecordAttemptRequest {
  email: string;
  success: boolean;
  ip_address?: string;
  user_agent?: string;
}

// Rate limiting: max 10 calls per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  
  if (limit.count >= 10) {
    return false;
  }
  
  limit.count++;
  return true;
};

const sendSecurityAlert = async (email: string, failedAttempts: number, ip: string) => {
  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    await resend.emails.send({
      from: 'EasyPet Security <onboarding@resend.dev>',
      to: [email],
      subject: '🔒 Alerta de Segurança - Múltiplas Tentativas de Login',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">⚠️ Alerta de Segurança</h2>
          <p>Olá,</p>
          <p>Detectamos <strong>${failedAttempts} tentativas de login falhadas</strong> em sua conta EasyPet.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>IP Address:</strong> ${ip}</p>
            <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          <p>Se não foi você, recomendamos:</p>
          <ul>
            <li>Alterar sua senha imediatamente</li>
            <li>Ativar autenticação de dois fatores (MFA)</li>
            <li>Verificar atividades suspeitas em sua conta</li>
          </ul>
          <p>Se foi você, pode ignorar este email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">EasyPet - Sistema de Gestão para Pet Shops</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending security alert:', error);
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, success, ip_address, user_agent }: RecordAttemptRequest = await req.json();
    
    // Rate limiting check
    if (ip_address && !checkRateLimit(ip_address)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!email || success === undefined) {
      return new Response(
        JSON.stringify({ error: 'Email and success status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record the login attempt
    const { error: insertError } = await supabase
      .from('login_attempts')
      .insert({
        email: email.toLowerCase(),
        success,
        ip_address,
        user_agent,
        attempt_time: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error recording attempt:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to record attempt' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for multiple failed attempts and send alert
    if (!success) {
      const { data: recentFailures } = await supabase
        .from('login_attempts')
        .select('id')
        .eq('email', email.toLowerCase())
        .eq('success', false)
        .gte('attempt_time', new Date(Date.now() - 15 * 60 * 1000).toISOString());
      
      const failedCount = (recentFailures?.length || 0) + 1;
      
      // Send alert on 3rd, 5th, and 10th failed attempt
      if (failedCount === 3 || failedCount === 5 || failedCount === 10) {
        await sendSecurityAlert(email, failedCount, ip_address || 'unknown');
      }
    }

    // If successful, clear old failed attempts for this email
    if (success) {
      await supabase
        .from('login_attempts')
        .delete()
        .eq('email', email.toLowerCase())
        .eq('success', false);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Attempt recorded' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Record attempt error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
