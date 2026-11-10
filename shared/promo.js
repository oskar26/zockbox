// Zockbox – dezenter Hinweis auf Hain (eigenes Projekt). made by Oskar
//
// Regeln:
//   · Nur Hain – keine Fremdwerbung, keine Tracker, keine externen Skripte.
//   · Der Hinweis ist Teil der Zockbox und nicht abschaltbar (auch kein GitHub-Hinweis mehr).
//   · Keine Pop-ups: nur eine ruhige Inline-Karte auf der Startseite und ein kleiner,
//     schließbarer Chip in den Spielen. Beim Tarnmodus verschwindet alles sofort.
//
// Einbinden mit einer Zeile:
//   Startseite: <script type="module" src="shared/promo.js"></script>
//   Spiel:      <script type="module" src="../../shared/promo.js"></script>
//
// sessionStorage:
//   zb_hain_chip_session   'off' = Chip in dieser Sitzung weggetippt (kommt beim
//                          nächsten Besuch wieder – der Hinweis bleibt bestehen)

const K = { chip: 'zb_hain_chip_session' };
import { t, locale } from './i18n.js';

const HAIN = 'https://oskar26.github.io/hain/';
const HAIN_REPO = 'https://github.com/oskar26/hain';
const HAIN_APK = 'https://github.com/oskar26/hain/releases/latest';
const CHIP_DELAY = 45000;

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
#zbPromoChip .zb-pc-gh{display:none}
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
@media (prefers-reduced-motion:reduce){#zbPromoChip{animation:none}}
`;

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

// Der Hinweis auf Hain gehört zur Zockbox – es gibt keinen dauerhaften Ausschalter.
// Der kleine Chip lässt sich nur für die laufende Sitzung wegtippen.
const adsEnabled = () => true;
const chipAllowed = () => ss.get(K.chip) !== 'off';

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
// Kein Pop-up mehr: Der Hinweis auf Hain steht fest auf der Startseite
// (Inline-Karte + Banner). In den Spielen gibt es nur den kleinen Chip.
// ---------------------------------------------------------------------------
function closeModal() {}

// ---------------------------------------------------------------------------
// Schwebender Mini-Hinweis auf den Spieleseiten (sehr klein, leicht zu schließen)
// ---------------------------------------------------------------------------
function removeChip(permanent = false) {
  if (chipEl) { chipEl.remove(); chipEl = null; }
  if (permanent) ss.set(K.chip, 'off');   // gilt nur bis zum Schließen des Tabs
}

function showChip() {
  if (chipEl || !chipAllowed() || tarnActive()) return;
  if (document.body.classList.contains('zx')) return;
  if (document.hidden) { timers.push(setTimeout(showChip, 10000)); return; }
  injectCSS();
  chipEl = document.createElement('div');
  chipEl.id = 'zbPromoChip';
  chipEl.className = 'zb-promo-chip';
  chipEl.innerHTML = `<img src="${asset('hain-icon.webp')}" alt="" width="26" height="26">
    <a href="${HAIN}" target="_blank" rel="noopener noreferrer" style="display:flex;gap:9px;align-items:center;min-width:0">
      <span class="zb-pc-txt"><b>${locale() === 'en' ? 'Hain · private AI' : 'Hain · Private KI'}</b><span>${locale() === 'en' ? 'No account, no cloud' : 'Kein Konto, keine Cloud'}</span></span>
    </a>
    <button type="button" class="zb-pc-x" aria-label="${t('Hinweis schließen')}">×</button>`;
  chipEl.querySelector('.zb-pc-x').onclick = () => removeChip(true);
  chipEl.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => removeChip(true)));
  document.body.appendChild(chipEl);
}

// ---------------------------------------------------------------------------
// Einstellungen / Ereignisse
// ---------------------------------------------------------------------------
function mountAdsSwitch() {
  // Der Schalter in den Einstellungen ist absichtlich gesperrt.
  const sw = document.getElementById('zbAdsOn');
  if (!sw) return;
  sw.setAttribute('aria-checked', 'true');
  sw.setAttribute('aria-disabled', 'true');
  sw.disabled = true;
  sw.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.phToast) window.phToast(t('Der Hain-Hinweis gehört zur Zockbox und bleibt an.'));
  });
}

function init() {
  injectCSS();
  syncVisibility();
  mountAdsSwitch();

  // Nur auf Seiten, die keine Einladung / laufende Lobby im Link haben.
  const invite = /[?&](code|join|pub)=/.test(location.search);
  window.addEventListener('zb-tarnung-config', syncVisibility);
  window.addEventListener('zb-tarnung', (e) => {
    if (e && e.detail && e.detail.active) { closeModal(false); removeChip(); syncVisibility(); }
    else syncVisibility();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) syncVisibility(); });

  if (invite) return; // bei Einladungen keine Hinweise
  timers.push(setTimeout(showChip, CHIP_DELAY));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
