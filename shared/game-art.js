// Zockbox – Spielbilder. made by Oskar
//
// Jedes Bild ist im Look des jeweiligen Spiels gezeichnet und trägt dessen
// Logo/Schriftzug – so erkennt man auf der Startseite sofort, was einen
// erwartet. Alles ist selbst gezeichnet (SVG), nichts wird geladen.
//
//   gameArt(id)   <svg>  Bild für die Karte (16:9)
//   gameLogo(id)  <svg>  kleines Logo für Listen und Statistik
//   gameName(id)  Name

export const GAME_NAMES = {
  'machs-meme': "Mach's Meme",
  wikirennen: 'Wikirennen',
  'kritzel-duell': 'Kritzel-Duell',
  krakelpost: 'Krakelpost',
  'wer-luegt': 'Wer lügt?',
};

// ---------------------------------------------------------------------------
// Mach's Meme – blau-lila Verlauf, Meme mit Caption, Schriftzug in Bangers
// ---------------------------------------------------------------------------
const meme = `<svg viewBox="0 0 320 180" role="img" aria-label="Mach's Meme">
  <defs>
    <linearGradient id="mmBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3a93ee"/><stop offset=".55" stop-color="#6a5be2"/><stop offset="1" stop-color="#9236d6"/>
    </linearGradient>
    <clipPath id="mmClip"><rect x="178" y="20" width="124" height="100" rx="4"/></clipPath>
  </defs>
  <rect width="320" height="180" fill="url(#mmBg)"/>
  <g stroke="#fff" stroke-width="1.2" opacity=".16" fill="none">
    <path d="M-10 168 96 6M52 190 158 28M176 190 282 28M236 190 342 28"/>
  </g>
  <g transform="rotate(2.6 240 70)">
    <rect x="174" y="16" width="132" height="108" rx="6" fill="#fff"/>
    <g clip-path="url(#mmClip)">
      <rect x="178" y="20" width="124" height="100" fill="#cfd8e6"/>
      <circle cx="278" cy="40" r="13" fill="#ffe8a8"/>
      <path d="M178 92c14-12 24-16 36-6s20 4 30-6 18-6 26 2 14 8 22 4v40h-114z" fill="#8fc0e8"/>
      <path d="M178 108c16-8 26-2 36 4s22 4 32-4 16-6 26 0v22h-94z" fill="#5f9bd0"/>
      <ellipse cx="232" cy="66" rx="14" ry="13" fill="#fff8ee" stroke="#22304a" stroke-width="2.4"/>
      <circle cx="237" cy="64" r="2.2" fill="#22304a"/><circle cx="228" cy="64" r="2.2" fill="#22304a"/>
      <path d="M230 74c3 3 6 3 9 0" fill="none" stroke="#22304a" stroke-width="1.8" stroke-linecap="round"/>
    </g>
    <g font-family="ZB Bangers" font-size="13" fill="#fff" stroke="#1d1b44" stroke-width="1.4" paint-order="stroke fill" text-anchor="middle" letter-spacing=".3">
      <text x="240" y="34">ALS DER WLAN-CODE</text>
      <text x="240" y="112">ENDLICH KLAPPT</text>
    </g>
  </g>
  <g fill="#ffd233" stroke="#1d1b44" stroke-width="2">
    <circle cx="308" cy="130" r="12"/><circle cx="292" cy="146" r="7"/>
  </g>
  <g transform="rotate(-5 84 116)" font-family="ZB Bangers" letter-spacing=".6" paint-order="stroke fill" text-anchor="start" stroke="#1d1b44" stroke-width="3.4">
    <text x="18" y="110" font-size="21" fill="#ffd233">MACH'S</text>
    <text x="18" y="146" font-size="42" fill="#fff">MEME</text>
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// Wikirennen – Enzyklopädie-Look: Artikel, Links, Puzzle-Kugel, Zielflagge
// ---------------------------------------------------------------------------
const wiki = `<svg viewBox="0 0 320 180" role="img" aria-label="Wikirennen">
  <rect width="320" height="180" fill="#f8f9fa"/>
  <rect x="12" y="10" width="212" height="160" fill="#fff" stroke="#a2a9b1" stroke-width="1.2"/>
  <rect x="12" y="10" width="212" height="26" fill="#eaecf0" stroke="#a2a9b1" stroke-width="1.2"/>
  <g fill="#c8ccd1"><circle cx="24" cy="23" r="4"/><rect x="34" y="20" width="52" height="6" rx="1"/><rect x="186" y="20" width="30" height="6" rx="1"/></g>
  <text x="24" y="60" font-family="ZB Libre" font-size="20" font-weight="700" fill="#202122">Wikirennen</text>
  <rect x="24" y="68" width="188" height="1.2" fill="#a2a9b1"/>
  <g font-family="ZB Libre" font-size="8" fill="#202122">
    <text x="24" y="84">Ziel ist es, in möglichst wenigen Klicks</text>
    <text x="24" y="95">von <tspan fill="#36c">Pizza</tspan> nach <tspan fill="#36c">Mond</tspan> zu kommen –</text>
    <text x="24" y="106">nur über <tspan fill="#36c">Links</tspan> im Artikel. Wer zuerst</text>
    <text x="24" y="117">am Ziel ist, gewinnt die Runde.</text>
    <text x="24" y="136" fill="#54595d">Start: <tspan fill="#36c">Pizza</tspan>   ·   Ziel: <tspan fill="#36c">Mond</tspan></text>
  </g>
  <g stroke="#14866d" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M24 150h34M54 145l5 5-5 5"/>
  </g>
  <!-- Puzzle-Kugel mit Zielflagge -->
  <g transform="translate(240 22)">
    <path d="M22 0a22 22 0 1 0 22 22c0-3.1-.7-6.1-1.9-8.7L33 11 30 0H22z" fill="#dcdfe3" stroke="#7d8288" stroke-width="1.1"/>
    <g fill="none" stroke="#949aa0" stroke-width=".9" opacity=".85">
      <path d="M22 0c-4.6 5.5-6.4 12-6.4 22s1.8 16.5 6.4 22M22 0c4.6 5.5 6.4 12 6.4 22s-1.8 16.5-6.4 22"/>
      <path d="M0 15.6c5.5 1.8 9.2.9 12-.9 1.8 2.7 4.6 2.7 5.5 0 3.7-.9 6.4-.9 9.2.9"/>
    </g>
    <g font-family="ZB Libre" fill="#3c4046" text-anchor="middle">
      <text x="11" y="15" font-size="8">R</text><text x="29" y="26" font-size="7">Ψ</text>
      <text x="13" y="33" font-size="7">ß</text><text x="30" y="37" font-size="6.5">Ω</text>
    </g>
    <path d="M33 0v16" stroke="#54595d" stroke-width="1.5" stroke-linecap="round"/>
    <g transform="translate(34 1)">
      <rect width="12" height="8.5" fill="#fff" stroke="#202122" stroke-width=".8"/>
      <rect width="3" height="3" fill="#202122"/><rect x="6" y="3" width="3" height="3" fill="#202122"/><rect x="3" y="6" width="3" height="2.2" fill="#202122"/>
    </g>
  </g>
  <g font-family="ZB Libre" font-size="8.5" fill="#54595d">
    <text x="240" y="104">Ein Klick.</text>
    <text x="240" y="118">Zwei Klicks.</text>
    <text x="240" y="132">Ziel!</text>
  </g>
  <g stroke="#14866d" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M240 146h20M256 142l4 4-4 4"/>
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// Kritzel-Duell – Collegeblock, bunter Marker-Schriftzug, Kugelschreiber
// ---------------------------------------------------------------------------
const KD_LETTERS = [
  ['K', '#ff5a5f', -8], ['r', '#ff9f1c', 5], ['i', '#ffd23f', -4], ['t', '#9be15d', 7],
  ['z', '#2bc4b6', -6], ['e', '#5ec8ff', 4], ['l', '#8a5cf6', -5],
];
const KD2_LETTERS = [['D', '#ff3b30', 6], ['u', '#ff7ac8', -7], ['e', '#ffd23f', 4], ['l', '#3a6df0', -5], ['l', '#2ec27e', 8]];

