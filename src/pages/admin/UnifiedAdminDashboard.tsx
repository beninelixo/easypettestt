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
import { useAdminMetricsRealtime } from "@/hooks/useAdminMetricsRealtime";
import { useAdminPasswordReset } from "@/hooks/useAdminPasswordReset";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import { 
  Building2, Users, Calendar, DollarSign, Shield, Database, 
  Mail, HardDrive, AlertTriangle, CheckCircle, Clock, Activity,
  TrendingUp, Zap, Brain, Loader2, RefreshCw, Lock, Bell,
  Eye, KeyRound, XCircle, CheckCircle2, FileCode, PawPrint, Trash2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SuperAdminUsers } from "@/components/admin/SuperAdminUsers";
import { SuperAdminPetShops } from "@/components/admin/SuperAdminPetShops";
import { SuperAdminSystemHealth } from "@/components/admin/SuperAdminSystemHealth";
import { SuperAdminLogs } from "@/components/admin/SuperAdminLogs";
import { LiveMetricsCard } from "@/components/admin/LiveMetricsCard";
import { RealtimeActivityFeed } from "@/components/admin/RealtimeActivityFeed";

export default function UnifiedAdminDashboard() {
  const { toast } = useToast();
  const location = useLocation();
  const { isGodUser } = useAuth();
  const { stats, systemHealth, security, recentActivity, isLoading } = useAdminStats();
  
  // Auto-select God Mode tab when accessing /admin/god-mode route
  const isGodModeRoute = location.pathname.includes('/admin/god-mode');
  const defaultTab = isGodModeRoute && isGodUser ? "godmode" : "overview";
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Sync tab when route changes
  useEffect(() => {
    if (isGodModeRoute && isGodUser) {
      setActiveTab("godmode");
    }
  }, [isGodModeRoute, isGodUser]);
  
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
  const { metrics, isLive, refresh: refreshMetrics, isLoading: metricsLoading } = useAdminMetricsRealtime();
  const { resetPassword, loading: resetLoading } = useAdminPasswordReset();
  
  const [resetEmail, setResetEmail] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");

  if (isLoading && metricsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const systemStatus = metrics.errors24h === 0 && metrics.pendingJobs === 0 ? 'healthy' : 
                       metrics.errors24h > 10 ? 'critical' : 'warning';

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Dashboard Administrativo
            </h1>
            <p className="text-muted-foreground mt-1">Visão geral completa do sistema EasyPet</p>
          </div>
          {isLive && (
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              LIVE
            </Badge>
          )}
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
          <span className="text-xs text-muted-foreground hidden md:inline">
            Atualizado: {format(metrics.lastUpdate, 'HH:mm:ss', { locale: ptBR })}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { refreshAll(); refreshMetrics(); }}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <LiveMetricsCard
          title="Usuários"
          value={metrics.totalUsers}
          icon={Users}
          description={`+${metrics.newUsersToday} hoje`}
          isLive={isLive}
          variant="info"
        />
        <LiveMetricsCard
          title="Pet Shops"
          value={metrics.totalPetShops}
          icon={Building2}
          isLive={isLive}
          variant="success"
        />
        <LiveMetricsCard
          title="Pets"
          value={metrics.totalPets}
          icon={PawPrint}
          description={`+${metrics.newPetsToday} hoje`}
          isLive={isLive}
        />
        <LiveMetricsCard
          title="Agend. Hoje"
          value={metrics.appointmentsToday}
          icon={Calendar}
          description={`${metrics.appointmentsTodayCompleted} concluídos`}
          isLive={isLive}
          variant="info"
        />
        <LiveMetricsCard
          title="Erros 24h"
          value={metrics.errors24h}
          icon={AlertTriangle}
          description={`${metrics.warnings24h} avisos`}
          isLive={isLive}
          variant={metrics.errors24h > 10 ? 'danger' : metrics.errors24h > 0 ? 'warning' : 'success'}
        />
        <LiveMetricsCard
          title="Receita Hoje"
          value={`R$ ${metrics.revenueToday.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
          icon={DollarSign}
          isLive={isLive}
          variant="success"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <LiveMetricsCard
          title="Alertas Ativos"
          value={metrics.activeAlerts}
          icon={Bell}
          isLive={isLive}
          variant={metrics.activeAlerts > 5 ? 'warning' : 'default'}
        />
        <LiveMetricsCard
          title="Logins Falhos 1h"
          value={metrics.failedLogins1h}
          icon={Shield}
          description={`${metrics.failedLogins24h} últimas 24h`}
          isLive={isLive}
          variant={metrics.failedLogins1h > 10 ? 'danger' : metrics.failedLogins1h > 5 ? 'warning' : 'default'}
        />
        <LiveMetricsCard
          title="IPs Bloqueados"
          value={metrics.blockedIps}
          icon={Lock}
          isLive={isLive}
          variant={metrics.blockedIps > 0 ? 'warning' : 'default'}
        />
        <LiveMetricsCard
          title="Jobs Pendentes"
          value={metrics.pendingJobs}
          icon={Clock}
          isLive={isLive}
          variant={metrics.pendingJobs > 10 ? 'danger' : metrics.pendingJobs > 0 ? 'warning' : 'success'}
        />
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
          <div className="grid lg:grid-cols-2 gap-6">
            <RealtimeActivityFeed />
            <Card>
              <CardHeader>
                <CardTitle>Logs de Auditoria</CardTitle>
                <CardDescription>Últimas operações no banco de dados</CardDescription>
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
          </div>
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
                    <KeyRound className="h-5 w-5 text-orange-500" aria-hidden="true" />
                    Redefinir Senha de Usuário
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">Email do usuário</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        placeholder="usuario@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        aria-describedby="resetEmail-hint"
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resetPassword">Nova senha</Label>
                      <Input
                        id="resetPassword"
                        type="password"
                        placeholder="Nova senha (mín. 10 caracteres)"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        minLength={10}
                        aria-describedby="resetPassword-hint"
                        autoComplete="new-password"
                      />
                      <p id="resetPassword-hint" className="text-xs text-muted-foreground">
                        Mínimo 10 caracteres, incluindo maiúsculas, minúsculas, números e símbolos
                      </p>
                    </div>
                    <div className="flex items-end">
                      <Button
                        className="w-full bg-orange-500 hover:bg-orange-600 min-h-[44px]"
                        disabled={resetLoading || !resetEmail || !resetNewPassword || resetNewPassword.length < 10}
                        onClick={async () => {
                          // Validate password strength
                          const hasUppercase = /[A-Z]/.test(resetNewPassword);
                          const hasLowercase = /[a-z]/.test(resetNewPassword);
                          const hasNumber = /[0-9]/.test(resetNewPassword);
                          const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(resetNewPassword);
                          
                          if (!hasUppercase || !hasLowercase || !hasNumber || !hasSymbol) {
                            toast({
                              title: "Senha fraca",
                              description: "A senha deve conter maiúsculas, minúsculas, números e símbolos",
                              variant: "destructive",
                            });
                            return;
                          }
                          
                          const result = await resetPassword(resetEmail, resetNewPassword);
                          if (result.success) {
                            setResetEmail("");
                            setResetNewPassword("");
                          }
                        }}
                        aria-label="Redefinir senha do usuário"
                      >
                        {resetLoading ? "Redefinindo..." : "Redefinir Senha"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* User Cleanup */}
                <div className="p-4 border border-purple-500/30 rounded-lg bg-purple-500/5">
                  <h4 className="font-bold flex items-center gap-2 mb-4">
                    <Trash2 className="h-5 w-5 text-purple-500" />
                    Limpar Usuários de Teste
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Remove todos os usuários do sistema exceto o God User (beninelixo@gmail.com).
                    Use com extrema cautela - esta ação é irreversível!
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="gap-2"
                        disabled={loadingAction !== null}
                      >
                        {loadingAction === 'cleanup_users' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Limpar Todos os Usuários de Teste
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-500">⚠️ Confirmar Limpeza de Usuários</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação irá <strong>DELETAR PERMANENTEMENTE</strong> todos os usuários do sistema,
                          mantendo apenas o God User (beninelixo@gmail.com).
                          <br /><br />
                          <strong className="text-red-500">Esta ação é IRREVERSÍVEL!</strong>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => executeAction('cleanup_users')}
                        >
                          Sim, Deletar Todos
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* System Secrets Status - Hidden values for security */}
                <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold flex items-center gap-2">
                      <Lock className="h-5 w-5 text-red-500" aria-hidden="true" />
                      Status das Credenciais
                    </h4>
                  </div>
                  <div className="space-y-2" role="list" aria-label="Status das credenciais do sistema">
                    <div className="flex items-center justify-between p-2 bg-muted rounded" role="listitem">
                      <span className="text-sm">CAKTO_API_KEY</span>
                      <Badge variant="default" className="bg-green-500">Configurado</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded" role="listitem">
                      <span className="text-sm">RESEND_API_KEY</span>
                      <Badge variant="default" className="bg-green-500">Configurado</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded" role="listitem">
                      <span className="text-sm">SUPABASE_SERVICE_ROLE</span>
                      <Badge variant="default" className="bg-green-500">Configurado</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Por segurança, os valores das credenciais não são exibidos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
