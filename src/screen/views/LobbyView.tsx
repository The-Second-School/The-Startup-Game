// Lobby: a clean, inviting start. Bolt (the narration dock, top-left) welcomes everyone out loud; no admin address, no room card.
import '../setup.css';
import { motion } from 'motion/react';
import { Skyline } from '../components/art';

const COINS = [
  { x: 210, y: 470, d: 0 }, { x: 1620, y: 440, d: 0.6 }, { x: 330, y: 700, d: 1.1 }, { x: 1500, y: 700, d: 0.3 },
];

export function LobbyView() {
  const letters = 'The Startup Game'.split('');
  return (
    <div className="st-lobby">
      <Skyline style={{ position: 'absolute', left: 0, bottom: 0 }} height={360} />
      {COINS.map((c, i) => (
        <motion.div key={i} className="st-lobby-coin" style={{ left: c.x, top: c.y }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, y: [0, -18, 0] }}
          transition={{ scale: { type: 'spring', stiffness: 300, damping: 14, delay: 1.2 + c.d }, opacity: { delay: 1.2 + c.d }, y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: c.d } }}>
          ★
        </motion.div>
      ))}
      <div className="st-lobby-title">
        {letters.map((ch, i) => (
          <motion.span key={i} initial={{ y: -240, opacity: 0, rotate: -20 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.2 + i * 0.05 }} className={ch === ' ' ? 'is-space' : undefined}>
            {ch}
          </motion.span>
        ))}
      </div>
      <motion.div className="st-lobby-sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.45 }}>
        Build your own startup in Techistan!
      </motion.div>
      <motion.div className="st-lobby-go" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: [1, 1.04, 1] }}
        transition={{ opacity: { delay: 1.6, duration: 0.4 }, scale: { delay: 2, duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}>
        Get ready, founders!
      </motion.div>
    </div>
  );
}
