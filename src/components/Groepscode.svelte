<script>
  // Optionele groepscode. Alleen actief als VITE_GROEPSCODE_HASH bij het bouwen is gezet.
  // In de broncode staat alleen een SHA-256-hash, niet de code zelf. Dit is een
  // drempel ("de link is voor de groep"), geen echte beveiliging.
  import { ontgrendel } from '../lib/groepscode.js';
  let { onklaar } = $props();
  let code = $state('');
  let fout = $state('');
  let bezig = $state(false);

  async function verstuur(e) {
    e.preventDefault();
    bezig = true;
    fout = '';
    if (await ontgrendel(code)) onklaar();
    else fout = 'Die code klopt niet. Kijk in het bericht van de reisleider of vraag het even na.';
    bezig = false;
  }
</script>

<main class="pagina poort">
  <h1>Four Seasons Rome 2026</h1>
  <p>Deze reisgids is alleen voor de groep. Vul de groepscode in die je van de reisleider hebt gekregen.</p>
  <form onsubmit={verstuur} class="kaart">
    <label for="code" class="dik">Groepscode</label>
    <input
      id="code"
      bind:value={code}
      autocomplete="off"
      autocapitalize="none"
      spellcheck="false"
      aria-describedby={fout ? 'codefout' : undefined}
      aria-invalid={fout ? 'true' : undefined}
      required />
    {#if fout}<p id="codefout" class="fout" role="alert">{fout}</p>{/if}
    <button class="knop vol" disabled={bezig}>Openen</button>
  </form>
  <p class="klein">Je hoeft de code maar één keer in te vullen op dit toestel.</p>
</main>

<style>
  .poort { padding-top: 15vh; }
  input {
    display: block; width: 100%;
    margin: 0.4rem 0 0.8rem;
    min-height: 3rem; padding: 0.5rem 0.8rem;
    font: inherit; font-size: 1.25rem; letter-spacing: 0.05em;
    border: 2px solid var(--lijn); border-radius: 10px;
    background: var(--bg); color: var(--tekst);
  }
  .fout { color: var(--tekst); border-left: 4px solid var(--terra); padding-left: 0.6rem; }
</style>
