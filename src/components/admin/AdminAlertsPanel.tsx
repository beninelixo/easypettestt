import { Bell, CheckCheck, AlertTriangle, XCircle, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdminAlerts } from '@/hooks/useAdminAlerts';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export const AdminAlertsPanel = () => {
  const { alerts, unreadCount, loading, markAsRead, markAllAsRead, resolveAlert } = useAdminAlerts();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'emergency': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'destructive';
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Alertas Administrativos
          </SheetTitle>
          <SheetDescription>
            {unreadCount > 0 
              ? `${unreadCount} ${unreadCount === 1 ? 'alerta não lido' : 'alertas não lidos'}`
              : 'Todos os alertas foram lidos'}
          </SheetDescription>
        </SheetHeader>

        {unreadCount > 0 && (
          <div className="mt-4">
            <Button onClick={markAllAsRead} variant="outline" size="sm" className="w-full">
              <CheckCheck className="mr-2 h-4 w-4" />
              Marcar todos como lidos
            </Button>
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-200px)] mt-6">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando alertas...
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>Nenhum alerta no momento</p>
                <p className="text-sm">Sistema operando normalmente</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`${!alert.read ? 'border-l-4 border-l-primary bg-accent/50' : ''} ${alert.resolved ? 'opacity-50' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(alert.severity)}
                        <CardTitle className="text-base">{alert.title}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getSeverityColor(alert.severity) as any}>
                          {alert.severity}
                        </Badge>
                        {alert.resolved && (
                          <Badge variant="outline" className="bg-green-50">
                            Resolvido
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleString()} 
                      {alert.source_module && ` • ${alert.source_module}`}
                      {alert.source_function && ` • ${alert.source_function}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">{alert.message}</p>
                    
                    {alert.context && Object.keys(alert.context).length > 0 && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-xs font-mono">
                          {JSON.stringify(alert.context, null, 2)}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {!alert.read && (
                        <Button 
                          onClick={() => markAsRead(alert.id)} 
                          variant="outline" 
                          size="sm"
                        >
                          <CheckCheck className="mr-2 h-4 w-4" />
                          Marcar como lido
                        </Button>
                      )}
                      {!alert.resolved && (
                        <Button 
                          onClick={() => resolveAlert(alert.id)} 
                          variant="default" 
                          size="sm"
                        >
                          Resolver
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
