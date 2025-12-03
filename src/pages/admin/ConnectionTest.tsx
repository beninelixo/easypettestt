import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Loader2, Database, Shield, Wifi, FileText, Info } from 'lucide-react';
import { runDiagnostics, getConfigReport, EXPECTED_PROJECT_ID, EXPECTED_URL } from '@/utils/supabaseDiagnostics';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const getStatusIcon = (status: DiagnosticResult['status']) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-destructive" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  }
};

const getTestIcon = (test: string) => {
  if (test.includes('Database')) return <Database className="h-4 w-4" />;
  if (test.includes('Auth')) return <Shield className="h-4 w-4" />;
  if (test.includes('Realtime') || test.includes('WebSocket')) return <Wifi className="h-4 w-4" />;
  if (test.includes('Read') || test.includes('Write')) return <FileText className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
};

export default function ConnectionTest() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const config = getConfigReport();

  const runTests = async () => {
    setLoading(true);
    try {
      const diagnosticResults = await runDiagnostics();
      setResults(diagnosticResults);
      setLastRun(new Date());
    } finally {
      setLoading(false);
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teste de Conexão Supabase</h1>
          <p className="text-muted-foreground">Diagnóstico completo da integração com Lovable Cloud</p>
        </div>
        <Button onClick={runTests} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Executar Testes
        </Button>
      </div>

      {/* Configuration Status */}
      <Card className={config.isCorrect ? 'border-green-500/50' : 'border-destructive'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {config.isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            Status da Configuração
          </CardTitle>
          <CardDescription>
            Verificação das credenciais do projeto Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Project ID Atual (JWT)</p>
              <code className={`block p-2 rounded text-sm ${config.isCorrect ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                {config.anonKeyProjectId}
              </code>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Project ID Esperado</p>
              <code className="block p-2 rounded bg-muted text-sm">
                {EXPECTED_PROJECT_ID}
              </code>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">URL Atual (.env)</p>
              <code className="block p-2 rounded bg-muted text-sm truncate">
                {config.currentUrl}
              </code>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">URL Esperada</p>
              <code className="block p-2 rounded bg-muted text-sm">
                {EXPECTED_URL}
              </code>
            </div>
          </div>

          {!config.isCorrect && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Configuração Incorreta Detectada!</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>O arquivo .env está apontando para um projeto Supabase incorreto.</p>
                <p className="font-medium">Para corrigir:</p>
                <ol className="list-decimal ml-4 space-y-1 text-sm">
                  <li>Vá em <strong>Settings → Integrations → Lovable Cloud</strong></li>
                  <li>Clique em <strong>"Manage"</strong></li>
                  <li>Desconecte o projeto atual</li>
                  <li>Reconecte com o projeto: <code className="bg-background px-1 rounded">{EXPECTED_PROJECT_ID}</code></li>
                </ol>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultados dos Testes</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-green-500 border-green-500">
                  {successCount} OK
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="destructive">
                    {errorCount} Erros
                  </Badge>
                )}
              </div>
            </CardTitle>
            {lastRun && (
              <CardDescription>
                Última execução: {lastRun.toLocaleTimeString('pt-BR')}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.status === 'success' ? 'bg-green-500/5 border-green-500/20' :
                    result.status === 'error' ? 'bg-destructive/5 border-destructive/20' :
                    'bg-yellow-500/5 border-yellow-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getTestIcon(result.test)}
                    <div>
                      <p className="font-medium">{result.test}</p>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                      {result.details && (
                        <p className="text-xs text-muted-foreground mt-1">{result.details}</p>
                      )}
                    </div>
                  </div>
                  {getStatusIcon(result.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions if no tests run yet */}
      {results.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Pronto para Testar</h3>
            <p className="text-muted-foreground mb-4">
              Clique em "Executar Testes" para verificar a conexão com o Supabase
            </p>
            <Button onClick={runTests}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Executar Testes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
