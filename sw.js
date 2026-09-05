/* ══════════════════════════════════════════════════════════════
   SERVICE WORKER — Calculadora IVA F29

   · App shell (HTML, iconos, manifest) → la app abre sin conexión.
   · Librerías CDN (XLSX, SDK de Firebase) → stale-while-revalidate.
   · Firestore / Firebase Auth → NUNCA se cachean: el SDK tiene su
     propia persistencia offline (IndexedDB). Interceptarlo aquí
     rompería la sincronización y el login.
   ══════════════════════════════════════════════════════════════ */

const VERSION   = 'v1.5.0';
const CACHE_APP = 'iva-app-' + VERSION;
const CACHE_CDN = 'iva-cdn-' + VERSION;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './offline.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// Dominios que siempre van directo a la red.
const NO_CACHE = [
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'www.googleapis.com',
  'accounts.google.com',
  'apis.google.com',
  'calculadoraiva-83a7f.firebaseapp.com',
  'mindicador.cl',
  'www.sii.cl',
  'api.allorigins.win',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_APP)
      .then(c => c.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Fallo al cachear el app shell:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_APP && k !== CACHE_CDN).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (NO_CACHE.some(d => url.hostname.includes(d))) return;

  // Abrir la app: red primero (para ver la versión nueva), caché de respaldo.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(resp => {
          const copia = resp.clone();
          caches.open(CACHE_APP).then(c => c.put('./index.html', copia));
          return resp;
        })
        .catch(async () => (await caches.match('./index.html')) || caches.match('./offline.html'))
    );
    return;
  }

  // CDN: caché al instante, refresco por detrás.
  if (url.origin !== self.location.origin) {
    event.respondWith(
      caches.open(CACHE_CDN).then(async cache => {
        const cached = await cache.match(req);
        const red = fetch(req)
          .then(resp => { if (resp && resp.status === 200) cache.put(req, resp.clone()); return resp; })
          .catch(() => cached);
        return cached || red;
      })
    );
    return;
  }

  // Recursos propios: caché primero.
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      if (resp && resp.status === 200 && resp.type === 'basic') {
        const copia = resp.clone();
        caches.open(CACHE_APP).then(c => c.put(req, copia));
      }
      return resp;
    }))
  );
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
