-- Fix RLS policies for services table

-- Drop old ALL policy that was causing issues
DROP POLICY IF EXISTS "Pet shops and professionals can manage services" ON services;

-- Create specific policies for each operation

-- 1. SELECT: Anyone can view active services, owners/employees see everything
CREATE POLICY "Users can view active services"
ON services FOR SELECT
TO authenticated
USING (
  active = true 
  OR pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid())
  OR is_employee_of_petshop(auth.uid(), pet_shop_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 2. INSERT: Only owners and employees can add services
CREATE POLICY "Pet shop owners can insert services"
ON services FOR INSERT
TO authenticated
WITH CHECK (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid())
  OR is_employee_of_petshop(auth.uid(), pet_shop_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 3. UPDATE: Only owners and employees can update services
CREATE POLICY "Pet shop owners can update services"
ON services FOR UPDATE
TO authenticated
USING (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid())
  OR is_employee_of_petshop(auth.uid(), pet_shop_id)
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  pet_shop_id IN (SELECT id FROM pet_shops WHERE owner_id = auth.uid())
  OR is_employee_of_petshop(auth.uid(), pet_shop_id)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 4. DELETE: Keep existing soft delete policy (already exists and is correct)