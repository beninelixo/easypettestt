import { NavLink, useNavigate } from "react-router-dom";
import { 
  Calendar, Scissors, Users, LogOut, Building2, 
  LayoutDashboard, Settings, ChevronRight, Sparkles, Moon, Sun,
  PanelLeftClose, PanelLeft, Lock, BarChart3, HardDrive, Wallet, UserCircle, UserCog
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
import { useSettingsProtection } from "@/hooks/useSettingsProtection";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/easypet-logo.png";

const professionalMenuItems = [
  { 
    title: "Dashboard", 
    url: "/petshop-dashboard", 
    icon: LayoutDashboard,
    gradient: "from-cyan-500 to-blue-600",
    protected: false
  },
  { 
    title: "Serviços", 
    url: "/professional/services", 
    icon: Scissors,
    gradient: "from-emerald-500 to-green-600",
    protected: false
  },
  { 
    title: "Calendário", 
    url: "/professional/calendar", 
    icon: Calendar,
    gradient: "from-violet-500 to-purple-600",
    protected: false
  },
  { 
    title: "Clientes", 
    url: "/professional/clients", 
    icon: Users,
    gradient: "from-amber-500 to-orange-600",
    protected: false
  },
  { 
    title: "Configurações", 
    url: "/professional/settings", 
    icon: Settings,
    gradient: "from-slate-500 to-slate-600",
    protected: true
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

// Protected menu items (visible after settings password) - Unificado e sem duplicatas
const protectedMenuItems = [
  { 
    title: "Funcionários", 
    url: "/professional/employees", 
    icon: UserCog, // Ícone diferenciado
    gradient: "from-violet-500 to-purple-600"
  },
  { 
    title: "Relatórios", 
    url: "/professional/reports", 
    icon: BarChart3,
    gradient: "from-pink-500 to-rose-600"
  },
  { 
    title: "Backup", 
    url: "/professional/backup", 
    icon: HardDrive, // Ícone diferenciado
    gradient: "from-slate-500 to-slate-600"
  },
  { 
    title: "Assinatura & Planos", 
    url: "/professional/billing", 
    icon: Wallet, // Ícone unificado e diferenciado
    gradient: "from-amber-500 to-orange-600"
  },
  { 
    title: "Perfil do Negócio", 
    url: "/professional/profile", 
    icon: UserCircle,
    gradient: "from-cyan-500 to-blue-600"
  },
];

export function ProfessionalSidebar() {
  const { state } = useSidebar();
  const { signOut, user } = useAuth();
  const { can, tenantId } = useTenant();
  const planTheme = usePlanTheme();
  const { theme, toggleTheme } = useTheme();
  const { isUnlocked } = useSettingsProtection();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";
  
  const showMultiUnit = tenantId && (can('view_consolidated') || can('manage_units'));

  return (
    <Sidebar 
      className={isCollapsed ? "w-[70px]" : "w-60"} 
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

        {/* Plan Badge */}
        {!isCollapsed && planTheme.plan !== 'free' && (
          <div className="mx-4 mt-2 mb-4">
            <Badge 
              className={`w-full justify-center py-1.5 text-xs font-semibold ${
                planTheme.plan.includes('gold') 
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-lg shadow-amber-500/25' 
                  : 'bg-gradient-to-r from-slate-400 via-gray-500 to-slate-600 text-white shadow-lg shadow-slate-500/25'
              }`}
            >
              <Sparkles className="h-3 w-3 mr-1.5" />
              {planTheme.planName}
            </Badge>
          </div>
        )}

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
                      aria-label={`Navegar para ${item.title}`}
                      className={({ isActive }) => {
                        const baseClass = `group flex items-center gap-2 px-2 py-2 rounded-xl transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`;
                        
                        if (isActive) {
                          return `${baseClass} bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-primary/20`;
                        }
                        
                        return `${baseClass} hover:bg-muted/60 text-muted-foreground hover:text-foreground`;
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`flex items-center justify-center ${isCollapsed ? '' : 'w-7 h-7'} rounded-lg ${isActive ? 'bg-white/20' : `bg-gradient-to-br ${item.gradient}/10`} transition-all group-hover:scale-105`}>
                            {item.protected && !isUnlocked ? (
                              <Lock className={`h-4 w-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                            ) : (
                              <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
                            )}
                          </div>
                          {!isCollapsed && (
                            <>
                              <span className="font-medium flex-1">{item.title}</span>
                              {item.protected && !isUnlocked && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 border-amber-500/50 text-amber-600 dark:text-amber-400">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Protegido
                                </Badge>
                              )}
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
                          aria-label={`Navegar para ${item.title}`}
                          className={({ isActive }) => {
                            const baseClass = `group flex items-center gap-2 px-2 py-2 rounded-xl transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`;
                            
                            if (isActive) {
                              return `${baseClass} bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-primary/20`;
                            }
                            
                            return `${baseClass} hover:bg-muted/60 text-muted-foreground hover:text-foreground`;
                          }}
                        >
                          {({ isActive }) => (
                            <>
                              <div className={`flex items-center justify-center ${isCollapsed ? '' : 'w-7 h-7'} rounded-lg ${isActive ? 'bg-white/20' : `bg-gradient-to-br ${item.gradient}/10`} transition-all group-hover:scale-105`}>
                                <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
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

        {/* Protected Menus - Visible after settings password */}
        {isUnlocked && (
          <>
            <Separator className="mx-4 bg-border/50" />
            <SidebarGroup className="px-3 py-4">
              {!isCollapsed && (
                <SidebarGroupLabel className="text-xs text-muted-foreground/70 uppercase tracking-wider font-medium px-3 mb-2 flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  Área Protegida
                </SidebarGroupLabel>
              )}
              
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {protectedMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          aria-label={`Navegar para ${item.title}`}
                          className={({ isActive }) => {
                            const baseClass = `group flex items-center gap-2 px-2 py-2 rounded-xl transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`;
                            
                            if (isActive) {
                              return `${baseClass} bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-primary/20`;
                            }
                            
                            return `${baseClass} hover:bg-muted/60 text-muted-foreground hover:text-foreground`;
                          }}
                        >
                          {({ isActive }) => (
                            <>
                              <div className={`flex items-center justify-center ${isCollapsed ? '' : 'w-7 h-7'} rounded-lg ${isActive ? 'bg-white/20' : `bg-gradient-to-br ${item.gradient}/10`} transition-all group-hover:scale-105`}>
                                <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
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

        {/* Upgrade Banner removed - redundant with "Planos" menu item */}

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
