<script>
  // Schematische kaart (offline, zonder Google): de stops als genummerde punten op
  // de juiste onderlinge positie, met het noorden boven. Geen straten, wel oriëntatie.
  import { afstand, meterTekst } from '../lib/geo.js';

  let { punten, lijn = false, label = 'Schematische kaart' } = $props();

  const W = 320, H = 200, M = 24;
  const geo = $derived.by(() => {
    const ps = punten.filter((p) => p.lat != null);
    if (!ps.length) return null;
    const lat0 = ps.reduce((s, p) => s + p.lat, 0) / ps.length;
    const k = Math.cos((lat0 * Math.PI) / 180);
    const xs = ps.map((p) => p.lng * k), ys = ps.map((p) => -p.lat);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const s = Math.min((W - 2 * M) / (maxX - minX || 1e-9), (H - 2 * M) / (maxY - minY || 1e-9));
    const ox = (W - (maxX - minX) * s) / 2, oy = (H - (maxY - minY) * s) / 2;
    const pts = ps.map((p, i) => ({ ...p, x: ox + (xs[i] - minX) * s, y: oy + (ys[i] - minY) * s }));
    // Schaalstreep: 1 graad lengte (gecorrigeerd) ≈ 111,32 km × k
    const mPerPx = 111320 / s;
    const doel = [100, 200, 250, 500, 1000, 2000, 5000].find((m) => m / mPerPx > 50) ?? 5000;
    return { pts, schaal: { px: doel / mPerPx, tekst: meterTekst(doel) } };
  });
</script>

{#if geo}
  <figure class="schema">
    <svg viewBox="0 0 {W} {H}" role="img" aria-label={label}>
      {#if lijn && geo.pts.length > 1}
        <polyline points={geo.pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="var(--terra)" stroke-width="3" stroke-dasharray="6 6" stroke-linecap="round" />
      {/if}
      {#each geo.pts as p}
        <g>
          <circle cx={p.x} cy={p.y} r="11" fill="var(--terra)" stroke="var(--vlak)" stroke-width="2.5" />
          <text x={p.x} y={p.y + 4.5} text-anchor="middle" font-size="12" font-weight="700" fill="var(--terra-tekst)">{p.label}</text>
        </g>
      {/each}
      <g transform="translate({W - 18} 20)" fill="var(--tekst-2)">
        <path d="M0 -12 L5 2 L0 -1 L-5 2 Z" />
        <text y="15" text-anchor="middle" font-size="11" font-weight="700">N</text>
      </g>
      <g transform="translate(12 {H - 12})" stroke="var(--tekst-2)" stroke-width="2">
        <line x1="0" x2={geo.schaal.px} y1="0" y2="0" />
        <line x1="0" x2="0" y1="-4" y2="4" /><line x1={geo.schaal.px} x2={geo.schaal.px} y1="-4" y2="4" />
        <text x={geo.schaal.px + 6} y="4" font-size="11" stroke="none" fill="var(--tekst-2)">{geo.schaal.tekst}</text>
      </g>
    </svg>
    <figcaption class="klein">Schematisch overzicht (hemelsbreed). De echte kaart verschijnt als je online bent.</figcaption>
  </figure>
{/if}

<style>
  .schema { margin: 0 0 0.75rem; }
  svg {
    width: 100%; height: auto; display: block;
    background:
      radial-gradient(circle at 1px 1px, var(--lijn) 1px, transparent 0) 0 0 / 16px 16px,
      var(--vlak);
    border: 1px solid var(--lijn); border-radius: var(--r);
  }
  figcaption { margin-top: 0.3rem; }
</style>
