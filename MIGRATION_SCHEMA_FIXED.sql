-- ============================================
-- EASYPET - MIGRATION SCHEMA FIXED
-- Versão: 2.0 - Corrigida
-- Data: 2024-12-01
-- ============================================
-- Este script foi corrigido para:
-- 1. Evitar recursão infinita em políticas RLS
-- 2. Não criar triggers em auth.users (fazer manualmente)
-- 3. Tratar conflitos em storage buckets
-- 4. Corrigir casting de JSONB
-- 5. Usar funções SECURITY DEFINER para bypass RLS
-- ============================================

-- ============================================
-- PARTE 1: EXTENSÕES
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;

-- ============================================
-- PARTE 2: TIPOS ENUM
-- ============================================

DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('client', 'pet_shop', 'admin', 'professional', 'petshop_owner', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE app_module AS ENUM ('dashboard', 'appointments', 'clients', 'pets', 'services', 'products', 'inventory', 'financial', 'reports', 'marketing', 'settings', 'employees');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE app_action AS ENUM ('view', 'create', 'edit', 'delete', 'manage');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- PARTE 3: FUNÇÕES DE SEGURANÇA (PRIMEIRO!)
-- Estas funções usam SECURITY DEFINER para 
-- evitar recursão infinita nas políticas RLS
-- ============================================

-- Função para verificar se é God User (NÃO depende de outras tabelas públicas)
CREATE OR REPLACE FUNCTION public.is_god_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
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

-- Função segura para verificar role (SECURITY DEFINER evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Função para verificar se usuário está bloqueado
CREATE OR REPLACE FUNCTION public.is_user_blocked(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_blocked FROM public.profiles WHERE id = _user_id),
    FALSE
  )
$$;

-- Função para verificar se é funcionário do petshop
CREATE OR REPLACE FUNCTION public.is_employee_of_petshop(_user_id uuid, _pet_shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.petshop_employees
    WHERE user_id = _user_id
      AND pet_shop_id = _pet_shop_id
      AND active = true
  )
$$;

-- Função para verificar se é dono do petshop
CREATE OR REPLACE FUNCTION public.is_pet_shop_owner(_user_id uuid, _pet_shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pet_shops
    WHERE id = _pet_shop_id AND owner_id = _user_id
  )
$$;

-- Função para verificar acesso ao tenant
CREATE OR REPLACE FUNCTION public.has_tenant_access(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_hierarchy
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND active = true
  )
$$;

-- Função para verificar admin de tenant
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_hierarchy
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND role = 'tenant_admin'
      AND active = true
  )
$$;

-- Função para verificar dono de franquia
CREATE OR REPLACE FUNCTION public.is_franchise_owner(_user_id uuid, _franchise_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_hierarchy
    WHERE user_id = _user_id
      AND franchise_id = _franchise_id
      AND role = 'franchise_owner'
      AND active = true
  )
$$;

-- Função para verificar IP bloqueado
CREATE OR REPLACE FUNCTION public.is_ip_blocked(_ip_address text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_ips
    WHERE ip_address = _ip_address
      AND blocked_until > NOW()
  )
$$;

-- ============================================
-- PARTE 4: TABELAS CORE
-- ============================================

-- Profiles (usuários)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  avatar_url text,
  user_code text UNIQUE,
  address text,
  document text,
  contact_preference text DEFAULT 'whatsapp',
  is_blocked boolean DEFAULT false,
  blocked_at timestamptz,
  blocked_by uuid,
  blocked_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'client',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Tenants (multi-tenancy)
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  primary_color text DEFAULT '#3B82F6',
  subscription_plan text DEFAULT 'starter',
  active boolean DEFAULT true,
  settings jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Franchises
CREATE TABLE IF NOT EXISTS public.franchises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  cnpj text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  active boolean DEFAULT true,
  contract_start_date date,
  contract_end_date date,
  royalty_percentage numeric DEFAULT 5.00,
  settings jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Pet Shops
CREATE TABLE IF NOT EXISTS public.pet_shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  address text,
  city text,
  state text,
  phone text,
  email text,
  logo_url text,
  description text,
  hours text,
  latitude numeric,
  longitude numeric,
  subscription_plan text DEFAULT 'gratuito',
  subscription_expires_at timestamptz,
  cakto_customer_id text,
  cakto_subscription_id text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Pets
CREATE TABLE IF NOT EXISTS public.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  species text DEFAULT 'dog',
  breed text,
  gender text,
  birth_date date,
  age integer,
  weight numeric,
  size text,
  coat_type text,
  coat_color text,
  neutered boolean DEFAULT false,
  allergies text,
  chronic_diseases text,
  temperament text,
  restrictions text,
  grooming_preferences text,
  observations text,
  photo_url text,
  vaccination_history jsonb DEFAULT '[]',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id uuid NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  active boolean DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id),
  service_id uuid NOT NULL REFERENCES public.services(id),
  pet_shop_id uuid NOT NULL REFERENCES public.pet_shops(id),
  client_id uuid NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  completed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  installments integer DEFAULT 1,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id uuid NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  sku text,
  barcode text,
  cost_price numeric NOT NULL,
  sale_price numeric NOT NULL,
  stock_quantity integer DEFAULT 0,
  min_stock_quantity integer DEFAULT 5,
  expiry_date date,
  active boolean DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stock Movements
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type text NOT NULL,
  quantity integer NOT NULL,
  reason text,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- PetShop Employees
CREATE TABLE IF NOT EXISTS public.petshop_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id uuid NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  position text,
  active boolean DEFAULT true,
  hired_at date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(pet_shop_id, user_id)
);

-- Permissions
CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  module app_module NOT NULL,
  action app_action NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Employee Permissions
CREATE TABLE IF NOT EXISTS public.employee_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.petshop_employees(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_by uuid NOT NULL,
  granted_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, permission_id)
);

-- ============================================
-- PARTE 5: TABELAS DE SEGURANÇA
-- ============================================

-- Login Attempts
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  user_agent text,
  success boolean DEFAULT false,
  attempt_time timestamptz NOT NULL DEFAULT now()
);

-- Blocked IPs
CREATE TABLE IF NOT EXISTS public.blocked_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL UNIQUE,
  reason text NOT NULL,
  blocked_at timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz NOT NULL,
  blocked_by uuid,
  auto_blocked boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Security Alerts
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL,
  description text NOT NULL,
  ip_address text,
  user_id uuid,
  metadata jsonb DEFAULT '{}',
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Security Notifications
CREATE TABLE IF NOT EXISTS public.security_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type text NOT NULL,
  severity text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- MFA Secrets
CREATE TABLE IF NOT EXISTS public.mfa_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  secret_key text NOT NULL,
  enabled boolean DEFAULT false,
  verified_at timestamptz,
  backup_codes_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- MFA Backup Codes
