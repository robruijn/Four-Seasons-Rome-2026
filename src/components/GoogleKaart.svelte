<script>
  // Live Google-kaart. Alleen online; laadt vanzelf zodra er weer verbinding is.
  // Offline of zonder API-sleutel toont de ouder een schematische kaart (Schema.svelte).
  import { untrack } from 'svelte';
  import Icon from './Icon.svelte';
  import { laadMaps, maps, MAP_ID, kleurSchema } from '../lib/maps.svelte.js';
  import { net } from '../lib/staat.svelte.js';

  /** punten: [{lat, lng, label, naam, href?}] */
  let { punten, lijn = false, wandelen = false, onmaat = null, hoogte = '18rem', label = 'Kaart' } = $props();

  let el = $state();
  let status = $state('wacht'); // wacht | laden | klaar | fout
  let routeBron = $state(null); // 'google' | 'schets'

  async function start() {
    status = 'laden';
    try {
      const gm = await laadMaps();
      const { Map, Polyline } = await gm.importLibrary('maps');
      const { AdvancedMarkerElement } = await gm.importLibrary('marker');
      const kaart = new Map(el, {
        mapId: MAP_ID,
        colorScheme: kleurSchema(gm),
        gestureHandling: 'cooperative', // één vinger scrolt de pagina, twee vingers de kaart
        clickableIcons: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        center: punten[0],
        zoom: 15
      });

      const grenzen = new gm.LatLngBounds();
      for (const p of punten) {
        const pin = document.createElement('div');
        pin.className = 'gm-pin';
        pin.textContent = p.label;
        const m = new AdvancedMarkerElement({ map: kaart, position: { lat: p.lat, lng: p.lng }, content: pin, title: p.naam, gmpClickable: !!p.href });
        if (p.href) m.addEventListener('gmp-click', () => (location.hash = p.href));
        grenzen.extend({ lat: p.lat, lng: p.lng });
      }
      if (punten.length > 1) kaart.fitBounds(grenzen, 48);

      if (lijn && punten.length > 1) {
        let pad = null;
        if (wandelen) pad = await looproute(gm);
        if (pad) {
          routeBron = 'google';
          new Polyline({ map: kaart, path: pad, strokeColor: '#a8462a', strokeOpacity: 0.9, strokeWeight: 5 });
        } else {
          // Fallback: gestippelde lijn tussen de stops, zonder extra API-kosten.
          routeBron = 'schets';
          new Polyline({
            map: kaart,
            path: punten.map((p) => ({ lat: p.lat, lng: p.lng })),
            strokeOpacity: 0,
            icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.9, strokeColor: '#a8462a', scale: 3 }, offset: '0', repeat: '14px' }]
          });
        }
      }
      status = 'klaar';
    } catch {
      status = 'fout';
    }
  }

  /** Looproute via de Routes-bibliotheek van Maps JS. Mislukt dit, dan null (stil). */
  async function looproute(gm) {
    try {
      const { Route } = await gm.importLibrary('routes');
      if (!Route?.computeRoutes) return null;
      const [eerste, ...rest] = punten;
      const laatste = rest.pop();
      const { routes } = await Route.computeRoutes({
        origin: { lat: eerste.lat, lng: eerste.lng },
        destination: { lat: laatste.lat, lng: laatste.lng },
        intermediates: rest.map((p) => ({ location: { lat: p.lat, lng: p.lng } })),
        travelMode: 'WALKING',
        fields: ['path', 'distanceMeters', 'durationMillis']
      });
      const r = routes?.[0];
      if (!r?.path?.length) return null;
      if (onmaat && r.distanceMeters) onmaat({ meters: r.distanceMeters, minuten: (r.durationMillis ?? 0) / 60000 });
      return r.path.map((p) => ({ lat: p.lat, lng: p.lng }));
    } catch {
      return null;
    }
  }

  // Start zodra we online zijn (ook als de verbinding later terugkomt).
  $effect(() => {
    const kan = net.online && maps.geconfigureerd && el;
    untrack(() => {
      if (kan && (status === 'wacht' || status === 'fout')) start();
    });
  });
</script>

<div class="kaartvak" style:--h={hoogte}>
  <div bind:this={el} class="gkaart" role="region" aria-label={label}></div>
  {#if maps.sleutelFout}
    <p class="over">De kaart kan nu niet laden (sleutelprobleem). Gebruik de knop "Open in Google Maps".</p>
  {:else if status === 'laden'}
    <p class="over" role="status">Kaart laden…</p>
  {:else if status === 'fout'}
    <p class="over">De kaart laadt nu niet. Dat gebeurt vanzelf zodra de verbinding beter is.</p>
  {/if}
</div>
{#if routeBron === 'schets'}
  <p class="klein">De stippellijn verbindt de stops; het echte looppad volgt de straten. Voor stap-voor-stap navigatie: "Open in Google Maps".</p>
{/if}

<style>
  .kaartvak { position: relative; margin-bottom: 0.75rem; }
  .gkaart {
    height: var(--h); min-height: 14rem;
    border-radius: var(--r); overflow: hidden;
    background: var(--vlak-2); border: 1px solid var(--lijn);
  }
  .over {
    position: absolute; inset: auto 0.75rem 0.75rem 0.75rem; margin: 0;
    background: var(--vlak); padding: 0.6rem 0.8rem; border-radius: 10px;
    font-size: 0.9375rem; box-shadow: var(--schaduw);
  }
  :global(.gm-pin) {
    min-width: 1.9rem; height: 1.9rem; padding: 0 0.35rem;
    display: grid; place-items: center;
    background: #a8462a; color: #fff; border: 2px solid #fff;
    border-radius: 999px; font: 700 0.95rem/1 system-ui, sans-serif;
    box-shadow: 0 2px 6px rgb(0 0 0 / 0.35);
  }
</style>
