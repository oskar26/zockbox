// Zockbox – Startseite (Bibliothek): Profil, Einstellungen, "Mit Code beitreten", iPhone-Installationshinweis.
// made by Oskar
import { AVATARS, getProfile, setName, setAvatar, randomName, NAME_MAX } from './profile.js';
import { t, locale } from './i18n.js';
import { capacity, capacityHint } from './capacity.js';
import { summary, statsFor } from './stats.js';

// Spiele, die per Code beitreten können.
// id = interner Schlüssel für die Auswahl-Chips (data-game in index.html).
// peerPrefixes = mögliche Peer-ID-Präfixe (aus shared/net.js: `zockbox-${GAME_ID}-p-CODE`).
// Wenn ein Spiel seine GAME_ID ändert, hier anpassen.
const GAMES = [
  { id: 'machs-meme', name: "Mach's Meme", icon: '😂', path: 'games/machs-meme/', peerPrefixes: ['zockbox-machs-meme-v1-'] },
  { id: 'wikirennen', name: 'Wikirennen', icon: '🏁', path: 'games/wikirennen/', peerPrefixes: ['zockbox-wikirennen-v1-'] },
  { id: 'kritzel-duell', name: 'Kritzel-Duell', icon: '✏️', path: 'games/kritzel-duell/', peerPrefixes: ['zockbox-kritzel-duell-v1-'] }, // GAME_ID 'kritzel-duell-v1'
  { id: 'krakelpost', name: 'Krakelpost', icon: '✉️', path: 'games/krakelpost/', peerPrefixes: ['zockbox-krakelpost-v1-'] }, // GAME_ID 'krakelpost-v1'
];
const PEERJS_URL = new URL('./vendor/peerjs.min.js', import.meta.url).href;

const $ = (id) => document.getElementById(id);

function toast(msg, ms = 2600) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

// ---------------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------------
function initProfile() {
  const prof = getProfile();
  const nameIn = $('phName'), avBtn = $('phAvatar'), grid = $('phAvatarGrid');
  // Dieselben Felder gibt es noch einmal im Einstellungs-Pop-up.
  const nameIn2 = $('phName2'), avBtn2 = $('phAvatar2'), grid2 = $('phAvatarGrid2');

  const paintAll = () => {
    const p = getProfile();
    if (nameIn) nameIn.value = p.name;
    if (nameIn2) nameIn2.value = p.name;
    if (avBtn) avBtn.textContent = p.avatar;
    if (avBtn2) avBtn2.textContent = p.avatar;
    const av = $('zbMeAv'), nm = $('zbMeName');
    if (av) av.textContent = p.avatar;
    if (nm) nm.textContent = p.name || t('Profil');
    paintChat(p);
  };

  // Die Sprechblase im Hero grüßt mit dem eigenen Namen.
  function paintChat(p) {
    const chatAv = document.querySelector('.zx-chat-av');
    if (chatAv) chatAv.textContent = p.avatar;
    const name = p.name || 'Zockbox';
    const a = $('zbChatName'), b = $('zbChatName2'), hi = $('zbChatHi'), hi2 = $('zbChatHi2');
    if (a) a.textContent = name;
    if (b) b.textContent = name;
    if (hi) hi.textContent = p.name ? t('das bist du') : t('sagt hallo');
    if (hi2) hi2.textContent = p.name ? t('Hallo, ich bin') : t('Hallo, hier ist');
    const card = $('phAvatar');
    if (card) card.setAttribute('aria-label', p.name ? `${t('Avatar auswählen')} · ${p.name}` : t('Avatar auswählen'));
  }

  let timer;
  const saved = () => {
    paintAll();
    document.querySelectorAll('#phSaved').forEach((s) => {
      s.classList.add('on'); clearTimeout(timer);
      timer = setTimeout(() => s.classList.remove('on'), 1400);
    });
    syncMinis();
    window.dispatchEvent(new CustomEvent('zb:profile-changed'));
  };

  if (nameIn) nameIn.maxLength = NAME_MAX;
  if (nameIn2) nameIn2.maxLength = NAME_MAX;

  // Avatar-Raster (einmal für beide Stellen aufbauen)
  const buildGrid = (box, onPick) => {
    if (!box) return;
    box.innerHTML = '';
    for (const a of AVATARS) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ph-avatar-opt'; b.textContent = a;
      b.setAttribute('aria-label', t('Avatar auswählen') + ' ' + a);
      if (a === getProfile().avatar) b.setAttribute('aria-pressed', 'true');
      b.onclick = () => {
        setAvatar(a);
        paintAll();
        document.querySelectorAll('.zx-avatar-grid button').forEach((x) => {
          if (x.textContent === a) x.setAttribute('aria-pressed', 'true'); else x.removeAttribute('aria-pressed');
        });
        onPick && onPick();
        saved();
      };
      box.appendChild(b);
    }
  };
  buildGrid(grid, () => toggleGrid(grid, avBtn, false));
  buildGrid(grid2, () => toggleGrid(grid2, avBtn2, false));

  function toggleGrid(box, btn, open) {
    if (!box) return;
    const next = open === undefined ? box.classList.contains('hidden') : open;
    box.classList.toggle('hidden', !next);
    if (btn) btn.setAttribute('aria-expanded', String(next));
  }
  if (avBtn) avBtn.onclick = () => toggleGrid(grid, avBtn);
  if (avBtn2) avBtn2.onclick = () => toggleGrid(grid2, avBtn2);

  [[nameIn, 'phName'], [nameIn2, 'phName2']].forEach(([input, who]) => {
    if (!input) return;
    input.addEventListener('input', () => { setName(input.value); syncMeOnly(); syncMinis(); });
    input.addEventListener('blur', () => { input.value = setName(input.value); paintAll(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
    const others = document.querySelectorAll(who === 'phName' ? '#phName2' : '#phName');
    input.addEventListener('input', () => others.forEach((o) => { o.value = input.value; }));
  });

  const syncMeOnly = () => {
    const p = getProfile();
    paintChat(p);
    const av = $('zbMeAv'), nm = $('zbMeName');
    if (av) av.textContent = p.avatar;
    if (nm) nm.textContent = p.name || t('Profil');
  };

  const dice = () => {
    const n = setName(randomName());
    const a = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    setAvatar(a);
    paintAll();
    saved();
    return n;
  };
  [$('phDice'), $('phDice2')].forEach((b) => { if (b) b.onclick = dice; });

  paintAll();
  return { saved };
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
    s.src = PEERJS_URL; s.onload = () => res(); s.onerror = () => rej(new Error('peerjs'));
    document.head.appendChild(s);
  });
}

