// `npm run iconen` – maakt app-iconen (PNG) uit één SVG-ontwerp:
// terracotta vlak met crème bogen (Colosseum-arcade).
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const uit = new URL('../public/icons/', import.meta.url);
mkdirSync(uit, { recursive: true });

// art: tekening binnen een 512-vak; schaal < 1 houdt hem binnen de "veilige zone" (maskable).
function svg({ rond = true, schaal = 1 } = {}) {
  const bogen = (y, h, n, w) =>
    Array.from({ length: n }, (_, i) => {
      const x = 256 - (n * w) / 2 + i * w + w * 0.14;
      const bw = w * 0.72;
      return `<path d="M${x} ${y + h} V${y + bw / 2} a${bw / 2} ${bw / 2} 0 0 1 ${bw} 0 V${y + h} Z"/>`;
    }).join('');
  const art = `
    <g fill="#f5efe4">
      <rect x="96" y="132" width="320" height="16" rx="3"/>
      <rect x="96" y="246" width="320" height="14" rx="3"/>
      <rect x="96" y="358" width="320" height="18" rx="3"/>
    </g>
    <g fill="#f5efe4" opacity=".95">
      <rect x="96" y="148" width="320" height="98"/>
      <rect x="96" y="260" width="320" height="98"/>
    </g>
    <g fill="#a8462a">${bogen(160, 86, 5, 64)}${bogen(272, 86, 5, 64)}</g>`;
  const t = (1 - schaal) * 256;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" ${rond ? 'rx="112"' : ''} fill="#a8462a"/>
    <g transform="translate(${t} ${t + 2 * schaal}) scale(${schaal})">${art}</g>
  </svg>`;
}

const maak = (naam, maat, opt) => sharp(Buffer.from(svg(opt))).resize(maat, maat).png({ compressionLevel: 9 }).toFile(new URL(naam, uit).pathname);

await maak('icon-192.png', 192, { rond: false });
await maak('icon-512.png', 512, { rond: false });
await maak('icon-maskable-512.png', 512, { rond: false, schaal: 0.78 });
await maak('apple-touch-icon.png', 180, { rond: false, schaal: 0.9 });
writeFileSync(new URL('favicon.svg', uit), svg({ rond: true }));
console.log('Iconen gemaakt in public/icons/');
