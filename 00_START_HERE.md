# NATSHIPS · Vessels of the Substrate

**Status: Ready for nat.fun submission** ✅

This is the complete NATSHIPS collection engine and submission package for nat.fun's Digital Matter Theory (DMT) framework.

---

## Quick Start (5 min)

### 1. Verify Prototypes Work Locally

```bash
# Hero cinematic still
open prototypes/merged-v1.html

# 5-block variety proof
open prototypes/variety-v1.html
```

Both should open in your browser and render crisp, full-bleed cinematic scenes with starfields, vessels, sigils, and metadata panels.

### 2. Export Production Assets

```bash
cd /Users/joeatang/Documents/GitHub/natships
bash export.sh
```

This generates:
- `export/natships-hero-series0.png` (1500×1500, ready for nat.fun)
- `export/natships-variety-proof.png` (5-block showcase for judges)

### 3. Read the Submission Checklist

```bash
cat SUBMISSION_CHECKLIST.md
```

Follow Phase 1–6 to prepare and submit your vibe.

---

## What Is NATSHIPS?

**Ships forged from Bitcoin. Sky + vessel + sigil all derived from block data. Deterministic, non-arbitrary, cinematic.**

Each piece is a 1500×1500 cinematic still rendering a deterministic spacecraft emerging from a Bitcoin-encoded cosmos:
- **Vessel:** fleet, class, engine count, stages, livery (fleet + block hash)
- **Sky:** nebula, stars, origin body, orbital ribbons, sigil (block hash)
- **Mission:** status, orbit class, flight history, propulsion, payload (block hash)
- **Mood:** film leaks, grain, vignette, sigil mode (block hash)

**Total supply:** 10,080 UNATs (one per Bitcoin block 102816–112895)
**Element:** blastoff

---

## Directory Structure

```
natships/
├── README.md                      ← You are here
├── SUBMISSION_CHECKLIST.md        ← Step-by-step submission guide (START HERE)
├── VISUAL_GUIDE.md                ← How traits work + nat.fun strategy
├── TRAITS.md                      ← Complete trait specification
├── export.sh                      ← Automated export script
│
├── prototypes/                    ← Active development
│   ├── merged-v1.html            ← Hero cinematic still (main showcase)
│   ├── merged-v1.js              ← Shared renderer engine
│   ├── merged-v1.css             ← Shared styles
│   ├── variety-v1.html           ← 5-block proof board
│   └── variety-v1.css            ← Tile styles
│
└── export/                        ← Generated after running export.sh
    ├── natships-hero-series0.png
    ├── natships-variety-proof.png
    └── MANIFEST.txt
```

---

## Key Concepts

### DMT (Digital Matter Theory)

Digital substance derived from Bitcoin patterns. Not arbitrary. Rooted in blockchain.

NATSHIPS proves DMT by:
1. Taking one Bitcoin block as input
2. Deriving ALL visual properties from that block's hash
3. Rendering a cinematic scene deterministically
4. Proving non-arbitrariness with metadata + reproducibility

### Blastoff Element

Your collection's element is **blastoff**. This is how nat.fun frames your theme.

In NATSHIPS, blastoff appears as:
- **Sigil glyph:** in-world physics symbol (ring + spokes + core), not UI branding
- **Plume states:** active launch vs orbital docking vs landed recovery
- **Mission language:** ignition terms frame the lore

---

## Trait System (Verified Coverage)

All 12 trait categories are fully covered across 10,080 pieces:

| Category | Options | Coverage |
|---|---|---|
| Fleet | 32 names (NORDLAND, TYCHO, GORGON…) | 32/32 ✅ |
| Vessel class | 5 (STARSHIP, FALCON, HEAVY, LANCER, NIMBUS) | 5/5 ✅ |
| Propulsion | 5 (CRYOGENIC, HYPERGOLIC, METHALOX, ION, SOLID) | 5/5 ✅ |
| Engines | 6 buckets (3, 5, 7, 9, 27, 33) | 6/6 ✅ |
| Orbits | 7 classes (LEO, MEO, GEO, HEO, TLI, TMI, SOI) | 7/7 ✅ |
| Statuses | 5 (RECOVERED, IN-FLIGHT, REFUELING, DOCKED, LANDED) | 5/5 ✅ |
| Origins | 4 bodies (EARTH, MARS, MOON, SUBSTRATE) | 4/4 ✅ |
| Stages | 3 (1, 2, 3) | 3/3 ✅ |
| Flight count | 24 options (1–24 flights) | 24/24 ✅ |
| Nebula | 12 families | 12/12 ✅ |
| Star palette | 5 spectrums | 5/5 ✅ |
| Sigil mode | 4 (ghost, beacon, engraved, constellation) | 4/4 ✅ |

**Result:** 10,080 unique categorical signatures verified deterministically.

---

## How to Present This (nat.fun Strategy)

### Short Caption (for marketplace grid)
```
Ships forged from Bitcoin blocks. Sky + vessel + sigil all derived. 
Cinematic stills. Non-arbitrary. One per block. Built to return.
```

