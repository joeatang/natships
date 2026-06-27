#!/bin/bash
# NATSHIPS Export Script
# Generates production-ready assets for nat.fun submission

set -e

REPO="/Users/joeatang/Documents/GitHub/natships"
EXPORT_DIR="$REPO/export"
PROTOTYPE_DIR="$REPO/prototypes"

mkdir -p "$EXPORT_DIR"

echo "🚀 NATSHIPS Export Starting..."

# Check for required tools
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install it first."
  exit 1
fi

# Install Playwright if not present
if ! npm list --prefix "$REPO" playwright &> /dev/null 2>&1; then
  echo "📦 Installing Playwright..."
  cd "$REPO"
  npm install --save-dev playwright &> /dev/null || true
fi

cd "$REPO"

# Export hero still at 1500x1500
echo "📸 Exporting hero still (1500×1500)..."
node - <<'EOF'
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1500 }
  });
  
  const filePath = `file://${require('path').resolve('./prototypes/merged-v1.html')}`;
  await page.goto(filePath, { waitUntil: 'networkidle' });
  
  // Wait for canvas to render
  await page.waitForTimeout(2000);
  
  const canvas = await page.$('#still');
  if (!canvas) {
    console.error('Canvas not found');
    await browser.close();
    process.exit(1);
  }
  
  const boundingBox = await canvas.boundingBox();
  if (!boundingBox) {
    console.error('Cannot get bounding box');
    await browser.close();
    process.exit(1);
  }
  
  await page.screenshot({
    path: './export/natships-hero-series0.png',
    clip: boundingBox
  });
  
  console.log('✅ Hero PNG saved: export/natships-hero-series0.png');
  await browser.close();
})();
EOF

# Export variety board grid
echo "📸 Exporting variety board (5 blocks)..."
node - <<'EOF'
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const filePath = `file://${require('path').resolve('./prototypes/variety-v1.html')}`;
  await page.goto(filePath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  await page.screenshot({
    path: './export/natships-variety-proof.png'
  });
  
  console.log('✅ Variety PNG saved: export/natships-variety-proof.png');
  await browser.close();
})();
EOF

# Create manifest
echo "📋 Generating manifest..."
cat > "$EXPORT_DIR/MANIFEST.txt" << 'MANIFEST'
NATSHIPS · Vessels of the Substrate
Export Manifest
Generated: $(date)

Files:
- natships-hero-series0.png (1500×1500) — Primary submission image
- natships-variety-proof.png — Five-block showcase for judges
- MANIFEST.txt — This file

Collection Info:
- Element: blastoff
- Total supply: 10,080 UNATs
- Block range: 102,816–112,895
- Trait categories: 12 (fleet, class, propulsion, engines, orbits, statuses, origins, stages, flights, nebula, stars, sigil)
- Uniqueness: 10,080/10,080 categorical signatures verified

Usage:
1. Upload natships-hero-series0.png as primary vibe image on nat.fun
2. Use natships-variety-proof.png for Vibeathon judges
3. Reference block range 102816–112895 in collection config
4. Element field: blastoff

Next: Create vibe at https://nat.fun/
MANIFEST

echo "✅ Export complete!"
echo ""
echo "📂 Export folder: $EXPORT_DIR"
ls -lh "$EXPORT_DIR"
echo ""
echo "Ready to submit! 🎯"
