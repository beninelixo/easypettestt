-- ============================================
-- CORREÇÕES DE SEGURANÇA AUTOMÁTICAS
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================

-- 1. CRÍTICO: Adicionar políticas RLS para settings_passwords
-- Isso corrige o erro "new row violates row-level security policy"

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS settings_passwords_owner_policy ON public.settings_passwords;
DROP POLICY IF EXISTS settings_passwords_admin_policy ON public.settings_passwords;

-- Política 1: Donos de pet shops podem gerenciar suas próprias senhas
CREATE POLICY settings_passwords_owner_policy 
ON public.settings_passwords 
FOR ALL 
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

-- Política 2: Admins podem gerenciar todas as senhas
CREATE POLICY settings_passwords_admin_policy 
ON public.settings_passwords 
FOR ALL 
TO authenticated 
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) 
  OR public.is_god_user(auth.uid())
);

-- 2. AVISO: Corrigir funções SECURITY DEFINER sem search_path fixo
-- Isso previne ataques de hijacking de search_path

ALTER FUNCTION public.cleanup_expired_mfa_sessions() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_blocks() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_reset_codes() SET search_path = public;
ALTER FUNCTION public.cleanup_old_logs() SET search_path = public;
ALTER FUNCTION public.cleanup_expired_invites() SET search_path = public;
ALTER FUNCTION public.cleanup_old_login_attempts() SET search_path = public;
ALTER FUNCTION public.resolve_old_alerts() SET search_path = public;

-- 3. AVISO: Mover extensão pg_net do schema public para extensions
-- Melhora a organização e segurança do banco

ALTER EXTENSION pg_net SET SCHEMA extensions;

-- ============================================
-- VERIFICAÇÃO
-- Execute estas queries para confirmar as correções
-- ============================================

-- Verificar políticas RLS criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'settings_passwords';

-- Verificar search_path das funções
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN (
  'cleanup_expired_mfa_sessions',
  'cleanup_expired_blocks', 
  'cleanup_expired_reset_codes',
  'cleanup_old_logs',
  'cleanup_expired_invites',
  'cleanup_old_login_attempts',
  'resolve_old_alerts'
);

-- Verificar schema da extensão pg_net
SELECT nspname 
FROM pg_extension e 
JOIN pg_namespace n ON e.extnamespace = n.oid 
WHERE extname = 'pg_net';
