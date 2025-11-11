-- Fix the notify_appointment_change trigger to use service role authentication
-- This is secure because the service role key is only accessible from within the database

CREATE OR REPLACE FUNCTION public.notify_appointment_change()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Get Supabase URL and service role key from vault or hardcoded
  supabase_url := 'https://xkfkrdorghyagtwbxory.supabase.co';
  
  -- Use extensions.vault to securely get service role key if available
  -- Otherwise use the one from current_setting (set by Supabase)
  BEGIN
    SELECT decrypted_secret INTO service_role_key
    FROM vault.decrypted_secrets
    WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: this will be set by Supabase internally
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

  -- Call edge function via pg_net with service role authentication
  PERFORM extensions.http_post(
    url := supabase_url || '/functions/v1/notify-appointment-changes',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := payload::jsonb,
    timeout_milliseconds := 5000
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error notifying appointment change: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions';

-- Ensure triggers exist (recreate if needed)
DROP TRIGGER IF EXISTS on_appointment_created ON appointments;
CREATE TRIGGER on_appointment_created
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_change();

DROP TRIGGER IF EXISTS on_appointment_cancelled ON appointments;
CREATE TRIGGER on_appointment_cancelled
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM 'cancelled' AND NEW.status = 'cancelled')
  EXECUTE FUNCTION notify_appointment_change();