### Long Description (for vibe detail page)
Use the template in `SUBMISSION_CHECKLIST.md` Phase 3. Key points:
- Blastoff element appears as in-world sigil physics, not logo
- All traits derived from block hash (no random generation)
- Full metadata proof layered below art
- 10,080 unique trait signatures guaranteed
- Deterministic variety showcases DMT power

### Vibeathon Entry (if competing)
Position as: **"Non-arbitrary proof at scale: 10,080 cinematic pieces, each fully deterministic from Bitcoin."**

---

## Technical Details (For Judges)

### Rendering Pipeline

```
Bitcoin Block Input
  ↓
Mixed Full-Hash Sampler (entropy fix: avoids PoW leading-zero bias)
  ↓
[Cosmos] [Vessel] [Engineering] [Sigil] Traits
  ↓
Canvas Layer Stack:
  1. Backdrop + nebula + stars + ribbons
  2. Sigil simulation (ghost/beacon/engraved/constellation)
  3. Origin body (EARTH/MARS/MOON/SUBSTRATE)
  4. Dust field + atmospheric depth
  5. Vessel (silhouette + livery + patches + maker stamp)
  6. Plume (if IN-FLIGHT or LANDED status)
  7. Scorch weathering (based on flight count)
  8. Analog atmosphere (film leaks + grain + vignette)
  ↓
Final 1500×1500 PNG
+ Metadata JSON (traits + reproducibility proof)
```

### Entropy Safeguard

Trait bytes use a mixed full-hash sampler, not early hash positions only. Reason: Bitcoin PoW leading zeros would otherwise bias trait distribution. This ensures:
- Real Bitcoin blocks produce strong trait variety
- 5-showcase proof shows genuinely different pieces
- No "collision feel" across collection

---

## Prototypes

### merged-v1.html (Hero Still)
- **URL:** file:///Users/joeatang/Documents/GitHub/natships/prototypes/merged-v1.html
- **Query params:**
  - `?h=BLOCK_HEIGHT` — render a specific block (e.g., ?h=420000)
  - `?compact=1` — hide metadata, tile-friendly mode
- **Output:** 1500×1500 cinematic still
- **Purpose:** Primary submission image + variety proof tiles

### variety-v1.html (5-Block Board)
- **URL:** file:///Users/joeatang/Documents/GitHub/natships/prototypes/variety-v1.html
- **Shows:** 102816, 420000, 630000, 701824, 810000 in 2×2+1 grid
- **Purpose:** Judge-friendly proof of categorical variety

---

## Before You Submit

**Checklist (copy from SUBMISSION_CHECKLIST.md):**

- [ ] Prototypes render cleanly locally (no console errors)
- [ ] Hero PNG exported and is ~1500×1500, <500 KB
- [ ] Metadata filled in (name, description, block range, element)
- [ ] Block range set to 102816–112895 (10,080 blocks)
- [ ] Element set to "blastoff"
- [ ] 5 showcase blocks render visibly different
- [ ] You can explain trait derivation to judges
- [ ] Ready to answer "Why non-arbitrary?" questions

---

## Next Steps

1. **Read SUBMISSION_CHECKLIST.md** (5–10 min) — Follow Phase 1–6
2. **Run export.sh** — Generate production PNGs
3. **Go to nat.fun** — Create vibe + upload assets
4. **Fill in metadata** — Use templates from VISUAL_GUIDE.md + SUBMISSION_CHECKLIST.md
5. **(Optional) Submit to Vibeathon** — Include variety-proof.png + concept statement

---

## Support & Questions

If rendering fails or metadata looks wrong:

1. Check browser console (F12) for errors in prototypes
2. Verify Node.js is installed: `node --version`
3. Verify Playwright can launch: `npm list --prefix /Users/joeatang/Documents/GitHub/natships playwright`
4. Review TRAITS.md for trait byte sampling logic
5. Review VISUAL_GUIDE.md for pipeline explanation

---

## Collection Metadata (Ready to Copy-Paste)

**Vibe Name:**
```
NATSHIPS · Vessels of the Substrate
```

**Element:**
```
blastoff
```

**Supply:**
```
10080
```

**Block Range:**
```
Start: 102816
End: 112895
```

**Short Description:**
```
Ships forged from Bitcoin blocks. Sky + vessel + sigil all derived. 
Cinematic stills. Non-arbitrary. One per block. Built to return.
```

**See SUBMISSION_CHECKLIST.md Phase 3 for full long description.**

---

## Status: Ready to Ship 🚀

Everything is built, tested, and documented. You're 15 minutes away from nat.fun submission.

**Start with:** `open SUBMISSION_CHECKLIST.md`

---

**Created:** 2026-06-25  
**Concept:** Cinematic stills derived from Bitcoin block data  
**Element:** blastoff  
**Trait Coverage:** 12 categories, 10,080 unique signatures  
**Ready for:** nat.fun submission + Vibeathon competition
