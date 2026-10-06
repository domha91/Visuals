// @ts-nocheck
/**
 * 2D signed-distance operations.
 * Used as ornamental tools (offset, shell, blend) — never as a "shader look".
 *
 * d < 0 inside, d > 0 outside, d == 0 on the contour.
 * opOnion / opRound are the embroidery / candlewick primitives.
 */

export function opUnion(a, b) {
  return Math.min(a, b);
}

export function opSub(a, b) {
  return Math.max(a, -b);
}

export function opIntersect(a, b) {
  return Math.max(a, b);
}

/** Soft blend. Keep k small so forms stay drafted, not metaball-demo. */
export function opSmoothUnion(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

/** Positive offset = embroidered / inked thickness. */
export function opRound(d, r) {
  return d - r;
}

/** Concentric shell — candlewick, lace outline, engraved band. */
export function opOnion(d, thickness) {
  return Math.abs(d) - thickness;
}

export function opAnnulus(d, inner, outer) {
  return opSub(opRound(d, outer), opRound(d, inner));
}
