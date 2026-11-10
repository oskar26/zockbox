// Zockbox – Spielerzahlen ohne künstliche Obergrenze.
// ---------------------------------------------------------------------------
// Es gibt keine feste Zahl mehr wie „maximal 30“. Stattdessen schätzt dieses
// Modul aus dem Gerät des Hosts (CPU-Kerne, Arbeitsspeicher, Verbindung,
// Mobil/Desktop), wie viele WebRTC-Peers gleichzeitig flüssig zu versorgen
// sind, und kombiniert das mit der Spieldynamik: Manche Spiele werden mit
// großen Runden technisch noch flüssig, machen aber keinen Spaß mehr, weil
// Wartezeiten oder Abstimmungen zu lang werden.
//
// `technical`  = geschätzte Obergrenze für *dieses* Gerät + *dieses* Spiel
// `ideal`      = Bereich, in dem die Runde erfahrungsgemäß am meisten Spaß macht
// Die Zahlen sind Richtwerte, keine Sperre: Der Host entscheidet immer selbst
// und kann die Lobby jederzeit größer oder kleiner stellen.
// ---------------------------------------------------------------------------

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Nur eine Plausibilitätsgrenze für kaputte/absichtlich falsche Netzwerk-
// Nachrichten – ausdrücklich KEINE Begrenzung der Spielerzahl.
export const PROTOCOL_MAX = 2000;

// load = wie teuer ein weiterer Spieler für den Host ist (Zustand, Bilder,
// Zeichenstriche ...). Klein = teurer, also weniger Peers flüssig.
export const GAME_DYNAMICS = {
  'machs-meme': {
    ideal: [4, 10], load: 0.62,
    note: 'Alle schreiben und bewerten gleichzeitig – ab etwa zwölf wird das Abstimmen zäh und die Meme-Bilder wandern öfter durchs Netz.',
  },
  wikirennen: {
    ideal: [2, 8], load: 0.9,
    note: 'Jeder rennt für sich; mehr Leute machen vor allem Chat und Ergebnisliste voll, nicht die Strecke.',
  },
  'kritzel-duell': {
    ideal: [3, 8], load: 0.72,
    note: 'Einer zeichnet, alle raten: mit jedem Spieler wächst die Wartezeit bis zum eigenen Zug.',
  },
  krakelpost: {
    ideal: [4, 12], load: 0.6,
    note: 'Jedes Glied macht die Kette lustiger, aber auch länger – Bilder und Sätze wandern nacheinander durch die Runde.',
  },
};

/** Grobe, ehrliche Einschätzung des Host-Geräts. Fehlende APIs werden geschätzt. */
export function deviceEstimate() {
  const nav = typeof navigator === 'undefined' ? {} : navigator;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection || {};
  const cores = clamp(Number(nav.hardwareConcurrency) || 4, 1, 64);
  const ram = clamp(Number(nav.deviceMemory) || 4, 0.5, 64);
  const downlink = clamp(Number(conn.downlink) || 8, 0.5, 50);
  const rtt = clamp(Number(conn.rtt) || 100, 20, 1000);
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent || '')
    || (Number(nav.maxTouchPoints) > 1 && /MacIntel/.test(nav.platform || ''));
  const saveData = !!conn.saveData;

  // Mesh-Verbindung: jeder zusätzliche Spieler kostet den Host eine weitere
  // Verbindung und einen weiteren Zustandsabgleich. Mehr Kerne, Speicher und
  // Bandbreite erlauben entsprechend mehr Peers.
  const score = cores * 1.5 + ram * 1.1 + Math.min(downlink, 20) * 0.6
    - (rtt > 250 ? 3 : 0) + (mobile ? 0 : 2) - (saveData ? 4 : 0);
  const peers = Math.max(4, Math.round(4 + score));

  return {
    cores, ram, downlink, rtt, mobile, saveData, peers,
    assumed: !nav.hardwareConcurrency || !nav.deviceMemory,
  };
}

/** Kombinierte Einschätzung für ein Spiel. */
export function capacity(gameId) {
  const device = deviceEstimate();
  const g = GAME_DYNAMICS[gameId] || { ideal: [2, 8], load: 0.8, note: '' };
  const technical = Math.max(4, Math.round(device.peers * g.load));
  const idealMin = g.ideal[0];
  const idealMax = Math.max(idealMin, Math.min(g.ideal[1], technical));
  return {
    ...device, gameId, technical, idealMin, idealMax, note: g.note,
    rangeLabel: `2–${technical}`,
    idealLabel: `${idealMin}–${idealMax}`,
  };
}

/** Erklärung für Tooltips / Titelattribute. */
export function capacityHint(gameId) {
  const c = capacity(gameId);
  const dev = `${c.cores} CPU-Kerne, ~${c.ram} GB RAM, ~${c.downlink} Mbit/s${c.assumed ? ' (teilweise geschätzt)' : ''}`;
  return `Geschätzt für dieses Gerät (${dev}): bis etwa ${c.technical} Spieler flüssig. `
    + `Besonders spaßig: ${c.idealLabel} Personen. ${c.note} `
    + 'Keine feste Grenze – der Host entscheidet selbst, wie groß die Lobby wird.';
}

/** Optionen für die „Max. Spieler“-Auswahl, ohne hartes 30er-Ende. */
export function playerOptions(gameId, current = 0, unit = '') {
  const c = capacity(gameId);
  const steps = [];
  for (let v = 2; v <= Math.min(c.technical, 12); v++) steps.push(v);
  for (const v of [14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128, 160, 200]) {
    if (v <= c.technical) steps.push(v);
  }
  if (!steps.includes(c.technical)) steps.push(c.technical);
  const cur = Math.round(Number(current));
  if (Number.isFinite(cur) && cur >= 1 && !steps.includes(cur)) steps.push(cur);
  steps.sort((a, b) => a - b);
  return steps.map((v) => [
    v,
    `${v}${unit}${v >= c.idealMin && v <= c.idealMax ? ' · ideal' : ''}`,
  ]);
}

/** Netzwerk-Nachrichten: nur Plausibilität prüfen, nicht begrenzen. */
export function normalizeMax(value) {
  const v = Math.round(Number(value));
  return Number.isFinite(v) && v >= 2 && v <= PROTOCOL_MAX ? v : null;
}
