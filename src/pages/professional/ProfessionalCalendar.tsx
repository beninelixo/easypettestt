import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Plus, CheckCircle, PlayCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";

const appointmentSchema = z.object({
  pet_id: z.string().uuid("Pet inválido"),
  service_id: z.string().uuid("Serviço inválido"),
  pet_shop_id: z.string().uuid("Pet shop inválido"),
  client_id: z.string().uuid("Cliente inválido"),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Horário inválido (formato HH:MM)"),
  notes: z.string().max(500, "Observações devem ter no máximo 500 caracteres").optional(),
});

interface Appointment {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  notes?: string;
  service: { name: string; duration_minutes: number; price: number };
  client: { full_name: string; phone?: string };
  pet: { name: string; breed?: string };
}

const ProfessionalCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [clientPets, setClientPets] = useState<any[]>([]);
  const [petShopId, setPetShopId] = useState<string>("");
  const { user } = useAuth();
  const { toast } = useToast();
  const { lastUpdate } = useRealtimeMetrics(petShopId);

  const [formData, setFormData] = useState({
    client_id: "",
    pet_id: "",
    service_id: "",
    scheduled_time: "",
    notes: "",
  });

  useEffect(() => {
    if (user) {
      loadServices();
      loadClients();
    }
  }, [user]);

  useEffect(() => {
    if (selectedDate && user) {
      loadAppointments();
    }
  }, [selectedDate, user, lastUpdate]);

  const loadAppointments = async () => {
    try {
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user?.id)
        .single();

      if (!petShop) return;

      if (!petShopId) {
        setPetShopId(petShop.id);
      }

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          scheduled_date,
          scheduled_time,
          status,
          notes,
          client_id,
          service:services(name, duration_minutes, price),
          pet:pets(name, breed)
        `)
        .eq("pet_shop_id", petShop.id)
        .eq("scheduled_date", format(selectedDate, "yyyy-MM-dd"))
        .order("scheduled_time");

      if (error) throw error;
      
      // Fetch client data separately
      const appointmentsWithClients = await Promise.all(
        (data || []).map(async (apt) => {
          const { data: clientData } = await supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", apt.client_id)
            .single();

          return {
            ...apt,
            client: clientData || { full_name: "N/A", phone: "" },
          };
        })
      );

      setAppointments(appointmentsWithClients);
      // Atualiza lista de próximos agendamentos (independente da data selecionada)
      await loadUpcomingAppointments(petShop.id);
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadUpcomingAppointments = async (shopId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        scheduled_date,
        scheduled_time,
        status,
        notes,
        client_id,
        service:services(name, duration_minutes, price),
        pet:pets(name, breed)
      `)
      .eq("pet_shop_id", shopId)
      .gte("scheduled_date", today)
      .in("status", ["pending", "confirmed"])
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true })
      .limit(10);

    if (!error && data) {
      // Enriquecer com dados do cliente
      const withClients = await Promise.all(
        data.map(async (apt) => {
          const { data: clientData } = await supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", apt.client_id)
            .single();
          return { ...apt, client: clientData || { full_name: "Cliente não encontrado", phone: "" } } as any;
        })
      );
      setUpcomingAppointments(withClients as any);
    }
  };

  const loadServices = async () => {
    const { data: petShop } = await supabase
      .from("pet_shops")
      .select("id")
      .eq("owner_id", user?.id)
      .single();

    if (!petShop) return;

    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("pet_shop_id", petShop.id)
      .eq("active", true);

    setServices(data || []);
  };

  const loadClients = async () => {
    const { data: petShop } = await supabase
      .from("pet_shops")
      .select("id")
      .eq("owner_id", user?.id)
      .single();

    if (!petShop) return;

    const { data: appointmentsData } = await supabase
      .from("appointments")
      .select("client_id")
      .eq("pet_shop_id", petShop.id);

    if (!appointmentsData) return;

    const clientIds = [...new Set(appointmentsData.map(a => a.client_id))];
    
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .in("id", clientIds);

    setClients(data || []);
  };

  const loadClientPets = async (clientId: string) => {
    const { data } = await supabase
      .from("pets")
      .select("*")
      .eq("owner_id", clientId);

    setClientPets(data || []);
  };

  const updateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: "O status do agendamento foi atualizado com sucesso.",
      });

      loadAppointments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAppointment = async () => {
    try {
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user?.id)
        .single();

      if (!petShop) {
        toast({
          title: "Erro",
          description: "PetShop não encontrado.",
          variant: "destructive",
        });
        return;
      }

      // Validate input data with Zod
      const appointmentData = appointmentSchema.parse({
        pet_id: formData.pet_id,
        service_id: formData.service_id,
        pet_shop_id: petShop.id,
        client_id: formData.client_id,
        scheduled_date: format(selectedDate, "yyyy-MM-dd"),
        scheduled_time: formData.scheduled_time,
        notes: formData.notes || "",
      });

      const { error } = await supabase.from("appointments").insert([{
        pet_id: appointmentData.pet_id,
        service_id: appointmentData.service_id,
        pet_shop_id: appointmentData.pet_shop_id,
        client_id: appointmentData.client_id,
        scheduled_date: appointmentData.scheduled_date,
        scheduled_time: appointmentData.scheduled_time,
        notes: appointmentData.notes,
        status: "pending",
      }]);

      if (error) throw error;

      toast({
        title: "Agendamento criado!",
        description: "O agendamento foi criado com sucesso.",
      });

      setDialogOpen(false);
      setFormData({
        client_id: "",
        pet_id: "",
        service_id: "",
        scheduled_time: "",
        notes: "",
      });
      loadAppointments();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validação falhou",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar o agendamento.",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      in_progress: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status] || "";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      in_progress: "Em Andamento",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendário de Agendamentos</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Agendamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, client_id: value, pet_id: "" });
                    loadClientPets(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.client_id && (
                <div>
                  <Label>Pet</Label>
                  <Select
                    value={formData.pet_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, pet_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientPets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Serviço</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, service_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - R$ {service.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_time: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Observações adicionais..."
                />
              </div>

              <Button className="w-full" onClick={handleCreateAppointment}>
                Criar Agendamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Próximos agendamentos (independente do dia selecionado) */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos agendamentos (Pendentes/Confirmados)</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <p className="text-muted-foreground">Nenhum agendamento pendente ou confirmado.</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex flex-col border rounded-md p-3 gap-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="text-sm font-semibold">{apt.service.name}</div>
                      <div className="text-xs text-muted-foreground">
                        📅 {format(new Date(apt.scheduled_date + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {apt.scheduled_time.substring(0, 5)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        👤 Cliente: {(apt as any).client?.full_name || "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        🐾 Pet: {apt.pet?.name || "N/A"}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-[300px,1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Selecione uma Data</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Agendamentos - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : appointments.length === 0 ? (
              <p className="text-muted-foreground">
                Nenhum agendamento para esta data.
              </p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">
                                {appointment.scheduled_time}
                              </span>
                            </div>
                            <p className="text-lg font-bold">
                              {appointment.service.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Cliente: {appointment.client.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Pet: {appointment.pet.name}
                            </p>
                            <p className="text-sm font-medium">
                              R$ {appointment.service.price} • {appointment.service.duration_minutes} min
                            </p>
                          </div>
                          <div className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </div>
                        </div>

                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground">
                            Obs: {appointment.notes}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2">
                          {appointment.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(appointment.id, "confirmed")}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Confirmar
                            </Button>
                          )}
                          {appointment.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(appointment.id, "in_progress")}
                            >
                              <PlayCircle className="mr-1 h-3 w-3" />
                              Iniciar
                            </Button>
                          )}
                          {appointment.status === "in_progress" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(appointment.id, "completed")}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Finalizar
                            </Button>
                          )}
                          {["pending", "confirmed"].includes(appointment.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(appointment.id, "cancelled")}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalCalendar;
