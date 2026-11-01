// @ts-nocheck
/**
 * Ornamental vocabulary — Jacobean / herbarium forms.
 * Colour comes only from gemstone skins passed in.
 */
import { withAlpha, makeSkin, bright, dark } from "../palette.js";
import { hash2 } from "../rng.js";

export function gene(id, salt = 0) {
  return hash2(id * 12.9898 + salt, id * 78.233 + salt * 3.1);
}

export const skinInk = makeSkin({
  stemDeep: dark.chrysolyte, stem: dark.emerald, stemFine: dark.chrysoprasus,
  leaf: bright.emerald, leaf2: bright.chrysoprasus,
  berry: dark.sardius, flower: bright.pearl, rim: bright.amber, hip: dark.crimson
});

export const skinGold = makeSkin({
  stemDeep: dark.vermilion, stem: dark.amber, stemFine: dark.topaz,
  leaf: bright.amber, leaf2: bright.ligure,
  berry: dark.sardius, flower: bright.pearl, rim: bright.topaz, hip: dark.vermilion
});

export function tube(ctx, x0, y0, x1, y1, r, depth, skin) {
  const dx = x1 - x0, dy = y1 - y0;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const body = depth > 5 ? skin.stemDeep : depth > 3 ? skin.stem : skin.stemFine;
  ctx.lineCap = "round";
  ctx.strokeStyle = withAlpha(skin.stemDeep, 0.28);
  ctx.lineWidth = r * 2.05;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = body;
  ctx.lineWidth = r * 1.3;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = skin.stemHi;
  ctx.lineWidth = Math.max(0.45, r * 0.32);
  ctx.beginPath();
  ctx.moveTo(x0 + nx * r * 0.28, y0 + ny * r * 0.28);
  ctx.lineTo(x1 + nx * r * 0.28, y1 + ny * r * 0.28);
  ctx.stroke();
}

function beginLeaf(ctx, x, y, angle, side) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(side, 1);
}

function veins(ctx, s, skin, n, spread) {
  ctx.strokeStyle = skin.vein;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(s * 0.9, 0);
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    const px = s * t * 0.85;
    ctx.moveTo(px, 0);
    ctx.quadraticCurveTo(px + s * 0.08, -s * spread * (1.1 - t), px + s * 0.16, -s * spread * 0.55);
    ctx.moveTo(px, 0);
    ctx.quadraticCurveTo(px + s * 0.08, s * spread * (1.1 - t), px + s * 0.16, s * spread * 0.55);
  }
  ctx.stroke();
}

/** Pointed willow / lance — the herbarium workhorse. */
export function lanceLeaf(ctx, x, y, angle, size, side, skin) {
  beginLeaf(ctx, x, y, angle, side);
  const s = size;
  ctx.fillStyle = skin.leafFill;
  ctx.strokeStyle = skin.leafStroke;
  ctx.lineWidth = 1.35;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.3, -s * 0.24, s, 0);
  ctx.quadraticCurveTo(s * 0.3, s * 0.2, 0, 0);
  ctx.fill(); ctx.stroke();
  veins(ctx, s, skin, 5, 0.2);
  ctx.restore();
}

/** Broader oval — a different mass from the lance. */
export function ovalLeaf(ctx, x, y, angle, size, side, skin) {
  beginLeaf(ctx, x, y, angle, side);
  const s = size;
  ctx.fillStyle = skin.leafFill2;
  ctx.strokeStyle = skin.leafStroke;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.4, -s * 0.4, s * 0.95, 0);
  ctx.quadraticCurveTo(s * 0.4, s * 0.38, 0, 0);
  ctx.fill(); ctx.stroke();
  veins(ctx, s, skin, 6, 0.32);
  ctx.restore();
}

