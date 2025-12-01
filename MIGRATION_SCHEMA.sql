-- ============================================
-- EASYPET - COMPLETE MIGRATION SCHEMA
-- Target Project: zxdbsimthnfprrthszoh
-- Generated: 2024-12-01
-- ============================================

-- ============================================
-- PHASE 1: EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;

-- ============================================
-- PHASE 2: CUSTOM ENUM TYPES
-- ============================================

-- App Role Enum
CREATE TYPE public.app_role AS ENUM (
  'client',
  'pet_shop',
  'professional',
  'petshop_owner',
  'admin',
  'super_admin'
);

-- App Module Enum
CREATE TYPE public.app_module AS ENUM (
  'dashboard',
  'appointments',
  'clients',
  'pets',
  'services',
  'products',
  'inventory',
  'financial',
  'employees',
  'marketing',
  'reports',
  'settings'
);

-- App Action Enum
CREATE TYPE public.app_action AS ENUM (
  'view',
  'create',
  'edit',
  'delete',
  'manage'
);

-- ============================================
-- PHASE 3: CORE TABLES
-- ============================================

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  user_code TEXT,
  address TEXT,
  document TEXT,
  contact_preference TEXT DEFAULT 'whatsapp',
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_at TIMESTAMPTZ,
  blocked_by UUID,
  blocked_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Tenants table (multi-tenancy)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#3B82F6',
  subscription_plan TEXT NOT NULL DEFAULT 'starter',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Franchises table
CREATE TABLE public.franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  cnpj TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  contract_start_date DATE,
  contract_end_date DATE,
  royalty_percentage NUMERIC NOT NULL DEFAULT 5.00,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pet Shops table
CREATE TABLE public.pet_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  hours TEXT,
  logo_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  subscription_plan TEXT DEFAULT 'gratuito',
  subscription_expires_at TIMESTAMPTZ,
  cakto_customer_id TEXT,
  cakto_subscription_id TEXT,
  franchise_id UUID REFERENCES public.franchises(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Hierarchy (multi-tenant permissions)
CREATE TABLE public.user_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id),
  franchise_id UUID REFERENCES public.franchises(id),
  unit_id UUID REFERENCES public.pet_shops(id),
  role TEXT NOT NULL,
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  species TEXT DEFAULT 'dog',
  breed TEXT,
  gender TEXT,
  age INTEGER,
  weight NUMERIC,
  birth_date DATE,
  coat_type TEXT,
  coat_color TEXT,
  size TEXT,
  neutered BOOLEAN DEFAULT FALSE,
  temperament TEXT,
  allergies TEXT,
  chronic_diseases TEXT,
  restrictions TEXT,
  grooming_preferences TEXT,
  observations TEXT,
  photo_url TEXT,
  vaccination_history JSONB DEFAULT '[]',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  duration_minutes INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id),
  service_id UUID NOT NULL REFERENCES public.services(id),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id),
  client_id UUID NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  completed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id),
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  installments INTEGER DEFAULT 1,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  cost_price NUMERIC NOT NULL,
  sale_price NUMERIC NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_quantity INTEGER DEFAULT 5,
  expiry_date DATE,
  active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stock Movements table
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  movement_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Petshop Employees table
CREATE TABLE public.petshop_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id),
  user_id UUID NOT NULL,
  position TEXT,
  hired_at DATE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Permissions table
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  module public.app_module NOT NULL,
  action public.app_action NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Employee Permissions table
CREATE TABLE public.employee_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.petshop_employees(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now()
);

-- Commissions table
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id),
  employee_id UUID NOT NULL,
  service_id UUID REFERENCES public.services(id),
  appointment_id UUID REFERENCES public.appointments(id),
  commission_type TEXT NOT NULL,
  commission_value NUMERIC NOT NULL,
  amount_earned NUMERIC NOT NULL,
  reference_month DATE NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Loyalty Points table
CREATE TABLE public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id),
  points INTEGER NOT NULL DEFAULT 0,
  total_points_earned INTEGER NOT NULL DEFAULT 0,
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Loyalty Transactions table
CREATE TABLE public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_points_id UUID NOT NULL REFERENCES public.loyalty_points(id),
  transaction_type TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  appointment_id UUID REFERENCES public.appointments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications Log table
CREATE TABLE public.notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES public.notifications(id),
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  scheduled_for TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Marketing Campaigns table
CREATE TABLE public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'rascunho',
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipients_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pet Photos table
CREATE TABLE public.pet_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id),
  appointment_id UUID REFERENCES public.appointments(id),
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Satisfaction Surveys table
CREATE TABLE public.satisfaction_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id),
  client_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- WhatsApp Settings table
CREATE TABLE public.whatsapp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id),
  business_phone TEXT,
  welcome_message TEXT DEFAULT 'Olá! Obrigado por escolher nosso petshop.',
  auto_confirmation BOOLEAN NOT NULL DEFAULT TRUE,
  auto_reminder BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_hours_before INTEGER NOT NULL DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Settings Passwords table
CREATE TABLE public.settings_passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plan Features table
CREATE TABLE public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  feature_key TEXT NOT NULL,
  feature_value JSONB NOT NULL DEFAULT 'true',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (plan_name, feature_key)
);

-- ============================================
-- PHASE 4: SECURITY & AUDIT TABLES
-- ============================================

-- Login Attempts table
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  attempt_time TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blocked IPs table
CREATE TABLE public.blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ NOT NULL,
  blocked_by UUID,
  auto_blocked BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security Alerts table
CREATE TABLE public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT,
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security Notifications table
CREATE TABLE public.security_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auth Events Log table
CREATE TABLE public.auth_events_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_status TEXT NOT NULL,
  user_role TEXT,
  role_source TEXT,
  ip_address TEXT,
  user_agent TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Role Changes Audit table
CREATE TABLE public.role_changes_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_user_id UUID NOT NULL,
  changed_by UUID NOT NULL,
  old_role public.app_role,
  new_role public.app_role NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Access Audit table
CREATE TABLE public.access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pet_shop_id UUID REFERENCES public.pet_shops(id),
  module public.app_module NOT NULL,
  action public.app_action NOT NULL,
  resource_id UUID,
  resource_type TEXT,
  success BOOLEAN DEFAULT TRUE,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- System Logs table
CREATE TABLE public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  log_type TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Structured Logs table
CREATE TABLE public.structured_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL,
  module TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PHASE 5: MFA & PASSWORD RESET TABLES
-- ============================================

