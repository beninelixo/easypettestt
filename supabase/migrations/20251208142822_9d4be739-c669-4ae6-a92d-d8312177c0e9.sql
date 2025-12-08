-- ============================================
-- SECURITY ENHANCEMENT: Secure VIEWs and RLS Policy Updates
-- ============================================

-- PHASE 1: Create Secure VIEWs

-- VIEW 1: profiles_limited_view (hides document/CPF, address, contact_preference)
CREATE OR REPLACE VIEW public.profiles_limited_view AS
SELECT 
  id, 
  full_name, 
  phone, 
  avatar_url, 
  user_code, 
  created_at,
  updated_at
FROM public.profiles
WHERE is_blocked = false OR is_blocked IS NULL;

COMMENT ON VIEW public.profiles_limited_view IS 'Vista limitada de perfis - oculta documento (CPF), endereço e preferências de contato';

-- VIEW 2: pets_basic_view (hides medical data)
CREATE OR REPLACE VIEW public.pets_basic_view AS
SELECT 
  id, 
  owner_id, 
  name, 
  breed, 
  age, 
  weight, 
  photo_url, 
  species, 
  gender, 
  birth_date, 
  coat_type, 
  coat_color, 
  size, 
  neutered, 
  temperament, 
  grooming_preferences,
  created_at, 
  updated_at, 
  deleted_at
FROM public.pets
WHERE deleted_at IS NULL;

COMMENT ON VIEW public.pets_basic_view IS 'Vista básica de pets - oculta doenças crônicas, alergias, histórico de vacinação e restrições';

-- VIEW 3: pet_shops_public_view (hides financial/subscription data)
CREATE OR REPLACE VIEW public.pet_shops_public_view AS
SELECT 
  id, 
  name, 
  address, 
  phone, 
  logo_url, 
  code, 
  city, 
  email, 
  description, 
  hours, 
  state, 
  latitude, 
  longitude, 
  created_at
FROM public.pet_shops
WHERE deleted_at IS NULL;

COMMENT ON VIEW public.pet_shops_public_view IS 'Vista pública de pet shops - oculta owner_id, plano de assinatura e IDs de pagamento Cakto';

-- VIEW 4: products_catalog_view (hides cost price and stock info)
CREATE OR REPLACE VIEW public.products_catalog_view AS
SELECT 
  id, 
  pet_shop_id, 
  name, 
  description, 
  category, 
  sale_price, 
  active,
  created_at, 
  updated_at
FROM public.products
WHERE active = true AND deleted_at IS NULL;

COMMENT ON VIEW public.products_catalog_view IS 'Vista de catálogo de produtos - oculta preço de custo, SKU, código de barras e quantidade em estoque';

-- PHASE 2: Grant Permissions on VIEWs
GRANT SELECT ON public.pet_shops_public_view TO anon, authenticated;
GRANT SELECT ON public.products_catalog_view TO anon, authenticated;
GRANT SELECT ON public.profiles_limited_view TO authenticated;
GRANT SELECT ON public.pets_basic_view TO authenticated;

-- PHASE 3: Update RLS Policies

-- 3.1 Update products policy
DROP POLICY IF EXISTS "Public can view basic product info" ON public.products;

CREATE POLICY "Public can view product catalog" 
ON public.products 
FOR SELECT 
TO anon, authenticated
USING (active = true AND deleted_at IS NULL);

-- 3.2 Update pets policy - reduce access window from 90 to 30 days
DROP POLICY IF EXISTS "Pet shops view pets with recent appointments" ON public.pets;

CREATE POLICY "Pet shops view pets with recent appointments (30 days)" 
ON public.pets 
FOR SELECT 
TO authenticated
USING (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.pet_shops ps ON ps.id = a.pet_shop_id
    WHERE a.pet_id = pets.id
      AND a.scheduled_date >= CURRENT_DATE - INTERVAL '30 days'
      AND (ps.owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), ps.id))
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR is_god_user(auth.uid())
);

-- PHASE 4: Create Helper Functions

CREATE OR REPLACE FUNCTION public.can_view_pet_shop_details(_user_id uuid, _pet_shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    EXISTS (SELECT 1 FROM pet_shops WHERE id = _pet_shop_id AND owner_id = _user_id)
    OR is_employee_of_petshop(_user_id, _pet_shop_id)
    OR has_role(_user_id, 'admin'::app_role)
    OR is_god_user(_user_id)
$$;

CREATE OR REPLACE FUNCTION public.can_view_full_profile(_user_id uuid, _profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    _user_id = _profile_id
    OR has_role(_user_id, 'admin'::app_role)
    OR is_god_user(_user_id)
$$;

CREATE OR REPLACE FUNCTION public.can_view_pet_medical_data(_user_id uuid, _pet_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    EXISTS (SELECT 1 FROM pets WHERE id = _pet_id AND owner_id = _user_id)
    OR EXISTS (
      SELECT 1 FROM appointments a
      JOIN pet_shops ps ON ps.id = a.pet_shop_id
      WHERE a.pet_id = _pet_id
        AND a.scheduled_date BETWEEN CURRENT_DATE - INTERVAL '7 days' AND CURRENT_DATE + INTERVAL '7 days'
        AND (ps.owner_id = _user_id OR is_employee_of_petshop(_user_id, ps.id))
    )
    OR has_role(_user_id, 'admin'::app_role)
    OR is_god_user(_user_id)
$$;