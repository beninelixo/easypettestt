-- Correções de segurança: adicionar search_path em funções SECURITY DEFINER
-- Usando cast para app_role

-- Recriar função has_role com search_path explícito e cast correto
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role::public.app_role
  )
$$;

-- Recriar função is_god_user com search_path explícito
CREATE OR REPLACE FUNCTION public.is_god_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'beninelixo@gmail.com'
  )
$$;

-- Recriar função has_role_safe com search_path explícito e cast correto
CREATE OR REPLACE FUNCTION public.has_role_safe(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role::public.app_role
  )
$$;

-- Recriar função is_god_user_safe com search_path explícito
CREATE OR REPLACE FUNCTION public.is_god_user_safe()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'beninelixo@gmail.com'
  )
$$;