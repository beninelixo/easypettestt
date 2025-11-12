import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, Users, DollarSign, Clock, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import RevenueChart from "@/components/dashboard/RevenueChart";
import AppointmentsChart from "@/components/dashboard/AppointmentsChart";
import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [petShopId, setPetShopId] = useState<string>("");
  const [stats, setStats] = useState({
    todayAppointments: 0,
    monthlyRevenue: "R$ 0,00",
    activeClients: 0,
    completedServices: 0,
  });
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number }>>([]);
  const [weekData, setWeekData] = useState<Array<{ day: string; completed: number; cancelled: number; pending: number }>>([]);
  const [appointmentPeriod, setAppointmentPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [revenuePeriod, setRevenuePeriod] = useState<'month' | 'year'>('month');
  const { lastUpdate } = useRealtimeMetrics(petShopId);

  useEffect(() => {
    if (user) {
      loadPetShopAndData();
    }
  }, [user]);

  useEffect(() => {
    if (petShopId) {
      loadAppointments(petShopId);
      loadStats(petShopId);
    }
  }, [petShopId, lastUpdate, appointmentPeriod, revenuePeriod]);

  const loadPetShopAndData = async () => {
    try {
      let shopId: string | null = null;

      const { data: ownedShop, error: ownedErr } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user?.id)
        .maybeSingle();

      if (ownedErr) {
        console.error("Erro ao buscar pet shop:", ownedErr);
      }

      if (ownedShop) {
        shopId = ownedShop.id;
      } else {
        const { data: employeeShop, error: empErr } = await supabase
          .from("petshop_employees")
          .select("pet_shop_id")
          .eq("user_id", user?.id)
          .eq("active", true)
          .maybeSingle();

        if (empErr) {
          console.error("Erro ao buscar vínculo de funcionário:", empErr);
        }
        if (employeeShop) {
          shopId = employeeShop.pet_shop_id;
        }
      }

      if (!shopId) {
        navigate("/petshop-setup");
        return;
      }

      setPetShopId(shopId);
      await loadAppointments(shopId);
      await loadStats(shopId);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const loadAppointments = async (shopId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        pet:pets(name, owner_id),
        service:services(name, price),
        client:profiles!appointments_client_id_fkey(full_name)
      `)
      .eq("pet_shop_id", shopId)
      .eq("scheduled_date", today)
      .order("scheduled_time", { ascending: true });

    if (!error && data) {
      setAppointments(data);
    }
  };

  const loadStats = async (shopId: string) => {
    // Use otimized database function for dashboard stats
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_dashboard_stats', { 
        _pet_shop_id: shopId,
        _date: format(new Date(), "yyyy-MM-dd")
      });

    if (!statsError && statsData) {
      const stats = statsData as any;
      setStats({
        todayAppointments: stats.today_appointments || 0,
        monthlyRevenue: `R$ ${Number(stats.monthly_revenue || 0).toFixed(2)}`,
        activeClients: stats.active_clients || 0,
        completedServices: stats.completed_services || 0,
      });
    }

    // Load revenue data based on selected period
    const revenueMonths = revenuePeriod === 'year' ? 12 : 6;
    const { data: revenueDataFromDb, error: revenueError } = await supabase
      .rpc('get_revenue_by_period', { 
        _pet_shop_id: shopId,
        _period: revenuePeriod,
        _months: revenueMonths
      });

    if (!revenueError && revenueDataFromDb) {
      setRevenueData(revenueDataFromDb.map(item => ({
        month: item.period_label,
        revenue: Number(item.revenue)
      })));
    }

    // Load appointments data based on selected period
    const { data: weekDataFromDb, error: weekError } = await supabase
      .rpc('get_appointments_by_period', { 
        _pet_shop_id: shopId,
        _period: appointmentPeriod
      });

    if (!weekError && weekDataFromDb) {
      setWeekData(weekDataFromDb.map(item => ({
        day: item.day,
        completed: Number(item.completed),
        pending: Number(item.pending),
        cancelled: Number(item.cancelled)
      })));
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    const updateData: any = { status: newStatus };
    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", appointmentId);

    if (!error) {
      await loadAppointments(petShopId);
      await loadStats(petShopId);
    }
  };

  const statsArray = [
    { title: "Agendamentos Hoje", value: stats.todayAppointments.toString(), icon: Calendar, color: "text-primary" },
    { title: "Faturamento Mensal", value: stats.monthlyRevenue, icon: DollarSign, color: "text-secondary" },
    { title: "Clientes Ativos", value: stats.activeClients.toString(), icon: Users, color: "text-accent" },
    { title: "Serviços Realizados", value: stats.completedServices.toString(), icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsArray.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Faturamento</CardTitle>
                  <CardDescription>Receita ao longo do tempo</CardDescription>
                </div>
                <Tabs value={revenuePeriod} onValueChange={(v) => setRevenuePeriod(v as 'month' | 'year')}>
                  <TabsList>
                    <TabsTrigger value="month">6 Meses</TabsTrigger>
                    <TabsTrigger value="year">12 Meses</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart data={revenueData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Agendamentos</CardTitle>
                  <CardDescription>Status dos agendamentos por período</CardDescription>
                </div>
                <Tabs value={appointmentPeriod} onValueChange={(v) => setAppointmentPeriod(v as 'week' | 'month' | 'year')}>
                  <TabsList>
                    <TabsTrigger value="week">Semana</TabsTrigger>
                    <TabsTrigger value="month">Mês</TabsTrigger>
                    <TabsTrigger value="year">Ano</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <AppointmentsChart data={weekData} />
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Agenda de Hoje</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Atendimentos Agendados</CardTitle>
              <CardDescription>Gerenciamento dos agendamentos do dia</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum agendamento para hoje</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {appointment.scheduled_time} - {appointment.service?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Cliente: {appointment.client?.full_name} | Pet: {appointment.pet?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            appointment.status === "confirmed"
                              ? "bg-accent/10 text-accent"
                              : appointment.status === "in_progress"
                              ? "bg-secondary/10 text-secondary"
                              : appointment.status === "completed"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {appointment.status === "confirmed" ? "Confirmado" :
                           appointment.status === "in_progress" ? "Em Andamento" :
                           appointment.status === "completed" ? "Concluído" :
                           appointment.status === "pending" ? "Pendente" : "Cancelado"}
                        </span>
                        {appointment.status === "pending" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                          >
                            Confirmar
                          </Button>
                        )}
                        {appointment.status === "confirmed" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, "in_progress")}
                          >
                            Iniciar
                          </Button>
                        )}
                        {appointment.status === "in_progress" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                          >
                            Concluir
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2 hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all"
              onClick={() => navigate("/professional/clients")}
            >
              <Users className="h-6 w-6" />
              Gerenciar Clientes
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2 hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all"
              onClick={() => navigate("/professional/calendar")}
            >
              <Calendar className="h-6 w-6" />
              Calendário Completo
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2 hover:bg-primary/10 hover:text-primary hover:scale-105 transition-all"
              onClick={() => navigate("/professional/reports")}
            >
              <TrendingUp className="h-6 w-6" />
              Relatórios
            </Button>
          </div>
        </section>
      </div>
    );
  };

export default ProfessionalDashboard;
