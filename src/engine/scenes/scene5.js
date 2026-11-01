// @ts-nocheck
/**
 * Scene 5 — Lathe / oak chamber. Same isoRoom camera as scene 3.
 *
 * The walls, floor, ceiling and furniture faces are the reference plates
 * (damask, arched palmette, strap rosette, court-cupboard, friezes, gothic
 * arcade, pierced crest), remapped onto the gemstone palette and abutted
 * so the only unornamented region is the centre well.
 *
 * Turning is structural: cup-and-cover, tester-post and baluster profiles
 * rotate, and a gouge walks one member of each piece. params.motion scales
 * that speed.
 *
 * Dancers: Elizabethan / Jacobean longways set, Ultima-Online paperdoll
 * drawing. A quiet in-place measure while no OSC arrives; a travelling
 * pavane with a galliard hop once messages do.
 *
 * The six-fold star plate in the reference set is not used. A geometric
 * inlay, where one is needed, is three circles and an octagon.
 */
import { bright, dark, withAlpha } from "../palette.js";
import { inWell, wellRect } from "../well.js";
import { clipFloor, DANCER_PX, isoAt, isoBeams, isoBox, isoRoom, seatOnFloor } from "../iso.js";

const COS = Math.sqrt(3) / 2;
const SIN = 0.5;

const RAMP = [
  dark.amber,
  dark.sardius,
  dark.vermilion,
  dark.crimson,
  dark.scarlet,
  bright.sardius,
  bright.sardonyx,
  bright.ruby,
  bright.ligure,
  bright.amber,
  bright.topaz,
  bright.pearl,
  bright.jasper
].map((hex) => {
  const [r, g, b] = hexToRgb(hex);
  return { r, g, b, hex };
});

const DARK_GEMS = Object.values(dark).map((hex) => {
  const [r, g, b] = hexToRgb(hex);
  return { r, g, b, hex, lum: 0.299 * r + 0.587 * g + 0.114 * b };
});

const PLATES = [
  { name: "damask", src: "/scene5/damask.png" },
  { name: "plant", src: "/scene5/panel-plant.png" },
  { name: "strap", src: "/scene5/strap-rosette.png" },
  { name: "crest", src: "/scene5/crest.png", knock: true },
  { name: "cupboard", src: "/scene5/cupboard.png" },
  { name: "friezeA", src: "/scene5/frieze-a.png" },
  { name: "friezeB", src: "/scene5/frieze-b.png" },
  { name: "arcade", src: "/scene5/arcade.png" }
];

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function fromRamp(lum) {
  const u = Math.pow(Math.max(0, Math.min(1, lum / 255)), 1.55);
  const i = Math.round(u * (RAMP.length - 1));
  return RAMP[Math.min(RAMP.length - 1, i)];
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

function remapPlate(img, knock) {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const image = g.getImageData(0, 0, c.width, c.height);
  const d = image.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) continue;
    let r = d[i];
    let gv = d[i + 1];
    let b = d[i + 2];
    const max = Math.max(r, gv, b);
    const min = Math.min(r, gv, b);
    const lum = 0.299 * r + 0.587 * gv + 0.114 * b;
    if (knock && lum > 176 && max - min < 30) {
      d[i + 3] = 0;
      continue;
    }
    const gem = fromRamp(lum);
    d[i] = gem.r;
    d[i + 1] = gem.g;
    d[i + 2] = gem.b;
  }
  g.putImageData(image, 0, 0);
  return c;
}

function sampleWell(canvas) {
  const g = canvas.getContext("2d", { willReadFrequently: true });
  const { data, width, height } = g.getImageData(0, 0, canvas.width, canvas.height);
  const counts = new Map();
  const step = 5;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 200) continue;
      const r = data[i];
      const gv = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * gv + 0.114 * b;
      if (lum > 120) continue;
      let best = DARK_GEMS[0];
      let bestD = 1e12;
      for (const c of DARK_GEMS) {
        const dr = r - c.r;
        const dg = gv - c.g;
        const db = b - c.b;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestD) { bestD = dist; best = c; }
      }
      counts.set(best.hex, (counts.get(best.hex) || 0) + 1);
    }
  }
  if (counts.size === 0) return dark.vermilion;
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, 3).map(([hex]) => DARK_GEMS.find((c) => c.hex === hex));
  top.sort((a, b) => a.lum - b.lum);
  return top[0].hex;
}

