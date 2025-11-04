import { Button } from "@/components/ui/button";
import { ArrowRight, Award } from "lucide-react";
import heroImage from "@/assets/hero-petshop.jpg";

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-24 px-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-background" />
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 rounded-full text-yellow-700 dark:text-yellow-400 text-sm font-semibold border border-yellow-500/30 animate-shimmer">
              <Award className="h-4 w-4" />
              🏆 Plano Pet Gold - Acesso Completo ao Sistema
            </div>

            {/* Main headline */}
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
              Tenha Acesso Completo ao{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent animate-gradient">
                  Sistema Bointhosa Pet
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 rounded-full" />
              </span>
            </h1>

            {/* Price Highlight */}
            <div className="inline-block bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-2 border-yellow-500/30 rounded-2xl p-6 animate-pulse-glow">
              <p className="text-sm text-muted-foreground mb-2">Investimento mensal:</p>
              <p className="text-5xl font-black">
                <span className="text-yellow-600 dark:text-yellow-500">R$ 79</span>
                <span className="text-3xl text-muted-foreground">,90</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">💳 Pagamento único via Cakto</p>
            </div>

            {/* Subheadline */}
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Acesso imediato e completo ao sistema profissional de gestão veterinária. 
              <span className="text-foreground font-semibold"> Gerencie agendamentos, consultas, estoque, finanças</span> e muito mais em uma única plataforma.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="https://pay.cakto.com.br/f72gob9_634441" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full text-lg px-10 py-7 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 hover:shadow-2xl hover:scale-[1.05] transition-all duration-300 font-bold group shadow-xl text-white"
                >
                  🏆 Garantir Acesso Agora - R$ 79,90
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </a>
              <a href="#detalhes-plano" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full text-lg px-10 py-7 border-2 hover:bg-accent hover:scale-[1.05] transition-all duration-300 font-semibold"
                >
                  Ver Mais Detalhes
                </Button>
              </a>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 via-amber-500/30 to-yellow-500/30 rounded-3xl blur-3xl animate-pulse" />
            <img
              src={heroImage}
              alt="Sistema de gestão Bointhosa Pet - Plano Pet Gold"
              className="relative rounded-3xl shadow-2xl w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700 border-4 border-white/10"
              loading="eager"
              width="800"
              height="600"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
