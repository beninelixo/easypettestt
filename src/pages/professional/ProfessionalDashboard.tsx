import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, TrendingUp, Users, DollarSign, Clock, Sparkles, 
  ArrowRight, CheckCircle2, XCircle, Play, BarChart3,
  PawPrint, Bell, Settings, ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import RevenueChart from "@/components/dashboard/RevenueChart";
import AppointmentsChart from "@/components/dashboard/AppointmentsChart";
import { PeakHoursChart } from "@/components/dashboard/PeakHoursChart";
import { NoShowMetrics } from "@/components/dashboard/NoShowMetrics";
import { ServiceBreakdownChart } from "@/components/dashboard/ServiceBreakdownChart";
import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";
import { usePlanTheme } from "@/hooks/usePlanTheme";

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const planTheme = usePlanTheme();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [petShopId, setPetShopId] = useState<string>("");
  const [petShopName, setPetShopName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    monthlyRevenue: 0,
    activeClients: 0,
    completedServices: 0,
  });
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number }>>([]);
  const [weekData, setWeekData] = useState<Array<{ day: string; completed: number; cancelled: number; pending: number }>>([]);
  const [peakHours, setPeakHours] = useState<Array<{ hour: number; appointment_count: number }>>([]);
  const [noShowStats, setNoShowStats] = useState<any>(null);
  const [serviceBreakdown, setServiceBreakdown] = useState<Array<any>>([]);

  const { lastUpdate } = useRealtimeMetrics(petShopId);

  useEffect(() => {
    if (user) {
      loadPetShopAndData();
    }
  }, [user]);

  useEffect(() => {
    if (petShopId) {
      loadAllMetrics();
    }
  }, [petShopId, lastUpdate]);

  const loadPetShopAndData = async () => {
    setLoading(true);
    let shopId: string | null = null;
    let shopName: string = "";

    const { data: ownedShop } = await supabase
      .from("pet_shops")
      .select("id, name")
      .eq("owner_id", user?.id)
      .maybeSingle();

    if (ownedShop) {
      shopId = ownedShop.id;
      shopName = ownedShop.name;
    } else {
      const { data: employeeShop } = await supabase
        .from("petshop_employees")
        .select("pet_shop_id, pet_shops(name)")
        .eq("user_id", user?.id)
        .eq("active", true)
        .maybeSingle();
      if (employeeShop) {
        shopId = employeeShop.pet_shop_id;
        shopName = (employeeShop as any).pet_shops?.name || "";
      }
    }

    if (!shopId) {
      navigate("/petshop-setup");
      setLoading(false);
      return;
    }

    setPetShopId(shopId);
    setPetShopName(shopName);
    await loadAppointments(shopId);
    await loadStats(shopId);
    setLoading(false);
  };

  const loadAppointments = async (shopId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        pet:pets(name, owner_id, species),
        service:services(name, price, duration_minutes),
        client:profiles!appointments_client_id_fkey(full_name, phone)
      `)
      .eq("pet_shop_id", shopId)
      .eq("scheduled_date", today)
      .order("scheduled_time", { ascending: true });

    if (!error && data) {
      setAppointments(data);
    }
  };

  const loadAllMetrics = async () => {
    if (!petShopId) return;
    await Promise.all([
      loadStats(petShopId),
      loadPeakHours(petShopId),
      loadNoShowStats(petShopId),
      loadServiceBreakdown(petShopId)
    ]);
  };

  const loadStats = async (shopId: string) => {
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_dashboard_stats', { 
        _pet_shop_id: shopId,
        _date: format(new Date(), "yyyy-MM-dd")
      });

    if (!statsError && statsData) {
      const stats = statsData as any;
      setStats({
        todayAppointments: stats.today_appointments || 0,
        monthlyRevenue: Number(stats.monthly_revenue || 0),
        activeClients: stats.active_clients || 0,
        completedServices: stats.completed_services || 0,
      });
    }

    const { data: revenueDataFromDb, error: revenueError } = await supabase
      .rpc('get_monthly_revenue', { 
        _pet_shop_id: shopId,
        _months: 6
      });

    if (!revenueError && revenueDataFromDb) {
      setRevenueData(revenueDataFromDb.map(item => ({
        month: item.month,
        revenue: Number(item.revenue)
      })));
    }

    const { data: weekDataFromDb, error: weekError } = await supabase
      .rpc('get_weekly_appointments', { 
        _pet_shop_id: shopId
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

  const loadPeakHours = async (shopId: string) => {
    const { data } = await supabase.rpc('get_peak_hours', { _pet_shop_id: shopId });
    if (data) setPeakHours(data);
  };

  const loadNoShowStats = async (shopId: string) => {
    const { data } = await supabase.rpc('get_no_show_stats', { _pet_shop_id: shopId });
    if (data) setNoShowStats(data);
  };

  const loadServiceBreakdown = async (shopId: string) => {
    const { data } = await supabase.rpc('get_appointments_by_service', { _pet_shop_id: shopId });
    if (data) setServiceBreakdown(data);
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return { label: "Confirmado", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" };
      case "in_progress":
        return { label: "Em Andamento", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
      case "completed":
        return { label: "Concluído", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
      case "cancelled":
        return { label: "Cancelado", color: "bg-red-500/20 text-red-400 border-red-500/30" };
      default:
        return { label: "Pendente", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" };
    }
  };

  const statsArray = [
    { 
      title: "Agendamentos Hoje", 
      value: stats.todayAppointments, 
      icon: Calendar, 
      gradient: "from-cyan-500 to-blue-600",
      bgGlow: "bg-cyan-500/10"
    },
    { 
      title: "Faturamento Mensal", 
      value: `R$ ${stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: DollarSign, 
      gradient: "from-emerald-500 to-green-600",
      bgGlow: "bg-emerald-500/10"
    },
    { 
      title: "Clientes Ativos", 
      value: stats.activeClients, 
      icon: Users, 
      gradient: "from-violet-500 to-purple-600",
      bgGlow: "bg-violet-500/10"
    },
    { 
      title: "Serviços Realizados", 
      value: stats.completedServices, 
      icon: TrendingUp, 
      gradient: "from-amber-500 to-orange-600",
      bgGlow: "bg-amber-500/10"
    },
  ];

  const quickActions = [
    { label: "Clientes", icon: Users, path: "/professional/clients", color: "from-cyan-500 to-blue-600" },
    { label: "Calendário", icon: Calendar, path: "/professional/calendar", color: "from-emerald-500 to-green-600" },
    { label: "Relatórios", icon: BarChart3, path: "/professional/reports", color: "from-violet-500 to-purple-600" },
    { label: "Configurações", icon: Settings, path: "/professional/settings", color: "from-amber-500 to-orange-600" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-10 w-72 bg-muted/50 animate-pulse rounded-xl" />
              <div className="h-5 w-48 bg-muted/30 animate-pulse rounded-lg" />
            </div>
            <div className="h-10 w-32 bg-muted/50 animate-pulse rounded-xl" />
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 bg-card/50 border border-border/50 animate-pulse rounded-2xl" />
            ))}
          </div>
          
          {/* Charts Skeleton */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="h-80 bg-card/50 border border-border/50 animate-pulse rounded-2xl" />
            <div className="h-80 bg-card/50 border border-border/50 animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Premium Header */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 border border-border/50 p-8">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25">
                  <PawPrint className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                    {petShopName || "Dashboard"}
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-xl border-border/50 hover:bg-muted/50"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button 
                className="rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/25"
                onClick={() => navigate("/professional/calendar")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsArray.map((stat, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 ${stat.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <Sparkles className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="group h-auto py-6 flex flex-col items-center gap-3 rounded-2xl border-border/50 bg-card/50 hover:bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              onClick={() => navigate(action.path)}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-md group-hover:scale-110 transition-transform`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-sm">{action.label}</span>
            </Button>
          ))}
        </section>

        {/* Charts Grid */}
        <section className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Faturamento</CardTitle>
                  <CardDescription>Últimos 6 meses</CardDescription>
                </div>
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <RevenueChart data={revenueData} />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Agendamentos</CardTitle>
                  <CardDescription>Esta semana</CardDescription>
                </div>
                <Calendar className="h-5 w-5 text-cyan-500" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <AppointmentsChart data={weekData} />
            </CardContent>
          </Card>
        </section>

        {/* Additional Charts */}
        <section className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Horários de Pico</CardTitle>
                  <CardDescription>Distribuição por hora</CardDescription>
                </div>
                <Clock className="h-5 w-5 text-violet-500" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <PeakHoursChart data={peakHours} />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Serviços Populares</CardTitle>
                  <CardDescription>Por quantidade</CardDescription>
                </div>
                <BarChart3 className="h-5 w-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ServiceBreakdownChart data={serviceBreakdown} />
            </CardContent>
          </Card>
        </section>

        {noShowStats && <NoShowMetrics stats={noShowStats} />}

        {/* Today's Schedule */}
        <section>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Agenda de Hoje
                  </CardTitle>
                  <CardDescription>
                    {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} para hoje
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary"
                  onClick={() => navigate("/professional/calendar")}
                >
                  Ver Calendário
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                    <Calendar className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">Nenhum agendamento para hoje</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Aproveite para organizar sua agenda</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {appointments.map((appointment) => {
                    const statusConfig = getStatusConfig(appointment.status);
                    return (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/50">
                            <span className="text-xl font-bold text-primary">
                              {appointment.scheduled_time?.slice(0, 2)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {appointment.scheduled_time?.slice(3, 5)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-base">
                              {appointment.service?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              <span className="text-foreground">{appointment.client?.full_name}</span>
                              {" · "}
                              <span>{appointment.pet?.name}</span>
                              {appointment.pet?.species && (
                                <span className="text-muted-foreground/70"> ({appointment.pet.species})</span>
                              )}
                            </p>
                            {appointment.service?.duration_minutes && (
                              <p className="text-xs text-muted-foreground">
                                Duração: {appointment.service.duration_minutes} min
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className={`${statusConfig.color} border rounded-full px-3`}
                          >
                            {statusConfig.label}
                          </Badge>
                          {appointment.status === "pending" && (
                            <Button 
                              size="sm"
                              className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white"
                              onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                          )}
                          {appointment.status === "confirmed" && (
                            <Button 
                              size="sm"
                              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                              onClick={() => updateAppointmentStatus(appointment.id, "in_progress")}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Iniciar
                            </Button>
                          )}
                          {appointment.status === "in_progress" && (
                            <Button 
                              size="sm"
                              className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
                              onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Concluir
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground/60 py-4">
          Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
        </footer>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
