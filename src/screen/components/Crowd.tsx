// A row of tiny customers reacting: walking away, dancing in, cheering, packed shop...
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { sfx } from '../../audio';
import { REASON_TEXT, type Shopper } from '../../narration/lines/price';
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

// ---------- Price It Right: ten shoppers deciding, one by one ----------
/**
 * The 10 interested people look at the price one after another: a happy face + coin + a reason when they buy, a sad face walking
 * off + a reason when they do not. The reasons come from the real maths (see shoppersAt in narration/lines/price.ts).
 */
export function ShopperGrid({ shoppers, seed = 0, size = 70, start = 700, gap = 380, onDone }: { shoppers: Shopper[]; seed?: number; size?: number; start?: number; gap?: number; onDone?: () => void }) {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    const ids: number[] = [];
    shoppers.forEach((s, i) => {
      ids.push(window.setTimeout(() => {
        setShown(i + 1);
        sfx.play(s.buys ? 'coin' : 'tick');
      }, start + i * gap));
    });
    ids.push(window.setTimeout(() => doneRef.current?.(), start + shoppers.length * gap + 500));
    return () => ids.forEach(clearTimeout);
  }, [shoppers, start, gap]);

  return (
    <div className="pr-shoppers">
      {shoppers.map((s, i) => {
        const decided = i < shown;
        const state = !decided ? 'is-wait' : s.buys ? 'is-buy' : 'is-walk';
        return (
          <div key={s.k} className={`pr-shopper ${state}`}>
            <div className="pr-shopper-top">
              <motion.div
                className={decided && s.buys ? 'scr-dance' : undefined}
                initial={false}
                animate={decided && !s.buys ? { x: [0, 0, 38], opacity: [1, 1, 0.5] } : { x: 0, opacity: decided ? 1 : 0.55 }}
                transition={{ duration: 0.9, times: [0, 0.35, 1] }}
              >
                <Person i={s.k * 2 + seed} size={size} mood={!decided ? 'happy' : s.buys ? 'wow' : 'sad'} />
              </motion.div>
              <AnimatePresence>
                {decided && (
                  <motion.span key="badge" className="pr-badge" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 520, damping: 14 }}>
                    {s.buys ? '👍' : '🚶'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="pr-bubble">
              {decided ? (
                <motion.span key="r" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>{REASON_TEXT[s.reason]}</motion.span>
              ) : (
                <span className="pr-think">…</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
