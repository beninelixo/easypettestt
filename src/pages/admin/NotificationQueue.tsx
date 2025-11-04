import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Play, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationQueue() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: queueStats, isLoading: statsLoading } = useQuery({
    queryKey: ['notification-queue-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_notification_queue_stats');
      if (error) throw error;
      return data as {
        pending: number;
        processing: number;
        failed: number;
        retrying: number;
        sent_today: number;
        failed_today: number;
      };
    },
    refetchInterval: 5000,
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  const runWorker = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('worker-notifications');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: '✅ Worker executado',
        description: `Processadas: ${data.processed} | Enviadas: ${data.sent} | Falhas: ${data.failed}`,
      });
      queryClient.invalidateQueries({ queryKey: ['notification-queue-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-log'] });
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Erro ao executar worker',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const requeueNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase.functions.invoke('requeue-notification', {
        body: { notificationId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: '✅ Notificação reenfileirada' });
      queryClient.invalidateQueries({ queryKey: ['notifications-log'] });
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Erro ao reenfileirar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      pending: { variant: 'secondary', icon: RefreshCw },
      processing: { variant: 'default', icon: RefreshCw },
      sent: { variant: 'default', icon: CheckCircle },
      failed: { variant: 'destructive', icon: AlertCircle },
      retrying: { variant: 'outline', icon: RotateCcw },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fila de Notificações</h1>
        <Button onClick={() => runWorker.mutate()} disabled={runWorker.isPending}>
          <Play className="h-4 w-4 mr-2" />
          {runWorker.isPending ? 'Executando...' : 'Executar Worker'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{queueStats?.pending || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Processando</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{queueStats?.processing || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Falhadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{queueStats?.failed || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Retentando</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{queueStats?.retrying || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Enviadas Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{queueStats?.sent_today || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Falhas Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{queueStats?.failed_today || 0}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          {notificationsLoading ? (
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {notifications?.map((notif) => (
                <div key={notif.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(notif.status)}
                      <Badge variant="outline">{notif.channel}</Badge>
                      <span className="text-sm text-muted-foreground">{notif.recipient}</span>
                    </div>
                    <p className="text-sm">{notif.message.substring(0, 100)}...</p>
                    {notif.last_error && (
                      <p className="text-xs text-destructive">Erro: {notif.last_error}</p>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Tentativas: {notif.attempt_count}/{notif.max_attempts}</span>
                      <span>Criado: {new Date(notif.created_at).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  {(notif.status === 'failed' || notif.status === 'retrying') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => requeueNotification.mutate(notif.id)}
                      disabled={requeueNotification.isPending}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reprocessar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
