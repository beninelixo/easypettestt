interface OfflineSession {
  startTime: number;
  endTime?: number;
  pagesVisited: string[];
  duration?: number;
}

interface OfflineAnalytics {
  totalSessions: number;
  totalDuration: number;
  pageViews: Record<string, number>;
  lastUpdated: number;
  monthlyReports: MonthlyReport[];
}

interface MonthlyReport {
  month: string;
  totalSessions: number;
  totalDuration: number;
  mostVisitedPages: Array<{ page: string; count: number }>;
  averageSessionDuration: number;
}

const ANALYTICS_KEY = 'easypet_offline_analytics';
const CURRENT_SESSION_KEY = 'easypet_offline_session';

class OfflineAnalyticsManager {
  private currentSession: OfflineSession | null = null;

  // Iniciar sessão offline
  startOfflineSession(): void {
    if (!this.currentSession) {
      this.currentSession = {
        startTime: Date.now(),
        pagesVisited: [window.location.pathname],
      };
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(this.currentSession));
      console.log('📊 Sessão offline iniciada');
    }
  }

  // Finalizar sessão offline
  endOfflineSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
      
      this.saveSessionToAnalytics(this.currentSession);
      
      localStorage.removeItem(CURRENT_SESSION_KEY);
      this.currentSession = null;
      console.log('📊 Sessão offline finalizada');
    }
  }

  // Registrar visita à página
  trackPageView(page: string): void {
    // Se online, não rastrear
    if (navigator.onLine) return;

    // Garantir que temos sessão ativa
    if (!this.currentSession) {
      this.startOfflineSession();
    }

    if (this.currentSession && !this.currentSession.pagesVisited.includes(page)) {
      this.currentSession.pagesVisited.push(page);
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(this.currentSession));
      console.log('📊 Página visitada offline:', page);
    }
  }

  private saveSessionToAnalytics(session: OfflineSession): void {
    const analytics = this.getAnalytics();
    
    analytics.totalSessions++;
    analytics.totalDuration += session.duration || 0;
    analytics.lastUpdated = Date.now();

    // Atualizar contagem de páginas
    session.pagesVisited.forEach(page => {
      analytics.pageViews[page] = (analytics.pageViews[page] || 0) + 1;
    });

    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  }

  getAnalytics(): OfflineAnalytics {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    return stored ? JSON.parse(stored) : {
      totalSessions: 0,
      totalDuration: 0,
      pageViews: {},
      lastUpdated: Date.now(),
      monthlyReports: [],
    };
  }

  // Gerar relatório mensal
  generateMonthlyReport(): MonthlyReport {
    const analytics = this.getAnalytics();
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const mostVisitedPages = Object.entries(analytics.pageViews)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const report: MonthlyReport = {
      month: monthKey,
      totalSessions: analytics.totalSessions,
      totalDuration: analytics.totalDuration,
      mostVisitedPages,
      averageSessionDuration: analytics.totalSessions > 0 
        ? analytics.totalDuration / analytics.totalSessions 
        : 0,
    };

    // Adicionar ao histórico
    analytics.monthlyReports.push(report);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));

    return report;
  }

  // Obter páginas mais acessadas
  getMostVisitedPages(limit: number = 10): Array<{ page: string; count: number }> {
    const analytics = this.getAnalytics();
    return Object.entries(analytics.pageViews)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Obter taxa de uso offline
  getOfflineUsageRate(): number {
    const analytics = this.getAnalytics();
    if (analytics.totalSessions === 0) return 0;
    
    // Calcular baseado em total de visitas vs visitas offline
    const totalVisits = parseInt(localStorage.getItem('easypet_total_visits') || '0');
    return totalVisits > 0 ? (analytics.totalSessions / totalVisits) * 100 : 0;
  }

  // Tempo médio de recuperação de cache (simulado)
  getAverageCacheRecoveryTime(): number {
    // Simular tempo baseado em tamanho do cache
    const cacheSize = this.estimateCacheSize();
    return Math.min(cacheSize / 1000, 5000); // Max 5 segundos
  }

  private estimateCacheSize(): number {
    let totalSize = 0;
    for (let key in localStorage) {
      if (key.startsWith('easypet_')) {
        totalSize += (localStorage[key]?.length || 0) * 2; // UTF-16 = 2 bytes per char
      }
    }
    return totalSize;
  }

  // Resetar analytics
  resetAnalytics(): void {
    localStorage.removeItem(ANALYTICS_KEY);
    localStorage.removeItem(CURRENT_SESSION_KEY);
    console.log('🔄 Analytics offline resetados');
  }
}

export const offlineAnalytics = new OfflineAnalyticsManager();
