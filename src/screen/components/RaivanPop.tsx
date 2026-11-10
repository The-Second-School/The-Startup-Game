import type { CSSProperties } from 'react';
// rAIvan pops in from the side with a cheeky line, then hides.
import { AnimatePresence, motion } from 'motion/react';
import { Raivan, SpeechBubble } from '../../ui';

export function RaivanPop({ show, text, mood = 'laugh', style }: { show: boolean; text: string; mood?: 'laugh' | 'angry' | 'sneaky' | 'dizzy' | 'shock'; style?: CSSProperties }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="scr-raivan-pop is-stacked" style={style} initial={{ x: 500, rotate: 20 }} animate={{ x: 0, rotate: -4 }} exit={{ x: 600, rotate: 30, transition: { duration: 0.3 } }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
          <div className="scr-raivan-bubble"><SpeechBubble text={text} side="right" size="lg" /></div>
          <Raivan mood={mood} size={190} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
