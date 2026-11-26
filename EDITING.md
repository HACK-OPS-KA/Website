# hackops.tech bearbeiten

Die Startseite ist eine HTML-Datei (`index.html`) plus Stylesheet (`home.css`).
Kein Build, kein Framework: Wer speichert, veroeffentlicht. Nach jedem Commit auf
`main` ist die Aenderung nach ca. 1 Minute live auf https://hackops.tech.

Dasselbe Design laeuft auch auf der Plattform unter https://ops.nedilko.tech/page,
dort mit Live-Zahlen aus der Event-Datenbank. Hier im Repo stehen Zahlen und Ops
fest im HTML und werden von Hand gepflegt.

## So geht's (ohne Git-Kenntnisse)

1. Auf github.com einloggen (ihr braucht eine Einladung in die Organisation).
2. Die Datei [index.html](index.html) oeffnen und oben rechts auf den Stift klicken.
3. Text aendern (siehe unten, wo was steht).
4. Unten "Commit changes" klicken. Fertig. Nach ca. 1 Minute live.

## Wo steht was in index.html

Jeder Abschnitt beginnt mit einem Kommentar wie `═══ 01 HERO ═══`:

| Abschnitt | Suchen nach | Was man aendert |
|---|---|---|
| Hero | `01 HERO` | Titel, "Next event"-Button (Link zum naechsten Op auf Luma), Partner-Logos |
| Naechstes Op | `02 NEXT OP` | Name, Datum, Ort, Bild und Farben des naechsten Ops, die Schritte "How an op runs" |
| Zwei Wege | `03 TWO WAYS IN` | Was Builder bekommen, die drei Formate fuer Firmen |
| Vergangene Ops | `04 OPS SO FAR` | Eine Kachel pro Op, das Game-Jam-Band mit den Gewinnern |
| Zahlen | `05 THE COMMUNITY` | Die Zahlen (siehe unten) |
| Firmen | `06 FOR COMPANIES` | Formate, Paket-Tabelle, Fair-Play-Hinweis |
| FAQ | `08 FAQ` | Fragen und Antworten |
| Footer | `09 FOOTER` | Links, Kontaktadresse, Credits fuer Himmel-Foto und Spiegelungen |

### Typische Aenderungen

**Ein neues Op wird angekuendigt**: in `02 NEXT OP` Name, Datum und Ort aendern.
Den Luma-Link ueberall ersetzen (nach dem alten `luma.com/...`-Link suchen: der
"Next event"-Button oben, die "Sign up"-Buttons und der FAQ-Button). Das
quadratische Key Visual in `assets/home/looks/` hochladen und beim `<img>` den
`src` anpassen. Die Farben des Abschnitts stehen im `style`-Attribut der Section
(`--op-base` Hintergrund, `--op-ink` Text, `--op-accent` Akzent,
`--op-on-accent` Text auf dem Akzent).

**Ein Op ist vorbei**: in `04 OPS SO FAR` eine Kachel (`<li class="hp-w ...">`)
kopieren und anpassen: Op-Nummer, Datum, Stadt, Name, Teilnehmerzahl, Bild, Link
und die vier `--op-*` Farben. Danach die Zahlen in `05` aktualisieren.

**Zahlen aendern**: in `05 THE COMMUNITY` steht jede Zahl zweimal: einmal fuer
Screenreader (`hp-sr`) und einmal sichtbar. Beim sichtbaren `<span>` ist
`data-count` die Zahl, bis zu der hochgezaehlt wird, der Text ist das Ergebnis
(z.B. `data-count="200"` und `200+`). Alle drei Stellen gleich halten.

**Neuer Partner**: das Logo weiss auf transparent (SVG, oder PNG mit
Transparenz) in `assets/home/partners/` hochladen. Dann in `01 HERO` einen
`<span class="hp-logo-slot">` kopieren, und zwar in **beiden** Kopien der
Logo-Reihe (das Band laeuft endlos, indem eine Kopie hinter der anderen
herlaeuft). Die Hoehe im `style` so waehlen, dass es optisch gleich gross wirkt.

**Neues Bild**: Datei in `assets/home/` hochladen (im GitHub-Ordner auf
"Add file > Upload files"), dann beim `<img>` den `src` anpassen.

## Regeln

- Keine Gedankenstriche, keine Emojis.
- Sponsoren erst nennen, wenn der Deal fix ist.
- Farben nur ueber die Variablen oben in `home.css` (`--hp-blue`, `--hp-paper`,
  `--hp-ink`, ...) und die `--op-*` Variablen einer Kachel.
- Die Pixelschrift ist Press Start 2P (die Slopathon-Titelschrift). Jeder
  Buchstabe ist so breit wie hoch: lange Woerter brauchen eine kleinere Groesse.
- Die Formate heissen Hack Sprint, Challenge und Hackathon. Nie "recruiting
  hackathon".
- Foto-Hinweis (`photos.html`) und Slop Museum (`projects.html`) behalten ihre
  Adressen, Event-Seiten verlinken darauf.

## Handy

Unter 760px Breite stapelt sich alles in eine Spalte. Nach jeder Aenderung im
Browser auf 375x812 stellen und durchscrollen: nichts darf seitlich ueberstehen.

## Fuer Fortgeschrittene

- Optik/Farben: [home.css](home.css) (Variablen ganz oben in `.hp`)
- Verhalten: [home.js](home.js) (3D-Hero, aufklappende Zeilen, Zaehler, Reel)
- 3D-Hero: die Pyramide stammt aus `TESSERACT.blend` (Objekt `Cube`, repariert),
  der Himmel ist ein Foto von engin akyurt (Unsplash), die Spiegelungen kommen
  aus der Poly-Haven-HDRI "Kloofendal 48d partly cloudy pure sky" (CC0).
- Textbausteine fuer lu.ma und Socials: [EVENT-BLURBS.md](EVENT-BLURBS.md)
- Lokal testen: Repo klonen und `pwsh serve.ps1` starten (oder
  `python -m http.server 8000`), dann im Browser oeffnen.
