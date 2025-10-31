-- ============================================
-- FASE 1: SEGURANÇA E PERFORMANCE CRÍTICA
-- ============================================

-- 1. HABILITAR RLS EM TABELAS MULTI-TENANT
-- ============================================

-- Tabela franchises (se ainda não existe, criar)
CREATE TABLE IF NOT EXISTS public.franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  cnpj TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true,
  contract_start_date DATE,
  contract_end_date DATE,
  royalty_percentage DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  settings JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;

-- Tabela tenants (se ainda não existe, criar)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true,
  subscription_plan TEXT NOT NULL DEFAULT 'starter',
  settings JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Tabela user_hierarchy
CREATE TABLE IF NOT EXISTS public.user_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  franchise_id UUID REFERENCES public.franchises(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, tenant_id, franchise_id, unit_id)
);

ALTER TABLE public.user_hierarchy ENABLE ROW LEVEL SECURITY;

-- Tabela royalties
CREATE TABLE IF NOT EXISTS public.royalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID NOT NULL REFERENCES public.franchises(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  reference_month DATE NOT NULL,
  gross_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  royalty_percentage DECIMAL(5,2) NOT NULL,
  royalty_amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(franchise_id, unit_id, reference_month)
);

ALTER TABLE public.royalties ENABLE ROW LEVEL SECURITY;

-- Tabela brand_standards
CREATE TABLE IF NOT EXISTS public.brand_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  checklist_items JSONB DEFAULT '[]'::jsonb,
  required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.brand_standards ENABLE ROW LEVEL SECURITY;

-- Tabela compliance_audits
CREATE TABLE IF NOT EXISTS public.compliance_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  auditor_id UUID NOT NULL REFERENCES auth.users(id),
  audit_date DATE NOT NULL,
  standard_id UUID NOT NULL REFERENCES public.brand_standards(id),
  compliance_score DECIMAL(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  findings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.compliance_audits ENABLE ROW LEVEL SECURITY;

-- 2. FUNÇÕES DE SEGURANÇA
-- ============================================

-- Função para verificar se usuário é tenant_admin
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
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
  );
$$;

-- Função para verificar se usuário é franchise_owner
CREATE OR REPLACE FUNCTION public.is_franchise_owner(_user_id UUID, _franchise_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
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
  );
$$;

-- Função para verificar acesso ao tenant
CREATE OR REPLACE FUNCTION public.has_tenant_access(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_hierarchy
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND active = true
  );
$$;

