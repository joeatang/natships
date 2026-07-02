// UNATOMS · promo cards
// 20 concepts, each producing a 1080x1080 layout inside root.
// window.CARDS = { name: fn(root) }
// Every card is self-contained HTML. Renderer: window.UNATOM (SCHEMES, fromBlock, svg).

const U = () => window.UNATOM;

// ---------- helpers ----------
function watermark() {
  return `<div style="position:absolute;right:36px;bottom:30px;
    font:600 15px/1 ui-monospace,SF Mono,Menlo,monospace;
    letter-spacing:.24em;text-transform:uppercase;color:var(--muted);
    display:flex;align-items:center;gap:10px;">
    <span style="color:var(--orange)">\u25c9</span> UNATOM \u00b7 unatom.fun
  </div>`;
}

function watermarkLight() {
  return `<div style="position:absolute;right:36px;bottom:30px;
    font:600 15px/1 ui-monospace,SF Mono,Menlo,monospace;
    letter-spacing:.24em;text-transform:uppercase;color:rgba(10,10,12,.55);
    display:flex;align-items:center;gap:10px;">
    <span style="color:#f0962d">\u25c9</span> UNATOM \u00b7 unatom.fun
  </div>`;
}

function unatomBox(opts, w = 300, h = 300, style = '') {
  const svg = U().svg(Object.assign({ showBlock: false, showSymbol: true }, opts));
  return `<div style="width:${w}px;height:${h}px;${style}">
    <div style="width:100%;height:100%">${svg}</div>
  </div>`;
}

// Compact SVG element with locked aspect so the UNATOM tile fills box.
function unatomInline(opts, size = 260) {
  const svg = U().svg(Object.assign({ showBlock: false }, opts));
  return `<div style="width:${size}px;height:${size}px;overflow:hidden;">
    <div style="width:100%;height:100%">${svg.replace('<svg ', '<svg style="width:100%;height:100%;display:block" ')}</div>
  </div>`;
}

// Draw a single UNATOM cropped to its subject tile (VB=1024, TILE at x:152..872 y:92..812)
// The engraved-tile is centered ~ (512, 452). We scale via CSS transform on the outer svg.
function unatomTile(opts, size = 300) {
  const svg = U().svg(Object.assign({ showBlock: false }, opts));
  return `<div style="width:${size}px;height:${size}px;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0">${svg.replace('<svg ', '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block" ')}</div>
  </div>`;
}

// Common palette-safe font stacks — NO quoted family names (breaks inline style attrs).
const F_SANS  = 'ui-sans-serif,system-ui,-apple-system,Helvetica,Arial,sans-serif';
const F_MONO  = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
const F_SERIF = 'Palatino,Georgia,Cambria,serif';

// Shared archetype library (compact set — 15 named beings)
const ARCHETYPES = [
  { name:'ROOKIE',      sub:'freshly discovered', opts:{ sym:'Ne', scheme:'bone', thirdEye:'open',   mood:'rookie',    mouthKind:'sleepSmile', drip:'seedDrip' } },
  { name:'ORACLE',      sub:'speaks in patterns',  opts:{ sym:'Mt', scheme:'obsidian', thirdEye:'oracle', mood:'ancient', mouthKind:'noMouth', drip:'crystalDrip', swagKind:'haloNode' } },
  { name:'MINER',       sub:'still works the seam',opts:{ sym:'Tx', scheme:'bronze', thirdEye:'burn', border:'stitched', mood:'suspicious', mouthKind:'minerFang', drip:'burnDrip', brows:'furrowed', swagKind:'stitchMark' } },
  { name:'SLEEPWALKER', sub:'dreaming in-block',   opts:{ sym:'Dy', scheme:'frost', thirdEye:'closedEye', mood:'sleepy', mouthKind:'sleepSmile', drip:'tinyDrip', swagKind:'crownDot' } },
  { name:'VOID KID',    sub:'dark matter mascot',  opts:{ sym:'Ws', scheme:'void', thirdEye:'void', mood:'ancient', mouthKind:'voidHole', drip:'purpleDrip', brows:'speck', swagKind:'voidPatch' } },
  { name:'DIAMOND',     sub:'quiet flex',          opts:{ sym:'Hs', scheme:'bone', thirdEye:'diamond', mood:'lockedIn', mouthKind:'nullLine', drip:'seedDrip', swagKind:'diamondStud' } },
  { name:'MISPRINT',    sub:'lovable mistake',     opts:{ sym:'Ce', scheme:'graphite', thirdEye:'sealed', border:'offset', mood:'glitch', mouthKind:'zip', drip:'offCenterDrip', swagKind:'pixelScar' } },
  { name:'SEALED ONE',  sub:'older than you',      opts:{ sym:'Sq', scheme:'ash', thirdEye:'sealed', border:'sealed', mood:'closed', mouthKind:'noMouth', drip:'noDrip', brows:'arch', swagKind:'sealStamp' } },
  { name:'BURNED ONE',  sub:'proof-of-burn',       opts:{ sym:'Bf', scheme:'ember', thirdEye:'burn', border:'burntEdge', mood:'lockedIn', mouthKind:'minerFang', drip:'burnDrip', swagKind:'burnMark' } },
  { name:'SMIRK',       sub:'community avatar',    opts:{ sym:'Vn', scheme:'graphite', thirdEye:'halo', mood:'sideEye', mouthKind:'smirk', drip:'cyanDrip', swagKind:'diamondStud' } },
  { name:'BLOCK RUNNER',sub:'two moves out',   opts:{ sym:'Ht', scheme:'chalk', thirdEye:'open', mood:'soft', mouthKind:'nullLine', drip:'seedDrip', brows:'flat', glasses:'regular', swagKind:'ordinalTag' } },
  { name:'MEMEMOSES',   sub:'sees it before you',  opts:{ sym:'Hs', scheme:'graphite', thirdEye:'crosshair', mood:'sideEye', mouthKind:'smirk', drip:'cyanDrip', brows:'single', glasses:'memeMose', swagKind:'diamondStud' } },
  { name:'FIRE KEEPER', sub:'carries the spark',   opts:{ sym:'Bf', scheme:'ember', thirdEye:'burn', border:'burntEdge', mood:'lockedIn', mouthKind:'sealedSlit', drip:'burnDrip', nature:'fire', swagKind:'burnMark' } },
  { name:'TIDE',        sub:'born in deep teal',   opts:{ sym:'Va', scheme:'aqua', thirdEye:'aperture', mood:'curious', mouthKind:'signalSmile', drip:'longWick', nature:'water', swagKind:'orbitDot' } },
  { name:'COLD STORAGE',sub:'lost the keys',       opts:{ sym:'Dy', scheme:'frost', thirdEye:'frost', mood:'sleepy', mouthKind:'sleepSmile', drip:'tinyDrip', nature:'ice', glasses:'halfFrame', swagKind:'diamondStud' } },
];

