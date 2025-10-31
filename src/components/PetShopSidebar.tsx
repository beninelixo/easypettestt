import { NavLink, useLocation } from "react-router-dom";
import { Home, Users, Calendar, TrendingUp, Settings, LogOut, Scissors, BookOpen, Package, DollarSign, Star, Megaphone } from "lucide-react";
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
  { title: "Dashboard", url: "/petshop-dashboard", icon: Home },
  { title: "Serviços", url: "/petshop-dashboard/servicos", icon: Scissors },
  { title: "Catálogo de Serviços", url: "/petshop-dashboard/catalogo-servicos", icon: BookOpen },
  { title: "Clientes", url: "/petshop-dashboard/clientes", icon: Users },
  { title: "Calendário", url: "/petshop-dashboard/calendario", icon: Calendar },
  { title: "Estoque", url: "/petshop-dashboard/estoque", icon: Package },
  { title: "Financeiro", url: "/petshop-dashboard/financeiro", icon: DollarSign },
  { title: "Fidelidade", url: "/petshop-dashboard/fidelidade", icon: Star },
  { title: "Marketing", url: "/petshop-dashboard/marketing", icon: Megaphone },
  { title: "Relatórios", url: "/petshop-dashboard/relatorios", icon: TrendingUp },
  { title: "Configurações", url: "/petshop-dashboard/configuracoes", icon: Settings },
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
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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
