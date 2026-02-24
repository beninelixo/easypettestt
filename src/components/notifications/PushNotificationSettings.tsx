import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function PushNotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setSupported(true);
      setEnabled(Notification.permission === 'granted');
    }
  }, []);

  const registerPushSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      // Save subscription to database
      const { error } = await supabase.functions.invoke('register-push-subscription', {
        body: { subscription: subscription.toJSON() }
      });

      if (error) throw error;

      toast.success('Notificações push ativadas!');
    } catch (error) {
      console.error('Error registering push subscription:', error);
      toast.error('Erro ao ativar notificações push');
      throw error;
    }
  };

  const handleToggle = async () => {
    if (!supported) {
      toast.error('Seu navegador não suporta notificações push');
      return;
    }

    setLoading(true);
    try {
      if (!enabled) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          await registerPushSubscription();
          setEnabled(true);
        } else {
          toast.error('Permissão negada para notificações');
        }
      } else {
        // Disable notifications
        const registration = await navigator.serviceWorker.ready;
        const subscription = await (registration as any).pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          toast.success('Notificações push desativadas');
        }
        
        setEnabled(false);
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba alertas em tempo real sobre eventos críticos de segurança
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="push-notifications">
            Ativar notificações push
          </Label>
          <Switch
            id="push-notifications"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={loading || !supported}
          />
        </div>

        {!supported && (
          <p className="text-sm text-muted-foreground">
            Seu navegador não suporta notificações push
          </p>
        )}

        {enabled && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Você receberá notificações sobre:
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Alertas críticos de segurança</li>
              <li>Tentativas de login suspeitas</li>
              <li>Bloqueios automáticos de IP</li>
              <li>Falhas em backups</li>
            </ul>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            new Notification('EasyPet', {
              body: 'Notificações push estão funcionando!',
              icon: '/icon-192.png'
            });
          }}
          disabled={!enabled}
        >
          Testar Notificação
        </Button>
      </CardContent>
    </Card>
  );
}
