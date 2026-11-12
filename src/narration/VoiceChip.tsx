// Small chip at the top-left while the voice engine is still starting ("Voice is loading..."), so a silent start is understood.
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { voice, type VoiceStatus } from '../audio/voice';

export function VoiceChip({ on }: { on: boolean }) {
  const [st, setSt] = useState<VoiceStatus>(voice.status());
  const [shown, setShown] = useState(false);
  useEffect(() => voice.onStatus(setSt), []);
  // stay visible a little after it is ready so it is noticed (and never flashes for a split second)
  useEffect(() => {
    if (on && (st === 'loading' || st === 'blocked')) { setShown(true); return; }
    const t = setTimeout(() => setShown(false), 900);
    return () => clearTimeout(t);
  }, [on, st]);
  return (
    <AnimatePresence>
      {shown && (
        <motion.div className="nd-voicechip" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}>
          <span className={st === 'loading' ? 'nd-spin' : 'nd-ok'}>{st === 'loading' ? '' : st === 'blocked' ? '👆' : '✓'}</span>
          {st === 'loading' ? 'Voice is loading… please wait a moment' : st === 'blocked' ? 'Tap the screen once to turn on Bolt’s voice' : 'Voice is ready'}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
