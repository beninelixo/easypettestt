export interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration_minutes: number;
  icon: string;
}

export const serviceCategories = [
  { id: 'banho-tosa', name: '🛁 Banho & Tosa', color: 'bg-blue-500' },
  { id: 'veterinaria', name: '🏥 Clínica Veterinária', color: 'bg-green-500' },
  { id: 'estetica', name: '✨ Estética', color: 'bg-purple-500' },
  { id: 'hotel', name: '🏨 Hotel & Creche', color: 'bg-orange-500' },
  { id: 'adestramento', name: '🎓 Adestramento', color: 'bg-red-500' },
  { id: 'especiais', name: '⭐ Serviços Especiais', color: 'bg-yellow-500' },
];

export const serviceTemplates: ServiceTemplate[] = [
  // Banho & Tosa (15 serviços)
  { id: '1', name: 'Banho Tradicional', description: 'Banho completo com shampoo neutro', category: 'banho-tosa', price: 50, duration_minutes: 60, icon: '🛁' },
  { id: '2', name: 'Banho Premium', description: 'Banho com produtos importados e hidratação', category: 'banho-tosa', price: 80, duration_minutes: 90, icon: '✨' },
  { id: '3', name: 'Tosa Higiênica', description: 'Tosa em regiões específicas para higiene', category: 'banho-tosa', price: 40, duration_minutes: 45, icon: '✂️' },
  { id: '4', name: 'Tosa Completa', description: 'Tosa na tesoura ou máquina', category: 'banho-tosa', price: 70, duration_minutes: 120, icon: '💇' },
  { id: '5', name: 'Tosa Bebê', description: 'Tosa infantil delicada', category: 'banho-tosa', price: 65, duration_minutes: 90, icon: '🍼' },
  { id: '6', name: 'Banho a Seco', description: 'Limpeza sem água', category: 'banho-tosa', price: 45, duration_minutes: 40, icon: '🌪️' },
  { id: '7', name: 'Banho Medicado', description: 'Banho com shampoo prescrito pelo veterinário', category: 'banho-tosa', price: 90, duration_minutes: 75, icon: '💊' },
  { id: '8', name: 'Escovação de Pelos', description: 'Escovação profunda e desembaraço', category: 'banho-tosa', price: 35, duration_minutes: 45, icon: '🪮' },
  { id: '9', name: 'Corte de Unhas', description: 'Corte e lixamento de unhas', category: 'banho-tosa', price: 25, duration_minutes: 20, icon: '💅' },
  { id: '10', name: 'Limpeza de Ouvidos', description: 'Limpeza profissional dos ouvidos', category: 'banho-tosa', price: 30, duration_minutes: 25, icon: '👂' },
  { id: '11', name: 'Hidratação de Pelos', description: 'Tratamento de hidratação profunda', category: 'banho-tosa', price: 60, duration_minutes: 60, icon: '💧' },
  { id: '12', name: 'Spa Day', description: 'Dia completo de cuidados e mimos', category: 'banho-tosa', price: 180, duration_minutes: 240, icon: '🧖' },
  { id: '13', name: 'Banho e Tosa Express', description: 'Serviço rápido em até 1 hora', category: 'banho-tosa', price: 85, duration_minutes: 60, icon: '⚡' },
  { id: '14', name: 'Stripping', description: 'Técnica especial para raças de pelo duro', category: 'banho-tosa', price: 120, duration_minutes: 150, icon: '🦮' },
  { id: '15', name: 'Tosa Criativa', description: 'Cortes artísticos e personalizados', category: 'banho-tosa', price: 150, duration_minutes: 180, icon: '🎨' },

  // Clínica Veterinária (20 serviços)
  { id: '16', name: 'Consulta Veterinária', description: 'Consulta clínica geral', category: 'veterinaria', price: 120, duration_minutes: 30, icon: '🩺' },
  { id: '17', name: 'Vacinação V8', description: 'Vacina óctupla para cães', category: 'veterinaria', price: 80, duration_minutes: 15, icon: '💉' },
  { id: '18', name: 'Vacinação V10', description: 'Vacina déctupla para cães', category: 'veterinaria', price: 90, duration_minutes: 15, icon: '💉' },
  { id: '19', name: 'Vacinação Antirrábica', description: 'Vacina contra raiva', category: 'veterinaria', price: 70, duration_minutes: 15, icon: '🦠' },
  { id: '20', name: 'Vacinação Felina V3', description: 'Vacina tríplice para gatos', category: 'veterinaria', price: 85, duration_minutes: 15, icon: '🐱' },
  { id: '21', name: 'Vacinação Felina V4', description: 'Vacina quádrupla para gatos', category: 'veterinaria', price: 95, duration_minutes: 15, icon: '🐱' },
  { id: '22', name: 'Castração Macho', description: 'Procedimento cirúrgico de castração', category: 'veterinaria', price: 400, duration_minutes: 120, icon: '🏥' },
  { id: '23', name: 'Castração Fêmea', description: 'Procedimento cirúrgico de castração', category: 'veterinaria', price: 500, duration_minutes: 150, icon: '🏥' },
  { id: '24', name: 'Vermifugação', description: 'Aplicação de vermífugo', category: 'veterinaria', price: 40, duration_minutes: 10, icon: '💊' },
  { id: '25', name: 'Aplicação Antipulgas', description: 'Aplicação tópica de antipulgas', category: 'veterinaria', price: 50, duration_minutes: 15, icon: '🪲' },
  { id: '26', name: 'Exame de Sangue', description: 'Hemograma completo', category: 'veterinaria', price: 150, duration_minutes: 20, icon: '🧪' },
  { id: '27', name: 'Ultrassom', description: 'Exame de ultrassonografia', category: 'veterinaria', price: 200, duration_minutes: 30, icon: '📡' },
  { id: '28', name: 'Raio-X', description: 'Exame radiográfico', category: 'veterinaria', price: 180, duration_minutes: 25, icon: '📸' },
  { id: '29', name: 'Microchipagem', description: 'Implantação de microchip de identificação', category: 'veterinaria', price: 120, duration_minutes: 20, icon: '💾' },
  { id: '30', name: 'Limpeza Dentária', description: 'Limpeza profunda dos dentes', category: 'veterinaria', price: 300, duration_minutes: 90, icon: '🦷' },
  { id: '31', name: 'Consulta Cardiológica', description: 'Avaliação especializada do coração', category: 'veterinaria', price: 250, duration_minutes: 45, icon: '❤️' },
  { id: '32', name: 'Consulta Dermatológica', description: 'Avaliação de problemas de pele', category: 'veterinaria', price: 220, duration_minutes: 40, icon: '🔬' },
  { id: '33', name: 'Atendimento Emergencial', description: 'Atendimento de urgência', category: 'veterinaria', price: 350, duration_minutes: 60, icon: '🚨' },
  { id: '34', name: 'Internação Diária', description: 'Internação com acompanhamento', category: 'veterinaria', price: 200, duration_minutes: 1440, icon: '🛏️' },
  { id: '35', name: 'Eutanásia', description: 'Procedimento humanitário', category: 'veterinaria', price: 300, duration_minutes: 60, icon: '🕊️' },

  // Estética (10 serviços)
  { id: '36', name: 'Pintura de Pelos', description: 'Coloração temporária dos pelos', category: 'estetica', price: 100, duration_minutes: 90, icon: '🎨' },
  { id: '37', name: 'Aplicação de Glitter', description: 'Glitter pet-safe nos pelos', category: 'estetica', price: 40, duration_minutes: 30, icon: '✨' },
  { id: '38', name: 'Laço e Acessórios', description: 'Colocação de laços e enfeites', category: 'estetica', price: 20, duration_minutes: 15, icon: '🎀' },
  { id: '39', name: 'Perfume Pet', description: 'Aplicação de perfume pet-safe', category: 'estetica', price: 30, duration_minutes: 10, icon: '🌸' },
  { id: '40', name: 'Plush de Pelos', description: 'Acabamento fofinho estilo urso', category: 'estetica', price: 90, duration_minutes: 120, icon: '🧸' },
  { id: '41', name: 'Escova Progressiva Pet', description: 'Alisamento temporário dos pelos', category: 'estetica', price: 150, duration_minutes: 150, icon: '💆' },
  { id: '42', name: 'SPA das Patinhas', description: 'Hidratação especial das patas', category: 'estetica', price: 45, duration_minutes: 30, icon: '🐾' },
  { id: '43', name: 'Tratamento Anti-Queda', description: 'Tratamento para reduzir queda de pelos', category: 'estetica', price: 85, duration_minutes: 60, icon: '🧴' },
  { id: '44', name: 'Tonalização de Pelos', description: 'Matização para pelos brancos/amarelados', category: 'estetica', price: 70, duration_minutes: 75, icon: '🌈' },
  { id: '45', name: 'Alongamento de Pelos', description: 'Aplicação de extensões capilares', category: 'estetica', price: 200, duration_minutes: 180, icon: '💇‍♀️' },

  // Hotel & Creche (8 serviços)
  { id: '46', name: 'Diária de Hotel', description: 'Hospedagem completa por 24h', category: 'hotel', price: 80, duration_minutes: 1440, icon: '🏨' },
  { id: '47', name: 'Meia Diária Hotel', description: 'Hospedagem por 12h', category: 'hotel', price: 50, duration_minutes: 720, icon: '🌙' },
  { id: '48', name: 'Day Care', description: 'Creche durante o dia', category: 'hotel', price: 60, duration_minutes: 480, icon: '☀️' },
  { id: '49', name: 'Pernoite', description: 'Hospedagem noturna', category: 'hotel', price: 45, duration_minutes: 720, icon: '🌜' },
  { id: '50', name: 'Hotel Premium', description: 'Suíte especial com extras', category: 'hotel', price: 150, duration_minutes: 1440, icon: '👑' },
  { id: '51', name: 'Passeio Monitorado', description: 'Passeio em grupo supervisionado', category: 'hotel', price: 40, duration_minutes: 60, icon: '🚶' },
  { id: '52', name: 'Recreação', description: 'Atividades e brincadeiras em grupo', category: 'hotel', price: 35, duration_minutes: 90, icon: '🎾' },
  { id: '53', name: 'Socialização', description: 'Sessão de socialização com outros pets', category: 'hotel', price: 30, duration_minutes: 60, icon: '🐕‍🦺' },

  // Adestramento (5 serviços)
  { id: '54', name: 'Adestramento Básico', description: 'Comandos básicos de obediência', category: 'adestramento', price: 200, duration_minutes: 60, icon: '🎓' },
  { id: '55', name: 'Adestramento Avançado', description: 'Comandos avançados e truques', category: 'adestramento', price: 300, duration_minutes: 90, icon: '🏆' },
  { id: '56', name: 'Correção Comportamental', description: 'Tratamento de comportamentos indesejados', category: 'adestramento', price: 250, duration_minutes: 75, icon: '🔧' },
  { id: '57', name: 'Socialização Canina', description: 'Treinamento de interação social', category: 'adestramento', price: 180, duration_minutes: 90, icon: '👥' },
  { id: '58', name: 'Pacote 4 Aulas', description: 'Pacote completo de 4 sessões', category: 'adestramento', price: 700, duration_minutes: 240, icon: '📦' },

  // Serviços Especiais (3 serviços)
  { id: '59', name: 'Transporte Pet', description: 'Transporte seguro para consultas', category: 'especiais', price: 60, duration_minutes: 60, icon: '🚗' },
  { id: '60', name: 'Fotografia Pet', description: 'Ensaio fotográfico profissional', category: 'especiais', price: 150, duration_minutes: 120, icon: '📷' },
  { id: '61', name: 'Festa de Aniversário', description: 'Comemoração especial de aniversário', category: 'especiais', price: 300, duration_minutes: 180, icon: '🎂' },
];
