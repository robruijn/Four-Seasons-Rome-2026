<script>
  // Inhoud van een locatie: foto's, adres + knoppen, toelichting, praktisch.
  import Icon from './Icon.svelte';
  import Adres from './Adres.svelte';
  import Galerij from './Galerij.svelte';
  import { app, fotosVan } from '../lib/data.svelte.js';
  import { mooieDatum } from '../lib/tijd.js';

  let { locatie, kop = 'h2', modus = 'walking' } = $props();
  const gecontroleerd = $derived(mooieDatum(app.data.meta.laatst_gecontroleerd));
  // Prijzen en openingstijden: alleen tonen met "laatst gecontroleerd op".
  const metPrijsOfTijd = (t) => /€|\bopen\b|gesloten|\d{1,2}:\d{2}|ticket|kaartje/i.test(t ?? '');
</script>

<Galerij {locatie} fotos={fotosVan(locatie.id)} />

<Adres {locatie} {modus} />

{#if locatie.tekst}
  <section aria-label="Over deze plek">
    <svelte:element this={kop} class="sectie-titel">Over deze plek</svelte:element>
    <p class="verhaal">{locatie.tekst}</p>
  </section>
{/if}

{#if locatie.praktisch}
  <section class="kaart praktisch" aria-label="Praktisch">
    <svelte:element this={kop} class="sectie-titel klein-kop"><Icon naam="info" /> Praktisch</svelte:element>
    <p>{locatie.praktisch}</p>
    {#if metPrijsOfTijd(locatie.praktisch) || metPrijsOfTijd(locatie.tekst)}
      <p class="klein">Prijzen en tijden: laatst gecontroleerd op {gecontroleerd}. Ze kunnen veranderen.</p>
    {/if}
  </section>
{/if}

<style>
  .verhaal { font-size: 1.125rem; line-height: 1.6; }
  .praktisch { border-left: 4px solid var(--groen); }
  .klein-kop { margin-top: 0; font-size: 1.25rem; }
</style>
