import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Calendar, MessageSquare, TrendingUp, Smartphone, CreditCard, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useSiteImage } from "@/hooks/useSiteImages";
import { FloatingBadge, FloatingBadgesContainer } from "@/components/ui/floating-badge";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { AnimatedBlobsBackground } from "@/components/ui/animated-blob";
import { ParallaxContainer } from "@/components/ui/parallax-container";

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
    <section className="relative pt-32 pb-20 px-4 overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated Blobs Background */}
      <AnimatedBlobsBackground />
      
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 animate-gradient" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              🐾 Sistema Completo para Pet Shops, Banho & Tosa e Clínicas
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
                <Button 
                  size="lg" 
                  className="text-xl px-12 py-8 font-bold shadow-2xl hover:shadow-primary/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105 group w-full sm:w-auto bg-gradient-to-r from-primary to-secondary relative overflow-hidden shine"
                >
                  Ver Planos e Preços
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-3 transition-transform duration-300" />
                </Button>
              </Link>
              <Link to="/system-overview">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-xl px-12 py-8 font-bold border-2 hover:bg-primary/10 hover:border-primary transition-all duration-300 w-full sm:w-auto hover:shadow-lg"
                >
                  Conhecer o Sistema
                </Button>
              </Link>
            </div>

            {/* Free Trial Badge */}
            <div 
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent/20 rounded-full border-2 border-accent/30 animate-fade-in hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: "0.5s" }}
            >
              <span className="text-2xl">🎁</span>
              <span className="font-bold text-accent-foreground">Teste Grátis 30 Dias - Sem Cartão de Crédito</span>
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
                  className="flex items-center gap-2 group hover:scale-110 transition-transform duration-300"
                >
                  <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full group-hover:animate-icon-bounce">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-semibold group-hover:text-primary transition-colors">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image with Floating Badges */}
          <ParallaxContainer speed={0.3} className="relative lg:h-[600px]">
            <FloatingBadgesContainer>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl animate-pulse-glow" />
              
              {/* Floating Badges */}
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
                delay={500}
                className="hidden lg:flex"
              />
              <FloatingBadge
                icon={TrendingUp}
                label="Dashboard Tempo Real"
                position="left"
                delay={1000}
                className="hidden lg:flex top-1/3"
              />
              <FloatingBadge
                icon={Smartphone}
                label="App Mobile"
                position="right"
                delay={1500}
                className="hidden lg:flex top-1/3"
              />
              <FloatingBadge
                icon={CreditCard}
                label="Pagamentos Online"
                position="bottom-left"
                delay={2000}
                className="hidden lg:flex"
              />
              <FloatingBadge
                icon={Shield}
                label="100% Seguro"
                position="bottom-right"
                delay={2500}
                className="hidden lg:flex"
              />
              
              {isLoading ? (
                <div className="rounded-3xl shadow-2xl w-full h-full border-4 border-primary/10 bg-muted animate-pulse min-h-[400px]" />
              ) : (
                <img
                  src={heroImage}
                  alt="Sistema EasyPet em ação"
                  className="rounded-3xl shadow-2xl object-cover w-full h-full border-4 border-primary/10 hover:scale-[1.02] transition-transform duration-500"
                />
              )}
              
              {/* Floating Stats */}
              <div 
                ref={statsReveal.ref}
                className={`absolute -bottom-6 -left-6 bg-background/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-border/50 scroll-reveal scroll-reveal-zoom ${statsReveal.isVisible ? 'visible' : ''} hover:scale-105 transition-transform duration-300`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center animate-pulse-glow">
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
      </div>
    </section>
  );
};
