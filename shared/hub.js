// Zockbox – Startseite: Beitreten, Spiele, Profil, Zahlen, Einstellungen. made by Oskar
//
// Die Seite ist bewusst knapp: Hero, Code, Spiele, Hain-Hinweis.
// Profil, Zahlen und Tarnmodus stecken im Einstellungs-Fenster.
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

function toast(msg, ms = 2600) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  el.setAttribute('role', 'status');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

// ---------------------------------------------------------------------------
// Spielbilder: aus shared/game-art.js (Look der Spiele inkl. Logo)
// ---------------------------------------------------------------------------
function paintArt() {
  document.querySelectorAll('[data-art]').forEach((box) => {
    const id = box.dataset.art;
    if (!id || box.firstElementChild) return;
    box.innerHTML = gameArt(id);
  });
  retranslate();
}

// ---------------------------------------------------------------------------
// Profil (im Einstellungs-Fenster)
// ---------------------------------------------------------------------------
function initProfile() {
  const nameIn = $('phName'), avBtn = $('phAvatar'), grid = $('phAvatarGrid'), dice = $('phDice');
  if (!nameIn) return null;

  const paint = () => {
    const p = getProfile();
    if (nameIn !== document.activeElement) nameIn.value = p.name;
    if (avBtn) avBtn.textContent = p.avatar;
    const av = $('zbMeAv'), nm = $('zbMeName');
    if (av) av.textContent = p.avatar;
    if (nm) nm.textContent = p.name || t('Profil');
    document.querySelectorAll('.prof-grid button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.textContent === p.avatar));
    });
  };

  const changed = () => {
    paint();
    paintNumbers();
    window.dispatchEvent(new CustomEvent('zb:profile-changed'));
  };

  nameIn.maxLength = NAME_MAX;
  nameIn.addEventListener('input', () => { setName(nameIn.value); paint(); });
  nameIn.addEventListener('blur', () => { nameIn.value = setName(nameIn.value); paint(); });
  nameIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') nameIn.blur(); });

  if (grid) {
    grid.innerHTML = '';
    for (const a of AVATARS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = a;
      b.setAttribute('aria-label', `${t('Avatar auswählen')} ${a}`);
      b.onclick = () => { setAvatar(a); changed(); };
      grid.appendChild(b);
    }
  }
  if (avBtn) {
    avBtn.onclick = () => {
      const open = grid.classList.toggle('hidden');
      avBtn.setAttribute('aria-expanded', String(!open));
    };
  }
  if (dice) {
    dice.onclick = () => {
      setName(randomName());
      setAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
      changed();
    };
  }

  paint();
  return { paint };
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
  const input = $('joinCode'), btn = $('joinGo'), form = $('joinForm'), pick = $('joinGame');
  if (!input || !form || !btn) return;

  if (pick) {
    pick.value = selected;
    pick.addEventListener('change', () => { selected = pick.value; setStatus(''); });
  }

  input.addEventListener('input', () => {
    const v = cleanCode(input.value);
    if (v !== input.value) input.value = v;
    setStatus('');
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); btn.click(); }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = cleanCode(input.value);
    const valid = /^[A-Z]{4}$/.test(code) || /^Ö\d$/.test(code);
    if (!valid) { setStatus(t('Der Code hat 4 Buchstaben, z. B. KXPM.'), 'err'); input.focus(); return; }

    if (selected !== 'auto') { go(GAMES.find((g) => g.id === selected), code); return; }

    // Kein btn.disabled: in Chromium „verschluckt“ ein während des Klicks deaktivierter Button danach manchmal Klicks.
    if (btn.getAttribute('aria-busy') === 'true') return;
    btn.setAttribute('aria-busy', 'true');
    const old = btn.textContent;
    btn.textContent = t('Suche …');
    setStatus(t('Ich suche die Lobby in allen Spielen …'), 'wait');
    try {
      const found = await findGame(code);
      if (found.length === 1) { setStatus(`Gefunden: ${found[0].name}!`, 'ok'); go(found[0], code); return; }
      if (found.length > 1) setStatus(t('Den Code gibt es in mehreren Spielen. Wähl oben das richtige Spiel.'), 'err');
      else setStatus(t('Keine offene Lobby mit diesem Code gefunden. Stimmt der Code? Oder wähl oben das Spiel aus.'), 'err');
    } catch (err) {
      setStatus(t('Konnte nicht automatisch suchen. Wähl bitte oben das Spiel aus.'), 'err');
    } finally {
      btn.removeAttribute('aria-busy');
      btn.textContent = old;
    }
  });

  // ?join=ABCD in der URL füllt das Feld vor
  const pre = new URLSearchParams(location.search).get('join');
  if (pre) {
    input.value = cleanCode(pre);
    setStatus(t('Code eingetragen – tipp auf „Beitreten“, um beizutreten.'), 'ok');
  }
}

