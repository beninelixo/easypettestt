import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  FileText, ChevronLeft, Download, Trash2, 
  Shield, Eye, Cookie, AlertTriangle, 
  CheckCircle2, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ExportUserData } from "@/components/user/ExportUserData";
import { Skeleton } from "@/components/ui/skeleton";
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

const ProfessionalPrivacy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  
  // Privacy settings
  const [settings, setSettings] = useState({
    shareAnalytics: true,
    allowMarketing: false,
    showInDirectory: true,
    cookieAnalytics: true,
    cookieMarketing: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast({
      title: "Preferência atualizada",
      description: "Suas configurações foram salvas",
    });
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    
    // Simulate deletion process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Solicitação enviada",
      description: "Sua conta será excluída em até 30 dias",
    });
    
    setDeletingAccount(false);
    setShowDeleteDialog(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-border/50 p-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/professional/settings")}
                className="rounded-xl"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Privacidade & Dados
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Gerencie suas preferências de privacidade e dados
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* LGPD Info */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-blue-500 shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Seus direitos LGPD</h3>
                <p className="text-sm text-muted-foreground">
                  De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de acessar, 
                  corrigir, excluir e exportar seus dados pessoais a qualquer momento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Data */}
        <ExportUserData />

        {/* Privacy Settings */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              Preferências de Privacidade
            </CardTitle>
            <CardDescription>
              Controle como seus dados são utilizados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compartilhar análises anônimas</Label>
                <p className="text-sm text-muted-foreground">
                  Ajude a melhorar o EasyPet com dados de uso anônimos
                </p>
              </div>
              <Switch
                checked={settings.shareAnalytics}
                onCheckedChange={() => handleToggle('shareAnalytics')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Receber comunicações de marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Novidades, promoções e dicas do EasyPet
                </p>
              </div>
              <Switch
                checked={settings.allowMarketing}
                onCheckedChange={() => handleToggle('allowMarketing')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exibir no diretório de pet shops</Label>
                <p className="text-sm text-muted-foreground">
                  Seu pet shop aparece nas buscas de clientes
                </p>
              </div>
              <Switch
                checked={settings.showInDirectory}
                onCheckedChange={() => handleToggle('showInDirectory')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cookie Preferences */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-amber-500" />
              Preferências de Cookies
            </CardTitle>
            <CardDescription>
              Gerencie os cookies utilizados no site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cookies essenciais</Label>
                <p className="text-sm text-muted-foreground">
                  Necessários para o funcionamento do site
                </p>
              </div>
              <Switch checked={true} disabled />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cookies de análise</Label>
                <p className="text-sm text-muted-foreground">
                  Nos ajudam a entender como você usa o site
                </p>
              </div>
              <Switch
                checked={settings.cookieAnalytics}
                onCheckedChange={() => handleToggle('cookieAnalytics')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cookies de marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Usados para publicidade personalizada
                </p>
              </div>
              <Switch
                checked={settings.cookieMarketing}
                onCheckedChange={() => handleToggle('cookieMarketing')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <Trash2 className="h-5 w-5" />
              Excluir Conta
            </CardTitle>
            <CardDescription>
              Remova permanentemente sua conta e todos os dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-600 dark:text-red-400">
                    Esta ação é irreversível
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Todos os seus dados, incluindo agendamentos, clientes e configurações serão 
                    permanentemente excluídos. Recomendamos exportar seus dados antes de prosseguir.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Solicitar Exclusão de Conta
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão de Conta
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
              Todos os seus dados serão permanentemente removidos em até 30 dias.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingAccount}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                "Sim, excluir minha conta"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfessionalPrivacy;
