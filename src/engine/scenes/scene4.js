// @ts-nocheck
/**
 * Scene 4 — 1611 King James page. No terminal well.
 * Blackletter body + roman heads + handwritten italic annotations.
 * Elaborate woodcut initials. Text from /kjv1611.json (1611 spelling).
 */
import { bright, dark, withAlpha } from "../palette.js";

const INK = dark.sardius;
const RUBRIC = dark.crimson;
const ROMAN = '"IM Fell DW Pica", Palatino, "Times New Roman", serif';
const BLACK = 'UnifrakturMaguntia, "IM Fell English", Palatino, serif';
const HAND = 'italic Palatino, "Iowan Old Style", Italianno, cursive';

export class Scene4 {
  constructor(ctx) {
    this.ctx = ctx;
    this.time = 0;
    this.data = null;
    this.load();
  }

  async load() {
    try {
      const r = await fetch("/kjv1611.json");
      this.data = await r.json();
    } catch {
      this.data = { passages: [] };
    }
  }

  render(params, w, h) {
    const motion = params.motion ?? 0.32;
    this.time += 0.008 * (0.5 + motion);
    this.paper(w, h);
    const passages = this.data?.passages || [];
    if (!passages.length) {
      this.fallback(w, h);
      return;
    }
    const p = passages[Math.floor(this.time / 22) % passages.length];
    this.headpiece(w);
    this.running(w, p);
    this.columns(w, h, p);
  }

  paper(w, h) {
    const ctx = this.ctx;
    ctx.strokeStyle = withAlpha(dark.sardius, 0.45);
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 22, w - 56, h - 44);
    ctx.strokeStyle = withAlpha(dark.amber, 0.25);
    ctx.lineWidth = 0.8;
    ctx.strokeRect(36, 30, w - 72, h - 60);
  }

  headpiece(w) {
    const ctx = this.ctx;
    const y = 48;
    ctx.strokeStyle = dark.sardius;
    ctx.fillStyle = withAlpha(dark.sardius, 0.12);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.quadraticCurveTo(w * 0.5, y - 18, w - 60, y);
    ctx.quadraticCurveTo(w * 0.5, y + 22, 60, y);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 9; i++) {
      const x = 80 + i * ((w - 160) / 8);
      ctx.strokeStyle = i % 2 ? bright.amber : dark.crimson;
      ctx.beginPath();
      ctx.arc(x, y + 2, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  running(w, p) {
    const ctx = this.ctx;
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.font = `italic 40px ${ROMAN}`;
    ctx.fillText(p.running || p.book, w * 0.5, 92);
    ctx.font = `28px ${ROMAN}`;
    ctx.fillStyle = RUBRIC;
    ctx.fillText(`Chap. ${this.roman(p.chapter)}.`, w * 0.5, 128);
    ctx.fillStyle = INK;
    ctx.font = `italic 24px ${ROMAN}`;
    ctx.fillText(p.head || "", w * 0.5, 158);
    ctx.textAlign = "left";
  }

  columns(w, h, p) {
    const gutter = 36;
    const left = 64;
    const right = w - 64;
    const mid = (left + right) / 2;
    const colW = (right - left - gutter) / 2;
    const verses = p.verses || [];
    const split = Math.ceil(verses.length / 2);
    this.drawCol(left, 188, colW, h - 70, verses.slice(0, split), true);
    this.drawCol(mid + gutter / 2, 188, colW, h - 70, verses.slice(split), false);
  }

  drawCol(x, y, colW, yMax, verses, drop) {
    const ctx = this.ctx;
    let cy = y;
    verses.forEach((v, vi) => {
      if (cy > yMax - 40) return;
      const hand = (v.n + vi) % 3 === 2;
      if (drop && vi === 0) {
        const ch = (v.text[0] || "I").toUpperCase();
        this.initial(x, cy, ch);
        ctx.fillStyle = INK;
        ctx.font = `36px ${BLACK}`;
        const rest = v.text.slice(1);
        cy = this.flow(x + 92, cy, colW - 92, rest, `36px ${BLACK}`);
      } else if (hand) {
        ctx.fillStyle = dark.chalcedony;
        ctx.font = `36px ${HAND}`;
        cy = this.flow(x, cy, colW, `${v.n}  ${v.text}`, `36px ${HAND}`);
      } else {
        ctx.fillStyle = INK;
        ctx.font = `34px ${BLACK}`;
        cy = this.flow(x, cy, colW, `${v.n}  ${v.text}`, `34px ${BLACK}`);
      }
      cy += 16;
    });
  }

  flow(x, y, maxW, text, font) {
    const ctx = this.ctx;
    ctx.font = font;
    ctx.textBaseline = "top";
    const words = text.split(" ");
    let line = "";
    let cy = y;
    const lh = 44;
    for (const word of words) {
      const trial = line ? line + " " + word : word;
      if (ctx.measureText(trial).width > maxW && line) {
        ctx.fillText(line, x, cy);
        cy += lh;
        line = word;
      } else line = trial;
    }
    if (line) {
      ctx.fillText(line, x, cy);
      cy += lh;
    }
    return cy;
  }

  initial(x, y, ch) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = withAlpha(dark.sardius, 0.12);
    ctx.strokeStyle = dark.sardius;
    ctx.lineWidth = 1.4;
    ctx.fillRect(x, y, 80, 88);
    ctx.strokeRect(x, y, 80, 88);
    ctx.strokeStyle = bright.amber;
    ctx.strokeRect(x + 6, y + 6, 68, 76);
    ctx.strokeStyle = dark.emerald;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 80);
    ctx.quadraticCurveTo(x + 40, y + 12, x + 70, y + 80);
    ctx.stroke();
    ctx.fillStyle = dark.crimson;
    ctx.font = `58px ${BLACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ch, x + 40, y + 46);
    ctx.textAlign = "left";
    ctx.restore();
  }

  roman(n) {
    const map = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    let s = "", v = n;
    for (const [k, g] of map) {
      while (v >= k) { s += g; v -= k; }
    }
    return s || "I";
  }

  fallback(w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = INK;
    ctx.font = `24px ${ROMAN}`;
    ctx.fillText("Loading the 1611 text…", 80, h * 0.5);
  }
}
