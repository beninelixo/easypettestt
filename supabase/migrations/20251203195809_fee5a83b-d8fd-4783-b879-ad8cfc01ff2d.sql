-- Security fix: Move materialized view to private schema or add RLS protection
-- Since we can't add RLS to materialized views directly, we'll revoke public access

-- Revoke direct access to the materialized view from anon and authenticated roles
REVOKE SELECT ON public.mv_admin_realtime_stats FROM anon;
REVOKE SELECT ON public.mv_admin_realtime_stats FROM authenticated;

-- Create a secure function to access the materialized view (admin only)
CREATE OR REPLACE FUNCTION public.get_admin_realtime_stats()
RETURNS TABLE (
  total_users bigint,
  active_sessions bigint,
  total_appointments bigint,
  today_appointments bigint,
  pending_payments bigint,
  completed_payments bigint,
  total_revenue numeric,
  unread_alerts bigint,
  recent_logins bigint,
  failed_logins_24h bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admin/god users to access this data
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.is_god_user()) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  RETURN QUERY SELECT * FROM public.mv_admin_realtime_stats;
END;
$$;

-- Grant execute on the function only to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_realtime_stats() TO authenticated;

-- Log the security fix
INSERT INTO public.system_logs (module, log_type, message, details)
VALUES (
  'security_fix',
  'info',
  'Materialized view access restricted to admin function',
  jsonb_build_object('view', 'mv_admin_realtime_stats', 'fix_type', 'access_control')
);