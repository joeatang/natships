// =============================================================================
// UNATOMS TCG · card frame renderer (v1)
// -----------------------------------------------------------------------------
// Wraps `UNATOM.svg()` portrait in a full trading-card frame.
// Card canvas: 750×1050 (standard 63×88mm TCG ratio, ~300dpi print-ready).
//
// Public API (window.UNATOMS_TCG):
//   render(spec)   → SVG string of a single card face
//   renderBack()   → SVG string of the NAT SIGIL card back
//   RARITY, NATURE_GLYPH, NAT_ORANGE, CARD_W, CARD_H
//
// Card `spec` fields (all optional):
//   block             — Bitcoin block height; drives portrait art (default 10080)
//   title             — displayed name (default UNATOM's symbol/name)
//   seriesRoman       — 'I', 'II', 'III'…               (default 'I')
//   blockHeightLabel  — e.g. 'BLK #TBD' to override auto-format
//   rarity            — common|uncommon|rare|epic|legendary|mythic
//   cost              — matter cost 0..8                 (default 3)
//   integrity         — HP 10..120                       (default 60)
//   nature            — fire|water|air|earth|void|aether|none
//   signalName        — attack name                      (default 'PULSE')
//   signalText        — one-line effect                  (default lorem)
//   whisper           — italic flavor line               (default from UNATOM.WHISPERS)
//   strike            — e.g. 'STRIKE 001 / 500'          (default: rarity label)
//   portraitTraits    — trait obj to override UNATOM.fromBlock(block)
// =============================================================================
(function (root) {
  'use strict';

  const NAT_ORANGE = '#F07E1B';
  const CARD_W = 750;
  const CARD_H = 1050;

  // Portrait slot (letterboxed 1024×1024 UNATOM into a slightly-wide zone)
  const P_X = 45, P_Y = 108, P_W = 660, P_H = 604;

  // Rarity ladder — Rodarmor's ordinal sat rarity, adapted 1:1 for UNATOMS TCG
  const RARITY = {
    common:    { label: 'COMMON',    sealFill: 'transparent',  sealStroke: '#8a8378', glyphKind: 'dot' },
    uncommon:  { label: 'UNCOMMON',  sealFill: 'transparent',  sealStroke: '#c0c0c0', glyphKind: 'halfmoon' },
    rare:      { label: 'RARE',      sealFill: 'transparent',  sealStroke: '#e6c14b', glyphKind: 'diamond' },
    epic:      { label: 'EPIC',      sealFill: '#7a4cb6',      sealStroke: '#cfb8e8', glyphKind: 'triangle' },
    legendary: { label: 'LEGENDARY', sealFill: NAT_ORANGE,     sealStroke: '#fff7e6', glyphKind: 'hex' },
    mythic:    { label: 'MYTHIC',    sealFill: NAT_ORANGE,     sealStroke: '#fff7e6', glyphKind: 'star', glow: true },
  };

  // Nature identity kind — for the top-left glyph and matter-cost dot color
  const NATURE_KIND = ['fire', 'water', 'air', 'earth', 'void', 'aether', 'none'];
  const NATURE_GLYPH = NATURE_KIND.reduce((o, k) => (o[k] = k, o), {});

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------
  function isDark(hex) {
    const h = String(hex || '').replace('#', '');
    if (h.length < 6) return false;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.45;
  }
  function inkFor(sch) {
    return isDark(sch.border) ? '#fafaf6' : sch.border;
  }
  function escapeXml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  function fmtBlockNum(n) {
    if (n === 'TBD' || n == null) return 'TBD';
    const num = Number(n);
    if (!isFinite(num)) return String(n);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  // Deterministic pseudo-merkle hex string (placeholder — real cards read
  // header.merkleroot from the actual block).
  function fakeMerkleStrip(blockHeight, len) {
    const chars = '0123456789abcdef';
    let s = ((Number(blockHeight) || 0) * 2654435761) >>> 0;
    if (s === 0) s = 0xdeadbeef;
    let out = '';
    for (let i = 0; i < (len || 60); i++) {
      s = (s * 1103515245 + 12345) >>> 0;
      out += chars[s & 15];
    }
    return out;
  }
  function wrapText(text, maxChars) {
    if (!text) return [''];
    const words = String(text).split(/\s+/);
    const lines = [];
    let cur = '';
    for (const w of words) {
      const test = (cur ? cur + ' ' : '') + w;
      if (test.length > maxChars) {
        if (cur) lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }
  function stripOuterSvg(svgString) {
    const m = String(svgString || '').match(/<svg[^>]*>([\s\S]*)<\/svg>\s*$/);
    return m ? m[1] : String(svgString || '');
  }

  // ---------------------------------------------------------------------------
  // SVG shapes — drawn (not Unicode) so they render identically anywhere
  // ---------------------------------------------------------------------------
  function natureGlyphSvg(kind, cx, cy, size, ink, accent) {
    const s = size;
    const stroke = ink;
    const fill = accent || ink;
    switch (kind) {
      case 'fire': // upward triangle (alchemical fire)
        return `<polygon points="${cx},${cy - s / 2} ${cx + s / 2},${cy + s / 2} ${cx - s / 2},${cy + s / 2}"
          fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="miter"/>`;
      case 'water': // downward triangle (alchemical water)
        return `<polygon points="${cx - s / 2},${cy - s / 2} ${cx + s / 2},${cy - s / 2} ${cx},${cy + s / 2}"
          fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="miter"/>`;
      case 'air': // up triangle with horizontal bar
        return `<polygon points="${cx},${cy - s / 2} ${cx + s / 2},${cy + s / 2} ${cx - s / 2},${cy + s / 2}"
          fill="none" stroke="${stroke}" stroke-width="2.2"/>
          <line x1="${cx - s / 4.5}" y1="${cy + s / 8}" x2="${cx + s / 4.5}" y2="${cy + s / 8}"
          stroke="${stroke}" stroke-width="2.2"/>`;
      case 'earth': // down triangle with horizontal bar
        return `<polygon points="${cx - s / 2},${cy - s / 2} ${cx + s / 2},${cy - s / 2} ${cx},${cy + s / 2}"
          fill="none" stroke="${stroke}" stroke-width="2.2"/>
          <line x1="${cx - s / 4.5}" y1="${cy - s / 8}" x2="${cx + s / 4.5}" y2="${cy - s / 8}"
          stroke="${stroke}" stroke-width="2.2"/>`;
      case 'void': // solid disc
        return `<circle cx="${cx}" cy="${cy}" r="${s / 2.4}" fill="${fill}"/>`;
      case 'aether': { // 4-point sparkle diamond
        const t = s / 2;
        const p = s / 10;
        return `<path d="M ${cx},${cy - t} L ${cx + p},${cy - p}
          L ${cx + t},${cy} L ${cx + p},${cy + p}
          L ${cx},${cy + t} L ${cx - p},${cy + p}
          L ${cx - t},${cy} L ${cx - p},${cy - p} Z"
          fill="${fill}"/>`;
      }
      case 'none':
      default:
        return `<circle cx="${cx}" cy="${cy}" r="3" fill="${stroke}"/>`;
    }
  }

  function raritySealSvg(tier, cx, cy, ink) {
    const spec = RARITY[tier] || RARITY.common;
    const r = 22;
    let out = '';

    // Optional halo glow for mythic
    if (spec.glow) {
      out += `<circle cx="${cx}" cy="${cy}" r="${r + 8}" fill="${NAT_ORANGE}" opacity="0.22"/>`;
    }

    // Seal disc
    out += `<circle cx="${cx}" cy="${cy}" r="${r}"
      fill="${spec.sealFill}" stroke="${spec.sealStroke}" stroke-width="2"/>`;

    const gFill = spec.sealFill === 'transparent' ? ink : '#fafaf6';
    switch (spec.glyphKind) {
      case 'dot':
        out += `<circle cx="${cx}" cy="${cy}" r="4" fill="${gFill}"/>`;
        break;
      case 'halfmoon':
        out += `<path d="M ${cx - 9},${cy} A 9,9 0 0 1 ${cx + 9},${cy} L ${cx - 9},${cy} Z"
          fill="${gFill}"/>`;
        break;
      case 'diamond':
        out += `<polygon points="${cx},${cy - 9} ${cx + 9},${cy} ${cx},${cy + 9} ${cx - 9},${cy}"
          fill="${gFill}"/>
          <polygon points="${cx},${cy - 4.5} ${cx + 4.5},${cy} ${cx},${cy + 4.5} ${cx - 4.5},${cy}"
          fill="none" stroke="${spec.sealFill === 'transparent' ? '#111' : spec.sealFill}"
          stroke-width="1.4"/>`;
        break;
      case 'triangle':
        out += `<polygon points="${cx},${cy - 10} ${cx + 9},${cy + 6} ${cx - 9},${cy + 6}"
          fill="${gFill}"/>`;
        break;
      case 'hex': {
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const a = (i * 60 - 30) * Math.PI / 180;
          pts.push(`${(cx + 10 * Math.cos(a)).toFixed(1)},${(cy + 10 * Math.sin(a)).toFixed(1)}`);
        }
        out += `<polygon points="${pts.join(' ')}" fill="${gFill}"/>`;
        break;
      }
      case 'star':
        out += `<path d="M ${cx},${cy - 11} L ${cx + 2.6},${cy - 2.6} L ${cx + 11},${cy}
          L ${cx + 2.6},${cy + 2.6} L ${cx},${cy + 11}
          L ${cx - 2.6},${cy + 2.6} L ${cx - 11},${cy}
          L ${cx - 2.6},${cy - 2.6} Z" fill="${gFill}"/>`;
        break;
    }
    return out;
  }

  // Matter cost — small orange diamond markers, one per cost point
  function matterCostSvg(cost, ink) {
    let out = '';
    const startX = 60;
    const step = 30;
    for (let i = 0; i < cost; i++) {
      const cx = startX + i * step;
      const cy = 770;
      out += `<g transform="translate(${cx},${cy}) rotate(45)">
        <rect x="-9" y="-9" width="18" height="18"
          fill="${NAT_ORANGE}" stroke="${ink}" stroke-width="1.2"/>
      </g>`;
    }
    return out;
  }

  // Foil pattern definitions — used on Legendary and Mythic cards
  function foilDefs() {
    return `
      <pattern id="foilmesh" x="0" y="0" width="46" height="40" patternUnits="userSpaceOnUse">
        <polygon points="23,4 40,14 40,32 23,42 6,32 6,14"
          fill="none" stroke="${NAT_ORANGE}" stroke-width="0.5" opacity="0.35"/>
      </pattern>
      <linearGradient id="foilgrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"  stop-color="${NAT_ORANGE}" stop-opacity="0.12"/>
        <stop offset="40%" stop-color="#36d6ee"       stop-opacity="0.08"/>
        <stop offset="70%" stop-color="#7a4cb6"       stop-opacity="0.08"/>
        <stop offset="100%" stop-color="${NAT_ORANGE}" stop-opacity="0.12"/>
      </linearGradient>`;
  }
  function foilOverlaySvg() {
    return `
      <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}"
        fill="url(#foilmesh)" pointer-events="none"/>
      <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}"
        fill="url(#foilgrad)" pointer-events="none"/>`;
  }

  // ---------------------------------------------------------------------------
  // Card face renderer
  // ---------------------------------------------------------------------------
  function renderCard(spec) {
    if (!root.UNATOM) throw new Error('UNATOM renderer not loaded — include unatom-render.js first');
    const s = spec || {};
    const block = s.block != null ? s.block : 10080;
    // Suppress the portrait's own inline block-number stamp — the card frame's
    // header slot owns that data, so we don't want a duplicate inside the tile.
    const traits = Object.assign(
      {},
      s.portraitTraits || root.UNATOM.fromBlock(block),
      { showBlock: false }
    );
    const sch = root.UNATOM.SCHEMES[traits.scheme] || root.UNATOM.SCHEMES.obsidian;
    const ink = inkFor(sch);

    const nature = s.nature || traits.nature || 'none';
    const rarity = s.rarity && RARITY[s.rarity] ? s.rarity : 'common';
    const rarityDef = RARITY[rarity];

    const title = String(s.title || (root.UNATOM.WHISPERS?.[traits.symbol]?.field) || traits.symbol || 'UNATOM').toUpperCase();
    const cost = Math.max(0, Math.min(8, s.cost != null ? s.cost : 3));
    const integrity = s.integrity != null ? s.integrity : 60;
    const signalName = String(s.signalName || 'PULSE').toUpperCase();
    const signalText = s.signalText || 'deal INTEGRITY \u00D7 1.';
    const whisper = s.whisper || (root.UNATOM.WHISPERS?.[traits.symbol]?.whisper) || '\u2014';
    const strike = s.strike || rarityDef.label;
    const seriesRoman = s.seriesRoman || 'I';
    const blockLabel = s.blockHeightLabel || ('BLK #' + fmtBlockNum(block));
    const merkleHex = fakeMerkleStrip(block, 60);

    const portraitInner = stripOuterSvg(root.UNATOM.svg(traits));
    const hasFoil = rarity === 'legendary' || rarity === 'mythic';

    // Whisper wrap — 3 lines max at ~48 chars
    const whisperLines = wrapText(whisper, 48).slice(0, 3);
    let whisperOut = '';
    whisperLines.forEach((ln, i) => {
      whisperOut += `<text x="60" y="${915 + i * 22}"
        font-family="Georgia,'Times New Roman',serif" font-style="italic" font-size="15"
        fill="${ink}" fill-opacity="0.72">${escapeXml(ln)}</text>`;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}"
      width="${CARD_W}" height="${CARD_H}"
      font-family="ui-sans-serif,system-ui,-apple-system,'Helvetica Neue',sans-serif">
      <defs>
        <clipPath id="cardclip">
          <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" rx="34" ry="34"/>
        </clipPath>
        ${hasFoil ? foilDefs() : ''}
      </defs>

      <g clip-path="url(#cardclip)">
        <!-- Full-bleed scheme fill -->
        <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" fill="${sch.tile}"/>

        <!-- Portrait pane (subtle inset) -->
        <rect x="${P_X}" y="${P_Y}" width="${P_W}" height="${P_H}"
          fill="${ink}" fill-opacity="0.05"/>

        <!-- HEADER STRIP -->
        ${natureGlyphSvg(nature, 62, 62, 30, ink, NAT_ORANGE)}
        <text x="${CARD_W / 2}" y="55" text-anchor="middle"
          font-family="Georgia,'Times New Roman',serif" font-size="26"
          letter-spacing="6" fill="${ink}">${escapeXml(title)}</text>
        <text x="${CARD_W / 2}" y="80" text-anchor="middle"
          font-family="ui-monospace,'SF Mono',Menlo,monospace" font-size="10"
          letter-spacing="4" fill="${ink}" fill-opacity="0.65">SERIES ${escapeXml(seriesRoman)} \u00B7 UNATOM</text>
        <text x="708" y="60" text-anchor="end"
          font-family="ui-monospace,'SF Mono',Menlo,monospace" font-size="17"
          fill="${ink}">${escapeXml(blockLabel)}</text>

        <line x1="42" y1="98" x2="708" y2="98"
          stroke="${ink}" stroke-opacity="0.32" stroke-width="1"/>

        <!-- PORTRAIT -->
        <svg x="${P_X}" y="${P_Y}" width="${P_W}" height="${P_H}"
          viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid meet">
          ${portraitInner}
        </svg>

        <!-- Divider -->
        <line x1="42" y1="725" x2="708" y2="725"
          stroke="${ink}" stroke-opacity="0.32" stroke-width="1"/>

        <!-- COST + INTEGRITY -->
        ${matterCostSvg(cost, ink)}
        <text x="60" y="800"
          font-family="ui-monospace,'SF Mono',monospace" font-size="9"
          letter-spacing="3" fill="${ink}" fill-opacity="0.75">MATTER \u00B7 ${cost}</text>

        <text x="708" y="775" text-anchor="end"
          font-family="ui-monospace,'SF Mono',monospace" font-size="34"
          font-weight="700" fill="${ink}">${integrity}</text>
        <text x="708" y="800" text-anchor="end"
          font-family="ui-monospace,'SF Mono',monospace" font-size="9"
          letter-spacing="3" fill="${ink}" fill-opacity="0.75">INTEGRITY</text>

        <!-- SIGNAL BOX -->
        <rect x="45" y="815" width="660" height="68"
          fill="${ink}" fill-opacity="0.10"
          stroke="${ink}" stroke-opacity="0.35" stroke-width="1"/>
        <text x="60" y="842"
          font-family="ui-sans-serif,-apple-system,sans-serif" font-size="15"
          font-weight="700" letter-spacing="4" fill="${ink}">SIGNAL \u00B7 ${escapeXml(signalName)}</text>
        <text x="60" y="868"
          font-family="ui-sans-serif,-apple-system,sans-serif" font-size="13"
          fill="${ink}" fill-opacity="0.86">${escapeXml(signalText)}</text>

        <!-- WHISPER -->
        ${whisperOut}

        <!-- MERKLE HEX STRIP -->
        <rect x="42" y="978" width="666" height="24"
          fill="${ink}" fill-opacity="0.06"/>
        <text x="55" y="995"
          font-family="ui-monospace,'SF Mono',monospace" font-size="10"
          letter-spacing="1.5" fill="${ink}" fill-opacity="0.75">MRK \u00B7 ${escapeXml(merkleHex)}</text>

        <!-- Strike # left, rarity seal right -->
        <text x="42" y="1030"
          font-family="ui-monospace,'SF Mono',monospace" font-size="11"
          letter-spacing="2" fill="${ink}" fill-opacity="0.78">${escapeXml(strike)}</text>
        ${raritySealSvg(rarity, 700, 1022, ink)}

        ${hasFoil ? foilOverlaySvg() : ''}
      </g>

      <!-- Edge stroke -->
      <rect x="0.5" y="0.5" width="${CARD_W - 1}" height="${CARD_H - 1}" rx="34" ry="34"
        fill="none" stroke="${ink}" stroke-opacity="0.42" stroke-width="1"/>
    </svg>`;
  }

  // ---------------------------------------------------------------------------
  // Card back — NAT SIGIL, silent, no wordmark
  // ---------------------------------------------------------------------------
  function renderBack() {
    const BG = '#0a0b10';
    const CORE = NAT_ORANGE;

    // Hex mesh lattice — subtle scaffolding across the whole back
    const hexR = 36;
    const hexW = hexR * Math.sqrt(3);
    const hexH = hexR * 1.5;
    let mesh = '';
    for (let row = -1; row * hexH < CARD_H + hexR; row++) {
      for (let col = -1; col * hexW < CARD_W + hexR; col++) {
        const cx = col * hexW + (row % 2 ? hexW / 2 : 0);
        const cy = row * hexH;
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const a = (i * 60 - 30) * Math.PI / 180;
          pts.push(`${(cx + hexR * Math.cos(a)).toFixed(1)},${(cy + hexR * Math.sin(a)).toFixed(1)}`);
        }
        mesh += `<polygon points="${pts.join(' ')}" fill="none" stroke="${CORE}"
          stroke-width="0.6" opacity="0.14"/>`;
      }
    }

    // Center NAT SIGIL — large, ceremonial
    const scx = CARD_W / 2, scy = CARD_H / 2;
    const R = 210, nodeR = R * 0.66, dotR = R * 0.13, coreR = R * 0.19;

    const positions = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 - 90) * Math.PI / 180;
      positions.push([scx + nodeR * Math.cos(a), scy + nodeR * Math.sin(a)]);
    }

    const halo = `<path d="M ${(scx - R * 1.15).toFixed(1)} ${(scy - R * 0.98).toFixed(1)}
      A ${(R * 1.15).toFixed(1)} ${(R * 0.45).toFixed(1)} 0 0 1
      ${(scx + R * 1.15).toFixed(1)} ${(scy - R * 0.98).toFixed(1)}"
      fill="none" stroke="${CORE}" stroke-width="4" stroke-linecap="round" opacity="0.55"/>`;

    const disc = `<circle cx="${scx}" cy="${scy}" r="${R}"
      fill="${BG}" stroke="${CORE}" stroke-width="6" stroke-opacity="0.85"/>`;

    let spokes = '', ring = '', nodes = '';
    for (const [nx, ny] of positions) {
      spokes += `<line x1="${scx}" y1="${scy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}"
        stroke="${CORE}" stroke-width="2.6" stroke-linecap="round" opacity="0.88"/>`;
    }
    for (let i = 0; i < 6; i++) {
      const [x1, y1] = positions[i], [x2, y2] = positions[(i + 1) % 6];
      ring += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}"
        x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
        stroke="${CORE}" stroke-width="2.6" stroke-linecap="round" opacity="0.88"/>`;
    }
    for (const [nx, ny] of positions) {
      nodes += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${dotR}"
        fill="${CORE}" stroke="${BG}" stroke-width="2"/>`;
    }
    const core = `<circle cx="${scx}" cy="${scy}" r="${coreR}"
      fill="${CORE}" stroke="${BG}" stroke-width="3"/>`;

    // Corner accents — small chevrons pointing inward
    const chev = (x, y, rot) => `<g transform="translate(${x},${y}) rotate(${rot})">
      <path d="M -14,10 L 0,-8 L 14,10" fill="none" stroke="${CORE}"
        stroke-width="1.5" stroke-linejoin="round" opacity="0.6"/>
    </g>`;
    const corners =
      chev(60, 60, 180) +
      chev(CARD_W - 60, 60, 180) +
      chev(60, CARD_H - 60, 0) +
      chev(CARD_W - 60, CARD_H - 60, 0);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}"
      width="${CARD_W}" height="${CARD_H}">
      <defs>
        <clipPath id="backclip">
          <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" rx="34" ry="34"/>
        </clipPath>
        <radialGradient id="backglow" cx="50%" cy="50%" r="65%">
          <stop offset="0%"   stop-color="${CORE}" stop-opacity="0.18"/>
          <stop offset="45%"  stop-color="${CORE}" stop-opacity="0.06"/>
          <stop offset="100%" stop-color="${BG}"   stop-opacity="0"/>
        </radialGradient>
      </defs>
      <g clip-path="url(#backclip)">
        <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" fill="${BG}"/>
        <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" fill="url(#backglow)"/>
        ${mesh}
        <rect x="24" y="24" width="${CARD_W - 48}" height="${CARD_H - 48}"
          fill="none" stroke="${CORE}" stroke-width="1" stroke-opacity="0.35"/>
        ${corners}
        ${halo}${disc}${spokes}${ring}${nodes}${core}
      </g>
      <rect x="0.5" y="0.5" width="${CARD_W - 1}" height="${CARD_H - 1}" rx="34" ry="34"
        fill="none" stroke="${CORE}" stroke-opacity="0.5" stroke-width="1"/>
    </svg>`;
  }

  // ---------------------------------------------------------------------------
  root.UNATOMS_TCG = {
    render: renderCard,
    renderBack,
    RARITY,
    NATURE_KIND,
    NATURE_GLYPH,
    NAT_ORANGE,
    CARD_W,
    CARD_H,
  };
})(window);
