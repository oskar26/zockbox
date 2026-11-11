// Zockbox – Zweisprachigkeit nach Standort. made by Oskar
// ---------------------------------------------------------------------------
// Deutschland (und Österreich) bekommen Deutsch, überall sonst Englisch.
//
// Reihenfolge der Entscheidung:
//   1. ?lang=de / ?lang=en  (zum Ausprobieren und für Links, die man teilt)
//   2. Edge-Cookie `geo` (Cloudflare, wenn die Seite dort liegt)
//   3. https://ipapi.co/country/  (kostenlos, ohne Schlüssel, ~1 Abfrage/Gerät)
//   4. Zeitzone des Browsers (Europe/Berlin, Europe/Vienna …) – nie falsch für
//      den Gerätestandort, aber ungenau für Reisende
//   5. Browsersprache
//
// Die Entscheidung wird lokal gemerkt, damit nicht bei jedem Aufruf ein
// Netzwerk-Request nötig ist. Wer selbst umschaltet, bleibt bei seiner Wahl.
//
// Die Texte stehen im Markup mit `data-i18n` / `data-i18n-attr`. Deutsch ist
// der Originaltext im HTML und bleibt die Quelle der Wahrheit: Fehlt eine
// Übersetzung, bleibt einfach der deutsche Satz stehen (kein leerer Fleck).
// ---------------------------------------------------------------------------

const KEY = 'zb_lang_v1';

// Nur diese Länder bekommen Deutsch. Österreich gehört dazu, weil die
// Zielgruppe dort dieselbe ist – die Schweiz bewusst nicht (Mehrheit Deutsch,
// aber auch Französisch/Italienisch; Englisch ist dort der kleinere Fehler).
const GERMAN = new Set(['DE', 'AT']);

