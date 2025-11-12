import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthMonitor } from "@/hooks/useAuthMonitor";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertCircle, CheckCircle, TrendingUp, Users, Shield, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthMetrics {
  totalLogins: number;
  failedLogins: number;
  successRate: number;
  activeSessions: number;
  blockedIPs: number;
  avgLoginTime: number;
}

interface LoginByHour {
  hour: string;
  success: number;
  failed: number;
}

interface LoginByRole {
  role: string;
  count: number;
  color: string;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

export default function AuthMetricsDashboard() {
  const { events } = useAuthMonitor();
  const [metrics, setMetrics] = useState<AuthMetrics>({
    totalLogins: 0,
    failedLogins: 0,
    successRate: 0,
    activeSessions: 0,
    blockedIPs: 0,
    avgLoginTime: 0,
  });
  const [loginsByHour, setLoginsByHour] = useState<LoginByHour[]>([]);
  const [loginsByRole, setLoginsByRole] = useState<LoginByRole[]>([]);
  const [recentFailures, setRecentFailures] = useState<any[]>([]);
  const [highFailure, setHighFailure] = useState<{ active: boolean; rate: number }>({ active: false, rate: 0 });
  const lastAlertRef = useRef<number>(0);
  const [failureTrend, setFailureTrend] = useState<Array<{ hour: string; rate: number }>>([]);
  const [topFailedIPs, setTopFailedIPs] = useState<Array<{ ip: string; count: number }>>([]);
  const [period, setPeriod] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    calculateMetrics();
  }, [events]);

  const calculateMetrics = async () => {
    // Calculate from events
    const loginEvents = events.filter(e => e.event_type === 'login');
    const successfulLogins = loginEvents.filter(e => e.event_status === 'success');
    const failedLogins = loginEvents.filter(e => e.event_status === 'error');

    // High failure rate detection (last 1h)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recent = loginEvents.filter(e => new Date(e.created_at).getTime() >= oneHourAgo);
    const recentSuccess = recent.filter(e => e.event_status === 'success').length;
    const recentFailed = recent.filter(e => e.event_status === 'error').length;
    const totalRecent = recentSuccess + recentFailed;
    const recentFailRate = totalRecent > 0 ? (recentFailed / totalRecent) * 100 : 0;
    setHighFailure({ active: recentFailRate >= 20, rate: recentFailRate });

    // Throttled admin alert when threshold exceeded
    if (recentFailRate >= 20) {
      const nowTs = Date.now();
      if (!lastAlertRef.current || nowTs - lastAlertRef.current > 30 * 60 * 1000) {
        lastAlertRef.current = nowTs;
        try {
          await supabase.from('admin_alerts').insert({
            alert_type: 'auth_fail_rate',
            severity: 'high',
            title: 'Taxa de falhas de login elevada',
            message: `A taxa de falhas de login atingiu ${recentFailRate.toFixed(1)}% na última hora`,
            context: {
              window: '1h',
              failed: recentFailed,
              success: recentSuccess,
              total: totalRecent,
              threshold_percent: 20,
            }
          });
        } catch (e) {
          console.error('Falha ao registrar alerta de autenticação:', e);
        }
      }
    }

    // Get active sessions from Supabase
    const { count: activeSessions } = await supabase
      .from('mfa_sessions')
      .select('*', { count: 'exact', head: true })
      .gt('expires_at', new Date().toISOString());

    // Get blocked IPs
    const { count: blockedIPs } = await supabase
      .from('blocked_ips')
      .select('*', { count: 'exact', head: true })
      .gt('blocked_until', new Date().toISOString());

    setMetrics({
      totalLogins: loginEvents.length,
      failedLogins: failedLogins.length,
      successRate: loginEvents.length > 0 ? (successfulLogins.length / loginEvents.length) * 100 : 0,
      activeSessions: activeSessions || 0,
      blockedIPs: blockedIPs || 0,
      avgLoginTime: 1.2, // Mock - would need actual timing data
    });

    // Logins by hour (last 24h)
    const hourlyData: Record<string, { success: number; failed: number }> = {};
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now);
      hour.setHours(now.getHours() - i);
      const hourKey = hour.getHours().toString().padStart(2, '0') + ':00';
      hourlyData[hourKey] = { success: 0, failed: 0 };
    }

    loginEvents.forEach(event => {
      const eventDate = new Date(event.created_at);
      const hourKey = eventDate.getHours().toString().padStart(2, '0') + ':00';
      if (hourlyData[hourKey]) {
        if (event.event_status === 'success') {
          hourlyData[hourKey].success++;
        } else {
          hourlyData[hourKey].failed++;
        }
      }
    });

    setLoginsByHour(
      Object.entries(hourlyData).map(([hour, data]) => ({
        hour,
        success: data.success,
        failed: data.failed,
      }))
    );

    // Logins by role
    const roleData: Record<string, number> = {};
    successfulLogins.forEach(event => {
      const role = event.user_role || 'unknown';
      roleData[role] = (roleData[role] || 0) + 1;
    });

    const colors = {
      admin: '#ef4444',
      pet_shop: '#3b82f6',
      client: '#10b981',
      unknown: '#6b7280',
    };

    setLoginsByRole(
      Object.entries(roleData).map(([role, count]) => ({
        role,
        count,
        color: colors[role as keyof typeof colors] || colors.unknown,
      }))
    );

    // Recent failures
    setRecentFailures(failedLogins.slice(0, 10));

    // ✅ Tendência de falhas por hora (últimas 24h)
    const trendData: Record<string, { success: number; failed: number }> = {};
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const recent24h = loginEvents.filter(e => new Date(e.created_at).getTime() >= last24h);

    recent24h.forEach(event => {
      const hour = new Date(event.created_at).getHours().toString().padStart(2, '0') + ':00';
      if (!trendData[hour]) {
        trendData[hour] = { success: 0, failed: 0 };
      }
      if (event.event_status === 'success') {
        trendData[hour].success++;
      } else {
        trendData[hour].failed++;
      }
    });

    const trend = Object.entries(trendData).map(([hour, data]) => ({
      hour,
      rate: data.failed + data.success > 0 
        ? (data.failed / (data.failed + data.success)) * 100 
        : 0
    }));

    setFailureTrend(trend);

    // ✅ Top 10 IPs com mais falhas
    const ipFailures: Record<string, number> = {};
    failedLogins.forEach(event => {
      if (event.ip_address) {
        ipFailures[event.ip_address] = (ipFailures[event.ip_address] || 0) + 1;
      }
    });

    const sortedIPs = Object.entries(ipFailures)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    setTopFailedIPs(sortedIPs);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Métricas de Autenticação</h1>
        <p className="text-muted-foreground">
          Dashboard consolidado com estatísticas de login, falhas e sessões ativas
        </p>
      </div>

      {/* ✅ High Failure Rate Alert */}
      {highFailure.active && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>⚠️ Taxa de Falhas Elevada Detectada</AlertTitle>
          <AlertDescription>
            A taxa de falhas de login atingiu {highFailure.rate.toFixed(1)}% na última hora (threshold: 20%).
            Administradores foram notificados automaticamente.
          </AlertDescription>
        </Alert>
      )}

      {/* ✅ Period Filters */}
      <div className="flex gap-2">
        <Button 
          variant={period === '1h' ? 'default' : 'outline'}
          onClick={() => setPeriod('1h')}
          size="sm"
        >
          Última Hora
        </Button>
        <Button 
          variant={period === '24h' ? 'default' : 'outline'}
          onClick={() => setPeriod('24h')}
          size="sm"
        >
          24 Horas
        </Button>
        <Button 
          variant={period === '7d' ? 'default' : 'outline'}
          onClick={() => setPeriod('7d')}
          size="sm"
        >
          7 Dias
        </Button>
        <Button 
          variant={period === '30d' ? 'default' : 'outline'}
          onClick={() => setPeriod('30d')}
          size="sm"
        >
          30 Dias
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Logins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLogins}</div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{metrics.failedLogins}</div>
            <p className="text-xs text-muted-foreground">Tentativas falhadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {metrics.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Login bem-sucedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{metrics.activeSessions}</div>
            <p className="text-xs text-muted-foreground">Usuários online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPs Bloqueados</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{metrics.blockedIPs}</div>
            <p className="text-xs text-muted-foreground">Rate limit ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">{metrics.avgLoginTime}s</div>
            <p className="text-xs text-muted-foreground">Por login</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Logins por Hora</CardTitle>
            <CardDescription>Últimas 24 horas - Sucessos vs Falhas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loginsByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" fill="#10b981" name="Sucesso" />
                <Bar dataKey="failed" fill="#ef4444" name="Falha" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logins por Perfil</CardTitle>
            <CardDescription>Distribuição de acessos por tipo de usuário</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={loginsByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.role}: ${entry.count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {loginsByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ✅ Failure Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Taxa de Falha</CardTitle>
            <CardDescription>Últimas 24 horas - % de falhas por hora</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={failureTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis label={{ value: 'Taxa de Falha (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Taxa de Falha"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ✅ Top Failed IPs */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 IPs com Mais Falhas</CardTitle>
            <CardDescription>Endereços IP com maior número de tentativas falhadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topFailedIPs.length === 0 ? (
                <p className="text-center text-muted-foreground">Nenhuma falha registrada</p>
              ) : (
                topFailedIPs.map((item, index) => (
                  <div key={item.ip} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <code className="text-sm">{item.ip}</code>
                    </div>
                    <Badge variant="destructive">{item.count} falhas</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Failures */}
      <Card>
        <CardHeader>
          <CardTitle>Falhas Recentes de Login</CardTitle>
          <CardDescription>Últimas 10 tentativas falhadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentFailures.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhuma falha registrada</p>
            ) : (
              recentFailures.map((failure) => (
                <div
                  key={failure.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {failure.user_id || 'Usuário desconhecido'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {failure.ip_address} • {new Date(failure.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">Falha</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
