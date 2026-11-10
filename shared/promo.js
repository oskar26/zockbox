// Zockbox – dezente Eigenwerbung für Hain und github.com/oskar26. made by Oskar
//
// Grundsätze: nie aufdringlich, nie blockierend, nie mehr als ein Pop-up pro Sitzung,
// sofort weg, wenn der Tarnmodus aktiv ist. Alles lokal, keine externen Requests,
// keine Tracker, keine Cookies. Einbinden mit einer Zeile:
//   Startseite: <script type="module" src="shared/promo.js"></script>
//   Spiel:      <script type="module" src="../../shared/promo.js"></script>
//
// localStorage:
//   zb_ads_on          '0' = alle Hinweise aus (Schalter in den Einstellungen)
//   zb_hain_optout     '1' = keine Pop-ups / kein schwebender Hinweis mehr
//   zb_hain_chip       'off' = schwebender Hinweis geschlossen
//   zb_hain_modal_ts   Zeitstempel des letzten Pop-ups (7 Tage Pause)
// sessionStorage:
//   zb_hain_modal      '1' = in dieser Sitzung schon gezeigt

const K = {
  ads: 'zb_ads_on', optout: 'zb_hain_optout', chip: 'zb_hain_chip',
  ts: 'zb_hain_modal_ts', session: 'zb_hain_modal',
};
const HAIN = 'https://oskar26.github.io/hain/';
const HAIN_REPO = 'https://github.com/oskar26/hain';
const HAIN_APK = 'https://github.com/oskar26/hain/releases/latest';
const GITHUB = 'https://github.com/oskar26';
const COOLDOWN = 7 * 24 * 60 * 60 * 1000;
const MODAL_DELAY = 15000;
const CHIP_DELAY = 20000;
const IDLE_MS = 5000;

