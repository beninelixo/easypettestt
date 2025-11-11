-- Create IP whitelist table
CREATE TABLE IF NOT EXISTS public.ip_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  description TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ip_whitelist ENABLE ROW LEVEL SECURITY;

-- Admins can manage whitelist
CREATE POLICY "Admins manage IP whitelist"
  ON public.ip_whitelist
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_ip_whitelist_ip ON public.ip_whitelist(ip_address);

-- Create table for real-time security notifications
CREATE TABLE IF NOT EXISTS public.security_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.security_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can view notifications
CREATE POLICY "Admins view security notifications"
  ON public.security_notifications
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert notifications
CREATE POLICY "System insert security notifications"
  ON public.security_notifications
  FOR INSERT
  WITH CHECK (true);

-- Admins can mark as read
CREATE POLICY "Admins update security notifications"
  ON public.security_notifications
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_security_notifications_created ON public.security_notifications(created_at DESC);
CREATE INDEX idx_security_notifications_read ON public.security_notifications(read);

-- Enable realtime for security notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_notifications;

-- Add trigger for updated_at
CREATE TRIGGER update_ip_whitelist_updated_at
  BEFORE UPDATE ON public.ip_whitelist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();