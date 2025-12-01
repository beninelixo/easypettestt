import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Lock, CreditCard, Users, Scissors, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettingsPassword } from "@/hooks/useSettingsPassword";
import { SettingsPasswordDialog } from "@/components/settings/SettingsPasswordDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ProfessionalSettings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [petShopId, setPetShopId] = useState<string>();
  const [attempts, setAttempts] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "verify">("verify");
  const [loadingPetShop, setLoadingPetShop] = useState(true);
  
  const {
    hasPassword,
    loading,
    isAuthenticated,
    createPassword,
    verifyPassword,
    resetAuthentication,
  } = useSettingsPassword(petShopId);

  useEffect(() => {
    loadPetShopId();
  }, [user]);

  useEffect(() => {
    // When password status is loaded, check authentication
    if (!loading && hasPassword !== null && !isAuthenticated) {
      if (hasPassword) {
        setDialogMode("verify");
        setDialogOpen(true);
      } else {
        setDialogMode("create");
        setDialogOpen(true);
      }
    }
  }, [hasPassword, loading, isAuthenticated]);

  const loadPetShopId = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (error) throw error;
      setPetShopId(data.id);
    } catch (error) {
      console.error("Error loading pet shop:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar informações do pet shop",
        variant: "destructive",
      });
    } finally {
      setLoadingPetShop(false);
    }
  };

  const handlePasswordSubmit = async (password: string, confirmPassword?: string) => {
    if (dialogMode === "create") {
      if (password !== confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem",
          variant: "destructive",
        });
        return false;
      }
      return await createPassword(password);
    } else {
      const success = await verifyPassword(password);
      if (!success) {
        setAttempts((prev) => prev + 1);
        if (attempts + 1 >= 3) {
          toast({
            title: "Acesso bloqueado",
            description: "Muitas tentativas incorretas. Tente novamente mais tarde.",
            variant: "destructive",
          });
          setTimeout(() => {
            navigate("/professional/services");
          }, 2000);
        }
      } else {
        setAttempts(0);
      }
      return success;
    }
  };

  if (loadingPetShop || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <SettingsPasswordDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open && !isAuthenticated) {
              navigate("/professional/services");
            }
            setDialogOpen(open);
          }}
          mode={dialogMode}
          onSubmit={handlePasswordSubmit}
          attempts={attempts}
          maxAttempts={3}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {hasPassword
                ? "Digite a senha para acessar as configurações"
                : "Crie uma senha para proteger suas configurações"}
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  const settingsSections = [
    {
      title: "Gerenciar Serviços",
      description: "Adicione, edite ou remova serviços oferecidos",
      icon: Scissors,
      action: "Gerenciar",
      onClick: () => navigate("/professional/services"),
    },
    {
      title: "Perfil do Negócio",
      description: "Edite as informações do seu pet shop",
      icon: Users,
      action: "Editar Perfil",
      onClick: () => navigate("/professional/profile"),
    },
    {
      title: "Funcionários",
      description: "Gerencie funcionários e permissões",
      icon: Users,
      action: "Gerenciar",
      onClick: () => navigate("/professional/employees"),
    },
    {
      title: "Relatórios",
      description: "Visualize relatórios e análises",
      icon: Settings,
      action: "Ver Relatórios",
      onClick: () => navigate("/professional/reports"),
    },
    {
      title: "Backup",
      description: "Realize backup dos seus dados",
      icon: Settings,
      action: "Acessar",
      onClick: () => navigate("/professional/backup"),
    },
    {
      title: "Planos e Pagamentos",
      description: "Configure métodos de pagamento e planos",
      icon: CreditCard,
      action: "Ver Planos",
      onClick: () => navigate("/professional/plans"),
    },
    {
      title: "Alterar Senha de Configurações",
      description: "Atualize sua senha de acesso às configurações",
      icon: Key,
      action: "Alterar",
      onClick: () => {
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "Alterar senha estará disponível em breve",
        });
      },
    },
    {
      title: "Notificações",
      description: "Configure lembretes e alertas",
      icon: Bell,
      action: "Configurar",
      onClick: () =>
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "Configurar notificações estará disponível em breve",
        }),
    },
    {
      title: "Segurança",
      description: "Altere sua senha e configurações de segurança",
      icon: Lock,
      action: "Gerenciar",
      onClick: () =>
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "Gerenciar segurança estará disponível em breve",
        }),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as configurações do seu pet shop
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {settingsSections.map((section, index) => (
          <Card key={index} className="hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <section.icon className="h-5 w-5 text-primary" />
                {section.title}
              </CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={section.onClick}>
                {section.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProfessionalSettings;
