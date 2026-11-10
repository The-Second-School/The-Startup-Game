// Leaderboards after each act: three ranked boards that FLIP into order, the locked Success board,
// and every team's building by stage.
import '../views2.css';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Avatar, Bolt, Building, CountUp, MeterIcon } from '../../ui';
import { METER_MAX, RECIPE, STAGES } from '../../game/content';
import { stageOf } from '../../game/engine';
import { useGame } from '../lib/ctx';
import { coinMax, teamBase, teamColors, teamName } from '../lib/game';
import { ReadyHint } from '../components/ReadyHint';

type Field = 'customers' | 'happiness' | 'coins';
const FIELDS: { f: Field; label: string }[] = [
  { f: 'customers', label: 'Customers' },
  { f: 'happiness', label: 'Happiness' },
  { f: 'coins', label: 'Coins' },
];
const MEDAL = ['#FFC800', '#C9D0DC', '#E58A3B'];

function Lock({ size = 110 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: 'visible' }}>
      <path d="M36 54 V40 A24 24 0 0 1 84 40 V54" fill="none" stroke="#fff" strokeWidth={26} strokeLinecap="round" />
      <path d="M36 54 V40 A24 24 0 0 1 84 40 V54" fill="none" stroke="#8A6F3E" strokeWidth={14} strokeLinecap="round" />
      <rect x={18} y={52} width={84} height={62} rx={20} fill="#fff" />
      <rect x={24} y={62} width={72} height={52} rx={16} fill="#B3841B" />
      <rect x={24} y={58} width={72} height={52} rx={16} fill="#FFC800" />
      <circle cx={60} cy={80} r={8} fill="#4A3613" /><rect x={56} y={82} width={8} height={16} rx={4} fill="#4A3613" />
      <rect x={32} y={64} width={22} height={8} rx={4} fill="#fff" opacity={0.55} />
    </svg>
  );
}

export function BoardView({ act }: { act: number }) {
  const { state } = useGame();
  const teams = state.teams;
  const [sorted, setSorted] = useState(false);
  useEffect(() => { const id = setTimeout(() => setSorted(true), 1000); return () => clearTimeout(id); }, []);
  const rowH = teams.length >= 6 ? 66 : teams.length === 5 ? 80 : 96;
  const cmax = coinMax(teams);
  const recipe = RECIPE.find(r => r.act === act);

  return (
    <div className="v2-root">
      <motion.div className="v2-board-title" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
        <span className="v2-top-title" style={{ fontSize: 76 }}>Leaderboards</span>
        {recipe && <span className="v2-pill is-big">{recipe.icon} Step {act}: {recipe.name} done!</span>}
      </motion.div>
      <motion.div className="v2-board-bolt" initial={{ y: -200 }} animate={{ y: 0 }} exit={{ y: -200 }} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.3 }}>
        <motion.div animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>
          <Bolt pose="cheer" size={104} />
        </motion.div>
      </motion.div>

      <div className="v2-boards">
        {FIELDS.map(({ f, label }, bi) => {
          const max = f === 'coins' ? cmax : METER_MAX;
          const ranked = [...teams].sort((a, b) => b[f] - a[f] || teams.indexOf(a) - teams.indexOf(b));
          const list = sorted ? ranked : teams;
          return (
            <motion.div key={f} className="v2-card v2-bcol" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24, delay: bi * 0.09 }}>
              <div className="v2-bhead"><MeterIcon kind={f} size={60} /><span>{label}</span></div>
              <div className="v2-brows">
                {list.map((t, r) => {
                  const c = teamColors(t);
                  const lead = ranked.indexOf(t) === 0;
                  return (
                    <motion.div key={t.id} layout transition={{ type: 'spring', stiffness: 200, damping: 22, delay: sorted ? (list.length - r) * 0.06 : 0 }} className={`v2-brow${lead ? ' is-lead' : ''}`} style={{ height: rowH }}>
                      <motion.div className="v2-bbar" style={{ background: c.shades[0], originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: Math.max(0.05, Math.min(1, t[f] / max)) }} transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 + bi * 0.1 }} />
                      <span className="v2-brank" style={{ background: MEDAL[ranked.indexOf(t)] ?? '#FFF3CF' }}>{ranked.indexOf(t) + 1}</span>
                      <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={rowH - 22} mood={lead ? 'wow' : 'happy'} />
                      <span className="v2-bname">{teamName(t)}</span>
                      <b className="v2-bval"><CountUp value={t[f]} /></b>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        <motion.div className="v2-card v2-bcol v2-locked" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.3 }}>
          <div className="v2-bhead"><motion.span animate={{ rotate: [-8, 8, -8] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} style={{ display: 'inline-flex', transformOrigin: '50% 20%' }}><Lock size={48} /></motion.span><span>Success</span></div>
          <div className="v2-brows">
            {teams.slice(0, Math.max(1, teams.length - 2)).map((t, i) => (
              <div key={t.id} className="v2-brow is-ghost" style={{ height: rowH }}>
                <span className="v2-bname" style={{ textAlign: 'center', opacity: 0.6 - i * 0.05 }}>? ? ?</span>
              </div>
            ))}
          </div>
          <motion.div className="v2-locked-note" style={{ height: rowH * 2 + 8 }} animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
            Unlocks on Show Day
          </motion.div>
        </motion.div>
      </div>

      <motion.div className="v2-card v2-town" initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 120, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.4 }}>
        {teams.map((t, i) => {
          const st = stageOf(t);
          return (
            <div key={t.id} className="v2-plot" title={STAGES.find(s => s.id === st.id)?.name}>
              <motion.div initial={{ y: 80, scale: 0.5, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 80, scale: 0.5, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.7 + i * 0.1 }}>
                <Building stage={st.id} color={teamBase(t)} size={teams.length >= 5 ? 150 : 180} animateIn />
              </motion.div>
              <div className="v2-plot-name">{teamName(t)}</div>
            </div>
          );
        })}
      </motion.div>
      <ReadyHint bottom={880} right={230} />
    </div>
  );
}
