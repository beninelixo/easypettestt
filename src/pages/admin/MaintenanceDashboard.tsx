import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMaintenanceStatus } from '@/hooks/useMaintenanceStatus';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Wrench,
  Database,
  Zap,
  Shield,
  Gauge
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MaintenanceDashboard() {
  const { latestReport, recentActions, loading, error, refreshReport, triggerHealthCheck } = useMaintenanceStatus();
  const { toast } = useToast();
  const [executing, setExecuting] = useState(false);

  const handleTriggerHealthCheck = async () => {
    try {
      setExecuting(true);
      await triggerHealthCheck();
      toast({
        title: 'Health Check Executado',
        description: 'Varredura completa do sistema concluída com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao Executar Health Check',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setExecuting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      warning: 'outline',
      critical: 'destructive',
    } as const;

    const labels = {
      healthy: 'Saudável',
      warning: 'Atenção',
      critical: 'Crítico',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  if (loading && !latestReport) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Erro ao Carregar Dashboard
            </CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshReport} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!latestReport) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Nenhum Relatório Disponível</CardTitle>
            <CardDescription>
              Execute um health check para gerar o primeiro relatório de manutenção.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTriggerHealthCheck} disabled={executing}>
              <PlayCircle className="h-4 w-4 mr-2" />
              {executing ? 'Executando...' : 'Executar Health Check Agora'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const checks = latestReport.checks || {};
  const metrics = latestReport.metrics || {};

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manutenção Automática</h1>
          <p className="text-muted-foreground">
            Sistema de monitoramento e manutenção diária do EasyPet
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshReport} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleTriggerHealthCheck} disabled={executing} size="sm">
            <PlayCircle className="h-4 w-4 mr-2" />
            {executing ? 'Executando...' : 'Executar Agora'}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
            {getStatusIcon(latestReport.overall_status)}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {getStatusBadge(latestReport.overall_status)}
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(latestReport.health_score)}`}>
                  {latestReport.health_score}/100
                </div>
                <p className="text-xs text-muted-foreground">Health Score</p>
              </div>
            </div>
            {latestReport.comparison_to_yesterday && (
              <div className="mt-2 flex items-center gap-1 text-sm">
                {getTrendIcon(latestReport.comparison_to_yesterday.performance_change)}
                <span className="text-muted-foreground">
                  {Math.abs(latestReport.comparison_to_yesterday.performance_change)} pts vs ontem
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Check */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Verificação</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(parseISO(latestReport.created_at), 'HH:mm', { locale: ptBR })}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(parseISO(latestReport.created_at), "dd 'de' MMMM", { locale: ptBR })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Próxima: Hoje às 03:00
            </p>
          </CardContent>
        </Card>

        {/* Actions Taken */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Automáticas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestReport.actions_taken?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              executadas hoje
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {recentActions.filter(a => a.status === 'completed').length} últimas 24h
            </p>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recomendações</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestReport.recommendations?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              pendentes
            </p>
            {latestReport.recommendations && latestReport.recommendations.length > 0 && (
              <Badge variant="outline" className="mt-2">
                Revisar
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health Checks Details */}
      <Card>
        <CardHeader>
          <CardTitle>Verificações de Saúde</CardTitle>
          <CardDescription>Status de cada componente do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Database */}
            {checks.database && (
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Database className="h-5 w-5 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Banco de Dados</p>
                    {getStatusBadge(checks.database.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Latência: {(checks.database as any).latency_ms}ms
                  </p>
                  {(checks.database as any).error && (
                    <p className="text-sm text-destructive mt-1">{(checks.database as any).error}</p>
                  )}
                </div>
              </div>
            )}

            {/* Security */}
            {checks.security && (
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Shield className="h-5 w-5 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Segurança</p>
                    {getStatusBadge(checks.security.status)}
                  </div>
                  {(checks.security as any).details && (
                    <p className="text-sm text-muted-foreground">
                      Alertas: {(checks.security as any).details.unresolved_alerts || 0}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Performance */}
            {checks.performance && (
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Gauge className="h-5 w-5 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Performance</p>
                    {getStatusBadge(checks.performance.status)}
                  </div>
                  {(checks.performance as any).details && (
                    <p className="text-sm text-muted-foreground">
                      Error Rate: {(checks.performance as any).details.error_rate_percent}%
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Edge Functions */}
            {Object.entries(checks).filter(([key]) => key.startsWith('edge_function_')).map(([key, check]: [string, any]) => (
              <div key={key} className="flex items-start gap-3 p-3 border rounded-lg">
                <Zap className="h-5 w-5 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{key.replace('edge_function_', '')}</p>
                    {getStatusBadge(check.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Latência: {(check as any).latency_ms}ms
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics as any).total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{(metrics as any).new_users_today || 0} novos hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Agendamentos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics as any).appointments_today || 0}</div>
            <p className="text-xs text-muted-foreground">
              {(metrics as any).total_appointments || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Receita Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {((metrics as any).revenue_today || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {(metrics as any).errors_today || 0} erros registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {latestReport.recommendations && latestReport.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
            <CardDescription>Ações sugeridas para melhorar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {latestReport.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recent Actions */}
      {recentActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ações Automáticas Recentes</CardTitle>
            <CardDescription>Últimas 24 horas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActions.slice(0, 10).map((action) => (
                <div key={action.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{action.action_description}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.created_at && format(parseISO(action.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant={action.status === 'completed' ? 'default' : action.status === 'failed' ? 'destructive' : 'outline'}>
                    {action.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
