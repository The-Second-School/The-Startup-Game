// Spinning prize wheel (products, Mic Time). Art sits in HTML over an SVG of flat slices.
import { memo, useEffect, useRef, type ReactNode } from 'react';
import { animate, motion, useMotionValue } from 'motion/react';
import { sfx } from '../../audio';
import { useStableCallback } from '../hooks/useStableCallback';

export interface Slice { key: string; color: string; edge: string; art: ReactNode; faded?: boolean }

interface Props {
  slices: Slice[];
  size: number;
  /** Change `id` to spin so that slice `index` lands under the pointer. */
  spin: { index: number; id: number } | null;
  onDone?: (index: number) => void;
  duration?: number;
  artRadius?: number;
}

const pt = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
};

export const Wheel = memo(WheelImpl);
function WheelImpl({ slices, size, spin, onDone, duration = 4.2, artRadius = 0.64 }: Props) {
  const rot = useMotionValue(0);
  const n = Math.max(1, slices.length);
  const seg = 360 / n;
  const R = size / 2;
  const r = R - 26;
  const done = useStableCallback((i: number) => onDone?.(i));
  const lastTick = useRef({ idx: -1, t: 0 });

  useEffect(() => rot.on('change', v => {
    const under = Math.floor((((-v % 360) + 360) % 360) / seg);
    const now = performance.now();
    if (under !== lastTick.current.idx && now - lastTick.current.t > 45) {
      lastTick.current = { idx: under, t: now };
      sfx.play('tick');
    }
  }), [rot, seg]);

  useEffect(() => {
    if (!spin) return;
    const center = (spin.index + 0.5) * seg + (Math.random() - 0.5) * seg * 0.5;
    const base = rot.get();
    const want = (((-center - base) % 360) + 360) % 360;
    const target = base + 360 * 5 + want;
    const ctl = animate(rot, target, { duration, ease: [0.12, 0.75, 0.18, 1] });
    ctl.then(() => done(spin.index));
    return () => ctl.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spin?.id]);

  return (
    <div className="scr-wheel scr-breathe" style={{ width: size, height: size }}>
      <div className="scr-wheel-lip" />
      <motion.div className="scr-wheel-rot" style={{ rotate: rot }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={R} cy={R} r={R - 6} fill="#fff" />
          {slices.map((s, i) => {
            if (n === 1) return <circle key={s.key} cx={R} cy={R} r={r} fill={s.faded ? '#E9DFC2' : s.color} />;
            const [x0, y0] = pt(R, R, r, i * seg);
            const [x1, y1] = pt(R, R, r, (i + 1) * seg);
            const d = `M${R},${R} L${x0},${y0} A${r},${r} 0 ${seg > 180 ? 1 : 0} 1 ${x1},${y1} Z`;
            return <path key={s.key} d={d} fill={s.faded ? '#E9DFC2' : s.color} stroke="#fff" strokeWidth={8} strokeLinejoin="round" />;
          })}
          {slices.map((s, i) => {
            const [hx, hy] = pt(R, R, r * 0.82, (i + 0.5) * seg - seg * 0.18);
            return <circle key={`hl${s.key}`} cx={hx} cy={hy} r={r * 0.05} fill="#fff" opacity={s.faded ? 0.3 : 0.45} />;
          })}
        </svg>
        {slices.map((s, i) => (
          <div key={s.key} className="scr-wheel-art" style={{ transform: `rotate(${(i + 0.5) * seg}deg) translateY(${-r * artRadius}px)`, opacity: s.faded ? 0.35 : 1 }}>
            <div className="scr-wheel-art-in">{s.art}</div>
          </div>
        ))}
      </motion.div>
      <div className="scr-wheel-hub" style={{ width: size * 0.16, height: size * 0.16 }} />
      <svg className="scr-wheel-pointer ui-wiggle" style={{ "--rot": "3deg", "--dur": "1.8s", transformOrigin: "50% 10%" } as React.CSSProperties} width={110} height={120} viewBox="0 0 110 120">
        <path d="M14 18 Q55 0 96 18 L62 108 Q55 120 48 108 Z" fill="#fff" />
        <path d="M24 24 Q55 10 86 24 L59 96 Q55 104 51 96 Z" fill="var(--bad)" />
      </svg>
    </div>
  );
}