// Fake but realistic block header hex (visual only)
function fakeHash(seed) {
  const chars = '0123456789abcdef';
  let s = seed || (Date.now().toString(16));
  let out = '000000000000';
  for (let i = 0; i < 52; i++) out += chars[Math.abs((s.charCodeAt(i % s.length) + i * 31) % 16)];
  return out.slice(0, 64);
}

// A DMT (N,N-dimethyltryptamine) skeletal SVG — clean line-art, hand-simplified.
// Positioned to sit ~360x360 within its container.
function dmtSvg() {
  const s = 'stroke:#f3eee3;stroke-width:5;fill:none;stroke-linecap:round';
  const label = 'fill:#f3eee3;font:700 30px ui-monospace,SF Mono,Menlo,monospace';
  const N     = 'fill:#f9bc4f;font:800 34px ui-monospace,SF Mono,Menlo,monospace';
  return `<svg viewBox="0 0 400 360" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
    <!-- benzene (left ring) -->
    <polygon points="80,110 45,170 80,230 150,230 185,170 150,110" style="${s}" />
    <line x1="88" y1="122" x2="88" y2="218" style="${s}" />
    <line x1="145" y1="122" x2="145" y2="218" style="${s}" />
    <!-- pyrrole (right, fused) -->
    <polygon points="150,110 185,170 150,230 220,250 240,170 220,90" style="${s}" />
    <line x1="215" y1="105" x2="215" y2="235" style="${s}" />
    <text x="238" y="180" style="${N}">N</text>
    <text x="240" y="210" style="${label}">H</text>
    <!-- ethyl chain -->
    <line x1="240" y1="170" x2="288" y2="140" style="${s}" />
    <line x1="288" y1="140" x2="330" y2="170" style="${s}" />
    <!-- terminal N(CH3)2 -->
    <text x="330" y="180" style="${N}">N</text>
    <line x1="355" y1="164" x2="380" y2="140" style="${s}" />
    <text x="378" y="138" style="${label}">CH\u2083</text>
    <line x1="345" y1="185" x2="368" y2="220" style="${s}" />
    <text x="365" y="240" style="${label}">CH\u2083</text>
  </svg>`;
}

// ============================================================================
// CARDS
// ============================================================================
const CARDS = {};

