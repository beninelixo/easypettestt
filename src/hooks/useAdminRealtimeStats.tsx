import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface AdminRealtimeStats {
  total_users: number;
  total_pet_shops: number;
  appointments_today: number;
  completed_appointments: number;
  errors_24h: number;
  warnings_24h: number;
  unread_alerts: number;
  failed_logins_1h: number;
  successful_logins_24h: number;
  pending_jobs: number;
  mfa_enabled_users: number;
  blocked_ips: number;
  last_refreshed: string;
}

export interface SystemLog {
  id: string;
  module: string;
  log_type: string;
  message: string;
  details: any;
  created_at: string;
}

export interface AdminAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  success: boolean;
  ip_address: string | null;
  attempt_time: string;
}

export function useAdminRealtimeStats() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch stats using get_system_stats RPC (more reliable than materialized view)
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin-realtime-stats'],
    queryFn: async (): Promise<AdminRealtimeStats | null> => {
      // Use get_system_stats directly - it's the most reliable source
      const { data: systemStats, error: systemError } = await supabase.rpc('get_system_stats');
      
      // Also fetch security stats for complete picture
      const { data: securityStats } = await supabase.rpc('get_security_stats');
      
      if (systemError) {
        console.error('Error fetching system stats:', systemError);
        return null;
      }
      
      const sys = systemStats as any;
      const sec = securityStats as any;
      
      return {
        total_users: sys?.total_users || 0,
        total_pet_shops: sys?.total_pet_shops || 0,
        appointments_today: sys?.total_appointments_today || 0,
        completed_appointments: 0,
        errors_24h: sys?.errors_last_24h || 0,
        warnings_24h: sys?.warnings_last_24h || 0,
        unread_alerts: sec?.unresolved_alerts || 0,
        failed_logins_1h: sec?.failed_logins_24h || 0,
        successful_logins_24h: sec?.successful_logins_24h || 0,
        pending_jobs: 0,
        mfa_enabled_users: sec?.active_mfa_users || 0,
        blocked_ips: 0,
        last_refreshed: new Date().toISOString(),
      };
    },
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 15 * 1000, // Refresh every 15 seconds
  });

  // Fetch recent logs
  const { data: recentLogs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['admin-recent-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return (data || []) as SystemLog[];
    },
    staleTime: 10 * 1000,
    refetchInterval: 15 * 1000,
  });

  // Fetch unread alerts
  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ['admin-alerts-unread'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*')
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return (data || []) as AdminAlert[];
    },
    staleTime: 5 * 1000,
    refetchInterval: 10 * 1000,
  });

  // Fetch recent login attempts
  const { data: loginAttempts, isLoading: loginsLoading, refetch: refetchLogins } = useQuery({
    queryKey: ['admin-login-attempts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .order('attempt_time', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return (data || []) as LoginAttempt[];
    },
    staleTime: 10 * 1000,
    refetchInterval: 15 * 1000,
  });

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'system_logs' },
        () => {
          refetchLogs();
          refetchStats();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_alerts' },
        () => {
          refetchAlerts();
          refetchStats();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'login_attempts' },
        () => {
          refetchLogins();
          refetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchLogs, refetchAlerts, refetchLogins, refetchStats]);

  // Manual refresh function
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchLogs(),
        refetchAlerts(),
        refetchLogins(),
      ]);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchStats, refetchLogs, refetchAlerts, refetchLogins]);

  // Mark alert as read
  const markAlertRead = useCallback(async (alertId: string) => {
    const { error } = await supabase
      .from('admin_alerts')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', alertId);
    
    if (!error) {
      refetchAlerts();
      refetchStats();
    }
  }, [refetchAlerts, refetchStats]);

  return {
    stats,
    recentLogs,
    alerts,
    loginAttempts,
    isLoading: statsLoading || logsLoading || alertsLoading || loginsLoading,
    isRefreshing,
    refreshAll,
    markAlertRead,
  };
}
