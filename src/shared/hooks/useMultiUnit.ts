import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/lib/tenant-context';
import type { Franchise, Unit } from '@/types/multi-tenant';

export const useMultiUnit = () => {
  const { tenantId, unitId: currentUnitId, switchContext } = useTenant();
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);

  // Fetch all franchises and units for the tenant
  const { data: franchises, isLoading } = useQuery({
    queryKey: ['franchises', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

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
        .eq('active', true);

      if (error) throw error;
      return data as unknown as Franchise[];
    },
    enabled: !!tenantId,
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
    const unit = franchises
      ?.flatMap(f => f.units || [])
      .find(u => u.id === unitId);
    
    if (unit) {
      setCurrentUnit(unit);
      switchContext(undefined, unit.franchise_id || undefined, unitId);
    }
  };

  return {
    currentUnit,
    franchises: franchises || [],
    switchUnit,
    loading: isLoading,
  };
};
