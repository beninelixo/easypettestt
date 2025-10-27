import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const NewAppointment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pets, setPets] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  useEffect(() => {
    loadPets();
    loadServices();
  }, [user]);

  const loadPets = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("owner_id", user.id);

    if (!error && data) {
      setPets(data);
    }
  };

  const loadServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("active", true);

    if (!error && data) {
      setServices(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPet || !selectedService || !selectedDate || !selectedTime || !user) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Get pet shop id from service
    const service = services.find(s => s.id === selectedService);
    
    const { error } = await supabase
      .from("appointments")
      .insert({
        pet_id: selectedPet,
        service_id: selectedService,
        pet_shop_id: service?.pet_shop_id,
        client_id: user.id,
        scheduled_date: format(selectedDate, "yyyy-MM-dd"),
        scheduled_time: selectedTime,
        status: "pending",
      });

    setLoading(false);

    if (error) {
      toast({
        title: "Erro ao criar agendamento",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Agendamento criado!",
        description: "Seu agendamento foi realizado com sucesso.",
      });
      navigate("/client-dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/client-dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Novo Agendamento</h1>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Agendar Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pet">Selecione o Pet</Label>
                <Select value={selectedPet} onValueChange={setSelectedPet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} - {pet.breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Selecione o Serviço</Label>
                {services.length === 0 ? (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Nenhum serviço disponível no momento</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-3">
                    {services.map((service) => (
                      <Card 
                        key={service.id}
                        className={`cursor-pointer transition-all ${
                          selectedService === service.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-accent/5'
                        }`}
                        onClick={() => setSelectedService(service.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                              {service.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm">
                                <span className="font-medium text-primary">
                                  R$ {Number(service.price).toFixed(2)}
                                </span>
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {service.duration_minutes} min
                                </span>
                              </div>
                            </div>
                            {selectedService === service.id && (
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Selecione a Data</Label>
                <div className="border rounded-md p-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={ptBR}
                    disabled={(date) => date < new Date()}
                    className="rounded-md"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Selecione o Horário</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Agendando..." : "Confirmar Agendamento"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewAppointment;
