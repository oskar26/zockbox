// Zockbox – Statistikseite. made by Oskar
// Liest nur shared/stats.js (localStorage) und zeichnet die Seite. Kein Netzwerk.
import { summary, last14, GAME_META, exportStats, resetStats } from './stats.js';
import { getProfile } from './profile.js';
import { t, locale, retranslate } from './i18n.js';
import { gameLogo, GAME_NAMES } from './game-art.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (n) => `${Math.round((n || 0) * 100)} %`;
const nameOf = (id) => GAME_NAMES[id] || (GAME_META[id] && GAME_META[id].name) || id;
const iconOf = (id) => `<span class="gm-ic" aria-hidden="true">${gameLogo(id)}</span>`;
const show = (el, on) => { if (el) el.classList.toggle('hidden', !on); };

function kpis(s) {
  const tot = s.tot;
  const decided = tot.won + tot.lost;
  const cells = [
    { v: tot.played, l: t('Partien') },
    { v: tot.won, l: t('Siege') },
    { v: decided ? pct(tot.won / decided) : '–', l: t('Siegquote') },
    { v: tot.streak || '0', l: tot.streak === 1 ? t('Sieg in Folge') : t('Siege in Folge') },
  ];
  $('stKpis').innerHTML = cells.map((c) => `<div class="stat-cell"><b>${esc(c.v)}</b><span>${esc(c.l)}</span></div>`).join('');
}

function games(s) {
  const body = $('stGames');
  const empty = $('stGamesEmpty');
  const note = $('stGamesNote');
  if (!s.games.length) {
    body.innerHTML = '';
    show(empty, true);
    if (note) note.textContent = '';
    return;
  }
  show(empty, false);
  body.innerHTML = s.games.map((g) => {
    const decided = g.won + g.lost;
    const rate = decided ? g.won / decided : 0;
    const place = g.places && g.places.length ? g.avgPlace.toFixed(1) : '–';
    const pts = g.played ? String(Math.round(g.avgPts || 0)) : '–';
    return `<tr>
      <td><span class="st-g">${iconOf(g.id)}<span>${esc(nameOf(g.id))}<small>${g.played === 1 ? t('1 Partie') : `${g.played} ${t('Partien')}`}${g.bestStreak > 1 ? ` · ${t('Serie')} ${g.bestStreak}` : ''}</small></span></span></td>
      <td class="num">${g.played}</td>
      <td class="num">${g.won}</td>
      <td class="num"><span class="st-rate"><span class="bar" aria-hidden="true"><i style="width:${Math.round(rate * 100)}%"></i></span><b>${decided ? pct(rate) : '–'}</b></span></td>
      <td class="num hide-sm">${place}</td>
      <td class="num hide-sm">${pts}</td>
    </tr>`;
  }).join('');
  if (note) note.textContent = locale() === 'en'
    ? `${s.games.length} ${s.games.length === 1 ? 'game' : 'games'} played`
    : `${s.games.length} ${s.games.length === 1 ? 'Spiel' : 'Spiele'} gespielt`;
}

function people(s) {
  const body = $('stPeople');
  const empty = $('stPeopleEmpty');
  if (!s.people.length) {
    body.innerHTML = '';
    show(empty, true);
    return;
  }
  show(empty, false);
  const me = (getProfile().name || '').trim().toLowerCase();
  body.innerHTML = s.people.map((p, i) => {
    const mine = p.name.toLowerCase() === me;
    return `<tr class="${mine ? 'me-row' : ''}">
      <td class="rank">${i + 1}</td>
      <td><span class="st-g"><span>${esc(p.name)}${mine ? ' ' + t('(du)') : ''}<small>${p.won} ${p.won === 1 ? t('Sieg') : t('Siege')} · ${p.played} ${t('Partien')}</small></span></span></td>
      <td class="num">${p.played}</td>
      <td class="num">${p.won}</td>
      <td class="num"><b>${pct(p.rate)}</b></td>
    </tr>`;
  }).join('');
}

function days() {
  const list = last14();
  const max = Math.max(1, ...list.map((d) => d.played));
  $('stDays').innerHTML = list.map((d) => {
    const h = d.played ? Math.max(6, Math.round((d.played / max) * 100)) : 3;
    const label = new Date(d.ts).toLocaleDateString(locale(), { weekday: 'short' }).slice(0, 2);
    return `<div class="d${d.played ? '' : ' zero'}" title="${d.played} ${t('Partien')}, ${d.won} ${t('Siege')}">
      <b>${d.played || ''}</b><i style="height:${h}%"></i><span>${esc(label)}</span></div>`;
  }).join('');
}

function history(s) {
  const list = $('stHist');
  const empty = $('stHistEmpty');
  if (!s.history.length) {
    list.innerHTML = '';
    show(empty, true);
    return;
  }
  show(empty, false);
  list.innerHTML = s.history.slice(0, 12).map((h) => {
    const when = new Date(h.ts).toLocaleDateString(locale(), { day: '2-digit', month: '2-digit' }) + ' · ' +
      new Date(h.ts).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
    const place = h.win ? `<span class="h-win">${t('Sieg')}</span>` : `<span class="h-place">${h.place}. ${t('Platz')}</span>`;
    return `<li>
      ${iconOf(h.g)}
      <span class="h-tx"><b>${esc(nameOf(h.g))}</b><small>${h.players} ${t('Spieler')} · ${place}${h.score ? ` · ${h.score} ${t('Punkte')}` : ''}</small></span>
      <span class="h-when">${esc(when)}</span>
    </li>`;
  }).join('');
}

function draw() {
  const s = summary();
  kpis(s); games(s); people(s); days(s); history(s);
  retranslate();
}

$('stExport').onclick = async () => {
  const txt = exportStats();
  const btn = $('stExport');
  try {
    await navigator.clipboard.writeText(txt);
    btn.textContent = t('In die Zwischenablage kopiert ✓');
    setTimeout(() => { btn.textContent = t('Statistik exportieren'); }, 2200);
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
