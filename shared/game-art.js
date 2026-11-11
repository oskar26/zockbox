// Zockbox – Spielkarten-Grafiken. made by Oskar
//
// Jede Karte sieht aus wie das Spiel selbst: gleiche Farben, gleiche
// Schrift-Zeichen, das Logo des Spiels im Bild. Alles ist selbst gezeichnet
// (SVG), nichts wird von fremden Servern geladen.
//
//   gameArt(id)      <svg>  Bild für die Karte (Seitenverhältnis 16:9)
//   gameLogo(id)     <svg>  kleines Logo für Listen, Statistik und Auswahl
//   gameName(id)     Name    (bewusst hier, nicht in stats.js)

export const GAME_NAMES = {
  'machs-meme': "Mach's Meme",
  wikirennen: 'Wikirennen',
  'kritzel-duell': 'Kritzel-Duell',
  krakelpost: 'Krakelpost',
  'wer-luegt': 'Wer lügt?',
};

// ---------------------------------------------------------------------------
// Mach's Meme – lila Himmel, knalliges Meme mit Caption, Sticker-Optik
// ---------------------------------------------------------------------------
const meme = `<svg viewBox="0 0 320 180" role="img" aria-label="Mach's Meme">
  <defs>
    <linearGradient id="mBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3a93ee"/><stop offset=".55" stop-color="#6a5be2"/><stop offset="1" stop-color="#9236d6"/>
    </linearGradient>
    <clipPath id="mPic"><rect x="64" y="24" width="192" height="132" rx="6"/></clipPath>
  </defs>
  <rect width="320" height="180" fill="url(#mBg)"/>
  <g opacity=".2" stroke="#fff" stroke-width="1.4" fill="none">
    <path d="M-10 150 90 20M30 190 130 40M250 190 350 40M290 190 390 20"/>
  </g>
  <rect x="64" y="24" width="192" height="132" rx="6" fill="#fff"/>
  <g clip-path="url(#mPic)">
    <rect x="64" y="24" width="192" height="132" fill="#cfd8e6"/>
    <circle cx="212" cy="48" r="15" fill="#ffe8a8"/>
    <path d="M64 112c18-16 30-22 46-10s26 6 38-6 24-8 34 2 22 12 34 6v46H64z" fill="#8fc0e8"/>
    <path d="M64 128c22-10 34-4 48 4s30 6 44-4 22-10 36-2v30H64z" fill="#5f9bd0"/>
    <g fill="none" stroke="#22304a" stroke-width="3.2" stroke-linecap="round">
      <ellipse cx="140" cy="80" rx="19" ry="17" fill="#fff8ee"/>
      <path d="M148 67c4-7 11-9 16-5"/>
    </g>
    <circle cx="146" cy="78" r="3" fill="#22304a"/><circle cx="133" cy="78" r="3" fill="#22304a"/>
    <path d="M136 92c5 4 9 4 13 0" fill="none" stroke="#22304a" stroke-width="2.4" stroke-linecap="round"/>
  </g>
  <g font-family="'ZB Bangers', Impact, sans-serif" font-size="20" fill="#fff" stroke="#1d1b44" stroke-width="1" paint-order="stroke fill" text-anchor="middle" letter-spacing=".4">
    <text x="160" y="43">ALS DER WLAN-CODE</text>
    <text x="160" y="146">ENDLICH KLAPPT</text>
  </g>
  <!-- Logo: Sticker unten links -->
  <g transform="rotate(-8 46 148)">
    <rect x="16" y="132" width="60" height="33" rx="6" fill="#ffd233" stroke="#1d1b44" stroke-width="2.4"/>
    <text x="46" y="155" font-family="'ZB Bangers', Impact, sans-serif" font-size="19" fill="#1d1b44" text-anchor="middle">M'S M</text>
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// Wikirennen – Enzyklopädie-Look: Artikel, Links, Puzzle-Kugel mit Fahne
// ---------------------------------------------------------------------------
const wiki = `<svg viewBox="0 0 320 180" role="img" aria-label="Wikirennen">
  <rect width="320" height="180" fill="#f8f9fa"/>
  <rect x="20" y="16" width="204" height="148" fill="#fff" stroke="#a2a9b1" stroke-width="1.4"/>
  <rect x="20" y="16" width="204" height="24" fill="#eaecf0" stroke="#a2a9b1" stroke-width="1.4"/>
  <g fill="#c8ccd1"><circle cx="32" cy="28" r="4"/><rect x="42" y="25" width="44" height="6" rx="1"/></g>
  <text x="32" y="60" font-family="'ZB Libre', Georgia, serif" font-size="15" font-weight="700" fill="#202122">Pizza</text>
  <rect x="32" y="70" width="176" height="1.2" fill="#c8ccd1"/>
  <g font-family="'ZB Libre', Georgia, serif" font-size="7.4" fill="#202122">
    <text x="32" y="84">Eine Pizza ist ein flacher <tspan fill="#36c">Teig</tspan>,</text>
    <text x="32" y="95">belegt mit <tspan fill="#36c">Tomaten</tspan>, Käse und</text>
    <text x="32" y="106">weiteren Zutaten. Sie stammt aus</text>
    <text x="32" y="117">Italien und wird im <tspan fill="#36c">Ofen</tspan> gebacken.</text>
    <text x="32" y="134">Wer zuerst am Ziel ist, gewinnt.</text>
  </g>
  <!-- Puzzle-Kugel mit Zielflagge (Logo) -->
  <g transform="translate(232 24)">
    <path d="M24 0a24 24 0 1 0 24 24c0-3.4-.7-6.6-2-9.5L36 12 33 0H24z" fill="#dcdfe3" stroke="#7d8288" stroke-width="1.2"/>
    <g fill="none" stroke="#949aa0" stroke-width="1" opacity=".85">
      <path d="M24 0c-5 6-7 13-7 24s2 18 7 24M24 0c5 6 7 13 7 24s-2 18-7 24"/>
      <path d="M0 17c6 2 10 1 13-1 2 3 5 3 6 0 4-1 7-1 10 1"/>
    </g>
    <g font-family="'ZB Libre', Georgia, serif" fill="#3c4046" text-anchor="middle">
      <text x="12" y="16" font-size="8.5">R</text><text x="31" y="28" font-size="7.5">Ψ</text>
      <text x="14" y="36" font-size="7.5">ß</text><text x="32" y="40" font-size="7">Ω</text>
    </g>
    <path d="M36 0v17" stroke="#54595d" stroke-width="1.6" stroke-linecap="round"/>
    <g transform="translate(37 1)">
      <rect width="13" height="9" fill="#fff" stroke="#202122" stroke-width=".8"/>
      <rect width="3.2" height="3.2" fill="#202122"/><rect x="6.5" y="3.2" width="3.2" height="3.2" fill="#202122"/><rect x="3.2" y="6.5" width="3.2" height="2.5" fill="#202122"/>
    </g>
  </g>
  <g font-family="'ZB Libre', Georgia, serif" font-size="8.6" fill="#54595d">
    <text x="232" y="104">Start: Pizza</text>
    <text x="232" y="120">Ziel: Mond</text>
  </g>
  <g stroke="#14866d" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M232 132h22M250 128l4 4-4 4"/>
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// Kritzel-Duell – Collegeblock, Kugelschreiber, Filzstift-Logo
// ---------------------------------------------------------------------------
const kd = `<svg viewBox="0 0 320 180" role="img" aria-label="Kritzel-Duell">
  <rect width="320" height="180" fill="#eef3f9"/>
  <g stroke="#dfe8f4" stroke-width="1"><path d="M0 22h320M0 44h320M0 66h320M0 88h320M0 110h320M0 132h320M0 154h320"/><path d="M22 0v180M44 0v180M66 0v180M88 0v180M110 0v180M132 0v180M154 0v180M176 0v180M198 0v180M220 0v180M242 0v180M264 0v180M286 0v180M308 0v180"/></g>
  <g transform="rotate(-1.4 160 92)">
    <rect x="46" y="26" width="228" height="128" rx="4" fill="#fffef9" stroke="#1b1b1f" stroke-width="3"/>
    <path d="M64 26v128" stroke="#f08a91" stroke-width="2"/>
    <g fill="none" stroke="#2747c9" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M96 118c-4-22 6-36 22-38s30 10 30 26c0 14-10 22-22 22"/>
      <path d="M92 118c8-6 18-8 30-6"/>
    </g>
    <g fill="#1b1b1f"><circle cx="112" cy="92" r="2.6"/></g>
    <g stroke="#1b1b1f" stroke-width="2.4" stroke-linecap="round">
      <path d="M176 74h56M176 88h42M176 102h52M176 116h34"/>
    </g>
    <g fill="none" stroke="#1b1b1f" stroke-width="2.2" stroke-linecap="round">
      <path d="M186 74v-6M196 74v-6M206 74v-6"/>
    </g>
    <g transform="rotate(6 262 60)">
      <rect x="236" y="42" width="54" height="24" rx="12" fill="#82eb5a" stroke="#1b1b1f" stroke-width="2.2"/>
      <text x="263" y="59" font-family="'ZB Patrick', cursive" font-size="15" fill="#1b1b1f" text-anchor="middle">0:24</text>
    </g>
  </g>
  <g transform="rotate(9 44 126)">
    <rect x="18" y="104" width="9" height="52" rx="4" fill="#ffd23f" stroke="#1b1b1f" stroke-width="2.2"/>
    <path d="M18 156h9l-4.5 12z" fill="#f6d9a8" stroke="#1b1b1f" stroke-width="2"/>
    <path d="M18 104h9v-6l-4.5-4-4.5 4z" fill="#ff9ab8" stroke="#1b1b1f" stroke-width="2"/>
  </g>
  <g transform="rotate(-4 262 146)">
    <rect x="212" y="124" width="100" height="46" rx="4" fill="#fffef9" stroke="#1b1b1f" stroke-width="2.2"/>
    <text x="262" y="143" font-family="'ZB Marker', 'Comic Sans MS', cursive" font-size="19" fill="#2747c9" text-anchor="middle">Kritzel</text>
    <text x="262" y="163" font-family="'ZB Marker', 'Comic Sans MS', cursive" font-size="19" fill="#e8323b" text-anchor="middle">Duell</text>
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// Krakelpost – Papier, Luftpost-Rand, Briefmarke, „Krakelpost"-Schrift
// ---------------------------------------------------------------------------
const kp = `<svg viewBox="0 0 320 180" role="img" aria-label="Krakelpost">
  <defs>
    <pattern id="kpAir" width="26" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <rect width="26" height="10" fill="#fffaf0"/><rect width="10" height="10" fill="#ef4a36"/><rect x="13" width="10" height="10" fill="#2f62e6"/>
    </pattern>
  </defs>
  <rect width="320" height="180" fill="#f3ead6"/>
  <rect width="320" height="180" fill="none" stroke="url(#kpAir)" stroke-width="18" opacity=".9"/>
  <g transform="rotate(-3 158 92)">
    <rect x="46" y="28" width="212" height="124" rx="3" fill="#fffaf0" stroke="#23284d" stroke-width="2.6"/>
    <path d="M46 28l212 124M258 28L46 152" stroke="#23284d" stroke-width="1.4" fill="none" opacity=".45"/>
    <g transform="translate(62 42)">
      <rect width="34" height="42" fill="none" stroke="#23284d" stroke-width="1.8" stroke-dasharray="4 3"/>
      <g fill="none" stroke="#ef4a36" stroke-width="1.8" stroke-linecap="round"><path d="M9 26c-4-4-2-10 3-10s6 6 2 8-9 1-9-4 6-8 11-6"/></g>
    </g>
    <g font-family="'ZB Gochi', 'Comic Sans MS', cursive" fill="#23284d">
      <text x="112" y="66" font-size="15">Liebe Grüße vom</text>
      <text x="112" y="86" font-size="15">Zocken – hier</text>
      <text x="112" y="106" font-size="15">kommt die Post!</text>
    </g>
    <g stroke="#23284d" stroke-width="1.2" opacity=".55" fill="none" stroke-linecap="round">
      <path d="M112 128c26-8 44-2 60 2 12 3 24 1 34-4"/>
    </g>
  </g>
  <g transform="rotate(-1.5 160 154)">
    <text x="160" y="158" font-family="'ZB Kalam', 'Comic Sans MS', cursive" font-weight="700" font-size="26" text-anchor="middle" stroke="#fffaf0" stroke-width="4" paint-order="stroke fill">
      <tspan fill="#ef4a36">Krakel</tspan><tspan fill="#23284d" stroke="#fffaf0">post</tspan>
    </text>
  </g>
  <g transform="rotate(-14 278 46)">
    <circle cx="278" cy="46" r="21" fill="none" stroke="#2f62e6" stroke-width="2" opacity=".55"/>
    <circle cx="278" cy="46" r="15" fill="none" stroke="#2f62e6" stroke-width="1.2" opacity=".55"/>
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// Wer lügt? – noch in Arbeit: ruhig, gestrichelt, ohne eigenen Look
// ---------------------------------------------------------------------------
const soon = `<svg viewBox="0 0 320 180" role="img" aria-label="Wer lügt? – in Arbeit">
  <rect width="320" height="180" fill="#f7f8f9"/>
  <rect x="70" y="38" width="180" height="104" rx="8" fill="#fff" stroke="#ced2d6" stroke-width="1.6" stroke-dasharray="6 5"/>
  <g fill="none" stroke="#8d949b" stroke-width="2" stroke-linecap="round">
    <circle cx="132" cy="78" r="12"/><circle cx="188" cy="78" r="12"/>
    <path d="M124 102c10 6 18 6 28 1"/>
  </g>
  <g fill="#8d949b"><circle cx="129.5" cy="76" r="2.2"/><circle cx="185.5" cy="76" r="2.2"/></g>
  <g font-family="'ZB Patrick', cursive" font-size="26" fill="#ced2d6" text-anchor="middle">
    <text x="103" y="66">?</text><text x="217" y="66">?</text>
  </g>
  <text x="160" y="126" font-family="'ZB Patrick', cursive" font-size="15" fill="#6b7178" text-anchor="middle">Wer lügt?</text>
</svg>`;

