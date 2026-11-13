// Zockbox – fester Hinweis auf Hain (eigenes Projekt). made by Oskar
//
// Regeln:
//   · Nur Hain – keine Fremdwerbung, keine Tracker, keine externen Skripte.
//   · Der Hinweis gehört zur Zockbox und lässt sich nicht ausschalten oder wegklicken.
//   · Startseite/Statistik: feste Inline-Karte (im HTML). Spiele: kleiner Chip unten
//     rechts, der nach kurzer Zeit zu einem Symbol schrumpft (bleibt aber sichtbar).
//   · Nur beim Tarnmodus verschwindet alles sofort – sonst wäre die Tarnung verraten.
//
// Einbinden mit einer Zeile:
//   Startseite: <script type="module" src="shared/promo.js"></script>
//   Spiel:      <script type="module" src="../../shared/promo.js"></script>

import { locale } from './i18n.js';

const HAIN = 'https://oskar26.github.io/hain/';
const CHIP_DELAY = 4000;     // kurz nach dem Laden einblenden
const SHRINK_AFTER = 9000;   // danach nur noch das Symbol

const asset = (f) => new URL('../assets/promo/' + f, import.meta.url).href;

const CSS = `
.zb-ads-hidden .hain,.zb-ads-hidden #zbPromoChip{display:none!important}
#zbPromoChip{position:fixed;right:max(12px,env(safe-area-inset-right));bottom:calc(12px + env(safe-area-inset-bottom));
  z-index:60;display:flex;align-items:center;gap:9px;padding:5px 12px 5px 5px;max-width:calc(100vw - 24px);
  background:rgba(255,255,255,.97);border:1px solid #e3e3e0;border-radius:999px;
  box-shadow:0 4px 18px rgba(0,0,0,.12);color:#16171a;text-decoration:none;
  font:12px/1 'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
  animation:zbPCin .35s ease-out;transition:padding .25s ease,gap .25s ease}
@keyframes zbPCin{from{opacity:0;transform:translateY(8px)}}
#zbPromoChip img{width:28px;height:28px;border-radius:8px;object-fit:cover;flex:none}
#zbPromoChip .zb-pc-txt{display:flex;flex-direction:column;gap:2px;min-width:0;overflow:hidden;
  max-width:200px;transition:max-width .25s ease,opacity .2s ease}
#zbPromoChip .zb-pc-txt b{font-weight:600;font-size:11.5px;white-space:nowrap}
#zbPromoChip .zb-pc-txt span{font-size:10px;color:#77797d;white-space:nowrap}
#zbPromoChip.mini{padding:5px;gap:0}
#zbPromoChip.mini .zb-pc-txt{max-width:0;opacity:0}
#zbPromoChip.mini:hover,#zbPromoChip.mini:focus-visible{padding:5px 12px 5px 5px;gap:9px}
#zbPromoChip.mini:hover .zb-pc-txt,#zbPromoChip.mini:focus-visible .zb-pc-txt{max-width:200px;opacity:1}
@media print{#zbPromoChip{display:none}}
@media (prefers-reduced-motion:reduce){#zbPromoChip,#zbPromoChip .zb-pc-txt{animation:none;transition:none}}
`;

function injectCSS() {
  if (document.getElementById('zb-promo-css')) return;
  const st = document.createElement('style');
  st.id = 'zb-promo-css'; st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);
}

let chipEl = null;

function tarnActive() {
  if (document.getElementById('zbTarnOverlay')) return true;
  try { return !!(window.zbTarnung && window.zbTarnung.isPanic()); }
  catch (e) { return false; }
}

function syncVisibility() {
  document.documentElement.classList.toggle('zb-ads-hidden', tarnActive());
}

function showChip() {
  if (chipEl) return;
  // Startseite, Statistik und 404 haben die feste Inline-Karte.
  if (document.querySelector('.page, .nf, .hain')) return;
  injectCSS();
  const en = locale() === 'en';
  chipEl = document.createElement('a');
  chipEl.id = 'zbPromoChip';
  chipEl.href = HAIN;
  chipEl.target = '_blank';
  chipEl.rel = 'noopener';
  chipEl.setAttribute('aria-label', en ? 'Hain – private AI on your device' : 'Hain – private KI auf deinem Gerät');
  chipEl.innerHTML = `<img src="${asset('hain-icon.webp')}" alt="" width="28" height="28">
    <span class="zb-pc-txt"><b>${en ? 'Hain · private AI' : 'Hain · Private KI'}</b><span>${en ? 'No account, no cloud' : 'Kein Konto, keine Cloud'}</span></span>`;
  document.body.appendChild(chipEl);
  setTimeout(() => chipEl && chipEl.classList.add('mini'), SHRINK_AFTER);
  syncVisibility();
}

function init() {
  injectCSS();
  syncVisibility();
  window.addEventListener('zb-tarnung-config', syncVisibility);
  window.addEventListener('zb-tarnung', syncVisibility);
  document.addEventListener('visibilitychange', syncVisibility);
  setTimeout(showChip, CHIP_DELAY);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
