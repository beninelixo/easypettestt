import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MonitorReport {
  timestamp: string;
  securityScore: number;
  checks: Array<{
    type: string;
    status: 'ok' | 'warning' | 'critical';
    message: string;
  }>;
  autoCorrections: string[];
}

export function useAIMonitor() {
  const [report, setReport] = useState<MonitorReport | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runAudit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-monitor');
      
      if (error) throw error;
      
      setReport(data);
      
      const criticalIssues = data.checks?.filter((c: any) => c.status === 'critical').length || 0;
      
      if (criticalIssues > 0) {
        toast({
          title: "⚠️ Problemas Críticos Detectados",
          description: `${criticalIssues} problemas críticos encontrados. Verificar detalhes.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Sistema Saudável",
          description: `Score de segurança: ${data.securityScore}/10`,
        });
      }
    } catch (error) {
      console.error('AI Monitor error:', error);
      toast({
        title: "Erro no Monitor AI",
        description: "Não foi possível executar auditoria automática.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on mount
  useEffect(() => {
    runAudit();
    
    // Run every 24 hours
    const interval = setInterval(() => {
      runAudit();
    }, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { report, loading, runAudit };
}
