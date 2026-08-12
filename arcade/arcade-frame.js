// =============================================================================
// UNATOM ARCADE · retro card frame (v1) — 1982 vibes
// -----------------------------------------------------------------------------
// Reference: hand-drawn TCG mockups — aged cream cardstock, thick black outlines,
// Donkey Kong-era "UNATOM" wordmark (red/yellow shadow), big serif element letter
// bottom-left, nickname in quotes bottom-right, worn corners + paper texture.
//
// Wraps the existing `UNATOM.svg()` portrait in an SVG frame that carries the
// vintage TCG grammar. Also provides a matching card BACK (starfield + NAT SIGIL
// + Tron horizon grid + tagline).
//
// Public: window.ARCADE = { renderFace, renderBack, CARD_W, CARD_H }
// =============================================================================
(function (root) {
  'use strict';

  const CARD_W = 750;
  const CARD_H = 1050;

  const NAT_ORANGE   = '#F07E1B';
  const PAPER_BASE   = '#efe0c1';       // aged cream
  const PAPER_DEEP   = '#d9c48a';       // shadowed cream
  const INK          = '#1a1410';       // near-black warm ink
  const DK_YELLOW    = '#f7d03a';
  const DK_RED       = '#c43a1f';
  const SPACE_BG     = '#08061a';
  const GRID_BLUE    = '#36d6ee';
  const NODE_PALE    = '#f7f2e0';

  // Nicknames per scheme (matches the reference vibe: "THE EMBER", "THE CHALK"…)
  const SCHEME_NICKNAME = {
    graphite: 'THE GRAPHITE',
    bone:     'THE BONE',
    ember:    'THE EMBER',
    frost:    'THE FROST',
    jade:     'THE JADE',
    bronze:   'THE BRONZE',
    void:     'THE VOID',
    obsidian: 'THE OBSIDIAN',
    ash:      'THE ASH',
    signal:   'THE SIGNAL',
    chalk:    'THE CHALK',
    rust:     'THE RUST',
    aqua:     'THE AQUA',
  };

  // Rodarmor ordinal-derived rarity ladder — visible on every card
  const RARITY = {
    common:    { label: 'COMMON',    glyph: 'dot',      accent: '#8a8378', foil: false },
    uncommon:  { label: 'UNCOMMON',  glyph: 'halfmoon', accent: '#cfcfcf', foil: false },
    rare:      { label: 'RARE',      glyph: 'diamond',  accent: '#e6c14b', foil: false },
    epic:      { label: 'EPIC',      glyph: 'triangle', accent: '#b088e8', foil: true  },
    legendary: { label: 'LEGENDARY', glyph: 'hex',      accent: NAT_ORANGE, foil: true },
    mythic:    { label: 'MYTHIC',    glyph: 'star',     accent: NAT_ORANGE, foil: true, glow: true },
  };

  // Element short-name → long descriptor (subtitle text under the big letter)
  const ELEMENT_LONG = {
    Ha: 'HASH',        S:  'SIZE',        Se: 'STRIPPED',    Wt: 'WEIGHT',
    Ht: 'HEIGHT',      Vn: 'VERSION',     Vx: 'VERSION HEX', Mt: 'MERKLE',
    T:  'TIMESTAMP',   Me: 'MEDIAN TIME', Ne: 'NONCE',       B:  'BITS',
    Dy: 'DIFFICULTY',  Ck: 'CHAINWORK',   Nt: 'TX COUNT',    He: 'HEX',
    Tx: 'TX',          Hs: 'HASHES',      Si: 'SIZES',       Ve: 'V-BYTES',
    We: 'WEIGHT',      Vi: 'INPUTS',      Le: 'LOCKED',      Be: 'BALANCE',
    A:  'ADDRESS',     Hx: 'HEX',         Sq: 'SEQUENCE',    Ts: 'TRICKLE',
    Va: 'VALUE',       N:  'INDEX',       As: 'ASHES',       H:  'HEIGHT',
    Rs: 'RESIDUE',     Ty: 'TYPE',        Ws: 'WITNESS',
    Bf: 'BUFFER',      Ie: 'ISSUER',      Ce: 'CIPHER',      G:  'GENESIS',
    Hi: 'HASH INTERSECT',
  };

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------
  function stripOuterSvg(svgString) {
    const m = String(svgString || '').match(/<svg[^>]*>([\s\S]*)<\/svg>\s*$/);
    return m ? m[1] : String(svgString || '');
  }
  function escapeXml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
  function padNum(n, w) {
    const s = String(n);
    return s.length >= (w || 3) ? s : ('0'.repeat((w || 3) - s.length) + s);
  }
  // seeded PRNG for star placement so the back is deterministic per render
  function mulberry(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------------------------------------------------------------------------
  // Retro paper filter, vignette, wear — reusable defs block
  // ---------------------------------------------------------------------------
  function retroDefs(idPrefix) {
    const p = idPrefix || '';
    return `
      <filter id="${p}paperNoise" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" stitchTiles="stitch"/>
        <feColorMatrix values="0 0 0 0 0.28
                               0 0 0 0 0.22
                               0 0 0 0 0.14
                               0 0 0 0.35 0"/>
      </filter>
      <filter id="${p}paperGrain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" seed="7"/>
        <feColorMatrix values="0 0 0 0 0.45
                               0 0 0 0 0.35
                               0 0 0 0 0.22
                               0 0 0 0.32 0"/>
      </filter>
      <radialGradient id="${p}vignette" cx="50%" cy="50%" r="72%">
        <stop offset="55%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.42"/>
      </radialGradient>
      <radialGradient id="${p}cornerWear" cx="0%" cy="0%" r="35%">
        <stop offset="0%" stop-color="#000" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    `;
  }

  // Donkey Kong-style UNATOM wordmark: red drop-shadow + yellow face + black stroke
  function dkWordmark(x, y, size, opts) {
    const o = opts || {};
    const text = o.text || 'UNATOM';
    const anchor = o.anchor || 'start';
    const ff = "Impact, 'Arial Black', Haettenschweiler, sans-serif";
    const stroke = o.stroke || 6;
    const shadowOff = o.shadowOff || Math.round(size * 0.08);
    const yellow = o.yellow || DK_YELLOW;
    const red = o.red || DK_RED;
    // The three-layer stack: outline, shadow, face
    return `
      <text x="${x + shadowOff}" y="${y + shadowOff}" text-anchor="${anchor}"
        font-family="${ff}" font-size="${size}" font-weight="900"
        letter-spacing="0.01em" fill="${red}"
        stroke="${INK}" stroke-width="${stroke}"
        paint-order="stroke fill">${escapeXml(text)}</text>
      <text x="${x}" y="${y}" text-anchor="${anchor}"
        font-family="${ff}" font-size="${size}" font-weight="900"
        letter-spacing="0.01em" fill="${yellow}"
        stroke="${INK}" stroke-width="${stroke}"
        paint-order="stroke fill">${escapeXml(text)}</text>
    `;
  }

  // -------------------------------------------------------------------------
  // TCG grammar helpers — Integrity, Matter, Signal, rarity, filigree, badges
  // -------------------------------------------------------------------------

  // Wax-seal-style rarity glyph. Small (r=18) or big (r=28).
  function raritySeal(cx, cy, tier, r) {
    const spec = RARITY[tier] || RARITY.common;
    const R = r || 24;
    const fill = spec.accent === '#8a8378' ? PAPER_BASE : spec.accent;
    const stroke = INK;
    const gFill = spec.accent === '#8a8378' ? INK : '#0e0806';
    let glyph = '';
    switch (spec.glyph) {
      case 'dot':
        glyph = `<circle cx="${cx}" cy="${cy}" r="${R * 0.28}" fill="${gFill}"/>`;
        break;
      case 'halfmoon':
        glyph = `<path d="M ${cx - R * 0.55},${cy} A ${R * 0.55},${R * 0.55} 0 0 1 ${cx + R * 0.55},${cy} L ${cx - R * 0.55},${cy} Z" fill="${gFill}"/>`;
        break;
      case 'diamond':
        glyph = `<polygon points="${cx},${cy - R * 0.55} ${cx + R * 0.55},${cy} ${cx},${cy + R * 0.55} ${cx - R * 0.55},${cy}" fill="${gFill}"/>`;
        break;
      case 'triangle':
        glyph = `<polygon points="${cx},${cy - R * 0.6} ${cx + R * 0.55},${cy + R * 0.35} ${cx - R * 0.55},${cy + R * 0.35}" fill="${gFill}"/>`;
        break;
      case 'hex': {
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const a = (i * 60 - 30) * Math.PI / 180;
          pts.push(`${(cx + R * 0.6 * Math.cos(a)).toFixed(1)},${(cy + R * 0.6 * Math.sin(a)).toFixed(1)}`);
        }
        glyph = `<polygon points="${pts.join(' ')}" fill="${gFill}"/>`;
        break;
      }
      case 'star':
        glyph = `<path d="M ${cx},${cy - R * 0.65} L ${cx + R * 0.18},${cy - R * 0.18} L ${cx + R * 0.65},${cy} L ${cx + R * 0.18},${cy + R * 0.18} L ${cx},${cy + R * 0.65} L ${cx - R * 0.18},${cy + R * 0.18} L ${cx - R * 0.65},${cy} L ${cx - R * 0.18},${cy - R * 0.18} Z" fill="${gFill}"/>`;
        break;
    }
    const glow = spec.glow
      ? `<circle cx="${cx}" cy="${cy}" r="${R + 8}" fill="${NAT_ORANGE}" opacity="0.28"/>`
      : '';
    // Dashed rim to give it a hand-stamp feel
    const dashes = `<circle cx="${cx}" cy="${cy}" r="${R + 4}" fill="none" stroke="${stroke}" stroke-width="1.2" stroke-dasharray="2 3" opacity="0.5"/>`;
    return `${glow}<circle cx="${cx}" cy="${cy}" r="${R}" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>${dashes}${glyph}`;
  }

  // INTEGRITY badge — top-right of card. Dark shield with big yellow-red gradient
  // number (DK-style). Reads as "HP" but branded UNATOMS.
  function integrityBadge(cx, cy, value) {
    const w = 140, h = 88;
    const x = cx - w / 2, y = cy - h / 2;
    const label = String(value);
    return `
      <g class="integrity-badge">
        <!-- shield outer (retro angled rect) -->
        <path d="M ${x},${y + 10} L ${x + 10},${y} L ${x + w - 10},${y}
          L ${x + w},${y + 10} L ${x + w},${y + h - 10} L ${x + w - 10},${y + h}
          L ${x + 10},${y + h} L ${x},${y + h - 10} Z"
          fill="${INK}" stroke="${DK_YELLOW}" stroke-width="2.5"/>
        <!-- inner border -->
        <path d="M ${x + 6},${y + 12} L ${x + 12},${y + 6} L ${x + w - 12},${y + 6}
          L ${x + w - 6},${y + 12} L ${x + w - 6},${y + h - 12} L ${x + w - 12},${y + h - 6}
          L ${x + 12},${y + h - 6} L ${x + 6},${y + h - 12} Z"
          fill="none" stroke="${DK_YELLOW}" stroke-width="0.8" opacity="0.4"/>
        <!-- INTEGRITY label -->
        <text x="${cx}" y="${y + 22}" text-anchor="middle"
          font-family="Impact, 'Arial Black', sans-serif" font-size="12"
          font-weight="900" fill="${DK_YELLOW}" letter-spacing="4">INTEGRITY</text>
        <!-- Big DK-style number -->
        ${dkWordmark(cx, y + 72, 46, {
          anchor: 'middle',
          text: label,
          stroke: 4.5,
          shadowOff: 4,
        })}
      </g>
    `;
  }

  // MATTER cost row — orange diamond gems + label. cost is 0..8.
  function matterCostRow(x, y, cost) {
    let out = `<text x="${x}" y="${y - 2}" font-family="Impact, sans-serif"
      font-size="14" letter-spacing="4" fill="${INK}" font-weight="900">MATTER</text>`;
    const dotSize = 22;
    const step = dotSize + 8;
    for (let i = 0; i < Math.max(cost, 0); i++) {
      const dx = x + 92 + i * step;
      const dy = y - 12;
      out += `
        <g transform="translate(${dx},${dy}) rotate(45)">
          <rect x="${-dotSize / 2}" y="${-dotSize / 2}" width="${dotSize}" height="${dotSize}"
            fill="${NAT_ORANGE}" stroke="${INK}" stroke-width="2"/>
          <rect x="${-dotSize / 2 + 4}" y="${-dotSize / 2 + 4}" width="${dotSize - 8}" height="${dotSize - 8}"
            fill="none" stroke="${DK_YELLOW}" stroke-width="0.8" opacity="0.7"/>
        </g>`;
    }
    return out;
  }

  // SIGNAL banner — retro arcade ribbon strip with slanted corners
  function signalBanner(x, y, w, h, name, effect) {
    const slant = 18;
    // Ribbon shape: rectangle with slanted-off top-left + bottom-right for retro feel
    const path = `M ${x + slant},${y} L ${x + w},${y} L ${x + w - slant},${y + h}
      L ${x},${y + h} Z`;
    return `
      <g class="signal-banner">
        <!-- shadow -->
        <path d="M ${x + slant + 3},${y + 5} L ${x + w + 3},${y + 5} L ${x + w - slant + 3},${y + h + 5}
          L ${x + 3},${y + h + 5} Z" fill="${INK}" opacity="0.35"/>
        <!-- body -->
        <path d="${path}" fill="${INK}"/>
        <!-- inner outline -->
        <path d="M ${x + slant + 6},${y + 5} L ${x + w - 5},${y + 5}
          L ${x + w - slant - 5},${y + h - 5} L ${x + 5},${y + h - 5} Z"
          fill="none" stroke="${DK_YELLOW}" stroke-width="1" opacity="0.55"/>
        <!-- SIGNAL label pill top-left -->
        <rect x="${x + slant + 12}" y="${y + 12}" width="82" height="22" rx="4" fill="${DK_YELLOW}"/>
        <text x="${x + slant + 53}" y="${y + 28}" text-anchor="middle"
          font-family="Impact, sans-serif" font-size="14" font-weight="900"
          letter-spacing="4" fill="${INK}">SIGNAL</text>
        <!-- Attack name — yellow bold -->
        <text x="${x + slant + 108}" y="${y + 30}"
          font-family="Impact, 'Arial Black', sans-serif" font-size="26"
          font-weight="900" letter-spacing="0.03em" fill="${DK_YELLOW}"
          stroke="${INK}" stroke-width="0.8"
          paint-order="stroke fill">${escapeXml(name.toUpperCase())}</text>
        <!-- Effect text -->
        <text x="${x + slant + 12}" y="${y + h - 16}"
          font-family="Georgia, serif" font-size="15"
          fill="${PAPER_BASE}" opacity="0.92">${escapeXml(effect)}</text>
      </g>
    `;
  }

  // Corner filigree ornament — small decorative flourish
  function cornerFiligree(cx, cy, color, orient) {
    // orient = 'tl' | 'tr' | 'bl' | 'br'
    let rot = 0;
    if (orient === 'tr') rot = 90;
    else if (orient === 'br') rot = 180;
    else if (orient === 'bl') rot = 270;
    const c = color || INK;
    return `<g transform="translate(${cx},${cy}) rotate(${rot})">
      <path d="M 6,6 L 30,6 M 6,6 L 6,30 M 6,6 Q 22,6 22,22 M 6,6 Q 6,22 22,22"
        fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="6" cy="6" r="3" fill="${c}"/>
    </g>`;
  }

  // Element badge — circular ornate stamp behind the big serif element letter
  function elementBadge(cx, cy, symbol, longName) {
    const R = 68;
    return `<g class="element-badge">
      <!-- outer decorative ring -->
      <circle cx="${cx}" cy="${cy}" r="${R + 6}" fill="none"
        stroke="${INK}" stroke-width="2.5"/>
      <circle cx="${cx}" cy="${cy}" r="${R + 12}" fill="none"
        stroke="${INK}" stroke-width="0.8" stroke-dasharray="2 4" opacity="0.55"/>
      <!-- inner filled disc -->
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="${PAPER_DEEP}"
        stroke="${INK}" stroke-width="1.5"/>
      <!-- Big serif element letter -->
      <text x="${cx}" y="${cy + 22}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="72"
        font-weight="900" fill="${INK}"
        letter-spacing="0.01em">${escapeXml(symbol)}</text>
      ${longName ? `<text x="${cx}" y="${cy + R + 18}" text-anchor="middle"
        font-family="Impact, sans-serif" font-size="9" letter-spacing="3"
        font-weight="900" fill="${INK}" opacity="0.75">${escapeXml(longName)}</text>` : ''}
    </g>`;
  }

  // ---------------------------------------------------------------------------
  // Card FACE — the retro TCG portrait
  // spec: { block, nickname, schemeOverride, symOverride, force:[…],
  //         rarity, integrity, cost, signalName, signalText, whisper,
  //         strike, seriesRoman }
  // ---------------------------------------------------------------------------
  function renderFace(spec) {
    if (!root.UNATOM) throw new Error('UNATOM renderer not loaded');
    const s = spec || {};
    const block = s.block != null ? s.block : 10080;
    const baseTraits = root.UNATOM.fromBlock(block);
    const traits = Object.assign({}, baseTraits, { showBlock: false });
    if (s.schemeOverride) traits.scheme = s.schemeOverride;
    if (s.symOverride) traits.sym = s.symOverride;
    if (Array.isArray(s.force)) {
      s.force.forEach(k => { traits[k] = true; });
    }
    const sch = root.UNATOM.SCHEMES[traits.scheme] || root.UNATOM.SCHEMES.bone;
    const nickname = (s.nickname || SCHEME_NICKNAME[traits.scheme] || 'THE UNATOM').toUpperCase();
    const symbol = traits.sym || 'Ne';
    const longName = ELEMENT_LONG[symbol] || 'ELEMENT';
    const blockLabel = '#' + padNum(block, 3);
    const rarity = RARITY[s.rarity] || RARITY.common;
    const integrity = s.integrity != null ? s.integrity : 60;
    const cost = Math.max(0, Math.min(8, s.cost != null ? s.cost : 3));
    const signalName = s.signalName || 'PULSE';
    const signalText = s.signalText || 'deal 20.';
    const whisper = s.whisper ||
      (root.UNATOM.WHISPERS && root.UNATOM.WHISPERS[symbol] && root.UNATOM.WHISPERS[symbol].whisper) ||
      '';
    const seriesRoman = s.seriesRoman || 'I';
    const strike = s.strike ||
      (rarity.label === 'MYTHIC'    ? 'STRIKE 001 / 001'
       : rarity.label === 'LEGENDARY' ? 'STRIKE 007 / 500'
       : rarity.label === 'EPIC'      ? 'STRIKE 042 / 2,000'
       : rarity.label === 'RARE'      ? '/ 10,080'
       : rarity.label === 'UNCOMMON'  ? ''
       : '');

    // Fake merkle hex, deterministic from block
    const merkleHex = fakeMerkle(block, 58);

    const portraitInner = stripOuterSvg(root.UNATOM.svg(traits));

    // Whisper wrap (single line preferred; trimmed if needed)
    const whisperLine = whisper.length > 96 ? whisper.slice(0, 93) + '\u2026' : whisper;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}"
      width="${CARD_W}" height="${CARD_H}"
      font-family="ui-sans-serif, system-ui, sans-serif">
      <defs>
        ${retroDefs('face_')}
        <clipPath id="faceClip">
          <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" rx="42" ry="42"/>
        </clipPath>
        <linearGradient id="rarityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="${rarity.accent}" stop-opacity="0.65"/>
          <stop offset="50%"  stop-color="${DK_YELLOW}"     stop-opacity="0.15"/>
          <stop offset="100%" stop-color="${rarity.accent}" stop-opacity="0.65"/>
        </linearGradient>
      </defs>

      <g clip-path="url(#faceClip)">
        <!-- Aged cream base -->
        <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" fill="${PAPER_BASE}"/>
        <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}"
          filter="url(#face_paperGrain)" opacity="0.55"/>

        <!-- TOP BAND (scheme color) -->
        <rect x="0" y="0" width="${CARD_W}" height="140" fill="${sch.tile}"/>
        <rect x="0" y="140" width="${CARD_W}" height="4" fill="${INK}"/>
        <rect x="0" y="144" width="${CARD_W}" height="10" fill="${INK}" opacity="0.16"/>

        <!-- UNATOM wordmark top-left -->
        ${dkWordmark(42, 88, 54, { anchor: 'start' })}

        <!-- Block number below the wordmark, tiny -->
        <text x="42" y="128" font-family="Impact, 'Arial Black', sans-serif"
          font-size="18" font-weight="900" letter-spacing="0.05em"
          fill="${PAPER_BASE}" stroke="${INK}" stroke-width="3"
          paint-order="stroke fill">SERIES ${escapeXml(seriesRoman)}
          &#183; BLK ${escapeXml(blockLabel)}</text>

        <!-- INTEGRITY badge top-right -->
        ${integrityBadge(CARD_W - 100, 70, integrity)}

        <!-- Rarity wax-seal — top-right corner over the integrity band -->
        ${raritySeal(CARD_W - 40, 30, s.rarity || 'common', 18)}

        <!-- SERIES BAND thin ink strip under the top band -->
        <rect x="0" y="154" width="${CARD_W}" height="26" fill="${INK}"/>
        <text x="${CARD_W / 2}" y="172" text-anchor="middle"
          font-family="ui-monospace, 'SF Mono', Menlo, monospace"
          font-size="11" font-weight="700" letter-spacing="6"
          fill="${PAPER_BASE}" opacity="0.9">UNATOM &#183; DIGITAL MATTER &#183; TRADING CARD</text>

        <!-- PORTRAIT — specimen frame with thick black border + inner cream pane -->
        <rect x="82" y="200" width="${CARD_W - 164}" height="466"
          rx="52" ry="52" fill="${INK}"/>
        <rect x="92" y="210" width="${CARD_W - 184}" height="446"
          rx="45" ry="45" fill="${PAPER_DEEP}"/>

        <!-- Corner filigree on specimen frame -->
        ${cornerFiligree(96, 214, INK, 'tl')}
        ${cornerFiligree(CARD_W - 96, 214, INK, 'tr')}
        ${cornerFiligree(96, CARD_H - 396, INK, 'bl')}
        ${cornerFiligree(CARD_W - 96, CARD_H - 396, INK, 'br')}

        <!-- UNATOM ART inside specimen -->
        <svg x="92" y="210" width="${CARD_W - 184}" height="446"
          viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid meet">
          ${portraitInner}
        </svg>

        <!-- MATTER cost row — below specimen -->
        ${matterCostRow(92, 700, cost)}

        <!-- SIGNAL BANNER -->
        ${signalBanner(52, 728, CARD_W - 104, 88, signalName, signalText)}

        <!-- ELEMENT badge (bottom-left) + NICKNAME (bottom-right) -->
        ${elementBadge(140, 900, symbol, longName)}
        <text x="${CARD_W - 60}" y="885" text-anchor="end"
          font-family="Georgia, 'Times New Roman', serif" font-style="italic"
          font-size="34" font-weight="700" fill="${INK}"
          >"${escapeXml(nickname)}"</text>
        <text x="${CARD_W - 60}" y="915" text-anchor="end"
          font-family="Impact, sans-serif" font-size="12"
          letter-spacing="4" fill="${INK}" font-weight="900" opacity="0.65"
          >A ${escapeXml((SCHEME_NICKNAME[traits.scheme] || 'UNATOM').replace('THE ', ''))}-CLASS UNATOM</text>

        <!-- WHISPER italic strip -->
        ${whisperLine ? `<text x="${CARD_W / 2}" y="960" text-anchor="middle"
          font-family="Georgia, serif" font-style="italic" font-size="13"
          fill="${INK}" opacity="0.68">&ldquo;${escapeXml(whisperLine)}&rdquo;</text>` : ''}

        <!-- MERKLE hex strip -->
        <rect x="42" y="975" width="${CARD_W - 84}" height="22" fill="${INK}" opacity="0.10"/>
        <text x="52" y="991" font-family="ui-monospace, 'SF Mono', monospace"
          font-size="10" letter-spacing="1.5" fill="${INK}" opacity="0.75"
          >MRK &#183; ${escapeXml(merkleHex)}</text>

        <!-- BOTTOM ROW — rarity label left, strike + mini-seal right -->
        <text x="52" y="1024" font-family="Impact, sans-serif" font-size="13"
          font-weight="900" letter-spacing="4" fill="${INK}"
          >${escapeXml(rarity.label)}${strike ? ' &#183; ' + escapeXml(strike) : ''}</text>
        ${raritySeal(CARD_W - 62, 1018, s.rarity || 'common', 14)}

        <!-- Faint paper scratches over the whole card -->
        <rect x="0" y="180" width="${CARD_W}" height="${CARD_H - 180}"
          filter="url(#face_paperNoise)" opacity="0.24"/>

        <!-- Corner wear — 4 dark radial blobs -->
        <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" fill="url(#face_cornerWear)"/>
        <g transform="translate(${CARD_W},0) scale(-1,1)">
          <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" fill="url(#face_cornerWear)"/>
        </g>
        <g transform="translate(0,${CARD_H}) scale(1,-1)">
          <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" fill="url(#face_cornerWear)"/>
        </g>
        <g transform="translate(${CARD_W},${CARD_H}) scale(-1,-1)">
          <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" fill="url(#face_cornerWear)"/>
        </g>

        <!-- Global vignette -->
        <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" fill="url(#face_vignette)"/>

        <!-- Rarity accent border — Epic/Legendary/Mythic get a foil-like frame -->
        ${rarity.foil ? `<rect x="24" y="24" width="${CARD_W - 48}" height="${CARD_H - 48}"
          rx="30" ry="30" fill="none" stroke="url(#rarityGrad)" stroke-width="3"/>` : ''}

        <!-- Thick outer BLACK border -->
        <rect x="12" y="12" width="${CARD_W - 24}" height="${CARD_H - 24}"
          rx="34" ry="34" fill="none" stroke="${INK}" stroke-width="10"/>
      </g>

      <!-- Card outer edge -->
      <rect x="0.5" y="0.5" width="${CARD_W - 1}" height="${CARD_H - 1}"
        rx="42" ry="42" fill="none" stroke="${INK}" stroke-opacity="0.7"
        stroke-width="1"/>
    </svg>`;
  }

  // Fake deterministic merkle hex (real cards would read block header)
  function fakeMerkle(seed, len) {
    const chars = '0123456789abcdef';
    let s = ((Number(seed) || 0) * 2654435761) >>> 0;
    if (s === 0) s = 0xcafefeed;
    let out = '';
    for (let i = 0; i < (len || 60); i++) {
      s = (s * 1103515245 + 12345) >>> 0;
      out += chars[s & 15];
    }
    return out;
  }

  // ---------------------------------------------------------------------------
  // Card BACK — starfield + DK UNATOM wordmark + NAT SIGIL + Tron grid + tagline
  // ---------------------------------------------------------------------------
  function renderBack(opts) {
    const o = opts || {};
    const label = o.label || '#001';
    const tagline = (o.tagline || 'THE NETWORK IS THE POWER').toUpperCase();

    // Starfield — 140 deterministic stars over the top 2/3
    const rand = mulberry(12345);
    let stars = '';
    for (let i = 0; i < 140; i++) {
      const x = rand() * CARD_W;
      const y = rand() * (CARD_H * 0.68);
      const r = 0.4 + rand() * 1.8;
      const op = 0.35 + rand() * 0.55;
      stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}"
        fill="#fff" opacity="${op.toFixed(2)}"/>`;
    }
    // A few brighter stars with 4-point cross-flare
    for (let i = 0; i < 6; i++) {
      const x = rand() * CARD_W;
      const y = rand() * (CARD_H * 0.55) + 30;
      stars += `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
        <path d="M 0,-6 L 0,6 M -6,0 L 6,0" stroke="#fff" stroke-width="0.8" opacity="0.9"/>
        <circle r="1.4" fill="#fff"/>
      </g>`;
    }

    // NAT SIGIL — centered upper-middle
    const scx = CARD_W / 2, scy = 470;
    const R = 165, nodeRingR = R * 0.66, dotR = R * 0.13, coreR = R * 0.20;
    const positions = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 - 90) * Math.PI / 180;
      positions.push([scx + nodeRingR * Math.cos(a), scy + nodeRingR * Math.sin(a)]);
    }
    let spokes = '', ring = '', nodes = '';
    for (const [nx, ny] of positions) {
      spokes += `<line x1="${scx}" y1="${scy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}"
        stroke="${NODE_PALE}" stroke-width="3" stroke-linecap="round" opacity="0.95"/>`;
    }
    for (let i = 0; i < 6; i++) {
      const [x1, y1] = positions[i], [x2, y2] = positions[(i + 1) % 6];
      ring += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}"
        x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
        stroke="${NODE_PALE}" stroke-width="3" stroke-linecap="round" opacity="0.95"/>`;
    }
    for (const [nx, ny] of positions) {
      nodes += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${dotR}"
        fill="${NODE_PALE}" stroke="${SPACE_BG}" stroke-width="2.5"/>`;
    }
    const core = `<circle cx="${scx}" cy="${scy}" r="${coreR}"
      fill="${NAT_ORANGE}" stroke="${SPACE_BG}" stroke-width="3"/>
      <circle cx="${scx}" cy="${scy}" r="${coreR + 8}" fill="none"
        stroke="${NAT_ORANGE}" stroke-width="1" opacity="0.5"/>`;

    // Retrowave horizon grid — bottom third
    const gridTopY = 720;                // vanishing horizon
    const gridBotY = CARD_H - 90;        // ends above tagline
    const vpx = CARD_W / 2;

    // Horizontal lines: perspective spacing (more gap toward viewer)
    let horiz = '';
    const horizLines = 10;
    for (let i = 0; i < horizLines; i++) {
      // parametric t 0..1, use quadratic for perspective
      const t = i / (horizLines - 1);
      const tt = Math.pow(t, 1.6);
      const y = gridTopY + tt * (gridBotY - gridTopY);
      const w = 4 + tt * 900; // width of line at that depth (fades out at horizon)
      const x1 = Math.max(0, vpx - w / 2);
      const x2 = Math.min(CARD_W, vpx + w / 2);
      const op = 0.35 + tt * 0.55;
      horiz += `<line x1="${x1.toFixed(1)}" y1="${y.toFixed(1)}"
        x2="${x2.toFixed(1)}" y2="${y.toFixed(1)}"
        stroke="${GRID_BLUE}" stroke-width="${(0.8 + tt * 1.8).toFixed(2)}"
        opacity="${op.toFixed(2)}"/>`;
    }

    // Vertical rays: radiate from vanishing point down + outward
    let verts = '';
    const rays = 15;
    for (let i = 0; i < rays; i++) {
      const frac = (i - (rays - 1) / 2) / ((rays - 1) / 2); // -1..1
      // bottom x spans -100..CARD_W+100
      const bottomX = vpx + frac * (CARD_W * 0.9);
      verts += `<line x1="${vpx}" y1="${gridTopY}"
        x2="${bottomX.toFixed(1)}" y2="${gridBotY}"
        stroke="${GRID_BLUE}" stroke-width="1.3" opacity="0.55"/>`;
    }

    // Horizon glow — soft gradient at gridTopY
    const horizonGlow = `
      <linearGradient id="horizGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${NAT_ORANGE}" stop-opacity="0"/>
        <stop offset="60%" stop-color="${NAT_ORANGE}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${NAT_ORANGE}" stop-opacity="0"/>
      </linearGradient>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}"
      width="${CARD_W}" height="${CARD_H}">
      <defs>
        <clipPath id="backClip">
          <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" rx="42" ry="42"/>
        </clipPath>
        ${retroDefs('back_')}
        ${horizonGlow}
        <radialGradient id="sigilAura" cx="50%" cy="50%" r="55%">
          <stop offset="0%"  stop-color="${NAT_ORANGE}" stop-opacity="0.30"/>
          <stop offset="65%" stop-color="${NAT_ORANGE}" stop-opacity="0.06"/>
          <stop offset="100%" stop-color="${SPACE_BG}"   stop-opacity="0"/>
        </radialGradient>
      </defs>

      <g clip-path="url(#backClip)">
        <!-- Deep space background -->
        <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" fill="${SPACE_BG}"/>

        <!-- Subtle atmospheric grain -->
        <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}"
          filter="url(#back_paperGrain)" opacity="0.20"/>

        <!-- Star field -->
        ${stars}

        <!-- Sigil aura glow behind the sigil -->
        <ellipse cx="${scx}" cy="${scy}" rx="270" ry="200" fill="url(#sigilAura)"/>

        <!-- DK-style UNATOM wordmark BIG at top center -->
        <g transform="translate(${CARD_W / 2}, 168)">
          ${dkWordmark(0, 0, 102, {
            anchor: 'middle',
            stroke: 8,
            shadowOff: 10,
            yellow: DK_YELLOW,
            red: DK_RED,
          })}
        </g>

        <!-- Corner label — top-left so it doesn't fight the wordmark -->
        <text x="42" y="66" text-anchor="start"
          font-family="Impact, 'Arial Black', sans-serif" font-size="24"
          font-weight="900" fill="${NODE_PALE}" opacity="0.85"
          letter-spacing="0.08em">${escapeXml(label)}</text>

        <!-- NAT SIGIL -->
        ${spokes}
        ${ring}
        ${nodes}
        ${core}

        <!-- Horizon orange glow -->
        <rect x="0" y="${gridTopY - 26}" width="${CARD_W}" height="52"
          fill="url(#horizGlow)" opacity="0.9"/>

        <!-- Retrowave horizon grid -->
        ${horiz}
        ${verts}

        <!-- Tagline at bottom, below the grid -->
        <text x="${CARD_W / 2}" y="${CARD_H - 40}" text-anchor="middle"
          font-family="Georgia, 'Times New Roman', serif" font-style="italic"
          font-size="22" fill="${NODE_PALE}" opacity="0.92"
          letter-spacing="0.08em">"${escapeXml(tagline)}"</text>

        <!-- Global vignette -->
        <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" fill="url(#back_vignette)"/>

        <!-- Thick outer BLACK border -->
        <rect x="12" y="12" width="${CARD_W - 24}" height="${CARD_H - 24}"
          rx="34" ry="34" fill="none" stroke="${INK}" stroke-width="10"/>
      </g>

      <rect x="0.5" y="0.5" width="${CARD_W - 1}" height="${CARD_H - 1}"
        rx="42" ry="42" fill="none" stroke="${INK}" stroke-opacity="0.7"
        stroke-width="1"/>
    </svg>`;
  }

  root.ARCADE = {
    renderFace,
    renderBack,
    CARD_W,
    CARD_H,
    SCHEME_NICKNAME,
  };
})(window);
