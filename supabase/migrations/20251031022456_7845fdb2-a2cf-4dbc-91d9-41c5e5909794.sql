-- Add user_code field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN user_code TEXT;

-- Create function to generate unique user code
CREATE OR REPLACE FUNCTION public.generate_user_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code like #0880
    new_code := '#' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Update handle_new_user function to generate user code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_type TEXT;
BEGIN
  -- Insert profile with generated user code
  INSERT INTO public.profiles (id, full_name, phone, user_code)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    generate_user_code()
  );
  
  -- Read user type from metadata (default to 'client' if not specified)
  user_type := COALESCE(new.raw_user_meta_data->>'user_type', 'client');
  
  -- Assign role based on user type
  IF user_type = 'pet_shop' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'pet_shop');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'client');
  END IF;
  
  RETURN new;
END;
$$;