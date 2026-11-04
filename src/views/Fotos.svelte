<script>
  import Icon from '../components/Icon.svelte';
  import { app, loc } from '../lib/data.svelte.js';
  const groepen = $derived(Object.entries(app.fotos ?? {}).filter(([, f]) => f.length));
</script>

<main class="pagina">
  <a class="terug" href="#/info"><Icon naam="terug" /> Info</a>
  <h1 tabindex="-1">Fotoverantwoording</h1>
  <p>Alle foto's in deze app zijn vrij gelicentieerd (onder meer via Wikimedia Commons) en staan lokaal in de app, zodat ze ook offline werken. Hartelijk dank aan de makers.</p>

  {#if !groepen.length}
    <p class="melding">Er zijn nog geen foto's toegevoegd. De app toont tot die tijd een rustige illustratie.</p>
  {:else}
    {#each groepen as [id, fotos]}
      <section>
        <h2 class="sectie-titel">{loc(id)?.naam ?? id}</h2>
        <ul class="lijst">
          {#each fotos as f}
            <li>
              <img src={`./fotos/${f.bestand}-400.webp`} alt="" width="96" height="64" loading="lazy" decoding="async" />
              <span>
                {#if f.titel}<strong>{f.titel}</strong><br />{/if}
                Maker: {f.maker}<br />
                Bron: <a href={f.bron_url} target="_blank" rel="noopener">{f.bron}</a><br />
                Licentie: {#if f.licentie_url}<a href={f.licentie_url} target="_blank" rel="noopener">{f.licentie}</a>{:else}{f.licentie}{/if}
                {#if f.bewerkt}<br /><span class="klein">Bijgesneden en verkleind.</span>{/if}
              </span>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  {/if}
</main>

<style>
  .lijst { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.75rem; }
  .lijst li { display: grid; grid-template-columns: 6rem 1fr; gap: 0.75rem; font-size: 0.9375rem; }
  img { width: 6rem; height: 4rem; object-fit: cover; border-radius: 8px; background: var(--vlak-2); }
</style>