// ---------------- 01 · PERIODIC HERD ----------------------------------------
CARDS['01_periodic_herd'] = (root) => {
  const cells = ARCHETYPES.slice(0, 15).map((a, i) => {
    const n = String(i + 1).padStart(2, '0');
    const sym = a.opts.sym;
    return `<div style="border:1.5px solid var(--line);border-radius:14px;padding:10px 10px 8px;
      display:flex;flex-direction:column;align-items:center;background:rgba(255,255,255,.015);">
      <div style="width:100%;display:flex;justify-content:space-between;
        font:700 11px ${F_MONO};color:var(--muted);letter-spacing:.14em">
        <span>${n}</span><span>UNATOM</span>
      </div>
      ${unatomTile(a.opts, 148)}
      <div style="font:800 22px ${F_MONO};color:var(--orange);margin-top:2px">${sym}</div>
      <div style="font:600 10px ${F_MONO};letter-spacing:.14em;text-transform:uppercase;color:var(--ink);opacity:.85">${a.name}</div>
      <div style="font:400 10px ${F_SERIF};color:var(--muted);margin-top:2px;text-align:center;line-height:1.15">${a.sub}</div>
    </div>`;
  }).join('');

  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:56px 60px 90px;display:flex;flex-direction:column;">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:22px">
        <div>
          <div style="font:800 60px/0.95 ${F_SANS};letter-spacing:-.02em">THE PERIODIC HERD</div>
          <div style="font:500 20px/1.2 ${F_SERIF};color:var(--muted);margin-top:8px;max-width:640px">
            fifteen named beings. ten thousand and sixty-five still waiting inside their blocks.
          </div>
        </div>
        <div style="text-align:right;font:700 14px ${F_MONO};letter-spacing:.2em;color:var(--warm)">
          SERIES 0<br/><span style="color:var(--muted)">10,080 UNATOMS</span>
        </div>
      </div>
      <div style="flex:1;display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(3,1fr);gap:14px">
        ${cells}
      </div>
    </div>
    ${watermark()}`;
};

// ---------------- 02 · SEED → SPROUT ----------------------------------------
CARDS['02_seed_sprout'] = (root) => {
  const blk = 103481;                       // the "beast" block (fun pick)
  const t   = U().fromBlock(blk);
  const hash = fakeHash('seed_sprout_' + blk);
  const hashPretty = hash.match(/.{1,16}/g).join('\n');

  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:60px;display:flex;flex-direction:column;">
      <div style="font:800 54px/0.95 ${F_SANS};letter-spacing:-.02em">SEED \u2192 SPROUT</div>
      <div style="font:500 20px/1.2 ${F_SERIF};color:var(--muted);margin:10px 0 30px;max-width:820px">
        real bitcoin block \u2192 deterministic seed \u2192 one living UNATOM. every time. no wallet, no mint.
      </div>
      <div style="flex:1;display:grid;grid-template-columns:1fr 60px 1fr;align-items:center;gap:22px;">
        <!-- left: hash -->
        <div style="border:1.5px solid var(--line);border-radius:22px;padding:26px 24px;background:rgba(255,255,255,.02)">
          <div style="font:700 12px ${F_MONO};letter-spacing:.22em;text-transform:uppercase;color:var(--muted)">block #${blk.toLocaleString()} \u00b7 header</div>
          <pre style="white-space:pre;font:700 22px/1.35 ${F_MONO};color:var(--warm);margin:16px 0 0;letter-spacing:.02em">${hashPretty}</pre>
          <div style="margin-top:22px;display:flex;flex-wrap:wrap;gap:6px;font:600 11px ${F_MONO};color:var(--muted);letter-spacing:.14em">
            <span style="border:1px solid var(--line);padding:5px 9px;border-radius:6px">SHA-256</span>
            <span style="border:1px solid var(--line);padding:5px 9px;border-radius:6px">HEIGHT</span>
            <span style="border:1px solid var(--line);padding:5px 9px;border-radius:6px">TIMESTAMP</span>
          </div>
        </div>
        <!-- arrow -->
        <div style="text-align:center;font:900 60px ${F_MONO};color:var(--orange)">\u2192</div>
        <!-- right: unatom -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          ${unatomTile(t, 460)}
          <div style="font:800 18px ${F_MONO};letter-spacing:.16em;color:var(--ink)">UNATOM \u00b7 ${t.sym}</div>
          <div style="font:500 14px ${F_SERIF};color:var(--muted)">deterministic. same block = same friend.</div>
        </div>
      </div>
    </div>
    ${watermark()}`;
};

// ---------------- 03 · TWO CHAINS -------------------------------------------
CARDS['03_two_chains'] = (root) => {
  const t = U().fromBlock(9558);
  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:60px;display:flex;flex-direction:column;">
      <div style="font:800 60px/0.95 ${F_SANS};letter-spacing:-.02em">TWO CHAINS</div>
      <div style="font:500 22px/1.25 ${F_SERIF};color:var(--muted);margin:14px 0 20px;max-width:900px">
        one is a molecule. the other is a moment. both self-assemble from something smaller.
      </div>

      <div style="flex:1;display:grid;grid-template-rows:1fr 1fr;gap:24px">
        <!-- molecule -->
        <div style="display:grid;grid-template-columns:200px 1fr;gap:24px;align-items:center;border:1.5px solid var(--line);border-radius:22px;padding:24px 28px;background:rgba(255,255,255,.02)">
          <div style="height:190px">${dmtSvg()}</div>
          <div>
            <div style="font:700 14px ${F_MONO};letter-spacing:.22em;text-transform:uppercase;color:var(--pink)">MOLECULE</div>
            <div style="font:800 36px/1.1 ${F_SANS};letter-spacing:-.01em;margin-top:6px">N,N-DIMETHYLTRYPTAMINE</div>
            <div style="font:500 18px/1.35 ${F_SERIF};color:var(--muted);margin-top:8px">C\u2081\u2082H\u2081\u2086N\u2082 \u00b7 first synthesized 1931 \u00b7 present in trace amounts across the plant and animal kingdoms.</div>
          </div>
        </div>
        <!-- unatom -->
        <div style="display:grid;grid-template-columns:220px 1fr;gap:24px;align-items:center;border:1.5px solid var(--line);border-radius:22px;padding:24px 28px;background:rgba(255,255,255,.02)">
          ${unatomTile(t, 200)}
          <div>
            <div style="font:700 14px ${F_MONO};letter-spacing:.22em;text-transform:uppercase;color:var(--cyan)">MOMENT</div>
            <div style="font:800 36px/1.1 ${F_SANS};letter-spacing:-.01em;margin-top:6px">UNATOM #${t.blk.toLocaleString()}</div>
            <div style="font:500 18px/1.35 ${F_SERIF};color:var(--muted);margin-top:8px">element ${t.sym} \u00b7 seeded by real bitcoin block \u00b7 one specimen, deterministic, forever.</div>
          </div>
        </div>
      </div>
    </div>
    ${watermark()}`;
};

// ---------------- 04 · ATOMIC NOTATION 101 ----------------------------------
CARDS['04_atomic_notation'] = (root) => {
  const t = U().fromBlock(6280);
  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:60px;display:flex;flex-direction:column;">
      <div style="font:800 54px/0.95 ${F_SANS};letter-spacing:-.02em">ATOMIC NOTATION \u2014 101</div>
      <div style="font:500 20px/1.25 ${F_SERIF};color:var(--muted);margin:12px 0 34px;max-width:900px">
        elements are labeled by what makes them themselves. so are UNATOMS.
      </div>

      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:26px;align-items:stretch">
        <!-- carbon -->
        <div style="border:1.5px solid var(--line);border-radius:22px;padding:32px 28px;background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">
          <div style="font:700 12px ${F_MONO};letter-spacing:.22em;color:var(--muted)">CHEMISTRY</div>
          <div style="display:flex;align-items:flex-start;gap:6px;line-height:0.9">
            <div style="display:flex;flex-direction:column;font:700 34px ${F_MONO};color:var(--ink)">
              <span style="color:var(--warm)">12</span>
              <span style="color:var(--cyan)">6</span>
            </div>
            <div style="font:900 220px ${F_SERIF};line-height:0.85;color:var(--ink)">C</div>
          </div>
          <div style="font:700 22px ${F_SANS};margin-top:6px">CARBON</div>
          <div style="font:500 15px/1.3 ${F_SERIF};color:var(--muted);text-align:center;max-width:340px">
            top number = mass. bottom = protons.<br/>the letter is the promise.
          </div>
        </div>
        <!-- unatom -->
        <div style="border:1.5px solid var(--line);border-radius:22px;padding:32px 28px;background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">
          <div style="font:700 12px ${F_MONO};letter-spacing:.22em;color:var(--muted)">UNATOM</div>
          ${unatomTile(t, 300)}
          <div style="font:700 22px ${F_SANS};margin-top:6px">ELEMENT ${t.sym}</div>
          <div style="font:500 15px/1.3 ${F_SERIF};color:var(--muted);text-align:center;max-width:340px">
            top number = block height. bottom = symbol.<br/>the specimen is the promise.
          </div>
        </div>
      </div>
    </div>
    ${watermark()}`;
};

