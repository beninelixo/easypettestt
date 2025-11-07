import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports notifications
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta notificações push.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Register service worker
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        
        toast({
          title: "✅ Notificações ativadas",
          description: "Você receberá alertas sobre agendamentos e lembretes.",
        });
        
        return true;
      } else {
        toast({
          title: "Permissão negada",
          description: "Você não receberá notificações push.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar as notificações.",
        variant: "destructive",
      });
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: { title, options }
      });
    }
  };

  const subscribeToAppointments = async (userId: string) => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return () => {};
    }

    // Subscribe to real-time appointment changes
    const channel = supabase
      .channel('appointment-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `client_id=eq.${userId}`
        },
        (payload) => {
          sendNotification('🎉 Novo Agendamento', {
            body: 'Seu agendamento foi confirmado!',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'appointment',
            requireInteraction: true
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `client_id=eq.${userId}`
        },
        (payload: any) => {
          const status = payload.new.status;
          let message = 'Status do agendamento atualizado';
          
          if (status === 'confirmed') message = 'Agendamento confirmado!';
          else if (status === 'completed') message = 'Serviço concluído!';
          else if (status === 'cancelled') message = 'Agendamento cancelado';
          
          sendNotification('📅 Atualização de Agendamento', {
            body: message,
            icon: '/favicon.ico',
            tag: 'appointment-update'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    subscribeToAppointments
  };
}
