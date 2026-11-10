# 🎮 Zockbox

**Gratis Browser-Spiele zum Zocken mit Freunden – direkt im Browser.**
Kein Konto, kein Download, keine Werbung von Dritten – und eine Statistik, die nur auf deinem Gerät bleibt. Lobby erstellen, 4-Buchstaben-Code an die Freunde schicken, losspielen. Läuft auf Handy, iPad und Laptop.

*made by Oskar*

👉 **https://oskar26.github.io/zockbox/**

---

## 🕹️ Spiele

| Spiel | Worum geht's? | Spieler | Status |
|---|---|---|---|
| 😂 **Mach's Meme** (`games/machs-meme/`) | Meme-Partyspiel: Alle bekommen dieselbe Meme-Vorlage, schreiben die witzigste Caption, dann wird abgestimmt. | 2+ · dynamisch | live |
| 🏁 **Wikirennen** (`games/wikirennen/`) | Wikipedia-Rennen: Vom Startartikel zum Zielartikel – nur über Links im Text. Wer ist zuerst da? | 2+ · dynamisch | live |
| ✏️ **Kritzel-Duell** (`games/kritzel-duell/`) | Zeichnen und Raten: Einer zeichnet, alle raten. | 2+ · dynamisch | live |
| ✉️ **Krakelpost** (`games/krakelpost/`) | Stille Post mit Zeichnen: Satz wird Bild, Bild wird Satz. | 2+ · dynamisch | live |
| 🕵️ Wer lügt? | Alle kennen das Wort – nur einer nicht. Findet den Bluffer. | – | bald |

