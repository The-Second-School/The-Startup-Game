// The always-visible team bar at the bottom: one minimal chip per team, ONE line high when it genuinely fits (3 teams),
// otherwise two short lines (name, then meters). Customers and Happiness are the big meters, coins sit quietly beside them.
// Also the Lock Master's buzzer: tap chip -> choose option -> chip turns into a LOCK button.
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import { Avatar, CountUp, MeterIcon, OptionShape, useStageH, useStageW } from '../../ui';
import { lighten } from '../../ui/palette';
import type { Team } from '../../game/types';
import { Tap } from './Tap';
import { cx, teamColors } from '../lib/game';
import { BAR_BOTTOM } from '../lib/layout';
import { useLaggedTeams } from '../hooks/useLaggedTeams';
import '../choice.css';

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
  /** Spotlight mode: the chips of these teams (already revealed) can be tapped to see their result again. */
  tappableIds?: string[];
  paired?: boolean;
  extra?: (t: Team) => ReactNode;
  /** Override the top edge. By default the bar hugs the bottom of the stage. */
  top?: number;
  lag?: number;
  /** Setup screens: hide the meters, show only avatar, name and status. */
  slim?: boolean;
}

/** Legacy constants (old layout). The bar now sizes itself: use stripLayout(). */
export const CHIP_H = 180;
export const STRIP_BOTTOM = BAR_BOTTOM;

export function stripGeometry(n: number, paired = false, W = 1920) {
  const margin = n >= 5 ? 40 : 72;
  const gap = n >= 5 ? 24 : 40;
  if (paired) {
    const inner = 20, between = n >= 5 ? 48 : 64;
    const pairs = Math.ceil(n / 2);
    const gaps = Math.floor(n / 2) * inner + (pairs - 1) * between;
    return { margin, gap: inner, between, width: Math.floor((W - 2 * margin - gaps) / Math.max(1, n)) };
  }
  return { margin, gap, between: gap, width: Math.floor((W - 2 * margin - (n - 1) * gap) / Math.max(1, n)) };
}

/** Bar geometry: `oneLine` when chips are wide enough for avatar + name + meters side by side.
 *  `H` = real frame height (1080 + --fx). The bar is pinned to the bottom: top = H - BAR_BOTTOM - h. */
export function stripLayout(n: number, paired = false, W = 1920, H = 1080) {
  const geo = stripGeometry(n, paired, W);
  const oneLine = geo.width >= 520;
  const h = oneLine ? 96 : 136;
  return { ...geo, oneLine, h, top: H - STRIP_BOTTOM - h };
}

/** Horizontal centre and vertical centre of team i's chip (used to fly cards between the stage and the bar). */
export function chipCenter(i: number, n: number, paired = false, W = 1920, H = 1080) {
  const g = stripLayout(n, paired, W, H);
  let left = g.margin + i * g.width;
  for (let j = 1; j <= i; j++) left += paired ? (j % 2 === 1 ? g.gap : g.between) : g.gap;
  return { x: left + g.width / 2, y: g.top + g.h / 2 };
}

