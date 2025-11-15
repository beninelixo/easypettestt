import { useState } from 'react';
export default function SystemLogs() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<LogFilters>({});
  const { logs, loading, error, exportLogs } = useAdvancedLogs(filters);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-700" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      info: 'default',
      warning: 'secondary',
      error: 'destructive',
      critical: 'destructive'
    };
    return variants[level] || 'outline';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('admin.logs.title')}</h1>
            <p className="text-muted-foreground">
              Visualize e analise logs do sistema em tempo real
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => exportLogs('json')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
            <Button onClick={() => exportLogs('csv')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar logs..."
                    value={filters.search || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="max-w-sm pl-10"
                  />
                </div>
              </div>
              <Select
                value={filters.level?.[0] || 'all'}
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, level: value === 'all' ? undefined : [value] }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('admin.logs.level')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading && logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                {error}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum log encontrado
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="log-entry flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    data-level={log.level}
                  >
                    <div className="mt-0.5">
                      {getLevelIcon(log.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getLevelBadge(log.level)}>
                          {log.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {log.module}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                        </span>
                        {log.trace_id && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {log.trace_id.slice(0, 8)}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-sm">{log.message}</p>
                      {log.details && (
                        <pre className="mt-2 text-xs bg-muted/50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando {logs.length} registros</span>
          <span>Atualização em tempo real ativa</span>
        </div>
      </div>
    </AdminLayout>
  );
}
