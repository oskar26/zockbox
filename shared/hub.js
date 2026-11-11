// Zockbox – Startseite: Profil, "Mit Code beitreten", Zahlen, Einstellungen. made by Oskar
//
// Die Seite ist bewusst schlicht: eine Spalte, Karten mit feinen Linien.
// Alles, was hier passiert, bleibt im Browser (localStorage).
import { AVATARS, getProfile, setName, setAvatar, randomName, NAME_MAX } from './profile.js';
import { t, locale, retranslate } from './i18n.js';
import { capacity, capacityHint } from './capacity.js';
import { summary, statsFor } from './stats.js';
import { gameArt } from './game-art.js';

// Spiele, die per Code beitreten können.
// id = interner Schlüssel (data-game in index.html), peerPrefixes wie in shared/net.js.
const GAMES = [
  { id: 'machs-meme', name: "Mach's Meme", path: 'games/machs-meme/', peerPrefixes: ['zockbox-machs-meme-v1-'] },
  { id: 'wikirennen', name: 'Wikirennen', path: 'games/wikirennen/', peerPrefixes: ['zockbox-wikirennen-v1-'] },
  { id: 'kritzel-duell', name: 'Kritzel-Duell', path: 'games/kritzel-duell/', peerPrefixes: ['zockbox-kritzel-duell-v1-'] },
  { id: 'krakelpost', name: 'Krakelpost', path: 'games/krakelpost/', peerPrefixes: ['zockbox-krakelpost-v1-'] },
];
const PEERJS_URL = new URL('./vendor/peerjs.min.js', import.meta.url).href;

const $ = (id) => document.getElementById(id);
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

function toast(msg, ms = 2600) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  el.setAttribute('role', 'status');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

// ---------------------------------------------------------------------------
// Spielkarten: Bilder aus shared/game-art.js (Look der Spiele)
// ---------------------------------------------------------------------------
function paintArt() {
  document.querySelectorAll('[data-art]').forEach((box) => {
    const id = box.dataset.art;
    if (!id || box.firstElementChild) return;
    box.innerHTML = gameArt(id);
  });
  // Sprache da, wo Text in den Bildern steckt (aria-label) – einmal nachziehen.
  retranslate();
}

// ---------------------------------------------------------------------------
// Profil (Startseite + Pop-up)
// ---------------------------------------------------------------------------
function initProfile() {
  const nameIn = $('phName'), avBtn = $('phAvatar'), grid = $('phAvatarGrid');
  // Dieselben Felder stehen auch im Einstellungs-Pop-up. Das wird erst später
  // aufgebaut (tarnung.js) – deshalb jedes Mal frisch suchen.
  const pop = () => ({
    name: $('phName2'), av: $('phAvatar2'), grid: $('phAvatarGrid2'), dice: $('phDice2'),
  });

  const paintAll = () => {
    const p = getProfile();
    const el = pop();
    if (nameIn && nameIn !== document.activeElement) nameIn.value = p.name;
    if (el.name && el.name !== document.activeElement) el.name.value = p.name;
    if (avBtn) avBtn.textContent = p.avatar;
    if (el.av) el.av.textContent = p.avatar;
    const av = $('zbMeAv'), nm = $('zbMeName');
    if (av) av.textContent = p.avatar;
    if (nm) nm.textContent = p.name || t('Profil');
    const hello = $('zbHello');
    if (hello) hello.textContent = p.name ? `, ${p.name}!` : '!';
    document.querySelectorAll('.prof-grid button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.textContent === p.avatar));
    });
  };

  const saved = () => {
    paintAll();
    syncMinis();
    paintSetSummary();
    window.dispatchEvent(new CustomEvent('zb:profile-changed'));
  };

  if (nameIn) nameIn.maxLength = NAME_MAX;

  // Avatar-Raster: im Pop-up wird es erst gebaut, wenn das Pop-up offen ist.
  const buildGrid = (box, btn) => {
    if (!box) return;
    box.innerHTML = '';
    for (const a of AVATARS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = a;
      b.setAttribute('aria-label', t('Avatar auswählen') + ' ' + a);
      b.onclick = () => { setAvatar(a); saved(); };
      box.appendChild(b);
    }
    if (btn) btn.onclick = () => {
      const open = box.classList.toggle('hidden');
      btn.setAttribute('aria-expanded', String(!open));
    };
  };
  buildGrid(grid, avBtn);

  const bindName = (input) => {
    if (!input) return;
    input.maxLength = NAME_MAX;
    input.addEventListener('input', () => {
      setName(input.value);
      paintAll();
      syncMinis();
    });
    input.addEventListener('blur', () => { input.value = setName(input.value); paintAll(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
  };
  bindName(nameIn);

  const dice = () => {
    setName(randomName());
    setAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
    saved();
  };
  if ($('phDice')) $('phDice').onclick = dice;

  // Pop-up ist offen: Felder füllen, Raster und Würfel verkabeln (einmalig).
  // Der Timer ist Absicht: tarnung.js zeichnet den Tarn-Bereich beim Öffnen neu,
  // danach kommen Profil-Raster und Würfel dran.
  window.addEventListener('zb:settings-opened', () => setTimeout(() => {
    const el = pop();
    if (el.grid && !el.grid.children.length) buildGrid(el.grid, el.av);
    if (el.name && !el.name.dataset.bound) {
      el.name.dataset.bound = '1';
      bindName(el.name);
    }
    if (el.dice && !el.dice.onclick) el.dice.onclick = dice;
    paintAll();
  }, 0));

  paintAll();
  return { paintAll };
}

// ---------------------------------------------------------------------------
// Mit Code beitreten
// ---------------------------------------------------------------------------
let selected = 'auto';

function cleanCode(v) {
  const s = String(v || '').toUpperCase().replace(/\s/g, '');
  if (s.startsWith('Ö')) return 'Ö' + s.slice(1).replace(/[^0-9]/g, '').slice(0, 1); // öffentliche Lobby, z. B. Ö3
  return s.replace(/[^A-Z]/g, '').slice(0, 4);
}

function go(game, code) {
  const pub = /^Ö(\d)$/.exec(code);
  const q = pub ? `?pub=${pub[1]}` : `?code=${encodeURIComponent(code)}`;
  location.href = game.path + q;
}

function loadPeerJS() {
  if (window.Peer) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = PEERJS_URL;
    s.onload = () => res();
    s.onerror = () => rej(new Error('peerjs'));
    document.head.appendChild(s);
  });
}

