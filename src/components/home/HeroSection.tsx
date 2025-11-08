import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/hero-petshop.jpg";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 animate-gradient" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold text-sm">
              🐾 Sistema Completo para Pet Shops, Banho & Tosa e Clínicas
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              Transforme Seu{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Negócio Pet
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Sistema completo de gestão para seu pet shop, banho e tosa ou clínica veterinária. 
              Agendamento inteligente, gestão financeira, controle de estoque e muito mais.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/pricing">
                <Button 
                  size="lg" 
                  className="text-xl px-12 py-8 shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:-translate-y-1 group w-full sm:w-auto"
                >
                  Ver Planos e Preços
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Link to="/system-overview">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-xl px-12 py-8 border-2 hover:bg-primary/5 w-full sm:w-auto"
                >
                  Conhecer o Sistema
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">+2.500 usuários ativos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">+650 cidades</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">4.8/5 estrelas</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:h-[600px] animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl" />
            <img
              src={heroImage}
              alt="Sistema Easy Pet em ação"
              className="rounded-3xl shadow-2xl object-cover w-full h-full border-4 border-primary/10"
            />
            
            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-background rounded-2xl p-6 shadow-2xl border-2 border-primary/20 animate-scale-in">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-black">2.500+</p>
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
