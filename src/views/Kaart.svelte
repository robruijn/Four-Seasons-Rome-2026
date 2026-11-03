<script>
  // Overzichtskaart per dag + lijst van alle plekken (werkt ook offline).
  import Icon from '../components/Icon.svelte';
  import KaartOfSchema from '../components/KaartOfSchema.svelte';
  import { app, loc, locatiesVanBlok } from '../lib/data.svelte.js';
  import { net, klok } from '../lib/staat.svelte.js';
  import { datumVan } from '../lib/tijd.js';

  const dagen = $derived(app.data.dagen);
  const vandaag = datumVan(klok.nu);
  let keuze = $state(app.data.dagen.some((d) => d.datum === vandaag) ? vandaag : 'alle');

  const hotel = $derived(loc(app.data.praktisch.hotel));

  // Locaties in volgorde van het programma, zonder dubbelen.
  const lijst = $derived.by(() => {
    const ds = keuze === 'alle' ? dagen : dagen.filter((d) => d.datum === keuze);
    const gezien = new Map();
    for (const d of ds) for (const b of d.blokken) {
      const bb = { ...b, datum: d.datum };
      for (const l of locatiesVanBlok(bb)) if (!gezien.has(l.id) && l.lat != null) gezien.set(l.id, l);
    }
    // FCO ligt ver buiten de stad: niet op de stadskaart, wel in de lijst.
    return [...gezien.values()];
  });
  const opKaart = $derived(lijst.filter((l) => l.id !== 'fco'));
  // Hotel krijgt een "H", de overige plekken een volgnummer.
  const punten = $derived.by(() => {
    let n = 0;
    return opKaart.map((l) => ({ lat: l.lat, lng: l.lng, label: l.id === hotel?.id ? 'H' : String(++n), naam: l.naam, href: '#/locatie/' + l.id }));
  });
  const labelVan = (id) => punten.find((p) => p.href === '#/locatie/' + id)?.label ?? '•';
</script>

<main class="pagina">
  <h1 tabindex="-1">Kaart</h1>

  <div class="chips" role="group" aria-label="Toon dag">
    <button aria-pressed={keuze === 'alle'} onclick={() => (keuze = 'alle')}>Alle dagen</button>
    {#each dagen as d}
      <button aria-pressed={keuze === d.datum} onclick={() => (keuze = d.datum)}>{d.label.split(' ')[0]}</button>
    {/each}
  </div>

  {#key keuze}
    <KaartOfSchema punten={punten} hoogte="22rem" label="Kaart met alle plekken van {keuze === 'alle' ? 'de reis' : 'deze dag'}" />
  {/key}
  {#if !net.online}
    <p class="klein">Je bent offline: dit is een schematisch overzicht. De live kaart komt terug zodra je verbinding hebt.</p>
  {/if}

  <h2 class="sectie-titel">Plekken</h2>
  <ul class="plekken">
    {#each lijst as l}
      <li>
        <a href={'#/locatie/' + l.id}>
          <span class="nr" aria-hidden="true">{l.id === 'fco' ? '✈' : labelVan(l.id)}</span>
          <span class="tekst"><strong>{l.naam}</strong><span class="klein">{l.adres}</span></span>
          <Icon naam="verder" />
        </a>
      </li>
    {/each}
  </ul>
</main>

<style>
  .chips { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
  .chips button {
    min-height: 2.75rem; padding: 0.4rem 0.9rem;
    border-radius: 999px; border: 2px solid var(--lijn);
    background: var(--vlak); color: var(--tekst); font: inherit; font-weight: 650; cursor: pointer;
  }
  .chips button[aria-pressed='true'] { background: var(--groen); border-color: var(--groen); color: var(--bg); }
  .chips button[aria-pressed='true']::before { content: '✓ '; }
  .plekken { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
  .plekken a {
    display: grid; grid-template-columns: 2.25rem 1fr auto; gap: 0.7rem; align-items: center;
    min-height: 3.5rem; padding: 0.6rem 0.8rem;
    background: var(--vlak); border: 1px solid var(--lijn); border-radius: var(--r);
    color: inherit; text-decoration: none;
  }
  .nr {
    width: 2.1rem; height: 2.1rem; border-radius: 50%;
    display: grid; place-items: center;
    background: var(--terra); color: var(--terra-tekst); font-weight: 800;
  }
  .tekst { display: grid; }
</style>
