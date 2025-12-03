import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { useBackupManagement } from "@/hooks/useBackupManagement";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { useSecurityReport } from "@/hooks/useSecurityReport";
import { Shield, Database, FileText, Activity, AlertTriangle, CheckCircle, Download, Clock, TrendingUp, Radio, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function ConsolidatedSecurityDashboard() {
  const navigate = useNavigate();
  const { 
    alerts, 
    loginAttempts, 
    blockedIps,
    isLive: securityLive,
    failedLogins24h,
    criticalAlerts,
    unresolvedAlerts,
    activeBlockedIps,
    runSecurityAnalysis,
    loadAll: refreshSecurity
  } = useSecurityMonitoring();
  const { backups, createBackup, loadBackups } = useBackupManagement();
  const { logs, isLive: auditLive, recentLogs, loadLogs } = useAuditLogs();
  const { loading: reportLoading, generateReport } = useSecurityReport();

  const lastBackup = backups.find(b => b.status === 'completed');
  const totalBackups = backups.filter(b => b.status === 'completed').length;
  const isLive = securityLive || auditLive;

  const handleRefreshAll = async () => {
    await Promise.all([refreshSecurity(), loadBackups(), loadLogs()]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Segurança</h1>
            <p className="text-muted-foreground">
              Visão consolidada de segurança, backups e auditoria
            </p>
          </div>
          {isLive && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 animate-pulse">
              <Radio className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefreshAll}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => generateReport({ report_type: 'monthly' })} 
            disabled={reportLoading}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Relatório PDF
          </Button>
          <Button onClick={runSecurityAnalysis} variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Analisar
          </Button>
          <Button onClick={createBackup}>
            <Database className="mr-2 h-4 w-4" />
            Backup
          </Button>
        </div>
      </div>

      {/* Overview Cards with Live Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className={cn(
          "transition-all duration-300",
          criticalAlerts > 0 && "border-destructive bg-destructive/5"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-bold",
              criticalAlerts > 0 ? "text-destructive" : "text-green-600"
            )}>
              {criticalAlerts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {unresolvedAlerts} não resolvidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Logins Falhados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-bold",
              failedLogins24h > 10 ? "text-amber-500" : "text-foreground"
            )}>
              {failedLogins24h}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              IPs Bloqueados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-bold",
              activeBlockedIps > 0 ? "text-amber-500" : "text-foreground"
            )}>
              {activeBlockedIps}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ativos no momento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalBackups}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {lastBackup && format(new Date(lastBackup.started_at), "dd/MM HH:mm", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registros totais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => navigate('/admin/security-monitoring')}
        >
          <Shield className="h-6 w-6 text-primary" />
          Dashboard de Segurança Completo
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => navigate('/admin/backups')}
        >
          <Database className="h-6 w-6 text-green-600" />
          Gerenciamento de Backups
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => navigate('/user-profile')}
        >
          <FileText className="h-6 w-6 text-blue-600" />
          Configurar MFA
        </Button>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            Alertas Recentes
            {unresolvedAlerts > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unresolvedAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="logins">Tentativas de Login</TabsTrigger>
          <TabsTrigger value="backups">Últimos Backups</TabsTrigger>
          <TabsTrigger value="audit">Logs de Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimos Alertas de Segurança</CardTitle>
              <CardDescription>5 alertas mais recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum alerta encontrado
                  </p>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {alert.resolved ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className={cn(
                            "h-5 w-5",
                            alert.severity === 'critical' ? "text-destructive" : "text-amber-500"
                          )} />
                        )}
                        <div>
                          <div className="font-medium">{alert.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(alert.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tentativas de Login Recentes</CardTitle>
              <CardDescription>Últimas 10 tentativas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loginAttempts.slice(0, 10).map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {attempt.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <div className="font-medium">{attempt.email}</div>
                        <div className="text-sm text-muted-foreground">
                          IP: {attempt.ip_address || 'N/A'} • {format(new Date(attempt.attempt_time), "dd/MM HH:mm:ss", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    <Badge variant={attempt.success ? 'default' : 'destructive'}>
                      {attempt.success ? 'SUCESSO' : 'FALHOU'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Backups Recente</CardTitle>
              <CardDescription>5 backups mais recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {backups.slice(0, 5).map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium font-mono text-sm">{backup.backup_id}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {format(new Date(backup.started_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {backup.total_records.toLocaleString('pt-BR')} registros
                      </div>
                      <Badge variant={backup.status === 'completed' ? 'default' : 'destructive'}>
                        {backup.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Logs de Auditoria Recentes
                {auditLive && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs">
                    LIVE
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>10 ações mais recentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">
                          {log.operation} em {log.table_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{log.operation}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Resumo de Saúde do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Status de Segurança</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {criticalAlerts === 0 ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Saudável
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    Atenção
                  </>
                )}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Sistema de Backup</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Operacional
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Auditoria</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Ativa
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
