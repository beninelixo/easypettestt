-- Criar tabela de webhooks para notificações externas
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('slack', 'discord', 'teams')),
  secret_token TEXT,
  enabled BOOLEAN DEFAULT true,
  events TEXT[] DEFAULT ARRAY['critical_alert', 'emergency_alert'],
  metadata JSONB DEFAULT '{}'::jsonb,
  last_triggered_at TIMESTAMPTZ,
  last_status_code INTEGER,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- RLS para webhooks (apenas admins)
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage webhooks"
  ON public.webhook_endpoints
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_enabled ON public.webhook_endpoints(enabled);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_service_type ON public.webhook_endpoints(service_type);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_webhook_endpoints_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.webhook_endpoints IS 'Webhooks para notificações externas (Slack, Discord, Teams)';