CREATE TABLE IF NOT EXISTS public.mfa_backup_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code_hash text NOT NULL,
  used boolean DEFAULT false,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- MFA Sessions
CREATE TABLE IF NOT EXISTS public.mfa_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text NOT NULL,
  verified_at timestamptz,
  expires_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Password Resets
CREATE TABLE IF NOT EXISTS public.password_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- IP Whitelist
CREATE TABLE IF NOT EXISTS public.ip_whitelist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL UNIQUE,
  description text,
  added_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- PARTE 6: TABELAS ADMIN
-- ============================================

-- Admin Alerts
CREATE TABLE IF NOT EXISTS public.admin_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  source_module text,
  source_function text,
  context jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  read_at timestamptz,
  read_by uuid,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now()
);

-- Admin Invites
CREATE TABLE IF NOT EXISTS public.admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  invited_by uuid NOT NULL,
  accepted boolean DEFAULT false,
  accepted_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Admin Notification Preferences
CREATE TABLE IF NOT EXISTS public.admin_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL UNIQUE,
  email_enabled boolean DEFAULT true,
  push_enabled boolean DEFAULT true,
  whatsapp_enabled boolean DEFAULT false,
  whatsapp_number text,
  security_alerts boolean DEFAULT true,
  system_health_alerts boolean DEFAULT true,
  backup_alerts boolean DEFAULT true,
  payment_alerts boolean DEFAULT true,
  user_activity_alerts boolean DEFAULT false,
  performance_alerts boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Admin API Rate Limits
CREATE TABLE IF NOT EXISTS public.admin_api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 0,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Impersonation Sessions
CREATE TABLE IF NOT EXISTS public.impersonation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  reason text,
  active boolean DEFAULT true,
  ip_address text,
  user_agent text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  table_name text NOT NULL,
  operation text NOT NULL,
  record_id uuid NOT NULL,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Auth Events Log
CREATE TABLE IF NOT EXISTS public.auth_events_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  event_status text NOT NULL,
  user_role text,
  role_source text,
  ip_address text,
  user_agent text,
  error_message text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Role Changes Audit
CREATE TABLE IF NOT EXISTS public.role_changes_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_user_id uuid NOT NULL,
  changed_by uuid NOT NULL,
  old_role app_role,
  new_role app_role NOT NULL,
  action text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Access Audit
CREATE TABLE IF NOT EXISTS public.access_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pet_shop_id uuid REFERENCES public.pet_shops(id),
  module app_module NOT NULL,
  action app_action NOT NULL,
  resource_id uuid,
  resource_type text,
  success boolean DEFAULT true,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- PARTE 7: TABELAS DE SISTEMA
-- ============================================

-- System Logs
CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  log_type text NOT NULL,
  message text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Structured Logs
CREATE TABLE IF NOT EXISTS public.structured_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL,
  module text NOT NULL,
  message text NOT NULL,
  context jsonb,
  user_id uuid,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- System Health Metrics
CREATE TABLE IF NOT EXISTS public.system_health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text,
  status text,
  threshold_warning numeric,
  threshold_critical numeric,
  metadata jsonb DEFAULT '{}',
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Daily Health Reports
CREATE TABLE IF NOT EXISTS public.daily_health_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL UNIQUE,
  overall_status text NOT NULL,
  score integer NOT NULL,
  metrics jsonb NOT NULL,
  issues_found jsonb DEFAULT '[]',
  actions_taken jsonb DEFAULT '[]',
  recommendations jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Monitoramento Sistema
CREATE TABLE IF NOT EXISTS public.monitoramento_sistema (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  metric_type text NOT NULL,
  value numeric NOT NULL,
  status text DEFAULT 'ok',
  threshold_warning numeric,
  threshold_critical numeric,
  metadata jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Global Metrics
CREATE TABLE IF NOT EXISTS public.global_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL UNIQUE,
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  description text,
  last_calculated_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Failed Jobs
CREATE TABLE IF NOT EXISTS public.failed_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  job_name text NOT NULL,
  payload jsonb NOT NULL,
  error_message text,
  error_stack text,
  attempt_count integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  status text DEFAULT 'pending',
  next_retry_at timestamptz,
  last_attempted_at timestamptz,
  completed_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Backup History
CREATE TABLE IF NOT EXISTS public.backup_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id text NOT NULL,
  backup_type text NOT NULL,
  status text NOT NULL,
  tables_backed_up jsonb NOT NULL,
  total_records integer DEFAULT 0,
  backup_size_bytes bigint,
  storage_path text,
  encryption_enabled boolean DEFAULT true,
  compression_enabled boolean DEFAULT true,
  triggered_by uuid,
  error_message text,
  metadata jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Backup Verifications
CREATE TABLE IF NOT EXISTS public.backup_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id uuid NOT NULL REFERENCES public.backup_history(id) ON DELETE CASCADE,
  verification_status text NOT NULL,
  tables_verified integer DEFAULT 0,
  records_verified integer DEFAULT 0,
  integrity_checks_passed integer DEFAULT 0,
  integrity_checks_failed integer DEFAULT 0,
  verification_results jsonb DEFAULT '{}',
  error_message text,
  verified_by uuid,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Professional Backups
CREATE TABLE IF NOT EXISTS public.professional_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id uuid NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  backup_type text NOT NULL,
  format text NOT NULL,
  status text DEFAULT 'pending',
  storage_path text,
  file_size_bytes bigint,
  date_range_start date,
  date_range_end date,
  error_message text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- PARTE 8: TABELAS DE NEGÓCIO
-- ============================================

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  appointment_id uuid REFERENCES public.appointments(id),
  notification_type text NOT NULL,
  channel text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pendente',
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Notifications Log
CREATE TABLE IF NOT EXISTS public.notifications_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES public.notifications(id),
  status text NOT NULL,
  channel text NOT NULL,
  recipient text NOT NULL,
  message text NOT NULL,
  attempt_count integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  last_error text,
  scheduled_for timestamptz DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Commissions
CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id uuid NOT NULL REFERENCES public.pet_shops(id),
  employee_id uuid NOT NULL,
  service_id uuid REFERENCES public.services(id),
  appointment_id uuid REFERENCES public.appointments(id),
  commission_type text NOT NULL,
  commission_value numeric NOT NULL,
  amount_earned numeric NOT NULL,
  paid boolean DEFAULT false,
  paid_at timestamptz,
  reference_month date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Loyalty Points
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  pet_shop_id uuid NOT NULL REFERENCES public.pet_shops(id),
  points integer DEFAULT 0,
  total_points_earned integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, pet_shop_id)
);

