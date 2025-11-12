import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Activity, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Clock, Zap, Database, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface HealthMetric {
  id: string;
  metric_type: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string | null;
  status: 'healthy' | 'degraded' | 'critical' | 'down' | null;
  threshold_warning?: number | null;
  threshold_critical?: number | null;
  measured_at: string;
  created_at: string;
}

interface HealthSummary {
  overall_status: string;
  critical_count: number;
  degraded_count: number;
  avg_api_latency_ms: number;
  error_rate_percent: number;
  uptime_percent: number;
  failed_jobs_pending: number;
  unread_critical_alerts: number;
}

export default function SystemHealthDashboard() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('system_health_metrics')
        .select('*')
        .gte('measured_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order('measured_at', { ascending: true });

      if (error) throw error;
      setMetrics(data as any as HealthMetric[] || []);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const { data, error } = await supabase.rpc('get_system_health_summary');
      if (error) throw error;
      setSummary(data as any as HealthSummary);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const collectMetrics = async () => {
    setCollecting(true);
    try {
      const { error } = await supabase.functions.invoke('collect-health-metrics');
      
      if (error) throw error;

      toast({
        title: '✅ Métricas Coletadas',
        description: 'Métricas de saúde do sistema atualizadas com sucesso',
      });

      await fetchMetrics();
      await fetchSummary();
    } catch (error: any) {
      toast({
        title: '❌ Erro ao Coletar Métricas',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setCollecting(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchSummary();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('health_metrics_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_health_metrics'
        },
        () => {
          fetchMetrics();
          fetchSummary();
        }
      )
      .subscribe();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMetrics();
      fetchSummary();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      case 'down': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'down': return <XCircle className="h-5 w-5 text-gray-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  // Group metrics by type for charts
  const apiLatencyData = metrics
    .filter(m => m.metric_type === 'api_latency')
    .map(m => ({
      time: new Date(m.measured_at).toLocaleTimeString(),
      value: m.metric_value
    }));

  const errorRateData = metrics
    .filter(m => m.metric_type === 'error_rate')
    .map(m => ({
      time: new Date(m.measured_at).toLocaleTimeString(),
      value: m.metric_value
    }));

  const uptimeData = metrics
    .filter(m => m.metric_type === 'uptime')
    .map(m => ({
      time: new Date(m.measured_at).toLocaleTimeString(),
      value: m.metric_value
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Saúde do Sistema</h1>
          <p className="text-muted-foreground">Monitoramento em tempo real de performance e disponibilidade</p>
        </div>
        <Button onClick={collectMetrics} disabled={collecting}>
          <RefreshCw className={`mr-2 h-4 w-4 ${collecting ? 'animate-spin' : ''}`} />
          {collecting ? 'Coletando...' : 'Coletar Métricas'}
        </Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
            {summary && getStatusIcon(summary.overall_status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{summary?.overall_status || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.critical_count || 0} críticos, {summary?.degraded_count || 0} degradados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latência API</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.avg_api_latency_ms?.toFixed(0) || '0'} ms</div>
            <p className="text-xs text-muted-foreground">Média últimos 5min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.error_rate_percent?.toFixed(2) || '0'}%</div>
            <p className="text-xs text-muted-foreground">Últimos 5 minutos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.uptime_percent?.toFixed(2) || '100'}%</div>
            <p className="text-xs text-muted-foreground">Última 1 hora</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Latency Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Latência da API
            </CardTitle>
            <CardDescription>Tempo de resposta em milissegundos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={apiLatencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#0F766E" fill="#14B8A6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Error Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Taxa de Erro
            </CardTitle>
            <CardDescription>Porcentagem de requisições com erro</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={errorRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Uptime Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Uptime do Sistema
          </CardTitle>
          <CardDescription>Disponibilidade do sistema ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={uptimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[90, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#10B981" fill="#34D399" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Additional System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Jobs Falhados Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.failed_jobs_pending || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Aguardando retry automático</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Alertas Críticos Não Lidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{summary?.unread_critical_alerts || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Requerem atenção imediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Última Atualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {metrics[metrics.length - 1] 
                ? new Date(metrics[metrics.length - 1].measured_at).toLocaleString()
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Atualização automática a cada 30s</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
