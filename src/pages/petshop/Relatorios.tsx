import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, DollarSign, Users, Download, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const [exporting, setExporting] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

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

  const exportPDF = async () => {
    setExporting(true);
    
    try {
      // Create PDF content as HTML
      const reportDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      const content = `
        <html>
          <head>
            <title>Relatório EasyPet - ${reportDate}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
              h1 { color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px; }
              h2 { color: #555; margin-top: 30px; }
              .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
              .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; }
              .stat-value { font-size: 28px; font-weight: bold; color: #16a34a; }
              .stat-label { color: #666; margin-top: 5px; }
              .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>📊 Relatório de Desempenho</h1>
            <p>Gerado em: ${reportDate}</p>
            
            <h2>Resumo de Agendamentos</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${stats.appointmentsToday}</div>
                <div class="stat-label">Agendamentos Hoje</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.appointmentsWeek}</div>
                <div class="stat-label">Últimos 7 dias</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.appointmentsMonth}</div>
                <div class="stat-label">Últimos 30 dias</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.completedAppointments}</div>
                <div class="stat-label">Atendimentos Concluídos</div>
              </div>
            </div>
            
            <h2>Métricas Financeiras</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">R$ ${stats.totalRevenue.toFixed(2)}</div>
                <div class="stat-label">Faturamento Total</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">R$ ${stats.completedAppointments > 0 ? (stats.totalRevenue / stats.completedAppointments).toFixed(2) : "0.00"}</div>
                <div class="stat-label">Ticket Médio</div>
              </div>
            </div>
            
            <h2>Clientes</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${stats.uniqueClients}</div>
                <div class="stat-label">Total de Clientes</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.uniqueClients > 0 ? (stats.totalAppointments / stats.uniqueClients).toFixed(1) : "0.0"}</div>
                <div class="stat-label">Média de Agendamentos por Cliente</div>
              </div>
            </div>
            
            <div class="footer">
              <p>Relatório gerado automaticamente pelo EasyPet</p>
              <p>© ${new Date().getFullYear()} EasyPet - Sistema de Gestão para Pet Shops</p>
            </div>
          </body>
        </html>
      `;
      
      // Open print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
      
      toast({
        title: "Relatório gerado",
        description: "Use Ctrl+P ou Cmd+P para salvar como PDF",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o relatório",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
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
          <Button variant="outline" onClick={exportPDF} disabled={exporting}>
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Exportar PDF
          </Button>
          <Button onClick={() => setShowDetailsDialog(true)}>
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

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Relatório</DialogTitle>
            <DialogDescription>
              Visão detalhada das métricas do seu negócio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.totalAppointments > 0
                    ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completedAppointments} de {stats.totalAppointments} agendamentos
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-secondary">
                  R$ {stats.completedAppointments > 0
                    ? (stats.totalRevenue / stats.completedAppointments).toFixed(2)
                    : "0.00"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Por atendimento concluído
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Fidelidade</p>
                <p className="text-2xl font-bold text-accent">
                  {stats.uniqueClients > 0
                    ? (stats.totalAppointments / stats.uniqueClients).toFixed(1)
                    : "0.0"}x
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Média de visitas por cliente
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Crescimento Semanal</p>
                <p className="text-2xl font-bold text-green-500">
                  {stats.appointmentsWeek} agendamentos
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Nos últimos 7 dias
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Resumo do Período</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex justify-between">
                  <span>Total de agendamentos:</span>
                  <span className="font-medium text-foreground">{stats.totalAppointments}</span>
                </li>
                <li className="flex justify-between">
                  <span>Atendimentos concluídos:</span>
                  <span className="font-medium text-foreground">{stats.completedAppointments}</span>
                </li>
                <li className="flex justify-between">
                  <span>Clientes únicos:</span>
                  <span className="font-medium text-foreground">{stats.uniqueClients}</span>
                </li>
                <li className="flex justify-between">
                  <span>Faturamento total:</span>
                  <span className="font-medium text-foreground">R$ {stats.totalRevenue.toFixed(2)}</span>
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Relatorios;
