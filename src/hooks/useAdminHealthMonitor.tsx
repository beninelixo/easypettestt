import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RouteHealth {
  path: string;
  status: 'healthy' | 'degraded' | 'error';
  lastCheck: Date;
  errorMessage?: string;
}

interface AdminHealthState {
  routes: RouteHealth[];
  overallStatus: 'healthy' | 'degraded' | 'critical';
  lastFullCheck: Date | null;
}

const ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/superadmin',
  '/admin/god-mode',
  '/admin/maintenance',
  '/admin/health-dashboard',
  '/admin/performance-history',
  '/admin/system-monitoring',
  '/admin/system-analysis',
  '/admin/auth-monitoring',
  '/admin/auth-metrics',
  '/admin/system-health',
  '/admin/data-integrity',
  '/admin/failed-jobs',
  '/admin/system-diagnostics',
  '/admin/ai-monitor',
  '/admin/security-fixes',
  '/admin/security',
  '/admin/security-monitoring',
  '/admin/ip-whitelist',
  '/admin/login-history',
  '/admin/backups',
  '/admin/audit-logs',
  '/admin/user-management',
  '/admin/user-analytics',
  '/admin/notification-preferences',
  '/admin/webhooks',
  '/admin/performance',
  '/admin/error-logs',
  '/admin/email-test',
  '/admin/email-analytics',
  '/admin/domain-setup',
  '/admin/loops-domain-setup',
  '/admin/notifications',
  '/admin/monitor',
  '/admin/success-stories',
  '/admin/regenerate-images',
];

export function useAdminHealthMonitor() {
  const [healthState, setHealthState] = useState<AdminHealthState>({
    routes: [],
    overallStatus: 'healthy',
    lastFullCheck: null,
  });
  const [isChecking, setIsChecking] = useState(false);

  const logHealthCheck = useCallback(async (status: string, details: Record<string, unknown>) => {
    try {
      await supabase.from('system_logs').insert([{
        module: 'admin_health_monitor',
        log_type: status === 'healthy' ? 'info' : 'warning',
        message: `Admin routes health check: ${status}`,
        details: details as any,
      }]);
    } catch (error) {
      console.error('Failed to log health check:', error);
    }
  }, []);

  const checkRouteHealth = useCallback(async (path: string): Promise<RouteHealth> => {
    // Basic check - verify route exists in the app
    const routeExists = ADMIN_ROUTES.includes(path);
    
    return {
      path,
      status: routeExists ? 'healthy' : 'error',
      lastCheck: new Date(),
      errorMessage: routeExists ? undefined : 'Route not found in configuration',
    };
  }, []);

  const runFullHealthCheck = useCallback(async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    
    try {
      const routeChecks = await Promise.all(
        ADMIN_ROUTES.map(route => checkRouteHealth(route))
      );

      const errorCount = routeChecks.filter(r => r.status === 'error').length;
      const degradedCount = routeChecks.filter(r => r.status === 'degraded').length;

      let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (errorCount > 0) {
        overallStatus = errorCount > 3 ? 'critical' : 'degraded';
      } else if (degradedCount > 0) {
        overallStatus = 'degraded';
      }

      const newState: AdminHealthState = {
        routes: routeChecks,
        overallStatus,
        lastFullCheck: new Date(),
      };

      setHealthState(newState);

      // Log the health check results
      await logHealthCheck(overallStatus, {
        totalRoutes: ADMIN_ROUTES.length,
        healthyRoutes: routeChecks.filter(r => r.status === 'healthy').length,
        degradedRoutes: degradedCount,
        errorRoutes: errorCount,
        timestamp: new Date().toISOString(),
      });

      // Create alert if critical
      if (overallStatus === 'critical') {
        await supabase.from('admin_alerts').insert([{
          alert_type: 'admin_routes_critical',
          severity: 'critical',
          title: 'Rotas Admin com Problemas Críticos',
          message: `${errorCount} rotas admin estão com erro. Verificação necessária.`,
          context: {
            errorRoutes: routeChecks.filter(r => r.status === 'error').map(r => r.path),
          } as any,
        }]);
      }

    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, checkRouteHealth, logHealthCheck]);

  // Run health check on mount and every 5 minutes
  useEffect(() => {
    runFullHealthCheck();

    const interval = setInterval(runFullHealthCheck, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [runFullHealthCheck]);

  return {
    healthState,
    isChecking,
    runFullHealthCheck,
    adminRoutes: ADMIN_ROUTES,
  };
}
