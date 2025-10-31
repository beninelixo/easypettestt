export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  featured: boolean;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "como-aumentar-faturamento-clinica-veterinaria-2025",
    title: "Como aumentar o faturamento da sua clínica veterinária em 2025",
    excerpt: "Estratégias comprovadas para crescer sua receita e otimizar processos com tecnologia.",
    category: "Gestão",
    date: "15 Jan 2025",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1530126483408-aa533e55bdb2?w=1200&q=80",
    featured: true,
    author: {
      name: "Dr. Carlos Mendes",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
      role: "Médico Veterinário e Consultor de Gestão"
    },
    tags: ["Gestão", "Faturamento", "Estratégia", "ROI"],
    content: `
      <h2>Por que sua clínica precisa de uma estratégia de crescimento</h2>
      <p>O mercado veterinário brasileiro cresce em média 15% ao ano, mas muitas clínicas ainda operam com métodos antiquados de gestão. Em 2025, a digitalização e automação não são mais diferenciais — são necessidades básicas.</p>
      
      <h3>1. Otimize seu agendamento com inteligência artificial</h3>
      <p>Sistemas modernos de agendamento usam IA para sugerir os melhores horários, reduzir no-shows em até 70% e maximizar a ocupação da sua agenda. Com lembretes automáticos via WhatsApp, seus clientes nunca mais perdem uma consulta.</p>
      
      <h3>2. Implemente um CRM veterinário completo</h3>
      <p>Conhecer o histórico completo de cada pet é fundamental. Um bom CRM permite:</p>
      <ul>
        <li>Histórico médico integrado com prontuário eletrônico</li>
        <li>Lembretes automáticos de vacinas e retornos</li>
        <li>Análise de comportamento dos clientes</li>
        <li>Segmentação para campanhas de marketing direcionadas</li>
      </ul>
      
      <h3>3. Automatize processos financeiros</h3>
      <p>Controle de caixa, emissão de notas fiscais, gestão de recebíveis — tudo isso consome tempo precioso que poderia ser dedicado aos pacientes. Sistemas integrados automatizam essas tarefas e reduzem erros humanos em até 95%.</p>
      
      <h3>4. Crie programas de fidelidade gamificados</h3>
      <p>Clientes fiéis gastam 67% a mais que novos clientes. Programas de pontos, cashback e recompensas aumentam a recorrência e o ticket médio. Nossa plataforma oferece gamificação nativa com rankings e desafios.</p>
      
      <h3>5. Invista em marketing digital veterinário</h3>
      <p>Google Meu Negócio otimizado, posts regulares no Instagram, campanhas no Google Ads — essas estratégias trazem resultados mensuráveis. Em média, clínicas que investem em marketing digital crescem 40% mais rápido.</p>
      
      <h2>Resultados reais de clínicas que implementaram essas estratégias</h2>
      <p>A Clínica VetCare de São Paulo aumentou seu faturamento em 180% em 18 meses após implementar nossa plataforma. A chave foi a combinação de automação, CRM inteligente e marketing digital estruturado.</p>
      
      <blockquote>
        "Antes gastávamos 4 horas por dia só em tarefas administrativas. Hoje, focamos 100% no atendimento e nossa receita triplicou." - Dra. Marina Silva, VetCare SP
      </blockquote>
      
      <h2>Comece hoje mesmo</h2>
      <p>A transformação digital da sua clínica não precisa ser complicada. Nossa plataforma oferece onboarding completo, treinamento da equipe e suporte 24/7 em português. Teste grátis por 14 dias e veja os resultados.</p>
    `
  },
  {
    id: 2,
    slug: "prontuario-eletronico-clinica-veterinaria",
    title: "Prontuário eletrônico: Por que sua clínica precisa dele agora",
    excerpt: "Benefícios da digitalização de prontuários e como implementar na sua prática.",
    category: "Tecnologia",
    date: "12 Jan 2025",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80",
    featured: false,
    author: {
      name: "Dra. Ana Paula Rodrigues",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      role: "Especialista em Tecnologia Veterinária"
    },
    tags: ["Prontuário", "Digital", "Tecnologia", "Eficiência"],
    content: `
      <h2>A revolução do prontuário eletrônico na medicina veterinária</h2>
      <p>O prontuário eletrônico não é apenas uma versão digital do papel — é um sistema inteligente que transforma completamente a prática veterinária moderna.</p>
      
      <h3>Benefícios comprovados</h3>
      <ul>
        <li><strong>Redução de 90% no tempo de busca:</strong> Encontre qualquer informação em segundos</li>
        <li><strong>Zero erro de interpretação:</strong> Caligrafia ilegível não existe mais</li>
        <li><strong>Histórico completo acessível:</strong> Todas as consultas, exames e tratamentos em um só lugar</li>
        <li><strong>Prescrições digitais seguras:</strong> Receitas impossíveis de falsificar</li>
        <li><strong>Backup automático na nuvem:</strong> Seus dados protegidos contra perdas</li>
      </ul>
      
      <h3>Como implementar sem dor de cabeça</h3>
      <p>Nossa plataforma oferece migração gratuita de prontuários em papel para o sistema digital. O processo leva menos de 1 semana e inclui treinamento completo da equipe.</p>
      
      <h3>Conformidade com LGPD</h3>
      <p>Prontuários eletrônicos modernos garantem conformidade total com a Lei Geral de Proteção de Dados, protegendo sua clínica de multas que podem chegar a R$ 50 milhões.</p>
    `
  },
  {
    id: 3,
    slug: "marketing-digital-veterinarios-guia-completo",
    title: "Marketing digital para veterinários: Guia completo",
    excerpt: "Como atrair mais clientes usando redes sociais, Google e WhatsApp Business.",
    category: "Marketing",
    date: "10 Jan 2025",
    readTime: "10 min",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80",
    featured: false,
    author: {
      name: "Rafael Costa",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      role: "Especialista em Marketing Veterinário"
    },
    tags: ["Marketing", "Redes Sociais", "Google Ads", "WhatsApp"],
    content: `
      <h2>Marketing digital que realmente funciona para clínicas veterinárias</h2>
      <p>O marketing veterinário tem particularidades únicas. Tutores buscam confiança, empatia e resultados — e você precisa transmitir isso online.</p>
      
      <h3>1. Google Meu Negócio: Sua clínica nas buscas locais</h3>
      <p>82% dos tutores procuram "veterinário perto de mim" no Google. Otimize seu perfil com:</p>
      <ul>
        <li>Fotos profissionais da clínica e equipe</li>
        <li>Horários atualizados em tempo real</li>
        <li>Respostas rápidas às avaliações (positivas e negativas)</li>
        <li>Posts semanais com dicas de saúde pet</li>
      </ul>
      
      <h3>2. Instagram: Mostre o amor pelos animais</h3>
      <p>Stories diários com bastidores, Reels educativos e posts com cases de sucesso criam conexão emocional com potenciais clientes.</p>
      
      <h3>3. WhatsApp Business: Atendimento que converte</h3>
      <p>Respostas automáticas, catálogo de serviços e agendamento direto pelo WhatsApp aumentam conversões em 45%.</p>
      
      <h3>4. Google Ads para clínicas veterinárias</h3>
      <p>Campanhas de busca local com orçamento de R$ 20-50/dia geram em média 15-30 novos agendamentos por mês. ROI médio: 400%.</p>
    `
  },
  {
    id: 4,
    slug: "gestao-estoque-pet-shops-evite-perdas",
    title: "Gestão de estoque em pet shops: Evite perdas e maximize lucros",
    excerpt: "Sistema de controle de estoque inteligente para reduzir custos operacionais.",
    category: "Gestão",
    date: "8 Jan 2025",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80",
    featured: false,
    author: {
      name: "Marcos Oliveira",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
      role: "Consultor de Gestão Pet Shop"
    },
    tags: ["Estoque", "Pet Shop", "Logística", "Lucro"],
    content: `
      <h2>Estoque mal gerenciado é dinheiro parado</h2>
      <p>Pet shops perdem em média 12% da receita com gestão inadequada de estoque. Produtos vencidos, rupturas e excesso de capital imobilizado são os principais vilões.</p>
      
      <h3>Controle de validade automático</h3>
      <p>Alertas automáticos de produtos próximos ao vencimento evitam perdas. Nosso sistema envia notificações 30, 15 e 7 dias antes da data de validade.</p>
      
      <h3>Reposição inteligente</h3>
      <p>IA analisa histórico de vendas e sugere quando e quanto comprar de cada produto, reduzindo ruptura em 85% e estoque parado em 60%.</p>
      
      <h3>Integração com fornecedores</h3>
      <p>Pedidos automáticos enviados diretamente aos fornecedores quando o estoque atinge o ponto mínimo. Zero intervenção manual.</p>
    `
  },
  {
    id: 5,
    slug: "fidelizacao-clientes-programas-que-funcionam",
    title: "Fidelização de clientes: Programas que realmente funcionam",
    excerpt: "Cases de sucesso e estratégias para criar clientes recorrentes na sua clínica.",
    category: "CRM",
    date: "5 Jan 2025",
    readTime: "9 min",
    image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&q=80",
    featured: false,
    author: {
      name: "Dra. Juliana Martins",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      role: "Especialista em Experiência do Cliente"
    },
    tags: ["Fidelização", "CRM", "Retenção", "Experiência"],
    content: `
      <h2>Clientes fiéis são mais lucrativos</h2>
      <p>Conquistar um novo cliente custa 7x mais do que manter um existente. Programas de fidelidade bem estruturados aumentam LTV (Lifetime Value) em até 300%.</p>
      
      <h3>Programas de pontos gamificados</h3>
      <p>A cada consulta, vacina ou compra, o cliente acumula pontos que podem ser trocados por serviços gratuitos ou descontos progressivos.</p>
      
      <h3>Benefícios exclusivos para membros</h3>
      <ul>
        <li>Prioridade no agendamento</li>
        <li>Descontos em consultas de emergência</li>
        <li>Acesso antecipado a promoções</li>
        <li>Brindes mensais personalizados</li>
      </ul>
      
      <h3>Case de sucesso: Clínica Animal Care</h3>
      <p>Após implementar programa de fidelidade, a taxa de retorno aumentou de 35% para 78% em 6 meses. Ticket médio cresceu 45%.</p>
    `
  },
  {
    id: 6,
    slug: "inteligencia-artificial-medicina-veterinaria",
    title: "Inteligência Artificial na medicina veterinária",
    excerpt: "Como a IA está revolucionando diagnósticos e atendimentos veterinários.",
    category: "Tecnologia",
    date: "3 Jan 2025",
    readTime: "11 min",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&q=80",
    featured: false,
    author: {
      name: "Dr. Ricardo Santos",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
      role: "Pesquisador em IA Veterinária"
    },
    tags: ["IA", "Diagnóstico", "Inovação", "Futuro"],
    content: `
      <h2>A inteligência artificial está transformando a veterinária</h2>
      <p>Ferramentas de IA já auxiliam veterinários em diagnósticos mais precisos, análise de exames e até previsão de doenças antes dos sintomas aparecerem.</p>
      
      <h3>Diagnóstico assistido por IA</h3>
      <p>Algoritmos analisam radiografias, ultrassons e exames de sangue com precisão superior a 95%, detectando padrões invisíveis ao olho humano.</p>
      
      <h3>Previsão de doenças crônicas</h3>
      <p>Modelos preditivos analisam histórico do paciente e alertam sobre riscos de diabetes, insuficiência renal e cardiopatias com até 2 anos de antecedência.</p>
      
      <h3>Agendamento inteligente</h3>
      <p>IA otimiza agenda considerando tipo de consulta, duração média, horários de pico e preferências do veterinário, aumentando capacidade de atendimento em 30%.</p>
      
      <h3>O futuro já chegou</h3>
      <p>Clínicas que adotam IA não apenas melhoram resultados clínicos — destacam-se no mercado e atraem tutores que buscam o melhor para seus pets.</p>
    `
  }
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getBlogPostById = (id: number): BlogPost | undefined => {
  return blogPosts.find(post => post.id === id);
};
