-- Create notifications_log table for tracking all notification attempts
CREATE TABLE IF NOT EXISTS public.notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'retrying')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms', 'push')),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all logs
CREATE POLICY "Admins can view all notification logs"
  ON public.notifications_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy for users to view their own notification logs
CREATE POLICY "Users can view their own notification logs"
  ON public.notifications_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.id = notifications_log.notification_id
      AND n.client_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_log_status ON public.notifications_log(status);
CREATE INDEX IF NOT EXISTS idx_notifications_log_scheduled ON public.notifications_log(scheduled_for) WHERE status = 'pending';

-- Enhanced system monitoring table
CREATE TABLE IF NOT EXISTS public.monitoramento_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('uptime', 'latency', 'error_rate', 'queue_size', 'success_rate')),
  value NUMERIC NOT NULL,
  threshold_warning NUMERIC,
  threshold_critical NUMERIC,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')) DEFAULT 'healthy',
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.monitoramento_sistema ENABLE ROW LEVEL SECURITY;

-- Policy for admins
CREATE POLICY "Admins can manage monitoring"
  ON public.monitoramento_sistema FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for time-series queries
CREATE INDEX IF NOT EXISTS idx_monitoramento_timestamp ON public.monitoramento_sistema(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_monitoramento_service ON public.monitoramento_sistema(service_name, timestamp DESC);

-- Function to automatically update notification status
CREATE OR REPLACE FUNCTION public.update_notification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update parent notification status based on log
  IF NEW.status = 'sent' THEN
    UPDATE public.notifications
    SET status = 'enviada', sent_at = NEW.sent_at
    WHERE id = NEW.notification_id;
  ELSIF NEW.status = 'failed' AND NEW.attempt_count >= NEW.max_attempts THEN
    UPDATE public.notifications
    SET status = 'falhou'
    WHERE id = NEW.notification_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS trg_update_notification_status ON public.notifications_log;
CREATE TRIGGER trg_update_notification_status
  AFTER INSERT OR UPDATE ON public.notifications_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_status();

-- Function to get notification queue stats
CREATE OR REPLACE FUNCTION public.get_notification_queue_stats()
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'pending', (SELECT COUNT(*) FROM notifications_log WHERE status = 'pending'),
    'processing', (SELECT COUNT(*) FROM notifications_log WHERE status = 'processing'),
    'failed', (SELECT COUNT(*) FROM notifications_log WHERE status = 'failed'),
    'retrying', (SELECT COUNT(*) FROM notifications_log WHERE status = 'retrying'),
    'sent_today', (SELECT COUNT(*) FROM notifications_log WHERE status = 'sent' AND sent_at >= CURRENT_DATE),
    'failed_today', (SELECT COUNT(*) FROM notifications_log WHERE status = 'failed' AND updated_at >= CURRENT_DATE)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;