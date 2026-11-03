// Weerbericht via Open-Meteo (gratis, geen sleutel, geen cookies). Alleen online;
// het laatst opgehaalde bericht bewaren we lokaal zodat het offline nog zichtbaar is,
// met de tijd van ophalen erbij.

import { net } from './staat.svelte.js';
import { nu, wandklok } from './tijd.js';

const SLEUTEL = 'rome-weer-v1';

export const weer = $state({ dagen: {}, opgehaald: null, status: 'leeg' });

try {
  const oud = JSON.parse(localStorage.getItem(SLEUTEL) ?? 'null');
  if (oud?.dagen) Object.assign(weer, oud, { status: 'oud' });
} catch {
  /* geen opslag beschikbaar */
}

const CODES = [
  [0, 'Zonnig', 'zon'], [1, 'Overwegend zonnig', 'zon'], [2, 'Half bewolkt', 'wolkzon'], [3, 'Bewolkt', 'wolk'],
  [45, 'Mist', 'wolk'], [48, 'Mist', 'wolk'], [51, 'Lichte motregen', 'regen'], [53, 'Motregen', 'regen'],
  [55, 'Motregen', 'regen'], [61, 'Lichte regen', 'regen'], [63, 'Regen', 'regen'], [65, 'Zware regen', 'regen'],
  [80, 'Buien', 'regen'], [81, 'Buien', 'regen'], [82, 'Zware buien', 'regen'], [95, 'Onweer', 'onweer'],
  [96, 'Onweer met hagel', 'onweer'], [99, 'Onweer met hagel', 'onweer']
];

export function weerTekst(code) {
  const hit = CODES.find(([c]) => c === code) ?? CODES.filter(([c]) => c <= code).pop();
  return hit ? { tekst: hit[1], icoon: hit[2] } : { tekst: 'Onbekend', icoon: 'wolk' };
}

let bezig = false;
export async function haalWeer(datums) {
  if (bezig || !net.online || !datums.length) return;
  if (weer.opgehaald && Date.now() - weer.opgehaald < 3 * 3600e3 && weer.status === 'vers') return;
  // Open-Meteo voorspelt ca. 16 dagen vooruit; eerder vragen geeft alleen een foutmelding.
  const dagenVooruit = (wandklok(datums[0], '00:00') - nu()) / 86400000;
  const dagenNa = (nu() - wandklok(datums[datums.length - 1], '23:59')) / 86400000;
  if (dagenVooruit > 15 || dagenNa > 0) {
    if (weer.status === 'leeg') weer.status = dagenNa > 0 ? 'voorbij' : 'te-vroeg';
    return;
  }
  bezig = true;
  try {
    const q = new URLSearchParams({
      latitude: '41.8984', longitude: '12.4951',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'Europe/Rome',
      start_date: datums[0], end_date: datums[datums.length - 1]
    });
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?${q}`);
    if (!r.ok) {
      // Meestal: de datums liggen nog te ver weg (verwachting gaat ca. 16 dagen vooruit).
      weer.status = weer.dagen && Object.keys(weer.dagen).length ? 'oud' : 'te-vroeg';
      return;
    }
    const j = await r.json();
    const dagen = {};
    j.daily.time.forEach((d, i) => {
      dagen[d] = {
        code: j.daily.weather_code[i],
        max: Math.round(j.daily.temperature_2m_max[i]),
        min: Math.round(j.daily.temperature_2m_min[i]),
        regen: j.daily.precipitation_probability_max?.[i]
      };
    });
    Object.assign(weer, { dagen, opgehaald: Date.now(), status: 'vers' });
    try {
      localStorage.setItem(SLEUTEL, JSON.stringify({ dagen, opgehaald: weer.opgehaald }));
    } catch {
      /* negeren */
    }
  } catch {
    if (weer.status === 'leeg') weer.status = 'fout';
  } finally {
    bezig = false;
  }
}
