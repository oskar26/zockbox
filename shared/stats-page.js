// Zockbox – Statistikseite. made by Oskar
// Liest nur shared/stats.js (localStorage) und zeichnet die Seite. Kein Netzwerk.
import { summary, GAME_META, exportStats, resetStats } from './stats.js';
import { getProfile } from './profile.js';
import { t, locale, retranslate } from './i18n.js';
import { gameLogo, GAME_NAMES } from './game-art.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (n) => `${Math.round((n || 0) * 100)} %`;
const nameOf = (id) => GAME_NAMES[id] || (GAME_META[id] && GAME_META[id].name) || id;
const iconOf = (id) => `<span class="gm-ic" aria-hidden="true">${gameLogo(id)}</span>`;
const show = (el, on) => { if (el) el.classList.toggle('hidden', !on); };

// ---------------------------------------------------------------------------
// Kurzurteil: wie schneide ich ab?
// ---------------------------------------------------------------------------
function verdict(s) {
  const el = $('stVerdict');
  if (!el) return;
  const tot = s.tot;
  if (!tot.played) {
    el.classList.add('empty-verdict');
    el.textContent = t('Noch keine Partie zu Ende gespielt. Sobald die erste Runde vorbei ist, steht hier, wie du abschneidest.');
    return;
  }
  el.classList.remove('empty-verdict');

  const decided = tot.won + tot.lost;
  const rate = decided ? tot.won / decided : 0;

  // Durchschnittlicher Platz über alle Spiele (nach Partien gewichtet)
  let placeSum = 0, placeN = 0;
  for (const g of s.games) { placeSum += (g.avgPlace || 0) * g.played; placeN += g.played; }
  const avgPlace = placeN ? placeSum / placeN : 0;
  const players = s.history.length ? s.history.reduce((a, h) => a + (h.players || 0), 0) / s.history.length : 0;

  // Bestes Spiel nach Quote (mindestens zwei Partien)
  const best = s.games.filter((g) => g.played >= 2 && g.won + g.lost > 0)
    .sort((a, b) => b.winRate - a.winRate)[0];

  const parts = [
    tot.played === 1
      ? t('Du hast <b>1</b> Partie gespielt')
      : t('Du hast <b>{n}</b> Partien gespielt').replace('{n}', tot.played),
  ];
  if (decided) {
    parts.push(t('und <b>{w}</b> davon gewonnen – Quote <b>{q}</b>.')
      .replace('{w}', tot.won).replace('{q}', pct(rate)));
    if (avgPlace) {
      parts.push(players >= 2
        ? t('Im Schnitt Platz <b>{p}</b> von {n}.').replace('{p}', avgPlace.toFixed(1)).replace('{n}', Math.round(players))
        : t('Im Schnitt Platz <b>{p}</b>.').replace('{p}', avgPlace.toFixed(1)));
    }
    if (best) {
      parts.push(t('Am besten läuft <b>{g}</b> ({q}).')
        .replace('{g}', esc(nameOf(best.id))).replace('{q}', pct(best.winRate)));
    }
  } else {
    parts.push(t('entschieden ist davon noch nichts.'));
  }
  el.innerHTML = parts.join(' ');
}

// ---------------------------------------------------------------------------
// Zahlen
// ---------------------------------------------------------------------------
function kpis(s) {
  const tot = s.tot;
  const decided = tot.won + tot.lost;
  const cells = [
    { v: tot.played, l: tot.played === 1 ? t('Partie') : t('Partien') },
    { v: tot.won, l: tot.won === 1 ? t('Sieg') : t('Siege') },
    { v: decided ? pct(tot.won / decided) : '–', l: t('Siegquote') },
    { v: tot.streak || 0, l: tot.streak === 1 ? t('Sieg in Folge') : t('Siege in Folge') },
  ];
  $('stKpis').innerHTML = cells.map((c) => `<div class="stat-cell"><b>${esc(c.v)}</b><span>${esc(c.l)}</span></div>`).join('');
}

function formDots(id, history) {
  const last = history.filter((h) => h.g === id).slice(0, 5).reverse();
  if (last.length < 2) return '';
  return `<span class="st-form" aria-hidden="true">${last.map((h) => `<i class="${h.win ? 'w' : 'l'}"></i>`).join('')}</span>`;
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
    return `<tr>
      <td><span class="st-g">${iconOf(g.id)}<span><b>${esc(nameOf(g.id))}</b><small>${g.bestStreak > 1 ? `${t('Serie')} ${g.bestStreak}` : (g.played === 1 ? t('eine Partie') : `${g.played} ${t('Partien')}`)}</small>${formDots(g.id, s.history)}</span></span></td>
      <td class="num">${g.played}</td>
      <td class="num">${g.won}</td>
      <td class="num"><span class="st-rate"><span class="meter" aria-hidden="true"><i style="width:${Math.round(rate * 100)}%"></i></span><b>${decided ? pct(rate) : '–'}</b></span></td>
      <td class="num hide-sm">${place}</td>
    </tr>`;
  }).join('');
  if (note) note.textContent = s.games.length === 1 ? t('1 Spiel') : `${s.games.length} ${t('Spiele')}`;
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
      <td><span class="st-g"><span><b>${esc(p.name)}${mine ? ` <span class="st-me">${t('(du)')}</span>` : ''}</b><small>${p.played === 1 ? t('1 Partie') : `${p.played} ${t('Partien')}`}</small></span></span></td>
      <td class="num">${p.played}</td>
      <td class="num">${p.won}</td>
      <td class="num"><b>${pct(p.rate)}</b></td>
    </tr>`;
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
    const d = new Date(h.ts);
    const when = d.toLocaleDateString(locale(), { day: '2-digit', month: '2-digit' }) + ' · ' +
      d.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
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
  verdict(s); kpis(s); games(s); people(s); history(s);
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
