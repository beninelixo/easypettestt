-- Update handle_new_user function to create petshop automatically for professionals
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Check user_type first, then role, default to client
  user_role := COALESCE(
    (new.raw_user_meta_data->>'user_type')::app_role,
    (new.raw_user_meta_data->>'role')::app_role,
    'client'::app_role
  );

  -- Insert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);

  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', '')
  );

  -- If user is a pet_shop professional, create the pet_shop record
  IF user_role = 'pet_shop' THEN
    INSERT INTO public.pet_shops (
      owner_id,
      name,
      address,
      city,
      state,
      phone,
      email,
      code
    )
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'pet_shop_name', 'Meu PetShop'),
      COALESCE(new.raw_user_meta_data->>'pet_shop_address', ''),
      COALESCE(new.raw_user_meta_data->>'pet_shop_city', ''),
      COALESCE(new.raw_user_meta_data->>'pet_shop_state', ''),
      COALESCE(new.raw_user_meta_data->>'phone', ''),
      new.email,
      generate_pet_shop_code()
    );
  END IF;

  RETURN new;
END;
$$;

-- Add state column to pet_shops if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'pet_shops' 
    AND column_name = 'state'
  ) THEN
    ALTER TABLE public.pet_shops ADD COLUMN state text;
  END IF;
END $$;

-- Add comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user_roles, profiles, and pet_shops (if professional) when new user signs up';