-- Loyalty Transactions
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_points_id uuid NOT NULL REFERENCES public.loyalty_points(id),
  transaction_type text NOT NULL,
  points integer NOT NULL,
  description text,
  appointment_id uuid REFERENCES public.appointments(id),
  created_at timestamptz DEFAULT now()
);

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id uuid NOT NULL REFERENCES public.pet_shops(id),
  name text NOT NULL,
  message text NOT NULL,
  target_audience text NOT NULL,
  channel text NOT NULL,
  status text DEFAULT 'rascunho',
  scheduled_for timestamptz,
  sent_at timestamptz,
  recipients_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Satisfaction Surveys
CREATE TABLE IF NOT EXISTS public.satisfaction_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id),
  client_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  would_recommend boolean,
  created_at timestamptz DEFAULT now()
);

-- Pet Photos
CREATE TABLE IF NOT EXISTS public.pet_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id),
  photo_url text NOT NULL,
  photo_type text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- WhatsApp Settings
CREATE TABLE IF NOT EXISTS public.whatsapp_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id uuid NOT NULL UNIQUE REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  business_phone text,
  auto_confirmation boolean DEFAULT true,
  auto_reminder boolean DEFAULT true,
  reminder_hours_before integer DEFAULT 24,
  welcome_message text DEFAULT 'Olá! Obrigado por escolher nosso petshop.',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Settings Passwords
CREATE TABLE IF NOT EXISTS public.settings_passwords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id uuid NOT NULL UNIQUE REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Plan Features
CREATE TABLE IF NOT EXISTS public.plan_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL,
  feature_key text NOT NULL,
  feature_value jsonb NOT NULL DEFAULT 'true',
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(plan_name, feature_key)
);

-- ============================================
-- PARTE 9: TABELAS MULTI-TENANT
-- ============================================

-- User Hierarchy
CREATE TABLE IF NOT EXISTS public.user_hierarchy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id),
  franchise_id uuid REFERENCES public.franchises(id),
  unit_id uuid REFERENCES public.pet_shops(id),
  role text NOT NULL,
  permissions text[] DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Brand Standards
CREATE TABLE IF NOT EXISTS public.brand_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  checklist_items jsonb DEFAULT '[]',
  required boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Compliance Audits
CREATE TABLE IF NOT EXISTS public.compliance_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.pet_shops(id),
  standard_id uuid NOT NULL REFERENCES public.brand_standards(id),
  auditor_id uuid NOT NULL,
  audit_date date NOT NULL,
  compliance_score numeric NOT NULL,
  status text DEFAULT 'pending',
  findings jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Success Stories
CREATE TABLE IF NOT EXISTS public.success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id uuid NOT NULL REFERENCES public.pet_shops(id),
  title text NOT NULL,
  description text NOT NULL,
  testimonial text,
  contact_name text NOT NULL,
  contact_role text,
  image_url text,
  revenue_growth_percent numeric,
  time_saved_hours numeric,
  approved boolean DEFAULT false,
  approved_at timestamptz,
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Push Subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth_key text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- SMS Verifications
CREATE TABLE IF NOT EXISTS public.sms_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Webhook Endpoints
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id uuid NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL,
  secret text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Webhook Logs
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id uuid NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  response_status integer,
  response_body text,
  success boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- PARTE 10: ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_code ON public.profiles(user_code);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_pet_shops_owner_id ON public.pet_shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_pet_shops_code ON public.pet_shops(code);
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON public.pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_services_pet_shop_id ON public.services(pet_shop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_pet_shop_id ON public.appointments(pet_shop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON public.payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_products_pet_shop_id ON public.products(pet_shop_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON public.login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON public.login_attempts(attempt_time);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip ON public.blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON public.security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created ON public.security_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_type ON public.admin_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_severity ON public.admin_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_type ON public.system_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON public.system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_structured_logs_level ON public.structured_logs(level);
CREATE INDEX IF NOT EXISTS idx_structured_logs_module ON public.structured_logs(module);
CREATE INDEX IF NOT EXISTS idx_petshop_employees_pet_shop ON public.petshop_employees(pet_shop_id);
CREATE INDEX IF NOT EXISTS idx_petshop_employees_user ON public.petshop_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_client ON public.notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);

-- ============================================
-- PARTE 11: FUNÇÕES UTILITÁRIAS
-- ============================================

-- Update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Generate pet shop code
CREATE OR REPLACE FUNCTION public.generate_pet_shop_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'PET-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.pet_shops WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Generate user code
CREATE OR REPLACE FUNCTION public.generate_user_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := '#' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Calculate pet age
CREATE OR REPLACE FUNCTION public.calculate_pet_age(birth_date date)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT EXTRACT(YEAR FROM AGE(birth_date))::INTEGER;
$$;

-- Calculate distance (Haversine)
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  radius DECIMAL := 6371;
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN radius * c;
END;
$$;

-- Has permission (using SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _pet_shop_id uuid, _module app_module, _action app_action)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM pet_shops WHERE id = _pet_shop_id AND owner_id = _user_id) THEN true
    WHEN has_role(_user_id, 'admin'::app_role) THEN true
    ELSE EXISTS (
      SELECT 1
      FROM petshop_employees pe
      JOIN employee_permissions ep ON ep.employee_id = pe.id
      JOIN permissions p ON p.id = ep.permission_id
      WHERE pe.user_id = _user_id
        AND pe.pet_shop_id = _pet_shop_id
        AND pe.active = true
        AND p.module = _module
        AND p.action = _action
    )
  END;
$$;

-- Check employee limit (FIXED: proper JSONB extraction)
CREATE OR REPLACE FUNCTION public.check_employee_limit(_pet_shop_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_plan TEXT;
  user_limit INTEGER;
  current_count INTEGER;
BEGIN
  SELECT subscription_plan INTO current_plan FROM pet_shops WHERE id = _pet_shop_id;
  
  SELECT (feature_value::text)::INTEGER INTO user_limit
  FROM plan_features
  WHERE plan_name = current_plan AND feature_key = 'multi_user_limit';
  
  IF user_limit IS NULL THEN user_limit := 1; END IF;
  
  SELECT COUNT(*) INTO current_count FROM petshop_employees
  WHERE pet_shop_id = _pet_shop_id AND active = true;
  
  RETURN current_count < user_limit;
END;
$$;

-- Get dashboard stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(_pet_shop_id uuid, _date date DEFAULT CURRENT_DATE)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'today_appointments', (SELECT COUNT(*) FROM appointments WHERE pet_shop_id = _pet_shop_id AND scheduled_date = _date),
    'monthly_revenue', (
      SELECT COALESCE(SUM(s.price), 0)
      FROM appointments a JOIN services s ON s.id = a.service_id
      WHERE a.pet_shop_id = _pet_shop_id AND a.status = 'completed'
        AND a.scheduled_date >= date_trunc('month', _date)::date
        AND a.scheduled_date < (date_trunc('month', _date) + interval '1 month')::date
    ),
    'active_clients', (SELECT COUNT(DISTINCT client_id) FROM appointments WHERE pet_shop_id = _pet_shop_id AND scheduled_date >= _date - interval '90 days'),
    'completed_services', (SELECT COUNT(*) FROM appointments WHERE pet_shop_id = _pet_shop_id AND status = 'completed')
  );
$$;

-- Get weekly appointments
CREATE OR REPLACE FUNCTION public.get_weekly_appointments(_pet_shop_id uuid)
RETURNS TABLE(day text, completed bigint, pending bigint, cancelled bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH days AS (
    SELECT generate_series(CURRENT_DATE - interval '6 days', CURRENT_DATE, '1 day'::interval)::date AS day_date
  ),
  day_names AS (
    SELECT day_date,
      CASE extract(dow from day_date)
        WHEN 0 THEN 'Dom' WHEN 1 THEN 'Seg' WHEN 2 THEN 'Ter' WHEN 3 THEN 'Qua'
        WHEN 4 THEN 'Qui' WHEN 5 THEN 'Sex' WHEN 6 THEN 'Sáb'
      END AS day_name
    FROM days
  )
  SELECT dn.day_name AS day,
    COALESCE(COUNT(*) FILTER (WHERE a.status = 'completed'), 0) AS completed,
    COALESCE(COUNT(*) FILTER (WHERE a.status IN ('pending', 'confirmed', 'in_progress')), 0) AS pending,
    COALESCE(COUNT(*) FILTER (WHERE a.status = 'cancelled'), 0) AS cancelled
  FROM day_names dn
  LEFT JOIN appointments a ON a.scheduled_date = dn.day_date AND a.pet_shop_id = _pet_shop_id
  GROUP BY dn.day_date, dn.day_name
  ORDER BY dn.day_date;
$$;

-- Get monthly revenue
CREATE OR REPLACE FUNCTION public.get_monthly_revenue(_pet_shop_id uuid, _months integer DEFAULT 6)
RETURNS TABLE(month text, revenue numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', CURRENT_DATE - (_months || ' months')::interval),
      date_trunc('month', CURRENT_DATE),
      '1 month'::interval
    )::date AS month_date
  )
  SELECT to_char(m.month_date, 'Mon') AS month, COALESCE(SUM(s.price), 0) AS revenue
  FROM months m
  LEFT JOIN appointments a ON date_trunc('month', a.scheduled_date) = m.month_date
    AND a.pet_shop_id = _pet_shop_id AND a.status = 'completed'
  LEFT JOIN services s ON s.id = a.service_id
  GROUP BY m.month_date ORDER BY m.month_date;
$$;

-- Get peak hours
CREATE OR REPLACE FUNCTION public.get_peak_hours(_pet_shop_id uuid, _days_back integer DEFAULT 30)
RETURNS TABLE(hour integer, appointment_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT EXTRACT(HOUR FROM scheduled_time)::INTEGER as hour, COUNT(*) as appointment_count
  FROM appointments
  WHERE pet_shop_id = _pet_shop_id
    AND scheduled_date >= CURRENT_DATE - _days_back
    AND status IN ('completed', 'confirmed', 'in_progress')
  GROUP BY EXTRACT(HOUR FROM scheduled_time) ORDER BY hour;
END;
$$;

-- Get no show stats
CREATE OR REPLACE FUNCTION public.get_no_show_stats(_pet_shop_id uuid, _date_start date DEFAULT (CURRENT_DATE - 30), _date_end date DEFAULT CURRENT_DATE)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_appointments', COUNT(*),
    'no_shows', COUNT(*) FILTER (WHERE status = 'cancelled' AND scheduled_date < CURRENT_DATE),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'no_show_rate', CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE status = 'cancelled' AND scheduled_date < CURRENT_DATE)::FLOAT / COUNT(*) * 100) ELSE 0 END
  ) INTO result
  FROM appointments WHERE pet_shop_id = _pet_shop_id AND scheduled_date BETWEEN _date_start AND _date_end;
  RETURN result;
