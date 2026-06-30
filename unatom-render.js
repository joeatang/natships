// =============================================================================
// UNATOMS · shared renderer (v0.6)
// Generated from prototypes/unatom-prototype.html — single source of truth
// for the SVG composer, traits, deterministic seeding, and whispers.
// Exposes a global `UNATOM` namespace.
// =============================================================================
(function (root) {
const BASE = {
  pupil:  '#0a0b10',
  ink:    '#13141b',
  white:  '#fafaf6',
  orange: '#f7931a',
  cyan:   '#36d6ee',
  purple: '#7a4cb6',
  blood:  '#c43a1f',
};

// Each scheme: dominant material + border + accent + secondary
const SCHEMES = {
  graphite: { tile:'#1d1f29', border:'#f4eedf', sym:'#f4eedf', a:'#f7931a', b:'#36d6ee', name:'Graphite' },
  bone:     { tile:'#efe6d0', border:'#2a2620', sym:'#2a2620', a:'#b8651f', b:'#5a8a8a', name:'Bone' },
  ember:    { tile:'#f7931a', border:'#fff7e6', sym:'#241008', a:'#fff7e6', b:'#c43a1f', name:'Ember' },
  frost:    { tile:'#dceff5', border:'#3a4a5c', sym:'#1a2a3c', a:'#36d6ee', b:'#7a4cb6', name:'Frost' },
  jade:     { tile:'#2d6b58', border:'#e6f0d8', sym:'#e6f0d8', a:'#f7931a', b:'#a3d977', name:'Jade' },
  bronze:   { tile:'#8a5a2e', border:'#fff0d8', sym:'#fff0d8', a:'#ffb84d', b:'#36d6ee', name:'Bronze' },
  void:     { tile:'#0a0b10', border:'#7a4cb6', sym:'#cfb8e8', a:'#b388f0', b:'#7a4cb6', name:'Void' },
  obsidian: { tile:'#16161a', border:'#d9d9e0', sym:'#f4eedf', a:'#f7931a', b:'#36d6ee', name:'Obsidian' },
  ash:      { tile:'#5c5a55', border:'#d8d2c4', sym:'#d8d2c4', a:'#d77a3a', b:'#3a4a5c', name:'Ash' },
  signal:   { tile:'#1d3a5c', border:'#36d6ee', sym:'#f4eedf', a:'#36d6ee', b:'#f7931a', name:'Signal' },
  chalk:    { tile:'#f0ebde', border:'#3a3a3a', sym:'#3a3a3a', a:'#7a7060', b:'#9eb39e', name:'Chalk' },
  rust:     { tile:'#7a3a1e', border:'#e8d0a8', sym:'#e8d0a8', a:'#ffb84d', b:'#3a4a3a', name:'Rust' },
  aqua:     { tile:'#0f5d6e', border:'#dcf5f5', sym:'#dcf5f5', a:'#36d6ee', b:'#a8e6f0', name:'Aqua' },
};

// Series 0 contract
const BLAST_OFF = 10080;
const SERIES_SIZE = 10080;

const CATEGORIES = [
  { key:'block', label:'Block Data',
    els:['Ha','S','Se','Wt','Ht','Vn','Vx','Mt','T','Me','Ne','B','Dy','Ck','Nt'] },
  { key:'tx', label:'Transaction',
    els:['He','Tx','Hs','Si','Ve','We','Vi','Le','Be'] },
  { key:'input', label:'Input',
    els:['A','Hx','Sq','Ts'] },
  { key:'output', label:'Output',
    els:['Va','N','As','H','Rs','Ty','Ws'] },
  { key:'extra', label:'Extra',
    els:['Bf','Ie','Ce'] },
];

// -----------------------------------------------------------------------------
// Tile geometry — 1024×1024 canvas
// -----------------------------------------------------------------------------
const VB = 1024;
const TILE = { x: 152, y: 92, w: 720, h: 720, r: 120, sw: 18 };
const CX = TILE.x + TILE.w / 2;
const TILE_BOTTOM = TILE.y + TILE.h;

// vertical hierarchy
const THIRD_EYE_CY  = TILE.y + 188;   // upper center
const LOWER_EYE_CY  = TILE.y + 380;   // soul row
const MOUTH_CY      = TILE.y + 510;   // tiny mouth right under eyes
const SYMBOL_BASE_Y = TILE.y + 660;   // chest glyph (smaller)
const SYMBOL_SIZE   = 118;            // down from 178 in v0.4

const LOWER_EYE_R = 108;
const LOWER_EYE_DX = 142;
const THIRD_EYE_R = 60;

// -----------------------------------------------------------------------------
// Tile body + border (with border variants)
// -----------------------------------------------------------------------------
function tileBody(sch, border = 'clean') {
  const { tile, border: bc } = sch;
  const r = TILE.r, x = TILE.x, y = TILE.y, w = TILE.w, h = TILE.h, sw = TILE.sw;

  let bcol = bc, bsw = sw, dasharray = '';
  let extras = '';

  switch (border) {
    case 'heavy':       bsw = 26; break;
    case 'thin':        bsw = 10; break;
    case 'doubleLine':
      extras += `<rect x="${x+14}" y="${y+14}" width="${w-28}" height="${h-28}"
        rx="${r-12}" ry="${r-12}" fill="none" stroke="${bc}" stroke-width="3" opacity="0.6"/>`;
      break;
    case 'stitched':    dasharray = '14 9'; break;
    case 'burntEdge':   bcol = BASE.orange; break;
    case 'frostEdge':   bcol = BASE.cyan; break;
    case 'sealed':      bcol = '#1a1a1f'; break;
    case 'offset':
      extras += `<rect x="${x+4}" y="${y+5}" width="${w}" height="${h}"
        rx="${r}" ry="${r}" fill="none" stroke="${bc}" stroke-width="2" opacity="0.35"/>`;
      break;
    case 'notched':
      extras += `<rect x="${CX-14}" y="${y-4}" width="28" height="14"
        fill="${BASE.paper || '#f4eedf'}" rx="3"/>`;
      extras += `<rect x="${CX-10}" y="${y-2}" width="20" height="10"
        fill="${tile}" rx="2"/>`;
      break;
    case 'rivet':
      const rivets = [[x+30,y+30],[x+w-30,y+30],[x+30,y+h-30],[x+w-30,y+h-30]];
      for (const [rx,ry] of rivets)
        extras += `<circle cx="${rx}" cy="${ry}" r="6" fill="${bc}" opacity="0.85"/>`;
      break;
    case 'brokenCorner':
      // chip a small triangle out of bottom-right
      extras += `<polygon points="${x+w-50},${y+h} ${x+w},${y+h-50} ${x+w},${y+h}"
        fill="#f4eedf"/>`;
      extras += `<polyline points="${x+w-50},${y+h} ${x+w},${y+h-50}"
        fill="none" stroke="${bc}" stroke-width="${bsw}" stroke-linecap="round"/>`;
      break;
  }

  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}"
      fill="${tile}" stroke="${bcol}" stroke-width="${bsw}"
      ${dasharray ? `stroke-dasharray="${dasharray}"` : ''}/>
    ${extras}
  `;
}

// -----------------------------------------------------------------------------
// Lower eyes — chunky sclera + small pupil. Mood = pupil placement.
// -----------------------------------------------------------------------------
const MOODS = {
  calm:        { dx:[0,0],       dy:[0,0],     pr:0.28, lid:0,    lashes:false },
  curious:     { dx:[-14,14],    dy:[-6,-6],   pr:0.28, lid:0,    lashes:false },
  shy:         { dx:[0,0],       dy:[26,26],   pr:0.30, lid:0.18, lashes:false },
  sideEye:     { dx:[28,28],     dy:[0,0],     pr:0.26, lid:0,    lashes:false },
  lockedIn:    { dx:[0,0],       dy:[0,0],     pr:0.18, lid:0,    lashes:false },
  sleepy:      { dx:[0,0],       dy:[10,10],   pr:0.28, lid:0.40, lashes:true  },
  wonder:      { dx:[0,0],       dy:[0,0],     pr:0.46, lid:0,    lashes:false },
  glitch:      { dx:[-22,4],     dy:[6,-10],   pr:0.30, lid:0,    lashes:false },
  soft:        { dx:[0,0],       dy:[0,0],     pr:0.24, lid:0.10, lashes:false },
  suspicious:  { dx:[0,0],       dy:[0,0],     pr:0.22, lid:0.30, lashes:false,
                 botLid:0.20 },
  blissed:     { dx:[0,0],       dy:[0,0],     pr:0.26, lid:0.22, lashes:false },
  ancient:     { dx:[0,0],       dy:[0,0],     pr:0,    lid:0,    lashes:false, blackOut:true },
  rookie:      { dx:[0,0],       dy:[0,0],     pr:0.52, lid:0,    lashes:false, sparkle:true },
  hyperAware:  { dx:[0,0],       dy:[0,0],     pr:0.16, lid:0,    lashes:false },
  mismatched:  { dx:[-12,0],     dy:[0,0],     pr:0.30, lid:0,    lashes:false,
                 rightMood:'wonder' },
  closed:      { dx:[0,0],       dy:[0,0],     pr:0,    lid:1.0,  lashes:true  },
  wink:        { dx:[0,0],       dy:[0,0],     pr:0.28, lid:0,    lashes:false,
                 rightClosed:true },
  meditate:    { dx:[0,0],       dy:[0,0],     pr:0,    lid:1.0,  lashes:false, zen:true },
};

function lowerEyes(sch, mood = 'calm') {
  const cfg = MOODS[mood] || MOODS.calm;
  return [
    lowerEye(CX - LOWER_EYE_DX, LOWER_EYE_CY, LOWER_EYE_R, sch, cfg, 0),
    lowerEye(CX + LOWER_EYE_DX, LOWER_EYE_CY, LOWER_EYE_R, sch, cfg, 1),
  ].join('');
}

function lowerEye(cx, cy, r, sch, cfg, idx) {
  // mismatched: right eye uses a different mood
  if (idx === 1 && cfg.rightMood) {
    const rc = MOODS[cfg.rightMood];
    return lowerEye(cx, cy, r, sch, rc, 0);
  }
  // wink: right closed
  if (idx === 1 && cfg.rightClosed) {
    return closedEye(cx, cy, r, sch);
  }
  if (cfg.lid >= 0.95) {
    return closedEye(cx, cy, r, sch, cfg.zen);
  }

  const sclera = `<circle cx="${cx}" cy="${cy}" r="${r}"
    fill="${BASE.white}" stroke="${BASE.pupil}" stroke-width="14"/>`;

  if (cfg.blackOut) {
    // ancient = thousand-yard stare, not dead-doll eyes.
    // dark inner disc + thin contrast ring + tiny offset moon-sliver highlight
    const black = `<circle cx="${cx}" cy="${cy}" r="${r - 9}" fill="${BASE.pupil}"/>`;
    const ring  = `<circle cx="${cx}" cy="${cy}" r="${r - 24}" fill="none"
      stroke="${sch.a}" stroke-width="3" opacity="0.55"/>`;
    const core  = `<circle cx="${cx}" cy="${cy}" r="${r * 0.18}"
      fill="${sch.tile}" stroke="${sch.a}" stroke-width="2" opacity="0.85"/>`;
    const moon  = `<path d="M ${cx - r*0.42} ${cy - r*0.35}
      a ${r*0.18} ${r*0.18} 0 0 1 ${r*0.34} ${-r*0.05}
      a ${r*0.16} ${r*0.16} 0 0 0 -${r*0.34} ${r*0.05} Z"
      fill="${BASE.white}" opacity="0.85"/>`;
    return sclera + black + ring + core + moon;
  }

  const px = cx + cfg.dx[idx];
  const py = cy + cfg.dy[idx];
  const pr = r * cfg.pr;
  const pupil = pr > 0
    ? `<circle cx="${px}" cy="${py}" r="${pr}" fill="${BASE.pupil}"/>`
    : '';

  let highlight = '';
  if (cfg.sparkle) {
    highlight = `<circle cx="${px - pr*0.4}" cy="${py - pr*0.4}" r="${pr*0.32}"
      fill="${BASE.white}"/>`;
  } else if (pr > 0) {
    highlight = `<circle cx="${px - pr*0.35}" cy="${py - pr*0.35}" r="${pr*0.22}"
      fill="${BASE.white}" opacity="0.9"/>`;
  }

  let topLid = '';
  if (cfg.lid > 0) {
    const lidH = r * 2 * cfg.lid;
    topLid = `<path d="M ${cx-r-2} ${cy} A ${r+2} ${r+2} 0 0 1 ${cx+r+2} ${cy}
      L ${cx+r+2} ${cy-r+lidH} L ${cx-r-2} ${cy-r+lidH} Z"
      fill="${sch.tile}" stroke="${BASE.pupil}" stroke-width="14"
      stroke-linejoin="round"/>`;
  }

  let botLid = '';
  if (cfg.botLid > 0) {
    const lidH = r * 2 * cfg.botLid;
    botLid = `<path d="M ${cx-r-2} ${cy} A ${r+2} ${r+2} 0 0 0 ${cx+r+2} ${cy}
      L ${cx+r+2} ${cy+r-lidH} L ${cx-r-2} ${cy+r-lidH} Z"
      fill="${sch.tile}" stroke="${BASE.pupil}" stroke-width="14"
      stroke-linejoin="round"/>`;
  }

  let lashes = '';
  if (cfg.lashes) {
    for (const t of [-0.6, -0.3, 0, 0.3, 0.6]) {
      const lx = cx + Math.sin(t) * r * 0.9;
      const ly = cy - Math.cos(t) * r * 0.95;
      const lx2 = cx + Math.sin(t) * (r + 14);
      const ly2 = cy - Math.cos(t) * (r + 16);
      lashes += `<line x1="${lx}" y1="${ly}" x2="${lx2}" y2="${ly2}"
        stroke="${BASE.pupil}" stroke-width="5" stroke-linecap="round"/>`;
    }
  }

  return sclera + pupil + highlight + topLid + botLid + lashes;
}

function closedEye(cx, cy, r, sch, zen = false) {
  // contrast stroke = visible on ANY shell (dark and light). Use border colour.
  const ink = sch.border;
  // ghost sclera anchors the eye SHAPE so the face never disappears
  const ghost = `<path d="M ${cx-r} ${cy} A ${r} ${r} 0 0 0 ${cx+r} ${cy}"
    fill="${BASE.white}" opacity="0.12"/>`;
  const lid = `<path d="M ${cx-r} ${cy} Q ${cx} ${cy + (zen ? 4 : -10)} ${cx+r} ${cy}"
    fill="none" stroke="${ink}" stroke-width="14" stroke-linecap="round"/>`;
  const lashes = `
    <line x1="${cx-r*0.7}" y1="${cy-3}" x2="${cx-r*0.85}" y2="${cy-14}"
      stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy-6}" x2="${cx}" y2="${cy-18}"
      stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
    <line x1="${cx+r*0.7}" y1="${cy-3}" x2="${cx+r*0.85}" y2="${cy-14}"
      stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
  `;
  // zen smile crescent under the closed lid keeps meditation eyes alive
  const zenSmile = zen ? `<path d="M ${cx-r*0.55} ${cy+10} Q ${cx} ${cy+18} ${cx+r*0.55} ${cy+10}"
      fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round" opacity="0.6"/>` : '';
  return ghost + lid + (zen ? zenSmile : lashes);
}

