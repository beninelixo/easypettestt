import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/lib/tenant-context';
import { useToast } from '@/hooks/use-toast';
import type { Franchise, Unit } from '@/types/multi-tenant';

export const useMultiUnit = () => {
  const { tenantId, unitId: currentUnitId, switchContext } = useTenant();
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const { toast } = useToast();

  // Fetch all franchises and units for the tenant
  const { data: franchises, isLoading, error } = useQuery({
    queryKey: ['franchises', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      try {
        const { data, error } = await supabase
          .from('franchises' as any)
          .select(`
            id,
            name,
            code,
            units:pet_shops(
              id,
              name,
              code,
              franchise_id
            )
          `)
          .eq('tenant_id', tenantId)
          .eq('active', true)
          .limit(100); // Limit for performance

        if (error) throw error;
        return data as unknown as Franchise[];
      } catch (err) {
        console.error('Error fetching franchises:', err);
        toast({
          title: "Erro ao carregar unidades",
          description: "Não foi possível carregar as unidades. Tente novamente.",
          variant: "destructive",
        });
        throw err;
      }
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  // Load current unit from context or localStorage
  useEffect(() => {
    if (currentUnitId && franchises) {
      const unit = franchises
        .flatMap(f => f.units || [])
        .find(u => u.id === currentUnitId);
      if (unit) setCurrentUnit(unit);
    } else if (franchises && franchises[0]?.units && franchises[0].units[0]) {
      setCurrentUnit(franchises[0].units[0]);
    }
  }, [currentUnitId, franchises]);

  const switchUnit = (unitId: string) => {
    try {
      const unit = franchises
        ?.flatMap(f => f.units || [])
        .find(u => u.id === unitId);
      
      if (unit) {
        setCurrentUnit(unit);
        switchContext(undefined, unit.franchise_id || undefined, unitId);
        toast({
          title: "Unidade alterada",
          description: `Você está agora em: ${unit.name}`,
        });
      } else {
        toast({
          title: "Unidade não encontrada",
          description: "A unidade selecionada não existe.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error switching unit:', err);
      toast({
        title: "Erro ao trocar unidade",
        description: "Não foi possível alterar a unidade. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    currentUnit,
    franchises: franchises || [],
    switchUnit,
    loading: isLoading,
    error,
  };
};
