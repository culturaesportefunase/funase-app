// Nome do cache
const CACHE_NAME = 'funase-app-final-v1.0';

// Arquivos para cache inicial
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/button-fix.css',
  '/mobile-fix.css',
  '/script.js',
  '/convites-fix.js',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/apple-icon-152x152.png',
  '/icons/apple-icon-180x180.png'
];

// Evento de instalação do Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  
  // Pré-cache de recursos estáticos
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pré-cacheando arquivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Instalação concluída');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Erro durante a instalação:', error);
      })
  );
});

// Evento de ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Ativando...');
  
  // Limpar caches antigos
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Ativação concluída');
        return self.clients.claim();
      })
  );
});

// Evento de fetch (interceptação de requisições)
self.addEventListener('fetch', event => {
  console.log('[Service Worker] Fetch:', event.request.url);
  
  // Estratégia Cache First, Network Fallback
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Retorna o recurso do cache se estiver disponível
        if (cachedResponse) {
          console.log('[Service Worker] Retornando do cache:', event.request.url);
          return cachedResponse;
        }
        
        // Se não estiver no cache, busca na rede
        console.log('[Service Worker] Buscando na rede:', event.request.url);
        return fetch(event.request)
          .then(response => {
            // Verifica se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clona a resposta para poder armazená-la no cache
            const responseToCache = response.clone();
            
            // Armazena a resposta no cache para uso futuro
            caches.open(CACHE_NAME)
              .then(cache => {
                console.log('[Service Worker] Cacheando novo recurso:', event.request.url);
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Erro ao buscar recurso:', error);
            // Implementar fallback para páginas offline
            if (event.request.url.indexOf('.html') > -1) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Evento de sincronização em segundo plano
self.addEventListener('sync', event => {
  console.log('[Service Worker] Sincronização em segundo plano:', event.tag);
  
  if (event.tag === 'sync-activities') {
    event.waitUntil(syncActivities());
  } else if (event.tag === 'sync-inscricoes') {
    event.waitUntil(syncInscricoes());
  }
});

// Função para sincronizar atividades
function syncActivities() {
  console.log('[Service Worker] Sincronizando atividades...');
  // Implementação futura quando tivermos um backend
  return Promise.resolve();
}

// Função para sincronizar inscrições
function syncInscricoes() {
  console.log('[Service Worker] Sincronizando inscrições...');
  // Implementação futura quando tivermos um backend
  return Promise.resolve();
}

// Evento de notificação push
self.addEventListener('push', event => {
  console.log('[Service Worker] Notificação push recebida');
  
  let data = {
    title: 'FUNASE',
    content: 'Você tem uma nova notificação',
    openUrl: '/'
  };
  
  if (event.data) {
    try {
      data = JSON.parse(event.data.text());
    } catch (e) {
      console.error('[Service Worker] Erro ao processar dados da notificação:', e);
    }
  }
  
  const options = {
    body: data.content,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.openUrl
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalhes',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Evento de clique em notificação
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Clique em notificação:', event.action);
  
  const notification = event.notification;
  const action = event.action;
  
  if (action === 'close') {
    notification.close();
    return;
  }
  
  const url = notification.data.url || '/';
  notification.close();
  
  // Abre a URL quando o usuário clica na notificação
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(windowClients => {
        // Verifica se já há uma janela aberta
        for (let client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Se não houver janela aberta, abre uma nova
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Evento de fechamento de notificação
self.addEventListener('notificationclose', event => {
  console.log('[Service Worker] Notificação fechada');
});

