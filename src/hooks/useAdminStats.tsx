import { useGlobalMetrics } from './useGlobalMetrics';
import { useSystemMetrics } from './useSystemMetrics';
import { useSecurityMonitoring } from './useSecurityMonitoring';
import { useAuditLogs } from './useAuditLogs';

export function useAdminStats() {
  // Global metrics
  const { data: globalMetrics, isLoading: loadingMetrics } = useGlobalMetrics();
  
  // System health
  const { 
    metrics: systemMetrics, 
    loading: loadingSystem,
    getLatestMetricValue 
  } = useSystemMetrics();
  
  // Security data
  const {
    alerts,
    loginAttempts,
    blockedIps,
    loading: loadingSecurity
  } = useSecurityMonitoring();
  
  // Audit logs
  const {
    logs: auditLogs,
    loading: loadingAudit
  } = useAuditLogs();

  const isLoading = loadingMetrics || loadingSystem || loadingSecurity || loadingAudit;

  // Process global metrics into usable format
  const stats = {
    totalPetShops: globalMetrics?.find(m => m.metric_name === 'total_active_petshops')?.metric_value || 0,
    totalClients: globalMetrics?.find(m => m.metric_name === 'total_clients')?.metric_value || 0,
    appointmentsToday: globalMetrics?.find(m => m.metric_name === 'appointments_today')?.metric_value || 0,
    monthlyRevenue: globalMetrics?.find(m => m.metric_name === 'monthly_revenue')?.metric_value || 0,
    avgSatisfaction: globalMetrics?.find(m => m.metric_name === 'average_satisfaction')?.metric_value || 0,
  };

  // System health indicators
  const systemHealth = {
    databaseStatus: getLatestMetricValue('database_health') > 0 ? 'healthy' : 'critical',
    databaseLatency: getLatestMetricValue('database_latency'),
    emailServiceStatus: 'operational', // Could be enhanced with real check
    backupStatus: 'completed', // Could be enhanced with real check
  };

  // Security overview
  const security = {
    criticalAlerts: alerts?.filter(a => !a.resolved && a.severity === 'critical').length || 0,
    failedLogins24h: loginAttempts?.filter(l => !l.success && 
      new Date(l.attempt_time) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length || 0,
    activeBlockedIps: blockedIps?.filter(b => 
      new Date(b.blocked_until) > new Date()
    ).length || 0,
    mfaUsers: 0, // Could be enhanced with real query
  };

  // Recent activity (last 10 critical logs)
  const recentActivity = auditLogs?.slice(0, 10) || [];

  return {
    stats,
    systemHealth,
    security,
    recentActivity,
    isLoading,
    
    // Raw data for advanced usage
    raw: {
      globalMetrics,
      systemMetrics,
      alerts,
      loginAttempts,
      blockedIps,
      auditLogs
    }
  };
}
