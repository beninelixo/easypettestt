-- Corrigir função update_global_metrics para não usar coluna 'active' que não existe
CREATE OR REPLACE FUNCTION public.update_global_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Total pet shops (removendo filtro active que não existe)
  UPDATE public.global_metrics
  SET metric_value = (SELECT COUNT(*) FROM public.pet_shops),
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
  
  -- Cidades cobertas (removendo filtro active)
  UPDATE public.global_metrics
  SET metric_value = (
    SELECT COUNT(DISTINCT city)
    FROM public.pet_shops
    WHERE city IS NOT NULL AND city != ''
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