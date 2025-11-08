-- =====================================================
-- FASE 2: MFA (Multi-Factor Authentication)
-- =====================================================

-- Tabela para armazenar secrets TOTP
CREATE TABLE public.mfa_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_key TEXT NOT NULL, -- Base32 encoded TOTP secret (criptografado)
  enabled BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  backup_codes_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela para códigos de backup (hashed)
CREATE TABLE public.mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL, -- Hashed backup code (bcrypt)
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela para sessões MFA verificadas
CREATE TABLE public.mfa_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_mfa_secrets_user_id ON public.mfa_secrets(user_id);
CREATE INDEX idx_mfa_secrets_enabled ON public.mfa_secrets(enabled);
CREATE INDEX idx_mfa_backup_codes_user_id ON public.mfa_backup_codes(user_id);
CREATE INDEX idx_mfa_backup_codes_used ON public.mfa_backup_codes(used);
CREATE INDEX idx_mfa_sessions_user_id ON public.mfa_sessions(user_id);
CREATE INDEX idx_mfa_sessions_expires_at ON public.mfa_sessions(expires_at);
CREATE INDEX idx_mfa_sessions_session_id ON public.mfa_sessions(session_id);

-- RLS Policies
ALTER TABLE public.mfa_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_sessions ENABLE ROW LEVEL SECURITY;

-- Usuários só podem ver/editar seus próprios dados MFA
CREATE POLICY "Users manage own MFA secrets"
ON public.mfa_secrets FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users manage own backup codes"
ON public.mfa_backup_codes FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users view own MFA sessions"
ON public.mfa_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Admins podem visualizar (para suporte)
CREATE POLICY "Admins view all MFA data"
ON public.mfa_secrets FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all MFA sessions"
ON public.mfa_sessions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para updated_at
CREATE TRIGGER update_mfa_secrets_updated_at
BEFORE UPDATE ON public.mfa_secrets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- FASE 3: DASHBOARD DE SEGURANÇA
-- =====================================================

-- Tabela de alertas de segurança automáticos
CREATE TABLE public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'suspicious_login',
    'multiple_failed_logins',
    'unusual_location',
    'account_takeover_attempt',
    'privilege_escalation',
    'data_breach_attempt',
    'brute_force_detected',
    'session_hijacking',
    'mfa_bypass_attempt'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  description TEXT NOT NULL,
  metadata JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_security_alerts_type ON public.security_alerts(alert_type);
CREATE INDEX idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX idx_security_alerts_user_id ON public.security_alerts(user_id);
CREATE INDEX idx_security_alerts_created_at ON public.security_alerts(created_at DESC);
CREATE INDEX idx_security_alerts_resolved ON public.security_alerts(resolved);

-- RLS
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage security alerts"
ON public.security_alerts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Tabela de padrões de comportamento (para detecção de anomalias)
CREATE TABLE public.user_behavior_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  typical_login_hours JSONB, -- Ex: [8, 9, 10, 17, 18, 19]
  typical_locations JSONB, -- Ex: {"ips": ["192.168.1.1"], "cities": ["São Paulo"]}
  typical_devices JSONB, -- User agents típicos
  login_frequency JSONB, -- Ex: {"daily": 2, "weekly": 10}
  last_updated TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_behavior_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own behavior patterns"
ON public.user_behavior_patterns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins view all behavior patterns"
ON public.user_behavior_patterns FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- FASE 4: BACKUP AUTOMÁTICO
-- =====================================================

-- Tabela de histórico de backups
CREATE TABLE public.backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id TEXT NOT NULL UNIQUE, -- formato: backup_YYYYMMDD_HHMMSS
  backup_type TEXT NOT NULL CHECK (backup_type IN ('automatic', 'manual', 'scheduled')),
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'failed')),
  tables_backed_up JSONB NOT NULL,
  total_records INTEGER NOT NULL DEFAULT 0,
  backup_size_bytes BIGINT,
  storage_path TEXT, -- Caminho no Supabase Storage
  encryption_enabled BOOLEAN DEFAULT true,
  compression_enabled BOOLEAN DEFAULT true,
  triggered_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB
);

CREATE INDEX idx_backup_history_status ON public.backup_history(status);
CREATE INDEX idx_backup_history_started_at ON public.backup_history(started_at DESC);
CREATE INDEX idx_backup_history_backup_type ON public.backup_history(backup_type);

ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage backups"
ON public.backup_history FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Habilitar realtime para alertas de segurança
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_alerts;
ALTER TABLE public.security_alerts REPLICA IDENTITY FULL;

-- Função para limpar sessões MFA expiradas
CREATE OR REPLACE FUNCTION public.cleanup_expired_mfa_sessions()
RETURNS INTEGER
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

-- Função para obter estatísticas de segurança
CREATE OR REPLACE FUNCTION public.get_security_stats()
RETURNS JSONB
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