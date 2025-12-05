import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Debounce utility
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number): T => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
};

export const useRealtimeMetrics = (petShopId: string | null) => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Create debounced update handler to prevent excessive re-renders
  const debouncedSetUpdate = useRef(
    debounce(() => setLastUpdate(new Date()), 500)
  ).current;
  
  // Memoizar handler de atualização para evitar recriação
  const handleUpdate = useCallback((type: string) => {
    console.log(`${type} updated - refreshing metrics`);
    debouncedSetUpdate();
  }, [debouncedSetUpdate]);
  
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
