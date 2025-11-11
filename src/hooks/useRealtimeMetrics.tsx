import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeMetrics = (petShopId: string | null) => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Memoizar handler de atualização para evitar recriação
  const handleUpdate = useCallback((type: string) => {
    console.log(`${type} updated - refreshing metrics`);
    setLastUpdate(new Date());
  }, []);
  
  useEffect(() => {
    if (!petShopId) return;

    const channel = supabase
      .channel('metrics-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `pet_shop_id=eq.${petShopId}`
        },
        () => handleUpdate('Appointment')
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => handleUpdate('Payment')
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petShopId, handleUpdate]);

  // Memoizar objeto de retorno para evitar re-renders
  return useMemo(() => ({ lastUpdate }), [lastUpdate]);
};