// ---------------- 05 · BLOCK OF THE DAY -------------------------------------
CARDS['05_block_of_day'] = (root) => {
  const blk = 956153; // current-era exemplar
  const t = U().fromBlock(blk);
  const date = new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });
  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:60px;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="font:700 14px ${F_MONO};letter-spacing:.24em;color:var(--warm)">BLOCK OF THE DAY</div>
          <div style="font:800 60px/0.95 ${F_SANS};letter-spacing:-.02em;margin-top:8px">#${blk.toLocaleString()}</div>
          <div style="font:500 18px ${F_SERIF};color:var(--muted);margin-top:6px">${date}</div>
        </div>
        <div style="text-align:right">
          <div style="font:600 12px ${F_MONO};letter-spacing:.22em;color:var(--muted)">NETWORK</div>
          <div style="font:800 22px ${F_MONO};color:var(--pink);margin-top:4px">PACKED</div>
        </div>
      </div>

      <div style="flex:1;display:grid;grid-template-columns:1fr 340px;gap:36px;align-items:center;margin-top:22px">
        ${unatomTile(t, 620)}
        <div style="display:flex;flex-direction:column;gap:14px">
          ${['ELEMENT · ' + t.sym, 'SCHEME · ' + t.scheme.toUpperCase(), 'EYE · ' + t.thirdEye.toUpperCase(), 'MOOD · ' + t.mood.toUpperCase(), 'FEES ~ 68 sat/vB', 'TX COUNT ~ 3,412', 'ONE OF 10,080'].map(l =>
            `<div style="border-left:3px solid var(--orange);padding:6px 0 6px 14px;font:700 14px ${F_MONO};letter-spacing:.18em;color:var(--ink)">${l}</div>`
          ).join('')}
        </div>
      </div>
    </div>
    ${watermark()}`;
};

// ---------------- 06 · PROOF OF WORK / PROOF OF PLAY ------------------------
CARDS['06_pow_pop'] = (root) => {
  const t = U().fromBlock(420);
  root.innerHTML = `
    <div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr">
      <!-- left: PoW -->
      <div style="background:linear-gradient(160deg,#1a0d05,#3a1a08 50%,#0c0705);padding:56px 44px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">
        <div>
          <div style="font:700 14px ${F_MONO};letter-spacing:.24em;color:var(--orange)">PROOF OF WORK</div>
          <div style="font:900 82px/0.92 ${F_SANS};letter-spacing:-.03em;margin-top:14px">400
            <span style="font:900 44px ${F_SANS};color:var(--orange);vertical-align:top">TWh/yr</span>
          </div>
          <div style="font:500 20px/1.25 ${F_SERIF};color:rgba(243,238,227,.7);margin-top:12px">
            miners burn ~4 billion guesses per second, worldwide, to seal one block every ten minutes.
          </div>
        </div>
        <!-- crude ascii rig -->
        <div style="font:700 12px/1.15 ${F_MONO};color:var(--warm);opacity:.7">
          [\u25a0][\u25a0][\u25a0][\u25a0][\u25a0][\u25a0]<br/>
          [\u25a0][\u25a0][\u25a0][\u25a0][\u25a0][\u25a0]<br/>
          [\u25a0][\u25a0][\u25a0][\u25a0][\u25a0][\u25a0]<br/>
          &nbsp;\u25b2 asic farm \u00b7 loud, hot, honest
        </div>
      </div>
      <!-- right: PoP -->
      <div style="background:linear-gradient(200deg,#0a0a0c,#141420);padding:56px 44px;display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div style="font:700 14px ${F_MONO};letter-spacing:.24em;color:var(--cyan)">PROOF OF PLAY</div>
          <div style="font:900 82px/0.92 ${F_SANS};letter-spacing:-.03em;margin-top:14px">16
            <span style="font:900 44px ${F_SANS};color:var(--cyan);vertical-align:top">taps</span>
          </div>
          <div style="font:500 20px/1.25 ${F_SERIF};color:rgba(243,238,227,.7);margin-top:12px">
            you tap. we render. one UNATOM per block, forever. no rig required.
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:20px">
          ${unatomTile(t, 220)}
          <div>
            <div style="font:800 32px ${F_SANS};letter-spacing:-.01em">SAME ENERGY.</div>
            <div style="font:500 16px ${F_SERIF};color:var(--muted);margin-top:4px">different substrate.</div>
          </div>
        </div>
      </div>
    </div>
    ${watermark()}`;
};

// ---------------- 07 · LITTLE FRIENDS ---------------------------------------
CARDS['07_little_friends'] = (root) => {
  const t = U().fromBlock(1);
  root.innerHTML = `
    <div style="position:absolute;inset:0;background:#050506;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px">
      <div style="font:800 90px/0.9 ${F_SANS};letter-spacing:-.03em;text-align:center;max-width:940px">
        why is bitcoin<br/>
        <span style="color:var(--orange)">making little friends?</span>
      </div>
      <div style="font:500 22px/1.3 ${F_SERIF};color:var(--muted);margin-top:34px;max-width:640px;text-align:center">
        one specimen per block. seeded by the chain itself. we didn\u2019t draw them \u2014 the blocks did.
      </div>
      <div style="margin-top:70px">${unatomTile(t, 340)}</div>
    </div>
    ${watermark()}`;
};

// ---------------- 08 · 4 BILLION QUOTE --------------------------------------
CARDS['08_four_billion'] = (root) => {
  const t = U().fromBlock(69);
  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:60px;display:flex;flex-direction:column;justify-content:center">
      <div style="font:700 14px ${F_MONO};letter-spacing:.24em;color:var(--warm)">TIP \u2014 THE MATH</div>
      <div style="font:900 108px/0.9 ${F_SANS};letter-spacing:-.035em;margin-top:22px">
        4,000,000,000<br/>
        <span style="color:var(--muted);font-size:78px">hashes per second.</span>
      </div>
      <div style="font:800 88px/0.9 ${F_SANS};letter-spacing:-.03em;margin-top:24px;color:var(--orange)">
        we only need one.
      </div>
      <div style="position:absolute;right:60px;bottom:120px">${unatomTile(t, 260)}</div>
      <div style="position:absolute;left:60px;bottom:120px;font:500 18px/1.3 ${F_SERIF};color:var(--muted);max-width:420px">
        real bitcoin miners try billions of nonces every second to seal a block. UNATOMS lets you feel the same game \u2014 minus 399,999,999,999 of the guesses.
      </div>
    </div>
    ${watermark()}`;
};

