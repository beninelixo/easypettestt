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

    const now = Date.now();

    // Collect various metrics
    const metrics = [];

    // Response time from backup history
    const { data: backups } = await supabase
      .from('backup_history')
      .select('started_at, completed_at')
      .not('completed_at', 'is', null)
      .gte('started_at', new Date(now - 3600000).toISOString())
      .limit(100);

    if (backups && backups.length > 0) {
      const avgResponseTime = backups.reduce((acc, b) => {
        const duration = new Date(b.completed_at).getTime() - new Date(b.started_at).getTime();
        return acc + duration;
      }, 0) / backups.length;

      metrics.push({
        metric_type: 'response_time',
        metric_value: avgResponseTime,
        metadata: { sample_size: backups.length },
      });
    }

    // Error rate from system logs
    const { count: totalLogs } = await supabase
      .from('system_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(now - 3600000).toISOString());

    const { count: errorLogs } = await supabase
      .from('system_logs')
      .select('*', { count: 'exact', head: true })
      .eq('log_type', 'error')
      .gte('created_at', new Date(now - 3600000).toISOString());

    if (totalLogs && totalLogs > 0) {
      const errorRate = ((errorLogs || 0) / totalLogs) * 100;
      metrics.push({
        metric_type: 'error_rate',
        metric_value: errorRate,
        metadata: { total_logs: totalLogs, error_logs: errorLogs },
      });
    }

    // Active users
    const { count: activeUsers } = await supabase
      .from('login_attempts')
      .select('user_id', { count: 'exact', head: true })
      .eq('success', true)
      .gte('attempt_time', new Date(now - 3600000).toISOString());

    metrics.push({
      metric_type: 'active_users',
      metric_value: activeUsers || 0,
    });

    // CPU usage simulation (0-100%)
    metrics.push({
      metric_type: 'cpu_usage',
      metric_value: Math.random() * 30 + 20, // 20-50%
    });

    // Memory usage simulation (0-100%)
    metrics.push({
      metric_type: 'memory_usage',
      metric_value: Math.random() * 20 + 40, // 40-60%
    });

    // Insert all metrics
    const { error: insertError } = await supabase
      .from('system_metrics')
      .insert(metrics);

    if (insertError) throw insertError;

    console.log('Metrics collected:', metrics.length);

    return new Response(
      JSON.stringify({ success: true, metrics_count: metrics.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error collecting metrics:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