-- MFA Secrets table
CREATE TABLE public.mfa_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  secret_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  backup_codes_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- MFA Backup Codes table
CREATE TABLE public.mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code_hash TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MFA Sessions table
CREATE TABLE public.mfa_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Password Resets table
CREATE TABLE public.password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PHASE 6: ADMIN & SYSTEM TABLES
-- ============================================

-- Admin Alerts table
CREATE TABLE public.admin_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  source_module TEXT,
  source_function TEXT,
  context JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  read_by UUID,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin Invites table
CREATE TABLE public.admin_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL,
  accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin Notification Preferences table
CREATE TABLE public.admin_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  whatsapp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  whatsapp_number TEXT,
  security_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  system_health_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  backup_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  payment_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  user_activity_alerts BOOLEAN NOT NULL DEFAULT FALSE,
  performance_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin API Rate Limits table
CREATE TABLE public.admin_api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- IP Whitelist table
CREATE TABLE public.ip_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  description TEXT,
  added_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Impersonation Sessions table
CREATE TABLE public.impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- ============================================
-- PHASE 7: BACKUP & HEALTH TABLES
-- ============================================

-- Backup History table
CREATE TABLE public.backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id TEXT NOT NULL,
  backup_type TEXT NOT NULL,
  status TEXT NOT NULL,
  tables_backed_up JSONB NOT NULL,
  total_records INTEGER NOT NULL DEFAULT 0,
  backup_size_bytes BIGINT,
  storage_path TEXT,
  encryption_enabled BOOLEAN DEFAULT TRUE,
  compression_enabled BOOLEAN DEFAULT TRUE,
  triggered_by UUID,
  error_message TEXT,
  metadata JSONB,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Backup Verifications table
CREATE TABLE public.backup_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID NOT NULL REFERENCES public.backup_history(id),
  verification_status TEXT NOT NULL,
  tables_verified INTEGER DEFAULT 0,
  records_verified INTEGER DEFAULT 0,
  integrity_checks_passed INTEGER DEFAULT 0,
  integrity_checks_failed INTEGER DEFAULT 0,
  verification_results JSONB DEFAULT '{}',
  error_message TEXT,
  verified_by UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Professional Backups table
CREATE TABLE public.professional_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id),
  created_by UUID NOT NULL,
  backup_type TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  storage_path TEXT,
  file_size_bytes BIGINT,
  date_range_start DATE,
  date_range_end DATE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Health Metrics table
CREATE TABLE public.system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  status TEXT,
  threshold_warning NUMERIC,
  threshold_critical NUMERIC,
  metadata JSONB DEFAULT '{}',
  measured_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily Health Reports table
CREATE TABLE public.daily_health_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL UNIQUE,
  overall_status TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  database_health JSONB,
  edge_function_health JSONB,
  security_status JSONB,
  performance_metrics JSONB,
  actions_taken JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Monitoramento Sistema table
CREATE TABLE public.monitoramento_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy',
  threshold_warning NUMERIC,
  threshold_critical NUMERIC,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Global Metrics table
CREATE TABLE public.global_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL UNIQUE,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  description TEXT,
  last_calculated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Failed Jobs table
CREATE TABLE public.failed_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  error_message TEXT,
  error_stack TEXT,
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending',
  next_retry_at TIMESTAMPTZ,
  metadata JSONB,
  last_attempted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PHASE 8: MULTI-TENANT TABLES
-- ============================================

-- Brand Standards table
CREATE TABLE public.brand_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  checklist_items JSONB DEFAULT '[]',
  required BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compliance Audits table
CREATE TABLE public.compliance_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.pet_shops(id),
  standard_id UUID NOT NULL REFERENCES public.brand_standards(id),
  auditor_id UUID NOT NULL,
  audit_date DATE NOT NULL,
  compliance_score NUMERIC NOT NULL,
  findings JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Success Stories table
CREATE TABLE public.success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  full_story TEXT,
  revenue_growth_percent NUMERIC,
  efficiency_improvement_percent NUMERIC,
  customer_satisfaction_increase NUMERIC,
  implementation_time_days INTEGER,
  featured BOOLEAN DEFAULT FALSE,
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Push Subscriptions table
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SMS Verifications table
CREATE TABLE public.sms_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook Endpoints table
CREATE TABLE public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook Logs table
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID NOT NULL REFERENCES public.webhook_endpoints(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  success BOOLEAN,
  attempt_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PHASE 9: INDEXES
-- ============================================

-- Performance indexes
CREATE INDEX idx_appointments_pet_shop_date ON public.appointments(pet_shop_id, scheduled_date);
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_appointments_status_date ON public.appointments(status, scheduled_date);

CREATE INDEX idx_payments_appointment_id ON public.payments(appointment_id);
CREATE INDEX idx_payments_status ON public.payments(status);

CREATE INDEX idx_pets_owner_id ON public.pets(owner_id);
CREATE INDEX idx_pets_deleted_at ON public.pets(deleted_at);

CREATE INDEX idx_services_pet_shop_id ON public.services(pet_shop_id);
CREATE INDEX idx_services_active ON public.services(active);

CREATE INDEX idx_products_pet_shop_id ON public.products(pet_shop_id);
CREATE INDEX idx_products_stock ON public.products(stock_quantity);
CREATE INDEX idx_products_expiry ON public.products(expiry_date);

CREATE INDEX idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON public.login_attempts(ip_address);
CREATE INDEX idx_login_attempts_time ON public.login_attempts(attempt_time);

CREATE INDEX idx_blocked_ips_ip ON public.blocked_ips(ip_address);
CREATE INDEX idx_blocked_ips_until ON public.blocked_ips(blocked_until);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at);

CREATE INDEX idx_system_logs_module ON public.system_logs(module);
CREATE INDEX idx_system_logs_type ON public.system_logs(log_type);
CREATE INDEX idx_system_logs_created ON public.system_logs(created_at);

CREATE INDEX idx_admin_alerts_severity ON public.admin_alerts(severity);
CREATE INDEX idx_admin_alerts_read ON public.admin_alerts(read);
CREATE INDEX idx_admin_alerts_created ON public.admin_alerts(created_at);

CREATE INDEX idx_notifications_client ON public.notifications(client_id);
CREATE INDEX idx_notifications_status ON public.notifications(status);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

CREATE INDEX idx_structured_logs_level ON public.structured_logs(level);
CREATE INDEX idx_structured_logs_module ON public.structured_logs(module);
CREATE INDEX idx_structured_logs_user ON public.structured_logs(user_id);
CREATE INDEX idx_structured_logs_created ON public.structured_logs(created_at);

-- ============================================
-- PHASE 10: SQL FUNCTIONS
-- ============================================

