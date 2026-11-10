// Zockbox – lokale Spielstatistik. made by Oskar
//
// Alles bleibt auf dem Gerät (localStorage, kein Server, kein Tracking).
// Die Spiele melden das Ende einer Partie mit einem Ereignis:
//
//   window.dispatchEvent(new CustomEvent('zb:game', { detail: {
//     game: 'machs-meme',           // Spiel-ID wie in net.js
//     mode: 'normal',               // optional
//     round: 3,                     // optional (Anzahl Runden)
//     players: [                    // alle Spieler am Ende
//       { id: '…', name: 'Oskar', score: 812, place: 1, win: true, me: true },
//       …
//     ],
//   }}));
//
// Werte werden pro Gerät gezählt: „ich“ (der Spieler mit `me: true`) bekommt
// Siege, Plätze und Punkte; alle Namen landen zusätzlich in einer kleinen
// „wer wie oft gewonnen“-Liste, damit man mit Freunden vergleichen kann.
//
// localStorage:
//   zb_stats_v1       alles (JSON, siehe read())
//
// Startseite: <script type="module" src="shared/stats.js"></script>
// Spiele:     <script type="module" src="../../shared/stats.js"></script>

const KEY = 'zb_stats_v1';
const HISTORY_MAX = 80;

export const GAME_META = {
  'machs-meme': { name: "Mach's Meme", icon: '😂', short: 'Meme' },
  wikirennen: { name: 'Wikirennen', icon: '🏁', short: 'Wiki' },
  'kritzel-duell': { name: 'Kritzel-Duell', icon: '✏️', short: 'Kritzel' },
  krakelpost: { name: 'Krakelpost', icon: '✉️', short: 'Krakelpost' },
  'wer-luegt': { name: 'Wer lügt?', icon: '🕵️', short: 'Lügt' },
};

const EMPTY = () => ({
  v: 1,
  games: {},   // id -> { played, won, lost, draws, places:[…], best, last, streak, bestStreak, pts }
  people: {},  // name -> { played, won }
  history: [], // { g, ts, place, players, score, win }
  created: Date.now(),
});

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY();
    const d = JSON.parse(raw);
    if (!d || typeof d !== 'object') return EMPTY();
    d.games = d.games && typeof d.games === 'object' ? d.games : {};
    d.people = d.people && typeof d.people === 'object' ? d.people : {};
    d.history = Array.isArray(d.history) ? d.history : [];
    return d;
  } catch (e) { return EMPTY(); }
}

function write(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
  window.dispatchEvent(new CustomEvent('zb:stats-changed', { detail: { stats: d } }));
}

function blank(id) {
  return { id, played: 0, won: 0, lost: 0, draws: 0, places: [], best: 0, last: 0, streak: 0, bestStreak: 0, pts: 0 };
}

const clean = (s, max = 24) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, max);

// Doppelte Meldungen (z. B. wenn eine Endansicht mehrfach gezeichnet wird)
// werden über einen Fingerabdruck in dieser Sitzung erkannt.
function fingerprint(detail) {
  const ps = (detail.players || []).map((p) => `${clean(p.name)}:${Number(p.score) || 0}`).join('|');
  return `${detail.game}::${ps}`;
}
function seenAlready(fp) {
  try {
    const list = JSON.parse(sessionStorage.getItem('zb_stats_fp') || '[]');
    const hit = list.some((x) => x.fp === fp && Date.now() - x.ts < 6 * 60 * 60 * 1000);
    if (!hit) {
      const next = list.filter((x) => Date.now() - x.ts < 6 * 60 * 60 * 1000).concat({ fp, ts: Date.now() });
      sessionStorage.setItem('zb_stats_fp', JSON.stringify(next.slice(-40)));
    }
    return hit;
  } catch (e) { return false; }
}

/**
 * Eine beendete Partie eintragen.
 * @returns {boolean} true, wenn etwas gespeichert wurde
 */
