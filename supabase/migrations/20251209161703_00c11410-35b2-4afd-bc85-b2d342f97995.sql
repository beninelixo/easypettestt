-- Permitir que visitantes não autenticados (anon) vejam as imagens do site
-- Isso é necessário porque as imagens do site e blog são conteúdo público
CREATE POLICY "Public can view site images" 
ON public.site_images
FOR SELECT 
TO anon
USING (true);