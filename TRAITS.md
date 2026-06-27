# NATSHIPS Trait System (Concept C)

This is the working trait grammar for the cinematic direction: Vessels of the Substrate.

Goal: preserve full non-arbitrary rigor while presenting an inviting, nostalgic, high-swag visual surface.

## Source Contract

- Input unit: one Bitcoin block.
- Determinism: every trait derives from block properties, primarily block hash bytes.
- No hand-picking per token: art is discovered from block data.
- Render style is cinematic and emotional; proof data stays in metadata.

Entropy note:
- Trait bytes use a mixed full-hash sampler, not only early hash positions.
- Reason: Bitcoin PoW leading zeros can bias early-byte sampling and flatten variety.
- Result: full category coverage and strong per-block differentiation across real showcase heights.

## Trait Layers

1. Substrate cosmos traits
- Nebula family (12)
- Star color palette (5)
- Orbital ribbon pattern (4+ procedural bands)
- Origin body (4): EARTH, MARS, MOON, SUBSTRATE
- Sigil simulation mode (4): ghost, beacon, engraved, constellation
- Sigil intensity and tilt (continuous)
- Dust density and spread (continuous)
- Light-bloom direction and intensity (continuous)

2. Vessel identity traits
- Fleet (32)
- Vessel class (5): Starship, Falcon, Heavy, Lancer, Nimbus
- Call sign (derived from fleet + block height)
- Livery hue and finish (continuous + categorical flags)
- Mission patch geometry (3-8 sided emblem)
- Maker stamp placement and style (small hull plaque)

3. Engineering traits
- Engine count (6 buckets): 3, 5, 7, 9, 27, 33
- Propulsion type (5)
- Fuel chemistry (mapped 1:1 with propulsion)
- Stages (1-3)
- Delta-v envelope (continuous range)
- Payload mass (continuous range)
- Orbit class (7)
- Status (5): RECOVERED, IN-FLIGHT, REFUELING, DOCKED, LANDED
- Flight count (1-24) for reusability story

4. Nostalgia and atmosphere traits
- Film leak profile (2-field warm/cool blend)
- Grain density profile (continuous)
- Vignette depth (continuous)
- Contrast mood (continuous)

## Byte-to-Trait Mapping (Current Prototype)

- Byte 0: fleet index
- Byte 1: vessel class
- Byte 2: propulsion + fuel pair
- Byte 3: engine count bucket
- Byte 4: flight count
- Byte 5: stage count
- Byte 6: payload scalar
- Byte 7: delta-v scalar
- Byte 8: orbit class
- Byte 9: status
- Byte 10: nebula family
- Byte 11: star palette
- Byte 12-14: nebula hue shifts
- Byte 15: orbital ribbon count variant
- Byte 16: sigil simulation mode
- Byte 17: sigil intensity scalar
- Byte 18: sigil tilt scalar
- Byte 19: origin body
- Byte 30+: livery finish and emblem geometry

Notes:
- Continuous visual values also derive from deterministic hash-float reads.
- Mapping is append-friendly for future tiers without breaking old renders.

## Why this showcases DMT power

- One block drives both matter and machine.
- The sky itself is traited, not just the vessel.
- The DMT/NAT sigil can appear as in-world physics iconography rather than pasted logo UI.
- Reusability story comes from deterministic flight and status values.
- Collectors can read emotional variation first, then inspect hard data in metadata.

## Variation Surface

Discrete combinations from current categorical traits alone:

- 32 fleets
- 5 vessel classes
- 6 engine buckets
- 5 propulsion/fuel pairs
- 7 orbit classes
- 4 origin bodies
- 3 stage counts
- 24 flight counts
- 5 statuses
- 12 nebula families
- 5 star palettes
- 4 sigil simulation modes

Product: 11,612,160,000 combinations before continuous values and spatial procedural differences.

Practical implication:
- Even at 10,080 supply, duplicate-feel collision risk is very low when continuous layers are included.

## Showcase Variations (for the 5-block proof board)

1. Blue-shift explorer
- Cool spectrum stars, IN-FLIGHT plume, EARTH limb, high delta-v

2. Ember returner
- Warm nebula, RECOVERED status, weathered hull, high flight count

3. Substrate mystic
- SUBSTRATE origin, violet glow, sparse stars, quiet DOCKED mood

4. Heavy industrial titan
- HEAVY class, 27/33 engines, denser dust, stronger atmosphere bloom

5. Silent ion drifter
- ION propulsion, thin plume or no active flame, long ribbon orbital arcs

## Tone Guardrails

- No intimidation at first glance: cinematic beauty and nostalgia first.
- No simplification of truth: engineering and chemistry remain exact in metadata.
- No card-frame relapse: full-bleed still stays the hero format.
