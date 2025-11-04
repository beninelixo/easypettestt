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
import { CheckCircle2, PawPrint, ArrowRight, Crown, Award, Check, Clock, Shield } from "lucide-react";

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
      
      {/* Plano Pet Gold Highlight Section */}
      <section id="detalhes-plano" className="py-24 px-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full text-yellow-700 dark:text-yellow-400 font-semibold mb-4">
              <Crown className="h-5 w-5" />
              Plano Pet Gold
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              O Que Está Incluído?
            </h2>
            <p className="text-xl text-muted-foreground">
              Acesso total ao sistema mais completo para gestão veterinária
            </p>
          </div>

          <div className="bg-background rounded-3xl p-8 shadow-2xl border-4 border-yellow-500/30">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                "Agendamentos ilimitados",
                "Até 5 usuários simultâneos",
                "Gestão completa de clientes e pets",
                "Controle de estoque e produtos",
                "Relatórios financeiros avançados",
                "Sistema de lembretes automáticos",
                "WhatsApp Business integrado",
                "Gestão de consultas veterinárias",
                "Programa de fidelidade para clientes",
                "Multi-unidades e franquias",
                "API aberta para integrações",
                "Suporte técnico prioritário 24/7"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-lg">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-yellow-500/20 pt-6 text-center">
              <p className="text-3xl font-black mb-2">
                Apenas <span className="text-yellow-600 dark:text-yellow-500">R$ 79,90</span>/mês
              </p>
              <p className="text-muted-foreground mb-6">
                Cancele quando quiser. Sem taxas ocultas.
              </p>
              <a href="https://pay.cakto.com.br/f72gob9_634441" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="text-xl px-16 py-8 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 shadow-2xl text-white">
                  🏆 Garantir Meu Acesso Agora
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

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

      {/* Garantia Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-3xl p-8 text-center border-2 border-green-500/30">
            <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-black mb-4">
              🛡️ Garantia de Satisfação
            </h3>
            <p className="text-lg mb-6">
              Se você não ficar 100% satisfeito nos primeiros 7 dias, 
              devolvemos seu dinheiro sem perguntas.
            </p>
            <a href="https://pay.cakto.com.br/f72gob9_634441" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                Testar Sem Risco por 7 Dias
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Urgency Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-700 dark:text-red-400 font-semibold mb-4 animate-pulse">
            <Clock className="h-5 w-5" />
            Oferta por Tempo Limitado
          </div>
          <h2 className="text-3xl font-black mb-4">
            ⚡ Garanta Seu Acesso Agora
          </h2>
          <p className="text-xl mb-8">
            +500 clínicas e pet shops já transformaram sua gestão com o Bointhosa Pet
          </p>
          <a href="https://pay.cakto.com.br/f72gob9_634441" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="text-xl px-12 py-8 bg-red-600 hover:bg-red-700 text-white">
              Não Perder Esta Oportunidade
            </Button>
          </a>
        </div>
      </section>

      {/* Final CTA - Premium design */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 via-amber-600 to-yellow-700" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center space-y-8">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white">
            🏆 Pronto para ter o melhor sistema?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que já transformaram seus negócios com o Plano Pet Gold
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20">
            <p className="text-5xl font-black text-white mb-2">
              R$ 79,90<span className="text-2xl">/mês</span>
            </p>
            <p className="text-white/80 mb-6">Pagamento via Cakto • Cancele quando quiser</p>
            
            <a href="https://pay.cakto.com.br/f72gob9_634441" target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg" 
                className="text-xl px-16 py-8 bg-white text-yellow-700 hover:bg-gray-100 shadow-2xl font-black group"
              >
                🏆 Garantir Acesso ao Plano Pet Gold
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </Button>
            </a>
          </div>

          <p className="text-sm text-white/60 mt-6">
            Pagamento 100% seguro via Cakto • Suporte 24/7 em português
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
