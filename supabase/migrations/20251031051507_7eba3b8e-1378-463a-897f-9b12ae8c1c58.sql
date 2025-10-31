-- ==============================================
-- SISTEMA DE PERMISSÕES PARA PROFISSIONAIS
-- ==============================================

-- 1. Adicionar role 'professional' ao enum (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typcategory = 'E') THEN
    CREATE TYPE app_role AS ENUM ('admin', 'petshop_owner', 'professional', 'client');
  ELSE
    -- Adicionar 'professional' se não existir
    BEGIN
      ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'professional';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    
    -- Adicionar 'petshop_owner' se não existir
    BEGIN
      ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'petshop_owner';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- 2. Criar tabela de vínculo profissional-petshop
CREATE TABLE IF NOT EXISTS public.petshop_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id uuid NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position text, -- Cargo: groomer, veterinarian, attendant, etc
  hired_at date DEFAULT CURRENT_DATE,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(pet_shop_id, user_id)
);

-- Enable RLS
ALTER TABLE public.petshop_employees ENABLE ROW LEVEL SECURITY;

-- Índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_petshop_employees_user 
  ON public.petshop_employees(user_id, active);

CREATE INDEX IF NOT EXISTS idx_petshop_employees_shop 
  ON public.petshop_employees(pet_shop_id, active);

-- 3. Função helper para verificar se usuário é profissional de um pet shop
CREATE OR REPLACE FUNCTION public.is_employee_of_petshop(_user_id uuid, _pet_shop_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM petshop_employees
    WHERE user_id = _user_id
      AND pet_shop_id = _pet_shop_id
      AND active = true
  );
$$;

-- 4. Políticas RLS para petshop_employees
CREATE POLICY "Pet shop owners can manage employees"
  ON public.petshop_employees FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pet_shops
      WHERE pet_shops.id = petshop_employees.pet_shop_id
      AND pet_shops.owner_id = auth.uid()
    )
  );

CREATE POLICY "Employees can view their own record"
  ON public.petshop_employees FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Atualizar políticas de SERVICES (editar serviços)
DROP POLICY IF EXISTS "Pet shops can manage their own services" ON public.services;

CREATE POLICY "Pet shops and professionals can manage services"
  ON public.services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pet_shops
      WHERE pet_shops.id = services.pet_shop_id
      AND pet_shops.owner_id = auth.uid()
    )
    OR public.is_employee_of_petshop(auth.uid(), services.pet_shop_id)
    OR public.has_role(auth.uid(), 'admin')
  );

-- 6. Atualizar políticas de APPOINTMENTS (confirmar agendamentos)
DROP POLICY IF EXISTS "Pet shops can update their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Pet shops can view their appointments" ON public.appointments;

CREATE POLICY "Pet shops and professionals can view appointments"
  ON public.appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pet_shops
      WHERE pet_shops.id = appointments.pet_shop_id
      AND pet_shops.owner_id = auth.uid()
    )
    OR public.is_employee_of_petshop(auth.uid(), appointments.pet_shop_id)
    OR auth.uid() = appointments.client_id
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Pet shops and professionals can update appointments"
  ON public.appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pet_shops
      WHERE pet_shops.id = appointments.pet_shop_id
      AND pet_shops.owner_id = auth.uid()
    )
    OR public.is_employee_of_petshop(auth.uid(), appointments.pet_shop_id)
    OR (auth.uid() = appointments.client_id AND status IN ('pending', 'confirmed'))
  );

-- 7. Atualizar políticas de PRODUCTS (adicionar/editar estoque)
DROP POLICY IF EXISTS "Pet shops can manage their products" ON public.products;

CREATE POLICY "Pet shops and professionals can manage products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pet_shops
      WHERE pet_shops.id = products.pet_shop_id
      AND pet_shops.owner_id = auth.uid()
    )
    OR public.is_employee_of_petshop(auth.uid(), products.pet_shop_id)
  );

-- 8. Atualizar políticas de STOCK_MOVEMENTS (movimentação estoque)
DROP POLICY IF EXISTS "Pet shops can insert stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Pet shops can view their stock movements" ON public.stock_movements;

CREATE POLICY "Pet shops and professionals can view stock movements"
  ON public.stock_movements FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM products p
      JOIN pet_shops ps ON ps.id = p.pet_shop_id
      WHERE p.id = stock_movements.product_id
      AND (ps.owner_id = auth.uid() OR public.is_employee_of_petshop(auth.uid(), ps.id))
    )
  );

CREATE POLICY "Pet shops and professionals can insert stock movements"
  ON public.stock_movements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM products p
      JOIN pet_shops ps ON ps.id = p.pet_shop_id
      WHERE p.id = stock_movements.product_id
      AND (ps.owner_id = auth.uid() OR public.is_employee_of_petshop(auth.uid(), ps.id))
    )
  );

-- 9. Atualizar políticas de PAYMENTS (acesso financeiro)
DROP POLICY IF EXISTS "Pet shops can manage payments" ON public.payments;

CREATE POLICY "Pet shops and professionals can manage payments"
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM appointments a
      JOIN pet_shops ps ON ps.id = a.pet_shop_id
      WHERE a.id = payments.appointment_id
      AND (ps.owner_id = auth.uid() OR public.is_employee_of_petshop(auth.uid(), ps.id))
    )
  );

-- 10. Atualizar políticas de SHOP_SCHEDULE (horários)
DROP POLICY IF EXISTS "Pet shops can manage their schedule" ON public.shop_schedule;

CREATE POLICY "Pet shops and professionals can manage schedule"
  ON public.shop_schedule FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pet_shops
      WHERE pet_shops.id = shop_schedule.pet_shop_id
      AND (pet_shops.owner_id = auth.uid() OR public.is_employee_of_petshop(auth.uid(), shop_schedule.pet_shop_id))
    )
  );

-- 11. Atualizar políticas de COMMISSIONS
DROP POLICY IF EXISTS "Pet shops can manage commissions" ON public.commissions;

CREATE POLICY "Pet shops and professionals can manage commissions"
  ON public.commissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pet_shops
      WHERE pet_shops.id = commissions.pet_shop_id
      AND (pet_shops.owner_id = auth.uid() OR public.is_employee_of_petshop(auth.uid(), commissions.pet_shop_id))
    )
  );

-- 12. Trigger para updated_at
CREATE OR REPLACE TRIGGER update_petshop_employees_updated_at
  BEFORE UPDATE ON public.petshop_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 13. Comentários para documentação
COMMENT ON TABLE public.petshop_employees IS 'Vínculo entre profissionais e pet shops com permissões de acesso';
COMMENT ON FUNCTION public.is_employee_of_petshop IS 'Verifica se um usuário é funcionário ativo de um pet shop específico';