> **Keine künstliche Spielergrenze:** Früher stand überall „2–30“. `shared/capacity.js` schätzt jetzt aus CPU-Kernen, Arbeitsspeicher, Verbindung und Gerätetyp, wie viele WebRTC-Peers der Host flüssig versorgen kann, und kombiniert das mit einem spielspezifischen **Spaßbereich** (Wartezeit beim Kritzel-Duell, Abstimmen bei Mach's Meme, Kettenlänge bei Krakelpost, Chat und Ergebnisliste beim Wikirennen). Die Startseite zeigt diese Richtwerte pro Karte, inklusive Tooltip mit der Geräteeinschätzung. Der Host kann die Lobbygröße in den Einstellungen jederzeit selbst festlegen – auch deutlich über 30 hinaus; die `settings`-Nachrichten prüfen nur noch Plausibilität, nicht mehr eine feste Obergrenze.

## ✨ Was die Zockbox kann

- **Ein Profil für alle Spiele:** Name und Emoji-Avatar stellst du auf der Startseite unter „Dein Profil“ ein. Gespeichert wird nur in deinem Browser (`localStorage`: `ph_name`, `ph_avatar`).
- **Mit Code beitreten:** Code im Pop-up auf der Startseite eintippen (Chat-Karte → *Mit Code beitreten*) – die Zockbox sucht automatisch, in welchem Spiel die Lobby offen ist, und leitet dich hin (`games/<spiel>/?code=ABCD`). Klappt die Suche nicht, einfach das Spiel antippen.
- **Startseite in zwei Spalten:** links die Begrüßung, rechts eine Chat-Karte („Hallo, ich bin …“ mit Avatar und Name aus dem Profil, direkt bearbeitbar) und ein gezeichnetes Bild. So sind Profil und Beitreten auf dem Handy sofort sichtbar, ohne Scrollen.
- **Einladungs-Link:** `https://oskar26.github.io/zockbox/?join=ABCD` füllt den Code auf der Startseite schon aus.
- **Einstellungen als Pop-up:** Profil, Hain-Hinweis und Tarnmodus stecken in einem breiten Dialog (zwei Spalten, eigenes Scrollen, `Esc` schließt). Auf iPhone/iPad bleibt unten eine feste Leiste mit *Spiele · Einstellungen · Statistik* – die Einstellungen sind also immer erreichbar, nicht mehr in einem Ausklappbereich links versteckt.
- **Illustrierte Spielkarten:** Jede Karte zeigt statt eines einzelnen Symbols eine kleine Szene im Look der Seite (Meme-Vorlage mit Captions, Artikel mit Inhaltsverzeichnis, Zeichenfläche mit Wort-Maske, Notizblock → Bild). Gleiche Linien, gleiche Farben, gleiche Typografie wie der Rest der Startseite.
- **Ruhiges Startseiten-Design:** Die Startseite ist bewusst minimalistisch und zurückhaltend – helles Papier, feine Linien, eine gedeckte Akzentfarbe, klare Typografie, keine harten Schatten oder schrägen Stempel. **Nur die Startseite** (und die Fehlerseite, die dasselbe Stylesheet nutzt) sieht so aus; die Spiele behalten ihr gewohntes Aussehen. Das frühere „psst…“-Flüster-Intro und sein Schalter sind dafür entfallen (der veraltete localStorage-Key `zb_intro` wird nicht mehr verwendet).
- **Neues Favicon / App-Icon:** Schlichtes dunkles „Z“ auf abgerundeter Kachel, als SVG (`assets/favicon.svg`) und als PNG-Set in `assets/` (32/192/512, maskable, Apple Touch). `manifest.webmanifest` und die `theme-color`-Angaben sind darauf abgestimmt.
- **Hain-Hinweis (Eigenwerbung, nicht abschaltbar):** Ein ruhiger Hinweis auf [Hain](https://oskar26.github.io/hain/) (private, lokale KI für Android) mit echten Screenshots aus dem [Hain-Repo](https://github.com/oskar26/hain) in `assets/promo/`. Platzierungen: eine Inline-Karte unter den Spielen, ein Banner direkt vor dem Footer und ein später, kleiner Chip in den Spielen (lässt sich nur für die laufende Sitzung wegtippen). **Keine Pop-ups mehr, kein GitHub-Hinweis mehr.** Der Hinweis gehört zur Zockbox und lässt sich bewusst nicht abschalten – der Schalter in den Einstellungen ist gesperrt und erklärt das. Bei aktivem Tarnmodus wird alles sofort ausgeblendet. Keine Tracker, keine externen Werbe-Skripte, keine Requests zu Werbeservern.
- **Tarnmodus (erweitert, standardmäßig aus):** Unter *Einstellungen* (Pop-up) einschaltbar, gilt für die Startseite und alle Spiele, die `shared/tarnung.js` einbinden. Reine Oberflächen-Tarnung – das Spiel und die WebRTC-Verbindung laufen darunter weiter.
  - **Drei Looks – Titel, Favicon und Seiten gehören zusammen.** Statt Titel und Symbol getrennt zu wählen, gibt es genau drei Looks; ein Look liefert Tab-Titel, Symbol und die passenden Seiten:
    - **Lernplattform (Standard)** – Nachbau einer Schul-Lernplattform: **Anmeldung** (Anmeldename/Kennwort, Sprache, Cookie-Hinweis, Hilfe-Knopf), **Dashboard** (Zeitlinie, Kalender mit echtem Monat, Kursübersicht), **Meine Kurse** (acht Kurskacheln mit eigenen Covern, Suche, Filter) und **Kursseite** (Brotkrümelnavigation, Tabs, Wochenblöcke, Lernfortschritt). Anmeldung prüft nur, ob etwas eingetragen ist – nichts wird gesendet.
    - **Zockbox** – der Look dieser Seite: Startseite mit Spielekarten sowie Dokument, Notizen, Kalender, Editor, Tabelle und Taschenrechner.
    - **Lexikon** – Nachschlagewerk mit Artikel (Photosynthese, Zellatmung, Mitose, Osmose), Inhaltsverzeichnis, Artikelsuche und Suchseite.
  - **Favicon folgt automatisch:** jedes Look-Symbol ist selbst gezeichnet (Buch mit Lichtstrahlen bzw. „Z“ im dunklen Quadrat) und wird als `data:`-SVG gesetzt; das `theme-color` der Statusleiste wechselt mit. Beim Ausschalten kommt das Original zurück.
  - **Auslöser:** frei wählbare Panik-Taste oder Kombination (z. B. `Ctrl+Shift+P`), einstellbare Doppeldruckzeit (250 ms – 1,5 s), optional **ein einzelner Druck**, **Auto-Tarnung bei Tab-Wechsel/Fokusverlust** mit einstellbarer Verzögerung und optionalem Zeitfenster, sowie Schnellwechsel per `Alt + 1 … 7` und `Alt + Pfeil rechts/links`. Zurück: dieselbe Taste erneut (1× bzw. 2×) oder oben links 2× antippen.
  - **Knopf unten links:** Auf Handy/Tablet zeigt er die Tarnseite an – und **auf der Tarnseite führt ein einziger Tipp sofort zurück ins Spiel** (dunkler Knopf mit Pfeil, liegt über dem Overlay).
  - **Werkzeuge:** Testlauf/Vorschau, Statistik (Anzahl Auslösungen, letzte Nutzung), Export/Import der Einstellungen als JSON, Zurücksetzen, konfigurierbarer Standard-Suchbegriff, Dokumentname und optionales Stummschalten von Audio/Video.
  - *Wichtig:* Die Looks sind eigene Nachbauten – **keine echten Logos, Markennamen oder nachgebauten Schriftzüge** (nur „Lernplattform“, „Lexikon – Die freie Enzyklopädie“, „Zockbox“ und erfundene Kursnamen). Sonst könnte Google Safe Browsing die Seite als Phishing markieren. Bitte beim Ändern so lassen.
  - Gespeichert in `localStorage`: `zb_tarn_on`, `zb_tarn_look`, `zb_tarn_page`, `zb_tarn_key`, `zb_tarn_fab`, `zb_tarn_delay`, `zb_tarn_single`, `zb_tarn_auto`, `zb_tarn_auto_ms`, `zb_tarn_schedule`, `zb_tarn_from`, `zb_tarn_to`, `zb_tarn_term`, `zb_tarn_doc_name`, `zb_tarn_media`, `zb_tarn_count`, `zb_tarn_last` sowie die Inhalts-Keys `zb_tarn_notes`, `zb_tarn_cal_notes`, `zb_tarn_doc_html`, `zb_tarn_code`, `zb_tarn_sheet`, `zb_tarn_history`, `zb_tarn_calc_hist`. Der alte Schlüssel `zb_tarn_tab` wird nicht mehr benutzt (Werte werden beim ersten Start automatisch einem Look zugeordnet).
  - Einbinden in ein Spiel (zwei Zeilen, z. B. vor `</body>` in `games/<spiel>/index.html`):
    `<script type="module" src="../../shared/tarnung.js"></script>` und `<script type="module" src="../../shared/promo.js"></script>`
    Optional im Spiel: `window.addEventListener('zb-tarnung', e => …e.detail.active…)`, z. B. um Sounds stummzuschalten. Programmatisch: `window.zbTarnung.show() / hide() / preview() / switchTo(id) / get() / set() / setLook(id) / look() / looks() / pages() / settings() / reset() / count()`.
- **Statistik (`statistik.html`):** Wie oft du gewonnen hast, wie du im Schnitt abschneidest – auf einer eigenen Seite. Die Spiele melden das Ende einer Partie per Ereignis (`window.dispatchEvent(new CustomEvent('zb:game', { detail: { game, mode, players } }))`), `shared/stats.js` zählt lokal mit:
  - **Pro Spiel:** Partien, Siege, Siegquote, Ø Platz, Ø Punkte, beste Serie.
  - **Wer wie oft gewinnt:** alle Namen aus Lobbys auf diesem Gerät, mit Siegen und Quote (die eigene Zeile ist hervorgehoben).
  - **Letzte 14 Tage** als kleine Balkenreihe, dazu ein Verlauf der letzten Partien.
  - Export als JSON, Zurücksetzen. Auf der Startseite zeigen die Spielkarten eine kleine Sieg-Marke (`1/3 Siege`) und das Einstellungs-Pop-up eine Kurzfassung.
  - Doppelte Meldungen derselben Endansicht werden erkannt und nicht doppelt gezählt. Gespeichert in `localStorage`: `zb_stats_v1`. Nichts verlässt das Gerät.
- **Startet auch ohne Netz (`sw.js`):** Ein Service Worker legt Startseite, Statistik, Styles, Skripte und Schriften beim ersten Besuch ab. Ist das WLAN weg, startet die Zockbox trotzdem – Lobbys brauchen natürlich weiter eine Verbindung. „Seiten“ kommen erst aus dem Netz (frisch), sonst aus dem Cache; Dateien aus dem Cache mit stiller Aktualisierung. Spiele, PeerJS und fremde Hosts werden nie zwischengespeichert oder umgeleitet. Der Cache heißt `zockbox-v3`; bei Änderungen an Kern-Dateien die Version in `sw.js` erhöhen.
- **Gruppengröße nach Gefühl statt nach Zahl:** Kein hartes Limit. Die Startseite berechnet aus deinem Gerät und der Spieldynamik, was flüssig läuft und wo der meiste Spaß entsteht; der Host entscheidet am Ende selbst.
- **Wie eine App:** Auf iPhone/iPad in Safari *Teilen → Zum Home-Bildschirm*. Dann hat die Zockbox ihr eigenes Icon und startet im Vollbild.

## 🔌 Wie funktioniert die Verbindung?

Die Zockbox hat **keinen eigenen Server**. Es sind nur statische Dateien (HTML, CSS, JavaScript).

1. **Der Host-Browser ist der Spielserver.** Wer eine Lobby erstellt, dessen Browser verwaltet das Spiel: Spieler, Runden, Punkte.
2. **PeerJS macht nur das „Hallo“.** Damit sich zwei Browser im Internet finden, benutzen wir den kostenlosen öffentlichen Vermittlungsserver von [PeerJS](https://peerjs.com/) (Signaling). Der Lobby-Code steckt in der Peer-ID, z. B. `zockbox-machs-meme-v1-p-ABCD`. (Das Präfix `zockbox-` und die Spiel-IDs bleiben aus technischen Gründen so – sie sieht niemand.)
3. **Danach geht alles direkt per WebRTC.** Sobald die Verbindung steht, laufen alle Spieldaten direkt zwischen den Geräten – nicht über einen Zockbox-Server.

Die gemeinsame Netzwerk-Logik für alle Spiele steckt in `shared/net.js` (Klasse `Room`).

> Hinweis: Manche Netzwerke blockieren WebRTC oder peerjs.com. Dann hilft es oft, mobile Daten zu benutzen.
> Wenn der Host den Tab schließt, ist die Lobby weg.

## 📁 Aufbau

```
index.html             Startseite: Spiele mit illustrierten Karten, Profil, Code beitreten, Hain-Hinweis, Einstellungs-Pop-up
statistik.html         Statistikseite: Siege, Quoten, Plätze, wer wie oft gewinnt
404.html               Fehlerseite (nutzt dasselbe ruhige body.zx-Design)
manifest.webmanifest   App-Infos für „Zum Home-Bildschirm“
assets/                Favicon/App-Icons (SVG + PNG), assets/fonts/, assets/promo/ (Hain-Screenshots)
shared/zockbox.css     Teil A: Basis für Spiele (Reset, Schriften, alte zb-*-Bausteine, unverändert) · Teil B: Startseite (body.zx, zx-*-Klassen)
shared/fonts/          Schriften (lokal, SIL Open Font License)
shared/hub.js          Logik der Startseite (Profil, Einstellungen, Code-Suche, Install-Tipp)
shared/capacity.js     Gerätabhängige Spielerzahlen & Spieldynamik (Startseite und alle Spiele)
shared/tarnung.js      Tarnmodus (3 Looks, 13 Tarnseiten, Auslöser, Einstellungen), für Startseite und Spiele
shared/tarnung-theme.css  Looks der Tarnseiten (Lernplattform, Zockbox, Lexikon)
shared/stats.js        Lokale Spielstatistik (localStorage, Ereignis `zb:game`)
shared/stats-page.js   Zeichnet statistik.html
shared/promo.js        Hinweis auf Hain (nicht abschaltbar, keine Pop-ups), für Startseite und Spiele
shared/profile.js      gemeinsames Spielerprofil (ph_name, ph_avatar)
shared/net.js          Netzwerk-Kern (PeerJS + WebRTC)
shared/vendor/         PeerJS (lokale Kopie)
games/<spiel>/         ein Ordner pro Spiel (Look unverändert, nur promo.js ergänzt)
.nojekyll              damit GitHub Pages alle Dateien unverändert ausliefert
sw.js                  Service Worker: Startseite & Co. offline verfügbar
```

**Neues Spiel hinzufügen:** Ordner unter `games/` anlegen, auf der Startseite (`index.html`) eine Karte einbauen und in `shared/hub.js` im Array `GAMES` eintragen (Name, Pfad und Peer-ID-Präfix), damit „Mit Code beitreten“ es findet. Für die Statistik `shared/stats.js` einbinden und am Spielende das Ereignis `zb:game` mit den Spielern senden (siehe `games/kritzel-duell/game.js`), außerdem das Spiel in `GAME_META` in `shared/stats.js` ergänzen.

## 🚀 Online stellen (GitHub Pages) – Schritt für Schritt

Repo: **https://github.com/oskar26/zockbox** – GitHub Pages ist dort schon eingeschaltet (Branch `main`, Ordner `/ (root)`).

1. **Pull Request mergen:** Im Repo oben auf **Pull requests** → den offenen PR öffnen → **Merge pull request** → **Confirm merge**.
2. **1–2 Minuten warten.** GitHub baut die Seite automatisch neu (unter **Actions** siehst du den Fortschritt).
3. **Öffnen:** **https://oskar26.github.io/zockbox/** – falls noch die alte Version kommt, Seite neu laden (am iPhone: Tab schließen und neu öffnen).
4. **Testen:** Auf zwei Geräten öffnen, auf dem einen eine Lobby erstellen, auf dem anderen den Code eingeben.
5. **Klappt keine Verbindung?** Dann blockiert das Netz vermutlich WebRTC oder peerjs.com. Mit mobilen Daten probieren.
6. **Neue Version hochladen:** Änderungen einfach auf `main` pushen (oder per PR mergen) – Pages aktualisiert sich nach ca. 1–2 Minuten von selbst.

Falls Pages doch einmal aus ist: **Settings** → links **Pages** → *Build and deployment*: Source **Deploy from a branch**, Branch **main**, Ordner **/ (root)** → **Save**.

Lokal testen geht auch:

```bash
python3 -m http.server 8000
# dann http://localhost:8000 im Browser öffnen
```

(Einfach die `index.html` doppelklicken reicht nicht, weil JavaScript-Module einen Webserver brauchen.)

## 🙏 Credits

- [PeerJS](https://github.com/peers/peerjs) – MIT-Lizenz, inklusive des kostenlosen PeerJS-Cloud-Servers fürs Signaling
- Meme-Vorlagen über die [imgflip](https://imgflip.com/)-API und [memegen.link](https://memegen.link/)
- Artikel aus der [Wikipedia](https://de.wikipedia.org/) – Texte unter [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.de)
- Schriften: Inter (Startseite) sowie Anton und Unbounded (Spiel-Basis), SIL Open Font License, `shared/fonts/`; Permanent Marker liegt weiter in `assets/fonts/` (Apache License 2.0), wird von der neuen Startseite aber nicht mehr aktiv genutzt. Dazu die Schriften in den Spiel-Ordnern – alles lokal, nichts von fremden Servern
- Emojis: die Emoji-Schrift deines Geräts
- Icons und Spiel-Cover: selbst gemacht (CSS/SVG)
- Screenshots und App-Icon in `assets/promo/`: aus dem [Hain-Repo](https://github.com/oskar26/hain) (Website-Screenshots, self-hosted, damit keine externen Requests nötig sind)
