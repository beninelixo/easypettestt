-- Comprehensive fix for all SECURITY DEFINER functions missing SET search_path
-- This migration updates all functions to include SET search_path = public
-- to prevent search_path injection attacks

-- ============================================
-- TENANT/FRANCHISE FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_hierarchy
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND role = 'tenant_admin'
      AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_franchise_owner(_user_id uuid, _franchise_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_hierarchy
    WHERE user_id = _user_id
      AND franchise_id = _franchise_id
      AND role = 'franchise_owner'
      AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_access(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_hierarchy
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.set_current_tenant(_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', _tenant_id::text, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_tenant()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
$$;

-- ============================================
-- EMPLOYEE ACCESS FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.is_employee_of_petshop(_user_id uuid, _pet_shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM petshop_employees
    WHERE user_id = _user_id
      AND pet_shop_id = _pet_shop_id
      AND active = true
  );
$$;

-- ============================================
-- DASHBOARD & METRICS FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.get_consolidated_metrics(
  _tenant_id uuid,
  _start_date date,
  _end_date date,
  _franchise_ids uuid[] DEFAULT NULL::uuid[],
  _unit_ids uuid[] DEFAULT NULL::uuid[]
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  WITH filtered_units AS (
    SELECT ps.id
    FROM pet_shops ps
    LEFT JOIN franchises f ON ps.franchise_id = f.id
    WHERE f.tenant_id = _tenant_id
      AND (_franchise_ids IS NULL OR f.id = ANY(_franchise_ids))
      AND (_unit_ids IS NULL OR ps.id = ANY(_unit_ids))
  ),
  metrics AS (
    SELECT
      COUNT(DISTINCT a.id) AS total_appointments,
      COUNT(DISTINCT a.client_id) AS total_clients,
      COUNT(DISTINCT fu.id) AS active_units,
      COALESCE(SUM(s.price), 0) AS total_revenue
    FROM filtered_units fu
    LEFT JOIN appointments a ON a.pet_shop_id = fu.id
      AND a.scheduled_date BETWEEN _start_date AND _end_date
      AND a.status = 'completed'
    LEFT JOIN services s ON s.id = a.service_id
  )
  SELECT jsonb_build_object(
    'total_revenue', total_revenue,
    'total_appointments', total_appointments,
    'active_units', active_units,
    'total_clients', total_clients
  ) INTO result
  FROM metrics;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_system_stats()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_pet_shops', (SELECT COUNT(*) FROM pet_shops),
    'total_appointments_today', (SELECT COUNT(*) FROM appointments WHERE scheduled_date = CURRENT_DATE),
    'errors_last_24h', (SELECT COUNT(*) FROM system_logs WHERE log_type = 'error' AND created_at > now() - interval '24 hours'),
    'warnings_last_24h', (SELECT COUNT(*) FROM system_logs WHERE log_type = 'warning' AND created_at > now() - interval '24 hours')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_security_stats()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'active_mfa_users', (
      SELECT COUNT(DISTINCT user_id) FROM mfa_secrets WHERE enabled = true
    ),
    'unresolved_alerts', (
      SELECT COUNT(*) FROM security_alerts WHERE resolved = false
    ),
    'critical_alerts_24h', (
      SELECT COUNT(*) FROM security_alerts 
      WHERE severity = 'critical' 
        AND created_at > now() - interval '24 hours'
    ),
    'failed_logins_24h', (
      SELECT COUNT(*) FROM login_attempts 
      WHERE success = false 
        AND attempt_time > now() - interval '24 hours'
    ),
    'successful_logins_24h', (
      SELECT COUNT(*) FROM login_attempts 
      WHERE success = true 
        AND attempt_time > now() - interval '24 hours'
    ),
    'total_backups', (
      SELECT COUNT(*) FROM backup_history WHERE status = 'completed'
    ),
    'last_backup', (
      SELECT started_at FROM backup_history 
      WHERE status = 'completed' 
      ORDER BY started_at DESC 
      LIMIT 1
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.get_system_health_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'overall_status', (
      SELECT CASE 
        WHEN COUNT(*) FILTER (WHERE status = 'critical') > 0 THEN 'critical'
        WHEN COUNT(*) FILTER (WHERE status = 'down') > 0 THEN 'down'
        WHEN COUNT(*) FILTER (WHERE status = 'degraded') > 0 THEN 'degraded'
        ELSE 'healthy'
      END
      FROM public.system_health_metrics
      WHERE measured_at > now() - interval '5 minutes'
    ),
    'critical_count', (
      SELECT COUNT(*)
      FROM public.system_health_metrics
      WHERE status = 'critical' AND measured_at > now() - interval '5 minutes'
    ),
    'degraded_count', (
      SELECT COUNT(*)
      FROM public.system_health_metrics
      WHERE status = 'degraded' AND measured_at > now() - interval '5 minutes'
    ),
    'avg_api_latency_ms', (
      SELECT AVG(metric_value)
      FROM public.system_health_metrics
      WHERE metric_type = 'api_latency' AND measured_at > now() - interval '5 minutes'
    ),
    'error_rate_percent', (
      SELECT AVG(metric_value)
      FROM public.system_health_metrics
      WHERE metric_type = 'error_rate' AND measured_at > now() - interval '5 minutes'
    ),
    'uptime_percent', (
      SELECT AVG(metric_value)
      FROM public.system_health_metrics
      WHERE metric_type = 'uptime' AND measured_at > now() - interval '1 hour'
    ),
    'failed_jobs_pending', (
      SELECT COUNT(*) FROM public.failed_jobs WHERE status = 'pending'
    ),
    'unread_critical_alerts', (
      SELECT COUNT(*) FROM public.admin_alerts WHERE severity = 'critical' AND read = false
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- ============================================
-- SECURITY & NOTIFICATION FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.is_ip_blocked(_ip_address text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_ips
    WHERE ip_address = _ip_address
      AND blocked_until > NOW()
  );
$$;

CREATE OR REPLACE FUNCTION public.update_notification_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update parent notification status based on log
  IF NEW.status = 'sent' THEN
    UPDATE public.notifications
    SET status = 'enviada', sent_at = NEW.sent_at
    WHERE id = NEW.notification_id;
  ELSIF NEW.status = 'failed' AND NEW.attempt_count >= NEW.max_attempts THEN
    UPDATE public.notifications
    SET status = 'falhou'
    WHERE id = NEW.notification_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_notification_queue_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN jsonb_build_object(
    'pending', (SELECT COUNT(*) FROM notifications_log WHERE status = 'pending'),
    'processing', (SELECT COUNT(*) FROM notifications_log WHERE status = 'processing'),
    'failed', (SELECT COUNT(*) FROM notifications_log WHERE status = 'failed'),
    'retrying', (SELECT COUNT(*) FROM notifications_log WHERE status = 'retrying'),
    'sent_today', (SELECT COUNT(*) FROM notifications_log WHERE status = 'sent' AND sent_at >= CURRENT_DATE),
    'failed_today', (SELECT COUNT(*) FROM notifications_log WHERE status = 'failed' AND updated_at >= CURRENT_DATE)
  );
END;
$$;

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.get_peak_hours(
  _pet_shop_id uuid,
  _days_back integer DEFAULT 30
)
RETURNS TABLE(hour integer, appointment_count bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM scheduled_time)::INTEGER as hour,
    COUNT(*) as appointment_count
  FROM appointments
  WHERE pet_shop_id = _pet_shop_id
    AND scheduled_date >= CURRENT_DATE - _days_back
    AND status IN ('completed', 'confirmed', 'in_progress')
  GROUP BY EXTRACT(HOUR FROM scheduled_time)
  ORDER BY hour;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_no_show_stats(
  _pet_shop_id uuid,
  _date_start date DEFAULT (CURRENT_DATE - 30),
  _date_end date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_appointments', COUNT(*),
    'no_shows', COUNT(*) FILTER (WHERE status = 'cancelled' AND scheduled_date < CURRENT_DATE),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'no_show_rate', 
      CASE 
        WHEN COUNT(*) > 0 
        THEN (COUNT(*) FILTER (WHERE status = 'cancelled' AND scheduled_date < CURRENT_DATE)::FLOAT / COUNT(*) * 100)
        ELSE 0 
      END,
    'by_day_of_week', (
      SELECT jsonb_object_agg(
        day_name,
        no_show_count
      )
      FROM (
        SELECT 
          TO_CHAR(scheduled_date, 'Day') as day_name,
          COUNT(*) FILTER (WHERE status = 'cancelled') as no_show_count
        FROM appointments
        WHERE pet_shop_id = _pet_shop_id
          AND scheduled_date BETWEEN _date_start AND _date_end
        GROUP BY TO_CHAR(scheduled_date, 'Day')
      ) sub
    )
  ) INTO result
  FROM appointments
  WHERE pet_shop_id = _pet_shop_id
    AND scheduled_date BETWEEN _date_start AND _date_end;
    
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_appointments_by_service(
  _pet_shop_id uuid,
  _days_back integer DEFAULT 30
)
RETURNS TABLE(service_name text, service_count bigint, revenue numeric, avg_duration integer)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.name as service_name,
    COUNT(a.id) as service_count,
    COALESCE(SUM(s.price), 0) as revenue,
    AVG(s.duration_minutes)::INTEGER as avg_duration
  FROM appointments a
  JOIN services s ON s.id = a.service_id
  WHERE a.pet_shop_id = _pet_shop_id
    AND a.scheduled_date >= CURRENT_DATE - _days_back
    AND a.status = 'completed'
  GROUP BY s.name, s.id
  ORDER BY service_count DESC;
END;
$$;

-- ============================================
-- ADMIN & ALERT FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.create_critical_alert(
  p_title text,
  p_message text,
  p_alert_type text DEFAULT 'system_error'::text,
  p_context jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO public.admin_alerts (
    alert_type,
    severity,
    title,
    message,
    context
  ) VALUES (
    p_alert_type,
    'critical',
    p_title,
    p_message,
    p_context
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_next_retry(attempt_count integer)
RETURNS timestamp with time zone
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  -- Exponential backoff: 2^attempt * 60 seconds, max 1 hour
  RETURN now() + (LEAST(POWER(2, attempt_count) * INTERVAL '60 seconds', INTERVAL '1 hour'));
END;
$$;

-- ============================================
-- ADMIN NOTIFICATION PREFERENCES
-- ============================================

CREATE OR REPLACE FUNCTION public.get_admin_notification_preferences(
  _admin_id uuid,
  _alert_type text,
  _channel text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  preferences RECORD;
  should_notify BOOLEAN := false;
BEGIN
  -- Get admin preferences
  SELECT * INTO preferences
  FROM public.admin_notification_preferences
  WHERE admin_id = _admin_id;
  
  -- If no preferences found, use defaults
  IF NOT FOUND THEN
    RETURN true; -- Default to enabled
  END IF;
  
  -- Check if channel is enabled
  IF _channel = 'email' AND NOT preferences.email_enabled THEN
    RETURN false;
  ELSIF _channel = 'push' AND NOT preferences.push_enabled THEN
    RETURN false;
  ELSIF _channel = 'whatsapp' AND NOT preferences.whatsapp_enabled THEN
    RETURN false;
  END IF;
  
  -- Check if alert type is enabled
  CASE _alert_type
    WHEN 'security' THEN should_notify := preferences.security_alerts;
    WHEN 'system_health' THEN should_notify := preferences.system_health_alerts;
    WHEN 'backup' THEN should_notify := preferences.backup_alerts;
    WHEN 'payment' THEN should_notify := preferences.payment_alerts;
    WHEN 'user_activity' THEN should_notify := preferences.user_activity_alerts;
    WHEN 'performance' THEN should_notify := preferences.performance_alerts;
    ELSE should_notify := true;
  END CASE;
  
  RETURN should_notify;
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_admin_notification_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a user becomes an admin, create default notification preferences
  IF NEW.role = 'admin' THEN
    INSERT INTO public.admin_notification_preferences (admin_id)
    VALUES (NEW.user_id)
    ON CONFLICT (admin_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- ROLE MANAGEMENT FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_type TEXT;
  old_role_val app_role;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_type := 'added';
    old_role_val := NULL;
    
    INSERT INTO public.role_changes_audit (
      changed_user_id,
      changed_by,
      old_role,
      new_role,
      action,
      metadata
    ) VALUES (
      NEW.user_id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
      old_role_val,
      NEW.role,
      action_type,
      jsonb_build_object('operation', TG_OP)
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'changed';
    
    INSERT INTO public.role_changes_audit (
      changed_user_id,
      changed_by,
      old_role,
      new_role,
      action,
      metadata
    ) VALUES (
      NEW.user_id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
      OLD.role,
      NEW.role,
      action_type,
      jsonb_build_object('operation', TG_OP)
    );
    
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'removed';
    
    INSERT INTO public.role_changes_audit (
      changed_user_id,
      changed_by,
      old_role,
      new_role,
      action,
      metadata
    ) VALUES (
      OLD.user_id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
      OLD.role,
      OLD.role,
      action_type,
      jsonb_build_object('operation', TG_OP)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_invites()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.admin_invites
  WHERE expires_at < now() AND accepted = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ============================================
-- SOFT DELETE FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.soft_delete_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se tentar fazer DELETE real, converter para UPDATE com deleted_at
  NEW.deleted_at = NOW();
  RETURN NEW;
END;
$$;