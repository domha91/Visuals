// @ts-nocheck
/**
 * Scene 1 — Elizabethan & Jacobean textiles on a visible loom.
 *
 * The reference cloth is *woven* scanline by scanline (inkjet / dial-up
 * progressive load). Each weft line is a thread with over-and-under texture
 * against the warp. Side posts, beams, and dense warps make the frame read
 * as a loom, not a flat background.
 *
 * Colours: gemstone palette only. Well fill is sampled from the active
 * cloth image (dominant dark ink → nearest dark gemstone) so it matches
 * the print; no weave through it.
 */
import { bright, dark, withAlpha } from "../palette.js";
import { inWell, wellRect } from "../well.js";

const REFS = [
  { src: "/scene1/damask.png", set: 0 },
  { src: "/scene1/panel.png", set: 1 },
  { src: "/scene1/sampler.png", set: 2 },
  { src: "/scene1/vine.png", set: 3 },
  { src: "/scene1/outline.png", set: 4 },
  { src: "/scene1/crewel.png", set: 5 },
  { src: "/scene1/fruit.png", set: 0 },
  { src: "/scene1/coif.png", set: 1 }
];

/**
 * Each set carries a dark complementary well fill so the terminal
 * cartouche contrasts the active cloth (still dark enough for light text).
 * warm cloth → cool well; cool cloth → warm well; green → purple, etc.
 */
const SETS = [
  {
    // warm damask / fruit → cool sapphire well
    gems: [
      bright.jasper, bright.pearl, bright.diamond, bright.ligure, bright.amber,
      bright.topaz, bright.carbuncle, bright.sardonyx, bright.ruby, bright.sardius,
      dark.amber, dark.vermilion, dark.crimson, dark.sardius, dark.topaz
    ],
    warp: [dark.amber, dark.vermilion, dark.sardius],
    wood: [dark.vermilion, dark.amber, dark.topaz],
    well: dark.sapphire
  },
  {
    // cool panel / coif → warm sardius well
    gems: [
      bright.jasper, bright.pearl, bright.chalcedony, bright.crystal, bright.beryl,
      bright.agate, bright.sapphire, bright.ruby,
      dark.crystal, dark.chalcedony, dark.sapphire, dark.beryl, dark.jacinth
    ],
    warp: [dark.chalcedony, dark.sapphire, dark.crystal],
    wood: [dark.vermilion, dark.amber, dark.chalcedony],
    well: dark.sardius
  },
  {
    // green sampler → purple well
    gems: [
      bright.jasper, bright.pearl, bright.chrysoprasus, bright.chrysolyte, bright.emerald,
      bright.beryl, bright.topaz, bright.amber,
      dark.chrysoprasus, dark.chrysolyte, dark.emerald, dark.beryl, dark.topaz
    ],
    warp: [dark.emerald, dark.chrysolyte, dark.beryl],
    wood: [dark.amber, dark.vermilion, dark.topaz],
    well: dark.purple
  },
  {
    // vine blackwork (purple/ink) → emerald well
    gems: [
      bright.jasper, bright.pearl, bright.diamond, bright.agate,
      bright.amethyst, bright.jacinth, bright.ruby,
      dark.amethyst, dark.purple, dark.jacinth, dark.scarlet, dark.sardius, dark.amber
    ],
    warp: [dark.amethyst, dark.purple, dark.sardius],
    wood: [dark.vermilion, dark.amber, dark.scarlet],
    well: dark.emerald
  },
  {
    // outline / linear red → crystal well
    gems: [
      bright.jasper, bright.pearl, bright.diamond, bright.ligure,
      bright.carbuncle, bright.sardonyx, bright.ruby, bright.sardius,
      dark.vermilion, dark.crimson, dark.sardius, dark.amber
    ],
    warp: [dark.sardius, dark.vermilion, dark.crimson],
    wood: [dark.amber, dark.vermilion, dark.sardius],
    well: dark.crystal
  },
  {
    // crewel multi → chalcedony well
    gems: [
      bright.jasper, bright.pearl, bright.ligure, bright.amber, bright.topaz,
      bright.carbuncle, bright.chrysolyte, bright.emerald, bright.ruby, bright.amethyst,
      dark.amber, dark.vermilion, dark.emerald, dark.chrysolyte, dark.sardius, dark.purple
    ],
    warp: [dark.amber, dark.vermilion, dark.emerald],
    wood: [dark.vermilion, dark.amber, dark.topaz],
    well: dark.chalcedony
  }
];

