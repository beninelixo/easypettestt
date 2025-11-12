import { supabase } from "@/integrations/supabase/client";

export interface OfflineOperation {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  synced: boolean;
  error?: string;
}

const OFFLINE_QUEUE_KEY = 'easypet_offline_queue';
const SYNC_STATUS_KEY = 'easypet_sync_status';

class OfflineSyncManager {
  private syncInProgress = false;
  private syncListeners: Array<(status: SyncStatus) => void> = [];

  // Adicionar operação à fila offline
  addToQueue(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'synced'>): void {
    const queue = this.getQueue();
    const newOperation: OfflineOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      synced: false,
    };
    
    queue.push(newOperation);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    
    console.log('📝 Operação adicionada à fila offline:', newOperation);
  }

  // Obter fila de operações
  getQueue(): OfflineOperation[] {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Limpar operações sincronizadas
  clearSyncedOperations(): void {
    const queue = this.getQueue().filter(op => !op.synced);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  }

  // Status de sincronização
  getSyncStatus(): SyncStatus {
    const stored = localStorage.getItem(SYNC_STATUS_KEY);
    return stored ? JSON.parse(stored) : {
      lastSync: null,
      pending: 0,
      synced: 0,
      failed: 0,
      inProgress: false,
    };
  }

  private updateSyncStatus(status: Partial<SyncStatus>): void {
    const current = this.getSyncStatus();
    const updated = { ...current, ...status };
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(updated));
    this.notifyListeners(updated);
  }

  // Adicionar listener de status
  addSyncListener(callback: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(status: SyncStatus): void {
    this.syncListeners.forEach(cb => cb(status));
  }

  // Sincronizar operações pendentes
  async syncPendingOperations(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return { success: false, message: 'Sincronização já em andamento' };
    }

    if (!navigator.onLine) {
      return { success: false, message: 'Sem conexão com a internet' };
    }

    this.syncInProgress = true;
    this.updateSyncStatus({ inProgress: true });

    const queue = this.getQueue();
    const pendingOps = queue.filter(op => !op.synced);

    if (pendingOps.length === 0) {
      this.syncInProgress = false;
      this.updateSyncStatus({ inProgress: false });
      return { success: true, message: 'Nenhuma operação pendente' };
    }

    console.log(`🔄 Sincronizando ${pendingOps.length} operações...`);

    let synced = 0;
    let failed = 0;

    for (const operation of pendingOps) {
      try {
        await this.syncOperation(operation);
        operation.synced = true;
        synced++;
        console.log('✅ Operação sincronizada:', operation.id);
      } catch (error: any) {
        operation.error = error.message;
        failed++;
        console.error('❌ Erro ao sincronizar operação:', error);
      }
    }

    // Atualizar fila
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

    this.updateSyncStatus({
      lastSync: Date.now(),
      pending: queue.filter(op => !op.synced).length,
      synced,
      failed,
      inProgress: false,
    });

    this.syncInProgress = false;

    return {
      success: failed === 0,
      message: `${synced} operações sincronizadas, ${failed} falharam`,
      synced,
      failed,
    };
  }

  private async syncOperation(operation: OfflineOperation): Promise<void> {
    const { type, table, data } = operation;

    switch (type) {
      case 'insert':
        await supabase.from(table as any).insert(data);
        break;
      case 'update':
        await supabase.from(table as any).update(data).eq('id', data.id);
        break;
      case 'delete':
        await supabase.from(table as any).delete().eq('id', data.id);
        break;
    }
  }

  // Salvar rascunho de agendamento
  saveDraftAppointment(draft: any): void {
    const drafts = this.getDraftAppointments();
    const existingIndex = drafts.findIndex(d => d.id === draft.id);
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = { ...draft, updatedAt: Date.now() };
    } else {
      drafts.push({ ...draft, id: crypto.randomUUID(), createdAt: Date.now() });
    }
    
    localStorage.setItem('easypet_draft_appointments', JSON.stringify(drafts));
    console.log('💾 Rascunho salvo:', draft);
  }

  getDraftAppointments(): any[] {
    const stored = localStorage.getItem('easypet_draft_appointments');
    return stored ? JSON.parse(stored) : [];
  }

  deleteDraftAppointment(id: string): void {
    const drafts = this.getDraftAppointments().filter(d => d.id !== id);
    localStorage.setItem('easypet_draft_appointments', JSON.stringify(drafts));
  }

  // Salvar nota offline
  saveOfflineNote(note: any): void {
    const notes = this.getOfflineNotes();
    notes.push({ ...note, id: crypto.randomUUID(), timestamp: Date.now() });
    localStorage.setItem('easypet_offline_notes', JSON.stringify(notes));
    console.log('📝 Nota offline salva:', note);
  }

  getOfflineNotes(): any[] {
    const stored = localStorage.getItem('easypet_offline_notes');
    return stored ? JSON.parse(stored) : [];
  }

  clearOfflineNotes(): void {
    localStorage.removeItem('easypet_offline_notes');
  }
}

export interface SyncStatus {
  lastSync: number | null;
  pending: number;
  synced: number;
  failed: number;
  inProgress: boolean;
}

export interface SyncResult {
  success: boolean;
  message: string;
  synced?: number;
  failed?: number;
}

export const offlineSyncManager = new OfflineSyncManager();
