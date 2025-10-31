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
import { Calendar, Clock, Users, TrendingUp, Shield, Smartphone, PawPrint, Sparkles, FileText, Package, Camera, ArrowRight, Zap } from "lucide-react";
import heroPet from "@/assets/hero-pet.jpg";

const Index = () => {
  const features = [
    {
      icon: Calendar,
      title: "Agendamento Inteligente",
      description: "Sistema completo de agendamentos com confirmação automática e lembretes via WhatsApp",
    },
    {
      icon: Clock,
      title: "Gestão de Tempo",
      description: "Controle de horários, duração de serviços e organização da agenda do dia",
    },
    {
      icon: Users,
      title: "Cadastro de Clientes e Pets",
      description: "Base completa com histórico de serviços, preferências e observações importantes",
    },
    {
      icon: TrendingUp,
      title: "Dashboard de Estatísticas",
      description: "Acompanhe faturamento, pets recorrentes e performance do seu negócio",
    },
    {
      icon: Shield,
      title: "Seguro e Confiável",
      description: "Seus dados protegidos com criptografia e backup automático",
    },
    {
      icon: Smartphone,
      title: "100% Responsivo",
      description: "Funciona perfeitamente em celular, tablet e computador",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-muted to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full text-primary text-sm font-medium border border-primary/20">
                <Zap className="h-4 w-4" />
                Gestão Profissional para Pet Shops
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Transforme Seu{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                  Pet Shop
                </span>{" "}
                em uma Máquina de Resultados
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Sistema completo de gestão que automatiza agendamentos, organiza clientes, 
                aumenta suas vendas e transforma a experiência dos tutores.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span>Teste grátis 14 dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-lg px-10 py-6 shadow-2xl hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300 group"
                  >
                    Começar Agora Grátis
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link to="/pricing" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full text-lg px-10 py-6 border-2 hover:bg-primary/5 hover:border-primary hover:scale-105 transition-all duration-300"
                  >
                    Ver Planos e Preços
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur-3xl animate-glow" />
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
              <img
                src={heroPet}
                alt="Pet feliz após banho e tosa profissional"
                className="relative rounded-3xl shadow-2xl w-full h-auto object-cover hover:scale-105 transition-transform duration-500 animate-float border-4 border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Segmentation Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Ideal para qualquer negócio pet</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Soluções específicas pensadas para atender as necessidades do seu segmento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/clinicas" className="group">
              <Card className="border-border hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">Clínicas Veterinárias</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <CardDescription className="text-base">
                    Prontuário digital completo, controle de vacinas e agenda veterinária integrada.
                  </CardDescription>
                  <div className="flex items-center text-primary font-medium group-hover:gap-3 transition-all duration-300">
                    Saiba mais <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/petshops" className="group">
              <Card className="border-border hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                    <Package className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle className="text-2xl group-hover:text-secondary transition-colors duration-300">Pet Shops</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <CardDescription className="text-base">
                    Controle de estoque inteligente, PDV integrado e análise de vendas em tempo real.
                  </CardDescription>
                  <div className="flex items-center text-secondary font-medium group-hover:gap-3 transition-all duration-300">
                    Saiba mais <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/banho-tosa" className="group">
              <Card className="border-border hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                    <Camera className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="text-2xl group-hover:text-accent transition-colors duration-300">Banho e Tosa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <CardDescription className="text-base">
                    Agenda especializada, galeria de fotos e comunicação automática com tutores.
                  </CardDescription>
                  <div className="flex items-center text-accent font-medium group-hover:gap-3 transition-all duration-300">
                    Saiba mais <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Tudo que você precisa em um só lugar</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades completas para transformar a gestão do seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in bg-background group cursor-pointer relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <feature.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/funcionalidades">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Ver Todas as Funcionalidades
              </Button>
            </Link>
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

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary via-primary-light to-secondary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-light/30 rounded-full blur-3xl" />
        
        <div className="container mx-auto text-center space-y-8 relative z-10">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce-subtle">
              <PawPrint className="h-12 w-12" />
            </div>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold">
            Comece Hoje Mesmo a Revolucionar Seu Pet Shop
          </h2>
          <p className="text-xl opacity-95 max-w-2xl mx-auto leading-relaxed">
            Mais de 350 pet shops já estão economizando tempo e aumentando seus lucros com o Bointhosa. 
            Não fique para trás!
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 text-lg py-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full" />
              <span>14 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full" />
              <span>Sem cartão</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full" />
              <span>Suporte incluído</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full text-lg px-10 py-6 bg-white text-primary hover:bg-white/90 hover:scale-105 shadow-2xl hover:shadow-white/20 transition-all duration-300 group"
              >
                Começar Teste Gratuito Agora
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/funcionalidades" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full text-lg px-10 py-6 bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary hover:scale-105 transition-all duration-300"
              >
                Ver Todas as Funcionalidades
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
