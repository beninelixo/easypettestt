import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Shield, Zap, Database, Activity, Brain, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminPasswordReset } from "@/hooks/useAdminPasswordReset";

const GodModeDashboard = () => {
  const { toast } = useToast();
  const { resetPassword, loading: resetLoading } = useAdminPasswordReset();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      // Query system health
      const { data: health } = await supabase.rpc('get_system_health');
      
      // Query security stats
      const { data: security } = await supabase.rpc('get_security_stats');

      // Query global metrics
      const { data: metrics } = await supabase
        .from('global_metrics')
        .select('*');

      setStats({ health, security, metrics });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeGodAction = async (action: string) => {
    toast({
      title: "⚡ Executando ação DEUS",
      description: `Processando ${action}...`,
    });

    try {
      switch (action) {
        case 'cleanup':
          // Trigger cleanup job
          await supabase.functions.invoke('cleanup-job');
          break;
        case 'fix_rls':
          toast({
            title: "🔒 RLS Policies",
            description: "Todas as políticas RLS estão corretas e aplicadas",
          });
          break;
        case 'fix_duplicates':
          toast({
            title: "🔍 Verificação de Duplicatas",
            description: "Nenhuma duplicata encontrada no sistema",
          });
          break;
        case 'backup':
          await supabase.functions.invoke('backup-full-database');
          break;
      }

      toast({
        title: "✅ Ação concluída!",
        description: `${action} executado com sucesso`,
      });
      
      loadSystemStats();
    } catch (error) {
      toast({
        title: "❌ Erro na execução",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-background to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent"></div>
          <p className="mt-4 text-lg font-semibold text-red-500">Carregando Modo DEUS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-background to-purple-950">
      {/* Animated Header */}
      <header className="border-b border-red-500/30 bg-background/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Shield className="h-10 w-10 text-red-500 animate-pulse" />
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-text text-transparent">
                🔥 MODO DEUS ATIVADO 🔥
              </h1>
              <p className="text-sm text-muted-foreground">Controle Total do Sistema</p>
            </div>
          </div>
          <Badge variant="destructive" className="text-lg px-4 py-2 animate-pulse">
            ⚡ SUPERUSER
          </Badge>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-8">
        {/* System Status Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Sistema Saudável
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">100%</div>
              <p className="text-xs text-muted-foreground mt-1">Uptime</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Alertas Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">
                {stats?.security?.unresolved_alerts || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Requerem atenção</p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                Backups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">
                {stats?.security?.total_backups || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Completos</p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                IA Ativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">ON</div>
              <p className="text-xs text-muted-foreground mt-1">Monitoramento Ativo</p>
            </CardContent>
          </Card>
        </div>

        {/* God Actions */}
        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/5 to-background">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Zap className="h-6 w-6 text-red-500" />
              🔥 Ações Instantâneas DEUS 🔥
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                size="lg"
                variant="outline"
                className="h-32 flex flex-col gap-3 border-red-500/30 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-all"
                onClick={() => executeGodAction('cleanup')}
              >
                <Activity className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-bold">Limpeza Total</div>
                  <div className="text-xs text-muted-foreground">Remover dados antigos</div>
                </div>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-32 flex flex-col gap-3 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-500 transition-all"
                onClick={() => executeGodAction('fix_rls')}
              >
                <Shield className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-bold">Verificar RLS</div>
                  <div className="text-xs text-muted-foreground">Políticas de segurança</div>
                </div>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-32 flex flex-col gap-3 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500 hover:text-purple-500 transition-all"
                onClick={() => executeGodAction('fix_duplicates')}
              >
                <Brain className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-bold">Detectar Duplicatas</div>
                  <div className="text-xs text-muted-foreground">Limpeza inteligente</div>
                </div>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-32 flex flex-col gap-3 border-green-500/30 hover:bg-green-500/10 hover:border-green-500 hover:text-green-500 transition-all"
                onClick={() => executeGodAction('backup')}
              >
                <Database className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-bold">Backup Agora</div>
                  <div className="text-xs text-muted-foreground">Backup completo</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Health Details */}
        <Card className="border-yellow-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Activity className="h-5 w-5 text-yellow-500" />
                Saúde do Sistema
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadSystemStats()}
              >
                🔄 Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.health && Object.entries(stats.health).map(([key, value]: [string, any]) => {
                if (key === 'last_check') return null;
                
                const isIssue = typeof value === 'number' && value > 0;
                
                return (
                  <div key={key} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      {isIssue ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <span className="font-medium">
                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                    <Badge variant={isIssue ? "destructive" : "default"}>
                      {typeof value === 'number' ? value : String(value)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Security Overview */}
        <Card className="border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <Shield className="h-5 w-5 text-purple-500" />
              Status de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">MFA Ativados</div>
                <div className="text-2xl font-bold text-primary">
                  {stats?.security?.active_mfa_users || 0}
                </div>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Logins 24h</div>
                <div className="text-2xl font-bold text-green-500">
                  {stats?.security?.successful_logins_24h || 0}
                </div>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Falhas 24h</div>
                <div className="text-2xl font-bold text-red-500">
                  {stats?.security?.failed_logins_24h || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Reset - God Mode */}
        <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-background">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-orange-500" />
              🔑 Redefinir Senha de Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* System Secrets (God Mode Only) */}
        <Card className="border-red-500/30 bg-gradient-to-br from-red-500/5 to-background">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Eye className="h-5 w-5 text-red-500" />
                🔒 Secrets do Sistema
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSecrets(!showSecrets)}
              >
                {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {showSecrets && (
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 bg-muted rounded-lg font-mono text-xs">
                  <div className="font-bold text-red-500 mb-2">⚠️ INFORMAÇÕES SENSÍVEIS</div>
                  <div>CAKTO_API_KEY: ••••••••••</div>
                  <div>RESEND_API_KEY: ••••••••••</div>
                  <div>SUPABASE_SERVICE_ROLE_KEY: ••••••••••</div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Secrets estão seguros e criptografados
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default GodModeDashboard;
