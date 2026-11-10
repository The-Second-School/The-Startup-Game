import { motion } from 'motion/react';
import { Bolt, SpeechBubble } from '../../ui';
import { useScreen } from '../../store/screenStore';
import { adminAddress, hasRealtime } from '../../sync/channel';
import { Skyline } from '../components/art';

export function LobbyView() {
  const phones = useScreen(s => s.phones);
  const link = useScreen(s => s.link);
  const addr = adminAddress();
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
        <div className="scr-roomcard-addr" style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.1, background: 'var(--sun-hi)', borderRadius: 18, padding: '6px 22px 10px' }}>{addr}</div>
        <div className="scr-roomcard-hint">Open this on a phone to run the game</div>
        <div data-testid="phones" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 28, fontWeight: 700, color: 'var(--ink-soft)' }}>
          <i style={{ width: 16, height: 16, borderRadius: '50%', background: phones > 0 ? '#2FA84F' : '#B8B8B8' }} />
          <span>{hasRealtime || phones > 0 ? `${phones} ${phones === 1 ? 'phone' : 'phones'}${link === 'reconnecting' ? ' (reconnecting)' : ''}` : 'Same-browser mode: phone sync keys not set'}</span>
        </div>
      </motion.div>
      <div className="scr-kbd-hint" title="Keyboard works too">⌨️</div>
    </div>
  );
}
