import { Check, X, Crown, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { cn } from "@/lib/utils";

const ComparisonTable = () => {
  const headerReveal = useScrollReveal({ threshold: 0.3 });
  
  const features = [
    { name: "Agendamento Online 24/7", gold: true, platinum: true, annual: true, traditional: false },
    { name: "Gestão de Clientes e Pets", gold: true, platinum: true, annual: true, traditional: true },
    { name: "Calendário e Agenda", gold: true, platinum: true, annual: true, traditional: true },
    { name: "Controle de Estoque", gold: true, platinum: true, annual: true, traditional: false },
    { name: "Relatórios Financeiros", gold: true, platinum: true, annual: true, traditional: false },
    { name: "Lembretes Automáticos Email", gold: true, platinum: true, annual: true, traditional: false },
    { name: "Lembretes WhatsApp Business", gold: false, platinum: true, annual: true, traditional: false },
    { name: "Programa de Fidelidade", gold: false, platinum: true, annual: true, traditional: false },
    { name: "Multi-unidades (Franquias)", gold: false, platinum: true, annual: true, traditional: false },
    { name: "API para Integrações", gold: false, platinum: true, annual: true, traditional: false },
    { name: "White Label (Marca Própria)", gold: false, platinum: true, annual: true, traditional: false },
    { name: "Backup Automático", gold: true, platinum: true, annual: true, traditional: false },
    { name: "Suporte Especializado", gold: true, platinum: true, annual: true, traditional: false },
    { name: "App Mobile", gold: true, platinum: true, annual: true, traditional: false },
  ];

  const CheckIcon = ({ active }: { active: boolean }) => (
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 group-hover:scale-110",
      active 
        ? "bg-green-100 dark:bg-green-950 border-green-500" 
        : "bg-red-100 dark:bg-red-950 border-red-500"
    )}>
      {active ? (
        <Check className="h-5 w-5 text-green-600 dark:text-green-400 stroke-[3]" />
      ) : (
        <X className="h-5 w-5 text-red-600 dark:text-red-400 stroke-[3]" />
      )}
    </div>
  );

  return (
    <section className="py-20 px-4 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/3 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div 
          ref={headerReveal.ref}
          className={`text-center mb-16 space-y-4 scroll-reveal scroll-reveal-up ${headerReveal.isVisible ? 'visible' : ''}`}
        >
          <h2 className="text-4xl font-bold">
            Por Que Escolher o <AnimatedGradientText shimmer glow>EasyPet</AnimatedGradientText>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Compare e veja como deixamos métodos tradicionais para trás
          </p>
        </div>

        <Card className="border shadow-lg overflow-x-auto bg-card hover:shadow-xl transition-shadow duration-500">
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-6">
            <div className="grid grid-cols-5 gap-2 min-w-[800px]">
              <CardTitle className="text-sm md:text-base font-semibold">Funcionalidade</CardTitle>
              <CardTitle className="text-sm md:text-base font-semibold text-center">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold mb-2 animate-pulse">
                  <Crown className="h-3 w-3" />
                  POPULAR
                </div>
                <div>Pet Gold</div>
                <div className="text-xs mt-1 opacity-90">R$ 79,90/mês</div>
              </CardTitle>
              <CardTitle className="text-sm md:text-base font-semibold text-center">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-400 text-white rounded-full text-xs font-bold mb-2">
                  💎 PREMIUM
                </div>
                <div>Pet Platinum</div>
                <div className="text-xs mt-1 opacity-90">R$ 149,90/mês</div>
              </CardTitle>
              <CardTitle className="text-sm md:text-base font-semibold text-center">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold mb-2">
                  💰 ECONOMIA
                </div>
                <div>Platinum Anual</div>
                <div className="text-xs mt-1 opacity-90">R$ 1.798/ano</div>
              </CardTitle>
              <CardTitle className="text-sm md:text-base font-semibold text-center">Métodos Tradicionais</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="min-w-[800px]">
              {features.map((feature, index) => {
                const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
                
                return (
                  <div
                    key={index}
                    ref={ref}
                    className={cn(
                      "grid grid-cols-5 gap-2 p-4 transition-all duration-300 group",
                      "hover:bg-primary/5",
                      index !== features.length - 1 ? "border-b border-border" : "",
                      index % 2 === 0 ? "bg-muted/30" : "bg-card",
                      isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    )}
                    style={{ transitionDelay: `${index * 30}ms` }}
                  >
                    <div className="font-medium text-card-foreground flex items-center text-sm group-hover:text-primary transition-colors">
                      {feature.name}
                    </div>
                    <div className="flex justify-center items-center">
                      <CheckIcon active={feature.gold} />
                    </div>
                    <div className="flex justify-center items-center">
                      <CheckIcon active={feature.platinum} />
                    </div>
                    <div className="flex justify-center items-center">
                      <CheckIcon active={feature.annual} />
                    </div>
                    <div className="flex justify-center items-center">
                      <CheckIcon active={feature.traditional} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <div className="mt-16 space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">
              Escolha Seu <AnimatedGradientText>Plano Ideal</AnimatedGradientText>
            </h3>
            <p className="text-muted-foreground">Cancele quando quiser. Garantia de 7 dias.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card Pet Gold */}
            <Card className="border-4 border-yellow-500 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white px-4 py-1 rounded-bl-lg text-xs font-bold animate-pulse">
                POPULAR
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pt-8 relative">
                <div className="text-4xl mb-2 group-hover:scale-125 transition-transform duration-500">🏆</div>
                <CardTitle className="text-2xl">Plano Pet Gold</CardTitle>
                <div className="text-4xl font-black mt-4 group-hover:text-yellow-600 transition-colors">R$ 79,90<span className="text-lg font-normal">/mês</span></div>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <ul className="space-y-3">
                  {["Agendamentos ilimitados", "Até 3 usuários", "Gestão completa de clientes", "Relatórios básicos", "Lembretes por email"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 group/item">
                      <span className="group-hover/item:scale-125 transition-transform">✅</span>
                      <span className="group-hover/item:text-yellow-600 transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="https://pay.cakto.com.br/f72gob9_634441" target="_blank" rel="noopener noreferrer" className="block mt-6">
                  <MagneticButton
                    strength={0.1}
                    glowColor="hsl(45, 100%, 50%)"
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold py-3 rounded-lg"
                  >
                    🏆 Começar Agora
                  </MagneticButton>
                </a>
              </CardContent>
            </Card>

            {/* Card Pet Platinum */}
            <Card className="border-2 border-slate-400 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-slate-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center relative">
                <div className="text-4xl mb-2 group-hover:scale-125 transition-transform duration-500">💎</div>
                <CardTitle className="text-2xl">Plano Pet Platinum</CardTitle>
                <div className="text-4xl font-black mt-4 group-hover:text-slate-600 transition-colors">R$ 149,90<span className="text-lg font-normal">/mês</span></div>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <ul className="space-y-3">
                  {["Tudo do Gold +", "Até 5 usuários", "WhatsApp Business", "Programa de fidelidade", "Multi-unidades"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 group/item">
                      <span className="group-hover/item:scale-125 transition-transform">✅</span>
                      <span className="group-hover/item:text-slate-600 transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="https://pay.cakto.com.br/qym84js_634453" target="_blank" rel="noopener noreferrer" className="block mt-6">
                  <MagneticButton
                    strength={0.1}
                    glowColor="hsl(220, 10%, 50%)"
                    className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-bold py-3 rounded-lg"
                  >
                    💎 Upgrade Premium
                  </MagneticButton>
                </a>
              </CardContent>
            </Card>

            {/* Card Pet Platinum Anual */}
            <Card className="border-2 border-green-500 shadow-xl relative hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg animate-bounce z-10">
                🔥 25% OFF
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="text-center pt-8 relative">
                <div className="text-4xl mb-2 group-hover:scale-125 transition-transform duration-500">💰</div>
                <CardTitle className="text-2xl">Pet Platinum Anual</CardTitle>
                <div className="text-xl line-through text-muted-foreground mt-2">R$ 1.798,80</div>
                <div className="text-4xl font-black text-green-600 dark:text-green-500">R$ 1.348,50<span className="text-lg font-normal">/ano</span></div>
                <div className="text-green-600 dark:text-green-500 font-semibold text-sm mt-2 flex items-center justify-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  25% de desconto
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <ul className="space-y-3">
                  {["Tudo do Platinum", "Economia de R$ 450,30", "Consultoria presencial", "Treinamento gratuito"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 group/item">
                      <span className="group-hover/item:scale-125 transition-transform">✅</span>
                      <span className="group-hover/item:text-green-600 transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="https://pay.cakto.com.br/3997ify_634474" target="_blank" rel="noopener noreferrer" className="block mt-6">
                  <MagneticButton
                    strength={0.1}
                    glowColor="hsl(150, 80%, 40%)"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg"
                  >
                    💰 Garantir Melhor Preço
                  </MagneticButton>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
