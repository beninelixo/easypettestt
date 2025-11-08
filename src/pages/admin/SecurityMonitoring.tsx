import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { AlertTriangle, CheckCircle2, Shield, RefreshCw, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SecurityMonitoring() {
  const { alerts, loginAttempts, loading, resolveAlert, runSecurityAnalysis } = useSecurityMonitoring();

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const criticalAlerts = unresolvedAlerts.filter(a => a.severity === 'critical');
  const recentFailedLogins = loginAttempts.filter(a => !a.success).slice(0, 20);
  const suspiciousIPs = Array.from(
    new Set(
      loginAttempts
        .filter(a => !a.success)
        .map(a => a.ip_address)
        .filter(Boolean)
    )
  ).slice(0, 10);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Monitoramento de Segurança
          </h1>
          <p className="text-muted-foreground mt-1">
            Dashboard em tempo real de alertas e atividades suspeitas
          </p>
        </div>
        <Button onClick={runSecurityAnalysis} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Executar Análise
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{criticalAlerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alertas Não Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{unresolvedAlerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Logins Falhados (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recentFailedLogins.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">IPs Suspeitos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{suspiciousIPs.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alertas Ativos</TabsTrigger>
          <TabsTrigger value="logins">Tentativas de Login</TabsTrigger>
          <TabsTrigger value="ips">IPs Suspeitos</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {unresolvedAlerts.length === 0 ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Tudo em Ordem</AlertTitle>
              <AlertDescription>
                Não há alertas de segurança pendentes no momento.
              </AlertDescription>
            </Alert>
          ) : (
            unresolvedAlerts.map((alert) => (
              <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>{alert.description}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolver
                    </Button>
                  </div>
                </AlertTitle>
                <AlertDescription className="space-y-2">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(alert.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                    {alert.ip_address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        IP: {alert.ip_address}
                      </span>
                    )}
                  </div>
                  {alert.metadata && (
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(alert.metadata, null, 2)}
                    </pre>
                  )}
                </AlertDescription>
              </Alert>
            ))
          )}
        </TabsContent>

        <TabsContent value="logins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tentativas de Login Falhadas Recentes</CardTitle>
              <CardDescription>Últimas 20 tentativas sem sucesso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentFailedLogins.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{attempt.email}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {format(new Date(attempt.attempt_time), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      {attempt.ip_address && (
                        <div className="text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {attempt.ip_address}
                        </div>
                      )}
                      <Badge variant="destructive">Falhou</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IPs com Atividade Suspeita</CardTitle>
              <CardDescription>IPs que geraram múltiplas tentativas de login falhadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suspiciousIPs.map((ip) => {
                  const ipAttempts = loginAttempts.filter(a => a.ip_address === ip && !a.success).length;
                  return (
                    <div key={ip} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-destructive" />
                        <span className="font-mono">{ip}</span>
                      </div>
                      <Badge variant="destructive">
                        {ipAttempts} tentativa{ipAttempts !== 1 ? 's' : ''} falhada{ipAttempts !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