const asset = (f) => new URL('../assets/promo/' + f, import.meta.url).href;
const ls = {
  get(k, d = '') { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};
const ss = {
  get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
};

const CSS = `
.zb-ads-hidden .zx-promo-inline,.zb-ads-hidden .zx-promo-band,.zb-ads-hidden .zx-ads,
.zb-ads-hidden #zbPromoModal,.zb-ads-hidden #zbPromoChip{display:none!important}
html.zb-ads-hidden .zx-foot-links a[href*="hain"],html.zb-ads-hidden .zx-foot-links a[href*="github.com/oskar26"],
html.zb-ads-hidden .zx-top-link[href*="github.com/oskar26"]{display:none}
#zbPromoModal{position:fixed;inset:0;z-index:95;display:flex;align-items:flex-end;justify-content:center;
  padding:16px;background:rgba(20,22,26,.2);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);
  font:14px/1.55 'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;color:#191b1e;
  animation:zbPMin .24s ease-out}
@keyframes zbPMin{from{opacity:0}}
#zbPromoModal .zb-pm-card{position:relative;width:min(430px,100%);padding:20px;background:#fff;
  border:1px solid #dfe1dd;border-radius:12px;box-shadow:0 18px 50px rgba(20,22,26,.16);
  animation:zbPMup .28s cubic-bezier(.2,.8,.3,1)}
@keyframes zbPMup{from{transform:translateY(14px);opacity:0}}
#zbPromoModal .zb-pm-x{position:absolute;top:9px;right:9px;width:28px;height:28px;border:0;border-radius:5px;
  background:transparent;color:#8a8f92;font-size:15px;line-height:1;cursor:pointer}
#zbPromoModal .zb-pm-x:hover{background:#f2f2ef;color:#191b1e}
#zbPromoModal .zb-pm-head{display:flex;align-items:center;gap:12px;padding-right:26px}
#zbPromoModal .zb-pm-ic{width:42px;height:42px;flex:none;border-radius:10px;background:#f4f4f1;
  border:1px solid #e4e5e1;object-fit:cover}
#zbPromoModal .zb-pm-svg{width:42px;height:42px;flex:none;display:grid;place-items:center;
  border-radius:10px;background:#f4f4f1;border:1px solid #e4e5e1}
#zbPromoModal .zb-pm-svg svg{width:23px;height:23px;fill:#191b1e}
#zbPromoModal .zb-pm-eye{font-size:10px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;color:#2d5b4f}
#zbPromoModal .zb-pm-head h2{margin:2px 0 0;font-size:15px;font-weight:600;letter-spacing:-.025em;line-height:1.3}
#zbPromoModal .zb-pm-body{margin:13px 0 0;font-size:12.5px;line-height:1.6;color:#4c5157}
#zbPromoModal .zb-pm-shots{display:flex;gap:8px;justify-content:center;margin:14px 0 0}
#zbPromoModal .zb-pm-shots img{width:66px;height:128px;object-fit:cover;object-position:top center;
  border:1px solid #e4e5e1;border-radius:6px;background:#f4f4f1}
#zbPromoModal .zb-pm-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:16px}
#zbPromoModal .zb-pm-btn{display:inline-flex;align-items:center;justify-content:center;height:35px;padding:0 14px;
  border-radius:7px;font-size:12.5px;font-weight:600;letter-spacing:-.01em;cursor:pointer}
#zbPromoModal .zb-pm-btn.pri{background:#191b1e;border:1px solid #191b1e;color:#fff}
#zbPromoModal .zb-pm-btn.pri:hover{background:#33373d}
#zbPromoModal .zb-pm-btn.sec{background:#fff;border:1px solid #d2d4cf;color:#3c4147}
#zbPromoModal .zb-pm-btn.sec:hover{background:#f6f6f3}
#zbPromoModal .zb-pm-later{margin-left:auto;background:none;border:0;color:#8a8f92;font-size:11px;
  text-decoration:underline;text-underline-offset:2px;cursor:pointer;padding:6px 2px}
#zbPromoModal .zb-pm-later:hover{color:#191b1e}
#zbPromoModal .zb-pm-hint{margin:10px 0 0;font-size:10.5px;color:#a2a6a4}
#zbPromoChip .zb-pc-gh::after{content:'';display:inline-block;width:4px;height:4px;margin-left:5px;
  border-top:1.3px solid currentColor;border-right:1.3px solid currentColor;transform:rotate(45deg);vertical-align:middle}
#zbPromoChip{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:calc(14px + env(safe-area-inset-bottom));
  z-index:60;display:flex;align-items:center;gap:9px;padding:7px 8px 7px 7px;max-width:calc(100vw - 28px);
  background:rgba(255,255,255,.96);border:1px solid #dfe1dd;border-radius:999px;
  box-shadow:0 6px 22px rgba(0,0,0,.13);color:#191b1e;opacity:.94;
  font:12px/1 'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
  animation:zbPCin .35s ease-out}
@keyframes zbPCin{from{opacity:0;transform:translateY(8px)}}
#zbPromoChip:hover{opacity:1}
#zbPromoChip img{width:26px;height:26px;border-radius:7px;object-fit:cover;flex:none}
#zbPromoChip .zb-pc-txt{display:flex;flex-direction:column;gap:2px;min-width:0}
#zbPromoChip .zb-pc-txt b{font-weight:600;font-size:11.5px;white-space:nowrap}
#zbPromoChip .zb-pc-txt span{font-size:10px;color:#7a7f83;white-space:nowrap}
#zbPromoChip .zb-pc-x{width:22px;height:22px;flex:none;border:0;border-radius:50%;background:#f1f1ee;
  color:#8a8f92;font-size:12px;line-height:1;cursor:pointer}
#zbPromoChip .zb-pc-x:hover{background:#e6e7e3;color:#191b1e}
#zbPromoChip .zb-pc-gh{font-size:10.5px;color:#2d5b4f;font-weight:600;white-space:nowrap;padding:0 3px}
@media (max-width:420px){#zbPromoChip .zb-pc-gh{display:none}}
@media (prefers-reduced-motion:reduce){#zbPromoModal,#zbPromoModal .zb-pm-card,#zbPromoChip{animation:none}}
`;

const GITHUB_MARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.72 2.11 2.54 1.5.08-1.17.39-1.97.71-2.42-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.33-2.64 5.28-5.15 5.56.4.35.76 1.04.76 2.1v3.11c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8z"/></svg>';

function injectCSS() {
  if (document.getElementById('zb-promo-css')) return;
  const st = document.createElement('style');
  st.id = 'zb-promo-css'; st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);
}

// ---------------------------------------------------------------------------
// Zustand
// ---------------------------------------------------------------------------
let modalEl = null, chipEl = null, lastFocus = null, idleAt = Date.now();
let timers = [];

const adsEnabled = () => ls.get(K.ads, '1') !== '0';
const popupsEnabled = () => adsEnabled() && ls.get(K.optout) !== '1' &&
  (Date.now() - Number(ls.get(K.ts, '0') || 0) > COOLDOWN);
const chipAllowed = () => adsEnabled() && ls.get(K.optout) !== '1' && ls.get(K.chip) !== 'off';

function tarnActive() {
  if (document.getElementById('zbTarnOverlay')) return true;
  try { return localStorage.getItem('zb_tarn_on') === '1' || !!(window.zbTarnung && window.zbTarnung.isPanic()); }
  catch (e) { return false; }
}