const kdWord = (letters, x, y, size, step) => letters.map(([ch, color, rot], i) =>
  `<text x="${x + i * step}" y="${y}" font-size="${size}" fill="${color}" transform="rotate(${rot} ${x + i * step} ${y - size * 0.3})">${ch}</text>`).join('');

const kd = `<svg viewBox="0 0 320 180" role="img" aria-label="Kritzel-Duell">
  <rect width="320" height="180" fill="#eef3f9"/>
  <g stroke="#dfe8f4" stroke-width="1"><path d="M0 22h320M0 44h320M0 66h320M0 88h320M0 110h320M0 132h320M0 154h320"/><path d="M22 0v180M44 0v180M66 0v180M88 0v180M110 0v180M132 0v180M154 0v180M176 0v180M198 0v180M220 0v180M242 0v180M264 0v180M286 0v180M308 0v180"/></g>
  <g transform="rotate(-1.2 160 84)">
    <rect x="20" y="14" width="196" height="118" rx="4" fill="#fffef9" stroke="#1b1b1f" stroke-width="3"/>
    <path d="M36 14v118" stroke="#f08a91" stroke-width="2"/>
    <g fill="none" stroke="#2747c9" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M66 104c-3-18 5-30 18-32s25 8 25 22c0 11-8 18-18 18"/>
      <path d="M62 104c7-5 15-7 25-5"/>
    </g>
    <circle cx="80" cy="82" r="2.2" fill="#1b1b1f"/>
    <g stroke="#1b1b1f" stroke-width="2.2" stroke-linecap="round">
      <path d="M130 58h58M130 70h44M130 82h54M130 94h36"/>
    </g>
    <g transform="rotate(5 190 46)">
      <rect x="168" y="32" width="42" height="19" rx="9.5" fill="#82eb5a" stroke="#1b1b1f" stroke-width="2"/>
      <text x="189" y="45.5" font-family="ZB Patrick" font-size="12" fill="#1b1b1f" text-anchor="middle">0:24</text>
    </g>
  </g>
  <g transform="rotate(10 26 132)">
    <rect x="16" y="118" width="8" height="44" rx="3.5" fill="#ffd23f" stroke="#1b1b1f" stroke-width="2"/>
    <path d="M16 162h8l-4 10z" fill="#f6d9a8" stroke="#1b1b1f" stroke-width="1.8"/>
    <path d="M16 118h8v-5l-4-3.5-4 3.5z" fill="#ff9ab8" stroke="#1b1b1f" stroke-width="1.8"/>
  </g>
  <g font-family="ZB Marker" text-anchor="start" paint-order="stroke fill" stroke="#fffef9" stroke-width="3.4" stroke-linejoin="round">
    ${kdWord(KD_LETTERS, 76, 158, 30, 20)}
    ${kdWord(KD2_LETTERS, 214, 158, 30, 19)}
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// Krakelpost – Luftpost-Papier, Briefmarke, Handschrift-Schriftzug
// ---------------------------------------------------------------------------
const kp = `<svg viewBox="0 0 320 180" role="img" aria-label="Krakelpost">
  <defs>
    <pattern id="kpAir" width="24" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
      <rect width="24" height="9" fill="#fffaf0"/><rect width="9" height="9" fill="#ef4a36"/><rect x="12" width="9" height="9" fill="#2f62e6"/>
    </pattern>
  </defs>
  <rect width="320" height="180" fill="#f3ead6"/>
  <rect width="320" height="180" fill="none" stroke="url(#kpAir)" stroke-width="16"/>
  <g transform="rotate(-2.4 152 76)">
    <rect x="40" y="24" width="196" height="106" rx="3" fill="#fffaf0" stroke="#23284d" stroke-width="2.4"/>
    <path d="M40 24l196 106M236 24L40 130" stroke="#23284d" stroke-width="1.2" fill="none" opacity=".4"/>
    <g transform="translate(56 36)">
      <rect width="28" height="34" fill="none" stroke="#23284d" stroke-width="1.6" stroke-dasharray="4 3"/>
      <path d="M8 22c-3.4-3.4-1.6-8.4 2.6-8.4s5 5 1.6 6.8-7.6.8-7.6-3.4 5-6.8 9.2-5" fill="none" stroke="#ef4a36" stroke-width="1.6" stroke-linecap="round"/>
    </g>
    <g font-family="ZB Gochi" fill="#23284d">
      <text x="100" y="58" font-size="13">Liebe Grüße vom</text>
      <text x="100" y="76" font-size="13">Zocken – hier</text>
      <text x="100" y="94" font-size="13">kommt die Post!</text>
    </g>
  </g>
  <g font-family="ZB Gochi" text-anchor="middle" paint-order="stroke fill" stroke="#23284d" stroke-width="4" stroke-linejoin="round">
    <text x="170" y="164" font-size="34" transform="rotate(-2 170 164)"><tspan fill="#ef4a36">Krakel</tspan><tspan fill="#ffcd3c">post</tspan></text>
  </g>
  <g transform="translate(278 34) rotate(-12)" fill="none" stroke="#2f62e6" opacity=".55">
    <circle cx="0" cy="0" r="19" stroke-width="2"/><circle cx="0" cy="0" r="13" stroke-width="1.1"/>
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// Wer lügt? – in Arbeit: ruhig, gestrichelt, ohne eigenen Look
// ---------------------------------------------------------------------------
const soon = `<svg viewBox="0 0 320 180" role="img" aria-label="Wer lügt? – in Arbeit">
  <rect width="320" height="180" fill="#fbfbfa"/>
  <rect x="74" y="30" width="172" height="94" rx="8" fill="#fff" stroke="#d8d8d2" stroke-width="1.6" stroke-dasharray="6 5"/>
  <g fill="none" stroke="#b9bec4" stroke-width="2" stroke-linecap="round">
    <circle cx="128" cy="66" r="11"/><circle cx="190" cy="66" r="11"/>
    <path d="M120 88c10 5 20 5 30 0"/>
  </g>
  <g fill="#b9bec4"><circle cx="126" cy="64" r="2"/><circle cx="188" cy="64" r="2"/></g>
  <g font-family="ZB Patrick" font-size="24" fill="#d8d8d2" text-anchor="middle">
    <text x="100" y="56">?</text><text x="218" y="56">?</text>
  </g>
  <text x="160" y="152" font-family="ZB Patrick" font-size="24" fill="#6d7378" text-anchor="middle">Wer lügt?</text>
</svg>`;

