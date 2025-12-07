import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, Bell, Mail, MessageSquare, Lock, AlertTriangle } from "lucide-react";
import { ExportUserData } from "@/components/user/ExportUserData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const UserPrivacy = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: true,
    whatsappNotifications: true,
    marketingEmails: false,
    dataSharing: false,
    showProfile: true,
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    toast({
      title: "Preferência atualizada",
      description: "Suas configurações de privacidade foram salvas.",
    });
  };

  const handleDeleteAccount = async () => {
    toast({
      title: "Conta será excluída",
      description: "Entre em contato com o suporte para confirmar a exclusão da conta.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Privacidade e Segurança</h1>
              <p className="text-muted-foreground">
                Gerencie como seus dados são utilizados
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações
            </CardTitle>
            <CardDescription>
              Escolha como deseja receber atualizações e lembretes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Notificações por Email
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba confirmações e lembretes de agendamentos
                </p>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Notificações por SMS
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba lembretes via mensagem de texto
                </p>
              </div>
              <Switch
                checked={preferences.smsNotifications}
                onCheckedChange={() => handleToggle('smsNotifications')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  Notificações por WhatsApp
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba atualizações via WhatsApp
                </p>
              </div>
              <Switch
                checked={preferences.whatsappNotifications}
                onCheckedChange={() => handleToggle('whatsappNotifications')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Marketing e Promoções</Label>
                <p className="text-sm text-muted-foreground">
                  Receba ofertas exclusivas e novidades
                </p>
              </div>
              <Switch
                checked={preferences.marketingEmails}
                onCheckedChange={() => handleToggle('marketingEmails')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Privacidade
            </CardTitle>
            <CardDescription>
              Controle quem pode ver suas informações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Perfil Visível</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir que pet shops vejam seu perfil
                </p>
              </div>
              <Switch
                checked={preferences.showProfile}
                onCheckedChange={() => handleToggle('showProfile')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Compartilhamento de Dados</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir compartilhamento para melhorias do serviço
                </p>
              </div>
              <Switch
                checked={preferences.dataSharing}
                onCheckedChange={() => handleToggle('dataSharing')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Actions */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-destructive/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>
              Ações irreversíveis que afetam sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label>Alterar Senha</Label>
                <p className="text-sm text-muted-foreground">
                  Redefina sua senha de acesso
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate('/reset-password')}
              >
                Alterar
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <div className="space-y-1">
                <Label className="text-destructive">Excluir Conta</Label>
                <p className="text-sm text-muted-foreground">
                  Remover permanentemente todos os seus dados
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Todos os seus dados, pets e agendamentos serão permanentemente excluídos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Confirmar Exclusão
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Export User Data - LGPD Art. 18 */}
        <ExportUserData />

        {/* GDPR Info */}
        <Card className="border-2 shadow-lg bg-muted/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-semibold">Seus dados estão protegidos</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Levamos sua privacidade a sério. Todos os dados são criptografados e armazenados com segurança. 
                  Você tem o direito de acessar, corrigir ou excluir suas informações a qualquer momento, 
                  conforme a Lei Geral de Proteção de Dados (LGPD).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserPrivacy;
