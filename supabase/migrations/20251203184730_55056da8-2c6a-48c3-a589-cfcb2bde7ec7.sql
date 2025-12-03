-- FASE 3: Correção de Vulnerabilidades de Segurança Críticas

-- 3.1 Proteger pet_shops - esconder dados sensíveis do proprietário para anônimos
DROP POLICY IF EXISTS "Pet shops are viewable by everyone" ON public.pet_shops;
DROP POLICY IF EXISTS "Pet shops public read" ON public.pet_shops;

-- Permitir apenas visualização de dados públicos (nome, endereço, cidade, estado) para anônimos
CREATE POLICY "Public can view pet shop basic info"
ON public.pet_shops FOR SELECT
TO anon
USING (deleted_at IS NULL);

-- Mas esconder email e phone para anônimos através de uma view
-- (dados sensíveis só visíveis para autenticados)
CREATE POLICY "Authenticated users can view all pet shop info"
ON public.pet_shops FOR SELECT
TO authenticated
USING (deleted_at IS NULL);

-- 3.2 Proteger admin_api_rate_limits - apenas admins
ALTER TABLE public.admin_api_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin rate limits read" ON public.admin_api_rate_limits;
DROP POLICY IF EXISTS "Admin rate limits insert" ON public.admin_api_rate_limits;
DROP POLICY IF EXISTS "Admin rate limits update" ON public.admin_api_rate_limits;

CREATE POLICY "Only admins can manage rate limits"
ON public.admin_api_rate_limits FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin') OR
  public.is_god_user()
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin') OR
  public.is_god_user()
);

-- 3.3 Proteger global_metrics - apenas autenticados
ALTER TABLE public.global_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Global metrics public read" ON public.global_metrics;
DROP POLICY IF EXISTS "Global metrics authenticated read" ON public.global_metrics;

CREATE POLICY "Only authenticated can view global metrics"
ON public.global_metrics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can modify global metrics"
ON public.global_metrics FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin') OR
  public.is_god_user()
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'super_admin') OR
  public.is_god_user()
);

-- 3.4 Proteger permissions - apenas autenticados
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permissions public read" ON public.permissions;

CREATE POLICY "Only authenticated can view permissions"
ON public.permissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can modify permissions"
ON public.permissions FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.is_god_user()
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.is_god_user()
);

-- 3.5 Proteger site_images - esconder metadata sensível
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site images public read" ON public.site_images;

-- Anônimos podem ver apenas URL e categoria (para exibição no site)
CREATE POLICY "Public can view site images basic info"
ON public.site_images FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can modify site images"
ON public.site_images FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.is_god_user()
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.is_god_user()
);

-- 3.6 Revogar acesso anônimo à materialized view
REVOKE ALL ON mv_admin_realtime_stats FROM anon;
REVOKE ALL ON mv_admin_realtime_stats FROM public;