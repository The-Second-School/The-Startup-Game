// Scenes artist C: shared helpers for acts 4/5, Show Day, finale and the later question intros.
// Builds on ../artb/core (flat colours, white sticker borders, transform/opacity-only animation).
import { motion } from 'motion/react';
import { memo, type CSSProperties, type ReactNode } from 'react';
import { C, Svg, Abs, cssVars } from '../artb/core';

/** One pose of a moving object: stage px offset (x,y), scale s, rotation r (deg), opacity o. */
export interface Pose { x: number; y: number; s?: number; r?: number; o?: number }
export const V = (x: number, y: number, s = 1, r = 0): Pose => ({ x, y, s, r, o: 1 });
export const H = (x: number, y: number, s = 0.4): Pose => ({ x, y, s, r: 0, o: 0 });
const cv = (q: Pose) => ({ x: q.x, y: q.y, scale: q.s ?? 1, rotate: q.r ?? 0, opacity: q.o ?? 1 });

/** Moves its children to the pose for the current beat (springs). Children draw from top-left (0,0). */
export function Mv({ beat, to, from, origin = '50% 100%', delay = 0, stiff = 140, damp = 15, z, children }: {
  beat: number; to: Pose[]; from?: Pose; origin?: string; delay?: number; stiff?: number; damp?: number; z?: number; children?: ReactNode;
}) {
  const p = to[Math.max(0, Math.min(beat, to.length - 1))];
  return (
    <motion.div initial={cv(from ?? to[0])} animate={cv(p)} transition={{ type: 'spring', stiffness: stiff, damping: damp, delay }}
      style={{ position: 'absolute', left: 0, top: 0, transformOrigin: origin, zIndex: z }}>
      {children}
    </motion.div>
  );
}

// ---------- water ----------
function WaveStrip({ y, color, d, flip = false }: { y: number; color: string; d: number; flip?: boolean }) {
  const arcs = Array.from({ length: 19 }, (_, i) => `A60 44 0 0 1 ${(i + 1) * 120} 50`).join(' ');
  return (
    <div className="wave" style={cssVars({ position: 'absolute', left: flip ? -120 : 0, top: y, width: 2280, height: 1080 - y, ['--d']: `${d}s` })}>
      <svg width={2280} height={1080 - y + 60} viewBox={`0 0 2280 ${1080 - y + 60}`} style={{ display: 'block', overflow: 'visible' }}>
        <path d={`M0 50 ${arcs} V${1080 - y + 60} H0Z`} fill={color} />
      </svg>
    </div>
  );
}
/** Back water: draw before boats. */
function SeaBackBase({ y = 700 }: { y?: number }) {
  return (<><div style={{ position: 'absolute', left: 0, top: y + 40, width: 1920, height: 1080 - y, background: C.water2 }} /><WaveStrip y={y - 10} color={C.water} d={7} /><WaveStrip y={y + 50} color={C.water2} d={5} flip /></>);
}
/** Front water: draw after boats so hulls sit in the sea. */
function SeaFrontBase({ y = 770 }: { y?: number }) {
  return (<><WaveStrip y={y} color={C.water3} d={4.5} /><div style={{ position: 'absolute', left: 0, top: y + 90, width: 1920, height: 1080, background: C.water3 }} /></>);
}

// ---------- town pieces ----------
/** Soft two-layer skyline strip, bottom at y. */
function SkylineBase({ y, color = C.sky2, accent = C.sky, seed = 3 }: { y: number; color?: string; accent?: string; seed?: number }) {
  const bs = Array.from({ length: 18 }, (_, i) => ({ x: i * 112 - 20, w: 96 + ((i * 37 + seed * 11) % 40), h: 120 + ((i * 53 + seed * 29) % 190) }));
  return (
    <svg width={1920} height={340} viewBox="0 0 1920 340" style={{ position: 'absolute', left: 0, top: y - 340, overflow: 'visible' }} strokeLinejoin="round">
      {bs.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={340 - b.h} width={b.w} height={b.h} rx={16} fill={i % 2 ? color : accent} />
          {i % 4 === 1 && <rect x={b.x + b.w / 2 - 4} y={340 - b.h - 40} width={8} height={44} rx={4} fill={color} />}
          {Array.from({ length: 3 }, (_, r) => <rect key={r} x={b.x + 18} y={340 - b.h + 26 + r * 40} width={b.w - 36} height={14} rx={7} fill="#fff" opacity={0.55} />)}
        </g>
      ))}
    </svg>
  );
}

