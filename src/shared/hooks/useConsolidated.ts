import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ConsolidatedMetrics } from '@/types/multi-tenant';

interface ConsolidatedFilters {
  tenant_id: string;
  franchise_ids?: string[];
  unit_ids?: string[];
  date_start: string;
  date_end: string;
}

export const useConsolidatedMetrics = (filters: ConsolidatedFilters) => {
  return useQuery({
    queryKey: ['consolidated-metrics', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_consolidated_metrics' as any, {
        _tenant_id: filters.tenant_id,
        _franchise_ids: filters.franchise_ids || null,
        _unit_ids: filters.unit_ids || null,
        _date_start: filters.date_start,
        _date_end: filters.date_end,
      });
      
      if (error) throw error;
      return data as unknown as ConsolidatedMetrics;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!filters.tenant_id,
  });
};
