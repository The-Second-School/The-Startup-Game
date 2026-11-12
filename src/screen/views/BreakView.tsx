// Break: a calm, quiet screen. A big circle breathes in and out, a kid stretches along with it.
// If the host starts a timer on the phone, the ring shows it. Narration (calm) lives in narration/lines/board.ts.
import '../board.css';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TimerRing } from '../../ui';
import { timerRemaining } from '../../game/engine';
import { useGame } from '../lib/ctx';
import { Sparkle, Stretcher } from '../components/art';
import { ReadyHint } from '../components/ReadyHint';
import { useNow } from '../hooks/useNow';

const BREATH_S = 4;   // seconds to breathe in, and again to breathe out
const TIPS = [
  { icon: '🌬️', text: 'Take a slow, deep breath' },
  { icon: '🙆', text: 'Stretch your arms up high' },
  { icon: '💧', text: 'Have some water' },
  { icon: '🚶', text: 'Walk around a little' },
];

export function BreakView() {
  const { state } = useGame();
  const now = useNow(state.timer.running, 250);
  const hasTimer = state.timer.total > 0;
  const [inhale, setInhale] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setInhale(v => !v), BREATH_S * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bd-root bd-break">
      <motion.div className="bd-break-main" initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -80, opacity: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}>
        <div className="bd-break-title">Break</div>
        <div className="bd-break-sub">Take a breath, stretch and rest your eyes. We continue soon.</div>
        <div className="bd-break-tips">
          {TIPS.map((t, i) => (
            <motion.div key={t.text} className="bd-tip" initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.35 + i * 0.14 }}>
              <span className="bd-tip-icon">{t.icon}</span>{t.text}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="bd-breath">
        {[1.5, 1.22, 1].map((k, i) => (
          <motion.div key={i} className="bd-ring" style={{ ['--k' as string]: i }}
            animate={{ scale: inhale ? k * 1 : k * 0.72, opacity: inhale ? 0.95 - i * 0.2 : 0.7 - i * 0.12 }}
            transition={{ duration: BREATH_S, ease: 'easeInOut', delay: i * 0.12 }} />
        ))}
        <motion.div className="bd-figure" initial={{ y: 400, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 400, opacity: 0 }} transition={{ type: 'spring', stiffness: 140, damping: 16, delay: 0.3 }}>
          <Stretcher up={inhale} size={330} seconds={BREATH_S} />
        </motion.div>
        <div className="bd-breath-word">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={inhale ? 'in' : 'out'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }}>
              {inhale ? 'Breathe in...' : 'Breathe out...'}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {[[150, 640, 64], [880, 930, 52], [1810, 330, 60]].map(([x, y, s], i) => (
        <div key={i} className="bd-twinkle" style={{ left: x, top: y, ['--d' as string]: `${-i * 0.8}s` }}><Sparkle size={s} /></div>
      ))}

      <AnimatePresence>
        {hasTimer && (
          <motion.div key="timer" className="bd-break-timer" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 20 }} transition={{ type: 'spring', stiffness: 400, damping: 16 }}>
            <TimerRing remainingMs={timerRemaining(state, now)} totalMs={state.timer.total} size={200} />
          </motion.div>
        )}
      </AnimatePresence>
      <ReadyHint text="Break over" />
    </div>
  );
}
