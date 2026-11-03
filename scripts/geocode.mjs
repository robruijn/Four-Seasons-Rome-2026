// `npm run geocode` – haalt coördinaten op met de Google Geocoding API.
//
//   GOOGLE_GEOCODING_KEY=... npm run geocode          alleen ontbrekende / handmatige coördinaten
//   GOOGLE_GEOCODING_KEY=... npm run geocode -- --alles   alles opnieuw
//
// Gebruik een aparte serversleutel (niet de browsersleutel), beperkt tot de Geocoding API.
// Het script past alleen de regels "lat/lng/geo_bron" van programma.json aan en laat de
// rest van het bestand (en de opmaak) ongemoeid. Bij twijfel (meerdere resultaten,
// gedeeltelijke match of alleen een benadering) komt er een waarschuwing in het bestand
// (geo_waarschuwing) en in de beheerlijst.
//
// Let op (voorwaarden Google): opgeslagen coördinaten zijn bedoeld voor tijdelijk gebruik;
// voor een reis van een paar dagen is dat ruim voldoende. Draai het script vlak voor vertrek.

import { readFileSync, writeFileSync } from 'node:fs';

const KEY = process.env.GOOGLE_GEOCODING_KEY;
if (!KEY) {
  console.error('Zet eerst GOOGLE_GEOCODING_KEY (zie README, hoofdstuk Google Maps).');
  process.exit(1);
}
const alles = process.argv.includes('--alles');
const pad = new URL('../public/programma.json', import.meta.url);
let tekst = readFileSync(pad, 'utf8');
const data = JSON.parse(tekst);
const vandaag = new Date().toISOString().slice(0, 10);

const zuiverAdres = (a) => a.split(' / ')[0]; // "Via Piemonte 125 / Via Sardegna 135" → eerste adres

for (const [id, l] of Object.entries(data.locaties)) {
  const nodig = alles || l.lat == null || /handmatig|verifi/i.test(l.geo_bron ?? '');
  if (!nodig) continue;
  const q = new URLSearchParams({ address: `${l.naam}, ${zuiverAdres(l.adres)}, Italia`, region: 'it', language: 'it', key: KEY });
  const r = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${q}`).then((x) => x.json());
  if (r.status !== 'OK' || !r.results.length) {
    console.warn(`✖ ${id}: geen resultaat (${r.status}${r.error_message ? ': ' + r.error_message : ''})`);
    continue;
  }
  const best = r.results[0];
  const { lat, lng } = best.geometry.location;
  const twijfel = [];
  if (r.results.length > 1) twijfel.push(`${r.results.length} mogelijke resultaten`);
  if (best.partial_match) twijfel.push('gedeeltelijke match');
  if (best.geometry.location_type === 'APPROXIMATE') twijfel.push('alleen benadering');
  const waarschuwing = twijfel.length ? `${twijfel.join(', ')}: "${best.formatted_address}" – controleren` : null;

  // Vervang alleen het eigen lat/lng-stuk van deze locatie (opmaak blijft behouden).
  const start = tekst.indexOf(`"${id}": {`);
  const eind = tekst.indexOf('\n    }', start);
  let blok = tekst.slice(start, eind);
  const nieuw = `"lat": ${lat.toFixed(6)}, "lng": ${lng.toFixed(6)}, "geo_bron": "Google Geocoding ${vandaag}"` +
    (waarschuwing ? `, "geo_waarschuwing": ${JSON.stringify(waarschuwing)}` : '');
  blok = blok.replace(/"lat":\s*[^,]+,\s*"lng":\s*[^,\n]+(,\s*"geo_bron":\s*"[^"]*")?(,\s*"geo_waarschuwing":\s*"[^"]*")?/, nieuw);
  tekst = tekst.slice(0, start) + blok + tekst.slice(eind);
  console.log(`${waarschuwing ? '!' : '✓'} ${id}: ${lat.toFixed(5)}, ${lng.toFixed(5)}${waarschuwing ? '  ← ' + waarschuwing : ''}`);
}

JSON.parse(tekst); // veiligheidscheck
writeFileSync(pad, tekst);
console.log('\nKlaar. Controleer de wijzigingen (git diff) en draai daarna npm run check.');
