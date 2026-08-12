/**
 * ZENITH AI - SERVICE WORKER (OFFLINE CACHING & FAST PWA LOADS)
 */

const CACHE_NAME = 'zenith-ai-v4.2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/design-tokens.css',
  './css/layout.css',
  './css/components.css',
  './css/accessibility.css',
  './js/state.js',
  './js/ai-engine.js',
  './js/reality-events.js',
  './js/ask-zenith.js',
  './js/scenario-simulator.js',
  './js/personal-learning.js',
  './js/goal-intelligence.js',
  './js/tasks-habits.js',
  './js/focus-engine.js',
  './js/elderly-mode.js',
  './js/analytics-engine.js',
  './js/diet-planner.js',
  './js/screen-guardian.js',
  './js/audio-synth.js',
  './js/notification-engine.js',
  './js/custom-media.js',
  './js/voice-engine.js',
  './js/pip-timer.js',
  './js/heatmap-engine.js',
  './js/readiness-engine.js',
  './js/quests-engine.js',
  './js/qr-sync.js',
  './js/digital-twin.js',
  './js/memory-replay.js',
  './js/copilot-engine.js',
  './js/onboarding-engine.js',
  './js/calendar-export.js',
  './js/experience-engine.js',
  './js/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        // Offline fallback
        return caches.match('./index.html');
      });
    })
  );
});
