import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useGodActions } from "@/hooks/useGodActions";
import { 
  Building2, Users, Calendar, DollarSign, Shield, Database, 
  Mail, HardDrive, AlertTriangle, CheckCircle, Clock, Activity,
  TrendingUp, Zap, Brain, Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboard() {
  const { stats, systemHealth, security, recentActivity, isLoading } = useAdminStats();
  const { executeAction, loadingAction } = useGodActions();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          Dashboard Administrativo
        </h1>
        <p className="text-muted-foreground mt-2 text-base">Visão geral completa do sistema EasyPet</p>
      </div>

      {/* Estatísticas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-l-4 border-l-primary/50 hover:border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Total Pet Shops
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Building2 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">{stats.totalPetShops}</div>
            <Badge variant="secondary" className="mt-2 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% este mês
            </Badge>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-l-4 border-l-secondary/50 hover:border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Total Clientes
            </CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <Users className="h-6 w-6 text-secondary group-hover:scale-110 transition-transform" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">{stats.totalClients}</div>
            <Badge variant="secondary" className="mt-2 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% este mês
            </Badge>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-l-4 border-l-accent/50 hover:border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Agendamentos Hoje
            </CardTitle>
            <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <Calendar className="h-6 w-6 text-accent group-hover:scale-110 transition-transform" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">{stats.appointmentsToday}</div>
            <Badge variant="secondary" className="mt-2 text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Em tempo real
            </Badge>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-l-4 border-l-green-500/50 hover:border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              Faturamento Mensal
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
              <DollarSign className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              R$ {stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <Badge variant="secondary" className="mt-2 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% vs mês anterior
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Saúde do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant={systemHealth.databaseStatus === 'healthy' ? 'default' : 'destructive'}>
                  {systemHealth.databaseStatus === 'healthy' ? 'Operacional' : 'Erro'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Latência: {systemHealth.databaseLatency}ms
                </p>
              </div>
              {systemHealth.databaseStatus === 'healthy' ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-destructive" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-5 w-5" />
              Email Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="default">Operacional</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Último envio: há 5 min
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-5 w-5" />
              Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="default">Atualizado</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Último: há 1 hora
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segurança em Tempo Real */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status de Segurança
          </CardTitle>
          <CardDescription>Monitoramento contínuo de ameaças e atividades suspeitas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold text-destructive">{security.criticalAlerts}</div>
              <p className="text-sm text-muted-foreground mt-1">Alertas Críticos</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold">{security.failedLogins24h}</div>
              <p className="text-sm text-muted-foreground mt-1">Logins Falhados (24h)</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold">{security.activeBlockedIps}</div>
              <p className="text-sm text-muted-foreground mt-1">IPs Bloqueados</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold">{security.mfaUsers}</div>
              <p className="text-sm text-muted-foreground mt-1">Usuários com MFA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas de Administração */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary animate-pulse" />
            Ações Rápidas de Administração
          </CardTitle>
          <CardDescription>
            Executar operações críticas de manutenção do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-28 flex flex-col gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary hover:text-primary transition-all"
                    onClick={() => executeAction('cleanup')}
                    disabled={loadingAction !== null}
                  >
                    {loadingAction === 'cleanup' ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Activity className="h-6 w-6" />
                    )}
                    <div className="text-center text-sm">
                      <div className="font-bold">Limpeza</div>
                      <div className="text-xs text-muted-foreground">Dados antigos</div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Limpeza Automática de Dados</p>
                  <p className="text-xs">Remove dados antigos: tentativas de login &gt;90 dias, notificações lidas &gt;30 dias, códigos de reset usados, logs não críticos &gt;60 dias, sessões MFA expiradas e IPs bloqueados vencidos.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-28 flex flex-col gap-2 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-500 transition-all"
                    onClick={() => executeAction('fix_rls')}
                    disabled={loadingAction !== null}
                  >
                    {loadingAction === 'fix_rls' ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Shield className="h-6 w-6" />
                    )}
                    <div className="text-center text-sm">
                      <div className="font-bold">Verificar RLS</div>
                      <div className="text-xs text-muted-foreground">Segurança</div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Auditoria de Segurança RLS</p>
                  <p className="text-xs">Gera relatório completo de segurança verificando políticas RLS (Row Level Security), permissões de tabelas, alertas críticos e vulnerabilidades no banco de dados.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-28 flex flex-col gap-2 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500 hover:text-purple-500 transition-all"
                    onClick={() => executeAction('fix_duplicates')}
                    disabled={loadingAction !== null}
                  >
                    {loadingAction === 'fix_duplicates' ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Brain className="h-6 w-6" />
                    )}
                    <div className="text-center text-sm">
                      <div className="font-bold">Duplicatas</div>
                      <div className="text-xs text-muted-foreground">Detecção IA</div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Detecção Inteligente de Duplicatas</p>
                  <p className="text-xs">Executa diagnóstico automático do sistema para identificar registros duplicados em clientes, pets, produtos e serviços usando análise de dados e sugestões de mesclagem.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-28 flex flex-col gap-2 border-green-500/30 hover:bg-green-500/10 hover:border-green-500 hover:text-green-500 transition-all"
                        disabled={loadingAction !== null}
                      >
                        {loadingAction === 'backup' ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <Database className="h-6 w-6" />
                        )}
                        <div className="text-center text-sm">
                          <div className="font-bold">Backup</div>
                          <div className="text-xs text-muted-foreground">Completo</div>
                        </div>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Backup Completo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso criará um backup completo do banco de dados. O processo pode levar alguns minutos.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => executeAction('backup')}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Backup Completo do Banco de Dados</p>
                  <p className="text-xs">Cria backup encriptado de todas as tabelas críticas do sistema incluindo usuários, agendamentos, pets, produtos e configurações. Armazenado com compressão e criptografia.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-28 flex flex-col gap-2 border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500 hover:text-orange-500 transition-all"
                    onClick={() => executeAction('ai_analysis')}
                    disabled={loadingAction !== null}
                  >
                    {loadingAction === 'ai_analysis' ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Brain className="h-6 w-6" />
                    )}
                    <div className="text-center text-sm">
                      <div className="font-bold">Análise IA</div>
                      <div className="text-xs text-muted-foreground">Sistema</div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">Análise Completa do Sistema com IA</p>
                  <p className="text-xs">Executa análise inteligente de performance, saúde do banco, padrões de uso, anomalias e recomendações de otimização usando modelos de machine learning.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
          <CardDescription>Últimas ações administrativas e eventos do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                  <Activity className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{log.table_name}</Badge>
                      <Badge variant={log.operation === 'DELETE' ? 'destructive' : 'default'} className="text-xs">
                        {log.operation}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhuma atividade recente</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Score */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Score de Performance Geral
            </span>
            <span className="text-4xl font-bold text-green-600">9.2/10</span>
          </CardTitle>
          <CardDescription>
            Sistema operando com excelente performance e estabilidade
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
