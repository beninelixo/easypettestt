import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, TrendingUp, Shield, Smartphone, Zap } from "lucide-react";

export const FeaturesSection = () => {
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

  return (
    <section className="py-24 px-4 bg-muted" aria-labelledby="features-heading">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-4">
            <Zap className="h-4 w-4" aria-hidden="true" />
            Funcionalidades Premium
          </div>
          <h2 id="features-heading" className="text-4xl lg:text-5xl font-black">
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
              tabIndex={0}
              role="article"
              aria-label={feature.title}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
              <CardHeader className="relative space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                  <feature.icon className="h-7 w-7 text-primary" aria-hidden="true" />
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
      </div>
    </section>
  );
};
