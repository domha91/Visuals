// @ts-nocheck
/**
 * Scene 4 — Script. A 1611 page with no terminal well.
 *
 * Page furniture from the Authorised Version (running title, chapter,
 * argument, two columns, verse numbers, catchword, signature).
 * Ornament from the writing-master plates: a broad-nib downstroke,
 * woodcut initial, headpiece, and three concentric circles with an octagon.
 *
 * Inks are gemstones only. Motion is a slow leaf: pen flourishes draw,
 * type settles into the paper, then the page turns.
 */
import { parchment, bright, dark, withAlpha } from "../palette.js";
import { headingFont, bodyFont, handFont } from "../fonts.js";
import { hash2 } from "../rng.js";

const INK = dark.amber;
const RUBRIC = dark.crimson;
const LETTER = dark.sardius;
const HAND = dark.chalcedony;
const PAGE = 26;

const ROMAN = [
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
];

function roman(n) {
  let s = "";
  let v = Math.max(1, n | 0);
  for (const [k, g] of ROMAN) {
    while (v >= k) { s += g; v -= k; }
  }
  return s;
}

function smoothstep(a, b, t) {
  if (t <= a) return 0;
  if (t >= b) return 1;
  const x = (t - a) / (b - a);
  return x * x * (3 - 2 * x);
}

function wordsOf(text) {
  return String(text || "").split(/\s+/).filter(Boolean);
}

function cubic(p0, p1, p2, p3) {
  return { p0, p1, p2, p3 };
}

function pt(x, y) {
  return { x, y };
}

function sampleSeg(seg, t) {
  const { p0, p1, p2, p3 } = seg;
  const u = 1 - t;
  const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
  const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;
  const dx = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
  const dy = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
  return { x, y, dx, dy };
}

/** Broad nib: vertical travel is thick, horizontal travel is a hairline. */
function penRibbon(ctx, segs, grow, color, alpha, scale) {
  if (!segs || !segs.length || grow <= 0.015) return;
  const samples = [];
  const limit = grow * segs.length;
  for (let s = 0; s < segs.length; s++) {
    if (s >= limit) break;
    const local = Math.min(1, limit - s);
    const n = Math.max(2, Math.ceil(14 * local));
    for (let i = 0; i <= n; i++) {
      const p = sampleSeg(segs[s], (i / n) * local);
      const len = Math.hypot(p.dx, p.dy) || 1;
      const nib = Math.abs(Math.sin(Math.atan2(p.dy, p.dx)));
      const w = (0.65 + nib * 5.6) * (scale || 1);
      samples.push({ x: p.x, y: p.y, nx: -p.dy / len, ny: p.dx / len, w });
    }
  }
  if (samples.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(samples[0].x + samples[0].nx * samples[0].w, samples[0].y + samples[0].ny * samples[0].w);
  for (let i = 1; i < samples.length; i++) {
    const s = samples[i];
    ctx.lineTo(s.x + s.nx * s.w, s.y + s.ny * s.w);
  }
  for (let i = samples.length - 1; i >= 0; i--) {
    const s = samples[i];
    ctx.lineTo(s.x - s.nx * s.w, s.y - s.ny * s.w);
  }
  ctx.closePath();
  ctx.fillStyle = withAlpha(color, alpha == null ? 0.94 : alpha);
  ctx.fill();
}

function ovalSegs(cx, cy, rx, ry) {
  const k = 0.5522847498;
  return [
    cubic(pt(cx, cy - ry), pt(cx + rx * k, cy - ry), pt(cx + rx, cy - ry * k), pt(cx + rx, cy)),
    cubic(pt(cx + rx, cy), pt(cx + rx, cy + ry * k), pt(cx + rx * k, cy + ry), pt(cx, cy + ry)),
    cubic(pt(cx, cy + ry), pt(cx - rx * k, cy + ry), pt(cx - rx, cy + ry * k), pt(cx - rx, cy)),
    cubic(pt(cx - rx, cy), pt(cx - rx, cy - ry * k), pt(cx - rx * k, cy - ry), pt(cx, cy - ry))
  ];
}

function waveSegs(x0, x1, y, amp, humps) {
  const segs = [];
  const span = (x1 - x0) / humps;
  for (let i = 0; i < humps; i++) {
    const x = x0 + i * span;
    const dir = i % 2 ? 1 : -1;
    segs.push(cubic(
      pt(x, y),
      pt(x + span * 0.25, y + amp * dir),
      pt(x + span * 0.75, y + amp * dir),
      pt(x + span, y)
    ));
  }
  return segs;
}

function leaf(ctx, x, y, ang, len, color, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.42, -len * 0.36, len, 0);
  ctx.quadraticCurveTo(len * 0.42, len * 0.36, 0, 0);
  ctx.fillStyle = withAlpha(color, alpha);
  ctx.fill();
  ctx.strokeStyle = withAlpha(LETTER, alpha * 0.85);
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(2, 0);
  ctx.lineTo(len * 0.82, 0);
  ctx.stroke();
  ctx.restore();
}