// -----------------------------------------------------------------------------
// Brows — three strokes above each eye. Single highest-impact personality dial.
// Rendered between lower eyes and third eye, drawn UNDER glasses for stacking.
// -----------------------------------------------------------------------------
const BROWS = ['none','flat','raised','furrowed','slant','arch','single','unibrow','speck'];

function brows(sch, kind = 'none') {
  if (!kind || kind === 'none') return '';
  const cl = CX - LOWER_EYE_DX;
  const cr = CX + LOWER_EYE_DX;
  const y  = LOWER_EYE_CY - LOWER_EYE_R - 18; // sits just above the sclera
  const w  = LOWER_EYE_R * 1.05;
  // contrast stroke so it shows on every shell
  const ink = sch.border;
  const sw  = 9;
  // single brow path with a Q-curve. dy = vertical offset from y at center.
  const brow = (cx, dy, tilt = 0) =>
    `<path d="M ${cx - w/2} ${y + tilt}
      Q ${cx} ${y + dy + tilt}
      ${cx + w/2} ${y - tilt}"
      fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round"/>`;

  switch (kind) {
    case 'flat':     return brow(cl, 0) + brow(cr, 0);
    case 'raised':   return brow(cl, -14) + brow(cr, -14);
    case 'furrowed': return brow(cl, 18, 12) + brow(cr, 18, -12);
    case 'slant':    return brow(cl, 8, 14) + brow(cr, 8, 14);
    case 'arch':     return brow(cl, -22) + brow(cr, -22);
    case 'single':   return brow(cl, 0) + brow(cr, -18);
    case 'unibrow': {
      // one connected line across both
      return `<path d="M ${cl - w/2} ${y + 4}
        Q ${cl} ${y - 8} ${CX} ${y - 2}
        Q ${cr} ${y - 8} ${cr + w/2} ${y + 4}"
        fill="none" stroke="${ink}" stroke-width="${sw + 1}" stroke-linecap="round"/>`;
    }
    case 'speck': {
      // three small dots above each eye — soft / dreamy / inked
      const dots = (cx) => [-w*0.32, 0, w*0.32].map(dx =>
        `<circle cx="${cx + dx}" cy="${y + 4}" r="4" fill="${ink}"/>`).join('');
      return dots(cl) + dots(cr);
    }
  }
  return '';
}

// -----------------------------------------------------------------------------
// Third eye — 16 distinct shapes. The crown.
// -----------------------------------------------------------------------------
const THIRD_EYES = [
  'open','aperture','diamond','crosshair','oracle','halo','void',
  'spiral','genesis','closedEye','sealed','pixel','frost','burn','hash','eclipse',
];

