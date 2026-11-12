// Flat colour stops for scene art. Each hue: hi (highlight), base, edge (lip / shadow).
export const INK = '#4A3613';
export const INK_SOFT = '#8A6F3E';
export const WHITE = '#FFFFFF';

export type Hue = { hi: string; base: string; edge: string };
export const HUE = {
  sun: { hi: '#FFE680', base: '#FFC800', edge: '#E0A100' },
  gold: { hi: '#FFE680', base: '#FFC21A', edge: '#D99A00' },
  coin: { hi: '#FFDA66', base: '#FFB800', edge: '#D68F00' },
  red: { hi: '#FF8F8F', base: '#FF4B4B', edge: '#D93636' },
  coral: { hi: '#FFAB94', base: '#FF8466', edge: '#DB6247' },
  orange: { hi: '#FFC06B', base: '#FF9600', edge: '#E07F00' },
  saffron: { hi: '#FFC873', base: '#FFA31A', edge: '#E0850A' },
  green: { hi: '#9BE35A', base: '#58CC02', edge: '#46A302' },
  mint: { hi: '#7FE8CF', base: '#1FC8A0', edge: '#139A78' },
  teal: { hi: '#86E3DE', base: '#3CC6C0', edge: '#2A9C97' },
  blue: { hi: '#7DD3FA', base: '#1CB0F6', edge: '#1395D4' },
  sky: { hi: '#B8E8FF', base: '#7FD0F7', edge: '#4FB0E0' },
  purple: { hi: '#E2B5FF', base: '#CE82FF', edge: '#B05EE8' },
  fibbot: { hi: '#A07AE0', base: '#7B4BC9', edge: '#5A2F9E' },
  pink: { hi: '#FFB3D8', base: '#FF6FB5', edge: '#E5539A' },
  cream: { hi: '#FFFFFF', base: '#FFF6DE', edge: '#EED9A0' },
  paper: { hi: '#FFFFFF', base: '#FFFFFF', edge: '#EED9A0' },
  stone: { hi: '#E8DCCB', base: '#CBB89E', edge: '#A8937A' },
  road: { hi: '#DDD3C6', base: '#C8BCAD', edge: '#ADA091' },
  wood: { hi: '#D9A066', base: '#B97A3D', edge: '#8F5A27' },
  steel: { hi: '#E4EBF0', base: '#B8C6D1', edge: '#8DA0AE' },
  tank: { hi: '#7A6A5A', base: '#4F4236', edge: '#3A2F25' },
} satisfies Record<string, Hue>;

export const SKIN = ['#C98B5E', '#A86B45', '#E0A97F', '#8C5A3C', '#B97A50'] as const;
export const HAIR = ['#3A2414', '#24170D', '#5A3A1E', '#2E1D10'] as const;

/** Sky palettes. Flat bands from top to horizon. */
export const SKIES = {
  sunrise: { bands: ['#FFF7E3', '#FFF1D2', '#FFEAC2'], sun: HUE.sun, far: '#FFE0B0', farWin: '#FFF7E3', cloud: '#FFFFFF', cloudEdge: '#FFE3BF' },
  day: { bands: ['#E3F5FF', '#D3EEFD', '#C3E7FB'], sun: HUE.sun, far: '#BFE0F2', farWin: '#E9F7FF', cloud: '#FFFFFF', cloudEdge: '#DDF0FB' },
  storm: { bands: ['#D9CBF2', '#CDBBEC', '#C1ABE6'], sun: HUE.purple, far: '#B39BDB', farWin: '#E6D8FF', cloud: '#9C84CC', cloudEdge: '#8870BA' },
  gold: { bands: ['#FFF4CE', '#FFEDB8', '#FFE6A3'], sun: HUE.sun, far: '#FFDC8A', farWin: '#FFF4CE', cloud: '#FFFFFF', cloudEdge: '#FFE9B0' },
  stage: { bands: ['#7A5BC0', '#8666C8', '#9475D0'], sun: HUE.gold, far: '#6A4BB0', farWin: '#B79CE8', cloud: '#A58BDB', cloudEdge: '#8F74C8' },
} as const;
export type SkyTone = keyof typeof SKIES;

/** Calmer, lighter version of a hue for backgrounds and big scenery (mixes toward white). */
export function soft(h: Hue, t = 0.3): Hue {
  const mix = (hex: string, k: number) => {
    const n = parseInt(hex.slice(1), 16);
    const m = (v: number) => Math.round(v + (255 - v) * k).toString(16).padStart(2, '0');
    return `#${m((n >> 16) & 255)}${m((n >> 8) & 255)}${m(n & 255)}`;
  };
  return { hi: mix(h.hi, t * 0.6), base: mix(h.base, t), edge: mix(h.edge, t) };
}
