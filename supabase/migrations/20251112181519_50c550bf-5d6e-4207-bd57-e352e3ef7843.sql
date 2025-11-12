-- Tabela para logs de eventos de autenticação em tempo real
CREATE TABLE IF NOT EXISTS public.auth_events_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('login', 'logout', 'token_refresh', 'role_fetch')),
  event_status text NOT NULL CHECK (event_status IN ('success', 'error', 'pending')),
  role_source text CHECK (role_source IN ('metadata', 'database')),
  user_role text CHECK (user_role IN ('admin', 'pet_shop', 'client')),
  ip_address text,
  user_agent text,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes para queries rápidas
CREATE INDEX idx_auth_events_user_id ON public.auth_events_log(user_id);
CREATE INDEX idx_auth_events_created_at ON public.auth_events_log(created_at DESC);
CREATE INDEX idx_auth_events_type_status ON public.auth_events_log(event_type, event_status);

-- RLS: apenas admins podem ver
ALTER TABLE public.auth_events_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all auth events"
  ON public.auth_events_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.auth_events_log;