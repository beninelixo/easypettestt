-- Tabela de configurações de horários do pet shop (bloqueio de horários)
CREATE TABLE IF NOT EXISTS public.shop_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Domingo, 6 = Sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_blocked BOOLEAN DEFAULT false,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de produtos e estoque
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  sku TEXT,
  cost_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_quantity INTEGER DEFAULT 5,
  expiry_date DATE,
  barcode TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'saida', 'ajuste')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de formas de pagamento
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('dinheiro', 'debito', 'credito', 'pix', 'boleto')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  installments INTEGER DEFAULT 1,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de comissões
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  service_id UUID REFERENCES public.services(id),
  appointment_id UUID REFERENCES public.appointments(id),
  commission_type TEXT NOT NULL CHECK (commission_type IN ('porcentagem', 'fixo')),
  commission_value DECIMAL(10,2) NOT NULL,
  amount_earned DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  reference_month DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de programa de fidelidade
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  total_points_earned INTEGER NOT NULL DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, pet_shop_id)
);

-- Tabela de histórico de pontos
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_points_id UUID NOT NULL REFERENCES public.loyalty_points(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('ganho', 'resgate', 'expiracao')),
  description TEXT,
  appointment_id UUID REFERENCES public.appointments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de galeria de fotos
CREATE TABLE IF NOT EXISTS public.pet_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id),
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('antes', 'depois', 'geral')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de campanhas de marketing
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('todos', 'inativos', 'frequentes', 'vip')),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email')),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'agendada', 'enviada', 'cancelada')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipients_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de pesquisas de satisfação
CREATE TABLE IF NOT EXISTS public.satisfaction_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de notificações/lembretes
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('lembrete', 'confirmacao', 'cancelamento', 'promocao')),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email', 'push')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'erro')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies para shop_schedule
ALTER TABLE public.shop_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet shops can manage their schedule"
ON public.shop_schedule FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pet_shops
    WHERE pet_shops.id = shop_schedule.pet_shop_id
    AND pet_shops.owner_id = auth.uid()
  )
);

CREATE POLICY "Everyone can view shop schedules"
ON public.shop_schedule FOR SELECT
TO authenticated
USING (true);

-- RLS Policies para products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet shops can manage their products"
ON public.products FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pet_shops
    WHERE pet_shops.id = products.pet_shop_id
    AND pet_shops.owner_id = auth.uid()
  )
);

-- RLS Policies para stock_movements
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet shops can view their stock movements"
ON public.stock_movements FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.pet_shops ps ON ps.id = p.pet_shop_id
    WHERE p.id = stock_movements.product_id
    AND ps.owner_id = auth.uid()
  )
);

CREATE POLICY "Pet shops can insert stock movements"
ON public.stock_movements FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.pet_shops ps ON ps.id = p.pet_shop_id
    WHERE p.id = stock_movements.product_id
    AND ps.owner_id = auth.uid()
  )
);

-- RLS Policies para payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet shops can manage payments"
ON public.payments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.pet_shops ps ON ps.id = a.pet_shop_id
    WHERE a.id = payments.appointment_id
    AND ps.owner_id = auth.uid()
  )
);

-- RLS Policies para commissions
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet shops can manage commissions"
ON public.commissions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pet_shops
    WHERE pet_shops.id = commissions.pet_shop_id
    AND pet_shops.owner_id = auth.uid()
  )
);

-- RLS Policies para loyalty_points
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own points"
ON public.loyalty_points FOR SELECT
TO authenticated
USING (auth.uid() = client_id);

CREATE POLICY "Pet shops can manage loyalty points"
ON public.loyalty_points FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pet_shops
    WHERE pet_shops.id = loyalty_points.pet_shop_id
    AND pet_shops.owner_id = auth.uid()
  )
);

-- RLS Policies para loyalty_transactions
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their loyalty transactions"
ON public.loyalty_transactions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.loyalty_points lp
    WHERE lp.id = loyalty_transactions.loyalty_points_id
    AND lp.client_id = auth.uid()
  )
);

-- RLS Policies para pet_photos
ALTER TABLE public.pet_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet owners can view their pet photos"
ON public.pet_photos FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = pet_photos.pet_id
    AND pets.owner_id = auth.uid()
  )
);

CREATE POLICY "Pet shops can manage photos"
ON public.pet_photos FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pets p
    JOIN public.appointments a ON a.pet_id = p.id
    JOIN public.pet_shops ps ON ps.id = a.pet_shop_id
    WHERE p.id = pet_photos.pet_id
    AND ps.owner_id = auth.uid()
  )
);

-- RLS Policies para marketing_campaigns
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet shops can manage their campaigns"
ON public.marketing_campaigns FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pet_shops
    WHERE pet_shops.id = marketing_campaigns.pet_shop_id
    AND pet_shops.owner_id = auth.uid()
  )
);

-- RLS Policies para satisfaction_surveys
ALTER TABLE public.satisfaction_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can create their surveys"
ON public.satisfaction_surveys FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Pet shops can view surveys"
ON public.satisfaction_surveys FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.pet_shops ps ON ps.id = a.pet_shop_id
    WHERE a.id = satisfaction_surveys.appointment_id
    AND ps.owner_id = auth.uid()
  )
);

-- RLS Policies para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = client_id);

CREATE POLICY "Pet shops can manage notifications"
ON public.notifications FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.pet_shops ps ON ps.id = a.pet_shop_id
    WHERE a.id = notifications.appointment_id
    AND ps.owner_id = auth.uid()
  )
);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shop_schedule_updated_at BEFORE UPDATE ON public.shop_schedule
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();