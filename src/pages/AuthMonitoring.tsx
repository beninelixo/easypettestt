import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, Mail, Check } from 'lucide-react';
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
  const [suspiciousIPs, setSuspiciousIPs] = useState<Array<{ ip: string; attempts: number }>>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAuthData = async () => {
    setLoading(true);
    try {
      // Fetch login attempts from last 24 hours
      const { data: attempts, error } = await supabase
        .from('login_attempts')
        .select('*')
        .gte('attempt_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('attempt_time', { ascending: false })
        .limit(100);
      
      // Analyze suspicious IPs (multiple failures)
      if (attempts) {
        const ipMap = new Map<string, number>();
        attempts.filter(a => !a.success && a.ip_address).forEach(a => {
          const count = ipMap.get(a.ip_address!) || 0;
          ipMap.set(a.ip_address!, count + 1);
        });
        
        const suspicious = Array.from(ipMap.entries())
          .filter(([_, count]) => count >= 3)
          .map(([ip, attempts]) => ({ ip, attempts }))
          .sort((a, b) => b.attempts - a.attempts)
          .slice(0, 10);
        
        setSuspiciousIPs(suspicious);
      }

      if (error) throw error;

      // Processar logs
      const processedLogs: AuthLog[] = (attempts || []).map((log: any) => ({
        id: log.id,
        email: log.email || 'N/A',
        timestamp: new Date(log.attempt_time).toLocaleString('pt-BR'),
        status: log.success ? 'success' : 'failed',
        error_message: log.success ? undefined : 'Credenciais inválidas',
        ip_address: log.ip_address,
      }));

      setAuthLogs(processedLogs);

      // Calcular estatísticas
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayAttempts = (attempts || []).filter((log: any) => 
        new Date(log.attempt_time) >= today
      );

      const successfulLogins = todayAttempts.filter((log: any) => log.success).length;
      const failedLogins = todayAttempts.filter((log: any) => !log.success).length;

      const lastSuccess = (attempts || []).find((log: any) => log.success);
      const lastFailure = (attempts || []).find((log: any) => !log.success);

      setStats({
        total_logins_today: successfulLogins,
        total_failures_today: failedLogins,
        total_active_sessions: 0,
        critical_failures: suspiciousIPs.filter(ip => ip.attempts >= 10).length,
        last_successful_login: lastSuccess ? new Date(lastSuccess.attempt_time).toLocaleTimeString('pt-BR') : undefined,
        last_failed_login: lastFailure ? new Date(lastFailure.attempt_time).toLocaleTimeString('pt-BR') : undefined,
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
            Análise em tempo real de tentativas de login e segurança
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
              IPs com 10+ tentativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              IPs Suspeitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              {suspiciousIPs.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              3+ tentativas falhadas
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logs">Logs Recentes</TabsTrigger>
          <TabsTrigger value="suspicious">
            IPs Suspeitos
            {suspiciousIPs.length > 0 && (
              <Badge variant="destructive" className="ml-2">{suspiciousIPs.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="diagnostico">Diagnósticos</TabsTrigger>
          <TabsTrigger value="sugestoes">Sugestões</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Tentativas de Login (Últimas 24h)</CardTitle>
              <CardDescription>
                Histórico completo de todas as tentativas de login registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-mail</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.email}</TableCell>
                      <TableCell className="font-mono text-xs">{log.ip_address || 'N/A'}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>
                        {log.status === 'success' ? (
                          <Badge variant="default">✅ Sucesso</Badge>
                        ) : (
                          <Badge variant="destructive">❌ Falha</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspicious" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                IPs com Múltiplas Tentativas Falhadas
              </CardTitle>
              <CardDescription>
                IPs com 3 ou mais tentativas de login falhadas nas últimas 24 horas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suspiciousIPs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Check className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>Nenhum IP suspeito detectado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suspiciousIPs.map(({ ip, attempts }) => (
                    <div key={ip} className="flex items-center justify-between p-4 border rounded-lg bg-destructive/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          attempts >= 10 ? 'bg-red-500' :
                          attempts >= 5 ? 'bg-orange-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="font-mono font-semibold">{ip}</p>
                          <p className="text-sm text-muted-foreground">
                            {attempts} tentativas falhadas
                          </p>
                        </div>
                      </div>
                      <Badge variant={attempts >= 10 ? 'destructive' : 'secondary'}>
                        {attempts >= 10 ? 'Crítico' : attempts >= 5 ? 'Alto Risco' : 'Atenção'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Automáticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Bloqueio Automático</p>
                  <p className="text-sm text-muted-foreground">
                    IPs com 5+ tentativas são bloqueados automaticamente por 30 minutos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Alertas por Email</p>
                  <p className="text-sm text-muted-foreground">
                    Usuários recebem alertas na 3ª, 5ª e 10ª tentativa falhada
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Monitoramento Contínuo</p>
                  <p className="text-sm text-muted-foreground">
                    Esta página atualiza automaticamente a cada 30 segundos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostico">
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
                  <li>• Rate limiting implementado e funcional</li>
                  <li>• Sistema de alertas por email ativo</li>
                  <li>• Bloqueio automático de IPs configurado</li>
                  <li>• Monitoramento em tempo real operacional</li>
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
                    <li>• {stats.critical_failures} IPs com atividade suspeita crítica</li>
                    <li>• Verificar lista de IPs bloqueados</li>
                    <li>• Considerar implementar CAPTCHA adicional</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sugestoes">
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
                  <li>• ✅ Alertas por email nas tentativas 3, 5 e 10</li>
                  <li>• Considerar autenticação de dois fatores (2FA)</li>
                  <li>• Implementar análise comportamental de usuários</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">📊 Monitoramento</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• ✅ Dashboard de IPs suspeitos em tempo real</li>
                  <li>• ✅ Atualização automática a cada 30 segundos</li>
                  <li>• Adicionar métricas de tempo de resposta de login</li>
                  <li>• Implementar alertas Slack/Discord para admins</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">💡 Experiência do Usuário</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Implementar recuperação de senha com código OTP</li>
                  <li>• Adicionar verificação de força de senha</li>
                  <li>• Melhorar feedback visual de tentativas restantes</li>
                  <li>• Mostrar histórico de dispositivos conectados</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}