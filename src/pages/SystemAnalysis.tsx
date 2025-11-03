import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Brain, FileText, Lightbulb, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AnalysisResult {
  success: boolean;
  timestamp: string;
  timeframe: string;
  context: {
    total_logs: number;
    error_count: number;
    warning_count: number;
    failed_logins: number;
  };
  analysis: any;
  raw_ai_response: string;
}

export default function SystemAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('last_24h');
  const { toast } = useToast();

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('system-analysis', {
        body: { timeframe },
      });

      if (error) throw error;

      setAnalysis(data);
      
      toast({
        title: 'Análise Concluída',
        description: 'A IA analisou o sistema e gerou recomendações',
      });
    } catch (error: any) {
      toast({
        title: 'Erro na Análise',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const lower = status?.toLowerCase() || '';
    if (lower.includes('funcional') || lower.includes('ok') || lower.includes('healthy')) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (lower.includes('aviso') || lower.includes('warning')) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
    if (lower.includes('crítico') || lower.includes('critical') || lower.includes('error')) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Análise Inteligente do Sistema
          </h1>
          <p className="text-muted-foreground">IA analisa logs e gera relatórios com sugestões de melhorias</p>
        </div>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Executar Análise</CardTitle>
          <CardDescription>Selecione o período e execute a análise com IA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <Button
                variant={timeframe === 'last_hour' ? 'default' : 'outline'}
                onClick={() => setTimeframe('last_hour')}
                size="sm"
              >
                Última Hora
              </Button>
              <Button
                variant={timeframe === 'last_24h' ? 'default' : 'outline'}
                onClick={() => setTimeframe('last_24h')}
                size="sm"
              >
                Últimas 24h
              </Button>
              <Button
                variant={timeframe === 'last_week' ? 'default' : 'outline'}
                onClick={() => setTimeframe('last_week')}
                size="sm"
              >
                Última Semana
              </Button>
            </div>
            
            <Button onClick={runAnalysis} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Executar Análise com IA
                </>
              )}
            </Button>
          </div>

          {analysis && (
            <div className="text-sm text-muted-foreground">
              Última análise: {new Date(analysis.timestamp).toLocaleString('pt-BR')} | 
              {' '}{analysis.context.total_logs} logs analisados | 
              {' '}{analysis.context.error_count} erros | 
              {' '}{analysis.context.warning_count} avisos
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados da Análise */}
      {analysis && (
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
            <TabsTrigger value="raw">Análise Completa</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            {/* Status Geral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(analysis.raw_ai_response)}
                  Status Geral do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {analysis.raw_ai_response.split('\n').slice(0, 5).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Alertas Prioritários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.context.error_count > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Erros Críticos Encontrados</AlertTitle>
                    <AlertDescription>
                      {analysis.context.error_count} erros detectados nas últimas 24h. 
                      Revise os logs para detalhes.
                    </AlertDescription>
                  </Alert>
                )}

                {analysis.context.warning_count > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Avisos de Atenção</AlertTitle>
                    <AlertDescription>
                      {analysis.context.warning_count} avisos registrados. 
                      Verifique possíveis otimizações.
                    </AlertDescription>
                  </Alert>
                )}

                {analysis.context.failed_logins > 5 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Tentativas de Login Suspeitas</AlertTitle>
                    <AlertDescription>
                      {analysis.context.failed_logins} tentativas de login falhadas. 
                      Possível tentativa de ataque.
                    </AlertDescription>
                  </Alert>
                )}

                {analysis.context.error_count === 0 && analysis.context.warning_count === 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Sistema Saudável</AlertTitle>
                    <AlertDescription>
                      Nenhum erro crítico detectado no período analisado.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Métricas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Logs Analisados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.context.total_logs}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Erros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {analysis.context.error_count}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Avisos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500">
                    {analysis.context.warning_count}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Logins Falhados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysis.context.failed_logins}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Sugestões de Melhoria
                </CardTitle>
                <CardDescription>
                  Recomendações geradas pela IA para otimizar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none whitespace-pre-wrap">
                  {analysis.raw_ai_response}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="raw" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Análise Completa da IA
                </CardTitle>
                <CardDescription>
                  Resposta completa do modelo de análise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(analysis, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Sem análise ainda */}
      {!analysis && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma Análise Realizada</h3>
            <p className="text-muted-foreground mb-4">
              Execute uma análise com IA para visualizar relatórios e recomendações
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}