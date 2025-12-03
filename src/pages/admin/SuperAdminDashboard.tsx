import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Building2, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Shield,
  Database,
  ServerCrash,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Lock,
  FileCode,
  HardDrive,
  Eye,
  Bell,
  Settings,
  BarChart3,
  Layers
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { SuperAdminUsers } from "@/components/admin/SuperAdminUsers";
import { SuperAdminPetShops } from "@/components/admin/SuperAdminPetShops";
import { SuperAdminSystemHealth } from "@/components/admin/SuperAdminSystemHealth";
import { SuperAdminLogs } from "@/components/admin/SuperAdminLogs";
import { useAdminRealtimeStats } from "@/hooks/useAdminRealtimeStats";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const SuperAdminDashboard = () => {
  const { user, userRole, loading: authLoading, isGodUser } = useAuth();
  const navigate = useNavigate();
  const { 
    stats, 
    recentLogs, 
    alerts, 
    loginAttempts,
    isLoading, 
    isRefreshing, 
    refreshAll,
    markAlertRead 
  } = useAdminRealtimeStats();

  const hasAccess = isGodUser || userRole === 'admin' || userRole === 'super_admin';

  useEffect(() => {
    if (!authLoading && !hasAccess) {
      navigate('/admin/dashboard');
    }
  }, [user, userRole, authLoading, navigate, hasAccess, isGodUser]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) return null;

  const systemStatus = stats?.errors_24h === 0 && stats?.pending_jobs === 0 ? 'healthy' : 
                       stats?.errors_24h && stats.errors_24h > 10 ? 'critical' : 'warning';

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      <SEO 
        title="Super Admin Dashboard - EasyPet"
        description="Painel de controle total do sistema EasyPet"
      />

      {/* Header with Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Super Admin</h1>
            <p className="text-muted-foreground">Controle total do sistema EasyPet</p>
          </div>
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

      {/* Stats Grid - Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats?.total_users || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Usuários</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Building2 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{stats?.total_pet_shops || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pet Shops</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{stats?.appointments_today || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Agend. Hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <ServerCrash className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{stats?.errors_24h || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Erros 24h</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{stats?.unread_alerts || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Alertas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Lock className="h-5 w-5 text-cyan-500" />
              <span className="text-2xl font-bold">{stats?.mfa_enabled_users || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">MFA Ativo</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/system-health">
          <Card className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Saúde do Sistema</p>
                <p className="text-xs text-muted-foreground">Monitoramento em tempo real</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/security-monitoring">
          <Card className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="font-medium">Segurança</p>
                <p className="text-xs text-muted-foreground">Alertas e monitoramento</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/backups">
          <Card className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Database className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Backups</p>
                <p className="text-xs text-muted-foreground">Gerenciar backups</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/user-management">
          <Card className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">Usuários</p>
                <p className="text-xs text-muted-foreground">Gerenciar usuários</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
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
                      <div 
                        key={alert.id} 
                        className="flex items-start justify-between p-3 rounded-lg bg-background/50 border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              alert.severity === 'critical' ? 'destructive' : 
                              alert.severity === 'high' ? 'destructive' : 'secondary'
                            }>
                              {alert.severity}
                            </Badge>
                            <span className="font-medium text-sm">{alert.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markAlertRead(alert.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Main Tabs */}
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

            <TabsContent value="users">
              <SuperAdminUsers />
            </TabsContent>

            <TabsContent value="petshops">
              <SuperAdminPetShops />
            </TabsContent>

            <TabsContent value="health">
              <SuperAdminSystemHealth />
            </TabsContent>

            <TabsContent value="logs">
              <SuperAdminLogs />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Real-time Activity */}
        <div className="space-y-6">
          {/* Recent Login Attempts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Logins Recentes
              </CardTitle>
              <CardDescription>
                {stats?.failed_logins_1h || 0} falhas na última hora
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {loginAttempts?.slice(0, 15).map((attempt) => (
                    <div 
                      key={attempt.id} 
                      className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                        attempt.success ? 'bg-green-500/5' : 'bg-red-500/5'
                      }`}
                    >
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

          {/* Recent System Logs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Logs do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {recentLogs?.slice(0, 15).map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-2 rounded-lg text-sm ${
                        log.log_type === 'error' ? 'bg-red-500/5 border-l-2 border-red-500' :
                        log.log_type === 'warning' ? 'bg-yellow-500/5 border-l-2 border-yellow-500' :
                        'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-xs">
                          {log.module}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), 'HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-xs mt-1 truncate">{log.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Métricas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Logins hoje</span>
                <span className="font-medium">{stats?.successful_logins_24h || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Jobs pendentes</span>
                <span className="font-medium">{stats?.pending_jobs || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">IPs bloqueados</span>
                <span className="font-medium">{stats?.blocked_ips || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Serviços concluídos</span>
                <span className="font-medium">{stats?.completed_appointments || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avisos 24h</span>
                <span className="font-medium text-yellow-500">{stats?.warnings_24h || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
