// Fibbot slides in from the right with ONE short line and STAYS (idle bounce) until `show` goes false, then slides out.
import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Fibbot, SpeechBubble } from '../../ui';
import '../choice.css';

export function FibbotPop({ show, text, mood = 'laugh', style, size = 190 }: { show: boolean; text: string; mood?: 'laugh' | 'angry' | 'sneaky' | 'dizzy' | 'shock'; style?: CSSProperties; size?: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="cx-fib" style={style} initial={{ x: 520, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 620, opacity: 0, transition: { duration: 0.4, ease: [0.5, 0, 0.75, 0] } }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
          <motion.div className="cx-fib-bubble" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35, type: 'spring', stiffness: 420, damping: 18 }} style={{ transformOrigin: '70% 100%' }}>
            <SpeechBubble text={text} side="bottom" size="md" />
          </motion.div>
          <Fibbot mood={mood} size={size} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
