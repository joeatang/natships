const BLOCK_PRESETS = {
  102816: {
    height: 102816,
    hash: '0000000000036e1b1c66c51814ee2f500f3e67d8e568f5606b91ad3359e68c0d',
    txCount: 1,
    totalFees: 0,
    miner: 'Genesis Era',
    timestamp: 1295101567,
    weight: 860,
  },
  420000: {
    height: 420000,
    hash: '000000000000000002cce816c0ab2c5c269cb081896b7dcb34b8422d6b74ffa1',
    txCount: 1257,
    totalFees: 0,
    miner: 'Epoch Switch',
    timestamp: 1468082773,
    weight: 3999352,
  },
  630000: {
    height: 630000,
    hash: '000000000000000000024bead8df69990852c202db0e0097c1a12ea637d7e96d',
    txCount: 3134,
    totalFees: 0,
    miner: 'Halving Era',
    timestamp: 1589225023,
    weight: 3993250,
  },
  701824: {
    height: 701824,
    hash: '00000000000000000005f0c6cf837b78823fad46bcf604af8f85d3bd9b4c7976',
    txCount: 2023,
    totalFees: 0.428,
    miner: 'AntPool',
    timestamp: 1632396304,
    weight: 3992900,
  },
  810000: {
    height: 810000,
    hash: '000000000000000000028028ca82b6aa81ce789e4eb9e0321b74c3cbaf405dd1',
    txCount: 1690,
    totalFees: 0,
    miner: 'Ordinal Wave',
    timestamp: 1696067464,
    weight: 3993173,
  },
};

const SERIES_START = 102816;
const SERIES_SUPPLY = 10080;
const GREEN_HI_TARGET = 1000;
const PLANET_RAINBOW_STEPS = 100;

const url = new URL(window.location.href);
const queryHeight = Number(url.searchParams.get('h') || '701824');
const compactMode = url.searchParams.get('compact') === '1';

if (compactMode) {
  document.body.classList.add('compact');
}

const hashByte = (h, i) => {
  const clean = String(h || '').toLowerCase().replace(/[^0-9a-f]/g, '');
  if (clean.length < 2) return 0;

  // Mix across the full hash so PoW leading zeros do not collapse trait entropy.
  let acc = 0;
  const stride = 5 + (i % 19);
  const rounds = Math.min(24, clean.length);
  for (let j = 0; j < rounds; j += 1) {
    const idx = (i * 11 + j * stride) % clean.length;
    const code = clean.charCodeAt(idx);
    acc = (acc * 33 + code + i + j * 7) & 255;
  }

  const pairIdx = (i * 7 + acc) % (clean.length - 1);
  const pair = parseInt(clean.slice(pairIdx, pairIdx + 2), 16);
  const mixed = (Number.isNaN(pair) ? 0 : pair) ^ acc;
  return mixed & 255;
};

const hashFloat = (h, i) => hashByte(h, i) / 255;
const hashPick = (h, i, arr) => arr[hashByte(h, i) % arr.length];

function heightHashHex(height) {
  let x = ((height >>> 0) ^ 0x9e3779b9) >>> 0;
  const out = [];
  for (let i = 0; i < 64; i += 1) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x = (x + 0x6d2b79f5 + ((height * (i + 17)) >>> 0)) >>> 0;
    out.push((x & 15).toString(16));
  }
  return out.join('');
}

function makeSyntheticBlock(height) {
  const safeHeight = Number.isFinite(height) && height > 0 ? Math.floor(height) : 701824;
  const hash = heightHashHex(safeHeight);
  return {
    height: safeHeight,
    hash,
    txCount: 800 + (safeHeight % 2600),
    totalFees: ((safeHeight % 300) / 1000),
    miner: 'Range Derived',
    timestamp: 1231006505 + safeHeight * 600,
    weight: 3980000 + (safeHeight % 12000),
  };
}

const block = BLOCK_PRESETS[queryHeight] || makeSyntheticBlock(queryHeight);

const FLEET_NAMES = [
  'NORDLAND', 'TYCHO', 'VANTABLACK', 'HALCYON', 'MIDAS', 'OBLIVION', 'HELIOS', 'PERSEPHONE',
  'OROBORO', 'CETUS', 'BOREAS', 'LYRA', 'ANTARES', 'VERMILION', 'THANATOS', 'CIRRUS',
  'OCTAVIAN', 'CASSIOPEIA', 'AUREA', 'ELYSIUM', 'PROMETHEUS', 'CAELESTIS', 'NYX', 'GORGON',
  'ARGON', 'DELPHINUS', 'PHOENIX', 'SCYTHIA', 'XENON', 'ZODIAC', 'HYPERION', 'ZEPHYR'
];

const VESSEL_CLASSES = [
  { key: 'STARSHIP', name: 'Starship-class', noseStyle: 'sharp', bodyWidth: 138, bodyHeight: 690, finSpan: 64 },
  { key: 'FALCON', name: 'Falcon-class', noseStyle: 'capsule', bodyWidth: 108, bodyHeight: 720, finSpan: 48 },
  { key: 'HEAVY', name: 'Heavy-class', noseStyle: 'blunt', bodyWidth: 166, bodyHeight: 640, finSpan: 78 },
  { key: 'LANCER', name: 'Lancer-class', noseStyle: 'spike', bodyWidth: 96, bodyHeight: 760, finSpan: 38 },
  { key: 'NIMBUS', name: 'Nimbus-class', noseStyle: 'dome', bodyWidth: 126, bodyHeight: 650, finSpan: 0 },
];

const PROPULSION_TYPES = ['CRYOGENIC', 'HYPERGOLIC', 'METHALOX', 'ION', 'SOLID'];
const FUEL_CHEMISTRY = ['CH4 + LOX', 'RP-1 + LOX', 'UDMH + N2O4', 'LH2 + LOX', 'Xe + e-'];
const ORBIT_CLASSES = ['LEO', 'MEO', 'GEO', 'HEO', 'TLI', 'TMI', 'SOI'];
const STATUS_TYPES = ['RECOVERED', 'IN-FLIGHT', 'REFUELING', 'DOCKED', 'LANDED'];
const ORIGIN_BODIES = [
  { name: 'EARTH', hueSeed: 198, satMin: 36, satMax: 88, lightMin: 26, lightMax: 76 },
  { name: 'MARS', hueSeed: 24, satMin: 40, satMax: 92, lightMin: 24, lightMax: 72 },
  { name: 'MOON', hueSeed: 214, satMin: 10, satMax: 52, lightMin: 22, lightMax: 82 },
  { name: 'SUBSTRATE', hueSeed: 286, satMin: 34, satMax: 94, lightMin: 20, lightMax: 74 },
];
const ORIGIN_ZODIAC = {
  EARTH: 'TAURUS',
  MARS: 'ARIES',
  MOON: 'CANCER',
  SUBSTRATE: 'AQUARIUS',
};
const ORIGIN_GLYPH = {
  EARTH: '⊕',
  MARS: '♂',
  MOON: '☽',
  SUBSTRATE: '◉',
};
const ZODIAC_GLYPH = {
  ARIES: '♈',
  TAURUS: '♉',
  GEMINI: '♊',
  CANCER: '♋',
  LEO: '♌',
  VIRGO: '♍',
  LIBRA: '♎',
  SCORPIO: '♏',
  SAGITTARIUS: '♐',
  CAPRICORN: '♑',
  AQUARIUS: '♒',
  PISCES: '♓',
};
const FLYOVER_NOTES = {
  EARTH: [
    'city light webs and blue weather bands',
    'storm walls curling over the dawn limb',
    'auroral rivers threading the night side',
  ],
  MARS: [
    'iron canyons and dust wakes under low sun',
    'frozen escarpments crossing ember plains',
    'crater chains with pale frost at the rim',
  ],
  MOON: [
    'silent basalt seas and fractured crater rims',
    'highland scars lit by grazing horizon fire',
    'shadowed maria with bright ejecta trails',
  ],
  SUBSTRATE: [
    'violet flux shelves and braided signal storms',
    'phase tides bending through lattice haze',
    'memory plumes rolling under ion glass',
  ],
};

