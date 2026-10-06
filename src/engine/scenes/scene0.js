// @ts-nocheck
/**
 * Scene 0 — Gerard-style herbal.
 * Each plant is rooted on the canvas edge. The stem grows from that
 * anchorage like a living shoot (not a snake). Slow S-curves, occupancy
 * weave, prune from the tip if the well is reached, then grow again.
 */
import { gene, tube, place } from "../grammar/motifs.js";
import { bloomOpen } from "../grammar/moppi-plant.js";
import { makeSkin, bright, dark, withAlpha } from "../palette.js";
import { inWell, wellRect } from "../well.js";

const SKINS = [
  makeSkin({ stemDeep: dark.chrysolyte, stem: dark.emerald, stemFine: dark.chrysoprasus, leaf: bright.emerald, leaf2: bright.chrysoprasus, berry: dark.sardius, flower: bright.pearl, rim: bright.amber, hip: dark.crimson }),
  makeSkin({ stemDeep: dark.emerald, stem: dark.chrysoprasus, stemFine: dark.beryl, leaf: bright.chrysolyte, leaf2: bright.chrysoprasus, berry: bright.sardius, flower: bright.ruby, rim: bright.topaz, hip: dark.scarlet }),
  makeSkin({ stemDeep: dark.topaz, stem: dark.amber, stemFine: dark.chrysolyte, leaf: bright.topaz, leaf2: bright.ligure, berry: bright.sardonyx, flower: bright.carbuncle, rim: bright.amber, hip: dark.vermilion }),
  makeSkin({ stemDeep: dark.beryl, stem: dark.crystal, stemFine: dark.chalcedony, leaf: bright.beryl, leaf2: bright.chalcedony, berry: bright.jacinth, flower: bright.agate, rim: bright.crystal, hip: dark.amethyst }),
  makeSkin({ stemDeep: dark.vermilion, stem: dark.amber, stemFine: dark.topaz, leaf: bright.amber, leaf2: bright.ligure, berry: dark.crimson, flower: bright.ruby, rim: bright.topaz, hip: dark.sardius }),
  makeSkin({ stemDeep: dark.purple, stem: dark.amethyst, stemFine: dark.scarlet, leaf: bright.amethyst, leaf2: bright.jacinth, berry: bright.ruby, flower: bright.pearl, rim: bright.amethyst, hip: dark.jacinth }),
  makeSkin({ stemDeep: dark.chalcedony, stem: dark.sapphire, stemFine: dark.crystal, leaf: bright.sapphire, leaf2: bright.agate, berry: bright.carbuncle, flower: bright.jasper, rim: bright.chalcedony, hip: dark.sardius }),
  makeSkin({ stemDeep: dark.chrysoprasus, stem: dark.emerald, stemFine: dark.beryl, leaf: bright.chrysoprasus, leaf2: bright.emerald, berry: bright.sardius, flower: bright.topaz, rim: bright.amber, hip: dark.vermilion }),
  makeSkin({ stemDeep: dark.scarlet, stem: dark.crimson, stemFine: dark.sardius, leaf: bright.sardonyx, leaf2: bright.carbuncle, berry: bright.sardius, flower: bright.ruby, rim: bright.ligure, hip: dark.sardius }),
  makeSkin({ stemDeep: dark.sapphire, stem: dark.jacinth, stemFine: dark.purple, leaf: bright.agate, leaf2: bright.sapphire, berry: bright.jacinth, flower: bright.amethyst, rim: bright.crystal, hip: dark.purple })
];