-- God User check function
CREATE OR REPLACE FUNCTION public.is_god_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id 
    AND email = 'beninelixo@gmail.com'
  )
$$;

-- Has Role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Is User Blocked function
CREATE OR REPLACE FUNCTION public.is_user_blocked(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT is_blocked FROM public.profiles WHERE id = _user_id),
    FALSE
  )
$$;

-- Is Employee of Petshop function
CREATE OR REPLACE FUNCTION public.is_employee_of_petshop(_user_id UUID, _pet_shop_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM petshop_employees
    WHERE user_id = _user_id
      AND pet_shop_id = _pet_shop_id
      AND active = true
  );
$$;

-- Is Tenant Admin function
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_hierarchy
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND role = 'tenant_admin'
      AND active = true
  );
$$;

-- Is Franchise Owner function
CREATE OR REPLACE FUNCTION public.is_franchise_owner(_user_id UUID, _franchise_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_hierarchy
    WHERE user_id = _user_id
      AND franchise_id = _franchise_id
      AND role = 'franchise_owner'
      AND active = true
  );
$$;

-- Has Tenant Access function
CREATE OR REPLACE FUNCTION public.has_tenant_access(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_hierarchy
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND active = true
  );
$$;

-- Has Permission function
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _pet_shop_id UUID, _module public.app_module, _action public.app_action)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM pet_shops
      WHERE id = _pet_shop_id
      AND owner_id = _user_id
    ) THEN true
    WHEN has_role(_user_id, 'admin'::public.app_role) THEN true
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

-- Is IP Blocked function
CREATE OR REPLACE FUNCTION public.is_ip_blocked(_ip_address TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_ips
    WHERE ip_address = _ip_address
      AND blocked_until > NOW()
  );
$$;

-- Generate Pet Shop Code function
CREATE OR REPLACE FUNCTION public.generate_pet_shop_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Generate User Code function
CREATE OR REPLACE FUNCTION public.generate_user_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Update Updated At Column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Handle New User function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role public.app_role;
BEGIN
  user_role := COALESCE(
    (new.raw_user_meta_data->>'user_type')::public.app_role,
    (new.raw_user_meta_data->>'role')::public.app_role,
    'client'::public.app_role
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);

  INSERT INTO public.profiles (id, full_name, phone, user_code)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    generate_user_code()
  );

  IF user_role = 'pet_shop' THEN
    INSERT INTO public.pet_shops (
      owner_id,
      name,
      address,
      city,
      state,
      phone,
      email,
      code
    )
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'pet_shop_name', 'Meu PetShop'),
      COALESCE(new.raw_user_meta_data->>'pet_shop_address', ''),
      COALESCE(new.raw_user_meta_data->>'pet_shop_city', ''),
      COALESCE(new.raw_user_meta_data->>'pet_shop_state', ''),
      COALESCE(new.raw_user_meta_data->>'phone', ''),
      new.email,
      generate_pet_shop_code()
    );
  END IF;

  RETURN new;
END;
$$;

-- Get Dashboard Stats function
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(_pet_shop_id UUID, _date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'today_appointments', (
      SELECT COUNT(*)
      FROM appointments
      WHERE pet_shop_id = _pet_shop_id
        AND scheduled_date = _date
    ),
    'monthly_revenue', (
      SELECT COALESCE(SUM(s.price), 0)
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      WHERE a.pet_shop_id = _pet_shop_id
        AND a.status = 'completed'
        AND a.scheduled_date >= date_trunc('month', _date)::date
        AND a.scheduled_date < (date_trunc('month', _date) + interval '1 month')::date
    ),
    'active_clients', (
      SELECT COUNT(DISTINCT client_id)
      FROM appointments
      WHERE pet_shop_id = _pet_shop_id
        AND scheduled_date >= _date - interval '90 days'
    ),
    'completed_services', (
      SELECT COUNT(*)
      FROM appointments
      WHERE pet_shop_id = _pet_shop_id
        AND status = 'completed'
    )
  );
$$;

