import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthCheckResult {
  service_name: string;
  status: 'healthy' | 'warning' | 'critical';
  response_time_ms: number;
  error_message?: string;
  metadata?: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const healthChecks: HealthCheckResult[] = [];

    // 1. Check Database Connection
    const dbStart = Date.now();
    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      healthChecks.push({
        service_name: 'database',
        status: dbError ? 'critical' : 'healthy',
        response_time_ms: Date.now() - dbStart,
        error_message: dbError?.message,
      });
    } catch (error) {
      healthChecks.push({
        service_name: 'database',
        status: 'critical',
        response_time_ms: Date.now() - dbStart,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // 2. Check Auth Service
    const authStart = Date.now();
    try {
      const { data: users, error: authError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });

      healthChecks.push({
        service_name: 'authentication',
        status: authError ? 'warning' : 'healthy',
        response_time_ms: Date.now() - authStart,
        error_message: authError?.message,
        metadata: { total_users: users?.users?.length || 0 },
      });
    } catch (error) {
      healthChecks.push({
        service_name: 'authentication',
        status: 'critical',
        response_time_ms: Date.now() - authStart,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // 3. Check Critical Tables
    const tablesStart = Date.now();
    try {
      const { count, error: tablesError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });

      healthChecks.push({
        service_name: 'appointments_table',
        status: tablesError ? 'warning' : 'healthy',
        response_time_ms: Date.now() - tablesStart,
        error_message: tablesError?.message,
        metadata: { total_records: count || 0 },
      });
    } catch (error) {
      healthChecks.push({
        service_name: 'appointments_table',
        status: 'critical',
        response_time_ms: Date.now() - tablesStart,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Save health check results
    for (const check of healthChecks) {
      await supabase
        .from('system_health')
        .upsert({
          service_name: check.service_name,
          status: check.status,
          response_time_ms: check.response_time_ms,
          error_message: check.error_message,
          metadata: check.metadata,
          last_check: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'service_name',
        });

      // Log critical issues
      if (check.status === 'critical') {
        await supabase.from('system_logs').insert({
          module: 'health_check',
          log_type: 'error',
          message: `${check.service_name} is in critical state`,
          details: check,
        });
      }
    }

    const overallStatus = healthChecks.some(c => c.status === 'critical')
      ? 'critical'
      : healthChecks.some(c => c.status === 'warning')
      ? 'warning'
      : 'healthy';

    return new Response(
      JSON.stringify({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks: healthChecks,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Health check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});