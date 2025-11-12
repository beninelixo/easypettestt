import { useState, useEffect } from 'react';
import { offlineSyncManager, SyncStatus, SyncResult, DataConflict } from '@/lib/offline-sync';
import { useToast } from '@/hooks/use-toast';

export const useOfflineSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(offlineSyncManager.getSyncStatus());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [conflicts, setConflicts] = useState<DataConflict[]>([]);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Atualizar status de conexão
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "✅ Conexão Restaurada",
        description: "Sincronizando dados offline...",
      });
      syncPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "📡 Modo Offline",
        description: "Suas alterações serão salvas e sincronizadas quando a conexão for restaurada.",
        variant: "default",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listener de status de sincronização
    const unsubscribe = offlineSyncManager.addSyncListener((status) => {
      setSyncStatus(status);
    });

    // Listener de conflitos
    const unsubscribeConflicts = offlineSyncManager.addConflictListener((detectedConflicts) => {
      setConflicts(detectedConflicts);
      setShowConflictDialog(true);
      toast({
        title: "⚠️ Conflitos Detectados",
        description: `${detectedConflicts.length} conflitos de sincronização precisam ser resolvidos.`,
        variant: "destructive",
      });
    });

    // Sincronizar ao montar se estiver online
    if (navigator.onLine) {
      syncPendingOperations();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
      unsubscribeConflicts();
    };
  }, []);

  const syncPendingOperations = async (
    conflictResolutions?: Map<string, 'local' | 'server' | 'merge'>
  ): Promise<SyncResult> => {
    const result = await offlineSyncManager.syncPendingOperations(conflictResolutions);
    
    if (result.success && result.synced && result.synced > 0) {
      toast({
        title: "🔄 Sincronização Concluída",
        description: result.message,
      });
    } else if (!result.success && result.failed && result.failed > 0) {
      toast({
        title: "⚠️ Erro na Sincronização",
        description: result.message,
        variant: "destructive",
      });
    }

    return result;
  };

  const handleConflictResolution = async (resolutions: Map<string, 'local' | 'server' | 'merge'>) => {
    setShowConflictDialog(false);
    await syncPendingOperations(resolutions);
    setConflicts([]);
  };

  const getCompressionStats = () => {
    return offlineSyncManager.getCompressionStats();
  };

  const addToQueue = (operation: { type: 'insert' | 'update' | 'delete'; table: string; data: any }) => {
    offlineSyncManager.addToQueue(operation);
    setSyncStatus(offlineSyncManager.getSyncStatus());
  };

  const saveDraft = (draft: any) => {
    offlineSyncManager.saveDraftAppointment(draft);
    toast({
      title: "💾 Rascunho Salvo",
      description: "Suas alterações foram salvas localmente.",
    });
  };

  const getDrafts = () => {
    return offlineSyncManager.getDraftAppointments();
  };

  const deleteDraft = (id: string) => {
    offlineSyncManager.deleteDraftAppointment(id);
  };

  return {
    syncStatus,
    isOnline,
    syncPendingOperations,
    addToQueue,
    saveDraft,
    getDrafts,
    deleteDraft,
    conflicts,
    showConflictDialog,
    handleConflictResolution,
    cancelConflictResolution: () => setShowConflictDialog(false),
    getCompressionStats,
  };
};
