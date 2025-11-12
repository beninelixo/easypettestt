import { 
  Home, Zap, Activity, Brain, Shield, Lock, FileText, Mail, 
  Globe, Bell, Monitor, Award, Image, LogOut, ChevronDown, Gauge, ScrollText, UserCheck, History, BarChart, TestTube
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const godModeItems = [
  { title: "God Mode", url: "/admin/god-mode", icon: Zap, badge: "DEUS", badgeColor: "destructive" as const },
];

const monitoringItems = [
  { title: "System Monitoring", url: "/admin/system-monitoring", icon: Monitor },
  { title: "System Analysis", url: "/admin/system-analysis", icon: Brain, badge: "IA" },
  { title: "Auth Monitoring", url: "/admin/auth-monitoring", icon: Shield },
  { title: "System Health", url: "/admin/system-health", icon: Activity, badge: "NEW" },
  { title: "System Diagnostics", url: "/admin/system-diagnostics", icon: FileText },
  { title: "AI Monitor", url: "/admin/ai-monitor", icon: Brain, badge: "AUTO" },
];

const securityItems = [
  { title: "Security Dashboard", url: "/admin/security", icon: Shield },
  { title: "Security Monitoring", url: "/admin/security-monitoring", icon: Lock },
  { title: "IP Whitelist", url: "/admin/ip-whitelist", icon: UserCheck, badge: "NEW" },
  { title: "Login History", url: "/admin/login-history", icon: History, badge: "NEW" },
  { title: "Backup Management", url: "/admin/backups", icon: FileText },
  { title: "Audit Logs", url: "/admin/audit-logs", icon: ScrollText },
];

const settingsItems = [
  { title: "Performance Dashboard", url: "/admin/performance", icon: Gauge, badge: "NEW" },
  { title: "Error Logs", url: "/admin/error-logs", icon: ScrollText, badge: "NEW" },
  { title: "Email System Test", url: "/admin/email-test", icon: TestTube },
  { title: "Email Analytics", url: "/admin/email-analytics", icon: BarChart, badge: "NEW" },
  { title: "Resend Domain Setup", url: "/admin/domain-setup", icon: Globe },
  { title: "Loops Domain Setup", url: "/admin/loops-domain-setup", icon: Mail, badge: "NEW" },
  { title: "Notification Queue", url: "/admin/notifications", icon: Bell },
  { title: "System Monitor", url: "/admin/monitor", icon: Monitor },
  { title: "Success Stories", url: "/admin/success-stories", icon: Award },
  { title: "Regenerate Images", url: "/admin/regenerate-images", icon: Image },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border">
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

          {/* Modo Deus */}
          <SidebarGroupContent className="mb-2">
            {!isCollapsed && <SidebarGroupLabel className="text-xs text-muted-foreground px-4 py-2">🔥 Modo Deus</SidebarGroupLabel>}
            <SidebarMenu>
              {godModeItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? "bg-destructive text-destructive-foreground font-medium shadow-sm"
                            : "hover:bg-destructive/10 text-destructive hover:text-destructive"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          <Badge variant={item.badgeColor} className="text-xs">{item.badge}</Badge>
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>

          {/* Monitoramento */}
          <SidebarGroupContent className="mb-2">
            {!isCollapsed && <SidebarGroupLabel className="text-xs text-muted-foreground px-4 py-2">📊 Monitoramento</SidebarGroupLabel>}
            <SidebarMenu>
              {monitoringItems.map((item) => (
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
          </SidebarGroupContent>

          {/* Segurança */}
          <SidebarGroupContent className="mb-2">
            {!isCollapsed && <SidebarGroupLabel className="text-xs text-muted-foreground px-4 py-2">🛡️ Segurança</SidebarGroupLabel>}
            <SidebarMenu>
              {securityItems.map((item) => (
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
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>

          {/* Configurações */}
          <SidebarGroupContent className="mb-2">
            {!isCollapsed && <SidebarGroupLabel className="text-xs text-muted-foreground px-4 py-2">⚙️ Configurações</SidebarGroupLabel>}
            <SidebarMenu>
              {settingsItems.map((item) => (
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
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
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
