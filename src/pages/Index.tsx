import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import HowItWorks from "@/components/HowItWorks";
import ComparisonTable from "@/components/ComparisonTable";
import FAQ from "@/components/FAQ";
import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { SegmentationSection } from "@/components/home/SegmentationSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { DifferentialsSection } from "@/components/home/DifferentialsSection";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { AnimatedSection } from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ParticlesBackground } from "@/components/ui/particles-background";
import { WaveBackground } from "@/components/ui/wave-background";
import { ArrowRight, Rocket, TrendingUp, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Scroll Progress Bar */}
      <ScrollProgress height={3} />
      
      <SEO 
        title="EasyPet - Sistema Completo de Gestão para Pet Shops, Banho & Tosa e Clínicas"
        description="Sistema completo de gestão para seu pet shop, banho e tosa ou clínica veterinária. +2.500 usuários ativos, +650 cidades. Agendamento inteligente, CRM, controle financeiro. Teste grátis 30 dias."
        url="https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com"
      />
      <Navigation />

      {/* Hero Section */}
      <HeroSection />

      {/* Stats + Trust Section Combined */}
      <StatsSection />

      {/* Segmentation */}
      <SegmentationSection />

      {/* CTA 1 - After Segmentation */}
      <section className="py-16 px-4 bg-background relative overflow-hidden">
        <ParticlesBackground particleCount={20} color="hsl(var(--primary))" className="opacity-20" />
        <AnimatedSection animation="zoom" className="container mx-auto max-w-4xl text-center">
          <div className="space-y-6 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-3xl p-12 border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl group relative overflow-hidden">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <Rocket className="h-12 w-12 text-primary mx-auto group-hover:scale-125 group-hover:-translate-y-2 transition-all duration-500" />
            <h3 className="text-3xl font-black relative">
              Comece Seu Teste Grátis Agora
            </h3>
            <p className="text-lg text-muted-foreground relative">
              30 dias para testar todas as funcionalidades. Sem cartão de crédito.
            </p>
            <Link to="/pricing" className="relative inline-block">
              <MagneticButton
                strength={0.15}
                glowColor="hsl(var(--primary))"
                className="bg-primary text-primary-foreground text-lg px-10 py-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  Começar Agora
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </MagneticButton>
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* Features */}
      <FeaturesSection />

      {/* Differentials */}
      <DifferentialsSection />

      {/* How It Works */}
      <HowItWorks />

      {/* CTA 2 - After How It Works */}
      <section className="py-16 px-4 bg-muted relative overflow-hidden">
        <AnimatedSection animation="slide-up" className="container mx-auto max-w-4xl text-center">
          <div className="space-y-6 bg-background rounded-3xl p-12 border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl group relative overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <TrendingUp className="h-12 w-12 text-primary mx-auto group-hover:scale-125 transition-transform duration-500" />
            <h3 className="text-3xl font-black relative">
              Junte-se a 2.500+ Negócios de Sucesso
            </h3>
            <p className="text-lg text-muted-foreground relative">
              Empresas que já transformaram sua gestão com o EasyPet
            </p>
            <Link to="/pricing" className="relative inline-block">
              <MagneticButton
                strength={0.15}
                glowColor="hsl(var(--primary))"
                className="bg-primary text-primary-foreground text-lg px-10 py-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  Ver Planos
                  <ArrowRight className="h-5 w-5" />
                </span>
              </MagneticButton>
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Comparison Table */}
      <ComparisonTable />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary via-secondary to-primary relative overflow-hidden">
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-white/20 animate-float-enhanced"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                width: `${15 + Math.random() * 25}px`,
                height: `${15 + Math.random() * 25}px`,
              }}
            />
          ))}
        </div>
        
        {/* Wave at top */}
        <WaveBackground position="top" color="hsl(var(--background))" opacity={0.1} speed="slow" flip />
        
        <AnimatedSection animation="zoom" className="container mx-auto max-w-3xl text-center space-y-6 relative z-10">
          <h2 className="text-4xl font-black text-white">
            Pronto para Transformar Seu Negócio?
          </h2>
          <p className="text-xl text-white/90">
            Comece hoje mesmo e veja a diferença em poucos dias
          </p>
          <Link to="/pricing">
            <MagneticButton
              strength={0.2}
              glowColor="hsl(0, 0%, 100%)"
              className="bg-white text-primary hover:bg-white/90 text-xl px-12 py-8 rounded-xl font-bold shadow-2xl transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Ver Planos e Preços
                <ArrowRight className="h-6 w-6" />
              </span>
            </MagneticButton>
          </Link>
        </AnimatedSection>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
