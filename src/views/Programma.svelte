<script>
  import { onMount, tick } from 'svelte';
  import Icon from '../components/Icon.svelte';
  import NuStraks from '../components/NuStraks.svelte';
  import Weer from '../components/Weer.svelte';
  import { app, loc, statusLabel, vervoerVan, VERVOER_LABEL, alleBlokken, looptijdTussen, routeMaat } from '../lib/data.svelte.js';
  import { meterTekst, minutenTekst } from '../lib/geo.js';
  import { klok, route } from '../lib/staat.svelte.js';
  import { datumVan } from '../lib/tijd.js';

  let { dagParam } = $props();

  const dagen = $derived(app.data.dagen);
  const kort = (label) => label.split(' ')[0]; // "Vrijdag"

  // Standaarddag: vandaag (Rome) als dat een reisdag is, anders de eerste dag.
  const vandaag = $derived(datumVan(klok.nu));
  let gekozen = $derived(dagen.find((d) => d.datum === dagParam)?.datum ?? (dagen.find((d) => d.datum === vandaag) ?? dagen[0]).datum);
  let dag = $derived(dagen.find((d) => d.datum === gekozen));

  const metTijd = $derived(alleBlokken().filter((b) => b.datum === gekozen));
  const huidigId = $derived.by(() => {
    const lopend = metTijd.filter((b) => b.start <= klok.nu && klok.nu < b.eind).sort((a, b) => b.start - a.start);
    return lopend[0]?.id ?? null;
  });

  function kies(datum) {
    location.hash = '#/dag/' + datum;
  }

  // Tabs met pijltjestoetsen (toegankelijk tabpatroon).
  function toets(e, i) {
    const n = dagen.length;
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % n;
    if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
    if (j !== null) {
      e.preventDefault();
      kies(dagen[j].datum);
      tick().then(() => document.getElementById('tab-' + dagen[j].datum)?.focus());
    }
  }

  // Bij openen: automatisch naar het lopende blok scrollen (alleen bij een verse pagina).
  onMount(async () => {
    if (!route.nieuw || !huidigId) return;
    await tick();
    const el = document.getElementById('blok-' + huidigId);
    if (el) {
      const y = el.getBoundingClientRect().top + scrollY - 90;
      scrollTo({ top: y, behavior: 'instant' });
    }
  });

  const plekNaam = (b) => {
    if (b.locatie) return loc(b.locatie)?.naam;
    if (b.van_loc || b.naar_loc) return [loc(b.van_loc)?.naam, loc(b.naar_loc)?.naam].filter(Boolean).join(' → ');
    if (b.route) return app.data.routes[b.route]?.titel;
    return null;
  };
</script>

