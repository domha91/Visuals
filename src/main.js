import { startEngine, defaultParams } from "./engine/boot.js";
import { connectOSC } from "./engine/osc.js";

const NAMES = [
  "Herbarium",
  "Blackwork",
  "Candlewick",
  "Strapwork",
  "Script",
  "Lathe",
  "Firmament"
];

const canvas = document.getElementById("canvas");
const buttonsEl = document.getElementById("buttons");
const buttons = [];

const engine = startEngine(canvas, {
  params: defaultParams(),
  scene: 0,
  onScene(i) {
    buttons.forEach((b, n) => b.classList.toggle("on", n === i));
  }
});

NAMES.forEach((name, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = `${i} · ${name}`;
  if (i === 0) b.classList.add("on");
  b.addEventListener("click", () => engine.setScene(i));
  buttonsEl.appendChild(b);
  buttons.push(b);
});

window.addEventListener("keydown", (e) => {
  if (/^[0-6]$/.test(e.key)) engine.setScene(e.key);
});

connectOSC((msg) => {
  if (msg.address === "/scene") engine.setScene(msg.args?.[0]);
  if (msg.address === "/motion" && engine.params) {
    engine.params.motion = Number(msg.args?.[0]);
  }
});
