-- ==========================================
-- PARTE 1: EXPANDIR TABELA PROFILES (TUTORES)
-- ==========================================

-- Adicionar novos campos para tutores
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS document TEXT, -- CPF/CNPJ
  ADD COLUMN IF NOT EXISTS contact_preference TEXT DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS user_code TEXT UNIQUE DEFAULT generate_user_code();

-- Criar índice para performance em buscas por documento
CREATE INDEX IF NOT EXISTS idx_profiles_document ON public.profiles(document) WHERE document IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.address IS 'Endereço completo do tutor';
COMMENT ON COLUMN public.profiles.document IS 'CPF (11 dígitos) ou CNPJ (14 dígitos)';
COMMENT ON COLUMN public.profiles.contact_preference IS 'Preferência de contato: phone, whatsapp ou email';

-- ==========================================
-- PARTE 2: EXPANDIR TABELA PETS
-- ==========================================

-- Adicionar novos campos para pets
ALTER TABLE public.pets 
  ADD COLUMN IF NOT EXISTS species TEXT DEFAULT 'dog', -- dog, cat, bird, rabbit, other
  ADD COLUMN IF NOT EXISTS gender TEXT, -- male, female
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS coat_type TEXT, -- short, long, curly, straight, hairless
  ADD COLUMN IF NOT EXISTS coat_color TEXT,
  ADD COLUMN IF NOT EXISTS size TEXT, -- small, medium, large, giant
  ADD COLUMN IF NOT EXISTS neutered BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vaccination_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS chronic_diseases TEXT,
  ADD COLUMN IF NOT EXISTS temperament TEXT, -- docile, playful, aggressive, fearful, calm
  ADD COLUMN IF NOT EXISTS restrictions TEXT,
  ADD COLUMN IF NOT EXISTS grooming_preferences TEXT;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pets_species ON public.pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_size ON public.pets(size);
CREATE INDEX IF NOT EXISTS idx_pets_owner_species ON public.pets(owner_id, species);
CREATE INDEX IF NOT EXISTS idx_pets_birth_date ON public.pets(birth_date) WHERE birth_date IS NOT NULL;

-- Criar índice GIN para busca em histórico de vacinação (JSONB)
CREATE INDEX IF NOT EXISTS idx_pets_vaccination_history ON public.pets USING GIN(vaccination_history);

-- Comentários para documentação
COMMENT ON COLUMN public.pets.species IS 'Espécie do pet: dog, cat, bird, rabbit, other';
COMMENT ON COLUMN public.pets.gender IS 'Sexo do pet: male, female';
COMMENT ON COLUMN public.pets.birth_date IS 'Data de nascimento do pet';
COMMENT ON COLUMN public.pets.coat_type IS 'Tipo de pelagem: short, long, curly, straight, hairless';
COMMENT ON COLUMN public.pets.coat_color IS 'Cor da pelagem';
COMMENT ON COLUMN public.pets.size IS 'Porte: small, medium, large, giant';
COMMENT ON COLUMN public.pets.neutered IS 'Se o pet é castrado';
COMMENT ON COLUMN public.pets.vaccination_history IS 'Histórico de vacinação em formato JSON';
COMMENT ON COLUMN public.pets.chronic_diseases IS 'Doenças crônicas do pet';
COMMENT ON COLUMN public.pets.temperament IS 'Temperamento: docile, playful, aggressive, fearful, calm';
COMMENT ON COLUMN public.pets.restrictions IS 'Restrições especiais';
COMMENT ON COLUMN public.pets.grooming_preferences IS 'Preferências de banho e tosa';

-- ==========================================
-- PARTE 3: CRIAR TABELA DE HISTÓRICO DE BACKUPS PROFISSIONAIS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.professional_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_shop_id UUID NOT NULL REFERENCES public.pet_shops(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  backup_type TEXT NOT NULL, -- full, partial
  format TEXT NOT NULL, -- json, csv, pdf, all
  date_range_start DATE,
  date_range_end DATE,
  file_size_bytes BIGINT,
  storage_path TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'completed', -- pending, processing, completed, failed
  error_message TEXT
);

-- Criar índices
CREATE INDEX idx_professional_backups_pet_shop ON public.professional_backups(pet_shop_id);
CREATE INDEX idx_professional_backups_created_by ON public.professional_backups(created_by);
CREATE INDEX idx_professional_backups_created_at ON public.professional_backups(created_at DESC);

-- RLS Policies
ALTER TABLE public.professional_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet shop owners can view their backups"
  ON public.professional_backups
  FOR SELECT
  USING (
    pet_shop_id IN (
      SELECT id FROM public.pet_shops WHERE owner_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Pet shop owners can create backups"
  ON public.professional_backups
  FOR INSERT
  WITH CHECK (
    pet_shop_id IN (
      SELECT id FROM public.pet_shops WHERE owner_id = auth.uid()
    )
  );

-- Comentários
COMMENT ON TABLE public.professional_backups IS 'Histórico de backups criados por profissionais';
COMMENT ON COLUMN public.professional_backups.backup_type IS 'Tipo de backup: full (completo) ou partial (parcial)';
COMMENT ON COLUMN public.professional_backups.format IS 'Formato do backup: json, csv, pdf ou all';
COMMENT ON COLUMN public.professional_backups.metadata IS 'Metadados do backup (totais, filtros aplicados, etc)';

-- ==========================================
-- PARTE 4: ATUALIZAR FUNÇÃO DE CÁLCULO DE IDADE
-- ==========================================

-- Criar função para calcular idade do pet a partir da data de nascimento
CREATE OR REPLACE FUNCTION public.calculate_pet_age(birth_date DATE)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT EXTRACT(YEAR FROM AGE(birth_date))::INTEGER;
$$;

COMMENT ON FUNCTION public.calculate_pet_age IS 'Calcula a idade do pet em anos a partir da data de nascimento';