function syncVisibility() {
  const hidden = !adsEnabled() || tarnActive();
  document.documentElement.classList.toggle('zb-ads-hidden', hidden);
  if (hidden) { closeModal(false); if (chipEl) chipEl.remove(), chipEl = null; }
}

// ---------------------------------------------------------------------------
// Pop-up: maximal einmal pro Sitzung, frühestens nach 15 s, nur bei Ruhe
// ---------------------------------------------------------------------------
const VARIANTS = [
  {
    kind: 'privacy',
    eye: 'Ein anderes Projekt von Oskar',
    title: 'Hain – KI, die auf dem Handy bleibt',
    body: 'Hain ist eine kostenlose Android-App mit einem Assistenten, der komplett auf dem Gerät läuft. Kein Konto, keine Cloud, keine Werbung, kein Tracking – nach dem Download sogar offline.',
    shots: ['shot-chat.webp', 'shot-pim.webp'],
    primary: ['Hain ansehen', HAIN], secondary: ['Quellcode', HAIN_REPO],
  },
  {
    kind: 'offline',
    eye: 'Hain · Open Source',
    title: 'Antworten, ohne dass Daten das Handy verlassen',
    body: 'Antwortkarten, Nachrichten-Leser, Dokumente und Wikipedia offline: Hain nutzt kleine Modelle direkt auf dem Gerät. Wetter, Suche und Nachrichten gehen nur auf deine Anfrage ins Netz – und werden protokolliert.',
    shots: ['shot-cards.webp', 'shot-news.webp'],
    primary: ['Webseite ansehen', HAIN], secondary: ['APK herunterladen', HAIN_APK],
  },
  {
    kind: 'github',
    eye: 'Offene Projekte',
    title: 'Alles von Oskar auf GitHub',
    body: 'Zockbox, Hain und weitere Experimente liegen mit vollständigem Quellcode auf GitHub. Schau gern vorbei – Issues, Ideen und Verbesserungen sind willkommen.',
    shots: [],
    primary: ['GitHub @oskar26', GITHUB], secondary: ['Hain-Repo', HAIN_REPO],
  },
];

function variantHtml(v) {
  const icon = v.kind === 'github'
    ? `<span class="zb-pm-svg">${GITHUB_MARK}</span>`
    : `<img class="zb-pm-ic" src="${asset('hain-icon.webp')}" alt="Hain App-Icon" width="42" height="42">`;
  const shots = v.shots.length
    ? `<div class="zb-pm-shots">${v.shots.map((f) => `<img src="${asset(f)}" alt="Hain Screenshot" loading="lazy">`).join('')}</div>` : '';
  return `<div class="zb-pm-card" role="dialog" aria-modal="true" aria-labelledby="zbPmTitle">
    <button type="button" class="zb-pm-x" data-promo="close" aria-label="Schließen">×</button>
    <div class="zb-pm-head">${icon}<div><div class="zb-pm-eye">${v.eye}</div><h2 id="zbPmTitle">${v.title}</h2></div></div>
    <p class="zb-pm-body">${v.body}</p>
    ${shots}
    <div class="zb-pm-actions">
      <a class="zb-pm-btn pri" href="${v.primary[1]}" target="_blank" rel="noopener noreferrer">${v.primary[0]}</a>
      <a class="zb-pm-btn sec" href="${v.secondary[1]}" target="_blank" rel="noopener noreferrer">${v.secondary[0]}</a>
      <button type="button" class="zb-pm-later" data-promo="later">Nicht mehr anzeigen</button>
    </div>
    <p class="zb-pm-hint">Eigene Projekte · keine Werbung von Dritten · jederzeit abschaltbar unter Einstellungen.</p>
  </div>`;
}

function closeModal(markSeen = true) {
  if (!modalEl) return;
  modalEl.remove(); modalEl = null;
  window.removeEventListener('keydown', onModalKey, true);
  if (markSeen) { ss.set(K.session, '1'); ls.set(K.ts, String(Date.now())); }
  try { if (lastFocus && lastFocus.focus) lastFocus.focus(); } catch (e) {}
  lastFocus = null;
}

function onModalKey(e) {
  if (e.key === 'Escape') { e.stopPropagation(); closeModal(); }
}

