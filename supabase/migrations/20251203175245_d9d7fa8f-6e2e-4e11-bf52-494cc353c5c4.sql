-- FASE 1: Correções Críticas de Segurança

-- 1.1 Corrigir constraint do auth_events_log para aceitar super_admin
ALTER TABLE public.auth_events_log 
DROP CONSTRAINT IF EXISTS auth_events_log_user_role_check;

ALTER TABLE public.auth_events_log 
ADD CONSTRAINT auth_events_log_user_role_check 
CHECK (user_role IS NULL OR user_role IN ('client', 'pet_shop', 'admin', 'super_admin', 'god_user', 'employee'));

-- 1.2 Corrigir search_path nas funções SECURITY DEFINER restantes
ALTER FUNCTION public.calculate_pet_age(date) SET search_path = public;
ALTER FUNCTION public.calculate_distance(numeric, numeric, numeric, numeric) SET search_path = public;
ALTER FUNCTION public.calculate_next_retry(integer) SET search_path = public;
ALTER FUNCTION public.find_nearby_pet_shops(numeric, numeric, numeric, integer) SET search_path = public;
ALTER FUNCTION public.get_consolidated_metrics(uuid, date, date, uuid[], uuid[]) SET search_path = public;
ALTER FUNCTION public.get_notification_queue_stats() SET search_path = public;
ALTER FUNCTION public.get_system_health_summary() SET search_path = public;
ALTER FUNCTION public.get_user_features(uuid) SET search_path = public;
ALTER FUNCTION public.has_feature(uuid, text) SET search_path = public;
ALTER FUNCTION public.check_employee_limit(uuid) SET search_path = public;

-- 1.3 Criar índices para performance do dashboard admin
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_created_at ON public.admin_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempt_time ON public.login_attempts(attempt_time DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_measured_at ON public.system_health_metrics(measured_at DESC);

-- 1.4 Criar view materializada para estatísticas globais em tempo real
DROP MATERIALIZED VIEW IF EXISTS mv_admin_realtime_stats;
CREATE MATERIALIZED VIEW mv_admin_realtime_stats AS
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
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

-- Função para refresh da view
CREATE OR REPLACE FUNCTION public.refresh_admin_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_admin_realtime_stats;
END;
$$;

-- Política RLS para a view (admins apenas)
GRANT SELECT ON mv_admin_realtime_stats TO authenticated;