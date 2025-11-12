export interface CacheConfig {
  enabledPages: string[];
  maxCacheSizeMB: number;
  autoCleanup: 'daily' | 'weekly' | 'monthly' | 'never';
  lastCleanup?: number;
}

const CACHE_CONFIG_KEY = 'easypet_cache_config';

const DEFAULT_CONFIG: CacheConfig = {
  enabledPages: [
    '/client/dashboard',
    '/client/pets',
    '/client/appointments',
    '/professional/dashboard',
    '/professional/calendar',
    '/admin/dashboard',
    '/diagnostics',
  ],
  maxCacheSizeMB: 100,
  autoCleanup: 'weekly',
};

class CacheConfigManager {
  getConfig(): CacheConfig {
    const stored = localStorage.getItem(CACHE_CONFIG_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  }

  updateConfig(config: Partial<CacheConfig>): void {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(CACHE_CONFIG_KEY, JSON.stringify(updated));
    console.log('⚙️ Configuração de cache atualizada:', updated);
  }

  isPageCacheable(pathname: string): boolean {
    const config = this.getConfig();
    return config.enabledPages.some(page => pathname.startsWith(page));
  }

  getCurrentCacheSizeMB(): number {
    let totalSize = 0;
    
    // Estimar tamanho do localStorage
    for (let key in localStorage) {
      if (key.startsWith('easypet_')) {
        totalSize += (localStorage[key]?.length || 0) * 2; // UTF-16
      }
    }

    return totalSize / (1024 * 1024); // Converter para MB
  }

  shouldCleanup(): boolean {
    const config = this.getConfig();
    
    if (config.autoCleanup === 'never') return false;
    if (!config.lastCleanup) return true;

    const now = Date.now();
    const daysSinceCleanup = (now - config.lastCleanup) / (1000 * 60 * 60 * 24);

    switch (config.autoCleanup) {
      case 'daily':
        return daysSinceCleanup >= 1;
      case 'weekly':
        return daysSinceCleanup >= 7;
      case 'monthly':
        return daysSinceCleanup >= 30;
      default:
        return false;
    }
  }

  performCleanup(): void {
    const config = this.getConfig();
    
    // Limpar dados antigos
    const keysToRemove: string[] = [];
    
    for (let key in localStorage) {
      if (key.startsWith('easypet_offline_') || key.startsWith('easypet_draft_')) {
        try {
          const data = JSON.parse(localStorage[key]);
          // Remover dados com mais de 30 dias
          if (data.timestamp && Date.now() - data.timestamp > 30 * 24 * 60 * 60 * 1000) {
            keysToRemove.push(key);
          }
        } catch (e) {
          // Ignorar erros de parse
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Atualizar última limpeza
    this.updateConfig({ lastCleanup: Date.now() });
    
    console.log(`🧹 Limpeza de cache concluída. ${keysToRemove.length} itens removidos.`);
  }

  clearAllCache(): void {
    const keysToRemove: string[] = [];
    
    for (let key in localStorage) {
      if (key.startsWith('easypet_offline_') || 
          key.startsWith('easypet_draft_') ||
          key.startsWith('easypet_cache_')) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Cache completo limpo. ${keysToRemove.length} itens removidos.`);
  }

  addCacheablePage(page: string): void {
    const config = this.getConfig();
    if (!config.enabledPages.includes(page)) {
      config.enabledPages.push(page);
      this.updateConfig({ enabledPages: config.enabledPages });
    }
  }

  removeCacheablePage(page: string): void {
    const config = this.getConfig();
    const updated = config.enabledPages.filter(p => p !== page);
    this.updateConfig({ enabledPages: updated });
  }
}

export const cacheConfigManager = new CacheConfigManager();
