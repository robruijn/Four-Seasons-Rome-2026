<script>
  // Eenvoudige lijn-iconen (24x24, eigen tekening in de stijl van open-source lijn-iconen).
  // Decoratief: aria-hidden. De betekenis staat altijd ook in tekst ernaast.
  let { naam, maat = 24, klasse = '' } = $props();

  const P = {
    programma: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M7 13h4M7 17h7"/>',
    kaart: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
    praktisch: '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6l-8-3z"/><path d="M12 9v6M9 12h6"/>',
    voet: '<circle cx="13" cy="4" r="2"/><path d="m9 21 2.5-6.5L14 17v4M7.5 12l2-4.5 3.5-1 2.5 3.5 2.5 1M11.5 14.5l1-5"/>',
    taxi: '<path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3zM9 3h6v3H9z"/><circle cx="7.5" cy="13" r=".8"/><circle cx="16.5" cy="13" r=".8"/>',
    fiets: '<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 16 9.5 8H15l3 8M12 16l-2.5-8M8 5h3"/>',
    pin: '<path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    telefoon: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    kopie: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16"/>',
    klok: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    let_op: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17v.01"/>',
    verder: '<path d="m9 6 6 6-6 6"/>',
    terug: '<path d="m15 6-6 6 6 6"/>',
    deel: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/>',
    offline: '<path d="M2 8.5a16 16 0 0 1 6-3.3M22 8.5a16 16 0 0 0-10-3.5M5 12a11 11 0 0 1 4.5-2.4M19 12a11 11 0 0 0-2.4-1.5M8.5 15.5a5.5 5.5 0 0 1 7 0M12 19v.01M3 3l18 18"/>',
    hotel: '<path d="M3 20V5M3 15h18v5M3 11h7v4M10 11h8a3 3 0 0 1 3 3v1"/><circle cx="6.5" cy="9" r="1.5"/>',
    nood: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
    apotheek: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>',
    euro: '<path d="M17 6.5A6.5 6.5 0 1 0 17 17.5M4 10h9M4 14h9"/>',
    vink: '<path d="m5 12 4.5 4.5L19 7"/>',
    oog: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    zon: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    wolk: '<path d="M7 18a4.5 4.5 0 1 1 .9-8.9A6 6 0 0 1 19 11a3.5 3.5 0 0 1-1 7H7z"/>',
    wolkzon: '<path d="M12 4v1M5.6 6.6l.7.7M4 13H3M17.7 6.6l-.7.7"/><path d="M8.5 11a4 4 0 0 1 7.3-1.3"/><path d="M9 20a3.5 3.5 0 1 1 .7-6.9A5 5 0 0 1 19 15a2.5 2.5 0 0 1-.5 5H9z"/>',
    regen: '<path d="M7 15a4.5 4.5 0 1 1 .9-8.9A6 6 0 0 1 19 8a3.5 3.5 0 0 1-1 7"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
    onweer: '<path d="M7 15a4.5 4.5 0 1 1 .9-8.9A6 6 0 0 1 19 8a3.5 3.5 0 0 1-1 7"/><path d="m12 13-2 4h4l-2 4"/>',
    installeer: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    kruis: '<path d="M6 6l12 12M18 6 6 18"/>',
    groep: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2A5 5 0 0 1 21 19"/>',
    camera: '<path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="3.5"/>',
    taal: '<path d="M4 5h16v11H9l-5 4V5z"/><path d="M8 9h8M8 12h5"/>',
    paraplu: '<path d="M2 12a10 10 0 0 1 20 0z"/><path d="M12 12v7a2 2 0 0 0 4 0"/>',
    ios_deel: '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/>',
    plus_vak: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>',
    menu_punten: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>'
  };
</script>

<svg
  class="icon {klasse}"
  width={maat}
  height={maat}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.9"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false">{@html P[naam] ?? P.info}</svg>
