// @ts-nocheck
/**
 * L-system → polyline forest.
 * Grammar produces authored botanical structure, not a fractal demo.
 * Branching is biased and asymmetric on purpose (Jacobean / manuscript vine).
 */
import { flattenQuadratic } from "../sdf/primitives.js";

export function growVine(opts) {
  const {
    x, y, angle, length, depth, rng,
    continuity = 0.7,
    complexity = 0.45,
    density = 0.5,
    warp = 0.0,
    time = 0
  } = opts;

  const branches = [];
  const berries = [];
  const leaves = [];

  function step(px, py, ang, len, d, thick) {
    if (d <= 0 || len < 8) return;

    // Slow temporal drift — contemplative, not beat-synced.
    const sway = Math.sin(time * 0.15 + py * 0.004 + px * 0.002) * 0.08;
    // Restrained domain warp (curvature), not plasma.
    const w = warp * Math.sin(py * 0.01 + time * 0.05) * 0.12;

    const a2 = ang + sway + w;
    const cx = px + Math.cos(a2 + 0.35 * (rng() - 0.5)) * len * 0.45;
    const cy = py + Math.sin(a2 + 0.35 * (rng() - 0.5)) * len * 0.45;
    const ex = px + Math.cos(a2) * len;
    const ey = py + Math.sin(a2) * len;

    const pts = flattenQuadratic(px, py, cx, cy, ex, ey, 6);
    branches.push({ pts, depth: d, thick });

    const childLen = len * (0.58 + continuity * 0.22);
    const spread = (0.35 + complexity * 0.7) * (0.6 + rng());

    step(ex, ey, a2 + spread * (rng() > 0.5 ? 1 : -0.35), childLen, d - 1, thick * 0.72);

    if (rng() < 0.55 * density && d > 1) {
      step(
        ex, ey,
        a2 - spread * (0.5 + rng() * 0.8),
        childLen * (0.7 + rng() * 0.2),
        d - 1,
        thick * 0.62
      );
    }

    if (d <= 3 && rng() < 0.35 * density) {
      berries.push({ x: ex, y: ey, r: 2.2 + rng() * 2.4, depth: d });
    }

    if (d <= 4 && rng() < 0.22 * density) {
      leaves.push({
        x: ex, y: ey,
        angle: a2 + (rng() - 0.5) * 1.2,
        len: 10 + rng() * 16,
        depth: d
      });
    }
  }

  step(x, y, angle, length, depth, 1);
  return { branches, berries, leaves };
}
