-- Fix search_path for generate_pet_shop_code function
DROP FUNCTION IF EXISTS generate_pet_shop_code();

CREATE OR REPLACE FUNCTION generate_pet_shop_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code like PET-1234
    new_code := 'PET-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.pet_shops WHERE code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;