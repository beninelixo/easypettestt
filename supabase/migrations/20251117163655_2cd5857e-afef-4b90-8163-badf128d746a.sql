-- ============================================
-- SISTEMA DE PERMISSÕES GRANULARES (RBAC)
-- ============================================
-- Este sistema permite controle de acesso detalhado por módulo e operação

-- 1. Criar enum para módulos do sistema
DO $$ BEGIN
  CREATE TYPE app_module AS ENUM (
    'dashboard',
    'appointments',
    'clients',
    'pets',
    'services',
    'products',
    'inventory',
    'financial',
    'reports',
    'marketing',
    'settings',
    'employees'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Criar enum para ações/operações
DO $$ BEGIN
  CREATE TYPE app_action AS ENUM (
    'view',
    'create',
    'edit',
    'delete',
    'manage'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Tabela de permissões disponíveis no sistema
CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module app_module NOT NULL,
  action app_action NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(module, action)
);

-- Habilitar RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- 4. Tabela de permissões atribuídas a funcionários
CREATE TABLE IF NOT EXISTS public.employee_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.petshop_employees(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_by uuid NOT NULL REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, permission_id)
);

-- Habilitar RLS
ALTER TABLE public.employee_permissions ENABLE ROW LEVEL SECURITY;

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_employee_permissions_employee 
  ON public.employee_permissions(employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_permissions_permission 
  ON public.employee_permissions(permission_id);

-- 6. Tabela de auditoria de acesso
CREATE TABLE IF NOT EXISTS public.access_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
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

-- Habilitar RLS
ALTER TABLE public.access_audit ENABLE ROW LEVEL SECURITY;

-- Criar índice para consultas de auditoria
CREATE INDEX IF NOT EXISTS idx_access_audit_user 
  ON public.access_audit(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_audit_shop 
  ON public.access_audit(pet_shop_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_audit_module 
  ON public.access_audit(module, action, created_at DESC);

-- 7. Função para verificar se funcionário tem permissão específica
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id uuid, 
  _pet_shop_id uuid,
  _module app_module, 
  _action app_action
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Verifica se é dono do pet shop (tem todas as permissões)
  SELECT CASE
    WHEN EXISTS (
      SELECT 1 FROM pet_shops
      WHERE id = _pet_shop_id
      AND owner_id = _user_id
    ) THEN true
    -- Verifica se é admin (tem todas as permissões)
    WHEN has_role(_user_id, 'admin'::app_role) THEN true
    -- Verifica se é funcionário com a permissão específica
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

-- 8. Função para obter todas as permissões de um funcionário
CREATE OR REPLACE FUNCTION public.get_employee_permissions(_user_id uuid, _pet_shop_id uuid)
RETURNS TABLE (
  module app_module,
  action app_action,
  permission_name text,
  description text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Se é dono ou admin, retorna todas as permissões
  SELECT 
    CASE WHEN owner_or_admin.is_privileged THEN p.module ELSE p.module END as module,
    CASE WHEN owner_or_admin.is_privileged THEN p.action ELSE p.action END as action,
    CASE WHEN owner_or_admin.is_privileged THEN p.name ELSE p.name END as permission_name,
    CASE WHEN owner_or_admin.is_privileged THEN p.description ELSE p.description END as description
  FROM (
    SELECT 
      CASE 
        WHEN EXISTS (SELECT 1 FROM pet_shops WHERE id = _pet_shop_id AND owner_id = _user_id) THEN true
        WHEN has_role(_user_id, 'admin'::app_role) THEN true
        ELSE false
      END as is_privileged
  ) owner_or_admin
  CROSS JOIN permissions p
  WHERE owner_or_admin.is_privileged
  
  UNION ALL
  
  -- Se é funcionário, retorna apenas suas permissões
  SELECT 
    p.module,
    p.action,
    p.name,
    p.description
  FROM petshop_employees pe
  JOIN employee_permissions ep ON ep.employee_id = pe.id
  JOIN permissions p ON p.id = ep.permission_id
  WHERE pe.user_id = _user_id
    AND pe.pet_shop_id = _pet_shop_id
    AND pe.active = true
    AND NOT EXISTS (
      SELECT 1 FROM pet_shops WHERE id = _pet_shop_id AND owner_id = _user_id
    )
    AND NOT has_role(_user_id, 'admin'::app_role);
$$;

-- 9. Função para registrar acesso (auditoria)
CREATE OR REPLACE FUNCTION public.log_access(
  _user_id uuid,
  _pet_shop_id uuid,
  _module app_module,
  _action app_action,
  _resource_id uuid DEFAULT NULL,
  _resource_type text DEFAULT NULL,
  _success boolean DEFAULT true,
  _metadata jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 10. Políticas RLS para permissions (todos podem ver, apenas admins podem gerenciar)
CREATE POLICY "Anyone can view permissions"
  ON public.permissions FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage permissions"
  ON public.permissions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 11. Políticas RLS para employee_permissions
CREATE POLICY "Pet shop owners can manage employee permissions"
  ON public.employee_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM petshop_employees pe
      JOIN pet_shops ps ON ps.id = pe.pet_shop_id
      WHERE pe.id = employee_permissions.employee_id
      AND ps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Employees can view their own permissions"
  ON public.employee_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM petshop_employees pe
      WHERE pe.id = employee_permissions.employee_id
      AND pe.user_id = auth.uid()
    )
  );

-- 12. Políticas RLS para access_audit
CREATE POLICY "Admins can view all audit logs"
  ON public.access_audit FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Pet shop owners can view their audit logs"
  ON public.access_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM pet_shops
      WHERE id = access_audit.pet_shop_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.access_audit FOR INSERT
  WITH CHECK (true);

-- 13. Inserir permissões padrão no sistema
INSERT INTO public.permissions (module, action, name, description) VALUES
  -- Dashboard
  ('dashboard', 'view', 'Visualizar Dashboard', 'Acesso ao painel principal com métricas'),
  
  -- Agendamentos
  ('appointments', 'view', 'Visualizar Agendamentos', 'Ver lista de agendamentos'),
  ('appointments', 'create', 'Criar Agendamento', 'Agendar novos serviços'),
  ('appointments', 'edit', 'Editar Agendamento', 'Modificar agendamentos existentes'),
  ('appointments', 'delete', 'Cancelar Agendamento', 'Cancelar agendamentos'),
  
  -- Clientes
  ('clients', 'view', 'Visualizar Clientes', 'Ver lista e perfis de clientes'),
  ('clients', 'create', 'Cadastrar Cliente', 'Adicionar novos clientes'),
  ('clients', 'edit', 'Editar Cliente', 'Modificar dados de clientes'),
  ('clients', 'delete', 'Excluir Cliente', 'Remover clientes do sistema'),
  
  -- Pets
  ('pets', 'view', 'Visualizar Pets', 'Ver lista e perfis de pets'),
  ('pets', 'create', 'Cadastrar Pet', 'Adicionar novos pets'),
  ('pets', 'edit', 'Editar Pet', 'Modificar dados de pets'),
  ('pets', 'delete', 'Excluir Pet', 'Remover pets do sistema'),
  
  -- Serviços
  ('services', 'view', 'Visualizar Serviços', 'Ver lista de serviços'),
  ('services', 'create', 'Criar Serviço', 'Adicionar novos serviços'),
  ('services', 'edit', 'Editar Serviço', 'Modificar serviços existentes'),
  ('services', 'delete', 'Excluir Serviço', 'Remover serviços'),
  
  -- Produtos
  ('products', 'view', 'Visualizar Produtos', 'Ver lista de produtos'),
  ('products', 'create', 'Cadastrar Produto', 'Adicionar novos produtos'),
  ('products', 'edit', 'Editar Produto', 'Modificar produtos existentes'),
  ('products', 'delete', 'Excluir Produto', 'Remover produtos'),
  
  -- Estoque
  ('inventory', 'view', 'Visualizar Estoque', 'Ver níveis de estoque'),
  ('inventory', 'create', 'Registrar Entrada', 'Adicionar itens ao estoque'),
  ('inventory', 'edit', 'Ajustar Estoque', 'Modificar quantidades'),
  ('inventory', 'manage', 'Gerenciar Estoque', 'Controle total do estoque'),
  
  -- Financeiro
  ('financial', 'view', 'Visualizar Financeiro', 'Ver transações e relatórios financeiros'),
  ('financial', 'create', 'Registrar Pagamento', 'Lançar novos pagamentos'),
  ('financial', 'edit', 'Editar Transação', 'Modificar transações financeiras'),
  ('financial', 'manage', 'Gerenciar Financeiro', 'Acesso completo ao módulo financeiro'),
  
  -- Relatórios
  ('reports', 'view', 'Visualizar Relatórios', 'Acessar relatórios gerenciais'),
  ('reports', 'manage', 'Gerenciar Relatórios', 'Criar e exportar relatórios'),
  
  -- Marketing
  ('marketing', 'view', 'Visualizar Marketing', 'Ver campanhas de marketing'),
  ('marketing', 'create', 'Criar Campanha', 'Criar novas campanhas'),
  ('marketing', 'edit', 'Editar Campanha', 'Modificar campanhas'),
  ('marketing', 'manage', 'Gerenciar Marketing', 'Controle total de marketing'),
  
  -- Configurações
  ('settings', 'view', 'Visualizar Configurações', 'Ver configurações do sistema'),
  ('settings', 'edit', 'Editar Configurações', 'Modificar configurações'),
  
  -- Funcionários
  ('employees', 'view', 'Visualizar Funcionários', 'Ver lista de funcionários'),
  ('employees', 'create', 'Adicionar Funcionário', 'Cadastrar novos funcionários'),
  ('employees', 'edit', 'Editar Funcionário', 'Modificar dados de funcionários'),
  ('employees', 'delete', 'Remover Funcionário', 'Excluir funcionários'),
  ('employees', 'manage', 'Gerenciar Permissões', 'Controlar permissões de funcionários')
ON CONFLICT (module, action) DO NOTHING;

-- 14. Comentários para documentação
COMMENT ON TABLE public.permissions IS 'Catálogo de permissões disponíveis no sistema';
COMMENT ON TABLE public.employee_permissions IS 'Permissões atribuídas a funcionários específicos';
COMMENT ON TABLE public.access_audit IS 'Registro de auditoria de acessos ao sistema';
COMMENT ON FUNCTION public.has_permission IS 'Verifica se usuário tem permissão específica';
COMMENT ON FUNCTION public.get_employee_permissions IS 'Retorna todas as permissões de um funcionário';
COMMENT ON FUNCTION public.log_access IS 'Registra acesso no log de auditoria';