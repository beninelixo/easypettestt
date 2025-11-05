import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Award, TrendingDown, Shield, X, ArrowRight, Sparkles } from "lucide-react";
import ComparisonTable from "@/components/ComparisonTable";
import FAQ from "@/components/FAQ";
import { SEO } from "@/components/SEO";

const Pricing = () => {
  const plans = [
    {
      name: "Pet Gold",
      price: "R$ 79,90",
      period: "/mês",
      description: "Ideal para clínicas e pet shops em crescimento",
      badge: "🏆 MAIS POPULAR",
      badgeColor: "bg-yellow-500",
      borderColor: "border-yellow-500",
      features: [
        "Agendamentos ilimitados",
        "Até 5 usuários simultâneos",
        "Gestão completa de clientes e pets",
        "Controle de estoque e produtos",
        "Relatórios financeiros avançados",
        "Sistema de lembretes automáticos",
        "WhatsApp Business integrado",
        "Gestão de consultas veterinárias",
        "Programa de fidelidade para clientes",
        "API aberta para integrações",
        "Suporte técnico prioritário 24/7",
      ],
      ctaText: "🏆 Começar Agora",
      ctaLink: "https://pay.cakto.com.br/f72gob9_634441",
      highlighted: true,
      buttonClass: "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white",
    },
    {
      name: "Pet Platinum",
      price: "R$ 149,90",
      period: "/mês",
      description: "Para operações profissionais e múltiplas unidades",
      badge: "💎 PREMIUM",
      badgeColor: "bg-slate-400",
      borderColor: "border-slate-400",
      features: [
        "✨ Tudo do Pet Gold, mais:",
        "Usuários ilimitados",
        "Multi-unidades e franquias",
        "Personalização de marca (white label)",
        "Relatórios avançados personalizados",
        "Integração com sistemas externos",
        "Gerente de conta dedicado",
        "Consultoria estratégica mensal",
        "Acesso prioritário a novos recursos",
        "SLA de uptime 99.9%",
      ],
      ctaText: "💎 Upgrade Premium",
      ctaLink: "https://pay.cakto.com.br/qym84js_634453",
      highlighted: false,
      buttonClass: "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white",
    },
    {
      name: "Pet Platinum Anual",
      price: "R$ 1.798,00",
      period: "/ano",
      originalPrice: "R$ 1.998,80",
      savings: "Economize R$ 200,80",
      description: "Melhor custo-benefício para o longo prazo",
      badge: "💰 MELHOR ECONOMIA",
      badgeColor: "bg-green-500",
      borderColor: "border-green-500",
      features: [
        "✨ Tudo do Pet Platinum, mais:",
        "🎁 2 meses grátis (pague 10, use 12)",
        "💰 Economia de R$ 200,80 no ano",
        "📅 Pagamento único anual",
        "🔒 Desconto garantido por 12 meses",
        "⚡ Prioridade máxima no suporte",
        "🎓 Treinamento gratuito para equipe",
        "🤝 Consultoria trimestral presencial",
        "🎯 Onboarding personalizado",
      ],
      ctaText: "💰 Garantir Melhor Preço",
      ctaLink: "https://pay.cakto.com.br/3997ify_634474",
      highlighted: false,
      buttonClass: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Planos e Preços - PetHub | A partir de R$ 79,90/mês"
        description="Escolha o plano ideal: Pet Gold (R$ 79,90/mês), Pet Platinum (R$ 149,90/mês) ou Anual (R$ 1.798/ano). Garantia de 7 dias. Cancele quando quiser."
        url="https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com/pricing"
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto max-w-4xl text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold mb-4">
            <Crown className="h-5 w-5" />
            Escolha Seu Plano Ideal
          </div>
          <h1 className="text-5xl lg:text-6xl font-black">Planos e Preços Transparentes</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Todos os planos incluem suporte em português e cancelamento sem burocracia.
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8 items-start mb-20">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.highlighted ? `${plan.borderColor} border-4 shadow-xl scale-105` : `${plan.borderColor} border-2`
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${plan.badgeColor} text-white px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap`}>
                    {plan.badge}
                  </div>
                )}
                {plan.savings && (
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg animate-pulse z-10">
                    💰 {plan.savings}
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-3xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base min-h-[3rem] flex items-center justify-center">{plan.description}</CardDescription>
                  <div className="mt-6 space-y-2">
                    {plan.originalPrice && (
                      <div className="text-2xl text-muted-foreground line-through">
                        {plan.originalPrice}
                      </div>
                    )}
                    <div>
                      <span className="text-5xl font-black">{plan.price}</span>
                      <span className="text-muted-foreground text-lg">{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-500 rounded-xl p-4 mt-4">
                        <p className="text-green-700 dark:text-green-400 font-black text-xl flex items-center justify-center gap-2">
                          <TrendingDown className="h-6 w-6" />
                          Economize R$ 200,80 no ano
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-500 mt-1 text-center">
                          Equivalente a 2 meses grátis
                        </p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 min-h-[400px]">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full ${plan.badgeColor}/20 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check className={`h-3 w-3 ${plan.badgeColor === 'bg-yellow-500' ? 'text-yellow-600' : plan.badgeColor === 'bg-slate-400' ? 'text-slate-600' : 'text-green-600'}`} />
                      </div>
                      <span className={`text-sm ${feature.startsWith('✨') ? 'font-bold text-base' : ''}`}>{feature}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <a href={plan.ctaLink} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button
                      className={`w-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${plan.buttonClass}`}
                      size="lg"
                    >
                      {plan.ctaText}
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mb-20">
            <h2 className="text-3xl font-black text-center mb-12">Comparação Detalhada</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-card rounded-xl overflow-hidden shadow-lg">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-4 font-bold">Funcionalidade</th>
                    <th className="text-center p-4 font-bold">Pet Gold</th>
                    <th className="text-center p-4 font-bold">Pet Platinum</th>
                    <th className="text-center p-4 font-bold">Platinum Anual</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { name: "Agendamentos", gold: "Ilimitados", platinum: "Ilimitados", annual: "Ilimitados" },
                    { name: "Usuários simultâneos", gold: "5", platinum: "Ilimitados", annual: "Ilimitados" },
                    { name: "Unidades", gold: "1", platinum: "Múltiplas", annual: "Múltiplas" },
                    { name: "WhatsApp integrado", gold: true, platinum: true, annual: true },
                    { name: "Programa de fidelidade", gold: true, platinum: true, annual: true },
                    { name: "Relatórios avançados", gold: true, platinum: true, annual: true },
                    { name: "White label (marca própria)", gold: false, platinum: true, annual: true },
                    { name: "Gerente de conta dedicado", gold: false, platinum: true, annual: true },
                    { name: "Consultoria estratégica", gold: false, platinum: "Mensal", annual: "Trimestral presencial" },
                    { name: "Suporte", gold: "Prioritário", platinum: "24/7 Premium", annual: "24/7 VIP" },
                    { name: "Economia anual", gold: "-", platinum: "-", annual: "R$ 200,80" },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-medium">{row.name}</td>
                      <td className="p-4 text-center">
                        {typeof row.gold === 'boolean' ? (
                          row.gold ? <Check className="h-5 w-5 text-yellow-600 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        ) : row.gold}
                      </td>
                      <td className="p-4 text-center">
                        {typeof row.platinum === 'boolean' ? (
                          row.platinum ? <Check className="h-5 w-5 text-slate-600 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        ) : row.platinum}
                      </td>
                      <td className="p-4 text-center font-semibold">
                        {typeof row.annual === 'boolean' ? (
                          row.annual ? <Check className="h-5 w-5 text-green-600 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        ) : row.annual}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Why Choose Section */}
          <ComparisonTable />

          {/* Guarantee Section */}
          <div className="my-20">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-3xl p-12 text-center border-2 border-green-500/30">
              <Shield className="h-20 w-20 text-green-600 mx-auto mb-6" />
              <h3 className="text-3xl font-black mb-4">🛡️ Garantia de Satisfação de 7 Dias</h3>
              <p className="text-xl mb-6 max-w-2xl mx-auto">
                Se você não ficar 100% satisfeito, devolvemos seu dinheiro sem fazer perguntas.
              </p>
              <p className="text-sm text-muted-foreground">Válido para todos os planos</p>
            </div>
          </div>

          {/* FAQ */}
          <FAQ />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto max-w-5xl relative z-10 text-center space-y-8">
          <Sparkles className="h-16 w-16 text-white mx-auto mb-4" />
          <h2 className="text-4xl lg:text-5xl font-black text-white">
            🏆 Qual plano combina com você?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Mais de 500 clínicas e pet shops já escolheram. Junte-se a eles hoje.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-12">
            {plans.map((plan, idx) => (
              <a key={idx} href={plan.ctaLink} target="_blank" rel="noopener noreferrer" className="block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                  <p className="text-sm text-white/80 mb-2">{plan.name}</p>
                  <p className="text-3xl font-black text-white mb-4">{plan.price}<span className="text-sm">{plan.period}</span></p>
                  <Button className={`w-full ${plan.buttonClass}`}>
                    {plan.ctaText}
                  </Button>
                </div>
              </a>
            ))}
          </div>

          <p className="text-sm text-white/60 mt-8">
            Pagamento 100% seguro via Cakto • Suporte 24/7 em português • Cancele quando quiser
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
