import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PawPrint, Calendar, Clock, Plus, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadPets();
      loadAppointments();
    }
  }, [user]);

  const loadPets = async () => {
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("owner_id", user?.id);

    if (!error && data) {
      setPets(data);
    }
  };

  const loadAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        pet:pets(name),
        service:services(name)
      `)
      .eq("client_id", user?.id)
      .order("scheduled_date", { ascending: true });

    if (!error && data) {
      setAppointments(data);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            Meus Pets
          </h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/new-appointment")}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
            <Button onClick={signOut} variant="outline" size="icon">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">

        {/* Pets Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Meus Pets</h2>
            <Button variant="outline" onClick={() => navigate("/pet/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Pet
            </Button>
          </div>
          {pets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <PawPrint className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Você ainda não cadastrou nenhum pet</p>
                <Button onClick={() => navigate("/pet/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Pet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <Card 
                  key={pet.id} 
                  className="hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/pet/${pet.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PawPrint className="h-5 w-5 text-primary" />
                      {pet.name}
                    </CardTitle>
                    <CardDescription>
                      {pet.breed && `${pet.breed}`}
                      {pet.age && ` • ${pet.age} anos`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="w-full">
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Appointments Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Próximos Agendamentos</h2>
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Você ainda não tem agendamentos</p>
                <Button onClick={() => navigate("/new-appointment")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Fazer Primeiro Agendamento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{appointment.service?.name}</h3>
                        <p className="text-sm text-muted-foreground">Pet: {appointment.pet?.name}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(appointment.scheduled_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.scheduled_time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === "confirmed" ? "bg-accent/10 text-accent" :
                        appointment.status === "pending" ? "bg-secondary/10 text-secondary" :
                        appointment.status === "completed" ? "bg-primary/10 text-primary" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {appointment.status === "confirmed" ? "Confirmado" :
                         appointment.status === "pending" ? "Pendente" :
                         appointment.status === "completed" ? "Concluído" :
                         appointment.status === "in_progress" ? "Em Andamento" :
                         "Cancelado"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ClientDashboard;
