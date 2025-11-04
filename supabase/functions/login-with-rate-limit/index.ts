import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoginRequest {
  email: string;
  password: string;
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

    const { email, password, ip_address, user_agent }: LoginRequest = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limits BEFORE attempting login
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    // Check email-based rate limiting
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

    // ENFORCE rate limit: max 5 failed attempts in 15 minutes
    if (failedAttempts >= 5) {
      const oldestAttempt = recentAttempts[recentAttempts.length - 1];
      const blockedUntil = new Date(new Date(oldestAttempt.attempt_time).getTime() + 15 * 60 * 1000);
      const remainingSeconds = Math.ceil((blockedUntil.getTime() - Date.now()) / 1000);

      // Record blocked attempt
      await supabase.from('login_attempts').insert({
        email: email.toLowerCase(),
        success: false,
        ip_address: ip_address || 'unknown',
        user_agent: user_agent || 'unknown',
      });

      return new Response(
        JSON.stringify({
          error: `Muitas tentativas de login. Tente novamente em ${Math.ceil(remainingSeconds / 60)} minutos.`,
          blocked: true,
          remainingSeconds
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
        // Record blocked attempt
        await supabase.from('login_attempts').insert({
          email: email.toLowerCase(),
          success: false,
          ip_address,
          user_agent: user_agent || 'unknown',
        });

        return new Response(
          JSON.stringify({
            error: 'Muitas tentativas de login deste endereço IP. Tente novamente mais tarde.',
            blocked: true
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Attempt login with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    // Record login attempt
    await supabase.from('login_attempts').insert({
      email: email.toLowerCase(),
      success: !authError,
      ip_address: ip_address || 'unknown',
      user_agent: user_agent || 'unknown',
    });

    if (authError) {
      console.error('Login failed:', authError.message);
      return new Response(
        JSON.stringify({ 
          error: authError.message === 'Invalid login credentials' 
            ? 'Email ou senha incorretos' 
            : 'Erro ao fazer login'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return session data
    return new Response(
      JSON.stringify({
        session: authData.session,
        user: authData.user
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
