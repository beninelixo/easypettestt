import { useEffect, useState } from "react";
import logo from "@/assets/easypet-logo.png";

export const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide loading screen after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 animate-fade-in">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Logo with animations */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative group">
          {/* Pulsing glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary rounded-full blur-3xl opacity-50 animate-gradient bg-[length:200%_200%] scale-150" />
          
          {/* Logo container */}
          <div className="relative bg-card/80 backdrop-blur-sm p-12 rounded-3xl shadow-2xl border border-border/50">
            <img 
              src={logo} 
              alt="EasyPet Logo" 
              className="h-32 w-auto drop-shadow-[0_0_20px_rgba(0,200,150,0.6)] animate-bounce-subtle object-contain"
            />
          </div>
        </div>
        
        {/* Brand name with gradient */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
            EasyPet
          </h1>
          <p className="text-muted-foreground text-sm animate-pulse">
            Carregando sua experiência...
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary animate-shimmer bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
};
