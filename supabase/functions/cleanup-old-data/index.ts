import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupStats {
  login_attempts_deleted: number;
  notifications_deleted: number;
  password_resets_deleted: number;
  system_logs_deleted: number;
  mfa_sessions_deleted: number;
  blocked_ips_deleted: number;
  total_deleted: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🧹 Starting automatic cleanup job...');

    const stats: CleanupStats = {
      login_attempts_deleted: 0,
      notifications_deleted: 0,
      password_resets_deleted: 0,
      system_logs_deleted: 0,
      mfa_sessions_deleted: 0,
      blocked_ips_deleted: 0,
      total_deleted: 0,
    };

    // 1. Limpar login attempts > 90 dias
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { error: loginError, count: loginCount } = await supabase
      .from('login_attempts')
      .delete({ count: 'exact' })
      .lt('attempt_time', ninetyDaysAgo);

    if (loginError) {
      console.error('Error cleaning login_attempts:', loginError);
    } else {
      stats.login_attempts_deleted = loginCount || 0;
      console.log(`✅ Deleted ${loginCount} old login attempts`);
    }

    // 2. Limpar notifications lidas > 30 dias
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error: notifError, count: notifCount } = await supabase
      .from('notifications')
      .delete({ count: 'exact' })
      .lt('created_at', thirtyDaysAgo)
      .in('status', ['enviada', 'lida']);

    if (notifError) {
      console.error('Error cleaning notifications:', notifError);
    } else {
      stats.notifications_deleted = notifCount || 0;
      console.log(`✅ Deleted ${notifCount} old notifications`);
    }

    // 3. Limpar password resets expirados ou usados
    const { error: resetError, count: resetCount } = await supabase
      .from('password_resets')
      .delete({ count: 'exact' })
      .or('used.eq.true,expires_at.lt.now()');

    if (resetError) {
      console.error('Error cleaning password_resets:', resetError);
    } else {
      stats.password_resets_deleted = resetCount || 0;
      console.log(`✅ Deleted ${resetCount} expired password resets`);
    }

    // 4. Limpar system_logs > 60 dias (exceto errors críticos)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const { error: logsError, count: logsCount } = await supabase
      .from('system_logs')
      .delete({ count: 'exact' })
      .lt('created_at', sixtyDaysAgo)
      .neq('log_type', 'error');

    if (logsError) {
      console.error('Error cleaning system_logs:', logsError);
    } else {
      stats.system_logs_deleted = logsCount || 0;
      console.log(`✅ Deleted ${logsCount} old system logs`);
    }

    // 5. Limpar MFA sessions expiradas
    const { error: mfaError, count: mfaCount } = await supabase
      .from('mfa_sessions')
      .delete({ count: 'exact' })
      .lt('expires_at', new Date().toISOString());

    if (mfaError) {
      console.error('Error cleaning mfa_sessions:', mfaError);
    } else {
      stats.mfa_sessions_deleted = mfaCount || 0;
      console.log(`✅ Deleted ${mfaCount} expired MFA sessions`);
    }

    // 6. Limpar IPs bloqueados expirados
    const { error: ipError, count: ipCount } = await supabase
      .from('blocked_ips')
      .delete({ count: 'exact' })
      .lt('blocked_until', new Date().toISOString());

    if (ipError) {
      console.error('Error cleaning blocked_ips:', ipError);
    } else {
      stats.blocked_ips_deleted = ipCount || 0;
      console.log(`✅ Deleted ${ipCount} expired IP blocks`);
    }

    // Calcular total
    stats.total_deleted = 
      stats.login_attempts_deleted +
      stats.notifications_deleted +
      stats.password_resets_deleted +
      stats.system_logs_deleted +
      stats.mfa_sessions_deleted +
      stats.blocked_ips_deleted;

    // Registrar resultado no log
    const { error: logError } = await supabase
      .from('system_logs')
      .insert({
        module: 'cleanup_job',
        log_type: 'success',
        message: `Limpeza automática concluída: ${stats.total_deleted} registros removidos`,
        details: stats,
      });

    if (logError) {
      console.error('Error logging cleanup result:', logError);
    }

    console.log('✅ Cleanup job completed successfully');
    console.log('📊 Stats:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cleanup completed successfully',
        stats,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in cleanup-old-data function:', error);
    
    // Tentar registrar erro no log
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase
        .from('system_logs')
        .insert({
          module: 'cleanup_job',
          log_type: 'error',
          message: 'Erro na limpeza automática',
          details: {
            error: error.message,
            stack: error.stack,
          },
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});