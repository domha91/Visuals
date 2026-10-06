// @ts-nocheck
/**
 * Scene 2 — reticella lace GRID + candlewick bedspread.
 * Cartesian mesh (not rings). Square units, picots, tufted repeats.
 * Corner 8-fold rose windows as architectural inserts only.
 */
import { hash2 } from "../rng.js";
import { bright, dark, withAlpha } from "../palette.js";
import { inWell, wellRect } from "../well.js";

const THREAD = [
  bright.pearl, bright.jasper, bright.amber, bright.sardius,
  bright.ruby, bright.emerald, bright.sapphire, bright.topaz
];
const KNOT = [
  bright.sardius, bright.amber, bright.emerald, bright.jacinth,
  bright.ruby, bright.chrysoprasus, bright.carbuncle, bright.crystal
];

function tuft(ctx, x, y, r, col) {
  ctx.fillStyle = col;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r * 0.42, y + Math.sin(a) * r * 0.42, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, r * 0.26, 0, Math.PI * 2);
  ctx.fill();
}

function roseInsert(ctx, R, gem, ink) {
  ctx.strokeStyle = gem;
  ctx.lineWidth = Math.max(0.8, R * 0.025);
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.cos(a) * R * 0.82;
    const y = Math.sin(a) * R * 0.82;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * R * 0.18, Math.sin(a) * R * 0.18);
    ctx.lineTo(Math.cos(a) * R * 0.82, Math.sin(a) * R * 0.82);
    ctx.stroke();
  }
}

export class Scene2 {
  constructor(ctx) {
    this.ctx = ctx;
    this.time = 0;
  }

  render(params, w, h) {
    const motion = params.motion ?? 0.32;
    this.time += 0.01 * (0.5 + motion);
    const t = this.time;
    const stitch = (t * 0.2) % 1;
    this.reticella(w, h, stitch);
    this.bedspread(w, h, stitch, t);
    this.coffers(w, h);
    this.corners(w, h);
    this.picotEdge(w, h, t);
  }

  /** Square punto-in-aria mesh — the lace is a GRID. */
  reticella(w, h, stitch) {
    const ctx = this.ctx;
    const s = 26;
    const rows = Math.floor(h / s);
    const shown = Math.floor(stitch * rows) + 8;
    ctx.strokeStyle = withAlpha(bright.pearl, 0.7);
    ctx.lineWidth = 0.85;
    for (let row = 0; row < rows; row++) {
      if (row > shown) continue;
      for (let col = 0; col < w / s; col++) {
        const x = col * s, y = row * s;
        if (inWell(x + s * 0.5, y + s * 0.5, w, h, 4)) continue;
        ctx.strokeRect(x, y, s, s);
        if ((row + col) % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(x, y); ctx.lineTo(x + s, y + s);
          ctx.moveTo(x + s, y); ctx.lineTo(x, y + s);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(x + s * 0.5, y);
          ctx.lineTo(x + s, y + s * 0.5);
          ctx.lineTo(x + s * 0.5, y + s);
          ctx.lineTo(x, y + s * 0.5);
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
  }

  /** Repeating candlewick units on a brick lattice — bedspread, not a wheel. */
  bedspread(w, h, stitch, t) {
    const ctx = this.ctx;
    const cellW = 110, cellH = 88;
    let n = 0;
    for (let row = 0, y = 48; y < h - 40; y += cellH, row++) {
      const ox = (row % 2) * (cellW * 0.5);
      for (let x = 40 + ox; x < w - 40; x += cellW, n++) {
        if (inWell(x, y, w, h, 24)) continue;
        const appear = (n / 28 + stitch) % 1;
        if (appear > 0.72) continue;
        const col = KNOT[n % KNOT.length];
        const r = 11 + Math.sin(t * 0.35 + n) * 1.2;
        tuft(ctx, x, y, r, col);
        ctx.strokeStyle = withAlpha(THREAD[n % THREAD.length], 0.7);
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 22, y - 16, 44, 32);
        ctx.beginPath();
        ctx.moveTo(x - 22, y); ctx.lineTo(x + 22, y);
        ctx.moveTo(x, y - 16); ctx.lineTo(x, y + 16);
        ctx.stroke();
      }
    }
  }

  coffers(w, h) {
    const ctx = this.ctx;
    const well = wellRect(w, h);
    ctx.strokeStyle = withAlpha(dark.amber, 0.28);
    ctx.lineWidth = 2;
    const frames = [
      [12, 12, w - 24, 28],
      [12, h - 40, w - 24, 28],
      [12, 12, 28, h - 24],
      [w - 40, 12, 28, h - 24]
    ];
    for (const f of frames) ctx.strokeRect(f[0], f[1], f[2], f[3]);
    ctx.strokeRect(well.x - 18, well.y - 18, well.w + 36, well.h + 36);
  }

  corners(w, h) {
    const ctx = this.ctx;
    const spots = [[70, 70], [w - 70, 70], [70, h - 70], [w - 70, h - 70]];
    spots.forEach((p, i) => {
      ctx.save();
      ctx.translate(p[0], p[1]);
      roseInsert(ctx, 42, THREAD[i], dark.sardius);
      ctx.restore();
    });
  }

  picotEdge(w, h, t) {
    const ctx = this.ctx;
    ctx.strokeStyle = withAlpha(bright.amber, 0.55);
    ctx.lineWidth = 1.1;
    const n = 36;
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * w;
      ctx.beginPath();
      ctx.arc(x, 10 + Math.sin(t * 0.25 + i) * 1.5, 8, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, h - 10, 8, 0, Math.PI);
      ctx.stroke();
    }
  }
}
