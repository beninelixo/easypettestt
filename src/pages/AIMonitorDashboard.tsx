import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAIMonitor } from "@/hooks/useAIMonitor";
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AIMonitorDashboard() {
  const { report, loading, runAudit } = useAIMonitor();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-500";
    if (score >= 7) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              🤖 AI Monitor - Auditoria Automática
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitoramento contínuo de segurança, performance e integridade
            </p>
          </div>
          
          <Button 
            onClick={runAudit} 
            disabled={loading}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Auditando...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Executar Auditoria
              </>
            )}
          </Button>
        </div>

        {/* Security Score */}
        {report && (
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Score de Segurança</span>
                <span className={`text-5xl font-bold ${getScoreColor(report.securityScore)}`}>
                  {report.securityScore}/10
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Última auditoria: {new Date(report.timestamp).toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Checks */}
        {report && report.checks && report.checks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Verificações de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.checks.map((check, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                  >
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={check.status === 'critical' ? 'destructive' : check.status === 'warning' ? 'default' : 'secondary'}>
                          {check.type}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1 text-muted-foreground">{check.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auto Corrections */}
        {report && report.autoCorrections && report.autoCorrections.length > 0 && (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-500">
                <CheckCircle className="h-5 w-5" />
                Correções Automáticas Aplicadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.autoCorrections.map((correction, idx) => (
                  <li key={idx} className="text-sm flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {correction}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && !report && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Executando auditoria automática...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
