import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, Clock, HardDrive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ConflictResolutionDialog } from '@/components/offline/ConflictResolutionDialog';

export const OfflineSyncStatus = () => {
  const { 
    syncStatus, 
    isOnline, 
    syncPendingOperations,
    conflicts,
    showConflictDialog,
    handleConflictResolution,
    cancelConflictResolution,
    getCompressionStats,
  } = useOfflineSync();

  const compressionStats = getCompressionStats();

  const handleManualSync = async () => {
    await syncPendingOperations();
  };

  const syncProgress = syncStatus.pending > 0 
    ? ((syncStatus.synced / (syncStatus.synced + syncStatus.pending)) * 100) 
    : 100;

  return (
    <>
      <ConflictResolutionDialog
        conflicts={conflicts}
        open={showConflictDialog}
        onResolve={handleConflictResolution}
        onCancel={cancelConflictResolution}
      />
      
      <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-orange-500" />
          )}
          Status de Sincronização
        </CardTitle>
        <CardDescription>
          {isOnline ? 'Conectado à internet' : 'Modo offline - dados serão sincronizados automaticamente'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status de conexão */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Conexão:</span>
          <Badge variant={isOnline ? "default" : "secondary"}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Operações pendentes */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Operações pendentes:</span>
          <Badge variant={syncStatus.pending > 0 ? "destructive" : "outline"}>
            <Clock className="h-3 w-3 mr-1" />
            {syncStatus.pending}
          </Badge>
        </div>

        {/* Operações sincronizadas */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Sincronizadas:</span>
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            {syncStatus.synced}
          </Badge>
        </div>

        {/* Falhas */}
        {syncStatus.failed > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Falhas:</span>
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              {syncStatus.failed}
            </Badge>
          </div>
        )}

        {/* Progresso de sincronização */}
        {syncStatus.inProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso:</span>
              <span className="font-medium">{Math.round(syncProgress)}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
          </div>
        )}

        {/* Última sincronização */}
        {syncStatus.lastSync && (
          <div className="text-sm text-muted-foreground">
            Última sincronização: {formatDistanceToNow(syncStatus.lastSync, { 
              addSuffix: true,
              locale: ptBR 
            })}
          </div>
        )}

        {/* Estatísticas de compressão */}
        {compressionStats.original > 0 && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <HardDrive className="h-4 w-4" />
              Compressão de Dados (LZ-String)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Original:</span>
                <span className="ml-2 font-medium">
                  {(compressionStats.original / 1024).toFixed(2)} KB
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Comprimido:</span>
                <span className="ml-2 font-medium">
                  {(compressionStats.compressed / 1024).toFixed(2)} KB
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Taxa de compressão:</span>
              <Badge variant="outline">
                {compressionStats.ratio.toFixed(1)}% redução
              </Badge>
            </div>
          </div>
        )}

        {/* Botão de sincronização manual */}
        <Button 
          onClick={handleManualSync}
          disabled={!isOnline || syncStatus.inProgress || syncStatus.pending === 0}
          className="w-full"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.inProgress ? 'animate-spin' : ''}`} />
          {syncStatus.inProgress ? 'Sincronizando...' : 'Sincronizar Agora'}
        </Button>
      </CardContent>
    </Card>
    </>
  );
};
