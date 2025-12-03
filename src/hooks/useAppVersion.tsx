import { useEffect } from 'react';
import { useToast } from './use-toast';

// Versão da aplicação - incrementar quando houver mudanças que requerem limpeza de cache
const APP_VERSION = '5.0.0';
const VERSION_KEY = 'easypet_app_version';
const LAST_CLEAR_KEY = 'easypet_last_clear';
const AUTH_TOKEN_KEY = 'sb-zxdbsimthnfprrthszoh-auth-token';

export const useAppVersion = () => {
  const { toast } = useToast();

  useEffect(() => {
    const currentVersion = localStorage.getItem(VERSION_KEY);
    const lastClear = localStorage.getItem(LAST_CLEAR_KEY);
    const now = Date.now();

    // Se não há versão armazenada ou versão mudou
    if (!currentVersion || currentVersion !== APP_VERSION) {
      console.log('Nova versão detectada, limpando caches antigos...');
      clearOutdatedData();
      localStorage.setItem(VERSION_KEY, APP_VERSION);
      localStorage.setItem(LAST_CLEAR_KEY, now.toString());
      
      // Limpar service worker caches
      if ('serviceWorker' in navigator && 'caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            if (!cacheName.includes(APP_VERSION)) {
              caches.delete(cacheName);
            }
          });
        });
      }

      // Notificar usuário
      toast({
        title: "Sistema atualizado",
        description: "Cache limpo automaticamente para melhor desempenho.",
      });

      // Atualizar service worker se disponível
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.update();
          });
        });
      }
    }

    // Limpeza automática periódica (a cada 7 dias)
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    if (lastClear && now - parseInt(lastClear) > sevenDaysInMs) {
      console.log('Limpeza periódica de cache (7 dias)...');
      clearTemporaryData();
      localStorage.setItem(LAST_CLEAR_KEY, now.toString());
    }

    // Validar integridade dos dados armazenados
    validateStoredData();
  }, [toast]);
};

// Limpa dados desatualizados quando versão muda
const clearOutdatedData = () => {
  const keysToPreserve = [
    VERSION_KEY,
    LAST_CLEAR_KEY,
    'easypet_remember_me',
    'easypet_saved_email',
    'theme',
    'supabase.auth.token',
    AUTH_TOKEN_KEY
  ];

  const allKeys = Object.keys(localStorage);
  
  allKeys.forEach((key) => {
    // Preservar apenas chaves essenciais
    if (!keysToPreserve.some(preserved => key.includes(preserved))) {
      localStorage.removeItem(key);
    }
  });

  // Limpar todos os session storage
  sessionStorage.clear();
};

// Limpa apenas dados temporários
const clearTemporaryData = () => {
  const keysToRemove = [
    'easypet_session_temporary',
    'react-query',
    'onboarding_',
    'tour_'
  ];

  Object.keys(localStorage).forEach((key) => {
    if (keysToRemove.some(pattern => key.includes(pattern))) {
      localStorage.removeItem(key);
    }
  });

  // Limpar query cache do React Query
  if (window.location.pathname !== '/auth') {
    sessionStorage.clear();
  }
};

// Valida e corrige dados corrompidos
const validateStoredData = () => {
  try {
    // Validar token do Supabase
    const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (authToken) {
      try {
        JSON.parse(authToken);
      } catch {
        console.warn('Token corrompido detectado, removendo...');
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem('supabase.auth.token');
      }
    }

    // Validar dados do React Query
    Object.keys(localStorage).forEach((key) => {
      if (key.includes('react-query')) {
        try {
          JSON.parse(localStorage.getItem(key) || '');
        } catch {
          console.warn(`Dados corrompidos em ${key}, removendo...`);
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Erro ao validar dados armazenados:', error);
  }
};
