-- Update the handle_new_user function to read user type from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_type TEXT;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', '')
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
$function$;