-- Fix password reset timing attack vulnerability
-- Remove public SELECT access to password_resets table
-- All verification will now be handled server-side via edge functions

-- Drop the open SELECT policy that allows enumeration
DROP POLICY IF EXISTS "Users can verify their own codes" ON public.password_resets;

-- Keep INSERT policy for password reset requests (anonymous users)
-- Policy already exists: "Anyone can request password reset"

-- Keep UPDATE policy for marking codes as used (system/service role)
-- Policy already exists: "System can mark codes as used"

-- Add comment explaining the security model
COMMENT ON TABLE public.password_resets IS 'Password reset codes. No public SELECT access to prevent email enumeration. All verification is handled server-side via edge functions using service role.';