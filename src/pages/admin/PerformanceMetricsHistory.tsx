import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

export default function PerformanceMetricsHistory() {
  const [timeRange, setTimeRange] = useState<string>('7');
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const daysAgo = parseInt(timeRange);
      const startDate = subDays(new Date(), daysAgo).toISOString();

      const { data, error } = await supabase
        .from('system_health_metrics')
        .select('*')
        .gte('measured_at', startDate)
        .order('measured_at', { ascending: true });

      if (error) throw error;

      // Agrupar métricas por timestamp
      const grouped = data?.reduce((acc: any, curr: any) => {
        const key = format(new Date(curr.measured_at), 'yyyy-MM-dd HH:mm');
        if (!acc[key]) {
          acc[key] = {
            timestamp: key,
            date: format(new Date(curr.measured_at), 'dd/MM HH:mm', { locale: ptBR })
          };
        }
        acc[key][curr.metric_type] = curr.metric_value;
        return acc;
      }, {});

      setMetrics(Object.values(grouped || {}));
    } catch (error: any) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(loadMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const latestMetrics = metrics[metrics.length - 1] || {};

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Performance</h1>
          <p className="text-muted-foreground">
            Análise de tendências e métricas dos últimos dias
          </p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Últimas 24 horas</SelectItem>
            <SelectItem value="3">Últimos 3 dias</SelectItem>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="14">Últimos 14 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Latência API Média
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics.api_latency?.toFixed(0) || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Último registro
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Erro
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics.error_rate?.toFixed(2) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Último registro
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Uptime
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics.uptime?.toFixed(2) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Última hora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Ativos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics.active_users || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos 5 minutos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Latência da API */}
      <Card>
        <CardHeader>
          <CardTitle>Latência da API</CardTitle>
          <CardDescription>
            Tempo de resposta das requisições (ms)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Carregando dados...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="api_latency" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  name="Latência API (ms)"
                />
                <Area 
                  type="monotone" 
                  dataKey="database_latency" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                  name="Latência DB (ms)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Taxa de Erro */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Erro</CardTitle>
          <CardDescription>
            Porcentagem de requisições com erro (%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Carregando dados...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="error_rate" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Taxa de Erro (%)"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Uptime */}
      <Card>
        <CardHeader>
          <CardTitle>Uptime do Sistema</CardTitle>
          <CardDescription>
            Disponibilidade do sistema (%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              Carregando dados...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis domain={[95, 100]} />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="uptime" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                  name="Uptime (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
