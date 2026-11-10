// Delta pills popping in one after another with a sound each.
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DeltaPill } from '../../ui';
import type { Deltas } from '../../game/types';
import { sfx } from '../../audio';

const ORDER: (keyof Deltas)[] = ['customers', 'happiness', 'coins'];

export function DeltaRow({ deltas, start = 900, gap = 500, size = 'lg', quiet }: { deltas: Deltas; start?: number; gap?: number; size?: 'md' | 'lg'; quiet?: boolean }) {
  const items = ORDER.filter(k => deltas[k] !== 0);
  const [n, setN] = useState(0);
  const sig = `${deltas.customers},${deltas.happiness},${deltas.coins}`;
  useEffect(() => {
    setN(0);
    const ids = items.map((k, i) => setTimeout(() => {
      setN(i + 1);
      if (!quiet) sfx.play(k === 'coins' ? (deltas[k] > 0 ? 'coin' : 'loss') : deltas[k] > 0 ? 'gain' : 'loss');
    }, start + i * gap));
    if (!items.length) ids.push(setTimeout(() => setN(1), start));
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, start, gap]);
  if (!items.length) {
    return <div className="scr-delta-row">{n > 0 && <motion.span className="scr-nochange" initial={{ scale: 0 }} animate={{ scale: 1 }}>No change</motion.span>}</div>;
  }
  return (
    <div className="scr-delta-row">
      {items.slice(0, n).map(k => (
        <motion.div key={k} initial={{ scale: 0.2, y: 30, rotate: -10 }} animate={{ scale: 1, y: 0, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>
          <DeltaPill value={deltas[k]} kind={k} size={size} />
        </motion.div>
      ))}
    </div>
  );
}
