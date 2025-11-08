-- Tabela para IPs bloqueados
CREATE TABLE IF NOT EXISTS public.blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  blocked_by UUID REFERENCES auth.users(id),
  auto_blocked BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index para busca rápida por IP
CREATE INDEX IF NOT EXISTS idx_blocked_ips_address ON public.blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_until ON public.blocked_ips(blocked_until);

-- RLS para blocked_ips (apenas admins podem ver)
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view blocked IPs"
ON public.blocked_ips FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert blocked IPs"
ON public.blocked_ips FOR INSERT
TO authenticated
WITH CHECK (true);

-- Função para verificar se IP está bloqueado
CREATE OR REPLACE FUNCTION public.is_ip_blocked(_ip_address TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_ips
    WHERE ip_address = _ip_address
      AND blocked_until > NOW()
  );
$$;

-- Função para bloquear IP automaticamente
CREATE OR REPLACE FUNCTION public.auto_block_ip_if_needed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  failed_count INTEGER;
  should_block BOOLEAN;
BEGIN
  -- Apenas processar tentativas falhadas
  IF NEW.success = false AND NEW.ip_address IS NOT NULL THEN
    -- Contar falhas na última hora
    SELECT COUNT(*) INTO failed_count
    FROM public.login_attempts
    WHERE ip_address = NEW.ip_address
      AND success = false
      AND attempt_time > NOW() - INTERVAL '1 hour';
    
    -- Bloquear se atingiu 10 tentativas
    IF failed_count >= 10 THEN
      -- Verificar se já não está bloqueado
      SELECT public.is_ip_blocked(NEW.ip_address) INTO should_block;
      
      IF NOT should_block THEN
        -- Bloquear por 24 horas
        INSERT INTO public.blocked_ips (
          ip_address,
          blocked_until,
          reason,
          auto_blocked
        ) VALUES (
          NEW.ip_address,
          NOW() + INTERVAL '24 hours',
          'Bloqueio automático: ' || failed_count || ' tentativas falhadas em 1 hora',
          true
        )
        ON CONFLICT (ip_address) 
        DO UPDATE SET
          blocked_until = NOW() + INTERVAL '24 hours',
          blocked_at = NOW(),
          reason = 'Bloqueio automático: ' || failed_count || ' tentativas falhadas em 1 hora';
        
        -- Criar alerta de segurança
        INSERT INTO public.security_alerts (
          alert_type,
          severity,
          description,
          ip_address,
          metadata
        ) VALUES (
          'ip_blocked',
          'high',
          'IP bloqueado automaticamente após ' || failed_count || ' tentativas falhadas',
          NEW.ip_address,
          jsonb_build_object(
            'failed_attempts', failed_count,
            'blocked_until', NOW() + INTERVAL '24 hours'
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para bloqueio automático de IP
DROP TRIGGER IF EXISTS trigger_auto_block_ip ON public.login_attempts;
CREATE TRIGGER trigger_auto_block_ip
  AFTER INSERT ON public.login_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_block_ip_if_needed();

-- Criar bucket para backups no storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backups',
  'backups',
  false,
  524288000, -- 500MB limit
  ARRAY['application/json', 'application/gzip', 'application/x-gzip']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- RLS para bucket de backups (apenas admins)
CREATE POLICY "Admins can upload backups"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'backups' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can read backups"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'backups' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete backups"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'backups' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Adicionar coluna storage_path na tabela backup_history
ALTER TABLE public.backup_history 
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Função para limpar bloqueios expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_blocks()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.blocked_ips
  WHERE blocked_until < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;