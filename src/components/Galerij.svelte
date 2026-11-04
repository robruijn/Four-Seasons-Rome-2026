<script>
  // Fotogalerij: lokaal opgeslagen WebP-foto's (werken offline), lazy geladen,
  // met compacte bronvermelding per foto. Geen foto's? Dan een rustige placeholder.
  let { locatie, fotos = [] } = $props();
  const pad = (f, w) => `./fotos/${f.bestand}-${w}.webp`;
  const initiaal = $derived(locatie.naam.replace(/^(Basilica di|Piazza (del|della|di)?|Via (dei)?|Hotel|Hosteria|Galleria)\s*/i, '').charAt(0));
</script>

{#if fotos.length}
  <!-- Scrollbaar gebied moet met het toetsenbord bereikbaar zijn (WCAG 2.1.1) -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="galerij" class:enkel={fotos.length === 1} role="region" aria-label={`Foto's van ${locatie.naam}`} tabindex="0">
    {#each fotos as f, i}
      <figure>
        <img
          src={pad(f, 800)}
          srcset={`${pad(f, 400)} 400w, ${pad(f, 800)} 800w`}
          sizes="(min-width: 42rem) 36rem, 88vw"
          width={f.breedte}
          height={f.hoogte}
          alt={f.alt || `${locatie.naam}, foto ${i + 1}`}
          loading={i === 0 ? 'eager' : 'lazy'}
          decoding="async" />
        <figcaption>
          Foto: {f.maker} · <a href={f.bron_url} target="_blank" rel="noopener">{f.bron}</a> ·
          {#if f.licentie_url}<a href={f.licentie_url} target="_blank" rel="noopener">{f.licentie}</a>{:else}{f.licentie}{/if}
        </figcaption>
      </figure>
    {/each}
  </div>
{:else}
  <div class="placeholder" aria-hidden="true">
    <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMax slice">
      <g fill="none" stroke="currentColor" stroke-width="2" opacity=".55">
        {#each Array(8) as _, i}
          <path d={`M${10 + i * 40} 120 V70 a15 15 0 0 1 30 0 V120`} />
          <path d={`M${10 + i * 40} 58 V40 a15 12 0 0 1 30 0 V58`} />
        {/each}
        <path d="M0 64 H320 M0 30 H320" />
      </g>
    </svg>
    <span>{initiaal}</span>
  </div>
{/if}

<style>
  .galerij {
    display: grid; grid-auto-flow: column; grid-auto-columns: 88%;
    gap: 0.6rem;
    overflow-x: auto; scroll-snap-type: x mandatory;
    margin: 0 -1rem 1rem; padding: 0 1rem 0.25rem;
    scrollbar-width: thin;
  }
  .galerij.enkel { grid-auto-columns: 100%; }
  figure { margin: 0; scroll-snap-align: center; }
  img {
    display: block; width: 100%; height: auto; aspect-ratio: 3 / 2; object-fit: cover;
    border-radius: var(--r); background: var(--vlak-2);
  }
  figcaption { font-size: 0.8125rem; color: var(--tekst-2); margin-top: 0.3rem; line-height: 1.35; }
  figcaption a { color: inherit; }
  .placeholder {
    position: relative; height: 8.5rem; margin-bottom: 1rem;
    border-radius: var(--r); overflow: hidden;
    background: linear-gradient(160deg, var(--terra-zacht), var(--vlak-2));
    color: var(--terra);
    display: grid; place-items: center;
  }
  .placeholder svg { position: absolute; inset: auto 0 0 0; width: 100%; height: 75%; }
  .placeholder span {
    position: relative; font-family: var(--serif); font-size: 3.5rem; font-weight: 700;
    color: var(--terra); background: var(--vlak); width: 5rem; height: 5rem; border-radius: 50%;
    display: grid; place-items: center; line-height: 1;
  }
</style>
