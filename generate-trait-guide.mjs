import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

const repo = '/Users/joeatang/Documents/GitHub/natships';
const galleryDir = path.join(repo, 'gallery');
const prototypePath = path.join(repo, 'prototypes', 'merged-v1.html');

const blocks = [
  102816, 104500, 107200, 109000, 110500,
  111337, 111774, 112009, 112016, 102884,
  103481, 112895, 105678, 108345, 110999,
  103210, 106060, 109420, 112420,
];

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pick(meta, key) {
  return meta[key] ?? '-';
}

function buildHtml(rows) {
  const generated = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const coverage = new Set(rows.map((r) => pick(r.meta, 'Origin body'))).size;

  const overviewRows = rows.map((r) => {
    const m = r.meta;
    return `<tr>
      <td>${r.block.toLocaleString()}</td>
      <td>${esc(pick(m, 'Hash prefix'))}</td>
      <td>${esc(pick(m, 'Vessel'))}</td>
      <td>${esc(pick(m, 'Origin body'))}</td>
      <td>${esc(pick(m, 'Sigil style'))}</td>
      <td>${esc(pick(m, 'Hi mark rarity'))}</td>
    </tr>`;
  }).join('\n');

  const cards = rows.map((r) => {
    const m = r.meta;
    const traits = [
      ['Vessel', pick(m, 'Vessel')],
      ['Fleet', pick(m, 'Fleet')],
      ['Origin', pick(m, 'Origin body')],
      ['World sign', pick(m, 'World sign')],
      ['Status', pick(m, 'Status')],
      ['Orbit', pick(m, 'Orbit class')],
      ['Propulsion', pick(m, 'Propulsion')],
      ['Sigil', pick(m, 'Sigil style')],
      ['Phase', pick(m, 'Journey phase')],
      ['Destination', pick(m, 'Destination marker')],
      ['Nebula', pick(m, 'Nebula family')],
      ['Hi rarity', pick(m, 'Hi mark rarity')],
    ];

    return `<article class="card">
      <img src="./natships-${r.block}.png" alt="NATSHIPS block ${r.block}" />
      <div class="card-head">
        <h3>Block ${r.block.toLocaleString()}</h3>
        <p>${esc(pick(m, 'Hash prefix'))}</p>
      </div>
      <div class="traits">
        ${traits.map(([k, v]) => `<div class="t"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}
      </div>
    </article>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NATSHIPS Trait Guide</title>
  <style>
    @page { size: A4 portrait; margin: 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Space Grotesk", "JetBrains Mono", system-ui, sans-serif;
      color: #e7eeff;
      background: radial-gradient(circle at 15% -10%, #203870 0%, transparent 36%),
                  radial-gradient(circle at 92% -12%, #4e2f44 0%, transparent 30%),
                  #070b16;
    }
    .wrap { padding: 20px; }
    .hero {
      border: 1px solid #2a3658;
      border-radius: 14px;
      background: linear-gradient(180deg, rgba(20,29,52,.95), rgba(10,15,31,.93));
      padding: 18px;
      margin-bottom: 16px;
    }
    h1 { margin: 0; font-size: 30px; letter-spacing: .4px; color: #8ce7ff; }
    .sub { margin: 6px 0 0; color: #b7caea; font-size: 13px; }
    .pillrow { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px; }
    .pill {
      font-size: 11px; color: #cce6ff; border: 1px solid #334772; border-radius: 999px;
      padding: 6px 10px; background: rgba(9,16,32,.72);
    }
    .explain {
      margin-top: 12px; font-size: 12px; line-height: 1.45; color: #d8e5ff;
      border-left: 3px solid #80e5ff; padding-left: 10px;
    }
    .section { margin-top: 16px; }
    .section h2 { margin: 0 0 8px; font-size: 18px; color: #ffd5a8; }

    table {
      width: 100%; border-collapse: collapse; font-size: 10px;
      border: 1px solid #2f4167; border-radius: 10px; overflow: hidden;
      background: rgba(7, 12, 26, .82);
    }
    th, td { border-bottom: 1px solid #243353; padding: 6px 7px; text-align: left; }
    th { background: rgba(20, 32, 58, .88); color: #a6d9ff; font-weight: 700; }
    tr:last-child td { border-bottom: 0; }

    .grid {
      margin-top: 10px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .card {
      border: 1px solid #2d3d61;
      border-radius: 12px;
      overflow: hidden;
      background: linear-gradient(180deg, rgba(18,26,47,.95), rgba(8,13,27,.95));
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .card img { width: 100%; display: block; aspect-ratio: 1/1; object-fit: cover; }
    .card-head { padding: 8px 10px 7px; border-top: 1px solid #2f436f; }
    .card-head h3 { margin: 0; font-size: 13px; color: #a3ebff; }
    .card-head p { margin: 2px 0 0; font-size: 10px; color: #91a9d3; }
    .traits {
      padding: 8px 10px 10px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px 8px;
    }
    .t { border: 1px solid #2a3a5c; border-radius: 7px; padding: 5px 6px; background: rgba(9,14,29,.6); }
    .t span { display: block; font-size: 9px; color: #8da8d6; }
    .t b { display: block; margin-top: 2px; font-size: 10px; color: #e4eeff; font-weight: 600; }

    .footer {
      margin-top: 12px;
      font-size: 10px;
      color: #8fa5cf;
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>NATSHIPS Trait Guide</h1>
      <p class="sub">Visual Assignment Map from Bitcoin Blocks · Generated ${generated}</p>
      <div class="pillrow">
        <span class="pill">Range mode: blocks 102,816 → 112,895 (10,080 total)</span>
        <span class="pill">Guide sample: ${rows.length} blocks</span>
        <span class="pill">Unique origin bodies in sample: ${coverage}</span>
        <span class="pill">Deterministic: same block always yields same traits</span>
      </div>
      <p class="explain">
        Each block height is converted to a block hash, then hash bytes deterministically assign vessel, sky, origin body,
        propulsion, mission phase, sigil style, and rarity marker. No hand-tuning per image. This PDF shows a visual subset
        of the collection and the exact trait values tied to each sampled Bitcoin block.
      </p>
    </section>

    <section class="section">
      <h2>Block → Trait Overview</h2>
      <table>
        <thead>
          <tr>
            <th>Block</th>
            <th>Hash Prefix</th>
            <th>Vessel</th>
            <th>Origin</th>
            <th>Sigil</th>
            <th>Hi Rarity</th>
          </tr>
        </thead>
        <tbody>
          ${overviewRows}
        </tbody>
      </table>
    </section>

    <section class="section">
      <h2>Visual Variety Cards</h2>
      <div class="grid">
        ${cards}
      </div>
    </section>

    <div class="footer">NATSHIPS · Vessels of the Substrate · Trait Guide PDF</div>
  </div>
</body>
</html>`;
}

async function collectRows() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1500, height: 2200 } });
  const rows = [];

  for (const block of blocks) {
    const url = `file://${prototypePath}?h=${block}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const meta = await page.evaluate(() => {
      const map = {};
      document.querySelectorAll('.meta-card').forEach((card) => {
        const key = card.querySelector('.k')?.textContent?.trim();
        const val = card.querySelector('.v')?.textContent?.trim();
        if (key) map[key] = val || '';
      });
      return map;
    });

    rows.push({ block, meta });
  }

  await browser.close();
  return rows;
}

async function main() {
  const rows = await collectRows();
  const html = buildHtml(rows);
  const htmlPath = path.join(galleryDir, 'trait-guide.html');
  const pdfPath = path.join(galleryDir, 'NATSHIPS_TRAIT_GUIDE.pdf');
  await fs.writeFile(htmlPath, html, 'utf8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
  });
  await browser.close();

  console.log(`WROTE_HTML=${htmlPath}`);
  console.log(`WROTE_PDF=${pdfPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
