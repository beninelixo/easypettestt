import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import TrustedBy from "@/components/TrustedBy";
import HowItWorks from "@/components/HowItWorks";
import ComparisonTable from "@/components/ComparisonTable";
import FAQ from "@/components/FAQ";
import { SEO } from "@/components/SEO";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { SegmentationSection } from "@/components/home/SegmentationSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CheckCircle2, PawPrint, ArrowRight } from "lucide-react";

const Index = () => {
  const differentials = [
    "API aberta para integrações",
    "WhatsApp Business integrado",
    "Sistema de fidelidade gamificado",
    "Controle multi-unidades e franquias",
    "Notas fiscais automáticas",
    "Suporte 24/7 em português",
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Bointhosa Pet System - Sistema Completo para Clínicas Veterinárias"
        description="Sistema completo de gestão para clínicas veterinárias, pet shops e banho & tosa. +2.500 usuários ativos, +650 cidades. Agendamento com IA, CRM veterinário, controle financeiro. Teste grátis 14 dias."
        url="https://fee7e0fa-1989-41d0-b964-a2da81396f8b.lovableproject.com"
      />
      <Navigation />

      <HeroSection />
      <StatsSection />
      <SegmentationSection />
      <FeaturesSection />

      {/* Differentials Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black">
              Diferenciais que fazem a diferença
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Recursos exclusivos que transformam sua gestão veterinária
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentials.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-6 bg-muted rounded-xl hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold text-lg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <TrustedBy />
      
      {/* How It Works */}
      <HowItWorks />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* Comparison Table */}
      <ComparisonTable />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA - Premium design */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center space-y-8">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <PawPrint className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white">
            Pronto para revolucionar sua gestão?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que já transformaram seus negócios
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/auth">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-12 py-7 bg-white text-primary hover:bg-white/90 hover:scale-[1.05] transition-all duration-300 shadow-2xl font-bold group"
              >
                Começar Teste Grátis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-12 py-7 border-2 border-white text-white hover:bg-white/10 hover:scale-[1.05] transition-all duration-300 font-semibold"
              >
                Falar com Consultor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