/** Three-lobe ivy / oak — Jacobean, not a clone of the willow. */
export function lobedLeaf(ctx, x, y, angle, size, side, skin) {
  beginLeaf(ctx, x, y, angle, side);
  ctx.fillStyle = skin.leafFill;
  ctx.strokeStyle = skin.leafStroke;
  ctx.lineWidth = 1.35;
  const s = size;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.18, -s * 0.28, s * 0.38, -s * 0.22);
  ctx.quadraticCurveTo(s * 0.48, -s * 0.48, s * 0.62, -s * 0.18);
  ctx.quadraticCurveTo(s * 0.88, -s * 0.12, s, 0);
  ctx.quadraticCurveTo(s * 0.88, s * 0.12, s * 0.62, s * 0.18);
  ctx.quadraticCurveTo(s * 0.48, s * 0.42, s * 0.38, s * 0.2);
  ctx.quadraticCurveTo(s * 0.18, s * 0.26, 0, 0);
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle = skin.vein;
  ctx.lineWidth = 0.65;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(s * 0.85, 0);
  ctx.moveTo(s * 0.22, 0); ctx.lineTo(s * 0.5, -s * 0.32);
  ctx.moveTo(s * 0.22, 0); ctx.lineTo(s * 0.48, s * 0.28);
  ctx.stroke();
  ctx.restore();
}

/** Compound sprig: short stem + three small lances. */
export function sprig(ctx, x, y, angle, size, skin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = skin.stemFine;
  ctx.lineWidth = 0.9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.45, 0);
  ctx.stroke();
  ctx.restore();
  lanceLeaf(ctx, x + Math.cos(angle) * size * 0.45, y + Math.sin(angle) * size * 0.45, angle, size * 0.7, 1, skin);
  lanceLeaf(ctx, x + Math.cos(angle) * size * 0.28, y + Math.sin(angle) * size * 0.28, angle + 0.7, size * 0.5, 1, skin);
  lanceLeaf(ctx, x + Math.cos(angle) * size * 0.28, y + Math.sin(angle) * size * 0.28, angle - 0.7, size * 0.5, -1, skin);
}

/** Spiral tendril — manuscript curl, not a fractal. */
export function tendril(ctx, x, y, angle, size, skin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = skin.stemFine;
  ctx.lineWidth = 0.85;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  let px = 0, py = 0;
  for (let i = 1; i <= 14; i++) {
    const t = i / 14;
    const a = t * Math.PI * 2.4;
    const r = size * t * 0.55;
    const nx = Math.cos(a) * r + t * size * 0.35;
    const ny = Math.sin(a) * r;
    ctx.lineTo(nx, ny);
    px = nx; py = ny;
  }
  ctx.stroke();
  ctx.restore();
}

export function berries(ctx, x, y, n, r, skin) {
  for (let i = 0; i < n; i++) {
    const u = gene(Math.floor(x * 0.15) + i, i);
    const a = (i / n) * Math.PI * 2 + u * 0.7;
    const d = r * (0.35 + u * 1.2);
    const bx = x + Math.cos(a) * d;
    const by = y + Math.sin(a) * d * 0.82;
    const br = r * (0.62 + u * 0.5);
    ctx.fillStyle = skin.berry;
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = skin.berryHi;
    ctx.beginPath(); ctx.arc(bx - br * 0.28, by - br * 0.28, br * 0.26, 0, Math.PI * 2); ctx.fill();
  }
}

