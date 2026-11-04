// Groepscode-controle. De hash wordt bij het bouwen meegegeven (VITE_GROEPSCODE_HASH),
// gemaakt met `npm run groepscode -- <code>`. Zonder hash is er geen poort.
const HASH = (import.meta.env.VITE_GROEPSCODE_HASH || '').toLowerCase();
const ZOUT = 'rome-2026|';
const SLEUTEL = 'rome-groepscode';

export const poortActief = !!HASH;

async function sha256(tekst) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(tekst));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function alOntgrendeld() {
  if (!HASH) return true;
  try {
    return localStorage.getItem(SLEUTEL) === HASH;
  } catch {
    return false;
  }
}

export async function ontgrendel(code) {
  const h = await sha256(ZOUT + code.trim().toLowerCase());
  if (h !== HASH) return false;
  try {
    localStorage.setItem(SLEUTEL, HASH);
  } catch {
    /* privémodus: dan elke keer opnieuw */
  }
  return true;
}
