-- Fix password_resets UPDATE policy to restrict to service role only
-- This prevents authenticated users from marking reset codes as used

DROP POLICY IF EXISTS "System can mark codes as used" ON public.password_resets;

-- Only edge functions with service role can update reset codes
CREATE POLICY "Service role can mark codes as used"
  ON public.password_resets
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);