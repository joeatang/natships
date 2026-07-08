// UNATOMS · ENTROPY SERIES (v2 — iconic)
// Eight social-first posters. Rule: one big image, one line of hero copy,
// everything else whispers. Let the UNATOM art carry the argument.
//
// Design system:
//   • Two palettes only: deep black (void) or warm cream (paper)
//   • Type: Impact for hero shout, Palatino for whisper, mono for stamps
//   • Massive negative space; the UNATOM is the piece, not decoration
//   • Accents: burnt-orange #f0962d, cyan #5dd0e3, blood #c73e3e — sparingly

(function () {
  const U = () => window.UNATOM;

  // family names with spaces MUST be single-quoted so they survive inside a
  // double-quoted inline style attribute
  const F_SERIF   = "Palatino,Georgia,Cambria,serif";
  const F_MONO    = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
  const F_IMPACT  = "Impact,Haettenschweiler,'Franklin Gothic Bold',sans-serif";
  const F_HAND    = "'Marker Felt','Chalkboard SE','Bradley Hand ITC',cursive";

  const CARDS = window.CARDS;

  function unatomBox(opts, size, opts2) {
    const svg = U().svg(Object.assign({ showBlock:false, showSymbol:false }, opts, opts2||{}));
    return `<div style="width:${size}px;height:${size}px;display:block">
      ${svg.replace('<svg ', "<svg preserveAspectRatio=\"xMidYMid meet\" style=\"width:100%;height:100%;display:block\" ")}
    </div>`;
  }

  function starfield(count, opacity) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const x = (i*137 + 41) % 1080;
      const y = (i*271 + 17) % 1080;
      const r = i%17===0 ? 1.6 : (i%7===0 ? 1.1 : 0.6);
      const op = (opacity || 0.35) * (0.4 + ((i*13)%60)/100);
      s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#f3eee3" opacity="${op}"/>`;
    }
    return s;
  }

  // ============================================================================
  // E01 · LOW ENTROPY IS ALL — typographic poster
  // ============================================================================
  CARDS['e01_low_entropy'] = (root) => {
    const t = U().fromBlock(103481);
    root.innerHTML = `
      <div style="position:absolute;inset:0;background:#f4efe3;color:#1a1a1a;overflow:hidden;
        background-image:radial-gradient(ellipse at 20% 10%, rgba(139,101,60,.08), transparent 55%),
                         radial-gradient(ellipse at 80% 90%, rgba(50,50,50,.06), transparent 60%);">
        <div style="position:absolute;top:76px;left:0;right:0;text-align:center;
          font:700 15px ${F_MONO};letter-spacing:.5em;color:#8a3d1a;text-transform:uppercase">
          a note on entropy
        </div>

        <div style="position:absolute;top:170px;left:0;right:0;text-align:center;
          font:900 210px/0.9 ${F_IMPACT};letter-spacing:-.02em;color:#1a1a1a">
          LOW<br/>ENTROPY<br/><span style="color:#8a3d1a">IS ALL.</span>
        </div>

        <div style="position:absolute;bottom:130px;left:50%;transform:translateX(-50%);
          width:160px;height:160px;background:#fff;border:2px solid #1a1a1a;padding:8px;
          box-shadow:6px 6px 0 rgba(138,61,26,.5)">
          ${unatomBox(t, 144)}
        </div>

        <div style="position:absolute;bottom:44px;left:0;right:0;text-align:center;
          font:600 12px ${F_MONO};letter-spacing:.32em;color:#8a3d1a;text-transform:uppercase">
          UNATOM \u00b7 unatom.fun
        </div>
      </div>`;
  };

  // ============================================================================
  // E02 · WATER = BLOCK — split-screen parallelism
  // ============================================================================
  CARDS['e02_equals'] = (root) => {
    const t = U().fromBlock(2009);
    const strokes = Array.from({length:14},(_,i) => {
      const x = 30 + i*20;
      const wob = (i%2 ? 8 : -6);
      return `<path d="M ${x} 60 Q ${x + wob} 260, ${x + wob*0.3} 460 Q ${x + wob*-0.5} 660, ${x} 860"
        stroke="#f3eee3" stroke-width="${2 + (i%3)}" fill="none" opacity="${0.35 + (i%5)*0.1}" stroke-linecap="round"/>`;
    }).join('');
    root.innerHTML = `
      <div style="position:absolute;inset:0;background:#0a0a0f;color:#f3eee3;overflow:hidden">
        <div style="position:absolute;top:0;left:0;bottom:0;width:34%;overflow:hidden">
          <svg viewBox="0 0 360 1080" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block">
            <ellipse cx="180" cy="960" rx="220" ry="34" fill="#3a4d6a" opacity="0.6"/>
            <ellipse cx="180" cy="980" rx="260" ry="26" fill="#2a3a54" opacity="0.7"/>
            ${strokes}
          </svg>
          <div style="position:absolute;bottom:34px;left:0;right:0;text-align:center;
            font:700 12px ${F_MONO};letter-spacing:.3em;color:rgba(243,238,227,.55)">WATER</div>
        </div>

        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          font:900 280px/1 ${F_IMPACT};color:#f0962d;text-shadow:0 0 40px rgba(240,150,45,.4)">
          =
        </div>

        <div style="position:absolute;top:0;right:0;bottom:0;width:34%;display:flex;align-items:center;justify-content:center">
          <div style="width:320px;height:320px">
            ${unatomBox(t, 320)}
          </div>
        </div>
        <div style="position:absolute;bottom:78px;right:0;width:34%;text-align:center;
          font:700 12px ${F_MONO};letter-spacing:.3em;color:rgba(243,238,227,.55)">BLOCK</div>

        <div style="position:absolute;bottom:34px;left:0;right:0;text-align:center;
          font:600 11px ${F_MONO};letter-spacing:.4em;color:#f0962d">
          same trick \u00b7 different medium
        </div>
      </div>`;
  };

  // ============================================================================
  // E03 · ALCHEMIST'S STAMP
  // ============================================================================
  CARDS['e03_alchemy_stamp'] = (root) => {
    const t = U().fromBlock(4269);
    const sigil = (svg, x, y, label) => `
      <g transform="translate(${x},${y})">
        <circle r="60" fill="none" stroke="#1a1a1a" stroke-width="1.5" opacity="0.7"/>
        ${svg}
        <text y="92" text-anchor="middle" font-family="${F_MONO}" font-size="13" font-weight="700" letter-spacing="4" fill="#8a3d1a">${label}</text>
      </g>`;
    const water = `<path d="M -32 -18 L 32 -18 L 0 34 Z" fill="none" stroke="#1a1a1a" stroke-width="2.5"/>`;
    const fire  = `<path d="M -32 22 L 32 22 L 0 -30 Z" fill="none" stroke="#1a1a1a" stroke-width="2.5"/>`;
    const earth = `<path d="M -32 -18 L 32 -18 L 0 34 Z" fill="none" stroke="#1a1a1a" stroke-width="2.5"/>
                   <line x1="-20" y1="8" x2="20" y2="8" stroke="#1a1a1a" stroke-width="2.5"/>`;
    const sha = `<circle cx="-14" cy="0" r="18" fill="none" stroke="#1a1a1a" stroke-width="2.5"/>
                 <circle cx="14" cy="0" r="18" fill="none" stroke="#1a1a1a" stroke-width="2.5"/>`;

    root.innerHTML = `
      <div style="position:absolute;inset:0;background:#efe6c8;color:#1a1a1a;overflow:hidden;
        background-image:
          radial-gradient(ellipse at 30% 20%, rgba(139,101,60,.14), transparent 55%),
          radial-gradient(ellipse at 70% 80%, rgba(80,50,20,.10), transparent 55%),
          repeating-linear-gradient(45deg, rgba(0,0,0,.015) 0 2px, transparent 2px 6px)">

        <svg style="position:absolute;inset:40px;pointer-events:none" viewBox="0 0 1000 1000">
          <rect x="4" y="4" width="992" height="992" fill="none" stroke="#1a1a1a" stroke-width="2"/>
          <rect x="16" y="16" width="968" height="968" fill="none" stroke="#1a1a1a" stroke-width="0.8"/>
          ${sigil(water, 110, 110, 'AQUA')}
          ${sigil(fire,  890, 110, 'IGNIS')}
          ${sigil(earth, 110, 890, 'TERRA')}
          ${sigil(sha,   890, 890, 'SHA-256')}
        </svg>

        <div style="position:absolute;top:130px;left:0;right:0;text-align:center;
          font:700 13px ${F_MONO};letter-spacing:.44em;color:#8a3d1a">
          \u2014 ISSUED, ca. 2009 \u2014
        </div>

        <div style="position:absolute;top:200px;left:50%;transform:translateX(-50%);
          width:520px;height:520px;border-radius:50%;background:#f4efe3;
          border:12px solid #1a1a1a;
          box-shadow:0 0 0 4px #efe6c8, 0 0 0 6px #1a1a1a, 8px 8px 0 rgba(138,61,26,.35);
          display:flex;align-items:center;justify-content:center">
          <div style="width:400px;height:400px">${unatomBox(t, 400)}</div>
        </div>

        <div style="position:absolute;bottom:150px;left:0;right:0;text-align:center;
          font:900 60px/1 ${F_IMPACT};letter-spacing:.05em;color:#1a1a1a">
          NEW MATTER.
        </div>
        <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;
          font:italic 500 22px ${F_SERIF};color:#8a3d1a">
          hard to counterfeit. harder to destroy.
        </div>
        <div style="position:absolute;bottom:56px;left:0;right:0;text-align:center;
          font:600 11px ${F_MONO};letter-spacing:.4em;color:#1a1a1a">
          UNATOM \u00b7 UNATOM.FUN
        </div>
      </div>`;
  };

  // ============================================================================
  // E04 · COLD SCALE — minimalist thermometer
  // ============================================================================
  CARDS['e04_cold'] = (root) => {
    const t = U().fromBlock(112895);
    let ticks = '';
    for (let i = 0; i < 42; i++) {
      const y = 90 + i * 22;
      const w = (i % 5 === 0) ? 24 : 14;
      ticks += `<line x1="150" y1="${y}" x2="${150 + w}" y2="${y}" stroke="rgba(243,238,227,.35)" stroke-width="1.5"/>`;
    }
    root.innerHTML = `
      <div style="position:absolute;inset:0;background:#08080e;color:#f3eee3;overflow:hidden">
        <svg style="position:absolute;inset:0;pointer-events:none" viewBox="0 0 1080 1080">
          ${starfield(70, 0.28)}
        </svg>

        <div style="position:absolute;left:100px;top:60px;bottom:60px;width:44px;
          border:2px solid rgba(243,238,227,.7);border-radius:22px;overflow:hidden;
          background:linear-gradient(to top,
            #4d9dd6 0%, #4d9dd6 12%,
            #5dc7bc 22%, #9dc961 36%, #e6c94b 50%,
            #e88a3e 68%, #d94141 88%, #7a1e1e 100%);">
        </div>
        <div style="position:absolute;left:80px;bottom:20px;width:84px;height:84px;border-radius:50%;
          border:2px solid rgba(243,238,227,.7);background:#4d9dd6;
          box-shadow:0 0 40px rgba(93,208,227,.35)"></div>

        <svg style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none" viewBox="0 0 1080 1080">${ticks}</svg>

        <div style="position:absolute;left:200px;top:66px;
          font:900 52px/1 ${F_IMPACT};color:#d94141;letter-spacing:.05em">
          HEAT DEATH.
        </div>
        <div style="position:absolute;left:200px;top:130px;
          font:italic 500 18px ${F_SERIF};color:rgba(243,238,227,.55)">
          when nothing more can happen.
        </div>

        <div style="position:absolute;left:200px;bottom:220px;
          font:900 78px/1 ${F_IMPACT};letter-spacing:.03em;color:#f0962d">
          HERE.
        </div>
        <div style="position:absolute;left:200px;bottom:170px;
          font:italic 500 19px ${F_SERIF};color:rgba(243,238,227,.7);max-width:400px">
          the coldest digital object ever made.
        </div>
        <div style="position:absolute;right:80px;bottom:130px;width:260px;height:260px;
          background:#0a0a10;border:2px solid #f0962d;border-radius:14px;padding:8px;
          box-shadow:0 0 60px rgba(240,150,45,.45)">
          ${unatomBox(t, 244)}
        </div>

        <div style="position:absolute;bottom:34px;left:100px;right:100px;
          display:flex;justify-content:space-between;
          font:600 12px ${F_MONO};letter-spacing:.28em;color:rgba(243,238,227,.5)">
          <span>S = k\u1D2B ln W</span>
          <span>UNATOM \u00b7 UNATOM.FUN</span>
        </div>
      </div>`;
  };

  // ============================================================================
  // E05 · ELEMENT — hero periodic card
  // ============================================================================
  CARDS['e05_element'] = (root) => {
    const blk = 103481;
    const t = U().fromBlock(blk);
    root.innerHTML = `
      <div style="position:absolute;inset:0;background:#0a0f18;color:#f3eee3;overflow:hidden">
        <svg style="position:absolute;inset:0;pointer-events:none" viewBox="0 0 1080 1080">
          <defs>
            <pattern id="chem" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#3a5d8f" stroke-width="0.6" opacity="0.28"/>
            </pattern>
          </defs>
          <rect width="1080" height="1080" fill="url(#chem)"/>
        </svg>

        <div style="position:absolute;top:60px;bottom:60px;left:120px;right:120px;
          background:#050914;border:4px solid #f0962d;border-radius:18px;padding:40px;
          box-shadow:0 0 0 1px rgba(240,150,45,.4), 0 0 80px rgba(240,150,45,.25);
          display:flex;flex-direction:column">
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <div style="font:800 42px ${F_MONO};color:#f0962d">${blk.toLocaleString()}</div>
            <div style="font:700 14px ${F_MONO};letter-spacing:.34em;color:#5dd0e3">DIGITAL MATTER</div>
          </div>

          <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative">
            <div style="position:absolute;font:900 340px/1 ${F_SERIF};color:#f0962d;opacity:0.14">Bt</div>
            <div style="width:520px;height:520px;position:relative;z-index:2">
              ${unatomBox(t, 520)}
            </div>
          </div>

          <div style="text-align:center;font:900 88px/1 ${F_IMPACT};letter-spacing:.08em;color:#f3eee3">
            BLOCKTONIUM
          </div>
          <div style="text-align:center;font:italic 500 20px ${F_SERIF};color:rgba(243,238,227,.6);margin-top:8px">
            atomic number: block. valence: belief.
          </div>

          <div style="display:flex;justify-content:space-between;margin-top:24px;padding-top:22px;
            border-top:1px solid rgba(93,208,227,.3);
            font:600 15px ${F_MONO};letter-spacing:.14em;color:rgba(243,238,227,.75)">
            <span><span style="color:#5dd0e3">STATE</span> solid</span>
            <span><span style="color:#5dd0e3">BONDS</span> proof-of-work</span>
            <span><span style="color:#5dd0e3">HALF-LIFE</span> \u221E</span>
          </div>
        </div>

        <div style="position:absolute;bottom:18px;left:0;right:0;text-align:center;
          font:600 11px ${F_MONO};letter-spacing:.4em;color:rgba(243,238,227,.4)">
          AN UNLICENSED FIELD GUIDE TO DIGITAL MATTER \u00b7 UNATOM.FUN
        </div>
      </div>`;
  };

  // ============================================================================
  // E06 · SIGNAL FROM THE COLD
  // ============================================================================
  CARDS['e06_signal'] = (root) => {
    const t = U().fromBlock(2009);
    const rings = [280, 380, 500, 640, 800].map((r, i) => `
      <circle cx="540" cy="480" r="${r}" fill="none" stroke="#5dd0e3" stroke-width="${1.6 - i*0.2}" opacity="${0.5 - i*0.09}"/>
    `).join('');
    root.innerHTML = `
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 45%, #0e1428 0%, #05070c 60%);color:#f3eee3;overflow:hidden">
        <svg style="position:absolute;inset:0" viewBox="0 0 1080 1080">
          ${starfield(120, 0.55)}
          ${rings}
          <line x1="540" y1="200" x2="540" y2="240" stroke="rgba(93,208,227,.4)" stroke-width="1"/>
          <line x1="540" y1="720" x2="540" y2="760" stroke="rgba(93,208,227,.4)" stroke-width="1"/>
          <line x1="200" y1="480" x2="240" y2="480" stroke="rgba(93,208,227,.4)" stroke-width="1"/>
          <line x1="840" y1="480" x2="880" y2="480" stroke="rgba(93,208,227,.4)" stroke-width="1"/>
        </svg>

        <div style="position:absolute;top:270px;left:50%;transform:translateX(-50%);
          width:420px;height:420px;
          filter:drop-shadow(0 0 40px rgba(93,208,227,0.4));">
          ${unatomBox(t, 420)}
        </div>

        <div style="position:absolute;bottom:150px;left:0;right:0;text-align:center;
          font:900 84px/0.95 ${F_IMPACT};letter-spacing:.04em;color:#f3eee3">
          value hides<br/>in the cold.
        </div>

        <div style="position:absolute;bottom:56px;left:0;right:0;text-align:center;
          font:600 11px ${F_MONO};letter-spacing:.5em;color:#5dd0e3">
          BLOCK 2,009 \u00b7 BROADCASTING SINCE 2009 \u00b7 UNATOM.FUN
        </div>
      </div>`;
  };

  // ============================================================================
  // E07 · LATTICE — 36 UNATOMs
  // ============================================================================
  CARDS['e07_lattice'] = (root) => {
    const step = Math.floor(10080 / 36);
    const heights = Array.from({length:36}, (_,i) => 1 + i*step);
    const cells = heights.map(h => {
      const t = U().fromBlock(h);
      return `<div style="width:100%;aspect-ratio:1/1;background:#0a0a10;border-radius:6px;overflow:hidden">
        ${U().svg(Object.assign({ showBlock:false, showSymbol:false }, t)).replace('<svg ', '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block" ')}
      </div>`;
    }).join('');
    root.innerHTML = `
      <div style="position:absolute;inset:0;background:#050508;color:#f3eee3;overflow:hidden">
        <div style="position:absolute;top:60px;left:0;right:0;text-align:center;
          font:900 84px/1 ${F_IMPACT};letter-spacing:.04em">
          DIGITAL MATTER
        </div>
        <div style="position:absolute;top:150px;left:0;right:0;text-align:center;
          font:italic 500 24px ${F_SERIF};color:rgba(243,238,227,.55)">
          arranged.
        </div>

        <div style="position:absolute;top:220px;left:60px;right:60px;
          display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(6,1fr);gap:8px;height:760px">
          ${cells}
        </div>

        <div style="position:absolute;bottom:36px;left:0;right:0;text-align:center;
          font:600 11px ${F_MONO};letter-spacing:.4em;color:rgba(243,238,227,.55)">
          36 OF 10,080 \u00b7 A LATTICE OF LOW ENTROPY \u00b7 UNATOM.FUN
        </div>
      </div>`;
  };

  // ============================================================================
  // E08 · BOLTZMANN — S = k ln [unatom]
  // ============================================================================
  CARDS['e08_boltzmann'] = (root) => {
    const t = U().fromBlock(103481);
    root.innerHTML = `
      <div style="position:absolute;inset:0;background:#050508;color:#f3eee3;overflow:hidden">
        <svg style="position:absolute;inset:0" viewBox="0 0 1080 1080">
          ${starfield(60, 0.28)}
        </svg>

        <div style="position:absolute;top:110px;left:0;right:0;text-align:center;
          font:700 14px ${F_MONO};letter-spacing:.44em;color:#5dd0e3">
          BOLTZMANN, 1877 \u2014 SATOSHI, 2009
        </div>

        <!-- equation: S = k ln [unatom] centered as an inline row -->
        <div style="position:absolute;top:290px;left:60px;right:60px;text-align:center;
          font:900 200px/1 ${F_SERIF};letter-spacing:-.02em;color:#f3eee3;
          text-shadow:0 0 60px rgba(93,208,227,.35);
          white-space:nowrap">
          <span style="vertical-align:middle">S = </span><span style="color:#5dd0e3;vertical-align:middle">k</span><span style="vertical-align:middle"> ln </span><span style="width:210px;height:210px;display:inline-block;vertical-align:middle;
            filter:drop-shadow(0 0 30px rgba(240,150,45,.55))">
            ${unatomBox(t, 210)}
          </span>
        </div>

        <div style="position:absolute;bottom:220px;left:0;right:0;text-align:center;
          font:900 68px/0.95 ${F_IMPACT};letter-spacing:.04em;color:#f0962d">
          the reason<br/>value exists.
        </div>

        <div style="position:absolute;bottom:130px;left:0;right:0;text-align:center;
          font:italic 500 22px ${F_SERIF};color:rgba(243,238,227,.55)">
          less chaos in \u2192 more work out.
        </div>

        <div style="position:absolute;bottom:56px;left:0;right:0;text-align:center;
          font:600 11px ${F_MONO};letter-spacing:.5em;color:#5dd0e3">
          UNATOM \u00b7 UNATOM.FUN
        </div>
      </div>`;
  };

  // ============================================================================
  // NATDRIP · FREE \u2014 image-forward FOMO ('claim free DMT-NAT', miner-backed)
  // One word does the work (FREE); the UNATOM art + gold drip carry the rest.
  // ============================================================================
  CARDS['natdrip_free'] = (root) => {
    const t = U().fromBlock(103481);
    const drips = Array.from({length:13}, (_,i) => {
      const x = 356 + i*30;
      const len = 44 + ((i*41) % 150);
      const op  = 0.22 + ((i*29) % 55) / 100;
      return `<line x1="${x}" y1="472" x2="${x}" y2="${472+len}" stroke="#f0962d" stroke-width="2.2" opacity="${op}" stroke-linecap="round"/>`;
    }).join('');
    root.innerHTML = `
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 38%, #1c1206 0%, #060509 64%);color:#f3eee3;overflow:hidden">
        <svg style="position:absolute;inset:0;pointer-events:none" viewBox="0 0 1080 1080">
          ${starfield(120, .5)}
          ${drips}
        </svg>

        <div style="position:absolute;inset:26px;border:1px solid rgba(243,238,227,.12);border-radius:6px;pointer-events:none"></div>

        <div style="position:absolute;top:64px;left:0;right:0;text-align:center;
          font:700 15px ${F_MONO};letter-spacing:.3em;color:#5dd0e3;text-transform:uppercase">
          \u26cf\ufe0f  backed by the top Bitcoin miners
        </div>

        <div style="position:absolute;top:126px;left:50%;transform:translateX(-50%);
          width:346px;height:346px;
          filter:drop-shadow(0 0 82px rgba(240,150,45,.6)) drop-shadow(0 0 30px rgba(93,208,227,.32))">
          ${unatomBox(t, 346)}
        </div>

        <div style="position:absolute;bottom:252px;left:0;right:0;text-align:center;
          font:900 132px/0.82 ${F_IMPACT};letter-spacing:-.02em;color:#f3eee3;
          text-shadow:0 0 45px rgba(240,150,45,.25)">
          CLAIM <span style="color:#f0962d">FREE</span><br/>$DMT-NAT
        </div>

        <div style="position:absolute;bottom:172px;left:0;right:0;text-align:center;
          font:italic 500 25px ${F_SERIF};color:rgba(243,238,227,.72)">
          run a block. keep the change. no catch.
        </div>

        <div style="position:absolute;bottom:82px;left:0;right:0;text-align:center;
          font:800 26px ${F_MONO};letter-spacing:.4em;color:#f0962d;text-transform:uppercase">
          UNATOM.FUN
        </div>
      </div>`;
  };

})();
