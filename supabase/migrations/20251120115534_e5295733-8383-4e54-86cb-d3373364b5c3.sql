-- ============================================
-- SISTEMA DE PLANOS E FEATURE GATING
-- ============================================

-- Criar tabela de features por plano
CREATE TABLE IF NOT EXISTS public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  feature_key TEXT NOT NULL,
  feature_value JSONB NOT NULL DEFAULT 'true'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(plan_name, feature_key)
);

-- Enable RLS
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

-- Admin can manage all plan features
CREATE POLICY "Admins can manage plan features"
ON public.plan_features
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Everyone can read plan features (for checking access)
CREATE POLICY "Everyone can read plan features"
ON public.plan_features
FOR SELECT
TO authenticated
USING (true);

-- Inserir configurações de features por plano
INSERT INTO public.plan_features (plan_name, feature_key, feature_value, description) VALUES
-- Plano Gold Mensal
('pet_gold', 'multi_user_limit', '3', 'Máximo de usuários adicionais'),
('pet_gold', 'access_advanced_reports', 'false', 'Acesso a relatórios avançados'),
('pet_gold', 'modulo_estoque_completo', 'true', 'Módulo de estoque completo'),
('pet_gold', 'modulo_marketing_automacao', 'false', 'Automação de marketing'),
('pet_gold', 'backup_automatico', 'false', 'Backup automático'),
('pet_gold', 'max_appointments_per_day', '50', 'Máximo de agendamentos por dia'),

-- Plano Platinum Mensal
('pet_platinum', 'multi_user_limit', '5', 'Máximo de usuários adicionais'),
('pet_platinum', 'access_advanced_reports', 'true', 'Acesso a relatórios avançados'),
('pet_platinum', 'modulo_estoque_completo', 'true', 'Módulo de estoque completo'),
('pet_platinum', 'modulo_marketing_automacao', 'true', 'Automação de marketing'),
('pet_platinum', 'backup_automatico', 'true', 'Backup automático'),
('pet_platinum', 'max_appointments_per_day', '200', 'Máximo de agendamentos por dia'),
('pet_platinum', 'whatsapp_integration', 'true', 'Integração com WhatsApp'),
('pet_platinum', 'custom_branding', 'true', 'Personalização de marca'),

-- Plano Platinum Anual (mesmas features do mensal mas com desconto)
('pet_platinum_anual', 'multi_user_limit', '5', 'Máximo de usuários adicionais'),
('pet_platinum_anual', 'access_advanced_reports', 'true', 'Acesso a relatórios avançados'),
('pet_platinum_anual', 'modulo_estoque_completo', 'true', 'Módulo de estoque completo'),
('pet_platinum_anual', 'modulo_marketing_automacao', 'true', 'Automação de marketing'),
('pet_platinum_anual', 'backup_automatico', 'true', 'Backup automático'),
('pet_platinum_anual', 'max_appointments_per_day', '200', 'Máximo de agendamentos por dia'),
('pet_platinum_anual', 'whatsapp_integration', 'true', 'Integração com WhatsApp'),
('pet_platinum_anual', 'custom_branding', 'true', 'Personalização de marca'),

-- Plano Free (básico)
('free', 'multi_user_limit', '1', 'Máximo de usuários adicionais'),
('free', 'access_advanced_reports', 'false', 'Acesso a relatórios avançados'),
('free', 'modulo_estoque_completo', 'false', 'Módulo de estoque completo'),
('free', 'modulo_marketing_automacao', 'false', 'Automação de marketing'),
('free', 'backup_automatico', 'false', 'Backup automático'),
('free', 'max_appointments_per_day', '10', 'Máximo de agendamentos por dia')
ON CONFLICT (plan_name, feature_key) DO NOTHING;

-- Função para verificar se usuário tem acesso a uma feature
CREATE OR REPLACE FUNCTION public.has_feature(
  _user_id UUID,
  _feature_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan TEXT;
  feature_value JSONB;
BEGIN
  -- Buscar o plano do pet shop do usuário
  SELECT ps.subscription_plan INTO user_plan
  FROM public.pet_shops ps
  WHERE ps.owner_id = _user_id
  LIMIT 1;
  
  -- Se não encontrou, usuário pode ser funcionário
  IF user_plan IS NULL THEN
    SELECT ps.subscription_plan INTO user_plan
    FROM public.pet_shops ps
    JOIN public.petshop_employees pe ON pe.pet_shop_id = ps.id
    WHERE pe.user_id = _user_id AND pe.active = true
    LIMIT 1;
  END IF;
  
  -- Se ainda não encontrou, retorna free
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;
  
  -- Buscar o valor da feature para o plano
  SELECT pf.feature_value INTO feature_value
  FROM public.plan_features pf
  WHERE pf.plan_name = user_plan
    AND pf.feature_key = _feature_key;
  
  -- Se não encontrou, retorna false
  IF feature_value IS NULL THEN
    RETURN 'false'::jsonb;
  END IF;
  
  RETURN feature_value;
END;
$$;

-- Função para obter todas as features de um usuário
CREATE OR REPLACE FUNCTION public.get_user_features(_user_id UUID)
RETURNS TABLE(feature_key TEXT, feature_value JSONB, description TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan TEXT;
BEGIN
  -- Buscar o plano do pet shop do usuário
  SELECT ps.subscription_plan INTO user_plan
  FROM public.pet_shops ps
  WHERE ps.owner_id = _user_id
  LIMIT 1;
  
  -- Se não encontrou, usuário pode ser funcionário
  IF user_plan IS NULL THEN
    SELECT ps.subscription_plan INTO user_plan
    FROM public.pet_shops ps
    JOIN public.petshop_employees pe ON pe.pet_shop_id = ps.id
    WHERE pe.user_id = _user_id AND pe.active = true
    LIMIT 1;
  END IF;
  
  -- Se ainda não encontrou, retorna free
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;
  
  -- Retornar todas as features do plano
  RETURN QUERY
  SELECT pf.feature_key, pf.feature_value, pf.description
  FROM public.plan_features pf
  WHERE pf.plan_name = user_plan;
END;
$$;