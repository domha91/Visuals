// @ts-nocheck
/**
 * Central well for the live-coding terminal overlay.
 * Filled with a dark gemstone so light terminal text stays readable
 * after the terminal's own background is chromakeyed out.
 */
import { dark } from "./palette.js";

export function wellRect(w, h) {
  const ww = w * 0.40;
  const hh = h * 0.34;
  return { x: (w - ww) / 2, y: (h - hh) / 2, w: ww, h: hh, r: 10 };
}

export function inWell(px, py, w, h, pad = 8) {
  const r = wellRect(w, h);
  return px > r.x - pad && px < r.x + r.w + pad && py > r.y - pad && py < r.y + r.h + pad;
}

export function wellFillFor(scene) {
  const fills = [
    dark.emerald,
    dark.sardius,
    dark.crystal,
    dark.vermilion,
    dark.amber,
    dark.vermilion,
    dark.sapphire
  ];
  return fills[scene] || dark.emerald;
}

function roundWell(ctx, r, pad = 0) {
  const x = r.x - pad, y = r.y - pad, rw = r.w + pad * 2, rh = r.h + pad * 2, cr = r.r + pad * 0.4;
  ctx.beginPath();
  ctx.moveTo(x + cr, y);
  ctx.arcTo(x + rw, y, x + rw, y + rh, cr);
  ctx.arcTo(x + rw, y + rh, x, y + rh, cr);
  ctx.arcTo(x, y + rh, x, y, cr);
  ctx.arcTo(x, y, x + rw, y, cr);
  ctx.closePath();
}

export function punchWell(ctx, w, h, fill) {
  const r = wellRect(w, h);
  ctx.save();
  ctx.fillStyle = fill;
  roundWell(ctx, r, 0);
  ctx.fill();
  ctx.restore();
}

/** Thin cartouche so the well reads as designed, not cropped. */
export function frameWell(ctx, w, h, stroke) {
  const r = wellRect(w, h);
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.6;
  roundWell(ctx, r, 7);
  ctx.stroke();
  ctx.lineWidth = 0.7;
  roundWell(ctx, r, 2);
  ctx.stroke();
  ctx.restore();
}

/** Split a horizontal span around the well. Returns 0–2 segments. */
export function weftGaps(y, x0, x1, w, h) {
  const r = wellRect(w, h);
  if (y < r.y || y > r.y + r.h) return [[x0, x1]];
  const left = Math.min(x1, r.x);
  const right = Math.max(x0, r.x + r.w);
  const out = [];
  if (x0 < left) out.push([x0, left]);
  if (right < x1) out.push([right, x1]);
  return out;
}
