import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Zap, 
  Timer, 
  Eye, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { 
  getStoredMetrics, 
  calculatePerformanceScore,
  getLatestMetric 
} from "@/lib/vitals";

const PerformanceDashboard = () => {
  const [localMetrics, setLocalMetrics] = useState(getStoredMetrics());
  const [performanceScore, setPerformanceScore] = useState(calculatePerformanceScore());

  // Atualizar métricas locais periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setLocalMetrics(getStoredMetrics());
      setPerformanceScore(calculatePerformanceScore());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Métricas Core Web Vitals atuais
  const lcp = getLatestMetric('LCP');
  const inp = getLatestMetric('INP');
  const cls = getLatestMetric('CLS');
  const fcp = getLatestMetric('FCP');
  const ttfb = getLatestMetric('TTFB');

  const getRatingColor = (rating?: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRatingIcon = (rating?: string) => {
    switch (rating) {
      case 'good': return <CheckCircle2 className="h-4 w-4" />;
      case 'needs-improvement': return <AlertCircle className="h-4 w-4" />;
      case 'poor': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          Dashboard de Performance
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitoramento em tempo real de Web Vitals e métricas de performance
        </p>
      </div>

      {/* Performance Score */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Score Geral de Performance
          </CardTitle>
          <CardDescription>
            Baseado nas Core Web Vitals (LCP, INP, CLS)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-6xl font-bold text-primary">
              {performanceScore}
            </div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-green-500 transition-all"
                  style={{ width: `${performanceScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {performanceScore >= 90 ? '🎉 Excelente!' : 
                 performanceScore >= 50 ? '⚠️ Precisa melhorar' : 
                 '❌ Crítico'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Métricas Atuais</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>

        {/* Métricas Atuais */}
        <TabsContent value="current" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* LCP */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    LCP
                  </span>
                  <Badge className={getRatingColor(lcp?.rating)}>
                    {getRatingIcon(lcp?.rating)}
                    {lcp?.rating || 'N/A'}
                  </Badge>
                </CardTitle>
                <CardDescription>Largest Contentful Paint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {lcp ? `${Math.round(lcp.value)}ms` : '-'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Meta: {'<'} 2.5s
                </p>
              </CardContent>
            </Card>

            {/* INP */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    INP
                  </span>
                  <Badge className={getRatingColor(inp?.rating)}>
                    {getRatingIcon(inp?.rating)}
                    {inp?.rating || 'N/A'}
                  </Badge>
                </CardTitle>
                <CardDescription>Interaction to Next Paint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {inp ? `${Math.round(inp.value)}ms` : '-'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Meta: {'<'} 200ms
                </p>
              </CardContent>
            </Card>

            {/* CLS */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    CLS
                  </span>
                  <Badge className={getRatingColor(cls?.rating)}>
                    {getRatingIcon(cls?.rating)}
                    {cls?.rating || 'N/A'}
                  </Badge>
                </CardTitle>
                <CardDescription>Cumulative Layout Shift</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {cls ? cls.value.toFixed(3) : '-'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Meta: {'<'} 0.1
                </p>
              </CardContent>
            </Card>

            {/* FCP */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    FCP
                  </span>
                  <Badge className={getRatingColor(fcp?.rating)}>
                    {getRatingIcon(fcp?.rating)}
                    {fcp?.rating || 'N/A'}
                  </Badge>
                </CardTitle>
                <CardDescription>First Contentful Paint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {fcp ? `${Math.round(fcp.value)}ms` : '-'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Meta: {'<'} 1.8s
                </p>
              </CardContent>
            </Card>

            {/* TTFB */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    TTFB
                  </span>
                  <Badge className={getRatingColor(ttfb?.rating)}>
                    {getRatingIcon(ttfb?.rating)}
                    {ttfb?.rating || 'N/A'}
                  </Badge>
                </CardTitle>
                <CardDescription>Time to First Byte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {ttfb ? `${Math.round(ttfb.value)}ms` : '-'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Meta: {'<'} 800ms
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detalhes */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Métricas Locais Capturadas</CardTitle>
              <CardDescription>
                Métricas coletadas na sessão atual (atualiza a cada 5s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {localMetrics.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma métrica capturada ainda. Navegue pelo app para coletar dados.
                </p>
              ) : (
                <div className="space-y-2">
                  {localMetrics.map((metric, idx) => (
                    <div 
                      key={`${metric.id}-${idx}`}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{metric.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {metric.navigationType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {metric.name === 'CLS' 
                            ? metric.value.toFixed(3) 
                            : `${Math.round(metric.value)}ms`
                          }
                        </p>
                        <Badge className={getRatingColor(metric.rating)}>
                          {metric.rating}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