// Fragt beim PeerJS-Vermittler nach, in welchem Spiel eine Lobby mit diesem Code offen ist.
// Wir öffnen nur kurz eine Verbindung und schließen sie sofort wieder (kein "hello" → der Host ignoriert uns).
async function findGame(code) {
  await loadPeerJS();
  const peer = await new Promise((resolve, reject) => {
    const p = new window.Peer({ debug: 0 });
    const timer = setTimeout(() => { try { p.destroy(); } catch (e) {} reject(new Error('timeout')); }, 9000);
    p.on('open', () => { clearTimeout(timer); resolve(p); });
    p.on('error', (err) => { if (!p.open) { clearTimeout(timer); try { p.destroy(); } catch (e) {} reject(err); } });
  });
  const pub = /^Ö(\d)$/.exec(code);
  const suffix = pub ? `pub-${pub[1]}` : `p-${code}`;

  const probe = (targetId) => new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; peer.off('error', onErr); resolve(v); } };
    const onErr = (err) => { if (err && err.type === 'peer-unavailable' && String(err.message || '').includes(targetId)) finish(false); };
    peer.on('error', onErr);
    const conn = peer.connect(targetId, { reliable: true });
    conn.on('open', () => { finish(true); setTimeout(() => { try { conn.close(); } catch (e) {} }, 50); });
    conn.on('error', () => finish(false));
    setTimeout(() => { if (!done) { try { conn.close(); } catch (e) {} } finish(false); }, 6000);
  });

  const found = [];
  await Promise.all(GAMES.map(async (g) => {
    const hits = await Promise.all(g.peerPrefixes.map((pre) => probe(pre + suffix)));
    if (hits.some(Boolean)) found.push(g);
  }));
  setTimeout(() => { try { peer.destroy(); } catch (e) {} }, 300);
  return found;
}

function setStatus(msg, kind = '') {
  const s = $('joinStatus');
  if (!s) return;
  s.textContent = msg;
  s.dataset.kind = kind;
  s.classList.toggle('hidden', !msg);
  retranslate();
}

