-- Remove role 'client' from all admin users to eliminate conflicts
DELETE FROM public.user_roles 
WHERE role = 'client' 
AND user_id IN (
  SELECT DISTINCT user_id FROM public.user_roles 
  WHERE role IN ('admin', 'super_admin')
);

-- Ensure God User has only admin roles (super_admin, admin, pet_shop - NO client)
DELETE FROM public.user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'beninelixo@gmail.com' LIMIT 1)
AND role = 'client';