export const STRINGS = {
  en: {
    // Kopf / Navigation
    'Browser-Spiele ohne Anmeldung': 'Browser games without sign-up',
    'Spiele': 'Games',
    'Statistik': 'Stats',
    'Hallo, ich bin': "Hi, I'm",
    'Profil': 'Profile',
    'Startseite': 'Home',

    // Installationshinweis
    'Tipp: In Safari auf': 'Tip: in Safari tap',
    'Teilen': 'Share',
    'und dann': 'and then',
    '„Zum Home-Bildschirm“': '“Add to Home Screen”',
    '– dann startet die Zockbox wie eine App.': '– then Zockbox starts like an app.',

    // Hero
    'Vier Spiele': 'Four games',
    'Kostenlos · ohne Konto': 'Free · no account',
    'Spiele mit Freunden.': 'Play with friends.',
    'Direkt im Browser.': 'Right in your browser.',
    'Lobby erstellen, Code teilen, losspielen. Kein Konto, kein Download – die Verbindung läuft direkt zwischen euren Geräten.':
      'Create a lobby, share the code, start playing. No account, no download – the connection runs directly between your devices.',
    'Personen · geschätzt': 'players · estimated',
    'Anmeldungen': 'sign-ups',
    'sagt hallo': 'says hi',
    'Schön, dass du da bist.': 'Good to see you.',
    'Willst du eine Lobby aufmachen oder einer beitreten?': 'Want to open a lobby or join one?',
    'Lobby erstellen': 'Create a lobby',
    'Spiel aussuchen': 'pick a game',
    'Mit Code beitreten': 'Join with a code',
    '4 Buchstaben': '4 letters',
    'Lobby erstellen, Code teilen, zocken.': 'Create a lobby, share the code, play.',
    'Kein Konto, kein Download – die Verbindung läuft direkt zwischen euren Geräten.':
      'No account, no download – the connection runs directly between your devices.',
    'Gruppengröße nach Gerät & Spieldynamik · kein festes Limit':
      'Group size depends on device & game flow · no fixed limit',

    // Spiele
    'Live': 'Live',
    "Alle bekommen dieselbe Vorlage – die witzigste Caption gewinnt.":
      'Everyone gets the same template – the funniest caption wins.',
    'Von „Pizza“ zu „Mond“ – nur über Links. Wer ist zuerst am Ziel?':
      'From “Pizza” to “Moon” – using links only. Who gets there first?',
    'Einer zeichnet, alle raten. Wer\'s zuerst erkennt, holt die Punkte.':
      'One draws, everyone guesses. First to get it takes the points.',
    'Stille Post mit Zeichnen: Satz wird Bild, Bild wird Satz.':
      'Chinese whispers with drawing: sentence becomes picture, picture becomes sentence.',
    'Öffnen': 'Open',
    'Wer lügt?': 'Who is lying?',
    'Alle kennen das Wort – nur einer nicht. Findet den Bluffer.':
      'Everyone knows the word – except one. Find the bluffer.',
    'In Arbeit': 'In progress',
    'Bald': 'Soon',

    // Hain
    'Ein anderes Projekt von Oskar': 'Another project by Oskar',
    'Hain – KI, die auf deinem Handy bleibt': 'Hain – AI that stays on your phone',
    'Private Android-App mit einem KI-Assistenten direkt auf dem Gerät: kein Konto, keine Cloud, keine Werbung, kein Tracking. Nach dem einmaligen Download der Modelle auch offline nutzbar.':
      'A private Android app with an AI assistant running on the device itself: no account, no cloud, no ads, no tracking. Works offline once the models are downloaded.',
    'On-device': 'On-device',
    'Ohne Konto': 'No account',
    'Open Source': 'Open source',
    'Deutsch & Englisch': 'German & English',
    'Hain ansehen': 'See Hain',
    'Hain · Private KI für Android': 'Hain · private AI for Android',
    'Deine Fragen bleiben auf deinem Handy.': 'Your questions stay on your phone.',
    'Hain ist ein kleiner KI-Assistent, der komplett auf dem Gerät läuft – ohne Konto, ohne Cloud, ohne Werbung und ohne Tracking. Antworten auf Deutsch, Werkzeuge wie Wetter und Wikipedia nur auf Anfrage, jede Verbindung im Netzwerk-Log sichtbar.':
      'Hain is a small AI assistant that runs entirely on your device – no account, no cloud, no ads, no tracking. Answers in German, tools such as weather and Wikipedia only on request, every connection visible in the network log.',
    'Webseite ansehen': 'Visit the website',
    'APK herunterladen': 'Download the APK',
    'Warum Hain?': 'Why Hain?',
    'Ein Modell, das dir gehört.': 'A model that belongs to you.',
    'Die Modelle liegen nach dem Download auf dem Gerät. Fragen, Notizen und Dokumente bleiben dort – nichts wird mitgelesen, nichts hochgeladen.':
      'After the download the models live on your device. Questions, notes and documents stay there – nothing is read along, nothing is uploaded.',
    'Mehr erfahren': 'Learn more',
    'Eigenes Projekt, keine bezahlte Werbung. Hain ist kostenlos und Open Source; für den Download ist Android 10 oder neuer nötig.':
      'Our own project, not paid advertising. Hain is free and open source; Android 10 or newer is required.',

    // Profil
    'Dein Profil': 'Your profile',
    '✓ gespeichert': '✓ saved',
    'so heißt du in allen Spielen': 'that is your name in every game',
    'Dein Name': 'Your name',
    'Gilt für alle Spiele und bleibt nur auf diesem Gerät. Tipp auf den Avatar zum Ändern.':
      'Used in every game and stored only on this device. Tap the avatar to change it.',
    'Einstellungen': 'Settings',
    'Deine Statistik': 'Your stats',
    "So geht's": 'How it works',
    'Dein Browser wird zum Spielserver. Kein Konto, kein Download.':
      'Your browser becomes the game server. No account, no download.',
    'Code teilen': 'Share the code',
    'Freunde tippen den 4-Buchstaben-Code ein – hier oder direkt im Spiel.':
      'Friends type the 4-letter code – here or right in the game.',
    'Zocken': 'Play',
    'Die Daten laufen direkt zwischen euren Geräten (WebRTC). Kein Zockbox-Server liest mit.':
      'Data travels directly between your devices (WebRTC). No Zockbox server reads along.',

    // Fuß
    'von': 'by',
    'Zum Spaß mit Freunden. Bitte halte dich an die Regeln deiner Schule.':
      'For fun with friends. Please follow your school’s rules.',
    'Zockbox · Verbindung über PeerJS · Memes über imgflip & memegen.link · Texte aus Wikipedia (CC BY-SA 4.0)':
      'Zockbox · connection via PeerJS · memes via imgflip & memegen.link · text from Wikipedia (CC BY-SA 4.0)',
    'Hain': 'Hain',
    'Quellcode': 'Source code',

    // Einstellungen
    'Tarnmodus, Look und Hinweise – alles bleibt auf diesem Gerät.':
      'Disguise mode, look and notices – all stored on this device.',
    'Gilt für alle Spiele. Wird nur in diesem Browser gespeichert.':
      'Used in every game. Stored only in this browser.',
    'Hinweise': 'Notices',
    'Der Hinweis auf Hain gehört zur Zockbox und bleibt deshalb immer sichtbar – dezent, ohne Pop-ups und ohne Dritte.':
      'The Hain notice is part of Zockbox and therefore always visible – subtle, no pop-ups, no third parties.',
    'Im Tarnmodus werden die Hinweise automatisch ausgeblendet – so fällt nichts auf.':
      'In disguise mode the notices hide automatically – so nothing stands out.',
    'Deine Zahlen': 'Your numbers',
    'Partien, Siege und Plätze stehen ausführlich unter':
      'Matches, wins and placements in detail under',
    'Den Code bekommst du von der Person, die die Lobby erstellt hat.':
      'You get the code from the person who created the lobby.',
    'Los': 'Go',
    'Auto': 'Auto',
    'Der Code hat 4 Buchstaben, z. B. KXPM.': 'The code has 4 letters, e.g. KXPM.',
    'Suche …': 'Searching …',
    'Ich suche die Lobby in allen Spielen …': 'Looking for the lobby in all games …',
    'Den Code gibt es in mehreren Spielen. Tipp unten auf das richtige Spiel.':
      'This code exists in several games. Tap the right game below.',
    'Keine offene Lobby mit diesem Code gefunden. Stimmt der Code? Oder wähl das Spiel unten aus.':
      'No open lobby with this code. Check the code, or pick the game below.',
    'Konnte nicht automatisch suchen. Wähl bitte unten das Spiel aus.':
      'Could not search automatically. Please pick the game below.',
    'Code eingetragen – tipp auf „Los“, um beizutreten.':
      'Code entered – tap “Go” to join.',
    'Der Hain-Hinweis gehört zur Zockbox und bleibt an.': 'The Hain notice is part of Zockbox and stays on.',
    'das bist du': 'that is you',
    'Hallo, hier ist': 'Hi, this is',
    'Avatar auswählen': 'Choose avatar',
    'Zufälliger Name und Avatar': 'Random name and avatar',
    'Deine Statistiken': 'Your stats',
    'Partien': 'Matches',
    'Siege': 'Wins',
    'Siegquote': 'Win rate',

    // Statistikseite
    'Dein Konto für nichts · nur auf diesem Gerät': 'Your account for nothing · this device only',
    'Wie du': 'How you',
    'abschneidest.': 'do.',
    'Siege, Plätze, Punkte und die Mitspieler, gegen die du gewinnst – alles zählt dein Browser mit. Keine Anmeldung, kein Server, keine Übertragung.':
      'Wins, placements, points and the people you play against – your browser keeps count. No sign-up, no server, nothing transmitted.',
    'Pro Spiel': 'Per game',
    'Siegquote, Plätze, Punkte': 'Win rate, placements, points',
    'Wer wie oft gewinnt': 'Who wins how often',
    'Mitspieler auf diesem Gerät': 'Players on this device',
    'Letzte zwei Wochen': 'Last two weeks',
    'Partien und Siege': 'Matches and wins',
    'Verlauf': 'History',
    'Die letzten Partien': 'Recent matches',
    'Gezählt wird, sobald eine Partie zu Ende ist – auf dem Gerät, auf dem du gespielt hast. Wer den Browser-Speicher löscht, setzt die Statistik zurück. Die Liste „Wer wie oft gewinnt“ enthält nur Namen, die in Lobbys auf diesem Gerät vorkamen.':
      'Counting starts when a match ends – on the device you played on. Clearing browser storage resets the stats. The “Who wins how often” list only contains names that appeared in lobbies on this device.',
    'Statistik exportieren': 'Export stats',
    'Zurücksetzen': 'Reset',
    'In die Zwischenablage kopiert ✓': 'Copied to clipboard ✓',
    'Wirklich alle Zockbox-Statistiken auf diesem Gerät löschen?':
      'Really delete all Zockbox stats on this device?',
    'Dein bestes Spiel': 'Your best game',
    'Noch keine Partie zu Ende gespielt.': 'No finished match yet.',
    'Starte eine Lobby – nach der ersten Runde steht hier, wie es gelaufen ist.':
      'Start a lobby – after the first round you will see how it went.',
    'Noch niemand eingetragen.': 'Nobody listed yet.',
    'Spiel eine Runde – dann tauchen hier alle Namen auf, mit denen du gespielt hast.':
      'Play a round – then everyone you played with shows up here.',
    'Der Verlauf ist noch leer.': 'The history is still empty.',
    'Nach der ersten beendeten Partie steht hier, was passiert ist.':
      'After your first finished match you will see what happened here.',
    'Sieg in Folge': 'win in a row',
    'Siege in Folge': 'wins in a row',
    'Sieg': 'win',
    '(du)': '(you)',
    'Spieler': 'players',
    'Punkte': 'points',
    'Platz': 'place',
    'Zockbox Startseite': 'Zockbox home',
    'Hinweis schließen': 'Dismiss notice',
    'Hinweis auf die App Hain': 'Notice about the app Hain',
    'Hain: Chat-Ansicht auf dem Handy': 'Hain: chat view on a phone',
    'Avatare': 'Avatars',
    'Hain App-Icon': 'Hain app icon',
    'Einstellungen schließen': 'Close settings',
    'Hinweis auf Hain (immer an)': 'Hain notice (always on)',
    'Schließen': 'Close',
    'Lobby-Code (4 Buchstaben)': 'Lobby code (4 letters)',
    'Spiel auswählen': 'Choose game',
    'Spiel automatisch erkennen': 'Detect game automatically',
    'Schnellzugriff': 'Quick access',
    'Siege der letzten 14 Tage': 'Wins in the last 14 days',
    'Hinweis auf Hain': 'About Hain',
    'Tarnmodus': 'Disguise mode',
    'Häufige Fragen': 'Frequently asked questions',
    'Kurz beantwortet': 'Quick answers',
    'Brauche ich ein Konto, um Zockbox zu spielen?': 'Do I need an account to play Zockbox?',
    'Nein. Name und Avatar genügen, es gibt keine Anmeldung und keinen Download. Die Verbindung läuft direkt zwischen den Geräten (WebRTC).':
      'No. A name and an avatar are enough – no sign-up, no download. The connection runs directly between the devices (WebRTC).',
    'Wie viele Leute können mitspielen?': 'How many people can play?',
    'Es gibt kein festes Limit. Richtwert sind 2 bis 8 Personen, je nach Spiel und Gerät des Hosts – große Runden funktionieren zum Beispiel bei Krakelpost gut.':
      'There is no fixed limit. 2 to 8 players is the sweet spot, depending on the game and the host device – Krakelpost also works well with big groups.',
    'Läuft Zockbox auf dem Handy?': 'Does Zockbox work on a phone?',
    'Ja, im Browser auf Android, iPhone, Tablet, Laptop und PC. In Safari und Chrome lässt sich die Seite zum Home-Bildschirm hinzufügen und startet dann wie eine App.':
      'Yes, in the browser on Android, iPhone, tablet, laptop and desktop. In Safari and Chrome you can add the site to your home screen and it starts like an app.',
    'Was kostet Zockbox?': 'What does Zockbox cost?',
    'Nichts. Alle vier Spiele sind kostenlos und werbefrei; es gibt keine Konten und keine Bezahlschranke.':
      'Nothing. All four games are free and ad-free; there are no accounts and no paywall.',
    'Kurz beantwortet · FAQ': 'Quick answers · FAQ',

    // Startseite (neu)
    'Lobby aufmachen, Code teilen, losspielen. Kein Konto, kein Download – die Verbindung läuft direkt zwischen euren Geräten.':
      'Open a lobby, share the code, start playing. No account, no download – the connection runs directly between your devices.',
    'Spielen →': 'Play →',
    'Spiel': 'Game',
    'Name und Avatar für alle Spiele': 'Name and avatar for every game',
    'Gilt für alle Spiele und wird nur in diesem Browser gespeichert.':
      'Used in every game and stored only in this browser.',
    'Deine Zahlen': 'Your numbers',
    'Tarnmodus & Auslöser': 'Disguise mode & trigger',
    'Tarnmodus ist an – Titel, Symbol und Tarnseite sind gesetzt.':
      'Disguise mode is on – tab title, icon and page are set.',
    'Titel, Symbol und Tarnseite für den Fall der Fälle':
      'Tab title, icon and disguise page for when you need them',
    'Alles bleibt auf diesem Gerät': 'Everything stays on this device',
    'Statistik, Profil und Tarn-Einstellungen liegen nur im Browser.':
      'Stats, profile and disguise settings live only in the browser.',
    'Ausführlich unter': 'In detail under',
    'Tarnmodus, Auslöser und Hinweise – alles bleibt auf diesem Gerät.':
      'Disguise mode, trigger and notices – all stored on this device.',
    'Ein kleiner KI-Assistent, der komplett auf dem Gerät läuft – ohne Konto, ohne Cloud, ohne Werbung. Kostenlos und Open Source.':
      'A small AI assistant that runs entirely on your device – no account, no cloud, no ads. Free and open source.',
    'APK laden': 'Get the APK',
    'Jeder Name zählt nur auf diesem Gerät.': 'Every name counts only on this device.',
    'Noch keine Partie gespielt.': 'No match played yet.',
    'Seite in diesem Look': 'Page in this look',
    'Auslöser': 'Trigger',
    'Automatisch tarnen': 'Auto disguise',
    'Inhalt der Tarnseiten': 'Disguise page content',
    'Tasten': 'Keys',
    'Deine Statistik': 'Your stats',
    'Siege, Plätze und Punkte – gezählt in diesem Browser. Keine Anmeldung, kein Server, nichts wird übertragen.':
      'Wins, placements and points – counted in this browser. No sign-up, no server, nothing transmitted.',
    'Partien und Siege pro Tag': 'Matches and wins per day',
    'Wer gewinnt': 'Who wins',
    '1 Partie': '1 match',
    'Serie': 'streak',
    'Statistik und Werkzeuge': 'Stats and tools',
    'Panik-Knopf unten links': 'Panic button, bottom left',
    'Einmal drücken genügt': 'One press is enough',
    'Zeit für Doppeldruck': 'Double-press window',
    'Sofortige Tarnung ohne Doppeldruck.': 'Instant disguise, no double press.',
    'Bei Tab-Wechsel oder Fokusverlust': 'On tab switch or lost focus',
    'Blendet die Tarnseite ein, wenn du den Tab verlässt. Das Spiel läuft weiter.':
      'Shows the disguise page when you leave the tab. The game keeps running.',
    'Verzögerung': 'Delay',
    'Nur in einem Zeitfenster': 'Only within a time window',
    'Gerade aktiv.': 'Active right now.',
    'Außerhalb des Zeitfensters – gerade pausiert.': 'Outside the window – paused for now.',
    'Auto-Tarnung ist aus.': 'Auto disguise is off.',
    'Name im Dashboard': 'Name on the dashboard',
    'Name des Dokuments': 'Document name',
    'Medien stummschalten': 'Mute media',
    'Ton von Audio und Video während der Tarnung.': 'Audio and video sound while disguised.',
    'Auslösungen': 'Triggers',
    'Zuletzt': 'Last',
    'Seiten': 'Pages',
    'Status': 'Status',
    'Testlauf': 'Test run',
    'Exportieren': 'Export',
    'Importieren': 'Import',
    'Kopieren': 'Copy',
    'Vorschau': 'Preview',
    'Tarnmodus': 'Disguise mode',
    'Titel und Symbol im Tab, dazu eine ganze Tarnseite im Vollbild – für die Startseite und alle Spiele.':
      'Tab title and icon plus a full disguise page – on the home page and in every game.',
    'Ein Look = ein Tab-Titel, ein Favicon und passende Seiten. Standard: Lernplattform.':
      'One look = one tab title, one favicon and matching pages. Default: learning platform.',
    'Name und Avatar wählen – kein Konto nötig.': 'Pick a name and avatar – no account needed.',
    'Spiel wählen': 'Pick a game',
    'Eine Person erstellt die Lobby und bekommt einen Code.': 'One person opens the lobby and gets a code.',
    'Die anderen tippen die vier Buchstaben oben ein.': 'Everyone else types those four letters above.',
    'Die Daten laufen direkt zwischen euren Geräten (WebRTC).': 'The data runs directly between your devices (WebRTC).',
    'Statistik →': 'Stats →',
    '· zum Spaß mit Freunden': '· for fun with friends',
    'Hauptmenü': 'Main menu',
    'Partien der letzten 14 Tage': 'Matches of the last 14 days',
    'Fehler 404': 'Error 404',
    'Diese Seite gibt es nicht.': 'This page does not exist.',
    'Vielleicht ein Tippfehler im Link. Du wolltest einer Lobby beitreten? Gib den Code auf der Startseite ein.':
      'Maybe a typo in the link. Trying to join a lobby? Enter the code on the home page.',
    'Zur Startseite': 'Back to home',
    'GitHub @oskar26': 'GitHub @oskar26',
    'Quote': 'Rate',
    'Ø Platz': 'Ø place',
    'Ø Punkte': 'Ø points',
    'Name': 'Name',
    'Gezählt wird, sobald eine Partie zu Ende ist – auf dem Gerät, auf dem du gespielt hast. Wer den Browser-Speicher löscht, setzt die Statistik zurück. Die Liste „Wer gewinnt“ enthält nur Namen, die in Lobbys auf diesem Gerät vorkamen.':
      'Counted as soon as a match ends – on the device you played on. Clearing browser storage resets the stats. The "Who wins" list only holds names that appeared in lobbies on this device.',
    'Hallo': 'Hi',
    'Die Zockbox zeigt einen dezenten Hinweis auf': 'Zockbox shows a subtle hint for',
    '– ohne Pop-ups, ohne Werbenetzwerke. Im Tarnmodus verschwindet er.':
      '– no pop-ups, no ad networks. It disappears in disguise mode.',
    'Zockbox · Verbindung über PeerJS · Memes über imgflip & memegen.link · Texte aus Wikipedia (CC BY-SA 4.0). Bitte halte dich an die Regeln deiner Schule.':
      'Zockbox · connection via PeerJS · memes via imgflip & memegen.link · texts from Wikipedia (CC BY-SA 4.0). Please follow your school rules.',
    'Im geöffneten Fenster:': 'In the open window:',
    'wechselt die Seite,': 'switches the page,',
    'blättert.': 'flips through pages.',
  },
};

