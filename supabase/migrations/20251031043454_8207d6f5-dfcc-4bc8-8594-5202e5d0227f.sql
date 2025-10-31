-- Inserir serviços padrão de Banho e Tosa
-- Estes serviços serão templates que pet shops podem usar como base

-- Primeiro, vamos criar uma tabela para serviços padrão/templates
CREATE TABLE IF NOT EXISTS public.service_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'banho_tosa', 'clinica', 'pet_shop'
  name TEXT NOT NULL,
  description TEXT,
  suggested_duration_minutes INTEGER NOT NULL,
  suggested_price_min NUMERIC,
  suggested_price_max NUMERIC,
  icon TEXT, -- emoji ou nome do ícone
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.service_templates ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem visualizar templates ativos
CREATE POLICY "Anyone can view active service templates"
ON public.service_templates
FOR SELECT
USING (active = true);

-- Política: Apenas admins podem gerenciar templates
CREATE POLICY "Only admins can manage service templates"
ON public.service_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- SERVIÇOS DE BANHO E TOSA
INSERT INTO public.service_templates (category, name, description, suggested_duration_minutes, suggested_price_min, suggested_price_max, icon) VALUES
-- Banhos
('banho_tosa', 'Banho Simples - Porte Pequeno', 'Banho básico para cães até 10kg', 30, 40.00, 60.00, '🛁'),
('banho_tosa', 'Banho Simples - Porte Médio', 'Banho básico para cães de 10kg a 25kg', 45, 60.00, 90.00, '🛁'),
('banho_tosa', 'Banho Simples - Porte Grande', 'Banho básico para cães acima de 25kg', 60, 90.00, 150.00, '🛁'),
('banho_tosa', 'Banho Premium - Porte Pequeno', 'Banho completo com hidratação e perfumaria', 45, 60.00, 90.00, '✨'),
('banho_tosa', 'Banho Premium - Porte Médio', 'Banho completo com hidratação e perfumaria', 60, 90.00, 120.00, '✨'),
('banho_tosa', 'Banho Premium - Porte Grande', 'Banho completo com hidratação e perfumaria', 75, 120.00, 180.00, '✨'),

-- Tosa
('banho_tosa', 'Tosa Higiênica - Porte Pequeno', 'Tosa de higiene em áreas específicas', 30, 30.00, 50.00, '✂️'),
('banho_tosa', 'Tosa Higiênica - Porte Médio', 'Tosa de higiene em áreas específicas', 40, 50.00, 70.00, '✂️'),
('banho_tosa', 'Tosa Higiênica - Porte Grande', 'Tosa de higiene em áreas específicas', 50, 70.00, 100.00, '✂️'),
('banho_tosa', 'Tosa Completa - Porte Pequeno', 'Tosa completa com máquina e tesoura', 60, 70.00, 100.00, '💇'),
('banho_tosa', 'Tosa Completa - Porte Médio', 'Tosa completa com máquina e tesoura', 75, 100.00, 150.00, '💇'),
('banho_tosa', 'Tosa Completa - Porte Grande', 'Tosa completa com máquina e tesoura', 90, 150.00, 250.00, '💇'),
('banho_tosa', 'Tosa Bebê', 'Tosa estilo bebê (pelo mais longo)', 60, 80.00, 120.00, '🐾'),
('banho_tosa', 'Tosa na Tesoura', 'Tosa artesanal apenas com tesoura', 90, 120.00, 200.00, '✂️'),

-- Combo Banho e Tosa
('banho_tosa', 'Combo Banho + Tosa - Pequeno', 'Banho completo + tosa', 90, 90.00, 140.00, '🎁'),
('banho_tosa', 'Combo Banho + Tosa - Médio', 'Banho completo + tosa', 120, 140.00, 200.00, '🎁'),
('banho_tosa', 'Combo Banho + Tosa - Grande', 'Banho completo + tosa', 150, 200.00, 350.00, '🎁'),

-- Serviços Adicionais
('banho_tosa', 'Corte de Unhas', 'Corte e lixamento de unhas', 15, 15.00, 30.00, '💅'),
('banho_tosa', 'Limpeza de Ouvidos', 'Higienização completa dos ouvidos', 15, 15.00, 25.00, '👂'),
('banho_tosa', 'Escovação de Dentes', 'Escovação dentária com produtos específicos', 15, 20.00, 35.00, '🦷'),
('banho_tosa', 'Hidratação Profunda', 'Tratamento de hidratação para pelos', 30, 40.00, 80.00, '💧'),
('banho_tosa', 'Tosa Sanitária', 'Tosa apenas em região íntima', 20, 25.00, 40.00, '✂️'),
('banho_tosa', 'Penteado e Laço', 'Finalização com penteado e acessórios', 15, 10.00, 25.00, '🎀'),
('banho_tosa', 'Tratamento Anti-Pulgas', 'Aplicação de produtos anti-parasitas', 20, 30.00, 60.00, '🪲'),

