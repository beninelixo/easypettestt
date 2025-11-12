import { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Database, HardDrive, Wifi, CheckCircle, XCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OfflineSyncStatus } from '@/components/OfflineSyncStatus';
import { useOfflineAnalytics } from '@/hooks/useOfflineAnalytics';
import { cacheConfigManager } from '@/lib/offline-cache-config';

const Diagnostics = () => {
  const { toast } = useToast();
  const [appVersion, setAppVersion] = useState<string>('');
  const [swVersion, setSwVersion] = useState<string>('');
  const [swStatus, setSwStatus] = useState<'active' | 'inactive' | 'installing'>('inactive');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [localStorageSize, setLocalStorageSize] = useState<number>(0);
  const [localStorageItems, setLocalStorageItems] = useState<Record<string, string>>({});
  const [cacheNames, setCacheNames] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'disconnected'>('disconnected');
  
  const { 
    analytics, 
    getMostVisitedPages, 
    getOfflineUsageRate,
    getAverageCacheRecoveryTime 
  } = useOfflineAnalytics();

  const loadDiagnostics = async () => {
    setRefreshing(true);

    // Versão da aplicação
    const version = localStorage.getItem('easypet_app_version') || 'Desconhecida';
    setAppVersion(version);

    // Status online/offline
    setIsOnline(navigator.onLine);

    // Service Worker status e versão
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        if (registration.active) {
          setSwStatus('active');
          
          // Pedir versão ao Service Worker
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            if (event.data && event.data.version) {
              setSwVersion(event.data.version);
            }
          };
          
          registration.active.postMessage(
            { type: 'GET_VERSION' },
            [messageChannel.port2]
          );
        } else if (registration.installing) {
          setSwStatus('installing');
        }
      }
    }

    // Cache size
    if ('caches' in window) {
      const names = await caches.keys();
      setCacheNames(names);
      
      let totalSize = 0;
      for (const name of names) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }
      setCacheSize(totalSize);
    }

    // LocalStorage size e items
    let lsSize = 0;
    const items: Record<string, string> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        items[key] = value;
        lsSize += key.length + value.length;
      }
    }
    
    setLocalStorageSize(lsSize);
    setLocalStorageItems(items);

    // Testar conexão Supabase
    try {
      const { error } = await supabase.from('user_roles').select('count').limit(1);
      setSupabaseStatus(error ? 'disconnected' : 'connected');
    } catch {
      setSupabaseStatus('disconnected');
    }

    setRefreshing(false);
  };

  useEffect(() => {
    loadDiagnostics();

    // Monitorar mudanças de status online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleClearCache = async () => {
    if (!confirm('Isso irá limpar todo o cache e recarregar a página. Deseja continuar?')) {
      return;
    }

    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }

      toast({
        title: "Cache limpo",
        description: "Recarregando a página...",
      });

      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast({
        title: "Erro ao limpar cache",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleClearLocalStorage = () => {
    if (!confirm('Isso irá limpar todos os dados locais e fazer logout. Deseja continuar?')) {
      return;
    }

    localStorage.clear();
    sessionStorage.clear();
    
    toast({
      title: "Dados locais limpos",
      description: "Recarregando a página...",
    });

    setTimeout(() => window.location.reload(), 1000);
  };

  const handleForceUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        toast({
          title: "Atualização forçada",
          description: "Verificando por novas versões...",
        });
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20';
      case 'installing':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'installing':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Diagnóstico do Sistema
            </h1>
            <p className="text-muted-foreground mt-2">
              Informações detalhadas sobre cache, versão e dados armazenados
            </p>
          </div>
          
          <Button
            onClick={loadDiagnostics}
            disabled={refreshing}
            size="lg"
          >
            <RefreshCw className={`mr-2 h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Versão do App
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appVersion}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Service Worker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className={`flex items-center gap-1 ${getStatusColor(swStatus)}`}>
                  {getStatusIcon(swStatus)}
                  {swStatus}
                </Badge>
                {swVersion && <span className="text-sm text-muted-foreground">v{swVersion}</span>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Conexão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`flex items-center gap-1 w-fit ${isOnline ? 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20'}`}>
                {isOnline ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Supabase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(supabaseStatus)}`}>
                {getStatusIcon(supabaseStatus)}
                {supabaseStatus}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cache" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="cache">Cache</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="sync">Sincronização</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="actions">Ações</TabsTrigger>
          </TabsList>

          <TabsContent value="cache" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cache do Navegador</CardTitle>
                <CardDescription>
                  Informações sobre o cache armazenado localmente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Tamanho Total</p>
                    <p className="text-sm text-muted-foreground">{formatBytes(cacheSize)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Caches Ativos</p>
                    <p className="text-sm text-muted-foreground">{cacheNames.length}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="font-medium">Caches Disponíveis:</p>
                  <ScrollArea className="h-48 w-full rounded border p-4">
                    {cacheNames.length > 0 ? (
                      <ul className="space-y-2">
                        {cacheNames.map((name) => (
                          <li key={name} className="text-sm font-mono bg-muted px-3 py-2 rounded">
                            {name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum cache disponível</p>
                    )}
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Local Storage</CardTitle>
                <CardDescription>
                  Dados armazenados no navegador ({formatBytes(localStorageSize)})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full rounded border p-4">
                  {Object.keys(localStorageItems).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(localStorageItems).map(([key, value]) => (
                        <div key={key} className="bg-muted p-3 rounded space-y-1">
                          <p className="font-medium text-sm break-all">{key}</p>
                          <p className="text-xs text-muted-foreground font-mono break-all">
                            {value.length > 100 ? `${value.substring(0, 100)}...` : value}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tamanho: {formatBytes(key.length + value.length)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum dado armazenado</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <OfflineSyncStatus />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics de Uso Offline
                </CardTitle>
                <CardDescription>
                  Estatísticas de uso offline e performance de cache
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total de Sessões Offline</p>
                    <p className="text-2xl font-bold">{analytics.totalSessions}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Taxa de Uso Offline</p>
                    <p className="text-2xl font-bold">{getOfflineUsageRate().toFixed(1)}%</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Páginas Mais Acessadas Offline:</p>
                  {getMostVisitedPages(5).length > 0 ? (
                    getMostVisitedPages(5).map((page, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground truncate">{page.page}</span>
                        <Badge variant="outline">{page.count} visitas</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma página acessada offline ainda</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tempo Médio de Recuperação</span>
                    <span className="text-sm font-medium">{getAverageCacheRecoveryTime().toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Duração Total Offline</span>
                    <span className="text-sm font-medium">
                      {(analytics.totalDuration / 1000 / 60).toFixed(1)} min
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Cache */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Cache</CardTitle>
                <CardDescription>
                  Gerenciar preferências de cache offline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tamanho Máximo do Cache</span>
                  <span className="text-sm font-medium">
                    {cacheConfigManager.getConfig().maxCacheSizeMB} MB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tamanho Atual</span>
                  <span className="text-sm font-medium">
                    {cacheConfigManager.getCurrentCacheSizeMB().toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Limpeza Automática</span>
                  <Badge variant="outline">
                    {cacheConfigManager.getConfig().autoCleanup}
                  </Badge>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      if (cacheConfigManager.shouldCleanup()) {
                        cacheConfigManager.performCleanup();
                        toast({
                          title: "✅ Limpeza Concluída",
                          description: "Cache antigo foi removido com sucesso.",
                        });
                        loadDiagnostics();
                      } else {
                        toast({
                          title: "ℹ️ Limpeza não Necessária",
                          description: "O cache ainda não precisa de limpeza.",
                        });
                      }
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Cache Antigo
                  </Button>
                  <Button 
                    onClick={() => {
                      cacheConfigManager.clearAllCache();
                      toast({
                        title: "🗑️ Cache Limpo",
                        description: "Todo o cache offline foi removido.",
                        variant: "destructive",
                      });
                      loadDiagnostics();
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Tudo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ações de Manutenção</CardTitle>
                <CardDescription>
                  Execute ações de limpeza e manutenção do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={handleForceUpdate}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Forçar Verificação de Atualização
                  </Button>

                  <Button
                    onClick={handleClearCache}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Todo o Cache
                  </Button>

                  <Button
                    onClick={handleClearLocalStorage}
                    variant="destructive"
                    className="w-full justify-start"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Local Storage (Fazer Logout)
                  </Button>
                </div>

                <Separator />

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500 mb-2">
                    ⚠️ Atenção
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Limpar o cache ou local storage irá remover dados temporários e pode fazer logout.
                    Use essas ações apenas se estiver enfrentando problemas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Diagnostics;
