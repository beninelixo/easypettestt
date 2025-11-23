-- ============================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- Phase 4: Otimizações de Performance
-- ============================================

-- Appointments Performance Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_pet_shop_date 
  ON appointments(pet_shop_id, scheduled_date) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_client 
  ON appointments(client_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_status_date 
  ON appointments(status, scheduled_date) 
  WHERE deleted_at IS NULL;

-- Payments Performance Indexes
CREATE INDEX IF NOT EXISTS idx_payments_appointment 
  ON payments(appointment_id);

CREATE INDEX IF NOT EXISTS idx_payments_status_date 
  ON payments(status, created_at);

-- Profiles Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_phone 
  ON profiles(phone) 
  WHERE phone IS NOT NULL;

-- Employee Permissions Performance Indexes
CREATE INDEX IF NOT EXISTS idx_employee_permissions_employee 
  ON employee_permissions(employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_permissions_permission 
  ON employee_permissions(permission_id);

-- Pet Shops Performance Indexes
CREATE INDEX IF NOT EXISTS idx_pet_shops_owner 
  ON pet_shops(owner_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pet_shops_subscription 
  ON pet_shops(subscription_plan, subscription_expires_at);

-- Pets Performance Indexes
CREATE INDEX IF NOT EXISTS idx_pets_owner 
  ON pets(owner_id) 
  WHERE deleted_at IS NULL;

-- Services Performance Indexes
CREATE INDEX IF NOT EXISTS idx_services_pet_shop_active 
  ON services(pet_shop_id, active) 
  WHERE deleted_at IS NULL;

-- Audit Logs Performance Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_table 
  ON audit_logs(user_id, table_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
  ON audit_logs(created_at DESC);

-- Login Attempts Performance Indexes
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time 
  ON login_attempts(email, attempt_time DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time 
  ON login_attempts(ip_address, attempt_time DESC) 
  WHERE ip_address IS NOT NULL;

-- Admin Alerts Performance Indexes
CREATE INDEX IF NOT EXISTS idx_admin_alerts_unread 
  ON admin_alerts(created_at DESC) 
  WHERE read = false AND resolved = false;

CREATE INDEX IF NOT EXISTS idx_admin_alerts_severity 
  ON admin_alerts(severity, created_at DESC);

-- ============================================
-- PLAN FEATURES CONFIGURATION
-- Adicionar limites de usuários por plano
-- ============================================

-- Inserir feature de limite de usuários se não existir
INSERT INTO plan_features (plan_name, feature_key, feature_value, description)
VALUES 
  ('gratuito', 'multi_user_limit', '1', 'Plano gratuito permite apenas o dono'),
  ('pet_gold', 'multi_user_limit', '3', 'Plano Pet Gold permite até 3 usuários adicionais'),
  ('pet_platinum', 'multi_user_limit', '5', 'Plano Pet Platinum permite até 5 usuários adicionais')
ON CONFLICT (plan_name, feature_key) DO UPDATE 
SET feature_value = EXCLUDED.feature_value,
    description = EXCLUDED.description;

-- Criar função para verificar limite de usuários
CREATE OR REPLACE FUNCTION public.check_employee_limit(_pet_shop_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_plan TEXT;
  user_limit INTEGER;
  current_count INTEGER;
BEGIN
  -- Get pet shop plan
  SELECT subscription_plan INTO current_plan
  FROM pet_shops
  WHERE id = _pet_shop_id;
  
  -- Get limit for plan
  SELECT CAST(feature_value AS INTEGER) INTO user_limit
  FROM plan_features
  WHERE plan_name = current_plan
    AND feature_key = 'multi_user_limit';
  
  -- Default to 1 if not found
  IF user_limit IS NULL THEN
    user_limit := 1;
  END IF;
  
  -- Get current active employee count
  SELECT COUNT(*) INTO current_count
  FROM petshop_employees
  WHERE pet_shop_id = _pet_shop_id
    AND active = true;
  
  -- Return true if under limit
  RETURN current_count < user_limit;
END;
$$;

COMMENT ON FUNCTION public.check_employee_limit IS 'Check if pet shop can add more employees based on plan';