import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Clock, Users, TrendingUp, Package, CreditCard, 
  FileText, Bell, BarChart3, Shield, Smartphone, Zap,
  MessageSquare, Camera, Database, Settings, CheckCircle, Star,
  Crown, Sparkles
} from "lucide-react";

type PlanBadge = 'free' | 'gold' | 'platinum';

const PlanBadgeComponent = ({ plan }: { plan: PlanBadge }) => {
  const config = {
    free: { label: 'Gratuito', className: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
    gold: { label: 'Gold', className: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' },
    platinum: { label: 'Platinum', className: 'bg-slate-400/20 text-slate-600 dark:text-slate-300 border-slate-400/30' },
  };
  return <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config[plan].className}`}>{config[plan].label}</Badge>;
};

const features = [
  { category: "Agendamento", icon: Calendar, items: [
    { icon: Clock, title: "Agenda Inteligente", description: "Visualização diária, semanal e mensal", plans: ['free', 'gold', 'platinum'] as PlanBadge[] },
    { icon: Bell, title: "Lembretes por Email", description: "Notificações automáticas", plans: ['gold', 'platinum'] as PlanBadge[] },
    { icon: MessageSquare, title: "Lembretes WhatsApp", description: "WhatsApp Business integrado", plans: ['platinum'] as PlanBadge[] },
  ]},
  { category: "Clientes e Pets", icon: Users, items: [
    { icon: Users, title: "Cadastro Completo", description: "Histórico detalhado", plans: ['free', 'gold', 'platinum'] as PlanBadge[] },
    { icon: Star, title: "Programa de Fidelidade", description: "Pontos e recompensas", plans: ['platinum'] as PlanBadge[] },
  ]},
  { category: "Financeiro", icon: CreditCard, items: [
    { icon: CreditCard, title: "Pagamentos", description: "Múltiplas formas", plans: ['free', 'gold', 'platinum'] as PlanBadge[] },
    { icon: BarChart3, title: "Relatórios", description: "Faturamento em tempo real", plans: ['gold', 'platinum'] as PlanBadge[] },
  ]},
];

const Funcionalidades = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-muted to-background">
      <div className="container mx-auto max-w-4xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold">Funcionalidades <span className="text-primary">Completas</span></h1>
        <p className="text-lg text-muted-foreground">Sistema completo para gestão do seu pet shop</p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <div className="flex items-center gap-2"><PlanBadgeComponent plan="free" /><span className="text-sm text-muted-foreground">Todos</span></div>
          <div className="flex items-center gap-2"><PlanBadgeComponent plan="gold" /><span className="text-sm text-muted-foreground">Gold+</span></div>
          <div className="flex items-center gap-2"><PlanBadgeComponent plan="platinum" /><span className="text-sm text-muted-foreground">Platinum</span></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link to="/auth"><Button size="lg">Começar Grátis</Button></Link>
          <Link to="/pricing"><Button size="lg" variant="outline">Ver Planos</Button></Link>
        </div>
      </div>
    </section>
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-7xl space-y-16">
        {features.map((cat, i) => (
          <div key={i} className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center"><cat.icon className="h-7 w-7 text-primary" /></div>
              <h2 className="text-2xl font-bold">{cat.category}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {cat.items.map((item, j) => (
                <Card key={j} className="hover:shadow-lg transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between"><item.icon className="h-5 w-5 text-primary" /><div className="flex gap-1">{item.plans.map(p => <PlanBadgeComponent key={p} plan={p} />)}</div></div>
                    <CardTitle className="text-base mt-2">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent><CardDescription>{item.description}</CardDescription></CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
    <section className="py-20 px-4 bg-primary text-primary-foreground">
      <div className="container mx-auto text-center max-w-3xl space-y-6">
        <h2 className="text-3xl font-bold">Pronto para começar?</h2>
        <Link to="/auth"><Button size="lg" variant="secondary">Experimentar Grátis</Button></Link>
      </div>
    </section>
    <Footer />
  </div>
);

export default Funcionalidades;