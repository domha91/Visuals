// @ts-nocheck
/**
 * Project typefaces — load via @font-face in index.html.
 *
 * KJV1611     — headings (Scene 4 Script, and any future titled text)
 * NanumGothic — Regular body, Bold emphasis, ExtraBold display weight
 *
 * Only Scene 4 currently prints text / drawn calligraphy.
 * Do not invent decorative copy in other scenes just to exercise fonts.
 */
export const FONT = {
  /** Headings, running titles, chapter heads */
  heading: '"KJV1611", "IM Fell English", serif',
  /** Body / normal text */
  body: '"NanumGothic", "Nanum Gothic", system-ui, sans-serif',
  /** Strong emphasis */
  bold: '"NanumGothic", "Nanum Gothic", system-ui, sans-serif',
  /** Heavy display weight */
  extraBold: '"NanumGothic", "Nanum Gothic", system-ui, sans-serif',
  /** Drawn / handwritten calligraphic annotations (Scene 4) */
  hand: 'italic "NanumGothic", "Iowan Old Style", cursive'
};

/** Canvas font strings */
export function headingFont(px) {
  return `${px}px ${FONT.heading}`;
}
export function bodyFont(px, weight = 400) {
  const w = weight >= 800 ? 800 : weight >= 700 ? 700 : 400;
  return `${w} ${px}px ${FONT.body}`;
}
export function handFont(px) {
  return `italic ${px}px ${FONT.hand}`;
}
