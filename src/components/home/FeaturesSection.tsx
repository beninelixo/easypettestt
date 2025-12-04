import { Calendar, Clock, Users, TrendingUp, Shield, Smartphone, Zap } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { GlowingBorder } from "@/components/ui/glowing-border";
import { cn } from "@/lib/utils";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Calendar,
      title: "Agendamento com IA",
      description: "Sistema inteligente que sugere os melhores horários e otimiza sua agenda automaticamente",
      color: "from-blue-500/20 to-cyan-500/20",
      glowColor: "hsl(200, 90%, 50%)",
    },
    {
      icon: Clock,
      title: "Gestão de Tempo Real",
      description: "Acompanhe todas as operações ao vivo com dashboards e alertas instantâneos",
      color: "from-purple-500/20 to-pink-500/20",
      glowColor: "hsl(280, 90%, 50%)",
    },
    {
      icon: Users,
      title: "CRM Veterinário Completo",
      description: "Histórico completo de cada pet, lembretes automáticos e fidelização inteligente",
      color: "from-green-500/20 to-emerald-500/20",
      glowColor: "hsl(150, 90%, 40%)",
    },
    {
      icon: TrendingUp,
      title: "Analytics Avançado",
      description: "BI integrado com previsões, tendências e insights acionáveis para crescimento",
      color: "from-orange-500/20 to-amber-500/20",
      glowColor: "hsl(30, 90%, 50%)",
    },
    {
      icon: Shield,
      title: "Segurança LGPD",
      description: "Proteção máxima dos dados com criptografia e conformidade total com LGPD",
      color: "from-red-500/20 to-rose-500/20",
      glowColor: "hsl(0, 90%, 50%)",
    },
    {
      icon: Smartphone,
      title: "App Mobile Nativo",
      description: "Aplicativo completo para iOS e Android com sincronização em tempo real",
      color: "from-indigo-500/20 to-violet-500/20",
      glowColor: "hsl(250, 90%, 50%)",
    },
  ];

  return (
    <section className="py-24 px-4 bg-muted relative overflow-hidden" aria-labelledby="features-heading">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "1s" }} />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-4 animate-fade-in hover:bg-primary/20 transition-colors cursor-default group">
            <Zap className="h-4 w-4 animate-pulse group-hover:animate-bounce" aria-hidden="true" />
            <span className="group-hover:translate-x-1 transition-transform">Funcionalidades Premium</span>
          </div>
          <h2 
            id="features-heading" 
            className="text-4xl lg:text-5xl font-black animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Tudo que você precisa, <AnimatedGradientText shimmer>e muito mais</AnimatedGradientText>
          </h2>
          <p 
            className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Sistema completo com inteligência artificial para revolucionar sua gestão veterinária
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
            
            return (
              <div
                key={index}
                ref={ref}
                className={`scroll-reveal scroll-reveal-up ${isVisible ? 'visible' : ''}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <GlowingBorder
                  glowColor={feature.glowColor}
                  intensity="medium"
                  borderRadius="1rem"
                >
                  <GlassCard
                    hover3D
                    glow
                    className="h-full cursor-pointer group"
                    tabIndex={0}
                    role="article"
                    aria-label={feature.title}
                  >
                    <div className="space-y-4">
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center",
                        "bg-gradient-to-br shadow-lg",
                        "group-hover:scale-110 group-hover:rotate-6 transition-all duration-500",
                        "group-hover:shadow-xl",
                        feature.color
                      )}>
                        <feature.icon className="h-7 w-7 text-primary group-hover:animate-icon-bounce" aria-hidden="true" />
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                        {feature.description}
                      </p>
                    </div>
                  </GlassCard>
                </GlowingBorder>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
