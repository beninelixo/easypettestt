import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { useSecurityReport } from "@/hooks/useSecurityReport";
import { AlertTriangle, CheckCircle, Clock, Shield, Activity, Ban, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SecurityMonitoring() {
  const {
    alerts,
    loginAttempts,
    blockedIps,
    loading,
    resolveAlert,
    unblockIp,
    runSecurityAnalysis,
  } = useSecurityMonitoring();

  const { loading: reportLoading, generateReport } = useSecurityReport();

  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento de Segurança</h1>
          <p className="text-muted-foreground">
            Acompanhe alertas, tentativas de login e atividades suspeitas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => generateReport({ report_type: 'monthly' })} 
            disabled={reportLoading}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Relatório PDF
          </Button>
          <Button onClick={runSecurityAnalysis} disabled={loading}>
            <Activity className="mr-2 h-4 w-4" />
            Executar Análise
          </Button>
        </div>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="logins">Tentativas de Login</TabsTrigger>
          <TabsTrigger value="blocked">IPs Bloqueados</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Segurança
              </CardTitle>
              <CardDescription>
                {unresolvedCount > 0 ? (
                  <span className="text-destructive font-semibold">
                    {unresolvedCount} alerta(s) não resolvido(s)
                  </span>
                ) : (
                  "Nenhum alerta pendente"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum alerta registrado
                </p>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getSeverityVariant(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <span className="font-semibold">{alert.alert_type}</span>
                        {alert.resolved && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {alert.description}
                      </p>
                      {alert.ip_address && (
                        <p className="text-xs text-muted-foreground">
                          IP: {alert.ip_address}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {format(new Date(alert.created_at), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    {!alert.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolver
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Tentativas de Login Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loginAttempts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma tentativa registrada
                  </p>
                ) : (
                  loginAttempts.slice(0, 20).map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{attempt.email}</p>
                        <p className="text-xs text-muted-foreground">
                          IP: {attempt.ip_address || "N/A"} •{" "}
                          {format(new Date(attempt.attempt_time), "dd/MM HH:mm")}
                        </p>
                      </div>
                      <Badge
                        variant={attempt.success ? "default" : "destructive"}
                      >
                        {attempt.success ? "Sucesso" : "Falhou"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5" />
                IPs Bloqueados
              </CardTitle>
              <CardDescription>
                {blockedIps.length} IP(s) bloqueado(s) atualmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {blockedIps.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum IP bloqueado
                  </p>
                ) : (
                  blockedIps.map((ip) => (
                    <div
                      key={ip.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{ip.ip_address}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {ip.reason}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>
                            Bloqueado: {format(new Date(ip.blocked_at), "dd/MM/yyyy HH:mm")}
                          </span>
                          <span>
                            Até: {format(new Date(ip.blocked_until), "dd/MM/yyyy HH:mm")}
                          </span>
                        </div>
                        {ip.auto_blocked && (
                          <Badge variant="outline" className="mt-2">
                            Bloqueio Automático
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unblockIp(ip.ip_address)}
                      >
                        Desbloquear
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
