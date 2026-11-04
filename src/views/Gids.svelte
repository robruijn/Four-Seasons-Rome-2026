<script>
  // Volledige reisgids op één pagina (#/gids): om af te drukken of als PDF te bewaren
  // en te mailen. Zelfde databron als de app; geen kaart of Street View.
  import Icon from '../components/Icon.svelte';
  import {
    app, loc, fotosVan, statusLabel, vervoerVan, VERVOER_LABEL, looptijdTussen,
    routeMaat, routeStops, routeBeschrijving, aantalTaxis, onbevestigd, locatiesVanBlok
  } from '../lib/data.svelte.js';
  import { mapsRouteNaar, mapsRoute, meterTekst, minutenTekst, telLink } from '../lib/geo.js';
  import { mooieDatum } from '../lib/tijd.js';

  const d = $derived(app.data);
  const extra = $derived(d.extra ?? {});
  const hotel = $derived(loc(d.praktisch.hotel));
  const taxis = $derived(aantalTaxis());
  const omslag = $derived(fotosVan('colosseo')[0] ?? Object.values(app.fotos ?? {}).flat()[0]);

  // Alle plekken in volgorde van het programma (zonder dubbelen).
  const plekken = $derived.by(() => {
    const m = new Map();
    for (const dag of d.dagen) for (const b of dag.blokken) for (const l of locatiesVanBlok(b)) if (!m.has(l.id)) m.set(l.id, l);
    return [...m.values()].filter((l) => l.tekst);
  });
  const routes = $derived(Object.keys(d.routes));
  const alleFotos = $derived(Object.entries(app.fotos ?? {}).flatMap(([id, f]) => f.map((x) => ({ ...x, plek: loc(id)?.naam ?? id }))));
  const plekNaam = (b) => {
    if (b.locatie) return loc(b.locatie)?.naam;
    if (b.van_loc || b.naar_loc) return [loc(b.van_loc)?.naam, loc(b.naar_loc)?.naam].filter(Boolean).join(' → ');
    if (b.route) return d.routes[b.route]?.titel;
    return null;
  };
</script>

