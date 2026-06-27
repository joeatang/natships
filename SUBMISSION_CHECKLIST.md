# NATSHIPS Submission Checklist

Complete this checklist before creating your vibe on nat.fun. Each item has exact actions and validation steps.

## Phase 1: Prototype Verification (5 min)

### ✅ Single Still Render Test
**Action:** Open and verify the hero cinematic still renders cleanly.

```
open /Users/joeatang/Documents/GitHub/natships/prototypes/merged-v1.html
```

**Checklist:**
- [ ] Page loads without errors (check browser console)
- [ ] Canvas renders 1500×1500 square image
- [ ] Vessel is visible in center-right area
- [ ] Sigil symbol appears in upper-left quadrant
- [ ] All metadata fields populate below canvas
- [ ] Nostalgic film grain and vignette visible

**Expected appearance:**
- Full-bleed cinematic space scene
- Deterministic starfield
- Silhouette vessel with plume (or no plume based on status)
- Orange/gold sigil glyph with 8 nodes
- Metadata grid shows all traits

### ✅ Variety Board Test
**Action:** Open and verify all 5 showcase blocks render in tile mode.

```
open /Users/joeatang/Documents/GitHub/natships/prototypes/variety-v1.html
```

**Checklist:**
- [ ] Page loads with 5 iframes
- [ ] Each tile loads its own canvas independently
- [ ] Tiles show visibly different vessel states, nebulas, and sigils
- [ ] Tiles are labeled with block heights (102816, 420000, etc.)
- [ ] No console errors or blank renders

**Visual differentiation to spot:**
- Different nebula colors per tile
- Different vessel classes (STARSHIP, FALCON, HEAVY, etc.)
- Different engine/propulsion/status combos
- Different sigil modes and rotations

---

## Phase 2: Asset Export (10 min)

### ✅ Generate Hero Still PNG

You need one high-quality 1500×1500 PNG for the nat.fun vibe listing. This is the image people see when browsing collections.

**Action: Use browser screenshot to export the hero still.**

