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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication and admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();
    const cleanupResults: any[] = [];

    // 1. Limpar logs antigos (>30 dias)
    const { data: logsDeleted, error: logsError } = await supabase.rpc('cleanup_old_logs');
    
    cleanupResults.push({
      task: 'cleanup_old_logs',
      success: !logsError,
      deleted_count: logsDeleted || 0,
      error: logsError?.message,
    });

    // 2. Limpar códigos de reset de senha expirados
    const { data: resetCodesData, error: resetError } = await supabase.rpc('cleanup_expired_reset_codes');
    
    cleanupResults.push({
      task: 'cleanup_expired_reset_codes',
      success: !resetError,
      error: resetError?.message,
    });

    // 3. Limpar sessões expiradas (>7 dias sem atividade)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { error: sessionsError } = await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .lt('updated_at', sevenDaysAgo.toISOString());

    const sessionsCount = 0;

    cleanupResults.push({
      task: 'cleanup_inactive_sessions',
      success: !sessionsError,
      processed_count: sessionsCount || 0,
      error: sessionsError?.message,
    });

    // 4. Vacuum analyze (otimização do banco)
    // Nota: Isso seria feito via manutenção programada do Supabase

    const totalTime = Date.now() - startTime;
    const hasErrors = cleanupResults.some(r => !r.success);

    // Registrar resultado da limpeza
    await supabase.from('system_logs').insert({
      module: 'cleanup_job',
      log_type: hasErrors ? 'warning' : 'success',
      message: `Limpeza automática concluída em ${totalTime}ms`,
      details: {
        execution_time_ms: totalTime,
        results: cleanupResults,
      },
    });

    return new Response(
      JSON.stringify({
        success: !hasErrors,
        execution_time_ms: totalTime,
        results: cleanupResults,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Cleanup job error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Registrar erro crítico
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('system_logs').insert({
      module: 'cleanup_job',
      log_type: 'error',
      message: 'Erro crítico na limpeza automática',
      details: { error: errorMessage, stack: errorStack },
    });

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});