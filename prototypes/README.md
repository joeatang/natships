# Prototypes — archive

These are **prototype surfaces**. Two are archived v0.1 explorations; one is the active Concept C cinematic build.

## What's here

| File | Concept | Status |
|---|---|---|
| `merged-v1.html` | Vessels of the Substrate — cinematic still | Active Phase 1 build surface. Full-bleed square still, no frame, no HUD. |
| `variety-v1.html` | Vessels of the Substrate — 5-block variety proof | Active Phase 2 proof board. Uses the same renderer in compact tile mode. |
| `specimen.html` | NONARBITRARIUM — chemistry/elements specimen card | Archived. Too close to Hi Imprints card format. |
| `natships.html` | NATSHIPS — SpaceX-style reusable vessel card | Archived. Concept strong, format (card) wrong. |

## Why both are archived

- Both used a **portrait card format** with engraved/stencil frames and dense data plates.
- That format reads as "museum specimen" → too adjacent to the studio's sibling project (Hi Imprints).
- It also gatekeeps non-technical viewers behind chemistry/rocket telemetry labels.

The **Vessels of the Substrate** direction (locked in) drops the card frame entirely:
- 1500×1500 full-bleed cinematic stills
- No frame, no border, no data plate on the image
- Composition like a SpaceX press render / Beeple still / Stanley Donwood album cover
- Data lives in metadata + an optional Telemetry View overlay

See `../CONCEPTS.md` and `../HANDOFF.md` for the full reasoning.

## Inspecting

```sh
open prototypes/merged-v1.html  # active cinematic still prototype
open prototypes/variety-v1.html # active 5-block variety proof board
open prototypes/natships.html   # see the rocket-vessel card
open prototypes/specimen.html   # see the chemistry-element card
```
