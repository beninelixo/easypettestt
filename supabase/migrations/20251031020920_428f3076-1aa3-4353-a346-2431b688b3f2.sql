-- Add missing fields to pet_shops table
ALTER TABLE public.pet_shops
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS hours TEXT;

-- Add comment to clarify the fields
COMMENT ON COLUMN public.pet_shops.email IS 'Commercial email address';
COMMENT ON COLUMN public.pet_shops.description IS 'Short description of the pet shop';
COMMENT ON COLUMN public.pet_shops.hours IS 'Business hours (e.g., 08h às 18h)';