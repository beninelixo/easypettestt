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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🏥 Iniciando Health Check');

    const startTime = Date.now();
    const checks: any[] = [];

    // 1. Check Database
    try {
      const { error } = await supabase.from('system_logs').select('id').limit(1);
      checks.push({
        service: 'database',
        status: error ? 'critical' : 'healthy',
        latency: Date.now() - startTime,
        error: error?.message,
      });
    } catch (error) {
      checks.push({
        service: 'database',
        status: 'critical',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }

    // 2. Check Notification Queue
    try {
      const { data: queueStats } = await supabase.rpc('get_notification_queue_stats');
      const pendingCount = queueStats?.pending || 0;
      
      checks.push({
        service: 'notification_queue',
        status: pendingCount > 100 ? 'warning' : 'healthy',
        metric: pendingCount,
        details: queueStats,
      });

      // Registrar métrica
      await supabase.from('monitoramento_sistema').insert({
        service_name: 'notification_queue',
        metric_type: 'queue_size',
        value: pendingCount,
        threshold_warning: 100,
        threshold_critical: 500,
        status: pendingCount > 500 ? 'critical' : pendingCount > 100 ? 'warning' : 'healthy',
        metadata: queueStats,
      });
    } catch (error) {
      checks.push({
        service: 'notification_queue',
        status: 'critical',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }

    // 3. Check System Health
    try {
      const { data: healthData } = await supabase.rpc('get_system_health');
      const criticalIssues = 
        (healthData?.negative_stock_products || 0) +
        (healthData?.orphan_pets || 0);

      checks.push({
        service: 'system_health',
        status: criticalIssues > 0 ? 'warning' : 'healthy',
        details: healthData,
      });
    } catch (error) {
      checks.push({
        service: 'system_health',
        status: 'warning',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }

    const allHealthy = checks.every(c => c.status === 'healthy');
    const hasCritical = checks.some(c => c.status === 'critical');

    const overallStatus = hasCritical ? 'critical' : allHealthy ? 'healthy' : 'warning';

    // Log resultado
    await supabase.from('system_logs').insert({
      module: 'worker-healthcheck',
      log_type: overallStatus === 'healthy' ? 'success' : overallStatus === 'critical' ? 'error' : 'warning',
      message: `Health check concluído: ${overallStatus}`,
      details: { checks, duration_ms: Date.now() - startTime },
    });

    return new Response(
      JSON.stringify({
        success: true,
        status: overallStatus,
        checks,
        timestamp: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Erro no health check:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
