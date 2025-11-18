import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, Crown, Trophy, ArrowRight, Sparkles } from "lucide-react";

export const PricingPreviewSection = () => {
  const plans = [
    {
      name: "Plano Gratuito",
      price: "R$ 0",
      period: "/mês",
      description: "Ideal para conhecer o sistema",
      features: [
        "1 usuário",
        "Até 50 agendamentos/mês",
        "Relatórios básicos",
        "Suporte por email",
      ],
      cta: "Começar Grátis",
      icon: Sparkles,
      popular: false,
      highlight: false,
    },
    {
      name: "Plano Pet Gold",
      price: "R$ 79,90",
      period: "/mês",
      description: "Perfeito para crescer",
      features: [
        "Até 3 usuários",
        "Agendamentos ilimitados",
        "Gestão completa de clientes",
        "Relatórios avançados",
        "WhatsApp integrado",
      ],
      cta: "Começar Agora",
      icon: Trophy,
      popular: true,
      highlight: true,
    },
    {
      name: "Pet Platinum",
      price: "R$ 149,90",
      period: "/mês",
      badge: "Mais Completo",
      description: "Para quem quer o máximo",
      features: [
        "Usuários ilimitados",
        "Multi-unidades",
        "White Label",
        "API aberta",
        "Consultoria exclusiva",
      ],
      cta: "Upgrade Premium",
      icon: Crown,
      popular: false,
      highlight: false,
    },
  ];

  return (
    <section className="py-24 px-4 bg-muted" aria-labelledby="pricing-preview-heading">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-4">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            Planos e Preços
          </div>
          <h2 id="pricing-preview-heading" className="text-4xl lg:text-5xl font-black">
            Escolha Seu Plano Ideal
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Cancele quando quiser. Garantia de 7 dias.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                plan.highlight 
                  ? "border-4 border-primary shadow-xl scale-105" 
                  : "border-2 border-border"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-center py-2 font-bold text-sm uppercase tracking-wide">
                  ⭐ Mais Popular
                </div>
              )}
              {plan.badge && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-accent text-white text-center py-2 font-bold text-sm uppercase tracking-wide">
                  💎 {plan.badge}
                </div>
              )}

              <CardHeader className={`text-center space-y-4 ${plan.popular || plan.badge ? "pt-16" : "pt-8"}`}>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <plan.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-black text-primary">{plan.price}</span>
                    <span className="text-muted-foreground font-semibold">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 px-6 pb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/pricing" className="block">
                  <Button 
                    className={`w-full text-base py-6 ${
                      plan.highlight 
                        ? "bg-primary hover:bg-primary/90 shadow-lg" 
                        : ""
                    }`}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/pricing">
            <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-2">
              Ver Todos os Detalhes dos Planos
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};