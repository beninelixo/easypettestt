-- Fix services table foreign key to reference pet_shops instead of auth.users
-- First, we need to update existing data to use pet_shop IDs instead of user IDs
UPDATE public.services s
SET pet_shop_id = ps.id
FROM public.pet_shops ps
WHERE s.pet_shop_id = ps.owner_id;

-- Drop the old foreign key constraint
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_pet_shop_id_fkey;

-- Add new foreign key constraint to pet_shops table
ALTER TABLE public.services ADD CONSTRAINT services_pet_shop_id_fkey
  FOREIGN KEY (pet_shop_id) REFERENCES public.pet_shops(id) ON DELETE CASCADE;

-- Update RLS policy for services to use proper relationship
DROP POLICY IF EXISTS "Pet shops can manage their own services" ON public.services;

CREATE POLICY "Pet shops can manage their own services"
  ON public.services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pet_shops
      WHERE pet_shops.id = services.pet_shop_id
      AND pet_shops.owner_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

-- Update trigger to handle user_type consistently
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Check user_type first, then role, default to client
  user_role := COALESCE(
    (new.raw_user_meta_data->>'user_type')::app_role,
    (new.raw_user_meta_data->>'role')::app_role,
    'client'::app_role
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);

  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', '')
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;