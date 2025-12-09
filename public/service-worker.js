// IMPORTANTE: Incrementar versão quando houver atualizações que requerem limpeza de cache
const APP_VERSION = '3.0.1';
const CACHE_NAME = `easypet-static-${APP_VERSION}`;
const RUNTIME_CACHE = `easypet-runtime-${APP_VERSION}`;

// Assets críticos para cache imediato (OFFLINE MODE)
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Páginas críticas para modo offline
const criticalPages = [
  '/client/dashboard',
  '/client/pets',
  '/client/appointments',
  '/client/profile',
  '/professional/dashboard',
  '/professional/calendar',
  '/professional/clients',
  '/professional/profile',
  '/admin/dashboard',
  '/diagnostics'
];

// Recursos estáticos para cache offline
const staticAssets = [
  '/easypet-logo.png',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png'
];

// Timeout para requisições de rede (5 segundos)
const NETWORK_TIMEOUT = 5000;

// Instalação: cachear assets críticos e páginas offline
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando e cacheando recursos críticos...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cacheando assets críticos');
        
        // Cachear URLs básicos
        return cache.addAll(urlsToCache)
          .then(() => {
            // Cachear assets estáticos
            return cache.addAll(staticAssets).catch((err) => {
              console.warn('Alguns assets estáticos falharam ao cachear:', err);
            });
          })
          .then(() => {
            console.log('Service Worker: Cache inicial completo');
            
            // Enviar progresso
            self.clients.matchAll().then((clients) => {
              clients.forEach((client) => {
                client.postMessage({
                  type: 'UPDATE_PROGRESS',
                  status: 'installing',
                  progress: 50
                });
              });
            });
          });
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação: limpar caches antigos automaticamente
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Limpando caches antigos...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Deletar qualquer cache que não seja da versão atual
            const isCurrentCache = cacheName === CACHE_NAME || cacheName === RUNTIME_CACHE;
            if (!isCurrentCache) {
              console.log('Service Worker: Deletando cache antigo:', cacheName);
            }
            return !isCurrentCache;
          })
          .map((cacheName) => caches.delete(cacheName))
      );
    })
    .then(() => {
      console.log('Service Worker: Caches antigos limpos, assumindo controle...');
      return self.clients.claim();
    })
    .then(() => {
      // Notificar todos os clientes sobre a atualização
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'CACHE_UPDATED',
            version: APP_VERSION
          });
        });
      });
    })
  );
});

// Estratégia Network First com Cache Fallback e modo offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip para requisições não-GET ou cross-origin de APIs
  if (request.method !== 'GET' || 
      (url.origin !== location.origin && !url.pathname.includes('/api/'))) {
    return;
  }

  // Verificar se é uma página crítica para offline
  const isCriticalPage = criticalPages.some(page => url.pathname.startsWith(page));

  event.respondWith(
    networkFirstWithTimeout(request, isCriticalPage)
      .catch(() => cacheOnly(request))
  );
});

// Network First com timeout e suporte offline
async function networkFirstWithTimeout(request, isCritical = false) {
  try {
    // Tentar buscar da rede com timeout
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
    );

    const response = await Promise.race([networkPromise, timeoutPromise]);
    
    // Se sucesso, cachear para uso futuro
    if (response && response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      
      // Se for página crítica, cachear no cache principal também
      if (isCritical) {
        const mainCache = await caches.open(CACHE_NAME);
        mainCache.put(request, response.clone());
      }
      
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Se falhar, tentar cache
    console.log('Network failed, trying cache:', request.url);
    throw error;
  }
}

// Fallback: apenas cache (modo offline)
async function cacheOnly(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('Serving from cache (offline mode):', request.url);
    return cachedResponse;
  }
  
  // Se não houver cache, retornar página offline customizada
  const url = new URL(request.url);
  
  // Se for HTML, retornar página offline HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    return new Response(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>EasyPet - Modo Offline</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
              padding: 20px;
            }
            .container {
              max-width: 500px;
            }
            h1 { font-size: 2.5rem; margin-bottom: 1rem; }
            p { font-size: 1.125rem; opacity: 0.9; margin-bottom: 2rem; }
            button {
              background: white;
              color: #667eea;
              border: none;
              padding: 12px 32px;
              font-size: 1rem;
              font-weight: 600;
              border-radius: 8px;
              cursor: pointer;
              transition: transform 0.2s;
            }
            button:hover { transform: scale(1.05); }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📡 Modo Offline</h1>
            <p>Você está sem conexão com a internet. Algumas funcionalidades podem estar limitadas.</p>
            <p>Páginas já visitadas ainda estão disponíveis no cache.</p>
            <button onclick="window.location.reload()">Tentar Novamente</button>
          </div>
        </body>
      </html>
    `, {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/html; charset=UTF-8',
      }),
    });
  }
  
  // Para outros recursos, retornar resposta simples
  return new Response('Offline - conteúdo não disponível', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/plain',
    }),
  });
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Forçando ativação imediata...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('Service Worker: Limpando todos os caches por requisição do cliente...');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('Service Worker: Deletando cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('Service Worker: Todos os caches limpos com sucesso');
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: APP_VERSION });
  }
});
