-- =====================================================
-- SECURITY FIX: Consolidate site_images RLS policies
-- =====================================================

-- Drop redundant SELECT policies (keep only one secure policy)
DROP POLICY IF EXISTS "Public can view site images securely" ON public.site_images;
DROP POLICY IF EXISTS "Authenticated can view site images" ON public.site_images;
DROP POLICY IF EXISTS "Authenticated view site images" ON public.site_images;
DROP POLICY IF EXISTS "Only authenticated can view site images" ON public.site_images;

-- Create single consolidated policy - authenticated only (no anon)
-- This prevents exposure of updated_by admin IDs to anonymous users
CREATE POLICY "Authenticated users can view site images"
ON public.site_images
FOR SELECT
TO authenticated
USING (true);

-- Anon users can still view via a secure view that excludes updated_by
-- Create a secure view for public/anonymous access
CREATE OR REPLACE VIEW public.public_site_images AS
SELECT 
    id,
    key,
    url,
    alt_text,
    category,
    created_at,
    updated_at
    -- Deliberately excludes updated_by to prevent admin ID exposure
FROM public.site_images;

-- Grant anon access to the view only
GRANT SELECT ON public.public_site_images TO anon;

-- =====================================================
-- SECURITY FIX: Restrict commissions visibility
-- =====================================================

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Only authorized staff can view commissions" ON public.commissions;

-- Create more restrictive policy:
-- - Pet shop owners see all commissions for their shop
-- - Employees see ONLY their own commissions
-- - Admins see everything
CREATE POLICY "Restricted commission visibility"
ON public.commissions
FOR SELECT
TO authenticated
USING (
    -- Pet shop owner can see all commissions for their shop
    EXISTS (
        SELECT 1 FROM pet_shops 
        WHERE pet_shops.id = commissions.pet_shop_id 
        AND pet_shops.owner_id = auth.uid()
    )
    -- Employee can only see their OWN commissions
    OR commissions.employee_id = auth.uid()
    -- Admins and god users have full access
    OR has_role(auth.uid(), 'admin')
    OR is_god_user(auth.uid())
);