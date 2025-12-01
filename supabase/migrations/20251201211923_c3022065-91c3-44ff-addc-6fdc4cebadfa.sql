-- ============================================
-- Fix RLS Policies for settings_passwords table
-- ============================================

-- Drop any existing policies (if they exist)
DROP POLICY IF EXISTS "settings_passwords_owner_select" ON public.settings_passwords;
DROP POLICY IF EXISTS "settings_passwords_owner_insert" ON public.settings_passwords;
DROP POLICY IF EXISTS "settings_passwords_owner_update" ON public.settings_passwords;
DROP POLICY IF EXISTS "settings_passwords_owner_delete" ON public.settings_passwords;
DROP POLICY IF EXISTS "settings_passwords_admin_all" ON public.settings_passwords;

-- Policy 1: Pet shop owners can SELECT their own settings passwords
CREATE POLICY "settings_passwords_owner_select" 
ON public.settings_passwords 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.pet_shops 
    WHERE pet_shops.id = settings_passwords.pet_shop_id 
    AND pet_shops.owner_id = auth.uid()
  )
);

-- Policy 2: Pet shop owners can INSERT settings passwords for their pet shops
CREATE POLICY "settings_passwords_owner_insert" 
ON public.settings_passwords 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pet_shops 
    WHERE pet_shops.id = settings_passwords.pet_shop_id 
    AND pet_shops.owner_id = auth.uid()
  )
);

-- Policy 3: Pet shop owners can UPDATE their own settings passwords
CREATE POLICY "settings_passwords_owner_update" 
ON public.settings_passwords 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.pet_shops 
    WHERE pet_shops.id = settings_passwords.pet_shop_id 
    AND pet_shops.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pet_shops 
    WHERE pet_shops.id = settings_passwords.pet_shop_id 
    AND pet_shops.owner_id = auth.uid()
  )
);

-- Policy 4: Pet shop owners can DELETE their own settings passwords
CREATE POLICY "settings_passwords_owner_delete" 
ON public.settings_passwords 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.pet_shops 
    WHERE pet_shops.id = settings_passwords.pet_shop_id 
    AND pet_shops.owner_id = auth.uid()
  )
);

-- Policy 5: Admins and God users can manage ALL settings passwords
CREATE POLICY "settings_passwords_admin_all" 
ON public.settings_passwords 
FOR ALL 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) 
  OR public.is_god_user(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) 
  OR public.is_god_user(auth.uid())
);