import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DailyHealthReport, AutomaticAction } from '@/types/models';

interface MaintenanceStatus {
  latestReport: DailyHealthReport | null;
  recentActions: AutomaticAction[];
  loading: boolean;
  error: Error | null;
  refreshReport: () => Promise<void>;
  triggerHealthCheck: () => Promise<void>;
}

export function useMaintenanceStatus(): MaintenanceStatus {
  const [latestReport, setLatestReport] = useState<DailyHealthReport | null>(null);
  const [recentActions, setRecentActions] = useState<AutomaticAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar último relatório
      const { data: reportData, error: reportError } = await supabase
        .from('daily_health_reports' as any)
        .select('*')
        .order('report_date', { ascending: false })
        .limit(1)
        .single();

      if (reportError && reportError.code !== 'PGRST116') {
        throw reportError;
      }

      setLatestReport(reportData as any);

      // Buscar ações recentes (últimas 24h)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data: actionsData, error: actionsError } = await supabase
        .from('automatic_actions' as any)
        .select('*')
        .gte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (actionsError) throw actionsError;

      setRecentActions(actionsData as any || []);
    } catch (err) {
      console.error('Error loading maintenance status:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const refreshReport = async () => {
    await loadData();
  };

  const triggerHealthCheck = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.functions.invoke('daily-health-check', {
        body: { manual: true },
      });

      if (error) throw error;

      // Aguardar um pouco e recarregar dados
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadData();
    } catch (err) {
      console.error('Error triggering health check:', err);
      setError(err instanceof Error ? err : new Error('Failed to trigger health check'));
      throw err;
    }
  };

  useEffect(() => {
    loadData();

    // Realtime subscription para atualizações automáticas
    const channel = supabase
      .channel('maintenance_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_health_reports',
        },
        () => {
          console.log('New health report detected, reloading...');
          loadData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'automatic_actions',
        },
        () => {
          console.log('New automatic action detected, reloading...');
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    latestReport,
    recentActions,
    loading,
    error,
    refreshReport,
    triggerHealthCheck,
  };
}
