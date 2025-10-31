-- Fix appointments table to reference pet_shops.id instead of auth.users
-- This improves data integrity and proper relational design

-- Step 1: Drop the old foreign key constraint first
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_pet_shop_id_fkey;

-- Step 2: Update existing appointments data to use pet_shop.id instead of owner_id
UPDATE public.appointments a
SET pet_shop_id = ps.id
FROM public.pet_shops ps
WHERE ps.owner_id = a.pet_shop_id;

-- Step 3: Add new foreign key constraint referencing pet_shops table
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_pet_shop_id_fkey 
FOREIGN KEY (pet_shop_id) 
REFERENCES public.pet_shops(id) 
ON DELETE CASCADE;

-- Step 4: Add helpful comment
COMMENT ON COLUMN public.appointments.pet_shop_id IS 'References pet_shops.id for proper entity relationships';

-- Note: client_id correctly references auth.users as clients are users
-- The user_roles table and RLS policies enforce that only users with 'client' role can create appointments