// Fragt beim PeerJS-Vermittler nach, in welchem Spiel eine Lobby mit diesem Code offen ist.
// Wir öffnen nur kurz eine Verbindung und schließen sie sofort wieder (kein "hello" → der Host ignoriert uns).
async function findGame(code) {
  await loadPeerJS();
  const peer = await new Promise((resolve, reject) => {
    const p = new window.Peer({ debug: 0 });
    const t = setTimeout(() => { try { p.destroy(); } catch (e) {} reject(new Error('timeout')); }, 9000);
    p.on('open', () => { clearTimeout(t); resolve(p); });
    p.on('error', (err) => { if (!p.open) { clearTimeout(t); try { p.destroy(); } catch (e) {} reject(err); } });
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
    setTimeout(() => { try { if (!done) conn.close(); } catch (e) {} finish(false); }, 6000);
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
  s.textContent = msg; s.dataset.kind = kind;
  s.classList.toggle('hidden', !msg);
}

function initJoin() {
  const input = $('joinCode'), btn = $('joinGo');
  const chips = document.querySelectorAll('#joinGame [data-game]');
  const pick = (id) => {
    selected = id;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.game === id)));
  };
  chips.forEach((c) => c.addEventListener('click', () => { pick(c.dataset.game); setStatus(''); }));
  pick('auto');

  // Vier Buchstaben-Kacheln zeigen, was im (unsichtbaren) Eingabefeld steht.
  const tilesBox = input.closest('.zx-tiles');
  const tiles = tilesBox ? [...tilesBox.querySelectorAll('.zx-tile')] : [];
  const paint = () => {
    const chars = [...input.value];
    tiles.forEach((t, i) => {
      t.textContent = chars[i] || '';
      t.classList.toggle('cur', i === Math.min(chars.length, tiles.length - 1));
    });
  };
  if (tilesBox) {
    input.addEventListener('focus', () => { tilesBox.classList.add('focus'); paint(); });
    input.addEventListener('blur', () => tilesBox.classList.remove('focus'));
    // Cursor immer ans Ende, damit Tippen/Löschen zu den Kacheln passt
    const toEnd = () => { try { const n = input.value.length; input.setSelectionRange(n, n); } catch (e) {} };
    input.addEventListener('click', toEnd);
    input.addEventListener('keyup', toEnd);
  }

  input.addEventListener('input', () => {
    const v = cleanCode(input.value);
    if (v !== input.value) input.value = v;
    paint();
    setStatus('');
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') btn.click(); });

  $('joinForm').addEventListener('submit', async (e) => {
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
      if (found.length === 1) { setStatus(`Gefunden: ${found[0].icon} ${found[0].name}!`, 'ok'); go(found[0], code); return; }
      if (found.length > 1) setStatus(t('Den Code gibt es in mehreren Spielen. Tipp unten auf das richtige Spiel.'), 'err');
      else setStatus(t('Keine offene Lobby mit diesem Code gefunden. Stimmt der Code? Oder wähl das Spiel unten aus.'), 'err');
    } catch (err) {
      setStatus(t('Konnte nicht automatisch suchen. Wähl bitte unten das Spiel aus.'), 'err');
    } finally {
      btn.removeAttribute('aria-busy'); btn.textContent = old;
    }
  });

  // ?join=ABCD in der Hub-URL füllt das Feld vor
  const pre = new URLSearchParams(location.search).get('join');
  if (pre) {
    input.value = cleanCode(pre);
    paint();
    setStatus(t('Code eingetragen – tipp auf „Los“, um beizutreten.'), 'ok');
  }
}

