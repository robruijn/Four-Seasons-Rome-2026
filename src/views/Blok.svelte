<script>
  import Icon from '../components/Icon.svelte';
  import LocatieInhoud from '../components/LocatieInhoud.svelte';
  import { app, blok, loc, statusLabel, vervoerVan, VERVOER_LABEL, routeMaat, routeStops, aantalTaxis, groepsgrootte } from '../lib/data.svelte.js';
  import { mapsRoute, meterTekst, minutenTekst } from '../lib/geo.js';
  import { mooieDag } from '../lib/tijd.js';

  let { id } = $props();
  const b = $derived(blok(id));
  const st = $derived(b && statusLabel(b.status));
  const vv = $derived(b && vervoerVan(b));
  const van = $derived(b && loc(b.van_loc));
  const naar = $derived(b && loc(b.naar_loc));
  const hoofd = $derived(b && loc(b.locatie));
  const r = $derived(b?.route ? app.data.routes[b.route] : null);
  const maat = $derived(b?.route ? routeMaat(b.route) : null);
  const extra = $derived((b?.locaties ?? []).filter((l) => l !== b.locatie).map(loc).filter(Boolean));
  const taxis = $derived(aantalTaxis());
  const groep = $derived(groepsgrootte());
</script>

<main class="pagina">
  <a class="terug" href={b ? '#/dag/' + b.datum : '#/'}><Icon naam="terug" /> Programma</a>

  {#if !b}
    <h1 tabindex="-1">Onderdeel niet gevonden</h1>
    <p>Misschien is het programma aangepast. <a href="#/">Terug naar het programma</a>.</p>
  {:else}
    <header class="kop">
      <p class="wanneer"><Icon naam="klok" maat={18} /> {mooieDag(b.datum)} · {b.van}–{b.tot}</p>
      <h1 tabindex="-1">{b.titel}</h1>
      <div class="tags">
        {#if vv}<span class="label zeker"><Icon naam={vv === 'walking' ? 'voet' : vv} maat={16} /> {VERVOER_LABEL[vv] ?? vv}</span>{/if}
        {#if st}<span class="label"><Icon naam="let_op" maat={14} /> {st}</span>{/if}
      </div>
      {#if b.noot}<p class="noot">{b.noot}</p>{/if}
    </header>

    {#if b.status === 'TE_BEPALEN' && !b.locatie && !b.route}
      <div class="melding waarschuwing"><Icon naam="let_op" /><p>De plek voor dit onderdeel wordt nog bepaald. De reisleider laat het weten; de app wordt dan bijgewerkt.</p></div>
    {/if}
    {#if b.status === 'TIJD_TE_BEVESTIGEN'}
      <div class="melding waarschuwing"><Icon naam="let_op" /><p>Deze tijd is nog niet definitief. Houd de reisleider aan.</p></div>
    {/if}

    <!-- Vervoer: wie gaat waarheen -->
    {#if van || naar}
      <section class="kaart vervoer" aria-label="Vervoer">
        {#if vv === 'taxi' && taxis}
          <p class="taxis"><Icon naam="taxi" maat={32} /> <span><strong>{taxis} taxi's</strong> voor de groep</span></p>
        {/if}
        <p class="wie"><Icon naam="groep" /> <span>De hele groep ({groep.tekst}{groep.zeker ? '' : ', nog te bevestigen'}) gaat samen{#if vv === 'taxi' && taxis}, verdeeld over {taxis} taxi's{/if}.</span></p>
        <ol class="vanNaar">
          {#if van}<li><span class="klein">Van</span> <a href={'#/locatie/' + van.id}>{van.naam}</a><br /><span class="klein">{van.adres}</span></li>{/if}
          {#if naar}<li><span class="klein">Naar</span> <a href={'#/locatie/' + naar.id}>{naar.naam}</a><br /><span class="klein">{naar.adres}</span></li>{/if}
        </ol>
        {#if vv === 'taxi' && app.data.praktisch.taxi}<p class="klein">{app.data.praktisch.taxi}</p>{/if}
        {#if naar}
          <a class="knop vol" href={mapsRoute([van, naar], vv === 'taxi' ? 'driving' : 'walking')} target="_blank" rel="noopener">
            <Icon naam="route" /> Open in Google Maps
          </a>
        {/if}
      </section>
    {/if}

    <!-- Wandelroute -->
    {#if r}
      <section class="kaart routekaart" aria-label="Wandelroute">
        <h2 class="sectie-titel klein-kop"><Icon naam="voet" /> {r.titel}</h2>
        {#if maat}<p>Ca. {meterTekst(maat.meters)} · ca. {minutenTekst(maat.minuten)} lopen</p>{/if}
        <p class="klein">{routeStops(b.route).map((s) => s.loc?.naam ?? 'vertrekpunt nog te bepalen').join(' → ')}</p>
        <a class="knop vol" href={'#/route/' + b.route}><Icon naam="oog" /> Route, kaart en Street View</a>
      </section>
    {/if}

    <!-- Hoofdlocatie -->
    {#if hoofd}
      <h2 class="sectie-titel">{hoofd.naam}</h2>
      <LocatieInhoud locatie={hoofd} kop="h3" />
    {/if}

    <!-- Overige plekken onderweg -->
    {#if extra.length}
      <h2 class="sectie-titel">Onderweg</h2>
      <ul class="plekken">
        {#each extra as l}
          <li><a href={'#/locatie/' + l.id}><span><strong>{l.naam}</strong><br /><span class="klein">{l.adres}</span></span><Icon naam="verder" /></a></li>
        {/each}
      </ul>
    {/if}
  {/if}
</main>

<style>
  .wanneer { display: flex; align-items: center; gap: 0.4rem; margin: 0 0 0.3rem; font-weight: 650; color: var(--terra); }
  .tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.6rem; }
  .noot { font-size: 1.0625rem; }
  .taxis { display: flex; align-items: center; gap: 0.7rem; font-size: 1.35rem; margin-bottom: 0.4rem; color: var(--terra); }
  .taxis strong { font-size: 1.6rem; }
  .wie { display: flex; gap: 0.5rem; align-items: flex-start; }
  .wie :global(.icon) { flex: none; margin-top: 0.1rem; }
  .vanNaar { list-style: none; padding: 0 0 0 1rem; margin: 0 0 0.75rem; border-left: 3px solid var(--terra); display: grid; gap: 0.6rem; }
  .vanNaar a { font-weight: 700; }
  .klein-kop { margin-top: 0; font-size: 1.3rem; }
  .plekken { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
  .plekken a {
    display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;
    min-height: 3.25rem; padding: 0.7rem 0.9rem;
    background: var(--vlak); border: 1px solid var(--lijn); border-radius: var(--r);
    color: inherit; text-decoration: none;
  }
</style>
