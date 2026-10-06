// @ts-nocheck
import { parchment, bright, dark, withAlpha } from "./palette.js";
import { punchWell, frameWell, wellFillFor } from "./well.js";
import { Scene0 } from "./scenes/scene0.js";
import { Scene1 } from "./scenes/scene1.js";
import { Scene2 } from "./scenes/scene2.js";
import { Scene3 } from "./scenes/scene3.js";
import { Scene4 } from "./scenes/scene4.js";
import { Scene5 } from "./scenes/scene5.js";
import { Scene6 } from "./scenes/scene6.js";

export const SCENE_COUNT = 7;

export function defaultParams() {
  return {
    density: 0.72,
    continuity: 0.74,
    splinePersistence: 0.68,
    contourComplexity: 0.55,
    structuralWeight: 0.55,
    microtexture: 0.55,
    floralEmergence: 0.7,
    motion: 0.32
  };
}

export function startEngine(canvas, options = {}) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const W = canvas.width;
  const H = canvas.height;
  const params = options.params || defaultParams();
  const scenes = {
    0: new Scene0(ctx),
    1: new Scene1(ctx),
    2: new Scene2(ctx),
    3: new Scene3(ctx),
    4: new Scene4(ctx),
    5: new Scene5(ctx),
    6: new Scene6(ctx)
  };
  let current = options.scene ?? 0;
  let instance = scenes[current];
  let raf = 0;
  let running = true;

  function groundFill() {
    if (current === 1) return bright.pearl;
    if (current === 3) return dark.amber;
    if (current === 5) return dark.vermilion;
    if (current === 6) return dark.crystal;
    return parchment;
  }

  function ground() {
    ctx.fillStyle = groundFill();
    ctx.fillRect(0, 0, W, H);
    if (current === 1 || current === 3 || current === 5 || current === 6) return;
    ctx.strokeStyle = withAlpha(dark.amber, 0.08);
    ctx.lineWidth = 1;
    const step = current === 2 ? 6 : 7;
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function frameStroke() {
    if (current === 3 || current === 5 || current === 6) return bright.amber;
    if (current === 1) return dark.sardius;
    return dark.amber;
  }

  function frame() {
    if (!running) return;
    ground();
    instance.render(params, W, H);
    if (current !== 4) {
      punchWell(ctx, W, H, wellFillFor(current));
      frameWell(ctx, W, H, withAlpha(frameStroke(), 0.65));
    }
    raf = requestAnimationFrame(frame);
  }
  frame();

  return {
    params,
    getScene: () => current,
    setScene(n) {
      let i = Number(n);
      if (i === 7) i = 6;
      if (i < 0 || i > 6) return;
      current = i;
      instance = scenes[i];
      options.onScene?.(i);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    }
  };
}
