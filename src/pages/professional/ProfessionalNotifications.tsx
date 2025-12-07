import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Bell, ChevronLeft, Mail, MessageSquare, 
  Phone, Clock, Calendar, AlertTriangle,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationSettings {
  emailReminders: boolean;
  smsReminders: boolean;
  whatsappReminders: boolean;
  appointmentConfirmation: boolean;
  appointmentCancellation: boolean;
  newClientAlert: boolean;
  dailySummary: boolean;
  reminderHoursBefore: number;
}

const ProfessionalNotifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  
  const [settings, setSettings] = useState<NotificationSettings>({
    emailReminders: true,
    smsReminders: false,
    whatsappReminders: true,
    appointmentConfirmation: true,
    appointmentCancellation: true,
    newClientAlert: true,
    dailySummary: false,
    reminderHoursBefore: 24,
  });

  useEffect(() => {
    // Check push notification support
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setPushSupported(true);
      setPushEnabled(Notification.permission === 'granted');
    }
    
    // Simulate loading settings
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePushToggle = async () => {
    if (!pushSupported) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta notificações push",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!pushEnabled) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setPushEnabled(true);
          toast({
            title: "Notificações ativadas",
            description: "Você receberá alertas em tempo real",
          });
        } else {
          toast({
            title: "Permissão negada",
            description: "Você precisa permitir notificações no navegador",
            variant: "destructive",
          });
        }
      } else {
        setPushEnabled(false);
        toast({
          title: "Notificações desativadas",
          description: "Você não receberá mais alertas push",
        });
      }
    } catch (error) {
      console.error('Push notification error:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Configurações salvas",
      description: "Suas preferências de notificação foram atualizadas",
    });
    
    setSaving(false);
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
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/5 border border-border/50 p-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Notificações
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Configure alertas e lembretes automáticos
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Push Notifications */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-teal-500" />
              Notificações Push
            </CardTitle>
            <CardDescription>
              Receba alertas instantâneos no navegador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">
                Ativar notificações push
              </Label>
              <Switch
                id="push-notifications"
                checked={pushEnabled}
                onCheckedChange={handlePushToggle}
                disabled={!pushSupported}
              />
            </div>
            
            {!pushSupported && (
              <p className="text-sm text-muted-foreground">
                Seu navegador não suporta notificações push
              </p>
            )}

            {pushEnabled && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  new Notification('EasyPet', {
                    body: 'Notificações estão funcionando!',
                    icon: '/icon-192.png'
                  });
                }}
              >
                Testar Notificação
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Channels */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Canais de Notificação</CardTitle>
            <CardDescription>
              Escolha como deseja receber lembretes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">Lembretes por email</p>
                </div>
              </div>
              <Switch
                checked={settings.emailReminders}
                onCheckedChange={() => handleToggle('emailReminders')}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">Mensagens via WhatsApp Business</p>
                </div>
              </div>
              <Switch
                checked={settings.whatsappReminders}
                onCheckedChange={() => handleToggle('whatsappReminders')}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Phone className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">SMS</p>
                  <p className="text-sm text-muted-foreground">Mensagens de texto</p>
                </div>
              </div>
              <Switch
                checked={settings.smsReminders}
                onCheckedChange={() => handleToggle('smsReminders')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Types */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Tipos de Alerta</CardTitle>
            <CardDescription>
              Selecione quais eventos geram notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-green-500" />
                <span>Confirmação de agendamento</span>
              </div>
              <Switch
                checked={settings.appointmentConfirmation}
                onCheckedChange={() => handleToggle('appointmentConfirmation')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Cancelamento de agendamento</span>
              </div>
              <Switch
                checked={settings.appointmentCancellation}
                onCheckedChange={() => handleToggle('appointmentCancellation')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Lembrete de agendamento (24h antes)</span>
              </div>
              <Switch
                checked={settings.emailReminders}
                onCheckedChange={() => handleToggle('emailReminders')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-purple-500" />
                <span>Resumo diário</span>
              </div>
              <Switch
                checked={settings.dailySummary}
                onCheckedChange={() => handleToggle('dailySummary')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
          >
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalNotifications;
