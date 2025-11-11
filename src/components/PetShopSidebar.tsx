import { NavLink, useLocation } from "react-router-dom";
import { Home, Users, Calendar, TrendingUp, Settings, LogOut, Scissors, BookOpen, Package, DollarSign, Star, Megaphone, UserCog, MessageSquare, BarChart3 } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const navigationItems = [
  { title: "Dashboard", url: "/petshop-dashboard", icon: Home, tourId: undefined },
  { title: "Serviços", url: "/petshop-dashboard/servicos", icon: Scissors, tourId: "services-menu" },
  { title: "Catálogo de Serviços", url: "/petshop-dashboard/service-templates", icon: BookOpen, tourId: "catalog-menu", badge: "61" },
  { title: "WhatsApp", url: "/petshop-dashboard/whatsapp", icon: MessageSquare, tourId: undefined },
  { title: "Analytics", url: "/petshop-dashboard/analytics", icon: BarChart3, tourId: "analytics-menu" },
  { title: "Clientes", url: "/petshop-dashboard/clientes", icon: Users, tourId: "clients-menu" },
  { title: "Funcionários", url: "/petshop-dashboard/funcionarios", icon: UserCog, tourId: undefined },
  { title: "Calendário", url: "/petshop-dashboard/calendario", icon: Calendar, tourId: "calendar-menu" },
  { title: "Estoque", url: "/petshop-dashboard/estoque", icon: Package, tourId: undefined },
  { title: "Financeiro", url: "/petshop-dashboard/financeiro", icon: DollarSign, tourId: undefined },
  { title: "Fidelidade", url: "/petshop-dashboard/fidelidade", icon: Star, tourId: undefined },
  { title: "Marketing", url: "/petshop-dashboard/marketing", icon: Megaphone, tourId: undefined },
  { title: "Relatórios", url: "/petshop-dashboard/relatorios", icon: TrendingUp, tourId: undefined },
  { title: "Configurações", url: "/petshop-dashboard/configuracoes", icon: Settings, tourId: "settings-menu" },
];

export function PetShopSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                      data-tour={item.tourId}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <span className="flex items-center gap-2 flex-1">
                          {item.title}
                          {item.badge && (
                            <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                              {item.badge}
                            </span>
                          )}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span>Sair</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