END;
$$;

-- Get system health
CREATE OR REPLACE FUNCTION public.get_system_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'overdue_appointments', (SELECT COUNT(*) FROM appointments WHERE scheduled_date < CURRENT_DATE AND status IN ('pending', 'confirmed')),
    'low_stock_products', (SELECT COUNT(*) FROM products WHERE stock_quantity <= min_stock_quantity AND active = true),
    'pending_payments', (SELECT COUNT(*) FROM payments WHERE status = 'pendente'),
    'incomplete_profiles', (SELECT COUNT(*) FROM profiles WHERE full_name = '' OR phone = ''),
    'last_check', NOW()
  ) INTO result;
  RETURN result;
END;
$$;

-- Get system stats
CREATE OR REPLACE FUNCTION public.get_system_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_pet_shops', (SELECT COUNT(*) FROM pet_shops),
    'total_appointments_today', (SELECT COUNT(*) FROM appointments WHERE scheduled_date = CURRENT_DATE),
    'errors_last_24h', (SELECT COUNT(*) FROM system_logs WHERE log_type = 'error' AND created_at > now() - interval '24 hours')
  );
$$;

-- Get security stats
CREATE OR REPLACE FUNCTION public.get_security_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'active_mfa_users', (SELECT COUNT(DISTINCT user_id) FROM mfa_secrets WHERE enabled = true),
    'unresolved_alerts', (SELECT COUNT(*) FROM security_alerts WHERE resolved = false),
    'failed_logins_24h', (SELECT COUNT(*) FROM login_attempts WHERE success = false AND attempt_time > now() - interval '24 hours'),
    'successful_logins_24h', (SELECT COUNT(*) FROM login_attempts WHERE success = true AND attempt_time > now() - interval '24 hours'),
    'total_backups', (SELECT COUNT(*) FROM backup_history WHERE status = 'completed')
  );
$$;

