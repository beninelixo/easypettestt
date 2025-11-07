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
import { CheckCircle2, ArrowRight } from "lucide-react";

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
        title="PetHub - Sistema Completo de Gestão para Pet Shops, Banho & Tosa e Clínicas"
        description="Sistema completo de gestão para seu pet shop, banho e tosa ou clínica veterinária. +2.500 usuários ativos, +650 cidades. Agendamento inteligente, CRM, controle financeiro. Teste grátis 14 dias."
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
              Recursos exclusivos que transformam a gestão do seu negócio pet
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

      {/* Final CTA - Simple */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-4xl font-black text-white">
            Pronto para começar?
          </h2>
          <p className="text-xl text-white/90">
            Escolha o plano ideal para o seu negócio
          </p>
          <Link to="/pricing">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-xl px-12 py-8 font-bold">
              Ver Planos e Preços
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
