import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Plus, Send, Users } from "lucide-react";
import { toast } from "sonner";

const Marketing = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [petShopId, setPetShopId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    message: "",
    target_audience: "todos",
    channel: "whatsapp",
  });

  useEffect(() => {
    if (user) {
      loadPetShopAndCampaigns();
    }
  }, [user]);

  const loadPetShopAndCampaigns = async () => {
    const { data: petShop } = await supabase
      .from("pet_shops")
      .select("id")
      .eq("owner_id", user?.id)
      .single();

    if (petShop) {
      setPetShopId(petShop.id);
      await loadCampaigns(petShop.id);
    }
  };

  const loadCampaigns = async (shopId: string) => {
    const { data, error } = await supabase
      .from("marketing_campaigns")
      .select("*")
      .eq("pet_shop_id", shopId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCampaigns(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("marketing_campaigns").insert({
      ...formData,
      pet_shop_id: petShopId,
      status: "rascunho",
      recipients_count: 0,
    });

    if (error) {
      toast.error("Erro ao criar campanha");
    } else {
      toast.success("Campanha criada com sucesso!");
      setIsDialogOpen(false);
      loadCampaigns(petShopId);
      setFormData({
        name: "",
        message: "",
        target_audience: "todos",
        channel: "whatsapp",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-primary" />
            Campanhas de Marketing
          </h1>
          <p className="text-muted-foreground mt-1">Comunique-se com seus clientes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Campanha</DialogTitle>
              <DialogDescription>Configure sua campanha de marketing</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Campanha *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Promoção de Verão"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Digite a mensagem que será enviada aos clientes..."
                />
                <p className="text-xs text-muted-foreground">
                  {formData.message.length} caracteres
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target">Público-Alvo *</Label>
                  <Select 
                    value={formData.target_audience} 
                    onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Clientes</SelectItem>
                      <SelectItem value="frequentes">Clientes Frequentes</SelectItem>
                      <SelectItem value="inativos">Clientes Inativos (30+ dias)</SelectItem>
                      <SelectItem value="vip">Clientes VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel">Canal *</Label>
                  <Select 
                    value={formData.channel} 
                    onValueChange={(value) => setFormData({ ...formData, channel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Estimativa de Alcance</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">
                    {formData.target_audience === "todos" ? "Todos os clientes ativos" :
                     formData.target_audience === "frequentes" ? "Clientes com 3+ visitas" :
                     formData.target_audience === "inativos" ? "Clientes sem visitas há 30+ dias" :
                     "Clientes com programa de fidelidade"}
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Rascunho</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
            <Megaphone className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Criadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Enviadas</CardTitle>
            <Send className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {campaigns.filter(c => c.status === "enviada").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Com sucesso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alcance Total</CardTitle>
            <Users className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {campaigns.reduce((sum, c) => sum + (c.recipients_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Destinatários</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Minhas Campanhas</CardTitle>
          <CardDescription>Gerencie suas campanhas de marketing</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma campanha criada ainda</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                Criar Primeira Campanha
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        campaign.status === "enviada" 
                          ? "bg-primary/10 text-primary"
                          : campaign.status === "agendada"
                          ? "bg-secondary/10 text-secondary"
                          : campaign.status === "cancelada"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {campaign.status === "enviada" ? "Enviada" :
                         campaign.status === "agendada" ? "Agendada" :
                         campaign.status === "cancelada" ? "Cancelada" : "Rascunho"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{campaign.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="capitalize">{campaign.channel}</span>
                      <span>•</span>
                      <span className="capitalize">{campaign.target_audience.replace("_", " ")}</span>
                      {campaign.recipients_count > 0 && (
                        <>
                          <span>•</span>
                          <span>{campaign.recipients_count} destinatários</span>
                        </>
                      )}
                    </div>
                  </div>
                  {campaign.status === "rascunho" && (
                    <Button size="sm" className="ml-4">
                      <Send className="h-3 w-3 mr-2" />
                      Enviar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle>Dicas para Campanhas de Sucesso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">1</div>
            <p className="text-sm text-muted-foreground">Personalize a mensagem com o nome do cliente</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-xs font-bold">2</div>
            <p className="text-sm text-muted-foreground">Inclua um call-to-action claro (agendar, comprar, visitar)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-xs font-bold">3</div>
            <p className="text-sm text-muted-foreground">Envie em horários estratégicos (manhã ou tarde)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">4</div>
            <p className="text-sm text-muted-foreground">Teste diferentes mensagens e públicos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Marketing;