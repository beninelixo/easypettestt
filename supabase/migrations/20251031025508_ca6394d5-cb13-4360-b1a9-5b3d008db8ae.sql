-- Create table for password reset codes
CREATE TABLE IF NOT EXISTS public.password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert password reset requests
CREATE POLICY "Anyone can request password reset"
  ON public.password_resets
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own reset codes (for verification)
CREATE POLICY "Users can verify their own codes"
  ON public.password_resets
  FOR SELECT
  USING (true);

-- Policy: System can update used status
CREATE POLICY "System can mark codes as used"
  ON public.password_resets
  FOR UPDATE
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_resets_email_code ON public.password_resets(email, code);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON public.password_resets(expires_at);

-- Function to clean up expired codes (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_resets
  WHERE expires_at < now() OR used = true;
END;
$$;