// ---------------------------------------------------------------------------
// Umschalter: zwei kleine Kürzel (DE / EN) oben rechts, im Footer verlinkt.
// Ohne Klick entscheidet der Standort; ein Klick gilt dauerhaft für das Gerät.
// ---------------------------------------------------------------------------
function langBox() {
  const box = document.createElement('div');
  box.className = 'zb-lang';
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', 'Sprache / Language');
  box.innerHTML = `<button type="button" data-set="de" aria-pressed="false" title="Deutsch">DE</button>
    <button type="button" data-set="en" aria-pressed="false" title="English">EN</button>`;
  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-set]');
    if (!b) return;
    apply(b.dataset.set, { remember: true });
    // Seiten, die ihre Texte in JS bauen, zeichnen sich selbst neu.
    window.dispatchEvent(new CustomEvent('zb:lang-changed', { detail: { lang: b.dataset.set } }));
  });
  return box;
}

function mountSwitch() {
  if (document.querySelector('.zb-lang')) return;
  const top = document.querySelector('.top-right');
  const foot = document.querySelector('.foot-links');
  if (top) top.appendChild(langBox());            // oben rechts
  if (foot) foot.appendChild(langBox());          // im Footer, immer sichtbar
  if (!top && !foot) {                            // Spiele ohne Kopfleiste/Footer
    const box = langBox();
    box.classList.add('zb-lang-floating');
    document.body.appendChild(box);
  }
  paintSwitch(document.documentElement.lang);
}

