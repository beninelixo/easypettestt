import { 
  Home, Activity, Shield, Lock, Users, Settings, LogOut, 
  Database, Bell, Image, Download, Gauge, ScrollText, 
  History, TestTube, Webhook, TrendingUp, Zap, Brain,
  FileText, AlertTriangle, Trophy
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
import { Badge } from "@/components/ui/badge";

// Sistema - Monitoramento e Manutenção
const systemItems = [
  { title: "Saúde do Sistema", url: "/admin/system-health", icon: Activity },
  { title: "AI Monitor & Análise", url: "/admin/system-analysis", icon: Brain },
  { title: "Manutenção", url: "/admin/maintenance", icon: Gauge, badge: "AUTO" },
  { title: "Performance", url: "/admin/performance", icon: TrendingUp },
  { title: "Diagnósticos", url: "/admin/system-diagnostics", icon: ScrollText },
];

// Segurança
const securityItems = [
  { title: "Segurança", url: "/admin/security", icon: Shield },
  { title: "Auth & Logins", url: "/admin/auth-monitoring", icon: Lock },
  { title: "IP Whitelist", url: "/admin/ip-whitelist", icon: History },
  { title: "Backups", url: "/admin/backups", icon: Database },
  { title: "Audit Logs", url: "/admin/audit-logs", icon: FileText },
];

// Usuários
const userItems = [
  { title: "Gerenciar Usuários", url: "/admin/user-management", icon: Users },
  { title: "Analytics de Usuários", url: "/admin/user-analytics", icon: TrendingUp },
];

// Configurações
const settingsItems = [
  { title: "Notificações", url: "/admin/notification-preferences", icon: Bell },
  { title: "Webhooks", url: "/admin/webhooks", icon: Webhook },
  { title: "Imagens (Site & Blog)", url: "/admin/images", icon: Image },
  { title: "Exportar Dados", url: "/admin/data-export", icon: Download },
  { title: "Teste de Conexão", url: "/admin/connection-test", icon: TestTube },
];

// Gestão de Conteúdo e Jobs
const contentItems = [
  { title: "Success Stories", url: "/admin/success-stories", icon: Trophy },
  { title: "Jobs Falhos", url: "/admin/failed-jobs", icon: AlertTriangle },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { signOut, isGodUser } = useAuth();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const renderMenuItems = (items: typeof systemItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.url}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-sm">{item.title}</span>
                  {item.badge && <Badge variant="secondary" className="text-xs">{item.badge}</Badge>}
                </>
              )}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar className={`${isCollapsed ? "w-14" : "w-64"} z-50 bg-card`} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border z-50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-bold text-lg px-4 py-3">
            {!isCollapsed && "EasyPet Admin"}
          </SidebarGroupLabel>

          {/* Dashboard Principal */}
          <SidebarGroupContent className="mb-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground font-medium shadow-sm"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`
                    }
                  >
                    <Home className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>

          {/* God Mode - Only for God User */}
          {isGodUser && (
            <SidebarGroupContent className="mb-2">
              {!isCollapsed && <SidebarGroupLabel className="text-xs text-destructive px-4 py-2">🔥 Modo Deus</SidebarGroupLabel>}
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin/god-mode"
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? "bg-destructive text-destructive-foreground font-medium shadow-sm"
                            : "hover:bg-destructive/10 text-destructive hover:text-destructive"
                        }`
                      }
                    >
                      <Zap className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">God Mode</span>
                          <Badge variant="destructive" className="text-xs animate-pulse">DEUS</Badge>
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          )}

          {/* Sistema */}
          <SidebarGroupContent className="mb-2">
            {!isCollapsed && <SidebarGroupLabel className="text-xs text-muted-foreground px-4 py-2">📊 Sistema</SidebarGroupLabel>}
            {renderMenuItems(systemItems)}
          </SidebarGroupContent>

          {/* Segurança */}
          <SidebarGroupContent className="mb-2">
            {!isCollapsed && <SidebarGroupLabel className="text-xs text-muted-foreground px-4 py-2">🛡️ Segurança</SidebarGroupLabel>}
            {renderMenuItems(securityItems)}
          </SidebarGroupContent>

          {/* Usuários */}
          <SidebarGroupContent className="mb-2">
            {!isCollapsed && <SidebarGroupLabel className="text-xs text-muted-foreground px-4 py-2">👥 Usuários</SidebarGroupLabel>}
            {renderMenuItems(userItems)}
          </SidebarGroupContent>

          {/* Configurações */}
          <SidebarGroupContent className="mb-2">
            {!isCollapsed && <SidebarGroupLabel className="text-xs text-muted-foreground px-4 py-2">⚙️ Configurações</SidebarGroupLabel>}
            {renderMenuItems(settingsItems)}
          </SidebarGroupContent>

          {/* Gestão de Conteúdo */}
          <SidebarGroupContent className="mb-2">
            {!isCollapsed && <SidebarGroupLabel className="text-xs text-muted-foreground px-4 py-2">📋 Gestão</SidebarGroupLabel>}
            {renderMenuItems(contentItems)}
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
