-- =====================================================
-- FIX: Recursão Infinita em RLS - appointments e pet_shops
-- =====================================================

-- 1. Criar função para verificar se usuário é dono do pet shop
CREATE OR REPLACE FUNCTION public.is_pet_shop_owner(_user_id uuid, _pet_shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pet_shops
    WHERE id = _pet_shop_id AND owner_id = _user_id
  )
$$;

-- 2. Criar função para verificar se cliente tem agendamento no pet shop
CREATE OR REPLACE FUNCTION public.has_appointment_at_petshop(_user_id uuid, _pet_shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.appointments
    WHERE pet_shop_id = _pet_shop_id AND client_id = _user_id
  )
$$;

-- 3. Remover políticas problemáticas de appointments
DROP POLICY IF EXISTS "View own appointments or as petshop owner" ON public.appointments;
DROP POLICY IF EXISTS "Update appointments as owner or employee" ON public.appointments;

-- 4. Recriar políticas de appointments SEM subconsultas recursivas
CREATE POLICY "View own appointments or as petshop owner" 
ON public.appointments 
FOR SELECT 
USING (
  auth.uid() = client_id 
  OR is_pet_shop_owner(auth.uid(), pet_shop_id)
  OR is_employee_of_petshop(auth.uid(), pet_shop_id) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Update appointments as owner or employee" 
ON public.appointments 
FOR UPDATE 
USING (
  auth.uid() = client_id 
  OR is_pet_shop_owner(auth.uid(), pet_shop_id)
  OR is_employee_of_petshop(auth.uid(), pet_shop_id)
);

-- 5. Remover política problemática de pet_shops
DROP POLICY IF EXISTS "Clients view pet shop public info for appointments" ON public.pet_shops;

-- 6. Recriar política de pet_shops SEM subconsulta recursiva
CREATE POLICY "Clients view pet shop public info for appointments" 
ON public.pet_shops 
FOR SELECT 
USING (
  has_appointment_at_petshop(auth.uid(), id)
);