/** Markiert das aktive Kürzel (nach jedem apply). */
function paintSwitch(lang) {
  document.querySelectorAll('.zb-lang [data-set]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.set === lang));
  });
}

// ---------------------------------------------------------------------------
// Sprache bestimmen
// ---------------------------------------------------------------------------
const ss = (() => { try { return window.sessionStorage; } catch (e) { return null; } })();
const tzGerman = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return /^(Europe\/(Berlin|Vienna|Zurich|Busingen)|Atlantic\/Canary|Arctic\/Longyearbyen)$/.test(tz);
  } catch (e) { return false; }
};
const navGerman = () => /^de\b/i.test(navigator.language || '') && !/^de-CH/i.test(navigator.language || '');

function fromQuery() {
  const m = /[?&]lang=(de|en)\b/i.exec(location.search);
  return m ? m[1].toLowerCase() : null;
}

function cookie(name) {
  const m = new RegExp('(?:^|;\\s*)' + name + '=([^;]*)').exec(document.cookie || '');
  return m ? decodeURIComponent(m[1]) : '';
}

async function fromGeo(done) {
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = setTimeout(() => { if (ctl) ctl.abort(); }, 2500);
  try {
    // Cloudflare (falls die Seite dort liegt) kennt das Land ohne Zusatz-Request.
    // Auf anderen Hosts läuft das ins Leere und wird sofort verworfen.
    const cf = ctl ? fetch('/cdn-cgi/trace', { signal: ctl.signal, credentials: 'omit', cache: 'no-store' }) : null;
    if (cf) {
      const txt = await (await cf).text();
      const m = /^loc=([A-Z]{2})$/m.exec(txt);
      if (m) { clearTimeout(timer); done(m[1]); return; }
    }
  } catch (e) { /* weiter unten */ }
  try {
    const r = await fetch('https://ipapi.co/country/', { signal: ctl ? ctl.signal : undefined, credentials: 'omit' });
    const cc = (await r.text()).trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(cc)) { clearTimeout(timer); done(cc); return; }
  } catch (e) { /* still ok */ }
  clearTimeout(timer);
  done(null);
}