function openModal() {
  // Pop-ups nur auf der Startseite – in den Spielen gibt es nur den kleinen Chip.
  if (!document.body.classList.contains('zx')) return;
  if (modalEl || !popupsEnabled() || tarnActive() || document.hidden) return;
  if (ss.get(K.session) === '1') return;
  if (Date.now() - idleAt < IDLE_MS) { scheduleModal(4000); return; }
  const list = VARIANTS;
  const v = list[Math.floor(Math.random() * list.length)];
  injectCSS();
  lastFocus = document.activeElement;
  modalEl = document.createElement('div');
  modalEl.id = 'zbPromoModal';
  modalEl.className = 'zx-modal zx-ads';
  modalEl.innerHTML = variantHtml(v);
  modalEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-promo]');
    if (!b) { if (e.target === modalEl) closeModal(); return; }
    if (b.dataset.promo === 'close') closeModal();
    if (b.dataset.promo === 'later') { ls.set(K.optout, '1'); closeModal(); removeChip(true); }
  });
  modalEl.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => closeModal()));
  document.body.appendChild(modalEl);
  window.addEventListener('keydown', onModalKey, true);
  const x = modalEl.querySelector('.zb-pm-x');
  if (x) x.focus({ preventScroll: true });
}

function scheduleModal(ms = MODAL_DELAY) {
  timers.push(setTimeout(() => {
    if (!popupsEnabled() || tarnActive()) return;
    if (document.hidden) { scheduleModal(8000); return; }
    openModal();
  }, ms));
}

// ---------------------------------------------------------------------------
// Schwebender Mini-Hinweis auf den Spieleseiten (sehr klein, leicht zu schließen)
// ---------------------------------------------------------------------------
function removeChip(permanent = false) {
  if (chipEl) chipEl.remove(), chipEl = null;
  if (permanent) ls.set(K.chip, 'off');
}

function showChip() {
  if (chipEl || !chipAllowed() || tarnActive()) return;
  if (document.body.classList.contains('zx')) return;
  if (modalEl) { timers.push(setTimeout(showChip, 12000)); return; }
  if (document.hidden) { timers.push(setTimeout(showChip, 10000)); return; }
  injectCSS();
  chipEl = document.createElement('div');
  chipEl.id = 'zbPromoChip';
  chipEl.className = 'zb-promo-chip';
  chipEl.innerHTML = `<img src="${asset('hain-icon.webp')}" alt="" width="26" height="26">
    <a href="${HAIN}" target="_blank" rel="noopener noreferrer" style="display:flex;gap:9px;align-items:center;min-width:0">
      <span class="zb-pc-txt"><b>Hain · Private KI</b><span>Kein Konto, keine Cloud</span></span>
    </a>
    <a class="zb-pc-gh" href="${GITHUB}" target="_blank" rel="noopener noreferrer">GitHub</a>
    <button type="button" class="zb-pc-x" aria-label="Hinweis schließen">×</button>`;
  chipEl.querySelector('.zb-pc-x').onclick = () => removeChip(true);
  chipEl.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => removeChip(true)));
  document.body.appendChild(chipEl);
}

// ---------------------------------------------------------------------------
// Einstellungen / Ereignisse
// ---------------------------------------------------------------------------
function mountAdsSwitch() {
  const sw = document.getElementById('zbAdsOn');
  if (!sw) return;
  const render = () => sw.setAttribute('aria-checked', String(adsEnabled()));
  render();
  sw.addEventListener('click', () => {
    const next = !adsEnabled();
    ls.set(K.ads, next ? '1' : '0');
    render();
    syncVisibility();
    if (!next) { closeModal(false); removeChip(true); }
    if (window.phToast) window.phToast(next ? 'Hinweise wieder eingeschaltet' : 'Hinweise ausgeschaltet');
  });
  window.addEventListener('storage', (e) => {
    if (e.key === K.ads) { render(); syncVisibility(); }
    else if (e.key && e.key.startsWith('zb_tarn_')) syncVisibility();
  });
}

function init() {
  injectCSS();
  syncVisibility();
  mountAdsSwitch();

  // Nur auf Seiten, die keine Einladung / laufende Lobby im Link haben.
  const invite = /[?&](code|join|pub)=/.test(location.search);
  const detailFocus = () => { idleAt = Date.now(); };
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((t) =>
    window.addEventListener(t, detailFocus, { passive: true, capture: true }));

  window.addEventListener('zb-tarnung-config', syncVisibility);
  window.addEventListener('zb-tarnung', (e) => {
    if (e && e.detail && e.detail.active) { closeModal(false); removeChip(); syncVisibility(); }
    else syncVisibility();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) syncVisibility(); });

  if (invite) return; // bei Einladungen keine Hinweise
  if (document.body.classList.contains('zx')) scheduleModal();
  timers.push(setTimeout(showChip, CHIP_DELAY));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
