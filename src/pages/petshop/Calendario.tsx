import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, PawPrint, User, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Calendario = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [formData, setFormData] = useState({
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
    if (user && selectedDate) {
      loadAppointments();
    }
  }, [user, selectedDate]);

  useEffect(() => {
    if (selectedClient) {
      loadClientPets(selectedClient);
    } else {
      setPets([]);
      setFormData((prev) => ({ ...prev, pet_id: "" }));
    }
  }, [selectedClient]);

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

  const loadServices = async () => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("pet_shop_id", user?.id)
      .eq("active", true)
      .order("name");

    if (data) {
      setServices(data);
    }
  };

  const loadClients = async () => {
    const { data } = await supabase
      .from("appointments")
      .select("client:profiles!appointments_client_id_fkey(id, full_name)")
      .eq("pet_shop_id", user?.id);

    if (data) {
      const uniqueClients = Array.from(
        new Map(data.map((item: any) => [item.client.id, item.client])).values()
      );
      setClients(uniqueClients);
    }
  };

  const loadClientPets = async (clientId: string) => {
    const { data } = await supabase
      .from("pets")
      .select("*")
      .eq("owner_id", clientId)
      .order("name");

    if (data) {
      setPets(data);
    }
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

  const handleCreateAppointment = async () => {
    if (!formData.pet_id || !formData.service_id || !formData.scheduled_time) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("appointments").insert({
      pet_id: formData.pet_id,
      service_id: formData.service_id,
      pet_shop_id: user?.id,
      client_id: selectedClient,
      scheduled_date: format(selectedDate, "yyyy-MM-dd"),
      scheduled_time: formData.scheduled_time,
      notes: formData.notes,
      status: "pending",
    });

    if (!error) {
      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso.",
      });
      setDialogOpen(false);
      setFormData({ pet_id: "", service_id: "", scheduled_time: "", notes: "" });
      setSelectedClient("");
      loadAppointments();
    } else {
      toast({
        title: "Erro ao criar agendamento",
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
          <CardContent className="flex flex-col items-center gap-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-md border w-fit"
            />
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Novo Agendamento</DialogTitle>
                  <DialogDescription>
                    Data: {format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente *</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client: any) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pet">Pet *</Label>
                    <Select
                      value={formData.pet_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, pet_id: value }))
                      }
                      disabled={!selectedClient}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o pet" />
                      </SelectTrigger>
                      <SelectContent>
                        {pets.map((pet: any) => (
                          <SelectItem key={pet.id} value={pet.id}>
                            {pet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Serviço *</Label>
                    <Select
                      value={formData.service_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, service_id: value }))
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

                  <div className="space-y-2">
                    <Label htmlFor="time">Horário *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.scheduled_time}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, scheduled_time: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateAppointment}>Criar Agendamento</Button>
                </div>
              </DialogContent>
            </Dialog>
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
