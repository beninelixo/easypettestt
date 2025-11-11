import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ClientSidebar } from "@/components/ClientSidebar";
import { PawPrint } from "lucide-react";
import { InteractiveOnboarding } from "@/components/onboarding/InteractiveOnboarding";

const ClientLayout = () => {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full">
        <ClientSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center px-4 gap-2">
            <SidebarTrigger />
            <div className="flex items-center gap-2 flex-1">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Área do Cliente</span>
            </div>
          </header>

          <main className="flex-1 p-6 bg-background">
            <InteractiveOnboarding role="client" />
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ClientLayout;