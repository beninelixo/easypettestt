import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, DollarSign, Users, Download, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Relatorios = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
    uniqueClients: 0,
    appointmentsToday: 0,
    appointmentsWeek: 0,
    appointmentsMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    setLoading(true);

    // Get all appointments
    const { data: appointments } = await supabase
      .from("appointments")
      .select(`
        *,
        service:services(price)
      `)
      .eq("pet_shop_id", user?.id);

    if (appointments) {
      const completed = appointments.filter(a => a.status === "completed");
      const revenue = completed.reduce((sum, a) => {
        const price = a.service?.price;
        return sum + (price ? parseFloat(price.toString()) : 0);
      }, 0);
      const uniqueClients = new Set(appointments.map(a => a.client_id)).size;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const todayStr = today.toISOString().split('T')[0];
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      const monthAgoStr = monthAgo.toISOString().split('T')[0];

      setStats({
        totalAppointments: appointments.length,
        completedAppointments: completed.length,
        totalRevenue: revenue,
        uniqueClients,
        appointmentsToday: appointments.filter(a => a.scheduled_date === todayStr).length,
        appointmentsWeek: appointments.filter(a => a.scheduled_date >= weekAgoStr).length,
        appointmentsMonth: appointments.filter(a => a.scheduled_date >= monthAgoStr).length,
      });
    }

    setLoading(false);
  };

  const exportPDF = () => {
    toast({
      title: "Exportando relatório",
      description: "Funcionalidade de exportação em desenvolvimento",
    });
  };

  const statCards = [
    {
      title: "Agendamentos Hoje",
      value: stats.appointmentsToday.toString(),
      icon: Calendar,
      color: "text-primary",
    },
    {
      title: "Agendamentos (7 dias)",
      value: stats.appointmentsWeek.toString(),
      icon: Calendar,
      color: "text-secondary",
    },
    {
      title: "Agendamentos (30 dias)",
      value: stats.appointmentsMonth.toString(),
      icon: Calendar,
      color: "text-accent",
    },
    {
      title: "Faturamento Total",
      value: `R$ ${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Total de Clientes",
      value: stats.uniqueClients.toString(),
      icon: Users,
      color: "text-secondary",
    },
    {
      title: "Atendimentos Concluídos",
      value: stats.completedAppointments.toString(),
      icon: TrendingUp,
      color: "text-accent",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Relatórios e Estatísticas
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o desempenho do seu negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={() => toast({ title: "Ver detalhes completos em breve" })}>
            <FileText className="h-4 w-4 mr-2" />
            Ver Detalhes
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Carregando estatísticas...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral de Desempenho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Taxa de Conclusão</h3>
                    <p className="text-sm text-muted-foreground">
                      Porcentagem de agendamentos concluídos
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {stats.totalAppointments > 0
                      ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
                      : 0}%
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Ticket Médio</h3>
                    <p className="text-sm text-muted-foreground">
                      Valor médio por atendimento
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-secondary">
                    R$ {stats.completedAppointments > 0
                      ? (stats.totalRevenue / stats.completedAppointments).toFixed(2)
                      : "0.00"}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Agendamentos por Cliente</h3>
                    <p className="text-sm text-muted-foreground">
                      Média de agendamentos por cliente
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-accent">
                    {stats.uniqueClients > 0
                      ? (stats.totalAppointments / stats.uniqueClients).toFixed(1)
                      : "0.0"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Relatorios;
