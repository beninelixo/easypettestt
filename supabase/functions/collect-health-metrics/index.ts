import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify this is being called by service role (cron job)
    const authHeader = req.headers.get('Authorization');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!authHeader || !authHeader.includes(supabaseServiceKey)) {
      console.error('❌ Unauthorized: This function must be called by service role');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Service role required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('📊 Collecting system health metrics...');

    const metrics = [];
    const startTime = Date.now();

    // 1. API Latency Test
    const apiStart = Date.now();
    await supabase.from('profiles').select('id').limit(1);
    const apiLatency = Date.now() - apiStart;
    
    metrics.push({
      metric_type: 'api_latency',
      metric_name: 'API Response Time',
      metric_value: apiLatency,
      metric_unit: 'ms',
      status: apiLatency < 100 ? 'healthy' : apiLatency < 500 ? 'degraded' : 'critical',
      threshold_warning: 100,
      threshold_critical: 500
    });

    // 2. Database Latency Test
    const dbStart = Date.now();
    await supabase.rpc('get_system_stats');
    const dbLatency = Date.now() - dbStart;
    
    metrics.push({
      metric_type: 'database_latency',
      metric_name: 'Database Query Time',
      metric_value: dbLatency,
      metric_unit: 'ms',
      status: dbLatency < 50 ? 'healthy' : dbLatency < 200 ? 'degraded' : 'critical',
      threshold_warning: 50,
      threshold_critical: 200
    });

    // 3. Error Rate (últimos 5 minutos)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: errorLogsCount } = await supabase
      .from('structured_logs')
      .select('id', { count: 'exact', head: true })
      .eq('level', 'error')
      .gte('created_at', fiveMinutesAgo);

    const { count: totalLogsCount } = await supabase
      .from('structured_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', fiveMinutesAgo);

    const errorRate = totalLogsCount && errorLogsCount && totalLogsCount > 0
      ? (errorLogsCount / totalLogsCount) * 100 
      : 0;

    metrics.push({
      metric_type: 'error_rate',
      metric_name: 'Error Rate (5min)',
      metric_value: errorRate,
      metric_unit: '%',
      status: errorRate < 1 ? 'healthy' : errorRate < 5 ? 'degraded' : 'critical',
      threshold_warning: 1,
      threshold_critical: 5
    });

    // 4. Active Users Count
    const { count: activeUsersCount } = await supabase
      .from('login_attempts')
      .select('user_id', { count: 'exact', head: true })
      .eq('success', true)
      .gte('attempt_time', fiveMinutesAgo);

    metrics.push({
      metric_type: 'active_users',
      metric_name: 'Active Users (5min)',
      metric_value: activeUsersCount || 0,
      metric_unit: 'count',
      status: 'healthy'
    });

    // 5. Failed Jobs Count
    const { count: failedJobsCount } = await supabase
      .from('failed_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    metrics.push({
      metric_type: 'request_count',
      metric_name: 'Failed Jobs Pending',
      metric_value: failedJobsCount || 0,
      metric_unit: 'count',
      status: (failedJobsCount || 0) < 10 ? 'healthy' : (failedJobsCount || 0) < 50 ? 'degraded' : 'critical',
      threshold_warning: 10,
      threshold_critical: 50
    });

    // 6. Edge Function Latency Test
    const edgeFunctionStart = Date.now();
    try {
      await supabase.functions.invoke('health-check', { body: {} });
    } catch {
      // Ignorar erro se função não existe
    }
    const edgeFunctionLatency = Date.now() - edgeFunctionStart;

    metrics.push({
      metric_type: 'edge_function_latency',
      metric_name: 'Edge Function Response Time',
      metric_value: edgeFunctionLatency,
      metric_unit: 'ms',
      status: edgeFunctionLatency < 200 ? 'healthy' : edgeFunctionLatency < 1000 ? 'degraded' : 'critical',
      threshold_warning: 200,
      threshold_critical: 1000
    });

    // 7. System Uptime (simulado - baseado em métricas anteriores)
    const { data: previousMetrics } = await supabase
      .from('system_health_metrics')
      .select('status')
      .eq('metric_type', 'uptime')
      .gte('measured_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    const uptimePercent = previousMetrics && previousMetrics.length > 0
      ? (previousMetrics.filter(m => m.status === 'healthy').length / previousMetrics.length) * 100
      : 100;

    metrics.push({
      metric_type: 'uptime',
      metric_name: 'System Uptime (1h)',
      metric_value: uptimePercent,
      metric_unit: '%',
      status: uptimePercent > 99 ? 'healthy' : uptimePercent > 95 ? 'degraded' : 'critical',
      threshold_warning: 99,
      threshold_critical: 95
    });

    // Inserir todas as métricas
    const { error: insertError } = await supabase
      .from('system_health_metrics')
      .insert(metrics);

    if (insertError) {
      console.error('Error inserting metrics:', insertError);
      throw insertError;
    }

    // Verificar se há métricas críticas e criar alertas
    const criticalMetrics = metrics.filter(m => m.status === 'critical');
    
    for (const metric of criticalMetrics) {
      await supabase.rpc('create_critical_alert', {
        p_title: `${metric.metric_name} Critical`,
        p_message: `${metric.metric_name} is at ${metric.metric_value}${metric.metric_unit}, exceeding critical threshold of ${metric.threshold_critical}${metric.metric_unit}`,
        p_alert_type: 'performance_degradation',
        p_context: { metric: metric }
      });
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Collected ${metrics.length} metrics in ${totalTime}ms`);
    console.log(`⚠️ ${criticalMetrics.length} critical metrics detected`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        metrics_collected: metrics.length,
        critical_count: criticalMetrics.length,
        collection_time_ms: totalTime
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error collecting health metrics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