let resolved = false;

/** Sprache sofort setzen und später ggf. korrigieren (ohne Neuladen). */
export function initI18n() {
  const forced = fromQuery();
  if (forced) return apply(forced);

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'de' || saved === 'en') return apply(saved);

  // Schnellstart: Zeitzone/Browsersprache, damit der erste Frame stimmt.
  const guess = tzGerman() || navGerman() ? 'de' : 'en';
  apply(guess, { remember: false });

  if (resolved) return document.documentElement.lang;
  resolved = true;
  fromGeo((cc) => {
    const lang = cc ? (GERMAN.has(cc) ? 'de' : 'en') : guess;
    document.documentElement.dataset.geoDone = '1';
    if (lang !== document.documentElement.lang) {
      apply(lang, { remember: false });
      window.dispatchEvent(new CustomEvent('zb:geo-lang', { detail: { lang } }));
    }
  });
  return document.documentElement.lang;
}

// Skripte schreiben beim Start weiter Text ins DOM (Profil, Zahlen, Chats).
// Deshalb ein paar Mal nachübersetzen – aber immer in der *aktuellen* Sprache,
// damit ein Wechsel während der Startphase nicht von alten Timern überholt wird.
let retryTimer = null;
function scheduleRetries() {
  if (retryTimer) return;
  let tries = 0;
  const step = () => {
    retryTimer = null;
    const now = lang();
    translate(now);
    paintSwitch(now);
    if (++tries < 24) retryTimer = setTimeout(step, 60);
  };
  retryTimer = setTimeout(step, 60);
}