const ART = { 'machs-meme': meme, wikirennen: wiki, 'kritzel-duell': kd, krakelpost: kp, 'wer-luegt': soon };

export function gameArt(id) { return ART[id] || soon; }

// Kleine Logos – gleiche Bildsprache wie oben, nur ohne Szene.
const MARK = {
  'machs-meme': `<svg viewBox="0 0 32 32" role="img" aria-label="Mach's Meme"><rect x="2" y="6" width="28" height="20" rx="4" fill="#ffd233" stroke="#1d1b44" stroke-width="2"/><text x="16" y="21" font-family="'ZB Bangers', Impact, sans-serif" font-size="11" fill="#1d1b44" text-anchor="middle" letter-spacing="-.2">M'S M</text></svg>`,
  wikirennen: `<svg viewBox="0 0 32 32" role="img" aria-label="Wikirennen"><circle cx="14" cy="18" r="11" fill="#dcdfe3" stroke="#7d8288" stroke-width="1.2"/><g fill="none" stroke="#949aa0" stroke-width=".9" opacity=".9"><path d="M14 7c-2.4 3-3.4 6-3.4 11S11.6 28 14 29M14 7c2.4 3 3.4 6 3.4 11S16.4 28 14 29M3 18h22"/></g><path d="M16 4v20" stroke="#54595d" stroke-width="1.8" stroke-linecap="round"/><path d="M17 4h12l-2 4.5 2 4.5H17z" fill="#fff" stroke="#202122" stroke-width="1.1"/><rect x="17" y="4" width="3" height="3" fill="#202122"/><rect x="23" y="8" width="3" height="3" fill="#202122"/></svg>`,
  'kritzel-duell': `<svg viewBox="0 0 32 32" role="img" aria-label="Kritzel-Duell"><rect x="4" y="4" width="24" height="24" rx="3" fill="#fffef9" stroke="#1b1b1f" stroke-width="2"/><path d="M8 4v24" stroke="#f08a91" stroke-width="1.4"/><path d="M13 22c-2-7 1-11 6-11s7 4 6 9" fill="none" stroke="#2747c9" stroke-width="2.2" stroke-linecap="round"/><path d="M21 8l6 2-3 6" fill="none" stroke="#e8323b" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  krakelpost: `<svg viewBox="0 0 32 32" role="img" aria-label="Krakelpost"><rect width="32" height="32" rx="5" fill="#f3ead6"/><rect x="3" y="3" width="26" height="26" rx="3" fill="none" stroke="#ef4a36" stroke-width="2" stroke-dasharray="5 4"/><rect x="7" y="9" width="18" height="13" rx="1.5" fill="#fffaf0" stroke="#23284d" stroke-width="1.7"/><path d="M7 9l18 13M25 9L7 22" stroke="#23284d" stroke-width="1" opacity=".55"/><circle cx="22" cy="13" r="2.8" fill="none" stroke="#2f62e6" stroke-width="1.3"/></svg>`,
  'wer-luegt': `<svg viewBox="0 0 32 32" role="img" aria-label="Wer lügt?"><rect x="4" y="6" width="24" height="20" rx="4" fill="#fff" stroke="#ced2d6" stroke-width="1.6" stroke-dasharray="4 3"/><circle cx="12.5" cy="15" r="3" fill="none" stroke="#8d949b" stroke-width="1.4"/><circle cx="19.5" cy="15" r="3" fill="none" stroke="#8d949b" stroke-width="1.4"/></svg>`,
};
export function gameLogo(id) { return MARK[id] || MARK['wer-luegt']; }
