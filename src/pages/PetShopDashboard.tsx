import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Users, DollarSign, Clock } from "lucide-react";

const PetShopDashboard = () => {
  // Mock data - will be replaced with real data later
  const stats = [
    { title: "Agendamentos Hoje", value: "12", icon: Calendar, color: "text-primary" },
    { title: "Faturamento Mensal", value: "R$ 8.450", icon: DollarSign, color: "text-secondary" },
    { title: "Clientes Ativos", value: "156", icon: Users, color: "text-accent" },
    { title: "Taxa de Retorno", value: "87%", icon: TrendingUp, color: "text-primary" },
  ];

  const todayAppointments = [
    { id: 1, time: "09:00", client: "Maria Silva", pet: "Rex", service: "Banho", status: "Confirmado" },
    { id: 2, time: "10:30", client: "João Santos", pet: "Luna", service: "Tosa", status: "Em andamento" },
    { id: 3, time: "14:00", client: "Ana Costa", pet: "Bob", service: "Banho e Tosa", status: "Pendente" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard Pet Shop</h1>
          <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
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

        {/* Today's Schedule */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Agenda de Hoje</h2>
            <Button className="bg-primary hover:bg-primary-light">Novo Agendamento</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Atendimentos Agendados</CardTitle>
              <CardDescription>Gerenciamento dos agendamentos do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
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
                          {appointment.time} - {appointment.service}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {appointment.client} | Pet: {appointment.pet}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === "Confirmado"
                            ? "bg-accent/10 text-accent"
                            : appointment.status === "Em andamento"
                            ? "bg-secondary/10 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {appointment.status}
                      </span>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              Gerenciar Clientes
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              Calendário Completo
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              Relatórios
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PetShopDashboard;
