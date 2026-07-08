// Render high-resolution UNATOM PNGs for the BlockRunners P3 thread.
// Uses the natsigil-full-preview.html page as the source of truth so what
// marketing sees matches what you approved in-chat.
//
// Usage: node design/render-blockrunners-assets.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, 'blockrunners');
mkdirSync(OUT_DIR, { recursive: true });

const URL = 'http://localhost:7920/design/natsigil-full-preview.html';
const NAMES = [
  '01_blk-111-ember_natsigil-anchor',
  '02_blk-1111-chalk_palindrome-anchor',
  '03_blk-666-flameborn-natsigil_HERO',
  '04_blk-8562-aqua_natsigil',
  '05_blk-3113-ember_natsigil',
  '06_blk-8542-rust-flameborn-natsigil',
];

const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: 2 });
const page = await context.newPage();
await page.setViewportSize({ width: 1400, height: 1200 });
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('.card svg', { timeout: 5000 });

const cards = await page.$$('.card');
console.log(`  ${cards.length} cards found`);

for (let i = 0; i < cards.length; i++) {
  const svg = await cards[i].$('svg');
  const outPath = join(OUT_DIR, `${NAMES[i]}.png`);
  await svg.screenshot({ path: outPath, omitBackground: true });
  console.log(`  wrote ${NAMES[i]}.png`);
}

// Also produce a wide hero image showing all 6 in a grid (for Notion header)
const gridEl = await page.$('#grid');
await gridEl.screenshot({ path: join(OUT_DIR, '00_grid-all-six.png') });
console.log('  wrote 00_grid-all-six.png');

// Solo NAT SIGIL close-up from the scheme-grid page (for the "reveal" tweet)
await page.goto('http://localhost:7920/design/natsigil-scheme-grid.html', { waitUntil: 'networkidle' });
await page.waitForSelector('#ref-natsigil', { timeout: 5000 });

const refStrip = await page.$('.ref-strip');
if (refStrip) {
  await refStrip.screenshot({ path: join(OUT_DIR, '07_nat-sigil-solo-reveal.png') });
  console.log('  wrote 07_nat-sigil-solo-reveal.png');
}

const schemeGrid = await page.$('#scheme-grid');
if (schemeGrid) {
  await schemeGrid.screenshot({ path: join(OUT_DIR, '08_nat-sigil-thirteen-schemes.png') });
  console.log('  wrote 08_nat-sigil-thirteen-schemes.png');
}

await browser.close();
console.log(`\n  all images → ${OUT_DIR}`);
