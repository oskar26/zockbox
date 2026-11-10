// Zockbox – Statistikseite. made by Oskar
// Liest nur shared/stats.js (localStorage) und zeichnet die Seite. Kein Netzwerk.
import { summary, last14, GAME_META, exportStats, resetStats } from './stats.js';
import { getProfile } from './profile.js';
import { t, locale } from './i18n.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (n) => `${Math.round((n || 0) * 100)} %`;
const MEDALS = ['🥇', '🥈', '🥉'];

function kpis(s) {
  const t = s.tot;
  const decided = t.won + t.lost;
  const best = s.games.slice().sort((a, b) => b.won - a.won)[0];
  const cards = [
    { v: t.played, l: t('Partien'), hi: false },
    { v: t.won, l: t('Siege'), hi: true },
    { v: decided ? pct(t.won / decided) : '–', l: t('Siegquote'), hi: false },
    { v: t.streak, l: t.streak === 1 ? t('Sieg in Folge') : t('Siege in Folge'), hi: t.streak > 1 },
  ];
  $('stKpis').innerHTML = cards.map((c) => `<div class="st-kpi${c.hi ? ' hi' : ''}"><b>${esc(c.v)}</b><span>${esc(c.l)}</span></div>`).join('')
    + (best && best.won ? `<div class="st-kpi" style="grid-column:1/-1;background:#fff"><b style="font-size:17px;letter-spacing:-.02em">${esc(best.icon)} ${esc(best.name)} <small style="font-size:13px">· ${locale() === 'en' ? `won ${best.won}×` : `${best.won}× gewonnen`}</small></b><span>${t('Dein bestes Spiel')}</span></div>` : '');
}

function games(s) {
  if (!s.games.length) {
    $('stGames').innerHTML = `<div class="st-empty"><b>${t('Noch keine Partie zu Ende gespielt.')}</b>
      ${t('Starte eine Lobby – nach der ersten Runde steht hier, wie es gelaufen ist.')}</div>`;
    return;
  }
  $('stGames').innerHTML = s.games.map((g) => {
    const decided = g.won + g.lost;
    const rate = decided ? g.won / decided : 0;
    const place = g.places.length ? (locale() === 'en' ? `avg. place ${g.avgPlace.toFixed(1)}` : `Ø Platz ${g.avgPlace.toFixed(1)}`) : '–';
    return `<div class="st-grow">
      <span class="st-ic" aria-hidden="true">${esc(g.icon)}</span>
      <div>
        <b>${esc(g.name)}</b>
        <div class="st-meta">${g.played} ${g.played === 1 ? (locale() === 'en' ? 'match' : 'Partie') : t('Partien')} · ${place} · ${locale() === 'en' ? `avg. ${g.avgPts} points` : `Ø ${g.avgPts} Punkte`}${g.bestStreak > 1 ? ` · ${locale() === 'en' ? `streak ${g.bestStreak}` : `Serie ${g.bestStreak}`}` : ''}</div>
        <div class="st-bar" role="img" aria-label="${t('Siegquote')} ${pct(rate)}"><i style="width:${Math.round(rate * 100)}%"></i></div>
      </div>
      <div class="st-gnum"><b>${g.won}<small style="font-size:12px;color:#747a80"> / ${g.played}</small></b><span>${t('Siege')}</span></div>
    </div>`;
  }).join('');
  $('stGamesNote').textContent = locale() === 'en'
    ? `${s.games.length} ${s.games.length === 1 ? 'game' : 'games'} played`
    : `${s.games.length} ${s.games.length === 1 ? 'Spiel' : 'Spiele'} gespielt`;
}

function people(s) {
  if (!s.people.length) {
    $('stPeople').innerHTML = `<div class="st-empty" style="border:0"><b>${t('Noch niemand eingetragen.')}</b> ${t('Spiel eine Runde – dann tauchen hier alle Namen auf, mit denen du gespielt hast.')}</div>`;
    return;
  }
  const me = (getProfile().name || '').trim().toLowerCase();
  $('stPeople').innerHTML = s.people.map((p, i) => `<div class="st-prow${p.name.toLowerCase() === me ? ' me' : ''}">
    <span class="st-p1">${i < 3 && p.won ? MEDALS[i] : i + 1}</span>
    <b>${esc(p.name)}${p.name.toLowerCase() === me ? ' ' + t('(du)') : ''}</b>
    <span class="st-c">${p.won} ${p.won === 1 ? t('Sieg') : t('Siege')}</span>
    <span class="st-c"><b>${pct(p.rate)}</b> <em style="font-style:normal;color:#969b99">· ${p.played}</em></span>
  </div>`).join('');
}

function days() {
  const list = last14();
  const max = Math.max(1, ...list.map((d) => d.played));
  $('stDays').innerHTML = list.map((d) => {
    const h = Math.round((d.played / max) * 100);
    const winH = d.played ? Math.round((d.won / max) * 100) : 0;
    return `<div class="st-day" title="${d.played} ${t('Partien')}, ${d.won} ${t('Siege')}">
      <i class="${d.won ? 'win' : ''}" style="height:${Math.max(3, h)}%;${d.won && d.won < d.played ? `background:linear-gradient(to top,#2d5b4f ${Math.round((winH / h) * 100)}%,#d2d4cf ${Math.round((winH / h) * 100)}%)` : ''}"></i>
      <span>${esc(d.label)}</span></div>`;
  }).join('');
}

function history(s) {
  if (!s.history.length) {
    $('stHist').innerHTML = `<div class="st-empty" style="border:0"><b>${t('Der Verlauf ist noch leer.')}</b> ${t('Nach der ersten beendeten Partie steht hier, was passiert ist.')}</div>`;
    return;
  }
  $('stHist').innerHTML = s.history.slice(0, 12).map((h) => {
    const g = GAME_META[h.g] || { name: h.g, icon: '🎮' };
    const when = new Date(h.ts).toLocaleDateString(locale(), { day: '2-digit', month: '2-digit' }) + ' · ' +
      new Date(h.ts).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
    const place = h.win ? `${MEDALS[0] || '🏆'} ${t('Sieg')}` : `${h.place}. ${t('Platz')}`;
    return `<div class="st-hrow">
      <span class="st-medal" aria-hidden="true">${esc(g.icon)}</span>
      <div><b style="font-weight:500">${esc(g.name)}</b> <em>· ${h.players} ${t('Spieler')} · ${esc(place)}${h.score ? ` · ${h.score} ${t('Punkte')}` : ''}</em></div>
      <em>${esc(when)}</em>
    </div>`;
  }).join('');
}

function draw() {
  const s = summary();
  kpis(s); games(s); people(s); days(s); history(s);
}

$('stExport').onclick = async () => {
  const txt = exportStats();
  try {
    await navigator.clipboard.writeText(txt);
    $('stExport').textContent = t('In die Zwischenablage kopiert ✓');
    setTimeout(() => { $('stExport').textContent = t('Statistik exportieren'); }, 2200);
  } catch (e) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' }));
    a.download = 'zockbox-statistik.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
};

$('stReset').onclick = () => {
  if (!confirm(t('Wirklich alle Zockbox-Statistiken auf diesem Gerät löschen?'))) return;
  resetStats();
  draw();
};

window.addEventListener('zb:stats-changed', draw);
window.addEventListener('zb:lang-changed', draw);
window.addEventListener('zb:geo-lang', draw);
// Statistik kann in einem anderen Tab entstanden sein
window.addEventListener('storage', (e) => { if (e.key === 'zb_stats_v1') draw(); });
window.addEventListener('focus', draw);

draw();
