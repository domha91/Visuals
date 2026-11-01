// @ts-nocheck
/**
 * Scene 2 — Candlewick / lace (infinite tapestry).
 *
 * Reference patterns are gemstone-remapped (hue-aware, full palette spread)
 * and laid as consecutive panels of a continuous cloth. The cloth scrolls
 * left ← right, one continuous picture. The centre well is filled after
 * the cloth is drawn, so a motif passes underneath and comes out whole.
 *
 * Well colour is taken from whichever panel is inside the well, including
 * the one that has only just reached it.
 */
import { bright, dark, withAlpha } from "../palette.js";
import { wellRect } from "../well.js";

/* ── reference panels (exact patterns; colour variants for variety) ─ */
const REFS = [
  { src: "/scene2/lace-medallions.png", set: 0 },
  { src: "/scene2/lace-squares.png", set: 1 },
  { src: "/scene2/lace-pink.png", set: 2 },
  { src: "/scene2/lace-mixed.png", set: 3 },
  { src: "/scene2/lace-floral.png", set: 4 },
  { src: "/scene2/candlewick-circles.png", set: 5 },
  { src: "/scene2/stipple-fabric.png", set: 6 },
  { src: "/scene2/interlace-strap.png", set: 7 },
  { src: "/scene2/diamond-diaper.png", set: 8 },
  { src: "/scene2/lace-medallions.png", set: 2 },
  { src: "/scene2/lace-squares.png", set: 4 },
  { src: "/scene2/lace-pink.png", set: 0 },
  { src: "/scene2/diamond-diaper.png", set: 6 },
  { src: "/scene2/stipple-fabric.png", set: 3 },
  { src: "/scene2/lace-floral.png", set: 1 },
  { src: "/scene2/interlace-strap.png", set: 5 }
];

/**
 * Wide gemstone sets — many hues per panel so remap keeps internal variety.
 * darkGround: light-on-black lace sources.
 */
const SETS = [
  {
    darkGround: true,
    gems: [
      bright.jasper, bright.pearl, bright.diamond, bright.ligure, bright.amber,
      bright.topaz, bright.carbuncle, bright.chrysolyte, bright.sardonyx, bright.ruby,
      bright.sardius, bright.emerald, bright.chrysoprasus,
      dark.amber, dark.vermilion, dark.topaz, dark.sardius, dark.crimson
    ]
  },
  {
    darkGround: true,
    gems: [
      bright.jasper, bright.pearl, bright.diamond, bright.chalcedony, bright.crystal,
      bright.sapphire, bright.agate, bright.beryl, bright.amethyst, bright.jacinth,
      bright.emerald, bright.chrysoprasus,
      dark.chalcedony, dark.sapphire, dark.crystal, dark.beryl, dark.jacinth, dark.purple
    ]
  },
  {
    darkGround: true,
    gems: [
      bright.jasper, bright.pearl, bright.ruby, bright.carbuncle, bright.sardonyx,
      bright.sardius, bright.jacinth, bright.amethyst, bright.ligure, bright.amber,
      bright.topaz, bright.sapphire,
      dark.scarlet, dark.crimson, dark.sardius, dark.purple, dark.amethyst, dark.sapphire
    ]
  },
  {
    darkGround: true,
    gems: [
      bright.jasper, bright.pearl, bright.chrysolyte, bright.chrysoprasus, bright.emerald,
      bright.beryl, bright.topaz, bright.chalcedony, bright.amber, bright.sapphire,
      bright.ruby, bright.crystal,
      dark.chrysolyte, dark.chrysoprasus, dark.emerald, dark.beryl, dark.topaz, dark.chalcedony
    ]
  },
  {
    darkGround: false,
    gems: [
      bright.jasper, bright.pearl, bright.ligure, bright.amber, bright.topaz,
      bright.emerald, bright.chrysoprasus, bright.sapphire, bright.ruby, bright.amethyst,
      bright.jacinth, bright.carbuncle, bright.sardius, bright.crystal, bright.chalcedony,
      bright.chrysolyte, bright.beryl, bright.sardonyx,
      dark.amber, dark.emerald, dark.sapphire, dark.sardius, dark.purple, dark.crimson,
      dark.chrysolyte, dark.chalcedony
    ]
  },
  {
    darkGround: false,
    gems: [
      bright.jasper, bright.pearl, bright.chrysolyte, bright.chrysoprasus, bright.emerald,
      bright.beryl, bright.topaz, bright.amber, bright.ligure, bright.ruby, bright.sapphire,
      dark.chrysolyte, dark.chrysoprasus, dark.emerald, dark.beryl, dark.topaz, dark.amber,
      dark.sardius
    ]
  },
  {
    darkGround: false,
    gems: [
      bright.jasper, bright.pearl, bright.diamond, bright.agate, bright.chalcedony,
      bright.sapphire, bright.crystal, bright.amethyst, bright.beryl, bright.jacinth,
      bright.ruby, bright.emerald,
      dark.chalcedony, dark.sapphire, dark.crystal, dark.jacinth, dark.purple, dark.amber,
      dark.beryl, dark.sardius
    ]
  },
  {
    darkGround: false,
    gems: [
      bright.jasper, bright.pearl, bright.ligure, bright.amber, bright.topaz, bright.carbuncle,
      bright.sardonyx, bright.ruby, bright.sardius, bright.emerald, bright.chrysoprasus,
      bright.sapphire, bright.amethyst,
      dark.amber, dark.vermilion, dark.sardius, dark.crimson, dark.topaz, dark.emerald, dark.purple
    ]
  },
  {
    darkGround: false,
    gems: [
      bright.jasper, bright.pearl, bright.diamond, bright.chalcedony, bright.sapphire,
      bright.crystal, bright.agate, bright.amethyst, bright.jacinth, bright.ruby, bright.emerald,
      bright.topaz, bright.amber,
      dark.chalcedony, dark.sapphire, dark.crystal, dark.purple, dark.jacinth, dark.sardius,
      dark.amber, dark.emerald
    ]
  }
];

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function buildLut(set) {
  return set.gems.map((hex) => {
    const [r, g, b] = hexToRgb(hex);
    const [h, s, l] = rgbToHsl(r, g, b);
    return { r, g, b, h, s, l, lum: 0.299 * r + 0.587 * g + 0.114 * b, hex };
  });
}

