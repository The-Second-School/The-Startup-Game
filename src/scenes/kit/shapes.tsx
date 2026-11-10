// Layered flat SVG primitives: flat fill + clipped highlight + even white sticker border (no bottom-only lips).
import { useId, type ReactNode } from 'react';
import type { Hue } from './palette';

type SlabProps = {
  x: number; y: number; w: number; h: number; r?: number;
  hue: Hue; lip?: number; border?: number; hiScale?: number; children?: ReactNode;
};
/** Rounded rectangle: flat fill + clipped highlight + even white sticker border. `lip` is accepted for API
 *  compatibility but ignored (no bottom-only lips); a border > 0 draws an even white outline on all sides. */
export function Slab({ x, y, w, h, r = 24, hue, border = 0, hiScale = 1, children }: SlabProps) {
  const id = useId().replace(/:/g, '');
  const rr = Math.min(r, w / 2, h / 2);
  return (
    <g>
      {border > 0 && <rect x={x - border} y={y - border} width={w + border * 2} height={h + border * 2} rx={rr + border} fill="#fff" />}
      <rect x={x} y={y} width={w} height={h} rx={rr} fill={hue.base} />
      <clipPath id={`c${id}`}><rect x={x} y={y} width={w} height={h} rx={rr} /></clipPath>
      <g clipPath={`url(#c${id})`}>
        <ellipse cx={x + w * 0.18} cy={y + h * 0.12} rx={w * 0.42 * hiScale} ry={h * 0.32 * hiScale} fill={hue.hi} opacity={0.5} />
        {children}
      </g>
    </g>
  );
}

/** Circle: flat fill, soft highlight (top-left), even white border. `lip` ignored. */
export function Ball({ cx, cy, r, hue, border = 0, glint = true }: { cx: number; cy: number; r: number; hue: Hue; lip?: number; border?: number; glint?: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <g>
      {border > 0 && <circle cx={cx} cy={cy} r={r + border} fill="#fff" />}
      <circle cx={cx} cy={cy} r={r} fill={hue.base} />
      <clipPath id={`b${id}`}><circle cx={cx} cy={cy} r={r} /></clipPath>
      <g clipPath={`url(#b${id})`}>
        <circle cx={cx - r * 0.38} cy={cy - r * 0.42} r={r * 0.55} fill={hue.hi} opacity={0.6} />
      </g>
      {glint && <ellipse cx={cx - r * 0.42} cy={cy - r * 0.5} rx={r * 0.16} ry={r * 0.1} fill="#fff" opacity={0.85} transform={`rotate(-35 ${cx - r * 0.42} ${cy - r * 0.5})`} />}
    </g>
  );
}

/** Any closed path: even white border (stroke), flat fill, clipped highlight. `lip` ignored. */
export function Shape({ d, hue, border = 0, hi }: { d: string; hue: Hue; lip?: number; border?: number; hi?: { cx: number; cy: number; rx: number; ry: number }; shade?: { cx: number; cy: number; r: number } | boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <g>
      {border > 0 && <path d={d} fill="#fff" stroke="#fff" strokeWidth={border * 2} strokeLinejoin="round" />}
      <path d={d} fill={hue.base} />
      {hi && (
        <>
          <clipPath id={`s${id}`}><path d={d} /></clipPath>
          <g clipPath={`url(#s${id})`}><ellipse cx={hi.cx} cy={hi.cy} rx={hi.rx} ry={hi.ry} fill={hue.hi} opacity={0.6} /></g>
        </>
      )}
    </g>
  );
}

/** Soft flat cloud from overlapping circles. w is the width. */
export function CloudShape({ x, y, w, fill = '#fff', edge = '#FFD9A8' }: { x: number; y: number; w: number; fill?: string; edge?: string }) {
  const s = w / 300;
  const bumps = [[60, 70, 50], [130, 45, 66], [210, 62, 52], [250, 84, 38], [40, 92, 32]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={5} y={79} width={290} height={46} rx={23} fill={edge} />
      {bumps.map(([cx, cy, r], i) => <circle key={`e${i}`} cx={cx} cy={cy} r={r + 5} fill={edge} />)}
      <rect x={10} y={84} width={280} height={36} rx={18} fill={fill} />
      {bumps.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={fill} />)}
    </g>
  );
}

/** 5-point star path centred at 0,0. */
export const starPath = (R: number, r = R * 0.48, n = 5) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 ? r : R;
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * rad).toFixed(1)} ${(Math.sin(a) * rad).toFixed(1)}`;
  }
  return d + 'Z';
};

/** Gear path centred at 0,0 with rounded-ish teeth. */
export const gearPath = (R: number, teeth = 10, depth = R * 0.2) => {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const seg = [
      [a - step * 0.5, R - depth], [a - step * 0.22, R - depth], [a - step * 0.14, R], [a + step * 0.14, R], [a + step * 0.22, R - depth],
    ];
    for (const [ang, rad] of seg) pts.push(`${(Math.cos(ang) * rad).toFixed(1)} ${(Math.sin(ang) * rad).toFixed(1)}`);
  }
  return `M${pts.join(' L')}Z`;
};

/** Deterministic pseudo random from a seed (for layouts that must not jump between renders). */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
