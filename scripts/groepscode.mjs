// `npm run groepscode -- <code>` geeft de hash die je als VITE_GROEPSCODE_HASH instelt.
import { createHash } from 'node:crypto';
const code = process.argv.slice(2).join(' ').trim();
if (!code) {
  console.error('Gebruik: npm run groepscode -- <code>');
  process.exit(1);
}
const hash = createHash('sha256').update('rome-2026|' + code.toLowerCase()).digest('hex');
console.log(`\nVITE_GROEPSCODE_HASH=${hash}\n`);
console.log('Zet deze waarde in .env.local (lokaal) of als GitHub-variabele VITE_GROEPSCODE_HASH (voor de deploy).');
