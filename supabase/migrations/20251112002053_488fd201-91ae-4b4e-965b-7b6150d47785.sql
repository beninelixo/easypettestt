-- Update handle_new_user function to include welcome email trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  request_id BIGINT;
  supabase_url TEXT;
  service_role_key TEXT;
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

  -- Trigger welcome email via edge function (async, non-blocking)
  BEGIN
    supabase_url := 'https://xkfkrdorghyagtwbxory.supabase.co';
    
    -- Try to get service role key from vault
    BEGIN
      SELECT decrypted_secret INTO service_role_key
      FROM vault.decrypted_secrets
      WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      service_role_key := current_setting('supabase.service_role_key', true);
    END;

    -- Call welcome email edge function asynchronously
    SELECT INTO request_id net.http_post(
      url := supabase_url || '/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'userId', new.id,
        'email', new.email,
        'fullName', COALESCE(new.raw_user_meta_data->>'full_name', ''),
        'role', user_role
      ),
      timeout_milliseconds := 5000
    );

    RAISE LOG 'Welcome email queued with request ID: % for user: %', request_id, new.id;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log but don't fail user creation if email fails
      RAISE WARNING 'Failed to queue welcome email: %', SQLERRM;
  END;

  RETURN new;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates user profile, roles, pet shop (if applicable), and triggers welcome email on user registration';