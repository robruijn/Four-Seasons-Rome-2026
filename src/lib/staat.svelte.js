// Gedeelde app-status: online/offline, routering via de URL-hash en een tikkende klok.
//
// Keuze: hash-routering (#/blok/v5). Werkt zonder serverconfiguratie op elke
// statische host (GitHub Pages, Netlify) en in elke submap.

import { nu } from './tijd.js';

export const net = $state({ online: typeof navigator === 'undefined' ? true : navigator.onLine });
if (typeof window !== 'undefined') {
  addEventListener('online', () => (net.online = true));
  addEventListener('offline', () => (net.online = false));
}

export const klok = $state({ nu: nu() });
setInterval(() => (klok.nu = nu()), 15000);
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) klok.nu = nu();
  });
}

function leesPad() {
  return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
}

export const route = $state({ pad: leesPad(), nieuw: true });
const scrollPos = new Map();
let vorigeHash = location.hash;

addEventListener('hashchange', () => {
  scrollPos.set(vorigeHash, scrollY);
  vorigeHash = location.hash;
  route.pad = leesPad();
  const terug = scrollPos.get(location.hash);
  route.nieuw = terug == null;
  // Na het renderen: terug naar de oude scrollpositie, of naar boven bij een nieuwe pagina.
  requestAnimationFrame(() => {
    scrollTo({ top: terug ?? 0, behavior: 'instant' });
    if (terug == null) document.querySelector('main h1')?.focus({ preventScroll: true });
  });
});

export function ga(pad) {
  location.hash = '#/' + pad;
}
