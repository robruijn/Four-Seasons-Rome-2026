# Four Seasons Rome 2026 – reis-app (PWA)

Digitale reisgids voor de groepsreis naar Rome van **vrijdag 13 t/m zondag 15 november 2026**.
Mobile-first webapp, te openen via een link of QR-code, zonder app store. Geen login, geen tracking.

| Onderdeel | Waar |
|---|---|
| Alle inhoud (programma, locaties, routes, teksten) | [`public/programma.json`](public/programma.json) |
| Ontwerp (schermen, kleuren, typografie, keuzes) | [`docs/ONTWERP.md`](docs/ONTWERP.md) |
| Programma aanpassen en publiceren (organisator) | [`docs/BEHEER.md`](docs/BEHEER.md) |
| Installatiehandleiding deelnemers + QR-code | [`docs/INSTALLEREN.md`](docs/INSTALLEREN.md), [`docs/qr-code.png`](docs/qr-code.png) |
| Google Maps: API's, sleutels, kosten | [`docs/GOOGLE-MAPS.md`](docs/GOOGLE-MAPS.md) |
| Testverslag | [`docs/TESTVERSLAG.md`](docs/TESTVERSLAG.md) |
| Controlelijst openstaande punten | [`docs/CONTROLELIJST.md`](docs/CONTROLELIJST.md) |

## Snel starten

```bash
npm install
cp .env.example .env.local   # optioneel: Google Maps-sleutel invullen
npm run dev                  # http://localhost:5173
npm run build                # controleert programma.json en bouwt naar dist/
npm run preview              # test de gebouwde versie (incl. offline/service worker)
```

Testklok: zet `?nu=2026-11-14T10:05` vóór de `#` in de link (bijv. `http://localhost:5173/?nu=2026-11-14T10:05#/`)
om de app te laten denken dat het die tijd in Rome is. Er verschijnt dan een gele balk.

## Scripts

| Commando | Wat het doet |
|---|---|
| `npm run check` | Controleert `programma.json` en toont de beheerlijst (ook te zien in de app via `#/beheer`). |
| `npm run geocode` | Haalt coördinaten op met de Google Geocoding API (`GOOGLE_GEOCODING_KEY=…`). |
| `npm run fotos` | Haalt vrij gelicentieerde foto's van Wikimedia Commons, maakt WebP-versies en de bronvermelding. Draait ook als GitHub Action. |
| `npm run iconen` | Maakt de app-iconen opnieuw. |
| `npm run qr -- <url>` | Maakt de QR-code in `docs/`. |
| `npm run groepscode -- <code>` | Geeft de hash voor de optionele groepscode. |

## Techniek in het kort

- **Svelte 5 + Vite + vite-plugin-pwa.** Gekozen omdat Svelte compileert naar zeer kleine JavaScript
  (≈ 43 kB gzip voor de hele app), wat de eerste weergave op 4G snel houdt. De PWA-plugin regelt de
  service worker (Workbox) en het manifest.
- **Eén databron.** De app haalt `programma.json` op bij het starten; de service worker bewaart het voor offline gebruik.
  `public/fotos/fotos.json` is een gegenereerde index van de lokale foto's (bronvermelding), geen inhoud.
- **Offline-first.** App, programma, lettertype, iconen en foto's staan in de precache. Google-kaart en Street View
  worden nooit gecachet (voorwaarden Google) en laden alleen online. Het weerbericht wordt kort bewaard.
- **Tijd.** "Nu / Straks" rekent met de wandklok van Europe/Rome, ongeacht de tijdzone van het toestel (`src/lib/tijd.js`).
- **Hash-routering** (`#/blok/v5`): werkt zonder serverinstellingen op elke statische host.
- **Toegankelijkheid.** Contrast AA in licht en donker, zichtbare focus, schermlezerlabels, minimaal 44 × 44 px
  aanraakvlakken, tekstgrootte volgt de systeeminstelling, status nooit alleen via kleur.

```
src/
  App.svelte            navigatie, offline-balk, update-melding, groepscode
  lib/                  tijd, data, geo, Google Maps-loader, weer, PWA, controle
  views/                Programma, Blok, Locatie, Route, Kaart, Info, Praktisch, Fotos, Beheer
  components/           NuStraks, Adres, Galerij, GoogleKaart, Schema (offline kaart), StreetView, …
scripts/                controle, geocode, fotos, iconen, qr, groepscode
public/programma.json   de inhoud
```

## Publiceren (GitHub Pages)

1. Zet deze code op de branch `main`.
2. GitHub → **Settings → Pages → Source: GitHub Actions**.
3. GitHub → **Settings → Secrets and variables → Actions → tabblad Variables**: voeg `VITE_GOOGLE_MAPS_KEY` toe
   (en eventueel `VITE_GOOGLE_MAP_ID`, `VITE_GROEPSCODE_HASH`).
4. Elke push naar `main` bouwt en publiceert automatisch (workflow *Publiceren*). Adres: `https://robruijn.github.io/Four-Seasons-Rome-2026/`.

GitHub Pages is gratis voor openbare repositories; voor een privé-repository is een betaald GitHub-abonnement nodig.
Alternatief: **Netlify** (gratis, ook voor privé-repo's): build command `npm run build`, publish directory `dist`,
en dezelfde variabelen onder *Site configuration → Environment variables*.

Let op: ook met groepscode is `programma.json` publiek op te vragen voor wie de link kent. Zet er dus geen
gevoelige persoonsgegevens in (bijv. geen telefoonnummers van deelnemers).
