import { useState, useEffect } from 'react';
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

  const loadLogs = async (filters?: {
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
  };

  const createAuditLog = async (log: Omit<AuditLog, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert(log);

      if (error) throw error;
    } catch (error) {
      console.error('Create audit log error:', error);
    }
  };

  useEffect(() => {
    loadLogs();

    // Realtime para novos logs
    const channel = supabase
      .channel('audit-logs')
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    logs,
    loading,
    loadLogs,
    createAuditLog,
  };
}
