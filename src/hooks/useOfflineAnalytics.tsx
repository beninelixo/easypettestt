import { useState, useEffect } from 'react';
import { offlineAnalytics } from '@/lib/offline-analytics';
import { useLocation } from 'react-router-dom';

export const useOfflineAnalytics = () => {
  const location = useLocation();
  const [analytics, setAnalytics] = useState(offlineAnalytics.getAnalytics());

  useEffect(() => {
    // Rastrear visualização de página quando offline
    if (!navigator.onLine) {
      offlineAnalytics.trackPageView(location.pathname);
    }

    // Iniciar sessão quando ficar offline
    const handleOffline = () => {
      offlineAnalytics.startOfflineSession();
    };

    // Finalizar sessão quando ficar online
    const handleOnline = () => {
      offlineAnalytics.endOfflineSession();
      setAnalytics(offlineAnalytics.getAnalytics());
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [location.pathname]);

  const generateMonthlyReport = () => {
    return offlineAnalytics.generateMonthlyReport();
  };

  const getMostVisitedPages = (limit: number = 10) => {
    return offlineAnalytics.getMostVisitedPages(limit);
  };

  const getOfflineUsageRate = () => {
    return offlineAnalytics.getOfflineUsageRate();
  };

  const getAverageCacheRecoveryTime = () => {
    return offlineAnalytics.getAverageCacheRecoveryTime();
  };

  const resetAnalytics = () => {
    offlineAnalytics.resetAnalytics();
    setAnalytics(offlineAnalytics.getAnalytics());
  };

  return {
    analytics,
    generateMonthlyReport,
    getMostVisitedPages,
    getOfflineUsageRate,
    getAverageCacheRecoveryTime,
    resetAnalytics,
  };
};
