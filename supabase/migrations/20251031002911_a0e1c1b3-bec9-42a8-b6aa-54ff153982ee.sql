-- Fix 1: Update RLS policies for appointments to properly check pet_shop relationship
DROP POLICY IF EXISTS "Pet shops can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Pet shops can update their appointments" ON public.appointments;

CREATE POLICY "Pet shops can view their appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pet_shops
    WHERE pet_shops.id = appointments.pet_shop_id
    AND pet_shops.owner_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Pet shops can update their appointments"
ON public.appointments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pet_shops
    WHERE pet_shops.id = appointments.pet_shop_id
    AND pet_shops.owner_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 2: Update RLS policies for services to properly check pet_shop relationship
DROP POLICY IF EXISTS "Pet shops can manage their own services" ON public.services;

CREATE POLICY "Pet shops can manage their own services"
ON public.services FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pet_shops
    WHERE pet_shops.id = services.pet_shop_id
    AND pet_shops.owner_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 3: Add RLS policy to allow pet shops to view client profiles when they have appointments
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 
    FROM public.appointments a
    JOIN public.pet_shops ps ON ps.id = a.pet_shop_id
    WHERE a.client_id = profiles.id
    AND ps.owner_id = auth.uid()
  )
);

-- Fix 4: Update pets RLS policy to restrict access to only clients with appointments
DROP POLICY IF EXISTS "Pet shops can view all pets" ON public.pets;

CREATE POLICY "Pet shops can view their clients' pets"
ON public.pets FOR SELECT
TO authenticated
USING (
  auth.uid() = owner_id OR
  EXISTS (
    SELECT 1 
    FROM public.appointments a
    JOIN public.pet_shops ps ON ps.id = a.pet_shop_id
    WHERE a.pet_id = pets.id
    AND ps.owner_id = auth.uid()
  ) OR
  public.has_role(auth.uid(), 'admin'::app_role)
);