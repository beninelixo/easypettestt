-- Fix SECURITY DEFINER functions missing search_path
-- This prevents potential search_path hijacking attacks

ALTER FUNCTION public.cleanup_expired_mfa_sessions() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_blocks() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_reset_codes() SET search_path = public;
ALTER FUNCTION public.cleanup_old_logs() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_invites() SET search_path = public;
ALTER FUNCTION public.cleanup_old_login_attempts() SET search_path = public;
ALTER FUNCTION public.resolve_old_alerts() SET search_path = public;
ALTER FUNCTION public.create_payment_on_complete() SET search_path = public;
ALTER FUNCTION public.notify_new_appointment() SET search_path = public;
ALTER FUNCTION public.log_stock_movement() SET search_path = public;
ALTER FUNCTION public.update_notification_status() SET search_path = public;
ALTER FUNCTION public.soft_delete_record() SET search_path = public;
ALTER FUNCTION public.audit_trigger() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.initialize_admin_notification_preferences() SET search_path = public;
ALTER FUNCTION public.create_critical_alert(text, text, text, jsonb) SET search_path = public;
ALTER FUNCTION public.notify_appointment_change() SET search_path = public;
ALTER FUNCTION public.auto_block_ip_if_needed() SET search_path = public;
ALTER FUNCTION public.log_role_change() SET search_path = public;
ALTER FUNCTION public.mark_alert_read(uuid) SET search_path = public;