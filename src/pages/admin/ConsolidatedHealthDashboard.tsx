import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAlerts } from '@/hooks/useAdminAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw, Server, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ConsolidatedHealthDashboard() {
  const { alerts, unreadCount } = useAdminAlerts();
  const [healthSummary, setHealthSummary] = useState<any>(null);
  const [failedJobsCount, setFailedJobsCount] = useState(0);
  const [recentMetrics, setRecentMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      // Buscar resumo de saúde
      const { data: summary, error: summaryError } = await supabase
        .rpc('get_system_health_summary');

      if (summaryError) throw summaryError;
      setHealthSummary(summary);

      // Buscar jobs falhados pendentes
      const { count: jobsCount } = await supabase
        .from('failed_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      setFailedJobsCount(jobsCount || 0);

      // Buscar métricas recentes (última hora)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: metrics, error: metricsError } = await supabase
        .from('system_health_metrics')
        .select('*')
        .gte('measured_at', oneHourAgo)
        .order('measured_at', { ascending: true });

      if (metricsError) throw metricsError;

      // Agrupar métricas por timestamp
      const grouped = metrics?.reduce((acc: any, curr: any) => {
        const key = new Date(curr.measured_at).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        if (!acc[key]) {
          acc[key] = { time: key };
        }
        acc[key][curr.metric_type] = curr.metric_value;
        return acc;
      }, {});

      setRecentMetrics(Object.values(grouped || {}));
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'critical':
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case 'critical':
      case 'down':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Activity className="h-8 w-8 text-gray-500" />;
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.resolved);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Consolidado de Saúde</h1>
          <p className="text-muted-foreground">
            Visão geral do status do sistema em tempo real
          </p>
        </div>
        
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Status Geral */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Status Geral do Sistema</CardTitle>
              <CardDescription>Avaliação consolidada de todos os componentes</CardDescription>
            </div>
            {healthSummary && getStatusIcon(healthSummary.overall_status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge 
              variant={healthSummary?.overall_status === 'healthy' ? 'default' : 'destructive'}
              className="text-lg px-4 py-2"
            >
              {healthSummary?.overall_status === 'healthy' ? '✓ OPERACIONAL' : 
               healthSummary?.overall_status === 'degraded' ? '⚠ DEGRADADO' : 
               '✗ CRÍTICO'}
            </Badge>
            
            {healthSummary?.uptime_percent && (
              <span className="text-sm text-muted-foreground">
                Uptime: {healthSummary.uptime_percent.toFixed(2)}%
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cards de Métricas Críticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas Críticos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {criticalAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Não resolvidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jobs Pendentes
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {failedJobsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando retry
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Latência API
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              healthSummary?.avg_api_latency_ms > 500 ? 'text-destructive' :
              healthSummary?.avg_api_latency_ms > 100 ? 'text-yellow-500' :
              'text-green-500'
            }`}>
              {healthSummary?.avg_api_latency_ms?.toFixed(0) || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Média (5min)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Erro
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              healthSummary?.error_rate_percent > 5 ? 'text-destructive' :
              healthSummary?.error_rate_percent > 1 ? 'text-yellow-500' :
              'text-green-500'
            }`}>
              {healthSummary?.error_rate_percent?.toFixed(2) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos 5min
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tendências (Última Hora) */}
      <Card>
        <CardHeader>
          <CardTitle>Tendências da Última Hora</CardTitle>
          <CardDescription>
            Métricas de performance em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentMetrics.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Coletando dados...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={recentMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="api_latency" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  name="Latência API (ms)"
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="error_rate" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.3}
                  name="Taxa de Erro (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Alertas Críticos Recentes */}
      {criticalAlerts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Alertas Críticos Ativos
            </CardTitle>
            <CardDescription>
              Requerem atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
