import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Save, Phone } from "lucide-react";

interface WhatsAppSettings {
  auto_confirmation: boolean;
  auto_reminder: boolean;
  reminder_hours_before: number;
  business_phone: string;
  welcome_message: string;
}

export default function WhatsAppSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [petShopId, setPetShopId] = useState<string>("");
  const [formData, setFormData] = useState<WhatsAppSettings>({
    auto_confirmation: true,
    auto_reminder: true,
    reminder_hours_before: 24,
    business_phone: "",
    welcome_message: "Olá! Obrigado por escolher nosso petshop.",
  });

  // Get pet shop ID
  useQuery({
    queryKey: ["pet-shop-owner"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("pet_shops")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (error) throw error;
      setPetShopId(data.id);
      return data;
    },
  });

  // Get WhatsApp settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["whatsapp-settings", petShopId],
    enabled: !!petShopId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_settings")
        .select("*")
        .eq("pet_shop_id", petShopId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        auto_confirmation: settings.auto_confirmation,
        auto_reminder: settings.auto_reminder,
        reminder_hours_before: settings.reminder_hours_before,
        business_phone: settings.business_phone || "",
        welcome_message: settings.welcome_message || "Olá! Obrigado por escolher nosso petshop.",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: WhatsAppSettings) => {
      const payload = {
        pet_shop_id: petShopId,
        ...data,
      };

      const { error } = await supabase
        .from("whatsapp_settings")
        .upsert(payload, { onConflict: "pet_shop_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-settings"] });
      toast({
        title: "Configurações salvas",
        description: "As configurações de WhatsApp foram atualizadas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Business</h1>
          <p className="text-muted-foreground">
            Configure notificações automáticas via WhatsApp
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>
              Configure seu número e mensagens padrão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business_phone">Número do WhatsApp Business</Label>
              <div className="flex gap-2">
                <Phone className="h-5 w-5 text-muted-foreground mt-2" />
                <Input
                  id="business_phone"
                  placeholder="+55 11 99999-9999"
                  value={formData.business_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, business_phone: e.target.value })
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Formato: +55 DDD número (com código do país)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcome_message">Mensagem de Boas-vindas</Label>
              <Input
                id="welcome_message"
                placeholder="Digite a mensagem de boas-vindas"
                value={formData.welcome_message}
                onChange={(e) =>
                  setFormData({ ...formData, welcome_message: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações Automáticas</CardTitle>
            <CardDescription>
              Configure quando enviar mensagens aos clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Confirmação Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar mensagem de confirmação ao agendar
                </p>
              </div>
              <Switch
                checked={formData.auto_confirmation}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, auto_confirmation: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lembrete Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar lembrete antes da consulta
                </p>
              </div>
              <Switch
                checked={formData.auto_reminder}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, auto_reminder: checked })
                }
              />
            </div>

            {formData.auto_reminder && (
              <div className="space-y-2 pl-4 border-l-2 border-primary">
                <Label htmlFor="reminder_hours">
                  Enviar lembrete com quantas horas de antecedência?
                </Label>
                <Input
                  id="reminder_hours"
                  type="number"
                  min="1"
                  max="168"
                  value={formData.reminder_hours_before}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reminder_hours_before: parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Exemplo: 24 horas = 1 dia antes
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">📱 Como configurar WhatsApp Business API</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>1. Acesse o Meta Business Suite</p>
            <p>2. Configure sua conta WhatsApp Business</p>
            <p>3. Crie templates de mensagem aprovados</p>
            <p>4. Obtenha seu token de API e ID do número</p>
            <p className="text-muted-foreground italic">
              Templates necessários: appointment_reminder, appointment_confirmation
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
