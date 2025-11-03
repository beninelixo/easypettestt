-- Tabela de logs do sistema
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  log_type TEXT NOT NULL CHECK (log_type IN ('info', 'warning', 'error', 'success')),
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_module ON public.system_logs(module);
CREATE INDEX IF NOT EXISTS idx_system_logs_type ON public.system_logs(log_type);

-- Tabela de health checks
CREATE TABLE IF NOT EXISTS public.system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  response_time_ms INTEGER,
  last_check TIMESTAMPTZ NOT NULL DEFAULT now(),
  error_message TEXT,
  metadata JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de métricas agregadas
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_users INTEGER DEFAULT 0,
  total_appointments INTEGER DEFAULT 0,
  total_pet_shops INTEGER DEFAULT 0,
  failed_logins INTEGER DEFAULT 0,
  successful_logins INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(metric_date)
);

-- RLS Policies - apenas admins podem ver
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admins podem ver logs"
  ON public.system_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Apenas admins podem ver health"
  ON public.system_health
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Apenas admins podem ver métricas"
  ON public.system_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Função para limpar logs antigos (>30 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS INTEGER
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
  
  -- Registrar limpeza
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

-- Função para obter estatísticas do sistema
CREATE OR REPLACE FUNCTION public.get_system_stats()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
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