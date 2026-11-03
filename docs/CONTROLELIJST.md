# Controlelijst – nog te bevestigen vóór vertrek

Stand: 3 november 2026 (bijgewerkt na antwoorden opdrachtgever). Actuele lijst: `npm run check` of `#/beheer` in de app.

## Programma (open vragen opdrachtgever)

- [x] **Groepsgrootte**: 16 personen (4 taxi's).
- [x] **Vrijdag diner**: terugrit 22:30 klopt; het diner loopt nu van 21:00 tot 22:30.
- [ ] **Vrijdag terugrit**: oorspronkelijk stond 'La Matriciana'; aangenomen is Casa Bleve. Klopt dat?
- [ ] **Vrijdag late lunch** (14:40–15:55): locatie nog onbekend. Daarmee ontbreekt ook het vertrekpunt van route r_v1 naar San Clemente.
- [x] **Zaterdag**: de taxirit loopt van 09:15 tot 09:30; geen overlap meer met het fietsen.
- [ ] **Zaterdag**: douche-blok stond als 13:34, aangenomen 13:45.
- [ ] **Zondag 09:25** "Naar Galleria Doria Pamphilj": vervoer staat als taxi, maar de noot zegt "te voet 20 minuten". Wat wordt het?
- [ ] **Zaterdag bike-blok**: wil je `"vervoer": "fiets"` toevoegen? Dan krijgt het blok een fietsicoon.
- [x] **Groepscode**: niet gebruiken.

## Adressen en nummers

- [x] **Romanè**: reservering voor Via Cipro 106 is bevestigd.
- [ ] **Romanè**: telefoonnummer +39 340 784 5281 komt uit een recensie uit 2021; controleren.
- [ ] **San Clemente**: adres Via Labicana 95 verifiëren.
- [ ] **Babington's Tea Rooms**: Piazza di Spagna 23 verifiëren (verzamelpunt stadstour).
- [ ] **Hotel Viminale**: twee telefoonnummers (+39 06 84030333 en +39 06 4881980); één keer bellen en het juiste houden.
- [ ] **Reisleiders Robert en Bas**: telefoonnummers toevoegen (`meta.reisleiders`).
- [ ] **Apotheek** (placeholder): Farmacia Piram, Via Nazionale 228, 24 uur open, +39 06 488 0754. Openingstijden en nummer bevestigen.
- [ ] **Ziekenhuis** (placeholder): Policlinico Umberto I, Viale del Policlinico 155 (spoedeisende hulp). Bevestigen.
- [ ] **Coördinaten**: 16 locaties zijn handmatig ingevuld (op ca. 20–50 m nauwkeurig). Draai `npm run geocode` met een Google-sleutel voor de definitieve waarden.
- [ ] **Groepsreserveringen** bevestigen: Casa Bleve, Terrazza Borromini (telefonisch), Grappolo d'Oro, Ai Fienaroli, Romanè.

## Techniek en publicatie

- [ ] Code naar `main` en GitHub Pages aanzetten (Settings → Pages → Source: GitHub Actions). Pages werkt gratis alleen bij een openbare repository.
- [ ] Google Cloud-project, sleutels, budget en quota instellen (zie [GOOGLE-MAPS.md](GOOGLE-MAPS.md)); `VITE_GOOGLE_MAPS_KEY` als GitHub-variabele.
- [ ] Na de livegang: kaart en Street View testen op een echte iPhone en Android.
- [ ] Foto's nog eens doorlopen op de pagina Fotoverantwoording (45 foto's, al een keer beoordeeld); ongeschikte foto's uitsluiten via `scripts/fotos-keuze.json`.
- [ ] Eigen (rechtenvrije) foto's van Casa Bleve, Ai Fienaroli, Romanè en Hotel Viminale? Die tonen nu een illustratie.
- [ ] QR-code opnieuw maken als het adres anders wordt dan `https://robruijn.github.io/rdb.test/` (`npm run qr -- <url>`).
- [ ] `meta.laatst_gecontroleerd` bijwerken na de laatste controle van prijzen en tijden.