function initJoin() {
  const input = $('joinCode'), btn = $('joinGo'), form = $('joinForm');
  if (!input || !form || !btn) return;

  const chips = document.querySelectorAll('#joinGame [data-game]');
  const pick = (id) => {
    selected = id;
    chips.forEach((c) => {
      const on = c.dataset.game === id;
      c.setAttribute('aria-pressed', String(on));
      c.classList.toggle('on', on);
    });
  };
  chips.forEach((c) => c.addEventListener('click', () => { pick(c.dataset.game); setStatus(''); }));
  pick('auto');

  input.addEventListener('input', () => {
    const v = cleanCode(input.value);
    if (v !== input.value) input.value = v;
    setStatus('');
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); btn.click(); }
  });

  function openSettingsIfHash() {
    const id = (location.hash || '').replace('#', '');
    if (id === 'einstellungen' || id === 'settings') openSettings();
  }
  window.addEventListener('hashchange', openSettingsIfHash);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = cleanCode(input.value);
    const valid = /^[A-Z]{4}$/.test(code) || /^Ö\d$/.test(code);
    if (!valid) { setStatus(t('Der Code hat 4 Buchstaben, z. B. KXPM.'), 'err'); input.focus(); return; }

    if (selected !== 'auto') { go(GAMES.find((g) => g.id === selected), code); return; }

    // Kein btn.disabled: in Chromium "verschluckt" ein während des Klicks deaktivierter Button danach manchmal Klicks.
    if (btn.getAttribute('aria-busy') === 'true') return;
    btn.setAttribute('aria-busy', 'true');
    const old = btn.textContent;
    btn.textContent = t('Suche …');
    setStatus(t('Ich suche die Lobby in allen Spielen …'), 'wait');
    try {
      const found = await findGame(code);
      if (found.length === 1) { setStatus(`Gefunden: ${found[0].name}!`, 'ok'); go(found[0], code); return; }
      if (found.length > 1) setStatus(t('Den Code gibt es in mehreren Spielen. Tipp unten auf das richtige Spiel.'), 'err');
      else setStatus(t('Keine offene Lobby mit diesem Code gefunden. Stimmt der Code? Oder wähl das Spiel unten aus.'), 'err');
    } catch (err) {
      setStatus(t('Konnte nicht automatisch suchen. Wähl bitte unten das Spiel aus.'), 'err');
    } finally {
      btn.removeAttribute('aria-busy');
      btn.textContent = old;
    }
  });

  // ?join=ABCD in der URL füllt das Feld vor
  const pre = new URLSearchParams(location.search).get('join');
  if (pre) {
    input.value = cleanCode(pre);
    setStatus(t('Code eingetragen – tipp auf „Los“, um beizutreten.'), 'ok');
  }
  openSettingsIfHash();
}

// ---------------------------------------------------------------------------
// Spielerzahlen: keine feste Grenze, sondern Gerät + Spieldynamik.
// ---------------------------------------------------------------------------
function initCapacity() {
  const cards = Array.from(document.querySelectorAll('[data-cap-game]'));
  if (!cards.length) return;
  const values = cards.map((el) => {
    const id = el.dataset.capGame;
    const c = capacity(id);
    el.textContent = c.rangeLabel;
    el.title = capacityHint(id);
    el.setAttribute('aria-label', `${c.rangeLabel} ${t('Personen · geschätzt')}`);
    return c;
  });
  const technical = Math.max(...values.map((c) => c.technical));
  const idealMin = Math.min(...values.map((c) => c.idealMin));
  const idealMax = Math.max(...values.map((c) => c.idealMax));
  const d = values[0];
  const note = $('zbCapacityNote');
  if (note) {
    note.textContent = locale() === 'en'
      ? `Ideal per game ${idealMin}–${idealMax} · smooth up to ~${technical} on this device`
      : `Ideal je Spiel ${idealMin}–${idealMax} · auf diesem Gerät bis ~${technical} flüssig`;
    note.title = locale() === 'en'
      ? `Estimated from ${d.cores} CPU cores, ~${d.ram} GB RAM and ~${d.downlink} Mbit/s. No fixed limit – the host decides.`
      : `Geschätzt aus ${d.cores} CPU-Kernen, ~${d.ram} GB RAM und ~${d.downlink} Mbit/s Verbindung. Kein festes Limit – der Host entscheidet.`;
  }
}

// ---------------------------------------------------------------------------
// "Zum Home-Bildschirm" (iPhone/iPad Safari)
// ---------------------------------------------------------------------------
function initInstallHint() {
  const box = $('installHint');
  if (!box) return;
  const standalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let dismissed = false;
  try { dismissed = localStorage.getItem('ph_install_hint') === 'off'; } catch (e) {}
  if (ios && !standalone && !dismissed) box.classList.remove('hidden');
  const close = $('installClose');
  if (close) close.onclick = () => {
    box.classList.add('hidden');
    try { localStorage.setItem('ph_install_hint', 'off'); } catch (e) {}
  };
}

// ---------------------------------------------------------------------------
// Einstellungen (ein Fenster; Inhalt der Tarn-Optionen kommt aus tarnung.js)
// ---------------------------------------------------------------------------
let lastFocusEl = null;

