-- Fix http_post function call - it's net.http_post, not extensions.http_post
CREATE OR REPLACE FUNCTION public.notify_appointment_change()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  supabase_url TEXT;
  service_role_key TEXT;
  request_id BIGINT;
BEGIN
  -- Get Supabase URL
  supabase_url := 'https://xkfkrdorghyagtwbxory.supabase.co';
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';