import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TimerRing } from '../../ui';
import { timerRemaining } from '../../game/engine';
import type { GameState } from '../../game/types';
import { useNow } from '../hooks/useNow';

/** TimerRing driven by the game timer, shown only while a timer exists (pass show={false} to animate it out). */
export function TimerBadge({ state, size = 200, style, show = true }: { state: GameState; size?: number; style?: CSSProperties; show?: boolean }) {
  const now = useNow(state.timer.running, 200);
  const rem = timerRemaining(state, now);
  return (
    <AnimatePresence>
      {show && state.timer.total > 0 && (
        <motion.div key="timer" className="scr-timer" style={{ width: size, height: size, ...style }} initial={{ scale: 0, rotate: -40, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0, rotate: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 360, damping: 18 }}>
          <TimerRing remainingMs={rem} totalMs={state.timer.total} size={size} />
          {!state.timer.running && rem > 0 && <div className="scr-timer-paused">Paused</div>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
