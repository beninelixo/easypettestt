-- Grant SELECT permission on site_images to anonymous users (visitors)
GRANT SELECT ON public.site_images TO anon;

-- Also ensure authenticated users can read
GRANT SELECT ON public.site_images TO authenticated;