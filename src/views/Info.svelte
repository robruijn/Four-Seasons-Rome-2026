<script>
  import Icon from '../components/Icon.svelte';
  import Weer from '../components/Weer.svelte';
  import { app } from '../lib/data.svelte.js';
  import { pwa, installeer, platform } from '../lib/pwa.svelte.js';
  import { weer } from '../lib/weer.svelte.js';
  import { mooieDatum } from '../lib/tijd.js';

  const d = $derived(app.data);
  const extra = $derived(d.extra ?? {});
  let tabOs = $state(platform === 'android' ? 'android' : 'ios');

  // Paklijst: afvinken wordt alleen op dit toestel bewaard.
  const PAK = 'rome-paklijst-v1';
  let ingepakt = $state((() => {
    try { return JSON.parse(localStorage.getItem(PAK) ?? '{}'); } catch { return {}; }
  })());
  function vink(sleutel) {
    ingepakt[sleutel] = !ingepakt[sleutel];
    try { localStorage.setItem(PAK, JSON.stringify(ingepakt)); } catch { /* geen opslag */ }
  }
</script>

<main class="pagina">
  <h1 tabindex="-1">Info</h1>

  <!-- Installeren -->
  <section aria-labelledby="h-inst">
    <h2 id="h-inst" class="sectie-titel"><Icon naam="installeer" /> Zet op je beginscherm</h2>
    {#if pwa.geinstalleerd}
      <p class="melding"><Icon naam="vink" /> De app staat op je beginscherm. Hij werkt ook zonder internet.</p>
    {:else}
      <p>Dan open je de reisgids met één tik, net als een gewone app. Er is geen app store nodig.</p>
      {#if pwa.installPrompt}
        <button class="knop vol" onclick={installeer}><Icon naam="installeer" /> Installeer de app</button>
      {/if}
      <div class="os" role="group" aria-label="Kies je telefoon">
        <button aria-pressed={tabOs === 'ios'} onclick={() => (tabOs = 'ios')}>iPhone (Safari)</button>
        <button aria-pressed={tabOs === 'android'} onclick={() => (tabOs = 'android')}>Android (Chrome)</button>
      </div>
      {#if tabOs === 'ios'}
        <ol class="stappen kaart">
          <li><span class="stap">1</span><span>Open deze pagina in <strong>Safari</strong>.</span></li>
          <li><span class="stap">2</span><span>Tik onderin op <strong>Deel</strong> <span class="ico"><Icon naam="ios_deel" maat={22} /></span>.</span></li>
          <li><span class="stap">3</span><span>Scroll omlaag en kies <strong>Zet op beginscherm</strong> <span class="ico"><Icon naam="plus_vak" maat={22} /></span>.</span></li>
          <li><span class="stap">4</span><span>Tik rechtsboven op <strong>Voeg toe</strong>.</span></li>
        </ol>
      {:else}
        <ol class="stappen kaart">
          <li><span class="stap">1</span><span>Open deze pagina in <strong>Chrome</strong>.</span></li>
          <li><span class="stap">2</span><span>Tik rechtsboven op het <strong>menu</strong> <span class="ico"><Icon naam="menu_punten" maat={22} /></span>.</span></li>
          <li><span class="stap">3</span><span>Kies <strong>App installeren</strong> of <strong>Toevoegen aan startscherm</strong>.</span></li>
          <li><span class="stap">4</span><span>Bevestig met <strong>Installeren</strong>.</span></li>
        </ol>
      {/if}
      <p class="klein">Open de app daarna één keer met internet, dan werkt alles behalve de kaart en Street View ook offline.</p>
    {/if}
  </section>

  <!-- Paklijst -->
  {#if extra.paklijst?.length}
    <section aria-labelledby="h-pak">
      <h2 id="h-pak" class="sectie-titel"><Icon naam="vink" /> Paklijst</h2>
      {#if extra.paklijst_intro}<p>{extra.paklijst_intro}</p>{/if}
      {#each extra.paklijst as g}
        <div class="kaart pak">
          <h3>{g.groep}</h3>
          <ul>
            {#each g.items as item}
              {@const k = g.groep + '|' + item}
              <li>
                <label>
                  <input type="checkbox" checked={!!ingepakt[k]} onchange={() => vink(k)} />
                  <span>{item}</span>
                </label>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
      <p class="klein">Afvinken wordt alleen op je eigen telefoon bewaard.</p>
    </section>
  {/if}

  <!-- Weer -->
  <section aria-labelledby="h-weer">
    <h2 id="h-weer" class="sectie-titel"><Icon naam="wolkzon" /> Weer in Rome</h2>
    <ul class="weer kaart">
      {#each d.dagen as dag}
        <li><strong>{dag.label.split(' ')[0]}</strong> <Weer datum={dag.datum} /></li>
      {/each}
    </ul>
    {#if weer.opgehaald}
      <p class="klein">Bijgewerkt: {new Date(weer.opgehaald).toLocaleString('nl-NL', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}. Bron: Open-Meteo.</p>
    {/if}
  </section>

  <!-- Plan B -->
  {#if extra.plan_b}
    <section aria-labelledby="h-planb">
      <h2 id="h-planb" class="sectie-titel"><Icon naam="paraplu" /> Plan B bij regen</h2>
      {#each d.dagen as dag}
        {#if extra.plan_b[dag.datum]}
          <div class="kaart"><h3>{dag.label}</h3><p>{extra.plan_b[dag.datum]}</p></div>
        {/if}
      {/each}
    </section>
  {/if}

  <!-- Zinnen -->
  {#if extra.zinnen?.length}
    <section aria-labelledby="h-zin">
      <h2 id="h-zin" class="sectie-titel"><Icon naam="taal" /> Handige Italiaanse zinnen</h2>
      <dl class="zinnen">
        {#each extra.zinnen as z}
          <div class="zin">
            <dt lang="it">{z.it}</dt>
            <dd>{z.nl}{#if z.uitspraak}<span class="klein uitspraak">Zeg: {z.uitspraak}</span>{/if}</dd>
          </div>
        {/each}
      </dl>
    </section>
  {/if}

  <!-- Over -->
  <section aria-labelledby="h-over">
    <h2 id="h-over" class="sectie-titel"><Icon naam="info" /> Over deze app</h2>
    <ul class="links">
      <li><a href="#/gids"><Icon naam="programma" /> Hele reisgids (afdrukken of PDF) <Icon naam="verder" /></a></li>
      <li><a href="#/fotos"><Icon naam="camera" /> Fotoverantwoording <Icon naam="verder" /></a></li>
    </ul>
    <p class="klein">
      {d.meta.titel}, {d.meta.periode.replace('t/m', 'tot en met')}. Gegevens laatst gecontroleerd op {mooieDatum(d.meta.laatst_gecontroleerd)}.
      Openingstijden en prijzen kunnen veranderen. Geen account, geen tracking en geen advertenties.
    </p>
  </section>
</main>

<style>
  .os { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin: 0.75rem 0 0.5rem; }
  .os button {
    min-height: 3rem; border-radius: 12px; border: 2px solid var(--lijn);
    background: var(--vlak); color: var(--tekst); font: inherit; font-weight: 650; cursor: pointer;
  }
  .os button[aria-pressed='true'] { background: var(--groen); color: var(--bg); border-color: var(--groen); }
  .stappen { list-style: none; padding: 1rem; display: grid; gap: 0.8rem; }
  .stappen li { display: grid; grid-template-columns: 2rem 1fr; gap: 0.6rem; align-items: center; }
  .stap {
    width: 2rem; height: 2rem; border-radius: 50%; display: grid; place-items: center;
    background: var(--terra); color: var(--terra-tekst); font-weight: 800;
  }
  .ico {
    display: inline-grid; place-items: center; vertical-align: middle;
    width: 2rem; height: 2rem; border-radius: 8px; background: var(--vlak-2); color: #1a73e8;
  }
  .weer { list-style: none; display: grid; gap: 0.6rem; }
  .weer li { display: grid; grid-template-columns: 5.5rem 1fr; align-items: center; }
  .zinnen { margin: 0; display: grid; gap: 0.5rem; }
  .zin { background: var(--vlak); border: 1px solid var(--lijn); border-radius: var(--r); padding: 0.7rem 0.9rem; }
  .zin dt { font-family: var(--serif); font-size: 1.3rem; font-weight: 700; color: var(--terra); }
  .zin dd { margin: 0; }
  .uitspraak { display: block; font-style: italic; }
  .pak h3 { margin-bottom: 0.3rem; }
  .pak ul { list-style: none; padding: 0; margin: 0; }
  .pak label { display: flex; gap: 0.7rem; align-items: center; min-height: 2.75rem; cursor: pointer; }
  .pak input { width: 1.4rem; height: 1.4rem; flex: none; accent-color: var(--groen); }
  .pak input:checked + span { text-decoration: line-through; color: var(--tekst-2); }
  .links { list-style: none; padding: 0; margin: 0 0 0.75rem; }
  .links a {
    display: grid; grid-template-columns: auto 1fr auto; gap: 0.6rem; align-items: center;
    min-height: 3.25rem; padding: 0.6rem 0.9rem;
    background: var(--vlak); border: 1px solid var(--lijn); border-radius: var(--r);
    color: inherit; text-decoration: none; font-weight: 650;
  }
</style>
