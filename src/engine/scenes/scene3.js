// @ts-nocheck
/**
 * Scene 3 — isometric strapwork hall. Shared isoRoom camera with scene 5.
 * Future (not yet): dancing figures in Elizabethan/Jacobean dress on this floor.
 */
import { bright, dark, withAlpha } from "../palette.js";
import { inWell } from "../well.js";
import { isoAt, isoBeams, isoBox, isoCeiling, isoCoffers, isoEntablature, isoFloorTile, isoRoom, isoWallX, isoWallY } from "../iso.js";

const WOOD = [dark.vermilion, dark.amber, dark.sardius, dark.topaz];
const GEM = [bright.amber, bright.ligure, bright.topaz, bright.pearl];

export class Scene3 {
  constructor(ctx) {
    this.ctx = ctx;
    this.time = 0;
  }

  render(params, w, h) {
    const motion = params.motion ?? 0.32;
    this.time += 0.01 * (0.5 + motion);
    const cam = isoRoom(w, h);
    this.ctx.fillStyle = dark.sardius;
    this.ctx.fillRect(0, 0, w, h);
    isoEntablature(this.ctx, w, dark.vermilion, bright.amber);
    isoCeiling(this.ctx, cam, withAlpha(dark.vermilion, 0.85), bright.amber);
    isoCoffers(this.ctx, cam, withAlpha(dark.sardius, 0.35), withAlpha(bright.ligure, 0.45));
    isoBeams(this.ctx, cam, withAlpha(bright.amber, 0.45));
    this.walls(cam, w, h);
    this.floor(cam, w, h);
    this.cabinets(cam, w, h);
    this.straps(cam, w, h, motion);
  }

  walls(cam, w, h) {
    const ctx = this.ctx;
    const { ox, oy, room, wallH } = cam;
    isoWallY(ctx, ox, oy, 0, room, 0, 0, wallH,
      withAlpha(dark.sardius, 0.72), bright.amber, 2);
    isoWallX(ctx, ox, oy, 0, 0, room, 0, wallH,
      withAlpha(dark.vermilion, 0.78), bright.amber, 2);

    const bays = 7;
    const bay = room / bays;
    for (let i = 0; i < bays; i++) {
      const x0 = i * bay + 10, x1 = (i + 1) * bay - 10;
      isoWallY(ctx, ox, oy, x0, x1, 0, 24, wallH - 36,
        withAlpha(WOOD[i % WOOD.length], 0.55), GEM[i % GEM.length], 1.6);
      isoWallY(ctx, ox, oy, x0 + 14, x1 - 14, 0, 48, wallH - 60,
        null, withAlpha(bright.ligure, 0.8), 1.3);
      const y0 = i * bay + 10, y1 = (i + 1) * bay - 10;
      isoWallX(ctx, ox, oy, 0, y0, y1, 24, wallH - 36,
        withAlpha(WOOD[(i + 2) % WOOD.length], 0.5), GEM[(i + 1) % GEM.length], 1.6);
      isoWallX(ctx, ox, oy, 0, y0 + 14, y1 - 14, 48, wallH - 60,
        null, withAlpha(bright.amber, 0.75), 1.3);
    }

    isoWallY(ctx, ox, oy, 0, room, 0, wallH - 18, wallH,
      withAlpha(bright.amber, 0.35), bright.ligure, 2);
    isoWallX(ctx, ox, oy, 0, 0, room, wallH - 18, wallH,
      withAlpha(bright.amber, 0.3), bright.ligure, 2);
  }

  floor(cam, w, h) {
    const ctx = this.ctx;
    const { ox, oy, tile, n } = cam;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = i * tile, y = j * tile;
        isoFloorTile(ctx, ox, oy, x, y, tile - 3,
          withAlpha(WOOD[(i + j) % WOOD.length], (i + j) % 2 === 0 ? 0.58 : 0.34),
          withAlpha(GEM[(i + j) % GEM.length], 0.4));
      }
    }
  }

  cabinets(cam, w, h) {
    const { ox, oy, room } = cam;
    const spots = [
      [40, room - 260, 210, 140, 240],
      [room - 280, 40, 200, 150, 260],
      [room - 340, room - 280, 260, 160, 110],
      [room * 0.35, room - 220, 180, 130, 90]
    ];
    spots.forEach((s, i) => {
      const c = isoAt(ox, oy, s[0] + s[2] / 2, s[1] + s[3] / 2, s[4] / 2);
      if (inWell(c.x, c.y, w, h, 20)) return;
      isoBox(this.ctx, ox, oy, s[0], s[1], 0, s[2], s[3], s[4],
        withAlpha(GEM[i % GEM.length], 0.4),
        withAlpha(WOOD[i % WOOD.length], 0.9),
        withAlpha(WOOD[(i + 1) % WOOD.length], 0.74),
        bright.amber);
    });
  }

  straps(cam, w, h, motion) {
    const ctx = this.ctx;
    const { ox, oy, room } = cam;
    const t = this.time * 20 * (0.4 + motion);
    ctx.lineCap = "round";
    for (let k = 0; k < 6; k++) {
      const y = 80 + k * (room / 7);
      ctx.strokeStyle = WOOD[k % WOOD.length];
      ctx.lineWidth = 12;
      ctx.beginPath();
      let started = false;
      for (let x = 20; x <= room - 20; x += 14) {
        const p = isoAt(ox, oy, x + (t % 40), y, 8);
        if (inWell(p.x, p.y, w, h, 6)) { started = false; continue; }
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  }
}
