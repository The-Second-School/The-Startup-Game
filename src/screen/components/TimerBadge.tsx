import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TimerRing } from '../../ui';
import { timerRemaining } from '../../game/engine';
import { TIMER_SHOW_MS } from '../../game/content';
import type { GameState } from '../../game/types';
import { useNow } from '../hooks/useNow';

/** True only while a talk timer exists AND the last minute (TIMER_SHOW_MS) has begun. Use it to decide when to pop the badge in. */
export function useTimerLast(state: GameState): boolean {
  const now = useNow(state.timer.running, 200);
  return state.timer.total > 0 && timerRemaining(state, now) <= TIMER_SHOW_MS;
}

/** TimerRing driven by the game timer, shown only while a timer exists (pass show={false} to animate it out).
 *  `lastMinuteOnly` keeps it hidden until the final minute (the rule for every talk timer). */
export function TimerBadge({ state, size = 200, style, show = true, lastMinuteOnly }: { state: GameState; size?: number; style?: CSSProperties; show?: boolean; lastMinuteOnly?: boolean }) {
  const now = useNow(state.timer.running, 200);
  const rem = timerRemaining(state, now);
  const visible = show && state.timer.total > 0 && (!lastMinuteOnly || rem <= TIMER_SHOW_MS);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div key="timer" className="scr-timer" style={{ width: size, height: size, ...style }} initial={{ scale: 0, rotate: -40, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0, rotate: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 360, damping: 18 }}>
          <TimerRing remainingMs={rem} totalMs={state.timer.total} size={size} />
          {!state.timer.running && rem > 0 && <div className="scr-timer-paused">Paused</div>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
