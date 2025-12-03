import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface GlobalMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_type: 'count' | 'percentage' | 'currency' | 'text' | 'rating';
  description: string;
  last_calculated_at: string;
  updated_at: string;
}

export const useGlobalMetrics = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['global-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_metrics')
        .select('*');

      if (error) throw error;
      return data as GlobalMetric[];
    },
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // 30 seconds
  });

  // Real-time subscription for global metrics updates
  useEffect(() => {
    const channel = supabase
      .channel('global-metrics-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_metrics'
        },
        () => {
          console.log('📊 Global metrics updated - refreshing');
          queryClient.invalidateQueries({ queryKey: ['global-metrics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useGlobalMetric = (metricName: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['global-metrics', metricName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_metrics')
        .select('*')
        .eq('metric_name', metricName)
        .single();

      if (error) throw error;
      return data as GlobalMetric;
    },
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });

  // Real-time subscription for specific metric
  useEffect(() => {
    const channel = supabase
      .channel(`global-metric-${metricName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_metrics',
          filter: `metric_name=eq.${metricName}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['global-metrics', metricName] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [metricName, queryClient]);

  return query;
};
