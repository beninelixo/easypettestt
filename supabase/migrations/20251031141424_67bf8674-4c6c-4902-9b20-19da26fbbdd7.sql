-- Fix Function Search Path Mutable warning
-- Add search_path to get_current_tenant() function

CREATE OR REPLACE FUNCTION public.get_current_tenant()
RETURNS UUID
LANGUAGE SQL
STABLE
SET search_path = 'public'
AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
$$;