-- SERVIÇOS DE CLÍNICA VETERINÁRIA
-- Consultas
('clinica', 'Consulta Veterinária', 'Consulta clínica geral', 30, 80.00, 150.00, '🩺'),
('clinica', 'Consulta de Retorno', 'Retorno de consulta recente', 20, 40.00, 80.00, '🩺'),
('clinica', 'Consulta de Emergência', 'Atendimento urgente', 40, 150.00, 300.00, '🚨'),
('clinica', 'Consulta Cardiológica', 'Avaliação especializada do coração', 45, 150.00, 300.00, '❤️'),
('clinica', 'Consulta Dermatológica', 'Avaliação de pele e pelos', 40, 120.00, 250.00, '🔬'),
('clinica', 'Consulta Ortopédica', 'Avaliação de ossos e articulações', 45, 150.00, 300.00, '🦴'),

-- Vacinas
('clinica', 'Vacina V8', 'Proteção contra 8 doenças', 15, 60.00, 100.00, '💉'),
('clinica', 'Vacina V10', 'Proteção contra 10 doenças', 15, 80.00, 120.00, '💉'),
('clinica', 'Vacina Antirrábica', 'Proteção contra raiva', 15, 40.00, 70.00, '💉'),
('clinica', 'Vacina Giárdia', 'Proteção contra giardíase', 15, 70.00, 110.00, '💉'),
('clinica', 'Vacina Gripe Canina', 'Proteção contra tosse dos canis', 15, 60.00, 100.00, '💉'),
('clinica', 'Vacina Leishmaniose', 'Proteção contra leishmaniose', 15, 150.00, 250.00, '💉'),

-- Exames
('clinica', 'Exame de Sangue Completo', 'Hemograma completo', 30, 80.00, 150.00, '🔬'),
('clinica', 'Exame de Urina', 'Urinálise completa', 20, 50.00, 90.00, '🔬'),
('clinica', 'Exame de Fezes', 'Parasitológico de fezes', 20, 40.00, 70.00, '🔬'),
('clinica', 'Ultrassom Abdominal', 'Ultrassonografia abdominal', 45, 150.00, 300.00, '📱'),
('clinica', 'Raio-X Simples', 'Radiografia simples', 30, 100.00, 200.00, '📸'),
('clinica', 'Raio-X Contrastado', 'Radiografia com contraste', 45, 200.00, 400.00, '📸'),
('clinica', 'Eletrocardiograma', 'Avaliação cardíaca', 30, 120.00, 250.00, '📊'),
('clinica', 'Teste Rápido Cinomose', 'Diagnóstico rápido', 15, 80.00, 150.00, '🧪'),
('clinica', 'Teste Rápido Parvovirose', 'Diagnóstico rápido', 15, 80.00, 150.00, '🧪'),

-- Procedimentos
('clinica', 'Castração Fêmea - Pequeno', 'Cirurgia de castração', 120, 300.00, 500.00, '🏥'),
('clinica', 'Castração Fêmea - Médio', 'Cirurgia de castração', 150, 400.00, 700.00, '🏥'),
('clinica', 'Castração Fêmea - Grande', 'Cirurgia de castração', 180, 600.00, 1000.00, '🏥'),
('clinica', 'Castração Macho - Pequeno', 'Cirurgia de castração', 90, 250.00, 400.00, '🏥'),
('clinica', 'Castração Macho - Médio', 'Cirurgia de castração', 120, 350.00, 600.00, '🏥'),
('clinica', 'Castração Macho - Grande', 'Cirurgia de castração', 150, 500.00, 900.00, '🏥'),
('clinica', 'Limpeza Dentária', 'Limpeza com ultrassom sob anestesia', 120, 400.00, 800.00, '🦷'),
('clinica', 'Extração Dentária', 'Remoção de dente danificado', 90, 200.00, 500.00, '🦷'),
('clinica', 'Sutura Simples', 'Sutura de ferimentos', 45, 150.00, 300.00, '🪡'),
('clinica', 'Drenagem de Abscesso', 'Drenagem cirúrgica', 60, 200.00, 400.00, '💉'),
('clinica', 'Microchipagem', 'Implante de microchip de identificação', 20, 80.00, 150.00, '📡'),

-- Internação e Acompanhamento
('clinica', 'Internação por Dia', 'Internação com monitoramento 24h', 1440, 150.00, 300.00, '🏨'),
('clinica', 'Fluidoterapia', 'Aplicação de soro intravenoso', 60, 80.00, 150.00, '💧'),
('clinica', 'Medicação Injetável', 'Aplicação de medicamento', 15, 30.00, 60.00, '💉'),
('clinica', 'Curativos', 'Troca de curativos', 30, 40.00, 80.00, '🩹'),
('clinica', 'Nebulização', 'Terapia respiratória', 30, 50.00, 100.00, '🌬️');

-- Comentário: Esta tabela serve como catálogo de serviços que os pet shops podem usar como referência
-- ao criar seus próprios serviços. Isso facilita a padronização e ajuda novos pet shops
-- a começar rapidamente com uma base de serviços profissional.