// ---------------- 09 · THE UNSEEN 10,061 ------------------------------------
CARDS['09_unseen_10061'] = (root) => {
  // Random-seed mosaic: 12x12 = 144 tiny UNATOMs
  const cells = [];
  for (let i = 0; i < 144; i++) {
    const blk = 102816 + Math.floor((i * 71 + 13) % 10080);
    const t = U().fromBlock(blk);
    cells.push(unatomTile(t, 74));
  }
  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:60px 60px 110px;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:20px">
        <div>
          <div style="font:800 62px/0.95 ${F_SANS};letter-spacing:-.02em">THE UNSEEN <span style="color:var(--orange)">10,061</span></div>
          <div style="font:500 20px/1.25 ${F_SERIF};color:var(--muted);margin-top:8px;max-width:720px">
            fifteen have names. the rest are still folded inside their blocks. one per block, forever.
          </div>
        </div>
        <div style="font:700 12px ${F_MONO};letter-spacing:.22em;color:var(--warm);text-align:right">
          SERIES 0<br/><span style="color:var(--muted)">1 SPECIMEN / 1 BTC BLOCK</span>
        </div>
      </div>
      <div style="flex:1;display:grid;grid-template-columns:repeat(12,1fr);gap:6px;opacity:.92;grid-auto-rows:1fr">
        ${cells.join('')}
      </div>
    </div>
    <div style="position:absolute;left:60px;bottom:30px;
      font:600 15px/1 ${F_MONO};letter-spacing:.24em;text-transform:uppercase;color:var(--muted);
      display:flex;align-items:center;gap:10px;">
      <span style="color:var(--orange)">\u25c9</span> UNATOM \u00b7 unatom.fun
    </div>`;
};

// ---------------- 10 · HYPERBITCOINIZATION ----------------------------------
CARDS['10_hyperbtc'] = (root) => {
  const ts = [1,69,420,10080].map(b => U().fromBlock(b));
  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:60px;display:flex;flex-direction:column">
      <div style="font:700 14px ${F_MONO};letter-spacing:.24em;color:var(--cyan)">LORE \u2014 CULTURE</div>
      <div style="font:900 82px/0.92 ${F_SANS};letter-spacing:-.03em;margin-top:18px;max-width:960px">
        hyperbitcoinization<br/>
        <span style="color:var(--pink)">but the coins are<br/>little guys.</span>
      </div>
      <div style="font:500 22px/1.3 ${F_SERIF};color:var(--muted);margin-top:26px;max-width:640px">
        each one lives in its own block. each one has an eye, a mood, a wick. this was the plan all along.
      </div>
      <div style="position:absolute;left:60px;right:60px;bottom:100px;display:flex;gap:18px;justify-content:space-between;align-items:flex-end">
        ${ts.map(t => unatomTile(t, 190)).join('')}
      </div>
    </div>
    ${watermark()}`;
};

