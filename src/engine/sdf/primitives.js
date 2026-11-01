// @ts-nocheck
/**
 * 2D signed-distance primitives for ornament.
 * Segments, polylines and vesica are the workhorses.
 * Spheres/tori exist only as building blocks, not as the composition.
 */

export function length2(x, y) {
  return Math.hypot(x, y);
}

export function sdCircle(px, py, r) {
  return Math.hypot(px, py) - r;
}

export function sdSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay + 1e-8)));
  return Math.hypot(pax - bax * h, pay - bay * h);
}

export function sdCapsule(px, py, ax, ay, bx, by, r) {
  return sdSegment(px, py, ax, ay, bx, by) - r;
}

/** Leaf / petal: intersection of two circles (vesica piscis). */
export function sdVesica(px, py, r, d) {
  px = Math.abs(px);
  const b = Math.sqrt(r * r - d * d);
  return ((py - b) * d > px * b)
    ? Math.hypot(px, py - b)
    : Math.hypot(px - d, py) - r;
}

export function sdEgg(px, py, ra, rb) {
  const k = Math.sqrt(ra / rb);
  px = Math.abs(px);
  const r = px < ra ? Math.hypot(px, py) - ra : Math.hypot(px, py - rb + ra) - ra * k;
  return r;
}

export function sdBox(px, py, bx, by) {
  const dx = Math.abs(px) - bx;
  const dy = Math.abs(py) - by;
  const ax = Math.max(dx, 0);
  const ay = Math.max(dy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(dx, dy), 0);
}

export function sdPolyline(px, py, pts) {
  let d = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    d = Math.min(d, sdSegment(px, py, a.x, a.y, b.x, b.y));
  }
  return d;
}

/**
 * Approximate quadratic Bezier distance by flattening.
 * Accurate enough for ornamental ink; cheaper than analytic Bezier SDF.
 */
export function flattenQuadratic(ax, ay, cx, cy, bx, by, steps = 8) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    pts.push({
      x: u * u * ax + 2 * u * t * cx + t * t * bx,
      y: u * u * ay + 2 * u * t * cy + t * t * by
    });
  }
  return pts;
}
