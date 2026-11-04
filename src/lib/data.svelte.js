// Eén databron: programma.json (in /public). De app leest alleen dit bestand voor de
// inhoud, zodat de organisator tijden en teksten kan aanpassen zonder code.
// fotos/fotos.json is een gegenereerde index van de lokaal opgeslagen foto's
// (bronvermelding en licenties), gemaakt door `npm run fotos`.

import { wandklok } from './tijd.js';
import { schatRoute, afstand, OMWEG, TEMPO_M_PER_MIN, richting, windstreek, meterTekst, minutenTekst } from './geo.js';

export const app = $state({
  data: null,
  fotos: {},
  fout: null
});

export async function laadData() {
  try {
    const r = await fetch('./programma.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    app.data = await r.json();
  } catch (e) {
    app.fout = 'Het programma kon niet worden geladen. Controleer je verbinding en probeer het opnieuw.';
    return;
  }
  try {
    const f = await fetch('./fotos/fotos.json');
    if (f.ok) app.fotos = await f.json();
  } catch {
    /* geen foto's: de app toont nette placeholders */
  }
}

// ---------- Hulpfuncties ----------

const ONBEVESTIGD = /TE_BEVESTIGEN|TE_BEPALEN|verifi[eë]ren|controleren/i;

/** Is een waarde (nog) niet bevestigd? */
export function onbevestigd(waarde) {
  return typeof waarde === 'string' && ONBEVESTIGD.test(waarde);
}

export function loc(id) {
  if (!id || !app.data) return null;
  const l = app.data.locaties[id];
  return l ? { id, ...l } : null;
}

export function fotosVan(id) {
  return app.fotos?.[id] ?? [];
}

/** Alle blokken, plat, met dag en wandklok-tijden. */
export function alleBlokken() {
  if (!app.data) return [];
  const lijst = [];
  for (const dag of app.data.dagen) {
    for (const b of dag.blokken) {
      const start = wandklok(dag.datum, b.van);
      let eind = wandklok(dag.datum, b.tot);
      if (eind < start) eind += 86400000;
      lijst.push({ ...b, datum: dag.datum, dagLabel: dag.label, start, eind });
    }
  }
  return lijst;
}

export function blok(id) {
  return alleBlokken().find((b) => b.id === id) ?? null;
}

/** Vervoer: expliciet uit de data, of 'voet' bij een wandelroute. */
export function vervoerVan(b) {
  if (b.vervoer) return b.vervoer;
  if (b.route) return 'voet';
  return null;
}

export const VERVOER_LABEL = { voet: 'Te voet', walking: 'Te voet', taxi: 'Taxi', fiets: 'Fiets', bike: 'Fiets' };

export function statusLabel(status) {
  if (status === 'TE_BEPALEN') return 'Nog te bepalen';
  if (status === 'TIJD_TE_BEVESTIGEN') return 'Tijd nog te bevestigen';
  if (status && onbevestigd(status)) return 'Nog te bevestigen';
  return null;
}

/** Hoofdlocatie van een blok (voor detail en kaart). */
export function hoofdLocatie(b) {
  return loc(b.locatie) ?? loc(b.naar_loc) ?? null;
}

/** Alle locaties die bij een blok horen (voor de dagkaart). */
export function locatiesVanBlok(b) {
  const ids = new Set();
  if (b.locatie) ids.add(b.locatie);
  if (b.van_loc) ids.add(b.van_loc);
  if (b.naar_loc) ids.add(b.naar_loc);
  for (const id of b.locaties ?? []) ids.add(id);
  if (b.route) for (const s of routeStops(b.route)) if (s.loc) ids.add(s.loc.id);
  return [...ids].map(loc).filter(Boolean);
}

/** Stops van een route: van, tussen, naar. Onbekende 'van' wordt een open plek. */
export function routeStops(routeId) {
  const r = app.data?.routes?.[routeId];
  if (!r) return [];
  const ids = [r.van, ...(r.tussen ?? []), r.naar];
  return ids.map((id) => ({ id, loc: loc(id), open: !loc(id) ? id : null }));
}

/** Locaties voor Street View: streetview_stops, of anders de bekende routepunten. */
export function streetViewStops(routeId) {
  const r = app.data?.routes?.[routeId];
  if (!r) return [];
  const ids = r.streetview_stops?.length ? r.streetview_stops : routeStops(routeId).map((s) => s.loc?.id);
  return ids.map(loc).filter((l) => l && l.lat != null);
}

/** Afstand en looptijd: uit de data als die er is, anders een schatting. */
export function routeMaat(routeId) {
  const r = app.data?.routes?.[routeId];
  if (!r) return null;
  if (r.afstand_m && r.looptijd_min) return { meters: r.afstand_m, minuten: r.looptijd_min, schatting: false };
  const punten = routeStops(routeId).map((s) => s.loc).filter((l) => l && l.lat != null);
  if (punten.length < 2) return null;
  return { ...schatRoute(punten), schatting: true };
}

export function blokkenMetRoute(routeId) {
  return alleBlokken().filter((b) => b.route === routeId);
}

export function blokkenMetLocatie(locId) {
  return alleBlokken().filter((b) => b.locatie === locId || b.naar_loc === locId || (b.locaties ?? []).includes(locId));
}

export function aantalTaxis() {
  const p = app.data?.praktisch;
  if (p?.taxi_aantal) return p.taxi_aantal;
  const m = /(\d+)\s*taxi/i.exec(p?.taxi ?? '');
  return m ? +m[1] : null;
}

/** Groepsgrootte als leesbare tekst, met markering als die nog niet vaststaat. */
export function groepsgrootte() {
  const a = app.data?.meta?.aantal_personen;
  if (typeof a === 'number') return { tekst: `${a} personen`, zeker: true };
  const m = /\(([^)]+)\)/.exec(a ?? '');
  return { tekst: m ? `${m[1]} personen` : 'de groep', zeker: !onbevestigd(a) };
}

