-- Add popularity tracking to service_templates
ALTER TABLE service_templates ADD COLUMN IF NOT EXISTS times_used INTEGER DEFAULT 0;
ALTER TABLE service_templates ADD COLUMN IF NOT EXISTS popularity_score NUMERIC DEFAULT 0;

-- Create index for better performance on popularity queries
CREATE INDEX IF NOT EXISTS idx_service_templates_popularity ON service_templates(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_service_templates_price ON service_templates(suggested_price_min, suggested_price_max);
CREATE INDEX IF NOT EXISTS idx_service_templates_duration ON service_templates(suggested_duration_minutes);

-- Function to get appointments by period (dynamic time range)
CREATE OR REPLACE FUNCTION public.get_appointments_by_period(
  _pet_shop_id uuid,
  _period text DEFAULT 'week',
  _start_date date DEFAULT NULL,
  _end_date date DEFAULT NULL
)
RETURNS TABLE(day text, completed bigint, pending bigint, cancelled bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  computed_start_date date;
  computed_end_date date;
BEGIN
  -- Calculate date range based on period
  IF _start_date IS NOT NULL AND _end_date IS NOT NULL THEN
    computed_start_date := _start_date;
    computed_end_date := _end_date;
  ELSE
    CASE _period
      WHEN 'week' THEN
        computed_start_date := CURRENT_DATE - interval '6 days';
        computed_end_date := CURRENT_DATE;
      WHEN 'month' THEN
        computed_start_date := CURRENT_DATE - interval '29 days';
        computed_end_date := CURRENT_DATE;
      WHEN 'year' THEN
        computed_start_date := CURRENT_DATE - interval '364 days';
        computed_end_date := CURRENT_DATE;
      ELSE
        computed_start_date := CURRENT_DATE - interval '6 days';
        computed_end_date := CURRENT_DATE;
    END CASE;
  END IF;

  RETURN QUERY
  WITH date_series AS (
    SELECT 
      generate_series(computed_start_date, computed_end_date, '1 day'::interval)::date AS day_date
  ),
  day_names AS (
    SELECT 
      day_date,
      CASE 
        WHEN _period = 'year' THEN TO_CHAR(day_date, 'Mon/YY')
        WHEN _period = 'month' THEN TO_CHAR(day_date, 'DD/MM')
        ELSE
          CASE extract(dow from day_date)
            WHEN 0 THEN 'Dom'
            WHEN 1 THEN 'Seg'
            WHEN 2 THEN 'Ter'
            WHEN 3 THEN 'Qua'
            WHEN 4 THEN 'Qui'
            WHEN 5 THEN 'Sex'
            WHEN 6 THEN 'Sáb'
          END
      END AS day_name
    FROM date_series
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
END;
$function$;

-- Function to get revenue by period
CREATE OR REPLACE FUNCTION public.get_revenue_by_period(
  _pet_shop_id uuid,
  _period text DEFAULT 'month',
  _months integer DEFAULT 6
)
RETURNS TABLE(period_label text, revenue numeric)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH period_series AS (
    SELECT 
      generate_series(
        date_trunc('month', CURRENT_DATE - (_months || ' months')::interval),
        date_trunc('month', CURRENT_DATE),
        '1 month'::interval
      )::date AS period_date
  )
  SELECT 
    CASE 
      WHEN _period = 'year' THEN TO_CHAR(ps.period_date, 'Mon/YY')
      ELSE TO_CHAR(ps.period_date, 'Mon')
    END AS period_label,
    COALESCE(SUM(s.price), 0) AS revenue
  FROM period_series ps
  LEFT JOIN appointments a ON 
    date_trunc('month', a.scheduled_date) = ps.period_date
    AND a.pet_shop_id = _pet_shop_id
    AND a.status = 'completed'
  LEFT JOIN services s ON s.id = a.service_id
  GROUP BY ps.period_date
  ORDER BY ps.period_date;
END;
$function$;