// ---------------- 11 · FAMILY PHOTO -----------------------------------------
CARDS['11_family_photo'] = (root) => {
  const row1 = ARCHETYPES.slice(0, 8);
  const row2 = ARCHETYPES.slice(8, 15);
  const cell = (a, size) => `
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
      ${unatomTile(a.opts, size)}
      <div style="font:700 11px ${F_MONO};letter-spacing:.14em;color:var(--muted)">${a.name}</div>
    </div>`;
  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:60px 40px 90px;display:flex;flex-direction:column">
      <div style="text-align:center">
        <div style="font:800 66px/0.95 ${F_SANS};letter-spacing:-.02em">FAMILY PHOTO</div>
        <div style="font:500 20px/1.25 ${F_SERIF};color:var(--muted);margin-top:8px">
          the fifteen who already have names.
        </div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:30px;margin-top:30px">
        <div style="display:flex;justify-content:space-around;align-items:end">${row1.map(a => cell(a, 118)).join('')}</div>
        <div style="display:flex;justify-content:space-around;align-items:end">${row2.map(a => cell(a, 128)).join('')}</div>
      </div>
    </div>
    ${watermark()}`;
};

// ---------------- 12 · TRAIT PARADE (third eyes) ----------------------------
CARDS['12_trait_parade'] = (root) => {
  const eyes = ['open','aperture','diamond','crosshair','oracle','halo','void','spiral','genesis','closedEye','sealed','pixel','frost','burn','hash','eclipse'];
  const cells = eyes.map(e => {
    const t = { sym:'Ne', blk:10080, scheme:'graphite', border:'clean', thirdEye:e, mood:'calm',
      mouthKind:'nullLine', drip:'seedDrip', glasses:'none', brows:'none', nature:'none',
      swagKind:'none', eco:'orbit' };
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px">
      ${unatomTile(t, 168)}
      <div style="font:700 11px ${F_MONO};letter-spacing:.14em;color:var(--muted)">${e.toUpperCase()}</div>
    </div>`;
  }).join('');
  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:60px 44px 90px;display:flex;flex-direction:column">
      <div>
        <div style="font:700 14px ${F_MONO};letter-spacing:.24em;color:var(--warm)">TRAIT PARADE \u2014 THIRD EYES</div>
        <div style="font:800 56px/0.95 ${F_SANS};letter-spacing:-.02em;margin-top:6px">SIXTEEN WAYS TO SEE.</div>
        <div style="font:500 18px/1.25 ${F_SERIF};color:var(--muted);margin-top:8px;max-width:820px">
          the same graphite shell, sixteen different eyes. everything else in a UNATOM is that expressive too.
        </div>
      </div>
      <div style="flex:1;margin-top:22px;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);gap:14px;place-items:center">
        ${cells}
      </div>
    </div>
    ${watermark()}`;
};

// ---------------- 13 · ELEMENT SPOTLIGHT ------------------------------------
CARDS['13_spotlight'] = (root) => {
  const a = ARCHETYPES.find(x => x.name === 'FIRE KEEPER');
  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:60px;display:grid;grid-template-columns:1fr 520px;gap:36px;align-items:center">
      <div>
        <div style="font:700 14px ${F_MONO};letter-spacing:.24em;color:var(--orange)">SPOTLIGHT \u00b7 03 / 15</div>
        <div style="font:800 98px/0.9 ${F_SANS};letter-spacing:-.03em;margin-top:14px">MEET<br/>${a.name}.</div>
        <div style="font:500 22px/1.35 ${F_SERIF};color:var(--muted);margin-top:18px;max-width:440px">
          ${a.sub}. carries the spark for everyone. will burn the cash. will burn the doubt.
        </div>
        <div style="margin-top:26px;display:flex;flex-direction:column;gap:8px">
          ${['SYMBOL · ' + a.opts.sym, 'SCHEME · EMBER', 'EYE · BURN', 'NATURE · FIRE', 'WICK · BURN DRIP'].map(l =>
            `<div style="font:700 13px ${F_MONO};letter-spacing:.2em;color:var(--warm)">${l}</div>`
          ).join('')}
        </div>
      </div>
      ${unatomTile(a.opts, 520)}
    </div>
    ${watermark()}`;
};

