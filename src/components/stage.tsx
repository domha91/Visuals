import { useEffect, useRef, useState } from "react";

const NAMES = [
  "Herbarium",
  "Blackwork",
  "Candlewick",
  "Strapwork",
  "Script",
  "Lathe",
  "Firmament",
];

type Engine = {
  setScene: (n: number | string) => void;
  stop: () => void;
  params: { motion: number; oscAt?: number };
};

export function Stage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState(6);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dead = false;
    let engine: Engine | null = null;

    (async () => {
      const boot = await import("../engine/boot.js");
      if (dead || !canvasRef.current) return;
      engine = boot.startEngine(canvasRef.current, {
        params: boot.defaultParams(),
        scene: 6,
        onScene(i: number) {
          setScene(i);
        },
      }) as Engine;
      if (dead) {
        engine.stop();
        return;
      }
      engineRef.current = engine;
      const bridge = window as Window & { __visuals?: Engine };
      bridge.__visuals = engine;

      const osc = await import("../engine/osc.js");
      if (dead) return;
      osc.connectOSC((msg: { address?: string; args?: unknown[] }) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.params.oscAt = performance.now();
        if (msg.address === "/scene") eng.setScene(msg.args?.[0] as number);
        if (msg.address === "/motion") {
          const v = Number(msg.args?.[0]);
          if (Number.isFinite(v)) eng.params.motion = Math.min(1.6, Math.max(0, v));
        }
      });
    })();

    const onKey = (e: KeyboardEvent) => {
      if (/^[0-6]$/.test(e.key)) engineRef.current?.setScene(e.key);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      dead = true;
      window.removeEventListener("keydown", onKey);
      engine?.stop();
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, []);

  return (
    <main className="stage">
      <div className="frame">
        <canvas
          ref={canvasRef}
          id="canvas"
          width={1920}
          height={1080}
          aria-label="Ornamental drafting engine. Firmament is the vaulted cosmography."
        />
      </div>
      <div className="hud">
        <p className="kicker">ornamental drafting engine</p>
        <div className="row">
          {NAMES.map((name, i) => (
            <button
              key={name}
              type="button"
              className={i === scene ? "on" : undefined}
              onClick={() => engineRef.current?.setScene(i)}
            >
              {i} · {name}
            </button>
          ))}
        </div>
        <p className="hint">Keys 0–6 · Firmament is the vault · sun & moon travel the circuit</p>
      </div>
    </main>
  );
}
