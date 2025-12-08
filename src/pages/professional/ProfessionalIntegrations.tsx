import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Link2, ChevronLeft, MessageSquare, Webhook, 
  Calendar, Key, Copy, ExternalLink, CheckCircle2,
  AlertCircle, Plus, Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeatureGate } from "@/components/FeatureGate";

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  active: boolean;
}

const ProfessionalIntegrations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // WhatsApp
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  
  // Calendar
  const [calendarConnected, setCalendarConnected] = useState(false);
  
  // Webhooks
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: "1",
      url: "https://api.example.com/webhook",
      events: ["appointment.created", "appointment.cancelled"],
      active: true,
    },
  ]);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  // API Key
  const [apiKey] = useState("epk_live_xxxxxxxxxxxxxxxxxxxxxxxx");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "Copiado!",
      description: "Chave de API copiada para a área de transferência",
    });
  };

  const handleConnectWhatsApp = () => {
    if (!whatsappNumber) {
      toast({
        title: "Número obrigatório",
        description: "Informe seu número do WhatsApp Business",
        variant: "destructive",
      });
      return;
    }
    
    setWhatsappConnected(true);
    toast({
      title: "WhatsApp conectado",
      description: "Integração configurada com sucesso",
    });
  };

  const handleConnectCalendar = () => {
    // Simulate OAuth flow
    toast({
      title: "Conectando...",
      description: "Redirecionando para Google Calendar",
    });
    
    setTimeout(() => {
      setCalendarConnected(true);
      toast({
        title: "Calendário sincronizado",
        description: "Google Calendar conectado com sucesso",
      });
    }, 1500);
  };

  const handleAddWebhook = () => {
    if (!newWebhookUrl) {
      toast({
        title: "URL obrigatória",
        description: "Informe a URL do webhook",
        variant: "destructive",
      });
      return;
    }

    const newWebhook: WebhookConfig = {
      id: Date.now().toString(),
      url: newWebhookUrl,
      events: ["appointment.created"],
      active: true,
    };

    setWebhooks(prev => [...prev, newWebhook]);
    setNewWebhookUrl("");
    setShowWebhookDialog(false);
    
    toast({
      title: "Webhook adicionado",
      description: "Endpoint configurado com sucesso",
    });
  };

  const handleRemoveWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
    toast({
      title: "Webhook removido",
      description: "Endpoint desconectado",
    });
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(w => 
      w.id === id ? { ...w, active: !w.active } : w
    ));
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
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/5 border border-border/50 p-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                <Link2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Integrações
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Conecte serviços externos ao seu pet shop
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* WhatsApp Business - Platinum Only */}
        <FeatureGate featureKey="whatsapp_integration" requiredPlan="platinum">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    WhatsApp Business
                  </CardTitle>
                  <CardDescription>
                    Envie notificações automáticas para clientes
                  </CardDescription>
                </div>
                <Badge 
                  variant={whatsappConnected ? "default" : "secondary"}
                  className={whatsappConnected ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                >
                  {whatsappConnected ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Conectado
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Desconectado
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!whatsappConnected ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-number">Número WhatsApp Business</Label>
                    <Input
                      id="whatsapp-number"
                      placeholder="(11) 99999-9999"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use seu número do WhatsApp Business API
                    </p>
                  </div>
                  <Button 
                    onClick={handleConnectWhatsApp}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Conectar WhatsApp
                  </Button>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">WhatsApp conectado</p>
                        <p className="text-sm text-muted-foreground">{whatsappNumber}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setWhatsappConnected(false)}
                      className="text-red-500"
                    >
                      Desconectar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Google Calendar - Gold+ */}
        <FeatureGate featureKey="calendar_sync" requiredPlan="gold">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Google Calendar
                  </CardTitle>
                  <CardDescription>
                    Sincronize agendamentos com seu calendário
                  </CardDescription>
                </div>
                <Badge 
                  variant={calendarConnected ? "default" : "secondary"}
                  className={calendarConnected ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : ""}
                >
                  {calendarConnected ? "Sincronizado" : "Desconectado"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!calendarConnected ? (
                <Button onClick={handleConnectCalendar} variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Conectar Google Calendar
                </Button>
              ) : (
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Calendário sincronizado</p>
                        <p className="text-sm text-muted-foreground">Agendamentos aparecem no seu Google Calendar</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCalendarConnected(false)}
                      className="text-red-500"
                    >
                      Desconectar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Webhooks - Platinum Only */}
        <FeatureGate featureKey="webhook_integration" requiredPlan="platinum">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="h-5 w-5 text-purple-500" />
                    Webhooks
                  </CardTitle>
                  <CardDescription>
                    Receba eventos em tempo real na sua aplicação
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowWebhookDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {webhooks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum webhook configurado
                </p>
              ) : (
                webhooks.map((webhook) => (
                  <div 
                    key={webhook.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Switch
                        checked={webhook.active}
                        onCheckedChange={() => handleToggleWebhook(webhook.id)}
                      />
                      <div className="min-w-0">
                        <p className="font-mono text-sm truncate">{webhook.url}</p>
                        <div className="flex gap-1 mt-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="secondary" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveWebhook(webhook.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </FeatureGate>

        {/* API Keys */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-500" />
              Chaves de API
            </CardTitle>
            <CardDescription>
              Use para integrar com sistemas externos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Chave de API</Label>
                  <p className="font-mono text-sm mt-1">
                    {showApiKey ? apiKey : "epk_live_••••••••••••••••••••••••"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? "Ocultar" : "Mostrar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyApiKey}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Nunca compartilhe sua chave de API. Use variáveis de ambiente no seu código.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Webhook Dialog */}
      <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Webhook</DialogTitle>
            <DialogDescription>
              Configure um endpoint para receber eventos em tempo real
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL do Endpoint</Label>
              <Input
                id="webhook-url"
                placeholder="https://api.example.com/webhook"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddWebhook}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfessionalIntegrations;