-- Auto block IP if needed
CREATE OR REPLACE FUNCTION public.auto_block_ip_if_needed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE failed_count INTEGER;
BEGIN
  IF NEW.success = false AND NEW.ip_address IS NOT NULL THEN
    SELECT COUNT(*) INTO failed_count FROM public.login_attempts
    WHERE ip_address = NEW.ip_address AND success = false AND attempt_time > NOW() - INTERVAL '1 hour';
    
    IF failed_count >= 10 THEN
      INSERT INTO public.blocked_ips (ip_address, blocked_until, reason, auto_blocked)
      VALUES (NEW.ip_address, NOW() + INTERVAL '24 hours', 'Auto-blocked: ' || failed_count || ' failed attempts', true)
      ON CONFLICT (ip_address) DO UPDATE SET blocked_until = NOW() + INTERVAL '24 hours', blocked_at = NOW();
      
      INSERT INTO public.security_alerts (alert_type, severity, description, ip_address, metadata)
      VALUES ('ip_blocked', 'high', 'IP auto-blocked after ' || failed_count || ' failed attempts', NEW.ip_address, jsonb_build_object('failed_attempts', failed_count));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (user_id, table_name, operation, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create payment on complete
CREATE OR REPLACE FUNCTION public.create_payment_on_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE service_price NUMERIC;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    SELECT price INTO service_price FROM services WHERE id = NEW.service_id;
    IF NOT EXISTS (SELECT 1 FROM payments WHERE appointment_id = NEW.id) THEN
      INSERT INTO payments (appointment_id, amount, payment_method, status)
      VALUES (NEW.id, service_price, 'dinheiro', 'pendente');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Log stock movement
CREATE OR REPLACE FUNCTION public.log_stock_movement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.stock_quantity != OLD.stock_quantity THEN
    INSERT INTO stock_movements (product_id, movement_type, quantity, reason, user_id)
    VALUES (
      NEW.id,
      CASE WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'entrada' ELSE 'saida' END,
      ABS(NEW.stock_quantity - OLD.stock_quantity),
      'Automatic adjustment',
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Mark alert read
CREATE OR REPLACE FUNCTION public.mark_alert_read(alert_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.admin_alerts SET read = true, read_at = now(), read_by = auth.uid() WHERE id = alert_id;
  RETURN FOUND;
END;
$$;

-- Has feature
CREATE OR REPLACE FUNCTION public.has_feature(_user_id uuid, _feature_key text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE user_plan TEXT; feature_value JSONB;
BEGIN
  SELECT ps.subscription_plan INTO user_plan FROM public.pet_shops ps WHERE ps.owner_id = _user_id LIMIT 1;
  IF user_plan IS NULL THEN
    SELECT ps.subscription_plan INTO user_plan FROM public.pet_shops ps
    JOIN public.petshop_employees pe ON pe.pet_shop_id = ps.id WHERE pe.user_id = _user_id AND pe.active = true LIMIT 1;
  END IF;
  IF user_plan IS NULL THEN user_plan := 'free'; END IF;
  SELECT pf.feature_value INTO feature_value FROM public.plan_features pf WHERE pf.plan_name = user_plan AND pf.feature_key = _feature_key;
  RETURN COALESCE(feature_value, 'false'::jsonb);
END;
$$;

-- Find nearby pet shops
CREATE OR REPLACE FUNCTION public.find_nearby_pet_shops(client_lat numeric, client_lng numeric, radius_km numeric DEFAULT 50, limit_results integer DEFAULT 20)
RETURNS TABLE(id uuid, name text, address text, city text, state text, latitude numeric, longitude numeric, distance_km numeric, phone text, email text, logo_url text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ps.id, ps.name, ps.address, ps.city, ps.state, ps.latitude, ps.longitude,
    calculate_distance(client_lat, client_lng, ps.latitude, ps.longitude) as distance_km,
    ps.phone, ps.email, ps.logo_url
  FROM pet_shops ps
  WHERE ps.latitude IS NOT NULL AND ps.longitude IS NOT NULL AND ps.deleted_at IS NULL
    AND calculate_distance(client_lat, client_lng, ps.latitude, ps.longitude) <= radius_km
  ORDER BY distance_km ASC LIMIT limit_results;
END;
$$;

-- ============================================
-- PARTE 12: TRIGGERS (apenas em tabelas PUBLIC)
-- ============================================

-- Updated at triggers
CREATE OR REPLACE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_pet_shops_updated_at BEFORE UPDATE ON public.pet_shops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_franchises_updated_at BEFORE UPDATE ON public.franchises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Business logic triggers
CREATE OR REPLACE TRIGGER on_appointment_completed AFTER UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION create_payment_on_complete();
CREATE OR REPLACE TRIGGER on_product_stock_change AFTER UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION log_stock_movement();
CREATE OR REPLACE TRIGGER on_login_attempt_auto_block AFTER INSERT ON public.login_attempts FOR EACH ROW EXECUTE FUNCTION auto_block_ip_if_needed();

-- Audit triggers
CREATE OR REPLACE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE OR REPLACE TRIGGER audit_pet_shops AFTER INSERT OR UPDATE OR DELETE ON public.pet_shops FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE OR REPLACE TRIGGER audit_appointments AFTER INSERT OR UPDATE OR DELETE ON public.appointments FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE OR REPLACE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON public.payments FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ============================================
-- PARTE 13: ENABLE RLS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petshop_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_events_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_changes_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structured_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoramento_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satisfaction_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTE 14: RLS POLICIES (usando funções SECURITY DEFINER)
-- ============================================

-- PROFILES
CREATE POLICY "god_profiles" ON public.profiles FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "users_own_profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "admins_view_profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "admins_update_profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "petshops_view_clients" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM appointments a JOIN pet_shops ps ON ps.id = a.pet_shop_id
          WHERE a.client_id = profiles.id AND (ps.owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), ps.id)))
);

-- USER_ROLES
CREATE POLICY "god_user_roles" ON public.user_roles FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "users_view_own_role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins_manage_roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "system_insert_roles" ON public.user_roles FOR INSERT WITH CHECK (true);

-- PET_SHOPS
CREATE POLICY "god_pet_shops" ON public.pet_shops FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "owners_manage_shop" ON public.pet_shops FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "public_view_shops" ON public.pet_shops FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "admins_manage_shops" ON public.pet_shops FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "employees_view_shop" ON public.pet_shops FOR SELECT USING (is_employee_of_petshop(auth.uid(), id));

-- PETS
CREATE POLICY "god_pets" ON public.pets FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "owners_manage_pets" ON public.pets FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "petshops_view_pets" ON public.pets FOR SELECT USING (
  EXISTS (SELECT 1 FROM appointments a JOIN pet_shops ps ON ps.id = a.pet_shop_id
          WHERE a.pet_id = pets.id AND (ps.owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), ps.id)))
);
CREATE POLICY "admins_view_pets" ON public.pets FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- SERVICES
CREATE POLICY "god_services" ON public.services FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "public_view_active_services" ON public.services FOR SELECT USING (active = true);
CREATE POLICY "owners_manage_services" ON public.services FOR ALL USING (is_pet_shop_owner(auth.uid(), pet_shop_id));
CREATE POLICY "employees_manage_services" ON public.services FOR ALL USING (is_employee_of_petshop(auth.uid(), pet_shop_id));
CREATE POLICY "admins_manage_services" ON public.services FOR ALL USING (has_role(auth.uid(), 'admin'));