-- Get Weekly Appointments function
CREATE OR REPLACE FUNCTION public.get_weekly_appointments(_pet_shop_id UUID)
RETURNS TABLE(day TEXT, completed BIGINT, pending BIGINT, cancelled BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH days AS (
    SELECT 
      generate_series(
        CURRENT_DATE - interval '6 days',
        CURRENT_DATE,
        '1 day'::interval
      )::date AS day_date
  ),
  day_names AS (
    SELECT 
      day_date,
      CASE extract(dow from day_date)
        WHEN 0 THEN 'Dom'
        WHEN 1 THEN 'Seg'
        WHEN 2 THEN 'Ter'
        WHEN 3 THEN 'Qua'
        WHEN 4 THEN 'Qui'
        WHEN 5 THEN 'Sex'
        WHEN 6 THEN 'Sáb'
      END AS day_name
    FROM days
  )
  SELECT 
    dn.day_name AS day,
    COALESCE(COUNT(*) FILTER (WHERE a.status = 'completed'), 0) AS completed,
    COALESCE(COUNT(*) FILTER (WHERE a.status IN ('pending', 'confirmed', 'in_progress')), 0) AS pending,
    COALESCE(COUNT(*) FILTER (WHERE a.status = 'cancelled'), 0) AS cancelled
  FROM day_names dn
  LEFT JOIN appointments a ON 
    a.scheduled_date = dn.day_date
    AND a.pet_shop_id = _pet_shop_id
  GROUP BY dn.day_date, dn.day_name
  ORDER BY dn.day_date;
$$;

-- Get Monthly Revenue function
CREATE OR REPLACE FUNCTION public.get_monthly_revenue(_pet_shop_id UUID, _months INTEGER DEFAULT 6)
RETURNS TABLE(month TEXT, revenue NUMERIC)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH months AS (
    SELECT 
      generate_series(
        date_trunc('month', CURRENT_DATE - (_months || ' months')::interval),
        date_trunc('month', CURRENT_DATE),
        '1 month'::interval
      )::date AS month_date
  )
  SELECT 
    to_char(m.month_date, 'Mon') AS month,
    COALESCE(SUM(s.price), 0) AS revenue
  FROM months m
  LEFT JOIN appointments a ON 
    date_trunc('month', a.scheduled_date) = m.month_date
    AND a.pet_shop_id = _pet_shop_id
    AND a.status = 'completed'
  LEFT JOIN services s ON s.id = a.service_id
  GROUP BY m.month_date
  ORDER BY m.month_date;
$$;

-- Get Peak Hours function
CREATE OR REPLACE FUNCTION public.get_peak_hours(_pet_shop_id UUID, _days_back INTEGER DEFAULT 30)
RETURNS TABLE(hour INTEGER, appointment_count BIGINT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM scheduled_time)::INTEGER as hour,
    COUNT(*) as appointment_count
  FROM appointments
  WHERE pet_shop_id = _pet_shop_id
    AND scheduled_date >= CURRENT_DATE - _days_back
    AND status IN ('completed', 'confirmed', 'in_progress')
  GROUP BY EXTRACT(HOUR FROM scheduled_time)
  ORDER BY hour;
END;
$$;

-- Get No Show Stats function
CREATE OR REPLACE FUNCTION public.get_no_show_stats(_pet_shop_id UUID, _date_start DATE DEFAULT (CURRENT_DATE - 30), _date_end DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_appointments', COUNT(*),
    'no_shows', COUNT(*) FILTER (WHERE status = 'cancelled' AND scheduled_date < CURRENT_DATE),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'no_show_rate', 
      CASE 
        WHEN COUNT(*) > 0 
        THEN (COUNT(*) FILTER (WHERE status = 'cancelled' AND scheduled_date < CURRENT_DATE)::FLOAT / COUNT(*) * 100)
        ELSE 0 
      END
  ) INTO result
  FROM appointments
  WHERE pet_shop_id = _pet_shop_id
    AND scheduled_date BETWEEN _date_start AND _date_end;
    
  RETURN result;
END;
$$;

-- Get Appointments by Service function
CREATE OR REPLACE FUNCTION public.get_appointments_by_service(_pet_shop_id UUID, _days_back INTEGER DEFAULT 30)
RETURNS TABLE(service_name TEXT, service_count BIGINT, revenue NUMERIC, avg_duration INTEGER)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.name as service_name,
    COUNT(a.id) as service_count,
    COALESCE(SUM(s.price), 0) as revenue,
    AVG(s.duration_minutes)::INTEGER as avg_duration
  FROM appointments a
  JOIN services s ON s.id = a.service_id
  WHERE a.pet_shop_id = _pet_shop_id
    AND a.scheduled_date >= CURRENT_DATE - _days_back
    AND a.status = 'completed'
  GROUP BY s.name, s.id
  ORDER BY service_count DESC;
END;
$$;

-- Get System Health function
CREATE OR REPLACE FUNCTION public.get_system_health()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'overdue_appointments', (
      SELECT COUNT(*) FROM appointments 
      WHERE scheduled_date < CURRENT_DATE 
        AND status IN ('pending', 'confirmed')
    ),
    'low_stock_products', (
      SELECT COUNT(*) FROM products 
      WHERE stock_quantity <= min_stock_quantity 
        AND active = true
    ),
    'negative_stock_products', (
      SELECT COUNT(*) FROM products 
      WHERE stock_quantity < 0
    ),
    'pending_payments', (
      SELECT COUNT(*) FROM payments 
      WHERE status = 'pendente'
    ),
    'incomplete_profiles', (
      SELECT COUNT(*) FROM profiles 
      WHERE full_name = '' OR phone = ''
    ),
    'expired_products', (
      SELECT COUNT(*) FROM products 
      WHERE expiry_date < CURRENT_DATE 
        AND active = true
    ),
    'last_check', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Get System Stats function
CREATE OR REPLACE FUNCTION public.get_system_stats()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_pet_shops', (SELECT COUNT(*) FROM pet_shops),
    'total_appointments_today', (SELECT COUNT(*) FROM appointments WHERE scheduled_date = CURRENT_DATE),
    'errors_last_24h', (SELECT COUNT(*) FROM system_logs WHERE log_type = 'error' AND created_at > now() - interval '24 hours'),
    'warnings_last_24h', (SELECT COUNT(*) FROM system_logs WHERE log_type = 'warning' AND created_at > now() - interval '24 hours')
  );
$$;

-- Get Security Stats function
CREATE OR REPLACE FUNCTION public.get_security_stats()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'active_mfa_users', (
      SELECT COUNT(DISTINCT user_id) FROM mfa_secrets WHERE enabled = true
    ),
    'unresolved_alerts', (
      SELECT COUNT(*) FROM security_alerts WHERE resolved = false
    ),
    'critical_alerts_24h', (
      SELECT COUNT(*) FROM security_alerts 
      WHERE severity = 'critical' 
        AND created_at > now() - interval '24 hours'
    ),
    'failed_logins_24h', (
      SELECT COUNT(*) FROM login_attempts 
      WHERE success = false 
        AND attempt_time > now() - interval '24 hours'
    ),
    'successful_logins_24h', (
      SELECT COUNT(*) FROM login_attempts 
      WHERE success = true 
        AND attempt_time > now() - interval '24 hours'
    ),
    'total_backups', (
      SELECT COUNT(*) FROM backup_history WHERE status = 'completed'
    )
  );
$$;

