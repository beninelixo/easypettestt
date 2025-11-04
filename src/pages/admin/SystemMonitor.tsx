import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SystemMonitor() {
  const { data: healthCheck, isLoading: healthLoading } = useQuery({
    queryKey: ['system-health-check'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('worker-healthcheck');
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('monitoramento_sistema')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Monitor do Sistema</h1>
        <Badge variant={healthCheck?.status === 'healthy' ? 'default' : 'destructive'}>
          {healthCheck?.status || 'Carregando...'}
        </Badge>
      </div>

      {/* Health Check Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {healthCheck?.checks?.map((check: any, idx: number) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(check.status)}
                          <h3 className="font-semibold capitalize">
                            {check.service.replace(/_/g, ' ')}
                          </h3>
                        </div>
                        <p className={`text-sm font-medium ${getStatusColor(check.status)}`}>
                          {check.status}
                        </p>
                        {check.latency && (
                          <p className="text-xs text-muted-foreground">
                            Latência: {check.latency}ms
                          </p>
                        )}
                        {check.metric !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            Métrica: {check.metric}
                          </p>
                        )}
                        {check.error && (
                          <p className="text-xs text-destructive">
                            Erro: {check.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {metrics?.map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(metric.status)}
                    <div>
                      <div className="font-medium">{metric.service_name}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {metric.metric_type.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{metric.value}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(metric.timestamp).toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-sm text-muted-foreground">Database</div>
                <div className="text-2xl font-bold">Online</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm text-muted-foreground">Notificações</div>
                <div className="text-2xl font-bold">Ativas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">Workers</div>
                <div className="text-2xl font-bold">Running</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
