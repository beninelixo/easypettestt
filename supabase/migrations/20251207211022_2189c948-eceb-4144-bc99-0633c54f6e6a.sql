-- Fix SECURITY DEFINER view issue by dropping and recreating as SECURITY INVOKER
DROP VIEW IF EXISTS public.public_site_images;

-- Recreate as a simple view (SECURITY INVOKER is the default)
-- Since this is for anon access to public marketing images, we need a different approach
-- Instead, let's grant anon SELECT on the table but create a RLS policy that excludes sensitive columns

-- First, add back anon SELECT policy but restrict to safe columns conceptually
-- Since RLS can't filter columns, we'll use the view approach correctly

-- Create the view explicitly with SECURITY INVOKER (default but being explicit)
CREATE VIEW public.public_site_images 
WITH (security_invoker = true)
AS
SELECT 
    id,
    key,
    url,
    alt_text,
    category,
    created_at,
    updated_at
FROM public.site_images;

-- Grant anon access to view
GRANT SELECT ON public.public_site_images TO anon;
GRANT SELECT ON public.public_site_images TO authenticated;