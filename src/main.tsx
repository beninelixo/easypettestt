import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App.tsx";
import "./index.css";
import { initWebVitalsTracking } from "./lib/vitals";
import { TenantProvider } from "@/lib/tenant-context";

// Inicializar tracking de Web Vitals
initWebVitalsTracking();

// Registrar Service Worker com atualização automática
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration.scope);

        // Verificar atualizações periodicamente (a cada 30 minutos)
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);

        // Atualizar quando detectar nova versão
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Nova versão disponível, preparando atualização...');
                
                // Notificar usuário sobre atualização disponível
                if (confirm('Uma nova versão está disponível. Recarregar para atualizar?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });

        // Lidar com controlador atualizado
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            console.log('Service Worker atualizado, recarregando página...');
            window.location.reload();
          }
        });
      })
      .catch((error) => {
        console.error('Erro ao registrar Service Worker:', error);
      });

    // Escutar mensagens do Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('Cache atualizado para versão:', event.data.version);
      }
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <TenantProvider>
        <App />
      </TenantProvider>
    </HelmetProvider>
  </StrictMode>
);