function thirdEye(cx, cy, r, sch, type = 'open') {
  switch (type) {
    case 'open': {
      const sclera = `<circle cx="${cx}" cy="${cy}" r="${r}"
        fill="${BASE.white}" stroke="${BASE.pupil}" stroke-width="12"/>`;
      const pup = `<circle cx="${cx}" cy="${cy}" r="${r*0.42}" fill="${BASE.pupil}"/>`;
      const hi = `<circle cx="${cx-r*0.18}" cy="${cy-r*0.18}" r="${r*0.12}"
        fill="${BASE.white}"/>`;
      return sclera + pup + hi;
    }
    case 'aperture': {
      const o = `<circle cx="${cx}" cy="${cy}" r="${r}"
        fill="${BASE.white}" stroke="${BASE.pupil}" stroke-width="10"/>`;
      const r1 = `<circle cx="${cx}" cy="${cy}" r="${r*0.72}"
        fill="none" stroke="${BASE.pupil}" stroke-width="6"/>`;
      const r2 = `<circle cx="${cx}" cy="${cy}" r="${r*0.42}"
        fill="${sch.a}" stroke="${BASE.pupil}" stroke-width="4"/>`;
      const dot = `<circle cx="${cx}" cy="${cy}" r="${r*0.14}" fill="${BASE.pupil}"/>`;
      return o + r1 + r2 + dot;
    }
    case 'diamond': {
      const d = `<polygon points="${cx},${cy-r} ${cx+r},${cy} ${cx},${cy+r} ${cx-r},${cy}"
        fill="${BASE.white}" stroke="${BASE.pupil}" stroke-width="12"
        stroke-linejoin="round"/>`;
      const inner = `<polygon points="${cx},${cy-r*0.5} ${cx+r*0.5},${cy} ${cx},${cy+r*0.5} ${cx-r*0.5},${cy}"
        fill="${sch.b}" stroke="${BASE.pupil}" stroke-width="5"/>`;
      const facet = `<line x1="${cx-r*0.5}" y1="${cy}" x2="${cx+r*0.5}" y2="${cy}"
        stroke="${BASE.pupil}" stroke-width="3" opacity="0.5"/>`;
      return d + inner + facet;
    }
    case 'crosshair': {
      const o = `<circle cx="${cx}" cy="${cy}" r="${r}"
        fill="${BASE.white}" stroke="${BASE.pupil}" stroke-width="10"/>`;
      const v = `<line x1="${cx}" y1="${cy-r*0.9}" x2="${cx}" y2="${cy+r*0.9}"
        stroke="${BASE.pupil}" stroke-width="5"/>`;
      const h = `<line x1="${cx-r*0.9}" y1="${cy}" x2="${cx+r*0.9}" y2="${cy}"
        stroke="${BASE.pupil}" stroke-width="5"/>`;
      const dot = `<circle cx="${cx}" cy="${cy}" r="${r*0.16}" fill="${sch.a}"
        stroke="${BASE.pupil}" stroke-width="3"/>`;
      return o + v + h + dot;
    }
    case 'oracle': {
      // vertical almond cat eye + halo
      const halo = `<path d="M ${cx-r*1.1} ${cy-r*1.05} A ${r*1.1} ${r*0.4} 0 0 1 ${cx+r*1.1} ${cy-r*1.05}"
        fill="none" stroke="${sch.a}" stroke-width="6" stroke-linecap="round"/>`;
      const eye = `<path d="M ${cx} ${cy-r} Q ${cx+r*0.9} ${cy} ${cx} ${cy+r} Q ${cx-r*0.9} ${cy} ${cx} ${cy-r} Z"
        fill="${BASE.white}" stroke="${BASE.pupil}" stroke-width="12"
        stroke-linejoin="round"/>`;
      const slit = `<path d="M ${cx} ${cy-r*0.7} Q ${cx+r*0.18} ${cy} ${cx} ${cy+r*0.7} Q ${cx-r*0.18} ${cy} ${cx} ${cy-r*0.7} Z"
        fill="${BASE.pupil}"/>`;
      return halo + eye + slit;
    }
    case 'halo': {
      const arc = `<path d="M ${cx-r*1.2} ${cy-r*1.05} A ${r*1.2} ${r*0.5} 0 0 1 ${cx+r*1.2} ${cy-r*1.05}"
        fill="none" stroke="${sch.a}" stroke-width="7" stroke-linecap="round"/>`;
      const sclera = `<circle cx="${cx}" cy="${cy}" r="${r*0.9}"
        fill="${BASE.white}" stroke="${BASE.pupil}" stroke-width="12"/>`;
      const pup = `<circle cx="${cx}" cy="${cy}" r="${r*0.36}" fill="${BASE.pupil}"/>`;
      return arc + sclera + pup;
    }
    case 'void': {
      // solid sealed disc
      const o = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${BASE.pupil}"
        stroke="${sch.b}" stroke-width="8"/>`;
      const tiny = `<circle cx="${cx}" cy="${cy}" r="${r*0.18}" fill="${sch.b}"/>`;
      return o + tiny;
    }
    case 'spiral': {
      const o = `<circle cx="${cx}" cy="${cy}" r="${r}"
        fill="${BASE.white}" stroke="${BASE.pupil}" stroke-width="10"/>`;
      // hand-built tight spiral via arcs
      const s = `<path d="M ${cx} ${cy}
        m 0 ${-r*0.18}
        a ${r*0.18} ${r*0.18} 0 1 1 0 ${r*0.36}
        a ${r*0.36} ${r*0.36} 0 1 0 0 ${-r*0.72}
        a ${r*0.54} ${r*0.54} 0 1 1 0 ${r*1.08}"
        fill="none" stroke="${BASE.pupil}" stroke-width="6" stroke-linecap="round"/>`;
      return o + s;
    }
    case 'genesis': {
      // six-pointed star
      const tri1 = `<polygon points="${cx},${cy-r} ${cx+r*0.866},${cy+r*0.5} ${cx-r*0.866},${cy+r*0.5}"
        fill="${sch.a}" stroke="${BASE.pupil}" stroke-width="9" stroke-linejoin="round"/>`;
      const tri2 = `<polygon points="${cx},${cy+r} ${cx+r*0.866},${cy-r*0.5} ${cx-r*0.866},${cy-r*0.5}"
        fill="${sch.a}" stroke="${BASE.pupil}" stroke-width="9" stroke-linejoin="round"/>`;
      const dot = `<circle cx="${cx}" cy="${cy}" r="${r*0.18}" fill="${BASE.pupil}"/>`;
      return tri1 + tri2 + dot;
    }
    case 'closedEye': {
      const lid = `<path d="M ${cx-r} ${cy} Q ${cx} ${cy-14} ${cx+r} ${cy}"
        fill="none" stroke="${BASE.pupil}" stroke-width="12" stroke-linecap="round"/>`;
      const l1 = `<line x1="${cx-r*0.6}" y1="${cy-4}" x2="${cx-r*0.7}" y2="${cy-18}"
        stroke="${BASE.pupil}" stroke-width="5" stroke-linecap="round"/>`;
      const l2 = `<line x1="${cx}" y1="${cy-8}" x2="${cx}" y2="${cy-22}"
        stroke="${BASE.pupil}" stroke-width="5" stroke-linecap="round"/>`;
      const l3 = `<line x1="${cx+r*0.6}" y1="${cy-4}" x2="${cx+r*0.7}" y2="${cy-18}"
        stroke="${BASE.pupil}" stroke-width="5" stroke-linecap="round"/>`;
      return lid + l1 + l2 + l3;
    }
    case 'sealed': {
      const o = `<circle cx="${cx}" cy="${cy}" r="${r}"
        fill="${BASE.white}" stroke="${BASE.pupil}" stroke-width="12"/>`;
      const x1 = `<line x1="${cx-r*0.6}" y1="${cy-r*0.6}" x2="${cx+r*0.6}" y2="${cy+r*0.6}"
        stroke="${BASE.pupil}" stroke-width="9" stroke-linecap="round"/>`;
      const x2 = `<line x1="${cx-r*0.6}" y1="${cy+r*0.6}" x2="${cx+r*0.6}" y2="${cy-r*0.6}"
        stroke="${BASE.pupil}" stroke-width="9" stroke-linecap="round"/>`;
      return o + x1 + x2;
    }
    case 'pixel': {
      // 3x3 grid
      const s = r * 0.5;
      const c = s * 0.62;
      const pixels = [[1,0,1],[0,1,0],[1,0,1]];
      let out = '';
      for (let i=0;i<3;i++) for (let j=0;j<3;j++) {
        const fx = cx + (j-1)*c, fy = cy + (i-1)*c;
        const fill = pixels[i][j] ? BASE.pupil : sch.tile;
        out += `<rect x="${fx-c*0.45}" y="${fy-c*0.45}" width="${c*0.9}" height="${c*0.9}"
          fill="${fill}" stroke="${BASE.pupil}" stroke-width="2"/>`;
      }
      return out;
    }
    case 'frost': {
      const d = `<polygon points="${cx},${cy-r} ${cx+r*0.85},${cy} ${cx},${cy+r} ${cx-r*0.85},${cy}"
        fill="${BASE.cyan}" stroke="${BASE.pupil}" stroke-width="12" stroke-linejoin="round"
        opacity="0.95"/>`;
      const inner = `<polygon points="${cx},${cy-r*0.45} ${cx+r*0.38},${cy} ${cx},${cy+r*0.45} ${cx-r*0.38},${cy}"
        fill="${BASE.white}" stroke="${BASE.pupil}" stroke-width="4"/>`;
      return d + inner;
    }
    case 'burn': {
      const o = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${BASE.pupil}"
        stroke="${BASE.orange}" stroke-width="10"/>`;
      const flame = `<path d="M ${cx} ${cy-r*0.65}
        Q ${cx+r*0.35} ${cy-r*0.05} ${cx+r*0.18} ${cy+r*0.45}
        Q ${cx} ${cy+r*0.2} ${cx-r*0.18} ${cy+r*0.45}
        Q ${cx-r*0.35} ${cy-r*0.05} ${cx} ${cy-r*0.65} Z"
        fill="${BASE.orange}"/>`;
      const core = `<circle cx="${cx}" cy="${cy+r*0.05}" r="${r*0.12}" fill="${BASE.white}"/>`;
      return o + flame + core;
    }
    case 'hash': {
      const o = `<circle cx="${cx}" cy="${cy}" r="${r}"
        fill="${BASE.white}" stroke="${BASE.pupil}" stroke-width="10"/>`;
      const v1 = `<line x1="${cx-r*0.35}" y1="${cy-r*0.6}" x2="${cx-r*0.55}" y2="${cy+r*0.6}"
        stroke="${BASE.pupil}" stroke-width="6"/>`;
      const v2 = `<line x1="${cx+r*0.55}" y1="${cy-r*0.6}" x2="${cx+r*0.35}" y2="${cy+r*0.6}"
        stroke="${BASE.pupil}" stroke-width="6"/>`;
      const h1 = `<line x1="${cx-r*0.65}" y1="${cy-r*0.18}" x2="${cx+r*0.65}" y2="${cy-r*0.18}"
        stroke="${BASE.pupil}" stroke-width="6"/>`;
      const h2 = `<line x1="${cx-r*0.65}" y1="${cy+r*0.18}" x2="${cx+r*0.65}" y2="${cy+r*0.18}"
        stroke="${BASE.pupil}" stroke-width="6"/>`;
      return o + v1 + v2 + h1 + h2;
    }
    case 'eclipse': {
      const o = `<circle cx="${cx}" cy="${cy}" r="${r}"
        fill="${sch.a}" stroke="${BASE.pupil}" stroke-width="12"/>`;
      const dark = `<circle cx="${cx+r*0.32}" cy="${cy-r*0.05}" r="${r*0.95}" fill="${BASE.pupil}"/>`;
      return `<defs><clipPath id="ecl${cx}${cy}"><circle cx="${cx}" cy="${cy}" r="${r-6}"/></clipPath></defs>`
        + o + `<g clip-path="url(#ecl${cx}${cy})">${dark}</g>`;
    }
  }
  return '';
}

