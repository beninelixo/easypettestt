import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ConsolidatedMetrics } from '@/types/multi-tenant';

interface ConsolidatedFilters {
  tenant_id: string;
  franchise_ids?: string[];
  unit_ids?: string[];
  date_start: string;
  date_end: string;
}

export const useConsolidatedMetrics = (filters: ConsolidatedFilters) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['consolidated-metrics', filters],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_consolidated_metrics' as any, {
          _tenant_id: filters.tenant_id,
          _franchise_ids: filters.franchise_ids || null,
          _unit_ids: filters.unit_ids || null,
          _date_start: filters.date_start,
          _date_end: filters.date_end,
        });
        
        if (error) throw error;
        return data as unknown as ConsolidatedMetrics;
      } catch (err) {
        console.error('Error fetching consolidated metrics:', err);
        toast({
          title: "Erro ao carregar métricas",
          description: "Não foi possível carregar os dados consolidados.",
          variant: "destructive",
        });
        throw err;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!filters.tenant_id,
    retry: 2,
  });
};
