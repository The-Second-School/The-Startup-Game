// The narrator at the top-left of every screen: Bolt (or Jhootu) plus a small transcript bubble.
// While speaking it shows the current line; when all lines are spoken and there were 2+ lines it shows the summary.
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Bolt, Fibbot } from '../ui';
import { voice } from '../audio/voice';
import { DOCK_H, DOCK_TOP, DOCK_W } from '../screen/lib/layout';
import { useNarr } from './store';

export function useSpeaking() {
  const [s, setS] = useState(voice.isSpeaking());
  useEffect(() => voice.onSpeaking(setS), []);
  return s;
}

export function NarrationDock({ visible }: { visible: boolean }) {
  const { id, line, done, total, summary, showText, mascot, dock } = useNarr();
  const speaking = useSpeaking();
  const talking = !!id && (speaking || !done);
  const text = id ? (done && total > 1 && summary ? summary : line?.text ?? '') : '';
  const pose = !id ? 'idle' : done ? (line?.pose ?? 'idle') : (line?.pose ?? 'talk');
  return (
    <AnimatePresence>
      {visible && id && (
        <motion.div key="dock" className="nd-dock" style={{ left: dock?.x ?? 24, top: dock?.y ?? DOCK_TOP, height: DOCK_H, ['--nd-w' as string]: `${dock?.w ?? 1180}px` }} initial={{ x: -240, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -240, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
          <div className="nd-mascot" style={{ width: DOCK_W - 24 }}>
            {mascot === 'fibbot' ? <Fibbot mood={talking ? 'laugh' : 'sneaky'} size={DOCK_H - 4} /> : <Bolt pose={talking ? 'talk' : pose} size={DOCK_H - 4} talking={talking} />}
          </div>
          {showText && text && (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={`${id}-${done ? 'sum' : line?.text}`} className={`nd-bubble${done && total > 1 ? ' is-summary' : ''}`} initial={{ opacity: 0, scale: 0.94, x: -10 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ type: 'spring', stiffness: 420, damping: 30 }}>
                {done && total > 1 && <span className="nd-tag">Summary</span>}
                {text}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
