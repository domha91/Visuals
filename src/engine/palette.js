// @ts-nocheck
/**
 * The only colours allowed in the engine.
 * Bright + dark gemstone palettes. No arbitrary hex.
 */
export const bright = {
  diamond: "#C2C4C5",
  pearl: "#C7C4B8",
  amber: "#FDB73F",
  ligure: "#FCB665",
  carbuncle: "#FEB198",
  ruby: "#F9AFC7",
  agate: "#BAC0F9",
  crystal: "#0DD5FE",
  jasper: "#EFFFFF",
  sapphire: "#4DA3FF",
  emerald: "#29FF9A",
  topaz: "#FFD34D",
  beryl: "#3CFFE6",
  chalcedony: "#8FF0FF",
  chrysolyte: "#D7FF3A",
  chrysoprasus: "#7DFFB2",
  sardonyx: "#FF8A6B",
  sardius: "#FF4D5A",
  jacinth: "#FF7AE6",
  amethyst: "#C77DFF"
};

export const dark = {
  sardius: "#A81919",
  vermilion: "#894014",
  amber: "#675210",
  topaz: "#50590D",
  chrysolyte: "#365E0E",
  emerald: "#19620F",
  chrysoprasus: "#0F6224",
  beryl: "#0E6042",
  crystal: "#0E5E5E",
  chalcedony: "#145A83",
  sapphire: "#1E48C7",
  jacinth: "#3F25F6",
  purple: "#751ECB",
  amethyst: "#8F18A0",
  scarlet: "#9C177A",
  crimson: "#A3194D"
};

export const parchment = bright.pearl;
export const ink = dark.amber;

export function withAlpha(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

export function makeSkin({ stemDeep, stem, stemFine, leaf, leaf2, berry, flower, rim, hip }) {
  return {
    stemDeep,
    stem,
    stemFine,
    stemHi: withAlpha(leaf, 0.35),
    leafFill: withAlpha(leaf, 0.38),
    leafFill2: withAlpha(leaf2, 0.32),
    leafStroke: stemDeep,
    vein: withAlpha(stemDeep, 0.7),
    berry,
    berryHi: withAlpha(flower, 0.5),
    flower: withAlpha(flower, 0.82),
    flowerRim: rim,
    gold: rim,
    hip,
    petalInner: berry
  };
}
