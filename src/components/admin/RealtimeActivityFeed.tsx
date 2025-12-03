import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Calendar, 
  CreditCard, 
  UserPlus, 
  AlertTriangle, 
  Shield,
  PawPrint,
  Store,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'appointment' | 'payment' | 'user' | 'alert' | 'security' | 'pet' | 'petshop';
  message: string;
  timestamp: Date;
  severity?: 'info' | 'success' | 'warning' | 'error';
}

const activityIcons = {
  appointment: Calendar,
  payment: CreditCard,
  user: UserPlus,
  alert: AlertTriangle,
  security: Shield,
  pet: PawPrint,
  petshop: Store,
};

const severityColors = {
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  success: 'bg-accent/10 text-accent border-accent/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function RealtimeActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLive, setIsLive] = useState(false);

  const addActivity = useCallback((activity: Omit<ActivityItem, 'id'>) => {
    setActivities(prev => [
      { ...activity, id: crypto.randomUUID() },
      ...prev.slice(0, 49) // Keep last 50 items
    ]);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('activity-feed-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, (payload) => {
        addActivity({
          type: 'appointment',
          message: 'Novo agendamento criado',
          timestamp: new Date(),
          severity: 'success',
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'appointments' }, (payload) => {
        const status = (payload.new as any)?.status;
        addActivity({
          type: 'appointment',
          message: `Agendamento ${status === 'completed' ? 'concluído' : status === 'cancelled' ? 'cancelado' : 'atualizado'}`,
          timestamp: new Date(),
          severity: status === 'completed' ? 'success' : status === 'cancelled' ? 'warning' : 'info',
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, () => {
        addActivity({
          type: 'payment',
          message: 'Novo pagamento registrado',
          timestamp: new Date(),
          severity: 'success',
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
        addActivity({
          type: 'user',
          message: 'Novo usuário registrado',
          timestamp: new Date(),
          severity: 'success',
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pets' }, () => {
        addActivity({
          type: 'pet',
          message: 'Novo pet cadastrado',
          timestamp: new Date(),
          severity: 'info',
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pet_shops' }, () => {
        addActivity({
          type: 'petshop',
          message: 'Nova pet shop registrada',
          timestamp: new Date(),
          severity: 'success',
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_alerts' }, (payload) => {
        const severity = (payload.new as any)?.severity;
        addActivity({
          type: 'alert',
          message: (payload.new as any)?.title || 'Novo alerta do sistema',
          timestamp: new Date(),
          severity: severity === 'critical' ? 'error' : severity === 'high' ? 'warning' : 'info',
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'login_attempts' }, (payload) => {
        const success = (payload.new as any)?.success;
        if (!success) {
          addActivity({
            type: 'security',
            message: 'Tentativa de login falhou',
            timestamp: new Date(),
            severity: 'warning',
          });
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'blocked_ips' }, () => {
        addActivity({
          type: 'security',
          message: 'IP bloqueado automaticamente',
          timestamp: new Date(),
          severity: 'error',
        });
      })
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addActivity]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade em Tempo Real
          </CardTitle>
          {isLive && (
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Live
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Clock className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Aguardando atividades...</p>
              <p className="text-xs opacity-70">As atividades aparecerão aqui em tempo real</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = activityIcons[activity.type];
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 animate-fade-in"
                  >
                    <div className={`p-2 rounded-full ${severityColors[activity.severity || 'info']}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
