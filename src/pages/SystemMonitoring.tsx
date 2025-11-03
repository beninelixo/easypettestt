import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Database, Shield, Trash2, RefreshCw, AlertCircle, CheckCircle, AlertTriangle, Wrench, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SystemStats {
  total_users: number;
  total_pet_shops: number;
  total_appointments_today: number;
  errors_last_24h: number;
  warnings_last_24h: number;
}

interface HealthCheck {
  id: string;
  service_name: string;
  status: 'healthy' | 'warning' | 'critical';
  response_time_ms: number;
  last_check: string;
  error_message?: string;
  metadata?: any;
}

interface SystemLog {
  id: string;
  module: string;
  log_type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
  created_at: string;
}

export default function SystemMonitoring() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar estatísticas
      const { data: statsData, error: statsError } = await supabase.rpc('get_system_stats');
      if (statsError) throw statsError;
      setStats(statsData as unknown as SystemStats);

      // Carregar health checks
      const { data: healthData, error: healthError } = await supabase
        .from('system_health')
        .select('*')
        .order('last_check', { ascending: false });
      if (healthError) throw healthError;
      setHealthChecks((healthData || []) as HealthCheck[]);

      // Carregar logs recentes
      const { data: logsData, error: logsError } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (logsError) throw logsError;
      setLogs((logsData || []) as SystemLog[]);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const runHealthCheck = async () => {
    setRunningJob('health-check');
    try {
      const { error } = await supabase.functions.invoke('health-check');
      if (error) throw error;
      
      toast({
        title: 'Health Check Executado',
        description: 'Verificação de saúde concluída com sucesso',
      });
      
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Erro no Health Check',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRunningJob(null);
    }
  };

  const runCleanup = async () => {
    setRunningJob('cleanup');
    try {
      const { error } = await supabase.functions.invoke('cleanup-job');
      if (error) throw error;
      
      toast({
        title: 'Limpeza Executada',
        description: 'Limpeza automática concluída com sucesso',
      });
      
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Erro na Limpeza',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRunningJob(null);
    }
  };

  const runAutoFix = async () => {
    setRunningJob('auto-fix');
    try {
      toast({
        title: 'Correções Automáticas',
        description: 'Iniciando correções automáticas...',
      });
      
      const { data, error } = await supabase.functions.invoke('auto-fix');
      if (error) throw error;
      
      const result = data as { total_fixed: number; execution_time_ms: number };
      
      toast({
        title: 'Correções Concluídas',
        description: `✅ ${result.total_fixed} problemas corrigidos em ${result.execution_time_ms}ms. Backup criado e notificação enviada!`,
      });
      
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Erro nas Correções',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRunningJob(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      healthy: 'default',
      warning: 'secondary',
      critical: 'destructive',
      info: 'default',
      success: 'default',
      error: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const overallStatus = healthChecks.some(h => h.status === 'critical')
    ? 'critical'
    : healthChecks.some(h => h.status === 'warning')
    ? 'warning'
    : 'healthy';

  if (loading && !stats) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento do Sistema</h1>
          <p className="text-muted-foreground">Status em tempo real de todos os serviços</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            Status Geral do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">
              {getStatusBadge(overallStatus)}
            </div>
            <div className="text-sm text-muted-foreground">
              Última atualização: {new Date().toLocaleString('pt-BR')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pet Shops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_pet_shops || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_appointments_today || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Erros (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats?.errors_last_24h || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avisos (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats?.warnings_last_24h || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Verificação de Serviços
          </CardTitle>
          <CardDescription>Status de saúde dos serviços críticos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tempo de Resposta</TableHead>
                <TableHead>Última Verificação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healthChecks.map(check => (
                <TableRow key={check.id}>
                  <TableCell className="font-medium">{check.service_name}</TableCell>
                  <TableCell>{getStatusBadge(check.status)}</TableCell>
                  <TableCell>{check.response_time_ms}ms</TableCell>
                  <TableCell>{new Date(check.last_check).toLocaleString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ações Manuais */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Manuais</CardTitle>
          <CardDescription>Execute tarefas de manutenção sob demanda</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            onClick={runHealthCheck}
            disabled={!!runningJob}
            variant="outline"
          >
            {runningJob === 'health-check' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            {runningJob === 'health-check' ? 'Executando...' : 'Rodar Health Check'}
          </Button>
          <Button
            onClick={runCleanup}
            disabled={!!runningJob}
            variant="outline"
          >
            {runningJob === 'cleanup' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {runningJob === 'cleanup' ? 'Executando...' : 'Executar Limpeza'}
          </Button>
          <Button
            onClick={runAutoFix}
            disabled={!!runningJob}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            {runningJob === 'auto-fix' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wrench className="h-4 w-4 mr-2" />
            )}
            {runningJob === 'auto-fix' ? 'Corrigindo...' : '🔧 Corrigir + Backup + E-mail'}
          </Button>
        </CardContent>
      </Card>

      {/* Logs Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Logs Recentes
          </CardTitle>
          <CardDescription>Últimos 50 eventos do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Módulo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>Data/Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.module}</TableCell>
                  <TableCell>{getStatusBadge(log.log_type)}</TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell>{new Date(log.created_at).toLocaleString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}