/** Startup building by stage 0 stall, 1 shop, 2 office, 3 tower. Bottom edge = height s*2.1. */
export function Bld({ k, s = 200, hue = C.blue, edge = C.blueEdge, hi = C.blueHi }: { k: 0 | 1 | 2 | 3; s?: number; hue?: string; edge?: string; hi?: string }) {
  const spec = [{ w: 140, h: 110, rows: 1, cols: 2 }, { w: 160, h: 170, rows: 2, cols: 2 }, { w: 150, h: 270, rows: 4, cols: 2 }, { w: 130, h: 400, rows: 6, cols: 2 }][k];
  const x0 = (200 - spec.w) / 2, y0 = 420 - spec.h;
  return (
    <Svg vw={200} vh={420} w={s}>
      <rect x={x0} y={y0} width={spec.w} height={spec.h} rx={22} fill="#fff" stroke="#fff" strokeWidth={14} />
      {k === 3 && <><line x1={100} y1={y0 - 6} x2={100} y2={y0 - 54} stroke={C.ink} strokeWidth={7} /><circle cx={100} cy={y0 - 58} r={10} fill={C.bad} className="pulse" style={{ transformOrigin: `100px ${y0 - 58}px`, ['--d' as string]: '.9s' } as CSSProperties} /></>}
      <rect x={x0} y={y0} width={spec.w} height={spec.h} rx={22} fill={hue} />
      <rect x={x0 + 12} y={y0 + 10} width={spec.w * 0.4} height={10} rx={5} fill={hi} />
      {Array.from({ length: spec.rows * spec.cols }, (_, i) => {
        const r = Math.floor(i / spec.cols), c = i % spec.cols, ww = (spec.w - 60) / spec.cols - 8;
        return <rect key={i} x={x0 + 24 + c * (ww + 12)} y={y0 + 30 + r * 52} width={ww} height={34} rx={10} fill={(i * 7) % 5 === 0 ? C.sunHi : '#fff'} opacity={k === 0 ? 0 : 1} />;
      })}
      <rect x={100 - 22} y={380} width={44} height={40} rx={14} fill={edge} />
      {k < 2 && <g>
        <path d={`M${x0 - 14} ${y0 + 6} H${x0 + spec.w + 14} V${y0 + 40} A${(spec.w + 28) / 6} 20 0 0 1 ${x0 + spec.w - (spec.w + 28) / 3 + 14} ${y0 + 40} A${(spec.w + 28) / 6} 20 0 0 1 ${x0 + 14 + (spec.w + 28) / 3 - 28} ${y0 + 40} A${(spec.w + 28) / 6} 20 0 0 1 ${x0 - 14} ${y0 + 40}Z`} fill={C.bad} stroke="#fff" strokeWidth={6} paintOrder="stroke" />
        <path d={`M${x0 + 20} ${y0 + 6} H${x0 + 44} V${y0 + 40} H${x0 + 20}Z`} fill="#fff" opacity={0.8} />
      </g>}
    </Svg>
  );
}

