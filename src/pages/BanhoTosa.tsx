import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Camera, MessageSquare, Users, Star, CheckCircle } from "lucide-react";

const BanhoTosa = () => {
  const features = [
    {
      icon: Calendar,
      title: "Agenda Especializada",
      description: "Organize serviços por banhista, tipo de pet e duração estimada. Visualize toda a programação do dia de forma clara.",
    },
    {
      icon: Camera,
      title: "Galeria Antes e Depois",
      description: "Registre fotos dos pets antes e depois do serviço. Compartilhe automaticamente com os tutores via WhatsApp.",
    },
    {
      icon: MessageSquare,
      title: "Comunicação Automática",
      description: "Envie lembretes automáticos, confirme agendamentos e notifique quando o pet estiver pronto para busca.",
    },
    {
      icon: Clock,
      title: "Pacotes e Combos",
      description: "Crie pacotes mensais de banho, combos promocionais e fidelidade com descontos progressivos.",
    },
    {
      icon: Users,
      title: "Gestão de Banhistas",
      description: "Controle a produtividade de cada banhista, calcule comissões automaticamente e acompanhe avaliações.",
    },
    {
      icon: Star,
      title: "Avaliação de Serviços",
      description: "Colete feedback automático após cada atendimento e monitore a satisfação dos clientes.",
    },
  ];

  const benefits = [
    "Controle de preferências e observações do pet",
    "Histórico completo de todos os atendimentos",
    "Fichas personalizadas com raça e temperamento",
    "Alertas de pets agressivos ou especiais",
    "Gestão de horários de pico e ociosidade",
    "Relatórios de faturamento por serviço",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-muted to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-accent-foreground text-sm font-medium">
                <Camera className="h-4 w-4" />
                Para Banho e Tosa
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Organize pacotes e{" "}
                <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                  encante clientes
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Sistema especializado para banho e tosa com agenda otimizada, galeria de fotos e comunicação automática com tutores.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90">
                    Começar Grátis
                  </Button>
                </Link>
                <Link to="/funcionalidades">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Ver Funcionalidades
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-3xl blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&auto=format&fit=crop"
                alt="Banho e tosa"
                className="relative rounded-3xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Ideal para banho e tosa</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar seu serviço de banho e tosa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-lg hover:-translate-y-2 transition-all duration-300"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">
                Simplifique sua rotina de banho e tosa
              </h2>
              <p className="text-xl text-muted-foreground">
                Recursos pensados para o dia a dia de quem trabalha com estética animal
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link to="/auth">
                <Button size="lg" className="mt-6 bg-accent hover:bg-accent/90">
                  Experimente Grátis por 14 Dias
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop"
                alt="Pet sendo tosado"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Como funciona</h2>
            <p className="text-xl text-muted-foreground">
              Fluxo otimizado do agendamento até a entrega
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-accent">
                1
              </div>
              <h3 className="text-xl font-bold">Cliente Agenda</h3>
              <p className="text-muted-foreground">
                Online, WhatsApp ou telefone - tudo vai para a agenda
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-accent">
                2
              </div>
              <h3 className="text-xl font-bold">Lembrete Automático</h3>
              <p className="text-muted-foreground">
                Sistema envia lembrete 1 dia antes via WhatsApp
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-accent">
                3
              </div>
              <h3 className="text-xl font-bold">Serviço Realizado</h3>
              <p className="text-muted-foreground">
                Fotos antes/depois registradas automaticamente
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-accent">
                4
              </div>
              <h3 className="text-xl font-bold">Cliente Notificado</h3>
              <p className="text-muted-foreground">
                Aviso automático quando pet estiver pronto
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-primary/5">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <img
                  src="https://ui-avatars.com/api/?name=Patricia+Lima&background=10B981&color=fff&size=128"
                  alt="Patricia Lima"
                  className="w-24 h-24 rounded-full"
                />
                <div className="space-y-4 flex-1 text-center md:text-left">
                  <p className="text-lg leading-relaxed">
                    "A galeria de fotos antes e depois é um sucesso! Meus clientes amam receber as fotos e isso virou meu melhor marketing. Minhas faltas caíram 70% com os lembretes automáticos!"
                  </p>
                  <div>
                    <p className="font-bold text-lg">Patricia Lima</p>
                    <p className="text-muted-foreground">Banho & Tosa Pet Chic - Porto Alegre, RS</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-accent text-accent-foreground">
        <div className="container mx-auto text-center space-y-6 max-w-3xl">
          <h2 className="text-4xl font-bold">
            Simplifique seu banho e tosa
          </h2>
          <p className="text-xl opacity-90">
            Comece gratuitamente e veja como é fácil organizar sua agenda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/auth">
              <Button size="lg" variant="default" className="w-full sm:w-auto bg-primary hover:bg-primary-light">
                Começar Agora
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent"
              >
                Ver Preços
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BanhoTosa;
