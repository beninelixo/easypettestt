import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Plus, Eye, Trash2, PawPrint } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { z } from "zod";

const clientSchema = z.object({
  full_name: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  phone: z.string().trim().min(10, "Telefone deve ter no mínimo 10 dígitos").max(20, "Telefone muito longo"),
  password: z.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(50, "Senha muito longa")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
});

const Clientes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    setLoading(true);
    
    // Get pet shop id for owner or active employee
    let shopId: string | null = null;
    const { data: ownedShop } = await supabase
      .from("pet_shops")
      .select("id")
      .eq("owner_id", user?.id)
      .maybeSingle();

    if (ownedShop) {
      shopId = ownedShop.id;
    } else {
      const { data: employeeShop } = await supabase
        .from("petshop_employees")
        .select("pet_shop_id")
        .eq("user_id", user?.id)
        .eq("active", true)
        .maybeSingle();
      if (employeeShop) shopId = employeeShop.pet_shop_id;
    }

    if (!shopId) {
      setClients([]);
      setLoading(false);
      return;
    }
    
    // Get all appointments for this pet shop to find clients (any date/status)
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        client_id,
        pet:pets(id, name, breed)
      `)
      .eq("pet_shop_id", shopId);

    if (!error && appointments) {
      // Get unique client IDs
      const clientIds = [...new Set(appointments.map(a => a.client_id))];
      if (clientIds.length === 0) {
        setClients([]);
        setLoading(false);
        return;
      }
      
      // Fetch client profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", clientIds);
      
      // Group by client and collect pets
      const clientsMap = new Map<string, any>();
      appointments.forEach((app) => {
        if (app.client_id) {
          const profile = profiles?.find(p => p.id === app.client_id);
          if (!clientsMap.has(app.client_id)) {
            clientsMap.set(app.client_id, {
              id: app.client_id,
              name: profile?.full_name || "Cliente",
              phone: profile?.phone,
              pets: new Set<string>(),
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

      const clientsList = Array.from(clientsMap.values()).map((client: any) => ({
        ...client,
        pets: Array.from(client.pets).map((p: any) => JSON.parse(p)),
        totalPets: client.pets.size,
      }));

      setClients(clientsList);
    }
    
    setLoading(false);
  };

  const handleCreateClient = async () => {
    setFormErrors({});

    const validation = clientSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
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
        title: "Cliente cadastrado",
        description: "O cliente foi cadastrado com sucesso e receberá um email de confirmação.",
      });

      setDialogOpen(false);
      setFormData({ full_name: "", email: "", phone: "", password: "" });
      setTimeout(loadClients, 1000);
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message || "Ocorreu um erro ao cadastrar o cliente",
        variant: "destructive",
      });
    }
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados do cliente para criar uma conta no sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  placeholder="Nome do cliente"
                  maxLength={100}
                />
                {formErrors.full_name && (
                  <p className="text-sm text-destructive">{formErrors.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="email@exemplo.com"
                  maxLength={255}
                />
                {formErrors.email && (
                  <p className="text-sm text-destructive">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="(00) 00000-0000"
                  maxLength={20}
                />
                {formErrors.phone && (
                  <p className="text-sm text-destructive">{formErrors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha Inicial *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Mínimo 8 caracteres (maiúsculas, minúsculas, números)"
                  maxLength={50}
                />
                {formErrors.password && (
                  <p className="text-sm text-destructive">{formErrors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  O cliente poderá alterar a senha após o primeiro acesso
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateClient}>Cadastrar Cliente</Button>
            </div>
          </DialogContent>
        </Dialog>
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
                    onClick={() => navigate(`/petshop-dashboard/cliente/${client.id}`)}
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
