import { supabase } from "@/integrations/supabase/client";
import LZString from 'lz-string';

export interface DataConflict {
  id: string;
  table: string;
  recordId: string;
  localVersion: any;
  serverVersion: any;
  localTimestamp: number;
  serverTimestamp: number;
}

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
  private conflictListeners: Array<(conflicts: DataConflict[]) => void> = [];

  // Compressão de dados
  private compressData(data: any): string {
    return LZString.compress(JSON.stringify(data));
  }

  private decompressData(compressed: string): any {
    const decompressed = LZString.decompress(compressed);
    return decompressed ? JSON.parse(decompressed) : null;
  }

  // Listeners de conflitos
  addConflictListener(callback: (conflicts: DataConflict[]) => void): () => void {
    this.conflictListeners.push(callback);
    return () => {
      this.conflictListeners = this.conflictListeners.filter(cb => cb !== callback);
    };
  }

  private notifyConflicts(conflicts: DataConflict[]): void {
    this.conflictListeners.forEach(cb => cb(conflicts));
  }

  // Adicionar operação à fila offline com compressão
  addToQueue(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'synced'>): void {
    const queue = this.getQueue();
    const newOperation: OfflineOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      synced: false,
    };
    
    queue.push(newOperation);
    const compressed = this.compressData(queue);
    localStorage.setItem(OFFLINE_QUEUE_KEY, compressed);
    
    console.log('📝 Operação adicionada à fila offline (comprimida):', newOperation);
  }

  // Obter fila de operações com descompressão
  getQueue(): OfflineOperation[] {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!stored) return [];
    
    try {
      // Tentar descomprimir
      const decompressed = this.decompressData(stored);
      return decompressed || [];
    } catch {
      // Fallback para formato não comprimido (retrocompatibilidade)
      return JSON.parse(stored);
    }
  }

  // Limpar operações sincronizadas com compressão
  clearSyncedOperations(): void {
    const queue = this.getQueue().filter(op => !op.synced);
    const compressed = this.compressData(queue);
    localStorage.setItem(OFFLINE_QUEUE_KEY, compressed);
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

  // Sincronizar operações pendentes com detecção de conflitos
  async syncPendingOperations(
    conflictResolutions?: Map<string, 'local' | 'server' | 'merge'>
  ): Promise<SyncResult> {
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
    const conflicts: DataConflict[] = [];

    for (const operation of pendingOps) {
      try {
        // Detectar conflitos para operações de update
        if (operation.type === 'update') {
          const conflict = await this.detectConflict(operation);
          
          if (conflict) {
            // Se há resolução para este conflito
            const resolution = conflictResolutions?.get(conflict.id);
            
            if (resolution === 'local') {
              // Manter versão local (continuar com sync)
              await this.syncOperation(operation);
              operation.synced = true;
              synced++;
            } else if (resolution === 'server') {
              // Descartar versão local
              operation.synced = true;
              synced++;
            } else if (resolution === 'merge') {
              // Merge automático
              const merged = this.mergeVersions(conflict.localVersion, conflict.serverVersion);
              await this.syncOperation({ ...operation, data: merged });
              operation.synced = true;
              synced++;
            } else {
              // Sem resolução ainda - adicionar à lista de conflitos
              conflicts.push(conflict);
            }
            continue;
          }
        }

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

    // Se há conflitos não resolvidos, notificar e pausar
    if (conflicts.length > 0 && !conflictResolutions) {
      this.notifyConflicts(conflicts);
      this.syncInProgress = false;
      this.updateSyncStatus({ inProgress: false });
      return {
        success: false,
        message: `${conflicts.length} conflitos detectados. Resolva os conflitos para continuar.`,
        synced,
        failed,
      };
    }

    // Atualizar fila com compressão
    const compressed = this.compressData(queue);
    localStorage.setItem(OFFLINE_QUEUE_KEY, compressed);

    this.updateSyncStatus({
      lastSync: Date.now(),
      pending: queue.filter(op => !op.synced).length,
      synced,
      failed,
      inProgress: false,
    });

    this.syncInProgress = false;

    // Enviar notificação push nativa
    this.sendSyncNotification(synced, failed);

    return {
      success: failed === 0,
      message: `${synced} operações sincronizadas, ${failed} falharam`,
      synced,
      failed,
    };
  }

  // Detectar conflitos comparando versão local com servidor
  private async detectConflict(operation: OfflineOperation): Promise<DataConflict | null> {
    try {
      const { data: serverData, error } = await supabase
        .from(operation.table as any)
        .select('*, updated_at')
        .eq('id', operation.data.id)
        .single();

      if (error || !serverData) return null;

      const serverTimestamp = new Date((serverData as any).updated_at).getTime();
      const localTimestamp = operation.timestamp;

      // Se servidor foi modificado após a operação local, há conflito
      if (serverTimestamp > localTimestamp) {
        return {
          id: `conflict_${operation.id}`,
          table: operation.table,
          recordId: operation.data.id,
          localVersion: operation.data,
          serverVersion: serverData,
          localTimestamp,
          serverTimestamp,
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao detectar conflito:', error);
      return null;
    }
  }

  // Merge automático de versões
  private mergeVersions(local: any, server: any): any {
    const merged = { ...server };

    // Merge simples: campos modificados localmente sobrescrevem servidor
    // exceto campos de sistema (id, created_at, updated_at)
    Object.keys(local).forEach((key) => {
      if (!['id', 'created_at', 'updated_at'].includes(key)) {
        if (local[key] !== server[key]) {
          merged[key] = local[key];
        }
      }
    });

    return merged;
  }

  // Enviar notificação push nativa
  private async sendSyncNotification(synced: number, failed: number): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          
          const title = failed > 0 
            ? '⚠️ Sincronização Concluída com Erros'
            : '✅ Sincronização Concluída';
          
          const body = failed > 0
            ? `${synced} operações sincronizadas, ${failed} falharam`
            : `${synced} operações sincronizadas com sucesso`;

          await registration.showNotification(title, {
            body,
            icon: '/icon-192.png',
            badge: '/favicon.png',
            tag: 'offline-sync',
            requireInteraction: failed > 0,
            data: { synced, failed },
          });
        }
      } catch (error) {
        console.error('Erro ao enviar notificação push:', error);
      }
    }
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

  // Salvar rascunho de agendamento com compressão
  saveDraftAppointment(draft: any): void {
    const drafts = this.getDraftAppointments();
    const existingIndex = drafts.findIndex(d => d.id === draft.id);
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = { ...draft, updatedAt: Date.now() };
    } else {
      drafts.push({ ...draft, id: crypto.randomUUID(), createdAt: Date.now() });
    }
    
    const compressed = this.compressData(drafts);
    localStorage.setItem('easypet_draft_appointments', compressed);
    console.log('💾 Rascunho salvo (comprimido):', draft);
  }

  getDraftAppointments(): any[] {
    const stored = localStorage.getItem('easypet_draft_appointments');
    if (!stored) return [];
    
    try {
      return this.decompressData(stored) || [];
    } catch {
      return JSON.parse(stored);
    }
  }

  deleteDraftAppointment(id: string): void {
    const drafts = this.getDraftAppointments().filter(d => d.id !== id);
    const compressed = this.compressData(drafts);
    localStorage.setItem('easypet_draft_appointments', compressed);
  }

  // Salvar nota offline com compressão
  saveOfflineNote(note: any): void {
    const notes = this.getOfflineNotes();
    notes.push({ ...note, id: crypto.randomUUID(), timestamp: Date.now() });
    const compressed = this.compressData(notes);
    localStorage.setItem('easypet_offline_notes', compressed);
    console.log('📝 Nota offline salva (comprimida):', note);
  }

  getOfflineNotes(): any[] {
    const stored = localStorage.getItem('easypet_offline_notes');
    if (!stored) return [];
    
    try {
      return this.decompressData(stored) || [];
    } catch {
      return JSON.parse(stored);
    }
  }

  clearOfflineNotes(): void {
    localStorage.removeItem('easypet_offline_notes');
  }

  // Obter estatísticas de compressão
  getCompressionStats(): { original: number; compressed: number; ratio: number } {
    const queue = localStorage.getItem(OFFLINE_QUEUE_KEY) || '';
    const drafts = localStorage.getItem('easypet_draft_appointments') || '';
    const notes = localStorage.getItem('easypet_offline_notes') || '';

    const compressed = queue.length + drafts.length + notes.length;
    
    // Estimar tamanho original
    const queueData = this.getQueue();
    const draftsData = this.getDraftAppointments();
    const notesData = this.getOfflineNotes();
    
    const original = JSON.stringify(queueData).length + 
                     JSON.stringify(draftsData).length + 
                     JSON.stringify(notesData).length;

    return {
      original,
      compressed,
      ratio: original > 0 ? ((1 - compressed / original) * 100) : 0,
    };
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
