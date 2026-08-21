# hackops.tech bearbeiten

Die Seite ist eine einzige HTML-Datei plus Stylesheet. Kein Build, kein Framework:
Wer speichert, veroeffentlicht. Nach jedem Commit auf `main` ist die Aenderung
nach ca. 1 Minute live auf https://hackops.tech.

## So geht's (ohne Git-Kenntnisse)

1. Auf github.com einloggen (ihr braucht eine Einladung in die Organisation).
2. Die Datei [index.html](index.html) oeffnen und oben rechts auf den Stift klicken.
3. Text aendern (siehe unten, wo was steht).
4. Unten "Commit changes" klicken. Fertig. Nach ca. 1 Minute live.

## Wo steht was in index.html

Alle Inhalte stehen in `index.html` zwischen `<div id="world">` und `</div>`.
Jeder Block hat einen Kommentar als Ueberschrift:

| Abschnitt | Suchen nach | Was man aendert |
|---|---|---|
| Startseite | `01 HOME` | Titel, Slogan, die "hack//ops runs ..." Liste |
| Ankuendigung | `announcement dialog` | Die grosse Karte auf der Startseite. Zeigt immer auf die NAECHSTE Operation |
| Easter Egg | `MICROPRINT` | Der Mini-Text, den man nur mit Zoom findet |
| Manifest | `03 MANIFESTO` | Unser Selbstverstaendnis + die vier Regeln |
| Kommende Events | `04 OPERATIONS` | OP002 hardware jam (Titel noch TBD), Tracks, Partner, alles in Planung |
| Vergangene Events | `05 PAST OPS` | Slopathon + Endstand. Hier landet jede fertige Operation |
| Team | `06 CREW` | Namen und Rollen |
| Socials | `socials:` | LinkedIn, Instagram, GitHub, lu.ma, Foto-Hinweis |
| Deko | `desktop decoration` | Fake-Fenster, Icons, Spielereien |

### Typische Aenderungen

**Event-Status aendern** (z.B. Anmeldung ist offen): im jeweiligen Event-Fenster
die Zeile

```html
<span class="status live">save the date</span>
```

anpassen. `class="status live"` = farbig hervorgehoben, `class="status"` = grau.

**Anmelde-Link setzen**: der Button auf der OP002-Karte und auf der
Startseite zeigt auf `https://luma.com/user/hackops`. Sobald das echte Event auf
lu.ma steht, beide Stellen auf die Event-URL aendern (nach `luma.com` suchen).
Der interne Codename ist bare metal; den nicht als oeffentlichen Titel verwenden.

**Neues Crew-Mitglied**: im `06 CREW` Block eine Zeile kopieren und anpassen:

```html
<div><span class="nm">vorname nachname</span><span class="rl">core team</span></div>
```

**Neues Poster/Bild**: Datei in den Ordner `assets/` hochladen (im GitHub-Ordner
`assets` auf "Add file > Upload files"), dann im Event-Fenster den `src` anpassen.
Poster sind hochkant; auf dem Handy wird automatisch das obere Drittel gezeigt.

**Eine Operation ist vorbei**: die Karte aus `04 OPERATIONS` nach `05 PAST OPS`
verschieben, `data-x`/`data-y` auf freie Koordinaten dort unten setzen, Status auf
`archived`, und die Ankuendigungskarte auf der Startseite auf die naechste
Operation umbiegen. Endstand als `final_standings.txt` Karte danebenstellen.

## Regeln

- Alles klein schreiben (lowercase ist Teil des Designs).
- Keine Gedankenstriche, keine Emojis.
- Sponsoren erst nennen, wenn der Deal fix ist.
- Farben nur ueber die Variablen. **Wichtig:** die Pastelltoene (`var(--pink)`,
  `var(--gold)`, ...) sind nur Flaechen. Fuer Text nimmt man `var(--ink-body)`
  oder die `-txt` Varianten (`var(--pink-txt)`, `var(--sky-txt)`, ...), fuer
  Buttons `var(--action)`. Pastell auf Weiss ist nicht lesbar und faellt beim
  Accessibility-Check durch.

## Handy

Alles unter 640px Breite benutzt eigene Werte. Die Karten stehen dort in zwei
Spalten (Startseite bei x 6000, alles zu Events bei x 7480) und die Kamera zeigt
jede Station ungefaehr 1:1 an. Deshalb sind die Handy-Groessen in
[site.css](site.css) ganz normale Handy-Zahlen: eine Karte ist 340 breit und
Fliesstext ist 15px.

Wenn du eine Karte groesser oder kleiner machst, verschieben sich die Karten
darunter. Die Positionen (`data-y-m`) sind ausgemessen, nicht geschaetzt: im
Browser auf 375x812 stellen und `document.querySelector('.op-next').offsetHeight`
lesen, dann neu stapeln.

## Fuer Fortgeschrittene

- Optik/Farben: [site.css](site.css) (Variablen ganz oben)
- Kamera/Engine: [engine.js](engine.js) (Flug-Geschwindigkeiten in `frame()`)
- Neue Kamera-Stops: ein Element mit `data-stop`, `data-x/y`, `data-vw/vh`
  bekommt automatisch einen Chip in der Navigation. Reihenfolge im Dokument =
  Reihenfolge der Tour. Fuer Handys `data-cx-m/cy-m/vw-m/vh-m` dazu.
- Textbausteine fuer lu.ma und Socials: [EVENT-BLURBS.md](EVENT-BLURBS.md)
- Foto-Hinweis: [photos.html](photos.html)
- Lokal testen: Repo klonen und `pwsh serve.ps1` starten, dann
  http://localhost:8322
