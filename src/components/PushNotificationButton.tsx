import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/hooks/useAuth';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PushNotificationButton() {
  const { user } = useAuth();
  const { permission, isSupported, requestPermission, subscribeToAppointments } = usePushNotifications();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (permission === 'granted' && user) {
      subscribeToAppointments(user.id).then((unsubscribe) => {
        setIsSubscribed(true);
        return unsubscribe;
      });
    }
  }, [permission, user]);

  if (!isSupported || !user) {
    return null;
  }

  const handleToggle = async () => {
    if (permission === 'granted') {
      // User wants to disable - show info that they need to do it in browser settings
      alert('Para desativar notificações, vá nas configurações do seu navegador.');
    } else {
      await requestPermission();
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={permission === 'granted' ? 'default' : 'outline'}
          size="icon"
          onClick={handleToggle}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        >
          {permission === 'granted' ? (
            <Bell className="h-6 w-6" />
          ) : (
            <BellOff className="h-6 w-6" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs">
        <p className="font-semibold mb-1">
          {permission === 'granted' ? 'Notificações Ativadas' : 'Ativar Notificações'}
        </p>
        <p className="text-xs text-muted-foreground">
          {permission === 'granted'
            ? 'Você receberá alertas sobre agendamentos e atualizações importantes.'
            : 'Clique para receber alertas instantâneos sobre seus agendamentos.'}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
