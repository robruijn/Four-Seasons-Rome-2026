// Service worker en installatie.
// Keuze: 'prompt' in plaats van automatisch verversen. Een nieuwe versie van het
// programma verschijnt als rustige balk ("Vernieuwen"), zodat niemand midden in het
// lezen een pagina ziet verspringen.

import { registerSW } from 'virtual:pwa-register';

export const pwa = $state({
  nieuweVersie: false,
  offlineKlaar: false,
  installPrompt: null,
  geinstalleerd:
    typeof matchMedia !== 'undefined' &&
    (matchMedia('(display-mode: standalone)').matches || navigator.standalone === true)
});

let update = null;

export function startPwa() {
  update = registerSW({
    onNeedRefresh() {
      pwa.nieuweVersie = true;
    },
    onOfflineReady() {
      pwa.offlineKlaar = true;
      setTimeout(() => (pwa.offlineKlaar = false), 6000);
    },
    onRegisteredSW(_url, reg) {
      // Eens per uur kijken of er een nieuwe versie van het programma is.
      if (reg) setInterval(() => navigator.onLine && reg.update().catch(() => {}), 3600e3);
    }
  });

  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    pwa.installPrompt = e;
  });
  addEventListener('appinstalled', () => {
    pwa.geinstalleerd = true;
    pwa.installPrompt = null;
  });
}

export function vernieuw() {
  update?.(true);
}

export async function installeer() {
  const p = pwa.installPrompt;
  if (!p) return;
  p.prompt();
  await p.userChoice.catch(() => {});
  pwa.installPrompt = null;
}

export const platform = (() => {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'anders';
})();
