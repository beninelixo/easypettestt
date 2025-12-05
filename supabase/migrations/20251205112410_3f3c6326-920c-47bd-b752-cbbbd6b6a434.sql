-- Fix: Site Images Table Leaks Admin User IDs
-- Restrict access to authenticated users only instead of public

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view site images basic info" ON public.site_images;

-- Create a new policy that only allows authenticated users to view site images
CREATE POLICY "Only authenticated can view site images"
ON public.site_images 
FOR SELECT 
TO authenticated 
USING (true);

-- Note: Admins already have full access through existing admin policies