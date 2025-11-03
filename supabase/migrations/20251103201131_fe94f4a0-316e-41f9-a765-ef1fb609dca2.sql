-- Create login_attempts table for server-side rate limiting
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  attempt_time timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false,
  user_agent text
);

-- Add index for efficient queries
CREATE INDEX idx_login_attempts_email_time ON public.login_attempts(email, attempt_time DESC);
CREATE INDEX idx_login_attempts_ip_time ON public.login_attempts(ip_address, attempt_time DESC);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view login attempts
CREATE POLICY "Admins can view all login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- System can insert login attempts (via service role)
CREATE POLICY "System can insert login attempts"
ON public.login_attempts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Auto-cleanup old login attempts (older than 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.login_attempts
  WHERE attempt_time < now() - interval '7 days';
END;
$$;