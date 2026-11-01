// @ts-nocheck
/**
 * Discrete SDF rendering for Canvas 2D.
 *
 * We do NOT ray-march a fullscreen field (that is the demo look, and too
 * expensive at 1920×1080 on CPU). Instead we use the SDF idea:
 *
 *   distance-to-contour  →  line thickness, offset bands, shells, hatching
 *
 * offsetPolyline is the discrete analogue of opRound on a 1D skeleton.
 */

export function polylineNormals(pts) {
  const n = pts.length;
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    out.push({ x: -dy / len, y: dx / len });
  }
  return out;
}

export function offsetPolyline(pts, dist) {
  const nrm = polylineNormals(pts);
  return pts.map((p, i) => ({
    x: p.x + nrm[i].x * dist,
    y: p.y + nrm[i].y * dist
  }));
}

export function strokePoly(ctx, pts, color, width, alpha = 1) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.restore();
}

/**
 * Contour hierarchy: several offset bands of decreasing weight.
 * This is the "engraved / inked / hairline" stack used in manuscripts.
 */
export function strokeContourHierarchy(ctx, pts, layers) {
  for (const layer of layers) {
    const path = layer.offset ? offsetPolyline(pts, layer.offset) : pts;
    strokePoly(ctx, path, layer.color, layer.width, layer.alpha ?? 1);
  }
}

/** Short ticks perpendicular to the skeleton — hatching, not noise. */
export function hatchPolyline(ctx, pts, spacing, tick, color, width, alpha = 0.35) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;
    let t = 0;
    while (t < len) {
      acc += 1;
      if (acc % spacing === 0) {
        const x = a.x + ux * t;
        const y = a.y + uy * t;
        ctx.beginPath();
        ctx.moveTo(x - nx * tick, y - ny * tick);
        ctx.lineTo(x + nx * tick, y + ny * tick);
        ctx.stroke();
      }
      t += 4;
    }
  }
  ctx.restore();
}

/** Stipple inside a radius using a hash — candlewick / punch-needle texture. */
export function stippleDisk(ctx, cx, cy, r, density, color, seedHash) {
  ctx.save();
  ctx.fillStyle = color;
  const n = Math.floor(r * r * density * 0.08);
  for (let i = 0; i < n; i++) {
    const u = seedHash(cx + i * 12.9, cy + i * 7.3);
    const v = seedHash(cy + i * 4.1, cx + i * 9.7);
    const rr = r * Math.sqrt(u);
    const a = v * Math.PI * 2;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    ctx.beginPath();
    ctx.arc(x, y, 0.6 + u * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Onion rings around a closed-ish oval — lace / candlewick medallion. */
export function strokeOnionOval(ctx, cx, cy, rx, ry, rings, rot, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  for (const ring of rings) {
    ctx.globalAlpha = ring.alpha ?? 0.85;
    ctx.lineWidth = ring.width;
    ctx.beginPath();
    ctx.ellipse(ring.dx ?? 0, ring.dy ?? 0, rx * ring.s, ry * ring.s, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function fillDisk(ctx, x, y, r, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function strokeDisk(ctx, x, y, r, color, width, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
