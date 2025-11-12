-- Function to trigger welcome email after user registration
-- This should be called from the handle_new_user trigger

CREATE OR REPLACE FUNCTION public.trigger_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  user_email TEXT;
  request_id BIGINT;
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Get user role
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = NEW.id
  LIMIT 1;

  -- Get user email
  user_email := NEW.email;

  -- Get Supabase configuration
  supabase_url := 'https://xkfkrdorghyagtwbxory.supabase.co';
  
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
      'userId', NEW.id,
      'email', user_email,
      'fullName', COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'role', user_role
    ),
    timeout_milliseconds := 5000
  );

  RAISE LOG 'Welcome email request queued with ID: % for user: %', request_id, NEW.id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error triggering welcome email: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger to send welcome email after user creation
DROP TRIGGER IF EXISTS on_user_created_send_welcome ON auth.users;

CREATE TRIGGER on_user_created_send_welcome
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_welcome_email();

COMMENT ON FUNCTION public.trigger_welcome_email() IS 'Automatically sends welcome email via Loops when new user registers';
