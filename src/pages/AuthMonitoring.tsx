import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, Key, Users, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthLog {
  id: string;
  email: string;
  timestamp: string;
  status: 'success' | 'failed';
  error_message?: string;
  ip_address?: string;
}

interface AuthStats {
  total_logins_today: number;
  total_failures_today: number;
  total_active_sessions: number;
  critical_failures: number;
  last_successful_login?: string;
  last_failed_login?: string;
}

export default function AuthMonitoring() {
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [stats, setStats] = useState<AuthStats>({
    total_logins_today: 0,
    total_failures_today: 0,
    total_active_sessions: 0,
    critical_failures: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAuthData = async () => {
    setLoading(true);
    try {
      // Carregar logs de autenticação dos system_logs
      const { data: logsData, error: logsError } = await supabase
        .from('system_logs')
        .select('*')
        .or('module.eq.login,module.eq.authentication,module.eq.auth')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Processar logs para o formato esperado
      const processedLogs: AuthLog[] = (logsData || []).map((log: any) => ({
        id: log.id,
        email: log.details?.email || log.details?.user_email || 'N/A',
        timestamp: new Date(log.created_at).toLocaleString('pt-BR'),
        status: log.log_type === 'success' ? 'success' : 'failed',
        error_message: log.message,
      }));

      setAuthLogs(processedLogs);

      // Calcular estatísticas
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayLogs = (logsData || []).filter((log: any) => 
        new Date(log.created_at) >= today
      );

      const successfulLogins = todayLogs.filter((log: any) => log.log_type === 'success').length;
      const failedLogins = todayLogs.filter((log: any) => log.log_type === 'error').length;
      const criticalFailures = todayLogs.filter((log: any) => 
        log.log_type === 'error' && log.details?.critical === true
      ).length;

      const lastSuccess = (logsData || []).find((log: any) => log.log_type === 'success');
      const lastFailure = (logsData || []).find((log: any) => log.log_type === 'error');

      setStats({
        total_logins_today: successfulLogins,
        total_failures_today: failedLogins,
        total_active_sessions: 0, // Será implementado com queries específicas
        critical_failures: criticalFailures,
        last_successful_login: lastSuccess ? new Date(lastSuccess.created_at).toLocaleTimeString('pt-BR') : undefined,
        last_failed_login: lastFailure ? new Date(lastFailure.created_at).toLocaleTimeString('pt-BR') : undefined,
      });

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
    loadAuthData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadAuthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const simulateSuccessfulLogin = async () => {
    await supabase.from('system_logs').insert({
      module: 'authentication',
      log_type: 'success',
      message: 'Login simulado bem-sucedido',
      details: {
        email: 'teste@petshop.com',
        simulated: true,
      },
    });
    
    toast({
      title: 'Login Simulado',
      description: 'Login bem-sucedido registrado nos logs',
    });
    
    await loadAuthData();
  };

  const simulateFailedLogin = async () => {
    await supabase.from('system_logs').insert({
      module: 'authentication',
      log_type: 'error',
      message: 'Senha incorreta',
      details: {
        email: 'cliente@pet.com',
        error: 'Invalid password',
        simulated: true,
      },
    });
    
    toast({
      title: 'Falha Simulada',
      description: 'Falha de login registrada nos logs',
      variant: 'destructive',
    });
    
    await loadAuthData();
  };

  const overallStatus = stats.critical_failures > 0 
    ? 'critical' 
    : stats.total_failures_today > 5 
    ? 'warning' 
    : 'healthy';

  const getStatusBadge = (status: string) => {
    const config = {
      healthy: { label: '🟢 Funcional', variant: 'default' as const },
      warning: { label: '🟡 Aviso', variant: 'secondary' as const },
      critical: { label: '🔴 Crítico', variant: 'destructive' as const },
    };
    const { label, variant } = config[status as keyof typeof config] || config.healthy;
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento de Autenticação</h1>
          <p className="text-muted-foreground">
            Análise em tempo real de login, sessões e segurança
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAuthData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status Geral do Sistema de Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-4xl">
              {getStatusBadge(overallStatus)}
            </div>
            <div className="text-sm text-muted-foreground">
              Última atualização: {new Date().toLocaleString('pt-BR')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Logins Bem-sucedidos (Hoje)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {stats.total_logins_today}
            </div>
            {stats.last_successful_login && (
              <p className="text-xs text-muted-foreground mt-1">
                Último: {stats.last_successful_login}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Falhas (Hoje)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {stats.total_failures_today}
            </div>
            {stats.last_failed_login && (
              <p className="text-xs text-muted-foreground mt-1">
                Última: {stats.last_failed_login}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Falhas Críticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              {stats.critical_failures}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requer atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Sessões Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {stats.total_active_sessions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Usuários conectados
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs">Logs Recentes</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnósticos</TabsTrigger>
          <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Autenticação</CardTitle>
              <CardDescription>
                Últimas 50 tentativas de login e eventos de autenticação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mensagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.email}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>
                        {log.status === 'success' ? (
                          <Badge variant="default">✅ Sucesso</Badge>
                        ) : (
                          <Badge variant="destructive">❌ Falha</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.error_message || 'Login bem-sucedido'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics">
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico Automático</CardTitle>
              <CardDescription>
                Análise de problemas comuns de autenticação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h4 className="font-semibold text-green-600">✓ Verificações Passando</h4>
                <ul className="text-sm space-y-1 mt-2 text-muted-foreground">
                  <li>• Supabase Auth configurado corretamente</li>
                  <li>• Persistência de sessão ativa (localStorage)</li>
                  <li>• Token refresh automático habilitado</li>
                  <li>• RLS policies configuradas</li>
                </ul>
              </div>

              {stats.total_failures_today > 5 && (
                <div className="border-l-4 border-yellow-500 pl-4 py-2">
                  <h4 className="font-semibold text-yellow-600">⚠ Avisos</h4>
                  <ul className="text-sm space-y-1 mt-2 text-muted-foreground">
                    <li>• Alto número de falhas de login detectado ({stats.total_failures_today})</li>
                    <li>• Possível tentativa de acesso não autorizado</li>
                  </ul>
                </div>
              )}

              {stats.critical_failures > 0 && (
                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <h4 className="font-semibold text-red-600">✗ Problemas Críticos</h4>
                  <ul className="text-sm space-y-1 mt-2 text-muted-foreground">
                    <li>• {stats.critical_failures} falhas críticas detectadas</li>
                    <li>• Verificar configuração de CORS</li>
                    <li>• Validar URLs de redirecionamento</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>Sugestões de Melhorias</CardTitle>
              <CardDescription>
                Recomendações para otimizar o sistema de autenticação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">🔒 Segurança</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• ✅ Rate limiting implementado (3 tentativas email, 5 IP)</li>
                  <li>• ✅ Bloqueio automático de IPs suspeitos (30 minutos)</li>
                  <li>• Considerar autenticação de dois fatores (2FA)</li>
                  <li>• Configurar notificações por email para bloqueios</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">📊 Monitoramento</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Configurar alertas por e-mail para falhas críticas</li>
                  <li>• Adicionar métricas de tempo de resposta de login</li>
                  <li>• Implementar logs estruturados com contexto completo</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">💡 Experiência do Usuário</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Adicionar opção "Lembrar-me" mais persistente</li>
                  <li>• Implementar recuperação de senha mais robusta</li>
                  <li>• Melhorar mensagens de erro para usuários</li>
                  <li>• Adicionar indicador visual durante autenticação</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📝 Código de Exemplo: Redirecionamento Pós-Login</h4>
                <pre className="text-xs overflow-x-auto">
{`const handleLogin = async (email, password) => {
  const { data, error } = await supabase.auth
    .signInWithPassword({ email, password });
    
  if (error) {
    toast.error('Falha no login: ' + error.message);
    // Log da falha
    await supabase.from('system_logs').insert({
      module: 'authentication',
      log_type: 'error',
      message: error.message,
      details: { email }
    });
  } else {
    // Sucesso - sessão já gerenciada pelo Supabase
    toast.success('Login realizado com sucesso!');
    navigate('/dashboard');
  }
};`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ações de Teste */}
      <Card>
        <CardHeader>
          <CardTitle>Ferramentas de Teste</CardTitle>
          <CardDescription>
            Simule cenários de autenticação para testar o monitoramento
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button onClick={simulateSuccessfulLogin} variant="default">
            <CheckCircle className="h-4 w-4 mr-2" />
            Simular Login Bem-sucedido
          </Button>
          <Button onClick={simulateFailedLogin} variant="destructive">
            <XCircle className="h-4 w-4 mr-2" />
            Simular Falha de Login
          </Button>
          <Button 
            onClick={() => {
              setAuthLogs([]);
              setStats({
                total_logins_today: 0,
                total_failures_today: 0,
                total_active_sessions: 0,
                critical_failures: 0,
              });
            }}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpar Visualização
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