// ---------------------------------------------------------------------------
// Spielerzahlen: keine feste Grenze, sondern Gerät + Spieldynamik.
// Die Zahlen auf den Karten und im Hero werden zur Laufzeit berechnet.
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
  const hero = $('zbCapacity');
  if (hero) {
    hero.textContent = `2–${technical}`;
    const fact = $('zbCapacityFact');
    if (fact) fact.title = locale() === 'en'
        ? `Estimated from ${d.cores} CPU cores, ~${d.ram} GB RAM and ~${d.downlink} Mbit/s. No fixed limit – the host decides.`
        : `Geschätzt aus ${d.cores} CPU-Kernen, ~${d.ram} GB RAM und ~${d.downlink} Mbit/s Verbindung. Kein festes Limit – der Host entscheidet.`;
  }
  const note = $('zbCapacityNote');
  if (note) note.textContent = locale() === 'en'
    ? `Ideal per game ${idealMin}–${idealMax} · smooth up to ~${technical} on this device · host decides`
    : `Ideal je Spiel ${idealMin}–${idealMax} · auf diesem Gerät bis ~${technical} flüssig · Host entscheidet`;
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
  $('installClose').onclick = () => {
    box.classList.add('hidden');
    try { localStorage.setItem('ph_install_hint', 'off'); } catch (e) {}
  };
}

// ---------------------------------------------------------------------------
// Einstellungen als breites Pop-up
// ---------------------------------------------------------------------------
let lastFocusEl = null;

function openSettings() {
  const m = $('zbSettingsModal');
  if (!m) return;
  lastFocusEl = document.activeElement;
  m.classList.remove('hidden');
  document.documentElement.style.overflow = 'hidden';
  const first = m.querySelector('button, input, select, a');
  if (first) setTimeout(() => { try { first.focus({ preventScroll: true }); } catch (e) {} }, 40);
  window.dispatchEvent(new CustomEvent('zb:settings-opened'));
}

function closeSettings() {
  const m = $('zbSettingsModal');
  if (!m) return;
  m.classList.add('hidden');
  document.documentElement.style.overflow = '';
  try { if (lastFocusEl && lastFocusEl.focus) lastFocusEl.focus({ preventScroll: true }); } catch (e) {}
}

function initSettings() {
  const open = $('zbOpenSettings'), close = $('zbCloseSettings'), modal = $('zbSettingsModal');
  if (open) open.onclick = openSettings;
  const dock = $('zbDockSettings');
  if (dock) dock.onclick = openSettings;
  if (close) close.onclick = closeSettings;
  if (modal) {
    modal.addEventListener('click', (e) => { if (e.target === modal) closeSettings(); });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) { e.stopPropagation(); closeSettings(); }
    }, true);
  }
  const hash = location.hash;
  if (hash === '#einstellungen' || hash === '#settings') openSettings();
}