<main class="pagina">
  <header class="kop">
    <p class="boventitel">{app.data.meta.titel}</p>
    <h1 tabindex="-1">Programma</h1>
  </header>

  {#if app.data.meta.welkom}
    <p class="welkom">{app.data.meta.welkom}</p>
  {/if}

  <NuStraks />

  <div class="tabs" role="tablist" aria-label="Kies een dag">
    {#each dagen as d, i}
      <button
        id={'tab-' + d.datum}
        role="tab"
        aria-selected={d.datum === gekozen}
        aria-controls="dagpaneel"
        tabindex={d.datum === gekozen ? 0 : -1}
        onclick={() => kies(d.datum)}
        onkeydown={(e) => toets(e, i)}>
        <span class="dagnaam">{kort(d.label)}</span>
        <span class="datum">{d.label.split(' ').slice(1).join(' ')}</span>
      </button>
    {/each}
  </div>

  <div id="dagpaneel" role="tabpanel" aria-labelledby={'tab-' + gekozen}>
    <div class="dagkop">
      <h2>{dag.label}</h2>
      <Weer datum={gekozen} compact />
    </div>

    <ol class="tijdlijn">
      {#each dag.blokken as b, i (b.id)}
        {@const loop = looptijdTussen(dag.blokken[i - 1], b)}
        {#if loop}
          <li class="loop" aria-label={`Lopen naar ${loop.naar.naam}: ongeveer ${minutenTekst(loop.minuten)}`}>
            <span class="loopTekst"><Icon naam="voet" maat={18} /> ca. {minutenTekst(loop.minuten)} lopen ({meterTekst(loop.meters)})</span>
          </li>
        {/if}
        {@const st = statusLabel(b.status)}
        {@const vv = vervoerVan(b)}
        {@const huidig = b.id === huidigId}
        <li id={'blok-' + b.id} class:huidig class:open={!!st}>
          <a href={'#/blok/' + b.id} aria-current={huidig ? 'true' : undefined}>
            <span class="tijd">
              <span class="van">{b.van}</span>
              <span class="tot"><span class="sr-only">tot </span>{b.tot}</span>
            </span>
            <span class="inhoud">
              {#if huidig}<span class="label terra nu-label">Nu bezig</span>{/if}
              <span class="titel">{b.titel}</span>
              {#if plekNaam(b)}<span class="plek"><Icon naam="pin" maat={16} /> {plekNaam(b)}</span>{/if}
              {#if b.noot}<span class="noot">{b.noot}</span>{/if}
              <span class="tags">
                {#if vv}<span class="vervoer"><Icon naam={vv === 'walking' ? 'voet' : vv} maat={18} /> {VERVOER_LABEL[vv] ?? vv}</span>{/if}
                {#if b.route}
                  {@const rm = routeMaat(b.route)}
                  {#if rm}<span class="vervoer"><Icon naam="klok" maat={18} /> ca. {minutenTekst(rm.minuten)} ({meterTekst(rm.meters)})</span>{/if}
                  <span class="vervoer"><Icon naam="oog" maat={18} /> Route en Street View</span>
                {/if}
                {#if st}<span class="label"><Icon naam="let_op" maat={14} /> {st}</span>{/if}
              </span>
            </span>
            <Icon naam="verder" klasse="pijl" />
          </a>
        </li>
      {/each}
    </ol>
  </div>
</main>

<style>
  .welkom {
    font-family: var(--serif); font-size: 1.3rem; line-height: 1.35;
    margin: 0.2rem 0 1rem; color: var(--tekst);
  }
  .tijdlijn li.loop { margin: -0.15rem 0 0.45rem; }
  .tijdlijn li.loop::before { display: none; }
  .loopTekst {
    display: inline-flex; align-items: center; gap: 0.35rem;
    margin-left: 4.1rem; padding: 0.2rem 0.7rem;
    background: var(--bg); border: 1.5px dashed var(--lijn); border-radius: 999px;
    font-size: 0.875rem; font-weight: 650; color: var(--groen);
    position: relative; z-index: 1;
  }
  .boventitel {
    margin: 0; color: var(--terra);
    font-weight: 750; font-size: 0.875rem; letter-spacing: 0.1em; text-transform: uppercase;
  }
  .tabs {
    position: sticky; top: 0; z-index: 10;
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem;
    padding: 0.5rem 0; margin: 0 -1rem; padding-inline: 1rem;
    background: var(--bg);
  }
  .tabs button {
    display: grid; justify-items: center;
    min-height: 3.5rem; padding: 0.35rem 0.25rem;
    border: 2px solid var(--lijn); border-radius: 12px;
    background: var(--vlak); color: var(--tekst);
    font: inherit; cursor: pointer;
  }
  .tabs button[aria-selected='true'] {
    background: var(--terra); border-color: var(--terra); color: var(--terra-tekst);
  }
  .dagnaam { font-weight: 800; }
  .datum { font-size: 0.8125rem; }

  .dagkop { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin: 0.9rem 0 0.6rem; flex-wrap: wrap; }
  .dagkop h2 { margin: 0; }

  .tijdlijn { list-style: none; margin: 0; padding: 0; position: relative; }
  .tijdlijn::before {
    content: ''; position: absolute; left: 3.6rem; top: 0.5rem; bottom: 0.5rem;
    width: 2px; background: var(--lijn);
  }
  .tijdlijn li { position: relative; margin-bottom: 0.6rem; }
  .tijdlijn li::before {
    content: ''; position: absolute; left: calc(3.6rem - 5px); top: 1.15rem;
    width: 12px; height: 12px; border-radius: 50%;
    background: var(--bg); border: 2px solid var(--terra); z-index: 1;
  }
  .tijdlijn li.huidig::before { background: var(--terra); box-shadow: 0 0 0 4px var(--terra-zacht); }
  .tijdlijn a {
    display: grid; grid-template-columns: 3rem 1fr auto; gap: 1.1rem; align-items: start;
    padding: 0.75rem 0.6rem 0.75rem 0;
    color: inherit; text-decoration: none;
    border-radius: var(--r);
  }
  .tijdlijn .inhoud {
    display: grid; gap: 0.2rem;
    background: var(--vlak); border: 1px solid var(--lijn); border-radius: var(--r);
    padding: 0.7rem 0.85rem;
    box-shadow: var(--schaduw);
  }
  .huidig .inhoud { border: 2.5px solid var(--terra); }
  .open .inhoud { border-style: dashed; border-color: var(--geel-rand); }
  .tijd { display: grid; text-align: right; padding-top: 0.6rem; font-variant-numeric: tabular-nums; }
  .van { font-weight: 800; }
  .tot { font-size: 0.875rem; color: var(--tekst-2); }
  .titel { font-family: var(--serif); font-size: 1.35rem; font-weight: 700; line-height: 1.2; }
  .plek { display: flex; gap: 0.3rem; align-items: flex-start; font-weight: 600; font-size: 0.9375rem; }
  .plek :global(.icon) { flex: none; margin-top: 0.2rem; }
  .noot { font-size: 0.9375rem; color: var(--tekst-2); }
  .tags { display: flex; flex-wrap: wrap; gap: 0.4rem 0.8rem; margin-top: 0.2rem; }
  .vervoer { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.875rem; font-weight: 650; color: var(--groen); }
  .nu-label { justify-self: start; }
  .tijdlijn :global(.pijl) { align-self: center; color: var(--tekst-2); margin-left: -0.8rem; }
</style>
