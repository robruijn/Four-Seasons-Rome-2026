<script>
  import Icon from '../components/Icon.svelte';
  import LocatieInhoud from '../components/LocatieInhoud.svelte';
  import StreetView from '../components/StreetView.svelte';
  import { loc, blokkenMetLocatie } from '../lib/data.svelte.js';
  import { mooieDag } from '../lib/tijd.js';

  let { id } = $props();
  const l = $derived(loc(id));
  const momenten = $derived(blokkenMetLocatie(id));
</script>

<main class="pagina">
  <a class="terug" href="#/kaart" onclick={(e) => { if (history.length > 1) { e.preventDefault(); history.back(); } }}>
    <Icon naam="terug" /> Terug
  </a>
  {#if !l}
    <h1 tabindex="-1">Plek niet gevonden</h1>
  {:else}
    <h1 tabindex="-1">{l.naam}</h1>
    <LocatieInhoud locatie={l} />

    {#if momenten.length}
      <h2 class="sectie-titel"><Icon naam="programma" /> In het programma</h2>
      <ul class="momenten">
        {#each momenten as b}
          <li><a href={'#/blok/' + b.id}><span><strong>{b.titel}</strong><br /><span class="klein">{mooieDag(b.datum)} · {b.van}–{b.tot}</span></span><Icon naam="verder" /></a></li>
        {/each}
      </ul>
    {/if}

    {#if l.lat != null}
      <StreetView stops={[l]} titel="Street View van deze plek" />
    {/if}
  {/if}
</main>

<style>
  .momenten { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
  .momenten a {
    display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;
    min-height: 3.25rem; padding: 0.7rem 0.9rem;
    background: var(--vlak); border: 1px solid var(--lijn); border-radius: var(--r);
    color: inherit; text-decoration: none;
  }
</style>
