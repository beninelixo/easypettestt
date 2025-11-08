import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Metric {
  id: string;
  metric_type: string;
  metric_value: number;
  metadata?: any;
  collected_at: string;
}

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('collected_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMetrics((data || []) as any);
    } catch (error) {
      console.error('Error loading metrics:', error);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const collectMetrics = async () => {
    try {
      const { error } = await supabase.functions.invoke('collect-metrics');
      if (error) throw error;
      await loadMetrics();
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  };

  const getLatestMetricValue = (type: string): number => {
    const metric = metrics.find(m => m.metric_type === type);
    return metric?.metric_value || 0;
  };

  const getMetricHistory = (type: string, limit = 20) => {
    return metrics
      .filter(m => m.metric_type === type)
      .slice(0, limit)
      .reverse();
  };

  useEffect(() => {
    loadMetrics();

    const channel = supabase
      .channel('system_metrics_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_metrics'
        },
        () => {
          loadMetrics();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      collectMetrics();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return {
    metrics,
    loading,
    loadMetrics,
    collectMetrics,
    getLatestMetricValue,
    getMetricHistory
  };
}