// -----------------------------------------------------------------------------
// Mouth glyphs — TINY (width ~110, centered at MOUTH_CY)
// -----------------------------------------------------------------------------
const MOUTHS = [
  'nullLine','signalSmile','glitchWave','sealedSlit','minerFang','bitTongue',
  'hashTeeth','gaspPort','voidHole','zip','patchSmile','smirk','sleepSmile',
  'noMouth','compressionTeeth',
];

function mouth(cx, cy, w, kind = 'signalSmile', sch) {
  const h = w * 0.45;
  const sw = 9;
  switch (kind) {
    case 'noMouth':
      return '';
    case 'nullLine':
      return `<line x1="${cx - w*0.28}" y1="${cy}" x2="${cx + w*0.28}" y2="${cy}"
        stroke="${BASE.pupil}" stroke-width="${sw}" stroke-linecap="round"/>`;
    case 'signalSmile':
      return `<path d="M ${cx - w*0.4} ${cy - 4} Q ${cx} ${cy + h*0.5} ${cx + w*0.4} ${cy - 4}"
        fill="none" stroke="${BASE.pupil}" stroke-width="${sw}" stroke-linecap="round"/>`;
    case 'glitchWave':
      return `<path d="M ${cx - w*0.45} ${cy}
        q ${w*0.11} ${-h*0.4} ${w*0.22} 0
        q ${w*0.11} ${h*0.4} ${w*0.22} 0
        q ${w*0.11} ${-h*0.4} ${w*0.22} 0"
        fill="none" stroke="${BASE.pupil}" stroke-width="${sw}" stroke-linecap="round"/>`;
    case 'sealedSlit':
      return `<rect x="${cx - w*0.28}" y="${cy - 6}" width="${w*0.56}" height="12"
        rx="6" ry="6" fill="${BASE.pupil}"/>`;
    case 'minerFang': {
      const line = `<line x1="${cx - w*0.32}" y1="${cy}" x2="${cx + w*0.32}" y2="${cy}"
        stroke="${BASE.pupil}" stroke-width="${sw}" stroke-linecap="round"/>`;
      const fang = `<polygon points="${cx - 8},${cy + 4} ${cx + 8},${cy + 4} ${cx},${cy + 24}"
        fill="${BASE.white}" stroke="${BASE.pupil}" stroke-width="4"/>`;
      return line + fang;
    }
    case 'bitTongue': {
      const line = `<path d="M ${cx - w*0.32} ${cy} Q ${cx} ${cy + h*0.45} ${cx + w*0.32} ${cy}"
        fill="none" stroke="${BASE.pupil}" stroke-width="${sw}" stroke-linecap="round"/>`;
      const tongue = `<rect x="${cx - 7}" y="${cy + 10}" width="14" height="20"
        rx="6" ry="6" fill="${BASE.orange}" stroke="${BASE.pupil}" stroke-width="3"/>`;
      return line + tongue;
    }
    case 'hashTeeth': {
      const line = `<line x1="${cx - w*0.32}" y1="${cy}" x2="${cx + w*0.32}" y2="${cy}"
        stroke="${BASE.pupil}" stroke-width="${sw}" stroke-linecap="round"/>`;
      let teeth = '';
      for (let i=-2;i<=2;i++) {
        teeth += `<line x1="${cx + i*9}" y1="${cy + 2}" x2="${cx + i*9}" y2="${cy + 16}"
          stroke="${BASE.pupil}" stroke-width="4" stroke-linecap="round"/>`;
      }
      return line + teeth;
    }
    case 'gaspPort':
      return `<ellipse cx="${cx}" cy="${cy + 2}" rx="${w*0.18}" ry="${h*0.55}"
        fill="${BASE.pupil}"/>`;
    case 'voidHole':
      return `<circle cx="${cx}" cy="${cy + 2}" r="${h*0.62}" fill="${BASE.pupil}"/>`;
    case 'zip': {
      const line = `<line x1="${cx - w*0.32}" y1="${cy}" x2="${cx + w*0.32}" y2="${cy}"
        stroke="${BASE.pupil}" stroke-width="${sw}" stroke-dasharray="6 5" stroke-linecap="round"/>`;
      return line;
    }
    case 'patchSmile':
      return `<path d="M ${cx - w*0.38} ${cy - 2}
        Q ${cx - w*0.12} ${cy + h*0.5} ${cx + w*0.05} ${cy + 2}
        Q ${cx + w*0.28} ${cy - h*0.1} ${cx + w*0.38} ${cy + 4}"
        fill="none" stroke="${BASE.pupil}" stroke-width="${sw}" stroke-linecap="round"/>`;
    case 'smirk':
      return `<path d="M ${cx - w*0.32} ${cy + 4} Q ${cx + w*0.05} ${cy + h*0.45} ${cx + w*0.36} ${cy - 6}"
        fill="none" stroke="${BASE.pupil}" stroke-width="${sw}" stroke-linecap="round"/>`;
    case 'sleepSmile':
      return `<path d="M ${cx - w*0.22} ${cy} Q ${cx} ${cy + 10} ${cx + w*0.22} ${cy}"
        fill="none" stroke="${BASE.pupil}" stroke-width="${sw-1}" stroke-linecap="round"
        opacity="0.85"/>`;
    case 'compressionTeeth': {
      let out = '';
      for (let i=-2;i<=2;i++) {
        out += `<rect x="${cx + i*10 - 4}" y="${cy - 6}" width="8" height="14"
          fill="${BASE.white}" stroke="${BASE.pupil}" stroke-width="3"/>`;
      }
      return out;
    }
  }
  return '';
}

// -----------------------------------------------------------------------------
// Element symbol — smaller chest glyph (down from 178 to 118)
// -----------------------------------------------------------------------------
function chestSymbol(sym, sch) {
  return `<text x="${CX}" y="${SYMBOL_BASE_Y}" text-anchor="middle"
    font-family="ui-serif, 'Iowan Old Style', Georgia, serif"
    font-weight="700" font-size="${SYMBOL_SIZE}" fill="${sch.sym}"
    letter-spacing="-0.02em">${sym}</text>`;
}

