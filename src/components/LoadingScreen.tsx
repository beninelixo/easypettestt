import { useEffect, useState } from "react";
import logo from "@/assets/easypet-logo.png";

export const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hideLoading = () => setIsVisible(false);
    
    // Se a página já carregou, esconder rapidamente
    if (document.readyState === 'complete') {
      const timer = setTimeout(hideLoading, 300);
      return () => clearTimeout(timer);
    }
    
    // Esconder quando a página terminar de carregar
    const handleLoad = () => setTimeout(hideLoading, 300);
    window.addEventListener('load', handleLoad);
    
    // Fallback máximo de 800ms (reduzido de 2000ms)
    const fallbackTimer = setTimeout(hideLoading, 800);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 animate-fade-in">
      {/* Simplified background - reduced animations for performance */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Logo with minimal animations */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative">
          {/* Glow effect - simplified */}
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl scale-150" />
          
          {/* Logo container */}
          <div className="relative bg-card/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-border/50">
            <img 
              src={logo} 
              alt="EasyPet Logo" 
              className="h-24 w-auto drop-shadow-lg object-contain"
            />
          </div>
        </div>
        
        {/* Brand name */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-primary">
            EasyPet
          </h1>
          <p className="text-muted-foreground text-sm">
            Carregando...
          </p>
        </div>

        {/* Simple loading bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-primary to-secondary animate-shimmer bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
};
