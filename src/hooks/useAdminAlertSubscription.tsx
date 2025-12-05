import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useAdminAlertSubscription = () => {
  const { toast } = useToast();
  const { userRole } = useAuth();

  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'super_admin') return;

    const channel = supabase
      .channel('admin_alerts_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_alerts',
        },
        (payload) => {
          const alert = payload.new as any;
          
          // Notificação visual
          toast({
            title: `⚠️ ${alert.title}`,
            description: alert.message,
            variant: alert.severity === 'critical' ? 'destructive' : 'default',
            duration: 10000,
          });

          // Audio alert para críticos
          if (alert.severity === 'critical' || alert.severity === 'high') {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, toast]);
};