-- Audit Trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    table_name,
    operation,
    record_id,
    old_data,
    new_data
  ) VALUES (
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

-- Auto Block IP If Needed function
CREATE OR REPLACE FUNCTION public.auto_block_ip_if_needed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  failed_count INTEGER;
BEGIN
  IF NEW.success = false AND NEW.ip_address IS NOT NULL THEN
    SELECT COUNT(*) INTO failed_count
    FROM public.login_attempts
    WHERE ip_address = NEW.ip_address
      AND success = false
      AND attempt_time > NOW() - INTERVAL '1 hour';
    
    IF failed_count >= 10 THEN
      INSERT INTO public.blocked_ips (
        ip_address,
        blocked_until,
        reason,
        auto_blocked
      ) VALUES (
        NEW.ip_address,
        NOW() + INTERVAL '24 hours',
        'Bloqueio automático: ' || failed_count || ' tentativas falhadas em 1 hora',
        true
      )
      ON CONFLICT (ip_address) 
      DO UPDATE SET
        blocked_until = NOW() + INTERVAL '24 hours',
        blocked_at = NOW(),
        reason = 'Bloqueio automático: ' || failed_count || ' tentativas falhadas em 1 hora';
      
      INSERT INTO public.security_alerts (
        alert_type,
        severity,
        description,
        ip_address,
        metadata
      ) VALUES (
        'ip_blocked',
        'high',
        'IP bloqueado automaticamente após ' || failed_count || ' tentativas falhadas',
        NEW.ip_address,
        jsonb_build_object(
          'failed_attempts', failed_count,
          'blocked_until', NOW() + INTERVAL '24 hours'
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create Payment On Complete function
CREATE OR REPLACE FUNCTION public.create_payment_on_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  service_price NUMERIC;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    SELECT price INTO service_price
    FROM services
    WHERE id = NEW.service_id;
    
    IF NOT EXISTS (SELECT 1 FROM payments WHERE appointment_id = NEW.id) THEN
      INSERT INTO payments (
        appointment_id,
        amount,
        payment_method,
        status
      ) VALUES (
        NEW.id,
        service_price,
        'dinheiro',
        'pendente'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Notify New Appointment function
CREATE OR REPLACE FUNCTION public.notify_new_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO notifications (
    client_id,
    appointment_id,
    notification_type,
    channel,
    message,
    status
  ) VALUES (
    NEW.client_id,
    NEW.id,
    'confirmacao',
    'email',
    'Seu agendamento foi confirmado para ' || NEW.scheduled_date || ' às ' || NEW.scheduled_time,
    'pendente'
  );
  
  RETURN NEW;
END;
$$;

-- Log Stock Movement function
CREATE OR REPLACE FUNCTION public.log_stock_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  movement_quantity INTEGER;
  movement_type TEXT;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.stock_quantity != OLD.stock_quantity THEN
    movement_quantity := ABS(NEW.stock_quantity - OLD.stock_quantity);
    movement_type := CASE 
      WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'entrada'
      ELSE 'saida'
    END;
    
    INSERT INTO stock_movements (
      product_id,
      movement_type,
      quantity,
      reason,
      user_id
    ) VALUES (
      NEW.id,
      movement_type,
      movement_quantity,
      'Ajuste automático detectado',
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Cleanup Old Login Attempts function
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.login_attempts
  WHERE attempt_time < now() - interval '7 days';
END;
$$;

-- Cleanup Expired MFA Sessions function
CREATE OR REPLACE FUNCTION public.cleanup_expired_mfa_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.mfa_sessions
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Cleanup Expired Blocks function
CREATE OR REPLACE FUNCTION public.cleanup_expired_blocks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.blocked_ips
  WHERE blocked_until < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Cleanup Expired Reset Codes function
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_codes()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.password_resets
  WHERE expires_at < now() OR used = true;
END;
$$;

-- Cleanup Expired Invites function
CREATE OR REPLACE FUNCTION public.cleanup_expired_invites()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.admin_invites
  WHERE expires_at < now() AND accepted = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Mark Alert Read function
CREATE OR REPLACE FUNCTION public.mark_alert_read(alert_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.admin_alerts
  SET 
    read = true,
    read_at = now(),
    read_by = auth.uid()
  WHERE id = alert_id;
  
  RETURN FOUND;
END;
$$;

-- Create Critical Alert function
CREATE OR REPLACE FUNCTION public.create_critical_alert(p_title TEXT, p_message TEXT, p_alert_type TEXT DEFAULT 'system_error', p_context JSONB DEFAULT '{}')
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO public.admin_alerts (
    alert_type,
    severity,
    title,
    message,
    context
  ) VALUES (
    p_alert_type,
    'critical',
    p_title,
    p_message,
    p_context
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

-- Get Notification Queue Stats function
CREATE OR REPLACE FUNCTION public.get_notification_queue_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN jsonb_build_object(
    'pending', (SELECT COUNT(*) FROM notifications_log WHERE status = 'pending'),
    'processing', (SELECT COUNT(*) FROM notifications_log WHERE status = 'processing'),
    'failed', (SELECT COUNT(*) FROM notifications_log WHERE status = 'failed'),
    'sent_today', (SELECT COUNT(*) FROM notifications_log WHERE status = 'sent' AND sent_at >= CURRENT_DATE)
  );
END;
$$;

-- Has Feature function
CREATE OR REPLACE FUNCTION public.has_feature(_user_id UUID, _feature_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_plan TEXT;
  feature_value JSONB;
BEGIN
  SELECT ps.subscription_plan INTO user_plan
  FROM public.pet_shops ps
  WHERE ps.owner_id = _user_id
  LIMIT 1;
  
  IF user_plan IS NULL THEN
    SELECT ps.subscription_plan INTO user_plan
    FROM public.pet_shops ps
    JOIN public.petshop_employees pe ON pe.pet_shop_id = ps.id
    WHERE pe.user_id = _user_id AND pe.active = true
    LIMIT 1;
  END IF;
  
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;
  
  SELECT pf.feature_value INTO feature_value
  FROM public.plan_features pf
  WHERE pf.plan_name = user_plan
    AND pf.feature_key = _feature_key;
  
  IF feature_value IS NULL THEN
    RETURN 'false'::jsonb;
  END IF;
  
  RETURN feature_value;
END;
$$;

-- Check Employee Limit function
CREATE OR REPLACE FUNCTION public.check_employee_limit(_pet_shop_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_plan TEXT;
  user_limit INTEGER;
  current_count INTEGER;
BEGIN
  SELECT subscription_plan INTO current_plan
  FROM pet_shops
  WHERE id = _pet_shop_id;
  
  SELECT CAST(feature_value AS INTEGER) INTO user_limit
  FROM plan_features
  WHERE plan_name = current_plan
    AND feature_key = 'multi_user_limit';
  
  IF user_limit IS NULL THEN
    user_limit := 1;
  END IF;
  
  SELECT COUNT(*) INTO current_count
  FROM petshop_employees
  WHERE pet_shop_id = _pet_shop_id
    AND active = true;
  
  RETURN current_count < user_limit;
END;
$$;

-- Log Access function
CREATE OR REPLACE FUNCTION public.log_access(_user_id UUID, _pet_shop_id UUID, _module public.app_module, _action public.app_action, _resource_id UUID DEFAULT NULL, _resource_type TEXT DEFAULT NULL, _success BOOLEAN DEFAULT TRUE, _metadata JSONB DEFAULT '{}')
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _audit_id uuid;
BEGIN
  INSERT INTO access_audit (
    user_id,
    pet_shop_id,
    module,
    action,
    resource_id,
    resource_type,
    success,
    metadata
  ) VALUES (
    _user_id,
    _pet_shop_id,
    _module,
    _action,
    _resource_id,
    _resource_type,
    _success,
    _metadata
  )
  RETURNING id INTO _audit_id;
  
  RETURN _audit_id;
END;
$$;

-- Calculate Distance function
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 NUMERIC, lon1 NUMERIC, lat2 NUMERIC, lon2 NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
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
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN radius * c;
END;
$$;

-- Find Nearby Pet Shops function
CREATE OR REPLACE FUNCTION public.find_nearby_pet_shops(client_lat NUMERIC, client_lng NUMERIC, radius_km NUMERIC DEFAULT 50, limit_results INTEGER DEFAULT 20)
RETURNS TABLE(id UUID, name TEXT, address TEXT, city TEXT, state TEXT, latitude NUMERIC, longitude NUMERIC, distance_km NUMERIC, phone TEXT, email TEXT, logo_url TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.name,
    ps.address,
    ps.city,
    ps.state,
    ps.latitude,
    ps.longitude,
    calculate_distance(client_lat, client_lng, ps.latitude, ps.longitude) as distance_km,
    ps.phone,
    ps.email,
    ps.logo_url
  FROM pet_shops ps
  WHERE 
    ps.latitude IS NOT NULL 
    AND ps.longitude IS NOT NULL
    AND ps.deleted_at IS NULL
    AND calculate_distance(client_lat, client_lng, ps.latitude, ps.longitude) <= radius_km
  ORDER BY distance_km ASC
  LIMIT limit_results;
END;
$$;

-- ============================================
-- PHASE 11: TRIGGERS
-- ============================================

-- Trigger: Create profile on new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pet_shops_updated_at
  BEFORE UPDATE ON public.pet_shops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_franchises_updated_at
  BEFORE UPDATE ON public.franchises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_settings_updated_at
  BEFORE UPDATE ON public.whatsapp_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_passwords_updated_at
  BEFORE UPDATE ON public.settings_passwords
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mfa_secrets_updated_at
  BEFORE UPDATE ON public.mfa_secrets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_notification_preferences_updated_at
  BEFORE UPDATE ON public.admin_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Business logic triggers
CREATE TRIGGER on_appointment_completed
  AFTER UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.create_payment_on_complete();

CREATE TRIGGER on_new_appointment
  AFTER INSERT ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_appointment();

CREATE TRIGGER on_stock_change
  AFTER UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.log_stock_movement();

-- Security triggers
CREATE TRIGGER on_login_attempt_check_block
  AFTER INSERT ON public.login_attempts
  FOR EACH ROW EXECUTE FUNCTION public.auto_block_ip_if_needed();

-- Audit triggers for critical tables
CREATE TRIGGER audit_appointments
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_pet_shops
  AFTER INSERT OR UPDATE OR DELETE ON public.pet_shops
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_services
  AFTER INSERT OR UPDATE OR DELETE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- ============================================
-- PHASE 12: ENABLE ROW LEVEL SECURITY
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
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satisfaction_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_events_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_changes_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structured_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoramento_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_jobs ENABLE ROW LEVEL SECURITY;
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
-- PHASE 13: RLS POLICIES
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "God user full access profiles" ON public.profiles FOR ALL USING (is_god_user(auth.uid()));

-- User Roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "God user full access user_roles" ON public.user_roles FOR ALL USING (is_god_user(auth.uid()));

-- Pet Shops policies
CREATE POLICY "Owners can manage own shop" ON public.pet_shops FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Public can view active shops" ON public.pet_shops FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Employees can view shop" ON public.pet_shops FOR SELECT USING (is_employee_of_petshop(auth.uid(), id));
CREATE POLICY "Admins can manage all shops" ON public.pet_shops FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "God user full access pet_shops" ON public.pet_shops FOR ALL USING (is_god_user(auth.uid()));

-- Pets policies
CREATE POLICY "Owners can manage own pets" ON public.pets FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Pet shops can view client pets" ON public.pets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM appointments a
    JOIN pet_shops ps ON ps.id = a.pet_shop_id
    WHERE a.pet_id = pets.id AND (ps.owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), ps.id))
  )
);
CREATE POLICY "Admins can view all pets" ON public.pets FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "God user full access pets" ON public.pets FOR ALL USING (is_god_user(auth.uid()));

-- Services policies
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (active = true);
CREATE POLICY "Owners can manage services" ON public.services FOR ALL USING (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Employees can manage services" ON public.services FOR ALL USING (is_employee_of_petshop(auth.uid(), pet_shop_id));
CREATE POLICY "God user full access services" ON public.services FOR ALL USING (is_god_user(auth.uid()));

-- Appointments policies
CREATE POLICY "Clients can view own appointments" ON public.appointments FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Clients can create appointments" ON public.appointments FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Clients can update own appointments" ON public.appointments FOR UPDATE USING (client_id = auth.uid());
CREATE POLICY "Pet shops can view appointments" ON public.appointments FOR SELECT USING (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid()) OR is_employee_of_petshop(auth.uid(), pet_shop_id)
);
CREATE POLICY "Pet shops can manage appointments" ON public.appointments FOR ALL USING (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid()) OR is_employee_of_petshop(auth.uid(), pet_shop_id)
);
CREATE POLICY "Admins can view all appointments" ON public.appointments FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "God user full access appointments" ON public.appointments FOR ALL USING (is_god_user(auth.uid()));

-- Payments policies
CREATE POLICY "Clients can view own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM appointments WHERE appointments.id = payments.appointment_id AND appointments.client_id = auth.uid())
);
CREATE POLICY "Pet shops can manage payments" ON public.payments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM appointments a
    JOIN pet_shops ps ON ps.id = a.pet_shop_id
    WHERE a.id = payments.appointment_id AND (ps.owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), ps.id))
  )
);
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "God user full access payments" ON public.payments FOR ALL USING (is_god_user(auth.uid()));