-- APPOINTMENTS
CREATE POLICY "god_appointments" ON public.appointments FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "clients_view_own" ON public.appointments FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "clients_create" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "clients_update_own" ON public.appointments FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "owners_manage" ON public.appointments FOR ALL USING (is_pet_shop_owner(auth.uid(), pet_shop_id));
CREATE POLICY "employees_manage" ON public.appointments FOR ALL USING (is_employee_of_petshop(auth.uid(), pet_shop_id));
CREATE POLICY "admins_manage" ON public.appointments FOR ALL USING (has_role(auth.uid(), 'admin'));

-- PAYMENTS
CREATE POLICY "god_payments" ON public.payments FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "view_own_payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM appointments a WHERE a.id = payments.appointment_id AND a.client_id = auth.uid())
);
CREATE POLICY "petshops_manage_payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM appointments a JOIN pet_shops ps ON ps.id = a.pet_shop_id
          WHERE a.id = payments.appointment_id AND (ps.owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), ps.id)))
);
CREATE POLICY "admins_manage_payments" ON public.payments FOR ALL USING (has_role(auth.uid(), 'admin'));

-- PRODUCTS
CREATE POLICY "god_products" ON public.products FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "owners_manage_products" ON public.products FOR ALL USING (is_pet_shop_owner(auth.uid(), pet_shop_id));
CREATE POLICY "employees_manage_products" ON public.products FOR ALL USING (is_employee_of_petshop(auth.uid(), pet_shop_id));
CREATE POLICY "admins_manage_products" ON public.products FOR ALL USING (has_role(auth.uid(), 'admin'));

-- STOCK_MOVEMENTS
CREATE POLICY "god_stock" ON public.stock_movements FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "petshops_manage_stock" ON public.stock_movements FOR ALL USING (
  EXISTS (SELECT 1 FROM products p JOIN pet_shops ps ON ps.id = p.pet_shop_id
          WHERE p.id = stock_movements.product_id AND (ps.owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), ps.id)))
);

-- PETSHOP_EMPLOYEES
CREATE POLICY "god_employees" ON public.petshop_employees FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "owners_manage_employees" ON public.petshop_employees FOR ALL USING (is_pet_shop_owner(auth.uid(), pet_shop_id));
CREATE POLICY "employees_view_self" ON public.petshop_employees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins_manage_employees" ON public.petshop_employees FOR ALL USING (has_role(auth.uid(), 'admin'));

-- PERMISSIONS
CREATE POLICY "anyone_view_permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "admins_manage_permissions" ON public.permissions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- EMPLOYEE_PERMISSIONS
CREATE POLICY "god_emp_perms" ON public.employee_permissions FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "owners_manage_emp_perms" ON public.employee_permissions FOR ALL USING (
  EXISTS (SELECT 1 FROM petshop_employees pe JOIN pet_shops ps ON ps.id = pe.pet_shop_id
          WHERE pe.id = employee_permissions.employee_id AND ps.owner_id = auth.uid())
);

-- LOGIN_ATTEMPTS
CREATE POLICY "god_login_attempts" ON public.login_attempts FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "admins_view_login_attempts" ON public.login_attempts FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "system_insert_login_attempts" ON public.login_attempts FOR INSERT WITH CHECK (true);

-- BLOCKED_IPS
CREATE POLICY "admins_view_blocked_ips" ON public.blocked_ips FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "system_insert_blocked_ips" ON public.blocked_ips FOR INSERT WITH CHECK (true);

-- SECURITY_ALERTS
CREATE POLICY "god_security_alerts" ON public.security_alerts FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "admins_manage_security_alerts" ON public.security_alerts FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "system_insert_security_alerts" ON public.security_alerts FOR INSERT WITH CHECK (true);

-- SECURITY_NOTIFICATIONS
CREATE POLICY "admins_view_security_notif" ON public.security_notifications FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "admins_update_security_notif" ON public.security_notifications FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "system_insert_security_notif" ON public.security_notifications FOR INSERT WITH CHECK (true);

-- MFA_SECRETS
CREATE POLICY "users_manage_own_mfa" ON public.mfa_secrets FOR ALL USING (auth.uid() = user_id);

-- MFA_BACKUP_CODES
CREATE POLICY "users_manage_own_backup_codes" ON public.mfa_backup_codes FOR ALL USING (auth.uid() = user_id);

-- MFA_SESSIONS
CREATE POLICY "users_manage_own_mfa_sessions" ON public.mfa_sessions FOR ALL USING (auth.uid() = user_id);

-- PASSWORD_RESETS
CREATE POLICY "anyone_insert_password_resets" ON public.password_resets FOR INSERT WITH CHECK (true);
CREATE POLICY "service_update_password_resets" ON public.password_resets FOR UPDATE USING (true);

-- IP_WHITELIST
CREATE POLICY "admins_manage_ip_whitelist" ON public.ip_whitelist FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ADMIN_ALERTS
CREATE POLICY "god_admin_alerts" ON public.admin_alerts FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "admins_view_admin_alerts" ON public.admin_alerts FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "admins_update_admin_alerts" ON public.admin_alerts FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "system_insert_admin_alerts" ON public.admin_alerts FOR INSERT WITH CHECK (true);

-- ADMIN_INVITES
CREATE POLICY "admins_manage_invites" ON public.admin_invites FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ADMIN_NOTIFICATION_PREFERENCES
CREATE POLICY "admins_manage_own_prefs" ON public.admin_notification_preferences FOR ALL USING (auth.uid() = admin_id AND has_role(auth.uid(), 'admin'));
CREATE POLICY "admins_view_all_prefs" ON public.admin_notification_preferences FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ADMIN_API_RATE_LIMITS
CREATE POLICY "admins_manage_rate_limits" ON public.admin_api_rate_limits FOR ALL USING (has_role(auth.uid(), 'admin'));

-- IMPERSONATION_SESSIONS
CREATE POLICY "admins_manage_impersonation" ON public.impersonation_sessions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- AUDIT_LOGS
CREATE POLICY "god_audit_logs" ON public.audit_logs FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "admins_view_audit_logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- AUTH_EVENTS_LOG
CREATE POLICY "god_auth_events" ON public.auth_events_log FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "admins_view_auth_events" ON public.auth_events_log FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "system_insert_auth_events" ON public.auth_events_log FOR INSERT WITH CHECK (true);

-- ROLE_CHANGES_AUDIT
CREATE POLICY "admins_view_role_changes" ON public.role_changes_audit FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "system_insert_role_changes" ON public.role_changes_audit FOR INSERT WITH CHECK (true);

-- ACCESS_AUDIT
CREATE POLICY "admins_view_access_audit" ON public.access_audit FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "system_insert_access_audit" ON public.access_audit FOR INSERT WITH CHECK (true);

