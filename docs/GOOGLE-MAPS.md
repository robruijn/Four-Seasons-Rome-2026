# Google Maps: API's, sleutels, beperkingen en kosten

## Wat de app gebruikt en waarom

| Functie | API / onderdeel | Wanneer |
|---|---|---|
| Live kaart met genummerde stops | **Maps JavaScript API** (Dynamic Maps, `AdvancedMarkerElement`) | Kaart-tab en routescherm, alleen online |
| Looppad langs de stops | **Routes API** via de Routes-bibliotheek van Maps JS (`Route.computeRoutes`, te voet) | Eén keer per geopend routescherm |
| Is er Street View bij deze stop? | `StreetViewService.getPanorama` (Street View **metadata**) | Per stop, pas na tik op "Bekijk Street View" |
| Street View-beeld | `StreetViewPanorama` (Dynamic Street View) | Alleen na tik, per stop met Vorige/Volgende |
| Coördinaten bij het bouwen | **Geocoding API** (script `npm run geocode`) | Eenmalig door de beheerder |
| "Open in Google Maps" | Gewone Maps-link (`google.com/maps/dir/?api=1…`) | Geen API, geen sleutel, geen kosten |

**Waarom Maps JavaScript API en niet de Maps Embed API?** De Embed API is gratis, maar kan niet vooraf controleren of er
Street View-beeld is, geen eigen Vorige/Volgende-stappen tussen stops geven en geen route met tussenstops plus eigen
markers tonen. Met de JavaScript API is de metadatacheck gratis, laadt Street View alleen op verzoek en blijven we voor
16 gebruikers ruim binnen de gratis maandtegoeden. De goedkoopste oplossing die het gevraagde gedrag levert, is dus
de JavaScript API met lui laden.

**Waarom geen Directions API?** Die is sinds maart 2025 "legacy" en niet meer in te schakelen voor nieuwe projecten.
De opvolger is de Routes API. Lukt de route niet, dan tekent de app een stippellijn tussen de stops. Afstand en
looptijd komen offline uit een schatting op basis van de coördinaten (groepstempo 4 km/u, factor 1,35 voor
omwegen) en worden online vervangen door de waarden van Google.

## Verwachte kosten voor 16 gebruikers

Google Maps Platform werkt sinds 1 maart 2025 met een **gratis maandtegoed per SKU** (Essentials 10.000,
Pro 5.000 aanroepen per maand). Ruwe schatting voor de hele reis, ruim genomen:

| SKU | Schatting | Gratis per maand | Kosten |
|---|---|---|---|
| Dynamic Maps (Essentials) | 16 × 40 kaartweergaven ≈ 650 | 10.000 | € 0 |
| Compute Routes (Essentials) | 16 × 15 ≈ 250 | 10.000 | € 0 |
| Street View metadata | onbeperkt gratis | – | € 0 |
| Dynamic Street View (Pro) | 16 × 30 stops ≈ 500 | 5.000 | € 0 |
| Geocoding (Essentials) | ≈ 20 per run | 10.000 | € 0 |

**Verwacht: € 0.** Wel is een factureringsaccount (creditcard) verplicht. Prijzen en tegoeden kunnen veranderen;
controleer [de prijslijst van Google](https://developers.google.com/maps/billing-and-pricing/pricing).

## Instellen (stap voor stap, ca. 15 minuten)

1. Ga naar [console.cloud.google.com](https://console.cloud.google.com) en maak een project, bijv. "Rome groepsreis".
2. **Facturering**: koppel een factureringsaccount (Billing).
3. **API's inschakelen** (APIs & Services → Library): *Maps JavaScript API*, *Routes API*, *Geocoding API*.
4. **Browsersleutel** (APIs & Services → Credentials → Create credentials → API key):
   - *Application restrictions* → **Websites** (HTTP-referrers): `https://robruijn.github.io/Four-Seasons-Rome-2026/*`
     (en tijdelijk `http://localhost:5173/*` voor testen, of maak daarvoor een aparte ontwikkelsleutel).
   - *API restrictions* → **Restrict key**: alleen *Maps JavaScript API* en *Routes API*.
   - Zet deze sleutel in GitHub als variabele `VITE_GOOGLE_MAPS_KEY` (zie README). Een browsersleutel staat altijd
     zichtbaar in de pagina; de referrer-beperking zorgt dat anderen hem niet kunnen gebruiken.
5. **Serversleutel voor geocoding**: tweede sleutel, *API restrictions* alleen *Geocoding API*, geen website-beperking.
   Alleen lokaal gebruiken: `GOOGLE_GEOCODING_KEY=… npm run geocode`. Nooit committen.
6. **Map ID** (optioneel, aanbevolen): Google Maps Platform → Map management → Create Map ID (JavaScript, Vector).
   Zet als `VITE_GOOGLE_MAP_ID`. Zonder Map ID gebruikt de app `DEMO_MAP_ID`, dat werkt maar is bedoeld voor testen.
7. **Budget en alarm**: Billing → Budgets & alerts → budget van bijv. **€ 10** met meldingen bij 50/90/100%.
   Let op: een budget is een *alarm*, geen harde stop.
8. **Harde limieten (quota)**: APIs & Services → per API → *Quotas & system limits*. Stel bijvoorbeeld in:
   - Maps JavaScript API – *Map loads per day*: 1.000
   - Street View (Dynamic Street View) – *per day*: 500
   - Routes API – *Compute routes per day*: 500
   Daarboven weigert Google verzoeken; de app valt dan netjes terug op de schematische kaart en de tekstuele route.

## Voorwaarden

- De app slaat **geen** Google-kaartbeelden, Street View-beelden of routes op (de service worker cachet niets van Google).
- Coördinaten uit de Geocoding API mogen tijdelijk worden bewaard; draai `npm run geocode` vlak voor vertrek.
- Het Google-logo en de bronvermelding op de kaart blijven zichtbaar (standaard van de API).