const nebulaFamilies = [
  'emerald spiral', 'ember cloud', 'violet veil', 'deep cobalt', 'breakthrough aurora', 'sable drift',
  'ion storm', 'cinder bloom', 'opal tide', 'titan haze', 'nova lace', 'ghost plume'
];

const SIGIL_MODES = ['ghost', 'beacon', 'engraved', 'constellation'];

const fleet = FLEET_NAMES[hashByte(block.hash, 0) % FLEET_NAMES.length];
const vesselClass = VESSEL_CLASSES[hashByte(block.hash, 1) % VESSEL_CLASSES.length];
const propulsionIndex = hashByte(block.hash, 2) % PROPULSION_TYPES.length;
const propulsion = PROPULSION_TYPES[propulsionIndex];
const fuel = FUEL_CHEMISTRY[propulsionIndex];
const engineCount = [3, 5, 7, 9, 27, 33][hashByte(block.hash, 3) % 6];
const flightCount = 1 + (hashByte(block.hash, 4) % 24);
const stages = 1 + (hashByte(block.hash, 5) % 3);
const payloadKg = 800 + hashByte(block.hash, 6) * 80;
const dvMs = 7800 + hashByte(block.hash, 7) * 30;
const orbitClass = hashPick(block.hash, 8, ORBIT_CLASSES);
const status = hashPick(block.hash, 9, STATUS_TYPES);
const origin = ORIGIN_BODIES[hashByte(block.hash, 19) % ORIGIN_BODIES.length];
const callSign = `${fleet.slice(0, 3)}-${String(block.height % 10000).padStart(4, '0')}`;
const discoveryDate = new Date(block.timestamp * 1000).toLocaleDateString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric'
});
const nebulaFamily = nebulaFamilies[hashByte(block.hash, 10) % nebulaFamilies.length];
const starPalette = hashPick(block.hash, 11, ['warm amber', 'neutral white', 'blue shifted', 'violet break', 'solar ash']);
const sigilMode = hashPick(block.hash, 16, SIGIL_MODES);
const sigilIntensity = 0.42 + hashFloat(block.hash, 17) * 0.5;
const sigilTilt = -0.28 + hashFloat(block.hash, 18) * 0.56;
const travelDirection = hashPick(block.hash, 37, ['INBOUND', 'OUTBOUND']);
const missionPhase = hashPick(block.hash, 38, ['LAUNCH', 'ASCENT', 'TRANSIT', 'GATE CROSSING', 'APPROACH', 'DOCK']);
const destination = hashPick(block.hash, 39, ['ORBITAL RING', 'SURFACE BEACON', 'DEEP RELAY', 'SIGIL GATE']);
const motionStrength = 0.28 + hashFloat(block.hash, 40) * 0.72;
const heading = travelDirection === 'OUTBOUND' ? 1 : -1;
const laneTilt = -0.16 + hashFloat(block.hash, 41) * 0.32;
const astralDegree = (hashByte(block.hash, 47) % 360) + hashFloat(block.hash, 48);
const declination = -66 + hashFloat(block.hash, 49) * 132;
const navigationSayings = [
  'STEER BY FIRE, NOT FEAR',
  'THE CHAIN REMEMBERS THE WAY',
  'TRAJECTORY IS A PROMISE',
  'RETURN VECTOR: HEARTWARD',
  'ALL ORBITS ARE STORIES',
  'BURN TRUE. DRIFT NEVER',
  'THE SKY KEEPS YOUR NAME',
  'SIGIL HOLDS, VESSEL FOLLOWS',
  'EVERY BLOCK IS A STAR MAP',
  'DUST BECOMES DIRECTION'
];
const navigationSaying = hashPick(block.hash, 50, navigationSayings);
const originZodiac = ORIGIN_ZODIAC[origin.name] || 'LIBRA';
const originGlyph = ORIGIN_GLYPH[origin.name] || '◎';
const flyoverNote = hashPick(block.hash, 58, FLYOVER_NOTES[origin.name] || FLYOVER_NOTES.EARTH);
const celestialHour = String(hashByte(block.hash, 59) % 24).padStart(2, '0');
const celestialMinute = String(hashByte(block.hash, 60) % 60).padStart(2, '0');
const celestialPulse = String(hashByte(block.hash, 61) % 100).padStart(2, '0');
const celestialTime = `${celestialHour}:${celestialMinute}:${celestialPulse} ST`;
const destinationTitle = {
  'ORBITAL RING': 'HOME RING',
  'SURFACE BEACON': 'BEACON SHORE',
  'DEEP RELAY': 'DEEP RELAY',
  'SIGIL GATE': 'GATE OF RETURN',
}[destination] || destination;
const sigilTitle = {
  ghost: 'WHISPER SIGIL',
  beacon: 'BEACON SIGIL',
  engraved: 'CARVED SIGIL',
  constellation: 'STAR SIGIL',
}[sigilMode] || 'GUIDING SIGIL';
const hiGreenVariant = isGreenHiVariant(block.height, block.hash);

function isGreenHiVariant(height, hash) {
  if (Number.isFinite(height) && height >= SERIES_START && height < SERIES_START + SERIES_SUPPLY) {
    // Exact rarity contract: 1,000 green variants in the 10,080-piece series.
    const serial = height - SERIES_START;
    const permuted = (serial * 7919 + 1871) % SERIES_SUPPLY;
    return permuted < GREEN_HI_TARGET;
  }
  return hashByte(hash, 63) < 25;
}

const canvas = document.getElementById('still');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const FOCAL_ZOOM = 1.12;
const FOCAL_SHIFT_X = -70;
const FOCAL_SHIFT_Y = 18;

render();
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(render).catch(() => {});
}

function render() {
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  applyFocalZoom();
  drawBackdrop();
  drawStars();
  drawNebula();
  drawOrbitalRibbons();
  drawMotionLanes();
  drawSigilSimulation();
  drawDestinationAnchor();
  drawOriginBody();
  drawDust();
  drawVessel();
  drawForegroundParallax();
  drawLightBloom();
  ctx.restore();
  drawOuterZodiacMark();
  drawAnalogAtmosphere();
  drawFilmGrain();
  drawHashStamp();
  drawAstralOverlay();
  fillMeta();
}

function applyFocalZoom() {
  ctx.translate(W * 0.5 + FOCAL_SHIFT_X, H * 0.5 + FOCAL_SHIFT_Y);
  ctx.scale(FOCAL_ZOOM, FOCAL_ZOOM);
  ctx.translate(-W * 0.5, -H * 0.5);
}

