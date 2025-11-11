-- Função para Horários de Pico
CREATE OR REPLACE FUNCTION public.get_peak_hours(
  _pet_shop_id UUID,
  _days_back INTEGER DEFAULT 30
)
RETURNS TABLE(hour INTEGER, appointment_count BIGINT) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM scheduled_time)::INTEGER as hour,
    COUNT(*) as appointment_count
  FROM appointments
  WHERE pet_shop_id = _pet_shop_id
    AND scheduled_date >= CURRENT_DATE - _days_back
    AND status IN ('completed', 'confirmed', 'in_progress')
  GROUP BY EXTRACT(HOUR FROM scheduled_time)
  ORDER BY hour;
END;
$$;

-- Função para Taxa de No-Show
CREATE OR REPLACE FUNCTION public.get_no_show_stats(
  _pet_shop_id UUID,
  _date_start DATE DEFAULT CURRENT_DATE - 30,
  _date_end DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_appointments', COUNT(*),
    'no_shows', COUNT(*) FILTER (WHERE status = 'cancelled' AND scheduled_date < CURRENT_DATE),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'no_show_rate', 
      CASE 
        WHEN COUNT(*) > 0 
        THEN (COUNT(*) FILTER (WHERE status = 'cancelled' AND scheduled_date < CURRENT_DATE)::FLOAT / COUNT(*) * 100)
        ELSE 0 
      END,
    'by_day_of_week', (
      SELECT jsonb_object_agg(
        day_name,
        no_show_count
      )
      FROM (
        SELECT 
          TO_CHAR(scheduled_date, 'Day') as day_name,
          COUNT(*) FILTER (WHERE status = 'cancelled') as no_show_count
        FROM appointments
        WHERE pet_shop_id = _pet_shop_id
          AND scheduled_date BETWEEN _date_start AND _date_end
        GROUP BY TO_CHAR(scheduled_date, 'Day')
      ) sub
    )
  ) INTO result
  FROM appointments
  WHERE pet_shop_id = _pet_shop_id
    AND scheduled_date BETWEEN _date_start AND _date_end;
    
  RETURN result;
END;
$$;

-- Função para Agendamentos por Serviço
CREATE OR REPLACE FUNCTION public.get_appointments_by_service(
  _pet_shop_id UUID,
  _days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  service_name TEXT,
  service_count BIGINT,
  revenue NUMERIC,
  avg_duration INTEGER
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.name as service_name,
    COUNT(a.id) as service_count,
    COALESCE(SUM(s.price), 0) as revenue,
    AVG(s.duration_minutes)::INTEGER as avg_duration
  FROM appointments a
  JOIN services s ON s.id = a.service_id
  WHERE a.pet_shop_id = _pet_shop_id
    AND a.scheduled_date >= CURRENT_DATE - _days_back
    AND a.status = 'completed'
  GROUP BY s.name, s.id
  ORDER BY service_count DESC;
END;
$$;

-- Habilitar realtime para appointments
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- Habilitar realtime para payments
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;