# UNATOMS TCG · Series I

Card template + teaser build for **UNATOMS — The Trading Card Game of Digital Matter.**

> Play a bit. Close the block. Win the chain.

---

## Files

- **[card-frame.js](./card-frame.js)** — the card template renderer. Exposes `window.UNATOMS_TCG` with `render(spec)` and `renderBack()`. Depends on `../unatom-render.js` (must be loaded first).
- **[card.html](./card.html)** — single-card viewer. Reads URL params, previews any card face, downloads SVG or PNG. Includes flip-to-back toggle.
- **[preview.html](./preview.html)** — teaser reveal page. Renders Wave 1 (card back), Wave 2 (Mythic hero), Wave 3 (six Nature starters), and Wave 4 (rarity legend).
- **[README.md](./README.md)** — you are here.

## Run locally

```bash
cd /Users/joeatang/Documents/GitHub/natships
python3 -m http.server 7788
# then open http://localhost:7788/tcg/preview.html
# or     http://localhost:7788/tcg/card.html?block=10080&rarity=mythic&title=THE+WITNESS
```

## Card face grammar (v1)

- Canvas: **750 × 1050** (63 × 88 mm at 300 dpi — standard TCG ratio).
- **Full-bleed** scheme fill (no white margin). Rounded corners at 34 px radius.
- Header strip: Nature glyph (top-left, drawn SVG shape) · Title in serif small caps (top-center) · `BLK #XXX,XXX` in mono (top-right).
- Portrait: nested `<svg viewBox="0 0 1024 1024">` embedding the raw `UNATOM.svg(traits)` output at 660×604 px.
- Cost + Integrity band: orange diamond dots per Matter cost (left) · big mono Integrity number (right).
- Signal box: subtle ink-tinted panel with attack name (sans caps) + one-line effect.
- Whisper: italic Georgia flavor text, up to 3 lines wrapped at ~48 chars.
- Merkle hex strip: deterministic pseudo-hex placeholder (real cards will use header.merkleroot).
- Bottom: strike # (left) · rarity wax-seal glyph (right).
- Foil overlay (Legendary + Mythic): hex-mesh pattern + rainbow gradient at low opacity.

## Card back grammar

- Obsidian `#0a0b10` background with radial NAT-orange glow.
- Full-card hexagonal mesh lattice at ~14% opacity.
- Centered NAT SIGIL — 6 hex nodes, ring, spokes, NAT-orange core.
- Corner chevron accents.
- **No wordmark. No text.** Silent branding by sigil alone.

## Language locks (do not rename)

| Concept        | UNATOMS term      |
|----------------|-------------------|
| Player         | NODE              |
| Deck           | MEMPOOL           |
| Middle pile    | THE BLOCK         |
| Board          | ROW               |
| Discard        | THE VOID          |
| Life / HP      | INTEGRITY         |
| Attack         | SIGNAL            |
| Resource       | MATTER            |
| Basic play     | BIT               |
| Creature       | UNATOM            |
| One-shot spell | RITE              |
| Enchantment    | SIGIL             |
| Prize card     | SEAL              |
| Match          | THE CHAIN         |
| Win state      | CONSENSUS         |
| Legendary      | CEREMONIAL        |

## Rarity ladder (Rodarmor-adapted)

| Tier       | Glyph    | Trigger                                     | Series I count       |
|------------|----------|---------------------------------------------|----------------------|
| Common     | dot      | any block in the Series window              | ~ pool               |
| Uncommon   | halfmoon | digit-pattern Nature-tell                   | ~ pool               |
| Rare       | diamond  | real BTC difficulty-adjustment boundary     | 5                    |
| Epic       | triangle | curated positional milestones               | 10                   |
| Legendary  | hexagon  | Ceremonial 1-of-Ns                          | 5                    |
| Mythic     | 4-star   | lowest-hash block in the Series I window    | 1 (The Witness)      |

## Placeholder state (Series I start block = TBD)

Currently every card renders portrait art derived from block **`10,080`** (existing digital Series 0 BLAST-OFF) so previews look production-quality. Block-height slot displays **`BLK #TBD`**.

When the Series I `start_block` is locked:
1. Update `start_block` constant (single source of truth to add).
2. Re-render Wave 2 hero from the actual lowest-hash block within the Series I window (only knowable after the series closes on chain).
3. Wave 3 starters re-derive from six curated blocks within the Series I window.
4. All other Wave outputs auto-update.

## URL params for `card.html`

Every field is optional.

| Param        | Type   | Default          | Notes                                     |
|--------------|--------|------------------|-------------------------------------------|
| `block`      | number | `10080`          | drives portrait art via `UNATOM.fromBlock` |
| `rarity`     | string | `common`         | one of common/uncommon/rare/epic/legendary/mythic |
| `title`      | string | element name     | overrides card title (uppercased)         |
| `seriesRoman`| string | `I`              | roman numeral in header sub-line          |
| `blockLabel` | string | auto             | override e.g. `BLK #TBD` or `BLK #911,111` |
| `cost`       | number | `3`              | 0–8, matter cost dots                     |
| `integrity`  | number | `60`             | HP-equivalent (10–120 range recommended)  |
| `nature`     | string | trait's nature   | fire/water/air/earth/void/aether/none     |
| `signal`     | string | `PULSE`          | attack name (uppercased)                  |
| `signalText` | string | default lorem    | one-line effect                           |
| `whisper`    | string | element whisper  | italic flavor line                        |
| `strike`     | string | rarity label     | serial marking, e.g. `STRIKE 007 / 500`   |

## Example

```
tcg/card.html?block=10080&rarity=mythic&title=THE+WITNESS
  &cost=6&integrity=120&nature=aether
  &signal=CONSENSUS&signalText=seal+one+BIT+of+any+nature.+draw+two.
  &whisper=I+am+the+first.+I+am+the+one+you+remember+when+you+remember+nothing+else.
  &strike=STRIKE+001+%2F+001+%C2%B7+MYTHIC
  &blockLabel=BLK+%23TBD
```

## Next step (Step B)

Once Step A visuals are approved:
- Full 60-card Fire Keeper Starter Deck content spec (every card's name, Nature, cost, Integrity, Signal, Ability, whisper).
- Print-ready sheet layout (9-card page, 63 × 88 mm each, crop-mark ready for print-and-play).
