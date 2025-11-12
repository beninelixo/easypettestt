import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdminAlert {
  id: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  message: string;
  source_module?: string;
  source_function?: string;
  context?: any;
  metadata?: any;
  read: boolean;
  read_at?: string;
  read_by?: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  expires_at?: string;
  created_at: string;
}

export const useAdminAlerts = () => {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setAlerts((data || []) as AdminAlert[]);
      setUnreadCount(data?.filter(a => !a.read).length || 0);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Subscribe to real-time alerts
    const channel = supabase
      .channel('admin-alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_alerts'
        },
        (payload) => {
          const newAlert = payload.new as AdminAlert;
          
          setAlerts(prev => [newAlert, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show notification for critical/emergency alerts
          if (newAlert.severity === 'critical' || newAlert.severity === 'emergency') {
            toast({
              title: `🚨 ${newAlert.title}`,
              description: newAlert.message,
              variant: "destructive",
            });

            // Play alert sound
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
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
          
          setAlerts(prev => 
            prev.map(alert => alert.id === updatedAlert.id ? updatedAlert : alert)
          );
          
          // Recalculate unread count
          setAlerts(current => {
            setUnreadCount(current.filter(a => !a.read).length);
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("admin_alerts")
        .update({ read: true })
        .eq("id", alertId);

      if (error) throw error;
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("admin_alerts")
        .update({ read: true })
        .eq("read", false);

      if (error) throw error;
      
      setUnreadCount(0);
      toast({
        title: "Todas as notificações marcadas como lidas",
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("admin_alerts")
        .update({ resolved: true, read: true })
        .eq("id", alertId);

      if (error) throw error;

      toast({
        title: "Alerta resolvido",
        description: "O alerta foi marcado como resolvido.",
      });
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  return {
    alerts,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    resolveAlert,
    refetch: fetchAlerts,
  };
};
