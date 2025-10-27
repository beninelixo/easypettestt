import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, PawPrint, User } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const Calendario = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && selectedDate) {
      loadAppointments();
    }
  }, [user, selectedDate]);

  const loadAppointments = async () => {
    setLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        pet:pets(name, breed),
        service:services(name, duration_minutes),
        client:profiles!appointments_client_id_fkey(full_name, phone)
      `)
      .eq("pet_shop_id", user?.id)
      .eq("scheduled_date", dateStr)
      .order("scheduled_time", { ascending: true });

    if (!error && data) {
      setAppointments(data);
    }

    setLoading(false);
  };

  const updateStatus = async (appointmentId: string, newStatus: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", appointmentId);

    if (!error) {
      toast({
        title: "Status atualizado",
        description: "O agendamento foi atualizado com sucesso.",
      });
      loadAppointments();
    } else {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-8 w-8 text-primary" />
          Calendário Completo
        </h1>
        <p className="text-muted-foreground mt-1">
          Visualize e gerencie todos os seus agendamentos
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selecione uma Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Appointments for selected date */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Agendamentos para {format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum agendamento para esta data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{appointment.scheduled_time}</span>
                          <span className="text-muted-foreground">•</span>
                          <span>{appointment.service?.name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{appointment.client?.full_name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <PawPrint className="h-3 w-3" />
                          <span>{appointment.pet?.name}</span>
                          {appointment.pet?.breed && (
                            <span>({appointment.pet.breed})</span>
                          )}
                        </div>

                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            📝 {appointment.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            appointment.status === "confirmed"
                              ? "bg-accent/10 text-accent"
                              : appointment.status === "in_progress"
                              ? "bg-secondary/10 text-secondary"
                              : appointment.status === "completed"
                              ? "bg-primary/10 text-primary"
                              : appointment.status === "cancelled"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {appointment.status === "confirmed" ? "Confirmado" :
                           appointment.status === "in_progress" ? "Em Andamento" :
                           appointment.status === "completed" ? "Concluído" :
                           appointment.status === "cancelled" ? "Cancelado" :
                           "Pendente"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {appointment.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(appointment.id, "confirmed")}
                        >
                          Confirmar
                        </Button>
                      )}
                      {appointment.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(appointment.id, "in_progress")}
                        >
                          Iniciar
                        </Button>
                      )}
                      {appointment.status === "in_progress" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(appointment.id, "completed")}
                        >
                          Concluir
                        </Button>
                      )}
                      {(appointment.status === "pending" || appointment.status === "confirmed") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(appointment.id, "cancelled")}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendario;
