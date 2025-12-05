-- Criar tabela para assinantes da newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'blog',
  active BOOLEAN DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Permitir inserção anônima (para formulário público)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Apenas admins podem ver/gerenciar assinantes
CREATE POLICY "Admins can manage newsletter subscribers"
ON public.newsletter_subscribers
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR is_god_user(auth.uid()))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_god_user(auth.uid()));

-- Índice para buscas por email
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_source ON public.newsletter_subscribers(source);