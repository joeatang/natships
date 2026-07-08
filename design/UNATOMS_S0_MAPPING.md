# UNATOMS · Series 0 · Field-Driven Trait Mapping Design

**Status**: draft for redline — no code changes yet.
**Author**: Copilot (planning pass, 2026-07-07)
**Scope**: how Bitcoin block header bytes will drive every UNATOM trait for the 10,080-piece Series 0.

---

## 0. TL;DR

Series 0 UNATOMS are painted from real Bitcoin. Every trait dial is decided by a specific byte of a specific DMT-canonical block-header field. Rarity is discovered by counting the collection after the fact, not authored. Two curated height-anchors (Genesis, BLAST-OFF), one invented rare element (`Hi` = Hash Intersect), one new NAT-logo eye (`natSigil` — display name NAT SIGIL), and one honest constraint: every combination has to look great, guaranteed by a stress-test grid before mint.

---

## 1. Series 0 boundaries (locked)

- Block range: **1..10,080** (Bitcoin's first ~88 days, Jan 9 – Apr 6, 2009 — verified from real headers)
- Supply: **10,080** UNATOMs, one per block
- Sourcing: block headers pulled from public Bitcoin data (mempool.space) and bundled as [design/series0-headers.json](series0-headers.json) (~2.7MB uncompressed, ~800KB gzipped) so the renderer stays offline-deterministic forever
- Reproducibility: given `{blk: N}` + `series0-headers.json`, the SVG is byte-identical everywhere, forever
- Verified 2026-07-07: 10,080 sequential headers pulled clean, zero gaps

---

## 2. Field palette — DMT-canonical only

All driver fields come from the [.element Registry](https://digital-matter-theory.gitbook.io/digital-matter-theory/introduction/digital-elements/.element-registry.md) (fields 0–15, block-level). No invented fields. Aligned with Trac Core indexing and mscribe records.

**Live for Series 0 (5 fields + 1 bonus):**

| # | Field | Type | Role in art |
|---|---|---|---|
| 0 | `block_hash` | 32B hex | halo hue, `Hi`-element gate, ecoMark |
| 4 | `height` | number | identity, meme anchors (666/420/111), Genesis / BLAST-OFF |
| 7 | `merkleroot` | 32B hex | scheme, drip, swag, border, glasses |
| 8 | `time` | epoch seconds | mood, nature |
| 10 | `nonce` | 4B number | mood, mouth, brows, thirdEye |
| 13 | `chainwork` | 32B hex | "energy accumulated" secondary — used as tiebreaker & subtle chainwork bar overlay |

**Dormant for Series 0 (activate in later series):**

| # | Field | Why dormant in S0 | Wakes up as |
|---|---|---|---|
| 1 | `size` | ~215B typical in 2009, no variance | S1+: shell weight |
| 2 | `strippedsize` | as above | S1+: engraving thickness |
| 3 | `weight` | as above | S1+: border weight tier |
| 5 | `version` | pinned to `1` in 2009 | S1+: cape / mantle when BIP9 signaling bits are set |
| 11 | `bits` | pinned to `0x1d00ffff` | S1+: rarity tier + halo intensity |
| 12 | `difficulty` | pinned to `1.0` | S1+: aureole thickness (thermodynamics) |
| 14 | `nTx` | 1–2 for most 2009 blocks | S1+: swag density (busy block = more artifacts) |
| 15 | `hex` | redundant | never used, redundant to 0/7 |

Dormant fields are documented, not deleted. Series 1+ (e.g. blocks around a halving, or the SegWit era) will use the same engine with a different driver map, and the fields that were silent in 2009 will drive traits then. **This is the multi-Series storytelling that makes UNATOMS the most information-dense DMT visual project.**

---

## 3. Reel-to-byte mapping (Series 0)

Each trait dial is a "slot machine reel." One specific byte drives one reel via modulo. Zero PRNG. 100% chain-derived.

| Reel | Slots | Driver byte | Formula | Expected uniform count | Notes |
|---|---|---|---|---|---|
| scheme | 13 | `merkleroot[0]` | `% 13` | ~775 ± 30 per scheme | slight ~5% skew from `256 % 13`, negligible |
| mood | 16 | `nonce_byte0` | `% 16` | ~630 ± 25 per mood | perfectly uniform |
| thirdEye | 16 | `nonce_byte3` | `% 16` | ~630 ± 25 per eye | perfectly uniform (before `natSigil` override) |
| drip | 16 | `merkleroot[1]` | `% 16` | ~630 ± 25 per drip | perfectly uniform |
| swag | 21 | `merkleroot[2]` | `% 21` | ~480 ± 22 per swag | mild `256 % 21` skew |
| mouth | 15 | `nonce_byte1` | `% 15` | ~672 ± 26 per mouth | mild skew |
| brows | 9 | `nonce_byte2` | `% 9` | ~1120 ± 33 per brow | mild skew |
| glasses | 9 | `merkleroot[4]` | `% 9` | ~1120 ± 33 per glasses | mild skew |
| border | 12 | `merkleroot[3]` | `% 12` | ~840 ± 29 per border | slight skew |
| nature | 7 | `floor(time / 3600) % 24 % 7` | UTC hour then mod 7 | ~1440 per nature, biased | **deliberately non-uniform** — 2009 mining rhythm shows through, `fire`/`water`/`ice` become slightly more common than `void`/`aether` |
| ecoMark | 4 | `block_hash[31]` | `% 4` | ~2520 ± 50 per mark | perfectly uniform |
| halo hue | 24 discrete tints | `block_hash[0..2]` | RGB → nearest palette match | ~420 per tint | every UNATOM's aureole is literally its own hash color |
| chainwork bar | 5 tiers | `Number(BigInt(chainwork)) / max` bucket | percentile | ~2016 per tier | subtle background stripe indicating "% of total S0 work at that block" |

**Design lever**: the byte assignments above are the *only* thing we author. If the natural distribution comes out clunky in the rarity predictor (see §9), we swap which byte drives which reel — never post-hoc filter results.

---

## 4. Overlays (height-anchored + chain-derived spread)

Overlays sit on top of the base roll and can compose (a block can be `flameborn` + `blazedBluntie` + `natSigil` + `Hi` all at once — the render pipeline handles layer conflicts via §8 guards).

### flameborn ✅ (existing — refactored to remove PRNG)
- **Current**: height contains "666" OR ~1% PRNG roll
- **S0 revised**: height contains "666" OR `nonce_byte0 === 0x66`
- **Series 0 count**: heights containing "666" in 1..10,080 = **19 blocks** (666; 1666..9666 = 9; 6660..6669 = 10; minus overlap 6666)
  - Plus byte-gate spread: ~39 additional blocks
  - Expected total: **~55 pieces (~0.55%)**
- Visual: pink flame-halo eyes + fanged slit mouth (unchanged from [unatom-render.js](unatom-render.js))
- Third-eye ring skipped when eye is `sealed`

### blazedBluntie ✅ (existing — refactored to remove PRNG)
- **S0 revised**: height contains "420" OR `nonce_byte0 === 0x42`
- **Series 0 count**: heights containing "420" in 1..10,080 = **20 blocks** (X420 ends: 420; 1420..9420 = 9 more; 4200..4209 starts = 10; no overlap)
  - Plus byte-gate spread: ~39 additional blocks
  - Expected total: **~58 pieces (~0.58%)**
- Visual: existing blazed styling

### NAT SIGIL ⭐ NEW (NAT-logo rare eye)
- **Trait key**: `natSigil` (display name: **NAT SIGIL**)
- **Anchor**: height contains "111" → 111; 1110–1119; X111 for X∈{2..9} = **19 blocks**
- **Byte gate**: `merkleroot[0] === nonce_byte0` (matching first bytes across two independent-entropy fields) = ~39 additional
- **Expected total**: **~55 pieces (~0.55%)**
- **Rule**: when triggered, `thirdEye` is overridden to `natSigil` regardless of the nonce_byte3 roll
- **Visual** (matches the NAT logo — see [design/natsigil-full-preview.html](natsigil-full-preview.html) for real UNATOM examples):
  - Dark disc filled with `BASE.pupil`, framed in `sch.border`
  - 6 outer nodes in hexagonal arrangement, painted in `sch.border` normally OR flipped to white when `sch.border` is dark (luminance < 0.45) so nodes always pop on the dark disc — verified on all 13 schemes
  - Central orange node in true NAT orange `#F07E1B` (identity override — always NAT-colored regardless of scheme, that's the point)
  - Thin lines connecting center → each outer node AND adjacent outer node → outer node (hexagonal ring)
  - Small halo arc above (like the existing `halo` eye variant) painted in `sch.a` accent — puts it in the sacred/oracle family, not the technical family
- **Lore**: "when the shell's fingerprint agrees with the guess that unlocked the block, the atom binds." Composable with `flameborn` (flame ring wraps the hex, orange core still peeks through — visually verified on Ash #666).
- **Family**: sits alongside `oracle`, `genesis`, `halo`, `spiral` in the sacred-third-eye family. NOT a member of the `natSigil`-and-something combo — it's a single trait, one visual, one rare override.

### Hi (Hash Intersect) ⭐ NEW invented element
- **Trigger**: `block_hash[0] === merkleroot[0]` (first byte of block fingerprint equals first byte of tx-tree fingerprint)
- **Probability**: 1/256
- **Expected count**: **~39 pieces (~0.39%)**
- **Symbol**: `Hi` — added to `CATEGORIES.extra` element namespace
- **Visual mark**: small chevron badge (two matching hex-byte glyphs stacked, like `«` in `sch.a`) painted in the top-right corner of the tile, next to the height stamp. Non-invasive — doesn't compete with the primary composition.
- **Whisper**: *"When a block's own fingerprint agrees with the fingerprint of every transaction inside it, the block waves hello."*
- **Composable** with every other overlay.

---

## 5. Ceremonial anchors (2 total, height-only exception)

The only 2 pieces whose 1-of-1 status comes from being on a specific block, not from a trait constellation. Both are declared and transparent.

### Genesis Prime — block 1
- **Trigger**: `height === 1`
- **Override**: scheme=`obsidian`, thirdEye=`genesis`, mood=`ancient`, drip=`heavyDrip`, swag=`haloNode`, nature=`aether`, brows=`arch`, cornerBadge=`GENESIS`
- **1-of-1**: yes, exactly one exists, ever
- Justification: block 1 is unique in Bitcoin history (`prev_block_hash` = all zeros — the only such block). The height-anchor is a legibility convenience for a fact that's already baked into the chain.

### BLAST-OFF Finale — block 10,080
- **Trigger**: `height === 10080` (final block of Series 0)
- **Override**: scheme=`ember`, thirdEye=`burn`, mood=`hyperAware`, drip=`forkDrip`, swag=`minerMark`, nature=`fire`, cornerBadge=`BLASTOFF`
- **1-of-1**: yes
- Justification: the collection's closer, the "last one out of Series 0."

No other height-anchored 1-of-1s. Everything else emerges from constellations.

---

## 6. Constellations — trait-based 1-of-1s, mythic ghosts, legendaries

Every constellation is a specific trait combo we name in advance. We compute its expected count over 10,080 blocks. If Bitcoin delivers it, that becomes the collection's flagship for that lore. If it doesn't, it becomes a **mythic ghost** — a documented, provably-unclaimed slot in the collection's mythology.

**Tier definitions:**
- Ghost: expected count < 0.5 (likely won't land)
- 1-of-1 candidate: expected count 0.5–1.5 (likely lands 0–2 times)
- Legendary: expected count 2–8 (small named group)

Initial constellation set (final list tuned via §9 rarity predictor):

| # | Name | Constellation | P (approx) | Expected count | Tier |
|---|---|---|---|---|---|
| C01 | The Chalk Prophet | `scheme:chalk` × `thirdEye:genesis` × `swag:dmtGem` × `drip:heavyDrip` × `mouth:nullLine` | 1 / 1.05M | 0.01 | ghost |
| C02 | Void Sovereign | `scheme:void` × `thirdEye:sealed` × `mood:ancient` × `swag:microChain` | 1 / 70k | 0.14 | ghost |
| C03 | The Frost Watcher | `scheme:frost` × `border:frostEdge` × `thirdEye:frost` × `nature:ice` | 1 / 17k | 0.58 | 1-of-1 candidate |
| C04 | Ember King | `scheme:ember` × `thirdEye:burn` × `nature:fire` × `swag:burnMark` | 1 / 30k | 0.34 | ghost/1-of-1 |
| C05 | Obsidian Oracle | `scheme:obsidian` × `thirdEye:oracle` × `mood:ancient` × `swag:haloNode` | 1 / 70k | 0.14 | ghost |
| C06 | The Signal Miner | `scheme:signal` × `thirdEye:hash` × `swag:hashScratch` × `mood:hyperAware` | 1 / 70k | 0.14 | ghost |
| C07 | Aqua Diamond | `scheme:aqua` × `thirdEye:diamond` × `mood:wonder` × `ecoMark:threeDot` | 1 / 13k | 0.75 | 1-of-1 candidate |
| C08 | Bronze Guardian | `scheme:bronze` × `thirdEye:sealed` × `border:rivet` × `swag:minerMark` | 1 / 50k | 0.19 | ghost |
| C09 | Jade Meditator | `scheme:jade` × `thirdEye:closedEye` × `mood:calm` × `nature:earth` | 1 / 23k | 0.44 | 1-of-1 candidate |
| C10 | Rust Wanderer | `scheme:rust` × `thirdEye:eclipse` × `mood:suspicious` × `swag:pixelScar` | 1 / 70k | 0.14 | ghost |
| C11 | Graphite Scholar | `scheme:graphite` × `thirdEye:aperture` × `glasses:labGoggles` × `swag:ordinalTag` | 1 / 40k | 0.25 | ghost |
| C12 | The Ash Poet | `scheme:ash` × `mood:wink` × `swag:tinyBandage` × `mouth:soft` | 1 / 65k | 0.15 | ghost |
| C13 | The Bone Herald | `scheme:bone` × `thirdEye:spiral` × `nature:aether` | 1 / 1500 | 6.7 | legendary |
| C14 | The Void Kid | `scheme:void` × `brows:speck` × `mood:shy` × `swag:voidPatch` | 1 / 34k | 0.30 | ghost |
| C15 | The Sealed One | `scheme:obsidian` × `thirdEye:sealed` × `brows:arch` × `mood:lockedIn` | 1 / 34k | 0.30 | ghost |
| C16 | MEMEMOSES | `glasses:memeMose` × `brows:single` × `swag:crownDot` × `mood:blissed` | 1 / 30k | 0.34 | ghost |
| C17 | Block Runner | `glasses:regular` × `brows:flat` × `mood:hyperAware` × `swag:minerMark` × `nature:none` | 1 / 62k | 0.16 | ghost |
| C18 | Fire Keeper | `scheme:ember` × `nature:fire` × `swag:burnMark` × `mood:blissed` | 1 / 4600 | 2.2 | legendary |
| C19 | Cold Storage | `scheme:frost` × `nature:ice` × `thirdEye:closedEye` × `mood:sleepy` | 1 / 23k | 0.44 | 1-of-1 candidate |
| C20 | The Tide | `scheme:aqua` × `nature:water` × `drip:longWick` × `mood:soft` | 1 / 23k | 0.44 | 1-of-1 candidate |

**Note**: constellations are named claims we can announce pre-mint. The rarity predictor (§9) will let you retune any constellation's target probability by adjusting how many/which traits it locks. Some will need to be widened (add more slack), others tightened (add another trait constraint) to hit the target tier balance.

**Target tier balance for launch:**
- 5 mythic ghosts (0.1 – 0.3 expected)
- 5 true 1-of-1 candidates (0.5 – 1.5 expected)
- 5 legendaries (3 – 8 expected)
- Plus Genesis + BLAST-OFF anchors + the 3 rare overlays (`flameborn`, `blazedBluntie`, `natSigil`) + the `Hi` element

That gives the collection ~15–20 named flagship tiers on top of the emergent base distribution. Enough named lore for social hunting, not so much that the base-tier UNATOMs feel unlovable.

---

## 7. Aesthetic guards (visual coherence enforcement)

The rule: **every possible byte combination has to render dank.** With 5 live fields × 12 trait dials, that's billions of theoretical combos. We enforce coherence in three layers:

### Layer 1 — Palette lock (already exists ✅)
Every trait renders using the active `scheme` palette (`sch.tile`, `sch.border`, `sch.a`, `sch.b`). A `chalk` UNATOM with a `burn` third-eye doesn't paint a raw orange eye on a white shell — the eye uses `sch.border` for contrast and `sch.a` for accent. Coherence is baked into the composer.

### Layer 2 — Compatibility clamps (partial ✅, expanding)

Existing:
- `flameborn` skips third-eye ring when eye is `sealed`
- `ancient`/`closed`/`meditate` moods use `sch.border` sclera stroke so eyes stay visible on dark shells
- Brow stroke uses `sch.border` (always visible)

Adding for v0.7 launch:
| Rule | Trigger | Resolution |
|---|---|---|
| natSigil + sealed | `natSigil` fires AND base thirdEye was `sealed` | keep `natSigil` (override wins), skip halo arc |
| natSigil + flameborn | both fire | flame ring wraps hex, orange core still visible (verified on Ash #666) |
| glasses vs brows | `raised`/`furrowed`/`arch` brow + `aviator`/`labGoggles` frame | shift brow y-position 8px up so it clears frame top |
| swag vs border | `rivet` swag + `rivet` border | swag downgrades to `sideRivet` (avoids double-rivet clash) |
| dmtGem vs halo | `dmtGem` swag + `halo`/`oracle` eye | halo shortens 20% so it doesn't overlap the gem |
| ecoMark vs corner drip | `orbit` mark + drip lands in same corner | ecoMark shifts to opposite corner |
| Hi corner badge vs height stamp | always present on `Hi` blocks | badge sits directly below height stamp with 6px spacing |
| chainwork bar vs footer | always present on all blocks | bar is 4px, sits above `unatoms.fun` footer, opacity 0.35 |

Each guard is deterministic, cheap, and documented. New guards get added as the stress-test (Layer 3) surfaces conflicts.

### Layer 3 — Stress-test grid (NEW, blocking gate before mapping locks)

Build `design/coherence-check.html`: render **500 UNATOMs from purely-random synthetic bytes** (not real headers — random surface). Grid at 128×128 per tile, 20 wide × 25 tall. You eyeball. Any combo that looks broken → add a Layer 2 guard → re-render → repeat until 100% clean.

**Only after the stress-test passes is the mapping considered locked.** Then we pull real headers, render the actual Series 0, and confirm the real distribution matches the math prediction.

---

## 8. NATDRIP separation (permanent)

Reminder for the record: the art layer and the $NAT drip layer are permanently separate.

| Layer | Code | Input | Output |
|---|---|---|---|
| Art (traits) | [unatom-render.js](unatom-render.js) | block header bytes | SVG string |
| NATDRIP (reward) | [worker/src/index.js](worker/src/index.js) | wallet address + pool bits-derived supply | claim amount |

The renderer does not know the wallet. The worker does not know the traits. No cross-contamination, ever.

---

## 9. Rarity predictor (build target)

Deliverable: `design/rarity-predictor.html` — a single-page tool where you can:
- View the current reel-to-byte mapping (§3)
- See the predicted count for each trait value (by pure math, before any block is read)
- Toggle mapping changes (swap byte, change divisor, add gate) and see counts recalc live
- View predicted constellation counts (§6) with tuning knobs
- Toggle overlays on/off to see how many blocks land in overlap zones (e.g. "how many blocks are both `flameborn` and `Hi`?")

Once the predictor projection feels right, we run against real headers (§10) and confirm reality matches math (should be within ~5% margin for uniform dials, expect the `nature` dial to show the 2009-mining-hour skew).

---

## 10. Execution sequence

Everything is planning / offline until you approve. No live site touched.

1. ✅ **This doc** — you redline
2. **Pull headers** — one-time script `design/pull-series0-headers.mjs` → writes `design/series0-headers.json` (~600KB). Read-only, no impact.
3. **Build rarity predictor** — `design/rarity-predictor.html` (§9). You tune mapping.
4. **Build stress-test grid** — `design/coherence-check.html` (§7 Layer 3). You eyeball, we add guards until clean.
5. **Lock mapping** — freeze the reel-to-byte table + guards + constellations.
6. **Refactor renderer** — `unatomFromBlock(height)` → `unatomFromBlock(height, header)` in [unatom-render.js](unatom-render.js). Extract byte-driver helpers, wire header lookup, add `natSigil` third-eye + `Hi` element + refactored overlays.
7. **Full render pass** — render all 10,080 UNATOMs to a grid page for final visual review + auto-generate the real rarity sheet from actual counts.
8. **Publish** — new rarity sheet page (`/rarity/`), update showcase/catalog to use v2, announce.

**Optional step 9 (post-launch, strongly recommended)**: inscribe formal `.element` deployments on Trac Core for our field usage. Naming pattern: `unatoms.merkle.7.element`, `unatoms.nonce.10.element`, etc. Small inscription cost, big DMT-ecosystem signal — makes UNATOMS protocol-native, not just aesthetic-native. Included in doc so you have a full picture; strike this if you want a tighter launch.

---

## 11. Sign-off checklist

Redline the items below then reply GO / edits.

- [ ] Series 0 = blocks 1–10,080 confirmed
- [ ] Live fields (block_hash, merkleroot, time, nonce, chainwork) + height as identity confirmed
- [ ] Dormant fields (bits, difficulty, weight, nTx, version, size) OK to reserve for Series 1+
- [ ] Reel-to-byte mapping (§3) — approve as starting point, will tune via rarity predictor
- [ ] Overlays: `flameborn` + `blazedBluntie` keep, refactored to remove PRNG (chain-derived byte-gate replaces the 1% roll)
- [ ] `natSigil` (NAT SIGIL) as NEW rare thirdEye override — anchor: heights containing "111" + byte gate — target ~0.55% — visual approved via [natsigil-full-preview.html](natsigil-full-preview.html)
- [ ] `Hi` (Hash Intersect) as NEW invented element — corner badge — target ~0.4%
- [ ] Ceremonial height-anchors: Genesis Prime (blk 1) + BLAST-OFF Finale (blk 10,080) only
- [ ] Constellation target: ~5 ghost / ~5 1-of-1 / ~5 legendary + tune via predictor
- [ ] Aesthetic guards approach: palette-lock + clamps + 500-combo stress-test before lock
- [ ] Trac `.element` inscriptions: included in doc as optional post-launch step
- [ ] Execution sequence §10 — approved to start at step 2 (pull headers)

---
