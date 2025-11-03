import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Activity, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DiagnosticResult {
  category: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'detected' | 'fixed' | 'pending';
  details: string;
  fix_applied?: string;
}

interface DiagnosticSummary {
  total_issues: number;
  critical_issues: number;
  fixed_count: number;
  auto_fix_enabled: boolean;
}

const SystemDiagnostics = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [summary, setSummary] = useState<DiagnosticSummary | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const runDiagnostic = async (autoFix: boolean = false) => {
    setLoading(true);
    toast.info(autoFix ? "Executando diagnóstico com correção automática..." : "Executando diagnóstico...");

    try {
      const { data, error } = await supabase.functions.invoke('auto-diagnostico', {
        body: { auto_fix: autoFix },
      });

      if (error) throw error;

      setResults(data.results);
      setSummary(data.summary);
      setLastRun(data.timestamp);

      if (data.summary.critical_issues > 0) {
        toast.error(`⚠️ ${data.summary.critical_issues} problemas críticos encontrados!`);
      } else if (data.summary.total_issues > 0) {
        toast.warning(`${data.summary.total_issues} problemas encontrados`);
      } else {
        toast.success("✅ Sistema saudável! Nenhum problema detectado.");
      }

      if (autoFix && data.summary.fixed_count > 0) {
        toast.success(`🔧 ${data.summary.fixed_count} problemas corrigidos automaticamente`);
      }
    } catch (error: any) {
      toast.error("Erro ao executar diagnóstico: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-5 w-5" />;
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      case 'medium': return <Activity className="h-5 w-5" />;
      case 'low': return <CheckCircle2 className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Diagnóstico do Sistema
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise automática de problemas e correções
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => runDiagnostic(false)}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Diagnosticar
              </>
            )}
          </Button>

          <Button
            onClick={() => runDiagnostic(true)}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Corrigindo...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Diagnosticar & Corrigir
              </>
            )}
          </Button>
        </div>
      </div>

      {lastRun && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Última Execução</AlertTitle>
          <AlertDescription>
            {new Date(lastRun).toLocaleString('pt-BR')}
          </AlertDescription>
        </Alert>
      )}

      {summary && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Problemas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.total_issues}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                {summary.critical_issues}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Corrigidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {summary.fixed_count}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={summary.critical_issues > 0 ? "destructive" : "default"}>
                {summary.critical_issues > 0 ? "Atenção" : "Saudável"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Resultados do Diagnóstico</h2>

          {results.map((result, index) => (
            <Card key={index} className="border-l-4" style={{
              borderLeftColor: result.severity === 'critical' ? 'hsl(var(--destructive))' :
                               result.severity === 'high' ? 'hsl(var(--destructive))' :
                               result.severity === 'medium' ? 'hsl(var(--warning))' :
                               'hsl(var(--secondary))'
            }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(result.severity)}
                    <div>
                      <CardTitle className="text-lg">{result.issue}</CardTitle>
                      <CardDescription className="mt-1">
                        {result.category}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getSeverityColor(result.severity) as any}>
                      {result.severity.toUpperCase()}
                    </Badge>
                    <Badge variant={result.status === 'fixed' ? 'default' : 'outline'}>
                      {result.status === 'fixed' ? '✓ Corrigido' : '⚠ Detectado'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {result.details}
                </p>
                {result.fix_applied && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Correção Aplicada</AlertTitle>
                    <AlertDescription>{result.fix_applied}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!summary && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Pronto para Diagnosticar
            </h3>
            <p className="text-muted-foreground mb-6">
              Clique em "Diagnosticar" para analisar o sistema ou em
              "Diagnosticar & Corrigir" para corrigir automaticamente os problemas encontrados.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => runDiagnostic(false)} variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Apenas Diagnosticar
              </Button>
              <Button onClick={() => runDiagnostic(true)}>
                <Zap className="h-4 w-4 mr-2" />
                Diagnosticar & Corrigir
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemDiagnostics;