/** Horizontal margins reserved for loom posts (not woven). */
const LOOM_SIDE = 0.07; // fraction of width each side

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function buildLut(set) {
  const entries = set.gems.map((hex) => {
    const [r, g, b] = hexToRgb(hex);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return { r, g, b, lum, hex };
  });
  entries.sort((a, b) => a.lum - b.lum);
  return entries;
}

function nearestGem(r, g, b, lut) {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  let lo = 0, hi = lut.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (lut[mid].lum < lum) lo = mid + 1;
    else hi = mid;
  }
  const start = Math.max(0, lo - 3);
  const end = Math.min(lut.length - 1, lo + 3);
  let best = lut[lo], bestD = 1e12;
  for (let i = start; i <= end; i++) {
    const c = lut[i];
    const dr = r - c.r, dg = g - c.g, db = b - c.b;
    const d = dr * dr + dg * dg + db * db;
    if (d < bestD) { bestD = d; best = c; }
  }
  return best;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function weaveRect(w, h) {
  const side = Math.floor(w * LOOM_SIDE);
  return { x: side, y: 0, w: w - side * 2, h };
}

/** All dark gems as RGB + hex for well matching. */
const DARK_GEMS = Object.values(dark).map((hex) => {
  const [r, g, b] = hexToRgb(hex);
  return { r, g, b, hex, lum: 0.299 * r + 0.587 * g + 0.114 * b };
});

/**
 * From remapped cloth pixels, pick a dark well colour that *belongs to
 * this image* — the most frequent dark gemstone in the print, biased
 * toward the darkest frequent ink so terminal text stays readable.
 */
function wellFromCloth(data, w, h) {
  // Count dark pixels by nearest dark gem (skip light ground)
  const counts = new Map();
  const step = 4; // sample every 4th pixel for speed
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum > 140) continue; // skip linen / light fills
      let best = DARK_GEMS[0], bestD = 1e12;
      for (const c of DARK_GEMS) {
        const dr = r - c.r, dg = g - c.g, db = b - c.b;
        const d = dr * dr + dg * dg + db * db;
        if (d < bestD) { bestD = d; best = c; }
      }
      counts.set(best.hex, (counts.get(best.hex) || 0) + 1);
    }
  }
  if (counts.size === 0) return dark.sardius;

  // Prefer frequent dark inks; among top candidates pick the darkest
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, 4).map(([hex]) => DARK_GEMS.find((c) => c.hex === hex));
  top.sort((a, b) => a.lum - b.lum);
  return top[0].hex;
}

function makeClothCanvas(img, weaveW, weaveH, set) {
  const lut = buildLut(set);
  const srcC = document.createElement("canvas");
  srcC.width = weaveW;
  srcC.height = weaveH;
  const sctx = srcC.getContext("2d", { willReadFrequently: true });

  const scale = Math.max(weaveW / img.naturalWidth, weaveH / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = (weaveW - dw) / 2;
  const dy = (weaveH - dh) / 2;
  sctx.fillStyle = bright.pearl;
  sctx.fillRect(0, 0, weaveW, weaveH);
  sctx.drawImage(img, dx, dy, dw, dh);

  const src = sctx.getImageData(0, 0, weaveW, weaveH);
  const d = src.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 10) {
      d[i] = 199; d[i + 1] = 196; d[i + 2] = 184; d[i + 3] = 255;
      continue;
    }
    const gem = nearestGem(d[i], d[i + 1], d[i + 2], lut);
    d[i] = gem.r; d[i + 1] = gem.g; d[i + 2] = gem.b; d[i + 3] = 255;
  }
  sctx.putImageData(src, 0, 0);
  const well = wellFromCloth(d, weaveW, weaveH);
  return { canvas: srcC, well };
}

