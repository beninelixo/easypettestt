CREATE TABLE IF NOT EXISTS public.settings_passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_pet_shop FOREIGN KEY (pet_shop_id) REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  CONSTRAINT unique_pet_shop UNIQUE(pet_shop_id)
);

ALTER TABLE public.settings_passwords ENABLE ROW LEVEL SECURITY;