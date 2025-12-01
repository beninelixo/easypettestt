import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProfessionalSidebar } from "@/components/ProfessionalSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import logo from "@/assets/easypet-logo.png";
import { usePlanTheme } from "@/hooks/usePlanTheme";
import { Crown, Gem, Bell, Search, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const ProfessionalLayout = () => {
  const planTheme = usePlanTheme();

  const getPlanIcon = () => {
    switch (planTheme.plan) {
      case "gold":
        return <Crown className="h-3.5 w-3.5" />;
      case "platinum":
        return <Gem className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  const getPlanLabel = () => {
    switch (planTheme.plan) {
      case "gold":
        return "Gold";
      case "platinum":
        return "Platinum";
      default:
        return "Free";
    }
  };

  const getPlanBadgeClass = () => {
    switch (planTheme.plan) {
      case "gold":
        return "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30";
      case "platinum":
        return "bg-gradient-to-r from-slate-400/20 to-slate-300/20 text-slate-300 border-slate-400/30";
      default:
        return "bg-muted/50 text-muted-foreground border-border/50";
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <ProfessionalSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Premium Header */}
          <header className="sticky top-0 z-40 h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
              {/* Left Section */}
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                
                <div className="hidden lg:flex items-center gap-3">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <img 
                      src={logo} 
                      alt="EasyPet Logo" 
                      className="h-9 w-auto relative hover:scale-105 transition-transform duration-300 object-contain"
                    />
                  </div>
                  <div className="h-6 w-px bg-border/50" />
                  <span className="font-semibold text-foreground/90">
                    Área Profissional
                  </span>
                </div>
              </div>

              {/* Center - Search (Desktop) */}
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar clientes, serviços..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/50 border border-border/50 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2 lg:gap-3">
                {planTheme.plan !== "free" && (
                  <Badge 
                    variant="outline"
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getPlanBadgeClass()}`}
                  >
                    {getPlanIcon()}
                    {getPlanLabel()}
                  </Badge>
                )}

                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative rounded-xl hover:bg-muted/50"
                >
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                </Button>

                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProfessionalLayout;