// -----------------------------------------------------------------------------
// Top-left eco mark + top-right block number
// -----------------------------------------------------------------------------
function ecoMark(sch, kind = 'orbit') {
  const cx = TILE.x + 56, cy = TILE.y + 60;
  switch (kind) {
    case 'orbit': {
      const o = `<circle cx="${cx}" cy="${cy}" r="22" fill="none"
        stroke="${sch.border}" stroke-width="3"/>`;
      const c = `<circle cx="${cx}" cy="${cy}" r="6" fill="${sch.a}"/>`;
      const dot = `<circle cx="${cx + 22}" cy="${cy}" r="3.5" fill="${sch.border}"/>`;
      return o + c + dot;
    }
    case 'diamond':
      return `<polygon points="${cx},${cy-14} ${cx+14},${cy} ${cx},${cy+14} ${cx-14},${cy}"
        fill="${sch.a}" stroke="${sch.border}" stroke-width="3" stroke-linejoin="round"/>`;
    case 'threeDot':
      return [-10,0,10].map(d =>
        `<circle cx="${cx+d}" cy="${cy}" r="4.5" fill="${sch.border}"/>`).join('');
    case 'btc':
      return `<text x="${cx}" y="${cy + 8}" text-anchor="middle"
        font-family="Arial Black, 'SF Pro Display', Helvetica, sans-serif"
        font-weight="900" font-size="28" fill="${sch.a}">\u20BF</text>`;
  }
  return '';
}

function blockNumber(n, sch) {
  return `<text x="${TILE.x + TILE.w - 36}" y="${TILE.y + 68}" text-anchor="end"
    font-family="ui-monospace, 'SF Mono', Menlo, monospace"
    font-size="28" font-weight="700" fill="${sch.b}"
    letter-spacing="0.04em">${String(n).padStart(6,'0')}</text>`;
}

// -----------------------------------------------------------------------------
// Matter wick (drip) — 16 variants. Drawn from tile bottom outward.
// -----------------------------------------------------------------------------
const DRIPS = [
  'seedDrip','longWick','heavyDrip','forkDrip','doubleDot','brokenWick',
  'crystalDrip','burnDrip','cyanDrip','purpleDrip','noDrip','tinyDrip',
  'tripleBead','meltThread','offCenterDrip','invertedDrop',
];

function matterWick(sch, kind = 'seedDrip') {
  const cx = CX;
  const y0 = TILE_BOTTOM;          // tile bottom edge
  const a = sch.a;
  const b = sch.b;

  const drop = (x, y, r, fill, stroke = BASE.pupil, sw = 4) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

  // Connector — a small fillet from the tile edge into the drop
  const wick = (x, w, h, fill) =>
    `<path d="M ${x - w/2} ${y0 - 6} Q ${x - w/2} ${y0 + h*0.35} ${x} ${y0 + h*0.65}
      Q ${x + w/2} ${y0 + h*0.35} ${x + w/2} ${y0 - 6} Z" fill="${fill}"/>`;

  switch (kind) {
    case 'noDrip':
      return '';
    case 'seedDrip':
      return wick(cx, 28, 32, b) + drop(cx, y0 + 50, 22, b)
        + drop(cx + 40, y0 + 32, 6, b);
    case 'longWick':
      return wick(cx, 22, 60, b) + drop(cx, y0 + 78, 18, b);
    case 'heavyDrip':
      return wick(cx, 44, 36, b) + drop(cx, y0 + 60, 30, b);
    case 'forkDrip':
      return `<path d="M ${cx - 30} ${y0 - 6} Q ${cx - 30} ${y0 + 12} ${cx - 42} ${y0 + 30}
        Q ${cx - 50} ${y0 + 50} ${cx - 50} ${y0 + 64}" fill="none" stroke="${b}"
        stroke-width="22" stroke-linecap="round"/>`
        + `<path d="M ${cx + 30} ${y0 - 6} Q ${cx + 30} ${y0 + 12} ${cx + 42} ${y0 + 30}
        Q ${cx + 50} ${y0 + 50} ${cx + 50} ${y0 + 64}" fill="none" stroke="${b}"
        stroke-width="22" stroke-linecap="round"/>`
        + drop(cx - 50, y0 + 72, 14, b)
        + drop(cx + 50, y0 + 72, 14, b);
    case 'doubleDot':
      return drop(cx - 24, y0 + 26, 14, b) + drop(cx + 24, y0 + 26, 14, b);
    case 'brokenWick':
      return wick(cx, 26, 18, b)
        + drop(cx, y0 + 50, 12, b)
        + drop(cx - 18, y0 + 78, 7, b)
        + drop(cx + 22, y0 + 90, 9, b);
    case 'crystalDrip':
      return wick(cx, 28, 18, b)
        + `<polygon points="${cx},${y0+14} ${cx+26},${y0+50} ${cx},${y0+90} ${cx-26},${y0+50}"
            fill="${b}" stroke="${BASE.pupil}" stroke-width="4" stroke-linejoin="round"/>`;
    case 'burnDrip':
      return wick(cx, 30, 30, BASE.orange) + drop(cx, y0 + 50, 22, BASE.orange)
        + `<path d="M ${cx} ${y0 + 36} q -4 -10 0 -18 q 4 8 0 18 Z"
            fill="${BASE.white}" opacity="0.6"/>`;
    case 'cyanDrip':
      return wick(cx, 28, 32, BASE.cyan) + drop(cx, y0 + 52, 22, BASE.cyan);
    case 'purpleDrip':
      return wick(cx, 28, 32, BASE.purple) + drop(cx, y0 + 52, 22, BASE.purple);
    case 'tinyDrip':
      return drop(cx, y0 + 16, 8, b);
    case 'tripleBead':
      return drop(cx - 30, y0 + 24, 11, b)
        + drop(cx, y0 + 36, 14, b)
        + drop(cx + 30, y0 + 24, 11, b);
    case 'meltThread':
      return `<path d="M ${cx} ${y0 - 4} Q ${cx + 8} ${y0 + 30} ${cx - 6} ${y0 + 60}
        Q ${cx + 8} ${y0 + 90} ${cx - 4} ${y0 + 116}" fill="none" stroke="${b}"
        stroke-width="6" stroke-linecap="round"/>`
        + drop(cx - 4, y0 + 120, 6, b);
    case 'offCenterDrip':
      return wick(cx + 60, 22, 28, b) + drop(cx + 60, y0 + 46, 18, b);
    case 'invertedDrop':
      // a droplet pointing UP, sitting just above the tile bottom inside
      return `<path d="M ${cx} ${y0 - 60} Q ${cx + 18} ${y0 - 26} ${cx} ${y0 - 14}
        Q ${cx - 18} ${y0 - 26} ${cx} ${y0 - 60} Z" fill="${b}"
        stroke="${BASE.pupil}" stroke-width="4"/>`;
  }
  return '';
}

// -----------------------------------------------------------------------------
// Micro-swag artifacts — tasteful overlays
// -----------------------------------------------------------------------------
const SWAGS = [
  'none','diamondStud','patchBorder','stitchMark','cornerChip','burnMark',
  'haloNode','microChain','sealStamp','ordinalTag','difficultyBadge',
  'hashScratch','tinyBandage','pixelScar','crownDot','sideRivet','dmtGem',
  'orbitDot','voidPatch','minerMark','littleX',
];