<main class="pagina gids">
  <div class="scherm-alleen">
    <a class="terug" href="#/info"><Icon naam="terug" /> Info</a>
    <div class="melding">
      <Icon naam="info" />
      <p>Dit is de hele reisgids op één pagina. Druk hem af of bewaar hem als PDF om te mailen:
        kies in het deelmenu of afdrukmenu van je browser <strong>Bewaar als PDF</strong>.</p>
    </div>
    <button class="knop vol" onclick={() => print()}><Icon naam="installeer" /> Afdrukken of bewaren als PDF</button>
  </div>

  <!-- Omslag -->
  <header class="omslag">
    {#if omslag}<img src={`./fotos/${omslag.bestand}-800.webp`} alt="" width="800" height="533" />{/if}
    <p class="boventitel">Reisgids</p>
    <h1 tabindex="-1">{d.meta.titel}</h1>
    <p class="periode">Vrijdag 13 t/m zondag 15 november 2026</p>
    {#if d.meta.welkom}<p class="welkom">{d.meta.welkom}</p>{/if}
    <p class="applink">Ook als app op je telefoon: <a href="https://robruijn.github.io/rdb.test/">robruijn.github.io/rdb.test</a></p>
  </header>

  <!-- Belangrijk -->
  <section class="blok-sectie belangrijk">
    <h2>Belangrijke gegevens</h2>
    <dl class="feiten">
      <dt>Noodnummer</dt><dd><a href="tel:112">112</a> (politie, ambulance, brandweer)</dd>
      <dt>Hotel</dt>
      <dd>
        {hotel.naam}, {hotel.adres}<br />
        {#each hotel.telefoon ?? [] as nr, i}{#if i}, {/if}<a href={telLink(nr)}>{nr}</a>{/each}
      </dd>
      {#each d.meta.reisleiders ?? [] as r}
        <dt>Reisleider</dt>
        <dd>{r.naam}{#if r.telefoon && !onbevestigd(r.telefoon)}: <a href={telLink(r.telefoon)}>{r.telefoon}</a>{/if}</dd>
      {/each}
      {#if taxis}<dt>Taxi</dt><dd>{taxis} taxi's voor de groep. {d.praktisch.taxi_afspraak ?? ''}</dd>{/if}
    </dl>
  </section>

  <!-- Programma -->
  {#each d.dagen as dag}
    <section class="dag">
      <h2>{dag.label}</h2>
      <ol class="programma">
        {#each dag.blokken as b, i (b.id)}
          {@const loop = looptijdTussen(dag.blokken[i - 1], b)}
          {#if loop}
            <li class="loop">↓ ca. {minutenTekst(loop.minuten)} lopen ({meterTekst(loop.meters)})</li>
          {/if}
          {@const st = statusLabel(b.status)}
          {@const vv = vervoerVan(b)}
          {@const l = loc(b.locatie)}
          <li class="item">
            <span class="tijd">{b.van}–{b.tot}</span>
            <div>
              <strong>{b.titel}</strong>
              {#if st}<span class="label">{st}</span>{/if}
              {#if plekNaam(b)}<br /><span class="plek">{plekNaam(b)}</span>{/if}
              {#if l}<br /><a class="adres" href={mapsRouteNaar(l)}>{l.adres}</a>{/if}
              {#if vv === 'taxi' && taxis}<br /><span class="vv">Taxi · {taxis} taxi's voor de groep</span>
              {:else if b.route}
                {@const rm = routeMaat(b.route)}
                <br /><span class="vv">Te voet{#if rm} · ca. {minutenTekst(rm.minuten)} ({meterTekst(rm.meters)}){/if}</span>
              {:else if vv}<br /><span class="vv">{VERVOER_LABEL[vv] ?? vv}</span>{/if}
              {#if b.noot}<br /><span class="noot">{b.noot}</span>{/if}
            </div>
          </li>
        {/each}
      </ol>
      {#if extra.plan_b?.[dag.datum]}
        <p class="planb"><strong>Plan B bij regen:</strong> {extra.plan_b[dag.datum]}</p>
      {/if}
    </section>
  {/each}

  <!-- Plekken -->
  <section class="nieuwe-pagina">
    <h2>De plekken</h2>
    {#each plekken as l}
      {@const f = fotosVan(l.id)[0]}
      <article class="plekkaart" class:zonder={!f}>
        {#if f}<img src={`./fotos/${f.bestand}-400.webp`} alt="" width="400" height="267" loading="lazy" />{/if}
        <div>
          <h3>{l.naam}</h3>
          <p class="adresregel"><a href={mapsRouteNaar(l)}>{l.adres}</a>
            {#if l.adres_status}<span class="label">adres nog te controleren</span>{/if}</p>
          <p>{l.tekst}</p>
          {#if l.praktisch}<p class="prak"><strong>Praktisch:</strong> {l.praktisch}</p>{/if}
        </div>
      </article>
    {/each}
  </section>

  <!-- Routes -->
  <section class="nieuwe-pagina">
    <h2>Wandelroutes</h2>
    {#each routes as id}
      {@const r = d.routes[id]}
      {@const rm = routeMaat(id)}
      {@const bekend = routeStops(id).map((s) => s.loc).filter(Boolean)}
      <article class="route">
        <h3>{r.titel}</h3>
        {#if rm}<p class="vv">Ca. {meterTekst(rm.meters)} · ca. {minutenTekst(rm.minuten)} lopen</p>{/if}
        <ol>
          {#each routeBeschrijving(id) as s}<li>{s}</li>{/each}
        </ol>
        <p class="klein"><a href={mapsRoute(bekend)}>Open deze route in Google Maps</a></p>
      </article>
    {/each}
  </section>

  <!-- Paklijst -->
  {#if extra.paklijst?.length}
    <section class="nieuwe-pagina">
      <h2>Paklijst</h2>
      {#if extra.paklijst_intro}<p>{extra.paklijst_intro}</p>{/if}
      <div class="kolommen">
        {#each extra.paklijst as g}
          <div class="pakgroep">
            <h3>{g.groep}</h3>
            <ul class="vakjes">{#each g.items as item}<li>{item}</li>{/each}</ul>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Zinnen -->
  {#if extra.zinnen?.length}
    <section class="blok-sectie">
      <h2>Handige Italiaanse zinnen</h2>
      <table class="zinnen">
        <tbody>
          {#each extra.zinnen as z}
            <tr><td lang="it"><strong>{z.it}</strong>{#if z.uitspraak}<br /><em>{z.uitspraak}</em>{/if}</td><td>{z.nl}</td></tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/if}

  <!-- Fotoverantwoording -->
  {#if alleFotos.length}
    <section class="blok-sectie credits">
      <h2>Fotoverantwoording</h2>
      <p>Alle foto's zijn vrij gelicentieerd via Wikimedia Commons, bijgesneden en verkleind.</p>
      <ul>
        {#each alleFotos as f}
          <li>{f.plek}: {f.maker}, <a href={f.bron_url}>{f.bron}</a>, {f.licentie}</li>
        {/each}
      </ul>
    </section>
  {/if}

  <p class="slot">Gegevens laatst gecontroleerd op {mooieDatum(d.meta.laatst_gecontroleerd)}. Openingstijden en prijzen kunnen veranderen.</p>
</main>

<style>
  .gids { max-width: 48rem; }
  .scherm-alleen { margin-bottom: 1.5rem; }
  .omslag { text-align: center; margin-bottom: 1.5rem; }
  .omslag img { width: 100%; height: auto; border-radius: var(--r); margin-bottom: 1rem; aspect-ratio: 3/2; object-fit: cover; }
  .boventitel { margin: 0; color: var(--terra); font-weight: 750; letter-spacing: 0.12em; text-transform: uppercase; font-size: 0.875rem; }
  .omslag h1 { font-size: 2.6rem; margin: 0.1rem 0; }
  .periode { font-weight: 650; }
  .applink { margin-top: 0.8rem; font-weight: 650; }
  .welkom { font-family: var(--serif); font-size: 1.3rem; line-height: 1.4; max-width: 34rem; margin: 0.8rem auto 0; }
  h2 { border-bottom: 2px solid var(--terra); padding-bottom: 0.2rem; margin-top: 1.6rem; }
  .programma { list-style: none; padding: 0; margin: 0; }
  .programma .item { display: grid; grid-template-columns: 6.5rem 1fr; gap: 0.75rem; padding: 0.55rem 0; border-bottom: 1px solid var(--lijn); break-inside: avoid; }
  .tijd { font-weight: 800; font-variant-numeric: tabular-nums; }
  .plek { font-weight: 600; }
  .adres, .vv, .noot { font-size: 0.9375rem; }
  .vv { color: var(--groen); font-weight: 650; }
  .noot { color: var(--tekst-2); }
  .loop { padding: 0.25rem 0 0.25rem 7.25rem; font-size: 0.875rem; font-weight: 650; color: var(--groen); }
  .label { margin-left: 0.4rem; }
  .planb { margin-top: 0.75rem; padding: 0.6rem 0.8rem; background: var(--vlak-2); border-radius: 10px; font-size: 0.9375rem; break-inside: avoid; }
  .plekkaart { display: grid; grid-template-columns: 9rem 1fr; gap: 1rem; padding: 0.8rem 0; border-bottom: 1px solid var(--lijn); break-inside: avoid; }
  .plekkaart.zonder { grid-template-columns: 1fr; }
  .plekkaart img { width: 9rem; height: 6rem; object-fit: cover; border-radius: 8px; }
  .plekkaart h3 { margin-bottom: 0.15rem; }
  .plekkaart p { margin: 0 0 0.35rem; font-size: 0.9875rem; }
  .adresregel { font-size: 0.9375rem; }
  .prak { color: var(--tekst-2); }
  .route { break-inside: avoid; padding: 0.4rem 0 0.6rem; border-bottom: 1px solid var(--lijn); }
  .route ol { padding-left: 1.3rem; margin: 0.3rem 0; font-size: 0.9375rem; }
  .kolommen { columns: 2 16rem; column-gap: 1.5rem; }
  .pakgroep { break-inside: avoid; margin-bottom: 0.8rem; }
  .vakjes { list-style: none; padding: 0; margin: 0; }
  .vakjes li { padding-left: 1.6rem; position: relative; margin: 0.25rem 0; }
  .vakjes li::before { content: ''; position: absolute; left: 0; top: 0.2rem; width: 1rem; height: 1rem; border: 2px solid var(--tekst-2); border-radius: 3px; }
  .zinnen { width: 100%; border-collapse: collapse; font-size: 0.9375rem; }
  .zinnen td { padding: 0.35rem 0.4rem; border-bottom: 1px solid var(--lijn); vertical-align: top; }
  .zinnen em { color: var(--tekst-2); font-size: 0.875rem; }
  .credits ul { font-size: 0.75rem; columns: 2 18rem; padding-left: 1rem; color: var(--tekst-2); }
  .credits a { color: inherit; }
  .slot { margin-top: 1.5rem; font-size: 0.875rem; color: var(--tekst-2); text-align: center; }

  @media print {
    .scherm-alleen { display: none; }
    .gids { max-width: none; padding: 0; font-size: 10.5pt; }
    .omslag { padding-top: 0.5cm; }
    .omslag img { max-height: 9cm; }
    .dag, .nieuwe-pagina { break-before: page; }
    h2 { margin-top: 0; }
    a { color: inherit; text-decoration: none; }
    .adres, .adresregel a { text-decoration: underline; }
  }
</style>
