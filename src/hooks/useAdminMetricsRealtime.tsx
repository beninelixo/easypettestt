import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { debounce } from '@/lib/utils';

export interface RealtimeMetrics {
  // Counts
  totalUsers: number;
  totalPetShops: number;
  totalPets: number;
  totalAppointments: number;
  
  // Today's metrics
  appointmentsToday: number;
  appointmentsTodayCompleted: number;
  appointmentsTodayPending: number;
  appointmentsTodayCancelled: number;
  revenueToday: number;
  newUsersToday: number;
  newPetsToday: number;
  
  // Security metrics
  failedLogins24h: number;
  failedLogins1h: number;
  blockedIps: number;
  activeAlerts: number;
  
  // System health
  pendingJobs: number;
  errors24h: number;
  warnings24h: number;
  
  // Timestamps
  lastUpdate: Date;
}

const initialMetrics: RealtimeMetrics = {
  totalUsers: 0,
  totalPetShops: 0,
  totalPets: 0,
  totalAppointments: 0,
  appointmentsToday: 0,
  appointmentsTodayCompleted: 0,
  appointmentsTodayPending: 0,
  appointmentsTodayCancelled: 0,
  revenueToday: 0,
  newUsersToday: 0,
  newPetsToday: 0,
  failedLogins24h: 0,
  failedLogins1h: 0,
  blockedIps: 0,
  activeAlerts: 0,
  pendingJobs: 0,
  errors24h: 0,
  warnings24h: 0,
  lastUpdate: new Date(),
};

export function useAdminMetricsRealtime() {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<RealtimeMetrics>(initialMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Fetch all metrics from database
  const fetchAllMetrics = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

      // Parallel queries for all metrics
      const [
        usersResult,
        petShopsResult,
        petsResult,
        appointmentsResult,
        appointmentsTodayResult,
        paymentsTodayResult,
        newUsersTodayResult,
        newPetsTodayResult,
        failedLogins24hResult,
        failedLogins1hResult,
        blockedIpsResult,
        alertsResult,
        pendingJobsResult,
        errors24hResult,
        warnings24hResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('pet_shops').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('pets').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('appointments').select('status').eq('scheduled_date', today).is('deleted_at', null),
        supabase.from('payments').select('amount').gte('created_at', today).eq('status', 'pago'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('pets').select('id', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('login_attempts').select('id', { count: 'exact', head: true }).eq('success', false).gte('attempt_time', oneDayAgo),
        supabase.from('login_attempts').select('id', { count: 'exact', head: true }).eq('success', false).gte('attempt_time', oneHourAgo),
        supabase.from('blocked_ips').select('id', { count: 'exact', head: true }).gte('blocked_until', now.toISOString()),
        supabase.from('admin_alerts').select('id', { count: 'exact', head: true }).eq('read', false),
        supabase.from('failed_jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('system_logs').select('id', { count: 'exact', head: true }).eq('log_type', 'error').gte('created_at', oneDayAgo),
        supabase.from('system_logs').select('id', { count: 'exact', head: true }).eq('log_type', 'warning').gte('created_at', oneDayAgo),
      ]);

      // Process appointments today
      const appointmentsToday = appointmentsTodayResult.data || [];
      const appointmentsTodayCompleted = appointmentsToday.filter(a => a.status === 'completed').length;
      const appointmentsTodayPending = appointmentsToday.filter(a => ['pending', 'confirmed'].includes(a.status)).length;
      const appointmentsTodayCancelled = appointmentsToday.filter(a => a.status === 'cancelled').length;

      // Calculate revenue today
      const revenueToday = (paymentsTodayResult.data || []).reduce((sum, p) => sum + (p.amount || 0), 0);

      setMetrics({
        totalUsers: usersResult.count || 0,
        totalPetShops: petShopsResult.count || 0,
        totalPets: petsResult.count || 0,
        totalAppointments: appointmentsResult.count || 0,
        appointmentsToday: appointmentsToday.length,
        appointmentsTodayCompleted,
        appointmentsTodayPending,
        appointmentsTodayCancelled,
        revenueToday,
        newUsersToday: newUsersTodayResult.count || 0,
        newPetsToday: newPetsTodayResult.count || 0,
        failedLogins24h: failedLogins24hResult.count || 0,
        failedLogins1h: failedLogins1hResult.count || 0,
        blockedIps: blockedIpsResult.count || 0,
        activeAlerts: alertsResult.count || 0,
        pendingJobs: pendingJobsResult.count || 0,
        errors24h: errors24hResult.count || 0,
        warnings24h: warnings24hResult.count || 0,
        lastUpdate: new Date(),
      });

      setIsLoading(false);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching admin metrics:', error);
      }
      setIsLoading(false);
    }
  }, []);

  // Debounced refresh to prevent too many updates
  const debouncedRefresh = useMemo(
    () => debounce(() => {
      fetchAllMetrics();
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['admin-realtime-stats'] });
      queryClient.invalidateQueries({ queryKey: ['global-metrics'] });
    }, 500),
    [fetchAllMetrics, queryClient]
  );

  // Setup real-time subscriptions
  useEffect(() => {
    fetchAllMetrics();

    const channel = supabase
      .channel('admin-metrics-realtime')
      // Core data tables
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, debouncedRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, debouncedRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pet_shops' }, debouncedRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, debouncedRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pets' }, debouncedRefresh)
      // Security tables
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'login_attempts' }, debouncedRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_ips' }, debouncedRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_alerts' }, debouncedRefresh)
      // System tables
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, debouncedRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'failed_jobs' }, debouncedRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_health_metrics' }, debouncedRefresh)
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    // Periodic refresh every 30 seconds as fallback
    const interval = setInterval(fetchAllMetrics, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchAllMetrics, debouncedRefresh]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchAllMetrics();
  }, [fetchAllMetrics]);

  return {
    metrics,
    isLoading,
    isLive,
    refresh,
  };
}
