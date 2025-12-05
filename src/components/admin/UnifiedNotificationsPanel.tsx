import { useState, useEffect } from 'react';
import { Bell, Shield, Activity, Check, CheckCheck, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAdminAlerts } from '@/hooks/useAdminAlerts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SecurityNotification {
  id: string;
  notification_type: string;
  severity: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function UnifiedNotificationsPanel() {
  const { toast } = useToast();
  const { alerts, unreadCount: alertsUnread, markAsRead, markAllAsRead, resolveAlert, refetch } = useAdminAlerts();
  const [securityNotifications, setSecurityNotifications] = useState<SecurityNotification[]>([]);
  const [securityUnread, setSecurityUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts');

  // Load security notifications
  useEffect(() => {
    loadSecurityNotifications();

    const channel = supabase
      .channel('unified-security-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'security_notifications' },
        (payload) => {
          const newNotification = payload.new as SecurityNotification;
          setSecurityNotifications(prev => [newNotification, ...prev]);
          setSecurityUnread(prev => prev + 1);
          
          if (newNotification.severity === 'critical') {
            toast({
              title: "🚨 Alerta de Segurança",
              description: newNotification.title,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const loadSecurityNotifications = async () => {
    const { data, error } = await supabase
      .from('security_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data) {
      setSecurityNotifications(data);
      setSecurityUnread(data.filter(n => !n.read).length);
    }
  };

  const markSecurityAsRead = async (id: string) => {
    await supabase
      .from('security_notifications')
      .update({ read: true })
      .eq('id', id);

    setSecurityNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setSecurityUnread(prev => Math.max(0, prev - 1));
  };

  const totalUnread = alertsUnread + securityUnread;

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'emergency':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'high':
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'emergency':
        return 'border-l-destructive bg-destructive/5';
      case 'high':
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-500/5';
      default:
        return 'border-l-blue-500 bg-blue-500/5';
    }
  };

  const formatTime = (date: string) => {
    try {
      return format(new Date(date), "dd/MM HH:mm", { locale: ptBR });
    } catch {
      return '';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label={`Notificações - ${totalUnread} não lidas`}
        >
          <Bell className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-xs animate-pulse"
            >
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Central de Notificações</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              markAllAsRead();
              setSecurityNotifications(prev => prev.map(n => ({ ...n, read: true })));
              setSecurityUnread(0);
            }}
            className="text-xs"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Marcar todas
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 p-1 m-2 mr-4">
            <TabsTrigger value="alerts" className="relative text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Alertas
              {alertsUnread > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 min-w-[16px] px-1 text-[10px]">
                  {alertsUnread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="security" className="relative text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Segurança
              {securityUnread > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 min-w-[16px] px-1 text-[10px]">
                  {securityUnread}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="m-0">
            <ScrollArea className="h-80">
              {alerts.length > 0 ? (
                <div className="space-y-1 p-2">
                  {alerts.slice(0, 20).map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "p-3 rounded-lg border-l-4 transition-all cursor-pointer hover:bg-muted/50",
                        getSeverityClass(alert.severity),
                        !alert.read && "bg-muted/30"
                      )}
                      onClick={() => !alert.read && markAsRead(alert.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {getSeverityIcon(alert.severity)}
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm truncate", !alert.read && "font-medium")}>
                              {alert.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {alert.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-muted-foreground">
                                {formatTime(alert.created_at)}
                              </span>
                              {alert.source_module && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0">
                                  {alert.source_module}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {!alert.resolved && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              resolveAlert(alert.id);
                            }}
                            aria-label="Resolver alerta"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Nenhum alerta</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="security" className="m-0">
            <ScrollArea className="h-80">
              {securityNotifications.length > 0 ? (
                <div className="space-y-1 p-2">
                  {securityNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border-l-4 transition-all cursor-pointer hover:bg-muted/50",
                        getSeverityClass(notification.severity),
                        !notification.read && "bg-muted/30"
                      )}
                      onClick={() => !notification.read && markSecurityAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-2">
                        {getSeverityIcon(notification.severity)}
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm truncate", !notification.read && "font-medium")}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">
                              {formatTime(notification.created_at)}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                              {notification.notification_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Shield className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma notificação de segurança</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
