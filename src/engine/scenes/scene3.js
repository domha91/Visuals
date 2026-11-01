// @ts-nocheck
/**
 * Scene 3 — Strapwork (isometric hall). Shared isoRoom camera with scene 5.
 * Vredeman-style hall: coffered ceiling/floor, bayed walls with dense
 * interlaced strapwork / cartouche ornament drawn from the reference plates,
 * travelling straps on isometric axes, cabinets.
 * Group of period dancers (male + female) in Ultima-Online-inspired style,
 * formal pavane / circle formation, idle step-cycle animation.
 * Hierarchy: architecture & ornament first; figures as inhabitants.
 * Gemstone palette only. No draw through the centre well.
 */
import { bright, dark, withAlpha } from "../palette.js";
import { inWell, wellRect } from "../well.js";
import {
  clipFloor, DANCER_PX, isoAt, isoBeams, isoBox, isoCeiling, isoCoffers, isoEntablature,
  isoFloorTile, isoRoom, isoWallX, isoWallY, seatOnFloor
} from "../iso.js";

const WOOD = [dark.vermilion, dark.amber, dark.sardius, dark.topaz, dark.crimson];
const GEM = [bright.amber, bright.ligure, bright.topaz, bright.pearl, bright.sardonyx];
const STRAP = [dark.sardius, dark.vermilion, dark.amber, dark.crimson, dark.scarlet];
const STRAP_HI = [bright.amber, bright.ligure, bright.topaz, bright.carbuncle, bright.ruby];

export class Scene3 {
  constructor(ctx) {
    this.ctx = ctx;
    this.time = 0;
    this.wellFill = dark.vermilion;
  }

  render(params, w, h) {
    const motion = params.motion ?? 0.32;
    this.time += 0.011 * (0.45 + motion);
    const cam = isoRoom(w, h);

    // Full-frame geometric strap / star lattice (ref language).
    // The iso room overpaints the centre so the triangular voids keep the pattern.
    this.fillBackgroundLattice(w, h);

    // Ornate entablature band — panels filled with strapwork cartouches
    this.ornateEntablature(w, h);

    isoCeiling(this.ctx, cam, withAlpha(dark.vermilion, 0.88), bright.amber);
    isoCoffers(this.ctx, cam, withAlpha(dark.sardius, 0.32), withAlpha(bright.ligure, 0.42));
    isoBeams(this.ctx, cam, withAlpha(bright.amber, 0.42));

    this.walls(cam, w, h);
    this.floor(cam, w, h);
    this.cabinets(cam, w, h);
    this.straps(cam, w, h, motion);
    this.dancers(cam, w, h, motion);
  }