function apply(lang, { remember = true } = {}) {
  const html = document.documentElement;
  html.lang = lang;
  html.dataset.lang = lang;
  if (remember) { try { localStorage.setItem(KEY, lang); } catch (e) {} }
  translate(lang);
  syncMeta(lang);
  if (document.body && !document.querySelector('.zb-lang')) mountSwitch();
  paintSwitch(lang);
  scheduleRetries();
  return lang;
}

// ---------------------------------------------------------------------------
// DOM übersetzen
// ---------------------------------------------------------------------------
// Kein `data-i18n` im Markup: Textknoten und Attribute werden direkt ersetzt.
// Deutsch bleibt im HTML die Quelle; die Originale liegen in einem WeakMap und
// werden beim Zurückschalten wieder eingesetzt.
// ---------------------------------------------------------------------------
const dict = (lang) => (lang === 'en' ? STRINGS.en : null);
const orig = new WeakMap();          // Textknoten  -> deutscher Originaltext
const attrOrig = new WeakMap();      // Element     -> { attr: original }
const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA']);

function tr(lang, text) {
  const d = dict(lang);
  if (!d) return text;
  return d[text] != null ? d[text] : text;
}

function swapNode(node, lang) {
  const d = dict(lang);
  if (!orig.has(node)) orig.set(node, node.nodeValue);
  const base = orig.get(node);
  if (!d) {                       // zurück auf Deutsch: Original wieder einsetzen
    if (node.nodeValue !== base) node.nodeValue = base;
    return;
  }
  const key = base.trim();
  if (!key) return;
  const hit = d[key];
  if (hit == null) return;
  const lead = base.slice(0, base.indexOf(key));
  const tail = base.slice(base.indexOf(key) + key.length);
  const next = lead + hit + tail;
  if (node.nodeValue !== next) node.nodeValue = next;
}

