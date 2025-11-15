import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { Activity, Database, Server, HardDrive, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function SystemHealthPanel() {
  const { health, loading, error, refetch } = useSystemHealth();
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'critical':
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'healthy': 'default',
      'online': 'default',
      'degraded': 'secondary',
      'critical': 'destructive',
      'offline': 'destructive'
    };
    return variants[status] || 'outline';
  };

  if (loading && !health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.monitoring.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.monitoring.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={refetch}>{t('common.refresh')}</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('admin.monitoring.health')}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadge(health?.overall || 'offline')}>
            {health?.overall || 'unknown'}
          </Badge>
          <Button variant="ghost" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Database */}
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor(health?.database.status || 'offline')}`}>
              <Database className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Database</p>
              <p className="text-xs text-muted-foreground">
                {health?.database.responseTime}ms
              </p>
              <Badge variant={getStatusBadge(health?.database.status || 'offline')} className="mt-1">
                {health?.database.status}
              </Badge>
            </div>
          </div>

          {/* API */}
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor(health?.api.status || 'offline')}`}>
              <Server className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">API</p>
              <p className="text-xs text-muted-foreground">
                {health?.api.latency}ms
              </p>
              <Badge variant={getStatusBadge(health?.api.status || 'offline')} className="mt-1">
                {health?.api.status}
              </Badge>
            </div>
          </div>

          {/* Storage */}
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor(health?.storage.status || 'offline')}`}>
              <HardDrive className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Storage</p>
              <p className="text-xs text-muted-foreground">Operational</p>
              <Badge variant={getStatusBadge(health?.storage.status || 'offline')} className="mt-1">
                {health?.storage.status}
              </Badge>
            </div>
          </div>

          {/* Uptime */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{t('admin.monitoring.uptime')}</p>
              <p className="text-xs text-muted-foreground">
                {health?.uptime.toFixed(2)}%
              </p>
              <Badge variant="default" className="mt-1">
                Online
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          {t('common.loading')}: {health?.lastCheck.toLocaleString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  );
}
