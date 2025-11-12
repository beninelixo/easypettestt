-- ============================================
-- SISTEMA DE ALERTAS PUSH PARA ADMINS
-- ============================================

-- Tabela de alertas administrativos com histórico completo
CREATE TABLE IF NOT EXISTS public.admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'system_error', 'security_breach', 'performance_degradation', 
    'edge_function_failure', 'database_issue', 'api_timeout',
    'high_error_rate', 'suspicious_activity', 'backup_failure'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  source_module TEXT,
  source_function TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES auth.users(id),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days')
);

-- Índices para performance
CREATE INDEX idx_admin_alerts_severity ON public.admin_alerts(severity);
CREATE INDEX idx_admin_alerts_type ON public.admin_alerts(alert_type);
CREATE INDEX idx_admin_alerts_unread ON public.admin_alerts(read) WHERE read = false;
CREATE INDEX idx_admin_alerts_created ON public.admin_alerts(created_at DESC);

-- RLS para admins
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all alerts"
  ON public.admin_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update alerts"
  ON public.admin_alerts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Habilitar Realtime para alertas
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_alerts;

-- ============================================
-- SISTEMA DE SAÚDE E MÉTRICAS DO SISTEMA
-- ============================================

-- Tabela de métricas de saúde do sistema
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'uptime', 'api_latency', 'database_latency', 'edge_function_latency',
    'error_rate', 'request_count', 'active_users', 'cpu_usage',
    'memory_usage', 'disk_usage', 'network_throughput'
  )),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT, -- ms, %, count, bytes, etc
  status TEXT CHECK (status IN ('healthy', 'degraded', 'critical', 'down')),
  threshold_warning NUMERIC,
  threshold_critical NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  measured_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para queries rápidas
CREATE INDEX idx_health_metrics_type ON public.system_health_metrics(metric_type);
CREATE INDEX idx_health_metrics_measured ON public.system_health_metrics(measured_at DESC);
CREATE INDEX idx_health_metrics_status ON public.system_health_metrics(status);

-- RLS para admins
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view health metrics"
  ON public.system_health_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Habilitar Realtime para métricas
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_health_metrics;

-- ============================================
-- SISTEMA DE RETRY AUTOMÁTICO
-- ============================================

-- Tabela de jobs falhados que precisam de retry
CREATE TABLE IF NOT EXISTS public.failed_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL, -- 'edge_function', 'email', 'notification', 'api_call'
  job_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  error_message TEXT,
  error_stack TEXT,
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  next_retry_at TIMESTAMPTZ,
  last_attempted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'retrying', 'succeeded', 'failed', 'cancelled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Índices para retry queue
CREATE INDEX idx_failed_jobs_status ON public.failed_jobs(status);
CREATE INDEX idx_failed_jobs_retry ON public.failed_jobs(next_retry_at) WHERE status = 'pending';
CREATE INDEX idx_failed_jobs_type ON public.failed_jobs(job_type);

-- RLS para admins
ALTER TABLE public.failed_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view failed jobs"
  ON public.failed_jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para criar alerta crítico automaticamente
CREATE OR REPLACE FUNCTION public.create_critical_alert(
  p_title TEXT,
  p_message TEXT,
  p_alert_type TEXT DEFAULT 'system_error',
  p_context JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
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

-- Função para calcular próximo retry com exponential backoff
CREATE OR REPLACE FUNCTION public.calculate_next_retry(
  attempt_count INTEGER
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Exponential backoff: 2^attempt * 60 seconds, max 1 hour
  RETURN now() + (LEAST(POWER(2, attempt_count) * INTERVAL '60 seconds', INTERVAL '1 hour'));
END;
$$;

-- Função para marcar alerta como lido
CREATE OR REPLACE FUNCTION public.mark_alert_read(alert_id UUID)
RETURNS BOOLEAN
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

-- Função para obter estatísticas de saúde do sistema
CREATE OR REPLACE FUNCTION public.get_system_health_summary()
RETURNS JSONB
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