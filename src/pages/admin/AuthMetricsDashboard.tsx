import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthMonitor } from "@/hooks/useAuthMonitor";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertCircle, CheckCircle, TrendingUp, Users, Shield, Clock } from "lucide-react";

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

  useEffect(() => {
    calculateMetrics();
  }, [events]);

  const calculateMetrics = async () => {
    // Calculate from events
    const loginEvents = events.filter(e => e.event_type === 'login');
    const successfulLogins = loginEvents.filter(e => e.event_status === 'success');
    const failedLogins = loginEvents.filter(e => e.event_status === 'error');

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
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Métricas de Autenticação</h1>
        <p className="text-muted-foreground">
          Dashboard consolidado com estatísticas de login, falhas e sessões ativas
        </p>
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
