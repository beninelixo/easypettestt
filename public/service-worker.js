const CACHE_NAME = 'easypet-v3';
const RUNTIME_CACHE = 'easypet-runtime-v3';

// Assets críticos para cache imediato
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Timeout para requisições de rede (5 segundos)
const NETWORK_TIMEOUT = 5000;

// Instalação: cachear assets críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Ativação: limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => 
            cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
          )
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Network First com Cache Fallback e timeout
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip para requisições não-GET ou cross-origin de APIs
  if (request.method !== 'GET' || 
      (url.origin !== location.origin && !url.pathname.includes('/api/'))) {
    return;
  }

  event.respondWith(
    networkFirstWithTimeout(request)
      .catch(() => cacheOnly(request))
  );
});

// Network First com timeout
async function networkFirstWithTimeout(request) {
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
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Se falhar, tentar cache
    console.log('Network failed, trying cache:', request.url);
    throw error;
  }
}

// Fallback: apenas cache
async function cacheOnly(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('Serving from cache:', request.url);
    return cachedResponse;
  }
  
  // Se não houver cache, retornar resposta offline
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
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
