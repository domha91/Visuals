# Visuals — project handoff

Use this document to start a **new chat** after Scene 6. Attach the project. Paste the prompt skeleton at the bottom if continuing.

**Scenes 0–6 are first finished drafts.** Do not rebuild them unless the user explicitly asks to revise a specific scene.

---

## What this project is

Production **procedural ornamental drafting engine** for long-form livestreamed musical performance.

- Sits **behind** a live TidalCycles terminal (OBS window capture, **1920×1080**).
- **Not** a shader demo, VJ tool, particle playground, or audio-reactive visualiser.
- Hierarchy (always):
  **HISTORICAL ORNAMENT → DESIGN PRINCIPLES → ORNAMENTAL GRAMMARS → PROCEDURAL MATH → DEMOSCENE TECHNIQUE → RENDERER.**
- Colours: **gemstone palettes only** (`src/engine/palette.js`). No hex outside that file.
- OSC is **semantic only**: `/scene` and `/motion`. No Hydra, Ableton, Max, or audio FFT.

---

## Stack

| Piece | Path / note |
|--------|-------------|
| Canvas 2D engine | `src/engine/boot.js`, scenes under `src/engine/scenes/` |
| Stage (HUD below the canvas) | `src/components/stage.tsx` — keys 0–6, buttons |
| Size | 1920×1080 |
| Seeded RNG | `src/engine/rng.js` |
| Well | `src/engine/well.js` — centre terminal cartouche |
| Isometric room (scenes 3 and 5 only) | `src/engine/iso.js` — do not fork a second camera |
| Fonts | `public/fonts/` + `src/engine/fonts.js` |
| KJV 1611 text | `public/kjv1611.json` — Scene 4 only |
| Scene refs | `public/scene1/` … `public/scene6/` |
| OSC in dev | `src/engine/osc.js` connects to same-origin `/osc`. Vite proxies that to the local bridge. Do not point the browser at port 3000. |
| Brand | `public/og.jpg`, `public/x-banner.jpg`, `src/lib/og/site.json` |

`stage.tsx` currently opens on scene **6**. When reviewing another scene, change the initial scene accordingly.

Do not downgrade `@tanstack/react-start` below 1.168.60.

Dev server: `npm run dev` via `/workspace/startup.sh`, bound for the live preview. Do not kill it unless `vite.config` or dependencies change.

---

## Seven scenes

| Key | Name | Status | Well |
|-----|------|--------|------|
| **0** | Herbarium | First finished draft | dark.emerald |
| **1** | Blackwork / loom | First finished draft | sampled from the active cloth |
| **2** | Candlewick / lace | First finished draft | sampled from the panel in the well |
| **3** | Strapwork hall | First finished draft | dark.vermilion |
| **4** | Script (1611 page) | First finished draft | **none** |
| **5** | Lathe / oak chamber | First finished draft | sampled from the damask (`instance.wellFill`) |
| **6** | Firmament | **First finished draft** | dark.sapphire (`instance.wellFill`) |

Scene switch: keys **0–6**, HUD buttons, OSC `/scene`.

Default `params.motion` is about 0.32. It scales speed. It is not audio.

---

## Global visual rules

1. **Centre well** — rounded rect, about 40% × 34% of the frame. Dark gem fill so terminal text stays readable. **Nothing drawn through the well.** Scene 4 is the exception: boot skips the well.
2. **Sampled wells** — scenes 1, 2, 3, 5, and 6 may set `instance.wellFill`. Boot uses that. Scene 6 defaults to `dark.sapphire`.
3. **No pentagrams.** No Tudor rose as a logo. No kaleidoscope as the main motion. No vesica-and-hexagon seal. A geometric figure, if one is required, is **three concentric circles and one octagon**.
4. **Gemstone only.** Remap every reference colour onto `bright.*` / `dark.*`.
5. Idle motion is structural. OSC `/motion` only scales it.
6. **Never regress** scenes 0–6 without explicit instruction.
7. The HUD sits **under** the canvas. Do not cover the picture with it.
8. **Never a globe. Never a spherical earth.** Do not cite, copy, or draw one. Do not surround a ball with planetary orbs. This rule is absolute.

---

## Scene notes the next chat must not undo

### Scene 1 — loom

Cloth advances at `35 * beat * 5` (five times the earlier rate) so each image is beaten up quickly. Keep the loom, the tabby yarns, and the sampled well.

### Scene 2 — tapestry

One continuous cloth scrolling leftward. The well is punched **on top** of the cloth. Do not slice a band out of the picture around the well, or the motif is erased as it passes. No punch-needle stipple on the right-hand edge. The well colour is taken every frame from the panel that has reached the well, including one that has only just entered.

### Scenes 3 and 5 — dancers

Both halls share `DANCER_PX` in `src/engine/iso.js` (118px). Every figure in both rooms is that tall. Do not give them individual scales.

They are drawn **after** the room, clipped with `clipFloor`, and seated with `seatOnFloor` so the body stays on the floor and below the well. They must not paint the walls. They already step, travel, and hop with no OSC message. OSC only makes the lathe set travel further and hop higher.

Do not fork `iso.js`.

### Scene 5 — lathe

Shared `isoRoom` with scene 3. Reference plates in `public/scene5/` are gemstone-remapped and tiled so the only empty region is the well. Turning posts and a gouge are the motion. The still chamber is cached; only posts, gouges, and dancers redraw each frame. The six-fold star plate was omitted on purpose.

### Scene 6 — Firmament

Isometric flat-earth cosmography under a vaulted firmament (not the hall `isoRoom`). Rectangular earth plane, ocean rim, four pillars, mountain ring, four rivers, Jerusalem marker. Firmament as concentric elliptical rings + meridian ribs. Waters above as outer shell. Sun and moon travel opposite circuits under the vault, scaled by `params.motion`. Stars on the vault with relative brightness and gentle twinkle. Faint Baconian biliteral in the background only. Corner ornament: three concentric circles + octagon. Reference plates live in `public/scene6/` (genesis-section, hebrew-universe, creation-circle, munster-eden, etc.). Never a globe. Well: `dark.sapphire`.

---

## Palette

`src/engine/palette.js` is the only place colour literals live.

- `bright.*` — light gems
- `dark.*` — dark gems
- `parchment` = `bright.pearl`
- `withAlpha(hex, a)` for translucent ink

---

## Boot

`startEngine` in `boot.js`:

1. Fills the ground.
2. Calls `instance.render(params, W, H)`.
3. Punches and frames the well, **except scene 4**.

Scenes expose `render(params, w, h)`. Loading images asynchronously (as scenes 1, 2, 5, and 6 do) is the right pattern.

---

## Prompt skeleton (for a future scene or revision)

```text
Continue visuals from HANDOFF.md. Scenes 0–6 are first finished drafts.
Do not rebuild them unless revising a named scene by request.
Hierarchy: HISTORICAL ORNAMENT → DESIGN PRINCIPLES → ORNAMENTAL GRAMMARS → PROCEDURAL MATH → DEMOSCENE TECHNIQUE → RENDERER.
Gemstone palette only. Never a globe.
```

---

*Handoff after Scene 6 (Firmament) first finished draft. Scenes 0–6 locked as drafts for user embellishment.*
