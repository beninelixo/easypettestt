-- Update notify_appointment_change function with new Supabase URL
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
  -- Get Supabase URL
  supabase_url := 'https://zxdbsimthnfprrthszoh.supabase.co';
  
  -- Get service role key from vault
  BEGIN
    SELECT decrypted_secret INTO service_role_key
    FROM vault.decrypted_secrets
    WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: use environment setting
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

  -- Call edge function via net.http_post (correct schema)
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
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error notifying appointment change: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Update handle_new_user function with new Supabase URL
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
$function$;