-- SYSTEM_LOGS
CREATE POLICY "god_system_logs" ON public.system_logs FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "admins_view_system_logs" ON public.system_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "system_insert_system_logs" ON public.system_logs FOR INSERT WITH CHECK (true);

-- STRUCTURED_LOGS
CREATE POLICY "admins_view_structured_logs" ON public.structured_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "system_insert_structured_logs" ON public.structured_logs FOR INSERT WITH CHECK (true);

-- SYSTEM_HEALTH_METRICS
CREATE POLICY "god_health_metrics" ON public.system_health_metrics FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "admins_view_health_metrics" ON public.system_health_metrics FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- DAILY_HEALTH_REPORTS
CREATE POLICY "admins_view_health_reports" ON public.daily_health_reports FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- MONITORAMENTO_SISTEMA
CREATE POLICY "admins_manage_monitoramento" ON public.monitoramento_sistema FOR ALL USING (has_role(auth.uid(), 'admin'));

-- GLOBAL_METRICS
CREATE POLICY "anyone_view_global_metrics" ON public.global_metrics FOR SELECT USING (true);
CREATE POLICY "admins_manage_global_metrics" ON public.global_metrics FOR ALL USING (has_role(auth.uid(), 'admin'));

-- FAILED_JOBS
CREATE POLICY "admins_manage_failed_jobs" ON public.failed_jobs FOR ALL USING (has_role(auth.uid(), 'admin'));

-- BACKUP_HISTORY
CREATE POLICY "god_backup_history" ON public.backup_history FOR ALL USING (is_god_user(auth.uid()));
CREATE POLICY "admins_manage_backups" ON public.backup_history FOR ALL USING (has_role(auth.uid(), 'admin'));

-- BACKUP_VERIFICATIONS
CREATE POLICY "admins_manage_backup_verifications" ON public.backup_verifications FOR ALL USING (has_role(auth.uid(), 'admin'));

-- PROFESSIONAL_BACKUPS
CREATE POLICY "owners_manage_pro_backups" ON public.professional_backups FOR ALL USING (is_pet_shop_owner(auth.uid(), pet_shop_id));
CREATE POLICY "admins_manage_pro_backups" ON public.professional_backups FOR ALL USING (has_role(auth.uid(), 'admin'));

-- NOTIFICATIONS
CREATE POLICY "clients_view_own_notifications" ON public.notifications FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "petshops_manage_notifications" ON public.notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM appointments a JOIN pet_shops ps ON ps.id = a.pet_shop_id
          WHERE a.id = notifications.appointment_id AND (ps.owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), ps.id)))
);

-- NOTIFICATIONS_LOG
CREATE POLICY "admins_view_notification_logs" ON public.notifications_log FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- COMMISSIONS
CREATE POLICY "petshops_manage_commissions" ON public.commissions FOR ALL USING (
  is_pet_shop_owner(auth.uid(), pet_shop_id) OR is_employee_of_petshop(auth.uid(), pet_shop_id)
);
CREATE POLICY "admins_manage_commissions" ON public.commissions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- LOYALTY_POINTS
CREATE POLICY "clients_view_own_loyalty" ON public.loyalty_points FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "petshops_manage_loyalty" ON public.loyalty_points FOR ALL USING (is_pet_shop_owner(auth.uid(), pet_shop_id));

-- LOYALTY_TRANSACTIONS
CREATE POLICY "view_own_loyalty_transactions" ON public.loyalty_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM loyalty_points lp WHERE lp.id = loyalty_transactions.loyalty_points_id AND lp.client_id = auth.uid())
);

-- MARKETING_CAMPAIGNS
CREATE POLICY "owners_manage_campaigns" ON public.marketing_campaigns FOR ALL USING (is_pet_shop_owner(auth.uid(), pet_shop_id));

-- SATISFACTION_SURVEYS
CREATE POLICY "clients_create_surveys" ON public.satisfaction_surveys FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "petshops_view_surveys" ON public.satisfaction_surveys FOR SELECT USING (
  EXISTS (SELECT 1 FROM appointments a JOIN pet_shops ps ON ps.id = a.pet_shop_id
          WHERE a.id = satisfaction_surveys.appointment_id AND ps.owner_id = auth.uid())
);

-- PET_PHOTOS
CREATE POLICY "owners_manage_pet_photos" ON public.pet_photos FOR ALL USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_photos.pet_id AND pets.owner_id = auth.uid())
);
CREATE POLICY "petshops_view_pet_photos" ON public.pet_photos FOR SELECT USING (
  EXISTS (SELECT 1 FROM appointments a JOIN pet_shops ps ON ps.id = a.pet_shop_id
          WHERE (a.pet_id = pet_photos.pet_id OR a.id = pet_photos.appointment_id)
          AND (ps.owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), ps.id)))
);

-- WHATSAPP_SETTINGS
CREATE POLICY "owners_manage_whatsapp" ON public.whatsapp_settings FOR ALL USING (is_pet_shop_owner(auth.uid(), pet_shop_id));

-- SETTINGS_PASSWORDS
CREATE POLICY "owners_manage_settings_passwords" ON public.settings_passwords FOR ALL USING (is_pet_shop_owner(auth.uid(), pet_shop_id));
CREATE POLICY "admins_manage_settings_passwords" ON public.settings_passwords FOR ALL USING (has_role(auth.uid(), 'admin') OR is_god_user(auth.uid()));

-- PLAN_FEATURES
CREATE POLICY "anyone_view_plan_features" ON public.plan_features FOR SELECT USING (true);
CREATE POLICY "admins_manage_plan_features" ON public.plan_features FOR ALL USING (has_role(auth.uid(), 'admin'));

