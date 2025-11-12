import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  module: string;
  metadata?: Record<string, any>;
}

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Monitor slow database queries
    const monitorQueryPerformance = () => {
      const originalFrom = supabase.from.bind(supabase);
      
      supabase.from = function(table: string) {
        const startTime = performance.now();
        const result = originalFrom(table);
        
        // Intercept the select method
        const originalSelect = result.select.bind(result);
        result.select = function(...args: any[]) {
          const selectResult = originalSelect(...args);
          
          // Monitor when the promise resolves
          if (selectResult && typeof selectResult.then === 'function') {
            selectResult.then(() => {
              const duration = performance.now() - startTime;
              
              // Log slow queries (>1000ms)
              if (duration > 1000) {
                logMetric({
                  metric_name: 'slow_query',
                  metric_value: duration,
                  metric_unit: 'ms',
                  module: 'database',
                  metadata: { table, duration, threshold: 1000 }
                });
              }
            });
          }
          
          return selectResult;
        };
        
        return result;
      };
    };

    // Monitor navigation performance
    const monitorNavigation = () => {
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'navigation') {
                const navEntry = entry as PerformanceNavigationTiming;
                
                logMetric({
                  metric_name: 'page_load_time',
                  metric_value: navEntry.loadEventEnd - navEntry.fetchStart,
                  metric_unit: 'ms',
                  module: 'navigation',
                  metadata: {
                    dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
                    tcp: navEntry.connectEnd - navEntry.connectStart,
                    ttfb: navEntry.responseStart - navEntry.requestStart,
                    download: navEntry.responseEnd - navEntry.responseStart,
                  }
                });
              }
            }
          });
          
          observer.observe({ entryTypes: ['navigation'] });
          
          return () => observer.disconnect();
        } catch (err) {
          console.error('Performance observer error:', err);
        }
      }
    };

    monitorQueryPerformance();
    const cleanup = monitorNavigation();

    return cleanup;
  }, []);

  const logMetric = async (metric: PerformanceMetric) => {
    try {
      // Use structured_logs for now until performance_metrics table is in types
      await supabase.from('structured_logs').insert({
        level: 'info',
        module: metric.module,
        message: `${metric.metric_name}: ${metric.metric_value}${metric.metric_unit}`,
        context: { ...metric.metadata, metric_name: metric.metric_name, metric_value: metric.metric_value }
      });
    } catch (err) {
      console.error('Failed to log performance metric:', err);
    }
  };

  return { logMetric };
};
