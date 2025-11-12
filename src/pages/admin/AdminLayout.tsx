import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SecurityNotificationsPanel } from "@/components/admin/SecurityNotificationsPanel";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/easypet-logo.png";

export default function AdminLayout() {
  const { userRole } = useAuth();

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Fixed Header */}
          <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="flex items-center gap-3 flex-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                  <img 
                    src={logo} 
                    alt="EasyPet Logo" 
                    className="h-8 w-auto relative drop-shadow-[0_0_8px_rgba(0,200,150,0.4)] hover:scale-110 transition-transform duration-300 object-contain"
                  />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Painel Administrativo</h1>
                <Badge variant="default" className="bg-primary/10 text-primary">Admin</Badge>
                <Badge variant="destructive" className="animate-pulse">
                  <Zap className="h-3 w-3 mr-1" />
                  MODO DEUS
                </Badge>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>

        {/* Real-time Security Notifications (only for admins) */}
        {userRole === 'admin' && <SecurityNotificationsPanel />}
      </div>
    </SidebarProvider>
  );
}
