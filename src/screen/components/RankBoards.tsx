// Big ranked boards with bars. Rows start in team order and FLIP into rank order (layout animation).
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Avatar, CountUp, MeterIcon } from '../../ui';
import type { Team } from '../../game/types';
import { useLaggedTeams } from '../hooks/useLaggedTeams';
import { coinMax, teamColors } from '../lib/game';
import { METER_MAX } from '../../game/content';

export type Field = 'customers' | 'happiness' | 'coins';
const LABEL: Record<Field, string> = { customers: 'Customers', happiness: 'Happiness', coins: 'Coins' };

interface Props { teams: Team[]; fields?: Field[]; width: number; rowH?: number; sortDelay?: number; lag?: number; compactNames?: boolean }

export function RankBoards({ teams, fields = ['customers', 'happiness', 'coins'], width, rowH = 76, sortDelay = 900, lag = 0 }: Props) {
  const shown = useLaggedTeams(teams, lag);
  const [sorted, setSorted] = useState(false);
  useEffect(() => { const id = setTimeout(() => setSorted(true), sortDelay); return () => clearTimeout(id); }, [sortDelay]);
  const cmax = coinMax(shown);
  return (
    <div className="scr-boards">
      {fields.map((f, bi) => {
        const max = f === 'coins' ? cmax : METER_MAX;
        const ranked = [...shown].sort((a, b) => b[f] - a[f] || shown.indexOf(a) - shown.indexOf(b));
        const list = sorted ? ranked : shown;
        return (
          <motion.div key={f} className="scr-board" style={{ width }}
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24, delay: bi * 0.09 }}>
            <div className="scr-board-head"><MeterIcon kind={f} size={56} /><span>{LABEL[f]}</span></div>
            <div className="scr-board-rows">
              {list.map((t, r) => {
                const c = teamColors(t);
                return (
                  <motion.div key={t.id} layout transition={{ type: 'spring', stiffness: 200, damping: 22, delay: sorted ? (list.length - r) * 0.06 : 0 }} className="scr-board-row" style={{ height: rowH }}>
                    <motion.div className="scr-board-bar" style={{ background: c.shades[1], originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: Math.max(0.04, Math.min(1, t[f] / max)) }} transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 + bi * 0.1 }} />
                    <span className="scr-board-rank">{ranked.indexOf(t) + 1}</span>
                    <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={rowH - 18} />
                    <span className="scr-board-name">{t.name}</span>
                    <b className="scr-board-val"><CountUp value={t[f]} /></b>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
