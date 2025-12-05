-- =====================================================
-- FIX ERROR-LEVEL SECURITY ISSUES
-- =====================================================

-- 1. FIX: Admin Phone Numbers Could Be Harvested
-- Remove policy that lets all admins view all other admins' WhatsApp numbers
DROP POLICY IF EXISTS "Super admins view all preferences" ON public.admin_notification_preferences;

-- Keep only the self-management policy (already exists: "Admins manage own notification preferences")
-- No action needed as it already restricts to auth.uid() = admin_id

-- 2. FIX: Customer Personal Information - Restrict profile access
-- Drop overly permissive pet shop employee access
DROP POLICY IF EXISTS "Pet shops view client basic info" ON public.profiles;

-- Create restricted policy: Pet shops can only see profiles of clients with ACTIVE appointments
CREATE POLICY "Pet shops view active client info"
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (
  -- User can view their own profile
  auth.uid() = id 
  OR 
  -- Pet shop staff can view clients with appointments in the last 90 days
  EXISTS (
    SELECT 1 FROM appointments a
    JOIN pet_shops ps ON ps.id = a.pet_shop_id
    WHERE a.client_id = profiles.id 
      AND a.scheduled_date >= CURRENT_DATE - INTERVAL '90 days'
      AND (ps.owner_id = auth.uid() OR public.is_employee_of_petshop(auth.uid(), ps.id))
  )
  -- Admins retain full access
  OR public.has_role(auth.uid(), 'admin')
  OR public.is_god_user(auth.uid())
);

-- 3. FIX: Pet Medical Records - Restrict pet data access to recent appointments
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Pet shops can view their clients' pets" ON public.pets;

-- Create time-restricted policy for pet shops
CREATE POLICY "Pet shops view pets with recent appointments"
ON public.pets 
FOR SELECT 
TO authenticated 
USING (
  -- Owner can always see their own pets
  auth.uid() = owner_id 
  OR 
  -- Pet shops can only see pets with appointments in the last 90 days
  EXISTS (
    SELECT 1 FROM appointments a
    JOIN pet_shops ps ON ps.id = a.pet_shop_id
    WHERE a.pet_id = pets.id 
      AND a.scheduled_date >= CURRENT_DATE - INTERVAL '90 days'
      AND (ps.owner_id = auth.uid() OR public.is_employee_of_petshop(auth.uid(), ps.id))
  )
  -- Admins retain full access
  OR public.has_role(auth.uid(), 'admin')
  OR public.is_god_user(auth.uid())
);

-- 4. FIX: Customer Payment Information - Restrict to recent payments only
DROP POLICY IF EXISTS "Only authorized users can view payments" ON public.payments;

-- Create time-restricted policy for payment viewing
CREATE POLICY "View recent payments only"
ON public.payments 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM appointments a
    JOIN pet_shops ps ON ps.id = a.pet_shop_id
    WHERE a.id = payments.appointment_id 
      AND (
        -- Client can see their own payments (no time limit)
        a.client_id = auth.uid()
        OR 
        -- Pet shop staff can only see payments from last 90 days
        (
          (ps.owner_id = auth.uid() OR public.is_employee_of_petshop(auth.uid(), ps.id))
          AND a.scheduled_date >= CURRENT_DATE - INTERVAL '90 days'
        )
      )
  )
  -- Admins retain full access
  OR public.has_role(auth.uid(), 'admin')
  OR public.is_god_user(auth.uid())
);

-- 5. FIX: Notification Logs - Ensure restricted access
-- Current policy already restricts to admins and own notifications
-- Add explicit restriction to prevent broad access
DROP POLICY IF EXISTS "Users can view their own notification logs" ON public.notifications_log;

-- Recreate with tighter restrictions
CREATE POLICY "Users view own notification logs"
ON public.notifications_log 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.id = notifications_log.notification_id 
      AND n.client_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
  OR public.is_god_user(auth.uid())
);