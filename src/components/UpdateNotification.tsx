import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

export const UpdateNotification = () => {
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'downloading' | 'installing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Monitorar status online/offline
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Conexão restaurada');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
      console.log('Modo offline ativado');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitorar Service Worker para atualizações
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_PROGRESS') {
          setUpdateStatus(event.data.status);
          setProgress(event.data.progress || 0);
          setShowNotification(true);
        }

        if (event.data && event.data.type === 'CACHE_UPDATED') {
          setUpdateStatus('complete');
          setProgress(100);
          setShowNotification(true);
          
          setTimeout(() => {
            setShowNotification(false);
            setUpdateStatus('idle');
            setProgress(0);
          }, 3000);
        }
      });

      // Monitorar atualizações do Service Worker
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.addEventListener('updatefound', () => {
            setUpdateStatus('checking');
            setProgress(10);
            setShowNotification(true);

            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installing') {
                  setUpdateStatus('downloading');
                  setProgress(40);
                }
                if (newWorker.state === 'installed') {
                  setUpdateStatus('installing');
                  setProgress(70);
                }
                if (newWorker.state === 'activated') {
                  setUpdateStatus('complete');
                  setProgress(100);
                }
              });
            }
          });
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification && isOnline) return null;

  const getStatusMessage = () => {
    if (!isOnline) return 'Modo Offline - Funcionalidades limitadas disponíveis';
    
    switch (updateStatus) {
      case 'checking':
        return 'Verificando atualizações...';
      case 'downloading':
        return 'Baixando atualização...';
      case 'installing':
        return 'Sistema atualizando automaticamente...';
      case 'complete':
        return 'Atualização concluída com sucesso!';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-5 w-5 text-yellow-500 animate-pulse" />;
    if (updateStatus === 'complete') return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <RefreshCw className="h-5 w-5 text-primary animate-spin" />;
  };

  return (
    <div className="fixed bottom-20 right-6 z-[60] animate-fade-in">
      <Card className="w-80 p-4 shadow-2xl border-2 bg-background/95 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{getStatusIcon()}</div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">
                {getStatusMessage()}
              </p>
              
              {isOnline && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Wifi className="h-3 w-3 text-green-500" />
                  Online
                </span>
              )}
            </div>
            
            {updateStatus !== 'idle' && updateStatus !== 'complete' && isOnline && (
              <>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {progress}% concluído
                </p>
              </>
            )}

            {!isOnline && (
              <p className="text-xs text-muted-foreground">
                Você pode continuar navegando. Suas ações serão sincronizadas quando voltar online.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
