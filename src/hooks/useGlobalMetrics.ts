import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  return useQuery({
    queryKey: ['global-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_metrics')
        .select('*');

      if (error) throw error;
      return data as GlobalMetric[];
    },
  });
};

export const useGlobalMetric = (metricName: string) => {
  return useQuery({
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
  });
};