// ---------------------------------------------------------------------------
// Spielerzahlen: keine feste Grenze, sondern Gerät + Spieldynamik.
// ---------------------------------------------------------------------------
function initCapacity() {
  const note = $('zbCapacityNote');
  if (!note) return;
  const cells = Array.from(document.querySelectorAll('[data-cap-game]'));
  const ids = cells.length ? cells.map((el) => el.dataset.capGame) : GAMES.map((g) => g.id);
  const values = ids.map((id) => {
    const c = capacity(id);
    const el = cells.find((x) => x.dataset.capGame === id);
    if (el) el.textContent = c.rangeLabel;
    return c;
  });
  const technical = Math.max(...values.map((c) => c.technical));
  const idealMin = Math.min(...values.map((c) => c.idealMin));
  const idealMax = Math.max(...values.map((c) => c.idealMax));
  note.textContent = locale() === 'en'
    ? `Ideal per game ${idealMin}–${idealMax} · up to ~${technical} here`
    : `Ideal ${idealMin}–${idealMax} Personen · hier bis ~${technical}`;
  note.title = locale() === 'en'
    ? 'Estimated from this device. No fixed limit – the host decides.'
    : 'Geschätzt aus diesem Gerät. Kein festes Limit – der Host entscheidet.';
}

// ---------------------------------------------------------------------------
// „Zum Home-Bildschirm“ (iPhone/iPad Safari) – ein ruhiger Hinweis, einmal zeigbar
// ---------------------------------------------------------------------------
function initInstallHint() {
  const standalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let dismissed = false;
  try { dismissed = localStorage.getItem('ph_install_hint') === 'off'; } catch (e) {}
  if (!ios || standalone || dismissed) return;
  const box = document.createElement('div');
  box.className = 'install';
  box.innerHTML = `<span aria-hidden="true">📲</span><span>Tipp: In Safari auf <b>Teilen</b> und dann <b>„Zum Home-Bildschirm“</b> – dann startet die Zockbox wie eine App.</span><button type="button" aria-label="Hinweis schließen">×</button>`;
  box.querySelector('button').onclick = () => {
    box.remove();
    try { localStorage.setItem('ph_install_hint', 'off'); } catch (e) {}
  };
  const anchor = document.querySelector('.foot-note');
  if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(box, anchor);
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
    const first = m.querySelector('input, button, select, a');
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
  const id = (location.hash || '').replace('#', '');
  if (id === 'einstellungen' || id === 'settings') openSettings();
  window.addEventListener('hashchange', () => {
    const h = (location.hash || '').replace('#', '');
    if (h === 'einstellungen' || h === 'settings') openSettings();
  });
}

// ---------------------------------------------------------------------------
// Zahlen (Mini-Statistik im Fenster + kleine Sieg-Marke auf den Karten)
// ---------------------------------------------------------------------------
function paintNumbers() {
  const s = summary();
  const decided = s.tot.won + s.tot.lost;
  const cells = !s.tot.played
    ? [['0', t('Partien')], ['–', t('Siege')], ['–', t('Quote')], ['–', t('Serie')]]
    : [
      [s.tot.played, t('Partien')],
      [s.tot.won, t('Siege')],
      [decided ? `${Math.round((s.tot.won / decided) * 100)} %` : '–', t('Quote')],
      [s.tot.streak || 0, t('Serie')],
    ];
  const box = $('zbMiniStats');
  if (box) box.innerHTML = cells.map(([v, l]) => `<div class="stat-cell"><b>${v}</b><span>${l}</span></div>`).join('');

  document.querySelectorAll('[data-stat]').forEach((el) => {
    const g = statsFor(el.dataset.stat);
    if (!g.played) { el.textContent = ''; return; }
    el.textContent = locale() === 'en'
      ? `${g.won} of ${g.played} won`
      : `${g.won} von ${g.played} gewonnen`;
  });
}

function initNumbers() {
  paintNumbers();
  window.addEventListener('zb:stats-changed', paintNumbers);
  window.addEventListener('zb:lang-changed', paintNumbers);
  window.addEventListener('zb:geo-lang', paintNumbers);
  window.addEventListener('storage', (e) => { if (e.key === 'zb_stats_v1') paintNumbers(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) paintNumbers(); });
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
initNumbers();
initCapacity();
initProfile();
initJoin();
initInstallHint();
window.phToast = toast;
window.zbToast = toast;
window.zbCapacity = { capacity, capacityHint };
window.zbHub = { openSettings, closeSettings };
window.addEventListener('zb:lang-changed', () => { paintArt(); initCapacity(); });