function drawOuterZodiacMark() {
  const glyph = ZODIAC_GLYPH[originZodiac] || '✶';
  const rot = -0.34 + hashFloat(block.hash, 972) * 0.68;
  const size = 104 + hashFloat(block.hash, 973) * 36;
  const alpha = 0.045 + hashFloat(block.hash, 974) * 0.03;
  const margin = 18 + hashFloat(block.hash, 975) * 14;

  // Keep the zodiac mark out of the top overlay label lanes (y~64) while staying on the right side.
  const preferredX = W - (size * 0.78 + margin + hashFloat(block.hash, 970) * 36);
  const preferredY = 126 + size + hashFloat(block.hash, 971) * 26;
  const x = Math.max(size * 0.62 + margin, Math.min(preferredX, W - (size * 0.62 + margin)));
  const y = Math.max(size * 0.62 + margin, Math.min(preferredY, H - (size * 0.62 + margin)));

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, size * 1.8);
  aura.addColorStop(0, `rgba(188, 225, 255, ${alpha * 1.8})`);
  aura.addColorStop(0.58, `rgba(188, 225, 255, ${alpha * 0.55})`);
  aura.addColorStop(1, 'rgba(188, 225, 255, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, size * 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(214, 236, 255, ${alpha})`;
  ctx.font = `600 ${size}px "JetBrains Mono"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, 0, 0);

  ctx.restore();
}

function getSigilAnchor() {
  return {
    x: W * (0.24 + hashFloat(block.hash, 34) * 0.2),
    y: H * (0.18 + hashFloat(block.hash, 35) * 0.2),
  };
}

function getDestinationAnchor() {
  return {
    x: heading > 0 ? W * 0.9 : W * 0.1,
    y: H * (0.24 + hashFloat(block.hash, 44) * 0.4),
  };
}

function drawBackdrop() {
  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, '#06101f');
  base.addColorStop(0.38, '#0a1732');
  base.addColorStop(0.76, '#08111e');
  base.addColorStop(1, '#050810');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  const topGlow = ctx.createRadialGradient(W * 0.72, H * 0.2, 20, W * 0.72, H * 0.2, H * 0.46);
  topGlow.addColorStop(0, 'rgba(111, 188, 255, 0.18)');
  topGlow.addColorStop(0.5, 'rgba(44, 97, 189, 0.14)');
  topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, H);
}

function drawStars() {
  const starCount = 460;
  for (let i = 0; i < starCount; i += 1) {
    const px = (hashFloat(block.hash, i * 3) + i * 0.137) % 1;
    const py = (hashFloat(block.hash, i * 3 + 1) + i * 0.193) % 1;
    const pb = (hashFloat(block.hash, i * 3 + 2) + i * 0.257) % 1;
    const x = px * W;
    const y = py * H * 0.82;
    const radius = pb > 0.97 ? 3.4 : pb > 0.9 ? 2.2 : pb > 0.72 ? 1.3 : 0.75;
    const alpha = 0.16 + pb * 0.74;
    const color = i % 15 === 0
      ? `rgba(255, 201, 138, ${alpha})`
      : i % 11 === 0
        ? `rgba(188, 210, 255, ${alpha})`
        : `rgba(233, 239, 255, ${alpha})`;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    if (radius > 1.5) {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 8);
      glow.addColorStop(0, color.replace(/\d?\.\d+\)$/, `${Math.min(alpha * 0.5, 0.45)})`));
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius * 8, 0, Math.PI * 2);
      ctx.fill();

      if (i % 5 === 0 && motionStrength > 0.45) {
        ctx.strokeStyle = `rgba(226, 235, 255, ${0.11 + motionStrength * 0.18})`;
        ctx.lineWidth = 0.9 + radius * 0.2;
        ctx.beginPath();
        ctx.moveTo(x - heading * (5 + motionStrength * 22), y + laneTilt * 30);
        ctx.lineTo(x + heading * (3 + motionStrength * 12), y - laneTilt * 16);
        ctx.stroke();
      }
    }
  }
}

function drawMotionLanes() {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const laneCount = 3 + (hashByte(block.hash, 42) % 3);
  const targetX = heading > 0 ? W * 0.88 : W * 0.14;
  const targetY = H * (0.24 + hashFloat(block.hash, 43) * 0.38);

  for (let i = 0; i < laneCount; i += 1) {
    const startX = heading > 0 ? W * (0.1 + i * 0.05) : W * (0.9 - i * 0.05);
    const startY = H * (0.75 - i * 0.07);
    const ctrlX = W * 0.5 + heading * (80 + i * 40);
    const ctrlY = H * (0.52 + laneTilt * 0.5 + i * 0.02);

    ctx.strokeStyle = `rgba(148, 214, 255, ${0.06 + i * 0.02 + motionStrength * 0.04})`;
    ctx.lineWidth = 1.2 + i * 0.55;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, targetX, targetY);
    ctx.stroke();
  }
  ctx.restore();
}

function drawNebula() {
  const hueA = 190 + (hashByte(block.hash, 12) % 70);
  const hueB = 320 + (hashByte(block.hash, 13) % 30);
  const hueC = 18 + (hashByte(block.hash, 14) % 22);
  const anchors = [
    [W * 0.23, H * 0.34, W * 0.42, `hsla(${hueA}, 86%, 65%, 0.20)`],
    [W * 0.67, H * 0.26, W * 0.36, `hsla(${hueB}, 84%, 63%, 0.12)`],
    [W * 0.54, H * 0.56, W * 0.48, `hsla(${hueC}, 90%, 58%, 0.10)`],
  ];

  anchors.forEach(([x, y, radius, color], index) => {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, color);
    glow.addColorStop(0.58, color.replace(/0\.\d+\)$/, `${0.06 + index * 0.02})`));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  });

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let band = 0; band < 8; band += 1) {
    const yBase = H * (0.18 + band * 0.07) + hashByte(block.hash, 20 + band) * 1.4;
    ctx.beginPath();
    ctx.moveTo(-80, yBase);
    for (let x = -80; x <= W + 80; x += 24) {
      const wave = Math.sin(x * 0.009 + band * 0.7) * (22 + band * 8);
      const warp = Math.cos(x * 0.004 + hashFloat(block.hash, band) * Math.PI * 2) * 18;
      ctx.lineTo(x, yBase + wave + warp);
    }
    ctx.lineTo(W + 80, H + 80);
    ctx.lineTo(-80, H + 80);
    ctx.closePath();
    const strip = ctx.createLinearGradient(0, yBase - 120, 0, yBase + 200);
    strip.addColorStop(0, 'rgba(0,0,0,0)');
    strip.addColorStop(0.35, `hsla(${hueA + band * 3}, 90%, ${56 - band}%, ${0.038 + band * 0.004})`);
    strip.addColorStop(0.9, 'rgba(0,0,0,0)');
    ctx.fillStyle = strip;
    ctx.fill();
  }
  ctx.restore();
}

function drawOrbitalRibbons() {
  ctx.save();
  ctx.globalAlpha = 0.7;
  const ribbons = 4 + (hashByte(block.hash, 15) % 3);
  for (let i = 0; i < ribbons; i += 1) {
    const centerX = W * (0.28 + i * 0.12);
    const centerY = H * (0.31 + i * 0.06);
    const radiusX = 240 + i * 74;
    const radiusY = 78 + i * 22;
    ctx.strokeStyle = `hsla(${195 + i * 17}, 78%, 72%, ${0.12 - i * 0.012})`;
    ctx.lineWidth = 2.2 - i * 0.18;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, -0.42, 0.18 * Math.PI, 1.38 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSigilSimulation() {
  const sigil = getSigilAnchor();
  const x = sigil.x;
  const y = sigil.y;
  const radius = 86 + hashByte(block.hash, 36) * 0.5;
  const coreRadius = Math.max(16, radius * 0.24);
  const alphaBase = 0.14 + sigilIntensity * 0.2;
  const glowAlpha = 0.08 + sigilIntensity * 0.16;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(sigilTilt);

  if (sigilMode === 'ghost' || sigilMode === 'beacon') {
    const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.9);
    aura.addColorStop(0, `rgba(125, 226, 255, ${glowAlpha})`);
    aura.addColorStop(0.45, `rgba(125, 226, 255, ${glowAlpha * 0.4})`);
    aura.addColorStop(1, 'rgba(125, 226, 255, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.9, 0, Math.PI * 2);
    ctx.fill();
  }

  const ringColor = sigilMode === 'engraved'
    ? `rgba(218, 231, 255, ${alphaBase * 0.8})`
    : `rgba(238, 246, 255, ${alphaBase + 0.12})`;

  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Eight-node wheel with radial spokes and center core.
  const nodes = 8;
  for (let i = 0; i < nodes; i += 1) {
    const a = (i / nodes) * Math.PI * 2;
    const nx = Math.cos(a) * radius;
    const ny = Math.sin(a) * radius;
    const nodeR = sigilMode === 'constellation' ? 7 : 9;

    ctx.fillStyle = `rgba(242, 248, 255, ${0.8 + alphaBase * 0.3})`;
    ctx.beginPath();
    ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
    ctx.fill();

    if (i % 2 === 0 || sigilMode === 'beacon') {
      ctx.strokeStyle = `rgba(240, 246, 255, ${0.6 + alphaBase * 0.4})`;
      ctx.lineWidth = sigilMode === 'engraved' ? 2.1 : 2.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(nx, ny);
      ctx.stroke();
    }
  }

  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 1.8);
  core.addColorStop(0, 'rgba(255, 202, 112, 1)');
  core.addColorStop(0.52, 'rgba(255, 143, 44, 0.98)');
  core.addColorStop(1, 'rgba(255, 143, 44, 0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius * 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 142, 40, 0.95)';
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawDestinationAnchor() {
  const target = getDestinationAnchor();
  const tx = target.x;
  const ty = target.y;
  const baseR = 44 + hashByte(block.hash, 45) * 0.3;

  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(laneTilt * 0.8);

  const beacon = ctx.createRadialGradient(0, 0, 0, 0, 0, baseR * 2.4);
  beacon.addColorStop(0, 'rgba(255, 186, 120, 0.48)');
  beacon.addColorStop(0.36, 'rgba(255, 147, 74, 0.18)');
  beacon.addColorStop(1, 'rgba(255, 147, 74, 0)');
  ctx.fillStyle = beacon;
  ctx.beginPath();
  ctx.arc(0, 0, baseR * 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 226, 184, 0.72)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(0, 0, baseR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(161, 224, 255, 0.42)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, baseR * 1.45, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 244, 228, 0.95)';
  ctx.beginPath();
  ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function buildPlanetRainbowPalette(hash, originBody) {
  const shades = [];
  const baseHue = (originBody.hueSeed + hashByte(hash, 285) * 0.35) % 360;
  const satMin = originBody.satMin;
  const satMax = originBody.satMax;
  const lightMin = originBody.lightMin;
  const lightMax = originBody.lightMax;
  const phaseA = hashFloat(hash, 286) * Math.PI * 2;
  const phaseB = hashFloat(hash, 287) * Math.PI * 2;

  for (let i = 0; i < PLANET_RAINBOW_STEPS; i += 1) {
    const t = i / (PLANET_RAINBOW_STEPS - 1);
    const hueWobble = Math.sin(t * Math.PI * 8 + phaseA) * 9;
    const hueDrift = (hashFloat(hash, 288 + (i % 23)) - 0.5) * 16;
    const h = (baseHue + t * 360 + hueWobble + hueDrift + 720) % 360;
    const satWave = 0.5 + Math.sin(t * Math.PI * 3 + phaseB) * 0.5;
    const s = satMin + (satMax - satMin) * satWave;
    const lightPeak = 1 - Math.abs(t - 0.5) * 2;
    const l = lightMin + (lightMax - lightMin) * (0.25 + lightPeak * 0.75);
    shades.push({ h, s, l });
  }
  return shades;
}

function paletteTone(palette, index, satMul = 1, lightMul = 1, alpha = 1) {
  const p = palette[((index % palette.length) + palette.length) % palette.length];
  const s = Math.max(0, Math.min(100, p.s * satMul));
  const l = Math.max(0, Math.min(100, p.l * lightMul));
  return `hsla(${p.h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%, ${alpha})`;
}

function drawOriginBody() {
  const cx = W * 0.36;
  const cy = H + 210;
  const radius = 760;
  const palette = buildPlanetRainbowPalette(block.hash, origin);
  const body = ctx.createRadialGradient(cx - 180, H - 130, 20, cx, cy, radius);
  body.addColorStop(0, paletteTone(palette, 10, 1.05, 1.04, 1));
  body.addColorStop(0.28, paletteTone(palette, 32, 1.08, 0.95, 1));
  body.addColorStop(0.56, paletteTone(palette, 58, 0.96, 0.82, 1));
  body.addColorStop(0.82, paletteTone(palette, 79, 0.9, 0.68, 1));
  body.addColorStop(1, paletteTone(palette, 94, 0.85, 0.46, 1));
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI, 0);
  ctx.closePath();
  ctx.clip();

  // Deterministic 100-shade rainbow latitude wash to push planet variety beyond a narrow triad.
  for (let i = 0; i < PLANET_RAINBOW_STEPS; i += 1) {
    const a0 = Math.PI + (i / PLANET_RAINBOW_STEPS) * Math.PI;
    const a1 = Math.PI + ((i + 1) / PLANET_RAINBOW_STEPS) * Math.PI;
    const jitter = (hashFloat(block.hash, 820 + i) - 0.5) * 0.018;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, a0 + jitter, a1 + jitter);
    ctx.closePath();
    const brightBias = 0.9 + hashFloat(block.hash, 930 + i) * 0.28;
    const alpha = 0.045 + hashFloat(block.hash, 960 + i) * 0.035;
    ctx.fillStyle = paletteTone(palette, i, 1.02, brightBias, alpha);
    ctx.fill();
  }

  // Terminator falloff adds form and avoids a flat half-disk read.
  const terminatorX = cx + (travelDirection === 'OUTBOUND' ? -220 : 220);
  const terminator = ctx.createRadialGradient(terminatorX, H - 80, 40, terminatorX, H - 80, radius * 0.96);
  terminator.addColorStop(0, 'rgba(0, 0, 0, 0)');
  terminator.addColorStop(0.62, 'rgba(0, 0, 0, 0.10)');
  terminator.addColorStop(1, 'rgba(0, 0, 0, 0.34)');
  ctx.fillStyle = terminator;
  ctx.fillRect(cx - radius, H - radius, radius * 2, radius);

  const isRocky = origin.name === 'MOON' || origin.name === 'MARS';
  const isGasLike = origin.name === 'SUBSTRATE' || origin.name === 'EARTH';

  if (isGasLike) {
    // Cloud/band striations for gaseous or atmospheric worlds.
    for (let i = 0; i < 20; i += 1) {
      const offset = ((hashFloat(block.hash, 300 + i) - 0.5) * 42);
      const y = H - 250 + i * 15 + offset;
      const amp = 24 + hashFloat(block.hash, 350 + i) * 34;
      const idx = Math.floor((i / 20) * (palette.length - 1));
      ctx.beginPath();
      ctx.moveTo(cx - radius - 60, y);
      for (let x = cx - radius - 60; x <= cx + radius + 60; x += 34) {
        const wave = Math.sin(x * 0.009 + i * 0.72 + hashFloat(block.hash, 390 + i) * Math.PI * 2) * amp;
        ctx.lineTo(x, y + wave * 0.25);
      }
      ctx.strokeStyle = i % 2 === 0
        ? paletteTone(palette, idx + 6, 0.75, 1.15, 0.14)
        : paletteTone(palette, idx + 43, 1.05, 0.58, 0.17);
      ctx.lineWidth = 8 + (i % 3);
      ctx.stroke();
    }
  }

  if (isRocky) {
    // Crater field for rocky surfaces.
    for (let i = 0; i < 44; i += 1) {
      const a = Math.PI + hashFloat(block.hash, 420 + i) * Math.PI;
      const r = radius * (0.22 + hashFloat(block.hash, 470 + i) * 0.72);
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      const craterR = 8 + hashFloat(block.hash, 510 + i) * 26;
      const tint = Math.floor(hashFloat(block.hash, 540 + i) * (palette.length - 1));

      ctx.fillStyle = paletteTone(palette, tint + 55, 0.72, 0.44, 0.2);
      ctx.beginPath();
      ctx.ellipse(x + craterR * 0.25, y + craterR * 0.2, craterR * 1.02, craterR * 0.76, 0.18, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = paletteTone(palette, tint + 11, 0.6, 1.14, 0.28);
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.ellipse(x - craterR * 0.1, y - craterR * 0.08, craterR * 0.92, craterR * 0.68, -0.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Subtle fracture veins to break up large smooth regions.
    for (let i = 0; i < 10; i += 1) {
      const startA = Math.PI + hashFloat(block.hash, 560 + i) * Math.PI;
      const startR = radius * (0.35 + hashFloat(block.hash, 590 + i) * 0.4);
      const sx = cx + Math.cos(startA) * startR;
      const sy = cy + Math.sin(startA) * startR;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      let px = sx;
      let py = sy;
      for (let j = 0; j < 5; j += 1) {
        const vx = (hashFloat(block.hash, 620 + i * 7 + j) - 0.5) * 60;
        const vy = (hashFloat(block.hash, 670 + i * 7 + j) - 0.5) * 34;
        px += vx;
        py += vy;
        ctx.lineTo(px, py);
      }
      ctx.strokeStyle = paletteTone(palette, 70 + i * 3, 0.7, 0.35, 0.24);
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }

  // Fine grain overlay for all origins so none read as plain geometry.
  for (let i = 0; i < 900; i += 1) {
    const a = Math.PI + hashFloat(block.hash, 710 + i) * Math.PI;
    const r = radius * (hashFloat(block.hash, 730 + i) ** 0.62);
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    const s = i % 6 === 0 ? 2 : 1;
    const grainIdx = Math.floor(hashFloat(block.hash, 760 + i) * (palette.length - 1));
    ctx.fillStyle = i % 3 === 0
      ? paletteTone(palette, grainIdx + 12, 0.65, 1.16, 0.07)
      : paletteTone(palette, grainIdx + 58, 1, 0.3, 0.09);
    ctx.fillRect(x, y, s, s);
  }

  ctx.restore();

  const rimHueA = palette[Math.floor(hashFloat(block.hash, 861) * palette.length)].h;
  const rimHueB = palette[Math.floor(hashFloat(block.hash, 862) * palette.length)].h;
  ctx.strokeStyle = `hsla(${rimHueA.toFixed(1)}, 90%, 74%, 0.24)`;
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 2, Math.PI, 0);
  ctx.stroke();

  ctx.strokeStyle = `hsla(${rimHueB.toFixed(1)}, 92%, 72%, 0.14)`;
  ctx.lineWidth = 44;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 12, Math.PI, 0);
  ctx.stroke();

  drawOriginSignature(cx, cy, radius);
}

function drawOriginSignature(cx, cy, radius) {
  const label = hashByte(block.hash, 62) % 2 === 0 ? 'stay hi' : 'hi';
  const side = heading > 0 ? -1 : 1;
  const poleX = cx + side * (radius * 0.42);
  const poleY = cy - radius * 0.86;

  ctx.save();
  ctx.strokeStyle = 'rgba(214, 227, 255, 0.24)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(poleX, poleY + 20);
  ctx.lineTo(poleX, poleY - 28);
  ctx.stroke();

  const flagW = label === 'stay hi' ? 56 : 26;
  const flagH = 15;
  const fx = poleX + 2;
  const fy = poleY - 28;
  ctx.fillStyle = hiGreenVariant ? 'rgba(14, 36, 18, 0.48)' : 'rgba(10, 18, 28, 0.42)';
  roundRect(fx, fy, flagW, flagH, 3);
  ctx.fill();
  ctx.strokeStyle = hiGreenVariant ? 'rgba(162, 255, 168, 0.36)' : 'rgba(173, 224, 255, 0.26)';
  ctx.stroke();

  ctx.fillStyle = hiGreenVariant ? 'rgba(190, 255, 194, 0.62)' : 'rgba(213, 242, 255, 0.52)';
  ctx.font = '600 9px "JetBrains Mono"';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, fx + 6, fy + flagH * 0.5 + 0.5);
  ctx.restore();
}

function drawDust() {
  ctx.save();
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 180; i += 1) {
    const x = (hashFloat(block.hash, 24 + i) + i * 0.067) % 1 * W;
    const y = H * (0.22 + ((hashFloat(block.hash, 10 + i) + i * 0.041) % 1) * 0.5);
    const width = 8 + ((i * 13) % 36);
    const height = 1.2 + ((i * 7) % 5);
    ctx.fillStyle = i % 6 === 0 ? 'rgba(255, 192, 108, 0.15)' : 'rgba(184, 205, 255, 0.08)';
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, -0.34, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawVessel() {
  const anchorX = heading > 0 ? W * 0.62 : W * 0.78;
  const anchorY = H * (0.75 + hashFloat(block.hash, 46) * 0.06);
  const bodyW = vesselClass.bodyWidth;
  const bodyH = vesselClass.bodyHeight;
  const bodyX = anchorX - bodyW / 2;
  const bodyY = anchorY - bodyH;
  const angle = heading > 0 ? -0.26 - motionStrength * 0.12 : 0.16 + motionStrength * 0.12;
  const baseHue = hashByte(block.hash, 30);
  const isBlackOps = hashByte(block.hash, 31) % 5 === 0;
  const isWeathered = hashByte(block.hash, 32) % 3 === 0;
  const hullBase = isBlackOps
    ? '#171b24'
    : `hsl(${(baseHue * 360) / 255}, ${isWeathered ? 9 : 16}%, ${isWeathered ? 42 : 62}%)`;
  const hullShadow = isBlackOps
    ? '#080b12'
    : `hsl(${(baseHue * 360) / 255}, ${isWeathered ? 7 : 12}%, ${isWeathered ? 16 : 34}%)`;
  const accent = `hsl(${(baseHue + 70) % 360}, 88%, 66%)`;

  ctx.save();
  ctx.translate(anchorX, anchorY);
  ctx.rotate(angle);
  ctx.translate(-anchorX, -anchorY);

  const bodyGrad = ctx.createLinearGradient(bodyX, bodyY, bodyX + bodyW, bodyY);
  bodyGrad.addColorStop(0, hullShadow);
  bodyGrad.addColorStop(0.42, hullBase);
  bodyGrad.addColorStop(0.52, isBlackOps ? '#4d5563' : '#eef4ff');
  bodyGrad.addColorStop(0.62, hullBase);
  bodyGrad.addColorStop(1, hullShadow);
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(bodyX, bodyY + 96, bodyW, bodyH - 96);

  ctx.beginPath();
  if (vesselClass.noseStyle === 'sharp') {
    ctx.moveTo(bodyX, bodyY + 96);
    ctx.lineTo(anchorX, bodyY - 76);
    ctx.lineTo(bodyX + bodyW, bodyY + 96);
  } else if (vesselClass.noseStyle === 'capsule') {
    ctx.moveTo(bodyX, bodyY + 96);
    ctx.quadraticCurveTo(anchorX, bodyY - 88, bodyX + bodyW, bodyY + 96);
  } else if (vesselClass.noseStyle === 'blunt') {
    ctx.moveTo(bodyX, bodyY + 96);
    ctx.quadraticCurveTo(anchorX, bodyY + 8, bodyX + bodyW, bodyY + 96);
  } else if (vesselClass.noseStyle === 'spike') {
    ctx.moveTo(bodyX, bodyY + 96);
    ctx.lineTo(anchorX, bodyY - 118);
    ctx.lineTo(bodyX + bodyW, bodyY + 96);
  } else {
    ctx.moveTo(bodyX, bodyY + 96);
    ctx.quadraticCurveTo(anchorX, bodyY - 34, bodyX + bodyW, bodyY + 96);
  }
  ctx.closePath();
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  ctx.strokeStyle = isBlackOps ? 'rgba(120,130,150,0.5)' : 'rgba(140,155,176,0.75)';
  ctx.lineWidth = 1;
  ctx.stroke();

  for (let stage = 1; stage < stages; stage += 1) {
    const stageY = bodyY + 96 + ((bodyH - 96) / stages) * stage;
    ctx.strokeStyle = 'rgba(0,0,0,0.34)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bodyX, stageY);
    ctx.lineTo(bodyX + bodyW, stageY);
    ctx.stroke();
  }

  if (vesselClass.finSpan) {
    const finY = bodyY + 132;
    const finDepth = 42;
    const finWidth = vesselClass.finSpan;
    ctx.fillStyle = isBlackOps ? '#252a34' : '#b8c2d2';
    ctx.beginPath();
    ctx.moveTo(bodyX, finY);
    ctx.lineTo(bodyX - finWidth, finY + finDepth);
    ctx.lineTo(bodyX, finY + 22);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bodyX + bodyW, finY);
    ctx.lineTo(bodyX + bodyW + finWidth, finY + finDepth);
    ctx.lineTo(bodyX + bodyW, finY + 22);
    ctx.closePath();
    ctx.fill();
  }

  const patchX = anchorX + bodyW * 0.08;
  const patchY = bodyY + 210;
  ctx.beginPath();
  ctx.arc(patchX, patchY, 34, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10, 14, 22, 0.86)';
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  const sides = 3 + (hashByte(block.hash, 33) % 6);
  ctx.beginPath();
  for (let i = 0; i < sides; i += 1) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const x = patchX + Math.cos(a) * 18;
    const y = patchY + Math.sin(a) * 18;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 11px "JetBrains Mono"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(fleet.slice(0, 1), patchX, patchY + 1);

  ctx.save();
  ctx.translate(bodyX + 22, bodyY + 360);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = accent;
  ctx.font = '700 20px "Space Grotesk"';
  ctx.fillText('NATSHIPS', 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(bodyX + bodyW - 12, bodyY + 410);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = 'rgba(245, 248, 255, 0.72)';
  ctx.font = '600 14px "JetBrains Mono"';
  ctx.fillText(callSign, 0, 0);
  ctx.restore();

  drawHullMakerStamp(bodyX + bodyW * 0.68, bodyY + bodyH * 0.68, accent);

  const nozzlesToShow = Math.min(engineCount, 9);
  const nozzleGap = Math.min(18, (bodyW - 18) / nozzlesToShow);
  for (let i = 0; i < nozzlesToShow; i += 1) {
    const nozzleX = anchorX - ((nozzlesToShow - 1) * nozzleGap) / 2 + i * nozzleGap;
    const nozzleY = anchorY;
    ctx.fillStyle = '#090b10';
    ctx.beginPath();
    ctx.ellipse(nozzleX, nozzleY, nozzleGap * 0.48, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const activeBurn = status === 'IN-FLIGHT' || ['LAUNCH', 'ASCENT', 'TRANSIT', 'GATE CROSSING'].includes(missionPhase);
  if (activeBurn) {
    const flameSpread = 54 + (engineCount > 9 ? 20 : 0);
    const plumeTailX = anchorX - heading * (66 + motionStrength * 58);
    const plumeTailY = anchorY + 130 + motionStrength * 80;
    const plume = ctx.createRadialGradient(anchorX, anchorY + 10, 10, plumeTailX, plumeTailY, 220);
    plume.addColorStop(0, 'rgba(255, 248, 210, 0.95)');
    plume.addColorStop(0.3, 'rgba(255, 174, 88, 0.72)');
    plume.addColorStop(0.62, 'rgba(255, 92, 44, 0.26)');
    plume.addColorStop(1, 'rgba(255, 92, 44, 0)');
    ctx.fillStyle = plume;
    ctx.beginPath();
    ctx.ellipse((anchorX + plumeTailX) * 0.5, (anchorY + plumeTailY) * 0.5, flameSpread, 198 + motionStrength * 60, heading > 0 ? 0.66 : -0.66, 0, Math.PI * 2);
    ctx.fill();

    const core = ctx.createRadialGradient(anchorX, anchorY + 18, 4, anchorX, anchorY + 64, 62);
    core.addColorStop(0, '#ffffff');
    core.addColorStop(0.44, 'rgba(255, 231, 165, 0.95)');
    core.addColorStop(1, 'rgba(255, 150, 48, 0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.ellipse(anchorX, anchorY + 44, 28, 68, 0, 0, Math.PI * 2);
    ctx.fill();

    // Turbulent wake filaments add more kinetic read without animation.
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 34; i += 1) {
      const jitter = (hashFloat(block.hash, 900 + i) - 0.5) * 42;
      const wx = anchorX - heading * (24 + i * 8 + motionStrength * 26) + jitter * 0.35;
      const wy = anchorY + 38 + i * 6 + jitter * 0.22;
      const len = 14 + motionStrength * 34 + (i % 4) * 3;
      ctx.strokeStyle = i % 5 === 0
        ? 'rgba(255, 214, 148, 0.34)'
        : 'rgba(151, 224, 255, 0.22)';
      ctx.lineWidth = i % 6 === 0 ? 2.1 : 1.2;
      ctx.beginPath();
      ctx.moveTo(wx - heading * len * 0.5, wy);
      ctx.lineTo(wx + heading * len * 0.4, wy - 10);
      ctx.stroke();
    }
    ctx.restore();
  }

  const scorch = ctx.createLinearGradient(0, anchorY - 150, 0, anchorY + 20);
  scorch.addColorStop(0, 'rgba(0,0,0,0)');
  scorch.addColorStop(1, `rgba(0,0,0,${0.22 + Math.min(flightCount / 24, 1) * 0.38})`);
  ctx.fillStyle = scorch;
  ctx.fillRect(bodyX, anchorY - 150, bodyW, 150);

  ctx.restore();
}

function drawForegroundParallax() {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const passes = 68;
  for (let i = 0; i < passes; i += 1) {
    const seed = hashFloat(block.hash, 160 + i);
    const x = ((seed + i * 0.047) % 1) * W;
    const y = H * (0.08 + ((hashFloat(block.hash, 220 + i) + i * 0.033) % 1) * 0.84);
    const len = 18 + motionStrength * 52 + (i % 7) * 3;

    ctx.strokeStyle = i % 6 === 0
      ? `rgba(255, 186, 132, ${0.11 + motionStrength * 0.08})`
      : `rgba(198, 224, 255, ${0.09 + motionStrength * 0.07})`;
    ctx.lineWidth = i % 9 === 0 ? 2.2 : 1.2;
    ctx.beginPath();
    ctx.moveTo(x - heading * len * 0.55, y + laneTilt * 14);
    ctx.lineTo(x + heading * len * 0.45, y - laneTilt * 10);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHullMakerStamp(x, y, accent) {
  const plateW = 42;
  const plateH = 20;
  const px = x - plateW * 0.5;
  const py = y - plateH * 0.5;

  ctx.save();
  const plateGrad = ctx.createLinearGradient(px, py, px + plateW, py + plateH);
  if (hiGreenVariant) {
    plateGrad.addColorStop(0, 'rgba(10, 24, 14, 0.9)');
    plateGrad.addColorStop(1, 'rgba(18, 42, 22, 0.88)');
  } else {
    plateGrad.addColorStop(0, 'rgba(14, 20, 33, 0.9)');
    plateGrad.addColorStop(1, 'rgba(9, 14, 24, 0.86)');
  }
  ctx.fillStyle = plateGrad;
  ctx.strokeStyle = 'rgba(235, 242, 255, 0.46)';
  ctx.lineWidth = 0.8;
  roundRect(px, py, plateW, plateH, 4);
  ctx.fill();
  ctx.stroke();

  // Distress texture so the mark reads as an engraved/stamped artifact.
  for (let i = 0; i < 18; i += 1) {
    const tx = px + 2 + ((hashByte(block.hash, 800 + i) / 255) * (plateW - 4));
    const ty = py + 2 + ((hashByte(block.hash, 830 + i) / 255) * (plateH - 4));
    ctx.fillStyle = hiGreenVariant ? 'rgba(178, 255, 190, 0.1)' : 'rgba(212, 226, 246, 0.1)';
    ctx.fillRect(tx, ty, 1, 1);
  }

  // Keep this as a subtle hardware maker plate; hi signature lives only on the world flag.
  ctx.strokeStyle = hiGreenVariant
    ? 'rgba(154, 255, 166, 0.72)'
    : accent.replace('hsl', 'hsla').replace(')', ', 0.72)');
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px + 10, py + plateH * 0.5);
  ctx.lineTo(px + plateW - 10, py + plateH * 0.5);
  ctx.stroke();

  ctx.fillStyle = 'rgba(215, 225, 245, 0.8)';
  ctx.beginPath();
  ctx.arc(px + 6, y, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(px + plateW - 6, y, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawLightBloom() {
  const sunX = W * 0.18;
  const sunY = H * 0.16;
  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 240);
  glow.addColorStop(0, 'rgba(255, 210, 150, 0.55)');
  glow.addColorStop(0.35, 'rgba(255, 180, 124, 0.18)');
  glow.addColorStop(1, 'rgba(255, 180, 124, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 240, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 222, 174, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sunX - 10, sunY + 22);
  ctx.lineTo(W * 0.84, H * 0.78);
  ctx.stroke();
  ctx.restore();
}

function drawAnalogAtmosphere() {
  // Warm film-like leak for nostalgic tone without covering the detail.
  const leakA = ctx.createRadialGradient(W * 0.04, H * 0.88, 20, W * 0.04, H * 0.88, 360);
  leakA.addColorStop(0, 'rgba(255, 167, 82, 0.22)');
  leakA.addColorStop(0.45, 'rgba(255, 122, 62, 0.11)');
  leakA.addColorStop(1, 'rgba(255, 122, 62, 0)');
  ctx.fillStyle = leakA;
  ctx.fillRect(0, 0, W, H);

  const leakB = ctx.createRadialGradient(W * 0.96, H * 0.14, 10, W * 0.96, H * 0.14, 260);
  leakB.addColorStop(0, 'rgba(129, 227, 255, 0.16)');
  leakB.addColorStop(0.52, 'rgba(129, 227, 255, 0.08)');
  leakB.addColorStop(1, 'rgba(129, 227, 255, 0)');
  ctx.fillStyle = leakB;
  ctx.fillRect(0, 0, W, H);

  const vignette = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.34, W * 0.5, H * 0.5, H * 0.88);
  vignette.addColorStop(0.68, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(1, 2, 7, 0.46)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function drawFilmGrain() {
  ctx.save();
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 3200; i += 1) {
    const x = (hashFloat(block.hash, 50 + i) + i * 0.0073) % 1 * W;
    const y = (hashFloat(block.hash, 90 + i) + i * 0.0051) % 1 * H;
    const s = i % 4 === 0 ? 2 : 1;
    const c = i % 6 === 0 ? 228 : 205;
    const a = i % 8 === 0 ? 0.18 : 0.1;
    ctx.fillStyle = `rgba(${c}, ${c}, ${c}, ${a})`;
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

function drawHashStamp() {
  ctx.save();
  ctx.fillStyle = 'rgba(232, 238, 252, 0.72)';
  ctx.font = '500 15px "JetBrains Mono"';
  ctx.textAlign = 'left';
  ctx.fillText(block.hash.slice(0, 12).toUpperCase(), 56, H - 54);
  ctx.fillStyle = 'rgba(128, 229, 255, 0.78)';
  ctx.font = '500 14px "JetBrains Mono"';
  ctx.fillText(`BLK ${block.height.toLocaleString()} · ${block.miner.toUpperCase()}`, 56, H - 78);
  ctx.fillStyle = 'rgba(255, 196, 140, 0.84)';
  ctx.font = '500 13px "JetBrains Mono"';
  ctx.fillText(`${travelDirection} · ${missionPhase} · ${destination}`, 56, H - 30);
  ctx.restore();
}

function drawAstralOverlay() {
  const sigil = getSigilAnchor();
  const target = getDestinationAnchor();
  const originPoint = { x: W * 0.34, y: H * 0.9 };

  ctx.save();
  ctx.font = '600 14px "JetBrains Mono"';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  // Lyrical route saying for emotional entry point.
  const phraseW = Math.min(620, ctx.measureText(navigationSaying).width + 38);
  const phraseX = 56;
  const phraseY = 64;
  ctx.fillStyle = 'rgba(4, 8, 18, 0.82)';
  roundRect(phraseX, phraseY, phraseW, 34, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(128, 229, 255, 0.58)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(225, 244, 255, 0.98)';
  ctx.fillText(navigationSaying, phraseX + 16, phraseY + 17);

  // Astrological-style nav coordinates.
  const coordLabel = `CELESTIAL COORDINATES · AZ ${astralDegree.toFixed(1)}° · DEC ${declination.toFixed(1)}° · ${travelDirection}`;
  const coordW = Math.min(620, ctx.measureText(coordLabel).width + 38);
  const coordX = W - coordW - 56;
  const coordY = 64;
  ctx.fillStyle = 'rgba(9, 12, 24, 0.82)';
  roundRect(coordX, coordY, coordW, 34, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 185, 132, 0.56)';
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 228, 198, 0.98)';
  ctx.fillText(coordLabel, coordX + 16, coordY + 17);

  drawCallout(sigilTitle, sigil.x, sigil.y, sigil.x + (heading > 0 ? -150 : 34), sigil.y - 66, 'rgba(180, 228, 255, 0.94)');
  drawCallout(destinationTitle, target.x, target.y, target.x + (heading > 0 ? -190 : 26), target.y - 46, 'rgba(255, 195, 148, 0.96)');
  drawCallout(`WORLD BELOW · ${origin.name} · ${originZodiac}`, originPoint.x, originPoint.y, originPoint.x - 160, originPoint.y - 82, 'rgba(194, 212, 255, 0.9)');

  // Large creative inscription tied to the origin sphere.
  const sphereLabelX = 56;
  const sphereLabelY = H - 188;
  const sphereLabel = `${originGlyph}  ${origin.name} · ${originZodiac}`;
  ctx.font = '700 24px "Space Grotesk"';
  const sphereW = Math.min(620, ctx.measureText(sphereLabel).width + 52);
  ctx.fillStyle = 'rgba(5, 9, 18, 0.84)';
  roundRect(sphereLabelX, sphereLabelY, sphereW, 52, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(162, 214, 255, 0.62)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = 'rgba(235, 247, 255, 0.98)';
  ctx.fillText(sphereLabel, sphereLabelX + 16, sphereLabelY + 27);

  const noteY = sphereLabelY + 66;
  const note = `WHAT THE SHIP SEES: ${flyoverNote.toUpperCase()}`;
  ctx.font = '700 18px "Space Grotesk"';
  const noteW = Math.min(W - 112, ctx.measureText(note).width + 34);
  ctx.fillStyle = 'rgba(18, 26, 10, 0.9)';
  roundRect(sphereLabelX, noteY, noteW, 40, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(201, 255, 110, 0.82)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowColor = 'rgba(186, 255, 116, 0.55)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = 'rgba(228, 255, 165, 0.99)';
  ctx.fillText(note, sphereLabelX + 12, noteY + 20);
  ctx.shadowBlur = 3;

  const timeY = noteY + 40;
  const timeText = `CELESTIAL TIME ${celestialTime}`;
  ctx.font = '600 14px "JetBrains Mono"';
  const timeW = Math.min(420, ctx.measureText(timeText).width + 30);
  ctx.fillStyle = 'rgba(8, 11, 20, 0.8)';
  roundRect(sphereLabelX, timeY, timeW, 30, 7);
  ctx.fill();
  ctx.strokeStyle = 'rgba(146, 224, 255, 0.5)';
  ctx.stroke();
  ctx.fillStyle = 'rgba(198, 241, 255, 0.98)';
  ctx.fillText(timeText, sphereLabelX + 11, timeY + 15);

  const omenY = timeY + 34;
  const omenText = 'SEEK THE NEXT COORDINATE';
  ctx.font = '700 12px "JetBrains Mono"';
  const omenW = Math.min(360, ctx.measureText(omenText).width + 26);
  ctx.fillStyle = 'rgba(12, 12, 22, 0.74)';
  roundRect(sphereLabelX, omenY, omenW, 24, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(188, 168, 255, 0.52)';
  ctx.stroke();
  ctx.fillStyle = 'rgba(217, 202, 255, 0.94)';
  ctx.fillText(omenText, sphereLabelX + 9, omenY + 12);

  ctx.restore();
}

function drawCallout(label, anchorX, anchorY, labelX, labelY, color) {
  const textW = Math.min(300, ctx.measureText(label).width + 22);
  const boxH = 24;
  const margin = 20;
  const safeX = Math.max(margin, Math.min(labelX, W - textW - margin));
  const safeY = Math.max(48, Math.min(labelY, H - boxH - 48));

  ctx.strokeStyle = color.replace('0.94', '0.62').replace('0.96', '0.62').replace('0.9', '0.62');
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(anchorX, anchorY);
  ctx.lineTo(safeX + (safeX < anchorX ? textW : 0), safeY + boxH * 0.5);
  ctx.stroke();

  const boxX = safeX;
  const boxY = safeY;
  ctx.fillStyle = 'rgba(5, 9, 18, 0.84)';
  roundRect(boxX, boxY, textW, boxH, 6);
  ctx.fill();
  ctx.strokeStyle = color.replace('0.94', '0.62').replace('0.96', '0.62').replace('0.9', '0.62');
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fillText(label, boxX + 11, boxY + boxH * 0.5 + 0.5);
}

function fillMeta() {
  const meta = document.getElementById('meta');
  if (!meta) return;

  const emphasisKeys = new Set(['Origin zodiac', 'Flyover note', 'Celestial time']);

  const items = [
    ['Block height', block.height.toLocaleString()],
    ['Hash prefix', block.hash.slice(0, 16).toUpperCase()],
    ['Vessel', `${vesselClass.name} · ${callSign}`],
    ['Fleet', fleet],
    ['Status', status],
    ['Origin body', origin.name],
    ['Propulsion', `${propulsion} · ${fuel}`],
    ['Engines', `${engineCount} total`],
    ['Stages', `${stages}`],
    ['Flight count', `${flightCount} of 24`],
    ['Orbit class', orbitClass],
    ['Payload mass', `${payloadKg.toLocaleString()} kg`],
    ['Delta-v envelope', `${dvMs.toLocaleString()} m/s`],
    ['Nebula family', nebulaFamily],
    ['Star palette', starPalette],
    ['Sigil style', sigilTitle],
    ['Sigil intensity', sigilIntensity.toFixed(2)],
    ['Voyage direction', travelDirection],
    ['Journey phase', missionPhase],
    ['Destination marker', destinationTitle],
    ['Motion index', motionStrength.toFixed(2)],
    ['Sky whisper', navigationSaying],
    ['Celestial coordinates', `AZ ${astralDegree.toFixed(1)}° · DEC ${declination.toFixed(1)}°`],
    ['World sign', `${originGlyph} ${originZodiac}`],
    ['What the ship sees', flyoverNote],
    ['Celestial time', celestialTime],
    ['Hi mark rarity', hiGreenVariant ? 'GREEN / 1,000 OF 10,080' : 'STANDARD'],
    ['Launch date', discoveryDate],
  ];

  meta.innerHTML = items.map(([key, value]) => (
    `<div class="meta-card${emphasisKeys.has(key) ? ' meta-card-emphasis' : ''}"><div class="k">${key}</div><div class="v">${value}</div></div>`
  )).join('');
}