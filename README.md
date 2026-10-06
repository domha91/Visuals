# visuals

Procedural ornamental drafting engine for livestreamed musical performance.
1920×1080 Canvas 2D. OBS Window Capture. Gemstone palettes only.

## Run on Pop!_OS (Node 22+)

```bash
cd visuals
npm install

# terminal 1 — canvas
npm run dev

# terminal 2 — OSC bridge (UDP 57121 → WebSocket 3000)
npm run osc
```

Open http://127.0.0.1:8080/  
Keys **0–6** switch scenes. F11 for fullscreen, then OBS Window Capture.

```bash
sudo apt install liblo-tools   # if oscsend is missing
oscsend localhost 57121 /scene i 0
oscsend localhost 57121 /motion f 0.6
```

Scene 4 has no centre well (terminal off in OBS). Add 1611 verses in `public/kjv1611.json`.

## Layout

| Path | What |
|---|---|
| `src/engine/` | Scenes 0–6, palette, well, iso camera, OSC client |
| `src/main.js` | Canvas boot, keys, HUD |
| `public/kjv1611.json` | Scene 4 text |
| `server/index.js` | OSC UDP 57121 → WS 3000 |
| `docs/SCENES.md` | Scene bible |
| `docs/FUTURE.md` | Period dancers for scenes 3 and 5 (not built) |

## Scenes

0 Herbarium · 1 Blackwork · 2 Candlewick · 3 Strapwork (iso hall) · 4 1611 Scripture · 5 Lathe (same iso room) · 6 Firmament
