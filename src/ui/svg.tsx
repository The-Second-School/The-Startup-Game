// Shared SVG building blocks for the layered flat style.
//  - <Sticker>: draws its children twice: first as a fat white silhouette (the sticker border), then for real.
//    Elements with className "in" are interior details and are skipped in the white copy (cheaper).
//    Stroke-only elements that poke outside the silhouette get className "ln" and style {'--lw': '<width>px'}.
//  - <Shaded>: one flat object = shade colour underneath, base colour shifted up-left and clipped (so a clean
//    bottom-right shadow crescent appears), plus optional highlight elements clipped to the base.
import { useId, type CSSProperties, type ReactElement, type ReactNode, type SVGProps } from 'react';

export const useUid = (p = 'u') => p + useId().replace(/[^a-zA-Z0-9_-]/g, '');

export function Sticker({ w = 6, children }: { w?: number; children: ReactNode }) {
  return (
    <>
      <g className="ui-stk" style={{ '--stk': `${w * 2}px` } as CSSProperties} aria-hidden>{children}</g>
      {children}
    </>
  );
}

type ShapeFn = (p: SVGProps<SVGElement> & Record<string, unknown>) => ReactElement;

export function Shaded({ shape, fill, shade, off = [5, 5], children, className, style }: {
  shape: ShapeFn; fill: string; shade: string; off?: [number, number]; children?: ReactNode; className?: string; style?: CSSProperties;
}) {
  const id = useUid('c');
  return (
    <g className={className} style={style}>
      {shape({ fill: shade })}
      <g className="in">
        <clipPath id={id}>{shape({})}</clipPath>
        <g clipPath={`url(#${id})`}>
          <g transform={`translate(${-off[0]} ${-off[1]})`}>{shape({ fill })}</g>
          {children}
        </g>
      </g>
    </g>
  );
}

// Shape factories (return functions usable as Shaded.shape)
export const circ = (cx: number, cy: number, r: number): ShapeFn => p => <circle cx={cx} cy={cy} r={r} {...(p as SVGProps<SVGCircleElement>)} />;
export const ell = (cx: number, cy: number, rx: number, ry: number): ShapeFn => p => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} {...(p as SVGProps<SVGEllipseElement>)} />;
export const rrect = (x: number, y: number, w: number, h: number, r: number): ShapeFn => p => <rect x={x} y={y} width={w} height={h} rx={r} {...(p as SVGProps<SVGRectElement>)} />;
export const path = (d: string): ShapeFn => p => <path d={d} {...(p as SVGProps<SVGPathElement>)} />;

/** Deterministic PRNG (mulberry32). */
export function rng(seed: number) {
  let a = (seed | 0) ^ 0x9e3779b9;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hash(n: number) {
  let x = (n | 0) + 0x7f4a7c15;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return (x ^ (x >>> 16)) >>> 0;
}

/** Rounded polygon path: corners cut with quadratic curves of radius r. */
export function roundedPoly(pts: [number, number][], r: number): string {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(v1[0], v1[1]), l2 = Math.hypot(v2[0], v2[1]);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const a = [p1[0] + (v1[0] / l1) * rr, p1[1] + (v1[1] / l1) * rr];
    const b = [p1[0] + (v2[0] / l2) * rr, p1[1] + (v2[1] / l2) * rr];
    d += `${i === 0 ? 'M' : 'L'}${a[0].toFixed(2)} ${a[1].toFixed(2)}Q${p1[0].toFixed(2)} ${p1[1].toFixed(2)} ${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
  }
  return d + 'Z';
}
export function starPoints(cx: number, cy: number, n: number, ro: number, ri: number, rot = -Math.PI / 2): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? ri : ro;
    const a = rot + (i * Math.PI) / n;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}
/** Smooth closed blob through points (Catmull-Rom to bezier). */
export function smoothClosed(pts: [number, number][], k = 1): string {
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += `C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d + 'Z';
}
/** Scalloped circle: n bumps around a circle. */
export function scallop(cx: number, cy: number, r: number, n: number, bump: number): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    const am = (a0 + a1) / 2;
    const p0 = [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r];
    const p1 = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r];
    const pc = [cx + Math.cos(am) * (r + bump * 2), cy + Math.sin(am) * (r + bump * 2)];
    d += `${i === 0 ? 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) : ''}Q${pc[0].toFixed(2)} ${pc[1].toFixed(2)} ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`;
  }
  return d + 'Z';
}
/** Superellipse squircle path. */
export function squircle(cx: number, cy: number, r: number, n = 4, steps = 48): string {
  let d = '';
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t), s = Math.sin(t);
    const x = cx + r * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = cy + r * Math.sign(s) * Math.abs(s) ** (2 / n);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d + 'Z';
}
