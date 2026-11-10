// Motion helpers for scenes: spring presets, camera + parallax layers, beat sub-steps, wipes, flashes, confetti.
import { AnimatePresence, motion } from 'motion/react';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { rng } from './shapes';

export const SPRING = {
  pop: { type: 'spring', stiffness: 420, damping: 18 },
  hero: { type: 'spring', stiffness: 260, damping: 12 },
  move: { type: 'spring', stiffness: 300, damping: 26 },
  settle: { type: 'spring', stiffness: 200, damping: 22 },
  cam: { type: 'spring', stiffness: 40, damping: 16, mass: 1.2 },
  snappy: { type: 'spring', stiffness: 600, damping: 22 },
} as const;
export const EASE = { backOut: [0.34, 1.56, 0.64, 1], exit: [0.4, 0, 1, 1], settle: [0.22, 1, 0.36, 1] } as const;

/** Full-stage absolutely positioned box (1920x1080). */
export const full: CSSProperties = { position: 'absolute', left: 0, top: 0, width: 1920, height: 1080 };

// ---------- Camera + parallax ----------
export type Cam = { x: number; y?: number; zoom?: number };
const CamCtx = createContext<Cam>({ x: 0, y: 0, zoom: 1 });

/** Provides a camera to its <Layer>s. x/y are world pixels at depth 1; zoom 1 = normal. Springs smoothly. */
export function World({ cam, children, style }: { cam: Cam; children: ReactNode; style?: CSSProperties }) {
  return <CamCtx.Provider value={cam}><div style={{ ...full, overflow: 'visible', ...style }}>{children}</div></CamCtx.Provider>;
}

/** One parallax layer. depth 0 = fixed (sky), 1 = moves with camera, >1 = foreground (moves faster). */
export function Layer({ depth = 1, children, style, transition }: { depth?: number; children: ReactNode; style?: CSSProperties; transition?: object }) {
  const cam = useContext(CamCtx);
  const zoom = 1 + ((cam.zoom ?? 1) - 1) * depth;
  return (
    <motion.div style={{ ...full, transformOrigin: '960px 640px', ...style }}
      initial={false}
      animate={{ x: -cam.x * depth, y: -(cam.y ?? 0) * depth, scale: zoom }}
      transition={transition ?? SPRING.cam}>
      {children}
    </motion.div>
  );
}

/** Full-stage SVG canvas in stage coordinates. width can be wider than 1920 for panning worlds. */
export function Svg({ w = 1920, h = 1080, children, style, x = 0 }: { w?: number; h?: number; x?: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', left: x, top: 0, overflow: 'visible', ...style }}
      strokeLinecap="round" strokeLinejoin="round" shapeRendering="geometricPrecision">
      {children}
    </svg>
  );
}

/** Place a fixed-size piece of art at stage x,y (top-left), optionally anchored at its bottom-centre. */
export function At({ x, y, w, h, anchor = 'tl', children, style, className }: { x: number; y: number; w?: number; h?: number; anchor?: 'tl' | 'bc' | 'c'; children: ReactNode; style?: CSSProperties; className?: string }) {
  const tf = anchor === 'bc' ? 'translate(-50%, -100%)' : anchor === 'c' ? 'translate(-50%, -50%)' : undefined;
  return <div className={className} style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform: tf, ...style }}>{children}</div>;
}

// ---------- Timing ----------
/** Index of how many of `marks` (ms since this beat started) have passed. Resets when `beat` changes. */
export function useSubstep(beat: number, marks: number[]) {
  const [n, setN] = useState(0);
  const key = marks.join(',');
  useEffect(() => {
    setN(0);
    const ts = key.split(',').filter(Boolean).map((m, i) => setTimeout(() => setN(i + 1), Number(m)));
    return () => ts.forEach(clearTimeout);
  }, [beat, key]);
  return n;
}

/** Remembers the furthest beat reached, so things that appeared stay on screen. */
export function useMaxBeat(beat: number) {
  const ref = useRef(beat);
  if (beat > ref.current) ref.current = beat;
  if (beat < ref.current && beat === 0) ref.current = 0;
  return ref.current;
}

