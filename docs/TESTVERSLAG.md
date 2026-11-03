# Testverslag

Datum: 3 november 2026. Getest op de productiebuild (`npm run build` + `npm run preview`) in Chromium (Playwright),
met de profielen van een Pixel 7 en een iPhone 13, staand en liggend, in lichte en donkere modus.
De testklok `?nu=` is gebruikt om momenten tijdens de reis na te bootsen.

## Resultaten per acceptatiecriterium

| Criterium | Resultaat | Toelichting |
|---|---|---|
| Drie dagen met juiste blokken, tijden en locaties | ✅ | Alle 33 blokken uit `programma.json` getoond; `npm run check` geeft 0 fouten. |
| "Nu / Straks" op Rome-tijd, ook in andere tijdzone | ✅ | Getest met toesteltijdzone America/New_York: om 10:05 Rome-tijd toont "Nu" het fietsblok en "Straks" het inleveren om 13:30. Vóór de reis: "De reis begint over 10 dagen" + eerste blok. Bij overlap (taxi 09:15–09:40 en fietsen 09:30) telt het laatst begonnen blok. |
| Huidig blok gemarkeerd, automatisch scrollen | ✅ | Dikke rand en het label "Nu bezig" (dus niet alleen kleur); de tijdlijn scrolt ernaartoe bij openen. |
| Status TE_BEPALEN / TIJD_TE_BEVESTIGEN netjes gemarkeerd | ✅ | Geel label met stippelrand: "Nog te bepalen" of "Tijd nog te bevestigen". |
| Elke locatie: adres, kopieerknop, Maps-knop, toelichting | ✅ | Ook voor hotel, apotheek en ziekenhuis. Niet-geverifieerde adressen en nummers zijn gelabeld. |
| Routes: kaart + Street View online; melding + tekstuele route offline | ✅ / ⚠️ | Offline: melding, schematische kaart, stops met adres en tekst, routebeschrijving, Maps-knop. **Live kaart en Street View nog niet met een echte sleutel getest**, want er is nog geen Google-sleutel (zie hieronder). |
| Na één keer laden alles behalve Street View en kaart in vliegtuigmodus | ✅ | Service worker geïnstalleerd en daarna offline gezet: Programma, Route, Praktisch, Locatie en Kaart laden, ook na een volledige herlaadbeurt. Foto's worden voorgeladen (precache ca. 4 MB). |
| Alle foto's met bronvermelding + pagina Fotoverantwoording | ✅ | 45 foto's voor 15 locaties (3 per locatie), allemaal van Wikimedia Commons (CC0, PD, CC BY of CC BY-SA), met maker, bron en licentie. Handmatig beoordeeld: verkeerde treffers (San Clemente in Venetië en Skopje, brieven bij het Colosseum, bussen bij Romanè) en een foto met een herkenbare straatmuzikant zijn uitgesloten. Casa Bleve, Ai Fienaroli, Romanè, hotel en FCO tonen bewust een illustratie. |
| iOS Safari en Android Chrome, liggend/staand, licht/donker | ✅ (emulatie) | Getest met Chromium-emulatie van beide toestellen. **Nog te doen op echte toestellen** na de livegang (vooral "Zet op beginscherm" in Safari). |
| Lighthouse ≥ 90 | ✅ | Performance **94**, Accessibility **100**, Best Practices **96**. FCP 1,1 s, LCP 2,0 s, CLS 0 (mobiel profiel, gesimuleerde 4G-vertraging). De Best Practices-aftrek kwam alleen door een geblokkeerde weer-aanvraag in de testomgeving. Lighthouse 12+ heeft geen aparte PWA-categorie meer; de PWA-eisen zijn handmatig gecontroleerd: manifest, iconen (incl. maskable), service worker, offline werken, HTTPS via Pages. |
| Geen console-fouten bij normaal gebruik | ✅ | Geen fouten of waarschuwingen van de app. In de testomgeving gaf alleen het geblokkeerde weer-adres een netwerkfout. De app vraagt het weer niet meer op als de datums meer dan 15 dagen vooruit of al voorbij liggen. |

## Toegankelijkheid (handmatig)

- Contrast AA voor alle kleurparen in licht en donker (zie ONTWERP.md).
- Alle knoppen en links minimaal 44 × 44 px; de tabbalk is 68 px hoog.
- Dagtabs als toegankelijk tabpatroon (pijltjestoetsen, `aria-selected`); zichtbare focusrand.
- Schermlezer: labels op kaarten, Street View en galerij; tijden als "09:30 tot 13:30"; iconen zijn decoratief.
- Tekst schaalt mee met de systeeminstelling (alles in `rem`, basis 100%).
- Status nooit alleen via kleur: labels met tekst, stippelrand, "Nu bezig".

## Nog niet getest (en waarom)

- **Google-kaart, Routes en Street View live**: er is nog geen API-sleutel. De code valt zonder sleutel netjes terug
  (schematische kaart, melding "nog niet ingesteld"). Na het instellen van de sleutel controleren:
  Kaart-tab, route r_z1 (7 stops, Vorige/Volgende) en een stop zonder beeld.
- **Weerbericht live**: Open-Meteo was vanuit de testomgeving niet bereikbaar; de terugval-teksten zijn getest.
- **Echte toestellen**: installeren op het beginscherm via Safari (iOS) en Chrome (Android).
