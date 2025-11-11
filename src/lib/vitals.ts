import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

// Thresholds para cada métrica (baseado em Google Web Vitals)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
  TTFB: { good: 800, poor: 1800 },      // Time to First Byte
  INP: { good: 200, poor: 500 },        // Interaction to Next Paint
};

// Determinar rating baseado nos thresholds
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

// Armazenar métricas localmente
const metricsStore: WebVitalMetric[] = [];

// Callback para processar métricas
function handleMetric(metric: Metric) {
  const webVital: WebVitalMetric = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating || getRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType || 'navigate',
  };

  // Adicionar ao store local
  metricsStore.push(webVital);

  // Log em desenvolvimento
  if (import.meta.env.DEV) {
    console.log(`[Web Vital] ${webVital.name}:`, {
      value: `${Math.round(webVital.value)}ms`,
      rating: webVital.rating,
    });
  }

  // Enviar para o banco de dados (apenas em produção)
  if (import.meta.env.PROD) {
    sendMetricToDatabase(webVital);
  }
}

// Enviar métrica para o banco de dados
async function sendMetricToDatabase(metric: WebVitalMetric) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Silenciar erro se tabela não existir ainda
    await supabase.from('structured_logs').insert({
      level: 'info',
      module: 'web_vitals',
      message: `${metric.name}: ${metric.value}`,
      context: {
        metric_name: metric.name,
        metric_value: metric.value,
        rating: metric.rating,
        navigation_type: metric.navigationType,
        page_url: window.location.pathname,
      },
      user_id: user?.id || null,
    }).then(({ error }) => {
      if (error) console.debug('Web Vitals logging skipped:', error.message);
    });
  } catch (error) {
    // Silenciar erros - não é crítico
    console.debug('Web Vitals tracking unavailable');
  }
}

/**
 * Inicializar tracking de Web Vitals
 * Deve ser chamado uma vez no início da aplicação
 */
export function initWebVitalsTracking() {
  // Core Web Vitals
  onLCP(handleMetric);   // Largest Contentful Paint
  onINP(handleMetric);   // Interaction to Next Paint
  onCLS(handleMetric);   // Cumulative Layout Shift
  
  // Métricas adicionais
  onFCP(handleMetric);   // First Contentful Paint
  onTTFB(handleMetric);  // Time to First Byte
}

/**
 * Obter métricas armazenadas localmente
 */
export function getStoredMetrics(): WebVitalMetric[] {
  return [...metricsStore];
}

/**
 * Obter última métrica por nome
 */
export function getLatestMetric(name: string): WebVitalMetric | undefined {
  return metricsStore
    .filter(m => m.name === name)
    .sort((a, b) => b.value - a.value)[0];
}

/**
 * Calcular score geral de performance (0-100)
 */
export function calculatePerformanceScore(): number {
  const lcp = getLatestMetric('LCP');
  const inp = getLatestMetric('INP');
  const cls = getLatestMetric('CLS');

  if (!lcp || !inp || !cls) return 0;

  const scores = [
    lcp.rating === 'good' ? 100 : lcp.rating === 'needs-improvement' ? 50 : 0,
    inp.rating === 'good' ? 100 : inp.rating === 'needs-improvement' ? 50 : 0,
    cls.rating === 'good' ? 100 : cls.rating === 'needs-improvement' ? 50 : 0,
  ];

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
