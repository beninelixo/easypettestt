-- Corrigir exposição de auth.users na materialized view
-- Remover view atual e recriar sem referência direta a auth.users

DROP MATERIALIZED VIEW IF EXISTS mv_admin_realtime_stats;

-- Recriar view usando apenas tabelas públicas (profiles para contagem de usuários)
CREATE MATERIALIZED VIEW mv_admin_realtime_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.pet_shops WHERE deleted_at IS NULL) as total_pet_shops,
  (SELECT COUNT(*) FROM public.appointments WHERE scheduled_date = CURRENT_DATE AND deleted_at IS NULL) as appointments_today,
  (SELECT COUNT(*) FROM public.appointments WHERE status = 'completed' AND deleted_at IS NULL) as completed_appointments,
  (SELECT COUNT(*) FROM public.system_logs WHERE log_type = 'error' AND created_at > now() - interval '24 hours') as errors_24h,
  (SELECT COUNT(*) FROM public.system_logs WHERE log_type = 'warning' AND created_at > now() - interval '24 hours') as warnings_24h,
  (SELECT COUNT(*) FROM public.admin_alerts WHERE read = false) as unread_alerts,
  (SELECT COUNT(*) FROM public.login_attempts WHERE success = false AND attempt_time > now() - interval '1 hour') as failed_logins_1h,
  (SELECT COUNT(*) FROM public.login_attempts WHERE success = true AND attempt_time > now() - interval '24 hours') as successful_logins_24h,
  (SELECT COUNT(*) FROM public.failed_jobs WHERE status = 'pending') as pending_jobs,
  (SELECT COUNT(*) FROM public.mfa_secrets WHERE enabled = true) as mfa_enabled_users,
  (SELECT COUNT(*) FROM public.blocked_ips WHERE blocked_until > now()) as blocked_ips,
  now() as last_refreshed;

-- Criar índice único para refresh concorrente
CREATE UNIQUE INDEX IF NOT EXISTS mv_admin_realtime_stats_idx ON mv_admin_realtime_stats(last_refreshed);

-- Revogar acesso anon e dar apenas para admins autenticados
REVOKE ALL ON mv_admin_realtime_stats FROM anon;
REVOKE ALL ON mv_admin_realtime_stats FROM public;
GRANT SELECT ON mv_admin_realtime_stats TO authenticated;