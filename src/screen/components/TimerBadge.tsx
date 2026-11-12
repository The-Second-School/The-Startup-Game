import { useEffect, useRef, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TimerRing } from '../../ui';
import { timerRemaining } from '../../game/engine';
import { TIMER_SHOW_MS } from '../../game/content';
import type { Action, GameState } from '../../game/types';
import { useNow } from '../hooks/useNow';

/** Everybody has locked in: the talk clock stops (paused, not reset) and starts again only if a team unlocks.
 *  Pass `enabled` only on the device that should drive it (the live big screen, or the phone's choice panel).
 *  The timer lives in the shared game state, so every screen and phone then shows the same stopped clock. */
export function useHoldTimerWhenLocked(state: GameState, send: (a: Action) => void, allLocked: boolean, enabled: boolean) {
  const { running, remaining, total } = state.timer;
  const { paused, progressView } = state;
  const heldHere = useRef(false);
  useEffect(() => {
    if (!enabled) return;
    if (allLocked) {
      if (running) { heldHere.current = true; send({ type: 'TIMER_PAUSE', now: Date.now() }); }
      return;
    }
    if (total === 0) { heldHere.current = false; return; }
    if (heldHere.current && !running && remaining > 0 && !paused && !progressView) {
      heldHere.current = false;
      send({ type: 'TIMER_RESUME', now: Date.now() });
    }
  }, [allLocked, enabled, running, remaining, total, paused, progressView, send]);
}

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
