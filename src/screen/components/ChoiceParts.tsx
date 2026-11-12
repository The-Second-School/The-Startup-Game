// Shared pieces for the question / price / mega order flow.
import { isSecretStep, SCRIPT } from '../../game/content';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Avatar, Bolt, MeterIcon, OptionShape, Fibbot } from '../../ui';
import { lighten } from '../../ui/palette';
import { QuestionIntro } from '../../scenes';
import { GAP } from '../lib/layout';
import type { Deltas, Team } from '../../game/types';
import { useNarr } from '../../narration/store';
import { useGame } from '../lib/ctx';
import { useUi } from '../lib/ui';
import { lockInput } from '../lib/tap';
import { cx, moodFor, teamColors } from '../lib/game';
import { ReadyHint } from './ReadyHint';
import { DeltaRow } from './DeltaRow';
import { RankBoards } from './RankBoards';
import type { ChipFace } from './TeamStrip';
import { useStableCallback } from '../hooks/useStableCallback';
import '../choice.css';

export const ASLEEP: ChipFace = { color: '#E9DFC2', dark: '#C9BC98', icon: '😴', text: 'Fell asleep' };

/** Intro phase: the small question animation, then a bouncing Ready hint for the host. */
export function IntroStage({ anim, text }: { anim: string; text: string }) {
  const [done, setDone] = useState(false);
  const onDone = useStableCallback(() => setDone(true));
  return (
    <div className="scr-full">
      <div className="scr-intro-box"><QuestionIntro anim={anim} text={text} onDone={onDone} /></div>
      <ReadyHint show={!!done} />
    </div>
  );
}

/** Tap flow for the Lock Master: chip -> option -> chip again = LOCK. */
export function useChooser(st: { selectedTeamId: string | null; locks: Record<string, number> }) {
  const { dispatch, live } = useGame();
  const pick = useUi(s => s.pick);
  const setPick = useUi(s => s.setPick);
  useEffect(() => { setPick(null); }, [st.selectedTeamId, setPick]);
  const stepId = useGame().state.stepIndex;
  const secret = isSecretStep(SCRIPT[stepId]?.id ?? '');
  const onChip = (id: string) => {
    if (secret) return;   // secret decisions are entered by the host on the phone, never tapped on the big screen
    if (!live || st.locks[id] !== undefined) return;
    if (st.selectedTeamId === id) {
      if (pick !== null) { dispatch({ type: 'LOCK', teamId: id, choice: pick }); setPick(null); }
      else dispatch({ type: 'SELECT_TEAM', teamId: null });
    } else {
      dispatch({ type: 'SELECT_TEAM', teamId: id });
      setPick(null);
    }
  };
  return { pick, setPick, onChip, secret };
}

/** Block kid taps for a moment whenever `key` changes (reveal animations). */
export function useRevealLock(key: unknown, ms: number) {
  useEffect(() => { lockInput(ms); }, [key, ms]);
}


/** True while the narration dock shows its small transcript bubble (content must then start below it, at CONTENT_TOP). */
export function useTranscript() {
  return useNarr(s => !!s.id && s.showText);
}

/** True once `minMs` have passed since `key` changed AND the narration has finished speaking: the moment "Ready!" may show. */
export function useReadyAfter(key: string, minMs: number) {
  const done = useNarr(s => s.done);
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    setWaited(false);
    const id = setTimeout(() => setWaited(true), minMs);
    return () => clearTimeout(id);
  }, [key, minMs]);
  return waited && done;
}

