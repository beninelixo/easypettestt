import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Phone, User, DollarSign, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ClientData {
  id: string;
  full_name: string;
  phone: string;
  email: string;
}

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
}

interface Appointment {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  service: {
    name: string;
    price: number;
  };
  pet: {
    name: string;
  };
}

export default function ClientProfile() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [client, setClient] = useState<ClientData | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (clientId) {
      loadClientData();
    }
  }, [clientId]);

  const loadClientData = async () => {
    try {
      // Load client profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .single();

      if (profileError) throw profileError;

      setClient({
        ...profileData,
        email: '', // Email is not accessible from client side for other users
      });

      // Load client's pets
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', clientId);

      if (petsError) throw petsError;
      setPets(petsData || []);

      // Load appointments history
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(name, price),
          pet:pets(name)
        `)
        .eq('client_id', clientId)
        .order('scheduled_date', { ascending: false });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);

      // Calculate total spent (only completed appointments)
      const total = appointmentsData
        ?.filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + (apt.service?.price || 0), 0) || 0;
      
      setTotalSpent(total);

    } catch (error: any) {
      console.error('Error loading client data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      completed: "secondary",
      cancelled: "destructive",
    };

    const labels: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      completed: "Concluído",
      cancelled: "Cancelado",
    };

    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Cliente não encontrado</p>
            <Button onClick={() => navigate(-1)}>Voltar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Client Info */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{client.full_name}</p>
              </div>
              
              {client.email && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </p>
                  <p className="font-medium">{client.email}</p>
                </div>
              )}
              
              {client.phone && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone
                  </p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Gasto
                </p>
                <p className="text-2xl font-bold text-primary">
                  R$ {totalSpent.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pets */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Pets Cadastrados</CardTitle>
              <CardDescription>
                {pets.length} {pets.length === 1 ? 'pet cadastrado' : 'pets cadastrados'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pets.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum pet cadastrado
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {pets.map((pet) => (
                    <Card key={pet.id}>
                      <CardContent className="pt-6">
                        <p className="font-semibold text-lg">{pet.name}</p>
                        <p className="text-sm text-muted-foreground">{pet.breed}</p>
                        <p className="text-sm text-muted-foreground">{pet.age} anos</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointments History */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Histórico de Agendamentos
              </CardTitle>
              <CardDescription>
                {appointments.length} {appointments.length === 1 ? 'agendamento' : 'agendamentos'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum agendamento encontrado
                </p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <Card key={apt.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{apt.service?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Pet: {apt.pet?.name}
                            </p>
                          </div>
                          {getStatusBadge(apt.status)}
                        </div>
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-muted-foreground">
                            {new Date(apt.scheduled_date).toLocaleDateString('pt-BR')} às {apt.scheduled_time}
                          </span>
                          <span className="font-semibold text-primary">
                            R$ {apt.service?.price.toFixed(2)}
                          </span>
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
}