export class Scene1 {
  constructor(ctx) {
    this.ctx = ctx;
    this.time = 0;
    this.ready = false;
    this.cloths = [];
    this.sets = [];
    this.wells = [];
    this.prevGen = -1;
    this.fade = 1;
    this._size = { w: 0, h: 0 };
    /** Dark ink sampled from the active cloth image (boot reads this). */
    this.wellFill = dark.sardius;
    this._boot = this.boot();
  }

  async boot() {
    const loaded = [];
    for (const ref of REFS) {
      try {
        const img = await loadImage(ref.src);
        loaded.push({ img, setIdx: ref.set });
      } catch (e) {
        console.warn("Scene1 load fail", ref.src, e);
      }
    }
    this._raw = loaded;
    this.ready = loaded.length > 0;
  }

  ensureCloths(w, h) {
    const wr = weaveRect(w, h);
    if (this.cloths.length && this._size.w === wr.w && this._size.h === wr.h) return;
    if (!this._raw || !this._raw.length) return;
    this.cloths = [];
    this.sets = [];
    this.wells = [];
    for (const { img, setIdx } of this._raw) {
      const set = SETS[setIdx % SETS.length];
      const { canvas, well } = makeClothCanvas(img, wr.w, wr.h, set);
      this.cloths.push(canvas);
      this.sets.push(set);
      this.wells.push(well);
    }
    this._size = { w: wr.w, h: wr.h };
    if (this.wells.length) this.wellFill = this.wells[0];
  }

  render(params, w, h) {
    const motion = params.motion ?? 0.32;
    this.time += 0.016 * (0.6 + motion * 1.05);
    const ctx = this.ctx;
    const t = this.time;
    const beat = 0.55 + motion * 0.95;
    const set = this.sets[0] || SETS[0];

    // 1. Loom structure fills the whole frame (sides, beams, warps)
    this.drawLoom(ctx, w, h, t, beat, set);

    if (!this.ready) return;
    this.ensureCloths(w, h);
    if (!this.cloths.length) return;

    const wr = weaveRect(w, h);
    // Five times the previous pick rate so each cloth is beaten up quickly.
    const speed = 35 * beat * 5;
    const gen = Math.floor((t * speed) / h);
    const wovenY = Math.min(h, Math.floor((t * speed) - gen * h));

    if (gen !== this.prevGen) {
      this.prevGen = gen;
      this.fade = 0;
    }
    this.fade = Math.min(1, this.fade + 0.025 * beat);

    const cloth = this.cloths[gen % this.cloths.length];
    const prev = this.cloths[(gen - 1 + this.cloths.length) % this.cloths.length];
    const activeSet = this.sets[gen % this.sets.length];

    // Well colour is sampled from the active cloth image itself
    // (most frequent dark ink in the print → gemstone match)
    this.wellFill = this.wells[gen % this.wells.length] || dark.sardius;

    // 2. Previous cloth fading
    if (this.fade < 0.98 && gen > 0) {
      ctx.save();
      ctx.globalAlpha = (1 - this.fade) * 0.38;
      this.printWeft(ctx, prev, wr, h, activeSet);
      ctx.restore();
    }

    // 3. Pattern colour under the yarns (kept translucent so warps read through)
    ctx.save();
    ctx.globalAlpha = 0.42 + this.fade * 0.18;
    this.printWeft(ctx, cloth, wr, wovenY, activeSet);
    ctx.restore();

    // 4. Actual weft yarns — over-and-under thread, not a flat image strip
    this.threadTexture(ctx, cloth, wr, wovenY, activeSet, t);

    // 5. Shuttle
    this.shuttle(ctx, wr, wovenY, t, activeSet);

    // 6. Beams on top of cloth so loom stays legible
    this.drawBeams(ctx, w, h, activeSet);
  }

  // ─── Loom body: posts, warps, side structure ─────────────────────────

