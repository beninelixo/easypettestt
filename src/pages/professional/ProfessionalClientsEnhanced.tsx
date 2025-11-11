import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Search, User, Phone, Calendar, PawPrint, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Client {
  id: string;
  full_name: string;
  phone?: string;
  created_at: string;
  pets: Array<{ name: string; breed?: string }>;
  total_appointments: number;
}

const ProfessionalClientsEnhanced = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadClients();
      
      // Setup realtime to auto-register new clients when they book
      const channel = supabase
        .channel('appointments-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'appointments',
          },
          async (payload) => {
            console.log('New appointment detected:', payload);
            await handleNewAppointment(payload.new);
            loadClients(); // Refresh client list
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const handleNewAppointment = async (appointment: any) => {
    try {
      // Get pet shop info
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user?.id)
        .single();

      if (!petShop || appointment.pet_shop_id !== petShop.id) {
        return; // Not for this pet shop
      }

      // Check if this client already has a relationship with this pet shop
      // This is implicit through appointments, but we could create a explicit table if needed
      
      console.log('New client auto-registered via appointment:', {
        client_id: appointment.client_id,
        pet_shop_id: petShop.id,
      });

      toast({
        title: "✅ Novo cliente registrado!",
        description: "Um novo cliente foi adicionado automaticamente após fazer um agendamento.",
      });
    } catch (error) {
      console.error('Error auto-registering client:', error);
    }
  };

  const loadClients = async () => {
    try {
      // Get pet shop id first
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user?.id)
        .single();

      if (!petShop) {
        setLoading(false);
        return;
      }

      // Get all unique clients who have appointments at this pet shop
      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          client_id,
          profiles:client_id (
            id,
            full_name,
            phone,
            created_at
          ),
          pets:pet_id (
            name,
            breed
          )
        `)
        .eq("pet_shop_id", petShop.id);

      if (appointments) {
        // Group by client
        const clientsMap = new Map<string, Client>();

        appointments.forEach((apt: any) => {
          const clientId = apt.client_id;
          const profile = apt.profiles;
          const pet = apt.pets;

          if (!profile) return;

          if (!clientsMap.has(clientId)) {
            clientsMap.set(clientId, {
              id: clientId,
              full_name: profile.full_name,
              phone: profile.phone,
              created_at: profile.created_at,
              pets: [],
              total_appointments: 0,
            });
          }

          const client = clientsMap.get(clientId)!;
          
          // Add pet if not already added
          if (pet && !client.pets.some(p => p.name === pet.name)) {
            client.pets.push(pet);
          }

          client.total_appointments++;
        });

        setClients(Array.from(clientsMap.values()));
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground mt-2">
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">🎯 Cadastro Automático Ativo</h3>
              <p className="text-sm text-muted-foreground">
                Quando um cliente novo agendar um serviço, ele será automaticamente adicionado à sua lista de clientes em tempo real.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4 text-muted-foreground">Carregando clientes...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Tente buscar por outro nome ou telefone" 
                : "Os clientes serão adicionados automaticamente quando fizerem agendamentos"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(`/petshop-dashboard/clientes/${client.id}`)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{client.full_name}</CardTitle>
                      {client.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Cliente há {formatDistanceToNow(new Date(client.created_at), { locale: ptBR })}
                  </span>
                </div>

                {client.pets.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <PawPrint className="h-4 w-4 text-primary" />
                      <span>Pets ({client.pets.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {client.pets.slice(0, 3).map((pet, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {pet.name}
                        </Badge>
                      ))}
                      {client.pets.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{client.pets.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total de agendamentos:</span>
                    <Badge variant="default">{client.total_appointments}</Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full" size="sm">
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfessionalClientsEnhanced;
