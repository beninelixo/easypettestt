import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Calendar, DollarSign, Star, Target, Activity, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    conversionRate: number;
  };
  clients: {
    total: number;
    new: number;
    returning: number;
    retentionRate: number;
  };
  satisfaction: {
    average: number;
    total: number;
    distribution: { rating: number; count: number }[];
  };
  topServices: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  performance: {
    avgTicket: number;
    productsPerSale: number;
    salesConversion: number;
  };
}

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Get pet shop
      const { data: petShop } = await supabase
        .from('pet_shops')
        .select('id')
        .eq('owner_id', user?.id)
        .single();

      if (!petShop) return;

      const now = new Date();
      const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 90;
      const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
      const previousStartDate = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

      // Current period appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*, services(*), payments(*)')
        .eq('pet_shop_id', petShop.id)
        .gte('scheduled_date', startDate.toISOString().split('T')[0]);

      // Previous period appointments
      const { data: previousAppointments } = await supabase
        .from('appointments')
        .select('*, services(*), payments(*)')
        .eq('pet_shop_id', petShop.id)
        .gte('scheduled_date', previousStartDate.toISOString().split('T')[0])
        .lt('scheduled_date', startDate.toISOString().split('T')[0]);

      // Satisfaction surveys
      const { data: surveys } = await supabase
        .from('satisfaction_surveys')
        .select('*')
        .in('appointment_id', appointments?.map(a => a.id) || []);

      // Calculate metrics
      const currentRevenue = appointments?.reduce((sum, apt) => {
        if (apt.status === 'completed' && apt.services) {
          return sum + Number(apt.services.price);
        }
        return sum;
      }, 0) || 0;

      const previousRevenue = previousAppointments?.reduce((sum, apt) => {
        if (apt.status === 'completed' && apt.services) {
          return sum + Number(apt.services.price);
        }
        return sum;
      }, 0) || 0;

      const revenueGrowth = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;

      const completed = appointments?.filter(a => a.status === 'completed').length || 0;
      const cancelled = appointments?.filter(a => a.status === 'cancelled').length || 0;
      const conversionRate = appointments && appointments.length > 0
        ? (completed / appointments.length) * 100
        : 0;

      // Client metrics
      const uniqueClients = new Set(appointments?.map(a => a.client_id) || []);
      const previousClients = new Set(previousAppointments?.map(a => a.client_id) || []);
      const newClients = Array.from(uniqueClients).filter(id => !previousClients.has(id));
      const returningClients = Array.from(uniqueClients).filter(id => previousClients.has(id));

      // Satisfaction metrics
      const avgSatisfaction = surveys && surveys.length > 0
        ? surveys.reduce((sum, s) => sum + s.rating, 0) / surveys.length
        : 0;

      const satisfactionDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: surveys?.filter(s => s.rating === rating).length || 0
      }));

      // Top services
      const serviceStats = new Map<string, { count: number; revenue: number; name: string }>();
      appointments?.forEach(apt => {
        if (apt.status === 'completed' && apt.services) {
          const key = apt.service_id;
          const current = serviceStats.get(key) || { count: 0, revenue: 0, name: apt.services.name };
          serviceStats.set(key, {
            count: current.count + 1,
            revenue: current.revenue + Number(apt.services.price),
            name: apt.services.name
          });
        }
      });

      const topServices = Array.from(serviceStats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setData({
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          growth: revenueGrowth
        },
        appointments: {
          total: appointments?.length || 0,
          completed,
          cancelled,
          conversionRate
        },
        clients: {
          total: uniqueClients.size,
          new: newClients.length,
          returning: returningClients.length,
          retentionRate: uniqueClients.size > 0 ? (returningClients.length / uniqueClients.size) * 100 : 0
        },
        satisfaction: {
          average: avgSatisfaction,
          total: surveys?.length || 0,
          distribution: satisfactionDistribution
        },
        topServices,
        performance: {
          avgTicket: appointments && appointments.length > 0 ? currentRevenue / completed : 0,
          productsPerSale: 1.2,
          salesConversion: conversionRate
        }
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8">Carregando analytics...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Analytics & Performance</h1>
          <p className="text-muted-foreground">Métricas detalhadas do seu negócio</p>
        </div>
        
        <Tabs value={period} onValueChange={(v: any) => setPeriod(v)}>
          <TabsList>
            <TabsTrigger value="week">7 dias</TabsTrigger>
            <TabsTrigger value="month">30 dias</TabsTrigger>
            <TabsTrigger value="quarter">90 dias</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {data.revenue.current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={data.revenue.growth >= 0 ? "default" : "destructive"}>
                {data.revenue.growth >= 0 ? '+' : ''}{data.revenue.growth.toFixed(1)}%
              </Badge>
              <span className="text-xs text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.appointments.conversionRate.toFixed(1)}%</div>
            <Progress value={data.appointments.conversionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {data.appointments.completed} de {data.appointments.total} concluídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Retenção</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.clients.retentionRate.toFixed(1)}%</div>
            <Progress value={data.clients.retentionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {data.clients.returning} clientes retornaram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {data.satisfaction.average.toFixed(1)}
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {data.satisfaction.total} avaliações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Vendidos</CardTitle>
            <CardDescription>Top 5 por faturamento no período</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topServices.map((service, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{service.name}</span>
                  <span className="text-sm text-muted-foreground">
                    R$ {service.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(service.count / data.appointments.total) * 100} />
                  <span className="text-xs text-muted-foreground">{service.count}x</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance do Negócio</CardTitle>
            <CardDescription>Indicadores chave de desempenho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Ticket Médio</p>
                <p className="text-2xl font-bold">
                  R$ {data.performance.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{data.performance.salesConversion.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Novos Clientes</span>
                <span className="font-medium">{data.clients.new}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Clientes Recorrentes</span>
                <span className="font-medium">{data.clients.returning}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total de Clientes</span>
                <span className="font-medium">{data.clients.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Satisfação</CardTitle>
          <CardDescription>Avaliações dos clientes no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.satisfaction.distribution.reverse().map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-20">
                  <span className="font-medium">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                </div>
                <Progress 
                  value={data.satisfaction.total > 0 ? (count / data.satisfaction.total) * 100 : 0} 
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