  drawLoom(ctx, w, h, t, beat, set) {
    const wr = weaveRect(w, h);
    const wood = set.wood;
    const warpCols = set.warp;

    // Side post fills (loom frame — not flat colour)
    this.drawPost(ctx, 0, 0, wr.x, h, wood, t, true);
    this.drawPost(ctx, wr.x + wr.w, 0, w - (wr.x + wr.w), h, wood, t, false);

    // Warp field ground (slightly darker than pearl so threads read)
    ctx.fillStyle = withAlpha(dark.amber, 0.12);
    ctx.fillRect(wr.x, 0, wr.w, h);

    // Dense vertical warps across the weaving area (skip well)
    const well = wellRect(w, h);
    const warpN = Math.floor(wr.w / 5);
    for (let i = 0; i < warpN; i++) {
      const x = wr.x + (i / (warpN - 1)) * wr.w;
      const tense = Math.sin(t * 0.7 * beat + i * 0.22) * 1.2 * beat;
      const col = warpCols[i % warpCols.length];
      const thick = i % 4 === 0 ? 1.35 : 0.7;
      ctx.strokeStyle = withAlpha(col, i % 4 === 0 ? 0.55 : 0.32);
      ctx.lineWidth = thick;

      if (x > well.x && x < well.x + well.w) {
        ctx.beginPath();
        ctx.moveTo(x + tense * 0.08, 0);
        ctx.lineTo(x, well.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, well.y + well.h);
        ctx.lineTo(x - tense * 0.08, h);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(x + tense * 0.08, 0);
        ctx.quadraticCurveTo(x + tense, h * 0.5, x - tense * 0.08, h);
        ctx.stroke();
      }
    }

    // Heddle suggestion — faint horizontal bars in the upper third of weave
    ctx.strokeStyle = withAlpha(wood[0], 0.2);
    ctx.lineWidth = 2;
    for (let k = 0; k < 3; k++) {
      const y = h * 0.12 + k * 10;
      ctx.beginPath();
      ctx.moveTo(wr.x, y);
      ctx.lineTo(wr.x + wr.w, y);
      ctx.stroke();
    }
  }

  drawPost(ctx, x, y, pw, h, wood, t, left) {
    // Solid post body
    ctx.fillStyle = wood[0];
    ctx.fillRect(x, y, pw, h);

    // Vertical grain lines
    for (let i = 0; i < 8; i++) {
      const gx = x + 4 + (i / 7) * (pw - 8);
      ctx.strokeStyle = withAlpha(wood[i % wood.length], 0.35 + (i % 3) * 0.1);
      ctx.lineWidth = 1.2 + (i % 2);
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx + Math.sin(t * 0.3 + i) * 0.5, h);
      ctx.stroke();
    }

    // Inner edge highlight (facing the weave)
    const edgeX = left ? x + pw - 2 : x + 1;
    ctx.strokeStyle = withAlpha(bright.amber, 0.35);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(edgeX, 0);
    ctx.lineTo(edgeX, h);
    ctx.stroke();

