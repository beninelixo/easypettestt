-- Corrigir função para adicionar search_path (segurança)
CREATE OR REPLACE FUNCTION notify_appointment_change()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  supabase_url TEXT;
  anon_key TEXT;
BEGIN
  -- Obter URL e chave do Supabase das variáveis de ambiente
  supabase_url := current_setting('app.settings', true)::json->>'SUPABASE_URL';
  anon_key := current_setting('app.settings', true)::json->>'SUPABASE_ANON_KEY';

  -- Se as variáveis não estiverem definidas, usar valores padrão (Lovable Cloud)
  IF supabase_url IS NULL THEN
    supabase_url := 'https://xkfkrdorghyagtwbxory.supabase.co';
  END IF;
  
  IF anon_key IS NULL THEN
    anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZmtyZG9yZ2h5YWd0d2J4b3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1OTQ5MTEsImV4cCI6MjA3NzE3MDkxMX0.R8kZ4o1Ll2gRLfp4Y2MQWbD_fvJ0WoRWEKHCdU3yhpQ';
  END IF;

  -- Construir payload diferente para INSERT vs UPDATE
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

  -- Chamar edge function via pg_net (não bloqueante)
  PERFORM extensions.http_post(
    url := supabase_url || '/functions/v1/notify-appointment-changes',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := payload::jsonb
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log erro mas não falhar a transação
    RAISE WARNING 'Erro ao notificar mudança em agendamento: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;