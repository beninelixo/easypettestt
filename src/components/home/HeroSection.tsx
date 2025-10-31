import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import heroPetShop from "@/assets/hero-petshop.jpg";

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-24 px-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-background" />
      <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-full text-primary text-sm font-semibold border border-primary/20 shadow-lg animate-shimmer">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              A Solução Completa para o Seu Negócio Pet
            </div>

            {/* Main headline */}
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
              Sistema Completo para{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                  Clínicas, Pet Shops e Banho & Tosa
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-full" />
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Gerencie agendamentos, consultas, vendas, estoque e finanças em uma única plataforma. 
              Perfeito para clínicas veterinárias, pet shops e serviços de banho e tosa.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-3" role="list">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium" role="listitem">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" aria-hidden="true" />
                Teste grátis por 14 dias
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium" role="listitem">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" aria-hidden="true" />
                Sem cartão de crédito
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium" role="listitem">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" aria-hidden="true" />
                Cancele quando quiser
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full text-lg px-12 py-7 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-white shadow-2xl hover:shadow-purple animate-pulse-glow group font-bold"
                  aria-label="Iniciar teste grátis de 14 dias com desconto exclusivo"
                >
                  Iniciar Teste Grátis + Desconto Exclusivo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/pricing" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full text-lg px-12 py-7 border-2 border-primary hover:bg-primary/5 hover:scale-[1.02] transition-all duration-300 font-semibold"
                  aria-label="Ver planos e preços disponíveis"
                >
                  Ver Planos
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-3xl blur-3xl animate-pulse" aria-hidden="true" />
            <img
              src={heroPetShop}
              alt="Sistema de gestão para pet shops, clínicas veterinárias e banho e tosa - interface moderna e profissional"
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
