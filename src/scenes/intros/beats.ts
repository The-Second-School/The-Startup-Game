// Shared timing for the small question intros. Plain .ts (no JSX) so the intro glob only picks up real intros.
import { createElement as h, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

/** Beat index for the current moment. `times` are ms after mount when each beat starts. The intro plays once and holds its last beat. */
export function useBeat(times: readonly number[]): number {
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    setBeat(0);
    const timers = times.slice(1).map((t, i) => window.setTimeout(() => setBeat(i + 1), t));
    return () => timers.forEach(id => window.clearTimeout(id));
  }, [times]);
  return beat;
}

const CONFETTI = ['#FFC800', '#FF4B4B', '#1CB0F6', '#58CC02', '#FF6FB5', '#FF9600'];

/** One-off confetti puff at (x, y). Plays once when mounted (render it only on the beat you want it). */
export function Splash({ x, y, n = 12, r = 200 }: { x: number; y: number; n?: number; r?: number }) {
  const box: CSSProperties = { position: 'absolute', left: x, top: y, width: 0, height: 0, zIndex: 5 };
  return h('div', { style: box },
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2, d = r * (0.7 + ((i * 37) % 10) / 20);
      return h(motion.div, {
        key: i,
        initial: { x: 0, y: 0, opacity: 1, scale: 0.4 },
        animate: { x: Math.cos(a) * d, y: Math.sin(a) * d, opacity: 0, scale: 1.1, rotate: i * 60 },
        transition: { duration: 1.1, ease: 'easeOut', delay: 0.05 * (i % 3) },
        style: { position: 'absolute', left: -9, top: -9, width: 18, height: 18, borderRadius: i % 2 ? 999 : 4, background: CONFETTI[i % CONFETTI.length] },
      });
    }));
}
