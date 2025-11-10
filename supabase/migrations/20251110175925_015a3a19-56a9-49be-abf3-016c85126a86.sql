-- =====================================================
-- MIGRATION 2: Criar tabela structured_logs
-- =====================================================
-- Sistema de logs estruturados para melhor auditoria

CREATE TABLE IF NOT EXISTS structured_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
  module TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_structured_logs_level ON structured_logs(level);
CREATE INDEX IF NOT EXISTS idx_structured_logs_module ON structured_logs(module);
CREATE INDEX IF NOT EXISTS idx_structured_logs_created ON structured_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_structured_logs_user ON structured_logs(user_id) WHERE user_id IS NOT NULL;

-- Habilitar RLS
ALTER TABLE structured_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas admins podem ver logs
CREATE POLICY "Admins can view all logs"
ON structured_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Sistema pode inserir logs
CREATE POLICY "System can insert logs"
ON structured_logs FOR INSERT
WITH CHECK (true);

-- =====================================================
-- MIGRATION 3: Função para resolver alertas antigos
-- =====================================================

CREATE OR REPLACE FUNCTION resolve_old_alerts()
RETURNS INTEGER AS $$
DECLARE
  resolved_count INTEGER;
BEGIN
  -- Resolver automaticamente alertas com mais de 7 dias
  UPDATE security_alerts
  SET resolved = true,
      resolved_at = NOW(),
      resolved_by = '00000000-0000-0000-0000-000000000000'::UUID
  WHERE resolved = false
    AND severity IN ('low', 'medium')
    AND created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS resolved_count = ROW_COUNT;
  
  -- Log da operação
  INSERT INTO system_logs (module, log_type, message, details)
  VALUES (
    'security_cleanup',
    'info',
    'Alertas antigos resolvidos automaticamente',
    jsonb_build_object('resolved_count', resolved_count)
  );
  
  RETURN resolved_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;