function gauss(t, c, w) {
  const u = (t - c) / w;
  return Math.exp(-(u * u));
}

/** Jacobean cup-and-cover: melon bulb, collar, lesser bulb. t = 0 at the foot. */
function cupAndCover(t, rot) {
  const rings = [
    [0.05, 0.028, 0.16],
    [0.14, 0.03, 0.12],
    [0.28, 0.045, 0.1],
    [0.46, 0.09, 0.36],
    [0.62, 0.028, 0.11],
    [0.74, 0.06, 0.22],
    [0.88, 0.035, 0.13]
  ];
  let r = 0.09;
  for (const [c, w, a] of rings) r += a * gauss(t, c, w);
  const melon = gauss(t, 0.46, 0.09);
  r += melon * 0.035 * Math.cos(8 * rot);
  return r;
}

/** Tester post: stacked vase, ring and bulb, slimmer than the cupboard stile. */
function bedPost(t, rot) {
  const rings = [
    [0.04, 0.025, 0.15],
    [0.16, 0.05, 0.24],
    [0.28, 0.022, 0.1],
    [0.40, 0.055, 0.2],
    [0.52, 0.02, 0.08],
    [0.64, 0.04, 0.14],
    [0.78, 0.03, 0.11],
    [0.92, 0.035, 0.16]
  ];
  let r = 0.08;
  for (const [c, w, a] of rings) r += a * gauss(t, c, w);
  r += gauss(t, 0.16, 0.05) * 0.028 * Math.cos(8 * rot + 0.4);
  return r;
}

/** Table baluster: foot, slim ankle, vase, ring under the apron. */
function baluster(t, rot) {
  const rings = [
    [0.06, 0.04, 0.2],
    [0.22, 0.06, 0.08],
    [0.48, 0.1, 0.26],
    [0.7, 0.04, 0.1],
    [0.88, 0.06, 0.18]
  ];
  let r = 0.07;
  for (const [c, w, a] of rings) r += a * gauss(t, c, w);
  r += gauss(t, 0.48, 0.1) * 0.03 * Math.cos(8 * rot);
  return r;
}

