import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Clock, Users, TrendingUp, Package, CreditCard, 
  FileText, Bell, BarChart3, Shield, Smartphone, Zap,
  MessageSquare, Camera, Database, Settings, Check, X,
  Star, Building2, Scissors, Lock, Sparkles
} from "lucide-react";

type PlanBadge = 'free' | 'gold' | 'platinum';

const PlanBadgeComponent = ({ plan }: { plan: PlanBadge }) => {
  const config = {
    free: { 
      label: 'Gratuito', 
      className: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
    },
    gold: { 
      label: 'Gold', 
      className: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' 
    },
    platinum: { 
      label: 'Platinum', 
      className: 'bg-slate-400/20 text-slate-600 dark:text-slate-300 border-slate-400/30' 
    },
  };
  
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 font-medium ${config[plan].className}`}>
      {config[plan].label}
    </Badge>
  );
};

const features = [
  { 
    category: "Agendamento Inteligente", 
    icon: Calendar, 
    description: "Gerencie sua agenda com eficiência máxima",
    items: [
      { icon: Clock, title: "Agenda Visual", description: "Visualização diária, semanal e mensal com interface intuitiva", plans: ['free', 'gold', 'platinum'] as PlanBadge[] },
      { icon: Bell, title: "Lembretes por Email", description: "Notificações automáticas 24h antes do agendamento", plans: ['gold', 'platinum'] as PlanBadge[] },
      { icon: MessageSquare, title: "WhatsApp Business", description: "Confirmações e lembretes automáticos via WhatsApp", plans: ['platinum'] as PlanBadge[] },
      { icon: Smartphone, title: "App Mobile PWA", description: "Acesso completo pelo celular, instale como app", plans: ['free', 'gold', 'platinum'] as PlanBadge[] },
      { icon: Zap, title: "Agendamento Online", description: "Clientes agendam direto pelo link do seu pet shop", plans: ['gold', 'platinum'] as PlanBadge[] },
    ]
  },
  { 
    category: "Gestão de Clientes e Pets", 
    icon: Users,
    description: "Conheça seus clientes como nunca antes",
    items: [
      { icon: Users, title: "Cadastro Completo", description: "Ficha detalhada de clientes com todos os dados", plans: ['free', 'gold', 'platinum'] as PlanBadge[] },
      { icon: Camera, title: "Histórico com Fotos", description: "Acompanhe a evolução visual dos pets ao longo do tempo", plans: ['gold', 'platinum'] as PlanBadge[] },
      { icon: Star, title: "Programa de Fidelidade", description: "Sistema de pontos, recompensas e descontos exclusivos", plans: ['platinum'] as PlanBadge[] },
      { icon: TrendingUp, title: "Segmentação Inteligente", description: "Tags e categorias para campanhas personalizadas", plans: ['gold', 'platinum'] as PlanBadge[] },
      { icon: FileText, title: "Prontuário Veterinário", description: "Histórico de vacinas, medicamentos e observações", plans: ['free', 'gold', 'platinum'] as PlanBadge[] },
    ]
  },
  { 
    category: "Financeiro e Pagamentos", 
    icon: CreditCard,
    description: "Controle total das suas finanças",
    items: [
      { icon: CreditCard, title: "Múltiplas Formas de Pagamento", description: "Dinheiro, cartão, PIX, transferência e mais", plans: ['free', 'gold', 'platinum'] as PlanBadge[] },
      { icon: BarChart3, title: "Relatórios Financeiros", description: "Faturamento, lucratividade e fluxo de caixa", plans: ['gold', 'platinum'] as PlanBadge[] },
      { icon: FileText, title: "Emissão de NF-e", description: "Notas fiscais eletrônicas automáticas", plans: ['platinum'] as PlanBadge[] },
      { icon: TrendingUp, title: "Previsão de Receita", description: "Projeções baseadas no histórico de vendas", plans: ['platinum'] as PlanBadge[] },
      { icon: Package, title: "Comissões Automáticas", description: "Cálculo automático de comissões por funcionário", plans: ['gold', 'platinum'] as PlanBadge[] },
    ]
  },
  { 
    category: "Operações e Equipe", 
    icon: Settings,
    description: "Organize sua operação do início ao fim",
    items: [
      { icon: Package, title: "Controle de Estoque", description: "Gestão de produtos, insumos e alertas de reposição", plans: ['gold', 'platinum'] as PlanBadge[] },
      { icon: Scissors, title: "Gestão de Serviços", description: "Preços, durações, comissões e categorias", plans: ['free', 'gold', 'platinum'] as PlanBadge[] },
      { icon: Users, title: "Multi-Funcionários", description: "Até 5 usuários simultâneos com permissões", plans: ['gold', 'platinum'] as PlanBadge[] },
      { icon: Building2, title: "Multi-Unidades", description: "Gerencie várias filiais em um único painel", plans: ['platinum'] as PlanBadge[] },
      { icon: Clock, title: "Controle de Horários", description: "Escalas de trabalho e disponibilidade", plans: ['gold', 'platinum'] as PlanBadge[] },
    ]
  },
  { 
    category: "Segurança e Backup", 
    icon: Shield,
    description: "Seus dados sempre protegidos",
    items: [
      { icon: Database, title: "Backup Automático", description: "Backup diário com retenção de 30 dias", plans: ['platinum'] as PlanBadge[] },
      { icon: Shield, title: "Criptografia de Dados", description: "Todos os dados protegidos com criptografia AES-256", plans: ['free', 'gold', 'platinum'] as PlanBadge[] },
      { icon: Lock, title: "Autenticação 2FA", description: "Camada extra de segurança na sua conta", plans: ['gold', 'platinum'] as PlanBadge[] },
      { icon: FileText, title: "Logs de Auditoria", description: "Histórico completo de todas as ações no sistema", plans: ['platinum'] as PlanBadge[] },
    ]
  },
  { 
    category: "Marketing e Comunicação", 
    icon: Sparkles,
    description: "Fidelize e engaje seus clientes",
    items: [
      { icon: MessageSquare, title: "Campanhas por Email", description: "Envie promoções e novidades para sua base", plans: ['gold', 'platinum'] as PlanBadge[] },
      { icon: Bell, title: "Notificações Push", description: "Alertas instantâneos no celular do cliente", plans: ['platinum'] as PlanBadge[] },
      { icon: Star, title: "Avaliações e Feedback", description: "Colete opiniões e melhore seus serviços", plans: ['gold', 'platinum'] as PlanBadge[] },
      { icon: TrendingUp, title: "Relatórios de Marketing", description: "Métricas de engajamento e conversão", plans: ['platinum'] as PlanBadge[] },
    ]
  },
];

const comparisonFeatures = [
  { name: "Agendamentos", free: "30/mês", gold: "Ilimitado", platinum: "Ilimitado" },
  { name: "Usuários Simultâneos", free: "1", gold: "3", platinum: "5" },
  { name: "Cadastro de Clientes", free: true, gold: true, platinum: true },
  { name: "Gestão de Serviços", free: true, gold: true, platinum: true },
  { name: "Lembretes por Email", free: false, gold: true, platinum: true },
  { name: "WhatsApp Business", free: false, gold: false, platinum: true },
  { name: "Controle de Estoque", free: false, gold: true, platinum: true },
  { name: "Relatórios Financeiros", free: false, gold: true, platinum: true },
  { name: "Programa de Fidelidade", free: false, gold: false, platinum: true },
  { name: "Multi-Unidades", free: false, gold: false, platinum: true },
  { name: "Backup Automático", free: false, gold: false, platinum: true },
  { name: "Autenticação 2FA", free: false, gold: true, platinum: true },
  { name: "Emissão de NF-e", free: false, gold: false, platinum: true },
  { name: "Suporte Prioritário", free: false, gold: true, platinum: true },
  { name: "Gerente de Conta", free: false, gold: false, platinum: true },
];

const Funcionalidades = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    
    {/* Hero Section */}
    <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-muted via-muted/50 to-background">
      <div className="container mx-auto max-w-4xl text-center space-y-6">
        <Badge variant="outline" className="px-4 py-1.5 text-sm border-primary/30 bg-primary/5">
          <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
          Sistema Completo para Pet Shops
        </Badge>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          Funcionalidades{" "}
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Completas
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Tudo que você precisa para gerenciar seu pet shop com excelência, 
          desde o agendamento até o financeiro.
        </p>
        
        {/* Plan Legend */}
        <div className="flex flex-wrap justify-center gap-6 pt-6">
          <div className="flex items-center gap-2">
            <PlanBadgeComponent plan="free" />
            <span className="text-sm text-muted-foreground">Todos os planos</span>
          </div>
          <div className="flex items-center gap-2">
            <PlanBadgeComponent plan="gold" />
            <span className="text-sm text-muted-foreground">Gold e superior</span>
          </div>
          <div className="flex items-center gap-2">
            <PlanBadgeComponent plan="platinum" />
            <span className="text-sm text-muted-foreground">Apenas Platinum</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link to="/auth">
            <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/25">
              <Zap className="h-4 w-4" />
              Começar Grátis
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Ver Planos e Preços
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Features Grid */}
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-7xl space-y-20">
        {features.map((category, categoryIdx) => (
          <div key={categoryIdx} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center shadow-lg">
                <category.icon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">{category.category}</h2>
                <p className="text-muted-foreground mt-1">{category.description}</p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {category.items.map((item, itemIdx) => (
                <Card 
                  key={itemIdx} 
                  className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-border/50 hover:border-primary/30 bg-card/50 backdrop-blur-sm"
                >
                  <CardHeader className="pb-2 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {item.plans.map(p => <PlanBadgeComponent key={p} plan={p} />)}
                      </div>
                    </div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors leading-tight">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Comparison Table */}
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare os Planos</h2>
          <p className="text-muted-foreground">
            Escolha o plano ideal para o tamanho do seu negócio
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 border-b border-border"></th>
                <th className="p-4 border-b border-border text-center min-w-[120px]">
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">Gratuito</span>
                    <p className="text-2xl font-bold">R$ 0</p>
                    <span className="text-xs text-muted-foreground">30 dias grátis</span>
                  </div>
                </th>
                <th className="p-4 border-b-2 border-amber-400 text-center min-w-[140px] bg-amber-50/50 dark:bg-amber-950/20 rounded-t-xl">
                  <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 mb-2">
                    Mais Popular
                  </Badge>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Pet Gold</span>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">R$ 79,90</p>
                    <span className="text-xs text-muted-foreground">/mês</span>
                  </div>
                </th>
                <th className="p-4 border-b border-slate-400 text-center min-w-[140px] bg-slate-50/50 dark:bg-slate-900/20 rounded-t-xl">
                  <Badge className="bg-gradient-to-r from-slate-400 to-gray-500 text-white mb-2">
                    Premium
                  </Badge>
                  <div className="space-y-1">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Pet Platinum</span>
                    <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">R$ 149,90</p>
                    <span className="text-xs text-muted-foreground">/mês</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature, idx) => (
                <tr key={idx} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 border-b border-border font-medium text-sm">
                    {feature.name}
                  </td>
                  <td className="p-4 border-b border-border text-center">
                    {typeof feature.free === 'boolean' ? (
                      feature.free ? (
                        <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                      )
                    ) : (
                      <span className="text-sm font-medium">{feature.free}</span>
                    )}
                  </td>
                  <td className="p-4 border-b border-border text-center bg-amber-50/30 dark:bg-amber-950/10">
                    {typeof feature.gold === 'boolean' ? (
                      feature.gold ? (
                        <Check className="h-5 w-5 text-amber-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                      )
                    ) : (
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{feature.gold}</span>
                    )}
                  </td>
                  <td className="p-4 border-b border-border text-center bg-slate-50/30 dark:bg-slate-900/10">
                    {typeof feature.platinum === 'boolean' ? (
                      feature.platinum ? (
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                      )
                    ) : (
                      <span className="text-sm font-medium">{feature.platinum}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* CTA under table */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link to="/auth">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Começar Grátis
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-500 hover:via-yellow-600 hover:to-orange-600 text-amber-950 shadow-lg shadow-amber-500/25">
              Assinar Pet Gold
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-slate-400 via-gray-500 to-slate-600 hover:from-slate-500 hover:via-gray-600 hover:to-slate-700 text-white shadow-lg shadow-slate-500/25">
              Assinar Platinum
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-20 px-4 bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground">
      <div className="container mx-auto text-center max-w-3xl space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold">Pronto para transformar seu Pet Shop?</h2>
        <p className="text-lg opacity-90">
          Junte-se a centenas de pet shops que já modernizaram sua gestão com o EasyPet.
        </p>
        <Link to="/auth">
          <Button size="lg" variant="secondary" className="shadow-xl">
            Experimentar Grátis por 30 Dias
          </Button>
        </Link>
      </div>
    </section>
    
    <Footer />
  </div>
);

export default Funcionalidades;
