<script>
  import { onMount } from 'svelte';
  import Icon from './components/Icon.svelte';
  import Groepscode from './components/Groepscode.svelte';
  import Programma from './views/Programma.svelte';
  import Blok from './views/Blok.svelte';
  import Locatie from './views/Locatie.svelte';
  import Route from './views/Route.svelte';
  import Kaart from './views/Kaart.svelte';
  import Info from './views/Info.svelte';
  import Praktisch from './views/Praktisch.svelte';
  import Fotos from './views/Fotos.svelte';
  import Beheer from './views/Beheer.svelte';
  import Gids from './views/Gids.svelte';
  import { app, laadData } from './lib/data.svelte.js';
  import { route, net } from './lib/staat.svelte.js';
  import { pwa, startPwa, vernieuw } from './lib/pwa.svelte.js';
  import { alOntgrendeld } from './lib/groepscode.js';
  import { testklok } from './lib/tijd.js';

  let open = $state(alOntgrendeld());

  onMount(() => {
    laadData();
    startPwa();
  });

  const tabs = [
    { pad: '', naam: 'Programma', icoon: 'programma', hoort: ['', 'dag', 'blok', 'route'] },
    { pad: 'kaart', naam: 'Kaart', icoon: 'kaart', hoort: ['kaart', 'locatie'] },
    { pad: 'info', naam: 'Info', icoon: 'info', hoort: ['info', 'fotos', 'gids'] },
    { pad: 'praktisch', naam: 'Praktisch', icoon: 'praktisch', hoort: ['praktisch'] }
  ];
  let sectie = $derived(route.pad[0] ?? '');
</script>

{#if !open}
  <Groepscode onklaar={() => (open = true)} />
{:else}
  <a class="skip sr-only" href="#inhoud">Naar de inhoud</a>

  {#if !net.online}
    <div class="statusbalk" role="status">
      <Icon naam="offline" maat={18} /> Offline. Programma, adressen en foto's werken gewoon.
    </div>
  {/if}
  {#if testklok}
    <div class="statusbalk test" role="status">Testklok actief (?nu=…). Verwijder dit uit de link voor de echte tijd.</div>
  {/if}

  <div id="inhoud">
    {#if app.fout}
      <main class="pagina">
        <h1 tabindex="-1">Even geduld</h1>
        <div class="melding waarschuwing"><Icon naam="let_op" /><p>{app.fout}</p></div>
        <button class="knop" onclick={() => location.reload()}>Opnieuw proberen</button>
      </main>
    {:else if !app.data}
      <main class="pagina laden" aria-busy="true"><p role="status">Programma laden…</p></main>
    {:else if sectie === '' || sectie === 'dag'}
      <Programma dagParam={route.pad[1]} />
    {:else if sectie === 'blok'}
      {#key route.pad[1]}<Blok id={route.pad[1]} />{/key}
    {:else if sectie === 'locatie'}
      {#key route.pad[1]}<Locatie id={route.pad[1]} />{/key}
    {:else if sectie === 'route'}
      {#key route.pad[1]}<Route id={route.pad[1]} />{/key}
    {:else if sectie === 'kaart'}
      <Kaart />
    {:else if sectie === 'info'}
      <Info />
    {:else if sectie === 'praktisch'}
      <Praktisch />
    {:else if sectie === 'fotos'}
      <Fotos />
    {:else if sectie === 'gids'}
      <Gids />
    {:else if sectie === 'beheer'}
      <Beheer />
    {:else}
      <main class="pagina">
        <h1 tabindex="-1">Pagina niet gevonden</h1>
        <p><a href="#/">Terug naar het programma</a></p>
      </main>
    {/if}
  </div>

  {#if pwa.nieuweVersie}
    <div class="toast" role="status">
      <span>Er is een nieuwe versie van het programma.</span>
      <button class="knop" onclick={vernieuw}>Vernieuwen</button>
    </div>
  {:else if pwa.offlineKlaar}
    <div class="toast" role="status"><Icon naam="vink" /> <span>Klaar: de app werkt nu ook zonder internet.</span></div>
  {/if}

  <nav class="tabbalk" aria-label="Hoofdmenu">
    {#each tabs as t}
      {@const actief = t.hoort.includes(sectie)}
      <a href={'#/' + t.pad} aria-current={actief ? 'page' : undefined} class:actief>
        <Icon naam={t.icoon} maat={26} />
        <span>{t.naam}</span>
      </a>
    {/each}
  </nav>
{/if}

<style>
  .skip:focus {
    position: fixed !important; top: 0.5rem; left: 0.5rem;
    width: auto; height: auto; clip: auto;
    background: var(--vlak); padding: 0.75rem 1rem; z-index: 100;
  }
  .statusbalk {
    display: flex; gap: 0.5rem; align-items: center; justify-content: center;
    padding: 0.5rem 1rem;
    padding-top: calc(0.5rem + env(safe-area-inset-top));
    background: var(--groen); color: var(--bg);
    font-size: 0.9375rem; font-weight: 600; text-align: center;
  }
  .statusbalk.test { background: var(--geel-zacht); color: var(--tekst); }
  .laden { opacity: 0.8; }

  .tabbalk {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 20;
    display: grid; grid-template-columns: repeat(4, 1fr);
    background: var(--vlak);
    border-top: 1px solid var(--lijn);
    padding-bottom: env(safe-area-inset-bottom);
  }
  .tabbalk a {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.1rem;
    min-height: var(--nav-h);
    color: var(--tekst-2);
    text-decoration: none;
    font-size: 0.8125rem; font-weight: 600;
    position: relative;
  }
  .tabbalk a.actief { color: var(--terra); }
  /* Actieve tab niet alleen via kleur: ook een balk en vetgedrukt label */
  .tabbalk a.actief::before {
    content: ''; position: absolute; top: 0; left: 25%; right: 25%;
    height: 3px; border-radius: 0 0 3px 3px; background: var(--terra);
  }
  .tabbalk a.actief span { font-weight: 800; }

  .toast {
    position: fixed; z-index: 30;
    left: 0.75rem; right: 0.75rem;
    bottom: calc(var(--nav-h) + 0.75rem + env(safe-area-inset-bottom));
    max-width: 40rem; margin: 0 auto;
    display: flex; align-items: center; gap: 0.75rem; justify-content: space-between;
    background: var(--groen); color: var(--bg);
    padding: 0.6rem 0.6rem 0.6rem 1rem;
    border-radius: var(--r);
    box-shadow: 0 6px 24px rgb(0 0 0 / 0.25);
    font-weight: 600;
  }
  .toast .knop { background: var(--bg); color: var(--groen); border-color: var(--bg); flex: none; }

  @media (orientation: landscape) and (max-height: 500px) {
    :global(:root) { --nav-h: 3.4rem; }
    .tabbalk a { flex-direction: row; gap: 0.4rem; }
  }
</style>
