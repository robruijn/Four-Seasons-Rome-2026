<script>
  // Verborgen beheerlijst (#/beheer): niet-geverifieerde gegevens en mogelijke
  // inconsistenties. Niet in het menu; bedoeld voor de organisator.
  // De open_vragen uit programma.json worden bewust niet getoond.
  import { app } from '../lib/data.svelte.js';
  import { controleer } from '../lib/controle.js';
  const lijst = $derived(controleer(app.data));
  const groepen = [
    ['fout', 'Fouten'],
    ['bevestigen', 'Nog te bevestigen'],
    ['let_op', 'Let op']
  ];
</script>

<main class="pagina">
  <h1 tabindex="-1">Beheerlijst</h1>
  <p class="klein">Alleen voor de organisator. Pas programma.json aan en publiceer opnieuw; deze lijst werkt zich vanzelf bij.</p>
  {#each groepen as [niveau, titel]}
    {@const items = lijst.filter((x) => x.niveau === niveau)}
    {#if items.length}
      <h2 class="sectie-titel">{titel} ({items.length})</h2>
      <ul class="kaart">
        {#each items as i}<li><strong>{i.waar}</strong>: {i.tekst}</li>{/each}
      </ul>
    {/if}
  {/each}
</main>

<style>
  ul { padding-left: 1.75rem; display: grid; gap: 0.4rem; }
</style>
