import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuditLog {
  id: string;
  user_id: string;
  table_name: string;
  operation: string;
  record_id: string;
  old_data?: any;
  new_data?: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const loadLogs = useCallback(async (filters?: {
    user_id?: string;
    table_name?: string;
    operation?: string;
    limit?: number;
  }) => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters?.table_name) {
        query = query.eq('table_name', filters.table_name);
      }
      if (filters?.operation) {
        query = query.eq('operation', filters.operation);
      }
      
      query = query.limit(filters?.limit || 100);

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Load audit logs error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAuditLog = useCallback(async (log: Omit<AuditLog, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert(log);

      if (error) throw error;
    } catch (error) {
      console.error('Create audit log error:', error);
    }
  }, []);

  useEffect(() => {
    loadLogs();

    // Realtime subscription for new logs
    const channel = supabase
      .channel('audit-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs'
        },
        () => {
          loadLogs();
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    // Fallback refresh every 30 seconds
    const interval = setInterval(() => loadLogs(), 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [loadLogs]);

  // Computed stats
  const logsByOperation = logs.reduce((acc, log) => {
    acc[log.operation] = (acc[log.operation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const logsByTable = logs.reduce((acc, log) => {
    acc[log.table_name] = (acc[log.table_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentLogs = logs.slice(0, 10);

  return {
    logs,
    loading,
    isLive,
    // Computed
    logsByOperation,
    logsByTable,
    recentLogs,
    // Actions
    loadLogs,
    createAuditLog,
  };
}
