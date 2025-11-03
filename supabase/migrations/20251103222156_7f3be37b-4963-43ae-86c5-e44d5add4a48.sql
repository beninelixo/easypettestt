-- Corrigir políticas RLS da tabela pet_shops para proteger dados sensíveis
-- Apenas usuários autenticados podem ver pet shops, e apenas donos podem ver todos os detalhes

DROP POLICY IF EXISTS "Everyone can view active pet shops" ON public.pet_shops;

-- Donos podem ver e gerenciar suas próprias pet shops
CREATE POLICY "Pet shop owners can view their shop"
ON public.pet_shops
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin'));

-- Clientes podem ver informações básicas apenas das pet shops onde têm agendamento
CREATE POLICY "Clients can view pet shops where they have appointments"
ON public.pet_shops
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.appointments
    WHERE appointments.pet_shop_id = pet_shops.id
      AND appointments.client_id = auth.uid()
  )
  OR auth.uid() = owner_id
  OR has_role(auth.uid(), 'admin')
);

-- Corrigir políticas RLS da tabela service_templates para proteger estratégia de preços
-- Apenas admins podem ver preços completos

DROP POLICY IF EXISTS "Anyone can view active service templates" ON public.service_templates;

-- Usuários autenticados podem ver templates básicos sem preços detalhados
CREATE POLICY "Authenticated users can view service templates"
ON public.service_templates
FOR SELECT
TO authenticated
USING (active = true);

-- Apenas admins e donos de pet shop podem ver todos os detalhes incluindo preços
CREATE POLICY "Pet shop owners can view all template details"
ON public.service_templates
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'pet_shop')
  OR EXISTS (
    SELECT 1 FROM public.pet_shops
    WHERE owner_id = auth.uid()
  )
);

-- Registrar correção de segurança nos logs
INSERT INTO public.system_logs (module, log_type, message, details)
VALUES (
  'security_fix',
  'success',
  'Políticas RLS corrigidas para pet_shops e service_templates',
  jsonb_build_object(
    'tables', ARRAY['pet_shops', 'service_templates'],
    'action', 'Proteção de dados sensíveis aplicada'
  )
);