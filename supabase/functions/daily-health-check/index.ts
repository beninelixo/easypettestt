import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-key',
};

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down' | 'critical';
  latency_ms: number;
  error?: string;
  details?: Record<string, any>;
}

interface SystemMetrics {
  total_users: number;
  new_users_today: number;
  total_appointments: number;
  appointments_today: number;
  revenue_today: number;
  errors_today: number;
  active_users_5min: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security: Verify cron job API key or service role authorization
    const cronKey = req.headers.get('x-cron-key');
    const authHeader = req.headers.get('authorization');
    const expectedCronKey = Deno.env.get('CRON_API_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Allow access if: valid cron key OR service role authorization
    const isValidCronKey = cronKey && expectedCronKey && cronKey === expectedCronKey;
    const isServiceRole = authHeader && authHeader.includes(serviceRoleKey);
    
    if (!isValidCronKey && !isServiceRole) {
      console.warn('Unauthorized health check attempt');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Valid API key or service role required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log('🏥 Starting daily health check...');

    const startTime = Date.now();
    const checks: HealthCheck[] = [];
    const actions: string[] = [];
    const recommendations: string[] = [];

    // ============================================
    // 1. DATABASE HEALTH CHECK (25 pontos)
    // ============================================
    const dbStart = Date.now();
    try {
      const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
      const dbLatency = Date.now() - dbStart;
      
      checks.push({
        service: 'database',
        status: dbError ? 'critical' : dbLatency < 50 ? 'healthy' : dbLatency < 200 ? 'degraded' : 'down',
        latency_ms: dbLatency,
        error: dbError?.message,
      });

      if (dbLatency > 200) {
        recommendations.push('Database latency alta (>200ms). Considere otimizar queries ou aumentar recursos.');
      }
    } catch (error) {
      checks.push({
        service: 'database',
        status: 'critical',
        latency_ms: Date.now() - dbStart,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // ============================================
    // 2. EDGE FUNCTIONS HEALTH CHECK (25 pontos)
    // ============================================
    const edgeFunctionsToTest = [
      'health-check',
      'send-notification',
      'backup-full-database',
    ];

    let edgeFunctionsHealthy = 0;
    for (const funcName of edgeFunctionsToTest) {
      const funcStart = Date.now();
      try {
        const { error } = await supabase.functions.invoke(funcName, {
          body: { health_check: true },
        });
        const funcLatency = Date.now() - funcStart;
        
        const isHealthy = !error && funcLatency < 2000;
        if (isHealthy) edgeFunctionsHealthy++;
        
        checks.push({
          service: `edge_function_${funcName}`,
          status: error ? 'down' : funcLatency < 1000 ? 'healthy' : funcLatency < 2000 ? 'degraded' : 'down',
          latency_ms: funcLatency,
          error: error?.message,
        });

        if (funcLatency > 2000) {
          recommendations.push(`Edge function ${funcName} muito lenta (>${funcLatency}ms). Revisar código.`);
        }
      } catch (error) {
        checks.push({
          service: `edge_function_${funcName}`,
          status: 'critical',
          latency_ms: Date.now() - funcStart,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // ============================================
    // 3. SECURITY CHECK (25 pontos)
    // ============================================
    const securityStart = Date.now();
    try {
      // Verificar alertas não resolvidos
      const { data: unresolvedAlerts, error: alertsError } = await supabase
        .from('security_alerts')
        .select('severity')
        .eq('resolved', false);

      const criticalAlerts = unresolvedAlerts?.filter(a => a.severity === 'critical').length || 0;
      const highAlerts = unresolvedAlerts?.filter(a => a.severity === 'high').length || 0;

      checks.push({
        service: 'security',
        status: criticalAlerts > 0 ? 'critical' : highAlerts > 3 ? 'degraded' : 'healthy',
        latency_ms: Date.now() - securityStart,
        error: alertsError?.message,
        details: {
          unresolved_alerts: unresolvedAlerts?.length || 0,
          critical_alerts: criticalAlerts,
          high_alerts: highAlerts,
        },
      });

      if (criticalAlerts > 0) {
        recommendations.push(`${criticalAlerts} alertas críticos não resolvidos. Revisar imediatamente.`);
      }

      // Verificar tentativas de login suspeitas
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: failedLogins } = await supabase
        .from('login_attempts')
        .select('ip_address')
        .eq('success', false)
        .gte('attempt_time', oneHourAgo);

      const suspiciousIPs = failedLogins?.reduce((acc, curr) => {
        acc[curr.ip_address || 'unknown'] = (acc[curr.ip_address || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const attackIPs = Object.entries(suspiciousIPs || {}).filter(([_, count]) => count > 10);
      if (attackIPs.length > 0) {
        recommendations.push(`${attackIPs.length} IPs com tentativas de ataque. Considere bloqueio automático.`);
      }
    } catch (error) {
      checks.push({
        service: 'security',
        status: 'degraded',
        latency_ms: Date.now() - securityStart,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // ============================================
    // 4. PERFORMANCE METRICS (25 pontos)
    // ============================================
    const perfStart = Date.now();
    try {
      // Error rate últimas 24 horas
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: totalLogs } = await supabase
        .from('structured_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo);

      const { count: errorLogs } = await supabase
        .from('structured_logs')
        .select('*', { count: 'exact', head: true })
        .eq('level', 'error')
        .gte('created_at', oneDayAgo);

      const errorRate = totalLogs && errorLogs ? (errorLogs / totalLogs) * 100 : 0;

      checks.push({
        service: 'performance',
        status: errorRate < 1 ? 'healthy' : errorRate < 5 ? 'degraded' : 'critical',
        latency_ms: Date.now() - perfStart,
        details: {
          error_rate_percent: errorRate.toFixed(2),
          total_logs: totalLogs || 0,
          error_logs: errorLogs || 0,
        },
      });

      if (errorRate > 5) {
        recommendations.push(`Error rate muito alta (${errorRate.toFixed(2)}%). Investigar logs urgentemente.`);
      }
    } catch (error) {
      checks.push({
        service: 'performance',
        status: 'degraded',
        latency_ms: Date.now() - perfStart,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // ============================================
    // 5. COLLECT SYSTEM METRICS
    // ============================================
    const metrics: SystemMetrics = {
      total_users: 0,
      new_users_today: 0,
      total_appointments: 0,
      appointments_today: 0,
      revenue_today: 0,
      errors_today: 0,
      active_users_5min: 0,
    };

    try {
      // Total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      metrics.total_users = usersCount || 0;

      // New users today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: newUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());
      metrics.new_users_today = newUsersCount || 0;

      // Appointments today
      const { count: appointmentsToday } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('scheduled_date', new Date().toISOString().split('T')[0])
        .is('deleted_at', null);
      metrics.appointments_today = appointmentsToday || 0;

      // Total appointments
      const { count: totalAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);
      metrics.total_appointments = totalAppointments || 0;

      // Revenue today (completed appointments)
      const { data: paymentsToday } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'pago')
        .gte('paid_at', todayStart.toISOString());
      metrics.revenue_today = paymentsToday?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Errors today
      const { count: errorsToday } = await supabase
        .from('structured_logs')
        .select('*', { count: 'exact', head: true })
        .eq('level', 'error')
        .gte('created_at', todayStart.toISOString());
      metrics.errors_today = errorsToday || 0;

      // Active users last 5 minutes
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count: activeUsers } = await supabase
        .from('login_attempts')
        .select('user_id', { count: 'exact', head: true })
        .eq('success', true)
        .gte('attempt_time', fiveMinAgo);
      metrics.active_users_5min = activeUsers || 0;
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }

    // ============================================
    // 6. CALCULATE HEALTH SCORE
    // ============================================
    let healthScore = 0;

    // Database (25 pts)
    const dbCheck = checks.find(c => c.service === 'database');
    if (dbCheck?.status === 'healthy') healthScore += 25;
    else if (dbCheck?.status === 'degraded') healthScore += 15;
    else if (dbCheck?.status === 'down') healthScore += 5;

    // Edge functions (25 pts)
    const edgeFuncScore = (edgeFunctionsHealthy / edgeFunctionsToTest.length) * 25;
    healthScore += edgeFuncScore;

    // Security (25 pts)
    const secCheck = checks.find(c => c.service === 'security');
    if (secCheck?.status === 'healthy') healthScore += 25;
    else if (secCheck?.status === 'degraded') healthScore += 15;
    else if (secCheck?.status === 'critical') healthScore += 0;

    // Performance (25 pts)
    const perfCheck = checks.find(c => c.service === 'performance');
    if (perfCheck?.status === 'healthy') healthScore += 25;
    else if (perfCheck?.status === 'degraded') healthScore += 15;
    else if (perfCheck?.status === 'critical') healthScore += 5;

    healthScore = Math.round(healthScore);

    const overallStatus = healthScore >= 90 ? 'healthy' : healthScore >= 70 ? 'warning' : 'critical';

    // ============================================
    // 7. COMPARE TO YESTERDAY
    // ============================================
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];

    const { data: yesterdayReport } = await supabase
      .from('daily_health_reports')
      .select('health_score, metrics')
      .eq('report_date', yesterdayDate)
      .single();

    let comparison = null;
    if (yesterdayReport) {
      comparison = {
        performance_change: healthScore - yesterdayReport.health_score,
        error_rate_change: metrics.errors_today - (yesterdayReport.metrics?.errors_today || 0),
      };
    }

    // ============================================
    // 8. SAVE REPORT
    // ============================================
    const reportDate = new Date().toISOString().split('T')[0];
    
    const checksMap = checks.reduce((acc, check) => {
      acc[check.service] = check;
      return acc;
    }, {} as Record<string, HealthCheck>);

    const { data: report, error: reportError } = await supabase
      .from('daily_health_reports')
      .upsert({
        report_date: reportDate,
        overall_status: overallStatus,
        health_score: healthScore,
        report_data: {
          checks: checksMap,
          metrics,
          performance: {
            avg_api_latency_ms: checks.reduce((sum, c) => sum + c.latency_ms, 0) / checks.length,
            avg_db_latency_ms: dbCheck?.latency_ms || 0,
            error_rate_percent: perfCheck?.details?.error_rate_percent || 0,
            uptime_percent: healthScore,
          },
        },
        checks: checksMap,
        metrics,
        actions_taken: actions,
        recommendations,
        comparison_to_yesterday: comparison,
      }, {
        onConflict: 'report_date',
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error saving report:', reportError);
      throw reportError;
    }

    console.log(`✅ Health check completed: ${overallStatus} (score: ${healthScore}/100)`);
    console.log(`⏱️  Duration: ${Date.now() - startTime}ms`);

    // ============================================
    // 9. SEND ALERTS IF CRITICAL
    // ============================================
    if (overallStatus === 'critical') {
      console.log('🚨 CRITICAL STATUS - Sending alerts to admins');
      
      try {
        await supabase.functions.invoke('send-real-time-alert', {
          body: {
            alert_type: 'health_check_critical',
            severity: 'critical',
            title: 'Sistema em Estado Crítico',
            message: `Health check diário retornou status crítico (score: ${healthScore}/100). Ação imediata necessária.`,
            context: {
              health_score: healthScore,
              checks: checksMap,
              recommendations,
            },
          },
        });
      } catch (alertError) {
        console.error('Failed to send alert:', alertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        overall_status: overallStatus,
        health_score: healthScore,
        checks: checksMap,
        metrics,
        actions_taken: actions,
        recommendations,
        comparison_to_yesterday: comparison,
        duration_ms: Date.now() - startTime,
        report_id: report.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Health check error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
