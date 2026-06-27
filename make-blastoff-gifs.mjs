import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const repo = '/Users/joeatang/Documents/GitHub/natships';
const galleryDir = path.join(repo, 'gallery');
const outDir = path.join(galleryDir, 'gifs');
const framesRoot = path.join(outDir, 'frames');

const variants = [
  {
    id: 'v1',
    name: 'NATSHIPS_BLASTOFF_V1.gif',
    source: 'natships-111774.png',
    fps: 20,
    seconds: 3.2,
    title: 'BLASTOFF',
    titleColor: '#8ce7ff',
    mode: 'countdown',
  },
  {
    id: 'v2',
    name: 'NATSHIPS_BLASTOFF_V2.gif',
    source: 'natships-112895.png',
    fps: 18,
    seconds: 3.0,
    title: 'NATSHIPS',
    titleColor: '#d7f2ff',
    mode: 'warp',
  },
  {
    id: 'v3',
    name: 'NATSHIPS_BLASTOFF_V3.gif',
    source: 'natships-102816.png',
    fps: 16,
    seconds: 3.4,
    title: 'VESSELS OF THE SUBSTRATE',
    titleColor: '#f3d1a7',
    mode: 'ceremonial',
  },
];

function z(n) {
  return String(n).padStart(4, '0');
}

async function ensureDirs() {
  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(framesRoot, { recursive: true });
}

async function dataUri(filePath) {
  const b = await fs.readFile(filePath);
  return `data:image/png;base64,${b.toString('base64')}`;
}

function htmlTemplate({ imageDataUri, title, titleColor, mode }) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  html, body { margin:0; width:100%; height:100%; background:#050915; }
  body { display:grid; place-items:center; }
  canvas { width:1080px; height:1080px; display:block; }
</style>
</head>
<body>
<canvas id="c" width="1080" height="1080"></canvas>
<script>
  const MODE = ${JSON.stringify(mode)};
  const TITLE = ${JSON.stringify(title)};
  const TITLE_COLOR = ${JSON.stringify(titleColor)};
  const img = new Image();
  img.src = ${JSON.stringify(imageDataUri)};

  const c = document.getElementById('c');
  const ctx = c.getContext('2d');

  function easeOutCubic(x){ return 1 - Math.pow(1 - x, 3); }

  function drawGlow(alpha, color) {
    const g = ctx.createRadialGradient(540, 760, 30, 540, 760, 420);
    g.addColorStop(0, color.replace('ALPHA', String(alpha)));
    g.addColorStop(0.45, color.replace('ALPHA', String(alpha * 0.3)));
    g.addColorStop(1, 'rgba(255,140,60,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1080);
  }

  function drawCountdown(t) {
    const n = t < 0.42 ? '3' : t < 0.84 ? '2' : t < 1.26 ? '1' : '';
    if (!n) return;
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.font = '700 210px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(140,220,255,0.65)';
    ctx.shadowBlur = 36;
    ctx.fillText(n, 540, 510);
    ctx.restore();
  }

  window.renderAt = function(t) {
    const launchStart = 1.2;
    const p = Math.max(0, Math.min(1, (t - launchStart) / 1.9));
    const boost = easeOutCubic(p);

    let scale = 1.18;
    let x = 540;
    let y = 540;
    let shake = 0;

    if (MODE === 'countdown') {
      shake = t < launchStart ? 16 * Math.sin(t * 65) : 0;
      y = 540 - boost * 250;
      scale = 1.22;
    } else if (MODE === 'warp') {
      const warp = easeOutCubic(Math.min(1, t / 2.2));
      y = 540 - warp * 210;
      scale = 1.26 + warp * 0.06;
      shake = 5 * Math.sin(t * 40);
    } else {
      const ascend = easeOutCubic(Math.min(1, t / 3.0));
      y = 560 - ascend * 300;
      scale = 1.2;
      shake = 3 * Math.sin(t * 18);
    }

    ctx.clearRect(0, 0, 1080, 1080);

    // Base art plate, zoomed and moving upward for blastoff feel.
    ctx.save();
    ctx.translate(x + shake, y);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -540, -540, 1080, 1080);
    ctx.restore();

    // Exhaust / launch bloom.
    drawGlow(0.55 + p * 0.35, 'rgba(255,170,90,ALPHA)');

    if (MODE === 'warp' && t > 1.1 && t < 1.9) {
      ctx.fillStyle = 'rgba(180,240,255,0.12)';
      ctx.fillRect(0, 0, 1080, 1080);
    }

    if (MODE === 'countdown') {
      drawCountdown(t);
    }

    // Bottom title lockup.
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = 'rgba(0,0,0,0.44)';
    ctx.fillRect(0, 890, 1080, 190);
    ctx.font = MODE === 'ceremonial' ? '700 66px Arial' : '700 120px Arial';
    ctx.fillStyle = TITLE_COLOR;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 12;
    ctx.fillText(TITLE, 540, MODE === 'ceremonial' ? 960 : 965);
    ctx.restore();

    if (MODE === 'ceremonial') {
      ctx.save();
      ctx.font = '700 72px Arial';
      ctx.fillStyle = '#9fe9ff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('NATSHIPS', 540, 835);
      ctx.restore();
    }
  };
</script>
</body>
</html>`;
}

function ffmpegEncode(framesDir, fps, outGif, id) {
  const mp4 = path.join(outDir, `${id}.mp4`);
  const palette = path.join(outDir, `${id}_palette.png`);
  execSync(`ffmpeg -y -framerate ${fps} -i ${framesDir}/frame_%04d.png -c:v libx264 -pix_fmt yuv420p ${mp4}`, { stdio: 'inherit' });
  execSync(`ffmpeg -y -i ${mp4} -vf "fps=${fps},scale=720:-1:flags=lanczos,palettegen=reserve_transparent=0" ${palette}`, { stdio: 'inherit' });
  execSync(`ffmpeg -y -i ${mp4} -i ${palette} -lavfi "fps=${fps},scale=720:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" ${outGif}`, { stdio: 'inherit' });
}

async function renderVariant(browser, v) {
  const framesDir = path.join(framesRoot, v.id);
  await fs.rm(framesDir, { recursive: true, force: true });
  await fs.mkdir(framesDir, { recursive: true });

  const imgData = await dataUri(path.join(galleryDir, v.source));
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  await page.setContent(htmlTemplate({ imageDataUri: imgData, title: v.title, titleColor: v.titleColor, mode: v.mode }), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(120);

  const total = Math.round(v.seconds * v.fps);
  for (let i = 0; i < total; i += 1) {
    const t = i / v.fps;
    await page.evaluate((time) => window.renderAt(time), t);
    await page.screenshot({ path: path.join(framesDir, `frame_${z(i)}.png`) });
  }

  await page.close();

  const outGif = path.join(outDir, v.name);
  ffmpegEncode(framesDir, v.fps, outGif, v.id);
}

async function main() {
  await ensureDirs();
  const browser = await chromium.launch({ headless: true });
  for (const v of variants) {
    await renderVariant(browser, v);
    console.log(`WROTE_GIF=${path.join(outDir, v.name)}`);
  }
  await browser.close();

  const files = await fs.readdir(outDir);
  for (const f of files.filter((x) => x.endsWith('.gif'))) {
    const st = await fs.stat(path.join(outDir, f));
    console.log(`GIF ${f} ${(st.size / (1024 * 1024)).toFixed(2)}MB`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
