// `npm run qr -- https://robruijn.github.io/Four-Seasons-Rome-2026/` – maakt een QR-code (SVG en PNG)
// in docs/, om te printen of in de groepsapp te delen.
import QRCode from 'qrcode';
import { mkdirSync } from 'node:fs';
const url = process.argv[2] || process.env.PUBLIC_URL;
if (!url) {
  console.error('Gebruik: npm run qr -- <url van de app>');
  process.exit(1);
}
mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });
const opties = { errorCorrectionLevel: 'M', margin: 2, color: { dark: '#24443a', light: '#ffffff' } };
await QRCode.toFile(new URL('../docs/qr-code.svg', import.meta.url).pathname, url, { ...opties, type: 'svg' });
await QRCode.toFile(new URL('../docs/qr-code.png', import.meta.url).pathname, url, { ...opties, width: 1024 });
console.log(`QR-code voor ${url} staat in docs/qr-code.svg en docs/qr-code.png`);
