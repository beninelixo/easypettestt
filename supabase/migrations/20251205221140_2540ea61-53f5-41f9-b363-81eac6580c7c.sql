-- Permitir que usuários anônimos vejam as imagens do site (são públicas)
CREATE POLICY "Public can view site images"
ON public.site_images
FOR SELECT
TO anon
USING (true);

-- Permitir que usuários autenticados também vejam
CREATE POLICY "Authenticated can view site images"
ON public.site_images
FOR SELECT
TO authenticated
USING (true);