// ---------- Looptijd tussen opeenvolgende onderdelen ----------

function eindLocatie(b) {
  if (b.naar_loc) return loc(b.naar_loc);
  if (b.route) {
    const s = routeStops(b.route);
    return s[s.length - 1]?.loc ?? null;
  }
  return loc(b.locatie);
}

function startLocatie(b) {
  if (b.van_loc) return loc(b.van_loc);
  if (b.route) return routeStops(b.route)[0]?.loc ?? null;
  return loc(b.locatie);
}

/**
 * Looptijd (schatting) van het vorige naar het volgende onderdeel, als je daar zelf
 * naartoe gaat (dus niet als het volgende onderdeel zelf een taxirit of wandelroute is).
 */
export function looptijdTussen(a, b) {
  if (!a || !b || b.vervoer || b.route) return null;
  const van = eindLocatie(a), naar = startLocatie(b);
  if (!van || !naar || van.id === naar.id || van.lat == null || naar.lat == null) return null;
  const m = afstand(van, naar) * OMWEG;
  if (m < 100) return null;
  return { meters: m, minuten: m / TEMPO_M_PER_MIN, van, naar };
}

/** Tekstuele routebeschrijving uit de coördinaten (werkt offline). */
export function routeBeschrijving(routeId) {
  const stops = routeStops(routeId);
  const uit = [];
  const eerste = stops[0];
  if (eerste?.open) {
    uit.push(`Vertrekpunt: nog te bepalen (${eerste.open.replace(/^TE_BEPALEN\s*\(?|\)$/g, '') || 'volgt'}). De reisleider wijst de weg.`);
  } else if (eerste?.loc) {
    uit.push(`Start bij ${eerste.loc.naam} (${eerste.loc.adres}).`);
  }
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1].loc, b = stops[i].loc;
    if (!b) continue;
    if (!a || a.lat == null || b.lat == null) {
      uit.push(`Loop naar ${b.naam}, ${b.adres}.`);
      continue;
    }
    const m = afstand(a, b) * OMWEG;
    const laatste = i === stops.length - 1;
    uit.push(`Loop ca. ${meterTekst(m)} in ${windstreek(richting(a, b))} richting naar ${b.naam} (ca. ${minutenTekst(m / TEMPO_M_PER_MIN)})${laatste ? '. Hier eindigt de route.' : '.'}`);
  }
  return uit;
}
