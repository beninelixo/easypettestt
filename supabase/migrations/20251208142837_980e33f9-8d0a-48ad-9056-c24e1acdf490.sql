-- Fix SECURITY DEFINER views - change to SECURITY INVOKER
-- This ensures the VIEWs respect RLS policies of the querying user

ALTER VIEW public.profiles_limited_view SET (security_invoker = on);
ALTER VIEW public.pets_basic_view SET (security_invoker = on);
ALTER VIEW public.pet_shops_public_view SET (security_invoker = on);
ALTER VIEW public.products_catalog_view SET (security_invoker = on);