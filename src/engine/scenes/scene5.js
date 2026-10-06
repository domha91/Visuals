// @ts-nocheck
/**
 * Scene 5 — isometric turned furniture. Same isoRoom camera as scene 3.
 * Future (not yet): dancing figures in Elizabethan/Jacobean dress on this floor.
 */
import { bright, dark, withAlpha } from "../palette.js";
import { inWell } from "../well.js";
import { isoAt, isoBeams, isoBox, isoCeiling, isoCoffers, isoEntablature, isoFloorTile, isoRoom, isoWallX, isoWallY } from "../iso.js";

const OAK = [dark.amber, dark.vermilion, dark.sardius, dark.topaz, dark.crimson];
const BEAD = [bright.amber, bright.ligure, bright.topaz, bright.pearl, bright.sardonyx];

function radiusAt(t) {
  return 0.22
    + 0.20 * Math.exp(-Math.pow((t - 0.12) / 0.05, 2))
    + 0.28 * Math.exp(-Math.pow((t - 0.32) / 0.07, 2))
    + 0.16 * Math.exp(-Math.pow((t - 0.50) / 0.08, 2))
    + 0.28 * Math.exp(-Math.pow((t - 0.68) / 0.07, 2))
    + 0.20 * Math.exp(-Math.pow((t - 0.88) / 0.05, 2));
}

function isoSpindle(ctx, ox, oy, x, y, z0, z1, rot, col, hi, fat = 1) {
  const slices = 24;
  for (let i = 0; i <= slices; i++) {
    const t = i / slices;
    const z = z0 + t * (z1 - z0);
    const r = radiusAt(t) * 28 * fat;
    const c = isoAt(ox, oy, x, y, z);
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, r * 0.9, Math.max(2, r * 0.38), -0.5, 0, Math.PI * 2);
    ctx.stroke();
    if (i % 2 === 0) {
      ctx.strokeStyle = hi;
      ctx.lineWidth = 1.1;
      const a0 = rot + t * 6;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, r * 0.82, Math.max(1.6, r * 0.3), -0.5, a0, a0 + 0.9);
      ctx.stroke();
    }
  }
}

export class Scene5 {
  constructor(ctx) {
    this.ctx = ctx;
    this.time = 0;
  }

  render(params, w, h) {
    const motion = params.motion ?? 0.32;
    this.time += 0.012 * (0.55 + motion);
    const rot = this.time * 0.85 * (0.55 + motion);
    const cam = isoRoom(w, h);
    this.ctx.fillStyle = dark.vermilion;
    this.ctx.fillRect(0, 0, w, h);
    isoEntablature(this.ctx, w, dark.amber, bright.ligure);
    isoCeiling(this.ctx, cam, withAlpha(dark.amber, 0.88), bright.ligure);
    isoCoffers(this.ctx, cam, withAlpha(dark.sardius, 0.3), withAlpha(bright.amber, 0.4));
    isoBeams(this.ctx, cam, withAlpha(bright.amber, 0.4));
    this.walls(cam);
    this.floor(cam);
    this.bed(cam, w, h, rot);
    this.cupboard(cam, w, h, rot);
    this.table(cam, w, h, rot);
  }

  walls(cam) {
    const ctx = this.ctx;
    const { ox, oy, room, wallH } = cam;
    isoWallY(ctx, ox, oy, 0, room, 0, 0, wallH,
      withAlpha(dark.amber, 0.78), bright.ligure, 2);
    isoWallX(ctx, ox, oy, 0, 0, room, 0, wallH,
      withAlpha(dark.vermilion, 0.82), bright.amber, 2);

    const bays = 7;
    const bay = room / bays;
    for (let i = 0; i < bays; i++) {
      isoWallY(ctx, ox, oy, i * bay + 10, (i + 1) * bay - 10, 0, 22, wallH - 32,
        withAlpha(OAK[i % OAK.length], 0.55), BEAD[i % BEAD.length], 1.5);
      isoWallX(ctx, ox, oy, 0, i * bay + 10, (i + 1) * bay - 10, 22, wallH - 32,
        withAlpha(OAK[(i + 2) % OAK.length], 0.5), BEAD[(i + 1) % BEAD.length], 1.5);
      const midX = i * bay + bay / 2;
      isoSpindle(ctx, ox, oy, midX, 8, 40, wallH - 50, this.time * 0.4 + i,
        OAK[i % OAK.length], withAlpha(BEAD[i % BEAD.length], 0.85), 0.55);
      const midY = i * bay + bay / 2;
      isoSpindle(ctx, ox, oy, 8, midY, 40, wallH - 50, -this.time * 0.4 + i,
        OAK[(i + 1) % OAK.length], withAlpha(BEAD[(i + 2) % BEAD.length], 0.85), 0.55);
    }

    isoWallY(ctx, ox, oy, 0, room, 0, wallH - 18, wallH,
      withAlpha(bright.amber, 0.32), bright.ligure, 2);
    isoWallX(ctx, ox, oy, 0, 0, room, wallH - 18, wallH,
      withAlpha(bright.amber, 0.28), bright.ligure, 2);
  }

