# Controlelijst – nog te bevestigen vóór vertrek

Stand: 3 november 2026. Actuele lijst: `npm run check` of `#/beheer` in de app.

## Programma (open vragen opdrachtgever)

- [ ] **Groepsgrootte**: 16 of 15 personen? (4 taxi's) → `meta.aantal_personen`
- [ ] **Vrijdag diner** Casa Bleve 21:00–23:30, maar de terugrit staat om 22:30. Welke tijd klopt? (blok v13 is gemarkeerd "Tijd nog te bevestigen")
- [ ] **Vrijdag terugrit**: oorspronkelijk stond 'La Matriciana'; aangenomen is Casa Bleve. Klopt dat?
- [ ] **Vrijdag late lunch** (14:40–15:55): locatie nog onbekend. Daarmee ontbreekt ook het vertrekpunt van route r_v1 naar San Clemente.
- [ ] **Zaterdag**: bike-blok 09:30–13:30 overlapt met de taxirit 09:15–09:40. Begint het fietsen om 09:40?
- [ ] **Zaterdag**: douche-blok stond als 13:34, aangenomen 13:45.
- [ ] **Zondag 09:25** "Naar Galleria Doria Pamphilj": vervoer staat als taxi, maar de noot zegt "te voet 20 minuten". Wat wordt het?
- [ ] **Zaterdag bike-blok**: wil je `"vervoer": "fiets"` toevoegen? Dan krijgt het blok een fietsicoon.
- [ ] **Groepscode**: wel of niet? (Zo ja: `npm run groepscode -- <code>` en de hash als GitHub-variabele instellen.)

## Adressen en nummers

- [ ] **Romanè**: reservering controleren voor **Via Cipro 106** (niet Romanè Armare, Via Cipro 61); telefoon +39 340 784 5281 komt uit een recensie uit 2021.
- [ ] **San Clemente**: adres Via Labicana 95 verifiëren.
- [ ] **Babington's Tea Rooms**: Piazza di Spagna 23 verifiëren (verzamelpunt stadstour).
- [ ] **Hotel Viminale**: twee telefoonnummers (+39 06 84030333 en +39 06 4881980); één keer bellen en het juiste houden.
- [ ] **Reisleider**: telefoonnummer toevoegen (`meta.reisleider_telefoon`).
- [ ] **Apotheek** (placeholder): Farmacia Piram, Via Nazionale 228, 24 uur open, +39 06 488 0754. Openingstijden en nummer bevestigen.
- [ ] **Ziekenhuis** (placeholder): Policlinico Umberto I, Viale del Policlinico 155 (spoedeisende hulp). Bevestigen.
- [ ] **Coördinaten**: 16 locaties zijn handmatig ingevuld (op ca. 20–50 m nauwkeurig). Draai `npm run geocode` met een Google-sleutel voor de definitieve waarden.
- [ ] **Groepsreserveringen** bevestigen: Casa Bleve, Terrazza Borromini (telefonisch), Grappolo d'Oro, Ai Fienaroli, Romanè.

## Techniek en publicatie

- [ ] Code naar `main` en GitHub Pages aanzetten (Settings → Pages → Source: GitHub Actions). Pages werkt gratis alleen bij een openbare repository.
- [ ] Google Cloud-project, sleutels, budget en quota instellen (zie [GOOGLE-MAPS.md](GOOGLE-MAPS.md)); `VITE_GOOGLE_MAPS_KEY` als GitHub-variabele.
- [ ] Na de livegang: kaart en Street View testen op een echte iPhone en Android.
- [ ] Foto's beoordelen op de pagina Fotoverantwoording; ongeschikte foto's uitsluiten via `scripts/fotos-keuze.json`.
- [ ] QR-code opnieuw maken als het adres anders wordt dan `https://robruijn.github.io/rdb.test/` (`npm run qr -- <url>`).
- [ ] `meta.laatst_gecontroleerd` bijwerken na de laatste controle van prijzen en tijden.