// ---------------- 14 · BEFORE / AFTER TAP -----------------------------------
CARDS['14_before_after'] = (root) => {
  const t = U().fromBlock(6969);
  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:60px;display:flex;flex-direction:column">
      <div style="font:800 58px/0.95 ${F_SANS};letter-spacing:-.02em">TAP <span style="color:var(--orange)">16</span> TIMES.<br/>WE DO THE REST.</div>
      <div style="font:500 20px/1.3 ${F_SERIF};color:var(--muted);margin-top:12px;max-width:700px">
        every UNATOM starts sealed inside its block. a few taps of the "guess the nonce" mini-game and it opens its eye.
      </div>
      <div style="flex:1;display:grid;grid-template-columns:1fr 70px 1fr;align-items:center;gap:18px;margin-top:20px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
          <div style="width:360px;height:360px;border-radius:26px;background:repeating-linear-gradient(45deg,#1a1a20 0 12px,#141419 12px 24px);border:2px dashed var(--muted);display:flex;align-items:center;justify-content:center">
            <div style="font:700 14px ${F_MONO};letter-spacing:.24em;color:var(--muted);text-align:center">
              SEALED<br/><span style="color:var(--warm)">0x00000...</span>
            </div>
          </div>
          <div style="font:700 14px ${F_MONO};letter-spacing:.2em;color:var(--muted)">BEFORE</div>
        </div>
        <div style="text-align:center;font:900 46px ${F_MONO};color:var(--orange)">\u2192</div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
          ${unatomTile(t, 360)}
          <div style="font:700 14px ${F_MONO};letter-spacing:.2em;color:var(--orange)">AFTER</div>
        </div>
      </div>
    </div>
    ${watermark()}`;
};

// ---------------- 15 · STICKER SHEET ----------------------------------------
CARDS['15_stickers'] = (root) => {
  const picks = [1, 69, 420, 6969, 9558, 10080, 6280, 1775, 3113];
  const cells = picks.map(b => {
    const t = U().fromBlock(b);
    return `<div style="border:2px dashed rgba(10,10,12,.35);border-radius:22px;padding:12px;
      background:#fff;display:flex;flex-direction:column;align-items:center;gap:6px">
      ${unatomTile(t, 216)}
      <div style="font:700 11px ${F_MONO};letter-spacing:.16em;color:rgba(10,10,12,.55)">#${b.toLocaleString()}</div>
    </div>`;
  }).join('');
  root.innerHTML = `
    <div style="position:absolute;inset:0;background:#f5efe1;padding:56px 48px 90px;display:flex;flex-direction:column;color:#0a0a0c">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px">
        <div>
          <div style="font:800 56px/0.95 ${F_SANS};letter-spacing:-.02em;color:#0a0a0c">STICKER SHEET</div>
          <div style="font:500 18px/1.25 ${F_SERIF};color:rgba(10,10,12,.55);margin-top:6px">
            print at home. cut on the dashes. paste them on the world.
          </div>
        </div>
        <div style="font:700 12px ${F_MONO};letter-spacing:.22em;color:#f0962d">UNATOM \u00b7 SHEET 01</div>
      </div>
      <div style="flex:1;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:16px">
        ${cells}
      </div>
    </div>
    ${watermarkLight()}`;
};

// ---------------- 16 · WHISPER CARD -----------------------------------------
CARDS['16_whisper'] = (root) => {
  const t = U().fromBlock(2228);
  const w = (U().WHISPERS[t.sym] || {}).whisper || 'I am seeded by the block. I take its shape.';
  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:80px 90px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
      <div style="font:700 14px ${F_MONO};letter-spacing:.28em;color:var(--warm);margin-bottom:14px">A WHISPER FROM ELEMENT ${t.sym}</div>
      ${unatomTile(t, 340)}
      <div style="font:400 40px/1.28 ${F_SERIF};font-style:italic;color:var(--ink);margin-top:32px;max-width:820px">
        \u201c${w}\u201d
      </div>
      <div style="font:700 12px ${F_MONO};letter-spacing:.22em;color:var(--muted);margin-top:26px">
        UNATOM #${t.blk.toLocaleString()} \u00b7 SERIES 0
      </div>
    </div>
    ${watermark()}`;
};

// ---------------- 17 · TRIP REPORT (LORE quote) -----------------------------
CARDS['17_trip_report'] = (root) => {
  const t = U().fromBlock(9558);
  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:80px;display:flex;flex-direction:column;justify-content:center">
      <div style="font:700 14px ${F_MONO};letter-spacing:.28em;color:var(--pink);margin-bottom:26px">
        <span style="background:rgba(241,125,142,.14);padding:6px 12px;border-radius:6px">LORE</span>
        <span style="margin-left:14px;color:var(--muted)">TRIP REPORT \u2014 05</span>
      </div>
      <div style="font:800 64px/1.05 ${F_SANS};letter-spacing:-.02em;max-width:900px">
        many trip reports open the same way:<br/>
        <span style="color:var(--pink)">a waiting room, then the veil.</span>
      </div>
      <div style="font:500 22px/1.35 ${F_SERIF};color:var(--muted);margin-top:26px;max-width:760px">
        across decades of interviews, the sequence keeps repeating. the entities are described as playful and older than you. we didn\u2019t make that up. we just kept listening.
      </div>
      <div style="position:absolute;right:80px;bottom:110px">${unatomTile(t, 260)}</div>
    </div>
    ${watermark()}`;
};

// ---------------- 18 · BLOCK BIRTHDAY ---------------------------------------
CARDS['18_block_birthday'] = (root) => {
  // Pick a memorable BTC block from history mapped into our engine
  const blk = 170;
  const t = U().fromBlock(blk);
  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:60px;display:flex;flex-direction:column">
      <div style="font:700 14px ${F_MONO};letter-spacing:.24em;color:var(--cyan)">BLOCK BIRTHDAY \u2014 01</div>
      <div style="font:800 76px/0.95 ${F_SANS};letter-spacing:-.02em;margin-top:12px">BLOCK #170.</div>
      <div style="font:600 22px/1.3 ${F_SERIF};color:var(--warm);margin-top:6px">
        12 january 2009 \u00b7 the first bitcoin transaction ever recorded.
      </div>
      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center;margin-top:22px">
        <div>
          <div style="font:500 20px/1.4 ${F_SERIF};color:var(--muted);max-width:460px">
            hal finney received 10 BTC from satoshi. the network confirmed it. sixteen years later, the UNATOM born from that same block still has a face.
          </div>
          <div style="margin-top:22px;display:flex;flex-direction:column;gap:8px">
            ${['SPECIMEN · ' + t.sym, 'SCHEME · ' + t.scheme.toUpperCase(), 'MOOD · ' + t.mood.toUpperCase(), 'ETERNAL · SAME BLOCK = SAME FRIEND'].map(l =>
              `<div style="font:700 13px ${F_MONO};letter-spacing:.2em;color:var(--ink)">${l}</div>`
            ).join('')}
          </div>
        </div>
        ${unatomTile(t, 480)}
      </div>
    </div>
    ${watermark()}`;
};

