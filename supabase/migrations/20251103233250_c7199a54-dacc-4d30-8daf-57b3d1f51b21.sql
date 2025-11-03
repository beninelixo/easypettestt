-- =====================================================
-- CORREÇÃO CRÍTICA: Remover Recursão Infinita em RLS
-- =====================================================

-- 1. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Pet shops and professionals can view appointments" ON appointments;
DROP POLICY IF EXISTS "Pet shops and professionals can update appointments" ON appointments;
DROP POLICY IF EXISTS "Clients can view pet shops where they have appointments" ON pet_shops;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- 2. CRIAR POLÍTICAS SIMPLES SEM RECURSÃO PARA APPOINTMENTS
CREATE POLICY "View own appointments or as petshop owner"
ON appointments FOR SELECT
TO authenticated
USING (
  auth.uid() = client_id 
  OR auth.uid() IN (SELECT owner_id FROM pet_shops WHERE id = pet_shop_id)
  OR is_employee_of_petshop(auth.uid(), pet_shop_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Update appointments as owner or employee"
ON appointments FOR UPDATE
TO authenticated
USING (
  auth.uid() = client_id
  OR auth.uid() IN (SELECT owner_id FROM pet_shops WHERE id = pet_shop_id)
  OR is_employee_of_petshop(auth.uid(), pet_shop_id)
);

-- 3. CRIAR POLÍTICA SIMPLES PARA PET_SHOPS (SEM REFERÊNCIA A APPOINTMENTS)
CREATE POLICY "View pet shops simple"
ON pet_shops FOR SELECT
TO authenticated
USING (
  auth.uid() = owner_id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR is_employee_of_petshop(auth.uid(), id)
);

-- 4. CRIAR POLÍTICA SIMPLES PARA PROFILES (SEM RECURSÃO)
CREATE POLICY "View own profile simple"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 5. ADICIONAR POLÍTICA PÚBLICA PARA PET_SHOPS (para clientes verem onde agendar)
CREATE POLICY "Public can view active pet shops"
ON pet_shops FOR SELECT
TO authenticated
USING (true);

-- Comentário: Removidas todas as subqueries recursivas que causavam loop infinito
-- Agora as políticas usam apenas verificações diretas ou funções auxiliares