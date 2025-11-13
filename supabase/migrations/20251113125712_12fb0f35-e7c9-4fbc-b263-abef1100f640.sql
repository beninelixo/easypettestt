-- CRITICAL FIX: Infinite Recursion in user_roles RLS Policies
-- Problem: The existing policy queries user_roles table within the policy itself, causing infinite loop
-- Solution: Use the existing has_role() SECURITY DEFINER function which bypasses RLS

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;

-- Recreate policies using the SECURITY DEFINER function (bypasses RLS, prevents recursion)
CREATE POLICY "Users can view their own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- CRITICAL FIX: auth_events_log INSERT Policy Missing
-- Problem: useAuth.tsx tries to insert auth events but there's no INSERT policy
-- Solution: Add policies to allow authenticated users and service role to insert auth events

CREATE POLICY "Users can log their own auth events"
  ON auth_events_log
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Service role can log all auth events"
  ON auth_events_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow system to update auth event metadata
CREATE POLICY "System can update auth events"
  ON auth_events_log
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);