export function recordGame(detail) {
  if (!detail || !detail.game) return false;
  const players = Array.isArray(detail.players) ? detail.players.filter((p) => p && clean(p.name)) : [];
  if (!players.length) return false;
  if (seenAlready(fingerprint(detail))) return false;

  const d = read();
  const id = String(detail.game);
  const g = d.games[id] || (d.games[id] = blank(id));
  const me = players.find((p) => p.me);

  // „wer wie oft gewonnen“ – alle Mitspieler mitzählen
  for (const p of players) {
    const name = clean(p.name) || '?';
    const person = d.people[name] || (d.people[name] = { played: 0, won: 0 });
    person.played += 1;
    if (p.win) person.won += 1;
  }

  if (me) {
    const score = Number(me.score) || 0;
    const place = Math.max(1, Number(me.place) || 1);
    const decided = !!(me.win || place > 1);
    g.played += 1;
    g.places.push(place);
    if (g.places.length > 60) g.places.shift();
    g.pts += Math.max(0, score);
    g.best = Math.max(g.best || 0, score);
    g.last = Date.now();
    if (me.win) {
      g.won += 1;
      g.streak = (g.streak || 0) + 1;
      g.bestStreak = Math.max(g.bestStreak || 0, g.streak);
    } else if (place > 1) {
      g.lost += 1;
      g.streak = 0;
    } else if (!decided) {
      g.draws += 1;
      g.streak = 0;
    }
    d.history.unshift({
      g: id, ts: Date.now(), place, players: players.length, score, win: !!me.win,
      mode: clean(detail.mode, 20) || '',
    });
    d.history = d.history.slice(0, HISTORY_MAX);
  }

  write(d);
  return true;
}

/** Rohdaten (für die Statistikseite). */
export function stats() { return read(); }

/** Kennzahlen für ein Spiel. */
export function statsFor(id) {
  const d = read();
  const g = d.games[id] || blank(id);
  const decided = g.won + g.lost;
  const avgPlace = g.places.length ? g.places.reduce((a, b) => a + b, 0) / g.places.length : 0;
  return {
    ...g,
    name: (GAME_META[id] || {}).name || id,
    icon: (GAME_META[id] || {}).icon || '🎮',
    winRate: decided ? g.won / decided : 0,
    avgPlace,
    avgPts: g.played ? Math.round(g.pts / g.played) : 0,
  };
}

/** Alles, was die Statistikseite braucht. */
export function summary() {
  const d = read();
  const ids = Object.keys(d.games);
  const games = ids.map(statsFor).sort((a, b) => b.played - a.played);
  const tot = { played: 0, won: 0, lost: 0, draws: 0, pts: 0, best: 0, streak: 0, bestStreak: 0 };
  for (const g of games) {
    for (const k of Object.keys(tot)) {
      if (k === 'best') tot.best = Math.max(tot.best, g.best || 0);
      else if (k === 'bestStreak') tot.bestStreak = Math.max(tot.bestStreak, g.bestStreak || 0);
      else tot[k] += g[k] || 0;
    }
  }
  // aktuelle Siegesserie über alle Spiele: der jüngste Eintrag zählt
  let streak = 0;
  for (const h of d.history) { if (h.win) streak += 1; else break; }
  tot.streak = streak;

  const people = Object.entries(d.people)
    .map(([name, v]) => ({ name, played: v.played || 0, won: v.won || 0, rate: v.played ? (v.won || 0) / v.played : 0 }))
    .sort((a, b) => b.won - a.won || b.rate - a.rate || a.name.localeCompare(b.name))
    .slice(0, 14);

  return { games, tot, people, history: d.history, created: d.created };
}

/** Siege der letzten 14 Tage (für die kleine Balkenreihe). */
export function last14() {
  const d = read();
  const day = 24 * 60 * 60 * 1000;
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const base = start.getTime();
  const out = [];
  for (let i = 13; i >= 0; i--) {
    const from = base - i * day, to = from + day;
    const games = d.history.filter((h) => h.ts >= from && h.ts < to);
    out.push({
      ts: from,
      label: new Date(from).toLocaleDateString('de-DE', { weekday: 'short' }).slice(0, 2),
      played: games.length,
      won: games.filter((h) => h.win).length,
    });
  }
  return out;
}

export function resetStats() {
  try { localStorage.removeItem(KEY); } catch (e) {}
  try { sessionStorage.removeItem('zb_stats_fp'); } catch (e) {}
  window.dispatchEvent(new CustomEvent('zb:stats-changed', { detail: { stats: EMPTY() } }));
}

export function exportStats() {
  return JSON.stringify({ app: 'zockbox-statistik', version: 1, data: read() }, null, 2);
}

// Spiele melden sich per Ereignis – kein Import in den Spielen nötig.
if (typeof window !== 'undefined') {
  window.addEventListener('zb:game', (e) => { try { recordGame(e.detail); } catch (err) {} });
}
