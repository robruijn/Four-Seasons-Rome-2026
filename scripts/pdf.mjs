// `npm run pdf` – maakt docs/Reisgids-Rome-2026.pdf van de pagina #/gids.
// Vereist: Playwright met Chromium (npx playwright install chromium) en een draaiende
// preview: eerst `npm run build && npm run preview`, dan in een tweede venster `npm run pdf`.
//   npm run pdf -- http://localhost:4173/
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const basis = process.argv[2] || 'http://localhost:4173/';
const uit = new URL('../docs/Reisgids-Rome-2026.pdf', import.meta.url).pathname;

const browser = await chromium.launch();
const page = await browser.newPage({ colorScheme: 'light' });
await page.goto(basis + '#/gids', { waitUntil: 'networkidle' });
// Wachten tot alle (lazy) foto's geladen zijn.
await page.evaluate(async () => {
  document.querySelectorAll('img').forEach((i) => (i.loading = 'eager'));
  await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => (i.onload = i.onerror = r)))));
});
await page.emulateMedia({ media: 'print', colorScheme: 'light' });
await page.pdf({
  path: uit,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: '<div style="font:9px system-ui,sans-serif;color:#4f463d;width:100%;text-align:center">Four Seasons Rome 2026 · 13–15 november 2026 · pagina <span class="pageNumber"></span> van <span class="totalPages"></span></div>',
  margin: { top: '14mm', bottom: '16mm', left: '14mm', right: '14mm' }
});
await browser.close();
console.log('PDF gemaakt: docs/Reisgids-Rome-2026.pdf');
