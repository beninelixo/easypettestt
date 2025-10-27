import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "/mês",
      description: "Perfeito para começar e testar o sistema",
      features: [
        "Até 30 agendamentos/mês",
        "1 usuário",
        "Cadastro de clientes e pets",
        "Agenda básica",
        "Suporte por email",
      ],
      cta: "Começar Grátis",
      highlighted: false,
    },
    {
      name: "Profissional",
      price: "R$ 79",
      period: "/mês",
      description: "Ideal para pet shops em crescimento",
      features: [
        "Agendamentos ilimitados",
        "Até 5 usuários",
        "Lembretes automáticos WhatsApp",
        "Dashboard completo",
        "Sistema de comissões",
        "Histórico completo",
        "Suporte prioritário",
        "Sem taxa de configuração",
      ],
      cta: "Começar Teste Grátis",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "R$ 149",
      period: "/mês",
      description: "Para múltiplas unidades e grandes operações",
      features: [
        "Tudo do Profissional",
        "Usuários ilimitados",
        "Múltiplas unidades",
        "Personalização de marca",
        "Integração com sistemas",
        "Relatórios avançados",
        "Suporte 24/7",
        "Gerente de conta dedicado",
      ],
      cta: "Falar com Vendas",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-muted to-background">
        <div className="container mx-auto max-w-4xl text-center space-y-6 animate-fade-in">
          <h1 className="text-5xl font-bold">Planos e Preços</h1>
          <p className="text-xl text-muted-foreground">
            Escolha o plano perfeito para o seu negócio. Sem contratos, cancele quando quiser.
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border-border transition-all hover:shadow-xl ${
                  plan.highlighted ? "border-primary border-2 shadow-lg scale-105" : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-accent" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Link to="/auth" className="w-full">
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-primary hover:bg-primary-light"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center text-muted-foreground">
            <p className="text-lg">
              Todos os planos incluem 14 dias de teste grátis. Não é necessário cartão de crédito.
            </p>
          </div>

          <div className="mt-20 bg-muted rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  q: "Posso mudar de plano a qualquer momento?",
                  a: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento, sem multas ou taxas adicionais.",
                },
                {
                  q: "Como funciona o período de teste?",
                  a: "Você tem 14 dias para testar todas as funcionalidades do plano escolhido, sem compromisso. Não pedimos cartão de crédito no cadastro.",
                },
                {
                  q: "Preciso de conhecimento técnico?",
                  a: "Não! O Bointhosa foi desenvolvido para ser extremamente intuitivo. Se você sabe usar WhatsApp, consegue usar nosso sistema.",
                },
                {
                  q: "Meus dados estão seguros?",
                  a: "Absolutamente. Usamos criptografia de ponta e fazemos backups automáticos diários de todos os dados.",
                },
              ].map((faq, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-semibold text-lg">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