/**
 * Hue-aware nearest gem: match hue first (when source is chromatic),
 * then luminance. Keeps multi-colour lace from collapsing to one gem.
 */
function nearestGem(r, g, b, lut) {
  const [h, s, l] = rgbToHsl(r, g, b);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  let best = lut[0], bestD = 1e12;
  for (const c of lut) {
    // Hue distance on circle (0..0.5)
    let dh = Math.abs(h - c.h);
    if (dh > 0.5) dh = 1 - dh;
    // Low-saturation sources weight hue less
    const hueW = 180 * s * s;
    const lumW = 1.1;
    const satW = 40;
    const d =
      hueW * dh * dh +
      lumW * (l - c.l) * (l - c.l) +
      satW * (s - c.s) * (s - c.s) +
      0.002 * ((r - c.r) ** 2 + (g - c.g) ** 2 + (b - c.b) ** 2);
    // slight bias toward lum for near-grey
    const d2 = s < 0.08
      ? (lum - c.lum) ** 2 * 0.05 + ((r - c.r) ** 2 + (g - c.g) ** 2 + (b - c.b) ** 2) * 0.01
      : d;
    if (d2 < bestD) {
      bestD = d2;
      best = c;
    }
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

const DARK_GEMS = Object.values(dark).map((hex) => {
  const [r, g, b] = hexToRgb(hex);
  return { r, g, b, hex, lum: 0.299 * r + 0.587 * g + 0.114 * b };
});

function wellFromRegion(data, w, h, x0, y0, x1, y1, fallback) {
  const counts = new Map();
  const step = 5;
  const xa = Math.max(0, Math.floor(x0));
  const xb = Math.min(w, Math.ceil(x1));
  const ya = Math.max(0, Math.floor(y0));
  const yb = Math.min(h, Math.ceil(y1));
  for (let y = ya; y < yb; y += step) {
    for (let x = xa; x < xb; x += step) {
      const i = (y * w + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum > 150) continue;
      let best = DARK_GEMS[0], bestD = 1e12;
      for (const c of DARK_GEMS) {
        const dr = r - c.r, dg = g - c.g, db = b - c.b;
        const d = dr * dr + dg * dg + db * db;
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      counts.set(best.hex, (counts.get(best.hex) || 0) + 1);
    }
  }
  if (counts.size === 0) return fallback;
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, 5).map(([hex]) => DARK_GEMS.find((c) => c.hex === hex));
  top.sort((a, b) => a.lum - b.lum);
  return top[0].hex;
}

/**
 * Cover-fit to panel — same motif scale as the earlier full-frame look.
 * Image fills the panel; gemstone-remap follows.
 */
function makePanel(img, W, H, set) {
  const lut = buildLut(set);
  const srcC = document.createElement("canvas");
  srcC.width = W;
  srcC.height = H;
  const sctx = srcC.getContext("2d", { willReadFrequently: true });

  // Cover the panel so motifs read at the previous (larger) size
  const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = (W - dw) / 2;
  const dy = (H - dh) / 2;

  sctx.fillStyle = bright.pearl;
  sctx.fillRect(0, 0, W, H);
  sctx.drawImage(img, dx, dy, dw, dh);

  const src = sctx.getImageData(0, 0, W, H);
  const d = src.data;
  const pearl = hexToRgb(bright.pearl);

  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 10) {
      d[i] = pearl[0];
      d[i + 1] = pearl[1];
      d[i + 2] = pearl[2];
      d[i + 3] = 255;
      continue;
    }
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (set.darkGround && lum < 48) {
      d[i] = pearl[0];
      d[i + 1] = pearl[1];
      d[i + 2] = pearl[2];
      d[i + 3] = 255;
      continue;
    }
    // Near-parchment stays parchment (don't force a gem on ground)
    if (!set.darkGround && lum > 230 && Math.abs(d[i] - d[i + 1]) < 20) {
      d[i] = pearl[0];
      d[i + 1] = pearl[1];
      d[i + 2] = pearl[2];
      d[i + 3] = 255;
      continue;
    }
    const gem = nearestGem(d[i], d[i + 1], d[i + 2], lut);
    d[i] = gem.r;
    d[i + 1] = gem.g;
    d[i + 2] = gem.b;
    d[i + 3] = 255;
  }
  sctx.putImageData(src, 0, 0);
  return { canvas: srcC, data: d };
}

