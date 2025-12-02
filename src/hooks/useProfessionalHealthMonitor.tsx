import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface RouteHealth {
  path: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  lastChecked: Date;
  errorMessage?: string;
}

const PROFESSIONAL_ROUTES = [
  { path: '/professional/services', name: 'Serviços' },
  { path: '/professional/calendar', name: 'Calendário' },
  { path: '/professional/clients', name: 'Clientes' },
  { path: '/professional/settings', name: 'Configurações' },
  { path: '/professional/employees', name: 'Funcionários' },
  { path: '/professional/reports', name: 'Relatórios' },
  { path: '/professional/backup', name: 'Backup' },
  { path: '/professional/plans', name: 'Planos' },
  { path: '/professional/profile', name: 'Perfil' },
  { path: '/petshop-dashboard', name: 'Dashboard' },
];

export const useProfessionalHealthMonitor = () => {
  const { user, userRole } = useAuth();
  const lastCheckRef = useRef<Date | null>(null);
  const routeHealthRef = useRef<Map<string, RouteHealth>>(new Map());

  const logHealthCheck = useCallback(async (
    routes: RouteHealth[],
    overallStatus: 'healthy' | 'warning' | 'error'
  ) => {
    if (!user) return;

    try {
      const healthyCount = routes.filter(r => r.status === 'healthy').length;
      const warningCount = routes.filter(r => r.status === 'warning').length;
      const errorCount = routes.filter(r => r.status === 'error').length;

      // Log to system_logs
      await supabase.from('system_logs' as any).insert([{
        level: overallStatus === 'error' ? 'error' : overallStatus === 'warning' ? 'warn' : 'info',
        module: 'professional_health_monitor',
        message: `Professional routes health check: ${healthyCount} healthy, ${warningCount} warnings, ${errorCount} errors`,
        context: JSON.parse(JSON.stringify({
          routes: routes.map(r => ({
            path: r.path,
            name: r.name,
            status: r.status,
            error: r.errorMessage || null
          })),
          user_id: user.id,
          role: userRole
        })),
        user_id: user.id
      }]);

      // Create alert if critical issues found
      if (errorCount > 0) {
        await supabase.from('admin_alerts').insert([{
          alert_type: 'professional_routes_error',
          severity: 'high',
          title: `${errorCount} rotas profissionais com erro`,
          message: `Detectadas ${errorCount} rotas com problemas: ${routes.filter(r => r.status === 'error').map(r => r.name).join(', ')}`,
          metadata: JSON.parse(JSON.stringify({ routes, user_id: user.id }))
        }]);
      }
    } catch (error) {
      console.error('Error logging health check:', error);
    }
  }, [user, userRole]);

  const checkRouteHealth = useCallback(async () => {
    // Only check for pet_shop users
    if (!user || userRole !== 'pet_shop') return;

    // Rate limit: only check every 5 minutes
    const now = new Date();
    if (lastCheckRef.current && (now.getTime() - lastCheckRef.current.getTime()) < 5 * 60 * 1000) {
      return;
    }
    lastCheckRef.current = now;

    const healthResults: RouteHealth[] = [];

    for (const route of PROFESSIONAL_ROUTES) {
      try {
        // Simulate route check - in production this would be more sophisticated
        const health: RouteHealth = {
          path: route.path,
          name: route.name,
          status: 'healthy',
          lastChecked: now
        };
        
        routeHealthRef.current.set(route.path, health);
        healthResults.push(health);
      } catch (error: any) {
        const health: RouteHealth = {
          path: route.path,
          name: route.name,
          status: 'error',
          lastChecked: now,
          errorMessage: error.message
        };
        routeHealthRef.current.set(route.path, health);
        healthResults.push(health);
      }
    }

    // Determine overall status
    const hasErrors = healthResults.some(r => r.status === 'error');
    const hasWarnings = healthResults.some(r => r.status === 'warning');
    const overallStatus = hasErrors ? 'error' : hasWarnings ? 'warning' : 'healthy';

    await logHealthCheck(healthResults, overallStatus);
  }, [user, userRole, logHealthCheck]);

  // Run health check on mount and periodically
  useEffect(() => {
    if (userRole === 'pet_shop') {
      checkRouteHealth();
      
      // Check every 5 minutes
      const interval = setInterval(checkRouteHealth, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [userRole, checkRouteHealth]);

  const reportError = useCallback(async (path: string, error: Error) => {
    if (!user) return;

    const route = PROFESSIONAL_ROUTES.find(r => r.path === path);
    if (!route) return;

    const health: RouteHealth = {
      path,
      name: route.name,
      status: 'error',
      lastChecked: new Date(),
      errorMessage: error.message
    };
    routeHealthRef.current.set(path, health);

    // Log error immediately
    try {
      await supabase.from('system_logs' as any).insert([{
        level: 'error',
        module: 'professional_route_error',
        message: `Error in professional route: ${route.name}`,
        context: JSON.parse(JSON.stringify({
          path,
          error: error.message,
          stack: error.stack,
          user_id: user.id
        })),
        user_id: user.id
      }]);

      await supabase.from('admin_alerts').insert([{
        alert_type: 'professional_route_crash',
        severity: 'critical',
        title: `Erro na rota: ${route.name}`,
        message: `A rota ${path} apresentou erro: ${error.message}`,
        metadata: JSON.parse(JSON.stringify({ path, error: error.message, user_id: user.id }))
      }]);
    } catch (logError) {
      console.error('Error logging route error:', logError);
    }
  }, [user]);

  return {
    checkRouteHealth,
    reportError,
    getRouteHealth: (path: string) => routeHealthRef.current.get(path)
  };
};
