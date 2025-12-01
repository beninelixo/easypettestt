-- Fix SECURITY DEFINER functions without proper search_path
-- This prevents potential search_path hijacking attacks

ALTER FUNCTION public.cleanup_expired_mfa_sessions() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_blocks() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_reset_codes() SET search_path = public;
ALTER FUNCTION public.cleanup_old_logs() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_invites() SET search_path = public;
ALTER FUNCTION public.cleanup_old_login_attempts() SET search_path = public;
ALTER FUNCTION public.resolve_old_alerts() SET search_path = public;