function drawBird(ctx, x, y, sc, flip, ink, grow) {
  if (grow < 0.05) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip * sc, sc);
  ctx.globalAlpha *= Math.min(1, grow);
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-6, -1);
  ctx.quadraticCurveTo(-26, -14, -40, -6);
  ctx.moveTo(-6, 1);
  ctx.quadraticCurveTo(-28, 4, -42, 10);
  ctx.moveTo(-4, -3);
  ctx.quadraticCurveTo(-22, -18, -34, -16);
  ctx.stroke();
  const seed = Math.round(Math.abs(x) + Math.abs(y) * 0.3);
  const bodyRx = 14 + hash2(seed, 1) * 5;
  const bodyRy = 6 + hash2(seed, 2) * 2.4;
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyRx, bodyRy, -0.15 - hash2(seed, 3) * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-1, -2);
  ctx.quadraticCurveTo(-10, -18, 8, -7);
  ctx.quadraticCurveTo(2, -5, -1, -2);
  ctx.fill();
  ctx.lineWidth = 3.1;
  ctx.beginPath();
  ctx.moveTo(9, -2);
  ctx.quadraticCurveTo(18, -8, 26, -18);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(29, -20, 4.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(32, -20);
  ctx.lineTo(44, -17.6);
  ctx.lineTo(32, -16.6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = bright.amber;
  ctx.beginPath();
  ctx.arc(30.2, -21.1, 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(30.5, -21.1, 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.moveTo(3, 6);
  ctx.lineTo(5, 16);
  ctx.moveTo(5, 16);
  ctx.lineTo(1, 19);
  ctx.moveTo(5, 16);
  ctx.lineTo(9, 18);
  ctx.moveTo(-3, 5);
  ctx.lineTo(-5, 15);
  ctx.lineTo(-9, 17);
  ctx.stroke();
  ctx.restore();
}

function arcStroke(ctx, cx, cy, r, grow, color, width) {
  if (grow <= 0.02) return;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, grow));
  ctx.stroke();
}

function polyStroke(ctx, cx, cy, r, n, rot, grow, color, width) {
  if (grow <= 0.02) return;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  const steps = Math.max(1, Math.ceil(n * Math.min(1, grow)));
  for (let i = 0; i <= steps; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

/** Euclid: three concentric circles and one octagon. No vesica, no star. */
function construction(ctx, cx, cy, r, grow) {
  const g1 = smoothstep(0, 0.32, grow);
  const g2 = smoothstep(0.18, 0.5, grow);
  const g3 = smoothstep(0.34, 0.68, grow);
  const g4 = smoothstep(0.48, 0.9, grow);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  arcStroke(ctx, cx, cy, r, g1, INK, 1.45);
  arcStroke(ctx, cx, cy, r * 0.68, g2, INK, 1.1);
  arcStroke(ctx, cx, cy, r * 0.36, g3, INK, 0.9);
  polyStroke(ctx, cx, cy, r * 0.84, 8, Math.PI / 8, g4, INK, 1.15);
  ctx.restore();
}

function woodcutLetter(ctx, ch, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
  ctx.strokeStyle = RUBRIC;
  const stroke = (w, pts) => {
    ctx.beginPath();
    ctx.lineWidth = s * w;
    ctx.moveTo(pts[0][0] * s, pts[0][1] * s);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] * s, pts[i][1] * s);
    ctx.stroke();
  };
  const L = (ch || "I").toUpperCase();
  if (L === "I") {
    stroke(0.11, [[0.16, 0.06], [0.84, 0.06]]);
    stroke(0.2, [[0.5, 0.06], [0.5, 0.94]]);
    stroke(0.11, [[0.16, 0.94], [0.84, 0.94]]);
  } else if (L === "F") {
    stroke(0.18, [[0.26, 0.06], [0.26, 0.94]]);
    stroke(0.14, [[0.26, 0.1], [0.86, 0.1]]);
    stroke(0.14, [[0.26, 0.46], [0.74, 0.46]]);
  } else if (L === "T") {
    stroke(0.15, [[0.08, 0.1], [0.92, 0.1]]);
    stroke(0.18, [[0.5, 0.1], [0.5, 0.94]]);
  } else if (L === "A") {
    stroke(0.16, [[0.5, 0.06], [0.14, 0.94]]);
    stroke(0.16, [[0.5, 0.06], [0.86, 0.94]]);
    stroke(0.13, [[0.28, 0.58], [0.72, 0.58]]);
  } else if (L === "Y") {
    stroke(0.16, [[0.14, 0.06], [0.5, 0.46]]);
    stroke(0.16, [[0.86, 0.06], [0.5, 0.46]]);
    stroke(0.18, [[0.5, 0.46], [0.5, 0.94]]);
  } else {
    ctx.fillStyle = RUBRIC;
    ctx.font = bodyFont(Math.round(s * 0.9), 800);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(L, s * 0.5, s * 0.52);
  }
  ctx.restore();
}

function woodcutInitial(ctx, x, y, size, ch, grow, inkAlpha) {
  const g = Math.min(1, Math.max(0, grow));
  ctx.save();
  ctx.fillStyle = withAlpha(LETTER, 0.1);
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = LETTER;
  ctx.lineWidth = 2.6;
  ctx.strokeRect(x, y, size, size);
  ctx.strokeStyle = bright.amber;
  ctx.lineWidth = 1.15;
  ctx.strokeRect(x + 7, y + 7, size - 14, size - 14);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 12, y + 12, size - 24, size - 24);
  ctx.clip();
  ctx.strokeStyle = withAlpha(INK, 0.16);
  ctx.lineWidth = 0.7;
  const step = 14;
  for (let i = -size; i < size * 2; i += step) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + size, y + size);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = LETTER;
  const b = 8;
  const pad = 16;
  for (const [cx, cy] of [
    [x + pad, y + pad],
    [x + size - pad - b, y + pad],
    [x + pad, y + size - pad - b],
    [x + size - pad - b, y + size - pad - b]
  ]) ctx.fillRect(cx, cy, b, b);

  if (g > 0.4) {
    leaf(ctx, x + 22, y + size - 22, -0.8, 16 * g, dark.emerald, 0.8);
    leaf(ctx, x + size - 22, y + 22, 2.2, 16 * g, dark.emerald, 0.8);
  }

  if (inkAlpha > 0.02) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 18, y + 18, size - 36, size - 36);
    ctx.clip();
    ctx.globalAlpha *= inkAlpha;
    woodcutLetter(ctx, ch, x + size * 0.16, y + size * 0.14, size * 0.68);
    ctx.restore();
  }
  ctx.restore();
}

