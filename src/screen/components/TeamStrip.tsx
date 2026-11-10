// The always-visible leaderboard strip at the bottom (y 852..1040): one chip per team.
// Also the Lock Master's buzzer: tap chip -> choose option -> chip turns into a LOCK button.
import type { CSSProperties, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar, CountUp, MeterIcon, OptionShape } from '../../ui';
import type { Team } from '../../game/types';
import { Tap } from './Tap';
import { cx, teamColors } from '../lib/game';
import { useLaggedTeams } from '../hooks/useLaggedTeams';

export type Shape = 'circle' | 'square' | 'triangle' | 'star';
export interface ChipFace { color: string; dark: string; shape?: Shape; icon?: string; text: string }

export type StripMode = 'plain' | 'choose' | 'reveal' | 'spotlight';

interface Props {
  teams: Team[];
  mode?: StripMode;
  selectedId?: string | null;
  lockedIds?: string[];
  pickReady?: boolean;
  faces?: Record<string, ChipFace>;
  spotIds?: string[];
  onChip?: (id: string) => void;
  paired?: boolean;
  extra?: (t: Team) => ReactNode;
  top?: number;
  lag?: number;
  /** Setup screens: hide the meters, show only avatar, name and status. */
  slim?: boolean;
}

export const STRIP_TOP = 852;
export const CHIP_H = 180;

export function stripGeometry(n: number, paired = false) {
  const margin = n >= 5 ? 40 : 72;
  const gap = n >= 5 ? 24 : 40;
  if (paired) {
    const inner = 20, between = n >= 5 ? 48 : 64;
    const pairs = Math.ceil(n / 2);
    const gaps = Math.floor(n / 2) * inner + (pairs - 1) * between;
    return { margin, gap: inner, between, width: Math.floor((1920 - 2 * margin - gaps) / Math.max(1, n)) };
  }
  return { margin, gap, between: gap, width: Math.floor((1920 - 2 * margin - (n - 1) * gap) / Math.max(1, n)) };
}

export function TeamStrip({ teams, mode = 'plain', selectedId, lockedIds = [], pickReady, faces, spotIds = [], onChip, paired, extra, top = STRIP_TOP, lag, slim }: Props) {
  const shown = useLaggedTeams(teams, lag);
  const geo = stripGeometry(teams.length, paired);
  return (
    <motion.div className="scr-strip" style={{ top, paddingLeft: geo.margin, paddingRight: geo.margin }} initial={{ y: 220, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
      {shown.map((t, i) => {
        const locked = lockedIds.includes(t.id);
        const selected = selectedId === t.id;
        const marginLeft = i === 0 ? 0 : paired ? (i % 2 === 1 ? geo.gap : geo.between) : geo.gap;
        return (
          <div key={t.id} className="scr-chip-slot" style={{ width: geo.width, marginLeft }}>
            {paired && i % 2 === 1 && <div className="scr-pair-plus" style={{ left: -geo.gap / 2 - 30 }}>+</div>}
            <TeamChip
              team={t}
              index={i}
              mode={mode}
              locked={locked}
              selected={selected}
              lockMe={selected && !!pickReady}
              face={faces?.[t.id]}
              spot={spotIds.includes(t.id)}
              dim={spotIds.length > 0 && !spotIds.includes(t.id)}
              compact={teams.length >= 5}
              onTap={onChip ? () => onChip(t.id) : undefined}
              extra={extra?.(t)}
              slim={slim}
            />
          </div>
        );
      })}
    </motion.div>
  );
}

interface ChipProps {
  team: Team; index: number; mode: StripMode; locked: boolean; selected: boolean; lockMe: boolean;
  face?: ChipFace; spot: boolean; dim: boolean; compact: boolean; onTap?: () => void; extra?: ReactNode; slim?: boolean;
}

function TeamChip({ team, index, mode, locked, selected, lockMe, face, spot, dim, compact, onTap, extra, slim }: ChipProps) {
  const c = teamColors(team);
  const flipped = mode === 'reveal' && !!face;
  const interactive = !!onTap && (mode === 'choose' || mode === 'plain');
  const style = { '--c': c.base, '--c-dark': c.shades[4], '--c-light': c.shades[0], '--c-mid': c.shades[1] } as CSSProperties;
  let status: ReactNode = null;
  const statusKey = mode === 'choose' ? (locked ? 'l' : selected ? 'c' : 't') : 'x';
  if (mode === 'choose') {
    status = locked
      ? <span className="scr-chip-pill is-locked">Locked</span>
      : selected ? <span className="scr-chip-pill is-choosing">Choosing…</span>
      : <span className="scr-chip-pill">Tap to choose</span>;
  } else if (extra) status = extra;

  const body = (
    <motion.div
      className="scr-chip-flip"
      animate={{ rotateY: flipped ? 180 : 0, y: spot ? -18 : selected ? -10 : 0, scale: spot ? 1.04 : 1 }}
      transition={{ rotateY: { type: 'spring', stiffness: 260, damping: 20, delay: flipped ? index * 0.04 : 0 }, default: { type: 'spring', stiffness: 420, damping: 18 } }}
    >
      <div className={cx('scr-chip', 'scr-chip-front', selected && 'is-selected', locked && mode === 'choose' && 'is-locked', lockMe && 'is-lockme', spot && 'is-spot', dim && 'is-dim')}>
        {lockMe ? (
          <>
            <div className="scr-chip-top">
              <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={compact ? 52 : 60} />
              <div className="scr-chip-name">{team.name}</div>
            </div>
            <div className="scr-lockme">LOCK</div>
          </>
        ) : (
          <>
            <div className="scr-chip-top">
              <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={compact ? 56 : 64} mood={spot ? 'wow' : 'happy'} />
              <div className="scr-chip-name">{team.name}</div>
            </div>
            {!slim && <div className={cx('scr-chip-meters', compact && 'is-compact')}>
              <span><MeterIcon kind="customers" size={34} /><b><CountUp value={team.customers} /></b></span>
              <span><MeterIcon kind="happiness" size={34} /><b><CountUp value={team.happiness} /></b></span>
              <span><MeterIcon kind="coins" size={34} /><b><CountUp value={team.coins} /></b></span>
            </div>}
            <AnimatePresence mode="popLayout" initial={false}>
              {status && (
                <motion.div key={statusKey} className="scr-chip-status" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 26 }}>{status}</motion.div>
              )}
            </AnimatePresence>
            {mode === 'spotlight' && face && (
              <div className="scr-chip-badge" style={{ background: face.color, boxShadow: `var(--sh)` }}>
                {face.shape ? <OptionShape shape={face.shape} color={face.dark} size={34} /> : <span>{face.icon}</span>}
              </div>
            )}
          </>
        )}
      </div>
      <div className="scr-chip scr-chip-back" style={face ? { background: face.color, boxShadow: `var(--sh)` } : undefined}>
        {face && (
          <>
            <div className="scr-chip-back-name">{team.name}</div>
            <div className="scr-chip-back-face">
              {face.shape && <span className="scr-shape-dot"><OptionShape shape={face.shape} color={face.dark} size={40} /></span>}
              {face.icon && <span className="scr-chip-back-icon">{face.icon}</span>}
            </div>
            <div className="scr-chip-back-text">{face.text}</div>
          </>
        )}
      </div>
    </motion.div>
  );

  return (
    <Tap id={`chip-${team.id}`} onTap={onTap} sound={mode === 'plain' ? 'tap' : undefined} disabled={!interactive || (locked && mode === 'choose')} deniedSound={interactive && locked ? 'buzz' : null} className="scr-chip-tap" style={style}>
      {body}
    </Tap>
  );
}
