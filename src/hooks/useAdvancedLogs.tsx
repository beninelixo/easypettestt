import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  module: string;
  message: string;
  details?: Record<string, any>;
  user_id?: string;
  ip_address?: string;
  trace_id?: string;
}

export interface LogFilters {
  level?: string[];
  module?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export function useAdvancedLogs(filters?: LogFilters) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (filters?.level && filters.level.length > 0) {
        query = query.in('log_type', filters.level);
      }

      if (filters?.module) {
        query = query.eq('module', filters.module);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      if (filters?.search) {
        query = query.ilike('message', `%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const formattedLogs: LogEntry[] = (data || []).map((log: any) => ({
        id: log.id,
        timestamp: log.created_at,
        level: log.log_type as any,
        module: log.module || 'system',
        message: log.message,
        details: log.details,
        user_id: log.user_id,
        trace_id: log.trace_id
      }));

      setLogs(formattedLogs);
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Set up real-time subscription
    const channel = supabase
      .channel('system_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_logs'
        },
        (payload) => {
          const newLog: LogEntry = {
            id: payload.new.id,
            timestamp: payload.new.created_at,
            level: payload.new.log_type,
            module: payload.new.module || 'system',
            message: payload.new.message,
            details: payload.new.details,
            user_id: payload.new.user_id,
            trace_id: payload.new.trace_id
          };
          setLogs(prev => [newLog, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters]);

  const exportLogs = async (format: 'json' | 'csv') => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString()}.json`;
      a.click();
    } else if (format === 'csv') {
      const headers = ['Timestamp', 'Level', 'Module', 'Message'];
      const rows = logs.map(log => [
        log.timestamp,
        log.level,
        log.module,
        log.message
      ]);
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString()}.csv`;
      a.click();
    }
  };

  return { logs, loading, error, refetch: fetchLogs, exportLogs };
}
