import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAdminNotificationPreferences } from "@/hooks/useAdminNotificationPreferences";
import { Loader2, Bell, Mail, MessageSquare, Shield, Activity, Database, CreditCard, Users, Gauge } from "lucide-react";
import { useState, useEffect } from "react";

const NotificationPreferences = () => {
  const { preferences, isLoading, updatePreferences, isUpdating } = useAdminNotificationPreferences();
  const [localPreferences, setLocalPreferences] = useState(preferences);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleChannelToggle = (channel: string, enabled: boolean) => {
    setLocalPreferences(prev => prev ? { ...prev, [`${channel}_enabled`]: enabled } : null);
  };

  const handleAlertToggle = (alertType: string, enabled: boolean) => {
    setLocalPreferences(prev => prev ? { ...prev, [alertType]: enabled } : null);
  };

  const handleWhatsAppNumberChange = (number: string) => {
    setLocalPreferences(prev => prev ? { ...prev, whatsapp_number: number } : null);
  };

  const handleSave = () => {
    if (localPreferences) {
      updatePreferences(localPreferences);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Preferências de Notificações</h1>
        <p className="text-muted-foreground mt-2">
          Configure como e quando você deseja receber alertas do sistema
        </p>
      </div>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Canais de Notificação
          </CardTitle>
          <CardDescription>
            Escolha por quais canais deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email-notifications" className="text-base">Email</Label>
                <p className="text-sm text-muted-foreground">Receber alertas por email</p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={localPreferences?.email_enabled}
              onCheckedChange={(checked) => handleChannelToggle('email', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="push-notifications" className="text-base">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Notificações em tempo real no navegador</p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={localPreferences?.push_enabled}
              onCheckedChange={(checked) => handleChannelToggle('push', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="whatsapp-notifications" className="text-base">WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">Alertas críticos via WhatsApp</p>
                </div>
              </div>
              <Switch
                id="whatsapp-notifications"
                checked={localPreferences?.whatsapp_enabled}
                onCheckedChange={(checked) => handleChannelToggle('whatsapp', checked)}
              />
            </div>
            
            {localPreferences?.whatsapp_enabled && (
              <div className="ml-8 space-y-2">
                <Label htmlFor="whatsapp-number">Número do WhatsApp</Label>
                <Input
                  id="whatsapp-number"
                  type="tel"
                  placeholder="+55 21 99999-9999"
                  value={localPreferences?.whatsapp_number || ''}
                  onChange={(e) => handleWhatsAppNumberChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: +55 DDD NÚMERO (ex: +55 21 95926-2880)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tipos de Alertas
          </CardTitle>
          <CardDescription>
            Selecione quais tipos de alertas você deseja receber
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-red-500" />
              <div>
                <Label htmlFor="security-alerts" className="text-base">Alertas de Segurança</Label>
                <p className="text-sm text-muted-foreground">Tentativas de login suspeitas, IPs bloqueados</p>
              </div>
            </div>
            <Switch
              id="security-alerts"
              checked={localPreferences?.security_alerts}
              onCheckedChange={(checked) => handleAlertToggle('security_alerts', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <Label htmlFor="health-alerts" className="text-base">Saúde do Sistema</Label>
                <p className="text-sm text-muted-foreground">Status de serviços, latência, erros</p>
              </div>
            </div>
            <Switch
              id="health-alerts"
              checked={localPreferences?.system_health_alerts}
              onCheckedChange={(checked) => handleAlertToggle('system_health_alerts', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <Label htmlFor="backup-alerts" className="text-base">Backups</Label>
                <p className="text-sm text-muted-foreground">Status de backups e verificações</p>
              </div>
            </div>
            <Switch
              id="backup-alerts"
              checked={localPreferences?.backup_alerts}
              onCheckedChange={(checked) => handleAlertToggle('backup_alerts', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-yellow-500" />
              <div>
                <Label htmlFor="payment-alerts" className="text-base">Pagamentos</Label>
                <p className="text-sm text-muted-foreground">Falhas de pagamento, assinaturas</p>
              </div>
            </div>
            <Switch
              id="payment-alerts"
              checked={localPreferences?.payment_alerts}
              onCheckedChange={(checked) => handleAlertToggle('payment_alerts', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <Label htmlFor="activity-alerts" className="text-base">Atividade de Usuários</Label>
                <p className="text-sm text-muted-foreground">Novos cadastros, ações importantes</p>
              </div>
            </div>
            <Switch
              id="activity-alerts"
              checked={localPreferences?.user_activity_alerts}
              onCheckedChange={(checked) => handleAlertToggle('user_activity_alerts', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gauge className="h-5 w-5 text-orange-500" />
              <div>
                <Label htmlFor="performance-alerts" className="text-base">Performance</Label>
                <p className="text-sm text-muted-foreground">Alertas de performance e lentidão</p>
              </div>
            </div>
            <Switch
              id="performance-alerts"
              checked={localPreferences?.performance_alerts}
              onCheckedChange={(checked) => handleAlertToggle('performance_alerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => setLocalPreferences(preferences)}
          disabled={isUpdating}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={isUpdating}
        >
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Preferências
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