function drawCover(ctx, img, x, y, w, h) {
  const ia = img.width / img.height;
  const ba = w / Math.max(1, h);
  let dw;
  let dh;
  let dx;
  let dy;
  if (ia > ba) {
    dh = h;
    dw = h * ia;
    dx = x - (dw - w) / 2;
    dy = y;
  } else {
    dw = w;
    dh = w / ia;
    dx = x;
    dy = y - (dh - h) / 2;
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function putImage(ctx, img, a, b, c, d, e, f) {
  ctx.save();
  ctx.setTransform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

function drawWallY(ctx, ox, oy, x0, x1, y, z0, z1, img) {
  const dx = x1 - x0;
  const dz = z1 - z0;
  putImage(
    ctx, img,
    (dx * COS) / img.width,
    (dx * SIN) / img.width,
    0,
    dz / img.height,
    ox + (x0 - y) * COS,
    oy + (x0 + y) * SIN - z1
  );
}

function drawWallX(ctx, ox, oy, x, y0, y1, z0, z1, img) {
  const dy = y1 - y0;
  const dz = z1 - z0;
  putImage(
    ctx, img,
    -(dy * COS) / img.width,
    (dy * SIN) / img.width,
    0,
    dz / img.height,
    ox + (x - y0) * COS,
    oy + (x + y0) * SIN - z1
  );
}

function drawFloor(ctx, ox, oy, x0, y0, x1, y1, z, img) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  putImage(
    ctx, img,
    (dx * COS) / img.width,
    (dx * SIN) / img.width,
    -(dy * COS) / img.height,
    (dy * SIN) / img.height,
    ox + (x0 - y0) * COS,
    oy + (x0 + y0) * SIN - z
  );
}

function tileCount(span, img, edge) {
  const want = edge * (img.width / img.height);
  const n = Math.max(1, Math.round(span / Math.max(8, want)));
  return { n, step: span / n };
}

function strokeWallY(ctx, ox, oy, x0, x1, y, z0, z1) {
  ctx.beginPath();
  const a = isoAt(ox, oy, x0, y, z1);
  const b = isoAt(ox, oy, x1, y, z1);
  const c = isoAt(ox, oy, x1, y, z0);
  const d = isoAt(ox, oy, x0, y, z0);
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(d.x, d.y);
  ctx.closePath();
  ctx.stroke();
}

function strokeWallX(ctx, ox, oy, x, y0, y1, z0, z1) {
  ctx.beginPath();
  const a = isoAt(ox, oy, x, y0, z1);
  const b = isoAt(ox, oy, x, y1, z1);
  const c = isoAt(ox, oy, x, y1, z0);
  const d = isoAt(ox, oy, x, y0, z0);
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(d.x, d.y);
  ctx.closePath();
  ctx.stroke();
}

function drawTurning(ctx, ox, oy, x, y, z0, z1, profile, rot, girth, w, h) {
  const steps = 28;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const z = z0 + (z1 - z0) * t;
    const radius = Math.max(3.5, profile(t, rot) * girth);
    const c = isoAt(ox, oy, x, y, z);
    if (inWell(c.x, c.y, w, h, 0)) continue;
    const rx = radius * 1.05;
    const ry = Math.max(2.4, radius * 0.48);
    ctx.fillStyle = i % 2 === 0 ? bright.sardius : dark.amber;
    ctx.beginPath();
    ctx.ellipse(c.x - 1, c.y - 0.6, rx * 0.9, ry * 0.86, -0.42, 0, Math.PI * 2);
    ctx.fill();
    if (i % 3 === 0) {
      ctx.strokeStyle = bright.amber;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    ctx.strokeStyle = withAlpha(bright.ligure, 0.95);
    ctx.lineWidth = Math.max(1.2, radius * 0.08);
    const a0 = rot + t * 5;
    ctx.beginPath();
    ctx.ellipse(c.x - 1, c.y - 0.6, rx * 0.62, ry * 0.62, -0.42, a0, a0 + 1.05);
    ctx.stroke();
  }
}

function drawGouge(ctx, ox, oy, x, y, z0, z1, profile, girth, t, w, h) {
  const z = z0 + (z1 - z0) * t;
  const radius = profile(t, 0) * girth;
  const c = isoAt(ox, oy, x, y, z);
  const edgeX = c.x + radius * 0.92;
  const edgeY = c.y;
  if (inWell(edgeX, edgeY, w, h, 4)) return;
  const s = Math.max(1, girth / 36);
  ctx.fillStyle = bright.topaz;
  ctx.beginPath();
  ctx.moveTo(edgeX - 2 * s, edgeY - 6 * s);
  ctx.lineTo(edgeX + 13 * s, edgeY);
  ctx.lineTo(edgeX - 2 * s, edgeY + 6 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = dark.amber;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.strokeStyle = bright.pearl;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(edgeX - 8 * s, edgeY - 10 * s, 8 * s, 0.15, 2.5);
  ctx.stroke();
  ctx.strokeStyle = withAlpha(bright.ligure, 0.85);
  ctx.beginPath();
  ctx.arc(edgeX - 14 * s, edgeY - 16 * s, 5 * s, 0.4, 2.6);
  ctx.stroke();
}

/** Three concentric circles and one octagon. No star, no vesica. */
function circlesAndOctagon(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = bright.amber;
  ctx.lineWidth = 1.5;
  for (const k of [1, 0.7, 0.42]) {
    ctx.beginPath();
    ctx.ellipse(0, 0, r * k, r * k * 0.62, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = bright.topaz;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
    const px = Math.cos(a) * r * 0.78;
    const py = Math.sin(a) * r * 0.48;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/**
 * One bar of a measure, fast enough to read without an OSC cue.
 * Idle: reverence, branle, and a small galliard hop, with a short travel.
 * Live: a wider pavane and a higher hop.
 */
function measureOf(t, idle) {
  const bar = ((t % 8) + 8) % 8;
  let bow = 0;
  let step = 0;
  let hop = 0;
  let arm = 0.15;
  const reach = idle ? 16 : 22;
  if (bar < 1.15) {
    bow = Math.sin((bar / 1.15) * Math.PI) * (idle ? 0.7 : 0.95);
    arm = -0.35;
  } else if (bar < 3.1) {
    const k = (bar - 1.15) / 1.95;
    step = Math.sin(k * Math.PI) * reach;
    arm = 0.25 + Math.sin(k * Math.PI) * 0.45;
  } else if (bar < 5.15) {
    const k = (bar - 3.1) / 2.05;
    step = -Math.sin(k * Math.PI) * reach;
    arm = 0.25 + Math.sin(k * Math.PI) * 0.45;
  } else if (bar < 7) {
    const k = (bar - 5.15) / 1.85;
    step = Math.sin(k * Math.PI * 2) * (idle ? 7 : 10);
    arm = 0.4;
  } else {
    hop = Math.sin(((bar - 7) / 1) * Math.PI) * (idle ? 7 : 11);
    arm = 0.85;
  }
  return { bow, step, hop, arm };
}

function block(ctx, x, y, w, h, fill, ink) {
  const X = Math.round(x);
  const Y = Math.round(y);
  ctx.fillStyle = ink;
  ctx.fillRect(X - 1, Y - 1, w + 2, h + 2);
  ctx.fillStyle = fill;
  ctx.fillRect(X, Y, w, h);
}

export class Scene5 {
  constructor(ctx) {
    this.ctx = ctx;
    this.time = 0;
    this.wellFill = dark.vermilion;
    this.plates = null;
    this.shell = null;
    this.loadPlates();
  }

  loadPlates() {
    Promise.all(PLATES.map((spec) => loadImage(spec.src).then((img) => ({ spec, img }))))
      .then((loaded) => {
        const plates = {};
        for (const { spec, img } of loaded) {
          plates[spec.name] = remapPlate(img, !!spec.knock);
        }
        this.plates = plates;
        this.shell = null;
        if (plates.damask) this.wellFill = sampleWell(plates.damask);
      })
      .catch(() => {
        this.plates = null;
      });
  }

  render(params, w, h) {
    const motion = params.motion ?? 0.32;
    this.time += 0.016 * (0.42 + motion);
    const live = performance.now() - (params.oscAt || 0) < 2800;
    const rot = this.time * (0.42 + motion * 0.85);
    const gouge = (this.time * (0.18 + motion * 0.22)) % 1;
    const cam = isoRoom(w, h);
    const ctx = this.ctx;

    ctx.save();
    try {
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      if (this.plates) {
        this.blitShell(cam, w, h);
        this.clipWell(w, h);
        this.bed(cam, w, h, rot, gouge, "turn");
        this.cupboard(cam, w, h, rot, (gouge + 0.33) % 1, "turn");
        this.table(cam, w, h, rot, (gouge + 0.66) % 1, "turn");
      } else {
        this.clipWell(w, h);
        this.fallback(cam, w, h);
        this.furniture(cam, w, h, rot, gouge);
      }
      this.dancers(cam, w, h, motion, live);
    } finally {
      ctx.restore();
    }
  }

  /**
   * Walls, floor, ceiling and the still furniture faces do not move.
   * Paint them once. Each frame only the turned members, gouges and
   * dancers are redrawn, or the preview stalls under the plate count.
   */
  blitShell(cam, w, h) {
    if (!(this.shell && this.shellW === w && this.shellH === h)) {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d", { alpha: false });
      const prev = this.ctx;
      this.ctx = g;
      g.save();
      try {
        this.clipWell(w, h);
        g.lineJoin = "round";
        g.lineCap = "round";
        this.chamber(cam, w, h);
        this.bed(cam, w, h, 0, 0, "shell");
        this.cupboard(cam, w, h, 0, 0, "shell");
      } finally {
        g.restore();
        this.ctx = prev;
      }
      this.shell = c;
      this.shellW = w;
      this.shellH = h;
    }
    this.ctx.drawImage(this.shell, 0, 0);
  }

  clipWell(w, h) {
    const ctx = this.ctx;
    const r = wellRect(w, h);
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    const x = r.x;
    const y = r.y;
    const rw = r.w;
    const rh = r.h;
    const cr = r.r;
    ctx.moveTo(x + cr, y);
    ctx.arcTo(x + rw, y, x + rw, y + rh, cr);
    ctx.arcTo(x + rw, y + rh, x, y + rh, cr);
    ctx.arcTo(x, y + rh, x, y, cr);
    ctx.arcTo(x, y, x + rw, y, cr);
    ctx.closePath();
    ctx.clip("evenodd");
  }

  plate(name) {
    return this.plates[name] || this.plates.damask;
  }

  /** Full-frame abutment of the plates, then the iso shell over it. */
  chamber(cam, w, h) {
    const ctx = this.ctx;
    const { ox, oy, room, wallH } = cam;
    const damask = ctx.createPattern(this.plate("damask"), "repeat");
    ctx.fillStyle = damask || dark.vermilion;
    ctx.fillRect(0, 0, w, h);

    const coffer = room / 4;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const key = (i + j) % 2 === 0 ? "friezeA" : "friezeB";
        drawFloor(ctx, ox, oy, i * coffer, j * coffer, (i + 1) * coffer, (j + 1) * coffer, wallH, this.plate(key));
      }
    }
    isoBeams(ctx, cam, withAlpha(bright.amber, 0.55));

    this.wallY(cam, 0);
    this.wallX(cam, 0);
    this.floor(cam);
    this.cornice(w);
  }

  /** Full-width carved frieze so the top edge is plate, not empty ground. */
  cornice(w) {
    const ctx = this.ctx;
    const band = 92;
    const half = w / 2;
    drawCover(ctx, this.plate("friezeA"), 0, 0, half + 1, band);
    drawCover(ctx, this.plate("friezeB"), half - 1, 0, half + 1, band);
    ctx.strokeStyle = bright.amber;
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, w - 6, band - 6);
  }

  wallY(cam, y) {
    const ctx = this.ctx;
    const { ox, oy, room, wallH } = cam;
    const bands = [
      { z0: 0, z1: 118, key: "strap" },
      { z0: 118, z1: 318, key: "plant" },
      { z0: 318, z1: 404, key: "friezeA" },
      { z0: 404, z1: wallH, key: "arcade" }
    ];
    ctx.strokeStyle = bright.amber;
    ctx.lineWidth = 1.6;
    for (const band of bands) {
      const img0 = this.plate(band.key);
      const { n, step } = tileCount(room, img0, band.z1 - band.z0);
      for (let i = 0; i < n; i++) {
        const alt = band.key === "plant" && i % 2 === 1;
        const frieze = band.key === "friezeA" && i % 2 === 1;
        const img = alt ? this.plate("cupboard") : frieze ? this.plate("friezeB") : img0;
        const x0 = i * step;
        const x1 = (i + 1) * step;
        drawWallY(ctx, ox, oy, x0, x1, y, band.z0, band.z1, img);
        strokeWallY(ctx, ox, oy, x0, x1, y, band.z0, band.z1);
      }
    }
  }

  wallX(cam, x) {
    const ctx = this.ctx;
    const { ox, oy, room, wallH } = cam;
    const bands = [
      { z0: 0, z1: 118, key: "strap" },
      { z0: 118, z1: 318, key: "cupboard" },
      { z0: 318, z1: 404, key: "friezeB" },
      { z0: 404, z1: wallH, key: "arcade" }
    ];
    ctx.strokeStyle = bright.ligure;
    ctx.lineWidth = 1.6;
    for (const band of bands) {
      const img0 = this.plate(band.key);
      const { n, step } = tileCount(room, img0, band.z1 - band.z0);
      for (let i = 0; i < n; i++) {
        const alt = band.key === "cupboard" && i % 2 === 1;
        const img = alt ? this.plate("plant") : img0;
        const y0 = i * step;
        const y1 = (i + 1) * step;
        drawWallX(ctx, ox, oy, x, y0, y1, band.z0, band.z1, img);
        strokeWallX(ctx, ox, oy, x, y0, y1, band.z0, band.z1);
      }
    }
  }

  floor(cam) {
    const ctx = this.ctx;
    const { ox, oy, room } = cam;
    const n = 4;
    const step = room / n;
    ctx.strokeStyle = withAlpha(bright.amber, 0.85);
    ctx.lineWidth = 1.4;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const key = (i + j) % 2 === 0 ? "damask" : "strap";
        const x0 = i * step;
        const y0 = j * step;
        drawFloor(ctx, ox, oy, x0, y0, x0 + step, y0 + step, 0, this.plate(key));
        ctx.beginPath();
        const a = isoAt(ox, oy, x0, y0, 0);
        const b = isoAt(ox, oy, x0 + step, y0, 0);
        const c = isoAt(ox, oy, x0 + step, y0 + step, 0);
        const d = isoAt(ox, oy, x0, y0 + step, 0);
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(d.x, d.y);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  furniture(cam, w, h, rot, gouge) {
    this.bed(cam, w, h, rot, gouge);
    this.cupboard(cam, w, h, rot, (gouge + 0.33) % 1);
    this.table(cam, w, h, rot, (gouge + 0.66) % 1);
  }

  bed(cam, w, h, rot, gouge, part = "all") {
    const ctx = this.ctx;
    const { ox, oy } = cam;
    const x = 22;
    const y = 620;
    const dx = 108;
    const dy = 360;
    const posts = [
      [x, y],
      [x + dx, y],
      [x, y + dy],
      [x + dx, y + dy]
    ];
    if (part !== "turn" && this.plates) {
      isoBox(ctx, ox, oy, x + 8, y + 16, 52, dx - 16, dy - 28, 26,
        withAlpha(dark.crimson, 0.2),
        withAlpha(dark.vermilion, 0.35),
        withAlpha(dark.amber, 0.3),
        bright.amber);
      drawFloor(ctx, ox, oy, x + 8, y + 16, x + dx - 8, y + dy - 12, 78, this.plate("damask"));
      drawWallY(ctx, ox, oy, x, x + dx, y, 78, 300, this.plate("crest"));
      drawFloor(ctx, ox, oy, x - 6, y - 4, x + dx + 6, y + dy + 4, 328, this.plate("damask"));
      isoBox(ctx, ox, oy, x - 6, y - 4, 312, dx + 12, dy + 8, 18,
        withAlpha(dark.amber, 0.25),
        withAlpha(dark.vermilion, 0.45),
        withAlpha(dark.sardius, 0.4),
        bright.ligure);
    }
    if (part === "shell") return;
    posts.forEach((p, i) => {
      drawTurning(ctx, ox, oy, p[0], p[1], 0, 324, bedPost, rot * (i % 2 ? 1 : -1) + i, 72, w, h);
    });
    drawGouge(ctx, ox, oy, posts[1][0], posts[1][1], 0, 324, bedPost, 72, gouge, w, h);
  }

  cupboard(cam, w, h, rot, gouge, part = "all") {
    const ctx = this.ctx;
    const { ox, oy } = cam;
    const x = 760;
    const y = 70;
    const dx = 210;
    const dy = 140;
    if (part !== "turn" && this.plates) {
      isoBox(ctx, ox, oy, x + 16, y + 10, 18, dx - 28, dy - 18, 112,
        withAlpha(dark.amber, 0.3),
        withAlpha(dark.vermilion, 0.55),
        withAlpha(dark.sardius, 0.45),
        bright.amber);
      drawWallY(ctx, ox, oy, x + 18, x + dx - 14, y + dy - 8, 24, 124, this.plate("friezeA"));
      drawWallX(ctx, ox, oy, x + dx - 14, y + 12, y + dy - 8, 24, 124, this.plate("plant"));
      isoBox(ctx, ox, oy, x + 16, y + 10, 168, dx - 28, dy - 18, 96,
        withAlpha(dark.vermilion, 0.35),
        withAlpha(dark.amber, 0.5),
        withAlpha(dark.crimson, 0.4),
        bright.ligure);
      drawWallY(ctx, ox, oy, x + 18, x + dx - 14, y + dy - 8, 174, 258, this.plate("friezeB"));
      drawWallX(ctx, ox, oy, x + dx - 14, y + 12, y + dy - 8, 174, 258, this.plate("cupboard"));
      drawFloor(ctx, ox, oy, x + 8, y + 6, x + dx - 6, y + dy - 4, 276, this.plate("arcade"));
    }
    if (part === "shell") return;
    const posts = [
      [x, y],
      [x + dx, y],
      [x, y + dy],
      [x + dx, y + dy]
    ];
    posts.forEach((p, i) => {
      drawTurning(ctx, ox, oy, p[0], p[1], 0, 286, cupAndCover, -rot * (i % 2 ? 1 : -1) + i * 0.7, 86, w, h);
    });
    drawGouge(ctx, ox, oy, posts[2][0], posts[2][1], 0, 286, cupAndCover, 86, gouge, w, h);
  }

  table(cam, w, h, rot, gouge, part = "all") {
    if (part === "shell") return;
    const ctx = this.ctx;
    const { ox, oy } = cam;
    const x = 470;
    const y = 500;
    const dx = 230;
    const dy = 150;
    const legs = [
      [x, y],
      [x + dx, y],
      [x, y + dy],
      [x + dx, y + dy]
    ];
    legs.forEach((p, i) => {
      drawTurning(ctx, ox, oy, p[0], p[1], 0, 112, baluster, rot * (i % 2 ? -1 : 1) + i, 58, w, h);
    });
    if (this.plates) {
      isoBox(ctx, ox, oy, x - 16, y - 12, 112, dx + 32, dy + 24, 18,
        withAlpha(dark.amber, 0.35),
        withAlpha(dark.vermilion, 0.62),
        withAlpha(dark.topaz, 0.5),
        bright.amber);
      drawFloor(ctx, ox, oy, x - 16, y - 12, x + dx + 16, y + dy + 12, 130, this.plate("strap"));
      drawWallY(ctx, ox, oy, x - 14, x + dx + 14, y + dy + 10, 112, 130, this.plate("friezeB"));
      drawWallX(ctx, ox, oy, x + dx + 14, y - 10, y + dy + 10, 112, 130, this.plate("friezeA"));
    }
    const c = isoAt(ox, oy, x + dx / 2, y + dy / 2, 132);
    if (!inWell(c.x, c.y, w, h, 10)) circlesAndOctagon(ctx, c.x, c.y, 26);
    drawGouge(ctx, ox, oy, legs[0][0], legs[0][1], 0, 112, baluster, 58, gouge, w, h);
  }

  dancers(cam, w, h, motion, live) {
    const tempo = (live ? 4.4 : 3.6) * (0.9 + motion);
    const t = this.time * tempo;
    const scale = DANCER_PX / 56;
    const head = 36 * scale + 22;
    const foot = 24 * scale;
    const cast = [
      { gender: "male", phase: 0.0, face: 1 },
      { gender: "female", phase: 0.55, face: -1 },
      { gender: "male", phase: 1.15, face: 1 },
      { gender: "female", phase: 1.6, face: -1 },
      { gender: "male", phase: 0.35, face: 1 },
      { gender: "female", phase: 0.9, face: -1 },
      { gender: "male", phase: 1.8, face: 1 },
      { gender: "female", phase: 2.25, face: -1 }
    ];
    const ctx = this.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    clipFloor(ctx, cam);
    const left = cam.ox - 700;
    const right = cam.ox + 700;
    const well = wellRect(w, h);
    const order = cast
      .map((d, i) => ({ ...d, i }))
      .sort((a, b) => a.i - b.i);
    for (const d of order) {
      const pose = measureOf(t + d.phase, !live);
      const travel = Math.sin(t * 0.62 + d.i) * (live ? 36 : 26) + pose.step * d.face * 0.35;
      const u = d.i / (cast.length - 1);
      const seat = seatOnFloor(cam, h, left + (right - left) * u + travel, head, foot, well);
      const hop = pose.hop + Math.cos(t * 0.62 + d.i) * (live ? 8 : 5);
      if (inWell(seat.sx, seat.sy - hop, w, h, 8)) continue;
      this.drawDancer(seat.sx, seat.sy, d.gender, { ...pose, hop }, d.face, scale);
    }
    ctx.restore();
  }

  /**
   * Ultima-Online paperdoll: chunky outline, flat gem fills, no smoothing.
   * Male: flat cap, peascod, trunk hose, canions.
   * Female: french hood, bodice, wheel farthingale.
   */
  drawDancer(sx, sy, gender, pose, face, scale) {
    const ctx = this.ctx;
    const male = gender === "male";
    const ink = dark.amber;
    const skin = bright.ligure;
    const ruff = bright.pearl;
    const hose = male ? dark.sapphire : dark.chalcedony;
    const body = male ? dark.vermilion : dark.purple;
    const sleeve = male ? dark.sardius : dark.scarlet;
    const skirt = dark.amethyst;
    const hair = male ? dark.amber : dark.sardius;
    const hat = male ? dark.crimson : dark.sardius;
    const shoe = dark.sardius;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(sx, sy - pose.hop);
    ctx.rotate(pose.bow * 0.22 * (male ? 1 : 0.85));
    ctx.scale(scale, scale);

    ctx.fillStyle = withAlpha(dark.sardius, 0.4);
    ctx.beginPath();
    ctx.ellipse(0, 6, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const step = pose.step;
    if (male) {
      block(ctx, -7 + step * 0.72, 4, 5, 16, hose, ink);
      block(ctx, 2 - step * 0.72, 4, 5, 16, hose, ink);
      block(ctx, -9 + step * 0.9, 18, 8, 4, shoe, ink);
      block(ctx, 1 - step * 0.9, 18, 8, 4, shoe, ink);
      block(ctx, -10, -2, 20, 10, dark.sapphire, ink);
      ctx.fillStyle = withAlpha(bright.agate, 0.35);
      ctx.fillRect(-8, 0, 16, 2);
      block(ctx, -9, -16, 18, 16, body, ink);
      ctx.fillStyle = withAlpha(bright.amber, 0.55);
      ctx.fillRect(-2, -14, 4, 12);
    } else {
      ctx.fillStyle = skirt;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.4;
      const sway = step * 0.22;
      ctx.beginPath();
      ctx.moveTo(-8 + sway * 0.2, -2);
      ctx.lineTo(8 + sway * 0.2, -2);
      ctx.lineTo(16 + sway, 20);
      ctx.lineTo(-16 + sway, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = withAlpha(bright.ruby, 0.55);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 18);
      ctx.stroke();
      block(ctx, -7, -16, 14, 14, body, ink);
      ctx.fillStyle = bright.ruby;
      ctx.fillRect(-1, -10, 2, 2);
      ctx.fillStyle = bright.emerald;
      ctx.fillRect(-1, -6, 2, 2);
    }

    const arm = pose.arm * 6 * face;
    block(ctx, -16, -12, 7, 8, sleeve, ink);
    block(ctx, 9, -12, 7, 8, sleeve, ink);
    block(ctx, -18, -6, 4, 10 + arm * 0.15, skin, ink);
    block(ctx, 14 + arm * 0.2, -6, 4, 10, skin, ink);

    block(ctx, -12, -20, 24, 6, ruff, ink);
    ctx.fillStyle = withAlpha(ink, 0.45);
    for (let i = -3; i <= 3; i++) ctx.fillRect(i * 3, -19, 1, 4);

    block(ctx, -6, -30, 12, 12, skin, ink);
    ctx.fillStyle = hair;
    ctx.fillRect(-6, -31, 12, 4);
    if (male) {
      block(ctx, -8, -34, 16, 4, hat, ink);
      ctx.fillStyle = bright.amber;
      ctx.fillRect(4, -34, 3, 2);
    } else {
      block(ctx, -8, -33, 14, 4, bright.pearl, ink);
      block(ctx, 4, -34, 6, 8, hat, ink);
    }

    ctx.fillStyle = ink;
    ctx.fillRect(-4, -26, 2, 2);
    ctx.fillRect(2, -26, 2, 2);
    ctx.fillRect(-2, -22, 3, 1);

    ctx.restore();
    ctx.imageSmoothingEnabled = true;
  }

  /** Dense gem diaper until the plates have remapped. */
  fallback(cam, w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = dark.vermilion;
    ctx.fillRect(0, 0, w, h);
    const step = 46;
    for (let row = 0; row < 28; row++) {
      for (let col = 0; col < 46; col++) {
        const x = col * step + (row % 2) * 12;
        const y = row * step * 0.72;
        circlesAndOctagon(ctx, x, y, 16);
      }
    }
    const { ox, oy, room, wallH } = cam;
    ctx.strokeStyle = bright.amber;
    ctx.lineWidth = 2;
    strokeWallY(ctx, ox, oy, 0, room, 0, 0, wallH);
    strokeWallX(ctx, ox, oy, 0, 0, room, 0, wallH);
  }
}
