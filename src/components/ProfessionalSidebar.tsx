import { NavLink } from "react-router-dom";
import { Home, Calendar, Scissors, Users, BarChart3, User, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const professionalMenuItems = [
  { title: "Dashboard", url: "/professional/dashboard", icon: Home },
  { title: "Calendário", url: "/professional/calendar", icon: Calendar },
  { title: "Serviços", url: "/professional/services", icon: Scissors },
  { title: "Clientes", url: "/professional/clients", icon: Users },
  { title: "Relatórios", url: "/professional/reports", icon: BarChart3 },
  { title: "Perfil", url: "/professional/profile", icon: User },
];

export function ProfessionalSidebar() {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border">
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-bold text-lg px-4 py-3">
            {!isCollapsed && "PetChopShop"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {professionalMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground font-medium shadow-sm"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border bg-card p-4">
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
