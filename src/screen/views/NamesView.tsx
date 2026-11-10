// Team names: boxes wait for the name typed on the big touch keyboard; each name lands with confetti.
import '../views2.css';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar, Bolt, Confetti, ProductArt } from '../../ui';
import { KidKeyboard } from './PlayersView';
import { productById } from '../../game/content';
import { useGame } from '../lib/ctx';
import { useUi } from '../lib/ui';
import { cx, isDefaultName, teamColors } from '../lib/game';

export function NamesView() {
  const { state } = useGame();
  const typing = useUi(s => s.typing);
  const kbTeam = useUi(s => s.kbTeam);
  const [fire, setFire] = useState(0);
  const prev = useRef(state.teams.map(t => t.name).join('|'));
  useEffect(() => {
    const sig = state.teams.map(t => t.name).join('|');
    if (sig !== prev.current) { prev.current = sig; setFire(f => f + 1); }
  }, [state.teams]);
  const n = state.teams.length;
  const gap = n >= 5 ? 24 : 36;
  const colW = Math.floor((1920 - 112 - (n - 1) * gap) / Math.max(1, n));
  const left = state.teams.filter(t => isDefaultName(t.name)).length;
  const activeId = (kbTeam && state.teams.find(t => t.id === kbTeam && isDefaultName(t.name))?.id) ?? state.teams.find(t => isDefaultName(t.name))?.id ?? null;
  return (
    <div className="v2-root">
      <div className="v2-setup-head">
        <motion.div className="v2-setup-bolt" animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>
          <Bolt pose={left ? 'think' : 'cheer'} size={110} talking />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.div key={left ? 'name' : 'done'} className="v2-setup-title" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} transition={{ duration: 0.22 }}>
            {left ? 'Name your startup!' : 'What awesome names!'}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="v2-names-cols" style={{ gap }}>
        <AnimatePresence>
          {state.teams.map((t, i) => {
            const c = teamColors(t);
            const named = !isDefaultName(t.name);
            const p = productById(t.productId);
            const active = activeId === t.id;
            return (
              <motion.div key={t.id} className={cx('v2-ncol', active && 'is-active')} style={{ width: colW, background: named ? c.shades[1] : c.shades[0] }}
                initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24, delay: i * 0.06 }}>
                <motion.div animate={named ? { y: [0, -8, 0] } : active ? { rotate: [-4, 4, -4] } : { y: 0 }} transition={named || active ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: -i * 0.5 } : { duration: 0.2 }}>
                  <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={n >= 5 ? 96 : 110} mood={named ? 'wow' : 'happy'} />
                </motion.div>
                <div className="v2-nslot">
                  <AnimatePresence mode="popLayout">
                    {active && !named && typing ? (
                      <motion.div key="typing" className="v2-ntyping" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }}>{typing}<span className="scr-caret">|</span></motion.div>
                    ) : named ? (
                      <motion.div key={t.name} className="v2-nname" initial={{ y: -200, scale: 1.5, rotate: -12, opacity: 0 }} animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.05 * i }}>
                        {t.name}
                      </motion.div>
                    ) : (
                      <motion.div key="wait" className="v2-nwait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {active ? 'type here' : 'next'}<span className="scr-dots"><i>.</i><i>.</i><i>.</i></span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {p && <div className="v2-nprod"><ProductArt productId={p.id} size={52} /><span>{p.name}</span></div>}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <KidKeyboard mode="names" />
      <Confetti fire={fire} />
    </div>
  );
}