-- Products policies
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (active = true AND deleted_at IS NULL);
CREATE POLICY "Pet shops can manage products" ON public.products FOR ALL USING (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid()) OR is_employee_of_petshop(auth.uid(), pet_shop_id)
);
CREATE POLICY "God user full access products" ON public.products FOR ALL USING (is_god_user(auth.uid()));

-- Stock Movements policies
CREATE POLICY "Pet shops can view stock movements" ON public.stock_movements FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN pet_shops ps ON ps.id = p.pet_shop_id
    WHERE p.id = stock_movements.product_id AND (ps.owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), ps.id))
  )
);

-- Employee Permissions policies
CREATE POLICY "Pet shop owners can manage employee permissions" ON public.employee_permissions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM petshop_employees pe
    JOIN pet_shops ps ON ps.id = pe.pet_shop_id
    WHERE pe.id = employee_permissions.employee_id AND ps.owner_id = auth.uid()
  )
);
CREATE POLICY "Employees can view own permissions" ON public.employee_permissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM petshop_employees WHERE id = employee_permissions.employee_id AND user_id = auth.uid())
);

-- Commissions policies
CREATE POLICY "Pet shops can manage commissions" ON public.commissions FOR ALL USING (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid()) OR is_employee_of_petshop(auth.uid(), pet_shop_id)
);
CREATE POLICY "Employees can view own commissions" ON public.commissions FOR SELECT USING (employee_id = auth.uid());

