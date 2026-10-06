// @ts-nocheck
/** Shared 2:1 isometric room for scenes 3 and 5. World x,y on the floor, z up. */

const COS = Math.sqrt(3) / 2;
const SIN = 0.5;

export const ISO_TILE = 80;
export const ISO_N = 16;
export const ISO_WALL = 520;

export function iso(x, y, z = 0) {
  return { x: (x - y) * COS, y: (x + y) * SIN - z };
}

export function isoAt(ox, oy, x, y, z = 0) {
  const p = iso(x, y, z);
  return { x: ox + p.x, y: oy + p.y };
}

/** Same camera for strapwork and lathe. Wall heads clip past the top of the frame. */
export function isoRoom(w, h) {
  const tile = ISO_TILE;
  const n = ISO_N;
  const wallH = ISO_WALL;
  const room = n * tile;
  return {
    ox: w * 0.5,
    oy: wallH - 40,
    tile,
    n,
    wallH,
    room
  };
}

export function isoQuad(ctx, pts, fill, stroke, width = 1) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

export function isoWallY(ctx, ox, oy, x0, x1, y, z0, z1, fill, stroke, width = 1.4) {
  isoQuad(ctx, [
    isoAt(ox, oy, x0, y, z0),
    isoAt(ox, oy, x1, y, z0),
    isoAt(ox, oy, x1, y, z1),
    isoAt(ox, oy, x0, y, z1)
  ], fill, stroke, width);
}

export function isoWallX(ctx, ox, oy, x, y0, y1, z0, z1, fill, stroke, width = 1.4) {
  isoQuad(ctx, [
    isoAt(ox, oy, x, y0, z0),
    isoAt(ox, oy, x, y1, z0),
    isoAt(ox, oy, x, y1, z1),
    isoAt(ox, oy, x, y0, z1)
  ], fill, stroke, width);
}

export function isoBox(ctx, ox, oy, x, y, z, dx, dy, dz, top, left, right, ink) {
  const p = (a, b, c) => isoAt(ox, oy, x + a, y + b, z + c);
  const A = p(0, 0, 0), B = p(dx, 0, 0), C = p(dx, dy, 0), D = p(0, dy, 0);
  const E = p(0, 0, dz), F = p(dx, 0, dz), G = p(dx, dy, dz), H = p(0, dy, dz);
  isoQuad(ctx, [E, F, G, H], top, ink, 0.9);
  isoQuad(ctx, [A, B, F, E], left, ink, 0.9);
  isoQuad(ctx, [B, C, G, F], right, ink, 0.9);
  return { A, B, C, D, E, F, G, H };
}

export function isoFloorTile(ctx, ox, oy, x, y, s, fill, ink) {
  const p = (a, b) => isoAt(ox, oy, x + a, y + b, 0);
  isoQuad(ctx, [p(0, 0), p(s, 0), p(s, s), p(0, s)], fill, ink, 0.7);
}

export function isoCeiling(ctx, cam, fill, ink) {
  const { ox, oy, room, wallH } = cam;
  isoQuad(ctx, [
    isoAt(ox, oy, 0, 0, wallH),
    isoAt(ox, oy, room, 0, wallH),
    isoAt(ox, oy, room, room, wallH),
    isoAt(ox, oy, 0, room, wallH)
  ], fill, ink, 1.3);
}

export function isoBeams(ctx, cam, col) {
  const { ox, oy, room, wallH, n } = cam;
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  for (let i = 1; i < n; i += 2) {
    const t = (i / n) * room;
    const a = isoAt(ox, oy, t, 0, wallH);
    const b = isoAt(ox, oy, t, room, wallH);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    const c = isoAt(ox, oy, 0, t, wallH);
    const d = isoAt(ox, oy, room, t, wallH);
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.stroke();
  }
}

export function isoCoffers(ctx, cam, fill, ink) {
  const { ox, oy, room, wallH, tile, n } = cam;
  const inset = 10;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = i * tile + inset, y = j * tile + inset, s = tile - inset * 2;
      isoQuad(ctx, [
        isoAt(ox, oy, x, y, wallH),
        isoAt(ox, oy, x + s, y, wallH),
        isoAt(ox, oy, x + s, y + s, wallH),
        isoAt(ox, oy, x, y + s, wallH)
      ], fill, ink, 0.8);
    }
  }
}

/** Full-width cornice so the band above the iso diamond is still the room. */
export function isoEntablature(ctx, w, wood, gem) {
  const h = Math.round(w * 0.09);
  ctx.fillStyle = wood;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = gem;
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, w - 16, h - 16);
  ctx.lineWidth = 1.4;
  ctx.strokeRect(20, 20, w - 40, h - 40);
  const n = 11;
  for (let i = 0; i < n; i++) {
    const x = 28 + i * ((w - 56) / n);
    const bw = (w - 56) / n - 10;
    ctx.strokeStyle = gem;
    ctx.strokeRect(x, 28, bw, h - 56);
    ctx.strokeRect(x + 6, 34, bw - 12, h - 68);
  }
}
