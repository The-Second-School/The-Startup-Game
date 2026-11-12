// The end: thank-you scene with every team's avatar (and its members) dancing. Bolt (top-left dock) says thank you.
import '../views2.css';
import '../board.css';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Avatar, Confetti, useStageH } from '../../ui';
import { sfx } from '../../audio';
import { useGame } from '../lib/ctx';
import { teamName } from '../lib/game';
import { Skyline, Sparkle } from '../components/art';

export function EndView() {
  const { state } = useGame();
  const teams = state.teams;
  const [fire, setFire] = useState(0);
  useEffect(() => {
    sfx.play('cheer');
    const first = setTimeout(() => setFire(f => f + 1), 500);
    const id = setInterval(() => setFire(f => f + 1), 4500);
    return () => { clearTimeout(first); clearInterval(id); };
  }, []);
  const H = useStageH();
  const X = H - 1080;                       // extra height on tall windows: the avatars grow by a third of it
  const n = Math.max(1, teams.length);
  const small = n >= 5;
  const slotW = 1840 / n;
  const mSize = Math.max(40, Math.min(70, Math.floor((slotW - 60) / 5) - 6));
  const bigSize = (small ? 210 : 270) + Math.round(X * 0.3);

  return (
    <div className="bd-root">
      <Confetti fire={fire} />
      <Skyline style={{ position: 'absolute', left: 0, bottom: 0 }} height={300} />
      {[[1760, 230, 90], [1500, 520, 60], [120, 560, 70], [900, 500, 56]].map(([x, y, s], i) => (
        <div key={i} className="bd-twinkle" style={{ left: x, top: y, ['--d' as string]: `${-i * 0.6}s` }}><Sparkle size={s} /></div>
      ))}

      <motion.div className="bd-end-title" initial={{ y: -200, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -160, opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 200, damping: 13 }}>
        <div className="bd-end-big">Thank you!</div>
        <div className="bd-end-sub">You built real startups in Techistan. Keep asking, building and being honest!</div>
      </motion.div>

      <div className="bd-end-teams">
        {teams.map((t, i) => (
          <motion.div key={t.id} className="bd-end-team" initial={{ y: 500, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 500, opacity: 0 }} transition={{ type: 'spring', stiffness: 170, damping: 13, delay: 0.5 + i * 0.12 }}>
            <div className="v2-dance" style={{ ['--d' as string]: `${-i * 0.23}s` }}>
              <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={bigSize} mood="wow" />
            </div>
            <div className="bd-end-members">
              {t.members.slice(0, 5).map((m, k) => (
                <div key={m.playerId} className="v2-dance is-small" style={{ ['--d' as string]: `${-(i * 0.3 + k * 0.17)}s` }}>
                  <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={m.shade} size={mSize} mood="happy" ring={false} />
                </div>
              ))}
            </div>
            <div className="bd-end-name">{teamName(t)}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
