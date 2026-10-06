// @ts-nocheck
/**
 * Moppi-style recursive plant (technique, not demo look).
 *
 * PSP Flower / Assembly 2004 invitation:
 *   - one organism that GROWS over time
 *   - tapering tubes (cylinder-shaded capsules)
 *   - nested wind (each generation adds sway)
 *   - flowers OPEN at terminals
 *
 * Structure is a binary recursive turtle. Genes are hashed from node id
 * so the skeleton is stable while time only drives growth + wind + bloom.
 */
import { hash2 } from "../rng.js";

export function gene(id, salt = 0) {
  return hash2(id * 12.9898 + salt, id * 78.233 + salt * 3.1);
}

export function easeOut(t) {
  const x = Math.max(0, Math.min(1, t));
  return 1 - (1 - x) * (1 - x);
}

export function easeInOut(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/**
 * How far this node has grown: 0 hidden, 1 fully extended.
 * birth is in "generation time"; age is global growth clock.
 */
export function nodeGrow(age, birth, span = 1.15) {
  return easeOut((age - birth) / span);
}

export function bloomOpen(age, birth, floral) {
  // Flower starts opening after the stem that carries it has mostly grown.
  const t = easeInOut((age - (birth + 0.55)) / 1.4);
  return t * (0.35 + floral * 0.65);
}
