-- Tabela de convites de admin
CREATE TABLE IF NOT EXISTS public.admin_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_admin_invites_email ON public.admin_invites(email);
CREATE INDEX idx_admin_invites_token ON public.admin_invites(token);
CREATE INDEX idx_admin_invites_expires ON public.admin_invites(expires_at);

-- Enable RLS
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage invites
CREATE POLICY "Admins can manage invites"
ON public.admin_invites
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Anyone can view their own invite by token (for acceptance page)
CREATE POLICY "Users can view their own invite"
ON public.admin_invites
FOR SELECT
USING (token IS NOT NULL);

-- Melhorar tabela de audit_logs para capturar mudanças de roles
CREATE TABLE IF NOT EXISTS public.role_changes_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_user_id UUID NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  old_role app_role,
  new_role app_role NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('added', 'removed', 'changed')),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_role_changes_user ON public.role_changes_audit(changed_user_id);
CREATE INDEX idx_role_changes_by ON public.role_changes_audit(changed_by);
CREATE INDEX idx_role_changes_date ON public.role_changes_audit(created_at DESC);

-- Enable RLS
ALTER TABLE public.role_changes_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view role change audits
CREATE POLICY "Admins can view role changes"
ON public.role_changes_audit
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_type TEXT;
  old_role_val app_role;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_type := 'added';
    old_role_val := NULL;
    
    INSERT INTO public.role_changes_audit (
      changed_user_id,
      changed_by,
      old_role,
      new_role,
      action,
      metadata
    ) VALUES (
      NEW.user_id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
      old_role_val,
      NEW.role,
      action_type,
      jsonb_build_object('operation', TG_OP)
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'changed';
    
    INSERT INTO public.role_changes_audit (
      changed_user_id,
      changed_by,
      old_role,
      new_role,
      action,
      metadata
    ) VALUES (
      NEW.user_id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
      OLD.role,
      NEW.role,
      action_type,
      jsonb_build_object('operation', TG_OP)
    );
    
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'removed';
    
    INSERT INTO public.role_changes_audit (
      changed_user_id,
      changed_by,
      old_role,
      new_role,
      action,
      metadata
    ) VALUES (
      OLD.user_id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
      OLD.role,
      OLD.role,
      action_type,
      jsonb_build_object('operation', TG_OP)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach trigger to user_roles table
DROP TRIGGER IF EXISTS audit_role_changes ON public.user_roles;
CREATE TRIGGER audit_role_changes
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.log_role_change();

-- Function to cleanup expired invites
CREATE OR REPLACE FUNCTION public.cleanup_expired_invites()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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