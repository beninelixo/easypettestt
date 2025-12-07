import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ClientSidebar } from "@/components/ClientSidebar";
import { InteractiveOnboarding } from "@/components/onboarding/InteractiveOnboarding";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { useIsMobile } from "@/utils/breakpoints";
import logo from "@/assets/easypet-logo.png";

const ClientLayout = () => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full">
        <ClientSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className={`border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center gap-2 ${isMobile ? 'h-14 px-3' : 'h-16 px-4'}`}>
            <SidebarTrigger />
            <div className="flex items-center gap-2 flex-1">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                <img 
                  src={logo} 
                  alt="EasyPet Logo" 
                  className={`relative drop-shadow-[0_0_8px_rgba(0,200,150,0.4)] hover:scale-110 transition-transform duration-300 object-contain ${isMobile ? 'h-6' : 'h-8'} w-auto`}
                />
              </div>
              <span className={`font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ${isMobile ? 'text-base' : 'text-lg'}`}>
                Área do Cliente
              </span>
            </div>
          </header>

          {/* Main Content - Add padding bottom for mobile nav */}
          <main className={`flex-1 bg-background pb-20 lg:pb-0 ${isMobile ? 'p-3' : 'p-6'}`}>
            <InteractiveOnboarding role="client" />
            <Outlet />
          </main>
          
          {/* Mobile Bottom Navigation */}
          <MobileBottomNav variant="client" />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ClientLayout;