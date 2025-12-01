import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProfessionalSidebar } from "@/components/ProfessionalSidebar";
import { Menu } from "lucide-react";
import logo from "@/assets/easypet-logo.png";

const ProfessionalLayout = () => {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <ProfessionalSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header Only */}
          <header className="lg:hidden sticky top-0 z-40 h-14 border-b border-border/50 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between h-full px-4">
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <img 
                src={logo} 
                alt="EasyPet" 
                className="h-8 w-auto object-contain"
              />
              <div className="w-5" />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProfessionalLayout;
