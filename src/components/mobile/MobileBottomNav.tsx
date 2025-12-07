// Mobile Bottom Navigation - Fixed navigation bar for mobile dashboards
import { useLocation, Link } from 'react-router-dom';
import { useIsMobile } from '@/utils/breakpoints';
import { 
  LayoutDashboard, Calendar, Users, Settings, 
  PawPrint, Bell, BarChart3, Home 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { memo } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

interface MobileBottomNavProps {
  variant?: 'professional' | 'client' | 'admin';
  className?: string;
}

const professionalNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/professional/dashboard', icon: LayoutDashboard },
  { label: 'Agenda', path: '/professional/calendar', icon: Calendar },
  { label: 'Clientes', path: '/professional/clients', icon: Users },
  { label: 'Config', path: '/professional/settings', icon: Settings },
];

const clientNavItems: NavItem[] = [
  { label: 'Início', path: '/client/dashboard', icon: Home },
  { label: 'Pets', path: '/client/pets', icon: PawPrint },
  { label: 'Agenda', path: '/client/appointments', icon: Calendar },
  { label: 'Perfil', path: '/client/profile', icon: Settings },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Usuários', path: '/admin/users', icon: Users },
  { label: 'Relatórios', path: '/admin/reports', icon: BarChart3 },
  { label: 'Config', path: '/admin/settings', icon: Settings },
];

export const MobileBottomNav = memo(({ variant = 'professional', className }: MobileBottomNavProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();

  if (!isMobile) return null;

  const navItems = variant === 'professional' 
    ? professionalNavItems 
    : variant === 'client' 
    ? clientNavItems 
    : adminNavItems;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-lg border-t border-border/50",
        "shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.15)]",
        "safe-area-inset-bottom",
        className
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-w-[64px] min-h-[44px]",
                "rounded-xl transition-all duration-200 ease-out",
                "active:scale-95 touch-manipulation",
                active 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  active && "scale-110"
                )} 
              />
              <span className={cn(
                "text-[10px] font-medium leading-tight",
                active && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

MobileBottomNav.displayName = 'MobileBottomNav';
