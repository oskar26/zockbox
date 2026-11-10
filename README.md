# 🎮 Zockbox

**Gratis Browser-Spiele zum Zocken mit Freunden – direkt im Browser.**
Kein Konto, kein Download, keine Werbung von Dritten. Lobby erstellen, 4-Buchstaben-Code an die Freunde schicken, losspielen. Läuft auf Handy, iPad und Laptop.

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
- **Mit Code beitreten:** Code auf der Startseite eintippen – die Zockbox sucht automatisch, in welchem Spiel die Lobby offen ist, und leitet dich hin (`games/<spiel>/?code=ABCD`). Klappt die Suche nicht, einfach das Spiel antippen.
- **Einladungs-Link:** `https://oskar26.github.io/zockbox/?join=ABCD` füllt den Code auf der Startseite schon aus.
- **Ruhiges Startseiten-Design:** Die Startseite ist bewusst minimalistisch und zurückhaltend – helles Papier, feine Linien, eine gedeckte Akzentfarbe, klare Typografie, keine harten Schatten oder schrägen Stempel. **Nur die Startseite** (und die Fehlerseite, die dasselbe Stylesheet nutzt) sieht so aus; die Spiele behalten ihr gewohntes Aussehen. Das frühere „psst…“-Flüster-Intro und sein Schalter sind dafür entfallen (der veraltete localStorage-Key `zb_intro` wird nicht mehr verwendet).
- **Neues Favicon / App-Icon:** Schlichtes dunkles „Z“ auf abgerundeter Kachel, als SVG (`assets/favicon.svg`) und als PNG-Set in `assets/` (32/192/512, maskable, Apple Touch). `manifest.webmanifest` und die `theme-color`-Angaben sind darauf abgestimmt.
- **Hain & GitHub (Eigenwerbung):** Hinweise auf [Hain](https://oskar26.github.io/hain/) (private, lokale KI für Android) und auf [github.com/oskar26](https://github.com/oskar26), mit echten Screenshots aus dem [Hain-Repo](https://github.com/oskar26/hain) in `assets/promo/`. Platzierungen: eine ruhige Inline-Karte, ein **Banner direkt vor dem Footer** (inkl. GitHub-Profil), Links in Kopf- und Fußzeile, ein sehr kleiner schließbarer Chip in den Spielen und **höchstens ein** kleines Pop-up pro Sitzung (frühestens nach 15 s, nur bei Ruhe, 7 Tage Pause danach, „Nicht mehr anzeigen“). Abschaltbar unter *Einstellungen → Werbung für Hain & GitHub* (`zb_ads_on = 0`; Pop-ups separat `zb_hain_optout`). **Bei aktivem Tarnmodus wird alle Werbung sofort ausgeblendet.** Es gibt keine Tracker, keine externen Werbe-Skripte und keine Requests zu Werbeservern.
- **Tarnmodus (erweitert, standardmäßig aus):** Unter *Dein Profil → Einstellungen* einschaltbar, gilt für die Startseite und alle Spiele, die `shared/tarnung.js` einbinden. Reine Oberflächen-Tarnung – das Spiel und die WebRTC-Verbindung laufen darunter weiter.
  - **8 Tarnseiten:** **Suche** (Ergebnisseite mit funktionierender Suche, Tabs, Seiten, Filter, Suchverlauf, „Ähnliche Fragen“ und Lexikon-Sprung), **Lexikon** (Photosynthese-Artikel plus Zellatmung, Mitose und Osmose, anklickbares Inhaltsverzeichnis und Artikelsuche), **Dokument** (editierbar, funktionierende Format-Leiste, automatisches Speichern, Drucken), **Taschenrechner** (eigener Rechenkern ohne `eval()`, Tastatur, Verlauf), **Kalender** (echter aktueller Monat, Navigation, Notizen pro Tag), **Notizen** (mehrere Notizen, lokal gespeichert), **Editor** (Zeilennummern, Tab-Einrückung, Speichern) und **Tabelle** (editierbare Zellen, `=SUMME()` und Zellbezüge). Dokument, Notizen, Kalender, Editor und Tabelle speichern ihre Inhalte in `localStorage`.
  - **Tab-Tarnung:** Standard „Passend zur Tarnseite“; zusätzlich „Original“, „Notizen“, „Dokument“, „Suche“, „Lexikon“, „Taschenrechner“, „Kalender“, „Editor“, „Tabelle“ und „Postfach“ – alles eigene, selbst gezeichnete Symbole.
  - **Auslöser:** frei wählbare Panik-Taste oder Kombination (z. B. `Ctrl+Shift+P`), einstellbare Doppeldruckzeit (250 ms – 1,5 s), optional **ein einzelner Druck**, der kleine Panik-Knopf auf Touch-Geräten, **Auto-Tarnung bei Tab-Wechsel/Fokusverlust** mit einstellbarer Verzögerung und optionalem Zeitfenster, sowie Schnellwechsel per `Alt + 1 … 8` und `Alt + Pfeil rechts/links`. Zurück: dieselbe Taste erneut (1× bzw. 2×) oder oben links 2× antippen. `Ctrl+P` druckt nur die Tarnseite.
  - **Werkzeuge:** Testlauf/Vorschau, Statistik (Anzahl Auslösungen, letzte Nutzung), Export/Import der Einstellungen als JSON, Zurücksetzen, konfigurierbarer Standard-Suchbegriff, Dokumentname und optionales Stummschalten von Audio/Video.
  - *Wichtig:* Die Tarnseiten benutzen bewusst **keine echten Logos und keine echten Markennamen** (nur „Suche“ und „Lexikon – Die freie Enzyklopädie“) und keine nachgebauten Schriftzüge – sonst könnte Google Safe Browsing die Seite als Phishing markieren. Bitte beim Ändern so lassen.
  - Gespeichert in `localStorage`: `zb_tarn_on`, `zb_tarn_tab`, `zb_tarn_page`, `zb_tarn_key`, `zb_tarn_fab`, `zb_tarn_delay`, `zb_tarn_single`, `zb_tarn_auto`, `zb_tarn_auto_ms`, `zb_tarn_schedule`, `zb_tarn_from`, `zb_tarn_to`, `zb_tarn_term`, `zb_tarn_doc_name`, `zb_tarn_media`, `zb_tarn_count`, `zb_tarn_last` sowie die Inhalts-Keys `zb_tarn_notes`, `zb_tarn_cal_notes`, `zb_tarn_doc_html`, `zb_tarn_code`, `zb_tarn_sheet`, `zb_tarn_history`, `zb_tarn_calc_hist`.
  - Einbinden in ein Spiel (zwei Zeilen, z. B. vor `</body>` in `games/<spiel>/index.html`):
    `<script type="module" src="../../shared/tarnung.js"></script>` und `<script type="module" src="../../shared/promo.js"></script>`
    Optional im Spiel: `window.addEventListener('zb-tarnung', e => …e.detail.active…)`, z. B. um Sounds stummzuschalten. Programmatisch: `window.zbTarnung.show() / hide() / preview() / switchTo(id) / get() / set() / pages() / settings() / reset() / count()`.
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
index.html             Startseite (minimalistisch): Spiele, Profil, Mit Code beitreten, Hain-Banner
404.html               Fehlerseite (nutzt dasselbe ruhige body.zx-Design)
manifest.webmanifest   App-Infos für „Zum Home-Bildschirm“
assets/                Favicon/App-Icons (SVG + PNG), assets/fonts/, assets/promo/ (Hain-Screenshots)
shared/zockbox.css     Teil A: Basis für Spiele (Reset, Schriften, alte zb-*-Bausteine, unverändert) · Teil B: Startseite (body.zx, zx-*-Klassen)
shared/fonts/          Schriften (lokal, SIL Open Font License)
shared/hub.js          Logik der Startseite (Profil, Einstellungen, Code-Suche, Install-Tipp)
shared/capacity.js     Gerätabhängige Spielerzahlen & Spieldynamik (Startseite und alle Spiele)
shared/tarnung.js      Erweiterter Tarnmodus (8 Tarnseiten, Auslöser, Einstellungen), für Startseite und Spiele
shared/promo.js        Dezente Eigenwerbung für Hain & GitHub, für Startseite und Spiele
shared/profile.js      gemeinsames Spielerprofil (ph_name, ph_avatar)
shared/net.js          Netzwerk-Kern (PeerJS + WebRTC)
shared/vendor/         PeerJS (lokale Kopie)
games/<spiel>/         ein Ordner pro Spiel (Look unverändert, nur promo.js ergänzt)
.nojekyll              damit GitHub Pages alle Dateien unverändert ausliefert
```

**Neues Spiel hinzufügen:** Ordner unter `games/` anlegen, auf der Startseite (`index.html`) eine Karte einbauen und in `shared/hub.js` im Array `GAMES` eintragen (Name, Pfad und Peer-ID-Präfix), damit „Mit Code beitreten“ es findet.

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
