<script>
  import { onMount } from 'svelte';
  import Icon from './Icon.svelte';
  import { weer, haalWeer, weerTekst } from '../lib/weer.svelte.js';
  import { app } from '../lib/data.svelte.js';
  import { net } from '../lib/staat.svelte.js';

  let { datum, compact = false } = $props();
  const datums = $derived(app.data.dagen.map((d) => d.datum));

  onMount(() => haalWeer(datums));
  $effect(() => {
    if (net.online) haalWeer(datums);
  });

  let w = $derived(weer.dagen?.[datum]);
  let info = $derived(w ? weerTekst(w.code) : null);
</script>

{#if w}
  <span class="weer" class:compact>
    <Icon naam={info.icoon} maat={compact ? 22 : 28} />
    <span>
      <span class="sr-only">Weer: </span>{info.tekst}, {w.min}–{w.max} °C{#if w.regen != null}, {w.regen}% kans op regen{/if}
    </span>
  </span>
{:else if !compact}
  <span class="weer leeg">
    {#if !net.online}
      Weerbericht niet beschikbaar zonder internet.
    {:else if weer.status === 'te-vroeg'}
      Het weerbericht verschijnt ongeveer twee weken voor vertrek.
    {:else if weer.status === 'voorbij'}
      De reis is voorbij; er is geen weerbericht meer.
    {:else if weer.status === 'fout'}
      Het weerbericht lukt nu even niet. Probeer het later opnieuw.
    {:else}
      Weerbericht laden…
    {/if}
  </span>
{/if}

<style>
  .weer { display: inline-flex; align-items: center; gap: 0.45rem; font-weight: 600; }
  .compact { font-size: 0.9375rem; color: var(--tekst-2); }
  .leeg { font-weight: 400; color: var(--tekst-2); }
</style>
