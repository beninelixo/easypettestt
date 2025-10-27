import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Users, DollarSign, Clock, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PetShopDashboard = () => {
  const { user, signOut } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  
  const stats = [
    { title: "Agendamentos Hoje", value: appointments.length.toString(), icon: Calendar, color: "text-primary" },
    { title: "Faturamento Mensal", value: "R$ 0,00", icon: DollarSign, color: "text-secondary" },
    { title: "Clientes Ativos", value: "0", icon: Users, color: "text-accent" },
    { title: "Taxa de Retorno", value: "0%", icon: TrendingUp, color: "text-primary" },
  ];

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        pet:pets(name, owner_id),
        service:services(name),
        client:profiles!appointments_client_id_fkey(full_name)
      `)
      .eq("pet_shop_id", user?.id)
      .eq("scheduled_date", today)
      .order("scheduled_time", { ascending: true });

    if (!error && data) {
      setAppointments(data);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", appointmentId);

    if (!error) {
      loadAppointments();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard Pet Shop</h1>
          <Button onClick={signOut} variant="outline" size="icon">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">

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
