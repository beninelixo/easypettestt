import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const loginAttemptSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  ip_address: z.string().max(255, 'IP or hostname too long').optional(),
  user_agent: z.string().max(500, 'User agent too long').optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate input with Zod
    const rawBody = await req.json();
    const validation = loginAttemptSchema.safeParse(rawBody);
    
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: validation.error.errors[0].message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, ip_address, user_agent } = validation.data;

    // Check if IP is blocked first (but skip if whitelisted)
    if (ip_address) {
      // Check whitelist first
      const { data: whitelisted } = await supabase
        .from('ip_whitelist')
        .select('id')
        .eq('ip_address', ip_address)
        .single();

      if (whitelisted) {
        console.log(`IP ${ip_address} is whitelisted, allowing login without rate limit checks`);
        return new Response(
          JSON.stringify({
            allowed: true,
            blocked: false,
            whitelisted: true,
            message: 'Login permitido (IP protegido)'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

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
            message: `IP bloqueado. ${blockedIp.reason}. Desbloqueio em ${Math.ceil(remainingSeconds / 60)} minutos.`
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

    // Rate limit: max 3 failed attempts in 15 minutes (MAIS RESTRITIVO)
    if (failedAttempts >= 3) {
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

    // Check IP-based rate limiting (max 5 attempts per IP in 15 minutes - MAIS RESTRITIVO)
    if (ip_address) {
      const { data: ipAttempts } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('ip_address', ip_address)
        .eq('success', false)
        .gte('attempt_time', fifteenMinutesAgo);

      if (ipAttempts && ipAttempts.length >= 5) {
        // Bloquear IP automaticamente
        await supabase.from('blocked_ips').insert({
          ip_address,
          blocked_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          reason: `Bloqueio automático: ${ipAttempts.length} tentativas falhadas`,
          auto_blocked: true
        });
        
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
