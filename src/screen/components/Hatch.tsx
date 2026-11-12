// A team avatar hatching out of an egg (wobble, crack, pop). Optional confetti burst when it pops.
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Avatar } from '../../ui';
import type { Team } from '../../game/types';
import { sfx } from '../../audio';
import { Egg } from './art';
import { useTimeline } from '../hooks/useTimeline';
import { teamColors } from '../lib/game';

interface Props {
  team: Team;
  size?: number;
  /** ms from mount until the egg starts to crack (the pop follows 950 ms later). */
  delay?: number;
  /** Skip the egg and show the avatar. */
  instant?: boolean;
  /** The egg wobbles nervously while it waits. */
  restless?: boolean;
  /** Little confetti burst around the avatar when it pops. */
  burst?: boolean;
}

const BURST_COLORS = ['#FFC800', '#FF4B4B', '#1CB0F6', '#58CC02', '#CE82FF', '#FF9600', '#FF6FB5'];

export function Hatch({ team, size = 150, delay = 0, instant, restless, burst }: Props) {
  const n = useTimeline(`${team.id}-${team.avatarSeed}`, instant ? [0, 1] : [delay, delay + 950]);
  const phase = (instant ? 2 : n === 0 && restless ? 1 : n) as 0 | 1 | 2;
  const [popped, setPopped] = useState(false);
  useEffect(() => {
    if (phase === 2 && !instant) { sfx.play('pop'); setPopped(true); }
  }, [phase, instant]);
  const c = teamColors(team);
  return (
    <div className="scr-hatch" style={{ width: size, height: size * 1.2 }}>
      {!instant && <div className="scr-hatch-egg"><Egg color={c.base} dark={c.shades[4]} size={size * 0.9} phase={phase} /></div>}
      <motion.div className="scr-hatch-avatar" initial={{ scale: instant ? 1 : 0, y: 30 }} animate={phase === 2 ? { scale: 1, y: 0 } : { scale: 0, y: 30 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }}>
        <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={size} mood="wow" />
      </motion.div>
      {burst && popped && <Burst size={size} seed={team.avatarSeed} />}
    </div>
  );
}

function Burst({ size, seed }: { size: number; seed: number }) {
  const bits = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2 + (seed % 7) * 0.3;
    const d = size * (0.75 + ((i * 37 + seed) % 10) / 14);
    return { dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.9 - size * 0.1, rot: ((i * 83) % 360) - 180, color: BURST_COLORS[i % BURST_COLORS.length], w: 14 + (i % 3) * 6, round: i % 3 === 0 };
  }), [size, seed]);
  return (
    <div style={{ position: 'absolute', left: '50%', top: '55%', width: 0, height: 0, pointerEvents: 'none', zIndex: 5 }}>
      {bits.map((b, i) => (
        <motion.span key={i} initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }} animate={{ x: b.dx, y: [0, b.dy - 40, b.dy + 60], scale: [0.2, 1, 0.8], opacity: [1, 1, 0], rotate: b.rot }} transition={{ duration: 1.1, ease: 'easeOut', times: [0, 0.45, 1] }}
          style={{ position: 'absolute', left: -b.w / 2, top: -b.w / 2, width: b.w, height: b.round ? b.w : b.w * 0.6, borderRadius: b.round ? 99 : 4, background: b.color }} />
      ))}
    </div>
  );
}
