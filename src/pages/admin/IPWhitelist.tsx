import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Shield, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface WhitelistIP {
  id: string;
  ip_address: string;
  description: string | null;
  created_at: string;
}

export default function IPWhitelist() {
  const [ips, setIps] = useState<WhitelistIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newIP, setNewIP] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadWhitelist();
  }, []);

  const loadWhitelist = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ip_whitelist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIps(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar whitelist',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addIP = async () => {
    if (!newIP.trim()) {
      toast({
        title: 'IP obrigatório',
        description: 'Por favor, insira um endereço IP',
        variant: 'destructive',
      });
      return;
    }

    // Validar formato IP
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(newIP)) {
      toast({
        title: 'IP inválido',
        description: 'Por favor, insira um endereço IP válido (ex: 192.168.1.1)',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('ip_whitelist').insert({
        ip_address: newIP.trim(),
        description: newDescription.trim() || null,
      });

      if (error) throw error;

      toast({
        title: 'IP adicionado à whitelist',
        description: `${newIP} agora está protegido de bloqueios automáticos`,
      });

      setDialogOpen(false);
      setNewIP('');
      setNewDescription('');
      loadWhitelist();
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar IP',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const removeIP = async (id: string, ipAddress: string) => {
    if (!confirm(`Tem certeza que deseja remover ${ipAddress} da whitelist?`)) return;

    try {
      const { error } = await supabase.from('ip_whitelist').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'IP removido',
        description: `${ipAddress} foi removido da whitelist`,
      });

      loadWhitelist();
    } catch (error: any) {
      toast({
        title: 'Erro ao remover IP',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Whitelist de IPs</h1>
          <p className="text-muted-foreground">
            IPs confiáveis que nunca serão bloqueados automaticamente
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar IP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar IP à Whitelist</DialogTitle>
              <DialogDescription>
                Este IP ficará protegido de bloqueios automáticos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ip">Endereço IP *</Label>
                <Input
                  id="ip"
                  placeholder="192.168.1.1"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Ex: Escritório principal, VPN da empresa..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={addIP}>
                  <Check className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            IPs Protegidos
          </CardTitle>
          <CardDescription>
            Total de {ips.length} {ips.length === 1 ? 'IP protegido' : 'IPs protegidos'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ips.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p>Nenhum IP na whitelist</p>
              <p className="text-sm">Adicione IPs confiáveis para protegê-los de bloqueios automáticos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endereço IP</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Adicionado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ips.map((ip) => (
                  <TableRow key={ip.id}>
                    <TableCell className="font-mono font-semibold">{ip.ip_address}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {ip.description || <em>Sem descrição</em>}
                    </TableCell>
                    <TableCell>{new Date(ip.created_at).toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIP(ip.id, ip.ip_address)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
            <div>
              <p className="font-semibold">Proteção Total</p>
              <p className="text-muted-foreground">
                IPs na whitelist nunca serão bloqueados automaticamente, mesmo com múltiplas tentativas falhadas
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
            <div>
              <p className="font-semibold">Rate Limiting Desativado</p>
              <p className="text-muted-foreground">
                IPs protegidos não estão sujeitos a limites de taxa de requisição
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5" />
            <div>
              <p className="font-semibold">Alertas de Email Desativados</p>
              <p className="text-muted-foreground">
                Usuários de IPs protegidos não receberão alertas de segurança por tentativas falhadas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
