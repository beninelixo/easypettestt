-- Fix SECURITY DEFINER functions missing search_path
-- These functions were identified by the Supabase linter

-- Fix cleanup_expired_mfa_sessions
ALTER FUNCTION public.cleanup_expired_mfa_sessions() SET search_path = public;

-- Fix cleanup_expired_blocks
ALTER FUNCTION public.cleanup_expired_blocks() SET search_path = public;

-- Fix cleanup_expired_reset_codes
ALTER FUNCTION public.cleanup_expired_reset_codes() SET search_path = public;

-- Fix cleanup_expired_invites
ALTER FUNCTION public.cleanup_expired_invites() SET search_path = public;

-- Fix cleanup_old_login_attempts
ALTER FUNCTION public.cleanup_old_login_attempts() SET search_path = public;

-- Fix resolve_old_alerts
ALTER FUNCTION public.resolve_old_alerts() SET search_path = public;

-- Fix create_payment_on_complete
ALTER FUNCTION public.create_payment_on_complete() SET search_path = public;

-- Fix notify_new_appointment
ALTER FUNCTION public.notify_new_appointment() SET search_path = public;

-- Fix log_stock_movement
ALTER FUNCTION public.log_stock_movement() SET search_path = public;

-- Fix audit_trigger
ALTER FUNCTION public.audit_trigger() SET search_path = public;

-- Fix soft_delete_record
ALTER FUNCTION public.soft_delete_record() SET search_path = public;

-- Fix handle_updated_at
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- Fix handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Fix generate_pet_shop_code
ALTER FUNCTION public.generate_pet_shop_code() SET search_path = public;

-- Fix generate_user_code
ALTER FUNCTION public.generate_user_code() SET search_path = public;

-- Fix notify_appointment_change
ALTER FUNCTION public.notify_appointment_change() SET search_path = public;

-- Fix update_notification_status
ALTER FUNCTION public.update_notification_status() SET search_path = public;

-- Fix auto_block_ip_if_needed
ALTER FUNCTION public.auto_block_ip_if_needed() SET search_path = public;

-- Fix initialize_admin_notification_preferences
ALTER FUNCTION public.initialize_admin_notification_preferences() SET search_path = public;

-- Fix log_role_change
ALTER FUNCTION public.log_role_change() SET search_path = public;

-- Fix check_admin_rate_limit
ALTER FUNCTION public.check_admin_rate_limit(uuid, text, integer, integer) SET search_path = public;

-- Fix mark_alert_read
ALTER FUNCTION public.mark_alert_read(uuid) SET search_path = public;

-- Fix create_critical_alert
ALTER FUNCTION public.create_critical_alert(text, text, text, jsonb) SET search_path = public;

-- Fix get_system_health_summary
ALTER FUNCTION public.get_system_health_summary() SET search_path = public;

-- Fix get_notification_queue_stats
ALTER FUNCTION public.get_notification_queue_stats() SET search_path = public;

-- Fix get_admin_notification_preferences
ALTER FUNCTION public.get_admin_notification_preferences(uuid, text, text) SET search_path = public;

-- Fix check_employee_limit
ALTER FUNCTION public.check_employee_limit(uuid) SET search_path = public;

-- Fix log_access
ALTER FUNCTION public.log_access(uuid, uuid, app_module, app_action, uuid, text, boolean, jsonb) SET search_path = public;

-- Fix update_global_metrics
ALTER FUNCTION public.update_global_metrics() SET search_path = public;

-- Fix get_system_health
ALTER FUNCTION public.get_system_health() SET search_path = public;