export function TeamStrip({ teams, mode = 'plain', selectedId, lockedIds = [], pickReady, faces, spotIds = [], onChip, tappableIds, paired, extra, top, lag, slim }: Props) {
  const shown = useLaggedTeams(teams, lag);
  const W = useStageW();
  const H = useStageH();
  const geo = stripLayout(teams.length, paired, W, H);
  return (
    <motion.div className="cx-strip" style={{ top: top ?? geo.top, height: geo.h, paddingLeft: geo.margin, paddingRight: geo.margin }} initial={{ y: 160, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
      {shown.map((t, i) => {
        const locked = lockedIds.includes(t.id);
        const selected = selectedId === t.id;
        const marginLeft = i === 0 ? 0 : paired ? (i % 2 === 1 ? geo.gap : geo.between) : geo.gap;
        return (
          <div key={t.id} className="cx-chip-slot" style={{ width: geo.width, height: geo.h, marginLeft }}>
            {paired && i % 2 === 1 && <div className="cx-pair-plus" style={{ left: -geo.gap / 2 - 20 }}>+</div>}
            <TeamChip
              team={t}
              index={i}
              mode={mode}
              locked={locked}
              selected={selected}
              lockMe={selected && !!pickReady}
              face={faces?.[t.id]}
              spot={spotIds.includes(t.id)}
              seen={!!tappableIds?.includes(t.id)}
              dim={spotIds.length > 0 && !spotIds.includes(t.id) && !(tappableIds?.includes(t.id))}
              oneLine={geo.oneLine}
              compact={geo.width < 300}
              tappable={tappableIds ? tappableIds.includes(t.id) : true}
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
  face?: ChipFace; spot: boolean; seen: boolean; dim: boolean; oneLine: boolean; compact: boolean; tappable: boolean;
  onTap?: () => void; extra?: ReactNode; slim?: boolean;
}

function Meters({ team, compact, oneLine }: { team: Team; compact: boolean; oneLine: boolean }) {
  const main = compact ? 32 : 40;
  const coin = compact ? 26 : 30;
  return (
    <div className={cx('cx-meters', compact && 'is-compact', oneLine && 'is-one')}>
      <span className="cx-m"><MeterIcon kind="customers" size={main} /><b><CountUp value={team.customers} /></b></span>
      <span className="cx-m"><MeterIcon kind="happiness" size={main} /><b><CountUp value={team.happiness} /></b></span>
      <span className="cx-m is-coin"><MeterIcon kind="coins" size={coin} /><b><CountUp value={team.coins} /></b></span>
    </div>
  );
}

function TeamChip({ team, index, mode, locked, selected, lockMe, face, spot, seen, dim, oneLine, compact, tappable, onTap, extra, slim }: ChipProps) {
  const c = teamColors(team);
  const flipped = mode === 'reveal' && !!face;
  const interactive = !!onTap && tappable && (mode === 'choose' || mode === 'plain' || mode === 'spotlight');
  const style = { '--c': c.base, '--c-dark': c.shades[4], '--c-light': lighten(c.shades[0], 0.1), '--c-mid': lighten(c.shades[1], 0.1) } as CSSProperties;
  const av = oneLine ? 60 : compact ? 44 : 52;

  // A little bump when a team's card has just flown back into its chip.
  const bump = useAnimationControls();
  const wasSpot = useRef(false);
  useEffect(() => {
    if (wasSpot.current && !spot) void bump.start({ scale: [1, 1.14, 0.97, 1], transition: { duration: 0.55, delay: 0.5, times: [0, 0.35, 0.7, 1] } });
    wasSpot.current = spot;
  }, [spot, bump]);

  // Status is ONE small icon on the corner of the chip, never a text pill.
  let badge: ReactNode = null;
  let badgeKey = 'none';
  if (mode === 'choose') {
    if (locked) { badge = <span className="cx-badge is-locked">✓</span>; badgeKey = 'locked'; }
    else if (selected) { badge = <span className="cx-badge is-choosing">👆</span>; badgeKey = 'choosing'; }
  } else if (mode === 'spotlight' && face && (spot || seen)) {
    badge = <span className="cx-badge is-face" style={{ background: face.color }}>{face.shape ? <OptionShape shape={face.shape} color={face.dark} size={34} /> : <span>{face.icon}</span>}</span>;
    badgeKey = 'face';
  }

  const body = (
    <motion.div className="cx-bump" animate={bump}>
      <motion.div
        className="cx-flip"
        animate={{ rotateY: flipped ? 180 : 0, y: spot ? -14 : selected ? -8 : 0, scale: spot ? 1.04 : 1 }}
        transition={{ rotateY: { type: 'spring', stiffness: 260, damping: 20, delay: flipped ? index * 0.04 : 0 }, default: { type: 'spring', stiffness: 420, damping: 18 } }}
      >
        <div className={cx('cx-chip', 'cx-front', oneLine && 'is-one', compact && 'is-compact', selected && 'is-selected', locked && mode === 'choose' && 'is-locked', lockMe && 'is-lockme', spot && 'is-spot', dim && 'is-dim', seen && !spot && 'is-seen')}>
          <div className="cx-chip-top">
            <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={av} mood={spot ? 'wow' : 'happy'} />
            <div className="cx-chip-name">{team.name}</div>
            {!slim && !lockMe && oneLine && <Meters team={team} compact={compact} oneLine />}
            {lockMe && oneLine && <div className="cx-lockme">LOCK</div>}
          </div>
          {lockMe && !oneLine && <div className="cx-lockme">LOCK</div>}
          {!slim && !lockMe && !oneLine && <Meters team={team} compact={compact} oneLine={false} />}
          {extra && <div className="cx-chip-extra">{extra}</div>}
          {badge && <div className="cx-badge-wrap" key={badgeKey}>{badge}</div>}
        </div>
        <div className="cx-chip cx-back" style={face ? { background: face.color } : undefined}>
          {face && (
            <>
              <span className="cx-back-shape">{face.shape ? <OptionShape shape={face.shape} color={face.dark} size={46} /> : <span className="cx-back-icon">{face.icon}</span>}</span>
              <div className="cx-back-text">
                <div className="cx-back-name">{team.name}</div>
                <div className="cx-back-choice">{face.icon && face.shape ? `${face.icon} ` : ''}{face.text}</div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <Tap id={`chip-${team.id}`} onTap={onTap} sound={mode === 'plain' || mode === 'spotlight' ? 'tap' : undefined} disabled={!interactive || (locked && mode === 'choose')} deniedSound={interactive && locked ? 'buzz' : null} className="cx-chip-tap" style={style}>
      {body}
    </Tap>
  );
}
