// The end: thank-you scene with every team's avatar (and its members) dancing.
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Avatar, Bolt, Confetti } from '../../ui';
import { useGame } from '../lib/ctx';
import { teamName } from '../lib/game';
import { Skyline, Sparkle } from '../components/art';

export function EndView() {
  const { state } = useGame();
  const teams = state.teams;
  const [fire, setFire] = useState(0);
  useEffect(() => {
    const first = setTimeout(() => setFire(f => f + 1), 500);
    const id = setInterval(() => setFire(f => f + 1), 4500);
    return () => { clearTimeout(first); clearInterval(id); };
  }, []);
  const small = teams.length >= 5;
  const slotW = 1440 / Math.max(1, teams.length);
  const mSize = Math.max(40, Math.min(70, Math.floor((slotW - 60) / 5) - 6));

  return (
    <div className="v2-root">
      <Confetti fire={fire} />
      <Skyline style={{ position: 'absolute', left: 0, bottom: 0 }} height={300} />
      {[[140, 160, 80], [1740, 190, 100], [420, 330, 60], [1500, 360, 70]].map(([x, y, s], i) => (
        <div key={i} className="v2-break-spark" style={{ left: x, top: y, ['--d' as string]: `${-i * 0.6}s` }}><Sparkle size={s} /></div>
      ))}

      <motion.div className="v2-end-title" style={{ zIndex: 60 }} initial={{ y: -300, opacity: 0, scale: 0.7 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -200, opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}>
        <div className="v2-top-title" style={{ fontSize: 140 }}>Thank you!</div>
        <div className="v2-sub" style={{ fontSize: 56 }}>You built real startups in Techistan. Keep asking, building and being honest!</div>
      </motion.div>

      <motion.div className="v2-end-bolt" initial={{ x: -400 }} animate={{ x: 0 }} exit={{ x: -400 }} transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.4 }}>
        <motion.div animate={{ y: [0, -14, 0], rotate: [-2, 2, -2] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '50% 100%' }}><Bolt pose="cheer" size={380} /></motion.div>
      </motion.div>

      <div className="v2-end-teams">
        {teams.map((t, i) => (
          <motion.div key={t.id} className="v2-end-team" initial={{ y: 500, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 500, opacity: 0 }} transition={{ type: 'spring', stiffness: 170, damping: 13, delay: 0.5 + i * 0.12 }}>
            <div className="v2-dance" style={{ ['--d' as string]: `${-i * 0.23}s` }}>
              <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={small ? 200 : 250} mood="wow" />
            </div>
            <div className="v2-end-members">
              {t.members.slice(0, 5).map((m, k) => (
                <div key={m.playerId} className="v2-dance is-small" style={{ ['--d' as string]: `${-(i * 0.3 + k * 0.17)}s` }}>
                  <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={m.shade} size={mSize} mood="happy" ring={false} />
                </div>
              ))}
            </div>
            <div className="v2-end-name">{teamName(t)}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
