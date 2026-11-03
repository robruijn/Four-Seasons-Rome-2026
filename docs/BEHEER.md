# Programma aanpassen en publiceren (voor de organisator)

Alle inhoud van de app staat in één bestand: **`public/programma.json`**. Je hebt geen programmeerkennis nodig.

## Zo pas je iets aan (via de GitHub-website)

1. Open op GitHub het bestand `public/programma.json` en klik op het potlood (*Edit this file*).
2. Pas tekst of tijden aan. Let op de aanhalingstekens en komma's (zie voorbeelden hieronder).
3. Klik op **Commit changes** (op de branch `main`).
4. Binnen ongeveer 2 minuten bouwt GitHub de app opnieuw en zet hem online (tab *Actions* → *Publiceren*).
   - Groen vinkje: klaar. Deelnemers met de app open zien de melding "Er is een nieuwe versie van het programma" met een knop *Vernieuwen*.
   - Rood kruis: er zit een fout in het bestand. Klik op de rode run en lees bij *npm run build* welke regel niet klopt.
     De oude versie blijft dan gewoon online.

## Veelvoorkomende wijzigingen

**Een tijd verschuiven**
```json
{"id": "v13", "van": "23:30", "tot": "23:40", "titel": "Terug naar hotel", ...}
```
Tijden altijd als `UU:MM`. Na middernacht kan `24:00` als eindtijd.

**De markering "nog te bevestigen" weghalen**: verwijder het veld `"status": "TIJD_TE_BEVESTIGEN"` (en de komma ervoor).

**De late lunch invullen**: voeg een locatie toe onder `locaties` en verwijs ernaar:
```json
"lunch_vrijdag": {
  "naam": "Naam restaurant",
  "adres": "Via …, Roma",
  "telefoon": ["+39 06 …"],
  "lat": null, "lng": null,
  "tekst": "Korte toeristische toelichting.",
  "praktisch": "Gereserveerd voor 16 personen.",
  "foto_zoekterm": "zoekterm voor foto's"
},
```
En in het blok: `"locatie": "lunch_vrijdag"` en `"status"` weghalen. Zet bij route `r_v1` ook `"van": "lunch_vrijdag"`
en eventueel `"streetview_stops": ["lunch_vrijdag", "san_clemente"]`.
Coördinaten: draai `npm run geocode` (zie GOOGLE-MAPS.md) of zoek ze op in Google Maps (rechtsklik → coördinaten kopiëren).

**Telefoonnummer reisleider**: in `meta` → `"reisleider_telefoon": "+31 6 12345678"`. Zodra er geen `TE_BEVESTIGEN`
meer staat, verschijnt in *Praktisch* een belknop.

**Groepsgrootte**: `"aantal_personen": 16` (als getal, zonder aanhalingstekens).

**Vervoersicoon**: `"vervoer": "taxi"`, `"fiets"` of `"voet"`. Blokken met een `route` krijgen automatisch "te voet".

**Afstand en looptijd van een route vastzetten** (anders rekent de app zelf een schatting):
`"afstand_m": 1300, "looptijd_min": 20` in de route.

## Wat de app met "onzekere" gegevens doet

Velden met `TE_BEVESTIGEN`, `TE_BEPALEN`, `adres_status`, `telefoon_status`, `telefoon_opmerking` of
een `geo_bron` met "handmatig" worden nooit als zekerheid getoond: deelnemers zien dan een geel label met stippelrand,
bijvoorbeeld "Adres nog te controleren".

Een overzicht van alles wat nog openstaat:
- in de app: ga naar `…/rdb.test/#/beheer` (staat niet in het menu);
- op de computer: `npm run check`.

`open_vragen` in het bestand is alleen voor jou; de app toont die nooit.

## Foto's

Foto's komen van Wikimedia Commons (alleen CC0, Public Domain, CC BY en CC BY-SA), worden lokaal opgeslagen
als WebP en werken dus offline. Ophalen: tab *Actions* → *Foto's ophalen* → *Run workflow*, of op de computer
`npm run fotos`. Een foto niet mooi? Zet de bestandsnaam (te zien via de link "Wikimedia Commons" onder de foto)
in `scripts/fotos-keuze.json` bij `uitsluiten` en haal die locatie opnieuw op (bijv. `colosseo` als optie).
Wijzigen van `fotos-keuze.json` start de workflow ook automatisch. Controleer daarna de pagina *Info → Fotoverantwoording*.
