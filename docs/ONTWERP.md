# Ontwerpvoorstel – Rome met de groep

## Informatiearchitectuur

Vaste onderste navigatie met vier tabs. Elke kerninformatie is binnen 2 tikken bereikbaar.

```
Programma ── Dag (Vr/Za/Zo) ── Blok ──┬─ Locatie (adres, foto's, tekst, Street View)
   └ Nu/Straks-kaart                   └─ Route (kaart, stops, beschrijving, Street View per stop)
Kaart ────── Overzicht per dag ── Locatie
Info ─────── Installeren · Weer · Plan B bij regen · Italiaanse zinnen · Fotoverantwoording
Praktisch ── 112 · Hotel ("Toon me de weg terug", delen) · Reisleider · Taxi · Apotheek · Ziekenhuis
(verborgen)  #/beheer – lijst met niet-geverifieerde gegevens voor de organisator
```

## Schermen (wireframes)

**Programma**
```
┌─────────────────────────────┐
│ ROME MET DE GROEP           │
│ Programma                   │
│ ┌─────────────────────────┐ │  donkergroene kaart
│ │ NU  Bike fitting …      │ │  lopend blok + "nog 3 u 25 min"
│ │     TopBike · tot 13:30 │ │
│ │ STRAKS  Fietsen inlev.  │ │  volgend blok + "over 3 u 25 min"
│ └─────────────────────────┘ │
│ [Vrijdag][Zaterdag][Zondag] │  plakt bovenaan bij scrollen
│ 09:30 ●┌ Nu bezig ────────┐ │  huidig blok: dikke terracotta rand,
│ 13:30  │ Bike fitting …   │>│  scrolt automatisch in beeld
│        └──────────────────┘ │
│ 13:30 ○┌ Fietsen inleveren┐ │  vervoersicoon + label
│        │ 🚕 Taxi          │>│
│ 22:30 ○┆ Terug naar hotel ┆ │  stippelrand + geel label
│        ┆ ⚠ Tijd nog te be…┆ │  "Tijd nog te bevestigen"
├─────────────────────────────┤
│ Programma Kaart Info Prakt. │
└─────────────────────────────┘
```

**Locatiedetail** (via een blok): foto's (vegen) met bronvermelding → adres met **Kopieer adres** en
**Open in Google Maps** → bel-knoppen → "Over deze plek" → kader Praktisch met "laatst gecontroleerd op" →
"In het programma" → Street View van deze plek (op verzoek).

**Route met Street View**
```
│ WANDELROUTE                 │
│ Colosseum, Via dei Fori …   │
│ Afstand ca. 1,3 km          │
│ Looptijd ca. 20 min · 3 stops│
│ ┌─────────────────────────┐ │  online: Google-kaart met route
│ │  ①───②─────③            │ │  offline: schematische kaart + melding
│ └─────────────────────────┘ │
│ [ Open route in Google Maps]│
│ Stops ① ② ③ met adres+tekst │
│ Routebeschrijving (tekst)   │
│ Street View per stop        │
│  ⓘ heeft internet nodig     │
│ [ Bekijk Street View ]      │  pas na tik laden
│  Stop 2 van 3 · Fori Imp.   │
│ [◀ Vorige]  [Volgende ▶]    │
```

**Praktisch**: grote rode knop *Noodnummer 112* bovenaan → hotel met de grote knop *Toon me de weg terug* →
adres/telefoon/delen → reisleider → taxi (4 taxi's, €55, afspraak zondag 14:15) → apotheek → ziekenhuis.

## Kleurenpalet

| Rol | Licht | Donker | Contrast |
|---|---|---|---|
| Achtergrond (travertijn-crème) | `#F5EFE4` | `#14110E` | – |
| Kaart/vlak | `#FFFAF2` | `#1F1A15` | – |
| Tekst | `#1D1915` | `#F3ECE0` | > 15:1 |
| Secundaire tekst | `#4F463D` | `#CFC3B2` | > 8:1 |
| Terracotta (accent, knoppen) | `#A8462A` | `#EC9A78` | 5,1:1 op crème, 5,9:1 wit op terracotta |
| Donkergroen (Nu/Straks, vervoer) | `#24443A` | `#9FCFB8` | > 10:1 |
| "Nog te bevestigen" | geel vlak + **stippelrand** + tekstlabel | | nooit alleen kleur |

## Typografie

- **Titels**: *Cormorant Garamond* 600/700, elegante klassieke serif. Zelf gehost (alleen het Latijnse deel,
  ca. 45 kB), dus ook offline beschikbaar.
- **Lopende tekst**: de systeemletter (San Francisco op iPhone, Roboto op Android). Optimaal leesbaar en
  0 kB extra download.
- Basis 17 px, alles in `rem`, zodat de tekstgrootte uit de telefooninstellingen wordt gevolgd.

## Ontwerpkeuzes

- **Eén duim**: navigatie onderin, grote knoppen (min. 48 px hoog), de belangrijkste actie per scherm over de volle breedte.
- **Zonlicht**: hoog contrast, geen lichtgrijze tekst, stevige randen om kaarten.
- **Batterij en data**: kleine app (≈ 45 kB JS gzip), donkere modus volgt het systeem, Street View en kaart alleen op verzoek of online.
- **Rustig bij onzekerheid**: open punten zijn netjes gemarkeerd, nergens een foutmelding.
- **Microcopy**: kort en vriendelijk; meldingen zeggen wat je kunt doen ("Gebruik de knop Open in Google Maps").