function swapAttrs(el, lang) {
  const d = dict(lang);
  let store = attrOrig.get(el);
  if (!store) { store = {}; attrOrig.set(el, store); }
  ['aria-label', 'title', 'placeholder', 'alt'].forEach((name) => {
    if (!el.hasAttribute(name)) return;
    if (store[name] == null) store[name] = el.getAttribute(name);
    const base = store[name];
    if (!d) { if (el.getAttribute(name) !== base) el.setAttribute(name, base); return; }
    const key = base.trim();
    if (!key || d[key] == null) return;
    const next = base.replace(key, d[key]);
    if (el.getAttribute(name) !== next) el.setAttribute(name, next);
  });
}

function translate(lang) {
  if (!document.body) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = n.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT;
      return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => swapNode(n, lang));
  document.body.querySelectorAll('[aria-label],[title],[placeholder],[alt]').forEach((el) => swapAttrs(el, lang));
}

function syncMeta(lang) {
  const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.setAttribute('content', val); };
  const html = document.documentElement;
  const t = document.querySelector('title');
  if (t) {
    if (!t.dataset.de) t.dataset.de = t.textContent;
    t.textContent = lang === 'en' ? (t.dataset.en || t.dataset.de) : t.dataset.de;
  }
  const n = document.querySelector('meta[name="description"]');
  if (n && n.dataset.en) {
    if (!n.dataset.de) n.dataset.de = n.getAttribute('content') || '';
    n.setAttribute('content', lang === 'en' ? n.dataset.en : n.dataset.de);
  }
  set('meta[property="og:locale"]', lang === 'en' ? 'en_US' : 'de_DE');
  const og = document.querySelector('meta[property="og:title"]');
  if (og && og.dataset.en) {
    if (!og.dataset.de) og.dataset.de = og.getAttribute('content') || '';
    og.setAttribute('content', lang === 'en' ? og.dataset.en : og.dataset.de);
  }
  const od = document.querySelector('meta[property="og:description"]');
  if (od && od.dataset.en) {
    if (!od.dataset.de) od.dataset.de = od.getAttribute('content') || '';
    od.setAttribute('content', lang === 'en' ? od.dataset.en : od.dataset.de);
  }
  html.setAttribute('data-lang', lang);
}

// ---------------------------------------------------------------------------
// Für Skripte: t('Partien') – übersetzt, wenn Englisch aktiv ist.
// ---------------------------------------------------------------------------
/** Neu übersetzen, nachdem ein Skript neuen Text ins DOM geschrieben hat. */
export function retranslate() {
  translate(lang());
  paintSwitch(lang());
}
export function t(s) {
  return tr(document.documentElement.lang === 'en' ? 'en' : 'de', s);
}
export const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'de');
export const locale = () => (lang() === 'en' ? 'en-GB' : 'de-DE');

// Damit auch die Spiele (ohne Import) die Sprache kennen.
window.zbI18n = { t, lang, locale, retranslate, setLang: (l) => apply(l, { remember: true }) };

// Neu geöffnete oder neu gezeichnete Oberflächen (Einstellungen, Beitreten,
// Statistik) einmal durch die Übersetzung schicken.
['zb:settings-opened', 'zb:join-opened', 'zb:stats-changed'].forEach((ev) => {
  window.addEventListener(ev, () => setTimeout(retranslate, 0));
});

// Absichtlich kein automatischer Aufruf: index.html und statistik.html rufen
// initI18n() selbst auf, die Spieleseiten nur t().
