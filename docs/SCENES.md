# Visuals — scene bible

Authoritative notes for the seven pattern languages. Gemstone palettes only.

## Global

- 1920×1080 Canvas 2D, OBS capture, semantic OSC (`/scene i`, `/motion`).
- Centre **well** is a dark gemstone fill for chromakeyed light terminal text, except **Scene 4** (no well; terminal off in OBS).
- Well fills: 0 emerald · 1 sardius · 2 crystal · 3 vermilion · 4 none · 5 vermilion · 6 sapphire.
- Hierarchy: historical ornament → design principles → grammars → maths → demoscene technique → renderer.
- Scenes **3** and **5** share one isometric camera: `isoRoom()` in `src/engine/iso.js`.

## Scene 0 — Herbarium

Woodcut herbal (Gerard / Turner). Plants **rooted on the canvas edge**; growth is a shoot extending from that anchorage, not a snake or pipe screensaver. Slow S-curves, occupancy weave, prune **from the tip** at the well, then grow again from the same root. Speed 25% slower than the previous one-segment-per-frame rate. Leaves both sides. Gemstone washes, ink outlines, veins.

## Scene 1 — Blackwork / textiles

Counted blackwork, diaper, damask. Loom/printer weft from top to bottom, skip the well, new pattern at the bottom.

## Scene 2 — Candlewick / lace

Reticella, candlewick tufts, 8-sided rose windows. No pentagrams, no Tudor rose, no kaleidoscope spin.

## Scene 3 — Strapwork (isometric)

Vredeman-style hall in **2:1 isometric**: coffered floor and ceiling, two full walls meeting at the far corner, entablature across the top of the frame, interlaced straps, cabinets/chests. Idle straps travel on iso axes. Same `isoRoom` as Scene 5.

## Scene 4 — 1611 Scripture (no well)

KJV Authorised Version **1611 spelling only**, from [`/kjv1611.json`](../public/kjv1611.json). Two-column 1611 page: blackletter body (`UnifrakturMaguntia` / IM Fell), roman running titles and chapter heads, handwritten italic for some verses, woodcut initials. Further passages to be added to the JSON later. Mix of typeface and cursive as specified.

## Scene 5 — Lathe / furniture (isometric)

Turned oak in the **same isometric room** as Scene 3: tester bed, court cupboard, table, spinning legs. Oak panelling and coffers. Gouge travels one leg.

## Scene 6 — Firmament (Biblical cosmographie)

**Primary:** period diagram of a **circular earth** under a vaulted firmament, waters above, sunne and moone circuits, four winds, Ierusalem as a cartouche, surrounding ocean, pillars at the rim. **Not a globe.**

**Background only:** Baconian biliteral A/B ticks of:

- Jesus is God
- Believe on the Lord Jesus Christ and though shalt be saved
- Do not be deceived
- Satan himself is transformed into an angel of light
- John 8:44 (the long Satan / liar sentence)

See `docs/scene-6-ref.md` for sources.

## Future — dancers in scenes 3 and 5

Do **not** implement until asked. When we return to the hall:

- Populate the isometric floor of **Scene 3 (strapwork hall)** and **Scene 5 (oak chamber)** with small **dancing figures in period dress**.
- Dress: late Elizabethan / early Jacobean — ruffs, doublets, hose, farthingales, hanging sleeves, jewels remapped to the **gemstone palettes only**.
- Motion: slow social dance, not a jig. Pavane, almain, galliard, volta as in Arbeau, *Orchésographie* (1589), and English masque processions. Idle is a continuous measure around the well; OSC `/motion` later quickens the step.
- Drawing: isometric silhouettes or simple articulated sprites that share `isoRoom` scale. They walk the floor **around** the well, never through it, never in front of the terminal text.
- References: Hilliard and Gheeraerts costume; Armada-era court dress; masque designs; Arbeau step diagrams as **choreography**, not as the look.
- Keep them subordinate to the architecture. Ornament first; figures as inhabitants, not a character demo.
