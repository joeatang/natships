import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const repo = '/Users/joeatang/Documents/GitHub/natships';
const galleryDir = path.join(repo, 'gallery');
const outDir = path.join(galleryDir, 'gifs');
const framesDir = path.join(outDir, 'frames', 'v2_shipmove');

function z(n) {
  return String(n).padStart(4, '0');
}

async function main() {
  await fs.mkdir(framesDir, { recursive: true });
  const sourcePath = path.join(galleryDir, 'natships-112895.png');
  const source = await fs.readFile(sourcePath);
  const sourceDataUri = `data:image/png;base64,${source.toString('base64')}`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });

  await page.setContent(`<!doctype html>
  <html>
  <head><meta charset="utf-8"/><style>html,body{margin:0;background:#050915}canvas{display:block}</style></head>
  <body><canvas id="c" width="1080" height="1080"></canvas>
  <script>
    const img = new Image();
    img.src = ${JSON.stringify(sourceDataUri)};
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');

    function easeOutCubic(x){ return 1 - Math.pow(1 - x, 3); }

    // Approximate ship envelope from NATSHIPS composition.
    const shipBox = { x: 540, y: 165, w: 360, h: 760 };

    function drawExhaust(cx, y, p) {
      const plume = ctx.createRadialGradient(cx, y, 12, cx, y + 150, 210 + p * 140);
      plume.addColorStop(0, 'rgba(255,245,210,0.95)');
      plume.addColorStop(0.25, 'rgba(255,174,88,0.72)');
      plume.addColorStop(0.58, 'rgba(255,92,44,0.30)');
      plume.addColorStop(1, 'rgba(255,92,44,0)');
      ctx.fillStyle = plume;
      ctx.beginPath();
      ctx.ellipse(cx, y + 130 + p * 80, 58 + p * 24, 220 + p * 90, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    window.renderAt = function(t) {
      const launchAt = 0.95;
      const p = t <= launchAt ? 0 : Math.min(1, (t - launchAt) / 1.7);
      const e = easeOutCubic(p);

      // Keep composition anchored in 1:1 while adding subtle camera energy.
      const camShake = t < launchAt ? Math.sin(t * 70) * 7 : Math.sin(t * 50) * (5 + 3 * (1 - p));

      // Base frame slightly zoomed to feel premium.
      ctx.clearRect(0, 0, 1080, 1080);
      ctx.save();
      ctx.translate(540 + camShake * 0.35, 540 + Math.sin(t * 1.6) * 1.4);
      ctx.scale(1.24, 1.24);
      ctx.drawImage(img, -540, -540, 1080, 1080);
      ctx.restore();

      // Lift the ship layer inside the frame.
      const lift = e * 230;
      const sx = shipBox.x;
      const sy = shipBox.y;
      const sw = shipBox.w;
      const sh = shipBox.h;
      const dx = shipBox.x + camShake * 0.8;
      const dy = shipBox.y - lift;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(dx + sw * 0.5, dy + sh * 0.48, sw * 0.44, sh * 0.52, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, sw, sh);
      ctx.restore();

      // Blend seam softly so the lift feels native.
      const seam = ctx.createRadialGradient(dx + sw * 0.5, dy + sh * 0.55, 80, dx + sw * 0.5, dy + sh * 0.55, 300);
      seam.addColorStop(0, 'rgba(255,255,255,0.08)');
      seam.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = seam;
      ctx.beginPath();
      ctx.ellipse(dx + sw * 0.5, dy + sh * 0.55, sw * 0.45, sh * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();

      if (p > 0) {
        drawExhaust(dx + sw * 0.52, dy + sh * 0.83, p);
      }

      if (t > 0.72 && t < 1.08) {
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(0, 0, 1080, 1080);
      }

      // Title lockup.
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.fillRect(0, 900, 1080, 180);
      ctx.font = '700 118px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#d7f2ff';
      ctx.shadowColor = 'rgba(120,220,255,0.46)';
      ctx.shadowBlur = 20;
      ctx.fillText('NATSHIPS', 540, 965);
    };
  </script></body></html>`, { waitUntil: 'domcontentloaded' });

  const fps = 18;
  const seconds = 3.0;
  const total = Math.round(fps * seconds);

  for (let i = 0; i < total; i += 1) {
    const t = i / fps;
    await page.evaluate((time) => window.renderAt(time), t);
    await page.screenshot({ path: path.join(framesDir, `frame_${z(i)}.png`) });
  }

  await browser.close();

  const mp4 = path.join(outDir, 'v2_shipmove.mp4');
  const palette = path.join(outDir, 'v2_shipmove_palette.png');
  const gif = path.join(outDir, 'NATSHIPS_BLASTOFF_V2_SHIPMOVE.gif');

  execSync(`ffmpeg -y -framerate ${fps} -i ${framesDir}/frame_%04d.png -c:v libx264 -pix_fmt yuv420p ${mp4}`, { stdio: 'inherit' });
  execSync(`ffmpeg -y -i ${mp4} -vf "fps=${fps},scale=720:-1:flags=lanczos,palettegen=reserve_transparent=0" -frames:v 1 ${palette}`, { stdio: 'inherit' });
  execSync(`ffmpeg -y -i ${mp4} -i ${palette} -lavfi "fps=${fps},scale=720:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" ${gif}`, { stdio: 'inherit' });

  const st = await fs.stat(gif);
  console.log(`WROTE_GIF=${gif}`);
  console.log(`SIZE_MB=${(st.size / (1024 * 1024)).toFixed(2)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