const FORMS = {
  plantain: { leaf: "ribbed", pair: "basal", tip: "spike", leafA: 1.2, leafS: 1.35 },
  mint: { leaf: "toothed", pair: "opposite", tip: "spike", leafA: 1.05, leafS: 1.2 },
  figwort: { leaf: "oval", pair: "opposite", tip: "flower5", leafA: 0.95, leafS: 1.3 },
  bellflower: { leaf: "oval", pair: "alternate", tip: "bell", leafA: 0.85, leafS: 1.25 },
  umbel: { leaf: "lance", pair: "alternate", tip: "umbel", leafA: 0.9, leafS: 1.2 },
  primrose: { leaf: "ribbed", pair: "basal", tip: "umbel", leafA: 1.15, leafS: 1.3 },
  cinquefoil: { leaf: "palmate", pair: "alternate", tip: "flower5", leafA: 0.7, leafS: 1.35 },
  agrimony: { leaf: "pinnate", pair: "alternate", tip: "spike", leafA: 0.0, leafS: 1.25 },
  violet: { leaf: "cordate", pair: "basal", tip: "flower5", leafA: 0.9, leafS: 1.3 },
  fern: { leaf: "lance", pair: "pinnate", tip: "sprig", leafA: 1.2, leafS: 1.25 },
  catkin: { leaf: "oval", pair: "alternate", tip: "catkin", leafA: 0.85, leafS: 1.25 },
  borage: { leaf: "toothed", pair: "alternate", tip: "flower5", leafA: 0.8, leafS: 1.2 },
  thistle: { leaf: "toothed", pair: "alternate", tip: "bloom", leafA: 0.85, leafS: 1.3 },
  rose: { leaf: "oval", pair: "alternate", tip: "bloom", leafA: 0.8, leafS: 1.25 },
  ivy: { leaf: "lobed", pair: "alternate", tip: "berries", leafA: 0.75, leafS: 1.35 },
  lily: { leaf: "oval", pair: "opposite", tip: "bloom", leafA: 0.95, leafS: 1.35 }
};

const VINE_COUNT = 24;
const STEP = 10;
const MAX_SEG = 90;

function palmette(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 0.11 + x * 0.01) * 0.04);
  ctx.strokeStyle = withAlpha(dark.chrysolyte, 0.14);
  ctx.fillStyle = withAlpha(dark.sardius, 0.06);
  ctx.lineWidth = 0.8;
  for (let i = -2; i <= 2; i++) {
    const a = i * 0.38 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(a) * s * 0.4, Math.sin(a) * s * 0.4 - s * 0.1, Math.cos(a) * s, Math.sin(a) * s);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, s * 0.12, s * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function Occupancy(w, h, cell = 16) {
  this.cell = cell;
  this.cols = Math.ceil(w / cell);
  this.rows = Math.ceil(h / cell);
  this.g = new Int16Array(this.cols * this.rows);
}

Occupancy.prototype.i = function (x, y) {
  const c = Math.floor(x / this.cell);
  const r = Math.floor(y / this.cell);
  if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return -2;
  return r * this.cols + c;
};

Occupancy.prototype.free = function (x, y, id) {
  const i = this.i(x, y);
  if (i === -2) return false;
  const v = this.g[i];
  return v === 0 || v === id;
};

Occupancy.prototype.claim = function (x, y, id) {
  const i = this.i(x, y);
  if (i >= 0 && this.g[i] === 0) this.g[i] = id;
};

export class Scene0 {
  constructor(ctx) {
    this.ctx = ctx;
    this.t0 = performance.now();
    this.time = 0;
    this.occ = null;
    this.W = 0;
    this.H = 0;
    this.vines = [];
    this.gen = 0;
    this.growBank = 0;
  }

  render(params, w, h) {
    const motion = params.motion ?? 0.32;
    this.time = (performance.now() - this.t0) / 1000;
    this.W = w;
    this.H = h;
    this.knotGarden(w, h);
    this.damask(w, h);
    this.edgeFoliage(w, h, motion);
    if (this.vines.length && !this.vines[0].anchored) this.vines = [];
    this.tickVines(params, motion);
    this.paintVines();
  }

  spawn(k) {
    const kinds = Object.keys(FORMS);
    const w = this.W, h = this.H;
    const edge = k % 4;
    const t = 0.08 + gene(k + 3, 2) * 0.84;
    let x, y, a;
    if (edge === 0) { x = 0; y = t * h; a = 0; }
    else if (edge === 1) { x = w; y = t * h; a = Math.PI; }
    else if (edge === 2) { x = t * w; y = h; a = -Math.PI / 2; }
    else { x = t * w; y = 0; a = Math.PI / 2; }
    a += (gene(k, 3) - 0.5) * 0.18;
    const id = 40 + k * 17;
    return {
      id,
      anchored: true,
      ox: x, oy: y, originA: a,
      heading: a,
      kind: kinds[k % kinds.length],
      skin: k % SKINS.length,
      bend: (gene(id, 4) - 0.5) * 0.16,
      path: [{ x, y, a }],
      cutting: false,
      minSeg: 40 + Math.floor(gene(id, 6) * 28),
      delay: gene(id, 8) * 3.2
    };
  }

