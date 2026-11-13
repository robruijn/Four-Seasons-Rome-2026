// Geografische hulpfuncties die volledig offline werken.

const R = 6371000;
const rad = (x) => (x * Math.PI) / 180;

/** Afstand in meters (hemelsbreed). */
export function afstand(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Kompasrichting in graden (0 = noord) van a naar b. */
export function richting(a, b) {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat));
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const WINDSTREKEN = ['noordelijke', 'noordoostelijke', 'oostelijke', 'zuidoostelijke', 'zuidelijke', 'zuidwestelijke', 'westelijke', 'noordwestelijke'];
export function windstreek(graden) {
  return WINDSTREKEN[Math.round(graden / 45) % 8];
}

// Schatting looproute: straten zijn niet recht, dus hemelsbreed x 1,35.
// Groepstempo: 4 km/u (rustiger dan een individuele wandelaar).
export const OMWEG = 1.35;
export const TEMPO_M_PER_MIN = 4000 / 60;

export function schatRoute(punten) {
  let m = 0;
  for (let i = 1; i < punten.length; i++) m += afstand(punten[i - 1], punten[i]) * OMWEG;
  return { meters: m, minuten: m / TEMPO_M_PER_MIN };
}

export function meterTekst(m) {
  if (m < 950) return `${Math.round(m / 50) * 50} m`;
  return `${(m / 1000).toLocaleString('nl-NL', { maximumFractionDigits: 1 })} km`;
}

export function minutenTekst(min) {
  const r = Math.max(1, Math.round(min / 5) * 5 || Math.round(min));
  return `${r} min`;
}

// ---- Google Maps-links (openen de app of website van Google Maps; geen API-sleutel nodig) ----
//
// Keuze: we geven Google een eenduidige Italiaanse zoekterm (veld "maps" in programma.json,
// bijv. "Casa Bleve, Via del Teatro Valle 48, 00186 Roma") en geen coördinaten. Dan opent
// Google de echte plek met naam, openingstijden en ingang, en staat er geen "41.89,12.47"
// als bestemming. Zonder "maps"-veld: naam + adres.

/** Zoekterm voor Google Maps. */
export function mapsTerm(loc) {
  return loc.maps || `${loc.naam}, ${loc.adres}`;
}

const MAPS = 'https://www.google.com/maps';
const q = (params) =>
  Object.entries(params)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

/** Route naar een locatie vanaf de huidige positie (te voet, tenzij de plek iets anders vraagt). */
export function mapsRouteNaar(loc, modus = 'walking') {
  return `${MAPS}/dir/?${q({ api: '1', destination: mapsTerm(loc), travelmode: loc.maps_vervoer || modus })}`;
}

/** Hele route met tussenstops (Google staat max. 9 tussenstops toe). */
export function mapsRoute(stops, modus = 'walking') {
  const s = stops.filter(Boolean);
  if (s.length < 2) return s[0] ? mapsRouteNaar(s[0], modus) : MAPS;
  return `${MAPS}/dir/?${q({
    api: '1',
    origin: mapsTerm(s[0]),
    destination: mapsTerm(s[s.length - 1]),
    waypoints: s.slice(1, -1).slice(0, 9).map(mapsTerm).join('|'),
    travelmode: modus
  })}`;
}

/** De plek zelf tonen (zonder route). */
export function mapsZoek(loc) {
  return `${MAPS}/search/?${q({ api: '1', query: mapsTerm(loc) })}`;
}

/** tel:-link zonder spaties. */
export function telLink(nr) {
  return 'tel:' + nr.replace(/[^\d+]/g, '');
}