1. Open prototypes/merged-v1.html in Chrome/Safari
2. Open DevTools (Cmd+Option+I)
3. Press Cmd+Shift+P, search "Capture node screenshot"
4. Click on the canvas element (#still)
5. Save as `natships-hero-series0.png` to Desktop

**Or use Playwright (if you have Node.js + Playwright):**
```bash
cd /Users/joeatang/Documents/GitHub/natships
npm install --save-dev playwright
node - <<'EOF'
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file:///Users/joeatang/Documents/GitHub/natships/prototypes/merged-v1.html');
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: '/Users/joeatang/Desktop/natships-hero-series0.png',
    fullPage: false
  });
  await browser.close();
})();
EOF
```

**Validation:**
- [ ] PNG is ~1500×1500 px
- [ ] File size is 200–500 KB (not bloated)
- [ ] All visual elements are crisp and visible
- [ ] Metadata panel is NOT visible in exported PNG (pure art)

---

## Phase 3: Metadata & Description Prep (10 min)

### ✅ Collection Metadata Template

Use this template for your nat.fun vibe description. Replace `[BRACKETS]` with actual values.

**Vibe Name:**
```
NATSHIPS · Vessels of the Substrate
```

**Short Description (appears in grid):**
```
Ships forged from Bitcoin blocks. Sky + vessel + sigil all derived. Cinematic still gallery. One per Bitcoin block. Built to return.
```

**Long Description (detailed view on vibe page):**
```
NATSHIPS: Vessels of the Substrate

Each piece is a cinematic still rendering of a deterministic spacecraft emerging from a Bitcoin-encoded cosmos.

How it works:
- One Bitcoin block → one vessel
- Block hash determines: fleet, class, engine config, flight history, origin body, nebula, sigil mode, mission state
- Art emerges from data. No hand-tuning per piece.

Why this matters:
- Proves Digital Matter Theory (DMT) by grounding digital substance in Bitcoin patterns
- Blastoff element: sigil simulation as in-world physics glyph, not pasted branding
- Full-bleed cinematic composition (no card frame, no UI overlay on art)
- Metadata layer shows complete engineering + cosmology profile
- Deterministic variety: 10,080+ unique trait signatures guaranteed

Visual design cues:
- Nostalgic analog atmosphere (film leaks, grain, vignette)
- Confidence-driven silhouette composition
- Warm + cool color interplay (stars, nebulas, plume)
- One sigil per render with 4 simulation modes

Trait coverage:
- 32 fleets × 5 vessel classes × 5 propulsion types × 6 engine buckets × 7 orbits × 5 statuses × 4 origins × 3 stages × 24 flight counts × 12 nebula families × 5 star palettes × 4 sigil modes

Result: ~11.6 billion categorical combinations before continuous variables.

Lore:
Ships of the digital substrate, each forged from a moment in Bitcoin's ledger. Some return. Some orbit forever. All are non-arbitrary, traced to one immutable block.

Element: blastoff
```

---

## Phase 4: nat.fun Upload Steps (15 min)

### ✅ Step 1: Create the Vibe

1. Go to https://nat.fun/
2. Click "Create" or navigate to Vibe creation UI
3. **Vibe Name:** NATSHIPS · Vessels of the Substrate
4. **Element:** blastoff
5. **Supply:** 10080 (this is your total issuance)

### ✅ Step 2: Upload Hero Image & Thumbnails

1. Use the hero PNG you exported in Phase 2
2. Upload as primary vibe image
3. If nat.fun has a thumb grid option:
   - Generate 5–10 variety-board crop thumbnails (240×240 or 300×300)
   - Or take 5 individual stills from variety board

### ✅ Step 3: Paste Descriptions

- Short description → collection grid text
- Long description → detailed vibe page

### ✅ Step 4: Set Up Block Mapping

On nat.fun, NATSHIPS uses **Range mode**:
- **Start block:** 102816
- **End block:** 112895
- **Total blocks:** 10080

This tells nat.fun the blocks that map to your 10,080 UNATs.

### ✅ Step 5: Finalize & Launch

- Review all metadata
- Set bonding curve parameters (if applicable)
- Click publish

---

## Phase 5: Vibeathon Submission (Optional, High-Priority)

If submitting to the DMT Vibeathon (https://takedmt.com/):

### ✅ Vibeathon Brief

1. **Entry Title:** NATSHIPS · Vessels of the Substrate
2. **Element:** blastoff
3. **Image Count:** 11–15 (1 hero + 10–14 variety/close-ups)
4. **Concept Statement:**
   > Ships forged from Bitcoin. Every vessel's sky, hull, and sigil are derived from one block's hash. No hand-tuning, all deterministic, all non-arbitrary. Visual proof that digital substance can emerge from Bitcoin patterns.

5. **Why DMT:** This collection proves Digital Matter Theory at scale by rendering 10,080 unique pieces from purely deterministic blockchain data, with zero arbitrary decisions.

---

## Phase 6: Pre-Submission Checklist (Final)

Before you click publish:

- [ ] Hero PNG is crisp, 1500×1500, <500 KB
- [ ] Metadata describes blastoff integration accurately
- [ ] Block range is set to 102816–112895 (10,080 blocks)
- [ ] Collection name is finalized
- [ ] Short description fits grid view (~100 chars)
- [ ] Long description includes trait coverage numbers
- [ ] You've verified the 5 showcase blocks render distinctly different
- [ ] Prototypes work locally without console errors
- [ ] Element is set to "blastoff"
- [ ] You're ready to answer Vibeathon judge questions about how traits are derived

---

## Common Questions You'll Get Asked

**Q: Why are all pieces non-arbitrary?**
A: Every visual property (fleet, nebula, sigil, status) derives from block hash bytes. No random number generator, no designer choice. Bitcoin determines art.

**Q: How do I verify a piece is really tied to block X?**
A: Open prototypes/merged-v1.html?h=X (where X is a block height), see the same render. Trait metadata shows exact mapping.

**Q: What if two blocks map to the same artwork?**
A: Mathematically impossible in our sample. The 10,080 audit shows 10,080 unique categorical signatures.

**Q: Is blastoff just a logo?**
A: No. Blastoff appears as an in-world sigil glyph with 4 simulation modes (ghost/beacon/engraved/constellation), tied to engine behavior and mission state. It's part of the physics language, not UI.

**Q: Why cinematic stills instead of cards?**
A: Card format is too adjacent to Hi Imprints sibling project. Cinematic style is inviting, nostalgic, and supports full DMT depth without gatekeeping.

---

## When You're Ready to Submit

Once all checkboxes above are done, message me or proceed directly to nat.fun.

**Do NOT proceed unless:**
- Prototypes render cleanly locally
- Hero PNG is exported and crisp
- Metadata templates are filled in
- You understand trait derivation well enough to answer judge questions
- You've reviewed VISUAL_GUIDE.md and TRAITS.md

When ready, I can help you:
1. Generate additional variety stills for Vibeathon submission
2. Create a technical proof document for judges
3. Troubleshoot any rendering issues before upload

---

**Status:** Ready to proceed? ✅

**Next command:** Let me know which phase you're on, and I'll support you live.