    // Pegs / beam joints along the post
    for (let py = h * 0.08; py < h; py += h * 0.14) {
      ctx.fillStyle = withAlpha(wood[1], 0.85);
      ctx.beginPath();
      ctx.ellipse(left ? x + pw - 6 : x + 6, py, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = withAlpha(dark.sardius, 0.5);
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  drawBeams(ctx, w, h, set) {
    const wr = weaveRect(w, h);
    const wood = set.wood;

    // Top breast beam
    ctx.fillStyle = wood[0];
    ctx.fillRect(0, 0, w, 18);
    ctx.fillStyle = withAlpha(wood[1], 0.7);
    ctx.fillRect(0, 14, w, 6);
    ctx.strokeStyle = withAlpha(bright.amber, 0.3);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(w, 18);
    ctx.stroke();

    // Bottom cloth beam
    ctx.fillStyle = wood[0];
    ctx.fillRect(0, h - 20, w, 20);
    ctx.fillStyle = withAlpha(wood[2] || wood[1], 0.7);
    ctx.fillRect(0, h - 20, w, 6);
    ctx.strokeStyle = withAlpha(bright.amber, 0.25);
    ctx.beginPath();
    ctx.moveTo(0, h - 20);
    ctx.lineTo(w, h - 20);
    ctx.stroke();

    // Beam end caps over posts
    for (const bx of [0, w - wr.x]) {
      ctx.fillStyle = wood[1];
      ctx.fillRect(bx === 0 ? 0 : w - wr.x, 0, wr.x, 22);
      ctx.fillRect(bx === 0 ? 0 : w - wr.x, h - 22, wr.x, 22);
    }
  }

  // ─── Progressive weft print into the weave rectangle ─────────────────

  printWeft(ctx, clothCanvas, wr, wovenY, set) {
    if (wovenY < 1) return;
    const w = wr.w + wr.x * 2; // full canvas width for well calc
    const h = clothCanvas.height;
    const well = wellRect(w, h);
    const yEnd = Math.min(wovenY, h);

    // Map well into weave-local coordinates
    const wellLocal = {
      x: well.x - wr.x,
      y: well.y,
      w: well.w,
      h: well.h
    };

    const above = Math.min(yEnd, Math.floor(well.y));
    if (above > 0) {
      ctx.drawImage(clothCanvas, 0, 0, wr.w, above, wr.x, 0, wr.w, above);
    }

    const mid0 = Math.max(0, Math.floor(well.y));
    const mid1 = Math.min(yEnd, Math.ceil(well.y + well.h));
    if (mid1 > mid0) {
      const leftW = Math.max(0, Math.floor(wellLocal.x));
      const rightX = Math.ceil(wellLocal.x + wellLocal.w);
      const rightW = Math.max(0, wr.w - rightX);
      const midH = mid1 - mid0;
      if (leftW > 0) {
        ctx.drawImage(clothCanvas, 0, mid0, leftW, midH, wr.x, mid0, leftW, midH);
      }
      if (rightW > 0) {
        ctx.drawImage(
          clothCanvas, rightX, mid0, rightW, midH,
          wr.x + rightX, mid0, rightW, midH
        );
      }
    }

    const below = Math.max(mid1, Math.ceil(well.y + well.h));
    if (yEnd > below) {
      const bh = yEnd - below;
      ctx.drawImage(clothCanvas, 0, below, wr.w, bh, wr.x, below, wr.w, bh);
    }
  }

  /**
   * Draw each printed pick as a real weft yarn interlacing the warps.
   * Colour is sampled from the cloth image so the pattern still reads,
   * but the surface is thread, not a flat progressive bitmap.
   */
  threadTexture(ctx, clothCanvas, wr, wovenY, set, t) {
    if (wovenY < 2 || !clothCanvas) return;
    const W = wr.x * 2 + wr.w;
    const H = clothCanvas.height || 1080;
    const wellG = wellRect(W, H);
    const pick = 3; // one yarn every 3px — visible thread rib
    const warpStep = 6;

    // Cache row pixel data once per pick (not per segment)
    let sctx = null;
    try {
      sctx = clothCanvas.getContext("2d", { willReadFrequently: true });
    } catch (_) { /* ignore */ }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let y = 2; y < wovenY; y += pick) {
      const row = Math.min(H - 1, Math.floor(y));
      const wobble = Math.sin(y * 0.28 + t * 1.4) * 0.55;
      const yy = y + wobble;
      const shed = Math.floor(y / pick) % 2;

      // One full-row sample for this pick
      let rowData = null;
      if (sctx) {
        try {
          rowData = sctx.getImageData(0, row, clothCanvas.width, 1).data;
        } catch (_) { /* ignore */ }
      }

      // Beat-up shadow under the pick
      ctx.strokeStyle = withAlpha(dark.amber, 0.22);
      ctx.lineWidth = pick + 0.5;
      this.strokeWeftGaps(ctx, yy + 1.1, wr.x, wr.x + wr.w, wellG);

      for (let x = wr.x; x < wr.x + wr.w - 1; x += warpStep) {
        if (yy > wellG.y && yy < wellG.y + wellG.h &&
            x + warpStep > wellG.x && x < wellG.x + wellG.w) {
          continue;
        }
        const localX = Math.max(0, Math.min(clothCanvas.width - 1, Math.floor(x - wr.x)));
        let r = 120, g = 80, b = 40;
        if (rowData) {
          const i = localX * 4;
          r = rowData[i]; g = rowData[i + 1]; b = rowData[i + 2];
        }
        const under = ((Math.floor(x / warpStep) + shed) % 2) === 0;
        const x1 = Math.min(wr.x + wr.w, x + warpStep);

        if (under) {
          ctx.strokeStyle = `rgba(${Math.max(0, r - 35)},${Math.max(0, g - 30)},${Math.max(0, b - 25)},0.55)`;
          ctx.lineWidth = pick * 0.55;
          ctx.beginPath();
          ctx.moveTo(x + 0.8, yy + 0.6);
          ctx.lineTo(x1 - 0.8, yy + 0.6);
          ctx.stroke();
        } else {
          ctx.strokeStyle = `rgb(${r},${g},${b})`;
          ctx.lineWidth = pick * 0.95;
          ctx.beginPath();
          ctx.moveTo(x, yy);
          ctx.lineTo(x1, yy);
          ctx.stroke();
          ctx.strokeStyle = withAlpha(bright.pearl, 0.28);
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(x + 1, yy - 0.7);
          ctx.lineTo(x1 - 1, yy - 0.7);
          ctx.stroke();
        }
      }
    }

    // Stronger warp posts still visible in the woven field (tabby structure)
    ctx.strokeStyle = withAlpha(set.warp[0], 0.2);
    ctx.lineWidth = 0.7;
    for (let x = wr.x; x < wr.x + wr.w; x += warpStep * 2) {
      if (x > wellG.x && x < wellG.x + wellG.w) continue;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, Math.min(wovenY, wellG.y));
      if (wovenY > wellG.y + wellG.h) {
        ctx.moveTo(x, wellG.y + wellG.h);
        ctx.lineTo(x, wovenY);
      }
      ctx.stroke();
    }
  }

