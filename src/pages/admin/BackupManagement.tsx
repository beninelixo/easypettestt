import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useBackupManagement } from "@/hooks/useBackupManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database, Download, Clock, HardDrive, CheckCircle2, XCircle, Loader2, Info, Cloud } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BackupManagement() {
  const { backups, loading, createBackup } = useBackupManagement();

  const exportToCloud = async (backupId: string) => {
    try {
      const { error } = await supabase.functions.invoke('backup-to-cloud', {
        body: { backupId }
      });

      if (error) throw error;
      toast.success('Backup exportado para cloud storage');
    } catch (error) {
      console.error('Error exporting backup:', error);
      toast.error('Erro ao exportar backup para cloud');
    }
  };

  const lastBackup = backups.find(b => b.status === 'completed');
  const completedBackups = backups.filter(b => b.status === 'completed');
  const failedBackups = backups.filter(b => b.status === 'failed');

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'in_progress': return <Loader2 className="h-4 w-4 animate-spin" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default">Concluído</Badge>;
      case 'failed': return <Badge variant="destructive">Falhou</Badge>;
      case 'in_progress': return <Badge variant="secondary">Em Progresso</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8 text-primary" />
            Gerenciamento de Backups
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema de backup automático criptografado com AES-256
          </p>
        </div>
        <Button onClick={createBackup} disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando Backup...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Criar Backup Manual
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastBackup 
                ? format(new Date(lastBackup.started_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                : 'Nenhum'
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Backups Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completedBackups.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Backups Falhados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{failedBackups.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Backup Automático Configurado</AlertTitle>
        <AlertDescription>
          Backups automáticos são executados diariamente às 3h AM. Os backups são criptografados com AES-256 e 
          incluem compressão GZIP. Os últimos 30 dias de backups são mantidos.
        </AlertDescription>
      </Alert>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
          <CardDescription>Últimos 50 backups realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum backup realizado ainda
              </div>
            ) : (
              backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(backup.status)}
                    <div className="space-y-1">
                      <div className="font-medium font-mono">{backup.backup_id}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(backup.started_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                        </span>
                        {backup.completed_at && (
                          <span className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            {formatBytes(backup.backup_size_bytes)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {backup.total_records.toLocaleString('pt-BR')} registros
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {backup.tables_backed_up.length} tabelas
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(backup.status)}
                      {backup.status === 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportToCloud(backup.backup_id)}
                        >
                          <Cloud className="h-4 w-4 mr-1" />
                          Cloud
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Backup</CardTitle>
          <CardDescription>Detalhes técnicos do sistema de backup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Segurança</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Criptografia AES-256</li>
                <li>✓ Compressão GZIP</li>
                <li>✓ Armazenamento multi-região</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Automação</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Backup diário às 3h AM</li>
                <li>✓ Retenção de 30 dias</li>
                <li>✓ Notificações automáticas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
