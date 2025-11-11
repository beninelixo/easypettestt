import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Plus, Search, User, MapPin, Phone, Mail, Calendar, PawPrint } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const clientSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().min(10, "Telefone inválido"),
});

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
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    try {
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user?.id)
        .maybeSingle();

      if (!petShop) {
        setLoading(false);
        return;
      }

      const { data: appointmentsData } = await supabase
        .from("appointments")
        .select("client_id")
        .eq("pet_shop_id", petShop.id);

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

  const handleCreateClient = async () => {
    toast({
      title: "Atenção",
      description: "Os clientes devem se cadastrar através do aplicativo ou site. Use a agenda para criar agendamentos para novos clientes.",
      variant: "default",
    });
    setDialogOpen(false);
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Como Cadastrar Clientes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Os clientes devem criar suas próprias contas através do aplicativo ou site do EasyPet.
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Instruções:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Oriente o cliente a acessar o site/app EasyPet</li>
                  <li>O cliente cria sua conta com email e senha</li>
                  <li>O cliente cadastra seus pets</li>
                  <li>Você pode criar agendamentos para o cliente através da agenda</li>
                </ol>
              </div>

              <p className="text-sm text-muted-foreground">
                Após o cliente se cadastrar e realizar um agendamento no seu estabelecimento, ele aparecerá automaticamente na sua lista de clientes.
              </p>

              <Button className="w-full" onClick={() => setDialogOpen(false)}>
                Entendi
              </Button>
            </div>
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
