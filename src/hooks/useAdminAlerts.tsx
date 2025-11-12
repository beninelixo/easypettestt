import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminAlert {
  id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  message: string;
  context: Record<string, any>;
  source_module?: string | null;
  source_function?: string | null;
  metadata: Record<string, any>;
  read: boolean;
  read_at?: string | null;
  read_by?: string | null;
  resolved: boolean;
  resolved_at?: string | null;
  resolved_by?: string | null;
  created_at: string;
  expires_at: string;
}

export const useAdminAlerts = () => {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch inicial de alertas
  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setAlerts(data as any as AdminAlert[] || []);
      setUnreadCount(data?.filter(a => !a.read).length || 0);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('admin_alerts_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_alerts'
        },
        (payload) => {
          const newAlert = payload.new as AdminAlert;
          console.log('🚨 New admin alert:', newAlert);

          // Adicionar ao início da lista
          setAlerts(prev => [newAlert, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Mostrar toast para alertas críticos
          if (['critical', 'emergency'].includes(newAlert.severity)) {
            toast({
              title: `🚨 ${newAlert.title}`,
              description: newAlert.message,
              variant: 'destructive',
              duration: 10000,
            });

            // Play alert sound for critical/emergency
            try {
              const audio = new Audio('/notification-sound.mp3');
              audio.play().catch(e => console.log('Could not play alert sound:', e));
            } catch (e) {
              console.log('Audio not supported');
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_alerts'
        },
        (payload) => {
          const updatedAlert = payload.new as AdminAlert;
          console.log('🔄 Alert updated:', updatedAlert.id);

          setAlerts(prev => 
            prev.map(a => a.id === updatedAlert.id ? updatedAlert : a)
          );

          // Recalcular unread count
          setUnreadCount(prev => {
            const oldAlert = alerts.find(a => a.id === updatedAlert.id);
            if (oldAlert && !oldAlert.read && updatedAlert.read) {
              return Math.max(0, prev - 1);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase.rpc('mark_alert_read', {
        alert_id: alertId
      });

      if (error) throw error;

      // Update local state
      setAlerts(prev => 
        prev.map(a => a.id === alertId ? { ...a, read: true, read_at: new Date().toISOString() } : a)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking alert as read:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar alerta como lido',
        variant: 'destructive'
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadAlerts = alerts.filter(a => !a.read);
      
      for (const alert of unreadAlerts) {
        await supabase.rpc('mark_alert_read', {
          alert_id: alert.id
        });
      }

      setAlerts(prev => prev.map(a => ({ ...a, read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);

      toast({
        title: 'Sucesso',
        description: 'Todos os alertas foram marcados como lidos',
      });
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar todos como lidos',
        variant: 'destructive'
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('admin_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => 
        prev.map(a => a.id === alertId ? { ...a, resolved: true, resolved_at: new Date().toISOString() } : a)
      );

      toast({
        title: 'Sucesso',
        description: 'Alerta resolvido com sucesso',
      });
    } catch (error: any) {
      console.error('Error resolving alert:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível resolver o alerta',
        variant: 'destructive'
      });
    }
  };

  return {
    alerts,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    resolveAlert,
    refetch: fetchAlerts
  };
};
