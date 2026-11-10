// Zockbox – Tarnmodus (erweitert, optional, standardmäßig AUS). made by Oskar
//
// Wichtig: keine echten Logos/Markennamen nachbauen (sonst Phishing-Warnungen für das ganze Repo).
//
// Reine UI-Tarnung: Tab-Titel/Favicon tauschen und per Panik-Taste eine Tarnseite
// als Vollbild-Overlay über die App legen. Das Spiel läuft darunter weiter, die
// Verbindung bleibt bestehen. Kein Fenster-Öffnen, keine Proxies, kein Netzwerk-Kram.
//
// Enthalten: 8 Tarnseiten (Suche, Lexikon, Dokument, Taschenrechner, Kalender,
// Notizen, Editor, Tabelle), 11 Tab-Vorlagen, Kombinationen als Panik-Taste,
// einstellbare Doppeldruckzeit, Einzeldruck, Auto-Tarnung bei Tab-/Fokusverlust,
// Zeitfenster, Schnellwechsel per Alt+1…8, Druckansicht, lokale Speicherung für
// Dokument/Notizen/Kalender/Editor/Tabelle, Statistik sowie Import/Export.
//
// Einbinden (eine Zeile, eigenständig – bringt sein CSS selbst mit):
//   Startseite:      <script type="module" src="shared/tarnung.js"></script>
//   Spiele:          <script type="module" src="../../shared/tarnung.js"></script>
//
// Einstellungen (localStorage):
//   zb_tarn_on       '1' = Tarnmodus an
//   zb_tarn_tab      'passend' | 'aus' | eine der Tab-Vorlagen
//   zb_tarn_page     id der Tarnseite
//   zb_tarn_key      Taste oder Kombination, z. B. 'Escape' oder 'Ctrl+Shift+P'
//   zb_tarn_fab      '0' = Panik-Knopf auf Touch aus
//   zb_tarn_delay    ms für Doppeldruck (Standard 550)
//   zb_tarn_single   '1' = ein Druck genügt
//   zb_tarn_auto     '1' = automatisch tarnen bei Tab-Wechsel/Fokusverlust
//   zb_tarn_auto_ms  Verzögerung der Auto-Tarnung
//   zb_tarn_schedule '1' = Auto-Tarnung nur im Zeitfenster zb_tarn_from…zb_tarn_to
//   zb_tarn_term     Standard-Suchbegriff
//   zb_tarn_doc_name Name des Dokuments
//   zb_tarn_media    '0' = Audio/Video nicht stummschalten
//   zb_tarn_count / zb_tarn_last   Statistik
//
// Für Spiele: window.addEventListener('zb-tarnung', e => e.detail.active).
// API: window.zbTarnung = { show, hide, preview, get, set, isPanic, switchTo, pages, settings, reset, count }.
// Die Einstellungs-Oberfläche erscheint automatisch in #zbTarnSettings (nur Startseite).

const KEYS = { on: 'zb_tarn_on', look: 'zb_tarn_look', page: 'zb_tarn_page', key: 'zb_tarn_key', fab: 'zb_tarn_fab' };
const DOUBLE_MS = 550;