/** Wooden crate with a star stamp; label is stamped under it (>= 44 px). */
export function Crate({ s = 360, label, style, className }: { s?: number; label?: string; style?: CSSProperties; className?: string }) {
  return (
    <Svg vw={300} vh={260} w={s} style={style} className={className}>
      <rect x={10} y={20} width={280} height={230} rx={30} fill="#fff" stroke="#fff" strokeWidth={12} />
      <rect x={10} y={20} width={280} height={220} rx={30} fill={C.wood} />
      <rect x={30} y={34} width={90} height={12} rx={6} fill={C.woodHi} />
      <path d="M22 70 H278 M22 150 H278" stroke={C.woodEdge} strokeWidth={10} />
      <path d="M40 40 L260 230 M260 40 L40 230" stroke={C.woodEdge} strokeWidth={0} />
      <rect x={60} y={80} width={180} height={140} rx={24} fill="#fff" stroke={C.sunEdge} strokeWidth={6} />
      {label ? <text x={150} y={176} textAnchor="middle" fontFamily="'Baloo 2', system-ui" fontWeight={800} fontSize={56} fill={C.ink}>{label}</text>
        : <polygon points="150,92 164,128 202,128 172,150 184,190 150,166 116,190 128,150 98,128 136,128" fill={C.sun} stroke={C.sunEdge} strokeWidth={6} />}
    </Svg>
  );
}

/** Heart sticker. */
export function Heart({ s = 70, color = C.pink, edge: _e = C.pinkEdge, style, className }: { s?: number; color?: string; edge?: string; style?: CSSProperties; className?: string }) {
  const d = 'M50 86 C10 58 6 36 22 22 C36 10 50 20 50 32 C50 20 64 10 78 22 C94 36 90 58 50 86Z';
  return (
    <Svg vw={100} vh={100} w={s} style={style} className={className}>
      <path d={d} fill="#fff" stroke="#fff" strokeWidth={14} />
      <path d={d} fill={color} />
      <path d="M22 34 Q26 24 36 24" stroke="#fff" strokeWidth={6} fill="none" opacity={0.7} />
    </Svg>
  );
}

/** Wooden pier slab. */
function PierBase({ x = 0, y = 730, w = 1100 }: { x?: number; y?: number; w?: number }) {
  return (
    <Abs x={x} y={y} z={1}>
      {[80, w / 2, w - 80].map((px, i) => <div key={i} style={{ position: 'absolute', left: px - 20, top: 40, width: 40, height: 320, borderRadius: 20, background: C.woodEdge }} />)}
      <div style={{ position: 'absolute', left: 0, top: -6, width: w, height: 58, borderRadius: 24, background: C.wood, border: '6px solid #fff' }}>
        <div style={{ position: 'absolute', left: 30, top: 8, width: 240, height: 12, borderRadius: 6, background: C.woodHi }} />
      </div>
    </Abs>
  );
}

/** Market stall, 300 x 260. */
export function Stall({ s = 300, color = C.bad, edge: _e = C.badEdge, style }: { s?: number; color?: string; edge?: string; style?: CSSProperties }) {
  return (
    <Svg vw={300} vh={260} w={s} style={style}>
      <rect x={34} y={96} width={14} height={150} rx={7} fill={C.woodEdge} /><rect x={252} y={96} width={14} height={150} rx={7} fill={C.woodEdge} />
      <rect x={20} y={176} width={260} height={74} rx={16} fill="#fff" stroke="#fff" strokeWidth={8} />
      <rect x={20} y={172} width={260} height={74} rx={16} fill={C.wood} />
      <rect x={34} y={180} width={90} height={12} rx={6} fill={C.woodHi} />
      <circle cx={80} cy={160} r={18} fill={C.bad} /><circle cx={118} cy={162} r={16} fill={C.orange} /><circle cx={160} cy={158} r={18} fill={C.good} /><circle cx={202} cy={162} r={16} fill={C.sun} />
      {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${i * 56 + 8} 30 H${i * 56 + 64} V86 A28 28 0 0 1 ${i * 56 + 8} 86Z`} fill={i % 2 ? '#fff' : color} />)}
      <rect x={0} y={0} width={300} height={34} rx={17} fill={color} />
      <rect x={20} y={7} width={120} height={9} rx={4.5} fill="#fff" opacity={0.4} />
    </Svg>
  );
}

/** Static layers: memoised so beat changes never re-render them. */
export const SeaBack = memo(SeaBackBase);
export const SeaFront = memo(SeaFrontBase);
export const Skyline = memo(SkylineBase);
export const Pier = memo(PierBase);
