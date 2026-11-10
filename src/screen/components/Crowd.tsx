// A row of tiny customers reacting: walking away, dancing in, cheering, packed shop...
import { motion } from 'motion/react';
import { Person } from './art';
import { cx } from '../lib/game';

export type CrowdMode = 'leave' | 'join' | 'stay' | 'cheer' | 'packed' | 'nod';

export function Crowd({ mode, count = 6, size = 90, seed = 0 }: { mode: CrowdMode; count?: number; size?: number; seed?: number }) {
  const n = mode === 'packed' ? count + 4 : count;
  const step = mode === 'packed' ? size * 0.62 : size * 0.95;
  return (
    <div className="scr-crowd" style={{ width: step * (n - 1) + size, height: size * 1.45 }}>
      {Array.from({ length: n }).map((_, i) => {
        const delay = i * 0.12;
        const anim =
          mode === 'leave' ? { x: [0, 0, 900], opacity: [1, 1, 0] }
          : mode === 'join' ? { x: [700, 0], opacity: [0, 1] }
          : { x: 0, opacity: 1 };
        const tr =
          mode === 'leave' ? { duration: 2.4, times: [0, 0.25, 1], delay, ease: 'easeIn' as const }
          : mode === 'join' ? { type: 'spring' as const, stiffness: 120, damping: 16, delay }
          : { type: 'spring' as const, stiffness: 400, damping: 20, delay };
        return (
          <motion.div key={`${mode}-${i}`} className="scr-crowd-p" style={{ left: i * step }} initial={mode === 'stay' || mode === 'nod' ? { y: 40, opacity: 0 } : false} animate={mode === 'stay' || mode === 'nod' ? { y: 0, opacity: 1 } : anim} transition={tr}>
            <div className={cx(mode === 'join' || mode === 'cheer' ? 'scr-dance' : mode === 'leave' ? 'scr-trudge' : mode === 'packed' ? 'scr-jostle' : 'scr-sway')} style={{ animationDelay: `${(i * 0.17) % 0.8}s` }}>
              <Person i={i + seed} size={size} mood={mode === 'leave' ? 'sad' : mode === 'packed' || mode === 'cheer' ? 'wow' : 'happy'} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
