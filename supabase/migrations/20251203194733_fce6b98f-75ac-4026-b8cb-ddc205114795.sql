
-- Remover TODAS as políticas SELECT públicas de pet_shops
DROP POLICY IF EXISTS "Public view limited pet shop info" ON pet_shops;
DROP POLICY IF EXISTS "Authenticated users can view all pet shop info" ON pet_shops;

-- Criar política que só permite ver pet_shops para usuários autenticados
CREATE POLICY "Authenticated users view pet shops"
ON pet_shops FOR SELECT
TO authenticated
USING (deleted_at IS NULL);

-- Remover acesso anônimo completamente
REVOKE SELECT ON pet_shops FROM anon;

-- Corrigir admin_api_rate_limits - remover qualquer acesso público
DROP POLICY IF EXISTS "Only admins view rate limits" ON admin_api_rate_limits;
DROP POLICY IF EXISTS "Only admins manage rate limits" ON admin_api_rate_limits;

-- Criar política única para admins
CREATE POLICY "Admin only rate limits access"
ON admin_api_rate_limits FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin') OR is_god_user(auth.uid()))
WITH CHECK (has_role(auth.uid(), 'admin') OR is_god_user(auth.uid()));

-- Revogar acesso anônimo
REVOKE ALL ON admin_api_rate_limits FROM anon;

-- Corrigir site_images - remover updated_by de acesso público
DROP POLICY IF EXISTS "Public can view site images" ON site_images;
DROP POLICY IF EXISTS "Anyone can view site images" ON site_images;

CREATE POLICY "Authenticated view site images"
ON site_images FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON site_images FROM anon;

-- Corrigir global_metrics - só admin pode ver
DROP POLICY IF EXISTS "Anyone can view global metrics" ON global_metrics;
DROP POLICY IF EXISTS "Public can view global metrics" ON global_metrics;

CREATE POLICY "Admins view global metrics"
ON global_metrics FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin') OR is_god_user(auth.uid()));

REVOKE SELECT ON global_metrics FROM anon;
