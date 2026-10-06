// @ts-nocheck
/**
 * Scene 6 — Biblical cosmographie of a circular earth under the firmament.
 * Period chart: disk of the earth, surrounding ocean, vault of heauen,
 * waters aboue, sunne and moone circuits. Baconian biliteral of selected
 * sentences sits in the background as A/B ticks — never the main figure.
 */
import { bright, dark, withAlpha } from "../palette.js";
import { inWell } from "../well.js";

const CIPHERS = [
  "Jesus is God",
  "Believe on the Lord Jesus Christ and though shalt be saved",
  "Do not be deceived",
  "Satan himself is transformed into an angel of light",
  "Satan was a murderer from the beginning, and abode not in the truth, because there is no truth in him. When he speaketh a lie, he speaketh of his own: for he is a liar, and the father of it."
];

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

const BITS = baconBits(CIPHERS.join(" "));

export class Scene6 {
  constructor(ctx) {
    this.ctx = ctx;
    this.time = 0;
  }

  render(params, w, h) {
    const motion = params.motion ?? 0.32;
    this.time += 0.008 * (0.5 + motion);
    this.baconField(w, h);
    this.vault(w, h, motion);
    this.earthDisk(w, h, motion);
    this.lights(w, h, motion);
    this.labels(w, h);
  }

  baconField(w, h) {
    const ctx = this.ctx;
    const cols = 64, rows = 36;
    const cw = w / cols, ch = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bit = BITS[(r * cols + c) % BITS.length];
        if (inWell(c * cw + cw / 2, r * ch + ch / 2, w, h, 4)) continue;
        ctx.fillStyle = bit
          ? withAlpha(dark.chalcedony, 0.22)
          : withAlpha(dark.amber, 0.16);
        if (bit) ctx.fillRect(c * cw + cw * 0.35, r * ch + 2, cw * 0.28, ch - 4);
        else {
          ctx.beginPath();
          ctx.arc(c * cw + cw * 0.5, r * ch + ch * 0.5, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  vault(w, h) {
    const ctx = this.ctx;
    const cx = w * 0.5, cy = h * 0.62;
    const R = Math.min(w, h) * 0.42;
    ctx.strokeStyle = withAlpha(bright.chalcedony, 0.55);
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx, cy, R + 36, Math.PI, 0);
    ctx.stroke();
    ctx.strokeStyle = withAlpha(bright.crystal, 0.4);
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, R + 52, Math.PI, 0);
    ctx.stroke();
    ctx.strokeStyle = withAlpha(dark.sapphire, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R + 52, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = withAlpha(bright.pearl, 0.7);
    ctx.font = 'italic 13px Palatino, serif';
    ctx.textAlign = "center";
    ctx.fillText("WATERS ABOVE THE FIRMAMENT", cx, cy - R - 62);
    ctx.fillText("FIRMAMENT  ·  HEAUEN", cx, cy - R - 40);
    for (let i = 0; i < 18; i++) {
      const a = Math.PI + (i / 17) * Math.PI;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(this.time * 0.6 + i));
      ctx.fillStyle = withAlpha(bright.topaz, 0.25 + tw * 0.5);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * (R + 20), cy + Math.sin(a) * (R + 20), 2 + tw, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  earthDisk(w, h) {
    const ctx = this.ctx;
    const cx = w * 0.5, cy = h * 0.62;
    const R = Math.min(w, h) * 0.32;
    ctx.fillStyle = withAlpha(dark.chalcedony, 0.55);
    ctx.beginPath();
    ctx.arc(cx, cy, R + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = bright.crystal;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = withAlpha(dark.emerald, 0.55);
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = withAlpha(bright.amber, 0.5);
    ctx.stroke();
    ctx.strokeStyle = withAlpha(bright.amber, 0.45);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - R, cy);
    ctx.lineTo(cx + R, cy);
    ctx.moveTo(cx, cy - R);
    ctx.lineTo(cx, cy + R);
    ctx.stroke();
    ctx.fillStyle = withAlpha(bright.sardius, 0.7);
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = bright.pearl;
    ctx.font = "italic 12px Palatino, serif";
    ctx.textAlign = "center";
    ctx.fillText("Ierusalem", cx, cy - 12);
    const winds = [
      [0, -1, "N"], [1, 0, "E"], [0, 1, "S"], [-1, 0, "W"]
    ];
    winds.forEach((d) => {
      const x = cx + d[0] * (R - 22);
      const y = cy + d[1] * (R - 22);
      ctx.fillStyle = bright.amber;
      ctx.font = "16px Palatino, serif";
      ctx.fillText(d[2], x, y + 5);
    });
    ctx.fillStyle = withAlpha(bright.sapphire, 0.8);
    ctx.font = "italic 13px Palatino, serif";
    ctx.fillText("the circle of the earth", cx, cy + R + 32);
    ctx.fillText("and the foure windes", cx, cy + R + 48);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + this.time * 0.05;
      ctx.strokeStyle = withAlpha(dark.amber, 0.7);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (R + 18), cy + Math.sin(a) * (R + 18));
      ctx.lineTo(cx + Math.cos(a) * (R + 18), cy + Math.sin(a) * (R + 18) + 28);
      ctx.stroke();
    }
  }

  lights(w, h, motion) {
    const ctx = this.ctx;
    const cx = w * 0.5, cy = h * 0.62;
    const R = Math.min(w, h) * 0.38;
    const u = (this.time * 0.08 * (0.5 + motion)) % 2;
    const a = Math.PI + (u % 1) * Math.PI;
    const isSun = u < 1;
    const x = cx + Math.cos(a) * R;
    const y = cy + Math.sin(a) * R;
    ctx.fillStyle = isSun ? bright.topaz : bright.pearl;
    ctx.beginPath();
    ctx.arc(x, y, isSun ? 11 : 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isSun ? bright.amber : bright.agate;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  labels(w, h) {
    const ctx = this.ctx;
    ctx.textAlign = "left";
    ctx.fillStyle = withAlpha(bright.pearl, 0.7);
    ctx.font = "italic 12px Palatino, serif";
    ctx.fillText("Cosmographie of the first creation  ·  Gen. I.", 40, h - 36);
    ctx.textAlign = "right";
    ctx.fillText("he stretcheth out the heauens as a curtaine", w - 40, h - 36);
    ctx.textAlign = "left";
  }
}
