<script>
  import Icon from '../components/Icon.svelte';
  import Adres from '../components/Adres.svelte';
  import { app, loc, onbevestigd, aantalTaxis } from '../lib/data.svelte.js';
  import { mapsRouteNaar, mapsZoek, telLink } from '../lib/geo.js';

  const p = $derived(app.data.praktisch);
  const hotel = $derived(loc(p.hotel));
  const reisleider = $derived(app.data.meta.reisleider_telefoon);
  const reisleiderBekend = $derived(reisleider && !onbevestigd(reisleider));
  const taxis = $derived(aantalTaxis());
  let gedeeld = $state('');

  async function deelHotel() {
    const tekst = `${hotel.naam}, ${hotel.adres}`;
    const url = mapsZoek(hotel);
    try {
      if (navigator.share) {
        await navigator.share({ title: hotel.naam, text: tekst, url });
        return;
      }
      await navigator.clipboard.writeText(`${tekst}\n${url}`);
      gedeeld = 'Hotelgegevens gekopieerd. Plak ze in een bericht.';
    } catch {
      /* gebruiker annuleerde het delen */
    }
  }
</script>

<main class="pagina">
  <h1 tabindex="-1">Praktisch</h1>

  <a class="nood" href="tel:112">
    <Icon naam="nood" maat={34} />
    <span><strong>Noodnummer {p.noodnummer}</strong><span>Politie, ambulance, brandweer. Gratis, ook zonder beltegoed.</span></span>
  </a>

  <!-- Hotel -->
  <section aria-labelledby="h-hotel">
    <h2 id="h-hotel" class="sectie-titel"><Icon naam="hotel" /> {hotel.naam}</h2>
    <a class="knop vol groot" href={mapsRouteNaar(hotel, 'walking')} target="_blank" rel="noopener">
      <Icon naam="route" /> Toon me de weg terug
    </a>
    <Adres locatie={hotel} titel="Adres hotel" />
    <div class="knoppen">
      <button class="knop licht" onclick={deelHotel}><Icon naam="deel" /> Deel hotellocatie</button>
    </div>
    {#if gedeeld}<p class="klein" role="status">{gedeeld}</p>{/if}
    {#if hotel.tekst}<p class="klein">{hotel.tekst}</p>{/if}
  </section>

  <!-- Reisleider -->
  <section aria-labelledby="h-rl">
    <h2 id="h-rl" class="sectie-titel"><Icon naam="groep" /> Reisleider</h2>
    <div class="kaart">
      {#if reisleiderBekend}
        <a class="knop vol" href={telLink(reisleider)}><Icon naam="telefoon" /> Bel de reisleider ({reisleider})</a>
      {:else}
        <p><span class="label"><Icon naam="let_op" maat={14} /> Nummer volgt</span></p>
        <p class="klein">Het telefoonnummer van de reisleider wordt nog toegevoegd. Sla het daarna ook op in je telefoon.</p>
      {/if}
    </div>
  </section>

  <!-- Taxi -->
  <section aria-labelledby="h-taxi">
    <h2 id="h-taxi" class="sectie-titel"><Icon naam="taxi" /> Taxi</h2>
    <div class="kaart">
      {#if taxis}<p class="groottaxi"><strong>{taxis} taxi's</strong> voor de groep</p>{/if}
      <p>{p.taxi}</p>
      {#if p.taxi_afspraak}<p class="afspraak"><Icon naam="klok" /> <span>{p.taxi_afspraak}</span></p>{/if}
      <p class="klein">Neem alleen officiële witte taxi's met het logo van Roma Capitale en een vergunningsnummer.</p>
    </div>
  </section>

  <!-- Zorg -->
  {#each [['apotheek', 'apotheek', 'Apotheek in de buurt'], ['ziekenhuis', 'nood', 'Ziekenhuis']] as [k, icoon, kop]}
    {#if p[k]}
      {@const z = p[k]}
      <section aria-labelledby={'h-' + k}>
        <h2 id={'h-' + k} class="sectie-titel"><Icon naam={icoon} /> {kop}</h2>
        <p class="dik">{z.naam}
          {#if z.status && onbevestigd(z.status)}<span class="label"><Icon naam="let_op" maat={14} /> nog te bevestigen</span>{/if}</p>
        {#if z.noot}<p class="klein">{z.noot}</p>{/if}
        <Adres locatie={{ ...z, id: k }} titel={'Adres ' + kop} />
      </section>
    {/if}
  {/each}
</main>

<style>
  .nood {
    display: flex; gap: 0.9rem; align-items: center;
    padding: 1rem 1.1rem; margin-bottom: 0.5rem;
    border-radius: var(--r);
    background: #b3261e; color: #fff; text-decoration: none;
    min-height: 4.5rem;
  }
  .nood span { display: grid; }
  .nood strong { font-size: 1.35rem; }
  .groot { min-height: 3.6rem; font-size: 1.15rem; margin-bottom: 0.75rem; }
  .groottaxi { font-size: 1.3rem; color: var(--terra); }
  .afspraak { display: flex; gap: 0.5rem; align-items: flex-start; font-weight: 650; }
  .afspraak :global(.icon) { flex: none; margin-top: 0.1rem; }
</style>
