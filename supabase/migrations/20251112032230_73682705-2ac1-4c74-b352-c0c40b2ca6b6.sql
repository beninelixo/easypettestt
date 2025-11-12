-- Admin Notification Preferences System
-- Allows admins to configure which alerts they want to receive via different channels

-- ============================================================================
-- 1. NOTIFICATION PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Channel preferences
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  whatsapp_enabled BOOLEAN NOT NULL DEFAULT false,
  
  -- Alert type preferences
  security_alerts BOOLEAN NOT NULL DEFAULT true,
  system_health_alerts BOOLEAN NOT NULL DEFAULT true,
  backup_alerts BOOLEAN NOT NULL DEFAULT true,
  payment_alerts BOOLEAN NOT NULL DEFAULT true,
  user_activity_alerts BOOLEAN NOT NULL DEFAULT false,
  performance_alerts BOOLEAN NOT NULL DEFAULT true,
  
  -- Contact information
  whatsapp_number TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(admin_id)
);

-- Enable RLS
ALTER TABLE public.admin_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Admins can manage their own preferences
CREATE POLICY "Admins manage own notification preferences"
ON public.admin_notification_preferences
FOR ALL
USING (
  auth.uid() = admin_id 
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  auth.uid() = admin_id 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Super admins can view all preferences
CREATE POLICY "Super admins view all preferences"
ON public.admin_notification_preferences
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_admin_notification_preferences_admin_id 
ON public.admin_notification_preferences(admin_id);

-- Trigger to update updated_at
CREATE TRIGGER update_admin_notification_preferences_updated_at
BEFORE UPDATE ON public.admin_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 2. BACKUP VERIFICATION SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.backup_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID NOT NULL REFERENCES public.backup_history(id) ON DELETE CASCADE,
  
  -- Verification details
  verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'in_progress', 'success', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Validation results
  tables_verified INTEGER DEFAULT 0,
  records_verified INTEGER DEFAULT 0,
  integrity_checks_passed INTEGER DEFAULT 0,
  integrity_checks_failed INTEGER DEFAULT 0,
  
  -- Detailed results
  verification_results JSONB DEFAULT '{}',
  error_message TEXT,
  
  -- Metadata
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.backup_verifications ENABLE ROW LEVEL SECURITY;

-- Only admins can access verification results
CREATE POLICY "Admins manage backup verifications"
ON public.backup_verifications
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_backup_verifications_backup_id 
ON public.backup_verifications(backup_id);

CREATE INDEX idx_backup_verifications_status 
ON public.backup_verifications(verification_status);

CREATE INDEX idx_backup_verifications_created_at 
ON public.backup_verifications(created_at DESC);

-- ============================================================================
-- 3. HELPER FUNCTION: Get admin notification preferences
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_admin_notification_preferences(
  _admin_id UUID,
  _alert_type TEXT,
  _channel TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  preferences RECORD;
  should_notify BOOLEAN := false;
BEGIN
  -- Get admin preferences
  SELECT * INTO preferences
  FROM public.admin_notification_preferences
  WHERE admin_id = _admin_id;
  
  -- If no preferences found, use defaults
  IF NOT FOUND THEN
    RETURN true; -- Default to enabled
  END IF;
  
  -- Check if channel is enabled
  IF _channel = 'email' AND NOT preferences.email_enabled THEN
    RETURN false;
  ELSIF _channel = 'push' AND NOT preferences.push_enabled THEN
    RETURN false;
  ELSIF _channel = 'whatsapp' AND NOT preferences.whatsapp_enabled THEN
    RETURN false;
  END IF;
  
  -- Check if alert type is enabled
  CASE _alert_type
    WHEN 'security' THEN should_notify := preferences.security_alerts;
    WHEN 'system_health' THEN should_notify := preferences.system_health_alerts;
    WHEN 'backup' THEN should_notify := preferences.backup_alerts;
    WHEN 'payment' THEN should_notify := preferences.payment_alerts;
    WHEN 'user_activity' THEN should_notify := preferences.user_activity_alerts;
    WHEN 'performance' THEN should_notify := preferences.performance_alerts;
    ELSE should_notify := true;
  END CASE;
  
  RETURN should_notify;
END;
$$;

-- ============================================================================
-- 4. FUNCTION: Initialize default preferences for admin
-- ============================================================================

CREATE OR REPLACE FUNCTION public.initialize_admin_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a user becomes an admin, create default notification preferences
  IF NEW.role = 'admin' THEN
    INSERT INTO public.admin_notification_preferences (admin_id)
    VALUES (NEW.user_id)
    ON CONFLICT (admin_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on user_roles table
CREATE TRIGGER initialize_admin_prefs_on_role_grant
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.initialize_admin_notification_preferences();

-- ============================================================================
-- Log migration
-- ============================================================================

INSERT INTO public.system_logs (module, log_type, message, details)
VALUES (
  'admin',
  'info',
  'Admin notification preferences and backup verification system created',
  jsonb_build_object(
    'tables_created', ARRAY['admin_notification_preferences', 'backup_verifications'],
    'functions_created', ARRAY['get_admin_notification_preferences', 'initialize_admin_notification_preferences'],
    'migration_timestamp', NOW()
  )
);