function ruledBorder(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.strokeRect(16, 14, w - 32, h - 28);
  ctx.lineWidth = 0.7;
  ctx.strokeRect(23, 21, w - 46, h - 42);
  ctx.fillStyle = LETTER;
  const corners = [[16, 14], [w - 26, 14], [16, h - 24], [w - 26, h - 24]];
  for (const [x, y] of corners) ctx.fillRect(x, y, 10, 10);
  ctx.restore();
}

function headpiece(ctx, w, grow) {
  const y = 46;
  const left = 48;
  const right = w - 48;
  const mid = w / 2;
  const band = 70;
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(right, y);
  ctx.moveTo(left, y + band);
  ctx.lineTo(right, y + band);
  ctx.stroke();

  const vineG = smoothstep(0.12, 0.7, grow);
  const amp = 10;
  const cy = y + band / 2;
  penRibbon(ctx, waveSegs(left + 70, mid - 78, cy, amp, 7), vineG, INK, 0.9, 0.72);
  penRibbon(ctx, waveSegs(mid + 78, right - 70, cy, amp, 7), vineG, INK, 0.9, 0.72);

  if (vineG > 0.35) {
    const spanL = (mid - 78 - (left + 70)) / 7;
    for (let i = 0; i < 7; i += 2) {
      const x = left + 70 + (i + 0.5) * spanL;
      leaf(ctx, x, cy - amp, -Math.PI / 2, 16, dark.emerald, vineG);
      const xr = mid + 78 + (i + 0.5) * spanL;
      leaf(ctx, xr, cy + amp, Math.PI / 2, 16, dark.emerald, vineG);
    }
  }

  construction(ctx, mid, cy, 30, smoothstep(0, 0.55, grow));
  drawBird(ctx, left + 36, cy + 6, 0.72, 1, LETTER, smoothstep(0.4, 0.85, grow));
  drawBird(ctx, right - 36, cy + 6, 0.72, -1, LETTER, smoothstep(0.45, 0.9, grow));
  ctx.restore();
}

