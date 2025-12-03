-- Corrigir função notify_appointment_change com URL correta do novo projeto Supabase
CREATE OR REPLACE FUNCTION public.notify_appointment_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  payload JSON;
  supabase_url TEXT;
  service_role_key TEXT;
  request_id BIGINT;
BEGIN
  -- URL CORRETA do novo projeto Supabase
  supabase_url := 'https://zxdbsimthnfprrthszoh.supabase.co';
  
  -- Get service role key from vault
  BEGIN
    SELECT decrypted_secret INTO service_role_key
    FROM vault.decrypted_secrets
    WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    service_role_key := current_setting('supabase.service_role_key', true);
  END;

  -- Build payload based on operation type
  IF TG_OP = 'INSERT' THEN
    payload := json_build_object(
      'type', TG_OP,
      'record', row_to_json(NEW)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    payload := json_build_object(
      'type', TG_OP,
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD)
    );
  END IF;

  -- Call edge function via net.http_post
  SELECT INTO request_id net.http_post(
    url := supabase_url || '/functions/v1/notify-appointment-changes',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := payload::jsonb,
    timeout_milliseconds := 5000
  );

  RAISE LOG 'Notification request queued with ID: %', request_id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error notifying appointment change: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Corrigir função handle_new_user com URL correta do novo projeto Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
  request_id BIGINT;
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Log início da execução
  RAISE LOG 'handle_new_user: Processing new user % with email %', new.id, new.email;
  
  -- Check user_type first, then role, default to client
  -- Map 'professional' to 'pet_shop' for compatibility
  user_role := CASE 
    WHEN (new.raw_user_meta_data->>'user_type') = 'professional' THEN 'pet_shop'::app_role
    WHEN (new.raw_user_meta_data->>'user_type') = 'pet_shop' THEN 'pet_shop'::app_role
    WHEN (new.raw_user_meta_data->>'user_type') = 'client' THEN 'client'::app_role
    WHEN (new.raw_user_meta_data->>'user_type') = 'admin' THEN 'admin'::app_role
    WHEN (new.raw_user_meta_data->>'role') IS NOT NULL THEN (new.raw_user_meta_data->>'role')::app_role
    ELSE 'client'::app_role
  END;
  
  RAISE LOG 'handle_new_user: Determined role % for user %', user_role, new.id;

  -- Insert into user_roles
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, user_role);
    RAISE LOG 'handle_new_user: Created user_role for %', new.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Failed to create user_role: %', SQLERRM;
  END;

  -- Insert into profiles
  BEGIN
    INSERT INTO public.profiles (id, full_name, phone)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', ''),
      COALESCE(new.raw_user_meta_data->>'phone', '')
    );
    RAISE LOG 'handle_new_user: Created profile for %', new.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Failed to create profile: %', SQLERRM;
  END;

  -- If user is a pet_shop professional, create the pet_shop record
  IF user_role = 'pet_shop' THEN
    BEGIN
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
      RAISE LOG 'handle_new_user: Created pet_shop for %', new.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user: Failed to create pet_shop: %', SQLERRM;
    END;
  END IF;

  -- Trigger welcome email via edge function (async, non-blocking)
  BEGIN
    -- URL CORRETA do novo projeto Supabase
    supabase_url := 'https://zxdbsimthnfprrthszoh.supabase.co';
    
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
    IF service_role_key IS NOT NULL AND service_role_key != '' THEN
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
      RAISE LOG 'handle_new_user: Welcome email queued with request ID: % for user: %', request_id, new.id;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log but don't fail user creation if email fails
      RAISE WARNING 'handle_new_user: Failed to queue welcome email: %', SQLERRM;
  END;

  RAISE LOG 'handle_new_user: Completed processing for user %', new.id;
  RETURN new;
END;
$function$;