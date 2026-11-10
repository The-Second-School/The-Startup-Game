// Snack break: calm idle scene. If the host starts a timer on the phone, the ring shows it.
import { AnimatePresence, motion } from 'motion/react';
import { Bolt, TimerRing } from '../../ui';
import { timerRemaining } from '../../game/engine';
import { useGame } from '../lib/ctx';
import { ChaiCup, Samosa, Sparkle } from '../components/art';
import { ReadyHint } from '../components/ReadyHint';
import { useNow } from '../hooks/useNow';

export function BreakView() {
  const { state } = useGame();
  const now = useNow(state.timer.running, 250);
  const hasTimer = state.timer.total > 0;
  return (
    <div className="v2-root">
      <motion.div className="v2-break-title" initial={{ y: -80, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -80, opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 300, damping: 16 }}>
        <div className="v2-top-title" style={{ fontSize: 120 }}>Snack break!</div>
        <div className="v2-sub" style={{ fontSize: 52 }}>Stretch, sip some chai and eat a samosa</div>
      </motion.div>

      <div className="v2-break-table" />
      <motion.div className="v2-break-cup" initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.2 }}>
        <div className="v2-bob"><ChaiCup size={340} /></div>
      </motion.div>
      <motion.div className="v2-break-bolt" initial={{ y: 500 }} animate={{ y: 0 }} exit={{ y: 500 }} transition={{ type: 'spring', stiffness: 140, damping: 14, delay: 0.4 }}>
        <motion.div animate={{ y: [0, -10, 0], rotate: [-1.5, 1.5, -1.5] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '50% 100%' }}><Bolt pose="idle" size={420} /></motion.div>
      </motion.div>
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="v2-break-samosa" style={{ left: 1040 + i * 220, top: 690 + (i % 2) * 50 }} initial={{ y: 500, rotate: 40 }} animate={{ y: 0, rotate: i * 12 - 10 }} exit={{ y: 500, rotate: 40 }} transition={{ type: 'spring', stiffness: 200, damping: 13, delay: 0.5 + i * 0.12 }}>
          <div className="v2-bob" style={{ ['--d' as string]: `${-i * 0.7}s` }}><Samosa size={190} /></div>
        </motion.div>
      ))}
      {[[200, 520, 70], [1620, 480, 90], [980, 560, 60], [1790, 760, 60]].map(([x, y, s], i) => (
        <div key={i} className="v2-break-spark" style={{ left: x, top: y, ['--d' as string]: `${-i * 0.5}s` }}><Sparkle size={s} /></div>
      ))}

      <AnimatePresence>
        {hasTimer && (
          <motion.div key="timer" className="v2-break-timer" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 20 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}>
            <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <TimerRing remainingMs={timerRemaining(state, now)} totalMs={state.timer.total} size={260} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ReadyHint text="Break over" />
    </div>
  );
}
