-- Garantir que user_roles tenha políticas RLS corretas
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- Permitir que usuários leiam sua própria role
CREATE POLICY "Users can read own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Permitir que admins gerenciem todas as roles
CREATE POLICY "Admins can manage all roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- Garantir que admin_alerts tenha políticas RLS corretas
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all alerts" ON admin_alerts;
DROP POLICY IF EXISTS "System can insert alerts" ON admin_alerts;
DROP POLICY IF EXISTS "Admins can update alerts" ON admin_alerts;

-- Admins podem ver todos os alertas
CREATE POLICY "Admins can view all alerts"
  ON admin_alerts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- System (service role) pode inserir alertas
CREATE POLICY "System can insert alerts"
  ON admin_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins podem atualizar alertas (marcar como lido/resolvido)
CREATE POLICY "Admins can update alerts"
  ON admin_alerts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );