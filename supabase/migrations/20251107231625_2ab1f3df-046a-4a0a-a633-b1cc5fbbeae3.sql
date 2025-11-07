-- Create whatsapp_settings table
CREATE TABLE IF NOT EXISTS public.whatsapp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  auto_confirmation BOOLEAN NOT NULL DEFAULT true,
  auto_reminder BOOLEAN NOT NULL DEFAULT true,
  reminder_hours_before INTEGER NOT NULL DEFAULT 24,
  business_phone TEXT,
  welcome_message TEXT DEFAULT 'Olá! Obrigado por escolher nosso petshop.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pet_shop_id)
);

-- Enable RLS
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;

-- Pet shop owners can view and manage their WhatsApp settings
CREATE POLICY "Pet shops can manage their WhatsApp settings"
ON public.whatsapp_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.pet_shops
    WHERE pet_shops.id = whatsapp_settings.pet_shop_id
    AND pet_shops.owner_id = auth.uid()
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_whatsapp_settings_updated_at
BEFORE UPDATE ON public.whatsapp_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_whatsapp_settings_pet_shop_id ON public.whatsapp_settings(pet_shop_id);