  floor(cam) {
    const ctx = this.ctx;
    const { ox, oy, tile, n } = cam;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        isoFloorTile(ctx, ox, oy, i * tile, j * tile, tile - 4,
          withAlpha(OAK[(i + j) % OAK.length], (i + j) % 2 ? 0.5 : 0.32),
          withAlpha(BEAD[(i + j) % BEAD.length], 0.3));
      }
    }
  }

  bed(cam, w, h, rot) {
    const { ox, oy, room } = cam;
    const posts = [
      [40, 40], [360, 40], [40, 360], [360, 360]
    ];
    posts.forEach((p, i) => {
      isoSpindle(this.ctx, ox, oy, p[0], p[1], 0, 300, rot * (i % 2 ? 1 : -1) + i,
        OAK[i % OAK.length], withAlpha(BEAD[i % BEAD.length], 0.9), 1.05);
    });
    isoBox(this.ctx, ox, oy, 20, 20, 300, 360, 360, 26,
      withAlpha(bright.amber, 0.3),
      withAlpha(dark.vermilion, 0.72),
      withAlpha(dark.amber, 0.62),
      bright.ligure);
    isoBox(this.ctx, ox, oy, 50, 50, 64, 300, 300, 22,
      withAlpha(dark.sardius, 0.5),
      withAlpha(dark.crimson, 0.52),
      withAlpha(dark.vermilion, 0.42),
      withAlpha(bright.sardonyx, 0.45));
  }

  cupboard(cam, w, h, rot) {
    const { ox, oy, room } = cam;
    const x = room - 260, y = 40;
    isoBox(this.ctx, ox, oy, x, y, 0, 220, 170, 280,
      withAlpha(bright.topaz, 0.24),
      withAlpha(dark.amber, 0.84),
      withAlpha(dark.vermilion, 0.72),
      bright.amber);
    isoSpindle(this.ctx, ox, oy, x + 28, y + 28, 0, 260, rot, OAK[0], BEAD[0], 1);
    isoSpindle(this.ctx, ox, oy, x + 192, y + 28, 0, 260, -rot, OAK[1], BEAD[1], 1);
    isoSpindle(this.ctx, ox, oy, x + 28, y + 142, 0, 260, rot * 0.8, OAK[2], BEAD[2], 1);
    isoSpindle(this.ctx, ox, oy, x + 192, y + 142, 0, 260, -rot * 0.8, OAK[3], BEAD[3], 1);
  }

  table(cam, w, h, rot) {
    const { ox, oy, room } = cam;
    const x = room - 380, y = room - 280;
    const legs = [[0, 0], [260, 0], [0, 150], [260, 150]];
    legs.forEach((p, i) => {
      isoSpindle(this.ctx, ox, oy, x + p[0], y + p[1], 0, 120, rot * (i % 2 ? 1 : -1),
        OAK[i % OAK.length], BEAD[i % BEAD.length], 1.1);
    });
    isoBox(this.ctx, ox, oy, x - 16, y - 16, 120, 292, 182, 20,
      withAlpha(bright.ligure, 0.32),
      withAlpha(dark.amber, 0.78),
      withAlpha(dark.topaz, 0.62),
      bright.amber);
  }
}
