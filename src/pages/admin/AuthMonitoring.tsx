import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuthMonitor } from "@/hooks/useAuthMonitor";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export default function AuthMonitoring() {
  const { events, loading, refresh } = useAuthMonitor();

  const getEventIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getEventBadge = (type: string) => {
    const variants: Record<string, any> = {
      login: 'default',
      logout: 'secondary',
      token_refresh: 'outline',
      role_fetch: 'secondary',
    };
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento de Autenticação</h1>
          <p className="text-muted-foreground">
            Logs em tempo real de eventos de autenticação e origem de roles
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos Recentes</CardTitle>
          <CardDescription>
            Últimos 100 eventos de autenticação do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Carregando...</p>
          ) : events.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum evento registrado ainda.</p>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.event_status)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getEventBadge(event.event_type)}
                        <Badge variant={event.event_status === 'success' ? 'default' : 'destructive'}>
                          {event.event_status}
                        </Badge>
                        {event.role_source && (
                          <Badge variant="outline">{event.role_source}</Badge>
                        )}
                        {event.user_role && (
                          <Badge>{event.user_role}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        User ID: {event.user_id || 'N/A'}
                      </p>
                      {event.ip_address && (
                        <p className="text-xs text-muted-foreground">
                          IP: {event.ip_address}
                        </p>
                      )}
                      {event.error_message && (
                        <p className="text-sm text-red-500">{event.error_message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
