
-- Step 1: Drop the incorrect foreign key constraint first
ALTER TABLE public.services 
DROP CONSTRAINT services_pet_shop_id_fkey;

-- Step 2: Update all services to use the correct pet_shop_id
UPDATE public.services s
SET pet_shop_id = ps.id
FROM public.pet_shops ps
WHERE ps.owner_id = s.pet_shop_id;

-- Step 3: Add the correct foreign key constraint referencing pet_shops table
ALTER TABLE public.services 
ADD CONSTRAINT services_pet_shop_id_fkey 
FOREIGN KEY (pet_shop_id) 
REFERENCES public.pet_shops(id) 
ON DELETE CASCADE;
