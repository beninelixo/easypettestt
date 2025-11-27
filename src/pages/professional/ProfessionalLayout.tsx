import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProfessionalSidebar } from "@/components/ProfessionalSidebar";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/easypet-logo.png";
import { usePlanTheme } from "@/hooks/usePlanTheme";
import { Crown, Gem } from "lucide-react";

const ProfessionalLayout = () => {
  const planTheme = usePlanTheme();

  const getPlanIcon = () => {
    switch (planTheme.plan) {
      case "gold":
        return <Crown className="h-4 w-4" />;
      case "platinum":
        return <Gem className="h-4 w-4" />;
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

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full">
        <ProfessionalSidebar />
        
        <div className="flex-1 flex flex-col">
          <header 
            className={`h-16 border-b ${planTheme.borderClass} bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center px-4 gap-2 ${planTheme.glowClass}`}
          >
            <SidebarTrigger />
            <div className="flex items-center gap-3 flex-1">
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${planTheme.gradientClass} rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-500`} />
                <img 
                  src={logo} 
                  alt="EasyPet Logo" 
                  className="h-8 w-auto relative hover:scale-110 transition-transform duration-300 object-contain"
                  style={{
                    filter: `drop-shadow(0 0 8px ${planTheme.primaryColor})`
                  }}
                />
              </div>
              <span className={`font-bold text-lg bg-gradient-to-r ${planTheme.gradientClass} bg-clip-text text-transparent`}>
                Área Profissional
              </span>
              
              {planTheme.plan !== "free" && (
                <Badge className={`${planTheme.badgeClass} border flex items-center gap-1`}>
                  {getPlanIcon()}
                  {getPlanLabel()}
                </Badge>
              )}
            </div>
          </header>

          <main className="flex-1 p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProfessionalLayout;
