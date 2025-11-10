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
import { PricingPreviewSection } from "@/components/home/PricingPreviewSection";
import { ArrowRight, Rocket, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-4xl text-center space-y-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-12">
          <Rocket className="h-12 w-12 text-primary mx-auto" />
          <h3 className="text-3xl font-black">
            Comece Seu Teste Grátis Agora
          </h3>
          <p className="text-lg text-muted-foreground">
            30 dias para testar todas as funcionalidades. Sem cartão de crédito.
          </p>
          <Link to="/pricing">
            <Button size="lg" className="text-lg px-10 py-6">
              Começar Agora
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <FeaturesSection />

      {/* Differentials */}
      <DifferentialsSection />

      {/* How It Works */}
      <HowItWorks />

      {/* CTA 2 - After How It Works */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl text-center space-y-6 bg-background rounded-3xl p-12 border-2 border-primary/20">
          <TrendingUp className="h-12 w-12 text-primary mx-auto" />
          <h3 className="text-3xl font-black">
            Junte-se a 2.500+ Negócios de Sucesso
          </h3>
          <p className="text-lg text-muted-foreground">
            Empresas que já transformaram sua gestão com o EasyPet
          </p>
          <Link to="/pricing">
            <Button size="lg" className="text-lg px-10 py-6">
              Ver Planos
              <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Comparison Table */}
      <ComparisonTable />

      {/* Pricing Preview */}
      <PricingPreviewSection />

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-4xl font-black text-white">
            Pronto para Transformar Seu Negócio?
          </h2>
          <p className="text-xl text-white/90">
            Comece hoje mesmo e veja a diferença em poucos dias
          </p>
          <Link to="/pricing">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-xl px-12 py-8 font-bold shadow-2xl">
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