function openSettings() {
  const m = $('zbSettingsModal');
  if (!m) return;
  lastFocusEl = document.activeElement;
  m.classList.remove('hidden');
  document.documentElement.style.overflow = 'hidden';
  window.dispatchEvent(new CustomEvent('zb:settings-opened'));
  setTimeout(() => {
    const first = m.querySelector('button, input, select, a');
    if (first) { try { first.focus({ preventScroll: true }); } catch (e) {} }
  }, 40);
}

function closeSettings() {
  const m = $('zbSettingsModal');
  if (!m) return;
  m.classList.add('hidden');
  document.documentElement.style.overflow = '';
  try { if (lastFocusEl && lastFocusEl.focus) lastFocusEl.focus({ preventScroll: true }); } catch (e) {}
}

function initSettings() {
  [$('zbOpenSettings'), $('zbOpenSettings2'), $('zbMe')].forEach((b) => {
    if (!b) return;
    b.onclick = (e) => { e.preventDefault(); openSettings(); };
  });
  const close = $('zbCloseSettings'), modal = $('zbSettingsModal');
  if (close) close.onclick = closeSettings;
  if (modal) {
    modal.addEventListener('click', (e) => { if (e.target === modal) closeSettings(); });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) { e.stopPropagation(); closeSettings(); }
    }, true);
  }
}

// Kurzfassung in der Einstellungen-Karte
function paintSetSummary() {
  const el = $('zbSetSummary');
  if (!el) return;
  let on = false;
  try { on = localStorage.getItem('zb_tarn_on') === '1'; } catch (e) {}
  el.textContent = on
    ? t('Tarnmodus ist an – Titel, Symbol und Tarnseite sind gesetzt.')
    : t('Titel, Symbol und Tarnseite für den Fall der Fälle');
}

// ---------------------------------------------------------------------------
// Zahlen auf der Startseite (Mini-Statistik + Siege auf den Karten)
// ---------------------------------------------------------------------------
function paintNumbers() {
  const s = summary();
  const decided = s.tot.won + s.tot.lost;
  const cells = !s.tot.played
    ? [['0', t('Partien')], ['–', t('Siege')], ['–', t('Siegquote')]]
    : [[s.tot.played, t('Partien')], [s.tot.won, t('Siege')], [decided ? Math.round((s.tot.won / decided) * 100) + ' %' : '–', t('Siegquote')]];
  const html = cells.map(([v, l]) => `<div class="stat-cell"><b>${v}</b><span>${l}</span></div>`).join('');
  ['zbMiniStats', 'zbMiniStats2'].forEach((id) => {
    const box = $(id);
    if (box) box.innerHTML = html;
  });

  // Sieg-Marke auf den Spielkarten
  document.querySelectorAll('[data-stat]').forEach((el) => {
    const g = statsFor(el.dataset.stat);
    if (!g.played) { el.textContent = ''; el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    el.textContent = locale() === 'en' ? `${g.won}/${g.played} won` : `${g.won}/${g.played} Siege`;
    el.title = locale() === 'en'
      ? `${g.name}: ${g.played} matches, ${g.won} wins`
      : `${g.name}: ${g.played} Partien, ${g.won} Siege`;
  });
}
function syncMinis() { paintNumbers(); }

function initStatsLinks() {
  paintNumbers();
  window.addEventListener('zb:stats-changed', paintNumbers);
  window.addEventListener('zb:profile-changed', paintNumbers);
  window.addEventListener('zb:lang-changed', () => { paintNumbers(); paintSetSummary(); });
  window.addEventListener('zb:geo-lang', () => { paintNumbers(); paintSetSummary(); });
  window.addEventListener('storage', (e) => {
    if (e.key === 'zb_stats_v1') paintNumbers();
    if (e.key === 'zb_tarn_on') paintSetSummary();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) paintNumbers(); });
  window.addEventListener('zb-tarnung-config', paintSetSummary);
}

// ---------------------------------------------------------------------------
// Offline: Service Worker anmelden (nur auf http/https, nicht lokal per Datei)
// ---------------------------------------------------------------------------
function initOffline() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  try {
    navigator.serviceWorker.register(new URL('../sw.js', import.meta.url), { scope: '../' }).catch(() => {});
  } catch (e) {}
}

paintArt();
initOffline();
initSettings();
initStatsLinks();
initCapacity();
initProfile();
initJoin();
initInstallHint();
paintSetSummary();
window.phToast = toast;
window.zbToast = toast;
window.zbCapacity = { capacity, capacityHint };
window.zbHub = { openSettings, closeSettings };
window.addEventListener('zb:lang-changed', paintArt);
