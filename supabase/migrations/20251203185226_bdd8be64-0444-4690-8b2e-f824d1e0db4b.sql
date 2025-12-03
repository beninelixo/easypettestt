-- Limpeza de políticas RLS duplicadas e redundantes

-- ============================================
-- 1. LIMPAR POLÍTICAS DUPLICADAS EM pet_shops
-- ============================================

-- Remover políticas redundantes que foram criadas em múltiplas migrações
DROP POLICY IF EXISTS "Pet shops are viewable by everyone" ON public.pet_shops;
DROP POLICY IF EXISTS "Pet shops public read" ON public.pet_shops;
DROP POLICY IF EXISTS "Pet shop owners can view their shop" ON public.pet_shops;
DROP POLICY IF EXISTS "Pet shop staff can view full shop details" ON public.pet_shops;
DROP POLICY IF EXISTS "View pet shops simple" ON public.pet_shops;
DROP POLICY IF EXISTS "Admins can view all pet shops" ON public.pet_shops;

-- Manter apenas políticas essenciais e não duplicadas:
-- "Public can view pet shop basic info" - para anônimos
-- "Authenticated users can view all pet shop info" - para autenticados
-- "Pet shop owners can manage their shop" - para proprietários
-- "Admins can update all pet shops" - para admins
-- "Admins can manage all pet shops" - para admins (ALL)
-- "god_user_full_access_pet_shops" - para god user

-- ============================================
-- 2. LIMPAR POLÍTICAS DUPLICADAS EM permissions
-- ============================================

DROP POLICY IF EXISTS "Anyone can view permissions" ON public.permissions;
DROP POLICY IF EXISTS "Permissions public read" ON public.permissions;
DROP POLICY IF EXISTS "Only admins can manage permissions" ON public.permissions;

-- Manter apenas:
-- "Only authenticated can view permissions"
-- "Only admins can modify permissions"

-- ============================================
-- 3. LIMPAR POLÍTICAS DUPLICADAS EM profiles
-- ============================================

-- Verificar e limpar duplicatas em profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- ============================================
-- 4. LIMPAR POLÍTICAS DUPLICADAS EM services
-- ============================================

DROP POLICY IF EXISTS "Everyone can view active services" ON public.services;
-- Manter "Users can view active services" que é mais abrangente

-- ============================================
-- 5. LIMPAR POLÍTICAS DUPLICADAS EM appointments
-- ============================================

-- Remover política que foi substituída por outras mais específicas
DROP POLICY IF EXISTS "Clients can view their own appointments" ON public.appointments;
-- Manter "View own appointments or as petshop owner" que é mais abrangente

-- ============================================
-- 6. COMENTAR SOBRE POLÍTICAS MANTIDAS
-- ============================================

-- Adicionar comentários nas políticas principais para documentação
COMMENT ON POLICY "Public can view pet shop basic info" ON public.pet_shops IS 
  'Permite que usuários anônimos vejam informações básicas de pet shops ativos';

COMMENT ON POLICY "Authenticated users can view all pet shop info" ON public.pet_shops IS 
  'Permite que usuários autenticados vejam todas as informações de pet shops ativos';

COMMENT ON POLICY "Only authenticated can view permissions" ON public.permissions IS 
  'Apenas usuários autenticados podem ver permissões do sistema';

COMMENT ON POLICY "Only admins can modify permissions" ON public.permissions IS 
  'Apenas administradores podem modificar permissões do sistema';