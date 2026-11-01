// @ts-nocheck
/**
 * Scene 6 — Firmament.
 * Isometric biblical cosmography: flat earth (rectangle / disk-map) under a
 * vaulted firmament, waters above, sun and moon travelling the vault.
 * 17th-century ornamental drafting style (woodcut / Cosmas / Beatus language)
 * remapped onto the gemstone palette only. Never a globe.
 *
 * Hierarchy: HISTORICAL ORNAMENT → DESIGN PRINCIPLES → ORNAMENTAL GRAMMARS
 * → PROCEDURAL MATH → DEMOSCENE TECHNIQUE → RENDERER.
 */
import { bright, dark, withAlpha } from "../palette.js";
import { inWell, wellRect } from "../well.js";

const COS = Math.sqrt(3) / 2;
const SIN = 0.5;

/** Seeded-ish hash for stable star positions */
function hash(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function iso(x, y, z = 0) {
  return { x: (x - y) * COS, y: (x + y) * SIN - z };
}

function isoAt(ox, oy, x, y, z = 0) {
  const p = iso(x, y, z);
  return { x: ox + p.x, y: oy + p.y };
}

function baconBits(text) {
  const bits = [];
  const s = text.toUpperCase().replace(/[^A-Z]/g, "");
  for (const ch of s) {
    let n = ch.charCodeAt(0) - 65;
    if (n < 0) continue;
    for (let k = 4; k >= 0; k--) bits.push((n >> k) & 1);
  }
  return bits;
}

const CIPHERS = [
  "Jesus is God",
  "Believe on the Lord Jesus Christ and thou shalt be saved",
  "Do not be deceived",
  "Satan himself is transformed into an angel of light"
];
const BITS = baconBits(CIPHERS.join(" "));

/** Fixed constellation seeds: relative brightness + position on the vault */
const STARS = (() => {
  const out = [];
  for (let i = 0; i < 96; i++) {
    const a = hash(i) * Math.PI; // 0..π along vault arc
    const elev = 0.15 + hash(i + 50) * 0.7;
    const brightN = 0.25 + hash(i + 90) * 0.75;
    const size = 1.2 + brightN * 3.4;
    out.push({ a, elev, brightN, size, phase: hash(i + 130) * Math.PI * 2 });
  }
  return out;
})();

export class Scene6 {
  constructor(ctx) {
    this.ctx = ctx;
    this.time = 0;
    this.wellFill = dark.sapphire;
    this.plates = null;
    this.loadPlates();
  }

  loadPlates() {
    const names = [
      { key: "genesis", src: "/scene6/genesis-section.jpg" },
      { key: "hebrew", src: "/scene6/hebrew-universe.jpg" },
      { key: "creation", src: "/scene6/creation-circle.jpg" },
      { key: "munster", src: "/scene6/munster-eden.png" }
    ];
    Promise.all(
      names.map(
        (n) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ key: n.key, img });
            img.onerror = () => resolve(null);
            img.src = n.src;
          })
      )
    ).then((loaded) => {
      this.plates = {};
      for (const item of loaded) {
        if (item) this.plates[item.key] = item.img;
      }
    });
  }

  render(params, w, h) {
    const motion = params.motion ?? 0.32;
    this.time += 0.007 * (0.45 + motion);
    const ctx = this.ctx;

    // faint bacon field first (never main figure)
    this.baconField(w, h);

    // isometric camera for the cosmography
    // world units roughly 0..400; iso projection maps them into the frame
    const cam = {
      ox: w * 0.5,
      // Floor sits lower so the vault fills the upper half around the well
      oy: h * 0.92,
      scale: 1
    };

    this.drawAbyssAndPillars(cam, w, h);
    this.drawEarthPlane(cam, w, h);
    this.drawOceanRim(cam, w, h);
    this.drawLandAndMountains(cam, w, h);
    this.drawFirmamentVault(cam, w, h, motion);
    this.drawWatersAbove(cam, w, h);
    this.drawStars(cam, w, h, motion);
    this.drawSunMoon(cam, w, h, motion);
    this.drawOrnamentFrame(w, h);
    this.drawLabels(cam, w, h);
  }

  baconField(w, h) {
    const ctx = this.ctx;
    const cols = 72;
    const rows = 40;
    const cw = w / cols;
    const ch = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bit = BITS[(r * cols + c) % BITS.length];
        const px = c * cw + cw * 0.5;
        const py = r * ch + ch * 0.5;
        if (inWell(px, py, w, h, 12)) continue;
        ctx.fillStyle = bit
          ? withAlpha(dark.chalcedony, 0.12)
          : withAlpha(dark.amber, 0.08);
        if (bit) {
          ctx.fillRect(c * cw + cw * 0.38, r * ch + 2, cw * 0.24, ch - 4);
        } else {
          ctx.beginPath();
          ctx.arc(px, py, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  /** Four pillars of the earth + abyss below */
  drawAbyssAndPillars(cam, w, h) {
    const ctx = this.ctx;
    const { ox, oy, scale } = cam;
    const S = 1280; // world units — full-frame span

    // abyss pool under the earth
    const abyssPts = [
      isoAt(ox, oy, -S * 0.55, -S * 0.55, -40),
      isoAt(ox, oy, S * 0.55, -S * 0.55, -40),
      isoAt(ox, oy, S * 0.55, S * 0.55, -40),
      isoAt(ox, oy, -S * 0.55, S * 0.55, -40)
    ];
    ctx.beginPath();
    ctx.moveTo(abyssPts[0].x, abyssPts[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(abyssPts[i].x, abyssPts[i].y);
    ctx.closePath();
    ctx.fillStyle = withAlpha(dark.purple, 0.55);
    ctx.fill();
    ctx.strokeStyle = withAlpha(dark.jacinth, 0.7);
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Sheol label region (subtle)
    const sheol = isoAt(ox, oy, 0, 0, -28);
    if (!inWell(sheol.x, sheol.y, w, h, 20)) {
      ctx.fillStyle = withAlpha(bright.amethyst, 0.35);
      ctx.font = "italic 13px Palatino, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("Sheol", sheol.x, sheol.y);
    }

    // four corner pillars
    const pillarH = 260;
    const corners = [
      [-S * 0.48, -S * 0.48],
      [S * 0.48, -S * 0.48],
      [S * 0.48, S * 0.48],
      [-S * 0.48, S * 0.48]
    ];
    for (const [px, py] of corners) {
      this.drawPillar(cam, px, py, pillarH, w, h);
    }
  }

  drawPillar(cam, wx, wy, height, w, h) {
    const ctx = this.ctx;
    const { ox, oy } = cam;
    const baseR = 14;
    const topR = 11;
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      const t0 = i / steps;
      const t1 = (i + 1) / steps;
      const z0 = t0 * height;
      const z1 = t1 * height;
      const r0 = baseR + (topR - baseR) * t0;
      const r1 = baseR + (topR - baseR) * t1;
      const A = isoAt(ox, oy, wx - r0, wy - r0, z0);
      const B = isoAt(ox, oy, wx + r0, wy - r0, z0);
      const C = isoAt(ox, oy, wx + r1, wy - r1, z1);
      const D = isoAt(ox, oy, wx - r1, wy - r1, z1);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.lineTo(C.x, C.y);
      ctx.lineTo(D.x, D.y);
      ctx.closePath();
      const gem = i % 2 === 0 ? dark.vermilion : dark.amber;
      ctx.fillStyle = withAlpha(gem, 0.72);
      ctx.fill();
      ctx.strokeStyle = withAlpha(bright.amber, 0.45);
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    // capital
    const top = isoAt(ox, oy, wx, wy, height);
    ctx.beginPath();
    ctx.arc(top.x, top.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = bright.topaz;
    ctx.fill();
  }

  /** Flat earth plane — rectangular disk in isometric */
  drawEarthPlane(cam, w, h) {
    const ctx = this.ctx;
    const { ox, oy, scale } = cam;
    const S = 1180;

    const pts = [
      isoAt(ox, oy, -S * 0.5, -S * 0.5, 0),
      isoAt(ox, oy, S * 0.5, -S * 0.5, 0),
      isoAt(ox, oy, S * 0.5, S * 0.5, 0),
      isoAt(ox, oy, -S * 0.5, S * 0.5, 0)
    ];
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    // land fill — emerald / chalcedony mix
    const g = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
    g.addColorStop(0, withAlpha(dark.emerald, 0.78));
    g.addColorStop(0.45, withAlpha(dark.chrysolyte, 0.7));
    g.addColorStop(1, withAlpha(dark.chalcedony, 0.65));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = withAlpha(bright.amber, 0.55);
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // inner disk suggestion (circle of the earth)
    const cx = (pts[0].x + pts[2].x) / 2;
    const cy = (pts[0].y + pts[2].y) / 2;
    const rx = Math.abs(pts[1].x - pts[0].x) * 0.42;
    const ry = Math.abs(pts[3].y - pts[0].y) * 0.42;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = withAlpha(bright.pearl, 0.35);
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }

  drawOceanRim(cam, w, h) {
    const ctx = this.ctx;
    const { ox, oy, scale } = cam;
    const S = 1180;
    const outer = 1.12;
    const inner = 0.92;

    // ocean band between outer and inner rectangles
    const outerPts = [
      isoAt(ox, oy, -S * 0.5 * outer, -S * 0.5 * outer, -2),
      isoAt(ox, oy, S * 0.5 * outer, -S * 0.5 * outer, -2),
      isoAt(ox, oy, S * 0.5 * outer, S * 0.5 * outer, -2),
      isoAt(ox, oy, -S * 0.5 * outer, S * 0.5 * outer, -2)
    ];
    const innerPts = [
      isoAt(ox, oy, -S * 0.5 * inner, -S * 0.5 * inner, 0),
      isoAt(ox, oy, S * 0.5 * inner, -S * 0.5 * inner, 0),
      isoAt(ox, oy, S * 0.5 * inner, S * 0.5 * inner, 0),
      isoAt(ox, oy, -S * 0.5 * inner, S * 0.5 * inner, 0)
    ];

    ctx.beginPath();
    ctx.moveTo(outerPts[0].x, outerPts[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(outerPts[i].x, outerPts[i].y);
    ctx.closePath();
    ctx.moveTo(innerPts[0].x, innerPts[0].y);
    for (let i = 3; i >= 0; i--) ctx.lineTo(innerPts[i].x, innerPts[i].y);
    ctx.closePath();
    ctx.fillStyle = withAlpha(dark.sapphire, 0.72);
    ctx.fill();
    ctx.strokeStyle = withAlpha(bright.crystal, 0.5);
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // wave ticks on ocean
    for (let i = 0; i < 24; i++) {
      const t = i / 24;
      const side = Math.floor(t * 4) % 4;
      const u = (t * 4) % 1;
      let wx, wy;
      if (side === 0) {
        wx = -S * 0.5 * outer + u * S * outer;
        wy = -S * 0.5 * outer;
      } else if (side === 1) {
        wx = S * 0.5 * outer;
        wy = -S * 0.5 * outer + u * S * outer;
      } else if (side === 2) {
        wx = S * 0.5 * outer - u * S * outer;
        wy = S * 0.5 * outer;
      } else {
        wx = -S * 0.5 * outer;
        wy = S * 0.5 * outer - u * S * outer;
      }
      const p = isoAt(ox, oy, wx, wy, -1);
      if (inWell(p.x, p.y, w, h, 8)) continue;
      ctx.strokeStyle = withAlpha(bright.chalcedony, 0.4);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x - 4, p.y);
      ctx.quadraticCurveTo(p.x, p.y - 3, p.x + 4, p.y);
      ctx.stroke();
    }
  }

  drawLandAndMountains(cam, w, h) {
    const ctx = this.ctx;
    const { ox, oy, scale } = cam;
    const S = 1180;

    // simplified continents as organic blobs (east-at-top medieval language)
    const continents = [
      { cx: -0.12, cy: -0.18, rx: 0.22, ry: 0.16, z: 4 },
      { cx: 0.18, cy: 0.08, rx: 0.2, ry: 0.14, z: 3 },
      { cx: -0.05, cy: 0.22, rx: 0.15, ry: 0.12, z: 2 },
      { cx: 0.02, cy: -0.02, rx: 0.1, ry: 0.08, z: 5 } // centre / Jerusalem
    ];

    for (const c of continents) {
      const pts = [];
      const n = 10;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const jitter = 0.85 + hash(i * 7 + c.cx * 10) * 0.3;
        const x = c.cx * S + Math.cos(a) * c.rx * S * jitter;
        const y = c.cy * S + Math.sin(a) * c.ry * S * jitter;
        pts.push(isoAt(ox, oy, x, y, c.z));
      }
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.fillStyle = withAlpha(dark.emerald, 0.55);
      ctx.fill();
      ctx.strokeStyle = withAlpha(bright.chrysolyte, 0.4);
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }

    // mountain ring (columns of the north / rim mountains)
    const mtCount = 16;
    for (let i = 0; i < mtCount; i++) {
      const a = (i / mtCount) * Math.PI * 2 + 0.2;
      const r = S * 0.42;
      const mx = Math.cos(a) * r;
      const my = Math.sin(a) * r;
      const hgt = 90 + hash(i) * 130;
      const base = isoAt(ox, oy, mx, my, 0);
      const peak = isoAt(ox, oy, mx, my, hgt);
      const left = isoAt(ox, oy, mx - 12, my + 4, 0);
      const right = isoAt(ox, oy, mx + 12, my - 4, 0);
      if (inWell(peak.x, peak.y, w, h, 10)) continue;
      ctx.beginPath();
      ctx.moveTo(left.x, left.y);
      ctx.lineTo(peak.x, peak.y);
      ctx.lineTo(right.x, right.y);
      ctx.closePath();
      ctx.fillStyle = withAlpha(dark.amber, 0.75);
      ctx.fill();
      ctx.strokeStyle = withAlpha(bright.pearl, 0.35);
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // four rivers from centre (paradise rivers)
    const rivers = [
      [0.0, -0.02, -0.35, -0.35],
      [0.0, -0.02, 0.35, -0.3],
      [0.0, -0.02, 0.3, 0.35],
      [0.0, -0.02, -0.32, 0.32]
    ];
    for (const [x0, y0, x1, y1] of rivers) {
      const p0 = isoAt(ox, oy, x0 * S, y0 * S, 2);
      const p1 = isoAt(ox, oy, x1 * S, y1 * S, 1);
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.quadraticCurveTo(
        (p0.x + p1.x) / 2 + 8,
        (p0.y + p1.y) / 2 - 6,
        p1.x,
        p1.y
      );
      ctx.strokeStyle = withAlpha(bright.sapphire, 0.55);
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }

    // Jerusalem marker
    const jer = isoAt(ox, oy, 0, 0, 8);
    if (!inWell(jer.x, jer.y, w, h, 16)) {
      ctx.fillStyle = bright.sardius;
      ctx.beginPath();
      ctx.arc(jer.x, jer.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = bright.pearl;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = withAlpha(bright.pearl, 0.85);
      ctx.font = "italic 13px Palatino, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("Ierusalem", jer.x, jer.y - 10);
    }
  }

  /**
   * Domed firmament — solid translucent crystalline blue hemisphere
   * over the flat earth (isometric). Gem palette only.
   */
  drawFirmamentVault(cam, w, h, motion) {
    const ctx = this.ctx;
    const { ox, oy } = cam;
    const S = 1180;
    const R = S * 0.78;
    const domeH = R * 0.95;

    const phiSteps = 14;
    const thetaSteps = 64;

    function domePoint(theta, phi) {
      const rr = Math.sin(phi) * R;
      const z = Math.cos(phi) * domeH;
      return isoAt(ox, oy, Math.cos(theta) * rr, Math.sin(theta) * rr, z);
    }

    // Solid crystalline body: stacked latitude shells with strong sapphire fill
    for (let p = 0; p < phiSteps; p++) {
      const phi0 = (p / phiSteps) * (Math.PI / 2);
      const phi1 = ((p + 1) / phiSteps) * (Math.PI / 2);
      const band = [];
      for (let t = 0; t <= thetaSteps; t++) {
        const theta = (t / thetaSteps) * Math.PI * 2;
        band.push(domePoint(theta, phi0));
      }
      for (let t = thetaSteps; t >= 0; t--) {
        const theta = (t / thetaSteps) * Math.PI * 2;
        band.push(domePoint(theta, phi1));
      }
      ctx.beginPath();
      ctx.moveTo(band[0].x, band[0].y);
      for (let i = 1; i < band.length; i++) ctx.lineTo(band[i].x, band[i].y);
      ctx.closePath();
      // denser solid blue glass toward the rim; still transparent
      const u = p / (phiSteps - 1);
      const alpha = 0.14 + u * 0.22;
      ctx.fillStyle = withAlpha(dark.sapphire, alpha);
      ctx.fill();
      // crystal facet edge
      ctx.strokeStyle = withAlpha(bright.crystal, 0.22 + u * 0.28);
      ctx.lineWidth = 1.15;
      ctx.stroke();
    }

    // Second pass: lighter chalcedony/crystal glaze for crystalline sheen
    for (let p = 0; p < phiSteps; p += 2) {
      const phi0 = (p / phiSteps) * (Math.PI / 2);
      const phi1 = ((p + 1) / phiSteps) * (Math.PI / 2);
      const band = [];
      for (let t = 0; t <= thetaSteps; t++) {
        const theta = (t / thetaSteps) * Math.PI * 2;
        band.push(domePoint(theta, phi0));
      }
      for (let t = thetaSteps; t >= 0; t--) {
        const theta = (t / thetaSteps) * Math.PI * 2;
        band.push(domePoint(theta, phi1));
      }
      ctx.beginPath();
      ctx.moveTo(band[0].x, band[0].y);
      for (let i = 1; i < band.length; i++) ctx.lineTo(band[i].x, band[i].y);
      ctx.closePath();
      ctx.fillStyle = withAlpha(bright.sapphire, 0.06 + (p / phiSteps) * 0.08);
      ctx.fill();
    }

    // Heavy crystalline rim (equator of the firmament)
    const rim = [];
    for (let t = 0; t <= thetaSteps; t++) {
      const theta = (t / thetaSteps) * Math.PI * 2;
      rim.push(domePoint(theta, Math.PI / 2));
    }
    ctx.beginPath();
    ctx.moveTo(rim[0].x, rim[0].y);
    for (let i = 1; i < rim.length; i++) ctx.lineTo(rim[i].x, rim[i].y);
    ctx.closePath();
    ctx.strokeStyle = withAlpha(bright.crystal, 0.85);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = withAlpha(bright.sapphire, 0.65);
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.strokeStyle = withAlpha(bright.chalcedony, 0.4);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Meridian crystal ribs
    const meridians = 16;
    for (let m = 0; m < meridians; m++) {
      const theta = (m / meridians) * Math.PI * 2;
      ctx.beginPath();
      for (let k = 0; k <= 20; k++) {
        const phi = (k / 20) * (Math.PI / 2);
        const pt = domePoint(theta, phi);
        if (k === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = withAlpha(bright.crystal, 0.28 + (m % 2) * 0.12);
      ctx.lineWidth = m % 4 === 0 ? 2.2 : 1.2;
      ctx.stroke();
      // inner sapphire line for depth
      ctx.beginPath();
      for (let k = 0; k <= 20; k++) {
        const phi = (k / 20) * (Math.PI / 2);
        const pt = domePoint(theta, phi);
        if (k === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = withAlpha(dark.sapphire, 0.25);
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Apex crystal boss
    const apex = domePoint(0, 0);
    if (!inWell(apex.x, apex.y, w, h, 16)) {
      ctx.beginPath();
      ctx.arc(apex.x, apex.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = withAlpha(bright.crystal, 0.55);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(apex.x, apex.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = withAlpha(bright.sapphire, 0.7);
      ctx.fill();
      ctx.strokeStyle = withAlpha(bright.pearl, 0.6);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Floodgates as crystalline cross-vents
    for (let i = 0; i < 8; i++) {
      const theta = (i / 8) * Math.PI * 2 + this.time * 0.015;
      const phi = 0.42 + 0.18 * Math.sin(i * 1.3);
      const pt = domePoint(theta, phi);
      if (inWell(pt.x, pt.y, w, h, 12)) continue;
      ctx.strokeStyle = withAlpha(bright.beryl, 0.7);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pt.x - 8, pt.y);
      ctx.lineTo(pt.x + 8, pt.y);
      ctx.moveTo(pt.x, pt.y - 7);
      ctx.lineTo(pt.x, pt.y + 7);
      ctx.stroke();
      ctx.strokeStyle = withAlpha(bright.crystal, 0.45);
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Profile silhouette (readable dome edge)
    for (const side of [-1, 1]) {
      ctx.beginPath();
      for (let k = 0; k <= 28; k++) {
        const phi = (k / 28) * (Math.PI / 2);
        const theta = side > 0 ? 0 : Math.PI;
        const pt = domePoint(theta, phi);
        if (k === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = withAlpha(bright.crystal, 0.55);
      ctx.lineWidth = 2.8;
      ctx.stroke();
    }
  }

  drawWatersAbove(cam, w, h) {
    const ctx = this.ctx;
    const { ox, oy } = cam;
    const S = 1180;
    const R = S * 0.72;
    const domeH = R * 0.92;
    // Waters sit just outside the firmament shell
    const R2 = R * 1.08;
    const H2 = domeH * 1.1;
    const segs = 48;

    function pt(theta, phi) {
      const rr = Math.sin(phi) * R2;
      const z = Math.cos(phi) * H2;
      return isoAt(ox, oy, Math.cos(theta) * rr, Math.sin(theta) * rr, z);
    }

    // Outer water shell — a few latitude rings above the firmament
    for (const phi of [0.25, 0.5, 0.75, 1.0]) {
      const phiR = phi * (Math.PI / 2) * 0.95;
      ctx.beginPath();
      for (let t = 0; t <= segs; t++) {
        const theta = (t / segs) * Math.PI * 2;
        const p = pt(theta, phiR);
        if (t === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.strokeStyle = withAlpha(bright.sapphire, 0.35 + phi * 0.15);
      ctx.lineWidth = phi > 0.9 ? 5 : 2.2;
      ctx.stroke();
    }

    // Droplets
    for (let i = 0; i < 22; i++) {
      const theta = hash(i + 200) * Math.PI * 2;
      const phi = (0.2 + hash(i + 220) * 0.7) * (Math.PI / 2);
      const p = pt(theta, phi);
      if (inWell(p.x, p.y, w, h, 8)) continue;
      ctx.fillStyle = withAlpha(bright.chalcedony, 0.55);
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 4, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawStars(cam, w, h, motion) {
    const ctx = this.ctx;
    const { ox, oy } = cam;
    const S = 1180;
    const R = S * 0.72;
    const domeH = R * 0.92;

    for (const star of STARS) {
      const theta = star.a * 2 + this.time * 0.012 * (0.3 + motion * 0.4);
      const phi = (0.15 + star.elev * 0.75) * (Math.PI / 2);
      const rr = Math.sin(phi) * R * 0.96;
      const z = Math.cos(phi) * domeH * 0.96;
      const p = isoAt(ox, oy, Math.cos(theta) * rr, Math.sin(theta) * rr, z);
      if (inWell(p.x, p.y, w, h, 10)) continue;

      const twinkle = 0.65 + 0.35 * Math.sin(this.time * (1.2 + star.brightN) + star.phase);
      const alpha = 0.25 + star.brightN * 0.7 * twinkle;
      const sz = star.size * (0.9 + 0.25 * twinkle) * 1.15;

      ctx.fillStyle = withAlpha(bright.pearl, alpha);
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const ang = (k / 8) * Math.PI * 2 - Math.PI / 2;
        const rad = k % 2 === 0 ? sz : sz * 0.35;
        const x = p.x + Math.cos(ang) * rad;
        const y = p.y + Math.sin(ang) * rad;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      if (star.brightN > 0.6) {
        ctx.fillStyle = withAlpha(bright.crystal, alpha * 0.9);
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawSunMoon(cam, w, h, motion) {
    const ctx = this.ctx;
    const { ox, oy } = cam;
    const S = 1180;
    const R = S * 0.72;
    const domeH = R * 0.92;

    const speed = 0.09 * (0.5 + motion);
    const uSun = (this.time * speed) % (Math.PI * 2);
    const uMoon = (uSun + Math.PI) % (Math.PI * 2);

    const place = (u) => {
      // Travel along a latitude under the firmament (phi ~ 0.55–0.7)
      const phi = 0.55 + 0.12 * Math.sin(u);
      const rr = Math.sin(phi) * R * 0.88;
      const z = Math.cos(phi) * domeH * 0.88;
      return isoAt(ox, oy, Math.cos(u) * rr, Math.sin(u) * rr, z);
    };

    const sun = place(uSun);
    if (!inWell(sun.x, sun.y, w, h, 14)) {
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + this.time * 0.3;
        ctx.strokeStyle = withAlpha(bright.topaz, 0.5);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(sun.x + Math.cos(ang) * 16, sun.y + Math.sin(ang) * 16);
        ctx.lineTo(sun.x + Math.cos(ang) * 36, sun.y + Math.sin(ang) * 36);
        ctx.stroke();
      }
      ctx.fillStyle = bright.topaz;
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = withAlpha(bright.pearl, 0.5);
      ctx.beginPath();
      ctx.arc(sun.x - 3, sun.y - 3, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    const moon = place(uMoon);
    if (!inWell(moon.x, moon.y, w, h, 12)) {
      ctx.fillStyle = bright.pearl;
      ctx.beginPath();
      ctx.arc(moon.x, moon.y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = withAlpha(dark.crystal, 0.55);
      ctx.beginPath();
      ctx.arc(moon.x + 4, moon.y - 1, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawOrnamentFrame(w, h) {
    const ctx = this.ctx;
    // corner strapwork / geometric (three concentric circles + octagon language)
    const margin = 28;
    const corners = [
      [margin, margin],
      [w - margin, margin],
      [w - margin, h - margin],
      [margin, h - margin]
    ];
    for (const [cx, cy] of corners) {
      if (inWell(cx, cy, w, h, 40)) continue;
      // octagon
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const x = cx + Math.cos(a) * 18;
        const y = cy + Math.sin(a) * 18;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = withAlpha(bright.amber, 0.5);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // three concentric circles
      for (let r of [6, 10, 14]) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = withAlpha(bright.chalcedony, 0.35);
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // thin outer border
    ctx.strokeStyle = withAlpha(bright.amber, 0.25);
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, w - 24, h - 24);
  }

  drawLabels(cam, w, h) {
    const ctx = this.ctx;
    const { ox, oy, scale } = cam;
    const S = 1180;

    ctx.textAlign = "center";
    ctx.font = "italic 16px Palatino, Georgia, serif";

    const labels = [
      { x: 0, y: -S * 0.62, z: 30, text: "Firmament of the Sky", col: bright.chalcedony },
      { x: 0, y: 0, z: 230, text: "Waters above the Firmament", col: bright.sapphire },
      { x: -S * 0.55, y: 0, z: -5, text: "Ocean", col: bright.crystal },
      { x: S * 0.55, y: 0, z: -5, text: "Ocean", col: bright.crystal }
    ];

    for (const L of labels) {
      const p = isoAt(ox, oy, L.x, L.y, L.z);
      if (inWell(p.x, p.y, w, h, 30)) continue;
      ctx.fillStyle = withAlpha(L.col, 0.7);
      ctx.fillText(L.text, p.x, p.y);
    }

    // title cartouche top centre (outside well)
    const titleY = 48;
    if (!inWell(w * 0.5, titleY, w, h, 20)) {
      ctx.fillStyle = withAlpha(bright.pearl, 0.85);
      ctx.font = "18px Palatino, Georgia, serif";
      ctx.fillText("The Firmament · Genesis Cosmography", w * 0.5, titleY);
      ctx.font = "italic 13px Palatino, Georgia, serif";
      ctx.fillStyle = withAlpha(bright.amber, 0.6);
      ctx.fillText("flat earth under the vault · sunne & moone in their circuits", w * 0.5, titleY + 18);
    }
  }
}
