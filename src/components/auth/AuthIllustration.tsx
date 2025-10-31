import { PawPrint } from "lucide-react";

export const AuthIllustration = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main illustration */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-2xl opacity-50 animate-pulse-glow" />
          <div className="relative bg-gradient-to-br from-primary to-secondary p-12 rounded-3xl shadow-2xl">
            <PawPrint className="h-32 w-32 text-white" />
          </div>
        </div>
        
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Bointhosa Pet System
          </h2>
          <p className="text-muted-foreground text-lg">
            A solução completa para gestão profissional de clínicas veterinárias, pet shops e banho & tosa
          </p>
          <div className="flex items-center justify-center gap-8 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Clientes</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">50k+</div>
              <div className="text-sm text-muted-foreground">Agendamentos</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-sm text-muted-foreground">Suporte</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
