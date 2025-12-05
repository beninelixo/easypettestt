import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Scissors, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  active: boolean;
}

const ProfessionalServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [petShopId, setPetShopId] = useState<string | undefined>();
  const [isOwner, setIsOwner] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
    active: true,
  });

  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    try {
      // Verifica se é dono
      const { data: petShop } = await supabase
        .from("pet_shops")
        .select("id, owner_id")
        .eq("owner_id", user?.id)
        .maybeSingle();

      if (petShop) {
        // É dono
        setPetShopId(petShop.id);
        setIsOwner(true);
      } else {
        // É funcionário - busca pet shop pelo relacionamento
        const { data: employee } = await supabase
          .from("petshop_employees")
          .select("pet_shop_id")
          .eq("user_id", user?.id)
          .maybeSingle();

        if (employee) {
          setPetShopId(employee.pet_shop_id);
          setIsOwner(false);
        }
      }

      const shopId = petShop?.id || (await supabase
        .from("petshop_employees")
        .select("pet_shop_id")
        .eq("user_id", user?.id)
        .maybeSingle()).data?.pet_shop_id;

      if (!shopId) return;

      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("pet_shop_id", shopId)
        .order("name");

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration_minutes: "",
      active: true,
    });
    setEditingService(null);
  };

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || "",
        price: service.price.toString(),
        duration_minutes: service.duration_minutes.toString(),
        active: service.active,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!petShopId) {
        toast({
          title: "Erro",
          description: "PetShop não encontrado.",
          variant: "destructive",
        });
        return;
      }

      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
        active: formData.active,
        pet_shop_id: petShopId,
      };

      if (editingService) {
        const { error } = await supabase
          .from("services")
          .update(serviceData)
          .eq("id", editingService.id);

        if (error) throw error;

        toast({
          title: "Serviço atualizado!",
          description: "O serviço foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("services")
          .insert(serviceData);

        if (error) throw error;

        toast({
          title: "Serviço criado!",
          description: "O serviço foi criado com sucesso.",
        });
      }

      setDialogOpen(false);
      resetForm();
      loadServices();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o serviço.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Serviço excluído!",
        description: "O serviço foi excluído com sucesso.",
      });

      loadServices();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o serviço.",
        variant: "destructive",
      });
    }
  };

  const toggleServiceStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: `Serviço ${!currentStatus ? "ativado" : "desativado"} com sucesso.`,
      });

      loadServices();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Gerenciar Serviços</h1>
        <div className="flex gap-2">
          {isOwner && (
            <Button asChild variant="outline" className="bg-gradient-to-r from-cyan-500 to-green-500 text-white border-0 hover:from-cyan-600 hover:to-green-600">
              <Link to="/professional/service-templates">
                <Sparkles className="mr-2 h-4 w-4" />
                Catálogo de Serviços
              </Link>
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Serviço
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Editar Serviço" : "Novo Serviço"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome do Serviço</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Banho e Tosa"
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descrição do serviço..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Duração (minutos)</Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_minutes: e.target.value,
                      })
                    }
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Serviço Ativo</Label>
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked })
                  }
                />
              </div>

              <Button className="w-full" onClick={handleSubmit}>
                {editingService ? "Atualizar" : "Criar"} Serviço
              </Button>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {isOwner && (
        <Card className="border-primary/30 bg-gradient-to-r from-cyan-50/50 to-green-50/50 dark:from-cyan-950/20 dark:to-green-950/20">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Adicione Serviços Rapidamente</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha serviços prontos do nosso catálogo e personalize conforme necessário
                </p>
              </div>
            </div>
            <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600">
              <Link to="/professional/service-templates">
                Ver Catálogo
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-muted-foreground">Carregando serviços...</p>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scissors className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum serviço cadastrado ainda.
              <br />
              Clique em "Novo Serviço" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className={!service.active ? "opacity-60" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={service.active}
                      onCheckedChange={() =>
                        toggleServiceStatus(service.id, service.active)
                      }
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.description && (
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                )}
                <div className="space-y-1">
                  <p className="text-2xl font-bold">
                    R$ {service.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Duração: {service.duration_minutes} minutos
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenDialog(service)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="h-3 w-3" />
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

export default ProfessionalServices;