  tickVines(params, motion) {
    if (this.vines.length === 0) {
      for (let k = 0; k < VINE_COUNT; k++) this.vines.push(this.spawn(k));
    }
    this.occ = new Occupancy(this.W, this.H, 18);
    for (const v of this.vines) {
      for (const p of v.path) this.occ.claim(p.x, p.y, v.id);
    }
    const well = wellRect(this.W, this.H);
    const wx = well.x + well.w * 0.5, wy = well.y + well.h * 0.5;
    // 25% slower than one segment per frame.
    this.growBank += 0.75 * (0.55 + motion * 0.5);
    const steps = Math.floor(this.growBank);
    this.growBank -= steps;

    for (let s = 0; s < steps; s++) {
      for (const v of this.vines) {
        if (this.time < v.delay) continue;
        if (v.cutting) {
          if (v.path.length > 6) v.path.pop();
          else v.cutting = false;
          continue;
        }
        if (v.path.length >= MAX_SEG) {
          v.cutting = true;
          continue;
        }
        const head = v.path[v.path.length - 1];
        const next = this.steer(v, head, wx, wy);
        if (!next) {
          v.heading += v.bend * 0.4;
          continue;
        }
        v.heading = next.a;
        v.path.push({ x: next.x, y: next.y, a: next.a });
        this.occ.claim(next.x, next.y, v.id);
        if (v.path.length > v.minSeg && inWell(next.x, next.y, this.W, this.H, 8)) {
          v.cutting = true;
        }
      }
    }
  }

  steer(v, head, wx, wy) {
    const len = v.path.length;
    const wind = Math.sin(this.time * 0.28 + v.id * 0.19) * 0.14;
    const curl = v.bend + wind;
    const wellA = Math.atan2(wy - head.y, wx - head.x);
    const ready = len > v.minSeg;
    const tries = [curl, curl + 0.18, curl - 0.18, 0.4, -0.4, 0.7, -0.7];
    let best = null, bestScore = -1e9;
    for (const d of tries) {
      const a = v.heading + d;
      const nx = head.x + Math.cos(a) * STEP;
      const ny = head.y + Math.sin(a) * STEP;
      if (nx < 3 || ny < 3 || nx > this.W - 3 || ny > this.H - 3) continue;
      const back = Math.cos(a - v.originA);
      if (back < -0.15 && len < 12) continue;
      if (!ready && inWell(nx, ny, this.W, this.H, 16)) continue;
      if (!this.occ.free(nx, ny, v.id)) continue;
      let score = 8 - Math.abs(d) * 3.2;
      score += back * 1.6;
      if (ready) score += Math.cos(a - wellA) * 1.4;
      bestScore = score > bestScore ? (best = { x: nx, y: ny, a }, score) : bestScore;
    }
    return best;
  }

  paintVines() {
    const kinds = Object.keys(FORMS);
    for (const v of this.vines) {
      if (v.path.length < 2 || this.time < v.delay) continue;
      const skin = SKINS[v.skin % SKINS.length];
      const form = FORMS[v.kind] || FORMS.mint;
      const s = { id: v.id, form, skin, windT: this.time };
      const origin = v.path[0];
      place(this.ctx, gene(v.id, 60) > 0.5 ? "root" : "bulb", origin.x, origin.y, v.path[0].a + Math.PI, 16, 1, skin);
      if (form.pair === "basal") this.rosette(origin.x, origin.y, v.path[0].a, s);
      for (let i = 1; i < v.path.length; i++) {
        const a = v.path[i - 1], b = v.path[i];
        const thick = Math.max(0.9, 4.6 - i * 0.018);
        tube(this.ctx, a.x, a.y, b.x, b.y, thick, Math.max(1, 5 - i * 0.02), skin);
        if (i % 3 === 0) this.leaves(a.x, a.y, b.x, b.y, b.a, i, 0.85, s);
      }
      const tip = v.path[v.path.length - 1];
      if (!v.cutting && v.path.length > 12) {
        const open = bloomOpen(Math.min(6, v.path.length / 18), 2.2, 0.7);
        if (open > 0.15) place(this.ctx, form.tip, tip.x, tip.y, tip.a, 14 + open * 12, 1, skin);
      }
    }
  }

