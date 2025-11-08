import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BackupRecord {
  id: string;
  backup_id: string;
  backup_type: string;
  status: string;
  started_at: string;
  completed_at?: string;
  total_records: number;
  backup_size_bytes?: number;
  tables_backed_up: any;
  error_message?: string;
}

export function useBackupManagement() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadBackups = async () => {
    try {
      const { data, error } = await supabase
        .from('backup_history')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setBackups(data || []);
    } catch (error) {
      console.error('Load backups error:', error);
    }
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('backup-full-database');
      
      if (error) throw error;

      toast({
        title: "✅ Backup Criado",
        description: `${data.total_records} registros salvos (${(data.backup_size_bytes / 1024 / 1024).toFixed(2)} MB)`,
      });

      await loadBackups();
    } catch (error) {
      console.error('Create backup error:', error);
      toast({
        title: "Erro no Backup",
        description: "Não foi possível criar o backup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();

    // Realtime para novos backups
    const channel = supabase
      .channel('backup-history')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'backup_history'
        },
        () => {
          loadBackups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const restoreBackup = async (backupId: string, tables?: string[]) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('restore-backup', {
        body: { backup_id: backupId, tables }
      });
      
      if (error) throw error;

      toast({
        title: "✅ Backup Restaurado",
        description: data.message,
      });

      await loadBackups();
      return true;
    } catch (error) {
      console.error('Restore backup error:', error);
      toast({
        title: "Erro na Restauração",
        description: "Não foi possível restaurar o backup.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    backups,
    loading,
    loadBackups,
    createBackup,
    restoreBackup,
  };
}
