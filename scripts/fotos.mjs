// `npm run fotos` – zoekt per locatie vrij gelicentieerde foto's op Wikimedia Commons
// (met foto_zoekterm uit programma.json), downloadt ze, maakt WebP-versies van 400 en
// 800 px breed en schrijft public/fotos/fotos.json met maker, bron en licentie.
//
//   npm run fotos                 alleen locaties zonder foto's
//   npm run fotos -- --alles      alles opnieuw
//   npm run fotos -- colosseo     alleen deze locatie(s)
//
// Selectie:
//  - alleen CC0, Public Domain, CC BY en CC BY-SA (geen NC/ND, geen "fair use");
//  - alleen foto's (JPEG), minimaal 1600 px breed, liggend formaat;
//  - foto's met persoonlijkheidsrechten of merkrechten-waarschuwing worden overgeslagen;
//  - bestandsnamen met "selfie", "people", "logo" e.d. worden overgeslagen.
// Fijnregelen kan in scripts/fotos-keuze.json (uitsluiten of juist vastzetten per locatie).
// Bekijk het resultaat altijd even op de pagina Fotoverantwoording.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import sharp from 'sharp';

const UA = 'RomeGroepsreisApp/1.0 (https://github.com/robruijn/rdb.test; fotoselectie voor besloten reis-app)';
const API = 'https://commons.wikimedia.org/w/api.php';
const PER_LOCATIE = 3;

const root = new URL('../', import.meta.url);
const data = JSON.parse(readFileSync(new URL('public/programma.json', root), 'utf8'));
const indexPad = new URL('public/fotos/fotos.json', root);
const keuzePad = new URL('scripts/fotos-keuze.json', root);
mkdirSync(new URL('public/fotos/', root), { recursive: true });
const index = existsSync(indexPad) ? JSON.parse(readFileSync(indexPad, 'utf8')) : {};
const keuze = existsSync(keuzePad) ? JSON.parse(readFileSync(keuzePad, 'utf8')) : {};

const args = process.argv.slice(2);
const alles = args.includes('--alles');
const alleen = args.filter((a) => !a.startsWith('--'));

const LICENTIE_OK = /^(CC0|Public domain|PD|CC BY(-SA)? \d(\.\d)?( [a-z-]+)?)$/i;
const NAAM_NIET = /selfie|people|person|crowd|tourist|logo|map|plan|drawing|engraving|painting|coin|stamp|interior detail of ticket|night_?club/i;

const schoon = (html = '') => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const pauze = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const q = new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params });
  const r = await fetch(`${API}?${q}`, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`Commons API ${r.status}`);
  return r.json();
}

async function zoek(term) {
  const j = await api({
    action: 'query',
    generator: 'search',
    gsrsearch: `${term} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '30',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '1600'
  });
  const pages = (j.query?.pages ?? []).sort((a, b) => a.index - b.index);
  return pages.map((p) => ({ titel: p.title, ...p.imageinfo?.[0] })).filter((p) => p.url);
}

function geschikt(f, uitsluiten) {
  const m = f.extmetadata ?? {};
  const lic = m.LicenseShortName?.value ?? '';
  if (!LICENTIE_OK.test(lic)) return false;
  if (f.mime !== 'image/jpeg') return false;
  if (f.width < 1600 || f.width < f.height * 1.2) return false;
  if (NAAM_NIET.test(f.titel)) return false;
  if (/personality|trademark/i.test(m.Restrictions?.value ?? '')) return false;
  if (uitsluiten.includes(f.titel)) return false;
  return true;
}

async function bewaar(id, n, f) {
  const r = await fetch(f.thumburl ?? f.url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`download ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  const bestand = `${id}-${n}`;
  let meta;
  for (const w of [400, 800]) {
    // Bijsnijden naar 3:2, zodat de galerij rustig en gelijkmatig oogt.
    const out = await sharp(buf).resize(w, Math.round((w * 2) / 3), { fit: 'cover', position: 'attention' })
      .webp({ quality: w === 800 ? 70 : 65 })
      .toFile(new URL(`public/fotos/${bestand}-${w}.webp`, root).pathname);
    if (w === 800) meta = out;
  }
  const m = f.extmetadata ?? {};
  return {
    bestand,
    breedte: meta.width,
    hoogte: meta.height,
    titel: schoon(m.ObjectName?.value) || f.titel.replace(/^File:|\.\w+$/g, ''),
    alt: schoon(m.ImageDescription?.value).slice(0, 140) || null,
    maker: schoon(m.Artist?.value) || 'Onbekend',
    bron: 'Wikimedia Commons',
    bron_url: f.descriptionurl,
    licentie: m.LicenseShortName?.value,
    licentie_url: m.LicenseUrl?.value ?? null,
    bewerkt: true
  };
}

for (const [id, l] of Object.entries(data.locaties)) {
  if (!l.foto_zoekterm) continue;
  if (alleen.length && !alleen.includes(id)) continue;
  if (!alles && !alleen.length && index[id]?.length) continue;
  const k = keuze[id] ?? {};
  try {
    let kandidaten = (await zoek(k.zoekterm ?? l.foto_zoekterm)).filter((f) => geschikt(f, k.uitsluiten ?? []));
    // Vastgezette bestanden eerst.
    if (k.vast?.length) {
      const vast = [];
      for (const t of k.vast) {
        const j = await api({ action: 'query', titles: t, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1600' });
        const p = j.query?.pages?.[0];
        if (p?.imageinfo?.[0]) vast.push({ titel: p.title, ...p.imageinfo[0] });
      }
      kandidaten = [...vast, ...kandidaten.filter((f) => !k.vast.includes(f.titel))];
    }
    const gekozen = [];
    for (const f of kandidaten.slice(0, PER_LOCATIE + 2)) {
      if (gekozen.length >= PER_LOCATIE) break;
      try {
        gekozen.push(await bewaar(id, gekozen.length + 1, f));
        await pauze(300); // vriendelijk voor de servers van Wikimedia
      } catch (e) {
        console.warn(`  ! ${id}: ${f.titel} overgeslagen (${e.message})`);
      }
    }
    index[id] = gekozen;
    console.log(`${gekozen.length ? '✓' : '✖'} ${id}: ${gekozen.length} foto('s)${gekozen.map((g) => `\n    - ${g.titel} · ${g.maker} · ${g.licentie}`).join('')}`);
  } catch (e) {
    console.warn(`✖ ${id}: ${e.message}`);
  }
}

writeFileSync(indexPad, JSON.stringify(index, null, 2) + '\n');
console.log('\nKlaar: public/fotos/fotos.json bijgewerkt. Controleer de foto\'s via #/fotos in de app.');