function inkBlot(ctx, x, y, seed, scale, alpha) {
  const s = scale || 1;
  const a = alpha == null ? 0.88 : alpha;
  const lobes = 6 + Math.floor(hash2(seed, 1) * 5);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(hash2(seed, 2) * Math.PI * 2);
  ctx.beginPath();
  for (let i = 0; i <= lobes; i++) {
    const ang = (i / lobes) * Math.PI * 2;
    const rad = (0.42 + hash2(seed, 10 + i) * 0.85) * 9 * s;
    const px = Math.cos(ang) * rad;
    const py = Math.sin(ang) * rad * (0.62 + hash2(seed, 3) * 0.55);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = withAlpha(INK, a);
  ctx.fill();
  const drops = Math.floor(hash2(seed, 4) * 4);
  for (let i = 0; i < drops; i++) {
    const ang = hash2(seed, 20 + i) * Math.PI * 2;
    const dist = (9 + hash2(seed, 30 + i) * 11) * s;
    const r = (0.7 + hash2(seed, 40 + i) * 2.2) * s;
    ctx.beginPath();
    ctx.ellipse(
      Math.cos(ang) * dist,
      Math.sin(ang) * dist,
      r,
      r * (0.55 + hash2(seed, 50 + i) * 0.7),
      ang,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.restore();
}

function marginSwash(ctx, x, y, dir, grow, scale) {
  const sc = scale || 1;
  const seed = Math.round(Math.abs(x) * 0.13 + y * 0.07) + (dir < 0 ? 17 : 3);
  const len = (250 + hash2(seed, 4) * 90) * sc;
  const lean = (hash2(seed, 5) - 0.5) * 16 * dir * sc;
  const bow = (hash2(seed, 6) - 0.5) * 10 * sc;
  const y1 = y + len;
  penRibbon(
    ctx,
    [cubic(
      pt(x, y),
      pt(x + bow, y + len * 0.34),
      pt(x + lean * 0.45, y + len * 0.68),
      pt(x + lean, y1)
    )],
    grow,
    INK,
    0.96,
    (0.62 + hash2(seed, 7) * 0.35) * sc
  );
  if (grow > 0.66) inkBlot(ctx, x + lean, y1, seed + 9, (0.55 + hash2(seed, 8) * 0.65) * sc, 0.9);
}

function gutterRule(ctx, x, y0, y1, grow) {
  const y = y0 + (y1 - y0) * Math.min(1, Math.max(0, grow));
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(x, y0);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.restore();
}

function pageTurn(ctx, w, h, turn) {
  if (turn <= 0.004) return;
  const edge = w - 22 - turn * w * 0.9;
  const bow = 36 + turn * 24;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(edge, 18);
  ctx.bezierCurveTo(edge + bow, h * 0.26, edge + bow * 0.45, h * 0.74, edge + 4, h - 18);
  ctx.lineTo(w - 12, h - 18);
  ctx.lineTo(w - 12, 18);
  ctx.closePath();
  ctx.fillStyle = parchment;
  ctx.fill();
  ctx.save();
  ctx.clip();
  const shade = ctx.createLinearGradient(edge, 0, edge + 110, 0);
  shade.addColorStop(0, dark.amber);
  shade.addColorStop(0.07, dark.topaz);
  shade.addColorStop(0.2, parchment);
  shade.addColorStop(1, parchment);
  ctx.fillStyle = shade;
  ctx.fillRect(edge - 8, 0, w, h);
  for (let i = 0; i < 70; i++) {
    const fx = edge + 12 + hash2(i, 11) * Math.max(8, w - edge - 24);
    const fy = 28 + hash2(i, 12) * (h - 56);
    ctx.strokeStyle = withAlpha(INK, 0.045 + hash2(i, 13) * 0.07);
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + (hash2(i, 14) - 0.5) * 22, fy + 3 + hash2(i, 15) * 12);
    ctx.stroke();
  }
  for (let i = 0; i < 9; i++) {
    inkBlot(
      ctx,
      edge + 24 + hash2(i, 21) * Math.max(8, w - edge - 48),
      40 + hash2(i, 22) * (h - 80),
      80 + i,
      0.22 + hash2(i, 23) * 0.38,
      0.1 + hash2(i, 24) * 0.1
    );
  }
  ctx.restore();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.moveTo(edge, 18);
  ctx.bezierCurveTo(edge + bow, h * 0.26, edge + bow * 0.45, h * 0.74, edge + 4, h - 18);
  ctx.stroke();
  ctx.restore();
}

function signatureOf(i) {
  const letter = String.fromCharCode(65 + (Math.floor(i / 3) % 8));
  const n = (i % 3) + 1;
  return n === 1 ? letter : `${letter}${n}`;
}

function measureWrap(ctx, words, maxW, font) {
  ctx.font = font;
  const space = ctx.measureText(" ").width;
  const lines = [];
  let cur = [];
  let width = 0;
  for (const word of words) {
    const ww = ctx.measureText(word).width;
    const add = cur.length ? space + ww : ww;
    if (cur.length && width + add > maxW) {
      lines.push({ words: cur, width });
      cur = [word];
      width = ww;
    } else {
      cur.push(word);
      width += add;
    }
  }
  if (cur.length) lines.push({ words: cur, width });
  return { lines, space };
}

function lineModel(ctx, words, font, maxW, justify) {
  ctx.font = font;
  const space = ctx.measureText(" ").width;
  const pieces = words.map((text) => ({ text, width: ctx.measureText(text).width }));
  const textW = pieces.reduce((a, p) => a + p.width, 0);
  const gaps = Math.max(0, pieces.length - 1);
  const natural = textW + space * gaps;
  const extra = maxW - natural;
  const canJustify = justify && gaps > 0 && extra > 0 && extra < space * gaps * 2.4;
  const gap = canJustify ? space + extra / gaps : space;
  return { pieces, gap, width: canJustify ? maxW : natural };
}

function inkOfLine(i, n, settle) {
  const start = (i / Math.max(1, n)) * 0.72;
  return smoothstep(start, Math.min(1, start + 0.3), settle);
}

export class Scene4 {
  constructor(ctx) {
    this.ctx = ctx;
    this.t = 0;
    this.last = 0;
    this.data = null;
    this.fontEpoch = 0;
    this.cache = null;
    this.cacheKey = "";
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.addEventListener("loadingdone", () => {
        this.fontEpoch++;
        this.cache = null;
      });
    }
    this.load();
  }

  async load() {
    try {
      if (typeof document !== "undefined" && document.fonts) await document.fonts.ready;
      const r = await fetch("/kjv1611.json");
      this.data = await r.json();
    } catch {
      this.data = { passages: [] };
    }
    this.fontEpoch++;
    this.cache = null;
  }

  render(params, w, h) {
    const now = performance.now();
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0.016;
    this.last = now;
    this.t += dt * (0.42 + (params.motion ?? 0.32) * 1.2);

    const ctx = this.ctx;
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.textBaseline = "alphabetic";

    this.ground(ctx, w, h, params.microtexture ?? 0.55);
    ruledBorder(ctx, w, h);

    const passages = this.data?.passages || [];
    if (!passages.length) {
      ctx.fillStyle = INK;
      ctx.font = bodyFont(22);
      ctx.textAlign = "left";
      ctx.fillText("Loading the 1611 text…", 80, h * 0.5);
      ctx.restore();
      return;
    }

    const idx = Math.floor(this.t / PAGE) % passages.length;
    const local = (this.t / PAGE) - Math.floor(this.t / PAGE);
    const grow = smoothstep(0, 0.4, local);
    const settle = smoothstep(0.06, 0.48, local);
    const turn = smoothstep(0.9, 1, local);
    const passage = passages[idx];
    const next = passages[(idx + 1) % passages.length];

    headpiece(ctx, w, grow);
    const layout = this.layoutFor(passage, w, h);
    this.drawFurniture(ctx, layout, w, settle, idx);
    this.drawBody(ctx, layout, settle);
    this.drawMargins(ctx, layout, grow, w, h);
    this.drawFooter(ctx, layout, next, idx, w, h, settle, grow);
    pageTurn(ctx, w, h, turn);
    ctx.restore();
  }

  ground(ctx, w, h, micro) {
    ctx.fillStyle = parchment;
    ctx.fillRect(0, 0, w, h);
    const fibers = 110;
    for (let i = 0; i < fibers; i++) {
      const x = hash2(i, 2) * w;
      const y = hash2(i, 6) * h;
      const len = 6 + hash2(i, 8) * 18;
      const ang = (hash2(i, 9) - 0.5) * 0.8;
      ctx.strokeStyle = withAlpha(INK, (0.035 + hash2(i, 4) * 0.06) * (0.45 + micro));
      ctx.lineWidth = 0.35 + hash2(i, 5) * 0.45;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }
    for (let i = 0; i < 16; i++) {
      inkBlot(
        ctx,
        hash2(i, 31) * w,
        hash2(i, 32) * h,
        200 + i * 13,
        0.18 + hash2(i, 33) * 0.45,
        (0.06 + hash2(i, 34) * 0.08) * (0.5 + micro)
      );
    }
  }

  placeNotes(ctx, verses, w, textTop, textBot) {
    const font = handFont(22);
    const notes = [];
    let leftY = textTop;
    let rightY = textTop;
    for (const v of verses) {
      if (!v.note) continue;
      const right = v.col === 1;
      const x = right ? w - 206 : 30;
      const wrap = right ? 168 : 186;
      const lines = measureWrap(ctx, wordsOf(v.note), wrap, font).lines.map((l) => l.words.join(" "));
      if (!lines.length) continue;
      const y = Math.max(v.y || textTop, right ? rightY : leftY);
      if (y > textBot - 40) continue;
      notes.push({
        x,
        y,
        marker: String(v.n),
        lines
      });
      const next = y + 26 + lines.length * 26 + 14;
      if (right) rightY = next;
      else leftY = next;
    }
    return notes;
  }

  layoutFor(passage, w, h) {
    const key = `${passage.id}|${w}|${h}|${this.fontEpoch}`;
    if (this.cache && this.cacheKey === key) return this.cache;
    const chars = (passage.verses || []).reduce((n, v) => n + v.text.length, 0);
    const layout = chars < 280 ? this.layoutPlate(passage, w, h) : this.layoutPage(passage, w, h);
    this.cache = layout;
    this.cacheKey = key;
    return layout;
  }

  layoutPage(passage, w, h) {
    const ctx = this.ctx;
    const title = passage.running || passage.book;
    let bookPx = 42;
    let bookFont = headingFont(bookPx);
    ctx.font = bookFont;
    while (bookPx > 28 && ctx.measureText(passage.book).width > w - 180) {
      bookPx -= 2;
      bookFont = headingFont(bookPx);
      ctx.font = bookFont;
    }
    const book = passage.book;
    const argFont = bodyFont(24, 400);
    const argLineH = 32;
    const argLines = measureWrap(ctx, wordsOf(passage.head || ""), 1080, argFont).lines;
    const titleY = 198;
    const bookY = 286;
    const chapterY = 360;
    const argY = chapterY + 48;
    const textTop = argY + argLines.length * argLineH + 24;
    const textBot = h - 78;
    const colW = 690;
    const cols = [
      { x: 240, w: colW },
      { x: 980, w: colW }
    ];
    const initial = {
      x: cols[0].x,
      y: textTop,
      size: 148,
      ch: ((passage.verses[0]?.text || "I")[0] || "I").toUpperCase()
    };

    const tryFonts = [30, 28, 26, 24, 22];
    let chosen = null;
    let px = 22;
    const availH = textBot - textTop;
    for (const size of tryFonts) {
      const laid = this.flowColumns(passage, cols, textTop, textBot, size, initial, 0, 1);
      chosen = laid;
      px = size;
      if (!laid.overflow) break;
    }
    if (chosen && !chosen.overflow) {
      let splitAfter = 0;
      const c2 = chosen.lines.filter((l) => l.x >= cols[1].x);
      const d2 = c2.length ? c2[c2.length - 1].y - textTop : availH;
      if (c2.length && d2 < availH * 0.72) {
        splitAfter = Math.max(4, Math.ceil(chosen.lines.length / 2));
        const bal = this.flowColumns(passage, cols, textTop, textBot, px, initial, splitAfter, 1);
        if (!bal.overflow) chosen = bal;
      }
      const depth = chosen.lines.reduce((m, l) => Math.max(m, l.y), textTop) - textTop;
      if (depth > 40 && depth < availH * 0.78) {
        const lead = Math.min(1.7, (availH * 0.92) / depth);
        const opened = this.flowColumns(passage, cols, textTop, textBot, px, initial, splitAfter, lead);
        if (!opened.overflow) chosen = opened;
      }
    }

    const leftLemmas = this.placeNotes(ctx, chosen.verseStarts.map((v) => ({
      n: v.n,
      note: passage.verses[v.vi]?.note || "",
      y: v.y,
      col: v.col
    })), w, textTop, textBot);

    return {
      mode: "page",
      title,
      book,
      bookFont,
      chapter: `CHAP. ${roman(passage.chapter)}.`,
      argFont,
      argLineH,
      argLines,
      textTop,
      textBot,
      cols,
      initial,
      lines: chosen.lines,
      verseStarts: chosen.verseStarts,
      lemmas: leftLemmas,
      guides: [],
      panel: null,
      titleY,
      bookY,
      chapterY,
      argY
    };
  }

  flowColumns(passage, cols, textTop, textBot, px, initial, splitAfter = 0, lead = 1) {
    const ctx = this.ctx;
    const lineH = Math.round(px * 1.38 * lead);
    const lines = [];
    const verseStarts = [];
    let ci = 0;
    let y = textTop;
    let overflow = false;
    let placed = 0;
    const verses = passage.verses || [];
    const font = bodyFont(px, 700);

    const edges = (yy, col) => {
      let left = cols[col].x;
      const right = cols[col].x + cols[col].w;
      if (col === 0 && yy < initial.y + initial.size - 2) {
        left = initial.x + initial.size + 18;
      }
      return { left, right, maxW: Math.max(48, right - left) };
    };

    const advance = () => {
      if (ci === 0 && splitAfter && placed >= splitAfter) {
        ci = 1;
        y = textTop;
        return;
      }
      if (y + lineH > textBot) {
        ci += 1;
        y = textTop;
      }
    };

    for (let vi = 0; vi < verses.length; vi++) {
      const v = verses[vi];
      let text = v.text;
      if (vi === 0) text = text.slice(1).replace(/^\s+/, "");
      const words = wordsOf(text);
      let wi = 0;
      let first = true;
      advance();
      if (ci > 1) { overflow = true; break; }
      verseStarts.push({ col: ci, y, n: v.n, text: v.text, vi });
      while (wi < words.length) {
        advance();
        if (ci > 1) { overflow = true; break; }
        const { left, maxW } = edges(y, ci);
        const numW = first && vi !== 0 ? 32 : 0;
        const avail = Math.max(40, maxW - numW);
        const take = [];
        let width = 0;
        ctx.font = font;
        const space = ctx.measureText(" ").width;
        while (wi < words.length) {
          const ww = ctx.measureText(words[wi]).width;
          const add = take.length ? space + ww : ww;
          if (take.length && width + add > avail) break;
          take.push(words[wi]);
          width += add;
          wi += 1;
        }
        if (!take.length && wi < words.length) {
          take.push(words[wi]);
          wi += 1;
        }
        const last = wi >= words.length;
        const model = lineModel(ctx, take, font, avail, !last);
        lines.push({
          x: left + numW,
          y: y + px,
          font,
          color: INK,
          pieces: model.pieces,
          gap: model.gap,
          verseN: first ? v.n : 0,
          numX: left
        });
        first = false;
        placed += 1;
        y += lineH;
      }
      y += Math.round(lineH * 0.22);
      if (overflow) break;
    }
    return { lines, verseStarts, overflow, endCol: ci, endY: y };
  }

  layoutPlate(passage, w, h) {
    const ctx = this.ctx;
    const v = passage.verses[0];
    const ch = (v.text[0] || "I").toUpperCase();
    const restWords = wordsOf(v.text.slice(1));
    const extra = (passage.verses || []).slice(1);
    let bookPx = 40;
    let bookFont = headingFont(bookPx);
    ctx.font = bookFont;
    while (bookPx > 28 && ctx.measureText(passage.book).width > w - 180) {
      bookPx -= 2;
      bookFont = headingFont(bookPx);
      ctx.font = bookFont;
    }
    const argFont = bodyFont(24, 400);
    const argLineH = 32;
    const argLines = measureWrap(ctx, wordsOf(passage.head || ""), 1100, argFont).lines;
    const titleY = 196;
    const bookY = 278;
    const chapterY = 352;
    const argY = 404;
    const contentTop = argY + argLines.length * argLineH + 22;
    const panel = { x: 430, y: contentTop, w: 1060, h: 520 };
    const size = 168;
    const initial = { x: panel.x + 28, y: panel.y + 36, size, ch };
    const fonts = [30, 26, 23];
    let lines = [];
    let px = 26;
    const textLeft0 = initial.x + size + 18;
    const textRight = panel.x + panel.w - 32;
    const textBot = panel.y + panel.h - 28;
    for (const tryPx of fonts) {
      px = tryPx;
      const lh = Math.round(tryPx * 1.36);
      lines = [];
      let y = panel.y + 40;
      const blocks = [{ words: restWords, n: v.n, drop: true }];
      for (const ev of extra) blocks.push({ words: wordsOf(ev.text), n: ev.n, drop: false });
      let ok = true;
      for (const block of blocks) {
        let wi = 0;
        let first = true;
        const font = bodyFont(tryPx, 700);
        while (wi < block.words.length) {
          if (y + lh > textBot) { ok = false; break; }
          const beside = block.drop && y < initial.y + size - 2;
          const left = beside ? textLeft0 : panel.x + 36;
          const numW = first && !block.drop ? 36 : 0;
          const avail = Math.max(48, textRight - left - numW);
          ctx.font = font;
          const space = ctx.measureText(" ").width;
          const take = [];
          let width = 0;
          while (wi < block.words.length) {
            const ww = ctx.measureText(block.words[wi]).width;
            const add = take.length ? space + ww : ww;
            if (take.length && width + add > avail) break;
            take.push(block.words[wi]);
            width += add;
            wi += 1;
          }
          if (!take.length && wi < block.words.length) {
            take.push(block.words[wi]);
            wi += 1;
          }
          const last = wi >= block.words.length;
          const model = lineModel(ctx, take, font, avail, !last);
          const baseline = y + tryPx;
          lines.push({
            x: left + numW,
            y: baseline,
            font,
            color: INK,
            pieces: model.pieces,
            gap: model.gap,
            verseN: first ? block.n : 0,
            numX: left,
            hand: false,
            guideX: left,
            guideW: avail
          });
          first = false;
          y += lh;
        }
        y += 8;
        if (!ok) break;
      }
      if (ok) break;
    }
    const lastLine = lines.length ? lines[lines.length - 1].y : panel.y + size;
    panel.h = Math.max(size + 80, lastLine - panel.y + 40);
    const guides = lines
      .filter((l) => l.guideW)
      .map((l) => ({ x: l.guideX, y: l.y + 8, w: l.guideW }));

    return {
      mode: "plate",
      title: passage.running || passage.book,
      book: passage.book,
      bookFont,
      chapter: `CHAP. ${roman(passage.chapter)}.`,
      titleY,
      bookY,
      chapterY,
      argY,
      argFont,
      argLineH,
      argLines,
      textTop: panel.y,
      textBot: panel.y + panel.h,
      cols: [],
      initial,
      lines,
      verseStarts: [],
      lemmas: this.placeNotes(ctx, (passage.verses || []).map((v) => ({
        n: v.n,
        note: v.note || "",
        y: panel.y + 36,
        col: 0
      })), w, panel.y, h - 90),
      guides,
      panel
    };
  }

  drawFurniture(ctx, layout, w, settle, idx) {
    const a = smoothstep(0, 0.35, settle);
    if (a <= 0.02) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.textAlign = "center";
    ctx.fillStyle = INK;
    ctx.font = headingFont(54);
    const tw = ctx.measureText(layout.title).width;
    const titleY = layout.titleY || 198;
    ctx.fillText(layout.title, w / 2, titleY);
    ctx.strokeStyle = withAlpha(INK, 0.7);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(70, titleY - 10);
    ctx.lineTo(w / 2 - tw / 2 - 22, titleY - 10);
    ctx.moveTo(w / 2 + tw / 2 + 22, titleY - 10);
    ctx.lineTo(w - 70, titleY - 10);
    ctx.stroke();

    if (layout.book) {
      ctx.font = layout.bookFont;
      ctx.fillStyle = INK;
      ctx.fillText(layout.book, w / 2, layout.bookY || (layout.chapterY || 360) - 70);
    }
    const y = layout.chapterY || 360;
    ctx.font = headingFont(38);
    ctx.fillStyle = RUBRIC;
    ctx.fillText(layout.chapter, w / 2, y);
    let ay = layout.argY || y + 48;
    ctx.fillStyle = INK;
    ctx.font = layout.argFont;
    const step = layout.argLineH || 32;
    for (const line of layout.argLines) {
      ctx.fillText(line.words.join(" "), w / 2, ay);
      ay += step;
    }

    ctx.font = headingFont(22);
    ctx.fillStyle = INK;
    ctx.textAlign = "right";
    ctx.fillText(String(idx + 1), w - 56, 168);
    ctx.restore();
  }

  drawBody(ctx, layout, settle) {
    const n = layout.lines.length || 1;
    if (layout.initial) {
      const a0 = inkOfLine(0, n, settle);
      woodcutInitial(ctx, layout.initial.x, layout.initial.y, layout.initial.size, layout.initial.ch, smoothstep(0.05, 0.7, settle + 0.15), a0);
    }
    if (layout.mode === "plate" && layout.panel) {
      const p = layout.panel;
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(p.x, p.y, p.w, p.h);
      ctx.lineWidth = 0.6;
      ctx.strokeRect(p.x + 7, p.y + 7, p.w - 14, p.h - 14);
      ctx.strokeStyle = withAlpha(INK, 0.28);
      ctx.lineWidth = 1;
      for (const g of layout.guides) {
        ctx.beginPath();
        ctx.moveTo(g.x, g.y);
        ctx.lineTo(g.x + g.w, g.y);
        ctx.stroke();
      }
      ctx.restore();
    }
    layout.lines.forEach((line, i) => {
      const a = inkOfLine(i, n, settle);
      if (a <= 0.02) return;
      ctx.save();
      ctx.globalAlpha *= a;
      const dy = (1 - a) * 5;
      if (line.verseN) {
        ctx.font = bodyFont(13, 700);
        ctx.fillStyle = RUBRIC;
        ctx.textAlign = "left";
        ctx.fillText(String(line.verseN), line.numX, line.y + dy - 6);
      }
      ctx.font = line.font;
      ctx.fillStyle = INK;
      ctx.textAlign = "left";
      let x = line.x;
      for (const piece of line.pieces) {
        ctx.fillText(piece.text, x, line.y + dy);
        x += piece.width + line.gap;
      }
      ctx.restore();
    });

    for (const lemma of layout.lemmas) {
      const a = smoothstep(0.25, 0.7, settle);
      if (a <= 0.02) continue;
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.textAlign = "left";
      ctx.font = bodyFont(16, 700);
      ctx.fillStyle = RUBRIC;
      ctx.fillText(lemma.marker, lemma.x, lemma.y);
      ctx.font = handFont(22);
      ctx.fillStyle = HAND;
      lemma.lines.forEach((text, i) => {
        ctx.fillText(text, lemma.x, lemma.y + 26 + i * 26);
      });
      ctx.restore();
    }
  }

  ornamentColumn(ctx, x, y, bw, bh, grow) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(x, y, bw, bh);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = withAlpha(bright.amber, 0.9);
    ctx.strokeRect(x + 8, y + 8, bw - 16, bh - 16);
    const cx = x + bw / 2;
    const cy = y + Math.min(bh * 0.4, 250);
    construction(ctx, cx, cy, Math.min(150, bw * 0.28), grow);
    drawBird(ctx, x + 58, y + 46, 0.68, 1, LETTER, smoothstep(0.35, 0.8, grow));
    drawBird(ctx, x + bw - 58, y + 46, 0.68, -1, LETTER, smoothstep(0.45, 0.9, grow));
    penRibbon(
      ctx,
      waveSegs(x + 40, x + bw - 40, y + bh - 78, 14, 5),
      smoothstep(0.15, 0.75, grow),
      INK,
      0.9,
      0.75
    );
    leaf(ctx, x + 36, y + bh - 40, -0.5, 30, dark.emerald, 0.9 * grow);
    leaf(ctx, x + bw - 36, y + bh - 40, Math.PI + 0.5, 30, dark.emerald, 0.9 * grow);
    ctx.restore();
  }

  drawMargins(ctx, layout, grow, w, h) {
    if (layout.mode === "plate") {
      const p = layout.panel;
      marginSwash(ctx, p.x - 150, p.y - 10, 1, grow, 1);
      marginSwash(ctx, p.x + p.w + 150, p.y - 10, -1, grow, 1);
      construction(ctx, 118, h - 196, 42, smoothstep(0.25, 0.85, grow));
      construction(ctx, w - 118, h - 196, 42, smoothstep(0.3, 0.9, grow));
      const baseY = p.y + p.h + 34;
      penRibbon(
        ctx,
        waveSegs(p.x, p.x + p.w, baseY, 11, 7),
        smoothstep(0.2, 0.75, grow),
        INK,
        0.9,
        0.85
      );
      drawBird(ctx, p.x + p.w + 8, baseY + 6, 0.72, -1, LETTER, smoothstep(0.55, 1, grow));
      drawBird(ctx, p.x - 8, baseY + 6, 0.72, 1, LETTER, smoothstep(0.6, 1, grow));
      penRibbon(
        ctx,
        waveSegs(220, w - 220, h - 118, 14, 5),
        smoothstep(0.25, 0.8, grow),
        LETTER,
        0.75,
        0.9
      );
      return;
    }
    const col2Used = layout.lines.some((l) => l.x > 900);
    if (!col2Used && layout.cols[1]) {
      const c = layout.cols[1];
      const x = c.x;
      const y = layout.textTop;
      const bw = c.w;
      const bh = layout.textBot - layout.textTop;
      this.ornamentColumn(ctx, x, y, bw, bh, grow);
    } else {
      gutterRule(ctx, 954, layout.textTop, layout.textBot, smoothstep(0.15, 0.8, grow));
    }
    if (!layout.lemmas.some((l) => l.x > w * 0.5)) {
      marginSwash(ctx, w - 108, Math.min(layout.textTop + 80, 520), -1, grow, 0.72);
    }
    leaf(ctx, 70, h - 118, -0.7, 34 * Math.max(grow, 0.2), dark.emerald, 0.9);
    leaf(ctx, 102, h - 104, 0.35, 26 * Math.max(grow, 0.2), dark.chrysoprasus, 0.85);
  }

  drawFooter(ctx, layout, next, idx, w, h, settle, grow) {
    const a = smoothstep(0.4, 0.75, settle);
    ctx.save();
    ctx.globalAlpha *= Math.max(0.15, a);
    ctx.textAlign = "center";
    ctx.fillStyle = INK;
    ctx.font = headingFont(18);
    ctx.fillText(signatureOf(idx), w / 2, h - 40);
    const catchword = wordsOf(next?.verses?.[0]?.text || "")[0] || "";
    if (catchword) {
      ctx.textAlign = "right";
      ctx.font = handFont(16);
      ctx.fillStyle = RUBRIC;
      ctx.fillText(catchword, w - 56, h - 40);
    }
    ctx.restore();
    penRibbon(
      ctx,
      waveSegs(w / 2 - 180, w / 2 + 180, h - 58, 7, 4),
      smoothstep(0.15, 0.6, grow),
      INK,
      0.75,
      0.55
    );
  }
}
