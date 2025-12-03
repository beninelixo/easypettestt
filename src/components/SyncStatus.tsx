import { useEffect, useState } from 'react';
import { checkSync } from '@/utils/syncCheck';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SyncTestResults {
  connection: boolean;
  auth: boolean;
  realtime: boolean;
}

interface SyncStatusData {
  synced: boolean;
  tests: SyncTestResults;
  projectId: string;
  timestamp: string;
}

const testLabels: Record<keyof SyncTestResults, string> = {
  connection: 'Conexão Database',
  auth: 'Sistema Auth',
  realtime: 'Realtime WebSocket',
};

export const SyncStatus = () => {
  const [status, setStatus] = useState<SyncStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const verify = async () => {
    setLoading(true);
    const result = await checkSync();
    setStatus(result);
    setLoading(false);
  };

  useEffect(() => {
    verify();
    const interval = setInterval(verify, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return (
      <Card className="border-border">
        <CardContent className="p-6 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Verificando sincronização...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {status?.synced ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-600">Sincronizado</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="text-destructive">Erro de Sincronização</span>
              </>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={verify}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {status?.tests &&
            Object.entries(status.tests).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">
                  {testLabels[key as keyof SyncTestResults]}
                </span>
                {value ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
            ))}
        </div>
        <div className="pt-2 border-t border-border space-y-1">
          <p className="text-xs text-muted-foreground">
            Project ID: <code className="bg-muted px-1 rounded">{status?.projectId}</code>
          </p>
          {status?.timestamp && (
            <p className="text-xs text-muted-foreground">
              Última verificação:{' '}
              {formatDistanceToNow(new Date(status.timestamp), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
