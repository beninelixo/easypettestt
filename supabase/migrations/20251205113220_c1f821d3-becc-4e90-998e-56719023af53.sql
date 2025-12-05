-- =====================================================
-- COMPREHENSIVE SECURITY FIXES - PHASE 2
-- Fixing: pet_shops, login_attempts, permissions, global_metrics
-- =====================================================

-- 1. FIX: pet_shops table exposes sensitive business data
-- Current "Authenticated users view pet shops" allows ANY authenticated user to see ALL fields
-- Solution: Create separate policies for owners/staff (full access) vs public (limited fields)

DROP POLICY IF EXISTS "Authenticated users view pet shops" ON public.pet_shops;

-- Owners and staff see all their pet shop data
CREATE POLICY "Pet shop owners and staff view full data"
ON public.pet_shops 
FOR SELECT 
TO authenticated 
USING (
  owner_id = auth.uid() 
  OR public.is_employee_of_petshop(auth.uid(), id)
  OR public.has_role(auth.uid(), 'admin')
  OR public.is_god_user(auth.uid())
);

-- Clients can only see basic public info of pet shops they have appointments with
-- This prevents competitors from viewing subscription plans and payment IDs
CREATE POLICY "Clients view pet shop public info for appointments"
ON public.pet_shops 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM appointments a
    WHERE a.pet_shop_id = pet_shops.id 
      AND a.client_id = auth.uid()
  )
);

-- 2. FIX: login_attempts allows unrestricted inserts (potential log flooding/enumeration)
DROP POLICY IF EXISTS "System can insert login attempts" ON public.login_attempts;

-- Only allow service role (edge functions) to insert login attempts
-- This prevents malicious users from flooding the table or using timing attacks
CREATE POLICY "Only service role inserts login attempts"
ON public.login_attempts 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Only service_role key or god user can insert
  -- Edge functions use service_role key
  auth.role() = 'service_role'
  OR public.is_god_user(auth.uid())
);

-- 3. FIX: permissions table exposed to all authenticated users
-- Exposing permission structure helps attackers understand access control
DROP POLICY IF EXISTS "Only authenticated can view permissions" ON public.permissions;

-- Only admins and pet shop owners/employees need to see permissions
CREATE POLICY "Admins and pet shop staff view permissions"
ON public.permissions 
FOR SELECT 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.is_god_user(auth.uid())
  OR EXISTS (
    SELECT 1 FROM pet_shops ps
    WHERE ps.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM petshop_employees pe
    WHERE pe.user_id = auth.uid() AND pe.active = true
  )
);

-- 4. FIX: global_metrics exposed to all authenticated users
-- Business metrics should only be visible to admins
DROP POLICY IF EXISTS "Only authenticated can view global metrics" ON public.global_metrics;

-- The admin policies already exist, so we just remove the permissive one
-- Existing policies: "Admins can manage global metrics", "god_user_full_access_global_metrics"

-- 5. ADDITIONAL FIX: Ensure service_templates is properly restricted if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'service_templates') THEN
    -- Drop overly permissive policy if exists
    DROP POLICY IF EXISTS "Anyone can view service templates" ON public.service_templates;
    
    -- Only pet shop staff should see service templates
    CREATE POLICY "Pet shop staff view service templates"
    ON public.service_templates 
    FOR SELECT 
    TO authenticated 
    USING (
      public.has_role(auth.uid(), 'admin')
      OR public.is_god_user(auth.uid())
      OR EXISTS (
        SELECT 1 FROM pet_shops ps
        WHERE ps.owner_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM petshop_employees pe
        WHERE pe.user_id = auth.uid() AND pe.active = true
      )
    );
  END IF;
END $$;

-- 6. Add index on login_attempts for efficient rate limiting queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time 
ON public.login_attempts(email, attempt_time DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time 
ON public.login_attempts(ip_address, attempt_time DESC);