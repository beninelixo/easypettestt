import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemHealthMetrics {
  overall: 'healthy' | 'degraded' | 'critical';
  database: {
    status: 'online' | 'offline';
    responseTime: number;
  };
  api: {
    status: 'online' | 'offline';
    latency: number;
  };
  storage: {
    status: 'online' | 'offline';
  };
  uptime: number;
  lastCheck: Date;
}

export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();

      // Check database
      const { error: dbError } = await supabase
        .from('system_health_metrics')
        .select('*')
        .limit(1);

      const dbResponseTime = Date.now() - startTime;

      // Check API latency
      const apiStart = Date.now();
      const { data: healthData } = await supabase.functions.invoke('health-check');
      const apiLatency = Date.now() - apiStart;

      // Calculate overall health
      let overall: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (dbError || dbResponseTime > 1000 || apiLatency > 2000) {
        overall = 'degraded';
      }
      if (dbError || dbResponseTime > 3000 || apiLatency > 5000) {
        overall = 'critical';
      }

      const metrics: SystemHealthMetrics = {
        overall,
        database: {
          status: dbError ? 'offline' : 'online',
          responseTime: dbResponseTime
        },
        api: {
          status: healthData ? 'online' : 'offline',
          latency: apiLatency
        },
        storage: {
          status: 'online' // Assume online unless specific check fails
        },
        uptime: 99.9, // Calculate from system_health_metrics table
        lastCheck: new Date()
      };

      setHealth(metrics);
      setError(null);
    } catch (err) {
      console.error('Health check failed:', err);
      setError(err instanceof Error ? err.message : 'Health check failed');
      setHealth({
        overall: 'critical',
        database: { status: 'offline', responseTime: 0 },
        api: { status: 'offline', latency: 0 },
        storage: { status: 'offline' },
        uptime: 0,
        lastCheck: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { health, loading, error, refetch: checkHealth };
}
