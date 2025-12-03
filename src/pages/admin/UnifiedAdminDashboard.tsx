import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useGodActions } from "@/hooks/useGodActions";
import { useAdminRealtimeStats } from "@/hooks/useAdminRealtimeStats";
import { useAdminPasswordReset } from "@/hooks/useAdminPasswordReset";
import { useAuth } from "@/hooks/useAuth";
import { 
  Building2, Users, Calendar, DollarSign, Shield, Database, 
  Mail, HardDrive, AlertTriangle, CheckCircle, Clock, Activity,
  TrendingUp, Zap, Brain, Loader2, RefreshCw, Lock, Bell,
  Eye, EyeOff, KeyRound, XCircle, CheckCircle2, FileCode
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from "react";
import { SuperAdminUsers } from "@/components/admin/SuperAdminUsers";
import { SuperAdminPetShops } from "@/components/admin/SuperAdminPetShops";
import { SuperAdminSystemHealth } from "@/components/admin/SuperAdminSystemHealth";
import { SuperAdminLogs } from "@/components/admin/SuperAdminLogs";

export default function UnifiedAdminDashboard() {
  const { isGodUser } = useAuth();
  const { stats, systemHealth, security, recentActivity, isLoading } = useAdminStats();
  const { executeAction, loadingAction } = useGodActions();
  const { 
    stats: realtimeStats, 
    recentLogs, 
    alerts, 
    loginAttempts,
    isRefreshing, 
    refreshAll,
    markAlertRead 
  } = useAdminRealtimeStats();
  const { resetPassword, loading: resetLoading } = useAdminPasswordReset();
  
  const [showSecrets, setShowSecrets] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");

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

  const systemStatus = realtimeStats?.errors_24h === 0 && realtimeStats?.pending_jobs === 0 ? 'healthy' : 
                       realtimeStats?.errors_24h && realtimeStats.errors_24h > 10 ? 'critical' : 'warning';

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Dashboard Administrativo
          </h1>
          <p className="text-muted-foreground mt-1">Visão geral completa do sistema EasyPet</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={systemStatus === 'healthy' ? 'default' : systemStatus === 'warning' ? 'secondary' : 'destructive'}
            className="gap-1 px-3 py-1"
          >
            {systemStatus === 'healthy' ? <CheckCircle2 className="h-3 w-3" /> : 
             systemStatus === 'warning' ? <AlertTriangle className="h-3 w-3" /> :
             <XCircle className="h-3 w-3" />}
            {systemStatus === 'healthy' ? 'Sistema Saudável' : 
             systemStatus === 'warning' ? 'Atenção Necessária' : 'Crítico'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshAll}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{realtimeStats?.total_users || stats.totalClients}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Usuários</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Building2 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{realtimeStats?.total_pet_shops || stats.totalPetShops}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pet Shops</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{realtimeStats?.appointments_today || stats.appointmentsToday}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Agend. Hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{realtimeStats?.errors_24h || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Erros 24h</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Bell className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{realtimeStats?.unread_alerts || security.criticalAlerts}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Alertas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <DollarSign className="h-5 w-5 text-cyan-500" />
              <span className="text-xl font-bold">R$ {(stats.monthlyRevenue / 1000).toFixed(1)}k</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Receita Mês</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant={systemHealth.databaseStatus === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.databaseStatus === 'healthy' ? 'Operacional' : 'Erro'}
              </Badge>
              <span className="text-sm text-muted-foreground">{systemHealth.databaseLatency}ms</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="default">Operacional</Badge>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4" />
              Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="default">Atualizado</Badge>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
          {isGodUser && <TabsTrigger value="godmode">God Mode</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Alerts Panel */}
              {alerts && alerts.length > 0 && (
                <Card className="border-yellow-500/30 bg-yellow-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bell className="h-5 w-5 text-yellow-500" />
                      Alertas Ativos ({alerts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {alerts.map((alert) => (
                          <div key={alert.id} className="flex items-start justify-between p-3 rounded-lg bg-background/50 border">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                                  {alert.severity}
                                </Badge>
                                <span className="font-medium text-sm">{alert.title}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => markAlertRead(alert.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Data Tabs */}
              <Tabs defaultValue="users" className="space-y-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="users" className="gap-1">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Usuários</span>
                  </TabsTrigger>
                  <TabsTrigger value="petshops" className="gap-1">
                    <Building2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Pet Shops</span>
                  </TabsTrigger>
                  <TabsTrigger value="health" className="gap-1">
                    <Activity className="h-4 w-4" />
                    <span className="hidden sm:inline">Saúde</span>
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="gap-1">
                    <FileCode className="h-4 w-4" />
                    <span className="hidden sm:inline">Logs</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="users"><SuperAdminUsers /></TabsContent>
                <TabsContent value="petshops"><SuperAdminPetShops /></TabsContent>
                <TabsContent value="health"><SuperAdminSystemHealth /></TabsContent>
                <TabsContent value="logs"><SuperAdminLogs /></TabsContent>
              </Tabs>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Logins Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-2">
                      {loginAttempts?.slice(0, 10).map((attempt) => (
                        <div key={attempt.id} className={`flex items-center justify-between p-2 rounded-lg text-sm ${attempt.success ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            {attempt.success ? 
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> : 
                              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                            }
                            <span className="truncate">{attempt.email}</span>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {format(new Date(attempt.attempt_time), 'HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Logins falhados 24h</span>
                    <span className="font-medium text-red-500">{security.failedLogins24h}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">IPs bloqueados</span>
                    <span className="font-medium">{security.activeBlockedIps}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Usuários com MFA</span>
                    <span className="font-medium text-green-500">{security.mfaUsers}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimas ações no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{activity.operation} em {activity.table_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{activity.operation}</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                Ações Rápidas de Administração
              </CardTitle>
              <CardDescription>Executar operações críticas de manutenção</CardDescription>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-28 flex flex-col gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary transition-all"
                        onClick={() => executeAction('cleanup')}
                        disabled={loadingAction !== null}
                      >
                        {loadingAction === 'cleanup' ? <Loader2 className="h-6 w-6 animate-spin" /> : <Activity className="h-6 w-6" />}
                        <div className="text-center text-sm">
                          <div className="font-bold">Limpeza</div>
                          <div className="text-xs text-muted-foreground">Dados antigos</div>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove dados antigos do sistema</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-28 flex flex-col gap-2 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500 transition-all"
                        onClick={() => executeAction('fix_rls')}
                        disabled={loadingAction !== null}
                      >
                        {loadingAction === 'fix_rls' ? <Loader2 className="h-6 w-6 animate-spin" /> : <Shield className="h-6 w-6" />}
                        <div className="text-center text-sm">
                          <div className="font-bold">Verificar RLS</div>
                          <div className="text-xs text-muted-foreground">Segurança</div>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Auditoria de políticas RLS</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-28 flex flex-col gap-2 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500 transition-all"
                        onClick={() => executeAction('fix_duplicates')}
                        disabled={loadingAction !== null}
                      >
                        {loadingAction === 'fix_duplicates' ? <Loader2 className="h-6 w-6 animate-spin" /> : <Brain className="h-6 w-6" />}
                        <div className="text-center text-sm">
                          <div className="font-bold">Duplicatas</div>
                          <div className="text-xs text-muted-foreground">Detecção IA</div>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Detecta registros duplicados</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="lg"
                            variant="outline"
                            className="h-28 flex flex-col gap-2 border-green-500/30 hover:bg-green-500/10 hover:border-green-500 transition-all"
                            disabled={loadingAction !== null}
                          >
                            {loadingAction === 'backup' ? <Loader2 className="h-6 w-6 animate-spin" /> : <Database className="h-6 w-6" />}
                            <div className="text-center text-sm">
                              <div className="font-bold">Backup</div>
                              <div className="text-xs text-muted-foreground">Completo</div>
                            </div>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Backup</AlertDialogTitle>
                            <AlertDialogDescription>Isso criará um backup completo do banco de dados.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => executeAction('backup')}>Confirmar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TooltipTrigger>
                    <TooltipContent>Backup completo do banco</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-28 flex flex-col gap-2 border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500 transition-all"
                        onClick={() => executeAction('ai_analysis')}
                        disabled={loadingAction !== null}
                      >
                        {loadingAction === 'ai_analysis' ? <Loader2 className="h-6 w-6 animate-spin" /> : <Brain className="h-6 w-6" />}
                        <div className="text-center text-sm">
                          <div className="font-bold">Análise IA</div>
                          <div className="text-xs text-muted-foreground">Sistema</div>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Análise inteligente do sistema</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
        </TabsContent>

        {/* God Mode Tab - Only for God User */}
        {isGodUser && (
          <TabsContent value="godmode" className="space-y-4">
            <Card className="border-red-500/30 bg-gradient-to-br from-red-500/5 to-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <Zap className="h-6 w-6 animate-pulse" />
                  🔥 MODO DEUS ATIVADO 🔥
                </CardTitle>
                <CardDescription>Controle total do sistema - Use com cuidado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Reset */}
                <div className="p-4 border border-orange-500/30 rounded-lg bg-orange-500/5">
                  <h4 className="font-bold flex items-center gap-2 mb-4">
                    <KeyRound className="h-5 w-5 text-orange-500" />
                    Redefinir Senha de Usuário
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">Email do usuário</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="usuario@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resetPassword">Nova senha</Label>
                      <Input
                        id="resetPassword"
                        type="password"
                        placeholder="Nova senha (mín. 8 caracteres)"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        disabled={resetLoading || !resetEmail || !resetNewPassword}
                        onClick={async () => {
                          const result = await resetPassword(resetEmail, resetNewPassword);
                          if (result.success) {
                            setResetEmail("");
                            setResetNewPassword("");
                          }
                        }}
                      >
                        {resetLoading ? "Redefinindo..." : "Redefinir Senha"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* System Secrets */}
                <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <Eye className="h-5 w-5 text-red-500" />
                      Secrets do Sistema
                    </h4>
                    <Button variant="ghost" size="sm" onClick={() => setShowSecrets(!showSecrets)}>
                      {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {showSecrets && (
                    <div className="p-3 bg-muted rounded-lg font-mono text-xs">
                      <div className="font-bold text-red-500 mb-2">⚠️ INFORMAÇÕES SENSÍVEIS</div>
                      <div>CAKTO_API_KEY: ••••••••••</div>
                      <div>RESEND_API_KEY: ••••••••••</div>
                      <div>SUPABASE_SERVICE_ROLE_KEY: ••••••••••</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
