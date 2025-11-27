import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Plus, Search, User, Phone, Calendar, PawPrint } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClientFormComplete } from "@/components/professional/ClientFormComplete";

interface Client {
  id: string;
  full_name: string;
  phone?: string;
  created_at: string;
  pets: Array<{ name: string; breed?: string }>;
}

const ProfessionalClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadClients();
      
      // Configurar realtime para atualizar quando novos agendamentos forem criados
      const channel = supabase
        .channel('appointments_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
          },
          () => {
            loadClients();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadClients = async () => {
    try {
      // Buscar petshop do dono ou do funcionário
      let petShopId = null;
      
      const { data: ownedShop } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user?.id)
        .maybeSingle();
      
      if (ownedShop) {
        petShopId = ownedShop.id;
      } else {
        // Verificar se é funcionário
        const { data: employeeShop } = await supabase
          .from("petshop_employees")
          .select("pet_shop_id")
          .eq("user_id", user?.id)
          .eq("active", true)
          .maybeSingle();
        
        if (employeeShop) {
          petShopId = employeeShop.pet_shop_id;
        }
      }

      if (!petShopId) {
        setLoading(false);
        return;
      }

      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select("client_id")
        .eq("pet_shop_id", petShopId);

      if (!appointmentsData || appointmentsData.length === 0) {
        setLoading(false);
        return;
      }

      const clientIds = [...new Set(appointmentsData.map((a) => a.client_id))];

      const { data: clientsData } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .in("id", clientIds);

      if (!clientsData) {
        setLoading(false);
        return;
      }

      const clientsWithPets = await Promise.all(
        clientsData.map(async (client) => {
          const { data: pets } = await supabase
            .from("pets")
            .select("name, breed")
            .eq("owner_id", client.id);

          return {
            ...client,
            pets: pets || [],
          };
        })
      );

      setClients(clientsWithPets);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientCreated = () => {
    setDialogOpen(false);
    loadClients();
  };

  const filteredClients = clients.filter((client) =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciar Clientes</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <ClientFormComplete 
              open={dialogOpen} 
              onOpenChange={setDialogOpen}
              onSuccess={handleClientCreated}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <p className="text-muted-foreground">Carregando clientes...</p>
      ) : filteredClients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {searchTerm
                ? "Nenhum cliente encontrado com esse nome."
                : "Nenhum cliente cadastrado ainda."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {client.full_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Cliente há{" "}
                    {formatDistanceToNow(new Date(client.created_at), {
                      locale: ptBR,
                    })}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <PawPrint className="h-4 w-4 text-muted-foreground" />
                    <span>Pets:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {client.pets.length === 0 ? (
                      <Badge variant="outline">Nenhum pet cadastrado</Badge>
                    ) : (
                      client.pets.map((pet, index) => (
                        <Badge key={index} variant="secondary">
                          {pet.name}
                          {pet.breed && ` (${pet.breed})`}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate(`/professional/clients/${client.id}`)}
                >
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

export default ProfessionalClients;
