import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const OfflineSyncStatus = () => {
  const { syncStatus, isOnline, syncPendingOperations } = useOfflineSync();

  const handleManualSync = async () => {
    await syncPendingOperations();
  };

  const syncProgress = syncStatus.pending > 0 
    ? ((syncStatus.synced / (syncStatus.synced + syncStatus.pending)) * 100) 
    : 100;

  return (
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
  );
};
