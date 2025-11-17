import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Mail, Briefcase, Calendar, Trash2, Check, X, Shield } from "lucide-react";
import { EmployeePermissionsManager } from "@/components/permissions/EmployeePermissionsManager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Employee {
  id: string;
  user_id: string;
  position: string;
  hired_at: string;
  active: boolean;
  profiles: {
    full_name: string;
    email?: string;
    phone?: string;
  };
}

const Funcionarios = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [petShopId, setPetShopId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedEmployeeForPermissions, setSelectedEmployeeForPermissions] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: "",
    position: "attendant",
    password: "",
  });

  useEffect(() => {
    if (user) {
      loadPetShopAndEmployees();
    }
  }, [user]);

  const loadPetShopAndEmployees = async () => {
    const { data: petShop } = await supabase
      .from("pet_shops")
      .select("id")
      .eq("owner_id", user?.id)
      .single();

    if (petShop) {
      setPetShopId(petShop.id);
      await loadEmployees(petShop.id);
    }
    setLoading(false);
  };

  const loadEmployees = async (shopId: string) => {
    const { data, error } = await supabase
      .from("petshop_employees")
      .select(`
        id,
        user_id,
        position,
        hired_at,
        active,
        profiles:user_id (
          full_name,
          phone
        )
      `)
      .eq("pet_shop_id", shopId)
      .order("hired_at", { ascending: false });

    if (!error && data) {
      setEmployees(data as any);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            phone: formData.phone,
            user_type: 'professional',
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Erro ao criar usuário");
      }

      // 2. Link employee to pet shop
      const { error: employeeError } = await supabase
        .from("petshop_employees")
        .insert({
          pet_shop_id: petShopId,
          user_id: authData.user.id,
          position: formData.position,
          active: true,
        });

      if (employeeError) throw employeeError;

      toast({
        title: "Funcionário adicionado!",
        description: `${formData.full_name} foi adicionado com sucesso.`,
      });

      setDialogOpen(false);
      setFormData({
        email: "",
        full_name: "",
        phone: "",
        position: "attendant",
        password: "",
      });
      
      await loadEmployees(petShopId);
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar funcionário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (employeeId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("petshop_employees")
      .update({ active: !currentStatus })
      .eq("id", employeeId);

    if (!error) {
      toast({
        title: currentStatus ? "Funcionário desativado" : "Funcionário ativado",
        description: "Status atualizado com sucesso.",
      });
      await loadEmployees(petShopId);
    }
  };

  const handleDeleteEmployee = async () => {
    const { error } = await supabase
      .from("petshop_employees")
      .delete()
      .eq("id", selectedEmployee);

    if (!error) {
      toast({
        title: "Funcionário removido",
        description: "O funcionário foi removido do sistema.",
      });
      setDeleteDialogOpen(false);
      await loadEmployees(petShopId);
    }
  };

  const positionLabels: Record<string, string> = {
    attendant: "Atendente",
    groomer: "Tosador(a)",
    veterinarian: "Veterinário(a)",
    bather: "Banhista",
    manager: "Gerente",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gerenciar Funcionários
          </h1>
          <p className="text-muted-foreground mt-1">
            Adicione profissionais com permissões para gerenciar o pet shop
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Funcionário</DialogTitle>
              <DialogDescription>
                Crie uma conta para o funcionário com permissões de acesso
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="position">Cargo</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendant">Atendente</SelectItem>
                    <SelectItem value="groomer">Tosador(a)</SelectItem>
                    <SelectItem value="veterinarian">Veterinário(a)</SelectItem>
                    <SelectItem value="bather">Banhista</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="password">Senha Inicial</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  O funcionário poderá alterar a senha após o primeiro login
                </p>
              </div>
              <Button type="submit" className="w-full">
                Criar Conta do Funcionário
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Funcionários */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <Card key={employee.id} className={!employee.active ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{employee.profiles.full_name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Briefcase className="h-3 w-3" />
                    {positionLabels[employee.position] || employee.position}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={employee.active ? "outline" : "default"}
                    onClick={() => handleToggleActive(employee.id, employee.active)}
                  >
                    {employee.active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedEmployee(employee.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {employee.profiles.phone && (
                <p className="text-sm text-muted-foreground">📱 {employee.profiles.phone}</p>
              )}
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Admitido em {new Date(employee.hired_at).toLocaleDateString("pt-BR")}
              </p>
              <div className="pt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    employee.active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {employee.active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum funcionário cadastrado ainda.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione profissionais para ajudar no gerenciamento do pet shop.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informações sobre Permissões */}
      <Card>
        <CardHeader>
          <CardTitle>Permissões dos Funcionários</CardTitle>
          <CardDescription>
            O que os funcionários podem fazer no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">✅ Podem Acessar:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Visualizar e confirmar agendamentos</li>
                <li>• Editar serviços e preços</li>
                <li>• Gerenciar horários de atendimento</li>
                <li>• Adicionar e editar produtos</li>
                <li>• Controlar estoque</li>
                <li>• Visualizar relatórios financeiros</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">❌ Não Podem:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Editar dados do pet shop</li>
                <li>• Adicionar ou remover funcionários</li>
                <li>• Excluir o pet shop</li>
                <li>• Alterar configurações de owner</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Dialog para confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este funcionário? Esta ação não pode ser desfeita.
              O funcionário perderá acesso ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmployee} className="bg-destructive">
              Remover Funcionário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Gerenciamento de Permissões */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Permissões</DialogTitle>
            <DialogDescription>
              Configure as permissões de acesso do funcionário
            </DialogDescription>
          </DialogHeader>
          {selectedEmployeeForPermissions && (
            <EmployeePermissionsManager
              employeeId={selectedEmployeeForPermissions.id}
              employeeName={selectedEmployeeForPermissions.profiles.full_name}
              onSave={() => {
                setPermissionsDialogOpen(false);
                toast({
                  title: "Permissões atualizadas",
                  description: "As permissões foram salvas com sucesso.",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Funcionarios;