  rosette(x, y, angle, s) {
    const n = 5 + Math.floor(gene(s.id, 11) * 4);
    for (let i = 0; i < n; i++) {
      const a = angle + (i - (n - 1) / 2) * 0.55 + (gene(s.id + i, 12) - 0.5) * 0.25;
      const sz = 26 + gene(s.id + i, 13) * 24;
      place(this.ctx, s.form.leaf, x, y, a, sz, 1, s.skin);
    }
  }

  leafAt(x0, y0, x1, y1, ang, side, n, salt, grow, s) {
    const t = 0.22 + gene(s.id + n, salt) * 0.5;
    const px = x0 + (x1 - x0) * t;
    const py = y0 + (y1 - y0) * t;
    const sz = (22 + gene(s.id + n, salt + 1) * 22) * Math.max(0.4, grow) * s.form.leafS;
    const attach = 0.95 + gene(s.id + n, salt + 2) * 0.4;
    place(this.ctx, s.form.leaf, px, py, ang + side * attach, sz, 1, s.skin);
  }

  leaves(x0, y0, x1, y1, ang, n, grow, s) {
    const f = s.form;
    if (f.pair === "pinnate") {
      place(this.ctx, "lance", (x0 + x1) / 2, (y0 + y1) / 2, ang + 1.15, 18 * grow * f.leafS, 1, s.skin);
      place(this.ctx, "lance", (x0 + x1) / 2, (y0 + y1) / 2, ang - 1.15, 18 * grow * f.leafS, 1, s.skin);
      return;
    }
    this.leafAt(x0, y0, x1, y1, ang, 1, n, 22, grow, s);
    this.leafAt(x0, y0, x1, y1, ang, -1, n, 24, grow, s);
  }

  edgeFoliage(w, h, motion) {
    const sway = Math.sin(this.time * 0.14) * 0.05 * (0.4 + motion);
    const kinds = ["ribbed", "toothed", "cordate", "palmate", "lance", "lobed", "oval"];
    const extras = ["root", "bulb", "sprig"];
    const placeEdge = (x, y, inward, i) => {
      const skin = SKINS[i % SKINS.length];
      const leaf = kinds[(i + Math.floor(gene(i, 30) * 5)) % kinds.length];
      const extra = extras[i % extras.length];
      const sz = 24 + gene(i, 31) * 22;
      if (gene(i, 32) > 0.2) place(this.ctx, extra, x, y, inward + sway, 16 + gene(i, 33) * 14, 1, skin);
      place(this.ctx, leaf, x + Math.cos(inward) * 16, y + Math.sin(inward) * 16, inward + sway + (gene(i, 34) - 0.5) * 0.4, sz, 1, skin);
    };
    let i = 0;
    for (let y = 10; y < h - 8; ) {
      placeEdge(8, y, 0, i++);
      placeEdge(w - 8, y, Math.PI, i++);
      y += 28 + gene(i, 37) * 36;
    }
    for (let x = 10; x < w - 8; ) {
      placeEdge(x, 8, Math.PI / 2, i++);
      placeEdge(x, h - 8, -Math.PI / 2, i++);
      x += 30 + gene(i, 38) * 38;
    }
  }

  knotGarden(w, h) {
    const ctx = this.ctx;
    const step = 160;
    ctx.strokeStyle = withAlpha(dark.chrysolyte, 0.22);
    ctx.lineWidth = 1.4;
    for (let y = 20; y < h; y += step) {
      for (let x = 20; x < w; x += step) {
        if (inWell(x + step * 0.5, y + step * 0.5, w, h, 8)) continue;
        ctx.strokeRect(x + 8, y + 8, step - 16, step - 16);
        ctx.strokeRect(x + 18, y + 18, step - 36, step - 36);
      }
    }
  }

  damask(w, h) {
    const ctx = this.ctx;
    const step = 96;
    const drift = Math.sin(this.time * 0.12) * 10;
    for (let row = 0, y = -20; y < h + 40; y += step, row++) {
      const ox = (row % 2) * (step * 0.5) + drift;
      for (let x = -40; x < w + 40; x += step) {
        palmette(ctx, x + ox, y + Math.cos(this.time * 0.09 + x * 0.004) * 5, 26, this.time);
      }
    }
  }
}
