// `npm run html` – maakt docs/Reisgids-Rome-2026.html: de reisgids (#/gids) als één
// zelfstandig HTML-bestand ZONDER JavaScript, met foto's en lettertype ingebakken.
// Werkt dus ook in de voorvertoning van Mail/WhatsApp op iPhone en Android.
// Vereist Playwright + een draaiende preview (zie `npm run pdf`).
//   npm run html -- http://localhost:4173/
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const basis = process.argv[2] || 'http://localhost:4173/';
const uit = new URL('../docs/Reisgids-Rome-2026.html', import.meta.url).pathname;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(basis + '#/gids', { waitUntil: 'networkidle' });

const html = await page.evaluate(async () => {
  const naarData = async (url) => {
    const b = await (await fetch(url)).blob();
    return await new Promise((r) => {
      const f = new FileReader();
      f.onload = () => r(f.result);
      f.readAsDataURL(b);
    });
  };

  // CSS verzamelen; lettertype-bestanden inbakken (woff2), woff-terugval weglaten.
  // Lettertype-adressen zijn relatief ten opzichte van het stylesheet zelf.
  let css = '';
  for (const s of document.styleSheets) {
    let deel = '';
    try {
      for (const r of s.cssRules) deel += r.cssText + '\n';
    } catch { continue; /* externe stylesheet: overslaan */ }
    const basis = s.href || location.href;
    const fonts = [...new Set([...deel.matchAll(/url\("?([^")]+\.woff2)"?\)/g)].map((m) => m[1]))];
    for (const f of fonts) deel = deel.split(f).join(await naarData(new URL(f, basis)));
    css += deel.replace(/,\s*url\("?[^")]+\.woff"?\)\s*format\("woff"\)/g, '');
  }

  const main = document.querySelector('main.gids').cloneNode(true);
  main.querySelector('.scherm-alleen')?.remove();
  main.querySelectorAll('[tabindex]').forEach((e) => e.removeAttribute('tabindex'));
  for (const img of main.querySelectorAll('img')) {
    img.src = await naarData(img.src);
    img.removeAttribute('srcset');
    img.loading = 'lazy';
  }
  const tip = document.createElement('div');
  tip.className = 'melding';
  tip.innerHTML = '<p>Tip: tik op een onderstreept adres voor de route in Google Maps, of op een telefoonnummer om te bellen.</p>';
  main.querySelector('.omslag').after(tip);

  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Reisgids Rome met de groep</title>
<style>${css}
.pagina { padding-bottom: 2rem !important; }
</style>
</head>
<body>
${main.outerHTML}
</body>
</html>`;
});

writeFileSync(uit, html);
await browser.close();
console.log(`HTML gemaakt: docs/Reisgids-Rome-2026.html (${(html.length / 1048576).toFixed(1)} MB)`);
