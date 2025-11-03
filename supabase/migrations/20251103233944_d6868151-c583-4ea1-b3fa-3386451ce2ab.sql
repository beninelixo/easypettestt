-- Habilitar realtime para notificações
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Adicionar índice para melhor performance em notificações
CREATE INDEX IF NOT EXISTS idx_notifications_client_status 
ON public.notifications(client_id, status, created_at DESC);

-- Adicionar índice para payments joins
CREATE INDEX IF NOT EXISTS idx_payments_appointment 
ON public.payments(appointment_id);