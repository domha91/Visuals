# Scene 1 continuation prompt

Paste everything below this line into a new Grok chat after attaching this zip and your Scene 1 reference images.

---

You are continuing **visuals**, a production procedural ornamental drafting engine for long-form livestreamed musical performance. The visual engine sits behind a live TidalCycles terminal (OBS window capture, 1920×1080). It is not a shader demo, VJ tool, particle playground, or audio-reactive visualiser.

## What to do in this chat

Build **Scene 1: Elizabethan & Jacobean Textiles, Upholstery, and Fashion** to a first finished draft.

I will attach a zip of reference images. Copy **structure, stitch, diaper, blackwork, damask, and counted-thread patterns** from those refs. Remap every colour onto the gemstone palettes below. Do not invent unrelated systems.

### Scene 1 motion (required)

- Treat each generated motif as a **woven print pass**, like a slow printer / loom, not a spinning kaleidoscope.
- A band of pattern is drawn in **horizontal weft lines** (or loom-shuttle passes) from the top of the frame downward.
- The **centre well is a gap of only the dark well fill** — no weave through it. Terminal overlay sits there.
- When the weave reaches the **bottom of the canvas**, start a **new pattern** (different blackwork/diaper/damask grammar, different gemstone pairing) and print again from the top. Already-printed cloth can fade or be beaten back like a finished pick.
- Texture should feel **upholstered / tailored**: counted stitches, over-and-under, velvet pile or canvas work — not smooth CGI cloth.
- Idle motion is the loom. OSC `/motion` later increases shuttle speed and density.

## Technical stack (this repo)

- Modern JS ES modules, HTML5 Canvas 2D, Vite, 1920×1080 fullscreen
- OSC is semantic only: Node UDP → WebSocket → browser. No Hydra, Ableton, Max, or audio FFT.
- Live app: React wrapper `src/components/engine-canvas.tsx` + `src/engine/*`
- Scenes: `src/engine/scenes/scene0.js` … `scene6.js`
- Switch scenes with keys **0–6** or OSC `/scene i N`
- Palette: `src/engine/palette.js` — **only these colours, no arbitrary hex**

### Bright gemstones

Diamond #C2C4C5 · Pearl #C7C4B8 · Amber #FDB73F · Ligure #FCB665 · Carbuncle #FEB198 · Ruby #F9AFC7 · Agate #BAC0F9 · Crystal #0DD5FE · Jasper #EFFFFF · Sapphire #4DA3FF · Emerald #29FF9A · Topaz #FFD34D · Beryl #3CFFE6 · Chalcedony #8FF0FF · Chrysolyte #D7FF3A · Chrysoprasus #7DFFB2 · Sardonyx #FF8A6B · Sardius #FF4D5A · Jacinth #FF7AE6 · Amethyst #C77DFF

### Dark gemstones

Sardius #A81919 · Vermilion #894014 · Amber #675210 · Topaz #50590D · Chrysolyte #365E0E · Emerald #19620F · Chrysoprasus #0F6224 · Beryl #0E6042 · Crystal #0E5E5E · Chalcedony #145A83 · Sapphire #1E48C7 · Jacinth #3F25F6 · Purple #751ECB · Amethyst #8F18A0 · Scarlet #9C177A · Crimson #A3194D

Use `makeSkin` / `withAlpha`. Never pick a colour outside this list.

## Well (terminal overlay) — all scenes

`src/engine/well.js` + `punchWell` in `boot.js`.

- Centre rectangle ~40% × 34%, rounded.
- **Fill with a dark gemstone** matching the scene (not parchment). Light Tidal text is chromakeyed over a translucent terminal; the engine well is what the audience reads the code against.
- Scene 1 well fill: **dark sardius `#A81919`**
- Scene 4 (Script): **no well**. Terminal off in OBS. 1611 KJV only (`public/kjv1611.json`).
- Never punch the well to the page colour.

## Seven scenes (unique pattern languages)

| # | Name | Pattern language | Status |
|---|---|---|---|
| 0 | Herbarium | Edge-rooted woodcut plants, slow shoot growth | do not rewrite unless asked |
| 1 | Blackwork / textiles | Counted blackwork, diaper, damask, loom/printer weave | **this chat** |
| 2 | Candlewick / lace | Square reticella, candlewick, 8-sided rose windows | later |
| 3 | Strapwork | **Isometric** Vredeman hall (shared `isoRoom` with 5). **Future:** period dancers. | later |
| 4 | Script | **1611 KJV only**, blackletter + roman + cursive, no well | later |
| 5 | Lathe | **Isometric** tester, cupboard, turned legs (same room). **Future:** period dancers. | later |
| 6 | Firmament | Circular earth under vaulted heauen; Baconian ticks in the background | later |

Each scene must be **structurally unique**. The whole work is **patterns**.

## Scene 0 (do not regress)

- Woodcut outlines, veins, gemstone washes. Forms from Gerard/Turner herbals: ribbed plantain, toothed mint, figwort, bells, umbels, primrose, cinquefoil, agrimony, violet, fern, catkin, borage, thistle, rose, ivy, lily. No full root masses; bulbs/root tufts on the rim only.
- Leaves on **both sides** of each stem (do not combine `scale(-1)` with an opposite angle).
- Stems **start on the canvas edge** and **do not bee-line** to the well.
- Stems **rooted on the canvas edge** (origin never crawls). Growth is a plant shoot, occupancy weave, prune from the tip. Speed 25% slower than one segment/frame.
- Idle always has motion. OSC `/motion` later increases it.
- Hierarchy: HISTORICAL ORNAMENT → DESIGN PRINCIPLES → ORNAMENTAL GRAMMARS → PROCEDURAL MATH → DEMOSCENE TECHNIQUE → RENDERER.

## Scene 1 references (Elizabethan / Jacobean)

Blackwork (Holbein stitch), counted diapers, strapwork on fabric, coifs, smocks, cushions, *A Schole-House for the Needle*, Hardwick / Sheldon tapestries as structure not photocopy. Flat, linear, high-contrast, repeating tiles that can be generated. Fashion/upholstery = tailored panels and welts, not draped simulation.

## Code rules

- Clear names, small functions, idiomatic modern JS — this is also a learning vehicle.
- Canvas 2D. SDF helpers exist under `src/engine/sdf/` for contours/stitches if useful.
- Seeded RNG: `src/engine/rng.js` `hash2` / motif `gene`.
- No pentagrams. No arbitrary colours. Centre well always dark-filled.

## Verify

Screenshot Scene 1 after several weave passes. Confirm: new pattern after reaching the bottom, well is dark sardius with no stitch in the well, gemstone colours only, motion at rest.

Do not rebuild Scene 0. Do not zip until Scene 1 reads as textile, not as herbarium.

## Future (not this chat)

Populate **Scenes 3 and 5** with **dancing figures in period dress** (Elizabethan / Jacobean: ruff, doublet, hose, farthingale). Slow pavane / almain / galliard on the shared `isoRoom` floor, around the well, gemstone colours only. Architecture stays primary. See `docs/FUTURE.md` and `docs/SCENES.md`. Do not implement until asked.