  /**
   * Full-frame geometric strap / star / diamond lattice from the
   * architectural reference plates (star-vault, interlace, diaper).
   * Painted first so the triangular voids outside the iso walls keep it.
   */
  fillBackgroundLattice(w, h) {
    const ctx = this.ctx;

    // Ground
    ctx.fillStyle = dark.sardius;
    ctx.fillRect(0, 0, w, h);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Dense diamond lattice
    const step = 38;
    for (let row = -2; row < 50; row++) {
      for (let col = -2; col < 70; col++) {
        const cx = (col + (row % 2) * 0.5) * step;
        const cy = row * step * 0.58 + 8;
        const s = 12 + ((col + row) % 3);
        const colIdx = Math.abs(col + row) % STRAP.length;

        ctx.strokeStyle = withAlpha(STRAP[colIdx], 0.7);
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(cx, cy - s);
        ctx.lineTo(cx + s, cy);
        ctx.lineTo(cx, cy + s);
        ctx.lineTo(cx - s, cy);
        ctx.closePath();
        ctx.stroke();

        const s2 = s * 0.42;
        ctx.strokeStyle = withAlpha(STRAP_HI[colIdx % STRAP_HI.length], 0.5);
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        ctx.moveTo(cx, cy - s2);
        ctx.lineTo(cx + s2, cy);
        ctx.lineTo(cx, cy + s2);
        ctx.lineTo(cx - s2, cy);
        ctx.closePath();
        ctx.stroke();

        if ((col + row) % 3 === 0) {
          ctx.fillStyle = withAlpha(STRAP_HI[(colIdx + 1) % STRAP_HI.length], 0.55);
          ctx.beginPath();
          ctx.arc(cx, cy, 2.0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Larger star / multi-point interlaces (star-vault language from refs)
    for (let k = 0; k < 12; k++) {
      const cx = 60 + (k % 6) * 320 + (k > 5 ? 160 : 0);
      const cy = 40 + Math.floor(k / 6) * 280 + (k % 3) * 40;
      const r = 26;
      const colIdx = k % STRAP.length;
      ctx.strokeStyle = withAlpha(STRAP[colIdx], 0.65);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2 - Math.PI / 2;
        const px = cx + Math.cos(ang) * r;
        const py = cy + Math.sin(ang) * r * 0.62;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang) * r * 0.8, cy + Math.sin(ang) * r * 0.5);
        ctx.stroke();
      }
      // centre ring
      ctx.strokeStyle = withAlpha(STRAP_HI[colIdx % STRAP_HI.length], 0.55);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 7, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /**
   * Full-width ornate entablature. Each upper panel is filled with a
   * cartouche / scroll / diamond motif taken from the strapwork reference plates.
   */
  ornateEntablature(w, h) {
    const ctx = this.ctx;
    const bandH = Math.round(w * 0.09);

    // Wood ground
    ctx.fillStyle = dark.vermilion;
    ctx.fillRect(0, 0, w, bandH);

    // Outer frame
    ctx.strokeStyle = bright.amber;
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, w - 12, bandH - 12);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 14, w - 32, bandH - 28);

    const n = 11;
    const margin = 24;
    const gap = 8;
    const total = w - margin * 2;
    const pw = (total - gap * (n - 1)) / n;

    for (let i = 0; i < n; i++) {
      const x = margin + i * (pw + gap);
      const y = 20;
      const ph = bandH - 40;

      // Panel field
      ctx.fillStyle = withAlpha(WOOD[i % WOOD.length], 0.55);
      ctx.fillRect(x, y, pw, ph);
      ctx.strokeStyle = GEM[i % GEM.length];
      ctx.lineWidth = 1.6;
      ctx.strokeRect(x, y, pw, ph);

      // Inner cartouche frame
      const inset = 5;
      ctx.strokeStyle = withAlpha(STRAP[i % STRAP.length], 0.85);
      ctx.lineWidth = 2.2;
      ctx.strokeRect(x + inset, y + inset, pw - inset * 2, ph - inset * 2);

      // Diamond centre (ref language)
      const cx = x + pw / 2;
      const cy = y + ph / 2;
      const d = Math.min(pw, ph) * 0.28;
      ctx.strokeStyle = STRAP[(i + 1) % STRAP.length];
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(cx, cy - d);
      ctx.lineTo(cx + d, cy);
      ctx.lineTo(cx, cy + d);
      ctx.lineTo(cx - d, cy);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = withAlpha(STRAP_HI[i % STRAP_HI.length], 0.7);
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Corner volutes
      const volR = 5;
      [[x + inset + 3, y + inset + 3, 0.3],
       [x + pw - inset - 3, y + inset + 3, -0.3],
       [x + pw - inset - 3, y + ph - inset - 3, -2.0],
       [x + inset + 3, y + ph - inset - 3, 2.0]].forEach(([vx, vy, a], vi) => {
        ctx.strokeStyle = STRAP[(i + vi) % STRAP.length];
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(vx, vy, volR, a, a + Math.PI * 1.4);
        ctx.stroke();
      });

      // Small horizontal straps inside panel
      ctx.strokeStyle = withAlpha(STRAP[(i + 2) % STRAP.length], 0.7);
      ctx.lineWidth = 1.4;
      for (let k = 0; k < 2; k++) {
        const ly = y + inset + 8 + k * (ph - inset * 2 - 16) / 1;
        ctx.beginPath();
        ctx.moveTo(x + inset + 8, ly);
        ctx.lineTo(x + pw - inset - 8, ly);
        ctx.stroke();
      }
    }
  }

  /* ── walls: dense strapwork / cartouche panels from ref language ─ */
  walls(cam, w, h) {
    const ctx = this.ctx;
    const { ox, oy, room, wallH } = cam;

    // Main wall planes
    isoWallY(ctx, ox, oy, 0, room, 0, 0, wallH,
      withAlpha(dark.sardius, 0.74), bright.amber, 2);
    isoWallX(ctx, ox, oy, 0, 0, room, 0, wallH,
      withAlpha(dark.vermilion, 0.8), bright.amber, 2);

    const bays = 7;
    const bay = room / bays;
    for (let i = 0; i < bays; i++) {
      const x0 = i * bay + 6, x1 = (i + 1) * bay - 6;
      // Outer bay frame (wood)
      isoWallY(ctx, ox, oy, x0, x1, 0, 18, wallH - 28,
        withAlpha(WOOD[i % WOOD.length], 0.6), GEM[i % GEM.length], 1.8);
      // Mid frame
      isoWallY(ctx, ox, oy, x0 + 10, x1 - 10, 0, 36, wallH - 48,
        withAlpha(dark.amber, 0.4), withAlpha(bright.ligure, 0.8), 1.3);
      // Inner recessed field
      isoWallY(ctx, ox, oy, x0 + 18, x1 - 18, 0, 52, wallH - 64,
        withAlpha(dark.sardius, 0.28), withAlpha(bright.amber, 0.55), 1.0);
      // Dense strapwork cartouche on the panel
      this.ornatePanel(cam, (x0 + x1) / 2, 0, 52, wallH - 64, i, "y");

      const y0 = i * bay + 6, y1 = (i + 1) * bay - 6;
      isoWallX(ctx, ox, oy, 0, y0, y1, 18, wallH - 28,
        withAlpha(WOOD[(i + 2) % WOOD.length], 0.55), GEM[(i + 1) % GEM.length], 1.8);
      isoWallX(ctx, ox, oy, 0, y0 + 10, y1 - 10, 36, wallH - 48,
        withAlpha(dark.vermilion, 0.35), withAlpha(bright.amber, 0.75), 1.3);
      isoWallX(ctx, ox, oy, 0, y0 + 18, y1 - 18, 52, wallH - 64,
        withAlpha(dark.amber, 0.25), withAlpha(bright.ligure, 0.5), 1.0);
      this.ornatePanel(cam, 0, (y0 + y1) / 2, 52, wallH - 64, i + 4, "x");
    }

    // Cornice band
    isoWallY(ctx, ox, oy, 0, room, 0, wallH - 18, wallH,
      withAlpha(bright.amber, 0.34), bright.ligure, 2);
    isoWallX(ctx, ox, oy, 0, 0, room, wallH - 18, wallH,
      withAlpha(bright.amber, 0.28), bright.ligure, 2);
  }

  /**
   * Ornate panel fill: nested cartouche frames, interlaced straps,
   * volute terminals and diamond centres — language of the Vredeman /
   * architectural strapwork reference plates, gemstone only.
   */
  ornatePanel(cam, wx, wy, z0, z1, seed, axis) {
    const ctx = this.ctx;
    const { ox, oy } = cam;
    const h = z1 - z0;
    const t = this.time * 0.35 + seed * 1.3;
    const col = STRAP[seed % STRAP.length];
    const hi = STRAP_HI[seed % STRAP_HI.length];

    // Helper: world point on this wall panel → screen
    const pt = (u, v, zOff = 0) => {
      // u horizontal across panel (-0.5..0.5), v vertical (0..1)
      let x, y, z;
      if (axis === "y") {
        x = wx + u * 78;
        y = wy;
        z = z0 + 8 + v * (h - 16) + zOff;
      } else {
        x = wx;
        y = wy + u * 78;
        z = z0 + 8 + v * (h - 16) + zOff;
      }
      return isoAt(ox, oy, x, y, z);
    };

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // ── outer cartouche frame (rounded rectangle of straps) ──
    const frame = [
      pt(-0.42, 0.08), pt(0.42, 0.08), pt(0.42, 0.92), pt(-0.42, 0.92)
    ];
    ctx.strokeStyle = col;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(frame[0].x, frame[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(frame[i].x, frame[i].y);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = withAlpha(hi, 0.65);
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // ── inner parallel frame ──
    const inner = [
      pt(-0.32, 0.16), pt(0.32, 0.16), pt(0.32, 0.84), pt(-0.32, 0.84)
    ];
    ctx.strokeStyle = STRAP[(seed + 1) % STRAP.length];
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(inner[0].x, inner[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(inner[i].x, inner[i].y);
    ctx.closePath();
    ctx.stroke();

    // ── four corner volutes (classic strapwork terminals) ──
    const corners = [
      { u: -0.38, v: 0.12, a: 0.8 },
      { u: 0.38, v: 0.12, a: -0.8 },
      { u: 0.38, v: 0.88, a: -2.4 },
      { u: -0.38, v: 0.88, a: 2.4 }
    ];
    corners.forEach((c, ci) => {
      const p = pt(c.u, c.v);
      ctx.strokeStyle = STRAP[(seed + ci) % STRAP.length];
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(p.x + c.a * 3, p.y - 2, 8, 0.15, Math.PI * 1.7);
      ctx.stroke();
      ctx.strokeStyle = withAlpha(STRAP_HI[(seed + ci) % STRAP_HI.length], 0.7);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(p.x + c.a * 3, p.y - 2, 4.5, 0.3, Math.PI * 1.5);
      ctx.stroke();
    });

    // ── central diamond / lozenge interlace ──
    const c = pt(0, 0.5);
    const d = 18 + (seed % 3) * 2;
    ctx.strokeStyle = col;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y - d);
    ctx.lineTo(c.x + d, c.y);
    ctx.lineTo(c.x, c.y + d);
    ctx.lineTo(c.x - d, c.y);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = withAlpha(hi, 0.7);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // inner diamond
    const d2 = d * 0.45;
    ctx.strokeStyle = STRAP[(seed + 2) % STRAP.length];
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y - d2);
    ctx.lineTo(c.x + d2, c.y);
    ctx.lineTo(c.x, c.y + d2);
    ctx.lineTo(c.x - d2, c.y);
    ctx.closePath();
    ctx.stroke();

    // ── horizontal interlacing straps across the panel ──
    for (let k = 0; k < 3; k++) {
      const v = 0.28 + k * 0.22;
      const wave = Math.sin(t + k * 1.4) * 0.04;
      ctx.strokeStyle = STRAP[(seed + k) % STRAP.length];
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      let started = false;
      for (let s = 0; s <= 10; s++) {
        const u = -0.28 + (s / 10) * 0.56;
        const p = pt(u, v + wave * Math.sin(s * 0.9));
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      // highlight
      ctx.strokeStyle = withAlpha(STRAP_HI[(seed + k) % STRAP_HI.length], 0.55);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      started = false;
      for (let s = 0; s <= 10; s++) {
        const u = -0.28 + (s / 10) * 0.56;
        const p = pt(u, v + wave * Math.sin(s * 0.9) - 0.01);
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // ── vertical interlacing straps ──
    for (let k = 0; k < 2; k++) {
      const u = -0.18 + k * 0.36;
      ctx.strokeStyle = STRAP[(seed + k + 3) % STRAP.length];
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      let started = false;
      for (let s = 0; s <= 8; s++) {
        const v = 0.2 + (s / 8) * 0.6;
        const p = pt(u + Math.sin(t * 0.7 + s * 0.5) * 0.03, v);
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // ── small scroll flourishes at mid-sides ──
    [-0.4, 0.4].forEach((u, ui) => {
      const p = pt(u, 0.5);
      ctx.strokeStyle = STRAP[(seed + ui + 1) % STRAP.length];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(p.x + (ui === 0 ? -4 : 4), p.y, 6, 0.2, Math.PI * 1.6);
      ctx.stroke();
    });
  }

  /* ── floor ────────────────────────────────────────────────────── */
  floor(cam, w, h) {
    const ctx = this.ctx;
    const { ox, oy, tile, n } = cam;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = i * tile, y = j * tile;
        const even = (i + j) % 2 === 0;
        isoFloorTile(ctx, ox, oy, x, y, tile - 3,
          withAlpha(WOOD[(i + j) % WOOD.length], even ? 0.62 : 0.36),
          withAlpha(GEM[(i + j) % GEM.length], 0.38));
        if ((i + j) % 3 === 0) {
          const c = isoAt(ox, oy, x + tile / 2, y + tile / 2, 1);
          if (!inWell(c.x, c.y, w, h, 12)) {
            ctx.strokeStyle = withAlpha(STRAP[(i + j) % STRAP.length], 0.55);
            ctx.lineWidth = 1.8;
            const s = 14;
            ctx.beginPath();
            ctx.moveTo(c.x, c.y - s);
            ctx.lineTo(c.x + s, c.y);
            ctx.lineTo(c.x, c.y + s);
            ctx.lineTo(c.x - s, c.y);
            ctx.closePath();
            ctx.stroke();
          }
        }
      }
    }
  }

  /* ── cabinets / chests ────────────────────────────────────────── */
  cabinets(cam, w, h) {
    const { ox, oy, room } = cam;
    const spots = [
      [50, room - 280, 200, 130, 230],
      [room - 270, 50, 190, 140, 250],
      [room - 320, room - 300, 240, 150, 100],
      [room * 0.32, room - 240, 170, 120, 85]
    ];
    spots.forEach((s, i) => {
      const c = isoAt(ox, oy, s[0] + s[2] / 2, s[1] + s[3] / 2, s[4] / 2);
      if (inWell(c.x, c.y, w, h, 24)) return;
      isoBox(this.ctx, ox, oy, s[0], s[1], 0, s[2], s[3], s[4],
        withAlpha(GEM[i % GEM.length], 0.42),
        withAlpha(WOOD[i % WOOD.length], 0.92),
        withAlpha(WOOD[(i + 1) % WOOD.length], 0.76),
        bright.amber);
      const face = isoAt(ox, oy, s[0] + s[2], s[1] + s[3] / 2, s[4] * 0.55);
      if (!inWell(face.x, face.y, w, h, 8)) {
        this.ctx.strokeStyle = withAlpha(bright.amber, 0.55);
        this.ctx.lineWidth = 1.4;
        this.ctx.strokeRect(face.x - 18, face.y - 28, 36, 56);
        this.ctx.beginPath();
        this.ctx.arc(face.x + 10, face.y, 3, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    });
  }

  /* ── travelling interlaced straps on iso axes ─────────────────── */
  straps(cam, w, h, motion) {
    const ctx = this.ctx;
    const { ox, oy, room } = cam;
    const t = this.time * 18 * (0.35 + motion * 0.9);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let k = 0; k < 7; k++) {
      const y = 60 + k * (room / 8);
      this.drawTravellingStrap(ctx, ox, oy, w, h, room, t + k * 37, y, "x", k);
    }
    for (let k = 0; k < 6; k++) {
      const x = 70 + k * (room / 7);
      this.drawTravellingStrap(ctx, ox, oy, w, h, room, t * 0.85 + k * 41, x, "y", k + 3);
    }
  }

  drawTravellingStrap(ctx, ox, oy, w, h, room, phase, fixed, axis, seed) {
    const col = STRAP[seed % STRAP.length];
    const hi = STRAP_HI[seed % STRAP_HI.length];
    const width = 9 + (seed % 3) * 1.5;
    const z = 6 + (seed % 4) * 2;
    const step = 12;
    const offset = phase % 48;

    ctx.strokeStyle = col;
    ctx.lineWidth = width;
    ctx.beginPath();
    let started = false;
    for (let u = -40; u <= room + 40; u += step) {
      let x, y;
      if (axis === "x") {
        x = u + offset;
        y = fixed + Math.sin((u + phase) * 0.04) * 10;
      } else {
        x = fixed + Math.sin((u + phase) * 0.04) * 10;
        y = u + offset * 0.9;
      }
      const p = isoAt(ox, oy, x, y, z);
      if (inWell(p.x, p.y, w, h, 8)) { started = false; continue; }
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    ctx.strokeStyle = withAlpha(hi, 0.55);
    ctx.lineWidth = width * 0.35;
    ctx.beginPath();
    started = false;
    for (let u = -40; u <= room + 40; u += step) {
      let x, y;
      if (axis === "x") {
        x = u + offset;
        y = fixed + Math.sin((u + phase) * 0.04) * 10 - 1.5;
      } else {
        x = fixed + Math.sin((u + phase) * 0.04) * 10 - 1.5;
        y = u + offset * 0.9;
      }
      const p = isoAt(ox, oy, x, y, z + 1);
      if (inWell(p.x, p.y, w, h, 8)) { started = false; continue; }
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  /* ── group of period dancers (pavane). One scale. Floor only. ── */
  dancers(cam, w, h, motion) {
    const t = this.time * (4.8 + motion * 3.4);
    const scale = DANCER_PX / 63;
    const head = 36 * scale + 14;
    const foot = 34 * scale;
    const group = [
      { gender: "male", phase: 0.0 },
      { gender: "female", phase: 0.5 },
      { gender: "male", phase: 1.0 },
      { gender: "female", phase: 1.5 },
      { gender: "male", phase: 2.0 },
      { gender: "female", phase: 2.5 },
      { gender: "male", phase: 3.0 },
      { gender: "female", phase: 3.5 }
    ];
    const ctx = this.ctx;
    ctx.save();
    clipFloor(ctx, cam);
    const left = cam.ox - 700;
    const right = cam.ox + 700;
    const well = wellRect(w, h);
    group.forEach((d, i) => {
      const phase = t * 0.85 + d.phase;
      const travel = Math.sin(phase) * 34;
      const u = i / (group.length - 1);
      const seat = seatOnFloor(cam, h, left + (right - left) * u + travel, head, foot, well);
      const bob = Math.abs(Math.sin(t * 2.6 + d.phase)) * 12;
      if (inWell(seat.sx, seat.sy - bob, w, h, 6)) return;
      const facing = Math.sin(phase) * 0.9;
      this.drawDancer(seat.sx, seat.sy - bob, d.gender, t * 1.35 + d.phase, facing, scale);
    });
    ctx.restore();
  }

  /**
   * Single dancer — Ultima-Online-inspired isometric pixel style,
   * Elizabethan / Jacobean silhouette, gemstone colours only.
   */
  drawDancer(sx, sy, gender, t, facing, scale) {
    const ctx = this.ctx;
    const step = Math.sin(t * 3.1);
    const step2 = Math.sin(t * 3.1 + Math.PI);
    const bounce = Math.abs(Math.sin(t * 3.1)) * 2.0;
    const bodyY = sy - bounce;
    const lean = Math.cos(facing) * 1.5;
    const isMale = gender === "male";

    ctx.save();
    ctx.translate(sx + lean, bodyY);
    ctx.scale(scale, scale);

    const hose = isMale ? dark.sapphire : dark.crimson;
    const doublet = isMale ? dark.vermilion : dark.purple;
    const sleeve = isMale ? dark.sardius : dark.scarlet;
    const ruff = bright.pearl;
    const skin = bright.ligure;
    const hair = isMale ? dark.amber : dark.sardius;
    const outline = dark.amber;
    const shoe = dark.sardius;
    const farthingale = dark.amethyst;
    const hat = dark.crimson;

    // Shadow
    ctx.fillStyle = withAlpha(dark.sardius, 0.35);
    ctx.beginPath();
    ctx.ellipse(0, 4, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    const legOff = 5;
    this.limb(ctx, -legOff + step * 8, 8, -legOff + step * 14, 28, hose, outline, 5);
    this.limb(ctx, legOff + step2 * 8, 8, legOff + step2 * 14, 28, hose, outline, 5);
    ctx.fillStyle = shoe;
    ctx.fillRect(-legOff + step * 14 - 4, 26, 9, 5);
    ctx.fillRect(legOff + step2 * 14 - 4, 26, 9, 5);
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1;
    ctx.strokeRect(-legOff + step * 14 - 4, 26, 9, 5);
    ctx.strokeRect(legOff + step2 * 14 - 4, 26, 9, 5);

    if (isMale) {
      // Doublet
      ctx.fillStyle = doublet;
      ctx.beginPath();
      ctx.moveTo(-14, -8); ctx.lineTo(14, -8); ctx.lineTo(12, 14); ctx.lineTo(-12, 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = withAlpha(bright.amber, 0.35);
      ctx.fillRect(-5, -4, 10, 16);
      this.puffSleeve(ctx, -16, 0, step * 3, sleeve, outline);
      this.puffSleeve(ctx, 16, 0, step2 * 3, sleeve, outline);
    } else {
      // Farthingale
      ctx.fillStyle = farthingale;
      ctx.beginPath();
      ctx.moveTo(-10, 2); ctx.lineTo(10, 2); ctx.lineTo(22, 26); ctx.lineTo(-22, 26);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // Bodice
      ctx.fillStyle = doublet;
      ctx.beginPath();
      ctx.moveTo(-11, -10); ctx.lineTo(11, -10); ctx.lineTo(9, 6); ctx.lineTo(-9, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      this.puffSleeve(ctx, -15, -2, step * 2.5, sleeve, outline);
      this.puffSleeve(ctx, 15, -2, step2 * 2.5, sleeve, outline);
    }

    // Ruff
    ctx.fillStyle = ruff;
    ctx.beginPath();
    ctx.ellipse(0, -14, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.strokeStyle = withAlpha(outline, 0.45);
    ctx.lineWidth = 0.8;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 3.5, -18);
      ctx.lineTo(i * 2.2, -10);
      ctx.stroke();
    }

    // Head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -24, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    if (isMale) {
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.arc(0, -27, 8, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = hat;
      ctx.fillRect(-10, -32, 20, 6);
      ctx.strokeStyle = outline;
      ctx.strokeRect(-10, -32, 20, 6);
    } else {
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.ellipse(0, -26, 10, 7, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = bright.pearl;
      ctx.beginPath();
      ctx.ellipse(0, -30, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Face
    ctx.fillStyle = outline;
    ctx.fillRect(-4, -25, 2, 2);
    ctx.fillRect(2, -25, 2, 2);
    ctx.beginPath();
    ctx.arc(0, -21, 2.5, 0.1, Math.PI - 0.1);
    ctx.stroke();

    ctx.restore();
  }

  limb(ctx, x0, y0, x1, y1, fill, stroke, width) {
    ctx.strokeStyle = fill;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  puffSleeve(ctx, side, y, swing, fill, stroke) {
    const x = side + swing;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(x, y, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 8);
    ctx.lineTo(x + side * 0.15, y + 18);
    ctx.lineTo(x + 4, y + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
