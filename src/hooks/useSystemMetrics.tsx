import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Metric {
  id: string;
  metric_type: string;
  metric_value: number;
  status?: string;
  service_name?: string;
  metadata?: any;
  measured_at: string;
}

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const loadMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('system_health_metrics')
        .select('*')
        .order('measured_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMetrics((data || []) as Metric[]);
    } catch (error) {
      console.error('Error loading metrics:', error);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Note: collectMetrics removed - requires service role auth
  // Metrics are collected via cron job, frontend only reads existing data

  const getLatestMetricValue = useCallback((type: string): number => {
    const metric = metrics.find(m => m.metric_type === type);
    return metric?.metric_value || 0;
  }, [metrics]);

  const getMetricHistory = useCallback((type: string, limit = 20) => {
    return metrics
      .filter(m => m.metric_type === type)
      .slice(0, limit)
      .reverse();
  }, [metrics]);

  const getMetricsByService = useCallback((serviceName: string) => {
    return metrics.filter(m => m.service_name === serviceName);
  }, [metrics]);

  useEffect(() => {
    loadMetrics();

    const channel = supabase
      .channel('system_health_metrics_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_health_metrics'
        },
        () => {
          loadMetrics();
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMetrics]);

  return {
    metrics,
    loading,
    isLive,
    loadMetrics,
    getLatestMetricValue,
    getMetricHistory,
    getMetricsByService
  };
}
