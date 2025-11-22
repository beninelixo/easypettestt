-- ============================================
-- FASE 2: BLOQUEIO DE USUÁRIOS E IMPERSONAÇÃO
-- ============================================

-- 1. Adicionar colunas de bloqueio na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES auth.users(id);

-- 2. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON public.profiles(is_blocked) WHERE is_blocked = TRUE;

-- 3. Criar tabela de sessões de impersonação
CREATE TABLE IF NOT EXISTS public.impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  target_user_id UUID NOT NULL REFERENCES auth.users(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  active BOOLEAN DEFAULT TRUE,
  reason TEXT,
  CONSTRAINT no_self_impersonation CHECK (admin_user_id != target_user_id)
);

-- 4. Enable RLS on impersonation_sessions
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para impersonation_sessions
DROP POLICY IF EXISTS "admins_view_impersonation_sessions" ON public.impersonation_sessions;
CREATE POLICY "admins_view_impersonation_sessions"
  ON public.impersonation_sessions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_god_user(auth.uid()));

DROP POLICY IF EXISTS "admins_manage_impersonation_sessions" ON public.impersonation_sessions;
CREATE POLICY "admins_manage_impersonation_sessions"
  ON public.impersonation_sessions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR is_god_user(auth.uid()));

-- 6. Criar função para verificar se usuário está bloqueado
CREATE OR REPLACE FUNCTION public.is_user_blocked(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_blocked FROM public.profiles WHERE id = _user_id),
    FALSE
  )
$$;

-- 7. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_admin ON public.impersonation_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_target ON public.impersonation_sessions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_active ON public.impersonation_sessions(active) WHERE active = TRUE;

-- 8. Log da implementação
INSERT INTO public.system_logs (module, log_type, message, details)
VALUES (
  'user_management',
  'info',
  'Sistema de bloqueio e impersonação implementado',
  jsonb_build_object(
    'timestamp', now(),
    'features', jsonb_build_array('user_blocking', 'impersonation_tracking')
  )
);