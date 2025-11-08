import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoginAttemptRequest {
  email: string;
  ip_address?: string;
  user_agent?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, ip_address, user_agent }: LoginAttemptRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if IP is blocked first
    if (ip_address) {
      const { data: blockedIp } = await supabase
        .from('blocked_ips')
        .select('*')
        .eq('ip_address', ip_address)
        .gt('blocked_until', new Date().toISOString())
        .single();

      if (blockedIp) {
        const remainingSeconds = Math.ceil(
          (new Date(blockedIp.blocked_until).getTime() - Date.now()) / 1000
        );
        
        return new Response(
          JSON.stringify({
            allowed: false,
            blocked: true,
            remainingSeconds,
            message: `IP bloqueado. ${blockedIp.reason}. Desbloqueio em ${Math.ceil(remainingSeconds / 3600)} horas.`
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check failed attempts in last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: recentAttempts, error: attemptsError } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('success', false)
      .gte('attempt_time', fifteenMinutesAgo)
      .order('attempt_time', { ascending: false });

    if (attemptsError) {
      console.error('Error checking attempts:', attemptsError);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const failedAttempts = recentAttempts?.length || 0;

    // Rate limit: max 5 failed attempts in 15 minutes
    if (failedAttempts >= 5) {
      const oldestAttempt = recentAttempts[recentAttempts.length - 1];
      const blockedUntil = new Date(new Date(oldestAttempt.attempt_time).getTime() + 15 * 60 * 1000);
      const remainingSeconds = Math.ceil((blockedUntil.getTime() - Date.now()) / 1000);

      return new Response(
        JSON.stringify({
          allowed: false,
          blocked: true,
          remainingSeconds,
          message: `Muitas tentativas de login. Tente novamente em ${Math.ceil(remainingSeconds / 60)} minutos.`
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check IP-based rate limiting (max 10 attempts per IP in 15 minutes)
    if (ip_address) {
      const { data: ipAttempts } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('ip_address', ip_address)
        .eq('success', false)
        .gte('attempt_time', fifteenMinutesAgo);

      if (ipAttempts && ipAttempts.length >= 10) {
        return new Response(
          JSON.stringify({
            allowed: false,
            blocked: true,
            message: 'Muitas tentativas de login deste endereço IP. Tente novamente mais tarde.'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        allowed: true,
        blocked: false,
        failedAttempts,
        message: 'Login permitido'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Validate login error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
