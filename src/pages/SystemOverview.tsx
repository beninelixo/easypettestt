import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, Users, Heart, DollarSign, Package, Gift, BarChart3, 
  Bell, Cloud, Lock, Smartphone, Zap, Shield, CheckCircle2, X,
  ArrowRight, Sparkles, TrendingUp, Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

const SystemOverview = () => {
  const systemModules = [
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Sistema completo de agendamento com drag & drop, bloqueio de horários e sincronização em tempo real.",
      features: ["Drag & drop visual", "Cores por tipo de serviço", "Bloqueio de feriados", "Sincronização multi-dispositivo"]
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "CRM completo com histórico detalhado, preferências e observações importantes.",
      features: ["Histórico completo", "Tags personalizadas", "Notas privadas", "Análise de comportamento"]
    },
    {
      icon: Heart,
      title: "Prontuário de Pets",
      description: "Ficha completa do pet com vacinas, alergias, medicamentos e histórico médico.",
      features: ["Calendário de vacinas", "Alertas de medicação", "Anexos de exames", "Rastreamento de peso"]
    },
    {
      icon: DollarSign,
      title: "Controle Financeiro",
      description: "Gestão completa de receitas, despesas e fluxo de caixa com relatórios visuais.",
      features: ["Contas a pagar/receber", "Fluxo de caixa", "Projeções financeiras", "Integração bancária"]
    },
    {
      icon: Package,
      title: "Gestão de Estoque",
      description: "Controle inteligente de produtos com alertas de validade e reposição automática.",
      features: ["Alerta de validade", "Reposição automática", "Código de barras", "Inventário rotativo"]
    },
    {
      icon: Gift,
      title: "Fidelidade Gamificada",
      description: "Programa de pontos com níveis, badges e recompensas que aumentam a recorrência.",
      features: ["Níveis: Bronze a Diamante", "Badges de conquistas", "Recompensas personalizadas", "Ranking de clientes"]
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Análises detalhadas com gráficos interativos e exportação em múltiplos formatos.",
      features: ["Dashboards personalizados", "Exportação PDF/Excel", "Gráficos interativos", "Comparativos mensais"]
    },
    {
      icon: Bell,
      title: "Notificações Automáticas",
      description: "Lembretes inteligentes via Email, WhatsApp e SMS para reduzir no-shows.",
      features: ["Lembretes 24h antes", "Confirmação automática", "Aniversário do pet", "Vacinas vencendo"]
    }
  ];

  const technicalDifferentials = [
    { icon: Cloud, title: "100% na Nuvem", description: "Acesse de qualquer lugar, qualquer dispositivo" },
    { icon: Lock, title: "Segurança Bancária", description: "Criptografia AES-256 e LGPD compliant" },
    { icon: Smartphone, title: "Mobile Responsivo", description: "Interface otimizada para tablets e smartphones" },
    { icon: Zap, title: "Performance Otimizada", description: "Carregamento em menos de 2 segundos" },
    { icon: Shield, title: "Backup Automático", description: "Seus dados protegidos com backup a cada hora" },
    { icon: Award, title: "Suporte em Português", description: "Equipe brasileira disponível 24/7" }
  ];

  const competitorComparison = [
    { feature: "Preço (plano básico)", easypet: "R$ 79,90", competitors: "R$ 120+" },
    { feature: "Usuários simultâneos", easypet: "5", competitors: "1-3" },
    { feature: "WhatsApp integrado", easypet: "✓ Grátis", competitors: "⚠️ Add-on ou ✗" },
    { feature: "API aberta", easypet: "✓", competitors: "⚠️ Limitada ou ✗" },
    { feature: "Fidelidade gamificada", easypet: "✓", competitors: "✗" },
    { feature: "Suporte 24/7", easypet: "✓", competitors: "⚠️ Limitado" },
    { feature: "Multi-unidades", easypet: "✓ Platinum", competitors: "⚠️ Enterprise ou ✗" }
  ];

  const systemAdvantages = [
    {
      icon: Zap,
      title: "Automatização Inteligente",
      description: "Reduza em até 80% o tempo gasto com tarefas administrativas através de lembretes automáticos, agendamento inteligente e notificações programadas."
    },
    {
      icon: TrendingUp,
      title: "Aumento de Receita",
      description: "Aumente seu faturamento em média 45% com programa de fidelidade gamificado, redução de no-shows e gestão eficiente de produtos e serviços."
    },
    {
      icon: Shield,
      title: "Segurança e Confiabilidade",
      description: "Proteção bancária AES-256, backup automático a cada hora, conformidade total com LGPD e disponibilidade 99.9% garantida."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Conheça o Sistema EasyPet - Tour Completo das Funcionalidades"
        description="Descubra todos os recursos do sistema mais completo para gestão veterinária: agenda inteligente, CRM, controle financeiro, fidelidade, relatórios e muito mais."
        url="https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com/system-overview"
      />
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto max-w-5xl text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold mb-4">
            <Sparkles className="h-5 w-5" />
            Tour Completo do Sistema
          </div>
          <h1 className="text-5xl lg:text-6xl font-black leading-tight">
            Conheça o Sistema Mais Completo para<br />
            <span className="text-primary">Pet Shops no Brasil</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Gestão profissional, automação inteligente e resultados comprovados em uma única plataforma.
          </p>
        </div>
      </section>

      {/* System Modules */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Módulos do Sistema</h2>
            <p className="text-xl text-muted-foreground">Tudo que você precisa em um só lugar</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemModules.map((module, index) => (
              <Card key={index} className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <module.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {module.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Differentials */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Diferenciais Técnicos</h2>
            <p className="text-xl text-muted-foreground">Tecnologia de ponta para o seu negócio</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalDifferentials.map((diff, index) => (
              <Card key={index} className="text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <diff.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{diff.title}</CardTitle>
                  <CardDescription>{diff.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Comparação com Concorrentes</h2>
            <p className="text-xl text-muted-foreground">Veja por que o EasyPet é a melhor escolha</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-card rounded-xl overflow-hidden shadow-xl">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="text-left p-4 font-bold">Funcionalidade</th>
                  <th className="text-center p-4 font-bold">EasyPet</th>
                  <th className="text-center p-4 font-bold">Concorrentes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {competitorComparison.map((row, index) => (
                  <tr key={index} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4 font-semibold">{row.feature}</td>
                    <td className="p-4 text-center font-bold text-green-600">{row.easypet}</td>
                    <td className="p-4 text-center text-muted-foreground">{row.competitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* System Advantages */}
      <section className="py-20 px-4 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Por que Escolher o EasyPet?</h2>
            <p className="text-xl text-muted-foreground">Vantagens que transformam seu negócio</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {systemAdvantages.map((advantage, index) => (
              <Card key={index} className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-2 border-border">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <advantage.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{advantage.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{advantage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-4xl font-black text-white">
            Pronto para Transformar seu Pet Shop?
          </h2>
          <p className="text-xl text-white/90">
            Teste grátis por 14 dias. Sem cartão de crédito. Cancele quando quiser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pricing">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-xl px-12 py-8 font-bold">
                Ver Planos e Preços
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-xl px-12 py-8 font-bold">
                Começar Teste Grátis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SystemOverview;
