-- Create site_images table for dynamic image URLs
CREATE TABLE IF NOT EXISTS public.site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  category TEXT DEFAULT 'site',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view site images"
ON public.site_images FOR SELECT
USING (true);

-- Admins can manage images
CREATE POLICY "Admins can manage site images"
ON public.site_images FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR is_god_user(auth.uid()))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_god_user(auth.uid()));

-- Create index
CREATE INDEX idx_site_images_key ON public.site_images(key);
CREATE INDEX idx_site_images_category ON public.site_images(category);

-- Insert default images with placeholder URLs
INSERT INTO public.site_images (key, url, alt_text, category) VALUES
  ('hero-petshop', '/src/assets/hero-petshop.jpg', 'Sistema EasyPet em ação', 'site'),
  ('system-dashboard', '/src/assets/system-dashboard.jpg', 'Dashboard do Sistema', 'site'),
  ('happy-clients', '/src/assets/happy-clients.jpg', 'Clientes Felizes', 'site'),
  ('vet-care', '/src/assets/vet-care.jpg', 'Cuidados Veterinários', 'site')
ON CONFLICT (key) DO NOTHING;