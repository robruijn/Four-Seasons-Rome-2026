<script>
  // Adreskaart: adres, kopieer-knop, Google Maps (te voet), telefoon.
  // Niet-geverifieerde gegevens krijgen een zichtbare markering in tekst.
  import Icon from './Icon.svelte';
  import { mapsRouteNaar, telLink } from '../lib/geo.js';
  import { onbevestigd } from '../lib/data.svelte.js';

  let { locatie, modus = 'walking', titel = 'Adres' } = $props();
  let gekopieerd = $state(false);

  async function kopieer() {
    const tekst = `${locatie.naam}\n${locatie.adres}`;
    try {
      await navigator.clipboard.writeText(tekst);
    } catch {
      // Oudere browsers: valt terug op een verborgen tekstvak
      const t = document.createElement('textarea');
      t.value = tekst;
      t.setAttribute('readonly', '');
      t.style.position = 'fixed';
      t.style.opacity = '0';
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    gekopieerd = true;
    setTimeout(() => (gekopieerd = false), 2500);
  }

  const telefoons = $derived(locatie.telefoon ?? []);
  const telOnzeker = $derived(locatie.telefoon_status || locatie.telefoon_opmerking);
</script>

<section class="kaart adres" aria-label={titel}>
  <h3 class="sr-only">{titel}</h3>
  <p class="regel">
    <Icon naam="pin" />
    <span>
      <span class="dik">{locatie.adres}</span>
      {#if locatie.adres_status}
        <br /><span class="label"><Icon naam="let_op" maat={14} /> Adres nog te controleren</span>
      {/if}
    </span>
  </p>
  <div class="knoppen">
    <button class="knop licht" onclick={kopieer}>
      <Icon naam={gekopieerd ? 'vink' : 'kopie'} /> {gekopieerd ? 'Gekopieerd' : 'Kopieer adres'}
    </button>
    <a class="knop" href={mapsRouteNaar(locatie, modus)} target="_blank" rel="noopener">
      <Icon naam="route" /> Open in Google Maps
    </a>
  </div>
  <p class="sr-only" role="status">{gekopieerd ? 'Adres gekopieerd' : ''}</p>

  {#if telefoons.length}
    <div class="tel">
      {#each telefoons as nr}
        <a class="knop licht" href={telLink(nr)}><Icon naam="telefoon" /> Bel {nr}</a>
      {/each}
      {#if telOnzeker}
        <p class="klein"><span class="label"><Icon naam="let_op" maat={14} /> Nummer nog te controleren</span>
          {#if locatie.telefoon_opmerking && !onbevestigd(locatie.telefoon_opmerking)} {locatie.telefoon_opmerking}{/if}</p>
      {/if}
    </div>
  {/if}
</section>

<style>
  .regel { display: flex; gap: 0.6rem; align-items: flex-start; margin: 0; font-size: 1.0625rem; }
  .regel > :global(.icon) { flex: none; color: var(--terra); margin-top: 0.1rem; }
  .regel .label { margin-top: 0.3rem; }
  .tel { display: grid; gap: 0.5rem; margin-top: 0.5rem; }
  .tel .knop { justify-content: flex-start; }
  .tel p { margin: 0; }
</style>
