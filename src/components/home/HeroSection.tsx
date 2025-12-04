import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Calendar, MessageSquare, TrendingUp, Smartphone, CreditCard, Shield, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useSiteImage } from "@/hooks/useSiteImages";
import { FloatingBadge, FloatingBadgesContainer } from "@/components/ui/floating-badge";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { ParallaxContainer } from "@/components/ui/parallax-container";
import { ParticlesBackground } from "@/components/ui/particles-background";
import { MagneticButton } from "@/components/ui/magnetic-button";

// Fallback local image
import heroImageFallback from "@/assets/hero-petshop.jpg";

export const HeroSection = () => {
  const statsReveal = useScrollReveal({ threshold: 0.5 });
  const { url: heroImageUrl, isLoading } = useSiteImage('hero-petshop');
  
  // Use dynamic URL if available, otherwise fallback to local asset
  const heroImage = heroImageUrl && !heroImageUrl.includes('/src/assets/') 
    ? heroImageUrl 
    : heroImageFallback;

  const typewriterWords = [
    "Pet Shop",
    "Banho & Tosa",
    "Clínica Veterinária",
    "Hospital Pet",
  ];
  
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden min-h-[100vh] flex items-center">
      {/* Light Particles Background */}
      <ParticlesBackground 
        particleCount={15}
        color="hsl(var(--primary))"
        connectDistance={100}
        className="opacity-30"
      />
      
      {/* Subtle Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm animate-fade-in hover:bg-primary/15 transition-colors duration-250 cursor-default group"
              style={{ animationDelay: "0.1s" }}
            >
              <span>🐾</span>
              <span className="group-hover:translate-x-0.5 transition-transform duration-250">Sistema Completo para Pet Shops, Banho & Tosa e Clínicas</span>
            </div>
            
            <h1 
              className="text-5xl lg:text-7xl font-black leading-tight animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Transforme Seu{" "}
              <AnimatedGradientText shimmer glow>
                <TypewriterText 
                  words={typewriterWords}
                  typingSpeed={80}
                  deletingSpeed={40}
                  pauseDuration={2500}
                />
              </AnimatedGradientText>
            </h1>
            
            <p 
              className="text-xl text-muted-foreground leading-relaxed animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              Sistema completo de gestão para seu pet shop, banho e tosa ou clínica veterinária. 
              Agendamento inteligente, gestão financeira, controle de estoque e muito mais.
            </p>

            <div 
              className="flex flex-col sm:flex-row gap-4 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Link to="/pricing">
                <MagneticButton
                  strength={0.15}
                  glowColor="hsl(var(--primary))"
                  className="text-base px-6 py-3 font-bold shadow-md bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl hover:shadow-lg transition-all duration-250 hover:-translate-y-0.5 group w-full sm:w-auto"
                >
                  <span className="flex items-center gap-2">
                    Ver Planos e Preços
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-250" />
                  </span>
                </MagneticButton>
              </Link>
              <Link to="/system-overview">
                <Button 
                  size="default" 
                  variant="outline"
                  className="text-base px-6 py-3 font-bold border-2 hover:bg-primary/5 hover:border-primary transition-all duration-250 w-full sm:w-auto hover:shadow-md group"
                >
                  <span className="group-hover:text-primary transition-colors duration-250">Conhecer o Sistema</span>
                </Button>
              </Link>
            </div>

            {/* Free Trial Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent/15 rounded-full border border-accent/20 animate-fade-in hover:scale-[1.02] hover:bg-accent/20 transition-all duration-250 cursor-default group"
              style={{ animationDelay: "0.5s" }}
            >
              <span className="text-xl">🎁</span>
              <span className="font-semibold text-sm text-accent-foreground group-hover:text-primary transition-colors duration-250">Teste Grátis 30 Dias - Sem Cartão</span>
            </div>

            {/* Trust Indicators */}
            <div 
              className="flex flex-wrap gap-6 pt-4 animate-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              {[
                { label: "+2.500 usuários ativos" },
                { label: "+650 cidades" },
                { label: "4.8/5 estrelas" },
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 group hover:scale-105 transition-all duration-250"
                  style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                >
                  <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full group-hover:scale-110 transition-all duration-250">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-semibold group-hover:text-primary transition-colors duration-250">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image with Floating Badges */}
          <ParallaxContainer speed={0.2} className="relative lg:h-[600px]">
            <FloatingBadgesContainer>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-3xl" />
              
              {/* Floating Badges - fewer and subtler */}
              <FloatingBadge
                icon={Calendar}
                label="Agendamento IA"
                position="top-left"
                delay={0}
                className="hidden lg:flex"
              />
              <FloatingBadge
                icon={MessageSquare}
                label="WhatsApp Integrado"
                position="top-right"
                delay={300}
                className="hidden lg:flex"
              />
              <FloatingBadge
                icon={TrendingUp}
                label="Dashboard Tempo Real"
                position="left"
                delay={600}
                className="hidden lg:flex top-1/3"
              />
              <FloatingBadge
                icon={Shield}
                label="100% Seguro"
                position="bottom-right"
                delay={900}
                className="hidden lg:flex"
              />
              
              {isLoading ? (
                <div className="rounded-3xl shadow-lg w-full h-full border border-border/50 bg-muted animate-pulse min-h-[400px]" />
              ) : (
                <img
                  src={heroImage}
                  alt="Sistema EasyPet em ação"
                  className="rounded-3xl shadow-lg object-cover w-full h-full border border-border/50 hover:scale-[1.01] transition-transform duration-300"
                />
              )}
              
              {/* Floating Stats */}
              <div 
                ref={statsReveal.ref}
                className={`absolute -bottom-6 -left-6 z-20 bg-background/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/50 scroll-reveal scroll-reveal-zoom ${statsReveal.isVisible ? 'visible' : ''} hover:scale-[1.02] transition-transform duration-250`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-secondary/15 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-black">2.500+</p>
                    <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  </div>
                </div>
              </div>
            </FloatingBadgesContainer>
          </ParallaxContainer>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle hidden lg:flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-sm font-medium">Rolar para baixo</span>
          <ChevronDown className="h-6 w-6" />
        </div>
      </div>
    </section>
  );
};
