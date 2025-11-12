import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, TestTube } from 'lucide-react';

export default function WebhookManagement() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    service_type: 'slack',
    secret_token: '',
    enabled: true
  });

  const loadWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_endpoints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error: any) {
      console.error('Error loading webhooks:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os webhooks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebhooks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('webhook_endpoints')
        .insert([{
          ...formData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Webhook criado com sucesso'
      });

      setDialogOpen(false);
      setFormData({
        name: '',
        url: '',
        service_type: 'slack',
        secret_token: '',
        enabled: true
      });
      loadWebhooks();
    } catch (error: any) {
      console.error('Error creating webhook:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o webhook',
        variant: 'destructive'
      });
    }
  };

  const toggleWebhook = async (id: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('webhook_endpoints')
        .update({ enabled })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Webhook ${enabled ? 'ativado' : 'desativado'} com sucesso`
      });

      loadWebhooks();
    } catch (error: any) {
      console.error('Error toggling webhook:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o webhook',
        variant: 'destructive'
      });
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('webhook_endpoints')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Webhook removido com sucesso'
      });

      loadWebhooks();
    } catch (error: any) {
      console.error('Error deleting webhook:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o webhook',
        variant: 'destructive'
      });
    }
  };

  const testWebhook = async (webhook: any) => {
    try {
      const { error } = await supabase.functions.invoke('trigger-webhooks', {
        body: {
          alert: {
            title: 'Teste de Webhook',
            message: 'Este é um teste de notificação do sistema EasyPet',
            severity: 'info',
            alert_type: 'test'
          },
          event_type: 'critical_alert'
        }
      });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Notificação de teste enviada'
      });
    } catch (error: any) {
      console.error('Error testing webhook:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar notificação de teste',
        variant: 'destructive'
      });
    }
  };

  const getServiceBadge = (type: string) => {
    const badges: Record<string, { label: string; variant: any }> = {
      slack: { label: 'Slack', variant: 'default' },
      discord: { label: 'Discord', variant: 'secondary' },
      teams: { label: 'Teams', variant: 'outline' }
    };

    const config = badges[type] || { label: type, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Webhooks</h1>
          <p className="text-muted-foreground">
            Configure notificações externas para Slack, Discord e Teams
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Webhook</DialogTitle>
              <DialogDescription>
                Configure um webhook para receber notificações do sistema
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Canal de Alertas"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_type">Serviço</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Webhook URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://hooks.slack.com/services/..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret_token">Token Secreto (Opcional)</Label>
                <Input
                  id="secret_token"
                  type="password"
                  value={formData.secret_token}
                  onChange={(e) => setFormData({ ...formData, secret_token: e.target.value })}
                  placeholder="Token de autorização (se necessário)"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                />
                <Label htmlFor="enabled">Ativar webhook</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Webhook</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhooks Configurados</CardTitle>
          <CardDescription>
            {webhooks.length} webhook(s) configurado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Uso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum webhook configurado
                  </TableCell>
                </TableRow>
              ) : (
                webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell className="font-medium">{webhook.name}</TableCell>
                    <TableCell>{getServiceBadge(webhook.service_type)}</TableCell>
                    <TableCell className="max-w-xs truncate">{webhook.url}</TableCell>
                    <TableCell>
                      <Switch
                        checked={webhook.enabled}
                        onCheckedChange={(checked) => toggleWebhook(webhook.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      {webhook.last_triggered_at ? (
                        <span className="text-sm">
                          {new Date(webhook.last_triggered_at).toLocaleString('pt-BR')}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Nunca usado</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testWebhook(webhook)}
                        >
                          <TestTube className="w-3 h-3 mr-1" />
                          Testar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteWebhook(webhook.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
