import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import TrustedBy from "@/components/TrustedBy";
import { Calendar, Clock, Users, TrendingUp, Shield, Smartphone, PawPrint, Sparkles, FileText, Package, Camera, ArrowRight } from "lucide-react";
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
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-muted to-background">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Sistema Completo para Pet Shops
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Gestão Inteligente para{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Banho e Tosa
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Simplifique seus agendamentos, encante seus clientes e aumente seu faturamento com o Bointhosa Pet System
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full bg-primary hover:bg-primary-light text-lg px-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    Começar Grátis
                  </Button>
                </Link>
                <Link to="/pricing" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full text-lg px-8 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                  >
                    Ver Planos
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <img
                src={heroPet}
                alt="Pet feliz após banho e tosa"
                className="relative rounded-3xl shadow-2xl w-full h-auto object-cover"
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
            <Link to="/clinicas">
              <Card className="border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Clínicas Veterinárias</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base">
                    Prontuário digital completo, controle de vacinas e agenda veterinária integrada.
                  </CardDescription>
                  <div className="flex items-center text-primary font-medium group-hover:gap-3 transition-all">
                    Saiba mais <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/petshops">
              <Card className="border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Package className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle className="text-2xl">Pet Shops</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base">
                    Controle de estoque inteligente, PDV integrado e análise de vendas em tempo real.
                  </CardDescription>
                  <div className="flex items-center text-secondary font-medium group-hover:gap-3 transition-all">
                    Saiba mais <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/banho-tosa">
              <Card className="border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="text-2xl">Banho e Tosa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base">
                    Agenda especializada, galeria de fotos e comunicação automática com tutores.
                  </CardDescription>
                  <div className="flex items-center text-accent font-medium group-hover:gap-3 transition-all">
                    Saiba mais <ArrowRight className="h-4 w-4 ml-2" />
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
                className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in bg-background"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
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

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center space-y-6">
          <div className="flex justify-center mb-4">
            <PawPrint className="h-16 w-16 animate-bounce-subtle" />
          </div>
          <h2 className="text-4xl font-bold">Pronto para transformar seu pet shop?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Junte-se a centenas de pet shops que já usam o Bointhosa para gerenciar seus negócios
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="secondary" 
                className="w-full text-lg px-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                Teste Grátis por 14 dias
              </Button>
            </Link>
            <Link to="/about" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:shadow-lg transition-all duration-300"
              >
                Saiba Mais
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
