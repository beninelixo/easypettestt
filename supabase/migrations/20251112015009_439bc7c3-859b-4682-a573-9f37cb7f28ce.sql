-- Corrigir função get_weekly_appointments para incluir cancelados nos gráficos
CREATE OR REPLACE FUNCTION public.get_weekly_appointments(_pet_shop_id uuid)
RETURNS TABLE(day text, completed bigint, pending bigint, cancelled bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  WITH days AS (
    SELECT 
      generate_series(
        CURRENT_DATE - interval '6 days',
        CURRENT_DATE,
        '1 day'::interval
      )::date AS day_date,
      generate_series(0, 6) AS day_num
  ),
  day_names AS (
    SELECT 
      day_date,
      CASE extract(dow from day_date)
        WHEN 0 THEN 'Dom'
        WHEN 1 THEN 'Seg'
        WHEN 2 THEN 'Ter'
        WHEN 3 THEN 'Qua'
        WHEN 4 THEN 'Qui'
        WHEN 5 THEN 'Sex'
        WHEN 6 THEN 'Sáb'
      END AS day_name
    FROM days
  )
  SELECT 
    dn.day_name AS day,
    COALESCE(COUNT(*) FILTER (WHERE a.status = 'completed'), 0) AS completed,
    COALESCE(COUNT(*) FILTER (WHERE a.status IN ('pending', 'confirmed', 'in_progress')), 0) AS pending,
    COALESCE(COUNT(*) FILTER (WHERE a.status = 'cancelled'), 0) AS cancelled
  FROM day_names dn
  LEFT JOIN appointments a ON 
    a.scheduled_date = dn.day_date
    AND a.pet_shop_id = _pet_shop_id
  GROUP BY dn.day_date, dn.day_name
  ORDER BY dn.day_date;
$function$;