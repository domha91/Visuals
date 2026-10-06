// @ts-nocheck
/**
 * Scene 1 — loom. Each pass a different cloth: tabby, herringbone,
 * diamond lozenge, ogee. Centre left clear for the terminal.
 */
import { mulberry32 } from "../rng.js";
import { bright, dark, withAlpha } from "../palette.js";
import { inWell, weftGaps, wellRect } from "../well.js";

const SETS = [
  {
    warp: [dark.sardius, dark.vermilion, dark.amber],
    weft: [bright.amber, bright.ligure, bright.topaz, bright.sardonyx],
    knot: [bright.sardius, bright.ruby, bright.carbuncle]
  },
  {
    warp: [dark.chalcedony, dark.sapphire, dark.crystal],
    weft: [bright.sapphire, bright.agate, bright.crystal, bright.chalcedony],
    knot: [bright.crystal, bright.beryl, bright.agate]
  },
  {
    warp: [dark.emerald, dark.chrysolyte, dark.beryl],
    weft: [bright.emerald, bright.chrysoprasus, bright.chrysolyte, bright.beryl],
    knot: [bright.emerald, bright.topaz, bright.chrysolyte]
  },
  {
    warp: [dark.purple, dark.amethyst, dark.jacinth],
    weft: [bright.amethyst, bright.jacinth, bright.ruby, bright.agate],
    knot: [bright.jacinth, bright.amethyst, bright.ruby]
  },
  {
    warp: [dark.crimson, dark.scarlet, dark.sardius],
    weft: [bright.ruby, bright.carbuncle, bright.pearl, bright.sardius],
    knot: [bright.sardius, bright.carbuncle, bright.pearl]
  },
  {
    warp: [dark.topaz, dark.amber, dark.vermilion],
    weft: [bright.topaz, bright.amber, bright.ligure, bright.pearl],
    knot: [bright.topaz, bright.amber, bright.sardonyx]
  }
];

const CLOTH = ["tabby", "herringbone", "lozenge", "ogee", "blackwork"];

export class Scene1 {
  constructor(ctx) {
    this.ctx = ctx;
    this.time = 0;
  }