-- Função para definir tenant atual (contexto RLS)
CREATE OR REPLACE FUNCTION public.set_current_tenant(_tenant_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', _tenant_id::text, false);
END;
$$;

-- Função para obter tenant atual
CREATE OR REPLACE FUNCTION public.get_current_tenant()
RETURNS UUID
LANGUAGE SQL
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
$$;

-- 3. RLS POLICIES - TENANTS
-- ============================================

CREATE POLICY "Users can view their tenants"
ON public.tenants
FOR SELECT
USING (
  has_tenant_access(auth.uid(), id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Tenant admins can update their tenant"
ON public.tenants
FOR UPDATE
USING (
  is_tenant_admin(auth.uid(), id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 4. RLS POLICIES - FRANCHISES
-- ============================================

CREATE POLICY "Users can view franchises in their tenant"
ON public.franchises
FOR SELECT
USING (
  has_tenant_access(auth.uid(), tenant_id)
  OR owner_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Franchise owners can update their franchise"
ON public.franchises
FOR UPDATE
USING (
  owner_id = auth.uid()
  OR is_franchise_owner(auth.uid(), id)
  OR is_tenant_admin(auth.uid(), tenant_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Tenant admins can create franchises"
ON public.franchises
FOR INSERT
WITH CHECK (
  is_tenant_admin(auth.uid(), tenant_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 5. RLS POLICIES - USER_HIERARCHY
-- ============================================

CREATE POLICY "Users can view their own hierarchy"
ON public.user_hierarchy
FOR SELECT
USING (
  user_id = auth.uid()
  OR is_tenant_admin(auth.uid(), tenant_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Tenant admins can manage hierarchy"
ON public.user_hierarchy
FOR ALL
USING (
  is_tenant_admin(auth.uid(), tenant_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 6. RLS POLICIES - ROYALTIES
-- ============================================

CREATE POLICY "Franchise owners can view their royalties"
ON public.royalties
FOR SELECT
USING (
  is_franchise_owner(auth.uid(), franchise_id)
  OR EXISTS (
    SELECT 1 FROM public.franchises f
    WHERE f.id = royalties.franchise_id
      AND is_tenant_admin(auth.uid(), f.tenant_id)
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Tenant admins can manage royalties"
ON public.royalties
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.franchises f
    WHERE f.id = royalties.franchise_id
      AND is_tenant_admin(auth.uid(), f.tenant_id)
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 7. RLS POLICIES - BRAND_STANDARDS
-- ============================================

CREATE POLICY "Users can view standards in their tenant"
ON public.brand_standards
FOR SELECT
USING (
  has_tenant_access(auth.uid(), tenant_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Tenant admins can manage standards"
ON public.brand_standards
FOR ALL
USING (
  is_tenant_admin(auth.uid(), tenant_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 8. RLS POLICIES - COMPLIANCE_AUDITS
-- ============================================

CREATE POLICY "Unit managers can view their audits"
ON public.compliance_audits
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pet_shops ps
    WHERE ps.id = compliance_audits.unit_id
      AND (ps.owner_id = auth.uid() OR is_employee_of_petshop(auth.uid(), ps.id))
  )
  OR auditor_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Auditors can create audits"
ON public.compliance_audits
FOR INSERT
WITH CHECK (
  auditor_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 9. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Appointments (queries mais frequentes)
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_date 
  ON public.appointments(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_appointments_pet_shop_id 
  ON public.appointments(pet_shop_id);

CREATE INDEX IF NOT EXISTS idx_appointments_client_id 
  ON public.appointments(client_id);

CREATE INDEX IF NOT EXISTS idx_appointments_status 
  ON public.appointments(status);

CREATE INDEX IF NOT EXISTS idx_appointments_pet_shop_date 
  ON public.appointments(pet_shop_id, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_appointments_client_pet 
  ON public.appointments(client_id, pet_id);

-- Pet Shops
CREATE INDEX IF NOT EXISTS idx_pet_shops_owner_id 
  ON public.pet_shops(owner_id);

CREATE INDEX IF NOT EXISTS idx_pet_shops_code 
  ON public.pet_shops(code);

-- Pets
CREATE INDEX IF NOT EXISTS idx_pets_owner_id 
  ON public.pets(owner_id);

-- Services
CREATE INDEX IF NOT EXISTS idx_services_pet_shop_id 
  ON public.services(pet_shop_id);

CREATE INDEX IF NOT EXISTS idx_services_active 
  ON public.services(active) WHERE active = true;

-- Products
CREATE INDEX IF NOT EXISTS idx_products_pet_shop_id 
  ON public.products(pet_shop_id);

CREATE INDEX IF NOT EXISTS idx_products_category 
  ON public.products(category);

CREATE INDEX IF NOT EXISTS idx_products_sku 
  ON public.products(sku);

CREATE INDEX IF NOT EXISTS idx_products_barcode 
  ON public.products(barcode);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id 
  ON public.payments(appointment_id);

CREATE INDEX IF NOT EXISTS idx_payments_status 
  ON public.payments(status);

-- Loyalty Points
CREATE INDEX IF NOT EXISTS idx_loyalty_points_client_petshop 
  ON public.loyalty_points(client_id, pet_shop_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_client_id 
  ON public.notifications(client_id);

CREATE INDEX IF NOT EXISTS idx_notifications_appointment_id 
  ON public.notifications(appointment_id);

-- Commissions
CREATE INDEX IF NOT EXISTS idx_commissions_employee_id 
  ON public.commissions(employee_id);

CREATE INDEX IF NOT EXISTS idx_commissions_pet_shop_month 
  ON public.commissions(pet_shop_id, reference_month);

-- Franchises (multi-tenant)
CREATE INDEX IF NOT EXISTS idx_franchises_tenant_id 
  ON public.franchises(tenant_id);

CREATE INDEX IF NOT EXISTS idx_franchises_owner_id 
  ON public.franchises(owner_id);

CREATE INDEX IF NOT EXISTS idx_franchises_code 
  ON public.franchises(code);

-- User Hierarchy (multi-tenant)
CREATE INDEX IF NOT EXISTS idx_user_hierarchy_user_id 
  ON public.user_hierarchy(user_id);

CREATE INDEX IF NOT EXISTS idx_user_hierarchy_tenant_id 
  ON public.user_hierarchy(tenant_id);

CREATE INDEX IF NOT EXISTS idx_user_hierarchy_franchise_id 
  ON public.user_hierarchy(franchise_id);

CREATE INDEX IF NOT EXISTS idx_user_hierarchy_unit_id 
  ON public.user_hierarchy(unit_id);

CREATE INDEX IF NOT EXISTS idx_user_hierarchy_role 
  ON public.user_hierarchy(role);

-- Royalties
CREATE INDEX IF NOT EXISTS idx_royalties_franchise_id 
  ON public.royalties(franchise_id);

CREATE INDEX IF NOT EXISTS idx_royalties_unit_id 
  ON public.royalties(unit_id);

CREATE INDEX IF NOT EXISTS idx_royalties_franchise_month 
  ON public.royalties(franchise_id, reference_month);

CREATE INDEX IF NOT EXISTS idx_royalties_status 
  ON public.royalties(status);

-- Brand Standards
CREATE INDEX IF NOT EXISTS idx_brand_standards_tenant_id 
  ON public.brand_standards(tenant_id);

CREATE INDEX IF NOT EXISTS idx_brand_standards_category 
  ON public.brand_standards(category);

-- Compliance Audits
CREATE INDEX IF NOT EXISTS idx_compliance_audits_unit_id 
  ON public.compliance_audits(unit_id);

CREATE INDEX IF NOT EXISTS idx_compliance_audits_auditor_id 
  ON public.compliance_audits(auditor_id);

CREATE INDEX IF NOT EXISTS idx_compliance_audits_standard_id 
  ON public.compliance_audits(standard_id);

-- 10. TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE TRIGGER update_franchises_updated_at
  BEFORE UPDATE ON public.franchises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_hierarchy_updated_at
  BEFORE UPDATE ON public.user_hierarchy
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_royalties_updated_at
  BEFORE UPDATE ON public.royalties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_standards_updated_at
  BEFORE UPDATE ON public.brand_standards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_audits_updated_at
  BEFORE UPDATE ON public.compliance_audits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 11. FUNÇÃO PARA MÉTRICAS CONSOLIDADAS (otimizada)
-- ============================================

CREATE OR REPLACE FUNCTION public.get_consolidated_metrics(
  _tenant_id UUID,
  _start_date DATE,
  _end_date DATE,
  _franchise_ids UUID[] DEFAULT NULL,
  _unit_ids UUID[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  WITH filtered_units AS (
    SELECT ps.id
    FROM pet_shops ps
    LEFT JOIN franchises f ON ps.franchise_id = f.id
    WHERE f.tenant_id = _tenant_id
      AND (_franchise_ids IS NULL OR f.id = ANY(_franchise_ids))
      AND (_unit_ids IS NULL OR ps.id = ANY(_unit_ids))
  ),
  metrics AS (
    SELECT
      COUNT(DISTINCT a.id) AS total_appointments,
      COUNT(DISTINCT a.client_id) AS total_clients,
      COUNT(DISTINCT fu.id) AS active_units,
      COALESCE(SUM(s.price), 0) AS total_revenue
    FROM filtered_units fu
    LEFT JOIN appointments a ON a.pet_shop_id = fu.id
      AND a.scheduled_date BETWEEN _start_date AND _end_date
      AND a.status = 'completed'
    LEFT JOIN services s ON s.id = a.service_id
  )
  SELECT jsonb_build_object(
    'total_revenue', total_revenue,
    'total_appointments', total_appointments,
    'active_units', active_units,
    'total_clients', total_clients
  ) INTO result
  FROM metrics;

  RETURN result;
END;
$$;

-- Comentários explicativos
COMMENT ON TABLE public.franchises IS 'Franquias pertencentes a um tenant';
COMMENT ON TABLE public.tenants IS 'Tabela principal de tenants (franqueadoras)';
COMMENT ON TABLE public.user_hierarchy IS 'Hierarquia de usuários no sistema multi-tenant';
COMMENT ON TABLE public.royalties IS 'Controle de royalties das franquias';
COMMENT ON TABLE public.brand_standards IS 'Padrões de marca do tenant';
COMMENT ON TABLE public.compliance_audits IS 'Auditorias de conformidade das unidades';

COMMENT ON FUNCTION public.is_tenant_admin IS 'Verifica se usuário é admin do tenant';
COMMENT ON FUNCTION public.is_franchise_owner IS 'Verifica se usuário é dono da franquia';
COMMENT ON FUNCTION public.has_tenant_access IS 'Verifica se usuário tem acesso ao tenant';
COMMENT ON FUNCTION public.get_consolidated_metrics IS 'Retorna métricas consolidadas do tenant com filtros';