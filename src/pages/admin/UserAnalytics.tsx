import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, Clock, TrendingUp, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SEO } from "@/components/SEO";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function UserAnalytics() {
  // Fetch user statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: async () => {
      // Get total users
      const { data: allUsers, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;

      // Get users with roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at');

      // Get login attempts to calculate active users
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentLogins } = await supabase
        .from('login_attempts')
        .select('email, attempt_time')
        .eq('success', true)
        .gte('attempt_time', thirtyDaysAgo.toISOString());

      // Calculate activation rate (users with roles / total users)
      const totalUsers = allUsers.users.length;
      const activatedUsers = roles?.length || 0;
      const activationRate = totalUsers > 0 ? (activatedUsers / totalUsers) * 100 : 0;

      // Calculate active users (unique emails with successful logins in last 30 days)
      const uniqueActiveUsers = new Set(recentLogins?.map(l => l.email) || []).size;
      
      // Calculate average session duration (placeholder - would need actual tracking)
      const avgSessionDuration = 45; // minutes - placeholder

      // Role distribution
      const roleDistribution = roles?.reduce((acc: any, role) => {
        acc[role.role] = (acc[role.role] || 0) + 1;
        return acc;
      }, {}) || {};

      // Daily active users (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: weekLogins } = await supabase
        .from('login_attempts')
        .select('email, attempt_time')
        .eq('success', true)
        .gte('attempt_time', sevenDaysAgo.toISOString());

      const dailyActiveUsers = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        
        const count = weekLogins?.filter(l => 
          l.attempt_time.startsWith(dateStr)
        ).length || 0;

        return {
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          users: count
        };
      });

      // New users per month (last 6 months)
      const monthlySignups = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

        const count = allUsers.users.filter((u: any) => 
          u.created_at >= monthStart && u.created_at <= monthEnd
        ).length;

        return {
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          users: count
        };
      });

      return {
        totalUsers,
        activatedUsers,
        activationRate,
        activeUsers: uniqueActiveUsers,
        avgSessionDuration,
        roleDistribution: Object.entries(roleDistribution).map(([role, count]) => ({
          name: role === 'admin' ? 'Administradores' : role === 'pet_shop' ? 'Pet Shops' : 'Clientes',
          value: count as number
        })),
        dailyActiveUsers,
        monthlySignups
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <SEO 
        title="Analytics de Usuários | Admin EasyPet"
        description="Dashboard de analytics com estatísticas de ativação, usuários ativos e distribuição de roles"
      />

      <div>
        <h1 className="text-4xl font-bold mb-2">Analytics de Usuários</h1>
        <p className="text-muted-foreground">Análise detalhada do comportamento e engajamento dos usuários</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Todos os usuários registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ativação</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{stats?.activatedUsers} usuários com roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgSessionDuration}min</div>
            <p className="text-xs text-muted-foreground">Sessão média no sistema</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Active Users */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Ativos por Dia</CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.dailyActiveUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} name="Usuários" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Roles</CardTitle>
            <CardDescription>Por tipo de usuário</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats?.roleDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Signups */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Novos Usuários por Mês</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.monthlySignups}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="hsl(var(--primary))" name="Novos Usuários" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