-- TENANTS
CREATE POLICY "users_view_own_tenants" ON public.tenants FOR SELECT USING (has_tenant_access(auth.uid(), id) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "tenant_admins_update" ON public.tenants FOR UPDATE USING (is_tenant_admin(auth.uid(), id) OR has_role(auth.uid(), 'admin'));

-- FRANCHISES
CREATE POLICY "users_view_franchises" ON public.franchises FOR SELECT USING (has_tenant_access(auth.uid(), tenant_id) OR owner_id = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "tenant_admins_create_franchises" ON public.franchises FOR INSERT WITH CHECK (is_tenant_admin(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "franchise_owners_update" ON public.franchises FOR UPDATE USING (owner_id = auth.uid() OR is_franchise_owner(auth.uid(), id) OR is_tenant_admin(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'));

-- USER_HIERARCHY
CREATE POLICY "users_view_own_hierarchy" ON public.user_hierarchy FOR SELECT USING (user_id = auth.uid() OR is_tenant_admin(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "tenant_admins_manage_hierarchy" ON public.user_hierarchy FOR ALL USING (is_tenant_admin(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'));

-- BRAND_STANDARDS
CREATE POLICY "users_view_brand_standards" ON public.brand_standards FOR SELECT USING (has_tenant_access(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "tenant_admins_manage_standards" ON public.brand_standards FOR ALL USING (is_tenant_admin(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'));

-- COMPLIANCE_AUDITS
CREATE POLICY "view_unit_compliance" ON public.compliance_audits FOR SELECT USING (
  EXISTS (SELECT 1 FROM pet_shops WHERE id = compliance_audits.unit_id AND (owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), id)))
  OR has_role(auth.uid(), 'admin')
);
CREATE POLICY "admins_manage_compliance" ON public.compliance_audits FOR ALL USING (has_role(auth.uid(), 'admin'));

-- SUCCESS_STORIES
CREATE POLICY "anyone_view_approved_stories" ON public.success_stories FOR SELECT USING (approved = true);
CREATE POLICY "owners_manage_own_stories" ON public.success_stories FOR ALL USING (is_pet_shop_owner(auth.uid(), pet_shop_id));
CREATE POLICY "admins_manage_stories" ON public.success_stories FOR ALL USING (has_role(auth.uid(), 'admin'));

-- PUSH_SUBSCRIPTIONS
CREATE POLICY "users_manage_own_push" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- SMS_VERIFICATIONS
CREATE POLICY "system_manage_sms" ON public.sms_verifications FOR ALL USING (true);

-- WEBHOOK_ENDPOINTS
CREATE POLICY "owners_manage_webhooks" ON public.webhook_endpoints FOR ALL USING (is_pet_shop_owner(auth.uid(), pet_shop_id));
CREATE POLICY "admins_manage_webhooks" ON public.webhook_endpoints FOR ALL USING (has_role(auth.uid(), 'admin'));

-- WEBHOOK_LOGS
CREATE POLICY "owners_view_webhook_logs" ON public.webhook_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM webhook_endpoints we WHERE we.id = webhook_logs.endpoint_id AND is_pet_shop_owner(auth.uid(), we.pet_shop_id))
);
CREATE POLICY "admins_view_webhook_logs" ON public.webhook_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- PARTE 15: STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('backups', 'backups', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_auth_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_auth_update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_auth_delete" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "pet_photos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'pet-photos');
CREATE POLICY "pet_photos_auth_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');
CREATE POLICY "pet_photos_auth_update" ON storage.objects FOR UPDATE USING (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');

CREATE POLICY "backups_admin_only" ON storage.objects FOR ALL USING (bucket_id = 'backups' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "documents_owner_access" ON storage.objects FOR ALL USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- PARTE 16: REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================
-- PARTE 17: SEED DATA
-- ============================================

-- Plan Features
INSERT INTO public.plan_features (plan_name, feature_key, feature_value, description) VALUES
('gratuito', 'max_appointments', '50', 'Máximo de agendamentos por mês'),
('gratuito', 'max_services', '5', 'Máximo de serviços cadastrados'),
('gratuito', 'multi_user_limit', '1', 'Limite de usuários'),
('gratuito', 'reports', 'false', 'Acesso a relatórios'),
('gratuito', 'whatsapp_notifications', 'false', 'Notificações WhatsApp'),
('pet_gold', 'max_appointments', '500', 'Máximo de agendamentos por mês'),
('pet_gold', 'max_services', '20', 'Máximo de serviços cadastrados'),
('pet_gold', 'multi_user_limit', '3', 'Limite de usuários'),
('pet_gold', 'reports', 'true', 'Acesso a relatórios'),
('pet_gold', 'whatsapp_notifications', 'true', 'Notificações WhatsApp'),
('pet_platinum', 'max_appointments', '999999', 'Ilimitado'),
('pet_platinum', 'max_services', '999999', 'Ilimitado'),
('pet_platinum', 'multi_user_limit', '5', 'Limite de usuários'),
('pet_platinum', 'reports', 'true', 'Acesso a relatórios'),
('pet_platinum', 'whatsapp_notifications', 'true', 'Notificações WhatsApp'),
('pet_platinum', 'priority_support', 'true', 'Suporte prioritário')
ON CONFLICT (plan_name, feature_key) DO NOTHING;

-- Global Metrics
INSERT INTO public.global_metrics (metric_name, metric_type, metric_value, description) VALUES
('total_active_petshops', 'count', 0, 'Total de pet shops ativos'),
('total_appointments', 'count', 0, 'Total de agendamentos realizados'),
('average_satisfaction', 'rating', 0, 'Média de satisfação dos clientes'),
('cities_covered', 'count', 0, 'Número de cidades atendidas'),
('average_growth_percent', 'percentage', 0, 'Crescimento médio dos parceiros')
ON CONFLICT (metric_name) DO NOTHING;

-- Default Permissions
INSERT INTO public.permissions (name, module, action, description) VALUES
('view_dashboard', 'dashboard', 'view', 'Visualizar dashboard'),
('view_appointments', 'appointments', 'view', 'Visualizar agendamentos'),
('create_appointments', 'appointments', 'create', 'Criar agendamentos'),
('edit_appointments', 'appointments', 'edit', 'Editar agendamentos'),
('delete_appointments', 'appointments', 'delete', 'Excluir agendamentos'),
('view_clients', 'clients', 'view', 'Visualizar clientes'),
('create_clients', 'clients', 'create', 'Criar clientes'),
('edit_clients', 'clients', 'edit', 'Editar clientes'),
('view_services', 'services', 'view', 'Visualizar serviços'),
('create_services', 'services', 'create', 'Criar serviços'),
('edit_services', 'services', 'edit', 'Editar serviços'),
('delete_services', 'services', 'delete', 'Excluir serviços'),
('view_financial', 'financial', 'view', 'Visualizar financeiro'),
('manage_financial', 'financial', 'manage', 'Gerenciar financeiro'),
('view_reports', 'reports', 'view', 'Visualizar relatórios'),
('manage_employees', 'employees', 'manage', 'Gerenciar funcionários'),
('manage_settings', 'settings', 'manage', 'Gerenciar configurações')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PARTE 18: VERIFICAÇÃO FINAL
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
  function_count INTEGER;
  trigger_count INTEGER;
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  SELECT COUNT(*) INTO function_count FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
  SELECT COUNT(*) INTO trigger_count FROM information_schema.triggers WHERE trigger_schema = 'public';
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tabelas criadas: %', table_count;
  RAISE NOTICE 'Funções criadas: %', function_count;
  RAISE NOTICE 'Triggers criados: %', trigger_count;
  RAISE NOTICE 'Políticas RLS: %', policy_count;
  RAISE NOTICE '========================================';
END $$;
