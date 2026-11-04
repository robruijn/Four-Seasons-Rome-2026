<script>
  // Routescherm. Offline altijd bruikbaar: titel, afstand/looptijd, stops met adres
  // en toelichting, tekstuele routebeschrijving en "Open in Google Maps".
  // Online komen daar de live kaart en (op verzoek) Street View bij.
  import Icon from '../components/Icon.svelte';
  import KaartOfSchema from '../components/KaartOfSchema.svelte';
  import StreetView from '../components/StreetView.svelte';
  import { app, routeStops, streetViewStops, routeMaat, blokkenMetRoute, routeBeschrijving } from '../lib/data.svelte.js';
  import { net } from '../lib/staat.svelte.js';
  import { maps } from '../lib/maps.svelte.js';
  import { afstand, meterTekst, minutenTekst, mapsRoute, OMWEG, TEMPO_M_PER_MIN } from '../lib/geo.js';
  import { mooieDag } from '../lib/tijd.js';

  let { id } = $props();
  const r = $derived(app.data.routes[id]);
  const stops = $derived(routeStops(id));
  const bekend = $derived(stops.map((s) => s.loc).filter((l) => l && l.lat != null));
  const svStops = $derived(streetViewStops(id));
  const schatting = $derived(routeMaat(id));
  let live = $state(null); // afstand/tijd volgens Google, als de kaart die oplevert
  const maat = $derived(live ? { ...live, schatting: false } : schatting);
  const momenten = $derived(blokkenMetRoute(id));

  const punten = $derived(bekend.map((l, i) => ({ lat: l.lat, lng: l.lng, label: String(i + 1), naam: l.naam, href: '#/locatie/' + l.id })));

  const stappen = $derived(routeBeschrijving(id));
</script>

<main class="pagina">
  <a class="terug" href={momenten[0] ? '#/blok/' + momenten[0].id : '#/'} onclick={(e) => { if (history.length > 1) { e.preventDefault(); history.back(); } }}>
    <Icon naam="terug" /> Terug
  </a>

  {#if !r}
    <h1 tabindex="-1">Route niet gevonden</h1>
  {:else}
    <p class="boventitel"><Icon naam="voet" maat={18} /> Wandelroute</p>
    <h1 tabindex="-1">{r.titel}</h1>
    {#each momenten as b}
      <p class="klein wanneer">{mooieDag(b.datum)} · {b.van}–{b.tot} · {b.titel}</p>
    {/each}

    <dl class="feiten kaart">
      <dt>Afstand</dt><dd>{maat ? `ca. ${meterTekst(maat.meters)}` : 'nog niet bekend'}</dd>
      <dt>Looptijd</dt><dd>{maat ? `ca. ${minutenTekst(maat.minuten)}` : 'nog niet bekend'}</dd>
      <dt>Stops</dt><dd>{stops.length}</dd>
    </dl>
    {#if maat?.schatting}<p class="klein bron">Schatting op groepstempo (4 km/u). Online wordt dit bijgewerkt met de looproute van Google.</p>{/if}

    {#if !net.online}
      <div class="melding" role="status"><Icon naam="offline" /><p>Je bent offline. Street View en kaart zijn nu niet beschikbaar. De route hieronder werkt gewoon.</p></div>
    {:else if !maps.geconfigureerd}
      <div class="melding waarschuwing"><Icon naam="let_op" /><p>De live kaart is nog niet ingesteld. Je ziet een schematisch overzicht.</p></div>
    {/if}

    <KaartOfSchema {punten} lijn wandelen onmaat={(m) => (live = m)} label={`Kaart van de route ${r.titel}`} />

    <a class="knop vol" href={mapsRoute(bekend)} target="_blank" rel="noopener"><Icon naam="route" /> Open route in Google Maps</a>

    <h2 class="sectie-titel"><Icon naam="pin" /> Stops</h2>
    <ol class="stops">
      {#each stops as s, i}
        <li>
          <span class="nr" aria-hidden="true">{s.loc ? bekend.indexOf(s.loc) + 1 || '–' : '?'}</span>
          {#if s.loc}
            <div>
              <a href={'#/locatie/' + s.loc.id} class="naam">{s.loc.naam}</a>
              <p class="klein">{s.loc.adres}{#if s.loc.adres_status} · <span class="label">adres nog te controleren</span>{/if}</p>
              {#if s.loc.tekst}<p class="tekst">{s.loc.tekst}</p>{/if}
            </div>
            {@const volgende = stops[i + 1]?.loc}
            {#if volgende && s.loc.lat != null && volgende.lat != null}
              {@const m = afstand(s.loc, volgende) * OMWEG}
              <p class="leg"><Icon naam="voet" maat={16} /> ca. {minutenTekst(m / TEMPO_M_PER_MIN)} lopen ({meterTekst(m)}) naar {volgende.naam}</p>
            {/if}
          {:else}
            <div>
              <span class="naam">Vertrekpunt</span>
              <p><span class="label"><Icon naam="let_op" maat={14} /> Nog te bepalen</span></p>
            </div>
          {/if}
        </li>
      {/each}
    </ol>

    <h2 class="sectie-titel"><Icon naam="route" /> Routebeschrijving</h2>
    <ol class="stappen">
      {#each stappen as s}<li>{s}</li>{/each}
    </ol>
    <p class="klein">Richtingen zijn hemelsbreed bepaald. Volg onderweg de reisleider, of gebruik Google Maps voor de exacte straten.</p>

    <StreetView stops={svStops} titel="Street View per stop" />
  {/if}
</main>

<style>
  .boventitel { display: flex; align-items: center; gap: 0.35rem; margin: 0; color: var(--terra); font-weight: 750; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.875rem; }
  .wanneer { margin: -0.2rem 0 0.8rem; }
  .bron { margin-top: -0.6rem; }
  .stops { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.75rem; }
  .stops li { display: grid; grid-template-columns: 2.25rem 1fr; gap: 0.75rem; }
  .nr {
    width: 2.1rem; height: 2.1rem; border-radius: 50%;
    display: grid; place-items: center;
    background: var(--terra); color: var(--terra-tekst); font-weight: 800;
  }
  .naam { font-family: var(--serif); font-size: 1.3rem; font-weight: 700; }
  .stops p { margin: 0.1rem 0 0.3rem; }
  .tekst { font-size: 0.9875rem; }
  .leg {
    grid-column: 2; display: flex; align-items: center; gap: 0.35rem;
    margin: 0.1rem 0 0 !important; font-size: 0.875rem; font-weight: 650; color: var(--groen);
  }
  .stappen { padding-left: 1.4rem; display: grid; gap: 0.5rem; }
</style>
