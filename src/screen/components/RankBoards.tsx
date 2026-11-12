// Leaderboards. One <Board> = one ranked list: [medal] + [container with team avatar, team name and value].
// Gold / silver / bronze medals for the top three (no rank numbers), a small neutral dot for everybody else, and a taller,
// glowing gold row with a crown. When the board knows the standings from BEFORE the act (`prev`) it first shows those,
// rolls the numbers, then slides the rows into the new order: climbers sparkle and pop, slippers droop under a little cloud.
// <RankBoards> (used by the question "leaderboard moment") is three boards side by side with the same look.
import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Avatar, MeterIcon, Num } from '../../ui';
import type { Team } from '../../game/types';
import { BOARD_FIELDS, FIELD_LABEL, rankOf, rankedIds, type Field } from '../../narration/lines/board';
import { useLaggedTeams } from '../hooks/useLaggedTeams';
import { useTimeline } from '../hooks/useTimeline';
import { cx, teamColors, teamName } from '../lib/game';
import { Crown, Medal, MoveArrow, RainCloud, Sparkle } from './art';
import '../board.css';

export type { Field };
export type BoardEvent = 'sort' | 'rise' | 'fall' | 'gold';

const HEAD = 76;      // panel header (icon + label)
const PAD = 16;       // panel padding
const GAP = 10;       // gap between rows
const CROWN_ROOM = 26; // space above the gold row for its crown
const EXTRA = 0.4;    // the gold row is this much taller than the others
const SPARK = ['#FFC800', '#58CC02', '#1CB0F6', '#FF6FB5', '#FF9600'];
const MEDAL_KIND = ['gold', 'silver', 'bronze'] as const;

export interface BoardProps {
  field: Field;
  teams: Team[];
  /** Values of this field before the act (team id -> value). Gives the "who climbed / who slipped" moment. */
  prev?: Record<string, number>;
  width: number;
  /** Whole panel height, header included. */
  height: number;
  /** `main` boards (Customers, Happiness) are bigger and bolder than the `side` board (Coins). */
  tone?: 'main' | 'side';
  /** Extra wait before this board starts its show (ms). */
  delay?: number;
  /** Wait before the rows sort when there is no `prev` (ms). 0 = already sorted on arrival. */
  sortDelay?: number;
  onEvent?: (e: BoardEvent) => void;
}

function Sparks() {
  const n = 10;
  return (
    <div className="bd-sparks" aria-hidden>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.4;
        const d = 80 + (i % 3) * 34;
        return (
          <motion.span key={i} className="bd-spark" initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: Math.cos(a) * d * 1.7, y: Math.sin(a) * d * 0.95 - 24, scale: [0, 1.25, 0], opacity: [1, 1, 0], rotate: 160 }}
            transition={{ duration: 1.2, delay: i * 0.03, ease: 'easeOut' }}>
            <Sparkle size={30} color={SPARK[i % SPARK.length]} />
          </motion.span>
        );
      })}
    </div>
  );
}

