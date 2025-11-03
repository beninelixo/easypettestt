-- ============================================
-- FASE 1: CORREÇÕES IMEDIATAS
-- ============================================

-- 1.1. Corrigir agendamentos atrasados
UPDATE appointments
SET status = 'cancelled',
    notes = COALESCE(notes || E'\n', '') || '[AUTO-FIX ' || NOW()::DATE || '] Cancelado automaticamente por atraso'
WHERE scheduled_date < CURRENT_DATE
  AND status IN ('pending', 'confirmed');

-- 1.2. Adicionar constraint para prevenir horários duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_appointment_slot 
ON appointments (pet_shop_id, scheduled_date, scheduled_time)
WHERE status NOT IN ('cancelled', 'completed');

-- 1.3. Adicionar constraints para estoque não-negativo
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS check_stock_non_negative;

ALTER TABLE products 
ADD CONSTRAINT check_stock_non_negative 
CHECK (stock_quantity >= 0);

ALTER TABLE products 
DROP CONSTRAINT IF EXISTS check_min_stock_non_negative;

ALTER TABLE products 
ADD CONSTRAINT check_min_stock_non_negative 
CHECK (min_stock_quantity >= 0);

-- 1.4. Limpar pets órfãos
DELETE FROM pets
WHERE owner_id IS NULL 
   OR NOT EXISTS (
     SELECT 1 FROM auth.users u WHERE u.id = owner_id
   );

-- ============================================
-- FASE 2: TRIGGERS E AUTOMAÇÕES
-- ============================================

-- 2.1. Trigger para criar pagamento ao completar agendamento
CREATE OR REPLACE FUNCTION create_payment_on_complete()
RETURNS TRIGGER AS $$
DECLARE
  service_price NUMERIC;
BEGIN
  -- Somente se mudou para 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Buscar preço do serviço
    SELECT price INTO service_price
    FROM services
    WHERE id = NEW.service_id;
    
    -- Criar pagamento se não existir
    IF NOT EXISTS (SELECT 1 FROM payments WHERE appointment_id = NEW.id) THEN
      INSERT INTO payments (
        appointment_id,
        amount,
        payment_method,
        status
      ) VALUES (
        NEW.id,
        service_price,
        'dinheiro',
        'pendente'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_create_payment ON appointments;
CREATE TRIGGER trigger_create_payment
AFTER INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION create_payment_on_complete();

-- 2.2. Trigger para notificação de novo agendamento
CREATE OR REPLACE FUNCTION notify_new_appointment()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar notificação para o cliente
  INSERT INTO notifications (
    client_id,
    appointment_id,
    notification_type,
    channel,
    message,
    status
  ) VALUES (
    NEW.client_id,
    NEW.id,
    'confirmacao',
    'email',
    'Seu agendamento foi confirmado para ' || NEW.scheduled_date || ' às ' || NEW.scheduled_time,
    'pendente'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_notify_new_appointment ON appointments;
CREATE TRIGGER trigger_notify_new_appointment
AFTER INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION notify_new_appointment();

-- 2.3. Trigger para registrar movimentação de estoque
CREATE OR REPLACE FUNCTION log_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
  movement_quantity INTEGER;
  movement_type TEXT;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.stock_quantity != OLD.stock_quantity THEN
    movement_quantity := ABS(NEW.stock_quantity - OLD.stock_quantity);
    movement_type := CASE 
      WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'entrada'
      ELSE 'saida'
    END;
    
    INSERT INTO stock_movements (
      product_id,
      movement_type,
      quantity,
      reason,
      user_id
    ) VALUES (
      NEW.id,
      movement_type,
      movement_quantity,
      'Ajuste automático detectado',
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_log_stock_movement ON products;
CREATE TRIGGER trigger_log_stock_movement
AFTER UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION log_stock_movement();

-- ============================================
-- FASE 3: TABELA DE AUDITORIA
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Apenas admins podem ver audit logs" ON audit_logs;
CREATE POLICY "Apenas admins podem ver audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Trigger genérico de auditoria
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    table_name,
    operation,
    record_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Aplicar auditoria em tabelas críticas
DROP TRIGGER IF EXISTS audit_appointments ON appointments;
CREATE TRIGGER audit_appointments
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_payments ON payments;
CREATE TRIGGER audit_payments
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_products ON products;
CREATE TRIGGER audit_products
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ============================================
-- FASE 4: FUNÇÃO RPC PARA HEALTH CHECK
-- ============================================

CREATE OR REPLACE FUNCTION get_system_health()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'overdue_appointments', (
      SELECT COUNT(*) FROM appointments 
      WHERE scheduled_date < CURRENT_DATE 
        AND status IN ('pending', 'confirmed')
    ),
    'low_stock_products', (
      SELECT COUNT(*) FROM products 
      WHERE stock_quantity <= min_stock_quantity 
        AND active = true
    ),
    'negative_stock_products', (
      SELECT COUNT(*) FROM products 
      WHERE stock_quantity < 0
    ),
    'pending_payments', (
      SELECT COUNT(*) FROM payments 
      WHERE status = 'pendente'
    ),
    'old_pending_payments', (
      SELECT COUNT(*) FROM payments 
      WHERE status = 'pendente'
        AND created_at < NOW() - INTERVAL '30 days'
    ),
    'incomplete_profiles', (
      SELECT COUNT(*) FROM profiles 
      WHERE full_name = '' OR phone = ''
    ),
    'orphan_pets', (
      SELECT COUNT(*) FROM pets 
      WHERE owner_id IS NULL
    ),
    'expired_products', (
      SELECT COUNT(*) FROM products 
      WHERE expiry_date < CURRENT_DATE 
        AND active = true
    ),
    'expiring_soon_products', (
      SELECT COUNT(*) FROM products 
      WHERE expiry_date >= CURRENT_DATE 
        AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
        AND active = true
    ),
    'completed_without_payment', (
      SELECT COUNT(*) FROM appointments a
      WHERE a.status = 'completed'
        AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.appointment_id = a.id)
    ),
    'last_check', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION get_system_health() TO authenticated;