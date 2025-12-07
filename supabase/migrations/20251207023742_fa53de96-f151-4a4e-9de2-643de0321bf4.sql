-- =====================================================
-- PHASE 1: CRITICAL RLS FIXES AND STABILITY IMPROVEMENTS
-- =====================================================

-- 1.1 Add policy for authenticated users to view basic pet shop info
CREATE POLICY "Authenticated users can view active pet shops"
ON public.pet_shops
FOR SELECT
TO authenticated
USING (deleted_at IS NULL);

-- 1.2 Fix site_images policies
DROP POLICY IF EXISTS "Public can view site images" ON public.site_images;

CREATE POLICY "Public can view site images securely"
ON public.site_images
FOR SELECT
TO anon, authenticated
USING (true);

-- 1.3 Add rate limiting columns for newsletter subscriptions
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS subscriber_ip text,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Create rate limit check function for newsletter
CREATE OR REPLACE FUNCTION check_newsletter_rate_limit(check_ip text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) < 5 
  FROM newsletter_subscribers
  WHERE subscriber_ip = check_ip
  AND created_at > NOW() - INTERVAL '1 hour';
$$;

-- 1.4 Create index for faster rate limit queries
CREATE INDEX IF NOT EXISTS idx_newsletter_ip_created 
ON public.newsletter_subscribers(subscriber_ip, created_at);

-- 1.5 Add index for pet_shops access optimization (without predicate)
CREATE INDEX IF NOT EXISTS idx_pet_shops_deleted_at 
ON public.pet_shops(deleted_at);

-- 1.6 Regular index for mfa_sessions cleanup
CREATE INDEX IF NOT EXISTS idx_mfa_sessions_expires 
ON public.mfa_sessions(expires_at);