export function Board({ field, teams, prev, width, height, tone = 'main', delay = 0, sortDelay = 900, onEvent }: BoardProps) {
  const n = teams.length;
  const cur: Record<string, number> = {};
  teams.forEach(t => { cur[t.id] = t[field]; });
  const base = prev ?? cur;
  const priorKnown = !!prev && new Set(Object.values(base)).size > 1;   // a real ranking existed before
  const startOrder = priorKnown ? rankedIds(teams, t => base[t.id]) : teams.map(t => t.id);
  const endOrder = rankedIds(teams, t => cur[t.id]);

  const valueAt = prev ? delay + 900 : 0;
  const orderAt = prev ? valueAt + 1100 : delay + sortDelay;
  const instant = !prev && sortDelay <= 0;
  const tl = useTimeline(field, instant ? [] : [valueAt, orderAt, orderAt + 1000]);
  const step = instant ? 3 : tl;           // 0 start, 1 numbers rolled, 2 rows moved, 3 effects shown
  const vals = step >= 1 ? cur : base;
  const order = step >= 2 ? endOrder : startOrder;
  const rankVals = step >= 2 ? cur : base;
  const arrived = step >= 3;
  const ranksReady = !prev || priorKnown || step >= 2;   // before the first sort, ranks would be meaningless (everybody level)

  // layout
  const areaH = height - HEAD - PAD * 2;
  const usable = areaH - CROWN_ROOM;
  const rowH = Math.max(64, Math.min(tone === 'main' ? 168 : 140, Math.floor((usable - GAP * (n - 1)) / (n + EXTRA))));
  const goldH = Math.round(rowH * (1 + EXTRA));
  const top0 = CROWN_ROOM + Math.max(0, Math.floor((usable - (goldH + (n - 1) * (rowH + GAP))) / 2));
  const slotY = (p: number) => top0 + (p === 0 ? 0 : goldH + GAP + (p - 1) * (rowH + GAP));
  const slotH = (p: number) => (p === 0 ? goldH : rowH);
  const av = Math.min(tone === 'main' ? 116 : 92, rowH - 16);

  // who moved (only when we know the standings from before)
  const climbers = priorKnown ? teams.filter(t => endOrder.indexOf(t.id) < startOrder.indexOf(t.id)) : [];
  const slippers = priorKnown ? teams.filter(t => endOrder.indexOf(t.id) > startOrder.indexOf(t.id)) : [];
  const newTop = priorKnown && startOrder[0] !== endOrder[0] ? endOrder[0] : null;
  const evt = useRef(onEvent);
  evt.current = onEvent;
  useEffect(() => {
    if (!priorKnown) return;
    if (step === 2) evt.current?.('sort');
    if (step === 3) {
      if (newTop) evt.current?.('gold');
      if (climbers.length) evt.current?.('rise');
      if (slippers.length) evt.current?.('fall');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <motion.div className={cx('bd-board', tone === 'main' ? 'is-main' : 'is-side')} style={{ width, height }}
      initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24, delay: Math.min(delay, 300) / 1000 }}>
      <div className="bd-head"><MeterIcon kind={field} size={tone === 'main' ? 64 : 52} /><span>{FIELD_LABEL[field]}</span></div>
      <div className="bd-rows" style={{ height: areaH }}>
        {teams.map(t => {
          const c = teamColors(t);
          const pos = order.indexOf(t.id);
          const from = startOrder.indexOf(t.id);
          const to = endOrder.indexOf(t.id);
          const rank = ranksReady ? rankOf(rankVals, t.id) : 99;
          const medal = rank <= 3 ? MEDAL_KIND[rank - 1] : null;
          const top = pos === 0 && rank === 1;
          const moved = priorKnown && step >= 2 && from !== to;
          const up = moved && to < from;
          const down = moved && to > from;
          const dropsCrown = newTop === t.id && step >= 2;
          const mood = down && arrived ? 'sad' : rank === 1 ? 'wow' : 'happy';
          const lastToLand = (n - 1 - pos) * 0.07;
          const pose = down && arrived
            ? { rotate: [0, -2.4, 2.4, -1.4, 1.4, 0], x: [0, -12, 12, -7, 7, 0] }
            : up && arrived ? { scale: [1, 1.07, 0.98, 1.03, 1] } : { scale: 1, rotate: 0, x: 0 };
          return (
            <motion.div key={t.id} className={cx('bd-row', rank === 1 && 'is-gold')}
              initial={{ y: slotY(pos), height: slotH(pos), opacity: 0 }}
              animate={{ y: slotY(pos), height: slotH(pos), opacity: 1 }}
              transition={{ default: { type: 'spring', stiffness: 150, damping: 19, delay: step >= 2 && priorKnown ? lastToLand : 0 }, opacity: { duration: 0.35, delay: 0.1 + teams.indexOf(t) * 0.06 } }}>
              <div className="bd-medal">
                <motion.div key={medal ?? 'dot'} initial={{ scale: 0, rotate: -35 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 13, delay: step >= 2 && priorKnown ? lastToLand + 0.45 : 0.15 }}>
                  {medal ? <Medal kind={medal} size={top ? 96 : 68} /> : <i className="bd-dot" />}
                </motion.div>
              </div>
              <motion.div className="bd-card" style={{ ['--tc' as string]: c.shades[2] }} animate={pose}
                transition={down && arrived ? { duration: 0.85 } : up && arrived ? { duration: 0.9 } : { type: 'spring', stiffness: 300, damping: 24 }}>
                {top && (
                  <motion.span className="bd-crown" key={dropsCrown ? 'drop' : 'still'}
                    initial={dropsCrown ? { y: -170, rotate: -50, opacity: 0 } : false} animate={{ y: 0, rotate: -12, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 10, delay: dropsCrown ? 0.6 + (n - 1) * 0.07 : 0 }}>
                    <Crown size={tone === 'main' ? 78 : 64} />
                  </motion.span>
                )}
                <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={av} mood={mood} />
                <span className="bd-name">{teamName(t)}</span>
                <Num value={vals[t.id]} className="bd-val" />
                {moved && arrived && (
                  <motion.span className={cx('bd-move', up ? 'is-up' : 'is-down')} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 12 }}>
                    <MoveArrow up={up} size={30} /><Num value={Math.abs(to - from)} />
                  </motion.span>
                )}
                {up && arrived && <Sparks />}
                {down && arrived && (
                  <motion.div className="bd-cloud" initial={{ opacity: 0, y: -24, scale: 0.6 }} animate={{ opacity: [0, 1, 1, 0], y: [-24, 0, 0, 0], scale: [0.6, 1, 1, 0.9] }} transition={{ duration: 3.8, times: [0, 0.1, 0.82, 1] }}>
                    <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}><RainCloud size={96} /></motion.div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

interface Props { teams: Team[]; fields?: Field[]; width: number; rowH?: number; sortDelay?: number; lag?: number; compactNames?: boolean }

/** Three boards side by side. Starts in team order and slides into rank order. */
export function RankBoards({ teams, fields = BOARD_FIELDS, width, rowH = 76, sortDelay = 900, lag = 0 }: Props) {
  const shown = useLaggedTeams(teams, lag);
  const n = Math.max(1, shown.length);
  const rowsH = n * rowH + (n - 1) * 8;            // the room the caller reserved for the rows
  const height = rowsH + HEAD + PAD * 2;
  return (
    <div className="bd-boards">
      {fields.map((f, bi) => (
        <Board key={f} field={f} teams={shown} width={width} height={height} tone={f === 'coins' ? 'side' : 'main'} delay={bi * 90} sortDelay={sortDelay} />
      ))}
    </div>
  );
}