// ---------- FX ----------
/** A big rounded colour band that sweeps across the stage every time `trigger` changes (a cartoon wipe). */
export function Wipe({ trigger, colors = ['#FFC800', '#FF9600', '#FF6FB5'], dir = 1 }: { trigger: string | number; colors?: string[]; dir?: 1 | -1 }) {
  const first = useRef(true);
  const [k, setK] = useState<string | number | null>(null);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setK(trigger);
    const t = setTimeout(() => setK(null), 1300);
    return () => clearTimeout(t);
  }, [trigger]);
  return (
    <AnimatePresence>
      {k !== null && (
        <motion.div key={String(k)} style={{ ...full, pointerEvents: 'none', zIndex: 40 }} initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {colors.map((c, i) => (
            <motion.div key={i}
              initial={{ x: dir * -2600, rotate: -8 }} animate={{ x: dir * 2600 }}
              transition={{ duration: 1.05, delay: i * 0.08, ease: [0.45, 0, 0.55, 1] }}
              style={{ position: 'absolute', left: -200, top: -300 + i * 30, width: 1500, height: 1700, borderRadius: 700, background: c, border: '14px solid #fff' }} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Quick full-screen flash (lightning, camera pop) whenever `trigger` changes. */
export function Flash({ trigger, color = '#FFFFFF' }: { trigger: string | number; color?: string }) {
  return (
    <AnimatePresence>
      <motion.div key={String(trigger)} style={{ ...full, background: color, pointerEvents: 'none', zIndex: 39 }}
        initial={{ opacity: 0.9 }} animate={{ opacity: [0.9, 0.1, 0.7, 0] }} transition={{ duration: 0.6, times: [0, 0.3, 0.45, 1] }} />
    </AnimatePresence>
  );
}

/** Wraps children and shakes them briefly whenever `trigger` changes. */
export function Shake({ trigger, children, strength = 18 }: { trigger: string | number; children: ReactNode; strength?: number }) {
  const s = strength;
  return (
    <motion.div key={String(trigger)} style={full}
      animate={{ x: [0, -s, s * 0.8, -s * 0.6, s * 0.4, 0], y: [0, s * 0.4, -s * 0.5, s * 0.3, 0, 0] }}
      transition={{ duration: 0.55 }}>
      {children}
    </motion.div>
  );
}

const CONF_SHAPES = ['sq', 'ci', 'st'] as const;
/** Flat confetti burst from (x, y) every time `fire` changes (and on mount if fire > 0). */
export function Burst({ fire, x = 960, y = 540, colors = ['#FFC800', '#FF4B4B', '#1CB0F6', '#58CC02', '#CE82FF', '#FF6FB5'], count = 70, spread = 900, up = 700 }: { fire: number; x?: number; y?: number; colors?: readonly string[]; count?: number; spread?: number; up?: number }) {
  const pieces = useMemo(() => {
    const r = rng(fire * 7919 + 13);
    return Array.from({ length: count }, (_, i) => {
      const vx = (r() - 0.5) * spread;
      const peak = -(r() * up + up * 0.3);
      return { i, vx, peak, fall: 500 + r() * 500, rot: (r() - 0.5) * 900, c: colors[i % colors.length], s: 16 + r() * 14, shape: CONF_SHAPES[Math.floor(r() * 3)], d: r() * 0.15 };
    });
  }, [fire, count, spread, up, colors]);
  if (!fire) return null;
  return (
    <div key={fire} style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, pointerEvents: 'none', zIndex: 30 }}>
      {pieces.map(p => (
        <motion.div key={p.i}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0.4 }}
          animate={{ x: [0, p.vx * 0.7, p.vx], y: [0, p.peak, p.peak + p.fall], rotate: p.rot, opacity: [1, 1, 0], scale: 1 }}
          transition={{ duration: 1.9, delay: p.d, ease: 'easeOut', times: [0, 0.35, 1] }}
          style={{ position: 'absolute', width: p.s, height: p.shape === 'sq' ? p.s * 0.7 : p.s, background: p.shape === 'st' ? 'none' : p.c, borderRadius: p.shape === 'ci' ? '50%' : 4 }}>
          {p.shape === 'st' && <svg width={p.s * 1.4} height={p.s * 1.4} viewBox="-10 -10 20 20"><path d="M0 -9 L2.6 -3 L9 -2.8 L4 1.6 L5.6 8 L0 4.4 L-5.6 8 L-4 1.6 L-9 -2.8 L-2.6 -3Z" fill={p.c} /></svg>}
        </motion.div>
      ))}
    </div>
  );
}

/** Pops its children in with anticipation + overshoot. */
export function Pop({ children, delay = 0, style, from = 0, rotate = 0 }: { children: ReactNode; delay?: number; style?: CSSProperties; from?: number; rotate?: number }) {
  return (
    <motion.div style={style} initial={{ scale: from, rotate: rotate - 12, opacity: 0 }} animate={{ scale: 1, rotate, opacity: 1 }} exit={{ scale: 0, opacity: 0, transition: { duration: 0.22 } }}
      transition={{ ...SPRING.pop, delay, opacity: { duration: 0.12, delay } }}>
      {children}
    </motion.div>
  );
}
