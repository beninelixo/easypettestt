-- Fix search_path for all SECURITY DEFINER functions
-- This prevents potential search_path injection attacks

-- Functions that need search_path fixed
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.generate_pet_shop_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'PET-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.pet_shops WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_user_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := '#' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_resets
  WHERE expires_at < now() OR used = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.system_logs
  WHERE created_at < now() - interval '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  INSERT INTO public.system_logs (module, log_type, message, details)
  VALUES (
    'cleanup_job',
    'success',
    'Logs antigos removidos',
    jsonb_build_object('deleted_count', deleted_count)
  );
  
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.login_attempts
  WHERE attempt_time < now() - interval '7 days';
END;
$$;

CREATE OR REPLACE FUNCTION public.update_global_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.global_metrics
  SET metric_value = (SELECT COUNT(*) FROM public.pet_shops),
      last_calculated_at = NOW(),
      updated_at = NOW()
  WHERE metric_name = 'total_active_petshops';
  
  UPDATE public.global_metrics
  SET metric_value = (SELECT COUNT(*) FROM public.appointments),
      last_calculated_at = NOW(),
      updated_at = NOW()
  WHERE metric_name = 'total_appointments';
  
  UPDATE public.global_metrics
  SET metric_value = (
    SELECT COALESCE(AVG(rating), 0)
    FROM public.satisfaction_surveys
  ),
      last_calculated_at = NOW(),
      updated_at = NOW()
  WHERE metric_name = 'average_satisfaction';
  
  UPDATE public.global_metrics
  SET metric_value = (
    SELECT COUNT(DISTINCT city)
    FROM public.pet_shops
    WHERE city IS NOT NULL AND city != ''
  ),
      last_calculated_at = NOW(),
      updated_at = NOW()
  WHERE metric_name = 'cities_covered';
  
  UPDATE public.global_metrics
  SET metric_value = (
    SELECT COALESCE(AVG(revenue_growth_percent), 0)
    FROM public.success_stories
    WHERE approved = TRUE AND revenue_growth_percent IS NOT NULL
  ),
      last_calculated_at = NOW(),
      updated_at = NOW()
  WHERE metric_name = 'average_growth_percent';
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_mfa_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.mfa_sessions
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_blocks()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.blocked_ips
  WHERE blocked_until < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_old_alerts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_count INTEGER;
BEGIN
  UPDATE security_alerts
  SET resolved = true,
      resolved_at = NOW(),
      resolved_by = '00000000-0000-0000-0000-000000000000'::UUID
  WHERE resolved = false
    AND severity IN ('low', 'medium')
    AND created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS resolved_count = ROW_COUNT;
  
  INSERT INTO system_logs (module, log_type, message, details)
  VALUES (
    'security_cleanup',
    'info',
    'Alertas antigos resolvidos automaticamente',
    jsonb_build_object('resolved_count', resolved_count)
  );
  
  RETURN resolved_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_alert_read(alert_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.admin_alerts
  SET 
    read = true,
    read_at = now(),
    read_by = auth.uid()
  WHERE id = alert_id;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;