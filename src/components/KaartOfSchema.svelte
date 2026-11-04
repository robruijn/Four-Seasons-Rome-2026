<script>
  // Online + sleutel: live Google-kaart. Anders: schematische kaart (werkt offline).
  import GoogleKaart from './GoogleKaart.svelte';
  import Schema from './Schema.svelte';
  import { maps } from '../lib/maps.svelte.js';
  import { net } from '../lib/staat.svelte.js';

  let { punten, lijn = false, wandelen = false, onmaat = null, hoogte, label } = $props();
</script>

{#if net.online && maps.geconfigureerd && !maps.sleutelFout}
  <GoogleKaart {punten} {lijn} {wandelen} {onmaat} {hoogte} {label} />
{:else}
  <Schema {punten} {lijn} {label} />
{/if}
