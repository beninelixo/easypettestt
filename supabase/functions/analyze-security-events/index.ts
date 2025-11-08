import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

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

    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let alertsCreated = 0;

    // ===== ANÁLISE 1: Brute Force Detection =====
    // 5+ tentativas falhas em 15 minutos do mesmo email
    const { data: recentFailures } = await supabase
      .from('login_attempts')
      .select('email, attempt_time')
      .eq('success', false)
      .gte('attempt_time', fifteenMinutesAgo.toISOString());

    // Agrupar manualmente por email
    const attemptsByEmail: Record<string, number> = {};
    for (const failure of recentFailures || []) {
      attemptsByEmail[failure.email] = (attemptsByEmail[failure.email] || 0) + 1;
    }

    for (const [email, count] of Object.entries(attemptsByEmail)) {
      if (count >= 5) {
        // Verificar se já existe alerta recente
        const { data: existingAlert } = await supabase
          .from('security_alerts')
          .select('id')
          .eq('alert_type', 'brute_force_detected')
          .eq('metadata->>email', email)
          .gte('created_at', fifteenMinutesAgo.toISOString())
          .single();

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
    // 3+ tentativas falhas do mesmo IP em 1 hora
    const { data: ipFailuresData } = await supabase
      .from('login_attempts')
      .select('ip_address, attempt_time')
      .eq('success', false)
      .gte('attempt_time', oneHourAgo.toISOString());

    // Agrupar manualmente por IP
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
          .single();

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
    // Logins bem-sucedidos de IPs diferentes em curto período
    const { data: recentLogins } = await supabase
      .from('login_attempts')
      .select('email, ip_address, attempt_time')
      .eq('success', true)
      .gte('attempt_time', oneHourAgo.toISOString())
      .order('attempt_time', { ascending: false });

    // Agrupar por email
    const loginsByEmail: Record<string, any[]> = {};
    for (const login of recentLogins || []) {
      if (!loginsByEmail[login.email]) {
        loginsByEmail[login.email] = [];
      }
      loginsByEmail[login.email].push(login);
    }

    // Detectar IPs diferentes
    for (const [email, logins] of Object.entries(loginsByEmail)) {
      const uniqueIps = new Set(logins.map(l => l.ip_address));
      
      if (uniqueIps.size >= 3) {
        const { data: existingAlert } = await supabase
          .from('security_alerts')
          .select('id')
          .eq('alert_type', 'suspicious_login')
          .eq('metadata->>email', email)
          .gte('created_at', oneHourAgo.toISOString())
          .single();

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

    // ===== ANÁLISE 4: Atualizar Padrões de Comportamento =====
    const { data: recentSuccessfulLogins } = await supabase
      .from('login_attempts')
      .select('email')
      .eq('success', true)
      .gte('attempt_time', oneDayAgo.toISOString());

    // Extrair emails únicos
    const uniqueEmails = [...new Set(recentSuccessfulLogins?.map(l => l.email) || [])];

    for (const email of uniqueEmails) {
      const { data: userLogins } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email)
        .eq('success', true)
        .gte('attempt_time', oneDayAgo.toISOString());

      if (userLogins && userLogins.length > 0) {
        // Extrair horários típicos
        const loginHours = userLogins.map(l => 
          new Date(l.attempt_time).getHours()
        );

        // Extrair IPs típicos
        const loginIps = [...new Set(userLogins.map(l => l.ip_address))];

        // Buscar user_id pela tabela profiles (que tem relação com auth.users)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
          .single();

        if (profileData) {
          await supabase
            .from('user_behavior_patterns')
            .upsert({
              user_id: profileData.id,
              typical_login_hours: loginHours,
              typical_locations: { ips: loginIps },
              login_frequency: { 
                daily: userLogins.length,
                last_updated: now.toISOString()
              },
              last_updated: now.toISOString()
            });
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
