-- Create pet_shops table
CREATE TABLE public.pet_shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  logo_url TEXT,
  code TEXT NOT NULL UNIQUE,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pet_shops ENABLE ROW LEVEL SECURITY;

-- Create policies for pet_shops
CREATE POLICY "Pet shop owners can manage their shop"
ON public.pet_shops
FOR ALL
USING (auth.uid() = owner_id);

CREATE POLICY "Everyone can view active pet shops"
ON public.pet_shops
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_pet_shops_updated_at
BEFORE UPDATE ON public.pet_shops
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Function to generate unique pet shop code
CREATE OR REPLACE FUNCTION generate_pet_shop_code()
RETURNS TEXT
LANGUAGE plpgsql
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

-- Add revenue tracking to appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_pet_shop_id ON public.appointments(pet_shop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_date ON public.appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_services_pet_shop_id ON public.services(pet_shop_id);
CREATE INDEX IF NOT EXISTS idx_pet_shops_code ON public.pet_shops(code);