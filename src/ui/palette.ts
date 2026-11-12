// Colour helpers for the flat layered style. Every colour is a plain hex; no gradients anywhere.
// tones(base) gives the 4 flat stops used by every sticker: hi (top-left highlight), base, shade (bottom-right), edge (lip).

export const INK = '#4A3613';
export const INK_SOFT = '#8A6F3E';
export const WHITE = '#FFFFFF';
export const CREAM = '#FFFBEA';

export const T = {
  bg: '#FFF4C7', bg2: '#FFE99A',
  sun: '#FFC800', sunEdge: '#E0A100', sunHi: '#FFE277',
  paper: '#FFFFFF', paperEdge: '#EED9A0',
  ink: INK, inkSoft: INK_SOFT,
  good: '#58CC02', goodEdge: '#46A302',
  bad: '#FF4B4B', badEdge: '#D93636',
  coin: '#FFB800', coinEdge: '#D68F00',
  fibbot: '#7B4BC9', fibbotEdge: '#5A2F9E',
  blue: '#1CB0F6', blueEdge: '#1395D4',
  purple: '#CE82FF', orange: '#FF9600', pink: '#FF6FB5',
} as const;

type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgbToHex([r, g, b]: RGB): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}
function rgbToHsl([r, g, b]: RGB): RGB {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}
function hslToRgb([h, s, l]: RGB): RGB {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

/** Mix two hex colours, t = 0 gives a, t = 1 gives b. */
export function mix(a: string, b: string, t: number): string {
  const x = hexToRgb(a), y = hexToRgb(b);
  return rgbToHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}
/** Darken by lowering HSL lightness (keeps the hue, adds a hair of saturation so shadows stay juicy). */
export function darken(hex: string, amt: number): string {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb([h, Math.min(1, s + amt * 0.25), Math.max(0, l - amt)]));
}
export const lighten = (hex: string, amt: number) => mix(hex, '#FFFFFF', amt);

export function luminance(hex: string): number {
  const ch = hexToRgb(hex).map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
/** Text colour for a fill: ink on anything light or vivid, white only on dark edge shades. */
export function inkOn(fill: string): string {
  return luminance(fill) < 0.16 ? '#FFFFFF' : INK;
}

export interface Tones { hi: string; base: string; shade: string; edge: string }
const toneCache = new Map<string, Tones>();
export function tones(base: string): Tones {
  const hit = toneCache.get(base);
  if (hit) return hit;
  const t = { hi: lighten(base, 0.42), base, shade: darken(base, 0.09), edge: darken(base, 0.18) };
  toneCache.set(base, t);
  return t;
}
export const edgeOf = (c: string) => tones(c).edge;
