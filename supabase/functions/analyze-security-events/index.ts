import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { verifyAdminAccess } from '../_shared/schemas.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role using helper (supports multiple roles)
    const { isAdmin } = await verifyAdminAccess(supabase, user.id);
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    let alertsCreated = 0;

    // ===== ANÁLISE 1: Brute Force Detection =====
    const { data: recentFailures } = await supabase
      .from('login_attempts')
      .select('email, attempt_time')
      .eq('success', false)
      .gte('attempt_time', fifteenMinutesAgo.toISOString());

    const attemptsByEmail: Record<string, number> = {};
    for (const failure of recentFailures || []) {
      attemptsByEmail[failure.email] = (attemptsByEmail[failure.email] || 0) + 1;
    }

    for (const [email, count] of Object.entries(attemptsByEmail)) {
      if (count >= 5) {
        const { data: existingAlert } = await supabase
          .from('security_alerts')
          .select('id')
          .eq('alert_type', 'brute_force_detected')
          .eq('metadata->>email', email)
          .gte('created_at', fifteenMinutesAgo.toISOString())
          .maybeSingle();

        if (!existingAlert) {
          await supabase.from('security_alerts').insert({
            alert_type: 'brute_force_detected',
            severity: 'high',
            description: `Detectadas ${count} tentativas de login falhadas em 15 minutos para ${email}`,
            metadata: { email, attempts: count }
          });
          alertsCreated++;
        }
      }
    }

    // ===== ANÁLISE 2: Multiple Failed Logins =====
    const { data: ipFailuresData } = await supabase
      .from('login_attempts')
      .select('ip_address, attempt_time')
      .eq('success', false)
      .gte('attempt_time', oneHourAgo.toISOString());

    const attemptsByIp: Record<string, number> = {};
    for (const failure of ipFailuresData || []) {
      if (failure.ip_address && failure.ip_address !== 'unknown') {
        attemptsByIp[failure.ip_address] = (attemptsByIp[failure.ip_address] || 0) + 1;
      }
    }

    for (const [ipAddress, count] of Object.entries(attemptsByIp)) {
      if (count >= 3) {
        const { data: existingAlert } = await supabase
          .from('security_alerts')
          .select('id')
          .eq('alert_type', 'multiple_failed_logins')
          .eq('ip_address', ipAddress)
          .gte('created_at', oneHourAgo.toISOString())
          .maybeSingle();

        if (!existingAlert) {
          await supabase.from('security_alerts').insert({
            alert_type: 'multiple_failed_logins',
            severity: 'medium',
            ip_address: ipAddress,
            description: `${count} tentativas falhadas do IP ${ipAddress} na última hora`,
            metadata: { attempts: count }
          });
          alertsCreated++;
        }
      }
    }

    // ===== ANÁLISE 3: Suspicious Login Patterns =====
    const { data: recentLogins } = await supabase
      .from('login_attempts')
      .select('email, ip_address, attempt_time')
      .eq('success', true)
      .gte('attempt_time', oneHourAgo.toISOString())
      .order('attempt_time', { ascending: false });

    const loginsByEmail: Record<string, any[]> = {};
    for (const login of recentLogins || []) {
      if (!loginsByEmail[login.email]) {
        loginsByEmail[login.email] = [];
      }
      loginsByEmail[login.email].push(login);
    }

    for (const [email, logins] of Object.entries(loginsByEmail)) {
      const uniqueIps = new Set(logins.map(l => l.ip_address));
      
      if (uniqueIps.size >= 3) {
        const { data: existingAlert } = await supabase
          .from('security_alerts')
          .select('id')
          .eq('alert_type', 'suspicious_login')
          .eq('metadata->>email', email)
          .gte('created_at', oneHourAgo.toISOString())
          .maybeSingle();

        if (!existingAlert) {
          await supabase.from('security_alerts').insert({
            alert_type: 'suspicious_login',
            severity: 'high',
            description: `Login de ${uniqueIps.size} IPs diferentes em 1 hora para ${email}`,
            metadata: { 
              email, 
              ips: Array.from(uniqueIps), 
              login_count: logins.length 
            }
          });
          alertsCreated++;
        }
      }
    }

    // Log da análise
    await supabase.from('system_logs').insert({
      module: 'security',
      log_type: 'info',
      message: `Análise de segurança concluída - ${alertsCreated} alertas criados`,
      details: { alerts_created: alertsCreated, analyzed_at: now.toISOString() }
    });

    return new Response(
      JSON.stringify({
        success: true,
        alerts_created: alertsCreated,
        analyzed_at: now.toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na análise de segurança:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return new Response(
      JSON.stringify({ success: false, error: 'Erro na análise', details: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});