import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';
import { Activity, Cpu, HardDrive, Users, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function PerformanceDashboard() {
  const { metrics, loading, getLatestMetricValue, getMetricHistory } = useSystemMetrics();

  const responseTimeData = getMetricHistory('response_time').map(m => ({
    time: new Date(m.collected_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    value: Math.round(m.metric_value)
  }));

  const cpuData = getMetricHistory('cpu_usage').map(m => ({
    time: new Date(m.collected_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    value: Math.round(m.metric_value)
  }));

  const memoryData = getMetricHistory('memory_usage').map(m => ({
    time: new Date(m.collected_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    value: Math.round(m.metric_value)
  }));

  const errorRateData = getMetricHistory('error_rate').map(m => ({
    time: new Date(m.collected_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    value: Number(m.metric_value.toFixed(2))
  }));

  const statCards = [
    {
      title: 'Tempo de Resposta',
      value: `${Math.round(getLatestMetricValue('response_time'))}ms`,
      icon: Zap,
      description: 'Média atual',
      color: 'text-blue-500'
    },
    {
      title: 'Uso de CPU',
      value: `${Math.round(getLatestMetricValue('cpu_usage'))}%`,
      icon: Cpu,
      description: 'Utilização atual',
      color: 'text-green-500'
    },
    {
      title: 'Uso de Memória',
      value: `${Math.round(getLatestMetricValue('memory_usage'))}%`,
      icon: HardDrive,
      description: 'RAM utilizada',
      color: 'text-orange-500'
    },
    {
      title: 'Usuários Ativos',
      value: Math.round(getLatestMetricValue('active_users')),
      icon: Users,
      description: 'Última hora',
      color: 'text-purple-500'
    },
  ];

  if (loading && metrics.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
            <p className="text-muted-foreground">Métricas em tempo real do sistema</p>
          </div>
        </div>
        <div className="text-center py-12">Carregando métricas...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Performance</h1>
          <p className="text-muted-foreground">Métricas em tempo real do sistema</p>
        </div>
        <Activity className="h-8 w-8 text-primary" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time */}
        <Card>
          <CardHeader>
            <CardTitle>Tempo de Resposta</CardTitle>
            <CardDescription>Últimas medições (ms)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CPU Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Uso de CPU</CardTitle>
            <CardDescription>Porcentagem de utilização</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={cpuData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--chart-1))" 
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Uso de Memória</CardTitle>
            <CardDescription>Porcentagem de RAM utilizada</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--chart-2))" 
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Erros</CardTitle>
            <CardDescription>Porcentagem de erros</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={errorRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
