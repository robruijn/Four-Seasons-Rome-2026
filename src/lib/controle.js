// Controle van programma.json. Gedeeld door de app (verborgen pagina #/beheer) en
// het bouwscript (`npm run check`). Geen afhankelijkheden, werkt in browser en Node.
//
// Niveaus:
//   fout          kapotte verwijzing of ongeldige tijd: de build stopt
//   bevestigen    gegeven dat nog niet geverifieerd is (TE_BEVESTIGEN, adres_status, ...)
//   let_op        mogelijke inconsistentie in het programma (overlap, tegenstrijdige noot)

const TIJD = /^([01]\d|2[0-4]):[0-5]\d$/;
const ONBEVESTIGD = /TE_BEVESTIGEN|TE_BEPALEN|verifi[eë]ren|controleren/i;

const min = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export function controleer(data) {
  const uit = [];
  const add = (niveau, waar, tekst) => uit.push({ niveau, waar, tekst });
  const L = data.locaties ?? {};
  const R = data.routes ?? {};

  // Meta
  for (const [k, v] of Object.entries(data.meta ?? {})) {
    if (typeof v === 'string' && ONBEVESTIGD.test(v)) add('bevestigen', `meta.${k}`, v);
  }
  for (const r of data.meta?.reisleiders ?? []) {
    if (!r.telefoon || ONBEVESTIGD.test(r.telefoon)) add('bevestigen', `meta.reisleiders.${r.naam}`, 'telefoonnummer ontbreekt');
  }

  // Locaties
  for (const [id, l] of Object.entries(L)) {
    const w = `locaties.${id}`;
    if (!l.naam) add('fout', w, 'naam ontbreekt');
    if (!l.adres) add('fout', w, 'adres ontbreekt');
    if (l.lat == null || l.lng == null) add('bevestigen', w, 'coördinaten ontbreken (npm run geocode)');
    else if (l.geo_bron && /handmatig|verifi/i.test(l.geo_bron)) add('bevestigen', w, `coördinaten: ${l.geo_bron}`);
    if (l.geo_waarschuwing) add('bevestigen', w, `geocoding: ${l.geo_waarschuwing}`);
    if (l.adres_status) add('bevestigen', w, `adres "${l.adres}": ${l.adres_status}`);
    if (l.telefoon_status) add('bevestigen', w, `telefoon: ${l.telefoon_status}`);
    if (l.telefoon_opmerking) add('bevestigen', w, `telefoon: ${l.telefoon_opmerking}`);
  }

  // Dagen en blokken
  for (const dag of data.dagen ?? []) {
    const bl = dag.blokken ?? [];
    for (const b of bl) {
      const w = `${dag.label} ${b.van ?? '?'} ${b.titel ?? b.id}`;
      if (!TIJD.test(b.van ?? '') || !TIJD.test(b.tot ?? '')) {
        add('fout', w, `ongeldige tijd (${b.van}-${b.tot}); gebruik UU:MM`);
        continue;
      }
      if (min(b.tot) < min(b.van)) add('let_op', w, 'eindtijd ligt voor de begintijd');
      for (const ref of ['locatie', 'van_loc', 'naar_loc']) {
        if (b[ref] && !L[b[ref]]) add('fout', w, `${ref} "${b[ref]}" bestaat niet in locaties`);
      }
      for (const id of b.locaties ?? []) if (!L[id]) add('fout', w, `locatie "${id}" bestaat niet`);
      if (b.route && !R[b.route]) add('fout', w, `route "${b.route}" bestaat niet`);
      if (b.status) add('bevestigen', w, `status ${b.status}`);
      if (b.locatie === null && !b.route) add('bevestigen', w, 'locatie nog onbekend');
      if (b.vervoer === 'taxi' && /te voet/i.test(b.noot ?? '')) add('let_op', w, 'vervoer is taxi, maar de noot noemt te voet');
    }
    // Overlap binnen een dag (alleen melden, kan bewust zijn)
    for (let i = 1; i < bl.length; i++) {
      const a = bl[i - 1], b = bl[i];
      if (TIJD.test(a.tot ?? '') && TIJD.test(b.van ?? '') && min(b.van) < min(a.tot)) {
        add('let_op', `${dag.label}`, `"${a.titel}" (${a.van}-${a.tot}) overlapt met "${b.titel}" (${b.van}-${b.tot})`);
      }
    }
  }

  // Routes
  for (const [id, r] of Object.entries(R)) {
    const w = `routes.${id}`;
    for (const ref of [r.van, ...(r.tussen ?? []), r.naar]) {
      if (ref && !L[ref]) {
        if (ONBEVESTIGD.test(ref)) add('bevestigen', w, `vertrekpunt/stop: ${ref}`);
        else add('fout', w, `stop "${ref}" bestaat niet`);
      }
    }
    for (const s of r.streetview_stops ?? []) if (!L[s]) add('fout', w, `streetview-stop "${s}" bestaat niet`);
    if (!(r.streetview_stops ?? []).length) add('let_op', w, 'geen streetview_stops; de app gebruikt de bekende routepunten');
  }

  // Praktisch
  for (const k of ['apotheek', 'ziekenhuis']) {
    const p = data.praktisch?.[k];
    if (p?.status) add('bevestigen', `praktisch.${k}`, `${p.naam}: ${p.status}`);
  }
  if (data.praktisch?.hotel && !L[data.praktisch.hotel]) add('fout', 'praktisch.hotel', 'verwijst naar onbekende locatie');

  return uit;
}
