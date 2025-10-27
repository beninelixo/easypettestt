import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Plus, Eye, Trash2, PawPrint } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Clientes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    setLoading(true);
    
    // Get all appointments for this pet shop to find clients
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        client_id,
        pet:pets(id, name, breed)
      `)
      .eq("pet_shop_id", user?.id);

    if (!error && appointments) {
      // Get unique client IDs
      const clientIds = [...new Set(appointments.map(a => a.client_id))];
      
      // Fetch client profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", clientIds);
      
      // Group by client and count pets
      const clientsMap = new Map();
      
      appointments.forEach((app) => {
        if (app.client_id) {
          const profile = profiles?.find(p => p.id === app.client_id);
          
          if (!clientsMap.has(app.client_id)) {
            clientsMap.set(app.client_id, {
              id: app.client_id,
              name: profile?.full_name || "Cliente",
              phone: profile?.phone,
              pets: new Set(),
            });
          }
          if (app.pet) {
            clientsMap.get(app.client_id).pets.add(JSON.stringify({
              id: app.pet.id,
              name: app.pet.name,
              breed: app.pet.breed,
            }));
          }
        }
      });

      const clientsList = Array.from(clientsMap.values()).map(client => ({
        ...client,
        pets: Array.from(client.pets).map((p: any) => JSON.parse(p)),
        totalPets: client.pets.size,
      }));

      setClients(clientsList);
    }
    
    setLoading(false);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gerenciar Clientes
          </h1>
          <p className="text-muted-foreground mt-1">
            Lista de todos os seus clientes cadastrados
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Carregando clientes...</p>
          </CardContent>
        </Card>
      ) : filteredClients.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{client.name}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {client.totalPets} pet{client.totalPets !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.phone && (
                  <p className="text-sm text-muted-foreground">
                    📱 {client.phone}
                  </p>
                )}
                
                {client.pets.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Pets:</p>
                    {client.pets.map((pet: any) => (
                      <div key={pet.id} className="flex items-center gap-2 text-sm">
                        <PawPrint className="h-3 w-3 text-primary" />
                        <span>{pet.name}</span>
                        {pet.breed && (
                          <span className="text-muted-foreground">({pet.breed})</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => toast({ title: "Funcionalidade em desenvolvimento" })}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Clientes;