const get = (k, d = '') => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } };
const clamp = (n, lo, hi, d) => { const v = Number(n); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

// ---------------------------------------------------------------------------
// Eigene, generische Favicons (selbst gezeichnet, keine fremden Logos)
// ---------------------------------------------------------------------------
const svgUrl = (inner) => 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${inner}</svg>`);

// Eigene Moodle-artige Bildmarke (bewusst KEIN fremdes Logo): aufgeschlagenes Buch
// mit Lichtstrahlen – schlicht, blau, selbst gezeichnet.
const MARK_MOODLE = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
  <defs><linearGradient id="zbtMk" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#1c7ac4"/><stop offset="1" stop-color="#0b4f86"/></linearGradient></defs>
  <path d="M60 30c-9-7-20-10-31-8-3 .5-4 2-4 5v56c0 3 1.6 4.6 4.6 4 9.6-1.8 21-1 30.4 5.4z" fill="url(#zbtMk)"/>
  <path d="M60 30c9-7 20-10 31-8 3 .5 4 2 4 5v56c0 3-1.6 4.6-4.6 4-9.6-1.8-21-1-30.4 5.4z" fill="#3f9ce0"/>
  <path d="M60 30v62.4" stroke="#0a3f6d" stroke-width="3" stroke-linecap="round"/>
  <path d="M24 40c8-.6 15 .6 22 3M24 52c8-.6 15 .6 22 3M24 64c8-.6 15 .6 22 3" stroke="#fff" stroke-opacity=".72" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M96 40c-8-.6-15 .6-22 3M96 52c-8-.6-15 .6-22 3M96 64c-8-.6-15 .6-22 3" stroke="#fff" stroke-opacity=".6" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="60" cy="22" r="7" fill="#f7c544"/>
  <path d="M60 9v6M60 29v6M47 22h6M67 22h6M51 13l4 4M69 31l-4-4M69 13l-4 4M51 31l4-4" stroke="#f7c544" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

const ICONS = {
  notizen: svgUrl('<rect x="5" y="3" width="22" height="26" rx="3" fill="#f6c945"/><rect x="5" y="3" width="22" height="6" rx="3" fill="#e0a92a"/><path d="M9 14h14M9 19h14M9 24h9" stroke="#7a5a10" stroke-width="2" stroke-linecap="round"/>'),
  dokument: svgUrl('<path d="M7 2h13l6 6v20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#3a6fd8"/><path d="M20 2v6h6" fill="#8fb0f0"/><path d="M9 14h14M9 18h14M9 22h10" stroke="#fff" stroke-width="2" stroke-linecap="round"/>'),
  suche: svgUrl('<circle cx="16" cy="16" r="16" fill="#fff"/><circle cx="14" cy="14" r="7.5" fill="none" stroke="#1d8a7a" stroke-width="3.6"/><path d="M19.6 19.6 26 26" stroke="#1d8a7a" stroke-width="4" stroke-linecap="round"/>'),
  wiki: svgUrl('<rect width="32" height="32" rx="4" fill="#fff"/><path d="M4 7c4-2 8-2 12 1v19c-4-3-8-3-12-1z" fill="#54595d"/><path d="M28 7c-4-2-8-2-12 1v19c4-3 8-3 12-1z" fill="#a2a9b1"/>'),
  rechner: svgUrl('<rect x="6" y="2" width="20" height="28" rx="3" fill="#4a4f5c"/><rect x="9" y="5" width="14" height="6" rx="1" fill="#cfe8d6"/><g fill="#e6e8ee"><rect x="9" y="14" width="4" height="3" rx="1"/><rect x="14" y="14" width="4" height="3" rx="1"/><rect x="9" y="19" width="4" height="3" rx="1"/><rect x="14" y="19" width="4" height="3" rx="1"/><rect x="9" y="24" width="4" height="3" rx="1"/><rect x="14" y="24" width="4" height="3" rx="1"/></g><rect x="19" y="14" width="4" height="13" rx="1" fill="#f08a3c"/>'),
};

// Bildmarke als Favicon (data-URL, damit nichts nachgeladen werden muss)
const MOODLE_ICON = svgUrl(
  '<rect width="32" height="32" rx="6" fill="#fff"/>' +
  '<g transform="translate(2.2 2.2) scale(.23)">' +
  '<path d="M60 30c-9-7-20-10-31-8-3 .5-4 2-4 5v56c0 3 1.6 4.6 4.6 4 9.6-1.8 21-1 30.4 5.4z" fill="#0f6cb6"/>' +
  '<path d="M60 30c9-7 20-10 31-8 3 .5 4 2 4 5v56c0 3-1.6 4.6-4.6 4-9.6-1.8-21-1-30.4 5.4z" fill="#3f9ce0"/>' +
  '<path d="M60 30v62.4" stroke="#0a3f6d" stroke-width="4"/><circle cx="60" cy="20" r="9" fill="#f7c544"/></g>');
// Zockbox-„Z“ im Look der echten Seite
const ZOCKBOX_ICON = svgUrl('<rect width="32" height="32" rx="7" fill="#191b1e"/><path d="M9 10h14l-9 12h9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>');

export const LOOKS = [
  {
    id: 'moodle',
    label: 'Lernplattform',
    title: 'Anmeldeseite | Lernplattform',
    icon: MOODLE_ICON,
    note: 'Anmeldung, Dashboard, meine Kurse, Kursseite',
  },
  {
    id: 'zockbox',
    label: 'Zockbox',
    title: 'Zockbox – Gratis Browser-Spiele mit Freunden',
    icon: ZOCKBOX_ICON,
    note: 'Wie diese Seite: Spiele, Dokument, Notizen, Kalender',
  },
  {
    id: 'lexikon',
    label: 'Lexikon',
    title: 'Photosynthese – Lexikon',
    icon: ICONS.wiki,
    note: 'Nachschlagewerk mit Artikel und Suche',
  },
];

// Rückwärtskompatibel: frühere Versionen hatten eine eigene Tab-Auswahl. Titel und
// Symbol kommen jetzt immer vom Look (ein Look, ein Tab, eine Seite).
export const TAB_TEMPLATES = [];

// Tarnseiten (Panik-Modus)
// look = zu welchem Look die Seite gehört; title = Tab-Titel, solange die Seite offen ist.
export const PAGES = [
  { id: 'moodle-start', look: 'moodle', label: 'Anmeldung', tab: 'Anmeldeseite | Lernplattform', title: 'Anmeldeseite | Lernplattform', icon: MOODLE_ICON },
  { id: 'moodle-dash', look: 'moodle', label: 'Dashboard', tab: 'Dashboard | Lernplattform', title: 'Dashboard | Lernplattform', icon: MOODLE_ICON },
  { id: 'moodle-kurse', look: 'moodle', label: 'Meine Kurse', tab: 'Meine Kurse | Lernplattform', title: 'Meine Kurse | Lernplattform', icon: MOODLE_ICON },
  { id: 'moodle-kurs', look: 'moodle', label: 'Kursseite', tab: 'Biologie · Kurs | Lernplattform', title: 'Biologie · Kurs | Lernplattform', icon: MOODLE_ICON },
  { id: 'zock-start', look: 'zockbox', label: 'Startseite', tab: 'Zockbox – Gratis Browser-Spiele mit Freunden', title: 'Zockbox – Gratis Browser-Spiele mit Freunden', icon: ZOCKBOX_ICON },
  { id: 'dokument', look: 'zockbox', label: 'Dokument', tab: 'Biologie-Notizen – Dokument', title: 'Biologie-Notizen – Dokument', icon: ICONS.dokument },
  { id: 'notizen', look: 'zockbox', label: 'Notizen', tab: 'Notizen', title: 'Notizen', icon: ICONS.notizen },
  { id: 'kalender', look: 'zockbox', label: 'Kalender', tab: 'Kalender – Monatsansicht', title: 'Kalender – Monatsansicht', icon: null },
  { id: 'code', look: 'zockbox', label: 'Editor', tab: 'Notizen.js – Editor', title: 'Notizen.js – Editor', icon: null },
  { id: 'tabelle', look: 'zockbox', label: 'Tabelle', tab: 'Stundenplan – Tabelle', title: 'Stundenplan – Tabelle', icon: null },
  { id: 'rechner', look: 'zockbox', label: 'Taschenrechner', tab: 'Taschenrechner', title: 'Taschenrechner', icon: ICONS.rechner },
  { id: 'lexikon', look: 'lexikon', label: 'Artikel', tab: 'Photosynthese – Lexikon', title: 'Photosynthese – Lexikon', icon: ICONS.wiki },
  { id: 'suche', look: 'lexikon', label: 'Suche', tab: 'Suche – Lexikon', title: 'photosynthese – Suche', icon: ICONS.suche },
  // „Postfach“ und „Suche-Start“ gibt es weiter, sind aber nicht in der Auswahl –
  // sie werden nur intern (z. B. als Startpunkt der Suche) genutzt.
  { id: 'mail', look: 'zockbox', label: 'Postfach', tab: 'Posteingang (1)', title: 'Posteingang (1)', icon: null, hidden: true },
];

// ---------------------------------------------------------------------------
// Zustand
// ---------------------------------------------------------------------------
function pageById(id) { return PAGES.find((p) => p.id === id) || null; }
function visiblePages(look) { return PAGES.filter((p) => !p.hidden && (!look || p.look === look)); }
function lookById(id) { return LOOKS.find((l) => l.id === id) || LOOKS[0]; }
// Erste Seite eines Looks (für „Look umschalten“ und Erststart).
function firstPageOf(look) { const p = visiblePages(look)[0]; return p ? p.id : PAGES[0].id; }

// Alter Zustand (frühere Version) → neue Schlüssel
function migrate() {
  const out = {};
  const tab = get(KEYS.tab, '');
  const page = get(KEYS.page, '');
  const knownTab = ['suche', 'wiki', 'dokument', 'notizen', 'rechner', 'kalender', 'code', 'tabelle', 'mail'];
  // 1) Alter Look-Schlüssel 'passend'/'aus'/Tab-Vorlage → Look
  let look = get(KEYS.look, '');
  if (!LOOKS.some((l) => l.id === look)) {
    if (tab === 'aus') look = 'zockbox';
    else if (knownTab.includes(tab)) look = (tab === 'suche' || tab === 'wiki') ? 'lexikon' : 'zockbox';
    else if (page === 'lexikon' || page === 'suche') look = 'lexikon';
    // Standard: Lernplattform
    else look = 'moodle';
  }
  out.look = look;
  // 2) Alte Seiten-IDs auf neue abbilden
  const remap = { suche: 'suche', lexikon: 'lexikon', dokument: 'dokument', notizen: 'notizen',
    rechner: 'rechner', kalender: 'kalender', code: 'code', tabelle: 'tabelle' };
  let pg = pageById(remap[page] || page);
  if (!pg) pg = pageById(firstPageOf(look));
  if (pg.look !== look) pg = pageById(firstPageOf(look));
  out.page = pg.id;
  return out;
}

function readState() {
  const mig = migrate();
  const page = pageById(get(KEYS.page, '')) ? get(KEYS.page, '') : mig.page;
  const pg = pageById(page) || pageById(firstPageOf(mig.look)) || PAGES[0];
  const look = LOOKS.some((l) => l.id === get(KEYS.look, '')) ? get(KEYS.look, '') : pg.look;
  return {
    on: get(KEYS.on) === '1',
    look,
    page: pg.id,
    key: get(KEYS.key, 'Escape') || 'Escape',
    fab: get(KEYS.fab, '1') !== '0',
    delay: clamp(Number(get(KEYS.delay, 550)), 150, 2000, 550),
    single: get(KEYS.single, '0') === '1',
    auto: get(KEYS.auto, '0') === '1',
    autoMs: clamp(Number(get(KEYS.autoMs, 400)), 0, 5000, 400),
    schedule: get(KEYS.schedule, '0') === '1',
    from: clamp(Number(get(KEYS.from, 8)), 0, 23, 8),
    to: clamp(Number(get(KEYS.to, 17)), 0, 23, 17),
    term: (get(KEYS.term, 'photosynthese') || 'photosynthese').slice(0, 60),
    docName: (get(KEYS.docName, 'Biologie-Notizen') || 'Biologie-Notizen').slice(0, 40),
    media: get(KEYS.media, '1') !== '0',
  };
}
let S = readState();
let panic = false;
let pagePreview = null; // Vorschau aus den Einstellungen (auch wenn Tarnmodus aus)

// Original-Titel/Icons merken
let origTitle = document.title;
let origIcons = null; // [{el, parent, next}]
let applyingTitle = false;
let disguiseTitle = null; // zuletzt gesetzter Tarn-Titel (kann sich ändern, z. B. „<suchwort> – Suche“)
let overlayTitle = null;  // aktueller Titel der offenen Tarnseite

function iconLinks() { return [...document.querySelectorAll('link[rel~="icon"], link[rel="shortcut icon"]')].filter((l) => !l.dataset.zbTarn); }

const THEME_TONES = { moodle: '#f1f1f1', zockbox: '#f7f7f5', lexikon: '#ffffff' };
let origTheme = null;

function setDisguise(title, icon, lookId) {
  // Titel
  disguiseTitle = title || null;
  if (title) {
    if (document.title !== title) { applyingTitle = true; document.title = title; applyingTitle = false; }
  } else if (document.title !== origTitle) { applyingTitle = true; document.title = origTitle; applyingTitle = false; }
  // Statusleiste auf dem Handy passend einfärben
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    if (origTheme === null) origTheme = meta.getAttribute('content') || '';
    meta.setAttribute('content', icon ? (THEME_TONES[lookId] || origTheme) : origTheme);
  }
  // Favicon
  let mine = document.querySelector('link[data-zb-tarn]');
  if (icon) {
    if (!origIcons) {
      origIcons = iconLinks().map((el) => ({ el, parent: el.parentNode, next: el.nextSibling }));
      origIcons.forEach((o) => o.el.remove());
    }
    if (!mine) {
      mine = document.createElement('link');
      mine.rel = 'icon'; mine.type = 'image/svg+xml'; mine.dataset.zbTarn = '1';
      document.head.appendChild(mine);
    }
    if (mine.getAttribute('href') !== icon) mine.setAttribute('href', icon);
  } else {
    if (mine) mine.remove();
    if (origIcons) {
      origIcons.forEach((o) => { try { o.parent.insertBefore(o.el, o.next && o.next.parentNode === o.parent ? o.next : null); } catch (e) { document.head.appendChild(o.el); } });
      origIcons = null;
    }
  }
}

// Titel und Symbol kommen immer aus dem Look der aktiven Seite – nie getrennt.
function applyTab() {
  if (panic || pagePreview) {
    const id = (ov && ov.dataset.page) || pagePreview || S.page;
    const p = pageById(id) || PAGES[0];
    setDisguise(overlayTitle || p.title, p.icon || lookById(p.look).icon, p.look);
  } else if (S.on) {
    const l = lookById(S.look);
    setDisguise(l.title, l.icon, l.id);
  } else {
    setDisguise(null, null);
  }
}

// Spiele ändern den Titel manchmal selbst (z. B. "Lobby ABCD"). Das merken wir uns als neuen
// Original-Titel und setzen die Tarnung wieder drauf.
function watchTitle() {
  const obs = new MutationObserver(() => {
    if (applyingTitle) return;
    const disguised = panic || pagePreview || S.on;
    const t = document.title;
    const known = t === disguiseTitle || LOOKS.some((x) => x.title === t) || PAGES.some((x) => x.title === t || x.tab === t);
    if (!known) origTitle = document.title;
    if (disguised) applyTab();
  });
  obs.observe(document.head, { childList: true, subtree: true, characterData: true });
}

// ---------------------------------------------------------------------------
// CSS (selbst mitgebracht, damit eine <script>-Zeile reicht)
// ---------------------------------------------------------------------------
const CSS = `
.zbt-ov{position:fixed;inset:0;z-index:2147483000;overflow:auto;-webkit-overflow-scrolling:touch;background:#fff;color:#202124;
  font:14px/1.58 Arial,Helvetica,sans-serif;text-align:left;letter-spacing:normal;text-transform:none;-webkit-font-smoothing:auto;color-scheme:light}
.zbt-ov *{box-sizing:border-box}
.zbt-ov a{text-decoration:none;cursor:pointer}
.zbt-ov button{font-family:inherit;color:inherit;letter-spacing:normal;text-transform:none}
.zbt-ov svg{flex:none}
.zbt-back{position:fixed;left:0;top:0;width:64px;height:64px;z-index:2147483001;background:transparent;border:0;padding:0;opacity:0;cursor:default;-webkit-tap-highlight-color:transparent}
.zbt-back:focus-visible{opacity:1;outline:2px dashed #888}
.zbt-fab{position:fixed;left:max(10px,env(safe-area-inset-left));bottom:calc(10px + env(safe-area-inset-bottom));z-index:2147482999;
  width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:rgba(30,30,30,.5);color:#fff;
  display:grid;place-items:center;padding:0;opacity:.6;-webkit-tap-highlight-color:transparent;touch-action:manipulation;cursor:pointer}
.zbt-fab svg{width:20px;height:20px}
.zbt-fab:active{transform:scale(.92)}
/* auf der Tarnseite: dunkler, gut sichtbarer Rücksprung-Knopf */
.zbt-fab.zbt-fab-back{z-index:2147483003;opacity:.9;width:44px;height:44px;background:#1f2933;border-color:rgba(255,255,255,.55);box-shadow:0 4px 14px rgba(0,0,0,.35)}
.zbt-fab.zbt-fab-back:hover{opacity:1}
.zbt-preview-bar{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483002;
  display:flex;gap:10px;align-items:center;padding:8px 8px 8px 14px;border-radius:10px;background:#222;color:#fff;font:600 14px/1.2 Arial,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35);white-space:nowrap}
.zbt-preview-bar button{border:0;border-radius:6px;padding:8px 12px;background:#fff;color:#111;font:700 14px Arial,sans-serif;cursor:pointer}
html.zbt-lock,html.zbt-lock body{overflow:hidden!important}
/* Schutz gegen Spiel-Styles (z. B. body.kd h1): neutrale Basis, die eigenen Regeln oben/unten sind spezifischer */
#zbTarnOverlay h1,#zbTarnOverlay h2,#zbTarnOverlay h3,#zbTarnOverlay h4,#zbTarnOverlay p,#zbTarnOverlay ul,#zbTarnOverlay ol,#zbTarnOverlay li,#zbTarnOverlay table,#zbTarnOverlay td,#zbTarnOverlay th,#zbTarnOverlay input,#zbTarnOverlay button,#zbTarnOverlay a,#zbTarnOverlay span,#zbTarnOverlay div{font-family:inherit;letter-spacing:normal;text-transform:none;text-shadow:none;line-height:inherit}
#zbTarnOverlay h1,#zbTarnOverlay h2,#zbTarnOverlay h3{font-weight:400;margin:0;color:inherit}

/* ===== (a) Suche – Startseite + Ergebnisseite ===== */
#zbTarnOverlay .zbt-s{min-height:100%;display:flex;flex-direction:column;font-family:Arial,Helvetica,sans-serif;color:#202124}
#zbTarnOverlay .zbt-s a{color:#1a0dab}
#zbTarnOverlay .zbt-s-ic{width:24px;height:24px;fill:#5f6368}
#zbTarnOverlay .zbt-s-apps{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;cursor:pointer}
#zbTarnOverlay .zbt-s-apps:hover{background:rgba(60,64,67,.08)}
#zbTarnOverlay .zbt-s-av{width:32px;height:32px;border-radius:50%;background:#6b7f99;color:#fff;display:grid;place-items:center;font:500 15px/1 Arial,sans-serif;margin:0 4px}
#zbTarnOverlay .zbt-s-logo{display:inline-flex;align-items:center;gap:.12em;color:#3c4043;font-family:Arial,Helvetica,sans-serif;font-weight:400;letter-spacing:-.04em;line-height:1;cursor:pointer;user-select:none}
#zbTarnOverlay .zbt-s-logo svg{width:.78em;height:.78em}
#zbTarnOverlay .zbt-s-box{display:flex;align-items:center;gap:12px;height:46px;padding:0 6px 0 14px;border:1px solid #dfe1e5;border-radius:24px;background:#fff}
#zbTarnOverlay .zbt-s-box:hover,#zbTarnOverlay .zbt-s-box:focus-within{box-shadow:0 1px 6px rgba(32,33,36,.28);border-color:rgba(223,225,229,0)}
#zbTarnOverlay .zbt-s-box input{flex:1;min-width:0;height:100%;border:0;outline:0;font:16px Arial,sans-serif;color:#202124;background:transparent;padding:0;-webkit-appearance:none;appearance:none}
#zbTarnOverlay .zbt-s-box input::-webkit-search-cancel-button{display:none}
#zbTarnOverlay .zbt-s-box .lens{width:20px;height:20px;fill:#9aa0a6}
#zbTarnOverlay .zbt-s-tools{display:flex;align-items:center;gap:2px;height:100%}
#zbTarnOverlay .zbt-s-tools span{width:40px;height:40px;display:grid;place-items:center;border-radius:50%;cursor:pointer}
#zbTarnOverlay .zbt-s-tools svg{width:22px;height:22px;fill:#5f6368}
#zbTarnOverlay .zbt-s-tools .x svg{fill:#70757a}
#zbTarnOverlay .zbt-s-tools .div{width:1px;height:65%;background:#dadce0;border-radius:0;margin:0 4px;cursor:default}

/* Startseite */
#zbTarnOverlay .zbt-s-top{display:flex;justify-content:flex-end;align-items:center;gap:12px;height:60px;padding:6px 10px 0 15px;font-size:13px}
#zbTarnOverlay .zbt-s-top a{color:#1f1f1f}
#zbTarnOverlay .zbt-s-top a:hover{text-decoration:underline}
#zbTarnOverlay .zbt-s-home{flex:1;display:flex;flex-direction:column;align-items:center;padding:calc(10vh + 40px) 20px 36px}
#zbTarnOverlay .zbt-s-home .zbt-s-logo{font-size:clamp(56px,16vw,86px);margin-bottom:28px}
#zbTarnOverlay .zbt-s-home form{width:100%;max-width:584px}
#zbTarnOverlay .zbt-s-home .zbt-s-box{height:48px}
#zbTarnOverlay .zbt-s-btns{display:flex;justify-content:center;gap:12px;margin-top:29px;flex-wrap:wrap}
#zbTarnOverlay .zbt-s-btns button{height:36px;padding:0 16px;border:1px solid #f8f9fa;border-radius:8px;background:#f8f9fa;color:#3c4043;font:14px Arial,sans-serif;cursor:pointer}
#zbTarnOverlay .zbt-s-btns button:hover{border-color:#dadce0;box-shadow:0 1px 1px rgba(0,0,0,.1);color:#202124}
#zbTarnOverlay .zbt-s-lang{margin-top:30px;font-size:13px;color:#4d5156;text-align:center}
#zbTarnOverlay .zbt-s-lang a{margin:0 3px}
#zbTarnOverlay .zbt-s-foot{background:#f2f2f2;color:#70757a;font-size:15px;margin-top:auto}
#zbTarnOverlay .zbt-s-foot .c{padding:15px 30px;border-bottom:1px solid #dadce0}
#zbTarnOverlay .zbt-s-foot nav{display:flex;flex-wrap:wrap;justify-content:space-between;gap:0 24px;padding:0 20px}
#zbTarnOverlay .zbt-s-foot nav div{display:flex;flex-wrap:wrap}
#zbTarnOverlay .zbt-s-foot nav a{color:#70757a;padding:15px;font-size:14px}
#zbTarnOverlay .zbt-s-foot nav a:hover{text-decoration:underline}

/* Ergebnisseite */
#zbTarnOverlay .zbt-r-head{display:flex;align-items:center;gap:0;padding:20px 16px 0 28px}
#zbTarnOverlay .zbt-r-head .zbt-s-logo{font-size:30px;width:152px;flex:none}
#zbTarnOverlay .zbt-r-head form{flex:1;max-width:692px;min-width:0}
#zbTarnOverlay .zbt-r-head .zbt-s-box{height:46px;padding-left:20px;box-shadow:0 2px 5px 1px rgba(64,60,67,.16);border-color:transparent}
#zbTarnOverlay .zbt-r-head .zbt-s-box:hover,#zbTarnOverlay .zbt-r-head .zbt-s-box:focus-within{box-shadow:0 2px 8px 1px rgba(64,60,67,.24)}
#zbTarnOverlay .zbt-r-right{margin-left:auto;display:flex;align-items:center;gap:6px;padding-left:16px}
#zbTarnOverlay .zbt-r-tabs{display:flex;gap:0;padding:0 0 0 180px;margin-top:14px;border-bottom:1px solid #ebebeb;overflow-x:auto;white-space:nowrap;scrollbar-width:none}
#zbTarnOverlay .zbt-r-tabs::-webkit-scrollbar{display:none}
#zbTarnOverlay .zbt-r-tabs span{padding:12px 12px 10px;font-size:14px;color:#5f6368;cursor:pointer;border-bottom:3px solid transparent}
#zbTarnOverlay .zbt-r-tabs span.on{color:#1f1f1f;border-bottom-color:#1f1f1f;font-weight:500}
#zbTarnOverlay .zbt-r-tabs .sp{margin-left:auto}
#zbTarnOverlay .zbt-r-body{display:flex;gap:70px;padding:0 0 0 180px}
#zbTarnOverlay .zbt-r-main{width:652px;max-width:100%;min-width:0}
#zbTarnOverlay .zbt-r-stats{color:#70757a;font-size:14px;line-height:43px;height:43px}
#zbTarnOverlay .zbt-r-res{margin:0 0 30px}
#zbTarnOverlay .zbt-r-site{display:flex;align-items:center;gap:12px;margin-bottom:4px}
#zbTarnOverlay .zbt-r-fav{width:28px;height:28px;border-radius:50%;background:#f1f3f4;border:1px solid #ecedef;display:grid;place-items:center;flex:none}
#zbTarnOverlay .zbt-r-fav svg{width:18px;height:18px}
#zbTarnOverlay .zbt-r-site .n{display:block;font-size:14px;color:#202124;line-height:20px}
#zbTarnOverlay .zbt-r-site .u{display:block;font-size:12px;color:#4d5156;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:520px}
#zbTarnOverlay .zbt-r-res h3{margin:0 0 3px;font:400 20px/1.3 Arial,sans-serif;color:#1a0dab}
#zbTarnOverlay .zbt-r-res h3 a{color:#1a0dab}
#zbTarnOverlay .zbt-r-res h3 a:hover{text-decoration:underline}
#zbTarnOverlay .zbt-r-res p{margin:0;color:#474747;font-size:14px;line-height:22px}
#zbTarnOverlay .zbt-r-res p .d{color:#70757a}
#zbTarnOverlay .zbt-r-res p b{color:#5f6368}
#zbTarnOverlay .zbt-r-sub{display:flex;flex-wrap:wrap;gap:4px 18px;margin-top:6px;padding-left:16px}
#zbTarnOverlay .zbt-r-sub a{font-size:14px;color:#1a0dab}
#zbTarnOverlay .zbt-r-paa{margin:6px 0 34px}
#zbTarnOverlay .zbt-r-paa h2{font:400 20px/1.3 Arial,sans-serif;margin:0 0 12px;color:#202124}
#zbTarnOverlay .zbt-r-q{border-top:1px solid #dadce0}
#zbTarnOverlay .zbt-r-q:last-child{border-bottom:1px solid #dadce0}
#zbTarnOverlay .zbt-r-q button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:48px;padding:10px 4px;background:none;border:0;font:16px/1.4 Arial,sans-serif;color:#202124;text-align:left;cursor:pointer}
#zbTarnOverlay .zbt-r-q button svg{width:24px;height:24px;fill:#5f6368;transition:transform .2s}
#zbTarnOverlay .zbt-r-q.open button svg{transform:rotate(180deg)}
#zbTarnOverlay .zbt-r-q .a{display:none;padding:0 4px 16px;color:#202124;font-size:14px;line-height:22px}
#zbTarnOverlay .zbt-r-q.open .a{display:block}
#zbTarnOverlay .zbt-r-kp{width:369px;flex:none;margin-top:43px;border:1px solid #dadce0;border-radius:8px;padding:16px;align-self:flex-start}
#zbTarnOverlay .zbt-r-kp h2{font:400 28px/1.2 Arial,sans-serif;margin:0;color:#202124}
#zbTarnOverlay .zbt-r-kp .t{color:#70757a;font-size:14px;margin:2px 0 12px}
#zbTarnOverlay .zbt-r-kp svg.pic{display:block;width:100%;height:auto;border-radius:8px;margin-bottom:12px}
#zbTarnOverlay .zbt-r-kp p{margin:0 0 10px;font-size:14px;line-height:22px;color:#4d5156}
#zbTarnOverlay .zbt-r-kp dl{margin:0;font-size:14px;line-height:22px}
#zbTarnOverlay .zbt-r-kp dt{display:inline;font-weight:700;color:#202124}
#zbTarnOverlay .zbt-r-kp dd{display:inline;margin:0;color:#4d5156}
#zbTarnOverlay .zbt-r-kp dd::after{content:'';display:block}
#zbTarnOverlay .zbt-r-pages{display:flex;align-items:center;justify-content:center;gap:4px;margin:10px 0 40px;font-size:14px}
#zbTarnOverlay .zbt-r-pages span,#zbTarnOverlay .zbt-r-pages a{min-width:28px;text-align:center;padding:6px 4px}
#zbTarnOverlay .zbt-r-pages .on{color:#202124;font-weight:700}
#zbTarnOverlay .zbt-r-pages a{color:#1a0dab}
#zbTarnOverlay .zbt-r-foot{background:#f2f2f2;color:#70757a;font-size:14px;margin-top:auto}
#zbTarnOverlay .zbt-r-foot .c{padding:14px 0 14px 180px;border-bottom:1px solid #dadce0}
#zbTarnOverlay .zbt-r-foot .c b{color:#202124;font-weight:400}
#zbTarnOverlay .zbt-r-foot nav{display:flex;flex-wrap:wrap;gap:0 28px;padding:14px 0 18px 180px}
#zbTarnOverlay .zbt-r-foot nav a{color:#70757a}
@media (max-width:1180px){#zbTarnOverlay .zbt-r-kp{display:none}}
@media (max-width:860px){
  #zbTarnOverlay .zbt-r-head{flex-wrap:wrap;padding:12px 12px 0;gap:10px}
  #zbTarnOverlay .zbt-r-head .zbt-s-logo{width:auto;font-size:26px;order:1;margin:0 auto}
  #zbTarnOverlay .zbt-r-head .zbt-r-right{order:2;position:absolute;right:10px;top:8px;padding:0}
  #zbTarnOverlay .zbt-r-head .zbt-r-right .zbt-s-apps{display:none}
  #zbTarnOverlay .zbt-r-head form{order:3;flex:1 1 100%;max-width:none}
  #zbTarnOverlay .zbt-r-head .zbt-s-box{padding-left:16px}
  #zbTarnOverlay .zbt-r-head .zbt-s-tools .m{display:none}
  #zbTarnOverlay .zbt-r-tabs{padding:0 8px;margin-top:6px}
  #zbTarnOverlay .zbt-r-tabs .sp{display:none}
  #zbTarnOverlay .zbt-r-body{padding:0 16px}
  #zbTarnOverlay .zbt-r-stats{display:none}
  #zbTarnOverlay .zbt-r-main{padding-top:14px}
  #zbTarnOverlay .zbt-r-res{margin-bottom:28px}
  #zbTarnOverlay .zbt-r-res h3{font-size:18px}
  #zbTarnOverlay .zbt-r-site .u{max-width:calc(100vw - 90px)}
  #zbTarnOverlay .zbt-r-foot .c,#zbTarnOverlay .zbt-r-foot nav{padding-left:16px;padding-right:16px}
  #zbTarnOverlay .zbt-s-foot nav{justify-content:center}
  #zbTarnOverlay .zbt-s-foot .c{padding:15px 20px}
}
@media (max-width:560px){#zbTarnOverlay .zbt-s-top .lnk{display:none}#zbTarnOverlay .zbt-s-home{padding-top:12vh}#zbTarnOverlay .zbt-s-foot nav a{padding:10px 12px}}

/* ===== (b) Lexikon – Artikel im Stil der freien Enzyklopädie ===== */
#zbTarnOverlay .zbt-v{min-height:100%;background:#fff;color:#202122;font:14px/1.6 sans-serif;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Lato,Helvetica,Arial,sans-serif}
#zbTarnOverlay .zbt-v a{color:#36c}
#zbTarnOverlay .zbt-v a:hover{text-decoration:underline}
#zbTarnOverlay .zbt-v a.new{color:#d73333}
#zbTarnOverlay .zbt-v-head{display:flex;align-items:center;gap:12px;max-width:1596px;margin:0 auto;padding:8px 24px;height:58px}
#zbTarnOverlay .zbt-v-menu{width:32px;height:32px;display:grid;place-items:center;border-radius:2px;cursor:pointer;flex:none}
#zbTarnOverlay .zbt-v-menu svg{width:20px;height:20px;fill:#202122}
#zbTarnOverlay .zbt-v-brand{display:flex;align-items:center;gap:10px;color:#000!important;flex:none;margin-right:12px}
#zbTarnOverlay .zbt-v-brand:hover{text-decoration:none!important}
#zbTarnOverlay .zbt-v-brand svg{width:44px;height:44px}
#zbTarnOverlay .zbt-v-word{display:flex;flex-direction:column;line-height:1}
#zbTarnOverlay .zbt-v-word b{font:400 21px/1 'Linux Libertine','Georgia','Times',serif;font-variant:small-caps;letter-spacing:.06em;color:#000}
#zbTarnOverlay .zbt-v-word small{font:400 12.5px/1.3 'Linux Libertine','Georgia','Times',serif;color:#202122;margin-top:3px}
#zbTarnOverlay .zbt-v-search{display:flex;flex:1;max-width:500px;min-width:0}
#zbTarnOverlay .zbt-v-search label{flex:1;display:flex;align-items:center;gap:6px;height:32px;border:1px solid #a2a9b1;border-right:0;border-radius:2px 0 0 2px;padding:0 8px;background:#fff;min-width:0}
#zbTarnOverlay .zbt-v-search label svg{width:18px;height:18px;fill:#72777d}
#zbTarnOverlay .zbt-v-search input{flex:1;min-width:0;border:0;outline:0;font:14px sans-serif;color:#202122;background:transparent;padding:0}
#zbTarnOverlay .zbt-v-search button{height:32px;padding:0 12px;border:1px solid #a2a9b1;border-radius:0 2px 2px 0;background:#f8f9fa;color:#202122;font:700 14px sans-serif;cursor:pointer}
#zbTarnOverlay .zbt-v-user{margin-left:auto;display:flex;align-items:center;gap:16px;font-size:14px;white-space:nowrap}
#zbTarnOverlay .zbt-v-user .dots{font-weight:700;letter-spacing:1px;color:#202122}
#zbTarnOverlay .zbt-v-page{max-width:1596px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:15.5em minmax(0,1fr);column-gap:24px}
#zbTarnOverlay .zbt-v-toc{position:sticky;top:0;align-self:start;padding:24px 0 20px;font-size:14px;max-height:100vh;overflow:auto}
#zbTarnOverlay .zbt-v-toc .h{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid #c8ccd1;padding-bottom:4px;margin-bottom:6px}
#zbTarnOverlay .zbt-v-toc .h b{font-size:14px}
#zbTarnOverlay .zbt-v-toc .h span{font-size:12px;padding:1px 6px;border:1px solid #a2a9b1;border-radius:2px;color:#202122;background:#f8f9fa}
#zbTarnOverlay .zbt-v-toc ul{list-style:none;margin:0;padding:0}
#zbTarnOverlay .zbt-v-toc li{padding:5px 0;line-height:1.3}
#zbTarnOverlay .zbt-v-toc li.on a{color:#202122;font-weight:700}
#zbTarnOverlay .zbt-v-toc li ul{padding-left:12px}
#zbTarnOverlay .zbt-v-main{min-width:0;padding-bottom:30px}
#zbTarnOverlay .zbt-v-titlebar{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;border-bottom:1px solid #a2a9b1;margin-top:18px}
#zbTarnOverlay .zbt-v-titlebar h1{font:400 28.8px/1.375 'Linux Libertine','Georgia','Times',serif;margin:0 0 2px;color:#000;letter-spacing:normal;text-transform:none}
#zbTarnOverlay .zbt-v-lang{display:inline-flex;align-items:center;gap:6px;margin-bottom:6px;padding:4px 8px;font-weight:700;font-size:14px;color:#36c;border-radius:2px;white-space:nowrap}
#zbTarnOverlay .zbt-v-lang svg{width:18px;height:18px;fill:#36c}
#zbTarnOverlay .zbt-v-tabs{display:flex;justify-content:space-between;gap:12px;font-size:14px;border-bottom:1px solid #a2a9b1;overflow-x:auto;white-space:nowrap;scrollbar-width:none}
#zbTarnOverlay .zbt-v-tabs::-webkit-scrollbar{display:none}
#zbTarnOverlay .zbt-v-tabs div{display:flex;gap:2px}
#zbTarnOverlay .zbt-v-tabs a{display:block;padding:8px 8px 6px;margin-bottom:-1px;border-bottom:2px solid transparent}
#zbTarnOverlay .zbt-v-tabs a.on{color:#202122;border-bottom-color:#202122}
#zbTarnOverlay .zbt-v-tabs a.on:hover{text-decoration:none}
#zbTarnOverlay .zbt-v-tag{font-size:12.8px;color:#54595d;margin:8px 0 10px}
#zbTarnOverlay .zbt-v-body{font-size:14px;line-height:1.6}
#zbTarnOverlay .zbt-v-body p{margin:7px 0 7px}
#zbTarnOverlay .zbt-v-hat{font-style:italic;padding-left:1.6em;margin:0 0 8px;color:#202122}
#zbTarnOverlay .zbt-v-body h2{font:400 21px/1.375 'Linux Libertine','Georgia','Times',serif;color:#000;border-bottom:1px solid #a2a9b1;margin:18px 0 6px;padding-bottom:1px;letter-spacing:normal;text-transform:none}
#zbTarnOverlay .zbt-v-body h2 .ed{float:right;font:12.5px sans-serif;color:#54595d;margin-top:8px}
#zbTarnOverlay .zbt-v-body h3{font:700 16.8px/1.6 sans-serif;margin:14px 0 2px;color:#202122;letter-spacing:normal;text-transform:none}
#zbTarnOverlay .zbt-v-body sup{font-size:10.5px;line-height:1}
#zbTarnOverlay .zbt-v-body ul{margin:4px 0 8px;padding-left:1.6em}
#zbTarnOverlay .zbt-v-box{float:right;clear:right;width:22em;margin:4px 0 12px 16px;border:1px solid #a2a9b1;background:#f8f9fa;font-size:12.3px;line-height:1.5;padding:3px}
#zbTarnOverlay .zbt-v-box .cap{font-weight:700;text-align:center;font-size:14px;padding:6px 4px;background:#cfe3c6}
#zbTarnOverlay .zbt-v-box svg{display:block;width:100%;height:auto;margin:3px 0}
#zbTarnOverlay .zbt-v-box .sub{text-align:center;color:#202122;padding:0 4px 6px}
#zbTarnOverlay .zbt-v-box table{width:100%;border-collapse:collapse}
#zbTarnOverlay .zbt-v-box th{text-align:left;vertical-align:top;padding:3px 5px;width:40%;font-weight:700}
#zbTarnOverlay .zbt-v-box td{padding:3px 5px;vertical-align:top}
#zbTarnOverlay .zbt-v-box tr+tr th,#zbTarnOverlay .zbt-v-box tr+tr td{border-top:1px solid #eaecf0}
#zbTarnOverlay .zbt-v-formula{display:block;text-align:center;margin:10px 0 12px;font:16px 'Times New Roman',serif}
#zbTarnOverlay .zbt-v-refs{font-size:12.6px;line-height:1.6;padding-left:2em;margin:6px 0}
#zbTarnOverlay .zbt-v-cats{clear:both;border:1px solid #a2a9b1;background:#f8f9fa;padding:6px 8px;margin-top:20px;font-size:12.6px}
#zbTarnOverlay .zbt-v-foot{border-top:1px solid #a2a9b1;margin-top:24px;padding:14px 0 30px;font-size:12px;color:#202122}
#zbTarnOverlay .zbt-v-foot p{margin:0 0 8px}
#zbTarnOverlay .zbt-v-foot nav{display:flex;flex-wrap:wrap;gap:4px 14px}
@media (max-width:1000px){
  #zbTarnOverlay .zbt-v-page{grid-template-columns:minmax(0,1fr)}
  #zbTarnOverlay .zbt-v-toc{display:none}
  #zbTarnOverlay .zbt-v-user .opt{display:none}
}
@media (max-width:720px){
  #zbTarnOverlay .zbt-v{font-size:16px}
  #zbTarnOverlay .zbt-v-head{padding:0 8px;height:54px;gap:6px;border-bottom:1px solid #eaecf0}
  #zbTarnOverlay .zbt-v-brand{margin:0 auto}
  #zbTarnOverlay .zbt-v-brand svg{display:none}
  #zbTarnOverlay .zbt-v-word b{font-size:22px}
  #zbTarnOverlay .zbt-v-word small{display:none}
  #zbTarnOverlay .zbt-v-search{flex:none;width:32px}
  #zbTarnOverlay .zbt-v-search label{border:0;padding:0;justify-content:center}
  #zbTarnOverlay .zbt-v-search input,#zbTarnOverlay .zbt-v-search button{display:none}
  #zbTarnOverlay .zbt-v-search label svg{width:20px;height:20px;fill:#202122}
  #zbTarnOverlay .zbt-v-user{display:none}
  #zbTarnOverlay .zbt-v-page{padding:0 16px}
  #zbTarnOverlay .zbt-v-titlebar{display:block;border-bottom:0;margin-top:14px}
  #zbTarnOverlay .zbt-v-titlebar h1{font-size:28px;line-height:1.3}
  #zbTarnOverlay .zbt-v-lang{display:none}
  #zbTarnOverlay .zbt-v-tabs{border-top:1px solid #eaecf0;border-bottom:1px solid #eaecf0}
  #zbTarnOverlay .zbt-v-tabs div:last-child{display:none}
  #zbTarnOverlay .zbt-v-body{font-size:16px;line-height:1.65}
  #zbTarnOverlay .zbt-v-box{float:none;width:auto;margin:10px 0 14px}
  #zbTarnOverlay .zbt-v-body h2{font-size:22px}
}

/* ===== (c) Dokument ===== */
#zbTarnOverlay .zbt-d{min-height:100%;background:#eef0f3;display:flex;flex-direction:column;font-family:Arial,Helvetica,sans-serif}
#zbTarnOverlay .zbt-d-head{background:#fff;border-bottom:1px solid #dadce0;position:sticky;top:0;z-index:2}
#zbTarnOverlay .zbt-d-row1{display:flex;align-items:center;gap:10px;padding:8px 14px 2px}
#zbTarnOverlay .zbt-d-row1 svg{width:28px;height:28px;flex:none}
#zbTarnOverlay .zbt-d-name{font-size:17px;color:#202124;outline:0;border:1px solid transparent;border-radius:4px;padding:1px 6px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#zbTarnOverlay .zbt-d-name:hover{border-color:#dadce0}
#zbTarnOverlay .zbt-d-saved{font-size:12px;color:#5f6368;margin-left:auto;white-space:nowrap}
#zbTarnOverlay .zbt-d-menu{display:flex;gap:14px;padding:0 14px 6px 52px;font-size:13.5px;color:#3c4043;overflow-x:auto;white-space:nowrap}
#zbTarnOverlay .zbt-d-tools{display:flex;align-items:center;gap:4px;padding:5px 12px;margin:0 10px 8px;background:#edf2fa;border-radius:20px;overflow-x:auto;white-space:nowrap}
#zbTarnOverlay .zbt-d-tools .dd{flex:none;font:13px Arial,sans-serif;color:#444;padding:0 6px;cursor:default}#zbTarnOverlay .zbt-d-tools .dd::after{content:' ▾';font-size:10px;color:#666}
#zbTarnOverlay .zbt-d-tools button{height:28px;min-width:28px;border:0;border-radius:4px;background:transparent;color:#444;font:13px Arial,sans-serif;padding:0 6px;cursor:pointer}
#zbTarnOverlay .zbt-d-tools button:hover{background:#dde3ea}
#zbTarnOverlay .zbt-d-tools .sep{width:1px;height:20px;background:#c7c7c7;margin:0 4px;flex:none}
#zbTarnOverlay .zbt-d-page{width:min(816px,calc(100% - 24px));margin:18px auto 50px;background:#fff;box-shadow:0 1px 3px rgba(60,64,67,.3);padding:clamp(24px,8vw,90px) clamp(20px,9vw,96px);min-height:900px;font:15px/1.6 Arial,sans-serif;color:#202124;outline:0}
#zbTarnOverlay .zbt-d-page h1{font:400 26px/1.3 Arial,sans-serif;margin:0 0 6px;letter-spacing:normal;text-transform:none}
#zbTarnOverlay .zbt-d-page h2{font:700 17px/1.3 Arial,sans-serif;margin:22px 0 6px;letter-spacing:normal;text-transform:none}
#zbTarnOverlay .zbt-d-page .dt{color:#5f6368;font-size:13px;margin-bottom:18px}
#zbTarnOverlay .zbt-d-page ul{margin:6px 0 10px;padding-left:22px}
#zbTarnOverlay .zbt-d-page p{margin:0 0 10px}
`;

// Zusätzliches Stylesheet der Looks (liegt neben dieser Datei). Fällt weg,
// wenn die Datei fehlt – die Tarnseiten funktionieren dann trotzdem.
function injectTheme() {
  if (document.getElementById('zbt-theme')) return;
  const l = document.createElement('link');
  l.id = 'zbt-theme';
  l.rel = 'stylesheet';
  l.href = new URL('./tarnung-theme.css', import.meta.url).href;
  (document.head || document.documentElement).appendChild(l);
}

function injectCSS() {
  injectTheme();
  if (!document.getElementById('zbt-css')) {
    const st = document.createElement('style');
    st.id = 'zbt-css'; st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }
  if (!document.getElementById('zbt-css2')) {
    const st2 = document.createElement('style');
    st2.id = 'zbt-css2'; st2.textContent = extraCSS();
    (document.head || document.documentElement).appendChild(st2);
  }
}

// ---------------------------------------------------------------------------
// Tarnseiten (eigener Text, eigenes Design, keine fremden Marken oder Logos)
// ---------------------------------------------------------------------------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LENS = '<svg class="lens" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/></svg>';
const MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5.3-3a5.3 5.3 0 0 1-10.6 0H5a7 7 0 0 0 6 6.9V22h2v-3.1a7 7 0 0 0 6-6.9z"/></svg>';
const CAM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>';
const XIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z"/></svg>';
const APPS = '<svg class="zbt-s-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>';
const CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z"/></svg>';
// neutrales Such-Logo: einfarbiger Schriftzug + Lupe (bewusst KEIN nachgebautes Fremd-Logo)
const S_LOGO = '<span class="zbt-s-logo" data-zbt="home" role="link" aria-label="Suche – Startseite"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="13" cy="13" r="8.5" fill="none" stroke="#1d8a7a" stroke-width="3.6"/><path d="M19.5 19.5 27 27" stroke="#1d8a7a" stroke-width="4" stroke-linecap="round"/></svg>Suche</span>';
const SITE_IC = {
  lex: '<svg viewBox="0 0 24 24"><path d="M3 5c3-1.5 6-1.5 9 .8V20c-3-2.3-6-2.3-9-.8z" fill="#54595d"/><path d="M21 5c-3-1.5-6-1.5-9 .8V20c3-2.3 6-2.3 9-.8z" fill="#a2a9b1"/></svg>',
  leaf: '<svg viewBox="0 0 24 24"><path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z" fill="#3e9b4f"/><path d="M5 19 14 10" stroke="#fff" stroke-width="1.6"/></svg>',
  cap: '<svg viewBox="0 0 24 24"><path d="M12 4 1 9l11 5 9-4.1V16h2V9z" fill="#c2552d"/><path d="M5 12.5V16c2 2 12 2 14 0v-3.5l-7 3.2z" fill="#e07a4f"/></svg>',
  play: '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4" fill="#5c6bc0"/><path d="M10 9v6l5-3z" fill="#fff"/></svg>',
  atom: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.4" fill="#1d7fa3"/><g fill="none" stroke="#1d7fa3" stroke-width="1.5"><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-60 12 12)"/></g></svg>',
};

function searchBox(q, big) {
  return `<form data-zbt="search" role="search"><label class="zbt-s-box">${big ? LENS : ''}<input type="search" name="q" value="${esc(q || '')}" autocomplete="off" spellcheck="false" aria-label="Suchen" maxlength="200">
    <span class="zbt-s-tools">${q && !big ? `<span class="x" data-zbt="clear" aria-label="Löschen">${XIC}</span><span class="div"></span>` : ''}<span class="m" aria-hidden="true">${MIC}</span><span class="m" aria-hidden="true">${CAM}</span>${big ? '' : `<span data-zbt="go" aria-label="Suchen">${LENS.replace('class="lens"', 'style="fill:#1a73e8"')}</span>`}</span></label>${big ? '<div class="zbt-s-btns"><button type="submit">Suche starten</button><button type="button" data-zbt="lucky">Auf gut Glück!</button></div>' : ''}</form>`;
}

function searchHome() {
  return `<div class="zbt-s">
  <div class="zbt-s-top"><a class="lnk">Mail</a><a class="lnk">Bilder</a><span class="zbt-s-apps" aria-hidden="true">${APPS}</span><span class="zbt-s-av" aria-hidden="true">L</span></div>
  <div class="zbt-s-home">${S_LOGO}${searchBox('', true)}
    <div class="zbt-s-lang">Suche gibt es auch auf: <a>English</a><a>Français</a><a>Türkçe</a><a>Русский</a></div>
    ${(() => { const h = ajson(AKEYS.history, []); return h.length ? `<div class="zbt-s-hist">Zuletzt gesucht: ${h.map((x) => `<a data-zbt2="history" data-q="${esc(x)}">${esc(x)}</a>`).join(' · ')}</div>` : ''; })()}
  </div>
  <footer class="zbt-s-foot"><div class="c">Deutschland</div><nav><div><a>Über uns</a><a>Werbung</a><a>Unternehmen</a><a>Wie funktioniert die Suche?</a></div><div><a>Datenschutzerklärung</a><a>Nutzungsbedingungen</a><a>Einstellungen</a></div></nav></footer>
</div>`;
}

const PHOTO_RESULTS = [
  { ic: 'lex', n: 'Lexikon', u: 'https://de.lexikon.org › wiki › Photosynthese', t: 'Photosynthese – Lexikon', open: 'lexikon',
    p: '<b>Photosynthese</b> ist ein physiologischer Prozess zur Erzeugung von energiereichen Biomolekülen aus energieärmeren Stoffen mithilfe von Lichtenergie. Sie wird von Pflanzen, Algen und einigen Bakterien betrieben.',
    sub: ['Calvin-Zyklus', 'Lichtreaktion', 'Chlorophyll', 'Gesamtgleichung'] },
  { ic: 'leaf', n: 'Bio-Lernen', u: 'https://www.bio-lernen.de › pflanzen › photosynthese', t: 'Photosynthese einfach erklärt: Formel, Ablauf & Ort',
    p: '<span class="d">12.09.2026 — </span>Bei der <b>Photosynthese</b> stellen Pflanzen aus Kohlenstoffdioxid und Wasser mithilfe von Sonnenlicht Traubenzucker und Sauerstoff her. Wir erklären dir Schritt für Schritt …' },
  { ic: 'cap', n: 'Schulwissen kompakt', u: 'https://www.schulwissen-kompakt.de › biologie › klasse-9', t: 'Photosynthese – Zusammenfassung für die 9. Klasse',
    p: 'Alles Wichtige zur <b>Photosynthese</b> auf einen Blick: Wortgleichung, Summenformel, lichtabhängige und lichtunabhängige Reaktion sowie typische Prüfungsfragen.' },
  { ic: 'play', n: 'Lernvideos', u: 'https://www.lernvideos.de › biologie', t: 'Photosynthese – Lichtreaktion und Calvin-Zyklus (Video)',
    p: '<span class="d">8:42 · </span>In diesem Video lernst du, wie die <b>Photosynthese</b> in den Chloroplasten abläuft und was in der Lichtreaktion und im Calvin-Zyklus passiert.' },
  { ic: 'atom', n: 'Naturwissen', u: 'https://www.naturwissen.info › photosynthese-versuch', t: 'Versuch: Sauerstoffbildung bei der Wasserpest',
    p: 'Mit diesem einfachen Experiment lässt sich zeigen, dass bei der <b>Photosynthese</b> Sauerstoff entsteht. Material, Durchführung und Auswertung mit Tabelle.' },
];
const PHOTO_QA = [
  ['Was ist die Photosynthese einfach erklärt?', 'Pflanzen nutzen Sonnenlicht, um aus Kohlenstoffdioxid und Wasser Zucker herzustellen. Dabei geben sie Sauerstoff ab.'],
  ['Wie lautet die Formel der Photosynthese?', '6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂ (mit Lichtenergie, in den Chloroplasten).'],
  ['Wo findet die Photosynthese statt?', 'In den Chloroplasten der Pflanzenzellen, vor allem in den Blättern. Die Lichtreaktion läuft in den Thylakoiden ab, der Calvin-Zyklus im Stroma.'],
  ['Was ist der Unterschied zwischen Photosynthese und Zellatmung?', 'Die Photosynthese baut Zucker unter Lichtenergie auf und setzt Sauerstoff frei. Die Zellatmung baut Zucker mit Sauerstoff ab und setzt Energie frei.'],
];

function genericResults(q) {
  const Q = esc(q);
  const T = esc(q.charAt(0).toUpperCase() + q.slice(1)); // Titel groß, Text wie eingegeben
  return [
    { ic: 'lex', n: 'Lexikon', u: 'https://de.lexikon.org › wiki', t: `${T} – Lexikon`, p: `<b>${Q}</b> – Definition, Herkunft und Bedeutung. Artikel aus der freien Enzyklopädie mit weiterführenden Links und Quellen.` },
    { ic: 'cap', n: 'Schulwissen kompakt', u: 'https://www.schulwissen-kompakt.de › suche', t: `${T} einfach erklärt – Schulwissen kompakt`, p: `Was bedeutet <b>${Q}</b>? Hier findest du eine verständliche Erklärung mit Beispielen und Übungsaufgaben.` },
    { ic: 'leaf', n: 'Lernportal', u: 'https://www.lernportal.de › themen', t: `${T}: Alles Wichtige im Überblick`, p: `<span class="d">vor 3 Tagen — </span>Zusammenfassung zu <b>${Q}</b>: die wichtigsten Fakten, Begriffe und häufige Fragen.` },
    { ic: 'play', n: 'Lernvideos', u: 'https://www.lernvideos.de › themen', t: `${T} – Erklärvideo`, p: `In wenigen Minuten erklärt: <b>${Q}</b>. Mit Zusammenfassung zum Download.` },
  ];
}

function resultHtml(r) {
  return `<div class="zbt-r-res"><div class="zbt-r-site"><span class="zbt-r-fav">${SITE_IC[r.ic]}</span><span><span class="n">${r.n}</span><span class="u">${r.u}</span></span></div>
    <h3><a ${r.open ? `data-zbt-open="${r.open}"` : ''}>${r.t}</a></h3><p>${r.p}</p>${r.sub ? `<div class="zbt-r-sub">${r.sub.map((s) => `<a data-zbt-open="lexikon">${s}</a>`).join('')}</div>` : ''}</div>`;
}

const KP_PIC = '<svg class="pic" viewBox="0 0 340 150" aria-hidden="true"><rect width="340" height="150" fill="#e7f3e2"/><circle cx="296" cy="34" r="20" fill="#f6c945"/><path d="M276 46 236 70M284 54 252 86" stroke="#e8b730" stroke-width="3"/><path d="M90 150c0-50 14-84 52-110" stroke="#3f7d3a" stroke-width="5" fill="none"/><ellipse cx="160" cy="62" rx="54" ry="22" transform="rotate(-25 160 62)" fill="#5aa64f"/><ellipse cx="94" cy="96" rx="42" ry="18" transform="rotate(30 94 96)" fill="#6dbb5f"/></svg>';

function searchResults(q, opt = {}) {
  const pg = Math.max(1, Math.min(10, Number(opt.page) || 1));
  const tab = opt.tab || 'Alle';
  const onlyLex = !!opt.onlyLex;
  const photo = /photo|foto|synth/i.test(q);
  let res = photo ? PHOTO_RESULTS.slice() : genericResults(q);
  if (tab === 'Bilder' || tab === 'Videos') res = res.slice(0, 3);
  else if (tab === 'News' || tab === 'Web') res = res.slice(1, 4);
  else if (tab === 'Bücher' || tab === 'Mehr') res = res.slice(-2);
  if (onlyLex) res = res.filter((r) => r.ic === 'lex');
  if (!res.length) res = genericResults(q).slice(0, 1);
  if (pg > 1) res = res.map((r, i) => ({ ...r, t: i === 0 ? `${r.t} · Seite ${pg}` : r.t, p: `<span class="d">Seite ${pg} · </span>${r.p}` }));
  const n = photo ? '4.130.000' : (100000 + (q.length * 7919 + pg * 104729) % 900000).toLocaleString('de-DE');
  const list = res.map(resultHtml);
  if (photo && tab === 'Alle' && !onlyLex && pg === 1) {
    list.splice(1, 0, `<div class="zbt-r-paa"><h2>Ähnliche Fragen</h2>${PHOTO_QA.map(([f, a]) => `<div class="zbt-r-q"><button type="button" data-zbt="qa">${f}${CHEV}</button><div class="a">${a}</div></div>`).join('')}</div>`);
  }
  const TABS = ['Alle', 'Bilder', 'Videos', 'News', 'Bücher', 'Web', 'Mehr'];
  const hist = ajson(AKEYS.history, []);
  return `<div class="zbt-s zbt-r">
  <div class="zbt-r-head" style="position:relative">${S_LOGO}${searchBox(q, false)}<div class="zbt-r-right"><span class="zbt-s-apps" aria-hidden="true">${APPS}</span><span class="zbt-s-av" aria-hidden="true">L</span></div></div>
  <div class="zbt-r-tabs">${TABS.map((t) => `<span class="${t === tab ? 'on' : ''}" data-zbt2="tab" data-tab="${t}">${t}</span>`).join('')}<span class="sp" data-zbt2="home2" style="cursor:pointer">Startseite</span></div>
  <div class="zbt-r-tools">
    <button type="button" class="zbt-fbtn${onlyLex ? ' on' : ''}" data-zbt2="filter">Nur Lexikon</button>
    <span>${esc(tab)} · Seite ${pg}</span>
    ${hist.length ? `<span class="zbt-h">Verlauf: ${hist.slice(0, 4).map((x) => `<a data-zbt2="history" data-q="${esc(x)}">${esc(x)}</a>`).join(' · ')}</span>` : ''}
  </div>
  <div class="zbt-r-body">
    <div class="zbt-r-main"><div class="zbt-r-stats">Ungefähr ${n} Ergebnisse (0,${photo ? '38' : '41'} Sekunden) · ${esc(q)}</div>${list.join('')}
      <div class="zbt-r-pages">${Array.from({ length: 10 }, (_, i) => i + 1).map((i) => i === pg ? `<span class="on">${i}</span>` : `<a data-zbt2="page" data-page="${i}">${i}</a>`).join('')}<a data-zbt2="page" data-page="${Math.min(10, pg + 1)}">Weiter</a></div>
    </div>
    ${photo ? `<aside class="zbt-r-kp"><h2>Photosynthese</h2><div class="t">Biologischer Prozess</div>${KP_PIC}<p>Photosynthese ist der Vorgang, bei dem grüne Pflanzen, Algen und einige Bakterien Lichtenergie in chemische Energie umwandeln. <a data-zbt-open="lexikon">Lexikon</a></p><dl><dt>Ort: </dt><dd>Chloroplasten</dd><dt>Ausgangsstoffe: </dt><dd>Kohlenstoffdioxid, Wasser</dd><dt>Produkte: </dt><dd>Glucose, Sauerstoff</dd><dt>Teilschritte: </dt><dd>Lichtreaktion, Calvin-Zyklus</dd></dl></aside>` : ''}
  </div>
  <footer class="zbt-r-foot"><div class="c"><b>Deutschland</b> · Basierend auf deinen bisherigen Aktivitäten</div><nav><a>Hilfe</a><a>Feedback geben</a><a>Datenschutzerklärung</a><a>Nutzungsbedingungen</a></nav></footer>
</div>`;
}

// Standardansicht der Tarnseite „Suche“: Ergebnisse zu einem einstellbaren Schulthema.
function pageSuche() {
  searchState.q = S.term || 'photosynthese';
  return searchResults(searchState.q, searchState);
}

const MENU_IC = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M1 3h18v2H1zm0 6h18v2H1zm0 6h18v2H1z"/></svg>';
const LANG_IC = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M20 18h-1.4l-1.2-3h-4.9l-1.2 3H9.9l4.4-11h1.3zm-3.2-4.5-1.9-4.9-1.9 4.9zM9 6H6V4H4v2H0v2h6.4C5.9 9.5 5 10.9 3.9 12 3.1 11.2 2.5 10.4 2 9.5H.2c.6 1.3 1.4 2.5 2.4 3.6L0 15.6 1.4 17 4 14.4l1.6 1.6.6-1.6-1-1C6.6 12 7.7 10 8.4 8H9z"/></svg>';
const LEX_MARK = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#f8f9fa" stroke="#c8ccd1" stroke-width="1.5"/><path d="M10 15c4.6-2.2 9.2-2.2 13.8.9V36c-4.6-3-9.2-3-13.8-.9z" fill="#54595d"/><path d="M38 15c-4.6-2.2-9.2-2.2-13.8.9V36c4.6-3 9.2-3 13.8-.9z" fill="#a2a9b1"/></svg>';

function pageLexikon(topic = 'photosynthese') {
  if (topic !== 'photosynthese') return lexArticle(LEX_DATA[topic] || LEX_DATA.zellatmung);
  lexTopic = 'photosynthese';
  const html = `<div class="zbt-v">
  <header class="zbt-v-head">
    <span class="zbt-v-menu" aria-hidden="true">${MENU_IC}</span>
    <a class="zbt-v-brand">${LEX_MARK}<span class="zbt-v-word"><b>Lexikon</b><small>Die freie Enzyklopädie</small></span></a>
    <form class="zbt-v-search" data-zbt="lexsearch" role="search"><label>${LENS}<input type="search" placeholder="Lexikon durchsuchen" aria-label="Lexikon durchsuchen"></label><button type="submit">Suchen</button></form>
    <div class="zbt-v-user"><a class="opt">Spenden</a><a class="opt">Benutzerkonto erstellen</a><a>Anmelden</a><span class="dots">···</span></div>
  </header>
  <div class="zbt-v-page">
    <nav class="zbt-v-toc" aria-label="Inhalt"><div class="h"><b>Inhalt</b><span>verbergen</span></div>
      <ul><li class="on"><a>(Anfang)</a></li><li><a>Etymologie</a></li><li><a>Gesamtgleichung</a></li><li><a>Ablauf</a><ul><li><a>Lichtabhängige Reaktionen</a></li><li><a>Calvin-Zyklus</a></li></ul></li><li><a>Einflussfaktoren</a></li><li><a>Bedeutung</a></li><li><a>Siehe auch</a></li><li><a>Einzelnachweise</a></li></ul></nav>
    <main class="zbt-v-main">
      <div class="zbt-v-titlebar"><h1>Photosynthese</h1><span class="zbt-v-lang">${LANG_IC}112 Sprachen ▾</span></div>
      <div class="zbt-v-tabs"><div><a class="on">Artikel</a><a>Diskussion</a></div><div><a class="on">Lesen</a><a>Bearbeiten</a><a>Quelltext bearbeiten</a><a>Versionsgeschichte</a><a>Werkzeuge ▾</a></div></div>
      <div class="zbt-v-tag">aus Lexikon, der freien Enzyklopädie</div>
      <div class="zbt-v-body">
        <p class="zbt-v-hat">Dieser Artikel behandelt die Photosynthese bei Pflanzen. Zur Energiegewinnung ohne Licht siehe <a>Chemosynthese</a>.</p>
        <div class="zbt-v-box">
          <div class="cap">Photosynthese</div>
          <svg viewBox="0 0 240 130" aria-hidden="true"><rect width="240" height="130" fill="#eaf6ea"/><circle cx="205" cy="26" r="16" fill="#f6c945"/><path d="M190 36 150 60M196 42 160 76" stroke="#e8b730" stroke-width="2"/><path d="M60 120c0-40 10-70 40-90" stroke="#3f7d3a" stroke-width="4" fill="none"/><ellipse cx="110" cy="52" rx="40" ry="18" transform="rotate(-25 110 52)" fill="#5aa64f"/><ellipse cx="62" cy="78" rx="32" ry="14" transform="rotate(30 62 78)" fill="#6dbb5f"/><path d="M80 66 140 40" stroke="#3f7d3a" stroke-width="1.5"/><text x="150" y="100" font-size="11" fill="#2b5d28">CO₂ + H₂O</text><text x="20" y="20" font-size="11" fill="#2b5d28">O₂ ↑</text></svg>
          <div class="sub">Schema: Licht, Wasser und CO₂ werden im Blatt zu Zucker und Sauerstoff</div>
          <table><tr><th>Ort</th><td><a>Chloroplasten</a></td></tr><tr><th>Farbstoff</th><td><a>Chlorophyll</a> a und b</td></tr><tr><th>Ausgangsstoffe</th><td>Kohlenstoffdioxid, Wasser</td></tr><tr><th>Produkte</th><td><a>Glucose</a>, Sauerstoff</td></tr><tr><th>Energiequelle</th><td>Licht</td></tr></table>
        </div>
        <p>Die <b>Photosynthese</b> (von <a>altgriechisch</a> <i>phōs</i> „Licht“ und <i>sýnthesis</i> „Zusammensetzung“) ist ein <a>physiologischer</a> Prozess zur Erzeugung von energiereichen <a>Biomolekülen</a> aus energieärmeren Stoffen mithilfe von <a>Lichtenergie</a>. Sie wird von <a>Pflanzen</a>, <a>Algen</a> und einigen <a>Bakterien</a> betrieben.<sup><a>[1]</a></sup> Dabei werden <a>Kohlenstoffdioxid</a> und <a>Wasser</a> zu <a>Traubenzucker</a> (Glucose) umgewandelt; als Nebenprodukt entsteht <a>Sauerstoff</a>.</p>
        <p>Die Photosynthese gilt als einer der wichtigsten biochemischen Prozesse der Erde. Nahezu alle <a>Nahrungsketten</a> beginnen bei Lebewesen, die Photosynthese betreiben, und der Sauerstoff der <a>Erdatmosphäre</a> stammt zum größten Teil aus ihr.<sup><a>[2]</a></sup></p>
        <h2>Etymologie</h2>
        <p>Der Begriff wurde im 19. Jahrhundert aus den griechischen Wörtern für „Licht“ und „Zusammensetzung“ gebildet und setzte sich gegen ältere Bezeichnungen wie <i>Assimilation</i> durch, die heute noch in der Fachsprache verwendet wird.</p>
        <h2>Gesamtgleichung</h2>
        <p>Vereinfacht lässt sich die Photosynthese grüner Pflanzen in einer <a>Summengleichung</a> zusammenfassen:</p>
        <span class="zbt-v-formula">6 CO₂ + 12 H₂O &nbsp;→ &nbsp;C₆H₁₂O₆ + 6 O₂ + 6 H₂O</span>
        <p>Die Gleichung beschreibt nur Anfang und Ende. Tatsächlich laufen viele Einzelschritte ab, die sich in zwei Abschnitte gliedern lassen: die lichtabhängigen Reaktionen und die lichtunabhängigen Reaktionen.</p>
        <h2>Ablauf</h2>
        <h3>Lichtabhängige Reaktionen</h3>
        <p>In den <a>Thylakoidmembranen</a> der Chloroplasten nimmt das grüne Blattpigment <a>Chlorophyll</a> Licht auf. Die Energie wird genutzt, um Wasser zu spalten (<a>Photolyse</a>). Dabei entstehen Sauerstoff, Protonen und Elektronen. Über eine <a>Elektronentransportkette</a> werden die Energieträger <a>ATP</a> und <a>NADPH</a> gebildet.<sup><a>[3]</a></sup></p>
        <h3>Calvin-Zyklus</h3>
        <p>Im <a>Stroma</a> der Chloroplasten wird Kohlenstoffdioxid mithilfe des Enzyms <a>RuBisCO</a> an einen Zucker mit fünf Kohlenstoffatomen gebunden. Unter Verbrauch von ATP und NADPH entstehen in mehreren Schritten Zuckermoleküle, aus denen die Pflanze Glucose, <a>Stärke</a> und <a>Cellulose</a> aufbaut. Der Zyklus ist nach dem Chemiker <a>Melvin Calvin</a> benannt.</p>
        <h2>Einflussfaktoren</h2>
        <p>Die Geschwindigkeit der Photosynthese hängt vor allem von der <a>Lichtintensität</a>, der Kohlenstoffdioxid-Konzentration und der <a>Temperatur</a> ab. Der Faktor, der am knappsten ist, begrenzt die Rate (<a class="new">Prinzip des begrenzenden Faktors</a>). Bei zu hohen Temperaturen nimmt die Leistung wieder ab, weil <a>Enzyme</a> geschädigt werden.</p>
        <h2>Bedeutung</h2>
        <p>Neben der Bildung von Sauerstoff bindet die Photosynthese große Mengen Kohlenstoffdioxid und spielt damit eine zentrale Rolle im <a>Kohlenstoffkreislauf</a> und für das <a>Klima</a>. Auch <a>fossile Brennstoffe</a> wie Kohle und Erdöl gehen auf Biomasse zurück, die einst durch Photosynthese entstanden ist.</p>
        <h2>Siehe auch</h2>
        <ul><li><a>Chemosynthese</a></li><li><a>Zellatmung</a></li><li><a>C4-Pflanzen</a></li></ul>
        <h2>Einzelnachweise</h2>
        <ol class="zbt-v-refs"><li>Grundlagen der Pflanzenphysiologie. 8. Auflage, 2019, S. 112–118.</li><li>Lehrbuch der Botanik. 38. Auflage, 2021, S. 254.</li><li>Biochemie kompakt. 5. Auflage, 2018, Kapitel 15.</li></ol>
        <div class="zbt-v-cats"><a>Kategorien</a>: <a>Pflanzenphysiologie</a> | <a>Stoffwechsel</a> | <a>Biochemie</a></div>
      </div>
      <footer class="zbt-v-foot"><p>Diese Seite wurde zuletzt am 3. November 2026 um 14:12 Uhr bearbeitet.</p><p>Der Text ist unter der Lizenz „Creative-Commons Namensnennung – Weitergabe unter gleichen Bedingungen“ verfügbar; Informationen zu den Urhebern sind auf der Versionsseite abrufbar.</p><nav><a>Datenschutz</a><a>Über Lexikon</a><a>Impressum</a><a>Mobile Ansicht</a></nav></footer>
    </main>
  </div>
</div>`;
  return lexEnhance(html);
}

const DOC_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 2h13l6 6v20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#3a6fd8"/><path d="M20 2v6h6" fill="#8fb0f0"/><path d="M9 14h14M9 18h14M9 22h10" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';

function pageDokument() {
  const d = new Date();
  const dt = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const name = S.docName || 'Biologie-Notizen';
  let saved = '';
  try { saved = localStorage.getItem(AKEYS.doc) || ''; } catch (e) {}
  const body = saved || `<h1>${esc(name)}</h1>
    <div class="dt">Notizen vom ${esc(dt)}</div>
    <h2>1. Grundlagen</h2>
    <ul><li>Ort: Chloroplasten (vor allem in den Blättern)</li><li>Farbstoff: Chlorophyll → nimmt rotes und blaues Licht auf, grünes wird reflektiert</li><li>Ausgangsstoffe: Kohlenstoffdioxid (aus der Luft) + Wasser (aus dem Boden)</li><li>Produkte: Glucose + Sauerstoff</li></ul>
    <p><b>Wortgleichung:</b> Kohlenstoffdioxid + Wasser → (Licht) → Glucose + Sauerstoff</p>
    <h2>2. Ablauf</h2>
    <p><b>Lichtreaktion</b> (Thylakoide): Wasser wird gespalten, Sauerstoff wird frei, ATP und NADPH entstehen.</p>
    <p><b>Dunkelreaktion / Calvin-Zyklus</b> (Stroma): CO₂ wird gebunden, mit ATP und NADPH wird Zucker aufgebaut.</p>
    <h2>3. Einflussfaktoren</h2>
    <ul><li>Lichtstärke</li><li>CO₂-Gehalt der Luft</li><li>Temperatur (Optimum ca. 25–30 °C)</li><li>Wasserversorgung</li></ul>
    <p>→ Prinzip des begrenzenden Faktors: der knappste Faktor bestimmt die Geschwindigkeit.</p>
    <h2>4. Für den Test wiederholen</h2>
    <ul><li>Versuch mit der Wasserpest (Sauerstoffbläschen zählen)</li><li>Unterschied Fotosynthese ↔ Zellatmung</li><li>Aufbau eines Laubblatts (Skizze!)</li></ul>`;
  const tools = [
    ['Undo', 'undo'], ['Redo', 'redo'],
  ];
  return `<div class="zbt-d">
  <div class="zbt-d-head">
    <div class="zbt-d-row1">${DOC_ICON}<span class="zbt-d-name" contenteditable="true" spellcheck="false" data-zbt2="doc-name">${esc(name)}</span>
      <span class="zbt-d-saved" data-doc-status>Alle Änderungen gespeichert</span>
      <button type="button" class="zbt-btn" data-zbt2="print" style="margin-left:8px">Drucken</button>
      <button type="button" class="zbt-btn" data-zbt2="doc-clear" style="margin-left:6px">Leeren</button></div>
    <div class="zbt-d-menu"><span>Datei</span><span>Bearbeiten</span><span>Ansicht</span><span>Einfügen</span><span>Format</span><span>Extras</span><span>Hilfe</span></div>
    <div class="zbt-d-tools">
      ${tools.map(([l, c]) => `<button type="button" data-zbt2="doc-cmd" data-cmd="${c}" title="${c}">${l}</button>`).join('')}<span class="sep"></span>
      <span class="dd">Normaler Text</span><span class="sep"></span>
      <button type="button" data-zbt2="doc-cmd" data-cmd="bold" title="Fett"><b>F</b></button>
      <button type="button" data-zbt2="doc-cmd" data-cmd="italic" title="Kursiv"><i>K</i></button>
      <button type="button" data-zbt2="doc-cmd" data-cmd="underline" title="Unterstrichen"><u>U</u></button>
      <span class="sep"></span>
      <button type="button" data-zbt2="doc-cmd" data-cmd="insertUnorderedList" title="Liste">•</button>
      <button type="button" data-zbt2="doc-cmd" data-cmd="insertOrderedList" title="Nummerierte Liste">1.</button>
      <button type="button" data-zbt2="doc-cmd" data-cmd="formatBlock" data-val="h2" title="Überschrift">H2</button>
      <span class="sep"></span><span class="dd">Arial</span><span class="dd">11</span>
    </div>
    <div class="zbt-d-status"><span data-doc-words>0 Wörter</span><span>Automatisch gespeichert · nur in diesem Browser</span><span>Ctrl + P druckt nur dieses Dokument</span></div>
  </div>
  <div class="zbt-d-page" contenteditable="true" spellcheck="false" data-zbt2="doc-page">${body}</div>
</div>`;
}


// ===========================================================================
// Look „Lernplattform“ – Anmeldung, Dashboard, meine Kurse, Kursseite
// Eigene Texte, eigene Symbolik, eigene Kursnamen. Keine echten Schulen,
// keine echten Marken, keine fremden Logos.
// ===========================================================================
const mName = () => { try { return (localStorage.getItem('ph_name') || '').trim(); } catch (e) { return ''; } };
const mHello = () => mName() || 'Gast';

const M_NAV = [
  ['start', 'Startseite'], ['dash', 'Dashboard'], ['kurse', 'Meine Kurse'],
  ['buchung', 'Buchungssystem'], ['tafel', 'Digitale Tafel'],
];

const mIcon = {
  search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3h.8l5 5 1.5-1.5-5-5zM10 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M12 22a2.4 2.4 0 0 0 2.4-2.4H9.6A2.4 2.4 0 0 0 12 22zm7.2-6V10a7.2 7.2 0 0 0-5.4-7v-.8a1.8 1.8 0 1 0-3.6 0V3a7.2 7.2 0 0 0-5.4 7v6L3 18.4v1.2h18v-1.2z"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z"/></svg>',
  doc: '<svg viewBox="0 0 24 24"><path d="M6 2h8l6 6v14H6z" fill="#3a6fd8"/><path d="M14 2v6h6" fill="#8fb0f0"/><path d="M9 13h8M9 17h8" stroke="#fff" stroke-width="1.8"/></svg>',
  task: '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none" stroke="#7a5a10" stroke-width="2"/><path d="M7 12l3 3 6-6" fill="none" stroke="#c99a16" stroke-width="2.4"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" fill="none" stroke="#1d7fa3" stroke-width="2"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" fill="none" stroke="#1d7fa3" stroke-width="2"/></svg>',
  forum: '<svg viewBox="0 0 24 24"><path d="M3 4h18v11H8l-5 5z" fill="#5c6bc0"/></svg>',
  file: '<svg viewBox="0 0 24 24"><path d="M6 2h12v20H6z" fill="#e7e9ec" stroke="#b6bcc4" stroke-width="1.4"/><path d="M9 8h6M9 12h6M9 16h4" stroke="#8d949b" stroke-width="1.6"/></svg>',
  quiz: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#c2552d"/><path d="M9.4 9a2.6 2.6 0 1 1 3.7 2.4c-.7.4-1.1.9-1.1 1.8" fill="none" stroke="#fff" stroke-width="2"/><circle cx="12" cy="17" r="1.3" fill="#fff"/></svg>',
  video: '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3" fill="#5c6bc0"/><path d="M10 9l5 3-5 3z" fill="#fff"/></svg>',
  empty: '<svg viewBox="0 0 64 64" fill="none" stroke="#9aa2a9" stroke-width="2.2"><rect x="10" y="16" width="44" height="34" rx="4"/><path d="M10 24h44" stroke-width="3"/><path d="M19 33h12M19 40h20"/></svg>',
  lang: '<svg viewBox="0 0 20 20" fill="#3c4043" width="14" height="14"><path d="M20 18h-1.4l-1.2-3h-4.9l-1.2 3H9.9l4.4-11h1.3zm-3.2-4.5-1.9-4.9-1.9 4.9zM9 6H6V4H4v2H0v2h6.4C5.9 9.5 5 10.9 3.9 12 3.1 11.2 2.5 10.4 2 9.5H.2c.6 1.3 1.4 2.5 2.4 3.6L0 15.6 1.4 17 4 14.4l1.6 1.6.6-1.6-1-1C6.6 12 7.7 10 8.4 8H9z"/></svg>',
};

// Kurskarten – Namen und Fächer wie auf einer Stundenplan-Kachel, alles erfunden.
const M_COURSES = [
  { id: 'eng', code: '10a E 27 POM', name: 'Englisch', teacher: 'Hr. POMMERENING', cover: 'flag', glyph: 'EN', room: 'A 204' },
  { id: 'ek', code: '10a EK Mau 27', name: 'Erdkunde', teacher: 'Fr. MAUL', cover: 'circles', glyph: 'EK', room: 'B 112' },
  { id: 'bio', code: '10a Bi Man 26/27', name: 'Biologie', teacher: 'Hr. Dr. MANTENIOTIS', cover: 'squares', glyph: 'BI', room: 'C 3' },
  { id: 'mathe', code: 'Mathe 10a ROS', name: 'Mathematik', teacher: 'Hr. ROSENECK', cover: 'math', glyph: '∑', room: 'A 105' },
  { id: 'geo', code: '10 GE 27 Wey', name: 'Geschichte', teacher: 'Fr. WEYERS', cover: 'diag', glyph: 'GE', room: 'B 208' },
  { id: 'deutsch', code: '10 BLP 27 Stu', name: 'Deutsch', teacher: 'Fr. MAUL', cover: 'tri', glyph: 'DE', room: 'A 011' },
  { id: 'info', code: '10a IF Kro 27', name: 'Informatik', teacher: 'Hr. KROMBACH', cover: 'code', glyph: '<>', room: 'PC 2' },
  { id: 'kunst', code: '10a KU Fel 27', name: 'Kunst', teacher: 'Fr. FELDT', cover: 'blob', glyph: 'KU', room: 'D 1' },
];

const M_COVERS = {
  flag: 'background:linear-gradient(178deg,#b22234 0 8%,#fff 8% 15%,#b22234 15% 23%,#fff 23% 30%,#b22234 30% 38%,#fff 38% 45%,#b22234 45% 53%,#fff 53% 60%,#b22234 60% 68%,#fff 68% 75%,#b22234 75% 83%,#fff 83% 90%,#b22234 90%)',
  circles: 'background:radial-gradient(circle at 18% 26%,rgba(255,255,255,.34) 0 12%,transparent 12.6%),radial-gradient(circle at 58% 66%,rgba(255,255,255,.28) 0 17%,transparent 17.6%),radial-gradient(circle at 86% 22%,rgba(255,255,255,.24) 0 9%,transparent 9.6%),linear-gradient(135deg,#8d8ce8,#a5a4f2)',
  squares: 'background:repeating-linear-gradient(0deg,rgba(255,255,255,.28) 0 2px,transparent 2px 22px),repeating-linear-gradient(90deg,rgba(255,255,255,.28) 0 2px,transparent 2px 22px),linear-gradient(135deg,#ee5d94,#f4739f)',
  math: 'background:radial-gradient(circle at 78% 22%,rgba(255,236,150,.5) 0 14%,transparent 15%),linear-gradient(150deg,#2f2a24,#4d4437 60%,#6b5c45)',
  diag: 'background:repeating-linear-gradient(45deg,rgba(255,255,255,.34) 0 14px,transparent 14px 28px),repeating-linear-gradient(-45deg,rgba(255,255,255,.2) 0 14px,transparent 14px 28px),linear-gradient(135deg,#b9bec4,#d6dade)',
  tri: 'background:conic-gradient(from 210deg at 30% 70%,rgba(255,255,255,.3) 0 60deg,transparent 60deg 180deg,rgba(255,255,255,.22) 180deg 250deg,transparent 250deg),linear-gradient(150deg,#1f6fd0,#3f95e6)',
  code: 'background:repeating-linear-gradient(90deg,rgba(255,255,255,.16) 0 1px,transparent 1px 16px),repeating-linear-gradient(0deg,rgba(255,255,255,.16) 0 1px,transparent 1px 16px),linear-gradient(140deg,#2b313a,#424c59)',
  blob: 'background:radial-gradient(circle at 26% 74%,rgba(255,223,120,.55) 0 20%,transparent 21%),radial-gradient(circle at 74% 30%,rgba(255,160,200,.5) 0 18%,transparent 19%),linear-gradient(135deg,#f0f1f3,#dfe3e6)',
};

function mCover(kind, glyph, cls = 'zbt-m-cover') {
  return `<div class="${cls}" style="${M_COVERS[kind] || M_COVERS.circles}"><span>${esc2(glyph || '')}</span></div>`;
}

// Gemeinsamer Rahmen: Kopfleiste + Inhalt
function mShell(active, inner, brand = 'Lernplattform') {
  const nav = M_NAV.map(([id, label]) =>
    `<a href="#" class="${active === id ? 'on' : ''}" data-zbt2="ml-go" data-page="${id}">${label}</a>`).join('');
  return `<div class="zbt-x zbt-m">
  <div class="zbt-m-bar">
    <span class="zbt-m-brand">${MARK_MOODLE}<span>${esc2(brand)}</span></span>
    <nav class="zbt-m-nav">${nav}</nav>
    <div class="zbt-m-bar-r">
      <button type="button" class="zbt-m-ico" data-zbt2="ml-note" data-t="Suche ist in dieser Demo leer." aria-label="Suche">${mIcon.search}</button>
      <button type="button" class="zbt-m-ico" data-zbt2="ml-note" data-t="Keine neuen Mitteilungen." aria-label="Mitteilungen">${mIcon.bell}</button>
      <button type="button" class="zbt-m-ico" data-zbt2="ml-note" data-t="Keine neuen Nachrichten." aria-label="Nachrichten">${mIcon.chat}</button>
      <button type="button" class="zbt-m-ico" data-zbt2="ml-note" data-t="Postfach ist leer." aria-label="Postfach">${mIcon.mail}</button>
      <span class="zbt-m-ava" title="${esc2(mHello())}">${esc2((mHello()[0] || 'G').toUpperCase())}</span>
      <span class="zbt-m-edit">Bearbeiten<i></i></span>
    </div>
  </div>
  ${inner}
</div>`;
}

// Rechte Spalte auf der Kursseite: eigene Notizen (lokal, wie die Notiz-Seite)
function mSidePanel() {
  const notes = ajson(AKEYS.cal, {});
  const key = 'kurs-' + mCourseId;
  const val = notes[key] || '';
  return `<aside class="zbt-m-side">
    <h2>Eigene Notizen</h2>
    <p style="margin:0 0 8px;font-size:12.5px;color:var(--m-muted)">Nur auf diesem Gerät gespeichert.</p>
    <textarea data-zbt2="ml-course-note" data-key="${key}" placeholder="Notizen zum Kurs …" style="width:100%;min-height:120px;resize:vertical;border:1px solid var(--m-border);border-radius:5px;padding:8px;font:13px/1.5 system-ui,sans-serif;color:var(--m-text)">${esc2(val)}</textarea>
    <h2 style="margin-top:16px">Kursmaterial</h2>
    <a href="#" data-zbt2="ml-note" data-t="Nur in der Schulversion verfügbar.">Arbeitsblätter</a>
    <a href="#" data-zbt2="ml-note" data-t="Nur in der Schulversion verfügbar.">Lernkarten</a>
    <a href="#" data-zbt2="ml-note" data-t="Nur in der Schulversion verfügbar.">Klausurvorbereitung</a>
  </aside>`;
}

// --- 1 · Anmeldung ---------------------------------------------------------
function pageMoodleStart() {
  const err = searchState.loginErr ? `<p class="zbt-m-sub" style="color:#a1261b;font-size:13.5px;margin:0 0 12px">Ungültige Anmeldung. Bitte prüfe Anmeldename und Kennwort.</p>` : '';
  return `<div class="zbt-x zbt-m">
  <div class="zbt-m-login">
    <div class="zbt-m-logincard">
      <div class="zbt-m-logo">${MARK_MOODLE}</div>
      ${err}
      <form data-zbt2="ml-login" autocomplete="off">
        <div class="zbt-m-field"><input type="text" name="user" placeholder="Anmeldename" aria-label="Anmeldename" autocomplete="username" spellcheck="false"></div>
        <div class="zbt-m-field"><input type="password" name="pass" placeholder="Kennwort" aria-label="Kennwort" autocomplete="current-password"></div>
        <button type="submit" class="zbt-m-btn">Anmelden</button>
      </form>
      <p style="margin:6px 0 0"><a href="#" data-zbt2="ml-forgot" style="font-size:14px">Kennwort vergessen?</a></p>
      <div class="zbt-m-login-foot">
        <span class="zbt-m-lang">${mIcon.lang} Deutsch (de) <span style="font-size:10px">▾</span></span>
        <button type="button" class="zbt-m-cookie" data-zbt2="ml-note" data-t="Es werden nur technisch notwendige Cookies gesetzt.">Cookie-Hinweis</button>
      </div>
    </div>
  </div>
  <button type="button" class="zbt-m-help" data-zbt2="ml-note" data-t="Hilfe: Anmeldung mit dem Schulkonto oder als Gast." aria-label="Hilfe">?</button>
</div>`;
}

// --- 2 · Dashboard ---------------------------------------------------------
function mCalendarPanel() {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1);
  const shift = (first.getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = 0; i < 35; i++) {
    const idx = i - shift + 1;
    let dd = idx, out = false;
    if (idx < 1) { dd = prevDays + idx; out = true; }
    else if (idx > days) { dd = idx - days; out = true; }
    const today = !out && dd === now.getDate();
    cells.push(`<div style="padding:6px 8px;font-size:13px;color:${out ? '#adb3b9' : '#1d2125'};${today ? 'font-weight:700' : ''}">${dd}</div>`);
  }
  return `<div class="zbt-m-panel">
    <h2>Kalender</h2>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <select class="zbt-m-sel" style="height:38px;border:1px solid var(--m-border);border-radius:5px;padding:0 10px;font:14px system-ui,sans-serif;color:#1d2125;background:#fff"><option>Alle Kurse</option><option>Biologie</option><option>Mathematik</option></select>
      <button type="button" class="zbt-m-btn" style="margin-left:auto" data-zbt2="ml-note" data-t="Termine lassen sich hier nur ansehen.">Neuer Termin</button>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:15px">
      <span style="color:var(--m-blue)">◀ ${MONATE[(m + 11) % 12]}</span>
      <b>${MONATE[m]} ${y}</b>
      <span style="color:var(--m-blue)">${MONATE[(m + 1) % 12]} ▶</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);border:1px solid var(--m-border);border-radius:5px;overflow:hidden">
      ${DOW.map((d) => `<div style="padding:6px 8px;font-size:12px;font-weight:600;background:#f8f9fa;border-bottom:1px solid var(--m-border)">${d}</div>`).join('')}
      ${cells.join('')}
    </div>
  </div>`;
}

function pageMoodleDash() {
  const inner = `<div class="zbt-m-main">
    <h1 class="zbt-m-h1">Dashboard</h1>
    <p class="zbt-m-sub" style="font-size:25px;font-weight:600;margin:0 0 18px">Hallo, ${esc2(mHello())}! 👋</p>
    <div class="zbt-m-panel">
      <h2>Zeitlinie</h2>
      <div class="zbt-m-filters">
        <select><option>Nächste 7 Tage</option><option>Nächste 30 Tage</option><option>Alle</option></select>
        <select><option>Sortiert nach Datum</option><option>Sortiert nach Kurs</option></select>
        <input type="search" placeholder="Suche nach Aktivitätstyp oder Aktivitätsname" aria-label="Aktivitäten suchen">
      </div>
      <div class="zbt-m-empty">${mIcon.empty}Keine Aktivität erfordert ein Handeln</div>
    </div>
    ${mCalendarPanel()}
    <div class="zbt-m-panel">
      <h2>Kursübersicht</h2>
      <div style="display:grid;gap:8px">
        ${M_COURSES.slice(0, 4).map((c) => `<button type="button" class="zbt-m-act" style="border:0;background:none;cursor:pointer;text-align:left;width:100%" data-zbt2="ml-course" data-course="${c.id}">
          ${mCover(c.cover, c.glyph, 'zbt-m-mini')} <span style="color:var(--m-blue)">${esc2(c.name)}</span><small>${esc2(c.teacher)}</small></button>`).join('')}
      </div>
    </div>
  </div>`;
  return mShell('dash', inner);
}

// --- 3 · Meine Kurse -------------------------------------------------------
let mCourseFilter = '';
function pageMoodleKurse() {
  const q = mCourseFilter.toLowerCase();
  const list = M_COURSES.filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.teacher.toLowerCase().includes(q));
  const inner = `<div class="zbt-m-main">
    <h1 class="zbt-m-h1">Meine Kurse</h1>
    <p class="zbt-m-sub">Kursübersicht</p>
    <div class="zbt-m-sep"></div>
    <div class="zbt-m-filters">
      <select><option>Alle</option><option>In Bearbeitung</option><option>Abgeschlossen</option></select>
      <input type="search" placeholder="Suchen" aria-label="Kurse suchen" data-zbt2="ml-filter" value="${esc2(mCourseFilter)}">
      <select><option>Sortiert nach letztem Zugriff</option><option>Sortiert nach Kursnamen</option></select>
      <select><option>Kachel</option><option>Liste</option></select>
    </div>
    <div class="zbt-m-courses">
      ${list.map((c) => `<button type="button" class="zbt-m-course" data-zbt2="ml-course" data-course="${c.id}">
        ${mCover(c.cover, c.glyph)}
        <div class="zbt-m-course-body"><b>${esc2(c.code)}</b><span>${esc2(c.teacher)}</span></div>
        <div class="zbt-m-course-foot"><span class="zbt-m-kebab" aria-hidden="true">⋮</span></div>
      </button>`).join('') || `<div class="zbt-m-empty" style="grid-column:1/-1">${mIcon.empty}Keine Kurse gefunden</div>`}
    </div>
  </div>`;
  return mShell('kurse', inner);
}

// --- 4 · Kursseite ---------------------------------------------------------
let mCourseId = 'bio';
function pageMoodleKurs(courseId) {
  const c = M_COURSES.find((x) => x.id === (courseId || mCourseId)) || M_COURSES[2];
  mCourseId = c.id;
  const sec = (title, rows) => `<div class="zbt-m-sec"><h2>${esc2(title)}</h2><div class="zbt-m-panel" style="padding:0">${rows}</div></div>`;
  const act = (icon, label, note) => `<div class="zbt-m-act">${icon}<span>${esc2(label)}</span><small>${esc2(note)}</small></div>`;
  const inner = `<div class="zbt-m-main">
    <div class="zbt-m-crumb"><a href="#" data-zbt2="ml-go" data-page="kurse">Meine Kurse</a> · ${esc2(c.name)}</div>
    <div class="zbt-m-course-head">
      ${mCover(c.cover, c.glyph)}
      <div><h1 class="zbt-m-h1" style="font-size:24px;margin:0 0 2px">${esc2(c.name)} · ${esc2(c.code)}</h1>
      <div style="color:var(--m-muted);font-size:14px">${esc2(c.teacher)} · Raum ${esc2(c.room)}</div></div>
    </div>
    <div class="zbt-m-tabs"><span class="on">Kurs</span><span>Einstellungen</span><span>Teilnehmer/innen</span><span>Bewertungen</span><span>Mehr ▾</span></div>
    ${sec('Allgemeines', act(mIcon.forum, 'Ankündigungen', 'Forum') + act(mIcon.file, 'Organisatorisches (PDF)', 'Datei'))}
    ${sec('Vergangene Woche', act(mIcon.doc, 'Arbeitsblatt 4 – Vertiefung', 'Aufgabe · fällig letzte Woche') + act(mIcon.file, 'Zusammenfassung', 'Datei · 240 KB'))}
    ${sec('Aktuelle Woche', act(mIcon.doc, 'Arbeitsblatt 5 – Übungen', 'Aufgabe · fällig Freitag') + act(mIcon.link, 'Material zum Nachlesen', 'Link') + act(mIcon.video, 'Erklärvideo (12 Min.)', 'Video'))}
    ${sec('Nächste Woche', act(mIcon.quiz, 'Kurztest', 'Test · 15 Minuten') + act(mIcon.task, 'Hausaufgaben abgeben', 'Aufgabe'))}
    <div class="zbt-m-panel"><h2>Lernfortschritt</h2>
      <div style="height:10px;background:#e8ebee;border-radius:99px;overflow:hidden"><div style="height:100%;width:62%;background:var(--m-blue)"></div></div>
      <p style="margin:8px 0 0;font-size:13px;color:var(--m-muted)">62 % der Aktivitäten angesehen</p>
    </div>
    ${mSidePanel()}
  </div>`;
  return mShell('kurse', inner);
}

// ===========================================================================
// Look „Zockbox“ – Startseite im Look dieser Seite (Papier, feine Linien)
// ===========================================================================
const Z_GAMES = [
  ['Mach\u2019s Meme', 'caption', 'Alle bekommen dieselbe Vorlage – die witzigste Caption gewinnt.',
    '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="12" width="50" height="36" rx="6"/><path d="M15 22h26M15 29h34M15 36h18"/><path d="M15 48l6 6v-6"/><circle cx="47" cy="39" r="3"/></svg>'],
  ['Wikirennen', 'wiki', 'Von „Pizza“ zu „Mond“ – nur über Links. Wer ist zuerst am Ziel?',
    '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 46 26 27l14 9 12-21"/><circle cx="12" cy="46" r="4"/><circle cx="26" cy="27" r="4"/><circle cx="40" cy="36" r="4"/><circle cx="52" cy="15" r="4"/></svg>'],
  ['Kritzel-Duell', 'draw', 'Einer zeichnet, alle raten. Wer es zuerst erkennt, holt die Punkte.',
    '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 45c8-24 15-28 21-14s12 14 18-6 8-12 8-12"/><path d="M46 10l10 2-3 10" opacity=".5"/><circle cx="9" cy="45" r="2.5"/></svg>'],
  ['Krakelpost', 'post', 'Stille Post mit Zeichnen: Satz wird Bild, Bild wird Satz.',
    '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="10" width="30" height="19" rx="3"/><rect x="26" y="35" width="30" height="19" rx="3"/><path d="M14 17h16M14 22h10M32 42h16M32 47h10"/><path d="M38 29v4m0 0-3-3m3 3 3-3"/></svg>'],
];

function pageZockStart() {
  const games = Z_GAMES.map(([name, cls, desc, art], i) => `<button type="button" class="zbt-z-card zc-${cls}" data-zbt2="ml-note" data-t="Hier geht es nur um die Optik – zurück mit der Panik-Taste.">
    <span class="zbt-z-shot">${art}</span><b>${esc2(name)}</b><p>${esc2(desc)}</p></button>`).join('');
  return `<div class="zbt-x zbt-z">
  <div class="zbt-z-top">
    <span class="zbt-z-logo">Z</span><span class="zbt-z-name">Zockbox</span>
    <span class="zbt-z-sub">Browser-Spiele ohne Anmeldung</span>
    <span class="zbt-z-nav"><a>Spiele</a><a>So geht's</a><a>Profil</a></span>
  </div>
  <div class="zbt-z-main">
    <div class="zbt-z-stamps"><span class="zbt-z-stamp">Vier Spiele</span><span class="zbt-z-stamp on">Kostenlos · ohne Konto</span></div>
    <h1 class="zbt-z-h1">Spiele mit Freunden.<br><em>Direkt im Browser.</em></h1>
    <p class="zbt-z-lead">Lobby erstellen, Code teilen, losspielen. Kein Konto, kein Download – die Verbindung läuft direkt zwischen euren Geräten.</p>
    <div class="zbt-z-sec"><h2>Spiele</h2><span>Gruppengröße nach Gerät &amp; Spieldynamik</span></div>
    <div class="zbt-z-grid">${games}</div>
    <div class="zbt-z-foot"><span>Zockbox · made by Oskar</span><span>Verbunden über WebRTC · keine Anmeldung</span></div>
  </div>
</div>`;
}

const RENDER = {
  suche: pageSuche, lexikon: pageLexikon, dokument: pageDokument,
  'moodle-start': pageMoodleStart, 'moodle-dash': pageMoodleDash,
  'moodle-kurse': pageMoodleKurse, 'moodle-kurs': () => pageMoodleKurs(),
  'zock-start': pageZockStart,
};

// ---------------------------------------------------------------------------
// Overlay
// ---------------------------------------------------------------------------
let ov = null, backBtn = null, previewBar = null;
let mutedMedia = [];
let lastBackTap = 0;

// Inhalt der Tarnseite tauschen (z. B. Suche → Ergebnisse → Lexikon-Artikel), ohne das Overlay neu aufzubauen.
function applyLook(pageId) {
  if (!ov) return;
  const p = pageById(pageId) || PAGES[0];
  ov.className = 'zbt-ov look-' + p.look;
  ov.dataset.look = p.look;
}

function setOverlayContent(pageId, html, title) {
  ov.dataset.page = pageId;
  applyLook(pageId);
  ov.innerHTML = html;
  ov.appendChild(backBtn);
  ov.scrollTop = 0;
  overlayTitle = title;
  applyTab();
}

function onOverlayClick(e) {
  const t = e.target.closest('[data-zbt], [data-zbt-open]');
  if (!t || !ov.contains(t)) return;
  const act = t.dataset.zbt;
  const form = t.closest('form');
  const q = form && form.q ? form.q.value.trim() : '';
  if (t.dataset.zbtOpen === 'lexikon') { e.preventDefault(); setOverlayContent('lexikon', pageLexikon(), PAGES[1].title); return; }
  if (act === 'home') { searchState = { q: S.term || 'photosynthese', page: 1, tab: 'Alle', onlyLex: false }; setOverlayContent('suche', searchHome(), 'Suche'); return; }
  if (act === 'lucky') { e.preventDefault(); if (q) runSearch(q); else setOverlayContent('lexikon', pageLexikon(), PAGES[1].title); return; }
  if (act === 'go') { if (q) runSearch(q); return; }
  if (act === 'clear') { form.q.value = ''; form.q.focus(); return; }
  if (act === 'qa') { t.parentElement.classList.toggle('open'); }
}

function runSearch(q, keepState = false) {
  const query = String(q || '').slice(0, 200);
  if (!keepState) { addHistory(query); searchState = { q: query, page: 1, tab: 'Alle', onlyLex: false }; }
  setOverlayContent('suche', searchResults(query, searchState), `${query.slice(0, 60)} – Suche`);
}

function buildOverlay(pageId) {
  injectCSS();
  ov = document.createElement('div');
  ov.className = 'zbt-ov';
  ov.id = 'zbTarnOverlay';
  ov.setAttribute('role', 'document');
  backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'zbt-back';
  backBtn.setAttribute('aria-label', 'Zurück (zweimal tippen)');
  backBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastBackTap < (S.delay || DOUBLE_MS)) { lastBackTap = 0; hide(); } else lastBackTap = now;
  });
  const p = PAGES.find((x) => x.id === pageId) || PAGES[0];
  const render = RENDER[pageId] || pageSuche;
  setOverlayContent(pageId, render(), p.title);
  // Bedienung der Tarnseiten (nur Attrappen, nichts verlässt die Seite)
  ov.addEventListener('click', onOverlayClick);
  ov.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.dataset.zbt === 'search') { const q = f.q.value.trim(); if (q) runSearch(q); }
  });
  // Erweiterte Tarnseiten: eigene, delegierte Bedienung
  ov.addEventListener('click', onOverlayExtraClick);
  ov.addEventListener('submit', onOverlayExtraSubmit);
  ov.addEventListener('input', onOverlayExtraInput);
  ov.addEventListener('change', onOverlayExtraChange);
  ov.addEventListener('scroll', () => {
    const ta = ov.querySelector('[data-zbt2="code-text"]');
    if (ta) syncGutter(ta);
  }, true);
  // Tastatureingaben im Overlay nicht an das Spiel darunter weiterreichen
  ['keydown', 'keyup', 'keypress', 'input'].forEach((t) => ov.addEventListener(t, (e) => e.stopPropagation()));
  document.body.appendChild(ov);
}

function show(pageId = S.page, { preview = false } = {}) {
  if (ov) removeOverlay();
  if (preview) pagePreview = pageId; else { panic = true; bumpCount('key'); }
  try { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); } catch (e) {}
  buildOverlay(pageId);
  document.documentElement.classList.add('zbt-lock');
  // laufende Medien stummschalten (Spiel läuft weiter)
  if (S.media) {
    mutedMedia = [...document.querySelectorAll('audio, video')].filter((m) => !m.muted);
    mutedMedia.forEach((m) => { m.muted = true; });
  } else mutedMedia = [];
  if (preview) {
    previewBar = document.createElement('div');
    previewBar.className = 'zbt-preview-bar';
    previewBar.innerHTML = '<span>Vorschau der Tarnseite</span><button type="button">Schließen</button>';
    previewBar.querySelector('button').onclick = () => hide();
    document.body.appendChild(previewBar);
  }
  ov.scrollTop = 0;
  applyTab();
  updateFab();
  window.dispatchEvent(new CustomEvent('zb-tarnung', { detail: { active: true, page: pageId, preview, pages: PAGES.length } }));
}

function removeOverlay() {
  if (ov) ov.remove();
  if (previewBar) previewBar.remove();
  ov = null; backBtn = null; previewBar = null; overlayTitle = null;
}

function hide() {
  const was = panic || pagePreview;
  removeOverlay();
  panic = false; pagePreview = null;
  document.documentElement.classList.remove('zbt-lock');
  mutedMedia.forEach((m) => { m.muted = false; });
  mutedMedia = [];
  applyTab();
  updateFab();
  if (was) window.dispatchEvent(new CustomEvent('zb-tarnung', { detail: { active: false } }));
}

function toggle() { if (panic || pagePreview) hide(); else if (S.on) show(S.page); }

// ---------------------------------------------------------------------------
// Panik-Taste (zweimal schnell drücken)
// ---------------------------------------------------------------------------
let lastKey = 0;
let recording = null; // Callback, wenn gerade eine neue Taste aufgenommen wird
let handled = null;

function onKey(e) {
  if (handled === e) return;
  handled = e;
  if (recording) return;
  if (e.repeat) return;

  // Schnellwechsel: Alt + 1…9 öffnet/wechselt eine Tarnseite, Alt + →/← blättert.
  if (e.altKey && !e.ctrlKey && !e.metaKey) {
    if (/^[1-9]$/.test(e.key)) {
      if (!S.on && !pagePreview) return;
      e.preventDefault(); e.stopPropagation();
      switchPage(Number(e.key) - 1, (panic || pagePreview) ? 'switch' : 'panic');
      return;
    }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && (panic || pagePreview)) {
      e.preventDefault(); e.stopPropagation();
      const n = visiblePages(S.look).length;
      switchPage((activePageIndex() + (e.key === 'ArrowRight' ? 1 : n - 1)) % n, 'switch');
      return;
    }
  }

  if (!S.on && !pagePreview) return;
  if (!matchesSpec(e, S.key)) { lastKey = 0; return; }
  const now = Date.now();
  if (S.single) { lastKey = 0; e.preventDefault(); toggle(); return; }
  if (now - lastKey < (S.delay || DOUBLE_MS)) {
    lastKey = 0; e.preventDefault(); toggle();
  } else lastKey = now;
}

// ---------------------------------------------------------------------------
// Schwebender Panik-Knopf (nur Touch-Geräte)
// ---------------------------------------------------------------------------
let fab = null;
const isTouch = () => { try { return matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0; } catch (e) { return false; } };

// Ein kleiner Knopf unten links, in beiden Richtungen:
//   Spiel sichtbar  → Tarnseite einblenden
//   Tarnseite offen → sofort zurück ins Spiel (ein Tipp, kein Doppeltippen)
const FAB_EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 12c2.5-4 5.5-6 9-6s6.5 2 9 6c-2.5 4-5.5 6-9 6s-6.5-2-9-6z"/><circle cx="12" cy="12" r="2.6"/></svg>';
const FAB_BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 5 4 11l6 6"/><path d="M4 11h9.5a6 6 0 0 1 0 12"/></svg>';

function updateFab() {
  const active = panic || pagePreview;
  const want = S.fab && isTouch() && document.body && (S.on || active);
  if (want && !fab) {
    injectCSS();
    fab = document.createElement('button');
    fab.type = 'button';
    fab.id = 'zbTarnFab';
    fab.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (panic || pagePreview) hide(); else show(S.page);
    });
    document.body.appendChild(fab);
  }
  if (!want && fab) { fab.remove(); fab = null; }
  if (fab) {
    fab.className = 'zbt-fab' + (active ? ' zbt-fab-back' : '');
    fab.setAttribute('aria-label', active ? 'Zurück ins Spiel' : 'Tarnseite einblenden');
    fab.title = active ? 'Zurück ins Spiel' : 'Tarnseite einblenden';
    const html = active ? FAB_BACK : FAB_EYE;
    if (fab.dataset.icon !== (active ? 'back' : 'eye')) {
      fab.dataset.icon = active ? 'back' : 'eye';
      fab.innerHTML = html;
    }
  }
}

// ---------------------------------------------------------------------------
// Einstellungen speichern (auch von außen nutzbar)
// ---------------------------------------------------------------------------
export function getSettings() { return { ...S }; }

// Look wechseln: Titel, Symbol und die Auswahl der Seiten ziehen gemeinsam um.
export function setLook(id) {
  const l = lookById(id);
  const prevLook = S.look;
  set(KEYS.look, l.id);
  // Seite im neuen Look: gleiche Art, wenn es sie gibt, sonst die erste des Looks
  const cur = pageById(S.page);
  const same = cur && visiblePages(l.id).find((p) => p.id === cur.id);
  const next = same ? same.id : firstPageOf(l.id);
  set(KEYS.page, next);
  S = readState();
  applyTab(); updateFab();
  if (prevLook !== l.id && (panic || pagePreview) && ov) {
    setOverlayContent(S.page, (RENDER[S.page] || pageSuche)(), (pageById(S.page) || {}).title);
  }
  window.dispatchEvent(new CustomEvent('zb-tarnung-config', { detail: { on: S.on, look: S.look } }));
  if (ui) ui.render();
  return S.look;
}

export function setSetting(name, value) {
  if (!(name in KEYS)) return;
  const BOOL = ['on', 'fab', 'single', 'auto', 'schedule', 'media'];
  const v = BOOL.includes(name) ? (value ? '1' : '0') : String(value);
  if (name === 'page') {
    const p = pageById(v);
    if (!p) return;
    set(KEYS.page, p.id);
    set(KEYS.look, p.look);          // Seite und Look bleiben immer zusammen
  } else {
    set(KEYS[name], v);
  }
  S = readState();
  if (!S.on && panic) hide();
  applyTab(); updateFab();
  if (S.auto) armAuto(); else cancelAuto();
  window.dispatchEvent(new CustomEvent('zb-tarnung-config', { detail: { on: S.on, look: S.look } }));
  if (ui) ui.render();
}
export const showPanic = (page) => show(page || S.page);
export const hidePanic = hide;
export const previewPage = (page) => show(page, { preview: true });
export const isPanic = () => panic;

// andere Tabs (z. B. ein offenes Spiel) übernehmen Änderungen sofort
window.addEventListener('storage', (e) => {
  if (!e.key || !e.key.startsWith('zb_tarn_')) return;
  S = readState();
  if (!S.on && panic) hide();
  applyTab(); updateFab();
  if (S.auto) armAuto(); else cancelAuto();
  if (ui) ui.render();
});

// ---------------------------------------------------------------------------
// Einstellungs-Oberfläche (nur dort, wo #zbTarnSettings existiert – also auf der Startseite)
// ---------------------------------------------------------------------------
let ui = null;

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
function init() {
  installAdvanced();
  S = readState();
  injectCSS();
  // capture: Panik-Taste greift auch, wenn das Spiel Tasten selbst abfängt
  window.addEventListener('keydown', (e) => {
    if (recording) { recording(e); return; }
    onKey(e);
  }, true);
  // Tastatureingaben für die Tarnseiten kommen am Fenster an (das Overlay selbst
  // hat keinen Fokus), deshalb hier in der Capture-Phase abfangen.
  window.addEventListener('keydown', (e) => { if (ov) onOverlayExtraKey(e); }, true);
  watchTitle();
  applyTab();
  updateFab();

  // Automatische Tarnung, wenn der Tab verlassen oder der Fokus verloren wird.
  window.addEventListener('blur', armAuto);
  window.addEventListener('focus', cancelAuto);
  document.addEventListener('visibilitychange', () => { if (document.hidden) armAuto(); else cancelAuto(); });
  setInterval(() => { if (ui && S.schedule) ui.render(); }, 60000);
  window.addEventListener('zb-tarnung-stat', () => { if (ui) ui.render(); });

  const root = document.getElementById('zbTarnSettings');
  if (root) mountAdvancedSettings(root);
  window.zbTarnung = {
    show: showPanic, hide, preview: previewPage, get: getSettings, set: setSetting, setLook, isPanic,
    looks: () => LOOKS.map((l) => ({ id: l.id, label: l.label, title: l.title })),
    look: () => S.look,
    pages: () => visiblePages(S.look).map((p) => ({ id: p.id, label: p.label, title: p.title, look: p.look })),
    switchTo: (id) => { const i = PAGES.findIndex((p) => p.id === id); if (i >= 0) switchPage(i, (panic || pagePreview) ? 'switch' : 'panic'); },
    settings: exportConfig, reset: resetConfig,
    count: () => Number(get(KEYS.count, '0') || 0),
  };
}

// Mikrotask: erst nach Auswertung des gesamten Moduls starten (die Erweiterungen
// weiter unten müssen dafür initialisiert sein).
Promise.resolve().then(() => {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
});

// ===========================================================================
// ERWEITERTER TARNMODUS
// ---------------------------------------------------------------------------
// Ergänzt die drei klassischen Tarnseiten um fünf weitere, vollständig
// bedienbare Anwendungen (Taschenrechner, Kalender, Notizen, Editor, Tabelle),
// um zusätzliche Auslöser (Auto-Tarnung, Zeitfenster, Schnellwechsel) und um
// eine ausführliche Einstellungs-Oberfläche mit Import/Export und Statistik.
//
// Auch hier gilt: keine echten Logos, keine echten Markennamen, keine
// nachgebauten Schriftzüge. Alle Inhalte sind selbst geschrieben/gezeichnet.
// ===========================================================================

const EXTRA_KEYS = {
  delay: 'zb_tarn_delay', single: 'zb_tarn_single', auto: 'zb_tarn_auto',
  autoMs: 'zb_tarn_auto_ms', schedule: 'zb_tarn_schedule',
  from: 'zb_tarn_from', to: 'zb_tarn_to', term: 'zb_tarn_term',
  docName: 'zb_tarn_doc_name', media: 'zb_tarn_media',
  count: 'zb_tarn_count', last: 'zb_tarn_last',
};

const AKEYS = {
  notes: 'zb_tarn_notes', cal: 'zb_tarn_cal_notes', doc: 'zb_tarn_doc_html',
  code: 'zb_tarn_code', sheet: 'zb_tarn_sheet', history: 'zb_tarn_history',
  calcHist: 'zb_tarn_calc_hist',
};

const ajson = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const asave = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const esc2 = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const EXTRA_CSS = `
/* ===== Erweiterte Tarnung: gemeinsame App-Oberfläche ===== */
#zbTarnOverlay .zbt-x{min-height:100%;background:#f5f6f7;color:#202124;display:flex;flex-direction:column;
  font:14px/1.55 Arial,Helvetica,sans-serif}
#zbTarnOverlay .zbt-x-head{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:12px;
  padding:9px 18px;background:#fff;border-bottom:1px solid #dadce0}
#zbTarnOverlay .zbt-x-ic{width:26px;height:26px;flex:none;display:grid;place-items:center;border-radius:5px;background:#eef1f5}
#zbTarnOverlay .zbt-x-ic svg{width:20px;height:20px}
#zbTarnOverlay .zbt-x-title{font-size:16px;color:#202124;font-weight:500;white-space:nowrap}
#zbTarnOverlay .zbt-x-sub{font-size:12px;color:#70757a;margin-left:2px}
#zbTarnOverlay .zbt-x-actions{margin-left:auto;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
#zbTarnOverlay .zbt-btn{height:30px;padding:0 11px;border:1px solid #dadce0;border-radius:5px;background:#fff;
  color:#3c4043;font:13px Arial,sans-serif;cursor:pointer}
#zbTarnOverlay .zbt-btn:hover{background:#f1f3f4;border-color:#bdc1c6}
#zbTarnOverlay .zbt-btn.pri{background:#1a73e8;border-color:#1a73e8;color:#fff}
#zbTarnOverlay .zbt-btn.pri:hover{background:#1765cc}
#zbTarnOverlay .zbt-btn.on{background:#e8f0fe;border-color:#1a73e8;color:#174ea6}
#zbTarnOverlay .zbt-sel{height:30px;padding:0 8px;border:1px solid #dadce0;border-radius:5px;background:#fff;
  color:#3c4043;font:13px Arial,sans-serif}
#zbTarnOverlay .zbt-x-body{flex:1;padding:20px;min-width:0}
#zbTarnOverlay .zbt-x-foot{padding:8px 18px;border-top:1px solid #dadce0;background:#fff;color:#70757a;font-size:12px;
  display:flex;gap:16px;flex-wrap:wrap}
#zbTarnOverlay .zbt-panel{background:#fff;border:1px solid #dadce0;border-radius:8px;overflow:hidden}
#zbTarnOverlay .zbt-empty{padding:22px;color:#70757a;font-size:13px;text-align:center}

/* ===== Taschenrechner ===== */
#zbTarnOverlay .zbt-calc-wrap{max-width:420px;margin:0 auto;display:grid;gap:12px}
#zbTarnOverlay .zbt-calc-display{background:#fff;border:1px solid #dadce0;border-radius:8px;padding:16px 18px;min-height:104px;
  display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-end;text-align:right}
#zbTarnOverlay .zbt-calc-expr{font-size:15px;color:#70757a;word-break:break-all;min-height:22px}
#zbTarnOverlay .zbt-calc-res{font-size:34px;line-height:1.2;color:#202124;word-break:break-all;font-weight:400}
#zbTarnOverlay .zbt-calc-pad{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
#zbTarnOverlay .zbt-calc-pad button{height:52px;border:1px solid #dadce0;border-radius:7px;background:#fff;
  font:18px Arial,sans-serif;color:#202124;cursor:pointer}
#zbTarnOverlay .zbt-calc-pad button:hover{background:#f1f3f4}
#zbTarnOverlay .zbt-calc-pad button:active{background:#e8eaed}
#zbTarnOverlay .zbt-calc-pad button.fn{background:#f8f9fa;color:#3c4043;font-size:16px}
#zbTarnOverlay .zbt-calc-pad button.op{background:#e8f0fe;color:#174ea6}
#zbTarnOverlay .zbt-calc-pad button.eq{background:#1a73e8;border-color:#1a73e8;color:#fff}
#zbTarnOverlay .zbt-calc-pad button.eq:hover{background:#1765cc}
#zbTarnOverlay .zbt-calc-hist{font-size:12px;color:#70757a;min-height:20px;text-align:right}
#zbTarnOverlay .zbt-calc-more{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
#zbTarnOverlay .zbt-calc-more button{height:30px;border:1px solid #dadce0;border-radius:5px;background:#fff;
  font:13px Arial,sans-serif;color:#3c4043;cursor:pointer}

/* ===== Kalender ===== */
#zbTarnOverlay .zbt-cal{max-width:940px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:16px}
#zbTarnOverlay .zbt-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:#dadce0;
  border:1px solid #dadce0;border-radius:8px;overflow:hidden}
#zbTarnOverlay .zbt-cal-dow{background:#f8f9fa;padding:8px 4px;text-align:center;font-size:11px;color:#70757a;
  text-transform:uppercase;letter-spacing:.06em}
#zbTarnOverlay .zbt-cal-cell{background:#fff;min-height:76px;padding:6px;border:0;text-align:left;cursor:pointer;
  font:13px Arial,sans-serif;color:#202124;display:flex;flex-direction:column;gap:4px}
#zbTarnOverlay .zbt-cal-cell:hover{background:#f1f3f4}
#zbTarnOverlay .zbt-cal-cell.out{color:#bdc1c6;background:#fafafa}
#zbTarnOverlay .zbt-cal-cell.today b{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#1a73e8;color:#fff}
#zbTarnOverlay .zbt-cal-cell.sel{background:#e8f0fe;box-shadow:inset 0 0 0 2px #1a73e8}
#zbTarnOverlay .zbt-cal-cell .dot{width:5px;height:5px;border-radius:50%;background:#1a73e8}
#zbTarnOverlay .zbt-cal-cell .mini{font-size:10.5px;color:#70757a;line-height:1.25;max-height:26px;overflow:hidden}
#zbTarnOverlay .zbt-cal-side{background:#fff;border:1px solid #dadce0;border-radius:8px;padding:14px;display:flex;flex-direction:column;gap:8px}
#zbTarnOverlay .zbt-cal-side h2{margin:0;font:500 15px Arial,sans-serif;color:#202124}
#zbTarnOverlay .zbt-cal-side textarea{width:100%;min-height:150px;resize:vertical;border:1px solid #dadce0;border-radius:5px;
  padding:8px;font:13px/1.5 Arial,sans-serif;color:#202124;outline:0}
#zbTarnOverlay .zbt-cal-side textarea:focus{border-color:#1a73e8}
#zbTarnOverlay .zbt-cal-side small{color:#70757a;font-size:11px}
@media (max-width:760px){#zbTarnOverlay .zbt-cal{grid-template-columns:minmax(0,1fr)}#zbTarnOverlay .zbt-cal-cell{min-height:54px}}

/* ===== Notizen ===== */
#zbTarnOverlay .zbt-notes{max-width:960px;margin:0 auto;display:grid;grid-template-columns:240px minmax(0,1fr);
  gap:0;background:#fff;border:1px solid #dadce0;border-radius:8px;overflow:hidden;min-height:460px}
#zbTarnOverlay .zbt-notes-list{border-right:1px solid #dadce0;background:#f8f9fa;display:flex;flex-direction:column}
#zbTarnOverlay .zbt-notes-list .top{padding:10px;border-bottom:1px solid #e8eaed;display:flex;gap:6px}
#zbTarnOverlay .zbt-notes-list .items{overflow:auto;flex:1;padding:6px}
#zbTarnOverlay .zbt-notes-list button.item{width:100%;display:block;text-align:left;border:0;border-radius:5px;
  background:transparent;padding:9px 10px;margin-bottom:3px;cursor:pointer;font:13px/1.35 Arial,sans-serif;color:#202124}
#zbTarnOverlay .zbt-notes-list button.item:hover{background:#eef1f5}
#zbTarnOverlay .zbt-notes-list button.item.on{background:#e8f0fe;color:#174ea6}
#zbTarnOverlay .zbt-notes-list button.item small{display:block;color:#70757a;font-size:11px;margin-top:2px}
#zbTarnOverlay .zbt-notes-edit{display:flex;flex-direction:column;padding:16px;gap:10px;min-width:0}
#zbTarnOverlay .zbt-notes-edit input{border:0;border-bottom:1px solid #dadce0;padding:6px 2px;font:500 20px Arial,sans-serif;
  color:#202124;outline:0;width:100%}
#zbTarnOverlay .zbt-notes-edit textarea{flex:1;min-height:280px;border:0;outline:0;resize:none;
  font:14px/1.6 Arial,sans-serif;color:#3c4043;width:100%}
#zbTarnOverlay .zbt-notes-edit .meta{font-size:11px;color:#70757a;display:flex;justify-content:space-between;gap:10px}
@media (max-width:700px){#zbTarnOverlay .zbt-notes{grid-template-columns:130px minmax(0,1fr)}}

/* ===== Editor ===== */
#zbTarnOverlay .zbt-code{max-width:980px;margin:0 auto;background:#fff;border:1px solid #dadce0;border-radius:8px;overflow:hidden}
#zbTarnOverlay .zbt-code-bar{display:flex;align-items:center;gap:8px;padding:7px 12px;background:#f8f9fa;border-bottom:1px solid #e8eaed;flex-wrap:wrap}
#zbTarnOverlay .zbt-code-bar span{font-size:12px;color:#70757a}
#zbTarnOverlay .zbt-code-edit{display:grid;grid-template-columns:52px minmax(0,1fr);height:min(62vh,560px);background:#fbfbfc}
#zbTarnOverlay .zbt-code-gutter{margin:0;padding:12px 8px;text-align:right;background:#f1f3f4;border-right:1px solid #e8eaed;
  color:#9aa0a6;font:13px/1.55 'Courier New',monospace;overflow:hidden;white-space:pre;user-select:none}
#zbTarnOverlay .zbt-code-edit textarea{border:0;outline:0;resize:none;padding:12px;width:100%;height:100%;
  background:transparent;color:#202124;font:13px/1.55 'Courier New',monospace;white-space:pre;tab-size:2}

/* ===== Tabelle ===== */
#zbTarnOverlay .zbt-sheet{max-width:1000px;margin:0 auto;background:#fff;border:1px solid #dadce0;border-radius:8px;overflow:auto}
#zbTarnOverlay .zbt-sheet table{border-collapse:collapse;width:100%;table-layout:fixed;min-width:620px}
#zbTarnOverlay .zbt-sheet th,#zbTarnOverlay .zbt-sheet td{border-right:1px solid #e8eaed;border-bottom:1px solid #e8eaed;
  height:32px;padding:0;font:13px Arial,sans-serif}
#zbTarnOverlay .zbt-sheet th{background:#f8f9fa;color:#70757a;font-weight:500;text-align:center;font-size:12px}
#zbTarnOverlay .zbt-sheet th.rowh{width:38px;background:#f1f3f4}
#zbTarnOverlay .zbt-sheet td input{width:100%;height:100%;border:0;outline:0;padding:4px 7px;background:transparent;
  font:13px Arial,sans-serif;color:#202124}
#zbTarnOverlay .zbt-sheet td input:focus{box-shadow:inset 0 0 0 2px #1a73e8;background:#fff}
#zbTarnOverlay .zbt-sheet td.formula input{color:#174ea6;background:#f3f8ff}
#zbTarnOverlay .zbt-sheet-cap{padding:8px 12px;font-size:12px;color:#70757a;border-top:1px solid #e8eaed;background:#fafafa}

/* ===== Dokument: Statusleiste ===== */
#zbTarnOverlay .zbt-d-status{display:flex;align-items:center;gap:12px;padding:5px 18px;background:#f8f9fa;
  border-bottom:1px solid #dadce0;font-size:11.5px;color:#70757a}
#zbTarnOverlay .zbt-d-tools button.on{background:#d2e3fc}
#zbTarnOverlay .zbt-d-tools button[data-zbt2]{cursor:pointer}

/* ===== Suche: Verlauf / Filter ===== */
#zbTarnOverlay .zbt-r-tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:8px 0 0 180px;font-size:12px;color:#70757a}
#zbTarnOverlay .zbt-r-tools .zbt-fbtn{padding:4px 9px;border:1px solid #dadce0;border-radius:14px;background:#fff;
  font:12px Arial,sans-serif;color:#5f6368;cursor:pointer}
#zbTarnOverlay .zbt-r-tools .zbt-fbtn.on{background:#e8f0fe;border-color:#1a73e8;color:#174ea6}
#zbTarnOverlay .zbt-r-tools .zbt-h{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
#zbTarnOverlay .zbt-r-tools .zbt-h a{color:#1a0dab;cursor:pointer}
#zbTarnOverlay .zbt-r-tabs span[data-zbt2]{cursor:pointer}
#zbTarnOverlay .zbt-r-pages a[data-zbt2]{cursor:pointer}
#zbTarnOverlay .zbt-s-hist{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:22px;font-size:13px;color:#70757a}
#zbTarnOverlay .zbt-s-hist a{color:#1a0dab;cursor:pointer}
@media (max-width:860px){#zbTarnOverlay .zbt-r-tools{padding:8px 16px 0}}

/* ===== Lexikon: Suchtreffer ===== */
#zbTarnOverlay .zbt-v-hits{background:#fff;border:1px solid #a2a9b1;padding:10px 14px;margin:10px 0 0;font-size:13px}
#zbTarnOverlay .zbt-v-hits a{display:block;padding:4px 0;cursor:pointer}
#zbTarnOverlay .zbt-v-toc li a[data-zbt2]{cursor:pointer}
#zbTarnOverlay .zbt-v-body h2[data-sec]{scroll-margin-top:70px}

/* ===== Drucken: nur die Tarnseite ===== */
@media print {
  html.zbt-lock body > *:not(#zbTarnOverlay) { display:none!important }
  html.zbt-lock,html.zbt-lock body { overflow:visible!important;position:static!important;height:auto!important }
  #zbTarnOverlay { position:static!important;z-index:auto!important;overflow:visible!important;height:auto!important;inset:auto!important }
  .zbt-back,.zbt-fab,.zbt-preview-bar { display:none!important }
  #zbTarnOverlay .zbt-d-head,#zbTarnOverlay .zbt-x-head,#zbTarnOverlay .zbt-v-toc { position:static!important }
  #zbTarnOverlay .zbt-d-page { box-shadow:none!important;min-height:0!important }
}
`;

function extraCSS() { return EXTRA_CSS; }

// ---------------------------------------------------------------------------
// Zusätzliche Symbole / Tarnseiten / Tab-Vorlagen
// ---------------------------------------------------------------------------
function advIcons() {
  return {
    kalender: svgUrl('<rect x="3" y="5" width="26" height="24" rx="3" fill="#fff" stroke="#5f6368" stroke-width="1.6"/><path d="M3 11h26" stroke="#1a73e8" stroke-width="4"/><g fill="#5f6368"><rect x="7" y="15" width="4" height="4" rx="1"/><rect x="14" y="15" width="4" height="4" rx="1"/><rect x="21" y="15" width="4" height="4" rx="1"/><rect x="7" y="22" width="4" height="4" rx="1"/><rect x="14" y="22" width="4" height="4" rx="1"/></g>'),
    notizen: svgUrl('<rect x="5" y="3" width="22" height="26" rx="3" fill="#f6c945"/><rect x="5" y="3" width="22" height="6" rx="3" fill="#e0a92a"/><path d="M9 14h14M9 19h14M9 24h9" stroke="#7a5a10" stroke-width="2" stroke-linecap="round"/>'),
    code: svgUrl('<rect x="2" y="5" width="28" height="22" rx="3" fill="#2b313a"/><path d="M11 12 7 16l4 4M21 12l4 4-4 4M18 10l-4 12" stroke="#9fd0ff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
    tabelle: svgUrl('<rect x="3" y="4" width="26" height="24" rx="2" fill="#fff" stroke="#5f6368" stroke-width="1.6"/><path d="M3 11h26M3 18h26M12 4v24M21 4v24" stroke="#5f6368" stroke-width="1.4"/><rect x="3" y="4" width="9" height="7" fill="#cfe3c6"/>'),
    mail: svgUrl('<rect x="2" y="7" width="28" height="18" rx="3" fill="#fff" stroke="#5f6368" stroke-width="1.6"/><path d="M3 9l13 10L29 9" stroke="#1a73e8" stroke-width="2" fill="none"/>'),
  };
}

function installAdvanced() {
  Object.assign(KEYS, EXTRA_KEYS);
  const ic = advIcons();
  Object.assign(ICONS, ic);
  // Symbole der Seiten ergänzen (Kalender, Editor, Tabelle, Postfach)
  const pageIcon = (id, icon) => { const p = pageById(id); if (p && !p.icon) p.icon = icon; };
  pageIcon('kalender', ic.kalender);
  pageIcon('code', ic.code);
  pageIcon('tabelle', ic.tabelle);
  pageIcon('mail', ic.mail);
  Object.assign(RENDER, {
    rechner: pageRechner, kalender: pageKalender, notizen: pageNotizen,
    code: pageCode, tabelle: pageTabelle,
  });
  searchState.q = S.term || 'photosynthese';
}

// ---------------------------------------------------------------------------
// Zustand der neuen Anwendungen
// ---------------------------------------------------------------------------
let calcState = { expr: '', justEval: false };
let calState = { y: new Date().getFullYear(), m: new Date().getMonth(), sel: null };
let noteState = { notes: ajson(AKEYS.notes, null), active: null };
let codeState = { lang: 'JavaScript' };
let sheetState = { cells: ajson(AKEYS.sheet, {}) };
let searchState = { q: 'photosynthese', page: 1, tab: 'Alle', onlyLex: false };
let lexTopic = 'photosynthese';

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------
const xHead = (title, sub, icon, actions = '') => `<div class="zbt-x-head">
  <span class="zbt-x-ic">${icon}</span><span class="zbt-x-title">${esc2(title)}</span>
  <span class="zbt-x-sub">${esc2(sub)}</span><div class="zbt-x-actions">${actions}</div></div>`;
const ICON_CALC = '<svg viewBox="0 0 24 24" fill="#5f6368"><rect x="4" y="2" width="16" height="20" rx="2"/><rect x="6" y="4" width="12" height="4" fill="#cfe8d6"/><g fill="#fff"><rect x="6" y="10" width="3" height="2"/><rect x="10.5" y="10" width="3" height="2"/><rect x="15" y="10" width="3" height="2"/><rect x="6" y="14" width="3" height="2"/><rect x="10.5" y="14" width="3" height="2"/><rect x="15" y="14" width="3" height="6"/></g></svg>';
const ICON_CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
const ICON_NOTE = '<svg viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>';
const ICON_CODE = '<svg viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="2" stroke-linecap="round"><path d="M9 7 4 12l5 5M15 7l5 5-5 5M13 5l-2 14"/></svg>';
const ICON_TABLE = '<svg viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18M10 4v16"/></svg>';
const printBtn = '<button type="button" class="zbt-btn" data-zbt2="print">Drucken</button>';

function toastMsg(msg) {
  if (window.phToast) window.phToast(msg);
  else if (window.zbToast) window.zbToast(msg);
}

// ---------------------------------------------------------------------------
// Taschenrechner – eigener Parser (kein eval), Tastatur und Verlauf
// ---------------------------------------------------------------------------
function calcEval(src) {
  const s = String(src).replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '.').replace(/\s/g, '');
  if (!s || !/^[0-9+\-*/().%]+$/.test(s)) return null;
  let i = 0;
  const primary = () => {
    if (s[i] === '(') { i++; const v = expr(); if (s[i] === ')') i++; return v; }
    const st = i;
    while (i < s.length && /[0-9.]/.test(s[i])) i++;
    if (st === i) throw new Error('zahl');
    let n = parseFloat(s.slice(st, i));
    if (s[i] === '%') { i++; n = n / 100; }
    return n;
  };
  const unary = () => {
    if (s[i] === '-') { i++; return -unary(); }
    if (s[i] === '+') { i++; return unary(); }
    return primary();
  };
  const term = () => {
    let v = unary();
    while (s[i] === '*' || s[i] === '/') { const op = s[i++]; const r = unary(); v = op === '*' ? v * r : v / r; }
    return v;
  };
  const expr = () => {
    let v = term();
    while (s[i] === '+' || s[i] === '-') { const op = s[i++]; const r = term(); v = op === '+' ? v + r : v - r; }
    return v;
  };
  try { const v = expr(); return Number.isFinite(v) ? v : null; } catch (e) { return null; }
}
const fmtNum = (v) => {
  if (!Number.isFinite(v)) return 'Fehler';
  const r = Math.round(v * 1e10) / 1e10;
  return r.toLocaleString('de-DE', { maximumFractionDigits: 10 });
};

function pageRechner() {
  const hist = ajson(AKEYS.calcHist, []);
  const res = calcEval(calcState.expr || '0');
  const keys = [
    ['C', 'fn'], ['Del', 'fn'], ['%', 'fn'], ['÷', 'op'],
    ['7', ''], ['8', ''], ['9', ''], ['×', 'op'],
    ['4', ''], ['5', ''], ['6', ''], ['−', 'op'],
    ['1', ''], ['2', ''], ['3', ''], ['+', 'op'],
    ['±', 'fn'], ['0', ''], [',', ''], ['=', 'eq'],
  ];
  return `<div class="zbt-x">${xHead('Taschenrechner', 'Standard', ICON_CALC,
    `<span class="zbt-x-sub">Tastatur: 0–9 · + − * / · Enter · Rücktaste</span>${printBtn}`)}
  <div class="zbt-x-body"><div class="zbt-calc-wrap">
    <div class="zbt-calc-display"><div class="zbt-calc-expr">${esc2(calcState.expr)}</div>
      <div class="zbt-calc-res">${res === null ? '–' : esc2(fmtNum(res))}</div></div>
    <div class="zbt-calc-more">${['√', 'x²', '1/x', '(', ')'].map((k) => `<button type="button" data-zbt2="calc-key" data-k="${esc2(k)}">${esc2(k)}</button>`).join('')}</div>
    <div class="zbt-calc-pad">${keys.map(([k, c]) => `<button type="button" class="${c}" data-zbt2="calc-key" data-k="${esc2(k)}">${esc2(k)}</button>`).join('')}</div>
    <div class="zbt-calc-hist">${hist.length ? 'Zuletzt: ' + esc2(hist.slice(-3).join(' · ')) : 'Noch keine Rechnung'}</div>
  </div></div>
  <div class="zbt-x-foot"><span>Eigener Rechenkern ohne eval()</span><span>Ergebnisse nur in diesem Browser</span></div>
</div>`;
}

function calcPress(k) {
  let e = calcState.expr;
  if (k === 'C') { calcState = { expr: '', justEval: false }; }
  else if (k === '⌫' || k === 'Del') { calcState.expr = e.slice(0, -1); calcState.justEval = false; }
  else if (k === '=') {
    const v = calcEval(e || '0');
    if (v !== null) {
      const h = ajson(AKEYS.calcHist, []);
      h.push(`${e} = ${fmtNum(v)}`);
      asave(AKEYS.calcHist, h.slice(-12));
      calcState.expr = String(Math.round(v * 1e10) / 1e10).replace('.', ',');
      calcState.justEval = true;
    }
  } else if (k === '±') { calcState.expr = e.startsWith('-') ? e.slice(1) : '-' + e; }
  else if (k === '√') { const v = calcEval(e || '0'); if (v !== null && v >= 0) { calcState.expr = String(Math.round(Math.sqrt(v) * 1e10) / 1e10).replace('.', ','); calcState.justEval = true; } }
  else if (k === 'x²') { const v = calcEval(e || '0'); if (v !== null) { calcState.expr = String(Math.round(v * v * 1e10) / 1e10).replace('.', ','); calcState.justEval = true; } }
  else if (k === '1/x') { const v = calcEval(e || '0'); if (v !== null && v !== 0) { calcState.expr = String(Math.round((1 / v) * 1e10) / 1e10).replace('.', ','); calcState.justEval = true; } }
  else {
    const map = { '×': '*', '÷': '/', '−': '-' };
    const ch = map[k] || k;
    if (calcState.justEval && /[0-9,.]/.test(ch)) calcState.expr = ch;
    else calcState.expr = (calcState.expr || '') + ch;
    calcState.justEval = false;
  }
  if (ov) setOverlayContent('rechner', pageRechner(), 'Taschenrechner');
}

// ---------------------------------------------------------------------------
// Kalender – echter Monat, Notizen pro Tag
// ---------------------------------------------------------------------------
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const DOW = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const dayKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

function pageKalender() {
  const notes = ajson(AKEYS.cal, {});
  const y = calState.y, m = calState.m;
  const first = new Date(y, m, 1);
  const shift = (first.getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const today = new Date();
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const idx = i - shift + 1;
    let yy = y, mm = m, dd = idx, out = false;
    if (idx < 1) { mm = m - 1; dd = prevDays + idx; out = true; if (mm < 0) { mm = 11; yy--; } }
    else if (idx > days) { mm = m + 1; dd = idx - days; out = true; if (mm > 11) { mm = 0; yy++; } }
    const key = dayKey(yy, mm, dd);
    const note = notes[key] || '';
    const isToday = !out && yy === today.getFullYear() && mm === today.getMonth() && dd === today.getDate();
    cells.push(`<button type="button" class="zbt-cal-cell${out ? ' out' : ''}${isToday ? ' today' : ''}${calState.sel === key ? ' sel' : ''}" data-zbt2="cal-day" data-day="${key}"><b>${dd}</b>${note ? `<span class="dot"></span><span class="mini">${esc2(note.slice(0, 60))}</span>` : ''}</button>`);
  }
  const sel = calState.sel;
  const selLabel = sel ? new Date(sel + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Tag auswählen';
  return `<div class="zbt-x">${xHead('Kalender', `${MONATE[m]} ${y}`, ICON_CAL,
    `<button type="button" class="zbt-btn" data-zbt2="cal-prev">Zurück</button><button type="button" class="zbt-btn" data-zbt2="cal-today">Heute</button><button type="button" class="zbt-btn" data-zbt2="cal-next">Weiter</button>${printBtn}`)}
  <div class="zbt-x-body"><div class="zbt-cal">
    <div class="zbt-cal-grid">${DOW.map((d) => `<div class="zbt-cal-dow">${d}</div>`).join('')}${cells.join('')}</div>
    <div class="zbt-cal-side"><h2>${esc2(selLabel)}</h2>
      <small>Notizen werden lokal gespeichert.</small>
      <textarea data-zbt2="cal-note" placeholder="Notiz für diesen Tag …" ${sel ? '' : 'disabled'}>${esc2(sel ? notes[sel] || '' : '')}</textarea>
      <button type="button" class="zbt-btn" data-zbt2="cal-clear" ${sel ? '' : 'disabled'}>Notiz löschen</button>
    </div>
  </div></div>
  <div class="zbt-x-foot"><span>Montag als Wochenbeginn</span><span>${Object.keys(notes).length} Einträge gespeichert</span></div>
</div>`;
}

function calRender() { if (ov) setOverlayContent('kalender', pageKalender(), 'Kalender – Monatsansicht'); }

// ---------------------------------------------------------------------------
// Notizen – mehrere Notizen, lokal gespeichert
// ---------------------------------------------------------------------------
const DEFAULT_NOTES = [
  { id: 'n1', title: 'Biologie – Test', body: 'Photosynthese wiederholen:\n- Lichtreaktion in den Thylakoiden\n- Calvin-Zyklus im Stroma\n- Formel: 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂', ts: Date.now() },
  { id: 'n2', title: 'Einkauf', body: 'Milch\nBrot\nÄpfel\nNotizblock', ts: Date.now() - 86400000 },
];
function notes() { if (!Array.isArray(noteState.notes)) noteState.notes = DEFAULT_NOTES.map((n) => ({ ...n })); return noteState.notes; }
function activeNote() { return notes().find((n) => n.id === noteState.active) || notes()[0] || null; }

function pageNotizen() {
  const list = notes();
  const cur = activeNote();
  noteState.active = cur ? cur.id : null;
  return `<div class="zbt-x">${xHead('Notizen', `${list.length} Notizen`, ICON_NOTE,
    `<button type="button" class="zbt-btn pri" data-zbt2="note-new">+ Neu</button>${printBtn}`)}
  <div class="zbt-x-body"><div class="zbt-notes">
    <div class="zbt-notes-list"><div class="top"><span class="zbt-x-sub">Alle Notizen</span></div>
      <div class="items">${list.map((n) => `<button type="button" class="item${cur && cur.id === n.id ? ' on' : ''}" data-zbt2="note-select" data-id="${esc2(n.id)}">${esc2(n.title || 'Ohne Titel')}<small>${new Date(n.ts || Date.now()).toLocaleDateString('de-DE')}</small></button>`).join('') || '<div class="zbt-empty">Keine Notizen</div>'}</div>
    </div>
    <div class="zbt-notes-edit">
      ${cur ? `<input data-zbt2="note-title" value="${esc2(cur.title)}" aria-label="Titel" placeholder="Titel">
        <textarea data-zbt2="note-body" aria-label="Notiz" placeholder="Schreiben …">${esc2(cur.body)}</textarea>
        <div class="meta"><span>${esc2(String(cur.body || '').length)} Zeichen</span><button type="button" class="zbt-btn" data-zbt2="note-del">Löschen</button></div>`
        : '<div class="zbt-empty">Wähle links eine Notiz oder lege eine neue an.</div>'}
    </div>
  </div></div>
  <div class="zbt-x-foot"><span>Automatisch gespeichert</span><span>Nur auf diesem Gerät</span></div>
</div>`;
}

function notesRender() { if (ov) setOverlayContent('notizen', pageNotizen(), 'Notizen'); }

// ---------------------------------------------------------------------------
// Editor – Zeilennummern, Tab-Einrückung, Speichern
// ---------------------------------------------------------------------------
const DEFAULT_CODE = `// Notizen zur Photosynthese\nconst thema = 'Biologie';\n\nfunction gleichung(co2, h2o) {\n  return {\n    eingang: [co2, h2o],\n    ausgang: ['Glucose', 'Sauerstoff'],\n    energie: 'Licht',\n  };\n}\n\nconsole.log(thema, gleichung(6, 6));\n`;
function codeText() {
  try { const v = localStorage.getItem(AKEYS.code); return v === null ? DEFAULT_CODE : v; } catch (e) { return DEFAULT_CODE; }
}
function pageCode() {
  const txt = codeText();
  const lines = txt.split('\n').length;
  return `<div class="zbt-x">${xHead('Editor', 'notizen.js', ICON_CODE,
    `<select class="zbt-sel" data-zbt2="code-lang" aria-label="Sprache">${['JavaScript', 'Text', 'HTML', 'CSS', 'JSON'].map((l) => `<option${codeState.lang === l ? ' selected' : ''}>${l}</option>`).join('')}</select>
     <button type="button" class="zbt-btn" data-zbt2="code-copy">Kopieren</button>
     <button type="button" class="zbt-btn" data-zbt2="code-clear">Leeren</button>${printBtn}`)}
  <div class="zbt-x-body"><div class="zbt-code">
    <div class="zbt-code-bar"><span>notizen.js</span><span id="zbtCodeCount">${lines} Zeilen · ${txt.length} Zeichen</span></div>
    <div class="zbt-code-edit"><pre class="zbt-code-gutter" data-code-gutter>${Array.from({ length: lines }, (_, i) => i + 1).join('\n')}</pre>
      <textarea data-zbt2="code-text" spellcheck="false" wrap="off" aria-label="Quelltext">${esc2(txt)}</textarea></div>
  </div></div>
  <div class="zbt-x-foot"><span>Tab fügt zwei Leerzeichen ein</span><span>Änderungen werden lokal gespeichert</span></div>
</div>`;
}

// ---------------------------------------------------------------------------
// Tabelle – editierbare Zellen mit =SUMME() und Zellbezügen
// ---------------------------------------------------------------------------
const COLS = 'ABCDEF'.split('');
const ROWS = 12;
const DEMO = {
  A1: 'Fach', B1: 'Stunde', C1: 'Raum', D1: 'Note',
  A2: 'Biologie', B2: '2', C2: 'B204', D2: '1',
  A3: 'Mathe', B3: '3', C3: 'A101', D3: '2',
  A4: 'Deutsch', B4: '2', C4: 'A101', D4: '2',
  A6: 'Summe', D6: '=SUMME(D2:D4)', E6: '=D2*2',
};
function sheetVal(ref, depth = 0) {
  if (depth > 8) return 0;
  const raw = sheetState.cells[ref];
  if (raw == null || raw === '') return 0;
  if (String(raw).startsWith('=')) return sheetFormula(String(raw).slice(1), depth + 1) || 0;
  const n = parseFloat(String(raw).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}
function sheetFormula(f, depth = 0) {
  if (depth > 8) return null;
  const sum = /^SUMME\(([A-F]\d+):([A-F]\d+)\)$/i.exec(f.replace(/\s/g, ''));
  if (sum) {
    const a = sum[1].toUpperCase(), b = sum[2].toUpperCase();
    const c1 = COLS.indexOf(a[0]), r1 = parseInt(a.slice(1), 10);
    const c2 = COLS.indexOf(b[0]), r2 = parseInt(b.slice(1), 10);
    let t = 0;
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++)
      for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
        const ref = COLS[c] + r;
        if (String(sheetState.cells[ref] || '').startsWith('=')) continue;
        t += (parseFloat(String(sheetState.cells[ref] || '0').replace(',', '.')) || 0);
      }
    return t;
  }
  const expr = f.replace(/([A-F]\d+)/gi, (m) => String(sheetVal(m.toUpperCase(), depth + 1)));
  return calcEval(expr);
}
function pageTabelle() {
  let body = '';
  for (let r = 1; r <= ROWS; r++) {
    body += `<tr><th class="rowh">${r}</th>`;
    for (const c of COLS) {
      const ref = c + r;
      const raw = sheetState.cells[ref] || '';
      const isF = String(raw).startsWith('=');
      const shown = isF ? (() => { const v = sheetFormula(String(raw).slice(1)); return v === null ? '#FEHLER' : fmtNum(v); })() : raw;
      body += `<td class="${isF ? 'formula' : ''}"><input data-zbt2="sheet-cell" data-ref="${ref}" value="${esc2(shown)}" aria-label="${ref}"></td>`;
    }
    body += '</tr>';
  }
  return `<div class="zbt-x">${xHead('Tabelle', 'Stundenplan', ICON_TABLE,
    `<button type="button" class="zbt-btn" data-zbt2="sheet-demo">Beispiel</button>
     <button type="button" class="zbt-btn" data-zbt2="sheet-clear">Leeren</button>${printBtn}`)}
  <div class="zbt-x-body"><div class="zbt-sheet">
    <table><thead><tr><th class="rowh"></th>${COLS.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>
    <div class="zbt-sheet-cap">Formeln: <b>=SUMME(D2:D4)</b> oder <b>=D2*2</b> · Eingaben werden lokal gespeichert</div>
  </div></div>
  <div class="zbt-x-foot"><span>6 Spalten · ${ROWS} Zeilen</span><span>Formeln werden beim Verlassen der Zelle berechnet</span></div>
</div>`;
}

// ---------------------------------------------------------------------------
// Lexikon: weitere Themen + anklickbares Inhaltsverzeichnis
// ---------------------------------------------------------------------------
const LEX_DATA = {
  zellatmung: {
    title: 'Zellatmung', hat: 'Zur Energiegewinnung mit Licht siehe Photosynthese.',
    lead: 'Die <b>Zellatmung</b> ist ein Stoffwechselvorgang, bei dem organische Verbindungen mit Sauerstoff abgebaut werden. Die frei werdende Energie wird in Form von <a>ATP</a> gespeichert. Sie findet bei Eukaryoten vor allem in den <a>Mitochondrien</a> statt.',
    sections: [
      ['Überblick', 'Vereinfacht lässt sich der Vorgang als Oxidation von Glucose beschreiben. Aus einem Molekül Glucose entstehen Kohlenstoffdioxid und Wasser; gleichzeitig wird energiereiches ATP gebildet.'],
      ['Glykolyse', 'Im <a>Cytoplasma</a> wird Glucose in zwei Moleküle <a>Pyruvat</a> zerlegt. Dabei entstehen geringe Mengen ATP und NADH. Dieser Schritt benötigt keinen Sauerstoff.'],
      ['Citratzyklus', 'In der <a>Mitochondrienmatrix</a> wird Pyruvat weiter abgebaut. Der Zyklus liefert Kohlenstoffdioxid sowie die reduzierten Coenzyme NADH und FADH₂.'],
      ['Atmungskette', 'An der inneren Mitochondrienmembran werden Elektronen auf Sauerstoff übertragen. Die dabei frei werdende Energie treibt die <a>ATP-Synthase</a> an.'],
      ['Vergleich', 'Im Gegensatz zur Photosynthese wird hier Energie freigesetzt statt gespeichert. Beide Prozesse zusammen bilden den Kern des <a>Kohlenstoffkreislaufs</a>.'],
    ],
    cats: ['Stoffwechsel', 'Zellbiologie', 'Biochemie'],
  },
  mitose: {
    title: 'Mitose', hat: 'Zur geschlechtlichen Fortpflanzung siehe Meiose.',
    lead: 'Die <b>Mitose</b> ist die Kernteilung einer eukaryotischen Zelle, bei der aus einer Mutterzelle zwei genetisch identische Tochterzellen hervorgehen. Sie dient dem Wachstum, der Reparatur und der <a>ungeschlechtlichen Vermehrung</a>.',
    sections: [
      ['Interphase', 'Vor der Teilung wird die <a>DNA</a> im S-Phase genannten Abschnitt verdoppelt. Die Zelle prüft außerdem, ob alle Voraussetzungen für eine geordnete Teilung erfüllt sind.'],
      ['Prophase', 'Die Chromosomen kondensieren, die <a>Kernhülle</a> löst sich auf und der <a>Spindelapparat</a> bildet sich aus.'],
      ['Metaphase', 'Die Chromosomen ordnen sich in der Äquatorialebene an. An jedem Chromosom sind die beiden Schwesterchromatiden mit gegenüberliegenden Spindelpolen verbunden.'],
      ['Anaphase und Telophase', 'Die Schwesterchromatiden werden getrennt und zu den Polen gezogen. Anschließend bilden sich zwei neue Kernhüllen, bevor die <a>Cytokinese</a> die Zelle vollständig teilt.'],
      ['Bedeutung', 'Fehler bei der Verteilung der Chromosomen können zu <a>Chromosomenaberrationen</a> führen. Kontrollpunkte des Zellzyklus verhindern normalsolche Fehler weitgehend.'],
    ],
    cats: ['Zellbiologie', 'Genetik'],
  },
  osmose: {
    title: 'Osmose', hat: 'Zum aktiven Transport siehe Membrantransport.',
    lead: '<b>Osmose</b> bezeichnet die Bewegung von Wassermolekülen durch eine <a>semipermeable Membran</a> von der Seite mit der geringeren zur Seite mit der höheren Konzentration gelöster Teilchen. Sie ist ein passiver Vorgang und benötigt keine Energie.',
    sections: [
      ['Grundlagen', 'Treiber ist der Unterschied im <a>osmotischen Druck</a>. Die Membran lässt Wasser, nicht aber alle gelösten Stoffe durch.'],
      ['Pflanzenzellen', 'In hypotonischer Umgebung entsteht ein <a>Turgordruck</a>, der das Gewebe stützt. In hypertonischer Lösung kommt es zur <a>Plasmolyse</a>.'],
      ['Tierische Zellen', 'Ohne feste Zellwand können Zellen bei starkem Wassereinstrom platzen oder bei Wasserentzug schrumpfen. Der Organismus reguliert die Osmolarität daher über <a>Homöostase</a>.'],
      ['Anwendungen', 'Osmotische Vorgänge spielen eine Rolle bei der <a>Wasseraufnahme der Wurzeln</a>, bei Konservierung mit Salz oder Zucker und bei medizinischen Infusionslösungen.'],
    ],
    cats: ['Zellbiologie', 'Physik der Membranen'],
  },
};
const LEX_TOPICS = [
  { id: 'photosynthese', label: 'Photosynthese' },
  { id: 'zellatmung', label: 'Zellatmung' },
  { id: 'mitose', label: 'Mitose' },
  { id: 'osmose', label: 'Osmose' },
];

function lexArticle(d) {
  lexTopic = d.title.toLowerCase();
  const toc = d.sections.map(([h], i) => `<li${i === 0 ? ' class="on"' : ''}><a data-zbt2="toc" data-sec="${i}">${h}</a></li>`).join('');
  const body = d.sections.map(([h, p], i) => `<h2 data-sec="${i}">${h}<span class="ed">bearbeiten</span></h2><p>${p}</p>`).join('');
  return `<div class="zbt-v">
  <header class="zbt-v-head">
    <span class="zbt-v-menu" aria-hidden="true">${MENU_IC}</span>
    <a class="zbt-v-brand">${LEX_MARK}<span class="zbt-v-word"><b>Lexikon</b><small>Die freie Enzyklopädie</small></span></a>
    <form class="zbt-v-search" data-zbt="lexsearch" role="search"><label>${LENS}<input type="search" placeholder="Lexikon durchsuchen" aria-label="Lexikon durchsuchen"></label><button type="submit">Suchen</button></form>
    <div class="zbt-v-user"><a class="opt">Spenden</a><a class="opt">Benutzerkonto erstellen</a><a>Anmelden</a><span class="dots">···</span></div>
  </header>
  <div class="zbt-v-page">
    <nav class="zbt-v-toc" aria-label="Inhalt"><div class="h"><b>Inhalt</b><span>verbergen</span></div>
      <ul><li><a data-zbt2="toc" data-sec="-1">(Anfang)</a></li>${toc}<li><a data-zbt2="toc" data-sec="-2">Einzelnachweise</a></li></ul>
      <div class="zbt-v-hits"><b>Weitere Artikel</b>${LEX_TOPICS.map((t) => `<a data-zbt2="lex-open" data-topic="${t.id}">${t.label}</a>`).join('')}</div>
    </nav>
    <main class="zbt-v-main">
      <div class="zbt-v-titlebar"><h1>${d.title}</h1><span class="zbt-v-lang">${LANG_IC}112 Sprachen ▾</span></div>
      <div class="zbt-v-tabs"><div><a class="on">Artikel</a><a>Diskussion</a></div><div><a class="on">Lesen</a><a>Bearbeiten</a><a>Quelltext bearbeiten</a><a>Versionsgeschichte</a><a>Werkzeuge ▾</a></div></div>
      <div class="zbt-v-tag">aus Lexikon, der freien Enzyklopädie</div>
      <div class="zbt-v-body">
        <p class="zbt-v-hat">${d.hat}</p>
        <p>${d.lead}</p>
        ${body}
        <h2 data-sec="-2">Einzelnachweise</h2>
        <ol class="zbt-v-refs"><li>Lehrbuch der Biologie, 12. Auflage, 2022.</li><li>Arbeitsblatt zur Zellbiologie, 2024.</li></ol>
        <div class="zbt-v-cats"><a>Kategorien</a>: ${d.cats.map((c) => `<a>${c}</a>`).join(' | ')}</div>
      </div>
      <footer class="zbt-v-foot"><p>Diese Seite wurde zuletzt am 3. November 2026 um 14:12 Uhr bearbeitet.</p><p>Der Text ist unter der Lizenz „Creative-Commons Namensnennung – Weitergabe unter gleichen Bedingungen“ verfügbar.</p><nav><a>Datenschutz</a><a>Über Lexikon</a><a>Impressum</a><a>Mobile Ansicht</a></nav></footer>
    </main>
  </div>
</div>`;
}

// Verpasst dem bestehenden Photosynthese-Artikel Sprungmarken und Links.
function lexEnhance(html) {
  let n = -1;
  let out = html.replace(/<h2>([^<]+)<span class="ed">/g, (m, h) => `<h2 data-sec="${++n}">${h}<span class="ed">`);
  out = out.replace(/<h2>Einzelnachweise<\/h2>/, '<h2 data-sec="-2">Einzelnachweise</h2>');
  let i = -1;
  out = out.replace(/<li class="on"><a>\(Anfang\)<\/a><\/li>/, '<li class="on"><a data-zbt2="toc" data-sec="-1">(Anfang)</a></li>');
  out = out.replace(/<li><a>(Etymologie|Gesamtgleichung|Ablauf|Einflussfaktoren|Bedeutung|Siehe auch|Einzelnachweise)<\/a><\/li>/g,
    (m, h) => `<li><a data-zbt2="toc" data-sec="${h === 'Einzelnachweise' ? -2 : ++i}">${h}</a></li>`);
  out = out.replace(/<div class="h"><b>Inhalt<\/b><span>verbergen<\/span><\/div>/,
    `<div class="h"><b>Inhalt</b><span>verbergen</span></div><div class="zbt-v-hits"><b>Weitere Artikel</b>${LEX_TOPICS.map((t) => `<a data-zbt2="lex-open" data-topic="${t.id}">${t.label}</a>`).join('')}</div>`);
  return out;
}

// ---------------------------------------------------------------------------
// Suchverlauf
// ---------------------------------------------------------------------------
function addHistory(q) {
  const h = ajson(AKEYS.history, []).filter((x) => x !== q);
  h.unshift(q); asave(AKEYS.history, h.slice(0, 8));
}

// ---------------------------------------------------------------------------
// Zusätzliche Bedienung im Overlay (delegiert)
// ---------------------------------------------------------------------------
function onOverlayExtraClick(e) {
  const t = e.target.closest('[data-zbt2]');
  if (!t || !ov || !ov.contains(t)) return;
  const a = t.dataset.zbt2, v = t.dataset;

  // --- Lernplattform-Look ---
  if (a && a.startsWith('ml-')) {
    const go = (id, title) => setOverlayContent(id, (RENDER[id] || pageSuche)(), title || (pageById(id) || {}).title);
    if (a === 'ml-go') {
      e.preventDefault();
      const map = { start: ['moodle-start', 'Anmeldeseite | Lernplattform'], dash: ['moodle-dash', 'Dashboard | Lernplattform'],
        kurse: ['moodle-kurse', 'Meine Kurse | Lernplattform'], buchung: ['moodle-kurse', 'Buchungssystem | Lernplattform'],
        tafel: ['moodle-kurs', 'Digitale Tafel | Lernplattform'] };
      const [id, title] = map[v.page] || map.kurse;
      go(id, title);
      return;
    }
    if (a === 'ml-course') { mCourseId = v.course || 'bio'; go('moodle-kurs', 'Kurs | Lernplattform'); return; }
    if (a === 'ml-note') {
      if (window.phToast) window.phToast(v.t || 'In dieser Ansicht nicht verfügbar.');
      return;
    }
    if (a === 'ml-forgot') {
      e.preventDefault();
      searchState.loginErr = false;
      if (window.phToast) window.phToast('Ein neues Kennwort vergibt die Schulverwaltung.');
      return;
    }
  }

  switch (a) {
    // Suche
    case 'tab': searchState.tab = v.tab; searchState.page = 1; runSearch(searchState.q, true); break;
    case 'page': searchState.page = Number(v.page) || 1; runSearch(searchState.q, true); break;
    case 'filter': searchState.onlyLex = !searchState.onlyLex; searchState.page = 1; runSearch(searchState.q, true); break;
    case 'history': runSearch(v.q || ''); break;
    case 'home2': searchState = { q: S.term || 'photosynthese', page: 1, tab: 'Alle', onlyLex: false };
      if (ov) setOverlayContent('suche', searchHome(), 'Suche'); break;
    // Lexikon
    case 'toc': {
      const sec = Number(v.sec);
      const el = sec === -1 ? ov.querySelector('.zbt-v-titlebar') : ov.querySelector(`[data-sec="${sec}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      ov.querySelectorAll('.zbt-v-toc li').forEach((li) => li.classList.remove('on'));
      if (t.parentElement) t.parentElement.classList.add('on');
      break;
    }
    case 'lex-open': {
      const id = v.topic;
      const page = id === 'photosynthese' ? pageLexikon() : lexArticle(LEX_DATA[id] || LEX_DATA.zellatmung);
      const title = (LEX_TOPICS.find((x) => x.id === id) || LEX_TOPICS[0]).label + ' – Lexikon';
      if (ov) setOverlayContent('lexikon', page, title);
      break;
    }
    // Taschenrechner
    case 'calc-key': calcPress(v.k); break;
    // Kalender
    case 'cal-prev': calState.m--; if (calState.m < 0) { calState.m = 11; calState.y--; } calRender(); break;
    case 'cal-next': calState.m++; if (calState.m > 11) { calState.m = 0; calState.y++; } calRender(); break;
    case 'cal-today': { const d = new Date(); calState.y = d.getFullYear(); calState.m = d.getMonth(); calState.sel = dayKey(d.getFullYear(), d.getMonth(), d.getDate()); calRender(); break; }
    case 'cal-day': calState.sel = v.day; calRender(); break;
    case 'cal-clear': {
      const notes = ajson(AKEYS.cal, {}); delete notes[calState.sel]; asave(AKEYS.cal, notes); calRender(); break;
    }
    // Notizen
    case 'note-new': {
      const list = notes();
      const n = { id: 'n' + Date.now(), title: 'Neue Notiz', body: '', ts: Date.now() };
      list.unshift(n); noteState.active = n.id; asave(AKEYS.notes, list); notesRender(); break;
    }
    case 'note-select': noteState.active = v.id; notesRender(); break;
    case 'note-del': {
      const list = notes().filter((n) => n.id !== noteState.active);
      noteState.notes = list; noteState.active = list[0] ? list[0].id : null;
      asave(AKEYS.notes, list); notesRender(); break;
    }
    // Editor
    case 'code-clear': { try { localStorage.setItem(AKEYS.code, ''); } catch (err) {} if (ov) setOverlayContent('code', pageCode(), 'Notizen.js – Editor'); break; }
    case 'code-copy': {
      const ta = ov.querySelector('[data-zbt2="code-text"]');
      if (ta) { try { navigator.clipboard.writeText(ta.value); toastMsg('Quelltext kopiert'); } catch (err) { toastMsg('Kopieren nicht möglich'); } }
      break;
    }
    // Tabelle
    case 'sheet-demo': sheetState.cells = { ...DEMO }; asave(AKEYS.sheet, sheetState.cells); sheetRender(); break;
    case 'sheet-clear': sheetState.cells = {}; asave(AKEYS.sheet, {}); sheetRender(); break;
    // Dokument
    case 'doc-cmd': {
      if (!ov) break;
      const page = ov.querySelector('.zbt-d-page');
      if (page) page.focus();
      try { document.execCommand(v.cmd || 'bold', false, v.val || null); } catch (err) {}
      docSave(page); break;
    }
    case 'doc-clear': {
      if (ov) { const page = ov.querySelector('.zbt-d-page'); if (page) { page.innerHTML = '<p><br></p>'; docSave(page); } }
      break;
    }
    case 'print': try { window.print(); } catch (err) {} break;
    // Schnellwechsel
    case 'switch': {
      const id = v.page;
      const p = PAGES.find((x) => x.id === id);
      if (p && ov) setOverlayContent(id, (RENDER[id] || pageSuche)(), p.title);
      break;
    }
    default: break;
  }
}
function sheetRender() { if (ov) setOverlayContent('tabelle', pageTabelle(), 'Stundenplan – Tabelle'); }

let docTimer = null;
function docSave(page) {
  if (!page) return;
  clearTimeout(docTimer);
  docTimer = setTimeout(() => {
    try { localStorage.setItem(AKEYS.doc, page.innerHTML); } catch (e) {}
    const st = ov && ov.querySelector('[data-doc-status]');
    if (st) st.textContent = 'Alle Änderungen gespeichert · ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const wc = ov && ov.querySelector('[data-doc-words]');
    if (wc) wc.textContent = (page.innerText || '').trim().split(/\s+/).filter(Boolean).length + ' Wörter';
  }, 400);
}

function onOverlayExtraInput(e) {
  const t = e.target, a = t.dataset && t.dataset.zbt2;
  if (!a) return;
  if (a === 'cal-note' && calState.sel) {
    const notes = ajson(AKEYS.cal, {});
    notes[calState.sel] = t.value; asave(AKEYS.cal, notes);
  } else if (a === 'note-title' || a === 'note-body') {
    const n = activeNote(); if (!n) return;
    if (a === 'note-title') n.title = t.value; else n.body = t.value;
    n.ts = Date.now(); asave(AKEYS.notes, noteState.notes);
    const c = ov && ov.querySelector('.zbt-notes-edit .meta span');
    if (c && a === 'note-body') c.textContent = String(n.body.length) + ' Zeichen';
  } else if (a === 'code-text') {
    try { localStorage.setItem(AKEYS.code, t.value); } catch (err) {}
    syncGutter(t);
  } else if (a === 'sheet-cell') {
    // erst beim Verlassen speichern (change), hier nur tippen lassen
  } else if (a === 'doc-name') {
    try { localStorage.setItem(KEYS.docName, t.textContent.trim()); } catch (err) {}
  } else if (a === 'doc-page') {
    docSave(t);
  } else if (a === 'ml-course-note') {
    const notes = ajson(AKEYS.cal, {});
    notes[t.dataset.key] = t.value;
    asave(AKEYS.cal, notes);
  } else if (a === 'ml-filter') {
    mCourseFilter = t.value;
    clearTimeout(docTimer);
    docTimer = setTimeout(() => { if (ov && ov.dataset.page === 'moodle-kurse') setOverlayContent('moodle-kurse', pageMoodleKurse(), 'Meine Kurse | Lernplattform'); }, 260);
  }
}

function syncGutter(ta) {
  if (!ov) return;
  const g = ov.querySelector('[data-code-gutter]');
  if (!g) return;
  const lines = ta.value.split('\n').length;
  g.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
  g.scrollTop = ta.scrollTop;
  const c = ov.querySelector('#zbtCodeCount');
  if (c) c.textContent = lines + ' Zeilen · ' + ta.value.length + ' Zeichen';
}

function onOverlayExtraChange(e) {
  const t = e.target, a = t.dataset && t.dataset.zbt2;
  if (a === 'code-lang') { codeState.lang = t.value; return; }
  if (a === 'sheet-cell') {
    const ref = t.dataset.ref, raw = t.value.trim();
    if (raw.startsWith('=')) {
      sheetState.cells[ref] = raw;
      const v = sheetFormula(raw.slice(1));
      t.value = v === null ? '#FEHLER' : fmtNum(v);
    } else { sheetState.cells[ref] = raw; }
    asave(AKEYS.sheet, sheetState.cells);
  }
}

function onOverlayExtraKey(e) {
  // Tab im Editor = zwei Leerzeichen
  const t = e.target;
  if (t && t.dataset && t.dataset.zbt2 === 'code-text') {
    if (e.key === 'Tab') {
      e.preventDefault(); e.stopPropagation();
      const s = t.selectionStart, en = t.selectionEnd;
      t.value = t.value.slice(0, s) + '  ' + t.value.slice(en);
      t.selectionStart = t.selectionEnd = s + 2;
      t.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  if (t && t.dataset && t.dataset.zbt2 === 'code-text') { syncGutter(t); return; }
  // Taschenrechner per Tastatur (nur wenn kein Eingabefeld fokussiert)
  if (!ov || ov.dataset.page !== 'rechner') return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key;
  if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); calcPress('='); return; }
  if (e.key === 'Backspace') { e.preventDefault(); calcPress('⌫'); return; }
  if (e.key === 'Escape') return;
  if (e.key === 'Delete') { e.preventDefault(); calcPress('C'); return; }
  if (/^[0-9]$/.test(k) || ['+', '-', '*', '/', '.', ',', '(', ')', '%'].includes(k)) {
    e.preventDefault();
    calcPress(k === '*' ? '×' : k === '/' ? '÷' : k === '-' && !calcState.expr ? '−' : k);
  }
}

function onOverlayExtraSubmit(e) {
  const f = e.target;
  // Anmeldung der Lernplattform: prüft nur, ob etwas eingetragen wurde – nichts wird gesendet.
  if (f && f.dataset && f.dataset.zbt2 === 'ml-login' && ov) {
    e.preventDefault();
    const user = f.querySelector('input[name="user"]');
    const pass = f.querySelector('input[name="pass"]');
    if (user && user.value.trim() && pass && pass.value) {
      searchState.loginErr = false;
      setOverlayContent('moodle-dash', pageMoodleDash(), 'Dashboard | Lernplattform');
    } else {
      searchState.loginErr = true;
      setOverlayContent('moodle-start', pageMoodleStart(), 'Anmeldeseite | Lernplattform');
    }
    return;
  }
  if (!f || f.dataset.zbt !== 'lexsearch' || !ov) return;
  e.preventDefault(); e.stopPropagation();
  const q = (f.querySelector('input') ? f.querySelector('input').value : '').trim().toLowerCase();
  const hit = LEX_TOPICS.find((t) => t.label.toLowerCase().includes(q) || t.id.includes(q));
  const id = q && hit ? hit.id : 'photosynthese';
  const html = id === 'photosynthese' ? pageLexikon() : lexArticle(LEX_DATA[id] || LEX_DATA.zellatmung);
  setOverlayContent('lexikon', html, (LEX_TOPICS.find((x) => x.id === id) || LEX_TOPICS[0]).label + ' – Lexikon');
}

// ---------------------------------------------------------------------------
// Tasten: Kombinationen, einfacher Druck, einstellbares Zeitfenster, Alt+1…8
// ---------------------------------------------------------------------------
function eventToSpec(e) {
  const parts = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.metaKey) parts.push('Meta');
  if (e.shiftKey && (e.key.length > 1 || parts.length)) parts.push('Shift');
  parts.push(e.key === ' ' ? 'Space' : e.key);
  return parts.join('+');
}
function parseSpec(spec) {
  const p = String(spec || 'Escape').split('+');
  const key = p.pop();
  const mods = p.map((x) => x.toLowerCase());
  return {
    key: key === 'Space' ? ' ' : key,
    ctrl: mods.includes('ctrl'), alt: mods.includes('alt'),
    meta: mods.includes('meta'), shift: mods.includes('shift'),
  };
}
function matchesSpec(e, spec) {
  const s = parseSpec(spec);
  if (e.key !== s.key) return false;
  if (s.ctrl !== !!e.ctrlKey || s.alt !== !!e.altKey || s.meta !== !!e.metaKey) return false;
  if (s.shift && !e.shiftKey) return false;
  return true;
}
function keyLabel2(k) {
  const m = { Escape: 'Esc', ' ': 'Leertaste', Space: 'Leertaste', ArrowUp: 'Pfeil hoch', ArrowDown: 'Pfeil runter',
    ArrowLeft: 'Pfeil links', ArrowRight: 'Pfeil rechts', Enter: 'Enter', Tab: 'Tab', Backspace: 'Rücktaste', Delete: 'Entf' };
  return String(k || '').split('+').map((p) => m[p] || (p.length === 1 ? p.toUpperCase() : p)).join(' + ');
}

function activePageIndex() {
  const id = (ov && ov.dataset.page) || S.page;
  const list = visiblePages(S.look);
  return Math.max(0, list.findIndex((p) => p.id === id));
}
function switchPage(idx, mode = 'panic') {
  const list = visiblePages(S.look);
  const p = list[idx]; if (!p) return;
  if (mode === 'panic' && !panic && !pagePreview) { show(p.id); return; }
  if (ov) { const fn = RENDER[p.id] || pageSuche; setOverlayContent(p.id, fn(), p.title); }
}

// ---------------------------------------------------------------------------
// Auto-Tarnung bei Tab-Wechsel / Fokusverlust
// ---------------------------------------------------------------------------
let autoTimer = null;
function withinSchedule() {
  if (!S.schedule) return true;
  const h = new Date().getHours(), a = S.from, b = S.to;
  return a <= b ? (h >= a && h < b) : (h >= a || h < b);
}
function armAuto() {
  cancelAuto();
  if (!(S.on && S.auto && !panic && !pagePreview && withinSchedule())) return;
  autoTimer = setTimeout(() => {
    autoTimer = null;
    if (!(S.on && S.auto && !panic && !pagePreview)) return;
    if (!document.hidden && document.hasFocus()) return;
    show(S.page);
    bumpCount('auto');
  }, S.autoMs);
}
function cancelAuto() { if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; } }

function bumpCount(reason) {
  const n = Number(get(KEYS.count, '0') || 0) + 1;
  set(KEYS.count, String(n)); set(KEYS.last, String(Date.now()));
  window.dispatchEvent(new CustomEvent('zb-tarnung-stat', { detail: { count: n, reason } }));
}

// ---------------------------------------------------------------------------
// Einstellungen: Export / Import / Zurücksetzen
// ---------------------------------------------------------------------------
function exportConfig() {
  const o = {};
  for (const [name, key] of Object.entries(KEYS)) {
    try { const v = localStorage.getItem(key); if (v !== null) o[name] = v; } catch (e) {}
  }
  return JSON.stringify({ app: 'zockbox-tarnung', version: 2, settings: o }, null, 2);
}
function importConfig(text) {
  let data;
  try { data = JSON.parse(text); } catch (e) { toastMsg('Keine gültige JSON-Datei'); return false; }
  const s = data && data.settings;
  if (!s || typeof s !== 'object') { toastMsg('Keine Einstellungen gefunden'); return false; }
  for (const [name, key] of Object.entries(KEYS)) {
    if (Object.prototype.hasOwnProperty.call(s, name)) {
      try { localStorage.setItem(key, String(s[name])); } catch (e) {}
    }
  }
  S = readState(); applyTab(); updateFab();
  window.dispatchEvent(new CustomEvent('zb-tarnung-config', { detail: { on: S.on } }));
  if (ui) ui.render();
  toastMsg('Einstellungen übernommen');
  return true;
}
function resetConfig() {
  for (const key of Object.values(KEYS)) { try { localStorage.removeItem(key); } catch (e) {} }
  S = readState(); if (panic || pagePreview) hide();
  applyTab(); updateFab();
  window.dispatchEvent(new CustomEvent('zb-tarnung-config', { detail: { on: S.on } }));
  if (ui) ui.render();
  toastMsg('Einstellungen zurückgesetzt');
}

// ---------------------------------------------------------------------------
// Erweiterte Einstellungs-Oberfläche
// ---------------------------------------------------------------------------
function mountAdvancedSettings(root) {
  // Die Einstellungen stehen jetzt in einem breiten Pop-up (Startseite: #zbTarnDialog).
  if (!root) return;

  const lookChip = (l) => {
    const on = S.look === l.id;
    return `<button type="button" class="zx-look${on ? ' on' : ''}" role="radio" aria-checked="${on}" data-look="${l.id}" title="${esc(l.note)}">
      <span class="zx-look-ic"><img src="${l.icon}" alt="" width="34" height="34"></span>
      <span class="zx-look-tx"><b>${esc(l.label)}</b><small>${esc(l.note)}</small></span>
      <span class="zx-look-tick" aria-hidden="true">✓</span>
    </button>`;
  };
  const pageChip = (p) => `<button type="button" class="zx-chip" role="radio" data-page="${p.id}" aria-checked="${S.page === p.id}">
    ${p.icon ? `<img src="${p.icon}" alt="" width="16" height="16">` : ''}${esc(p.label)}</button>`;

  const render = () => {
    const touch = isTouch();
    const cur = pageById(S.page) || PAGES[0];
    const look = lookById(S.look);
    const pages = visiblePages(S.look);
    const others = PAGES.filter((p) => !p.hidden && p.look !== S.look).length;
    const stats = {
      count: Number(get(KEYS.count, '0') || 0),
      last: Number(get(KEYS.last, '0') || 0),
    };
    const lastTxt = stats.last ? new Date(stats.last).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : 'noch nie';
    const armed = S.on && S.auto && withinSchedule();
    root.innerHTML = `
      <div class="zx-set-row zx-set-row-lead">
        <div class="zx-set-txt"><b>Tarnmodus</b><span>Titel &amp; Symbol im Tab, dazu eine echte Tarnseite als Vollbild – für Startseite und alle Spiele.</span></div>
        <button type="button" class="zx-switch" role="switch" id="zbTarnOn" aria-checked="${S.on}" aria-label="Tarnmodus"><i></i></button>
      </div>

      <div class="zx-set-sub">Look · Titel, Symbol und Seite gehören zusammen</div>
      <div class="zx-looks" role="radiogroup" aria-label="Look">${LOOKS.map(lookChip).join('')}</div>
      <p class="zx-set-hint">Ein Look = ein Tab-Titel, ein Favicon und passende Seiten. Titel und Symbol einzeln zu wählen gibt es bewusst nicht mehr, damit nichts verrutscht. Standard: <b>Lernplattform</b>.</p>

      <div class="zx-tarn-opts${S.on ? '' : ' dim'}" id="zbTarnOpts">
        <div class="zx-set-block">
          <span class="zx-set-label">Seite in diesem Look <small>(${pages.length} Seiten${others ? ` · ${others} in anderen Looks` : ''})</small></span>
          <div class="zx-chips" role="radiogroup" aria-label="Tarnseite">
            ${pages.map(pageChip).join('')}
            <button type="button" class="zx-chip zx-chip-dash" id="zbTarnPreview">Vorschau</button>
          </div>
          <p class="zx-set-hint">Im geöffneten Overlay: <b>Alt + 1 … ${pages.length}</b> wechselt die Seite, <b>Alt + Pfeil</b> blättert. Mit dem Look wechselt auch der Tab.</p>
        </div>

        <div class="zx-set-divider"></div>
        <div class="zx-set-sub">Auslöser</div>
        <div class="zx-set-block">
          <span class="zx-set-label">Panik-Taste</span>
          <div class="zx-set-key">
            <kbd id="zbTarnKey">${esc(keyLabel2(S.key))}</kbd><span>${S.single ? '1× drücken' : '2× schnell drücken'}</span>
            <button type="button" class="zx-chip" id="zbTarnKeyBtn">Ändern</button>
          </div>
          <p class="zx-set-hint">Auch Kombinationen wie <b>Ctrl + Shift + P</b> funktionieren.</p>
        </div>
        <div class="zx-set-grid">
          <div class="zx-field"><span>Einmal drücken genügt</span>
            <div class="zx-set-actions"><button type="button" class="zx-switch" role="switch" data-sw="single" aria-checked="${S.single}" aria-label="Einmal drücken genügt"><i></i></button></div>
            <small>Sofortige Tarnung ohne Doppeldruck.</small>
          </div>
          <div class="zx-field"><span>Zeit für Doppeldruck</span>
            <select class="zx-select" data-num="delay" aria-label="Zeit für Doppeldruck">
              ${[[250, '250 ms'], [400, '400 ms'], [550, '550 ms (Standard)'], [750, '750 ms'], [1000, '1 Sekunde'], [1500, '1,5 Sekunden']].map(([n, l]) => `<option value="${n}"${S.delay === n ? ' selected' : ''}>${l}</option>`).join('')}
            </select>
          </div>
          <div class="zx-field"><span>Panik-Knopf unten links</span>
            <div class="zx-set-actions"><button type="button" class="zx-switch" role="switch" data-sw="fab" aria-checked="${S.fab}" aria-label="Panik-Knopf"><i></i></button></div>
            <small>${touch ? 'Sichtbar – führt direkt zurück ins Spiel.' : 'Erscheint auf Handy und Tablet.'}</small>
          </div>
        </div>

        <div class="zx-set-divider"></div>
        <div class="zx-set-sub">Automatisch tarnen</div>
        <div class="zx-set-row zx-set-row-sm">
          <div class="zx-set-txt"><b>Bei Tab-Wechsel / Fokusverlust</b><span>Blendet die Tarnseite automatisch ein, wenn du den Tab verlässt. Das Spiel läuft weiter.</span></div>
          <button type="button" class="zx-switch" role="switch" data-sw="auto" aria-checked="${S.auto}" aria-label="Auto-Tarnung"><i></i></button>
        </div>
        <div class="zx-set-grid">
          <div class="zx-field"><span>Verzögerung</span>
            <select class="zx-select" data-num="autoMs" aria-label="Verzögerung der Auto-Tarnung">
              ${[[0, 'sofort'], [300, '300 ms'], [800, '800 ms'], [1500, '1,5 s'], [3000, '3 s']].map(([n, l]) => `<option value="${n}"${S.autoMs === n ? ' selected' : ''}>${l}</option>`).join('')}
            </select>
          </div>
          <div class="zx-field"><span>Nur in einem Zeitfenster</span>
            <div class="zx-set-actions" style="gap:8px">
              <button type="button" class="zx-switch" role="switch" data-sw="schedule" aria-checked="${S.schedule}" aria-label="Zeitfenster"><i></i></button>
              <select class="zx-select" data-num="from" aria-label="Von Uhrzeit" style="width:88px">${Array.from({ length: 24 }, (_, h) => `<option value="${h}"${S.from === h ? ' selected' : ''}>${String(h).padStart(2, '0')}:00</option>`).join('')}</select>
              <select class="zx-select" data-num="to" aria-label="Bis Uhrzeit" style="width:88px">${Array.from({ length: 24 }, (_, h) => `<option value="${h}"${S.to === h ? ' selected' : ''}>${String(h).padStart(2, '0')}:00</option>`).join('')}</select>
            </div>
            <small>${armed ? 'Gerade aktiv.' : S.schedule && S.on ? 'Außerhalb des Zeitfensters – gerade pausiert.' : 'Auto-Tarnung ist aus.'}</small>
          </div>
        </div>

        <div class="zx-set-divider"></div>
        <div class="zx-set-sub">Inhalt der Tarnseiten</div>
        <div class="zx-set-grid">
          <div class="zx-field"><span>Name im Dashboard</span><input class="zx-input-sm" data-txt="term" value="${esc(S.term)}" maxlength="60" aria-label="Standard-Suchbegriff"><small>Wird für Suche und Begrüßung genutzt.</small></div>
          <div class="zx-field"><span>Name des Dokuments</span><input class="zx-input-sm" data-txt="docName" value="${esc(S.docName)}" maxlength="40" aria-label="Name des Dokuments"></div>
          <div class="zx-field"><span>Medien stummschalten</span>
            <div class="zx-set-actions"><button type="button" class="zx-switch" role="switch" data-sw="media" aria-checked="${S.media}" aria-label="Medien stummschalten"><i></i></button></div>
            <small>Ton von Audio/Video während der Tarnung.</small>
          </div>
        </div>

        <div class="zx-set-divider"></div>
        <div class="zx-set-sub">Tasten &amp; Verlauf</div>
        <ul class="zx-set-list">
          <li><kbd>${esc(keyLabel2(S.key))}</kbd><span>${S.single ? 'Tarnseite ein-/ausblenden' : 'zweimal: Tarnseite ein-/ausblenden'}</span></li>
          <li><kbd>Alt + 1…${pages.length}</kbd><span>Seite direkt öffnen / wechseln</span></li>
          <li><kbd>Alt + Pfeil</kbd><span>Nächste / vorherige Seite</span></li>
          <li><kbd>Ctrl + P</kbd><span>Nur die Tarnseite drucken</span></li>
          <li><kbd>2× Ecke</kbd><span>Oben links doppelt antippen = zurück</span></li>
        </ul>

        <div class="zx-set-divider"></div>
        <div class="zx-set-sub">Statistik &amp; Werkzeuge</div>
        <div class="zx-set-stats">
          <div><b>${stats.count}</b><span>Auslösungen</span></div>
          <div><b>${esc(lastTxt)}</b><span>Zuletzt</span></div>
          <div><b>${pages.length}</b><span>Seiten</span></div>
          <div><b>${S.on ? 'an' : 'aus'}</b><span>Status</span></div>
        </div>
        <div class="zx-set-actions">
          <button type="button" class="zx-btn-sm zx-btn-sm-zb" data-act="preview">Testlauf starten</button>
          <button type="button" class="zx-btn-sm" data-act="export">Exportieren</button>
          <button type="button" class="zx-btn-sm" data-act="import">Importieren</button>
          <button type="button" class="zx-btn-sm" data-act="copy">Kopieren</button>
          <button type="button" class="zx-btn-sm" data-act="reset">Zurücksetzen</button>
        </div>
        <textarea class="zx-input-sm" id="zbTarnJson" rows="4" placeholder="JSON für Import hier einfügen …" aria-label="Einstellungen als JSON" style="height:auto;padding:9px;font:11px/1.5 ui-monospace,monospace"></textarea>
        <p class="zx-set-note">Zurück zum Spiel: dieselbe Taste ${S.single ? 'einmal' : 'zweimal'} drücken, oben links 2× antippen – auf dem Handy auch der kleine Knopf unten links. Das Spiel läuft im Hintergrund weiter.</p>
        <p class="zx-set-note"><span class="zx-set-badge">Hinweis</span> Die Looks sind eigene Nachbauten: keine echten Logos, Markennamen oder Schriftzüge – sonst könnte das Repo als Phishing gelten. Aktuell: <b>${esc(look.label)}</b>.</p>
      </div>`;
  };

  // Delegierte Events: überleben das Neuzeichnen der Oberfläche.
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button, [data-act]');
    if (!b || !root.contains(b)) return;
    if (b.id === 'zbTarnOn') { setSetting('on', !S.on); return; }
    if (b.dataset.look) { setLook(b.dataset.look); return; }
    if (b.dataset.sw) { setSetting(b.dataset.sw, b.getAttribute('aria-checked') !== 'true'); return; }
    if (b.dataset.page) { setSetting('page', b.dataset.page); return; }
    if (b.id === 'zbTarnPreview') { previewPage(S.page); return; }
    if (b.id === 'zbTarnKeyBtn') {
      if (recording) return;
      b.textContent = 'Taste drücken …';
      const kbd = root.querySelector('#zbTarnKey');
      if (kbd) kbd.textContent = '?';
      recording = (ev) => {
        ev.preventDefault(); ev.stopPropagation();
        recording = null;
        const skip = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Unidentified', 'Dead'];
        if (!skip.includes(ev.key)) setSetting('key', eventToSpec(ev)); else render();
      };
      return;
    }
    const act = b.dataset.act;
    if (act === 'preview') { previewPage(S.page); return; }
    if (act === 'export') {
      const ta = root.querySelector('#zbTarnJson');
      if (ta) { ta.value = exportConfig(); ta.focus(); ta.select(); }
      toastMsg('Einstellungen als JSON erzeugt'); return;
    }
    if (act === 'copy') {
      const txt = root.querySelector('#zbTarnJson').value || exportConfig();
      try { navigator.clipboard.writeText(txt).then(() => toastMsg('Kopiert'), () => toastMsg('Kopieren nicht möglich')); }
      catch (err) { toastMsg('Kopieren nicht möglich'); }
      return;
    }
    if (act === 'import') {
      const ta = root.querySelector('#zbTarnJson');
      if (ta && ta.value.trim()) importConfig(ta.value.trim()); else toastMsg('Bitte erst JSON einfügen');
      return;
    }
    if (act === 'reset') { resetConfig(); return; }
  });

  root.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.num) { setSetting(t.dataset.num, t.value); return; }
    if (t.dataset.txt) setSetting(t.dataset.txt, t.value);
  });
  root.addEventListener('input', (e) => {
    const t = e.target;
    if (t && t.dataset && t.dataset.txt) {
      set(KEYS[t.dataset.txt], t.value);
      S = readState();
      if (t.dataset.txt === 'term') searchState.q = S.term;
    }
  });

  ui = { render };
  render();
}
