import type { CSSProperties } from 'react';
// Compact live leaderboard (3 small ranked columns 👥 😊 🪙) shown next to the spotlight card.
import { motion } from 'motion/react';
import { Avatar, CountUp, MeterIcon } from '../../ui';
import type { Team } from '../../game/types';
import { useLaggedTeams } from '../hooks/useLaggedTeams';
import { cx } from '../lib/game';

const FIELDS = ['customers', 'happiness', 'coins'] as const;

export function MiniBoard({ teams, highlight = [], lag, style }: { teams: Team[]; highlight?: string[]; lag?: number; style?: CSSProperties }) {
  const shown = useLaggedTeams(teams, lag);
  return (
    <motion.div className="scr-mini" style={style} initial={{ x: 120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }}>
      <div className="scr-mini-title">Leaderboard</div>
      <div className="scr-mini-cols">
        {FIELDS.map(f => (
          <div key={f} className="scr-mini-col">
            <div className="scr-mini-head"><MeterIcon kind={f} size={48} /></div>
            {[...shown].sort((a, b) => b[f] - a[f] || teams.indexOf(a) - teams.indexOf(b)).map(t => (
              <motion.div key={t.id} layout transition={{ type: 'spring', stiffness: 200, damping: 22 }} className={cx('scr-mini-row', highlight.includes(t.id) && 'is-hi')}>
                <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={46} />
                <b><CountUp value={t[f]} /></b>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
