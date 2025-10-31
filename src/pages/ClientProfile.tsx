import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Phone, Calendar, PawPrint, MessageSquare, Edit, History, DollarSign, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ClientProfile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  email?: string;
}

interface Pet {
  id: string;
  name: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  observations: string | null;
  allergies: string | null;
  photo_url: string | null;
}

interface Appointment {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  completed_at: string | null;
  notes: string | null;
  services: {
    name: string;
    price: number;
  };
  pets: {
    name: string;
  };
}

const ClientProfile = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (user && clientId) {
      loadClientData();
    }
  }, [user, clientId]);

  const loadClientData = async () => {
    try {
      setLoading(true);

      // Load client profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", clientId)
        .single();

      if (profileError) throw profileError;

      setClient(profileData);

      // Load client's pets
      const { data: petsData, error: petsError } = await supabase
        .from("pets")
        .select("*")
        .eq("owner_id", clientId)
        .order("created_at", { ascending: false });

      if (!petsError && petsData) {
        setPets(petsData);
      }

      // Get pet shop id
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user?.id)
        .single();

      if (!petShop) return;

      // Load client's appointments with service and pet details
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          *,
          services (name, price),
          pets (name)
        `)
        .eq("client_id", clientId)
        .eq("pet_shop_id", petShop.id)
        .order("scheduled_date", { ascending: false });

      if (!appointmentsError && appointmentsData) {
        setAppointments(appointmentsData);
        
        // Calculate total spent from completed appointments
        const total = appointmentsData
          .filter(apt => apt.status === 'completed')
          .reduce((sum, apt) => sum + (apt.services?.price || 0), 0);
        setTotalSpent(total);
      }
    } catch (error) {
      console.error("Error loading client data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as informações do cliente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600 hover:bg-green-700">Concluído</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-600 hover:bg-blue-700">Confirmado</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-lg text-muted-foreground">Cliente não encontrado</p>
        <Button onClick={() => navigate("/petshop-dashboard/clientes")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6 animate-in fade-in duration-500">
      {/* Header with Back Button and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/petshop-dashboard/clientes")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Editar Cliente
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Enviar Mensagem
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <History className="h-4 w-4" />
            Histórico Completo
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Client Info Card */}
        <Card className="md:col-span-1 border-2 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="text-center pb-4 bg-gradient-to-br from-primary/10 to-primary/5">
            <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-primary shadow-lg">
              <AvatarImage src={client.avatar_url || undefined} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                {client.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{client.full_name}</CardTitle>
            <CardDescription className="text-sm mt-2">
              Cliente desde {format(new Date(client.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Separator />
            
            <div className="space-y-3">
              {client.phone && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{client.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <PawPrint className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">{pets.length} pet(s) cadastrado(s)</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">{appointments.length} agendamento(s)</span>
              </div>
            </div>

            <Separator />
            
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 text-center border-2 border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Total Gasto</p>
              </div>
              <p className="text-3xl font-bold text-primary">
                R$ {totalSpent.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pets and Appointments */}
        <div className="md:col-span-2 space-y-6">
          {/* Pets Section */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="h-5 w-5 text-primary" />
                Pets Cadastrados
              </CardTitle>
              <CardDescription>Informações dos pets deste cliente</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {pets.length === 0 ? (
                <div className="text-center py-12">
                  <PawPrint className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground">Nenhum pet cadastrado ainda</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pets.map((pet) => (
                    <Card key={pet.id} className="border-2 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full">
                            <PawPrint className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{pet.name}</CardTitle>
                            {pet.breed && (
                              <CardDescription className="text-sm mt-1">
                                {pet.breed}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <div className="space-y-2 text-sm">
                          {pet.age !== null && (
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span className="text-muted-foreground">Idade:</span>
                              <span className="font-medium">{pet.age} ano(s)</span>
                            </div>
                          )}
                          {pet.weight !== null && (
                            <div className="flex justify-between p-2 bg-muted/50 rounded">
                              <span className="text-muted-foreground">Peso:</span>
                              <span className="font-medium">{pet.weight} kg</span>
                            </div>
                          )}
                        </div>
                        {pet.allergies && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-red-600 font-medium">
                              <strong>⚠️ Alergias:</strong> {pet.allergies}
                            </p>
                          </div>
                        )}
                        {pet.observations && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                              <strong>Observações:</strong> {pet.observations}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointments History */}
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Histórico de Serviços
              </CardTitle>
              <CardDescription>
                Todos os agendamentos realizados ({appointments.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <Card 
                      key={appointment.id} 
                      className="border-2 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h4 className="font-semibold text-lg">
                                {appointment.services?.name}
                              </h4>
                              {getStatusBadge(appointment.status)}
                            </div>
                            
                            <div className="grid sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                <PawPrint className="h-4 w-4 text-primary" />
                                <span><strong>Pet:</strong> {appointment.pets?.name}</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span>
                                  {format(new Date(appointment.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              <strong>Horário:</strong> {appointment.scheduled_time}
                            </p>
                            
                            {appointment.notes && (
                              <div className="p-2 bg-muted/50 rounded">
                                <p className="text-xs text-muted-foreground">
                                  <strong>Observações:</strong> {appointment.notes}
                                </p>
                              </div>
                            )}
                            
                            {appointment.completed_at && (
                              <p className="text-xs text-green-600 font-medium">
                                ✓ Concluído em {format(new Date(appointment.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-4 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Valor</p>
                              <p className="text-2xl font-bold text-primary">
                                R$ {appointment.services?.price.toFixed(2)}
                              </p>
                            </div>
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
    </div>
  );
};

export default ClientProfile;