const ART = { 'machs-meme': meme, wikirennen: wiki, 'kritzel-duell': kd, krakelpost: kp, 'wer-luegt': soon };

export function gameArt(id) { return ART[id] || soon; }

// Kleine Logos – gleiche Bildsprache, ohne Szene.
const MARK = {
  'machs-meme': `<svg viewBox="0 0 32 32" role="img" aria-label="Mach's Meme"><rect width="32" height="32" rx="7" fill="#5f4ede"/><rect x="7" y="5" width="18" height="15" rx="2" fill="#fff"/><text x="16" y="28" font-family="ZB Bangers" font-size="9" fill="#ffd233" stroke="#1d1b44" stroke-width="1.4" paint-order="stroke fill" text-anchor="middle">MEME</text></svg>`,
  wikirennen: `<svg viewBox="0 0 32 32" role="img" aria-label="Wikirennen"><rect width="32" height="32" rx="7" fill="#fff" stroke="#c8ccd1"/><text x="16" y="14" font-family="ZB Libre" font-size="9" font-weight="700" fill="#202122" text-anchor="middle">Wiki</text><path d="M7 18h18" stroke="#c8ccd1"/><circle cx="13" cy="24" r="4" fill="#dcdfe3" stroke="#7d8288" stroke-width=".7"/><path d="M17 20v8" stroke="#54595d" stroke-width="1"/><path d="M18 20h7l-1.2 2.6L25 25h-7z" fill="#fff" stroke="#202122" stroke-width=".8"/></svg>`,
  'kritzel-duell': `<svg viewBox="0 0 32 32" role="img" aria-label="Kritzel-Duell"><rect x="3" y="3" width="26" height="26" rx="3" fill="#fffef9" stroke="#1b1b1f" stroke-width="2"/><path d="M8 3v26" stroke="#f08a91" stroke-width="1.4"/><text x="19.5" y="17" font-family="ZB Marker" font-size="10" fill="#e8323b" text-anchor="middle">K</text><text x="19.5" y="26" font-family="ZB Marker" font-size="10" fill="#2747c9" text-anchor="middle">D</text></svg>`,
  krakelpost: `<svg viewBox="0 0 32 32" role="img" aria-label="Krakelpost"><rect width="32" height="32" rx="6" fill="#f3ead6"/><rect x="2.5" y="2.5" width="27" height="27" rx="4" fill="none" stroke="#ef4a36" stroke-width="2" stroke-dasharray="5 4"/><rect x="7" y="9" width="18" height="13" rx="1.5" fill="#fffaf0" stroke="#23284d" stroke-width="1.6"/><path d="M7 9l18 13M25 9L7 22" stroke="#23284d" stroke-width=".9" opacity=".5"/><circle cx="22" cy="13" r="2.6" fill="none" stroke="#2f62e6" stroke-width="1.2"/></svg>`,
  'wer-luegt': `<svg viewBox="0 0 32 32" role="img" aria-label="Wer lügt?"><rect x="4" y="6" width="24" height="20" rx="4" fill="#fff" stroke="#d8d8d2" stroke-width="1.6" stroke-dasharray="4 3"/><circle cx="12.5" cy="15" r="3" fill="none" stroke="#b9bec4" stroke-width="1.4"/><circle cx="19.5" cy="15" r="3" fill="none" stroke="#b9bec4" stroke-width="1.4"/></svg>`,
};
export function gameLogo(id) { return MARK[id] || MARK['wer-luegt']; }