-- Loyalty Points policies
CREATE POLICY "Clients can view own loyalty points" ON public.loyalty_points FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Pet shops can manage loyalty points" ON public.loyalty_points FOR ALL USING (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid())
);

-- Loyalty Transactions policies
CREATE POLICY "Users can view own loyalty transactions" ON public.loyalty_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM loyalty_points lp WHERE lp.id = loyalty_transactions.loyalty_points_id AND lp.client_id = auth.uid())
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Notifications Log policies
CREATE POLICY "Admins can view notification logs" ON public.notifications_log FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own notification logs" ON public.notifications_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM notifications n WHERE n.id = notifications_log.notification_id AND n.client_id = auth.uid())
);

-- Marketing Campaigns policies
CREATE POLICY "Pet shops can manage campaigns" ON public.marketing_campaigns FOR ALL USING (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid())
);

-- Pet Photos policies
CREATE POLICY "Owners can manage pet photos" ON public.pet_photos FOR ALL USING (
  EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_photos.pet_id AND pets.owner_id = auth.uid())
);
CREATE POLICY "Pet shops can view pet photos" ON public.pet_photos FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM appointments a
    JOIN pet_shops ps ON ps.id = a.pet_shop_id
    WHERE a.pet_id = pet_photos.pet_id AND (ps.owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), ps.id))
  )
);

-- Satisfaction Surveys policies
CREATE POLICY "Clients can create surveys" ON public.satisfaction_surveys FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Pet shops can view surveys" ON public.satisfaction_surveys FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM appointments a
    JOIN pet_shops ps ON ps.id = a.pet_shop_id
    WHERE a.id = satisfaction_surveys.appointment_id AND ps.owner_id = auth.uid()
  )
);

-- WhatsApp Settings policies
CREATE POLICY "Pet shops can manage whatsapp settings" ON public.whatsapp_settings FOR ALL USING (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid())
);

-- Settings Passwords policies
CREATE POLICY "Pet shop owners can manage settings passwords" ON public.settings_passwords FOR ALL USING (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all settings passwords" ON public.settings_passwords FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Plan Features policies
CREATE POLICY "Everyone can read plan features" ON public.plan_features FOR SELECT USING (true);
CREATE POLICY "Admins can manage plan features" ON public.plan_features FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Login Attempts policies
CREATE POLICY "System can insert login attempts" ON public.login_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view login attempts" ON public.login_attempts FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "God user full access login_attempts" ON public.login_attempts FOR ALL USING (is_god_user(auth.uid()));

-- Blocked IPs policies
CREATE POLICY "System can insert blocked IPs" ON public.blocked_ips FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view blocked IPs" ON public.blocked_ips FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage blocked IPs" ON public.blocked_ips FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Security Alerts policies
CREATE POLICY "Admins can view security alerts" ON public.security_alerts FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert security alerts" ON public.security_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update security alerts" ON public.security_alerts FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Security Notifications policies
CREATE POLICY "Admins can view security notifications" ON public.security_notifications FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert security notifications" ON public.security_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update security notifications" ON public.security_notifications FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Audit Logs policies
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "God user full access audit_logs" ON public.audit_logs FOR ALL USING (is_god_user(auth.uid()));

-- Auth Events Log policies
CREATE POLICY "System can insert auth events" ON public.auth_events_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view auth events" ON public.auth_events_log FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "God user full access auth_events_log" ON public.auth_events_log FOR ALL USING (is_god_user(auth.uid()));

-- Role Changes Audit policies
CREATE POLICY "Admins can view role changes" ON public.role_changes_audit FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Access Audit policies
CREATE POLICY "Users can view own access audit" ON public.access_audit FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all access audit" ON public.access_audit FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- System Logs policies
CREATE POLICY "Admins can view system logs" ON public.system_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert logs" ON public.system_logs FOR INSERT WITH CHECK (true);

-- Structured Logs policies
CREATE POLICY "Admins can view structured logs" ON public.structured_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert structured logs" ON public.structured_logs FOR INSERT WITH CHECK (true);

-- MFA Secrets policies
CREATE POLICY "Users can manage own MFA secrets" ON public.mfa_secrets FOR ALL USING (user_id = auth.uid());

-- MFA Backup Codes policies
CREATE POLICY "Users can manage own backup codes" ON public.mfa_backup_codes FOR ALL USING (user_id = auth.uid());

-- MFA Sessions policies
CREATE POLICY "Users can manage own MFA sessions" ON public.mfa_sessions FOR ALL USING (user_id = auth.uid());

-- Password Resets policies
CREATE POLICY "Anyone can request password reset" ON public.password_resets FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update password resets" ON public.password_resets FOR UPDATE USING (true);

-- Admin Alerts policies
CREATE POLICY "Admins can view admin alerts" ON public.admin_alerts FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update admin alerts" ON public.admin_alerts FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert admin alerts" ON public.admin_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "God user full access admin_alerts" ON public.admin_alerts FOR ALL USING (is_god_user(auth.uid()));

-- Admin Invites policies
CREATE POLICY "Admins can manage invites" ON public.admin_invites FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view own invite" ON public.admin_invites FOR SELECT USING (true);

-- Admin Notification Preferences policies
CREATE POLICY "Admins can manage own preferences" ON public.admin_notification_preferences FOR ALL USING (admin_id = auth.uid() AND has_role(auth.uid(), 'admin'));

-- IP Whitelist policies
CREATE POLICY "Admins can manage IP whitelist" ON public.ip_whitelist FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Impersonation Sessions policies
CREATE POLICY "Admins can manage impersonation sessions" ON public.impersonation_sessions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Backup History policies
CREATE POLICY "Admins can manage backup history" ON public.backup_history FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "God user full access backup_history" ON public.backup_history FOR ALL USING (is_god_user(auth.uid()));

-- Backup Verifications policies
CREATE POLICY "Admins can manage backup verifications" ON public.backup_verifications FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Professional Backups policies
CREATE POLICY "Pet shop owners can manage backups" ON public.professional_backups FOR ALL USING (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid())
);

-- System Health Metrics policies
CREATE POLICY "Admins can view health metrics" ON public.system_health_metrics FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "God user full access system_health" ON public.system_health_metrics FOR ALL USING (is_god_user(auth.uid()));

