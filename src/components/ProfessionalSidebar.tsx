import { NavLink } from "react-router-dom";
import { Home, Calendar, Scissors, Users, BarChart3, User, CreditCard, LogOut, Building2, LayoutDashboard, Database } from "lucide-react";
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
import { useTenant } from "@/lib/tenant-context";
import { usePlanTheme } from "@/hooks/usePlanTheme";
import { Separator } from "@/components/ui/separator";

const professionalMenuItems = [
  { title: "Dashboard", url: "/professional/dashboard", icon: Home },
  { title: "Calendário", url: "/professional/calendar", icon: Calendar },
  { title: "Serviços", url: "/professional/services", icon: Scissors },
  { title: "Clientes", url: "/professional/clients", icon: Users },
  { title: "Relatórios", url: "/professional/reports", icon: BarChart3 },
  { title: "Backup", url: "/professional/backup", icon: Database },
  { title: "Plano", url: "/professional/plans", icon: CreditCard },
  { title: "Perfil", url: "/professional/profile", icon: User },
];

const multiUnitMenuItems = [
  { title: "Dashboard Consolidado", url: "/multi-unit/dashboard", icon: LayoutDashboard },
  { title: "Gestão de Unidades", url: "/multi-unit/management", icon: Building2 },
];

export function ProfessionalSidebar() {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const { can, tenantId } = useTenant();
  const planTheme = usePlanTheme();
  const isCollapsed = state === "collapsed";
  
  // Show multi-unit menu if user has tenant access
  const showMultiUnit = tenantId && (can('view_consolidated') || can('manage_units'));

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border">
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-bold text-lg px-4 py-3">
            {!isCollapsed && "EasyPet"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {professionalMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) => {
                        let baseClass = "flex items-center gap-3 px-4 py-3 rounded-lg transition-all";
                        
                        if (isActive && planTheme.plan !== 'free') {
                          // Aplicar cores do plano para item ativo
                          baseClass += ` ${planTheme.badgeClass} font-medium shadow-sm`;
                        } else if (isActive) {
                          // Cores padrão para item ativo (plano free)
                          baseClass += " bg-primary text-primary-foreground font-medium shadow-sm";
                        } else {
                          baseClass += " hover:bg-muted text-muted-foreground hover:text-foreground";
                        }
                        
                        return baseClass;
                      }}
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
        
        {/* Multi-Unit Management Section */}
        {showMultiUnit && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground px-4 py-2">
                {!isCollapsed && "Multi-Unidades"}
              </SidebarGroupLabel>
              
              <SidebarGroupContent>
                <SidebarMenu>
                  {multiUnitMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end
                          className={({ isActive }) => {
                            let baseClass = "flex items-center gap-3 px-4 py-3 rounded-lg transition-all";
                            
                            if (isActive && planTheme.plan !== 'free') {
                              baseClass += ` ${planTheme.badgeClass} font-medium shadow-sm`;
                            } else if (isActive) {
                              baseClass += " bg-primary text-primary-foreground font-medium shadow-sm";
                            } else {
                              baseClass += " hover:bg-muted text-muted-foreground hover:text-foreground";
                            }
                            
                            return baseClass;
                          }}
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
          </>
        )}
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
