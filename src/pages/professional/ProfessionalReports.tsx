import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { DollarSign, Calendar, TrendingUp, Award, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { FeatureGate } from "@/components/FeatureGate";

interface Stats {
  totalRevenue: number;
  totalAppointments: number;
  averageTicket: number;
  topService: string;
  completedAppointments: number;
  cancelledAppointments: number;
}

const ProfessionalReports = () => {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalAppointments: 0,
    averageTicket: 0,
    topService: "N/A",
    completedAppointments: 0,
    cancelledAppointments: 0,
  });
  const [period, setPeriod] = useState("current_month");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user, period]);

  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "current_month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "last_3_months":
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      case "last_6_months":
        startDate = startOfMonth(subMonths(now, 5));
        endDate = endOfMonth(now);
        break;
      case "current_year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    return {
      start: format(startDate, "yyyy-MM-dd"),
      end: format(endDate, "yyyy-MM-dd"),
    };
  };

  const loadStats = async () => {
    try {
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user?.id)
        .single();

      if (!petShop) return;

      const dateRange = getDateRange();

      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          id,
          status,
          scheduled_date,
          service:services(id, name, price)
        `)
        .eq("pet_shop_id", petShop.id)
        .gte("scheduled_date", dateRange.start)
        .lte("scheduled_date", dateRange.end);

      if (!appointments) return;

      const completedAppointments = appointments.filter(
        (a) => a.status === "completed"
      );
      const cancelledAppointments = appointments.filter(
        (a) => a.status === "cancelled"
      );

      const totalRevenue = completedAppointments.reduce(
        (sum, apt) => sum + (apt.service?.price || 0),
        0
      );

      const serviceCounts: Record<string, number> = {};
      completedAppointments.forEach((apt) => {
        if (apt.service?.name) {
          serviceCounts[apt.service.name] =
            (serviceCounts[apt.service.name] || 0) + 1;
        }
      });

      const topService =
        Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "N/A";

      setStats({
        totalRevenue,
        totalAppointments: appointments.length,
        averageTicket:
          completedAppointments.length > 0
            ? totalRevenue / completedAppointments.length
            : 0,
        topService,
        completedAppointments: completedAppointments.length,
        cancelledAppointments: cancelledAppointments.length,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Faturamento Total",
      value: `R$ ${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Total de Agendamentos",
      value: stats.totalAppointments.toString(),
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      title: "Ticket Médio",
      value: `R$ ${stats.averageTicket.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "Serviço Mais Realizado",
      value: stats.topService,
      icon: Award,
      color: "text-yellow-500",
    },
    {
      title: "Agendamentos Concluídos",
      value: stats.completedAppointments.toString(),
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Agendamentos Cancelados",
      value: stats.cancelledAppointments.toString(),
      icon: XCircle,
      color: "text-red-500",
    },
  ];

  return (
    <FeatureGate featureKey="financial_reports" requiredPlan="gold">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current_month">Mês Atual</SelectItem>
            <SelectItem value="last_3_months">Últimos 3 Meses</SelectItem>
            <SelectItem value="last_6_months">Últimos 6 Meses</SelectItem>
            <SelectItem value="current_year">Ano Atual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando relatórios...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Faturamento dos Últimos 6 Meses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Gráfico de faturamento em desenvolvimento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo de Desempenho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Taxa de Conclusão:</span>
                  <span className="text-lg font-bold">
                    {stats.totalAppointments > 0
                      ? ((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Taxa de Cancelamento:</span>
                  <span className="text-lg font-bold">
                    {stats.totalAppointments > 0
                      ? ((stats.cancelledAppointments / stats.totalAppointments) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      </div>
    </FeatureGate>
  );
};

export default ProfessionalReports;