  strokeWeftGaps(ctx, y, x0, x1, well) {
    if (y < well.y || y > well.y + well.h) {
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
      return;
    }
    if (x0 < well.x) {
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(Math.min(x1, well.x), y);
      ctx.stroke();
    }
    if (x1 > well.x + well.w) {
      ctx.beginPath();
      ctx.moveTo(Math.max(x0, well.x + well.w), y);
      ctx.lineTo(x1, y);
      ctx.stroke();
    }
  }

  shuttle(ctx, wr, wovenY, t, set) {
    const sy = Math.min(wr.h - 4, Math.max(4, wovenY));
    const dir = Math.floor(wovenY / 5) % 2 === 0 ? 1 : -1;
    const frac = (wovenY % 5) / 5;
    let sx = wr.x + (dir === 1 ? frac * wr.w : (1 - frac) * wr.w);
    const W = wr.x * 2 + wr.w;
    const H = 1080;
    if (inWell(sx, sy, W, H, 0)) {
      const well = wellRect(W, H);
      sx = dir === 1 ? well.x + well.w + 14 : well.x - 14;
    }
    const yarn = set.gems[Math.min(5, set.gems.length - 1)];

    // Shuttle body (boat shape)
    ctx.fillStyle = set.wood[0];
    ctx.beginPath();
    ctx.ellipse(sx, sy, 16, 4.2, dir === 1 ? 0.08 : -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = yarn;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 10, 2.6, dir === 1 ? 0.08 : -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = withAlpha(dark.amber, 0.55);
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Trailing yarn
    ctx.strokeStyle = withAlpha(yarn, 0.9);
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(
      sx - dir * 30,
      sy + Math.sin(t * 6) * 5,
      sx - dir * 58,
      sy + Math.sin(t * 5) * 3
    );
    ctx.stroke();
  }
}
