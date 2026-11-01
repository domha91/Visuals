// @ts-nocheck
/**
 * Voronoi *edges* as stitch paths.
 * We never fill cells with a rainbow — that is the demo look.
 * Edges become embroidery / lace ground.
 */

export function scatterSeeds(count, x0, y0, x1, y1, rng) {
  const seeds = [];
  for (let i = 0; i < count; i++) {
    seeds.push({
      x: x0 + rng() * (x1 - x0),
      y: y0 + rng() * (y1 - y0)
    });
  }
  return seeds;
}

/**
 * Approximate Voronoi edges on a coarse grid, then trace as segments.
 * Coarse on purpose: textile scale, not pixel-perfect shader.
 */
export function voronoiEdges(seeds, x0, y0, x1, y1, step) {
  const segs = [];
  const seen = new Set();
  function key(a, b) {
    const i = Math.min(a, b);
    const j = Math.max(a, b);
    return i + ":" + j;
  }
  function nearest(x, y) {
    let best = 0;
    let d0 = Infinity;
    let d1 = Infinity;
    let second = 0;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const d = (s.x - x) * (s.x - x) + (s.y - y) * (s.y - y);
      if (d < d0) {
        d1 = d0;
        second = best;
        d0 = d;
        best = i;
      } else if (d < d1) {
        d1 = d;
        second = i;
      }
    }
    return { best, second, d0, d1 };
  }
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const a = nearest(x, y);
      const b = nearest(x + step, y);
      const c = nearest(x, y + step);
      if (a.best !== b.best) {
        const k = key(a.best, b.best);
        if (!seen.has(k)) {
          seen.add(k);
          segs.push({
            x0: x, y0: y, x1: x + step, y1: y
          });
        }
      }
      if (a.best !== c.best) {
        const k = key(a.best, c.best);
        if (!seen.has(k)) {
          seen.add(k);
          segs.push({
            x0: x, y0: y, x1: x, y1: y + step
          });
        }
      }
    }
  }
  return segs;
}