// ---------------------------------------------------------------------------
// Zahlen auf der Startseite: Mini-Statistik im Pop-up und Siege auf den Karten
// ---------------------------------------------------------------------------
function tStats(g) {
  return locale() === 'en'
    ? `${g.name}: won ${g.won} of ${g.played}`
    : `${g.name}: ${g.won} von ${g.played} gewonnen`;
}

function syncMinis() {
  const box = $('zbMiniStats');
  const s = summary();
  const decided = s.tot.won + s.tot.lost;
  if (box) {
    if (!s.tot.played) {
      box.innerHTML = `<div><b>0</b><span>${t('Partien')}</span></div><div><b>–</b><span>${t('Siege')}</span></div><div><b>–</b><span>${t('Siegquote')}</span></div>`;
    } else {
      box.innerHTML = `<div><b>${s.tot.played}</b><span>${t('Partien')}</span></div>
        <div><b>${s.tot.won}</b><span>${t('Siege')}</span></div>
        <div><b>${decided ? Math.round((s.tot.won / decided) * 100) + ' %' : '–'}</b><span>${t('Siegquote')}</span></div>`;
    }
  }
  // Kleine Sieg-Marke auf den Spielkarten (links neben „Öffnen“, nicht darin)
  document.querySelectorAll('[data-stat]').forEach((el) => {
    const id = el.dataset.stat;
    const g = statsFor(id);
    const foot = el.parentElement;
    document.querySelectorAll(`.zx-win-badge[data-for="${id}"]`).forEach((x) => x.remove());
    if (!foot || !g.played) return;
    const b = document.createElement('span');
    b.className = 'zx-win-badge';
    b.dataset.for = id;
    b.textContent = `${g.won}/${g.played}`;
    b.title = locale() === 'en'
      ? `${g.name}: ${g.played} matches, ${g.won} wins, avg. place ${g.avgPlace ? g.avgPlace.toFixed(1) : '–'}`
      : `${g.name}: ${g.played} Partien, ${g.won} Siege, Ø Platz ${g.avgPlace ? g.avgPlace.toFixed(1) : '–'}`;
    b.setAttribute('aria-label', tStats(g));
    foot.insertBefore(b, el);
  });
}

function initStatsLinks() {
  syncMinis();
  window.addEventListener('zb:stats-changed', syncMinis);
  window.addEventListener('zb:profile-changed', syncMinis);
  window.addEventListener('storage', (e) => { if (e.key === 'zb_stats_v1') syncMinis(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) syncMinis(); });
}

// ---------------------------------------------------------------------------
// „Mit Code beitreten“ als eigenes Pop-up – im Hero. Der Chat links
// („Hallo, ich bin …“) ist damit auch auf dem Handy sofort sichtbar.
// ---------------------------------------------------------------------------
function initJoinModal() {
  const modal = $('zbJoinModal'), openBtn = $('zbOpenJoin'), closeBtn = $('zbCloseJoin');
  let lastFocus = null;
  const open = () => {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.remove('hidden');
    document.documentElement.style.overflow = 'hidden';
    const i = $('joinCode');
    // Betreten/Verlassen der Lobby: Neu-Aufbau der Kacheln anstoßen
    window.dispatchEvent(new CustomEvent('zb:join-opened'));
    if (i) setTimeout(() => { try { i.focus({ preventScroll: true }); } catch (e) {} }, 60);
  };
  const close = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    document.documentElement.style.overflow = '';
    try { if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); } catch (e) {}
  };
  if (openBtn) openBtn.onclick = open;
  if (closeBtn) closeBtn.onclick = close;
  if (modal) {
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) { e.stopPropagation(); close(); }
    }, true);
  }
  window.zbJoinModal = { open, close };
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

initOffline();
initJoinModal();
initSettings();
initStatsLinks();
initCapacity();
initProfile();
initJoin();
initInstallHint();
window.phToast = toast;
window.zbToast = toast;
window.zbCapacity = { capacity, capacityHint };
window.zbHub = { openSettings, closeSettings };