  render(params, w, h) {
    const motion = params.motion ?? 0.32;
    this.time += 0.016 * (0.5 + motion);
    const ctx = this.ctx;
    const t = this.time;
    const beat = 0.55 + motion;

    const rowH = 8;
    const rows = Math.floor(h / rowH);
    const speed = 22 * beat;
    const gen = Math.floor((t * speed) / rows);
    const woven = (t * speed) - gen * rows;
    const set = SETS[gen % SETS.length];
    const cloth = CLOTH[gen % CLOTH.length];
    const wovenY = Math.min(h, woven * rowH);
    const well = wellRect(w, h);

    this.warp(ctx, w, h, t, beat, set);

    if (cloth === "tabby") this.tabby(ctx, w, h, rows, rowH, woven, set);
    else if (cloth === "herringbone") this.herringbone(ctx, w, h, wovenY, set);
    else if (cloth === "lozenge") this.lozenge(ctx, w, h, wovenY, set);
    else if (cloth === "blackwork") this.blackwork(ctx, w, h, wovenY, set);
    else this.ogee(ctx, w, h, wovenY, set);

    this.shuttle(ctx, w, h, rows, rowH, woven, t, set);

    const rng = mulberry32(gen * 9973);
    for (let i = 0; i < 40; i++) {
      const x = rng() * w;
      const y = rng() * wovenY;
      if (inWell(x, y, w, h, 4)) continue;
      ctx.fillStyle = set.knot[i % set.knot.length];
      ctx.beginPath();
      ctx.arc(x, y, 1.4 + (i % 3) * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // faint well edge on the cloth
    ctx.strokeStyle = withAlpha(set.weft[0], 0.25);
    ctx.lineWidth = 1;
    ctx.strokeRect(well.x, well.y, well.w, well.h);
  }

  warp(ctx, w, h, t, beat, set) {
    const warpN = 52;
    for (let i = 0; i < warpN; i++) {
      const x = (i / (warpN - 1)) * w;
      const tense = Math.sin(t * 1.1 * beat + i * 0.35) * 3.2 * beat;
      ctx.strokeStyle = withAlpha(set.warp[i % set.warp.length], 0.55);
      ctx.lineWidth = 1.05 + (i % 5 === 0 ? 1.2 : 0);
      const well = wellRect(w, h);
      if (x > well.x && x < well.x + well.w) {
        ctx.beginPath();
        ctx.moveTo(x + tense * 0.15, 0);
        ctx.lineTo(x, well.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, well.y + well.h);
        ctx.lineTo(x - tense * 0.15, h);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(x + tense * 0.15, 0);
        ctx.quadraticCurveTo(x + tense, h * 0.5, x - tense * 0.15, h);
        ctx.stroke();
      }
    }
  }

  tabby(ctx, w, h, rows, rowH, woven, set) {
    for (let r = 0; r < rows; r++) {
      const phase = woven - r;
      const cover = phase >= 1 ? 1 : phase > 0 ? phase : 0;
      if (cover <= 0.01) continue;
      const y = r * rowH + 3;
      const dir = r % 2 === 0 ? 1 : -1;
      const x0 = dir === 1 ? 0 : w * (1 - cover);
      const x1 = dir === 1 ? w * cover : w;
      ctx.strokeStyle = withAlpha(set.weft[r % set.weft.length], 0.8);
      ctx.lineWidth = 2.6 + (r % 4 === 0 ? 1.4 : 0);
      ctx.lineCap = "round";
      for (const [a, b] of weftGaps(y, x0, x1, w, h)) {
        ctx.beginPath(); ctx.moveTo(a, y); ctx.lineTo(b, y); ctx.stroke();
      }
    }
  }

  herringbone(ctx, w, h, wovenY, set) {
    const s = 18;
    ctx.lineCap = "round";
    for (let row = 0, y = 4; y < wovenY; y += s, row++) {
      const col = set.weft[row % set.weft.length];
      ctx.strokeStyle = withAlpha(col, 0.82);
      ctx.lineWidth = 2.2;
      const dir = row % 2 === 0 ? 1 : -1;
      for (let x = 0; x < w; x += s) {
        const x1 = x + s * dir;
        const y1 = y + s;
        if (inWell(x + s * 0.5, y + s * 0.5, w, h, 2)) continue;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
    }
  }

  lozenge(ctx, w, h, wovenY, set) {
    const s = 26;
    ctx.lineJoin = "miter";
    for (let row = 0, y = 0; y < wovenY; y += s, row++) {
      for (let col = 0, x = 0; x < w; x += s, col++) {
        if (inWell(x + s * 0.5, y + s * 0.5, w, h, 4)) continue;
        const c = set.weft[(row + col) % set.weft.length];
        ctx.strokeStyle = withAlpha(c, 0.78);
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(x + s * 0.5, y);
        ctx.lineTo(x + s, y + s * 0.5);
        ctx.lineTo(x + s * 0.5, y + s);
        ctx.lineTo(x, y + s * 0.5);
        ctx.closePath();
        ctx.stroke();
        if ((row + col) % 3 === 0) {
          ctx.strokeStyle = withAlpha(set.knot[col % set.knot.length], 0.7);
          ctx.beginPath();
          ctx.arc(x + s * 0.5, y + s * 0.5, 3.2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }

  ogee(ctx, w, h, wovenY, set) {
    const s = 48;
    for (let row = 0, y = 10; y < wovenY; y += s * 0.7, row++) {
      const ox = (row % 2) * (s * 0.5);
      const col = set.weft[row % set.weft.length];
      ctx.strokeStyle = withAlpha(col, 0.8);
      ctx.lineWidth = 2;
      for (let x = -s + ox; x < w + s; x += s) {
        if (inWell(x + s * 0.5, y, w, h, 6)) continue;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(x + s * 0.25, y - s * 0.35, x + s * 0.75, y + s * 0.35, x + s, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(x + s * 0.25, y + s * 0.35, x + s * 0.75, y - s * 0.35, x + s, y);
        ctx.stroke();
      }
    }
  }

  blackwork(ctx, w, h, wovenY, set) {
    const s = 20;
    ctx.lineCap = "square";
    const thread = set.warp[0];
    for (let y = 0; y < wovenY; y += s) {
      for (let x = 0; x < w; x += s) {
        if (inWell(x + s * 0.5, y + s * 0.5, w, h, 2)) continue;
        ctx.strokeStyle = withAlpha(thread, 0.85);
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.5);
        ctx.lineTo(x + s * 0.5, y);
        ctx.lineTo(x + s, y + s * 0.5);
        ctx.lineTo(x + s * 0.5, y + s);
        ctx.closePath();
        ctx.stroke();
        if ((x / s + y / s) % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(x + s * 0.25, y + s * 0.5);
          ctx.lineTo(x + s * 0.5, y + s * 0.25);
          ctx.lineTo(x + s * 0.75, y + s * 0.5);
          ctx.lineTo(x + s * 0.5, y + s * 0.75);
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
  }

  shuttle(ctx, w, h, rows, rowH, woven, t, set) {
    const shuttleRow = Math.min(rows - 1, Math.floor(woven));
    const frac = woven - Math.floor(woven);
    const dir = shuttleRow % 2 === 0 ? 1 : -1;
    let sx = dir === 1 ? frac * w : (1 - frac) * w;
    const sy = shuttleRow * rowH + 3;
    if (inWell(sx, sy, w, h, 0)) {
      const well = wellRect(w, h);
      sx = dir === 1 ? well.x + well.w + 8 : well.x - 8;
    }
    const yarn = set.weft[shuttleRow % set.weft.length];
    ctx.fillStyle = yarn;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 11, 3.4, dir === 1 ? 0.15 : -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = withAlpha(dark.amber, 0.7);
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.strokeStyle = withAlpha(yarn, 0.9);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - dir * 52, sy + Math.sin(t * 7) * 4);
    ctx.stroke();
  }
}
