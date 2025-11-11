-- FASE 2.1: Criar schema extensions se não existir
CREATE SCHEMA IF NOT EXISTS extensions;

-- FASE 2.2: Implementar Soft Deletion
-- Adicionar coluna deleted_at em tabelas principais
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE services ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE pet_shops ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON appointments(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pets_deleted_at ON pets(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_services_deleted_at ON services(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pet_shops_deleted_at ON pet_shops(deleted_at) WHERE deleted_at IS NOT NULL;

-- FASE 2.3: Políticas de DELETE Seletivas

-- Usuários podem soft delete seus próprios pets
DROP POLICY IF EXISTS "Users can soft delete their own pets" ON pets;
CREATE POLICY "Users can soft delete their own pets" ON pets
FOR UPDATE USING (auth.uid() = owner_id);

-- Pet shops podem soft delete seus próprios produtos
DROP POLICY IF EXISTS "Pet shops can soft delete their products" ON products;
CREATE POLICY "Pet shops can soft delete their products" ON products
FOR UPDATE USING (
  pet_shop_id IN (
    SELECT id FROM pet_shops WHERE owner_id = auth.uid()
  )
);

-- Pet shops podem soft delete seus próprios serviços
DROP POLICY IF EXISTS "Pet shops can soft delete their services" ON services;
CREATE POLICY "Pet shops can soft delete their services" ON services
FOR UPDATE USING (
  pet_shop_id IN (
    SELECT id FROM pet_shops WHERE owner_id = auth.uid()
  )
);

-- Admins podem deletar dados antigos (>1 ano) de appointments
DROP POLICY IF EXISTS "Admins can delete old appointments" ON appointments;
CREATE POLICY "Admins can delete old appointments" ON appointments
FOR DELETE USING (
  public.has_role(auth.uid(), 'admin'::app_role) AND
  scheduled_date < CURRENT_DATE - INTERVAL '1 year'
);

-- Clientes podem soft delete seus próprios agendamentos pendentes
DROP POLICY IF EXISTS "Clients can soft delete pending appointments" ON appointments;
CREATE POLICY "Clients can soft delete pending appointments" ON appointments
FOR UPDATE USING (
  auth.uid() = client_id AND
  status IN ('pending', 'confirmed')
);

-- Função helper para soft delete
CREATE OR REPLACE FUNCTION public.soft_delete_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se tentar fazer DELETE real, converter para UPDATE com deleted_at
  NEW.deleted_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.soft_delete_record() IS 'Converte DELETE em soft delete (UPDATE deleted_at)';