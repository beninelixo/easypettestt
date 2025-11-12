import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, AlertTriangle, Info, XCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SystemErrorLogs() {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['system-error-logs', selectedLevel],
    queryFn: async () => {
      let query = supabase
        .from('structured_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedLevel !== 'all') {
        query = query.eq('level', selectedLevel);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000, // Auto-refresh every 10s
  });

  const { data: stats } = useQuery({
    queryKey: ['error-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('structured_logs')
        .select('level')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const counts = {
        critical: 0,
        error: 0,
        warn: 0,
        info: 0,
      };

      data?.forEach((log) => {
        if (log.level in counts) {
          counts[log.level as keyof typeof counts]++;
        }
      });

      return counts;
    },
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical':
      case 'error':
        return 'destructive';
      case 'warn':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logs de Erro do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de erros e eventos críticos
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Críticos (24h)</p>
              <p className="text-2xl font-bold text-destructive">{stats?.critical || 0}</p>
            </div>
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Erros (24h)</p>
              <p className="text-2xl font-bold text-destructive">{stats?.error || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avisos (24h)</p>
              <p className="text-2xl font-bold text-warning">{stats?.warn || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Info (24h)</p>
              <p className="text-2xl font-bold">{stats?.info || 0}</p>
            </div>
            <Info className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="p-6">
        <Tabs value={selectedLevel} onValueChange={setSelectedLevel}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="critical">Críticos</TabsTrigger>
            <TabsTrigger value="error">Erros</TabsTrigger>
            <TabsTrigger value="warn">Avisos</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedLevel} className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Carregando logs...</p>
            ) : !logs || logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum log encontrado
              </p>
            ) : (
              logs.map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getLevelIcon(log.level)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getLevelBadgeVariant(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{log.module}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm:ss", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{log.message}</p>
                      {log.context && Object.keys(log.context).length > 0 && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            Ver contexto
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        </details>
                      )}
                      {log.user_id && (
                        <p className="text-xs text-muted-foreground">
                          User ID: {log.user_id}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
