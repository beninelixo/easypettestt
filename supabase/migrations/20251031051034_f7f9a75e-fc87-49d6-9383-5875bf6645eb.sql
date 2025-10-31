-- ==============================================
-- OTIMIZAÇÃO DE PERFORMANCE - ÍNDICES
-- ==============================================

-- Índices para appointments (tabela mais consultada)
CREATE INDEX IF NOT EXISTS idx_appointments_pet_shop_date 
  ON public.appointments(pet_shop_id, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_appointments_status_date 
  ON public.appointments(status, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_appointments_client_date 
  ON public.appointments(client_id, scheduled_date);

CREATE INDEX IF NOT EXISTS idx_appointments_completed_at 
  ON public.appointments(completed_at) WHERE status = 'completed';

-- Índices para payments
CREATE INDEX IF NOT EXISTS idx_payments_appointment_status 
  ON public.payments(appointment_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_status_created 
  ON public.payments(status, created_at);

-- Índices para pets
CREATE INDEX IF NOT EXISTS idx_pets_owner_id 
  ON public.pets(owner_id);

-- Índices para services
CREATE INDEX IF NOT EXISTS idx_services_petshop_active 
  ON public.services(pet_shop_id, active);

-- Índices para products
CREATE INDEX IF NOT EXISTS idx_products_petshop_active 
  ON public.products(pet_shop_id, active);

CREATE INDEX IF NOT EXISTS idx_products_stock 
  ON public.products(pet_shop_id, stock_quantity) 
  WHERE stock_quantity <= min_stock_quantity;

-- ==============================================
-- FUNÇÕES OTIMIZADAS DE AGREGAÇÃO
-- ==============================================

-- Função para calcular estatísticas do dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
  _pet_shop_id uuid,
  _date date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'today_appointments', (
      SELECT COUNT(*)
      FROM appointments
      WHERE pet_shop_id = _pet_shop_id
        AND scheduled_date = _date
    ),
    'monthly_revenue', (
      SELECT COALESCE(SUM(s.price), 0)
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      WHERE a.pet_shop_id = _pet_shop_id
        AND a.status = 'completed'
        AND a.scheduled_date >= date_trunc('month', _date)::date
        AND a.scheduled_date < (date_trunc('month', _date) + interval '1 month')::date
    ),
    'active_clients', (
      SELECT COUNT(DISTINCT client_id)
      FROM appointments
      WHERE pet_shop_id = _pet_shop_id
        AND scheduled_date >= _date - interval '90 days'
    ),
    'completed_services', (
      SELECT COUNT(*)
      FROM appointments
      WHERE pet_shop_id = _pet_shop_id
        AND status = 'completed'
    )
  );
$$;

-- Função para dados de receita mensal (últimos 6 meses)
CREATE OR REPLACE FUNCTION public.get_monthly_revenue(
  _pet_shop_id uuid,
  _months integer DEFAULT 6
)
RETURNS TABLE(month text, revenue numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH months AS (
    SELECT 
      generate_series(
        date_trunc('month', CURRENT_DATE - (_months || ' months')::interval),
        date_trunc('month', CURRENT_DATE),
        '1 month'::interval
      )::date AS month_date
  )
  SELECT 
    to_char(m.month_date, 'Mon') AS month,
    COALESCE(SUM(s.price), 0) AS revenue
  FROM months m
  LEFT JOIN appointments a ON 
    date_trunc('month', a.scheduled_date) = m.month_date
    AND a.pet_shop_id = _pet_shop_id
    AND a.status = 'completed'
  LEFT JOIN services s ON s.id = a.service_id
  GROUP BY m.month_date
  ORDER BY m.month_date;
$$;

-- Função para dados de agendamentos da semana
CREATE OR REPLACE FUNCTION public.get_weekly_appointments(
  _pet_shop_id uuid
)
RETURNS TABLE(
  day text, 
  completed bigint, 
  pending bigint, 
  cancelled bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    COUNT(*) FILTER (WHERE a.status = 'completed') AS completed,
    COUNT(*) FILTER (WHERE a.status IN ('pending', 'confirmed', 'in_progress')) AS pending,
    COUNT(*) FILTER (WHERE a.status = 'cancelled') AS cancelled
  FROM day_names dn
  LEFT JOIN appointments a ON 
    a.scheduled_date = dn.day_date
    AND a.pet_shop_id = _pet_shop_id
  GROUP BY dn.day_date, dn.day_name
  ORDER BY dn.day_date;
$$;

-- ==============================================
-- MANUTENÇÃO E ANÁLISE
-- ==============================================

-- Atualizar estatísticas das tabelas principais
ANALYZE appointments;
ANALYZE payments;
ANALYZE services;
ANALYZE pets;
ANALYZE products;