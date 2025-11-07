-- Criar tabela de casos de sucesso
CREATE TABLE public.success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  business_name VARCHAR(200) NOT NULL,
  owner_name VARCHAR(200) NOT NULL,
  location VARCHAR(200) NOT NULL,
  segment VARCHAR(50) NOT NULL CHECK (segment IN ('petshop', 'banhotosa', 'clinica')),
  
  -- Resultados mensuráveis
  revenue_growth_percent NUMERIC(5,2),
  total_clients INTEGER,
  satisfaction_rating NUMERIC(2,1) CHECK (satisfaction_rating >= 0 AND satisfaction_rating <= 5),
  
  -- História e depoimento
  testimonial TEXT NOT NULL,
  highlight VARCHAR(300) NOT NULL,
  
  -- Mídia
  image_url TEXT,
  video_url TEXT,
  
  -- Meta informações
  approved BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Pet shops podem ver apenas seus próprios casos
CREATE POLICY "Pet shops can view their own success stories"
  ON public.success_stories FOR SELECT
  USING (pet_shop_id IN (
    SELECT id FROM public.pet_shops WHERE owner_id = auth.uid()
  ));

-- Pet shops podem inserir seus próprios casos (mas não aprovados)
CREATE POLICY "Pet shops can insert their own success stories"
  ON public.success_stories FOR INSERT
  WITH CHECK (
    pet_shop_id IN (SELECT id FROM public.pet_shops WHERE owner_id = auth.uid())
    AND approved = FALSE
  );

-- Todos podem ver casos aprovados (para página pública)
CREATE POLICY "Anyone can view approved success stories"
  ON public.success_stories FOR SELECT
  USING (approved = TRUE);

-- Admins podem fazer tudo
CREATE POLICY "Admins can do everything on success_stories"
  ON public.success_stories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_success_stories_updated_at
  BEFORE UPDATE ON public.success_stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_success_stories_segment ON public.success_stories(segment);
CREATE INDEX idx_success_stories_approved ON public.success_stories(approved);
CREATE INDEX idx_success_stories_featured ON public.success_stories(featured);
CREATE INDEX idx_success_stories_display_order ON public.success_stories(display_order);

-- Criar tabela de métricas globais
CREATE TABLE public.global_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) UNIQUE NOT NULL,
  metric_value NUMERIC(12,2) NOT NULL,
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('count', 'percentage', 'currency', 'text', 'rating')),
  description TEXT,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para métricas globais
ALTER TABLE public.global_metrics ENABLE ROW LEVEL SECURITY;

-- Todos podem ver métricas
CREATE POLICY "Anyone can view global metrics"
  ON public.global_metrics FOR SELECT
  USING (true);

-- Apenas admins podem gerenciar
CREATE POLICY "Admins can manage global metrics"
  ON public.global_metrics FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Popular com métricas iniciais
INSERT INTO public.global_metrics (metric_name, metric_value, metric_type, description) VALUES
('total_active_petshops', 0, 'count', 'Total de pet shops ativos no sistema'),
('total_appointments', 0, 'count', 'Total de agendamentos realizados'),
('average_growth_percent', 0, 'percentage', 'Crescimento médio de faturamento dos clientes'),
('average_satisfaction', 0, 'rating', 'Satisfação média dos clientes (0-5)'),
('cities_covered', 0, 'count', 'Número de cidades atendidas');

-- Função para atualizar métricas globais automaticamente
CREATE OR REPLACE FUNCTION public.update_global_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Total pet shops ativos
  UPDATE public.global_metrics
  SET metric_value = (SELECT COUNT(*) FROM public.pet_shops WHERE active = TRUE),
      last_calculated_at = NOW(),
      updated_at = NOW()
  WHERE metric_name = 'total_active_petshops';
  
  -- Total appointments
  UPDATE public.global_metrics
  SET metric_value = (SELECT COUNT(*) FROM public.appointments),
      last_calculated_at = NOW(),
      updated_at = NOW()
  WHERE metric_name = 'total_appointments';
  
  -- Satisfação média
  UPDATE public.global_metrics
  SET metric_value = (
    SELECT COALESCE(AVG(rating), 0)
    FROM public.satisfaction_surveys
  ),
      last_calculated_at = NOW(),
      updated_at = NOW()
  WHERE metric_name = 'average_satisfaction';
  
  -- Cidades cobertas
  UPDATE public.global_metrics
  SET metric_value = (
    SELECT COUNT(DISTINCT city)
    FROM public.pet_shops
    WHERE active = TRUE AND city IS NOT NULL AND city != ''
  ),
      last_calculated_at = NOW(),
      updated_at = NOW()
  WHERE metric_name = 'cities_covered';
  
  -- Crescimento médio (dos casos aprovados)
  UPDATE public.global_metrics
  SET metric_value = (
    SELECT COALESCE(AVG(revenue_growth_percent), 0)
    FROM public.success_stories
    WHERE approved = TRUE AND revenue_growth_percent IS NOT NULL
  ),
      last_calculated_at = NOW(),
      updated_at = NOW()
  WHERE metric_name = 'average_growth_percent';
END;
$$;