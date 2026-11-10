// A team avatar hatching out of an egg (wobble, crack, pop).
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Avatar } from '../../ui';
import type { Team } from '../../game/types';
import { sfx } from '../../audio';
import { Egg } from './art';
import { useTimeline } from '../hooks/useTimeline';
import { teamColors } from '../lib/game';

export function Hatch({ team, size = 150, delay = 0, instant }: { team: Team; size?: number; delay?: number; instant?: boolean }) {
  const n = useTimeline(`${team.id}-${team.avatarSeed}`, instant ? [0, 1] : [delay, delay + 950]);
  const phase = (instant ? 2 : n) as 0 | 1 | 2;
  useEffect(() => { if (phase === 2 && !instant) sfx.play('pop'); }, [phase, instant]);
  const c = teamColors(team);
  return (
    <div className="scr-hatch" style={{ width: size, height: size * 1.2 }}>
      {!instant && <div className="scr-hatch-egg"><Egg color={c.base} dark={c.shades[4]} size={size * 0.9} phase={phase} /></div>}
      <motion.div className="scr-hatch-avatar" initial={{ scale: instant ? 1 : 0, y: 30 }} animate={phase === 2 ? { scale: 1, y: 0 } : { scale: 0, y: 30 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }}>
        <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={size} mood="wow" />
      </motion.div>
    </div>
  );
}
