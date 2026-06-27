import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

const repo = '/Users/joeatang/Documents/GitHub/natships';
const galleryDir = path.join(repo, 'gallery');
const outDir = path.join(galleryDir, 'social-art');

const blocks = [
  102816, 104500, 107200, 109000, 110500,
  111337, 111774, 112009, 112016, 102884,
  103481, 112895, 105678, 108345, 110999,
  103210, 106060, 109420, 112420,
];

const picks = {
  hero: 111774,
  alt: 112895,
  rowA: [102816, 104500, 107200],
  rowB: [109000, 110500, 111337],
  rowC: [112009, 112016, 102884],
  ring: [103481, 105678, 108345, 110999, 103210, 106060, 109420, 112420],
};

function frameBase(title, subtitle, body) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>
*{box-sizing:border-box}
html,body{margin:0;width:100%;height:100%;font-family:Helvetica,Arial,sans-serif;background:#050915;color:#e7efff}
.frame{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(circle at 15% -10%, #233d7b 0%, transparent 34%),radial-gradient(circle at 92% -8%, #60384c 0%, transparent 30%),#050915}
.badge{position:absolute;top:28px;left:28px;padding:10px 14px;border:1px solid #355188;border-radius:999px;background:rgba(6,13,28,.72);font-size:14px;letter-spacing:.08em;color:#a8ccff;z-index:5}
.title{position:absolute;left:28px;bottom:74px;font-size:62px;line-height:1;letter-spacing:.03em;font-weight:700;color:#aee9ff;text-shadow:0 8px 30px rgba(0,0,0,.45);z-index:5}
.subtitle{position:absolute;left:30px;bottom:28px;font-size:20px;color:#e6f0ff;opacity:.92;letter-spacing:.06em;z-index:5}
.tile{display:block;width:100%;height:100%;object-fit:cover}
.grain:before{content:"";position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px);background-size:3px 3px;mix-blend-mode:soft-light;opacity:.15;z-index:4}
</style>
</head>
<body>
<div class="frame grain">
<div class="badge">NATSHIPS</div>
${body}
<div class="title">${title}</div>
<div class="subtitle">${subtitle}</div>
</div>
</body>
</html>`;
}

async function loadBlockDataUris() {
  const map = new Map();
  for (const block of blocks) {
    const p = path.join(galleryDir, `natships-${block}.png`);
    const buf = await fs.readFile(p);
    map.set(block, `data:image/png;base64,${buf.toString('base64')}`);
  }
  return map;
}

function buildSpecs(srcFor) {
  const tile = (block, cls = '') => `<img class="tile ${cls}" src="${srcFor(block)}" alt="NATSHIPS block ${block}"/>`;

  return [
    {
      name: '01_museum_cover_1080x1350.png',
      width: 1080,
      height: 1350,
      html: frameBase(
        'Vessels Of The Substrate',
        'Ships Forged From Bitcoin',
        `<div style="position:absolute;inset:0">${tile(picks.hero)}</div>
         <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.62) 70%,rgba(0,0,0,.86));z-index:2"></div>`
      ),
    },
    {
      name: '02_cinema_triptych_1600x900.png',
      width: 1600,
      height: 900,
      html: frameBase(
        'NATSHIPS',
        'Three Signals Across The Chain',
        `<div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px;z-index:1">
          <div style="position:relative">${tile(picks.rowA[0])}<div style="position:absolute;left:12px;bottom:12px;color:#fff;font-size:18px">BLK ${picks.rowA[0]}</div></div>
          <div style="position:relative">${tile(picks.rowA[1])}<div style="position:absolute;left:12px;bottom:12px;color:#fff;font-size:18px">BLK ${picks.rowA[1]}</div></div>
          <div style="position:relative">${tile(picks.rowA[2])}<div style="position:absolute;left:12px;bottom:12px;color:#fff;font-size:18px">BLK ${picks.rowA[2]}</div></div>
         </div>
         <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.0),rgba(0,0,0,.65) 68%,rgba(0,0,0,.82));z-index:2"></div>`
      ),
    },
    {
      name: '03_fleet_grid_2048x2048.png',
      width: 2048,
      height: 2048,
      html: frameBase(
        'The Fleet',
        'Nine Deterministic Vessels',
        `<div style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:8px;padding:8px;z-index:1">
          ${[...picks.rowA, ...picks.rowB, ...picks.rowC].map((b) => `<div style="position:relative">${tile(b)}<div style="position:absolute;right:10px;top:10px;color:#d6ebff;font-size:16px;background:rgba(0,0,0,.35);padding:4px 8px;border-radius:999px">${b}</div></div>`).join('')}
         </div>
         <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.0),rgba(0,0,0,.48) 75%,rgba(0,0,0,.7));z-index:2"></div>`
      ),
    },
    {
      name: '04_zodiac_ring_1080x1080.png',
      width: 1080,
      height: 1080,
      html: frameBase(
        'Star Signs Of NATSHIPS',
        'Eight Omens Around One Core',
        `<div style="position:absolute;inset:0;display:grid;place-items:center;z-index:1">
           <div style="position:relative;width:880px;height:880px;border-radius:50%;border:1px solid rgba(136,198,255,.35)">
             ${picks.ring.map((b, i) => {
               const a = (Math.PI * 2 * i) / picks.ring.length - Math.PI / 2;
               const r = 350;
               const x = 440 + Math.cos(a) * r - 105;
               const y = 440 + Math.sin(a) * r - 105;
               return `<div style=\"position:absolute;left:${x}px;top:${y}px;width:210px;height:210px;border-radius:50%;overflow:hidden;border:2px solid rgba(173,227,255,.6);box-shadow:0 10px 30px rgba(0,0,0,.4)\">${tile(b)}</div>`;
             }).join('')}
             <div style="position:absolute;left:280px;top:280px;width:320px;height:320px;border-radius:50%;overflow:hidden;border:3px solid rgba(255,199,145,.75);box-shadow:0 20px 50px rgba(0,0,0,.55)">${tile(picks.alt)}</div>
           </div>
         </div>
         <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.0),rgba(0,0,0,.55) 72%,rgba(0,0,0,.78));z-index:2"></div>`
      ),
    },
    {
      name: '05_block_to_art_map_1600x2000.png',
      width: 1600,
      height: 2000,
      html: frameBase(
        'Block To Art Map',
        'One Height. One Ship. One Sky.',
        `<div style="position:absolute;inset:120px 40px 190px;display:grid;grid-template-columns:1fr 1fr;gap:16px;z-index:1">
          ${blocks.slice(0, 10).map((b) => `
            <div style="display:grid;grid-template-columns:180px 1fr;gap:10px;align-items:center;background:rgba(8,16,33,.65);border:1px solid #2f4169;border-radius:12px;padding:10px">
              <div style="width:180px;height:180px;border-radius:8px;overflow:hidden">${tile(b)}</div>
              <div>
                <div style="font-size:14px;color:#93b6e6;letter-spacing:.08em">BITCOIN BLOCK</div>
                <div style="font-size:34px;color:#d6edff;font-weight:700;line-height:1.1">${b}</div>
                <div style="margin-top:6px;font-size:14px;color:#ffd4a8">deterministic assignment</div>
              </div>
            </div>`).join('')}
         </div>
         <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.0),rgba(0,0,0,.55) 76%,rgba(0,0,0,.8));z-index:2"></div>`
      ),
    },
    {
      name: '06_hero_diptych_2160x1350.png',
      width: 2160,
      height: 1350,
      html: frameBase(
        'NATSHIPS',
        'Two Ceremonial Anchors',
        `<div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px;z-index:1">
          <div style="position:relative">${tile(102816)}<div style="position:absolute;left:14px;bottom:14px;color:#fff;font-size:24px;background:rgba(0,0,0,.42);padding:8px 12px;border-radius:8px">GENESIS · 102816</div></div>
          <div style="position:relative">${tile(112895)}<div style="position:absolute;left:14px;bottom:14px;color:#fff;font-size:24px;background:rgba(0,0,0,.42);padding:8px 12px;border-radius:8px">FINALE · 112895</div></div>
         </div>
         <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.0),rgba(0,0,0,.58) 70%,rgba(0,0,0,.8));z-index:2"></div>`
      ),
    },
  ];
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const blockSrc = await loadBlockDataUris();
  const srcFor = (block) => blockSrc.get(block);
  const specs = buildSpecs(srcFor);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const spec of specs) {
    await page.setViewportSize({ width: spec.width, height: spec.height });
    await page.setContent(spec.html, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(120);
    const outPath = path.join(outDir, spec.name);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`WROTE=${outPath}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
