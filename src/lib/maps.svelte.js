// Google Maps JavaScript API laden: lui (pas als een kaart of Street View in beeld
// komt) en alleen online. Er wordt niets van Google opgeslagen in de cache van de
// app; de service worker laat alle Google-verzoeken ongemoeid.
//
// Gebruikte onderdelen en waarom:
//  - maps + marker:  interactieve kaart met genummerde pins (Dynamic Maps)
//  - streetView:     StreetViewService (gratis metadata-check: is er beeld?) en
//                    StreetViewPanorama (pas na een tik, per stop)
//  - routes:         looproute langs de stops. Lukt dat niet, dan tekenen we
//                    een gestippelde lijn tussen de stops (geen extra kosten).

const KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
export const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID || 'DEMO_MAP_ID';

export const maps = $state({
  geconfigureerd: !!KEY,
  sleutelFout: false
});

let belofte = null;

export function laadMaps() {
  if (!KEY) return Promise.reject(new Error('geen-sleutel'));
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google.maps);
  if (belofte) return belofte;

  belofte = new Promise((resolve, reject) => {
    window.gm_authFailure = () => {
      maps.sleutelFout = true; // Google roept dit aan bij een ongeldige/beperkte sleutel
    };
    window.__romeMapsKlaar = () => resolve(window.google.maps);
    const s = document.createElement('script');
    const q = new URLSearchParams({
      key: KEY,
      v: 'weekly',
      loading: 'async',
      language: 'nl',
      region: 'IT',
      callback: '__romeMapsKlaar'
    });
    s.src = `https://maps.googleapis.com/maps/api/js?${q}`;
    s.async = true;
    s.onerror = () => {
      belofte = null; // opnieuw proberen zodra er weer verbinding is
      s.remove();
      reject(new Error('laden-mislukt'));
    };
    document.head.appendChild(s);
  });
  return belofte;
}

/** Kleurschema van de kaart laten meebewegen met de donkere modus van het toestel. */
export function kleurSchema(gm) {
  return gm.ColorScheme ? gm.ColorScheme.FOLLOW_SYSTEM : undefined;
}
