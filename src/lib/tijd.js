// Tijdrekening in "Rome-wandkloktijd".
//
// Keuze: alle tijden uit programma.json zijn lokale tijden in Rome. In plaats van
// te rekenen met tijdzone-offsets zetten we zowel de bloktijden als "nu" om naar
// een getal dat de wandklok in Rome voorstelt (alsof het UTC is). Vergelijken en
// aftellen gaat dan altijd goed, ook als het toestel in een andere tijdzone staat.

const romeFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Rome',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hourCycle: 'h23'
});

/** Wandklok-tijd (ms) in Rome voor een echt tijdstip. */
export function romeWandklok(date = new Date()) {
  const p = Object.fromEntries(romeFmt.formatToParts(date).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
}

/** Wandklok-tijd voor datum "2026-11-13" en tijd "21:30" (ook "24:00"). */
export function wandklok(datum, hhmm) {
  const [y, m, d] = datum.split('-').map(Number);
  const [h, mi] = hhmm.split(':').map(Number);
  return Date.UTC(y, m - 1, d, h, mi); // Date.UTC rolt 24:00 netjes door naar de volgende dag
}

/**
 * Testhulp: ?nu=2026-11-14T10:05 in de adresbalk zet de app-klok op die Rome-tijd.
 * De klok loopt vanaf dat moment gewoon door. Handig voor de test en de demo.
 */
const params = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const nuParam = params.get('nu');
const startEcht = Date.now();
const startFake = nuParam && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(nuParam)
  ? wandklok(nuParam.slice(0, 10), nuParam.slice(11, 16))
  : null;

export const testklok = startFake !== null;

/** Huidige Rome-wandkloktijd (respecteert ?nu=). */
export function nu() {
  if (startFake !== null) return startFake + (Date.now() - startEcht);
  return romeWandklok();
}

/** "2026-11-14" voor een wandklokwaarde. */
export function datumVan(wk) {
  return new Date(wk).toISOString().slice(0, 10);
}

const dagFmt = new Intl.DateTimeFormat('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const datumFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function mooieDag(datum) {
  return dagFmt.format(new Date(datum + 'T12:00:00Z'));
}
export function mooieDatum(datum) {
  return datumFmt.format(new Date(datum + 'T12:00:00Z'));
}

/** Leesbare aftelling: "over 25 min", "over 2 u 10 min", "over 9 dagen". */
export function duurTekst(ms) {
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 1) return 'minder dan een minuut';
  if (min < 60) return `${min} min`;
  const u = Math.floor(min / 60);
  const r = min % 60;
  if (u < 24) return r ? `${u} u ${r} min` : `${u} uur`;
  const d = Math.round(min / 1440);
  return d === 1 ? '1 dag' : `${d} dagen`;
}

/** Schermlezervriendelijke tijdspanne. */
export function spanne(van, tot) {
  return `${van} tot ${tot}`;
}
