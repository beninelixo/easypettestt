import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings, Bell, Lock, CreditCard, Users, Scissors, Key, 
  BarChart3, Database, AlertCircle, Shield, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettingsPassword } from "@/hooks/useSettingsPassword";
import { SettingsPasswordDialog } from "@/components/settings/SettingsPasswordDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ProfessionalSettings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [petShopId, setPetShopId] = useState<string>();
  const [attempts, setAttempts] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "verify">("verify");
  const [loadingPetShop, setLoadingPetShop] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    hasPassword,
    loading,
    isAuthenticated,
    createPassword,
    verifyPassword,
  } = useSettingsPassword(petShopId);

  useEffect(() => {
    loadPetShopId();
  }, [user]);

  useEffect(() => {
    if (!loading && hasPassword !== null && petShopId) {
      if (isAuthenticated) {
        setShowSettings(true);
        setDialogOpen(false);
      } else {
        setShowSettings(false);
        if (hasPassword) {
          setDialogMode("verify");
        } else {
          setDialogMode("create");
        }
        setDialogOpen(true);
      }
    }
  }, [hasPassword, loading, isAuthenticated, petShopId]);

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
      const success = await createPassword(password);
      if (success) {
        toast({
          title: "✅ Senha criada!",
          description: "Configurações desbloqueadas com sucesso!",
        });
        // Store unlock state in session
        sessionStorage.setItem('easypet_settings_unlocked', 'true');
        setDialogOpen(false);
        setShowSettings(true);
      }
      return success;
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
        toast({
          title: "✅ Senha verificada!",
          description: "Configurações desbloqueadas com sucesso!",
        });
        // Store unlock state in session
        sessionStorage.setItem('easypet_settings_unlocked', 'true');
        setDialogOpen(false);
        setShowSettings(true);
      }
      return success;
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !isAuthenticated) {
      navigate("/professional/services");
    }
    setDialogOpen(open);
  };

  if (loadingPetShop || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 lg:p-8">
        <SettingsPasswordDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          mode={dialogMode}
          onSubmit={handlePasswordSubmit}
          attempts={attempts}
          maxAttempts={3}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Alert className="max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
            <Shield className="h-5 w-5 text-primary" />
            <AlertDescription className="ml-2">
              {hasPassword
                ? "Digite a senha para acessar as configurações protegidas"
                : "Crie uma senha para proteger suas configurações"}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const settingsSections = [
    {
      title: "Gerenciar Serviços",
      description: "Adicione, edite ou remova serviços oferecidos",
      icon: Scissors,
      gradient: "from-emerald-500 to-green-600",
      onClick: () => navigate("/professional/services"),
    },
    {
      title: "Relatórios",
      description: "Visualize relatórios e análises detalhadas",
      icon: BarChart3,
      gradient: "from-pink-500 to-rose-600",
      onClick: () => navigate("/professional/reports"),
    },
    {
      title: "Perfil do Negócio",
      description: "Edite as informações do seu pet shop",
      icon: Users,
      gradient: "from-cyan-500 to-blue-600",
      onClick: () => navigate("/professional/profile"),
    },
    {
      title: "Funcionários",
      description: "Gerencie funcionários e permissões",
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      onClick: () => navigate("/professional/employees"),
    },
    {
      title: "Backup",
      description: "Realize backup dos seus dados",
      icon: Database,
      gradient: "from-slate-500 to-slate-600",
      onClick: () => navigate("/professional/backup"),
    },
    {
      title: "Planos e Pagamentos",
      description: "Configure métodos de pagamento e planos",
      icon: CreditCard,
      gradient: "from-amber-500 to-orange-600",
      onClick: () => navigate("/professional/plans"),
    },
    {
      title: "Alterar Senha de Configurações",
      description: "Atualize sua senha de acesso às configurações",
      icon: Key,
      gradient: "from-red-500 to-rose-600",
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
      gradient: "from-teal-500 to-cyan-600",
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
      gradient: "from-indigo-500 to-blue-600",
      onClick: () =>
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "Gerenciar segurança estará disponível em breve",
        }),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-500/10 via-slate-400/10 to-slate-500/5 border border-border/50 p-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Configurações
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Gerencie todas as configurações do seu pet shop
                </p>
              </div>
            </div>
            
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={() => navigate("/professional/services")}
              className="flex items-center gap-2 rounded-xl border-border/50 hover:bg-muted/60"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Voltar
            </Button>
          </div>
        </header>

        {/* Settings Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {settingsSections.map((section, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={section.onClick}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${section.gradient} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <section.icon className="h-5 w-5 text-white" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <CardTitle className="text-base mt-3 group-hover:text-primary transition-colors">
                  {section.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {section.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSettings;