export class Scene2 {
  constructor(ctx) {
    this.ctx = ctx;
    this.time = 0;
    this.ready = false;
    this.panels = [];
    this.scroll = 0;
    this._size = { w: 0, h: 0 };
    this.wellFill = dark.crystal;
    this._boot = this.boot();
  }

  async boot() {
    const loaded = [];
    for (const ref of REFS) {
      try {
        const img = await loadImage(ref.src);
        loaded.push({ img, setIdx: ref.set });
      } catch (e) {
        console.warn("Scene2 load fail", ref.src, e);
      }
    }
    this._raw = loaded;
    this.ready = loaded.length > 0;
  }

  ensurePanels(w, h) {
    if (this.panels.length && this._size.w === w && this._size.h === h) return;
    if (!this._raw || !this._raw.length) return;
    this.panels = [];
    for (const { img, setIdx } of this._raw) {
      const set = SETS[setIdx % SETS.length];
      const { canvas, data } = makePanel(img, w, h, set);
      this.panels.push({ canvas, data, w, h });
    }
    this._size = { w, h };
    this.scroll = 0;
  }

  render(params, w, h) {
    const motion = params.motion ?? 0.32;
    this.time += 0.016 * (0.5 + motion * 0.9);
    const ctx = this.ctx;
    const beat = 0.45 + motion * 0.85;

    if (!this.ready) return;
    this.ensurePanels(w, h);
    if (!this.panels.length) return;

    // ~one panel / 50s at idle
    const pxPerSec = (w / 50) * beat;
    this.scroll += pxPerSec * 0.016;
    const stripW = this.panels.length * w;
    if (this.scroll >= stripW) this.scroll -= stripW;

    const n = this.panels.length;
    const startIdx = Math.floor(this.scroll / w) % n;

    for (let k = 0; k <= 1; k++) {
      const idx = (startIdx + k) % n;
      const panelOrigin = Math.floor(this.scroll / w) * w + k * w;
      const dx = panelOrigin - this.scroll;
      this.drawPanel(ctx, this.panels[idx], dx, w, h);
    }

    // The moment a panel overlaps the well, sample that panel — not a lagging timer.
    this.sampleWell(w, h);

    this.picotBorder(ctx, w, h);
  }

  /**
   * One continuous cloth. The well is punched afterwards, so a motif
   * slides underneath and comes out intact. Do not slice the well's
   * band out of the picture — that deletes the pattern as it passes.
   */
  drawPanel(ctx, panel, dx, w, h) {
    if (dx >= w || dx + w <= 0) return;
    ctx.drawImage(panel.canvas, Math.round(dx), 0);
  }

  sampleWell(w, h) {
    const well = wellRect(w, h);
    const n = this.panels.length;
    if (!n) return;
    const base = Math.floor(this.scroll / w);
    let chosen = null;
    for (let k = 0; k <= 1; k++) {
      const dx = (base + k) * w - this.scroll;
      if (dx + w <= well.x || dx >= well.x + well.w) continue;
      chosen = { idx: (base + k) % n, dx };
    }
    if (!chosen) return;
    const panel = this.panels[chosen.idx];
    let x0 = well.x - chosen.dx;
    let x1 = well.x + well.w - chosen.dx;
    const inside = Math.min(panel.w, x1) - Math.max(0, x0);
    // Just reached the well: read the entering face, not a one-pixel sliver.
    if (inside < 180) {
      x0 = Math.max(0, Math.min(panel.w - 220, x0));
      x1 = x0 + 220;
    }
    this.wellFill = wellFromRegion(
      panel.data, panel.w, panel.h,
      x0, well.y,
      x1, well.y + well.h,
      this.wellFill
    );
  }

  picotBorder(ctx, w, h) {
    ctx.strokeStyle = withAlpha(bright.amber, 0.38);
    ctx.lineWidth = 1.0;
    const n = 40;
    const t = this.time;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const x = u * w;
      const bob = Math.sin(t * 0.2 + i * 0.55) * 1.1;
      ctx.beginPath();
      ctx.arc(x, 8 + bob, 6.5, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, h - 8, 6.5, 0, Math.PI);
      ctx.stroke();
    }
  }
}
