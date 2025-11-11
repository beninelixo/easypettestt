import { Home, Users, Calendar, Store, CreditCard, BarChart3, Settings, LogOut, Shield } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/lib/tenant-context";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/petshop-dashboard", icon: Home, roles: ["pet_shop", "admin"] },
  { title: "Clientes", url: "/petshop-dashboard/clientes", icon: Users, roles: ["pet_shop", "admin"] },
  { title: "Agendamentos", url: "/petshop-dashboard/calendario", icon: Calendar, roles: ["pet_shop", "admin"] },
  { title: "Petshops", url: "/petshops", icon: Store, roles: ["admin"] },
  { title: "Pagamentos", url: "/petshop-dashboard/financeiro", icon: CreditCard, roles: ["pet_shop", "admin"] },
  { title: "Relatórios", url: "/petshop-dashboard/relatorios", icon: BarChart3, roles: ["pet_shop", "admin"] },
  { title: "Configurações", url: "/petshop-dashboard/configuracoes", icon: Settings, roles: ["pet_shop", "admin"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { userRole } = useAuth();
  const { userRole: tenantRole } = useTenant();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const effectiveRole = tenantRole || userRole;
  const isCollapsed = state === "collapsed";
  
  const filteredItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(effectiveRole as string)
  );

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border">
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-bold text-lg px-4 py-3">
            {!isCollapsed && "EasyPet"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
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
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
