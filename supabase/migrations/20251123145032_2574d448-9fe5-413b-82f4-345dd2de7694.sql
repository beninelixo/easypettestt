-- Fix admin permissions for user management - with proper drops

-- Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Pet shops can view client basic info" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;
DROP POLICY IF EXISTS "View own profile simple" ON public.profiles;
DROP POLICY IF EXISTS "Pet shop staff can view full shop details" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Pet shops view client basic info" ON public.profiles;

-- Add comprehensive admin policies for profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR is_god_user(auth.uid())
);

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR is_god_user(auth.uid())
)
WITH CHECK (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR is_god_user(auth.uid())
);

CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR is_god_user(auth.uid())
);

-- Add policy for pet shops to view client info
CREATE POLICY "Pet shops view client basic info"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM appointments a
    JOIN pet_shops ps ON ps.id = a.pet_shop_id
    WHERE a.client_id = profiles.id
      AND (ps.owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), ps.id))
  )
);

-- Drop and recreate user_roles policies
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users and admins can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Users and admins can view roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR is_god_user(auth.uid())
);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR is_god_user(auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR is_god_user(auth.uid())
);

-- Drop and recreate petshop_employees policies
DROP POLICY IF EXISTS "Pet shop owners can manage employees" ON public.petshop_employees;
DROP POLICY IF EXISTS "Admins and owners can view employees" ON public.petshop_employees;
DROP POLICY IF EXISTS "Admins and owners can manage employees" ON public.petshop_employees;
DROP POLICY IF EXISTS "Pet shop owners and employees can view employees" ON public.petshop_employees;

CREATE POLICY "Admins and owners can view employees"
ON public.petshop_employees
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM pet_shops
    WHERE pet_shops.id = petshop_employees.pet_shop_id
      AND (pet_shops.owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), pet_shops.id))
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR is_god_user(auth.uid())
);

CREATE POLICY "Admins and owners can manage employees"
ON public.petshop_employees
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM pet_shops
    WHERE pet_shops.id = petshop_employees.pet_shop_id
      AND pet_shops.owner_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR is_god_user(auth.uid())
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pet_shops
    WHERE pet_shops.id = petshop_employees.pet_shop_id
      AND pet_shops.owner_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR is_god_user(auth.uid())
);