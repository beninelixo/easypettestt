-- Add admin policy for pet_shops management
CREATE POLICY "Admins can manage all pet shops"
ON public.pet_shops FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Add rate limiting function for admin endpoints
CREATE TABLE IF NOT EXISTS public.admin_api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(admin_id, endpoint, window_start)
);

-- Enable RLS on rate limits table
ALTER TABLE public.admin_api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Admins can view their own rate limits
CREATE POLICY "Admins view own rate limits"
ON public.admin_api_rate_limits FOR SELECT TO authenticated
USING (auth.uid() = admin_id);

-- System can insert/update rate limits
CREATE POLICY "System manages rate limits"
ON public.admin_api_rate_limits FOR ALL
USING (true);

-- Function to check admin rate limit (100 requests per 5 minutes per endpoint)
CREATE OR REPLACE FUNCTION check_admin_rate_limit(
  p_admin_id uuid,
  p_endpoint text,
  p_max_requests integer DEFAULT 100,
  p_window_minutes integer DEFAULT 5
) RETURNS boolean AS $$
DECLARE
  v_count integer;
  v_window_start timestamptz;
BEGIN
  v_window_start := date_trunc('minute', now()) - (extract(minute from now())::integer % p_window_minutes || ' minutes')::interval;
  
  -- Get current count for this window
  SELECT request_count INTO v_count
  FROM admin_api_rate_limits
  WHERE admin_id = p_admin_id
    AND endpoint = p_endpoint
    AND window_start = v_window_start;
  
  IF v_count IS NULL THEN
    -- First request in this window
    INSERT INTO admin_api_rate_limits (admin_id, endpoint, request_count, window_start)
    VALUES (p_admin_id, p_endpoint, 1, v_window_start);
    RETURN true;
  ELSIF v_count < p_max_requests THEN
    -- Increment counter
    UPDATE admin_api_rate_limits
    SET request_count = request_count + 1
    WHERE admin_id = p_admin_id
      AND endpoint = p_endpoint
      AND window_start = v_window_start;
    RETURN true;
  ELSE
    -- Rate limit exceeded
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;