/** Big calm centre text while the host has not revealed yet (everybody locked in). */
export function WaitBig({ title, sub, icon = '🥁', top = 250 }: { title: string; sub: string; icon?: string; top?: number }) {
  return (
    <motion.div className="cx-wait" style={{ top }} initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.25 }}>
      <motion.div className="cx-wait-icon" animate={{ rotate: [-10, 10, -10], y: [0, -10, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>{icon}</motion.div>
      <div className="cx-wait-title">{title}</div>
      <div className="cx-wait-sub">{sub}</div>
    </motion.div>
  );
}

export interface ChosenEntry { team: Team; face: ChipFace; /** "Free" / "−20 🪙" */ tag?: string }

const tagCls = (tag: string) => cx('cx-tag', tag === 'Free' && 'is-free', tag.startsWith('+') && 'is-plus', tag.startsWith('−') && 'is-cost');

/** `top` and `bottomY` are absolute y coordinates in the frame (bottomY = where the content must end, i.e. the team bar's top minus GAP).
 *  "Who chose what": one calm, roomy row (or two) of cards: team, option (shape + icon + text) and its coin cost. Never stacked vertically.
 *  The cards fill the whole band between top and bottomY, so the space scales with the frame height. */
export function ChosenCards({ entries, top, bottomY, left = 56, right = 56, maxCols = 4, paired = false }: { entries: ChosenEntry[]; top: number; bottomY: number; left?: number; right?: number; maxCols?: number; paired?: boolean }) {
  const n = entries.length;
  const rows = paired ? 1 : Math.max(1, Math.ceil(n / maxCols));
  const cols = paired ? n : Math.max(1, Math.ceil(n / rows));
  const wide = rows > 1;
  const region = Math.max(200, bottomY - top);
  // Grid rows share the region exactly, with GRID_GAP between them: no card can reach the heading or the team bar.
  const hCard = Math.floor((region - (rows - 1) * GRID_GAP) / rows);
  const cards = entries.map((e, i) => {
    const c = teamColors(e.team);
    const style: CSSProperties = { background: lighten(c.shades[0], 0.12), marginLeft: paired && i > 0 ? (i % 2 === 1 ? 20 : 56) : 0 };
    return (
      <motion.div
        key={e.team.id}
        className={cx('cx-ch', wide && 'is-wide', paired && 'is-narrow')}
        style={style}
        initial={{ y: 70, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.25 + i * 0.12 }}
      >
        <div className="cx-ch-head">
          <Avatar seed={e.team.avatarSeed} colorIndex={e.team.colorIndex} shade={2} size={wide ? 72 : paired && n > 4 ? 96 : 120} ring />
          {wide ? (
            <div className="cx-ch-who">
              <div className="cx-ch-name">{e.team.name}</div>
              {e.tag && <span className={tagCls(e.tag)}>{e.tag}</span>}
            </div>
          ) : <div className="cx-ch-name">{e.team.name}</div>}
        </div>
        <div className="cx-ch-pick" style={{ background: lighten(e.face.color, 0.1) }}>
          {e.face.shape && <OptionShape shape={e.face.shape} color={e.face.dark} size={wide ? 52 : 60} />}
          <div className="cx-ch-txt">{e.face.icon && <span className="cx-ch-icon">{e.face.icon}</span>} {e.face.text}</div>
        </div>
        {e.tag && !wide && <span className={tagCls(e.tag)}>{e.tag}</span>}
      </motion.div>
    );
  });
  return (
    <div className={cx('cx-chgrid', paired ? 'is-paired' : 'is-grid')} style={{ top, height: region, left, right, '--cols': cols, '--h': `${hCard}px` } as CSSProperties}>
      {cards}
    </div>
  );
}

/** Gap between the cards of a grid (and between result rows). Same rhythm as the rest of the frame. */
const GRID_GAP = GAP;

/** Result of one team on the question, as a compact row: name + the three changes (Customers, Happiness, Coins). */
export interface DoneRow { team: Team; deltas: Deltas }

const LEGEND: { kind: 'customers' | 'happiness' | 'coins'; name: string; text: string }[] = [
  { kind: 'customers', name: 'Customers', text: 'Who uses your startup' },
  { kind: 'happiness', name: 'Happiness', text: 'How much they love it' },
  { kind: 'coins', name: 'Coins', text: 'Your money' },
];

const signed = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0');
const pillCls = (v: number) => cx('cx-res-pill', v > 0 && 'is-up', v < 0 && 'is-down', v === 0 && 'is-zero');

/** End of a question: a heading, a legend for the three meters (beside the Bolt dock, which sits under the heading),
 *  then one row per team with its change for this question. Two columns when there are more than three teams.
 *  `legendTop` / `top` move down when the dock's transcript bubble is showing; `bottomY` is absolute (the bar's top minus GAP). */
export function DoneResults({ title, rows, bottomY, legendTop = 150, top = 306 }: { title: string; rows: DoneRow[]; bottomY: number; legendTop?: number; top?: number }) {
  const n = rows.length;
  const cols = n > 3 ? 2 : 1;
  const nRows = Math.max(1, Math.ceil(n / cols));
  const region = Math.max(200, bottomY - top);
  const rowH = Math.floor((region - (nRows - 1) * GRID_GAP) / nRows);
  return (
    <motion.div className="cx-res" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.2 }}>
      <div className="cx-res-title">{title}</div>
      <div className="cx-res-legend" style={{ top: legendTop }}>
        {LEGEND.map(l => (
          <div key={l.kind} className="cx-res-key">
            <MeterIcon kind={l.kind} size={56} />
            <div><b>{l.name}</b><span>{l.text}</span></div>
          </div>
        ))}
      </div>
      <div className="cx-res-grid" style={{ top, height: region, '--cols': cols, '--rh': `${rowH}px` } as CSSProperties}>
        {rows.map(r => {
          const c = teamColors(r.team);
          return (
            <div key={r.team.id} className="cx-res-row" style={{ background: lighten(c.shades[0], 0.12) }}>
              <Avatar seed={r.team.avatarSeed} colorIndex={r.team.colorIndex} shade={2} size={64} ring />
              <div className="cx-res-name">{r.team.name}</div>
              {LEGEND.map(l => (
                <div key={l.kind} className="cx-res-cell">
                  <MeterIcon kind={l.kind} size={44} />
                  <span className={pillCls(r.deltas[l.kind])}>{signed(r.deltas[l.kind])}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

interface SpotProps {
  team: Team;
  /** The exact question text, shown above the team's answer. */
  question?: string;
  face: ChipFace | null;
  story: string;
  deltas: Deltas;
  trap?: boolean;
  bonus?: string;
  /** Kid-simple reason WHY the meters changed (shown under the story). */
  why?: string;
  /** Explanation of the bonus pill (e.g. why +5 seconds in Bug Smash). */
  bonusWhy?: string;
  /** Coin cost of the chosen option: "Free" / "−20 🪙". */
  tag?: string;
  extra?: ReactNode;
  width?: number;
  chosenLabel?: string;
  /** Offset (stage px, relative to the card's resting place) of the team's chip in the bar: the card flies out of it and back into it. */
  from?: { x: number; y: number };
  /** Height of the card (the views pass the free band down to the team bar). */
  height?: number;
}

/** The big per-team reveal card: team, strong "chose" box, story, WHY, delta pills. Flies in from its chip and back into it. */
export function SpotlightCard({ team, question, face, story, deltas, trap, bonus, why, bonusWhy, tag, extra, width = 1420, chosenLabel = 'chose', from, height }: SpotProps) {
  const c = teamColors(team);
  const mood = trap ? 'sad' : moodFor(deltas);
  return (
    <motion.div
      key={team.id}
      className={`cx-spot${trap ? ' has-trap' : ''}`}
      style={{ width, height, borderColor: '#fff', boxShadow: 'var(--sh)', transformOrigin: '50% 50%' }}
      initial={from ? { x: from.x, y: from.y, scale: 0.16, opacity: 0 } : { scale: 0.5, y: 120, opacity: 0, rotate: -4 }}
      animate={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
      exit={from ? { x: from.x, y: from.y, scale: 0.16, opacity: 0, transition: { duration: 0.55, ease: [0.55, 0, 0.8, 0.4] } } : { opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 170, damping: 20, delay: from ? 0.3 : 0 }}
    >
      <div className="cx-spot-left" style={{ background: lighten(c.shades[1], 0.1) }}>
        <motion.div initial={{ scale: 0.92 }} animate={{ scale: [0.92, 1.08, 1] }} transition={{ delay: 0.7, duration: 0.5 }}>
          <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={250} mood={mood} ring />
        </motion.div>
        <div className="cx-spot-name">{team.name}</div>
      </div>
      <div className="cx-spot-right">
        {question && (
          <motion.div className="cx-spot-q" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <span className="cx-spot-q-tag">Question</span>
            <div className="cx-spot-q-text">{question}</div>
          </motion.div>
        )}
        {face && (
          <motion.div className="cx-spot-choice" style={{ background: lighten(face.color, 0.1), boxShadow: 'var(--sh)' }} initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.75, type: 'spring', stiffness: 400, damping: 20 }}>
            <span className="cx-spot-chose">{chosenLabel}</span>
            {face.shape && <OptionShape shape={face.shape} color={face.dark} size={56} />}
            <span className="cx-spot-picktext">{face.icon} {face.text}</span>
            {tag && <span className={tagCls(tag)}>{tag}</span>}
          </motion.div>
        )}
        <motion.div className="cx-spot-story" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>{story}</motion.div>
        {why && (
          <motion.div className="cx-spot-why" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7 }}>
            <span className="cx-spot-why-tag">Why?</span>{why}
          </motion.div>
        )}
        <DeltaRow deltas={deltas} start={2400} gap={500} />
        {bonus && (
          <motion.div className="cx-spot-bonus" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 3.9, type: 'spring', stiffness: 400, damping: 14 }}>
            <b>⭐ {bonus}</b>{bonusWhy && <span>{bonusWhy}</span>}
          </motion.div>
        )}
        {extra}
      </div>
      {trap && (
        <motion.div className="cx-spot-fibbot" initial={{ y: 200, rotate: 20 }} animate={{ y: 0, rotate: -6 }} transition={{ delay: 1.6, type: 'spring', stiffness: 260, damping: 12 }}>
          <Fibbot mood="laugh" size={200} />
          <div className="scr-trap-stamp is-static">Jhootu’s trick!</div>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Calm end-of-question state: no board, no clutter, just what the three meters mean. Customers and Happiness lead, coins follow. */
export function DoneSummary({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <motion.div className="cx-done" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.2 }}>
      <div className="cx-done-title">{title}</div>
      <div className="cx-done-meters">
        <div className="cx-done-m is-main"><MeterIcon kind="customers" size={96} /><b>Customers</b><span>People who use your startup</span></div>
        <div className="cx-done-m is-main"><MeterIcon kind="happiness" size={96} /><b>Happiness</b><span>How much they love it</span></div>
        <div className="cx-done-m"><MeterIcon kind="coins" size={64} /><b>Coins</b><span>Your money</span></div>
      </div>
      {children}
    </motion.div>
  );
}

/** "Leaderboard moment" at the end of a question. */
export function DoneBoards({ teams, title = 'Leaderboard time!' }: { teams: Team[]; title?: string }) {
  // Boards live in y 226..840 (team chips start at 852), so row height shrinks as teams grow: always one clean, equal row per team.
  const n = Math.max(1, teams.length);
  const rowH = Math.min(100, Math.floor((516 - (n - 1) * 8) / n));
  return (
    <>
      <div className="scr-done-head">
        <Bolt pose="cheer" size={110} />
        <div className="scr-h1" style={{ fontSize: 72 }}>{title}</div>
      </div>
      <div style={{ position: 'absolute', left: 56, right: 56, top: 226 }}>
        <RankBoards teams={teams} width={576} rowH={rowH} />
      </div>
    </>
  );
}
