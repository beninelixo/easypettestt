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
  full_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome muito longo"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(10, "Telefone deve ter no mínimo 10 dígitos").max(15, "Telefone muito longo"),
  address: z.string().max(200, "Endereço muito longo").optional(),
  notes: z.string().max(500, "Notas muito longas").optional(),
  pet_type: z.enum(["dog", "cat", "bird", "other"]).optional(),
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
    address: "",
    notes: "",
    pet_type: "" as "" | "dog" | "cat" | "bird" | "other",
  });

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

  const handleCreateClient = async () => {
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

      // Criar conta do cliente
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email || `${formData.phone}@easypet.com.br`,
        password: Math.random().toString(36).slice(-8) + "Aa1!", // Senha aleatória
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
      setFormData({ 
        full_name: "", 
        email: "", 
        phone: "", 
        address: "", 
        notes: "", 
        pet_type: "" 
      });
      loadClients();
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
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
                  onChange={(e) => {
                    // Simple phone mask: (XX) XXXXX-XXXX
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length > 11) value = value.slice(0, 11);
                    if (value.length > 10) {
                      value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
                    } else if (value.length > 6) {
                      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
                    } else if (value.length > 2) {
                      value = value.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
                    }
                    setFormData({ ...formData, phone: value });
                  }}
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

              <div className="space-y-2">
                <Label htmlFor="address">Endereço (opcional)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pet_type">Tipo de Pet</Label>
                <select
                  id="pet_type"
                  value={formData.pet_type}
                  onChange={(e) => setFormData({ ...formData, pet_type: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Selecione...</option>
                  <option value="dog">Cachorro</option>
                  <option value="cat">Gato</option>
                  <option value="bird">Pássaro</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações adicionais sobre o cliente ou pet"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.notes.length}/500
                </p>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleCreateClient}>
                  Cadastrar Cliente
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
