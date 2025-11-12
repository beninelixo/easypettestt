import { Bell, Check, CheckCheck, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminAlerts } from "@/hooks/useAdminAlerts";
import { cn } from "@/lib/utils";

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "emergency":
    case "critical":
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    case "info":
    default:
      return <Info className="h-5 w-5 text-primary" />;
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "emergency":
      return <Badge variant="destructive">EMERGÊNCIA</Badge>;
    case "critical":
      return <Badge variant="destructive">CRÍTICO</Badge>;
    case "warning":
      return <Badge className="bg-yellow-600 hover:bg-yellow-700">AVISO</Badge>;
    case "info":
    default:
      return <Badge variant="outline">INFO</Badge>;
  }
};

export const AdminNotificationsPanel = () => {
  const { alerts, unreadCount, loading, markAsRead, markAllAsRead, resolveAlert } = useAdminAlerts();

  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive hover:bg-destructive/90 text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <h3 className="font-semibold text-lg">Alertas do Sistema</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-7"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[500px]">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="h-12 w-12 text-muted-foreground mb-3 opacity-30" />
              <p className="text-muted-foreground text-sm text-center">
                Nenhum alerta no momento
              </p>
              <p className="text-muted-foreground text-xs text-center mt-1">
                Você será notificado quando houver eventos críticos
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors",
                    !alert.read && "bg-primary/5 border-l-4 border-l-primary",
                    alert.resolved && "opacity-60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm leading-tight">
                          {alert.title}
                        </h4>
                        {getSeverityBadge(alert.severity)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {alert.message}
                      </p>

                      {alert.source_module && (
                        <p className="text-xs text-muted-foreground">
                          📍 Módulo: {alert.source_module}
                          {alert.source_function && ` → ${alert.source_function}`}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(alert.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                        
                        <div className="flex gap-1">
                          {!alert.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(alert.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Lida
                            </Button>
                          )}
                          
                          {!alert.resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                              className="h-6 px-2 text-xs text-green-600 hover:text-green-700"
                            >
                              <CheckCheck className="h-3 w-3 mr-1" />
                              Resolver
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