// ---------------- 19 · WEATHER STATION --------------------------------------
CARDS['19_weather'] = (root) => {
  const rows = [
    { label:'QUIET',   color:'var(--green)',  blk:1,      note:'fees under 5 sat/vB \u00b7 mempool empty' },
    { label:'BUSY',    color:'var(--cyan)',   blk:2228,   note:'a few dozen sat/vB \u00b7 normal flow' },
    { label:'PRICEY',  color:'var(--warm)',   blk:6969,   note:'fees rising \u00b7 be patient' },
    { label:'PACKED',  color:'var(--pink)',   blk:10080,  note:'triple-digit fees \u00b7 blocks are stuffed' },
  ];
  const cell = (r) => {
    const t = U().fromBlock(r.blk);
    return `<div style="border:1.5px solid var(--line);border-radius:22px;padding:18px;background:rgba(255,255,255,.02);display:flex;flex-direction:column;align-items:center;gap:8px">
      ${unatomTile(t, 200)}
      <div style="font:800 22px ${F_MONO};letter-spacing:.16em;color:${r.color}">${r.label}</div>
      <div style="font:500 13px/1.25 ${F_SERIF};color:var(--muted);text-align:center;max-width:230px">${r.note}</div>
    </div>`;
  };
  root.innerHTML = `
    <div style="position:absolute;inset:0;padding:60px;display:flex;flex-direction:column">
      <div style="font:700 14px ${F_MONO};letter-spacing:.24em;color:var(--warm)">WEATHER STATION</div>
      <div style="font:800 62px/0.95 ${F_SANS};letter-spacing:-.02em;margin-top:8px">HOW THE NETWORK FEELS TODAY.</div>
      <div style="font:500 18px/1.25 ${F_SERIF};color:var(--muted);margin-top:6px;max-width:820px">
        the mempool is a mood ring. UNATOMS mints its specimens in every weather.
      </div>
      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:20px;margin-top:22px">
        ${rows.map(cell).join('')}
      </div>
    </div>
    ${watermark()}`;
};

// ---------------- 20 · RECEIPT POLAROIDS ------------------------------------
CARDS['20_receipts'] = (root) => {
  const receipts = [
    { title:'DEEP MATTER',   note:'NAT locked.',              blk:6280, taps:6,  angle:-6, x:80,  y:180 },
    { title:'TIGHT SQUEEZE', note:'one crumb for next block.',blk:9558, taps:11, angle:5,  x:530, y:150 },
    { title:'CLEAN PULL',    note:'no overflow. quiet block.',blk:2228, taps:4,  angle:-3, x:130, y:590 },
    { title:'ROUGH SEAL',    note:'wick leaked 3 times.',     blk:6969, taps:17, angle:7,  x:560, y:600 },
  ];
  const polaroid = (r) => {
    const t = U().fromBlock(r.blk);
    return `<div style="position:absolute;left:${r.x}px;top:${r.y}px;width:370px;transform:rotate(${r.angle}deg);
      background:#f5efe1;color:#0a0a0c;padding:16px 16px 20px;border-radius:12px;
      box-shadow:0 20px 40px -20px rgba(0,0,0,.6),0 6px 12px -4px rgba(0,0,0,.5)">
      <div style="background:#0a0a0c;border-radius:8px;overflow:hidden">${unatomTile(t, 338)}</div>
      <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:baseline;font:700 11px ${F_MONO};letter-spacing:.16em">
        <span style="color:#f0962d">${r.title}</span>
        <span style="color:rgba(10,10,12,.55)">#${r.blk.toLocaleString()} \u00b7 ${r.taps}T</span>
      </div>
      <div style="font:500 14px/1.2 ${F_SERIF};color:rgba(10,10,12,.65);margin-top:2px">${r.note}</div>
    </div>`;
  };
  root.innerHTML = `
    <div style="position:absolute;inset:0;background:radial-gradient(circle at 30% 20%,#1a1a24,#0a0a0c 70%);padding:44px 60px">
      <div style="font:700 14px ${F_MONO};letter-spacing:.24em;color:var(--warm)">RECEIPTS</div>
      <div style="font:800 52px/0.95 ${F_SANS};letter-spacing:-.02em;margin-top:6px">FOUR RUNS. FOUR VERDICTS.</div>
      ${receipts.map(polaroid).join('')}
    </div>
    ${watermark()}`;
};

window.CARDS = CARDS;
