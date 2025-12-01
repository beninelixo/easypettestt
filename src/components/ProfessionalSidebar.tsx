import { NavLink } from "react-router-dom";
import { 
  Calendar, Scissors, Users, LogOut, Building2, 
  LayoutDashboard, Settings, ChevronRight, Sparkles, Moon, Sun,
  PanelLeftClose, PanelLeft
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/lib/tenant-context";
import { usePlanTheme } from "@/hooks/usePlanTheme";
import { useTheme } from "@/hooks/useTheme";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/easypet-logo.png";

const professionalMenuItems = [
  { 
    title: "Serviços", 
    url: "/professional/services", 
    icon: Scissors,
    gradient: "from-emerald-500 to-green-600"
  },
  { 
    title: "Calendário", 
    url: "/professional/calendar", 
    icon: Calendar,
    gradient: "from-violet-500 to-purple-600"
  },
  { 
    title: "Clientes", 
    url: "/professional/clients", 
    icon: Users,
    gradient: "from-amber-500 to-orange-600"
  },
  { 
    title: "Configurações", 
    url: "/professional/settings", 
    icon: Settings,
    gradient: "from-slate-500 to-slate-600"
  },
];

const multiUnitMenuItems = [
  { 
    title: "Dashboard Consolidado", 
    url: "/multi-unit/dashboard", 
    icon: LayoutDashboard,
    gradient: "from-indigo-500 to-blue-600"
  },
  { 
    title: "Gestão de Unidades", 
    url: "/multi-unit/management", 
    icon: Building2,
    gradient: "from-teal-500 to-cyan-600"
  },
];

export function ProfessionalSidebar() {
  const { state } = useSidebar();
  const { signOut, user } = useAuth();
  const { can, tenantId } = useTenant();
  const planTheme = usePlanTheme();
  const { theme, toggleTheme } = useTheme();
  const isCollapsed = state === "collapsed";
  
  const showMultiUnit = tenantId && (can('view_consolidated') || can('manage_units'));

  return (
    <Sidebar 
      className={isCollapsed ? "w-[70px]" : "w-72"} 
      collapsible="icon"
    >
      <SidebarContent className="bg-gradient-to-b from-card via-card to-card/95 border-r border-border/50 overflow-hidden scrollbar-hide">
        {/* Logo Section with Toggle */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center py-5' : 'justify-between px-5 py-6'}`}>
          <div className={`flex items-center ${isCollapsed ? '' : 'gap-3'}`}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/50">
                <img 
                  src={logo} 
                  alt="EasyPet" 
                  className="h-8 w-8 object-contain"
                />
              </div>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  EasyPet
                </h1>
                <p className="text-xs text-muted-foreground">Área Profissional</p>
              </div>
            )}
          </div>
          
          {/* Desktop Toggle Button */}
          <SidebarTrigger className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted/60 transition-all text-muted-foreground hover:text-foreground">
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </SidebarTrigger>
        </div>

        <Separator className="mx-4 bg-border/50" />

        {/* Main Menu */}
        <SidebarGroup className="px-3 py-4">
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs text-muted-foreground/70 uppercase tracking-wider font-medium px-3 mb-2">
              Menu Principal
            </SidebarGroupLabel>
          )}
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {professionalMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => {
                        const baseClass = `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`;
                        
                        if (isActive) {
                          return `${baseClass} bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-primary/20`;
                        }
                        
                        return `${baseClass} hover:bg-muted/60 text-muted-foreground hover:text-foreground`;
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`flex items-center justify-center ${isCollapsed ? '' : 'w-9 h-9'} rounded-lg ${isActive ? 'bg-white/20' : `bg-gradient-to-br ${item.gradient}/10`} transition-all group-hover:scale-105`}>
                            <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                          </div>
                          {!isCollapsed && (
                            <>
                              <span className="font-medium flex-1">{item.title}</span>
                              <ChevronRight className={`h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${isActive ? 'text-white/70' : 'text-muted-foreground'}`} />
                            </>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Multi-Unit Section */}
        {showMultiUnit && (
          <>
            <Separator className="mx-4 bg-border/50" />
            <SidebarGroup className="px-3 py-4">
              {!isCollapsed && (
                <SidebarGroupLabel className="text-xs text-muted-foreground/70 uppercase tracking-wider font-medium px-3 mb-2 flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  Multi-Unidades
                </SidebarGroupLabel>
              )}
              
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {multiUnitMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={({ isActive }) => {
                            const baseClass = `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`;
                            
                            if (isActive) {
                              return `${baseClass} bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-primary/20`;
                            }
                            
                            return `${baseClass} hover:bg-muted/60 text-muted-foreground hover:text-foreground`;
                          }}
                        >
                          {({ isActive }) => (
                            <>
                              <div className={`flex items-center justify-center ${isCollapsed ? '' : 'w-9 h-9'} rounded-lg ${isActive ? 'bg-white/20' : `bg-gradient-to-br ${item.gradient}/10`} transition-all group-hover:scale-105`}>
                                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                              </div>
                              {!isCollapsed && (
                                <>
                                  <span className="font-medium flex-1">{item.title}</span>
                                  <ChevronRight className={`h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${isActive ? 'text-white/70' : 'text-muted-foreground'}`} />
                                </>
                              )}
                            </>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Upgrade Banner */}
        {!isCollapsed && planTheme.plan === 'free' && (
          <div className="mx-4 mb-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 p-4 border border-primary/20">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/30 to-transparent rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Upgrade Pro</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Desbloqueie recursos avançados
                </p>
                <Button 
                  size="sm" 
                  className="w-full rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                >
                  Ver Planos
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Separador antes dos botões de ação */}
        <Separator className="mx-4 bg-border/50" />

        {/* Tema e Sair - DENTRO do SidebarContent */}
        <div className="px-3 pb-4 pt-2 space-y-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3'} text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-all`}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {!isCollapsed && <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
          </Button>
          
          {/* Logout */}
          <Button
            variant="ghost"
            onClick={signOut}
            className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3'} text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all`}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Sair</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
