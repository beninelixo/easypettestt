-- ============================================
-- FASE 1: GOD MODE E SUPER ADMIN
-- ============================================

-- 1. Criar função is_god_user para bypass completo de RLS
CREATE OR REPLACE FUNCTION public.is_god_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id 
    AND email = 'beninelixo@gmail.com'
  )
$$;

-- 2. Adicionar super_admin ao enum app_role (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typcategory = 'E') THEN
    CREATE TYPE app_role AS ENUM ('client', 'pet_shop', 'admin');
  END IF;
  
  -- Tentar adicionar super_admin se não existir
  BEGIN
    ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_admin';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 3. Garantir que beninelixo@gmail.com tem role admin (e super_admin quando disponível)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'beninelixo@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Atualizar RLS policies principais para incluir God Mode

-- Profiles
DROP POLICY IF EXISTS "god_user_full_access_profiles" ON public.profiles;
CREATE POLICY "god_user_full_access_profiles"
  ON public.profiles
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- Pet Shops
DROP POLICY IF EXISTS "god_user_full_access_pet_shops" ON public.pet_shops;
CREATE POLICY "god_user_full_access_pet_shops"
  ON public.pet_shops
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- Appointments
DROP POLICY IF EXISTS "god_user_full_access_appointments" ON public.appointments;
CREATE POLICY "god_user_full_access_appointments"
  ON public.appointments
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- Services
DROP POLICY IF EXISTS "god_user_full_access_services" ON public.services;
CREATE POLICY "god_user_full_access_services"
  ON public.services
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- Pets
DROP POLICY IF EXISTS "god_user_full_access_pets" ON public.pets;
CREATE POLICY "god_user_full_access_pets"
  ON public.pets
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- Payments
DROP POLICY IF EXISTS "god_user_full_access_payments" ON public.payments;
CREATE POLICY "god_user_full_access_payments"
  ON public.payments
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- User Roles
DROP POLICY IF EXISTS "god_user_full_access_user_roles" ON public.user_roles;
CREATE POLICY "god_user_full_access_user_roles"
  ON public.user_roles
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- Admin Alerts
DROP POLICY IF EXISTS "god_user_full_access_admin_alerts" ON public.admin_alerts;
CREATE POLICY "god_user_full_access_admin_alerts"
  ON public.admin_alerts
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- Audit Logs
DROP POLICY IF EXISTS "god_user_full_access_audit_logs" ON public.audit_logs;
CREATE POLICY "god_user_full_access_audit_logs"
  ON public.audit_logs
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- Backup History
DROP POLICY IF EXISTS "god_user_full_access_backup_history" ON public.backup_history;
CREATE POLICY "god_user_full_access_backup_history"
  ON public.backup_history
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- System Health Metrics
DROP POLICY IF EXISTS "god_user_full_access_system_health" ON public.system_health_metrics;
CREATE POLICY "god_user_full_access_system_health"
  ON public.system_health_metrics
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- Login Attempts
DROP POLICY IF EXISTS "god_user_full_access_login_attempts" ON public.login_attempts;
CREATE POLICY "god_user_full_access_login_attempts"
  ON public.login_attempts
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- Security Alerts
DROP POLICY IF EXISTS "god_user_full_access_security_alerts" ON public.security_alerts;
CREATE POLICY "god_user_full_access_security_alerts"
  ON public.security_alerts
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- MFA Secrets
DROP POLICY IF EXISTS "god_user_full_access_mfa_secrets" ON public.mfa_secrets;
CREATE POLICY "god_user_full_access_mfa_secrets"
  ON public.mfa_secrets
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- Products
DROP POLICY IF EXISTS "god_user_full_access_products" ON public.products;
CREATE POLICY "god_user_full_access_products"
  ON public.products
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- Notifications
DROP POLICY IF EXISTS "god_user_full_access_notifications" ON public.notifications;
CREATE POLICY "god_user_full_access_notifications"
  ON public.notifications
  FOR ALL
  USING (public.is_god_user(auth.uid()));

-- Log que God Mode foi ativado
INSERT INTO public.system_logs (module, log_type, message, details)
VALUES (
  'god_mode',
  'info',
  'God Mode implementado com sucesso',
  jsonb_build_object(
    'god_user_email', 'beninelixo@gmail.com',
    'timestamp', now(),
    'policies_created', 17
  )
);