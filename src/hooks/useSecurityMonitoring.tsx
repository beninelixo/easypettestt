import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: string;
  description: string;
  ip_address?: string;
  resolved: boolean;
  created_at: string;
  metadata?: any;
}

interface LoginAttempt {
  id: string;
  email: string;
  success: boolean;
  ip_address?: string;
  attempt_time: string;
  user_agent?: string;
}

interface BlockedIP {
  id: string;
  ip_address: string;
  blocked_at: string;
  blocked_until: string;
  reason: string;
  auto_blocked: boolean;
}

export function useSecurityMonitoring() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [blockedIps, setBlockedIps] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Load alerts error:', error);
    }
  };

  const loadLoginAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .order('attempt_time', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLoginAttempts(data || []);
    } catch (error) {
      console.error('Load login attempts error:', error);
    }
  };

  const loadBlockedIps = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('blocked_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setBlockedIps(data || []);
    } catch (error) {
      console.error('Load blocked IPs error:', error);
    }
  };

  const unblockIp = async (ipAddress: string) => {
    try {
      const { error } = await supabase
        .from('blocked_ips')
        .delete()
        .eq('ip_address', ipAddress);

      if (error) throw error;

      toast({
        title: "IP Desbloqueado",
        description: `O IP ${ipAddress} foi desbloqueado.`,
      });

      await loadBlockedIps();
    } catch (error) {
      console.error('Unblock IP error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desbloquear o IP.",
        variant: "destructive",
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({ 
          resolved: true, 
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alerta Resolvido",
        description: "O alerta foi marcado como resolvido.",
      });

      await loadAlerts();
    } catch (error) {
      console.error('Resolve alert error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível resolver o alerta.",
        variant: "destructive",
      });
    }
  };

  const runSecurityAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-security-events');
      
      if (error) throw error;

      toast({
        title: "✅ Análise Concluída",
        description: `${data.alerts_created} alertas criados`,
      });

      await loadAlerts();
    } catch (error) {
      console.error('Security analysis error:', error);
      toast({
        title: "Erro na Análise",
        description: "Não foi possível executar análise de segurança.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    loadLoginAttempts();
    loadBlockedIps();

    // Realtime para novos alertas
    const channel = supabase
      .channel('security-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_alerts'
        },
        () => {
          loadAlerts();
          toast({
            title: "⚠️ Novo Alerta de Segurança",
            description: "Um novo alerta de segurança foi detectado.",
            variant: "destructive",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    alerts,
    loginAttempts,
    blockedIps,
    loading,
    loadAlerts,
    loadLoginAttempts,
    loadBlockedIps,
    resolveAlert,
    unblockIp,
    runSecurityAnalysis,
  };
}
