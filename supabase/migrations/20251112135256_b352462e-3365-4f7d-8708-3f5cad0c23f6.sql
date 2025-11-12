
-- Corrigir trigger log_role_change para permitir inserção sem usuário autenticado
-- e adicionar role admin ao usuário beninelixo@gmail.com

-- Primeiro, dropar o trigger existente
DROP TRIGGER IF EXISTS log_role_change_trigger ON user_roles;

-- Recriar a função com tratamento melhor para usuário não autenticado
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  action_type TEXT;
  old_role_val app_role;
  acting_user_id UUID;
BEGIN
  -- Pegar o usuário que está fazendo a ação, ou NULL se for sistema
  acting_user_id := auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    action_type := 'added';
    old_role_val := NULL;
    
    -- Só registrar se houver um usuário autenticado
    IF acting_user_id IS NOT NULL THEN
      INSERT INTO public.role_changes_audit (
        changed_user_id,
        changed_by,
        old_role,
        new_role,
        action,
        metadata
      ) VALUES (
        NEW.user_id,
        acting_user_id,
        old_role_val,
        NEW.role,
        action_type,
        jsonb_build_object('operation', TG_OP)
      );
    END IF;
    
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'changed';
    
    IF acting_user_id IS NOT NULL THEN
      INSERT INTO public.role_changes_audit (
        changed_user_id,
        changed_by,
        old_role,
        new_role,
        action,
        metadata
      ) VALUES (
        NEW.user_id,
        acting_user_id,
        OLD.role,
        NEW.role,
        action_type,
        jsonb_build_object('operation', TG_OP)
      );
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'removed';
    
    IF acting_user_id IS NOT NULL THEN
      INSERT INTO public.role_changes_audit (
        changed_user_id,
        changed_by,
        old_role,
        new_role,
        action,
        metadata
      ) VALUES (
        OLD.user_id,
        acting_user_id,
        OLD.role,
        OLD.role,
        action_type,
        jsonb_build_object('operation', TG_OP)
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recriar o trigger
CREATE TRIGGER log_role_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION log_role_change();

-- Agora adicionar role admin ao usuário beninelixo@gmail.com
INSERT INTO user_roles (user_id, role)
VALUES ('bb53e4e1-77b7-463a-878c-07f52784f6c7', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
