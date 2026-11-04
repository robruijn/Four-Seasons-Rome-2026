<script>
  // "Nu / Straks": lopend blok + volgende blok, met aftelling. Op basis van Rome-tijd.
  // Buiten de reisdata: eerste blok van de eerste dag.
  import Icon from './Icon.svelte';
  import { alleBlokken, loc, statusLabel, vervoerVan } from '../lib/data.svelte.js';
  import { klok } from '../lib/staat.svelte.js';
  import { duurTekst, mooieDag } from '../lib/tijd.js';

  let blokken = $derived(alleBlokken());
  let t = $derived(klok.nu);

  let stand = $derived.by(() => {
    const eerste = blokken[0];
    const laatste = blokken.reduce((a, b) => (b.eind > a.eind ? b : a), eerste);
    if (!eerste) return null;
    if (t < eerste.start) return { soort: 'voor', straks: eerste };
    if (t >= laatste.eind) return { soort: 'na', straks: eerste };
    // Bij overlap (bijv. taxi + fietsblok) telt het laatst begonnen blok als "nu".
    const lopend = blokken.filter((b) => b.start <= t && t < b.eind).sort((a, b) => b.start - a.start)[0] ?? null;
    const straks = blokken.find((b) => b.start > t && b !== lopend) ?? null;
    return { soort: 'tijdens', nu: lopend, straks };
  });

  const plek = (b) => (b.locatie ? loc(b.locatie)?.naam : b.naar_loc ? `naar ${loc(b.naar_loc)?.naam}` : null);
</script>

{#if stand}
  <section class="nustraks" aria-labelledby="ns-titel">
    <h2 id="ns-titel" class="sr-only">Nu en straks</h2>

    {#if stand.soort === 'voor'}
      <p class="kop">De reis begint over <strong>{duurTekst(stand.straks.start - t)}</strong></p>
    {:else if stand.soort === 'na'}
      <p class="kop">De reis zit erop. Zo begon het:</p>
    {/if}

    {#if stand.soort === 'tijdens'}
      <a class="vak nu" href={'#/blok/' + (stand.nu?.id ?? '')} aria-disabled={!stand.nu} onclick={(e) => !stand.nu && e.preventDefault()}>
        <span class="tag">Nu</span>
        {#if stand.nu}
          <span class="titel">{stand.nu.titel}</span>
          {#if plek(stand.nu)}<span class="plek">{plek(stand.nu)}</span>{/if}
          <span class="tijd"><Icon naam="klok" maat={18} /> tot {stand.nu.tot} · nog {duurTekst(stand.nu.eind - t)}</span>
        {:else}
          <span class="titel">Vrije tijd</span>
          <span class="plek">Even niets op het programma.</span>
        {/if}
      </a>
    {/if}

    {#if stand.straks}
      {@const s = stand.straks}
      {@const st = statusLabel(s.status)}
      <a class="vak straks" href={'#/blok/' + s.id}>
        <span class="tag">{stand.soort === 'tijdens' ? 'Straks' : 'Eerste onderdeel'}</span>
        <span class="titel">{s.titel}</span>
        {#if plek(s)}<span class="plek">{plek(s)}</span>{/if}
        <span class="tijd">
          <Icon naam={vervoerVan(s) ?? 'klok'} maat={18} />
          {#if stand.soort === 'tijdens'}
            om {s.van} · over {duurTekst(s.start - t)}
          {:else}
            {mooieDag(s.datum)} om {s.van}
          {/if}
        </span>
        {#if st}<span class="label">{st}</span>{/if}
      </a>
    {:else if stand.soort === 'tijdens'}
      <div class="vak straks"><span class="tag">Straks</span><span class="titel">Einde van het programma</span></div>
    {/if}
  </section>
{/if}

<style>
  .nustraks {
    background: var(--groen); color: var(--bg);
    border-radius: calc(var(--r) + 4px);
    padding: 0.9rem;
    margin: 0.25rem 0 1.25rem;
    display: grid; gap: 0.6rem;
  }
  .kop { margin: 0 0.25rem; font-size: 1.05rem; }
  .vak {
    display: grid; gap: 0.15rem;
    padding: 0.8rem 0.9rem;
    border-radius: var(--r);
    background: rgb(255 255 255 / 0.1);
    color: inherit; text-decoration: none;
    min-height: 3rem;
  }
  .vak.nu { background: var(--bg); color: var(--tekst); }
  .vak[aria-disabled='true'] { cursor: default; }
  .tag {
    font-size: 0.8125rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
  }
  .nu .tag { color: var(--terra); }
  .titel { font-family: var(--serif); font-size: 1.55rem; font-weight: 700; line-height: 1.15; }
  .plek { font-weight: 600; }
  .tijd { display: flex; align-items: center; gap: 0.35rem; font-size: 0.9375rem; }
  .straks .label { justify-self: start; margin-top: 0.25rem; }
</style>
