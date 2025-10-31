import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Syringe, Calendar, Users, BarChart3, Shield, CheckCircle } from "lucide-react";

const Clinicas = () => {
  const features = [
    {
      icon: FileText,
      title: "Prontuário Digital Completo",
      description: "Registre consultas, exames, diagnósticos e prescrições em prontuário 100% online. Anexe fotos, vídeos e documentos com total segurança.",
    },
    {
      icon: Syringe,
      title: "Controle de Vacinas",
      description: "Programe protocolos de vacinação e receba alertas automáticos. Veja facilmente pets com vacina atrasada ou próxima dose.",
    },
    {
      icon: Calendar,
      title: "Agenda Veterinária",
      description: "Organize a agenda de cada veterinário com cores e categorias. Reduza faltas com lembretes automáticos via WhatsApp.",
    },
    {
      icon: Users,
      title: "Gestão de Pacientes",
      description: "Histórico completo de atendimentos, medicações e cirurgias. Acesso rápido ao prontuário durante consultas.",
    },
    {
      icon: BarChart3,
      title: "Relatórios Clínicos",
      description: "Acompanhe consultas por veterinário, procedimentos realizados e evolução dos pacientes.",
    },
    {
      icon: Shield,
      title: "Conformidade LGPD",
      description: "Sistema 100% adequado à Lei Geral de Proteção de Dados, com criptografia e controle de acesso.",
    },
  ];

  const benefits = [
    "Prontuário digital com assinatura eletrônica",
    "Controle completo de medicações e posologias",
    "Integração com laboratórios de exames",
    "Receituário e atestados personalizáveis",
    "Controle de internações e cirurgias",
    "Dashboard com indicadores clínicos",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-muted to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <FileText className="h-4 w-4" />
                Para Clínicas Veterinárias
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Prontuário amado por{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  veterinários
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Sistema completo para clínicas veterinárias com prontuário digital, controle de vacinas, agenda integrada e muito mais.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary-light">
                    Começar Grátis
                  </Button>
                </Link>
                <Link to="/funcionalidades">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Ver Todas as Funcionalidades
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&auto=format&fit=crop"
                alt="Veterinário atendendo pet"
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
            <h2 className="text-4xl font-bold">Feito para clínicas veterinárias</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Recursos específicos para atender todas as necessidades da sua clínica
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-lg hover:-translate-y-2 transition-all duration-300"
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
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">
                Tudo que sua clínica precisa em um só lugar
              </h2>
              <p className="text-xl text-muted-foreground">
                Funcionalidades desenvolvidas especificamente para atender veterinários e suas equipes
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
                <Button size="lg" className="mt-6">
                  Experimente Grátis por 14 Dias
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1530041539828-114de669390e?w=800&auto=format&fit=crop"
                alt="Sistema de gestão veterinária"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <img
                  src="https://ui-avatars.com/api/?name=Dr+Rodrigo&background=0D8ABC&color=fff&size=128"
                  alt="Dr. Rodrigo Alves"
                  className="w-24 h-24 rounded-full"
                />
                <div className="space-y-4 flex-1 text-center md:text-left">
                  <p className="text-lg leading-relaxed">
                    "Depois de testar vários sistemas, finalmente encontrei o Bointhosa. O prontuário é intuitivo, a agenda funciona perfeitamente e minha equipe se adaptou em poucos dias. Recomendo para qualquer clínica veterinária!"
                  </p>
                  <div>
                    <p className="font-bold text-lg">Dr. Rodrigo Alves</p>
                    <p className="text-muted-foreground">Clínica Veterinária Vida Animal - Curitiba, PR</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center space-y-6 max-w-3xl">
          <h2 className="text-4xl font-bold">
            Pronto para modernizar sua clínica?
          </h2>
          <p className="text-xl opacity-90">
            Teste grátis por 14 dias. Sem cartão de crédito. Cancele quando quiser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Começar Agora
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
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

export default Clinicas;
