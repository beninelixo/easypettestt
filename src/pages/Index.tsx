import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import TrustedBy from "@/components/TrustedBy";
import HowItWorks from "@/components/HowItWorks";
import ComparisonTable from "@/components/ComparisonTable";
import FAQ from "@/components/FAQ";
import { useCountUp } from "@/hooks/useCountUp";
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Shield, 
  Smartphone, 
  PawPrint, 
  Sparkles, 
  FileText, 
  Package, 
  Camera, 
  ArrowRight, 
  Zap,
  CheckCircle2,
  Star,
  Stethoscope,
  Scissors,
  Store
} from "lucide-react";
import heroPetShop from "@/assets/hero-petshop.jpg";

const Index = () => {
  const activeUsers = useCountUp({ end: 2500 });
  const cities = useCountUp({ end: 650 });
  const appointments = useCountUp({ end: 2100 });
  const sales = useCountUp({ end: 1800 });

  const features = [
    {
      icon: Calendar,
      title: "Agendamento com IA",
      description: "Sistema inteligente que sugere os melhores horários e otimiza sua agenda automaticamente",
    },
    {
      icon: Clock,
      title: "Gestão de Tempo Real",
      description: "Acompanhe todas as operações ao vivo com dashboards e alertas instantâneos",
    },
    {
      icon: Users,
      title: "CRM Veterinário Completo",
      description: "Histórico completo de cada pet, lembretes automáticos e fidelização inteligente",
    },
    {
      icon: TrendingUp,
      title: "Analytics Avançado",
      description: "BI integrado com previsões, tendências e insights acionáveis para crescimento",
    },
    {
      icon: Shield,
      title: "Segurança LGPD",
      description: "Proteção máxima dos dados com criptografia e conformidade total com LGPD",
    },
    {
      icon: Smartphone,
      title: "App Mobile Nativo",
      description: "Aplicativo completo para iOS e Android com sincronização em tempo real",
    },
  ];

  const differentials = [
    "API aberta para integrações",
    "WhatsApp Business integrado",
    "Sistema de fidelidade gamificado",
    "Controle multi-unidades e franquias",
    "Notas fiscais automáticas",
    "Suporte 24/7 em português",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section - Inspired by LoopVet but more premium */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
        <div className="absolute inset-0 bg-dot-pattern opacity-40" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-full text-primary text-sm font-semibold border border-primary/20 shadow-lg animate-shimmer">
                <Sparkles className="h-4 w-4" />
                O Melhor Amigo da Sua Clínica Veterinária
              </div>

              {/* Main headline */}
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                Sistema para{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                    clínica veterinária
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-full" />
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                Realize atendimentos, emita receitas, agende vacinas e gerencie as finanças, 
                desde clínicas até hospitais veterinários completos.
              </p>

              {/* Feature badges */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  Teste grátis por 14 dias
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  Sem cartão de crédito
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  Cancele quando quiser
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full text-lg px-12 py-7 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-2xl hover:shadow-purple animate-pulse-glow group font-bold"
                  >
                    Iniciar Teste Grátis + Desconto Exclusivo
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link to="/pricing" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full text-lg px-12 py-7 border-2 border-primary hover:bg-primary/5 hover:scale-[1.02] transition-all duration-300 font-semibold"
                  >
                    Ver Planos
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-3xl blur-3xl animate-pulse" />
              <img
                src={heroPetShop}
                alt="Veterinária profissional atendendo pet em clínica moderna"
                className="relative rounded-3xl shadow-2xl w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700 border-4 border-white/10"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Inspired by LoopVet */}
      <section className="py-12 px-4 bg-gradient-to-r from-primary via-secondary to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-2 animate-fade-in" ref={activeUsers.ref}>
              <div className="text-5xl lg:text-6xl font-black text-white">
                +{activeUsers.count.toLocaleString('pt-BR')}
              </div>
              <div className="text-sm lg:text-base font-semibold text-white/90 uppercase tracking-wide">
                Usuários Ativos
              </div>
            </div>
            <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: "0.1s" }} ref={cities.ref}>
              <div className="text-5xl lg:text-6xl font-black text-white">
                +{cities.count}
              </div>
              <div className="text-sm lg:text-base font-semibold text-white/90 uppercase tracking-wide">
                Cidades no Brasil
              </div>
            </div>
            <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: "0.2s" }} ref={appointments.ref}>
              <div className="text-5xl lg:text-6xl font-black text-white">
                +{(appointments.count / 1000).toFixed(1)} mi
              </div>
              <div className="text-sm lg:text-base font-semibold text-white/90 uppercase tracking-wide">
                Atendimentos
              </div>
            </div>
            <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: "0.3s" }} ref={sales.ref}>
              <div className="text-5xl lg:text-6xl font-black text-white">
                +{(sales.count / 1000).toFixed(1)} mi
              </div>
              <div className="text-sm lg:text-base font-semibold text-white/90 uppercase tracking-wide">
                Vendas Realizadas
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Segmentation Section - Premium cards */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-4">
              <Star className="h-4 w-4" />
              Soluções Especializadas
            </div>
            <h2 className="text-4xl lg:text-5xl font-black">
              Ideal para qualquer negócio pet
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Funcionalidades específicas e otimizadas para cada segmento do mercado veterinário
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/clinicas" className="group">
              <Card className="border-2 border-border hover:border-primary hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 cursor-pointer h-full relative overflow-hidden hover-lift">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative space-y-4 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <Stethoscope className="h-9 w-9 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                    Clínicas Veterinárias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <CardDescription className="text-base leading-relaxed">
                    Prontuário eletrônico completo, prescrições digitais, controle de vacinas e agenda médica integrada.
                  </CardDescription>
                  <div className="flex items-center text-primary font-semibold group-hover:gap-4 transition-all duration-300">
                    Explorar recursos
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/petshops" className="group">
              <Card className="border-2 border-border hover:border-secondary hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 cursor-pointer h-full relative overflow-hidden hover-lift">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/0 via-secondary/5 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative space-y-4 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <Store className="h-9 w-9 text-secondary" />
                  </div>
                  <CardTitle className="text-2xl font-bold group-hover:text-secondary transition-colors duration-300">
                    Pet Shops
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <CardDescription className="text-base leading-relaxed">
                    PDV moderno, controle de estoque inteligente, programa de fidelidade e análise de vendas em tempo real.
                  </CardDescription>
                  <div className="flex items-center text-secondary font-semibold group-hover:gap-4 transition-all duration-300">
                    Explorar recursos
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/banho-tosa" className="group">
              <Card className="border-2 border-border hover:border-accent hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 cursor-pointer h-full relative overflow-hidden hover-lift">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative space-y-4 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <Scissors className="h-9 w-9 text-accent" />
                  </div>
                  <CardTitle className="text-2xl font-bold group-hover:text-accent transition-colors duration-300">
                    Banho e Tosa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <CardDescription className="text-base leading-relaxed">
                    Agenda especializada com fotos antes/depois, galeria profissional e comunicação automática com tutores.
                  </CardDescription>
                  <div className="flex items-center text-accent font-semibold group-hover:gap-4 transition-all duration-300">
                    Explorar recursos
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-3 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Modern grid */}
      <section className="py-24 px-4 bg-muted">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-4">
              <Zap className="h-4 w-4" />
              Funcionalidades Premium
            </div>
            <h2 className="text-4xl lg:text-5xl font-black">
              Tudo que você precisa, e muito mais
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sistema completo com inteligência artificial para revolucionar sua gestão veterinária
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 border-border hover:border-primary hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in bg-background group cursor-pointer relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative space-y-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/funcionalidades">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2 hover:border-primary hover:bg-primary/5 font-semibold">
                Ver Todas as Funcionalidades
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Differentials Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Por que somos a melhor escolha?
            </h2>
            <p className="text-xl text-muted-foreground">
              Recursos exclusivos que nos tornam líderes do mercado
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {differentials.map((item, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-6 rounded-2xl bg-background border-2 border-border hover:border-primary hover:shadow-lg transition-all duration-300 animate-fade-in hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <span className="text-lg font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <TrustedBy />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Comparison Table Section */}
      <ComparisonTable />

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section - Premium gradient */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto text-center space-y-10 relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce-subtle shadow-2xl">
              <PawPrint className="h-14 w-14 text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight max-w-4xl mx-auto">
            Comece Hoje a Revolucionar Sua Clínica Veterinária
          </h2>
          
          <p className="text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed font-medium">
            Mais de <span className="font-bold">2.500 profissionais</span> já estão economizando tempo, 
            aumentando lucros e oferecendo melhor atendimento com o Bointhosa Pet System.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 lg:gap-12 text-lg py-6">
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold">14 dias grátis</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold">Sem cartão</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold">Suporte 24/7</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold">Treinamento incluído</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full text-xl px-14 py-8 bg-white text-primary hover:bg-white/95 hover:scale-[1.05] shadow-2xl hover:shadow-white/20 transition-all duration-300 group font-bold"
              >
                Começar Teste Gratuito Agora
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/funcionalidades" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full text-xl px-14 py-8 bg-transparent border-3 border-white text-white hover:bg-white hover:text-primary hover:scale-[1.05] transition-all duration-300 font-bold"
              >
                Conhecer Todas as Funcionalidades
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
