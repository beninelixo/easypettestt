import { useState, useEffect, useCallback } from 'react';
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
  const [isLive, setIsLive] = useState(false);
  const { toast } = useToast();

  const loadAlerts = useCallback(async () => {
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
  }, []);

  const loadLoginAttempts = useCallback(async () => {
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
  }, []);

  const loadBlockedIps = useCallback(async () => {
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
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadAlerts(), loadLoginAttempts(), loadBlockedIps()]);
  }, [loadAlerts, loadLoginAttempts, loadBlockedIps]);

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
    loadAll();

    // Multi-table realtime subscriptions
    const channel = supabase
      .channel('security-monitoring-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'security_alerts' },
        (payload) => {
          loadAlerts();
          if (payload.eventType === 'INSERT') {
            const newAlert = payload.new as SecurityAlert;
            toast({
              title: "⚠️ Novo Alerta de Segurança",
              description: newAlert.description || "Um novo alerta foi detectado.",
              variant: newAlert.severity === 'critical' ? 'destructive' : 'default',
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'login_attempts' },
        (payload) => {
          loadLoginAttempts();
          if (payload.eventType === 'INSERT') {
            const attempt = payload.new as LoginAttempt;
            if (!attempt.success) {
              // Only toast for failed attempts from same IP multiple times
              const recentFails = loginAttempts.filter(
                a => !a.success && a.ip_address === attempt.ip_address
              ).length;
              if (recentFails >= 3) {
                toast({
                  title: "🔒 Múltiplas Tentativas Falhadas",
                  description: `IP: ${attempt.ip_address}`,
                  variant: "destructive",
                });
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blocked_ips' },
        (payload) => {
          loadBlockedIps();
          if (payload.eventType === 'INSERT') {
            const blocked = payload.new as BlockedIP;
            toast({
              title: "🚫 IP Bloqueado",
              description: `${blocked.ip_address} - ${blocked.reason}`,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    // Refresh every 15 seconds as fallback
    const interval = setInterval(loadAll, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [loadAll, loadAlerts, loadLoginAttempts, loadBlockedIps, toast]);

  // Computed stats
  const failedLogins24h = loginAttempts.filter(a => {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    return !a.success && new Date(a.attempt_time) > twentyFourHoursAgo;
  }).length;

  const criticalAlerts = alerts.filter(a => !a.resolved && a.severity === 'critical').length;
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;
  const activeBlockedIps = blockedIps.filter(b => new Date(b.blocked_until) > new Date()).length;

  return {
    alerts,
    loginAttempts,
    blockedIps,
    loading,
    isLive,
    // Computed stats
    failedLogins24h,
    criticalAlerts,
    unresolvedAlerts,
    activeBlockedIps,
    // Actions
    loadAlerts,
    loadLoginAttempts,
    loadBlockedIps,
    loadAll,
    resolveAlert,
    unblockIp,
    runSecurityAnalysis,
  };
}
