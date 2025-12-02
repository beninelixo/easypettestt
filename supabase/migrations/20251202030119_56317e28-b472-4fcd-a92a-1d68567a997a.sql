-- Add RLS policies for admin user management access

-- Ensure admins can read all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'super_admin'::app_role) OR 
  public.is_god_user()
);

-- Ensure admins can update all profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'super_admin'::app_role) OR 
  public.is_god_user()
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'super_admin'::app_role) OR 
  public.is_god_user()
);

-- Ensure admins can read all user_roles
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role_safe(auth.uid(), 'admin') OR 
  public.has_role_safe(auth.uid(), 'super_admin') OR 
  public.is_god_user_safe() OR
  user_id = auth.uid()
);

-- Ensure admins can modify user_roles
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  public.has_role_safe(auth.uid(), 'admin') OR 
  public.has_role_safe(auth.uid(), 'super_admin') OR 
  public.is_god_user_safe()
)
WITH CHECK (
  public.has_role_safe(auth.uid(), 'admin') OR 
  public.has_role_safe(auth.uid(), 'super_admin') OR 
  public.is_god_user_safe()
);

-- Ensure admins can read all pet_shops
DROP POLICY IF EXISTS "Admins can view all pet shops" ON public.pet_shops;
CREATE POLICY "Admins can view all pet shops"
ON public.pet_shops
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'super_admin'::app_role) OR 
  public.is_god_user() OR
  owner_id = auth.uid()
);

-- Ensure admins can update all pet_shops (for plan management)
DROP POLICY IF EXISTS "Admins can update all pet shops" ON public.pet_shops;
CREATE POLICY "Admins can update all pet shops"
ON public.pet_shops
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'super_admin'::app_role) OR 
  public.is_god_user() OR
  owner_id = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'super_admin'::app_role) OR 
  public.is_god_user() OR
  owner_id = auth.uid()
);

-- Ensure admins can read admin_invites
DROP POLICY IF EXISTS "Admins can view admin invites" ON public.admin_invites;
CREATE POLICY "Admins can view admin invites"
ON public.admin_invites
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'super_admin'::app_role) OR 
  public.is_god_user()
);

-- Ensure admins can read role_changes_audit
DROP POLICY IF EXISTS "Admins can view role changes audit" ON public.role_changes_audit;
CREATE POLICY "Admins can view role changes audit"
ON public.role_changes_audit
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'super_admin'::app_role) OR 
  public.is_god_user()
);