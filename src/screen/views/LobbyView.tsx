import { motion } from 'motion/react';
import { Bolt, SpeechBubble } from '../../ui';
import { useScreen } from '../../store/screenStore';
import { QrCode } from '../components/QrCode';
import { Skyline } from '../components/art';

export function LobbyView() {
  const room = useScreen(s => s.room);
  const url = `${location.origin}${location.pathname}#/admin?room=${room}`;
  const letters = 'The Startup Game'.split('');
  return (
    <div className="scr-full scr-lobby">
      <Skyline style={{ position: 'absolute', left: 0, bottom: 0 }} height={360} />
      <div className="scr-lobby-title">
        {letters.map((ch, i) => (
          <motion.span key={i} initial={{ y: -200, opacity: 0, rotate: -20 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.2 + i * 0.05 }} className={ch === ' ' ? 'is-space' : undefined}>
            {ch}
          </motion.span>
        ))}
      </div>
      <motion.div className="scr-lobby-sub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
        Build your own startup in Techistan!
      </motion.div>
      <motion.div className="scr-lobby-bolt" initial={{ y: 400 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.6 }}>
        <div className="scr-lobby-bubble"><SpeechBubble text="Hi! I’m Bolt. Waiting for the host to start!" side="left" size="lg" /></div>
        <Bolt pose="wave" size={360} />
      </motion.div>
      <motion.div className="scr-roomcard" initial={{ scale: 0, rotate: 10 }} animate={{ scale: 1, rotate: 2 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.9 }}>
        <div className="scr-roomcard-label">Host phone</div>
        <div className="scr-roomcard-qr"><QrCode text={url} size={290} /></div>
        <div className="scr-roomcard-code">{room.split('').map((c, i) => <span key={i}>{c}</span>)}</div>
        <div className="scr-roomcard-hint">Scan to run the game</div>
      </motion.div>
      <div className="scr-kbd-hint" title="Keyboard works too">⌨️</div>
    </div>
  );
}