function swag(sch, kind = 'none') {
  if (!kind || kind === 'none') return '';
  const tx = TILE.x, ty = TILE.y, tw = TILE.w, th = TILE.h;
  switch (kind) {
    case 'diamondStud': {
      const cx = tx + tw - 60, cy = ty + 110;
      return `<polygon points="${cx},${cy-12} ${cx+11},${cy} ${cx},${cy+12} ${cx-11},${cy}"
        fill="${BASE.white}" stroke="${BASE.pupil}" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="${cx - 3}" cy="${cy - 3}" r="2.5" fill="${BASE.pupil}" opacity="0.4"/>`;
    }
    case 'patchBorder': {
      const x = tx + 36, y = ty + th - 130;
      return `<rect x="${x}" y="${y}" width="80" height="60" rx="4" fill="${sch.a}" opacity="0.18"
        stroke="${sch.border}" stroke-width="3" stroke-dasharray="6 5"/>`;
    }
    case 'stitchMark': {
      const x = tx + tw - 110, y = ty + th - 110;
      return `<line x1="${x-12}" y1="${y-12}" x2="${x+12}" y2="${y+12}"
        stroke="${sch.border}" stroke-width="4" stroke-dasharray="4 3"/>
        <line x1="${x+12}" y1="${y-12}" x2="${x-12}" y2="${y+12}"
        stroke="${sch.border}" stroke-width="4" stroke-dasharray="4 3"/>`;
    }
    case 'cornerChip': {
      return `<polygon points="${tx + tw - 60},${ty} ${tx + tw},${ty} ${tx + tw},${ty + 60}"
        fill="${BASE.white}" stroke="${sch.border}" stroke-width="6" stroke-linejoin="round"/>`;
    }
    case 'burnMark': {
      const cx = tx + 80, cy = ty + th - 80;
      return `<circle cx="${cx}" cy="${cy}" r="22" fill="${BASE.orange}" opacity="0.6"/>
        <circle cx="${cx}" cy="${cy}" r="14" fill="${BASE.pupil}" opacity="0.8"/>`;
    }
    case 'haloNode': {
      return `<ellipse cx="${CX}" cy="${ty - 18}" rx="180" ry="14" fill="none"
        stroke="${sch.a}" stroke-width="5"/>`;
    }
    case 'microChain': {
      let out = '';
      for (let i=0;i<6;i++) {
        out += `<circle cx="${tx + 60 + i*22}" cy="${ty + th - 30}" r="5" fill="none"
          stroke="${sch.border}" stroke-width="3"/>`;
      }
      return out;
    }
    case 'sealStamp': {
      const cx = tx + tw - 80, cy = ty + th - 80;
      return `<circle cx="${cx}" cy="${cy}" r="26" fill="${BASE.blood}" opacity="0.9"/>
        <text x="${cx}" y="${cy + 6}" text-anchor="middle"
          font-family="ui-serif, Georgia, serif" font-size="18" font-weight="700"
          fill="${BASE.white}">U</text>`;
    }
    case 'ordinalTag': {
      const x = tx + 30, y = ty + th - 60;
      return `<rect x="${x}" y="${y}" width="80" height="22" rx="11" fill="${sch.border}"/>
        <text x="${x + 40}" y="${y + 16}" text-anchor="middle"
          font-family="ui-monospace, Menlo, monospace" font-size="12"
          font-weight="700" fill="${sch.tile}">ORD·∞</text>`;
    }
    case 'difficultyBadge': {
      const x = tx + tw - 96, y = ty + 30;
      return `<rect x="${x}" y="${y}" width="64" height="22" rx="4"
        fill="${sch.b}" stroke="${BASE.pupil}" stroke-width="2"/>
        <text x="${x + 32}" y="${y + 16}" text-anchor="middle"
          font-family="ui-monospace, Menlo, monospace" font-size="11"
          font-weight="700" fill="${BASE.pupil}">D·90T</text>`;
    }
    case 'hashScratch': {
      let out = '';
      const x = tx + tw - 110, y = ty + 200;
      for (let i=0;i<4;i++) {
        out += `<line x1="${x + i*8}" y1="${y}" x2="${x + i*8 + 14}" y2="${y + 26}"
          stroke="${sch.border}" stroke-width="3" opacity="0.6"/>`;
      }
      return out;
    }
    case 'tinyBandage': {
      const cx = tx + 100, cy = ty + 240;
      return `<g transform="rotate(20 ${cx} ${cy})">
        <rect x="${cx-22}" y="${cy-9}" width="44" height="18" rx="3"
          fill="#f0d8a8" stroke="${BASE.pupil}" stroke-width="2"/>
        <circle cx="${cx-12}" cy="${cy-3}" r="1.6" fill="${BASE.pupil}"/>
        <circle cx="${cx+12}" cy="${cy-3}" r="1.6" fill="${BASE.pupil}"/>
        <circle cx="${cx-12}" cy="${cy+3}" r="1.6" fill="${BASE.pupil}"/>
        <circle cx="${cx+12}" cy="${cy+3}" r="1.6" fill="${BASE.pupil}"/>
      </g>`;
    }
    case 'pixelScar': {
      const x = tx + tw - 130, y = ty + 380;
      let out = '';
      const dots = [[0,0],[1,0],[0,1],[2,1],[1,2]];
      for (const [dx,dy] of dots) {
        out += `<rect x="${x + dx*8}" y="${y + dy*8}" width="6" height="6"
          fill="${BASE.blood}" opacity="0.85"/>`;
      }
      return out;
    }
    case 'crownDot':
      return `<circle cx="${CX}" cy="${ty - 18}" r="8" fill="${sch.a}"
        stroke="${BASE.pupil}" stroke-width="3"/>`;
    case 'sideRivet':
      return `<circle cx="${tx - 4}" cy="${ty + th/2}" r="7" fill="${sch.border}"/>`;
    case 'dmtGem': {
      const cx = tx + tw - 60, cy = ty + th - 130;
      return `<polygon points="${cx},${cy-14} ${cx+12},${cy-2} ${cx+8},${cy+12} ${cx-8},${cy+12} ${cx-12},${cy-2}"
        fill="${BASE.purple}" stroke="${BASE.white}" stroke-width="3" stroke-linejoin="round"/>`;
    }
    case 'orbitDot':
      return `<ellipse cx="${CX}" cy="${LOWER_EYE_CY}" rx="280" ry="180"
        fill="none" stroke="${sch.b}" stroke-width="2" opacity="0.35"
        stroke-dasharray="4 8"/>
        <circle cx="${CX - 280}" cy="${LOWER_EYE_CY}" r="6" fill="${sch.b}"/>`;
    case 'voidPatch': {
      const x = tx + 60, y = ty + 360;
      return `<rect x="${x}" y="${y}" width="40" height="40" fill="${BASE.pupil}" opacity="0.85"
        stroke="${BASE.purple}" stroke-width="3"/>`;
    }
    case 'minerMark': {
      const cx = tx + 80, cy = ty + 220;
      return `<g transform="rotate(-15 ${cx} ${cy})">
        <line x1="${cx-16}" y1="${cy-16}" x2="${cx+16}" y2="${cy+16}"
          stroke="${sch.border}" stroke-width="5" stroke-linecap="round"/>
        <line x1="${cx-16}" y1="${cy+16}" x2="${cx+16}" y2="${cy-16}"
          stroke="${sch.border}" stroke-width="5" stroke-linecap="round"/>
      </g>`;
    }
    case 'littleX': {
      const cx = tx + tw - 70, cy = ty + 340;
      return `<g stroke="${BASE.blood}" stroke-width="4" stroke-linecap="round">
        <line x1="${cx-9}" y1="${cy-9}" x2="${cx+9}" y2="${cy+9}"/>
        <line x1="${cx-9}" y1="${cy+9}" x2="${cx+9}" y2="${cy-9}"/>
      </g>`;
    }
  }
  return '';
}

// -----------------------------------------------------------------------------
// Glasses — drawn across the two lower eyes (and sometimes the third eye)
// -----------------------------------------------------------------------------
const GLASSES = [
  'none','regular','memeMose','shades','aviator','halfFrame',
  'monocle','labGoggles','thirdEyeFrame',
];

