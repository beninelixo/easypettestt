import { useCountUp } from "@/hooks/useCountUp";
import { CheckCircle2, Shield, Clock, Sparkles } from "lucide-react";
import { useSiteImage } from "@/hooks/useSiteImages";
import happyClientsFallback from "@/assets/happy-clients.jpg";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ParallaxContainer } from "@/components/ui/parallax-container";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { cn } from "@/lib/utils";

export const StatsSection = () => {
  const activeUsers = useCountUp({ end: 2500 });
  const cities = useCountUp({ end: 650 });
  const appointments = useCountUp({ end: 2100 });
  const imageReveal = useScrollReveal({ threshold: 0.3 });

  const { url: happyClientsUrl } = useSiteImage('happy-clients');
  const happyClientsImg = happyClientsUrl && !happyClientsUrl.includes('/src/assets/') 
    ? happyClientsUrl 
    : happyClientsFallback;

  const stats = [
    { ref: activeUsers.ref, value: activeUsers.count, suffix: "+", label: "Usuários Ativos", format: true },
    { ref: cities.ref, value: cities.count, suffix: "+", label: "Cidades no Brasil", format: false },
    { ref: appointments.ref, value: appointments.count / 1000, suffix: " mi", label: "Atendimentos", format: true, toFixed: 1 },
  ];

  const trustItems = [
    {
      icon: Shield,
      title: "100% Cloud & Seguro",
      description: "Seus dados protegidos com criptografia e acessíveis de qualquer lugar",
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Clock,
      title: "Suporte 24/7",
      description: "Equipe especializada pronta para ajudar quando você precisar",
      color: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: CheckCircle2,
      title: "+50 Atualizações por Ano",
      description: "Sistema sempre evoluindo com novas funcionalidades",
      color: "from-green-500/20 to-emerald-500/20",
    },
  ];

  return (
    <>
      {/* Stats Bar */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary via-secondary to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-white/20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                width: `${10 + Math.random() * 20}px`,
                height: `${10 + Math.random() * 20}px`,
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center space-y-2 animate-fade-in group" 
                ref={stat.ref}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-5xl lg:text-6xl font-black text-white group-hover:animate-count-up-glow transition-all duration-300">
                  {stat.suffix === "+" && stat.suffix}
                  {stat.format 
                    ? (stat.toFixed 
                        ? (stat.value as number).toFixed(stat.toFixed) 
                        : stat.value.toLocaleString('pt-BR'))
                    : stat.value}
                  {stat.suffix !== "+" && stat.suffix}
                </div>
                <div className="text-sm lg:text-base font-semibold text-white/90 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
            
            {/* Plan highlight */}
            <div 
              className="text-center space-y-2 animate-fade-in bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl p-4 border-2 border-yellow-500/30 hover:scale-105 transition-transform duration-300 hover:shadow-xl" 
              style={{ animationDelay: "0.3s" }}
            >
              <div className="text-5xl lg:text-6xl font-black text-white">
                R$ 79,90
              </div>
              <div className="text-sm lg:text-base font-semibold text-white/90 uppercase tracking-wide">
                Plano Pet Gold/mês
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 bg-muted relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ParallaxContainer speed={0.2}>
              <div 
                ref={imageReveal.ref}
                className={`relative scroll-reveal scroll-reveal-left ${imageReveal.isVisible ? 'visible' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl animate-pulse-glow" />
                <img
                  src={happyClientsImg}
                  alt="Clientes satisfeitos com seus pets em ambiente de pet shop"
                  className="relative rounded-2xl shadow-xl w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            </ParallaxContainer>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-black mb-4">
                  Por Que Somos <AnimatedGradientText>Confiáveis</AnimatedGradientText>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Sistema líder em inovação, focado em simplificar sua rotina
                </p>
              </div>
              <div className="space-y-4">
                {trustItems.map((item, index) => {
                  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
                  
                  return (
                    <div
                      key={index}
                      ref={ref}
                      className={`scroll-reveal scroll-reveal-right ${isVisible ? 'visible' : ''}`}
                      style={{ transitionDelay: `${index * 150}ms` }}
                    >
                      <GlassCard
                        hover3D
                        className="group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center",
                              "bg-gradient-to-br shadow-lg",
                              "group-hover:scale-110 transition-transform duration-300",
                              item.color
                            )}>
                              <item.icon className="h-6 w-6 text-primary group-hover:animate-icon-bounce" />
                            </div>
                          </div>
                          <div>
                            <p className="text-foreground font-bold mb-1 group-hover:text-primary transition-colors">
                              {item.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
