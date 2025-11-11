import { memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Plus, Search, User, Calendar, PawPrint } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { VirtualList } from "@/components/ui/virtual-list";

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

// Memoizar card individual de cliente
const ClientCard = memo(({ client, onClick }: { client: Client; onClick: () => void }) => (
  <Card className="hover:shadow-lg transition-shadow mx-2 mb-4">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <User className="h-5 w-5" />
        {client.full_name}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {client.phone && (
        <div className="flex items-center gap-2 text-sm">
          <span>📱</span>
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
        onClick={onClick}
      >
        Ver Detalhes
      </Button>
    </CardContent>
  </Card>
));

ClientCard.displayName = "ClientCard";

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

  const loadClients = useCallback(async () => {
    try {
      let petShopId = null;
      
      const { data: ownedShop } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user?.id)
        .maybeSingle();
      
      if (ownedShop) {
        petShopId = ownedShop.id;
      } else {
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
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadClients();
      
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
  }, [user, loadClients]);

  const handleCreateClient = useCallback(async () => {
    try {
      const validation = clientSchema.safeParse(formData);
      
      if (!validation.success) {
        toast({
          title: "Erro de validação",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email || `${formData.phone}@easypet.com.br`,
        password: Math.random().toString(36).slice(-8) + "Aa1!",
        options: {
          data: {
            full_name: formData.full_name,
            phone: formData.phone,
            user_type: 'client',
          },
        },
      });

      if (authError) throw authError;

      toast({
        title: "Cliente cadastrado!",
        description: "O cliente foi cadastrado com sucesso. Ele pode fazer login com o email/telefone fornecido.",
      });

      setDialogOpen(false);
      setFormData({ full_name: "", email: "", phone: "" });
      loadClients();
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [formData, loadClients, toast]);

  const filteredClients = clients.filter((client) =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNavigateToClient = useCallback((clientId: string) => {
    navigate(`/professional/clients/${clientId}`);
  }, [navigate]);

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
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleCreateClient}>
                  Cadastrar
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
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
        <VirtualList
          items={filteredClients}
          estimateSize={250}
          overscan={3}
          containerClassName="rounded-lg border bg-card"
          renderItem={(client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => handleNavigateToClient(client.id)}
            />
          )}
        />
      )}
    </div>
  );
};

export default ProfessionalClients;