function glasses(sch, kind = 'none') {
  if (!kind || kind === 'none') return '';
  const cl = CX - LOWER_EYE_DX;
  const cr = CX + LOWER_EYE_DX;
  const cy = LOWER_EYE_CY;
  const r  = LOWER_EYE_R;

  switch (kind) {
    case 'regular': {
      // round wireframes — Will / The Block Runner
      return `<circle cx="${cl}" cy="${cy}" r="${r + 10}" fill="none"
                stroke="${BASE.pupil}" stroke-width="9"/>
        <circle cx="${cr}" cy="${cy}" r="${r + 10}" fill="none"
                stroke="${BASE.pupil}" stroke-width="9"/>
        <line x1="${cl + r + 8}" y1="${cy}" x2="${cr - r - 8}" y2="${cy}"
              stroke="${BASE.pupil}" stroke-width="9" stroke-linecap="round"/>
        <line x1="${cl - r - 10}" y1="${cy}" x2="${TILE.x + 14}" y2="${cy - 6}"
              stroke="${BASE.pupil}" stroke-width="6" stroke-linecap="round"/>
        <line x1="${cr + r + 10}" y1="${cy}" x2="${TILE.x + TILE.w - 14}" y2="${cy - 6}"
              stroke="${BASE.pupil}" stroke-width="6" stroke-linecap="round"/>`;
    }
    case 'memeMose': {
      // red lens shades — Iman / MEMEMOSES
      const w = r * 2.0, h = r * 1.45;
      const flx = cl - w/2, frx = cr - w/2, ty = cy - h/2;
      return `<rect x="${flx}" y="${ty}" width="${w}" height="${h}" rx="12" ry="12"
                fill="${BASE.blood}" stroke="${BASE.pupil}" stroke-width="9" opacity="0.94"/>
        <rect x="${frx}" y="${ty}" width="${w}" height="${h}" rx="12" ry="12"
                fill="${BASE.blood}" stroke="${BASE.pupil}" stroke-width="9" opacity="0.94"/>
        <line x1="${cl + w/2}" y1="${cy}" x2="${cr - w/2}" y2="${cy}"
              stroke="${BASE.pupil}" stroke-width="10" stroke-linecap="round"/>
        <line x1="${flx + w*0.12}" y1="${ty + h*0.22}" x2="${flx + w*0.55}" y2="${ty + h*0.18}"
              stroke="${BASE.white}" stroke-width="4" opacity="0.7" stroke-linecap="round"/>
        <line x1="${frx + w*0.12}" y1="${ty + h*0.22}" x2="${frx + w*0.55}" y2="${ty + h*0.18}"
              stroke="${BASE.white}" stroke-width="4" opacity="0.7" stroke-linecap="round"/>`;
    }
    case 'shades': {
      const w = r * 2.0, h = r * 1.4;
      const flx = cl - w/2, frx = cr - w/2, ty = cy - h/2;
      return `<rect x="${flx}" y="${ty}" width="${w}" height="${h}" rx="14" ry="14"
                fill="${BASE.pupil}" stroke="${BASE.pupil}" stroke-width="9"/>
        <rect x="${frx}" y="${ty}" width="${w}" height="${h}" rx="14" ry="14"
                fill="${BASE.pupil}" stroke="${BASE.pupil}" stroke-width="9"/>
        <line x1="${cl + w/2}" y1="${cy}" x2="${cr - w/2}" y2="${cy}"
              stroke="${BASE.pupil}" stroke-width="10" stroke-linecap="round"/>
        <line x1="${flx + w*0.12}" y1="${ty + h*0.22}" x2="${flx + w*0.55}" y2="${ty + h*0.18}"
              stroke="${BASE.white}" stroke-width="3" opacity="0.45" stroke-linecap="round"/>
        <line x1="${frx + w*0.12}" y1="${ty + h*0.22}" x2="${frx + w*0.55}" y2="${ty + h*0.18}"
              stroke="${BASE.white}" stroke-width="3" opacity="0.45" stroke-linecap="round"/>`;
    }
    case 'aviator': {
      const teardrop = (cx) =>
        `<path d="M ${cx - r - 8} ${cy - r*0.8}
            Q ${cx} ${cy - r - 14} ${cx + r + 8} ${cy - r*0.8}
            Q ${cx + r + 12} ${cy + r*0.2} ${cx} ${cy + r + 10}
            Q ${cx - r - 12} ${cy + r*0.2} ${cx - r - 8} ${cy - r*0.8} Z"
          fill="${BASE.cyan}" fill-opacity="0.25" stroke="${BASE.pupil}" stroke-width="8"
          stroke-linejoin="round"/>`;
      return teardrop(cl) + teardrop(cr) +
        `<line x1="${cl + r + 4}" y1="${cy - r*0.55}" x2="${cr - r - 4}" y2="${cy - r*0.55}"
          stroke="${BASE.pupil}" stroke-width="6"/>`;
    }
    case 'halfFrame': {
      return `<path d="M ${cl - r - 8} ${cy} A ${r + 8} ${r + 8} 0 0 0 ${cl + r + 8} ${cy}"
                fill="none" stroke="${BASE.pupil}" stroke-width="9" stroke-linecap="round"/>
        <path d="M ${cr - r - 8} ${cy} A ${r + 8} ${r + 8} 0 0 0 ${cr + r + 8} ${cy}"
                fill="none" stroke="${BASE.pupil}" stroke-width="9" stroke-linecap="round"/>
        <line x1="${cl + r + 8}" y1="${cy}" x2="${cr - r - 8}" y2="${cy}"
              stroke="${BASE.pupil}" stroke-width="8" stroke-linecap="round"/>`;
    }
    case 'monocle': {
      return `<circle cx="${cr}" cy="${cy}" r="${r + 14}" fill="none"
                stroke="${BASE.pupil}" stroke-width="9"/>
        <path d="M ${cr + r + 14} ${cy} q 18 28 4 64 q -10 28 14 50"
              fill="none" stroke="${BASE.pupil}" stroke-width="3"
              stroke-dasharray="3 5" stroke-linecap="round"/>`;
    }
    case 'labGoggles': {
      return `<circle cx="${cl}" cy="${cy}" r="${r + 14}" fill="${BASE.cyan}"
                fill-opacity="0.18" stroke="${BASE.pupil}" stroke-width="11"/>
        <circle cx="${cr}" cy="${cy}" r="${r + 14}" fill="${BASE.cyan}"
                fill-opacity="0.18" stroke="${BASE.pupil}" stroke-width="11"/>
        <rect x="${cl + r + 6}" y="${cy - 10}" width="${(cr - cl) - 2*(r + 6)}" height="20"
              fill="${BASE.pupil}"/>
        <line x1="${cl - r - 14}" y1="${cy}" x2="${TILE.x + 6}" y2="${cy - 22}"
              stroke="${BASE.pupil}" stroke-width="7" stroke-linecap="round"/>
        <line x1="${cr + r + 14}" y1="${cy}" x2="${TILE.x + TILE.w - 6}" y2="${cy - 22}"
              stroke="${BASE.pupil}" stroke-width="7" stroke-linecap="round"/>`;
    }
    case 'thirdEyeFrame': {
      // a frame around just the third eye — the "I read everything" researcher
      return `<circle cx="${CX}" cy="${THIRD_EYE_CY}" r="${THIRD_EYE_R + 12}"
                fill="none" stroke="${BASE.pupil}" stroke-width="6"/>
        <path d="M ${CX + THIRD_EYE_R + 12} ${THIRD_EYE_CY}
                 q 24 18 14 48"
              fill="none" stroke="${BASE.pupil}" stroke-width="3"
              stroke-dasharray="3 4"/>`;
    }
  }
  return '';
}

// -----------------------------------------------------------------------------
// Elemental Nature — tiny insignia stamped on bottom-left of tile
// -----------------------------------------------------------------------------
const NATURES = ['none','fire','water','ice','earth','void','aether'];

function natureMark(sch, kind = 'none') {
  if (!kind || kind === 'none') return '';
  const cx = TILE.x + 78;
  const cy = TILE.y + TILE.h - 90;
  // contrast disc so it stamps cleanly on any shell
  const disc = `<circle cx="${cx}" cy="${cy}" r="26" fill="${sch.tile}"
    stroke="${sch.border}" stroke-width="3.5"/>`;
  switch (kind) {
    case 'fire': {
      const flame = `<path d="M ${cx} ${cy - 14}
        Q ${cx + 11} ${cy + 1} ${cx + 7} ${cy + 12}
        Q ${cx} ${cy + 3} ${cx - 7} ${cy + 12}
        Q ${cx - 11} ${cy + 1} ${cx} ${cy - 14} Z"
        fill="${BASE.orange}" stroke="${BASE.pupil}" stroke-width="2.5"
        stroke-linejoin="round"/>
        <circle cx="${cx}" cy="${cy + 5}" r="2.5" fill="${BASE.white}"/>`;
      return disc + flame;
    }
    case 'water': {
      const drop = `<path d="M ${cx} ${cy - 14}
        Q ${cx + 12} ${cy + 2} ${cx} ${cy + 14}
        Q ${cx - 12} ${cy + 2} ${cx} ${cy - 14} Z"
        fill="#2aa7c4" stroke="${BASE.pupil}" stroke-width="2.5"
        stroke-linejoin="round"/>
        <circle cx="${cx - 3}" cy="${cy + 3}" r="2.5" fill="${BASE.white}" opacity="0.85"/>`;
      return disc + drop;
    }
    case 'ice': {
      const flake = `<g stroke="${BASE.cyan}" stroke-width="3" stroke-linecap="round">
        <line x1="${cx}" y1="${cy - 14}" x2="${cx}" y2="${cy + 14}"/>
        <line x1="${cx - 14}" y1="${cy}" x2="${cx + 14}" y2="${cy}"/>
        <line x1="${cx - 10}" y1="${cy - 10}" x2="${cx + 10}" y2="${cy + 10}"/>
        <line x1="${cx + 10}" y1="${cy - 10}" x2="${cx - 10}" y2="${cy + 10}"/>
      </g>
      <circle cx="${cx}" cy="${cy}" r="3" fill="${BASE.white}"/>`;
      return disc + flake;
    }
    case 'earth': {
      const mt = `<polygon points="${cx},${cy - 13} ${cx + 13},${cy + 11} ${cx - 13},${cy + 11}"
        fill="#8a5a2e" stroke="${BASE.pupil}" stroke-width="2.5" stroke-linejoin="round"/>
        <polygon points="${cx},${cy - 5} ${cx + 5},${cy + 2} ${cx - 5},${cy + 2}"
        fill="${BASE.white}" opacity="0.7"/>`;
      return disc + mt;
    }
    case 'void': {
      const v = `<circle cx="${cx}" cy="${cy}" r="13" fill="none"
        stroke="${BASE.purple}" stroke-width="3.5"/>
        <circle cx="${cx}" cy="${cy}" r="4" fill="${BASE.pupil}"/>`;
      return disc + v;
    }
    case 'aether': {
      // dotted spiral
      const a = `<path d="M ${cx} ${cy}
        m 0 -2
        a 2 2 0 1 1 0 4
        a 5 5 0 1 0 0 -10
        a 8 8 0 1 1 0 16"
        fill="none" stroke="${BASE.white}" stroke-width="3"/>
        <circle cx="${cx}" cy="${cy}" r="1.6" fill="${BASE.white}"/>`;
      return disc + a;
    }
  }
  return disc;
}

