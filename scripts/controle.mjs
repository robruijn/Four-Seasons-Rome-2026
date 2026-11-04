// `npm run check` – controleert programma.json en toont de beheerlijst.
// Stopt met foutcode bij kapotte verwijzingen of ongeldige tijden, zodat een
// fout in het bestand nooit live komt (de build draait deze controle eerst).
import { readFileSync } from 'node:fs';
import { controleer } from '../src/lib/controle.js';

let data;
try {
  data = JSON.parse(readFileSync(new URL('../public/programma.json', import.meta.url), 'utf8'));
} catch (e) {
  console.error('\n✖ programma.json is geen geldige JSON:\n  ' + e.message + '\n');
  console.error('  Tip: controleer komma’s en aanhalingstekens rond de genoemde positie.\n');
  process.exit(1);
}

const lijst = controleer(data);
const groep = (n) => lijst.filter((x) => x.niveau === n);
const toon = (titel, items) => {
  if (!items.length) return;
  console.log(`\n${titel} (${items.length})`);
  for (const i of items) console.log(`  • ${i.waar}: ${i.tekst}`);
};

toon('✖ FOUTEN', groep('fout'));
toon('? NOG TE BEVESTIGEN', groep('bevestigen'));
toon('! LET OP', groep('let_op'));
console.log('');

if (groep('fout').length) {
  console.error('Build gestopt: los eerst de fouten hierboven op.\n');
  process.exit(1);
}
console.log('✓ programma.json is bruikbaar.\n');
