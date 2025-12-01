import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ProfessionalSidebar } from "@/components/ProfessionalSidebar";
import { Menu, PanelLeft, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/easypet-logo.png";

// Desktop toggle button component
const DesktopSidebarToggle = () => {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="hidden lg:flex fixed top-4 left-4 z-50 h-10 w-10 rounded-xl bg-card/90 backdrop-blur-sm border border-border/50 hover:bg-muted shadow-sm transition-all"
    >
      {isCollapsed ? (
        <PanelLeft className="h-5 w-5 text-muted-foreground" />
      ) : (
        <PanelLeftClose className="h-5 w-5 text-muted-foreground" />
      )}
    </Button>
  );
};

const ProfessionalLayout = () => {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <ProfessionalSidebar />
        
        {/* Desktop Sidebar Toggle */}
        <DesktopSidebarToggle />
        
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
