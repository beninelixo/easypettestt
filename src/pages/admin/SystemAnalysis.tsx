import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Activity, RefreshCw } from 'lucide-react';

interface AnomalyDetection {
  timestamp: string;
  metric_name: string;
  current_value: number;
  expected_value: number;
  deviation_percentage: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  prediction: string;
}

interface TrendData {
  timestamp: string;
  api_latency: number;
  error_rate: number;
  active_users: number;
  predicted_api_latency?: number;
  predicted_error_rate?: number;
}

export default function SystemAnalysis() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [predictions, setPredictions] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Buscar métricas dos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: metrics, error } = await supabase
        .from('system_health_metrics')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (metrics && metrics.length > 0) {
        // Agrupar métricas por timestamp
        const metricsByTime = metrics.reduce((acc: any, m: any) => {
          const timestamp = new Date(m.created_at).toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          if (!acc[timestamp]) {
            acc[timestamp] = { timestamp, api_latency: 0, error_rate: 0, active_users: 0 };
          }
          
          if (m.metric_name === 'api_latency') acc[timestamp].api_latency = m.metric_value;
          if (m.metric_name === 'error_rate') acc[timestamp].error_rate = m.metric_value;
          if (m.metric_name === 'active_users') acc[timestamp].active_users = m.metric_value;
          
          return acc;
        }, {});

        const formattedData = Object.values(metricsByTime) as TrendData[];

        setTrendData(formattedData);
        
        // Detectar anomalias e fazer previsões
        const detectedAnomalies = detectAnomalies(formattedData);
        setAnomalies(detectedAnomalies);

        const futurePredictions = predictFutureMetrics(formattedData);
        setPredictions(futurePredictions);
      }
    } catch (error: any) {
      console.error('Error loading analysis data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar dados de análise',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const detectAnomalies = (data: TrendData[]): AnomalyDetection[] => {
    if (data.length < 10) return [];

    const anomalies: AnomalyDetection[] = [];
    
    // Calcular média e desvio padrão para cada métrica
    const metrics = ['api_latency', 'error_rate', 'active_users'] as const;
    
    metrics.forEach(metric => {
      const values = data.map(d => d[metric]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      // Detectar outliers (valores além de 2 desvios padrão)
      data.forEach((point, index) => {
        const value = point[metric];
        const deviation = Math.abs(value - mean);
        const deviationPercentage = (deviation / mean) * 100;

        if (deviation > 2 * stdDev) {
          let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
          let prediction = '';

          if (deviation > 3 * stdDev) {
            severity = 'critical';
            prediction = 'Falha crítica iminente se tendência continuar';
          } else if (deviation > 2.5 * stdDev) {
            severity = 'high';
            prediction = 'Degradação severa detectada';
          } else if (deviation > 2 * stdDev) {
            severity = 'medium';
            prediction = 'Anomalia moderada detectada';
          }

          // Verificar tendência (últimos 5 pontos)
          if (index >= 5) {
            const recentValues = values.slice(index - 4, index + 1);
            const isIncreasing = recentValues.every((val, i) => 
              i === 0 || val >= recentValues[i - 1]
            );
            
            if (isIncreasing && metric !== 'active_users') {
              prediction += ' com tendência crescente';
              if (severity === 'medium') severity = 'high';
            }
          }

          anomalies.push({
            timestamp: point.timestamp,
            metric_name: getMetricLabel(metric),
            current_value: value,
            expected_value: mean,
            deviation_percentage: deviationPercentage,
            severity,
            prediction
          });
        }
      });
    });

    return anomalies.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  };

  const predictFutureMetrics = (data: TrendData[]) => {
    if (data.length < 5) return null;

    // Usar regressão linear simples para previsão
    const predict = (values: number[]) => {
      const n = values.length;
      const x = Array.from({ length: n }, (_, i) => i);
      const y = values;

      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Prever próximos 3 valores
      return Array.from({ length: 3 }, (_, i) => slope * (n + i) + intercept);
    };

    const apiLatencyValues = data.map(d => d.api_latency);
    const errorRateValues = data.map(d => d.error_rate);

    const predictedApiLatency = predict(apiLatencyValues);
    const predictedErrorRate = predict(errorRateValues);

    return {
      api_latency: {
        current: apiLatencyValues[apiLatencyValues.length - 1],
        predicted_next: predictedApiLatency[0],
        trend: predictedApiLatency[0] > apiLatencyValues[apiLatencyValues.length - 1] ? 'increasing' : 'decreasing',
        confidence: calculateConfidence(apiLatencyValues)
      },
      error_rate: {
        current: errorRateValues[errorRateValues.length - 1],
        predicted_next: predictedErrorRate[0],
        trend: predictedErrorRate[0] > errorRateValues[errorRateValues.length - 1] ? 'increasing' : 'decreasing',
        confidence: calculateConfidence(errorRateValues)
      }
    };
  };

  const calculateConfidence = (values: number[]) => {
    const variance = values.reduce((sum, val, _, arr) => {
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      return sum + Math.pow(val - mean, 2);
    }, 0) / values.length;

    const coefficientOfVariation = Math.sqrt(variance) / (values.reduce((a, b) => a + b, 0) / values.length);
    
    // Confiança inversamente proporcional à variação
    return Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));
  };

  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      api_latency: 'Latência de API',
      error_rate: 'Taxa de Erro',
      active_users: 'Usuários Ativos'
    };
    return labels[metric] || metric;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, any> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    };
    return colors[severity] || 'secondary';
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    toast({
      title: 'Análise Iniciada',
      description: 'Executando análise de tendências e detecção de anomalias...'
    });

    await loadData();

    setTimeout(() => {
      setAnalyzing(false);
      toast({
        title: 'Análise Concluída',
        description: `${anomalies.length} anomalias detectadas`
      });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8" />
            Análise de Tendências e Anomalias
          </h1>
          <p className="text-muted-foreground">
            Detecção automática de anomalias e previsão de falhas usando ML
          </p>
        </div>

        <Button onClick={runAnalysis} disabled={analyzing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Analisando...' : 'Executar Análise'}
        </Button>
      </div>

      {/* Previsões */}
      {predictions && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Previsão: Latência de API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Atual:</span>
                  <span className="font-semibold">{predictions.api_latency.current.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Próximo Previsto:</span>
                  <span className="font-semibold">{predictions.api_latency.predicted_next.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tendência:</span>
                  <Badge variant={predictions.api_latency.trend === 'increasing' ? 'destructive' : 'default'}>
                    {predictions.api_latency.trend === 'increasing' ? '↑ Crescente' : '↓ Decrescente'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confiança:</span>
                  <span className="font-semibold">{predictions.api_latency.confidence.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Previsão: Taxa de Erro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Atual:</span>
                  <span className="font-semibold">{predictions.error_rate.current.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Próximo Previsto:</span>
                  <span className="font-semibold">{predictions.error_rate.predicted_next.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tendência:</span>
                  <Badge variant={predictions.error_rate.trend === 'increasing' ? 'destructive' : 'default'}>
                    {predictions.error_rate.trend === 'increasing' ? '↑ Crescente' : '↓ Decrescente'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confiança:</span>
                  <span className="font-semibold">{predictions.error_rate.confidence.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Anomalias Detectadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Anomalias Detectadas ({anomalies.length})
          </CardTitle>
          <CardDescription>
            Desvios significativos detectados nos padrões normais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Nenhuma Anomalia</AlertTitle>
              <AlertDescription>
                Sistema operando dentro dos parâmetros normais
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {anomalies.slice(0, 10).map((anomaly, index) => (
                <Alert key={index} variant={anomaly.severity === 'critical' || anomaly.severity === 'high' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center gap-2">
                    {anomaly.metric_name}
                    <Badge variant={getSeverityColor(anomaly.severity)}>
                      {anomaly.severity.toUpperCase()}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>
                    <div className="space-y-1 text-sm">
                      <p><strong>Timestamp:</strong> {anomaly.timestamp}</p>
                      <p><strong>Valor Atual:</strong> {anomaly.current_value.toFixed(2)}</p>
                      <p><strong>Valor Esperado:</strong> {anomaly.expected_value.toFixed(2)}</p>
                      <p><strong>Desvio:</strong> {anomaly.deviation_percentage.toFixed(1)}%</p>
                      <p className="text-destructive font-semibold">{anomaly.prediction}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Tendências */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Tendências - Últimos 7 Dias</CardTitle>
          <CardDescription>
            Visualização de métricas históricas e padrões detectados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="api_latency" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  name="Latência API (ms)"
                />
                <Area 
                  type="monotone" 
                  dataKey="error_rate" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.3}
                  name="Taxa de Erro (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