/** Rose-hip / pomegranate — larger fruit with a small calyx. */
export function hip(ctx, x, y, angle, r, skin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = skin.hip;
  ctx.beginPath(); ctx.ellipse(0, 0, r * 1.05, r * 0.9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = withAlpha(skin.berry, 0.55);
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.fillStyle = skin.berryHi;
  ctx.beginPath(); ctx.ellipse(-r * 0.25, -r * 0.25, r * 0.28, r * 0.2, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = skin.stemFine;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI * 0.5 + (i - 2) * 0.28;
    ctx.moveTo(0, -r * 0.7);
    ctx.lineTo(Math.cos(a) * r * 0.45, -r * 1.15 + Math.sin(a) * r * 0.15);
  }
  ctx.stroke();
  ctx.restore();
}

/** Modest five-petal. Jittered so it is a flower, not a mandala. */
export function flower5(ctx, x, y, angle, scale, skin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  for (let i = 0; i < 5; i++) {
    const j = (gene(Math.floor(x) + i, i) - 0.5) * 0.28;
    ctx.save();
    ctx.rotate((i / 5) * Math.PI * 2 + j);
    const len = scale * (0.85 + gene(i, 2) * 0.25);
    const w = len * 0.34;
    ctx.fillStyle = skin.flower;
    ctx.strokeStyle = skin.flowerRim;
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(w, -len * 0.2, 0, -len);
    ctx.quadraticCurveTo(-w, -len * 0.2, 0, 0);
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = skin.berry;
  ctx.beginPath(); ctx.arc(0, 0, scale * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** Ruffled Jacobean bloom — uneven petals, two rings. */
export function bloom(ctx, x, y, angle, scale, skin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const n = 7;
  for (let ring = 0; ring < 2; ring++) {
    const rs = ring === 0 ? 1 : 0.62;
    for (let i = 0; i < n; i++) {
      const j = (gene(Math.floor(x) + i + ring * 9, i) - 0.5) * 0.35;
      ctx.save();
      ctx.rotate((i / n) * Math.PI * 2 + j + ring * 0.2);
      const len = scale * rs * (0.8 + gene(i + ring, 4) * 0.4);
      const w = len * (0.28 + ring * 0.06);
      ctx.fillStyle = ring === 0 ? skin.flower : withAlpha(skin.petalInner, 0.45);
      ctx.strokeStyle = skin.flowerRim;
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(w, -len * 0.35, 0, -len);
      ctx.quadraticCurveTo(-w, -len * 0.28, 0, 0);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  }
  ctx.fillStyle = skin.berry;
  ctx.beginPath(); ctx.arc(0, 0, scale * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = skin.gold;
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.restore();
}

/** C-scroll acanthus — goldwork mass, filled. */
export function acanthus(ctx, x, y, angle, size, side, skin) {
  beginLeaf(ctx, x, y, angle, side);
  ctx.fillStyle = skin.leafFill;
  ctx.strokeStyle = skin.leafStroke;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.15, -size * 0.55, size * 0.7, -size * 0.55, size * 0.85, -size * 0.1);
  ctx.bezierCurveTo(size * 1.05, size * 0.25, size * 0.55, size * 0.45, size * 0.25, size * 0.12);
  ctx.bezierCurveTo(size * 0.55, size * 0.05, size * 0.55, -size * 0.22, size * 0.22, -size * 0.08);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle = skin.vein;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(size * 0.08, 0);
  ctx.quadraticCurveTo(size * 0.45, -size * 0.22, size * 0.72, -size * 0.08);
  ctx.stroke();
  ctx.restore();
}

/** Seed pod with hatching. */
export function pod(ctx, x, y, angle, size, skin) {
  beginLeaf(ctx, x, y, angle, 1);
  ctx.fillStyle = skin.leafFill2;
  ctx.strokeStyle = skin.leafStroke;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.ellipse(size * 0.45, 0, size * 0.45, size * 0.22, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle = skin.vein;
  ctx.lineWidth = 0.45;
  for (let i = 0; i < 4; i++) {
    const t = 0.18 + i * 0.16;
    ctx.beginPath();
    ctx.moveTo(size * t, -size * 0.12);
    ctx.lineTo(size * t + size * 0.06, size * 0.12);
    ctx.stroke();
  }
  ctx.restore();
}

/** Plantain — oval with parallel ribs. */
export function ribbedLeaf(ctx, x, y, angle, size, side, skin) {
  beginLeaf(ctx, x, y, angle, side);
  const s = size;
  ctx.fillStyle = skin.leafFill;
  ctx.strokeStyle = skin.leafStroke;
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(s * 0.38, -s * 0.42, s * 0.95, 0);
  ctx.quadraticCurveTo(s * 0.38, s * 0.42, 0, 0);
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle = skin.vein;
  ctx.lineWidth = 0.55;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(s * 0.9, 0);
  ctx.moveTo(s * 0.12, 0); ctx.quadraticCurveTo(s * 0.4, -s * 0.18, s * 0.72, -s * 0.08);
  ctx.moveTo(s * 0.12, 0); ctx.quadraticCurveTo(s * 0.4, s * 0.18, s * 0.72, s * 0.08);
  ctx.moveTo(s * 0.18, 0); ctx.quadraticCurveTo(s * 0.42, -s * 0.28, s * 0.62, -s * 0.16);
  ctx.moveTo(s * 0.18, 0); ctx.quadraticCurveTo(s * 0.42, s * 0.28, s * 0.62, s * 0.16);
  ctx.stroke();
  ctx.restore();
}

/** Serrated lance — mint / nettle. */
export function toothedLeaf(ctx, x, y, angle, size, side, skin) {
  beginLeaf(ctx, x, y, angle, side);
  const s = size;
  const teeth = 7;
  ctx.fillStyle = skin.leafFill2;
  ctx.strokeStyle = skin.leafStroke;
  ctx.lineWidth = 1.35;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let i = 0; i <= teeth; i++) {
    const t = i / teeth;
    const px = s * t;
    const py = -s * 0.22 * Math.sin(t * Math.PI);
    const tooth = i > 0 && i < teeth ? (i % 2 === 0 ? -s * 0.07 : s * 0.04) : 0;
    ctx.lineTo(px, py + tooth);
  }
  for (let i = teeth; i >= 0; i--) {
    const t = i / teeth;
    const px = s * t;
    const py = s * 0.2 * Math.sin(t * Math.PI);
    const tooth = i > 0 && i < teeth ? (i % 2 === 0 ? s * 0.07 : -s * 0.04) : 0;
    ctx.lineTo(px, py + tooth);
  }
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle = skin.vein;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(s * 0.88, 0);
  ctx.stroke();
  ctx.restore();
}

/** Heart / violet. */
export function cordateLeaf(ctx, x, y, angle, size, side, skin) {
  beginLeaf(ctx, x, y, angle, side);
  const s = size;
  ctx.fillStyle = skin.leafFill;
  ctx.strokeStyle = skin.leafStroke;
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(s * 0.05, -s * 0.45, s * 0.55, -s * 0.5, s * 0.95, 0);
  ctx.bezierCurveTo(s * 0.55, s * 0.5, s * 0.05, s * 0.45, 0, 0);
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle = skin.vein;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(s * 0.78, 0);
  ctx.moveTo(s * 0.2, 0); ctx.quadraticCurveTo(s * 0.4, -s * 0.22, s * 0.55, -s * 0.12);
  ctx.moveTo(s * 0.2, 0); ctx.quadraticCurveTo(s * 0.4, s * 0.22, s * 0.55, s * 0.12);
  ctx.stroke();
  ctx.restore();
}

/** Five-finger cinquefoil. */
export function palmateLeaf(ctx, x, y, angle, size, side, skin) {
  beginLeaf(ctx, x, y, angle, side);
  const s = size;
  for (let i = -2; i <= 2; i++) {
    const a = i * 0.38;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = skin.leafFill;
    ctx.strokeStyle = skin.leafStroke;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * 0.28, -s * 0.12, s * (0.7 - Math.abs(i) * 0.08), 0);
    ctx.quadraticCurveTo(s * 0.28, s * 0.12, 0, 0);
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/** Compound pinnate — agrimony / fern leaflet pair. */
export function pinnatePair(ctx, x, y, angle, size, skin) {
  lanceLeaf(ctx, x, y, angle + 1.05, size * 0.7, 1, skin);
  lanceLeaf(ctx, x, y, angle - 1.05, size * 0.7, -1, skin);
}

/** Flower spike (plantain / agrimony). */
export function spike(ctx, x, y, angle, size, skin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = skin.stemFine;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size, 0);
  ctx.stroke();
  const n = 11;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const px = size * 0.12 + t * size * 0.85;
    const r = size * 0.08 * (0.6 + Math.sin(t * Math.PI));
    ctx.fillStyle = i % 2 === 0 ? skin.flower : skin.berry;
    ctx.strokeStyle = skin.flowerRim;
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.ellipse(px, (i % 2 === 0 ? -1 : 1) * r * 0.4, r * 1.1, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

/** Umbellifer head. */
export function umbel(ctx, x, y, angle, size, skin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const rays = 9;
  for (let i = 0; i < rays; i++) {
    const a = -0.9 + (i / (rays - 1)) * 1.8;
    const len = size * (0.7 + (i % 3) * 0.1);
    ctx.strokeStyle = skin.stemFine;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
    ctx.stroke();
    ctx.fillStyle = skin.flower;
    ctx.strokeStyle = skin.flowerRim;
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * len, Math.sin(a) * len, size * 0.09, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

/** Hanging bell. */
export function bell(ctx, x, y, angle, size, skin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI * 0.5);
  ctx.fillStyle = skin.flower;
  ctx.strokeStyle = skin.flowerRim;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-size * 0.18, 0);
  ctx.bezierCurveTo(-size * 0.4, size * 0.35, -size * 0.38, size * 0.7, -size * 0.22, size * 0.85);
  ctx.lineTo(size * 0.22, size * 0.85);
  ctx.bezierCurveTo(size * 0.38, size * 0.7, size * 0.4, size * 0.35, size * 0.18, 0);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, size * 0.85);
  ctx.quadraticCurveTo(0, size * 0.95, size * 0.22, size * 0.85);
  ctx.stroke();
  ctx.restore();
}

/** Catkin. */
export function catkin(ctx, x, y, angle, size, skin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + 0.6);
  ctx.fillStyle = skin.leafFill2;
  ctx.strokeStyle = skin.leafStroke;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.ellipse(size * 0.35, 0, size * 0.4, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle = skin.vein;
  ctx.lineWidth = 0.4;
  for (let i = 0; i < 5; i++) {
    const t = 0.12 + i * 0.12;
    ctx.beginPath();
    ctx.moveTo(size * t, -size * 0.1);
    ctx.lineTo(size * t + 2, size * 0.1);
    ctx.stroke();
  }
  ctx.restore();
}

/** Fibrous root tuft — woodcut base, not a full system. */
export function rootTuft(ctx, x, y, angle, size, skin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = skin.stemDeep;
  ctx.lineWidth = 0.85;
  ctx.lineCap = "round";
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = -0.7 + (i / (n - 1)) * 1.4;
    const len = size * (0.55 + (i % 3) * 0.18);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(a) * len * 0.45, Math.sin(a) * len * 0.35, Math.cos(a) * len, Math.sin(a) * len);
    ctx.stroke();
  }
  ctx.restore();
}

/** Onion / bulb. */
export function bulb(ctx, x, y, angle, size, skin) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = skin.leafFill2;
  ctx.strokeStyle = skin.leafStroke;
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.ellipse(size * 0.28, 0, size * 0.34, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.5, -size * 0.12);
  ctx.quadraticCurveTo(size * 0.72, 0, size * 0.5, size * 0.12);
  ctx.stroke();
  ctx.strokeStyle = skin.vein;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.55, 0);
  ctx.stroke();
  ctx.restore();
}

/**
 * Place a motif at a node. Kind is chosen by the caller so scenes
 * can bias the vocabulary without cloning the same leaf.
 */
export function place(ctx, kind, x, y, angle, size, side, skin) {
  switch (kind) {
    case "lance": return lanceLeaf(ctx, x, y, angle, size, side, skin);
    case "oval": return ovalLeaf(ctx, x, y, angle, size, side, skin);
    case "lobed": return lobedLeaf(ctx, x, y, angle, size, side, skin);
    case "ribbed": return ribbedLeaf(ctx, x, y, angle, size, side, skin);
    case "toothed": return toothedLeaf(ctx, x, y, angle, size, side, skin);
    case "cordate": return cordateLeaf(ctx, x, y, angle, size, side, skin);
    case "palmate": return palmateLeaf(ctx, x, y, angle, size, side, skin);
    case "pinnate": return pinnatePair(ctx, x, y, angle, size, skin);
    case "sprig": return sprig(ctx, x, y, angle, size, skin);
    case "tendril": return tendril(ctx, x, y, angle, size, skin);
    case "berries": return berries(ctx, x, y, 4 + (size > 12 ? 3 : 0), Math.max(1.8, size * 0.16), skin);
    case "hip": return hip(ctx, x, y, angle, Math.max(4, size * 0.22), skin);
    case "flower5": return flower5(ctx, x, y, angle, size * 0.55, skin);
    case "bloom": return bloom(ctx, x, y, angle, size * 0.7, skin);
    case "acanthus": return acanthus(ctx, x, y, angle, size, side, skin);
    case "pod": return pod(ctx, x, y, angle, size, skin);
    case "spike": return spike(ctx, x, y, angle, size, skin);
    case "umbel": return umbel(ctx, x, y, angle, size, skin);
    case "bell": return bell(ctx, x, y, angle, size, skin);
    case "catkin": return catkin(ctx, x, y, angle, size, skin);
    case "bulb": return bulb(ctx, x, y, angle, size, skin);
    case "root": return rootTuft(ctx, x, y, angle, size, skin);
    default: return lanceLeaf(ctx, x, y, angle, size, side, skin);
  }
}
