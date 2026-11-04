<script>
  // Street View per stop, met Vorige / Volgende.
  // - Laadt pas na een tik (lui): bespaart data en kosten.
  // - Vooraf melding dat Street View internet nodig heeft.
  // - Per stop eerst StreetViewService (metadata, gratis): is er beeld binnen 60 m,
  //   anders 200 m? Zo niet, dan een nette melding met de gegevens van de stop.
  // - Er wordt geen Google-beeld opgeslagen.
  import { untrack } from 'svelte';
  import Icon from './Icon.svelte';
  import { laadMaps, maps } from '../lib/maps.svelte.js';
  import { net } from '../lib/staat.svelte.js';
  import { richting } from '../lib/geo.js';

  /** stops: [{id, naam, adres, lat, lng}] */
  let { stops, titel = 'Street View' } = $props();

  let gestart = $state(false);
  let i = $state(0);
  let toestand = $state('idle'); // idle | laden | beeld | geen | fout
  let el = $state();
  let gm = null, panorama = null, dienst = null;

  const stop = $derived(stops[i]);

  async function toon(index) {
    if (!net.online) {
      toestand = 'fout';
      return;
    }
    toestand = 'laden';
    const s = stops[index];
    try {
      gm ??= await laadMaps();
      const sv = await gm.importLibrary('streetView');
      dienst ??= new sv.StreetViewService();
      let data = null;
      for (const radius of [60, 200]) {
        try {
          const res = await dienst.getPanorama({
            location: { lat: s.lat, lng: s.lng },
            radius,
            preference: sv.StreetViewPreference.NEAREST,
            sources: [sv.StreetViewSource.OUTDOOR]
          });
          data = res.data;
          break;
        } catch {
          /* geen beeld binnen deze straal */
        }
      }
      if (index !== i) return; // gebruiker is alweer verder getikt
      if (!data) {
        toestand = 'geen';
        return;
      }
      toestand = 'beeld';
      await Promise.resolve();
      const pos = data.location.latLng;
      const kijk = richting({ lat: pos.lat(), lng: pos.lng() }, s);
      if (!panorama) {
        panorama = new sv.StreetViewPanorama(el, {
          pano: data.location.pano,
          pov: { heading: kijk, pitch: 8 },
          zoom: 0,
          addressControl: false,
          motionTracking: false,
          motionTrackingControl: false,
          fullscreenControl: true,
          showRoadLabels: true
        });
      } else {
        panorama.setPano(data.location.pano);
        panorama.setPov({ heading: kijk, pitch: 8 });
      }
    } catch {
      if (index === i) toestand = 'fout';
    }
  }

  function begin() {
    gestart = true;
    toon(i);
  }
  function naar(n) {
    i = n;
    toon(n);
  }

  // Verbinding terug terwijl Street View open stond met een fout: opnieuw proberen.
  $effect(() => {
    const online = net.online;
    untrack(() => {
      if (online && gestart && toestand === 'fout') toon(i);
    });
  });
</script>

<section class="sv" aria-labelledby="sv-titel">
  <h2 id="sv-titel" class="sectie-titel"><Icon naam="oog" /> {titel}</h2>

  {#if !stops.length}
    <p class="melding">Voor deze route zijn nog geen Street View-stops bekend.</p>
  {:else if !maps.geconfigureerd}
    <div class="melding waarschuwing"><Icon naam="let_op" /><p>Street View is nog niet ingesteld (de Google Maps-sleutel ontbreekt). De beheerder kan dit regelen.</p></div>
  {:else if !gestart}
    <div class="kaart intro">
      <p>Verken de route vooraf vanaf straatniveau, stop voor stop ({stops.length} {stops.length === 1 ? 'stop' : 'stops'}).</p>
      <p class="klein"><Icon naam="info" maat={16} /> Street View heeft internet nodig en gebruikt ongeveer 1 tot 3 MB per stop. Op wifi is het het prettigst.</p>
      {#if net.online}
        <button class="knop vol" onclick={begin}><Icon naam="oog" /> Bekijk Street View</button>
      {:else}
        <p class="melding"><Icon naam="offline" /> Je bent offline. Street View werkt zodra je weer verbinding hebt.</p>
      {/if}
    </div>
  {:else}
    <div class="stopkop" aria-live="polite">
      <span class="label zeker">Stop {i + 1} van {stops.length}</span>
      <strong>{stop.naam}</strong>
    </div>

    <div class="vak">
      <div bind:this={el} class="pano" class:verborgen={toestand !== 'beeld'} role="region" aria-label={`Street View: ${stop.naam}`}></div>
      {#if toestand === 'laden'}
        <p class="over" role="status">Street View laden…</p>
      {:else if toestand === 'geen'}
        <div class="over leeg">
          <p><strong>Hier is geen Street View-beeld beschikbaar.</strong></p>
          <p>{stop.naam}<br />{stop.adres}</p>
          <p class="klein">Gebruik de routebeschrijving hieronder of open de plek in Google Maps.</p>
        </div>
      {:else if toestand === 'fout'}
        <div class="over leeg">
          <p><Icon naam="offline" maat={18} /> {net.online ? 'Street View laadt nu niet. Probeer het zo nog eens.' : 'Je bent offline. Street View komt terug zodra je verbinding hebt.'}</p>
          {#if net.online}<button class="knop licht" onclick={() => toon(i)}>Opnieuw proberen</button>{/if}
        </div>
      {/if}
    </div>

    <div class="nav">
      <button class="knop licht" disabled={i === 0} onclick={() => naar(i - 1)}>
        <Icon naam="terug" /> Vorige
      </button>
      <button class="knop" disabled={i === stops.length - 1} onclick={() => naar(i + 1)}>
        Volgende <Icon naam="verder" />
      </button>
    </div>
  {/if}
</section>

<style>
  .intro p { display: flex; gap: 0.4rem; align-items: flex-start; }
  .intro :global(.icon) { flex: none; margin-top: 0.2rem; }
  .stopkop { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
  .vak { position: relative; }
  .pano { height: min(60vh, 26rem); border-radius: var(--r); overflow: hidden; background: var(--vlak-2); }
  .pano.verborgen { visibility: hidden; }
  .over {
    position: absolute; inset: 0; margin: 0;
    display: grid; place-content: center; text-align: center; gap: 0.25rem;
    padding: 1rem; border-radius: var(--r);
    background: var(--vlak-2);
  }
  .over p { margin: 0 0 0.4rem; }
  .nav { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.6rem; }
</style>