-- Daily Health Reports policies
CREATE POLICY "Admins can view health reports" ON public.daily_health_reports FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Monitoramento Sistema policies
CREATE POLICY "Admins can view monitoramento" ON public.monitoramento_sistema FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Global Metrics policies
CREATE POLICY "Everyone can read global metrics" ON public.global_metrics FOR SELECT USING (true);
CREATE POLICY "Admins can manage global metrics" ON public.global_metrics FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Failed Jobs policies
CREATE POLICY "Admins can manage failed jobs" ON public.failed_jobs FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Tenants policies
CREATE POLICY "Users can view own tenants" ON public.tenants FOR SELECT USING (has_tenant_access(auth.uid(), id) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Tenant admins can update tenants" ON public.tenants FOR UPDATE USING (is_tenant_admin(auth.uid(), id) OR has_role(auth.uid(), 'admin'));

-- Franchises policies
CREATE POLICY "Users can view franchises in tenant" ON public.franchises FOR SELECT USING (has_tenant_access(auth.uid(), tenant_id) OR owner_id = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Tenant admins can create franchises" ON public.franchises FOR INSERT WITH CHECK (is_tenant_admin(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Franchise owners can update franchise" ON public.franchises FOR UPDATE USING (owner_id = auth.uid() OR is_tenant_admin(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'));

-- User Hierarchy policies
CREATE POLICY "Users can view own hierarchy" ON public.user_hierarchy FOR SELECT USING (user_id = auth.uid() OR is_tenant_admin(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Tenant admins can manage hierarchy" ON public.user_hierarchy FOR ALL USING (is_tenant_admin(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'));

-- Brand Standards policies
CREATE POLICY "Users can view standards in tenant" ON public.brand_standards FOR SELECT USING (has_tenant_access(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Tenant admins can manage standards" ON public.brand_standards FOR ALL USING (is_tenant_admin(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'));

-- Compliance Audits policies
CREATE POLICY "Users can view audits" ON public.compliance_audits FOR SELECT USING (
  EXISTS (SELECT 1 FROM pet_shops WHERE id = compliance_audits.unit_id AND owner_id = auth.uid()) OR has_role(auth.uid(), 'admin')
);

-- Success Stories policies
CREATE POLICY "Anyone can view approved stories" ON public.success_stories FOR SELECT USING (approved = true);
CREATE POLICY "Pet shops can manage own stories" ON public.success_stories FOR ALL USING (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all stories" ON public.success_stories FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Push Subscriptions policies
CREATE POLICY "Users can manage own push subscriptions" ON public.push_subscriptions FOR ALL USING (user_id = auth.uid());

-- SMS Verifications policies
CREATE POLICY "Users can manage own SMS verifications" ON public.sms_verifications FOR ALL USING (user_id = auth.uid());

-- Webhook Endpoints policies
CREATE POLICY "Admins can manage webhook endpoints" ON public.webhook_endpoints FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Webhook Logs policies
CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Petshop Employees policies
CREATE POLICY "Pet shop owners can manage employees" ON public.petshop_employees FOR ALL USING (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Employees can view themselves" ON public.petshop_employees FOR SELECT USING (user_id = auth.uid());

-- Permissions policies
CREATE POLICY "Anyone can view permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Admin API Rate Limits policies
CREATE POLICY "Admins can view rate limits" ON public.admin_api_rate_limits FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- PHASE 14: STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('backups', 'backups', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for pet-photos bucket
CREATE POLICY "Pet photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'pet-photos');
CREATE POLICY "Users can upload pet photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pet-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own pet photos" ON storage.objects FOR DELETE USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for backups bucket (admin only)
CREATE POLICY "Admins can manage backups" ON storage.objects FOR ALL USING (bucket_id = 'backups' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for documents bucket
CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload own documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- PHASE 15: SEED DATA (PLAN FEATURES)
-- ============================================

INSERT INTO public.plan_features (plan_name, feature_key, feature_value, description) VALUES
('gratuito', 'max_appointments_month', '30', 'Máximo de agendamentos por mês'),
('gratuito', 'max_services', '5', 'Máximo de serviços cadastrados'),
('gratuito', 'multi_user_limit', '1', 'Número de usuários permitidos'),
('gratuito', 'reports', 'false', 'Acesso a relatórios'),
('gratuito', 'marketing', 'false', 'Acesso a marketing'),
('pet_gold', 'max_appointments_month', '100', 'Máximo de agendamentos por mês'),
('pet_gold', 'max_services', '20', 'Máximo de serviços cadastrados'),
('pet_gold', 'multi_user_limit', '3', 'Número de usuários permitidos'),
('pet_gold', 'reports', 'true', 'Acesso a relatórios'),
('pet_gold', 'marketing', 'true', 'Acesso a marketing'),
('pet_gold', 'whatsapp_integration', 'true', 'Integração WhatsApp'),
('pet_platinum', 'max_appointments_month', 'unlimited', 'Agendamentos ilimitados'),
('pet_platinum', 'max_services', 'unlimited', 'Serviços ilimitados'),
('pet_platinum', 'multi_user_limit', '5', 'Número de usuários permitidos'),
('pet_platinum', 'reports', 'true', 'Acesso a relatórios avançados'),
('pet_platinum', 'marketing', 'true', 'Acesso a marketing avançado'),
('pet_platinum', 'whatsapp_integration', 'true', 'Integração WhatsApp'),
('pet_platinum', 'api_access', 'true', 'Acesso à API'),
('pet_platinum', 'priority_support', 'true', 'Suporte prioritário');

-- ============================================
-- PHASE 16: GLOBAL METRICS SEED
-- ============================================

INSERT INTO public.global_metrics (metric_name, metric_type, metric_value, description) VALUES
('total_active_petshops', 'count', 0, 'Total de pet shops ativos'),
('total_appointments', 'count', 0, 'Total de agendamentos realizados'),
('average_satisfaction', 'average', 0, 'Média de satisfação dos clientes'),
('cities_covered', 'count', 0, 'Número de cidades atendidas'),
('average_growth_percent', 'percentage', 0, 'Crescimento médio dos pet shops');

-- ============================================
-- PHASE 17: REALTIME PUBLICATIONS
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify migration
DO $$
DECLARE
  table_count INTEGER;
  function_count INTEGER;
  trigger_count INTEGER;
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  SELECT COUNT(*) INTO function_count FROM information_schema.routines WHERE routine_schema = 'public';
  SELECT COUNT(*) INTO trigger_count FROM information_schema.triggers WHERE trigger_schema = 'public';
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
  
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '📊 Tables created: %', table_count;
  RAISE NOTICE '🔧 Functions created: %', function_count;
  RAISE NOTICE '⚡ Triggers created: %', trigger_count;
  RAISE NOTICE '🔐 RLS Policies created: %', policy_count;
END $$;