// -----------------------------------------------------------------------------
// Whispers — element → first-person line that secretly teaches the field
// -----------------------------------------------------------------------------
const WHISPERS = {
  // BLOCK DATA
  Ha: { field:'Hash', whisper:'I am the address of this moment. There is exactly one of me. You will never write me down.' },
  S:  { field:'Size', whisper:'I am the heft of the block. Skinny or thick — that is all I tell you.' },
  Se: { field:'Stripped Size', whisper:'I am the block with its sleeves rolled up. Witnesses left at the door.' },
  Wt: { field:'Weight', whisper:'I weigh the block. Witnesses count less than they look. Some of me is a rumor.' },
  Ht: { field:'Height', whisper:'I only count up. I cannot remember how to descend.' },
  Vn: { field:'Version', whisper:'I tell you which rules this block agreed to. Sometimes I lie about new ones.' },
  Vx: { field:'Version Hex', whisper:'I am the version wearing a hex disguise. Squint to read me.' },
  Mt: { field:'Merkle Root', whisper:'I am the fingerprint of every transaction below me. Change one, and I scream.' },
  T:  { field:'Time', whisper:'I lie. Miners drift me ten minutes ahead, two hours behind. I am the slowest clock you know.' },
  Me: { field:'Median Time', whisper:'I am the median of the last eleven. I am more honest than my parent.' },
  Ne: { field:'Nonce', whisper:'I am the lucky number. Miners guess me four billion times a second. They never get me first try.' },
  B:  { field:'Bits', whisper:'I am difficulty wearing a costume. Read me carefully and you learn the world\u2019s patience.' },
  Dy: { field:'Difficulty', whisper:'I rise when you are clever. I fall when you give up. I am the world\u2019s slowest thermostat.' },
  Ck: { field:'Chainwork', whisper:'I am the total work behind me. I am the receipt of every miner who ever tried.' },
  Nt: { field:'N Tx', whisper:'I count how many transactions sit in me. Sometimes one. Sometimes thousands.' },

  // TRANSACTION
  He: { field:'Header', whisper:'I am the header. Open me first.' },
  Tx: { field:'TxID', whisper:'I am a single transaction. I am a story between two strangers.' },
  Hs: { field:'Tx Hash', whisper:'I name every transaction. Lose me and you lose the trade.' },
  Si: { field:'Tx Size', whisper:'I am the size you actually downloaded. No witness discount.' },
  Ve: { field:'Tx Version', whisper:'I am the version, but smaller. I belong to one trade.' },
  We: { field:'Witness', whisper:'I prove without taking up much room. I am the silent receipt.' },
  Vi: { field:'V-in', whisper:'I am where this transaction started. Once I was an output. Now I am an offering.' },
  Le: { field:'Locktime', whisper:'I lock the transaction until a future block. Patience. I\u2019ll tell you when.' },
  Be: { field:'Block Height (Confirmed)', whisper:'I am the moment of belief. The block that finally accepted me.' },

  // INPUT
  A:  { field:'Address', whisper:'I am where this came from. I might be one person. I might be a million.' },
  Hx: { field:'Hex', whisper:'I look like nonsense. I am the truth in encoded form.' },
  Sq: { field:'Sequence', whisper:'I am the patient one. Lock me until height 800000.' },
  Ts: { field:'Timestamp', whisper:'I was set by hand. Doubt me.' },

  // OUTPUT
  Va: { field:'Value', whisper:'I am what was sent. Strip the dust. I shine.' },
  N:  { field:'Output Index', whisper:'I am the lane this matter takes. Number me carefully.' },
  As: { field:'Output Address', whisper:'I am where it went. Sometimes new, sometimes ancient.' },
  H:  { field:'Output Height', whisper:'I am the height it confirmed at. I am when it became real.' },
  Rs: { field:'ScriptPubKey Reason', whisper:'Why was this allowed? Read me to find out the rules of the lock.' },
  Ty: { field:'Output Type', whisper:'Pay-to-key. Pay-to-hash. Pay-to-mystery. I am the kind of door.' },
  Ws: { field:'Witness Script', whisper:'I am the part you did not have to download. I prove without speaking.' },

  // EXTRA
  Bf: { field:'Block Fee', whisper:'I am what miners ate. Tip them or wait.' },
  Ie: { field:'Is Coinbase', whisper:'Yes or no. The first transaction always says yes.' },
  Ce: { field:'Coinbase', whisper:'I am the first one. I introduce the block to itself.' },

  // CEREMONIAL
  G:  { field:'Genesis', whisper:'I am the first. I am the one you remember when you remember nothing else. I do not speak. I am.' },
};

// -----------------------------------------------------------------------------
// Deterministic RNG — block height → traits
// cyrb128 string hash → sfc32 PRNG. Inline, sync, parity-safe.
// -----------------------------------------------------------------------------
function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}
function sfc32(a, b, c, d) {
  return function () {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}
function rngForBlock(height) {
  const [a,b,c,d] = cyrb128('UNATOM/SERIES0/' + height);
  return sfc32(a,b,c,d);
}

function unatomFromBlock(height) {
  // ceremonial pin — the BLAST-OFF is fixed
  if (Number(height) === BLAST_OFF) {
    return { sym:'G', blk:height, scheme:'obsidian', border:'doubleLine',
      thirdEye:'genesis', mood:'ancient', mouthKind:'noMouth',
      drip:'crystalDrip', glasses:'none', nature:'aether',
      swagKind:'haloNode', eco:'diamond' };
  }
  const rng = rngForBlock(height);
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];

  // category by weight (block common, extra rare)
  let cat;
  const r = rng();
  if (r < 0.55) cat = CATEGORIES[0];
  else if (r < 0.78) cat = CATEGORIES[1];
  else if (r < 0.90) cat = CATEGORIES[2];
  else if (r < 0.97) cat = CATEGORIES[3];
  else              cat = CATEGORIES[4];
  const sym = pick(cat.els);

  const scheme = pick(['graphite','graphite','graphite','bone','bone','frost','frost',
    'jade','bronze','ember','obsidian','ash','signal','chalk','rust','aqua','void']);
  const border = pick(['clean','clean','clean','clean','clean','heavy','thin',
    'doubleLine','stitched','burntEdge','frostEdge','sealed','offset','notched','rivet','brokenCorner']);
  const tEye   = pick(['open','open','open','aperture','diamond','crosshair','oracle','halo',
    'void','spiral','genesis','closedEye','sealed','pixel','frost','burn','hash','eclipse']);
  const mood   = pick(['calm','calm','calm','curious','shy','sideEye','lockedIn','sleepy',
    'wonder','soft','suspicious','blissed','rookie','hyperAware','glitch','mismatched','wink','ancient']);
  const mouthKind = pick(MOUTHS);
  const drip   = pick(DRIPS);
  const glassesKind = pick(['none','none','none','none','none','none','none',
    'regular','memeMose','shades','aviator','halfFrame','monocle','labGoggles','thirdEyeFrame']);
  const browKind = pick(['none','none','none','flat','flat','raised','furrowed','slant','arch','single','unibrow','speck']);
  const nature = pick(['none','none','none','none','none','none','none',
    'fire','water','ice','earth','void','aether']);
  const swagKind = pick(['none','none','none','none','none','none','none','none',
    'diamondStud','patchBorder','stitchMark','cornerChip','burnMark','haloNode','sealStamp',
    'ordinalTag','difficultyBadge','hashScratch','tinyBandage','pixelScar','crownDot',
    'sideRivet','dmtGem','orbitDot','voidPatch','minerMark','littleX','microChain']);
  const eco = pick(['orbit','orbit','diamond','threeDot','btc']);

  return { sym, blk: height, scheme, border, thirdEye: tEye, mood,
    mouthKind, drip, glasses: glassesKind, brows: browKind, nature, swagKind, eco };
}

// -----------------------------------------------------------------------------
// Main composer
// -----------------------------------------------------------------------------
function unatomSVG(opts = {}) {
  const {
    sym         = 'Ne',
    blk         = 10080,
    scheme      = 'graphite',
    border      = 'clean',
    thirdEye:   thirdEyeKind = 'open',
    mood        = 'calm',
    mouthKind   = 'signalSmile',
    drip        = 'seedDrip',
    swagKind    = 'none',
    eco         = 'orbit',
    glasses:    glassesKind = 'none',
    brows:      browsKind   = 'none',
    nature:     natureKind  = 'none',
    showBlock   = true,
    showSymbol  = true,
  } = opts;

  const sch = SCHEMES[scheme] || SCHEMES.graphite;

  // halo nodes draw OUTSIDE tile so layer them before the body
  const aboveBody = (swagKind === 'haloNode' || swagKind === 'crownDot') ? swag(sch, swagKind) : '';
  const bodySwag  = (swagKind !== 'haloNode' && swagKind !== 'crownDot' && swagKind !== 'sideRivet') ? swag(sch, swagKind) : '';
  const sideSwag  = swagKind === 'sideRivet' ? swag(sch, swagKind) : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB} ${VB}">
    ${matterWick(sch, drip)}
    ${aboveBody}
    ${tileBody(sch, border)}
    ${sideSwag}
    ${ecoMark(sch, eco)}
    ${showBlock ? blockNumber(blk, sch) : ''}
    ${thirdEye(CX, THIRD_EYE_CY, THIRD_EYE_R, sch, thirdEyeKind)}
    ${lowerEyes(sch, mood)}
    ${brows(sch, browsKind)}
    ${glasses(sch, glassesKind)}
    ${mouth(CX, MOUTH_CY, 130, mouthKind, sch)}
    ${showSymbol ? chestSymbol(sym, sch) : ''}
    ${natureMark(sch, natureKind)}
    ${bodySwag}
  </svg>`;
}

root.UNATOM = {
  BASE, SCHEMES,
  BLAST_OFF, SERIES_SIZE,
  CATEGORIES,
  VB, TILE, CX, TILE_BOTTOM, THIRD_EYE_CY, LOWER_EYE_CY, MOUTH_CY,
  SYMBOL_BASE_Y, SYMBOL_SIZE, LOWER_EYE_R, LOWER_EYE_DX, THIRD_EYE_R,
  MOODS, BROWS, THIRD_EYES, MOUTHS, DRIPS, SWAGS, GLASSES, NATURES,
  WHISPERS,
  cyrb128, sfc32, rngForBlock,
  fromBlock: unatomFromBlock,
  svg: unatomSVG,
};
})(typeof window !== 'undefined' ? window : globalThis);
