// Shared pieces for the question / price / mega order flow.
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Avatar, Bolt, OptionShape, Raivan } from '../../ui';
import { QuestionIntro } from '../../scenes';
import type { Deltas, Team } from '../../game/types';
import { useGame } from '../lib/ctx';
import { useUi } from '../lib/ui';
import { lockInput } from '../lib/tap';
import { moodFor, teamColors } from '../lib/game';
import { ReadyHint } from './ReadyHint';
import { DeltaRow } from './DeltaRow';
import { RankBoards } from './RankBoards';
import type { ChipFace } from './TeamStrip';
import { useStableCallback } from '../hooks/useStableCallback';

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
  const onChip = (id: string) => {
    if (!live || st.locks[id] !== undefined) return;
    if (st.selectedTeamId === id) {
      if (pick !== null) { dispatch({ type: 'LOCK', teamId: id, choice: pick }); setPick(null); }
      else dispatch({ type: 'SELECT_TEAM', teamId: null });
    } else {
      dispatch({ type: 'SELECT_TEAM', teamId: id });
      setPick(null);
    }
  };
  return { pick, setPick, onChip };
}

/** Block kid taps for a moment whenever `key` changes (reveal animations). */
export function useRevealLock(key: unknown, ms: number) {
  useEffect(() => { lockInput(ms); }, [key, ms]);
}

interface SpotProps {
  team: Team;
  face: ChipFace | null;
  story: string;
  deltas: Deltas;
  trap?: boolean;
  bonus?: string;
  extra?: ReactNode;
  width?: number;
  chosenLabel?: string;
}

/** The big per-team reveal card. */
export function SpotlightCard({ team, face, story, deltas, trap, bonus, extra, width = 1420, chosenLabel = 'chose' }: SpotProps) {
  const c = teamColors(team);
  const mood = trap ? 'sad' : moodFor(deltas);
  return (
    <motion.div key={team.id} className={`scr-spot${trap ? ' has-trap' : ''}`} style={{ width, borderColor: '#fff', boxShadow: `var(--sh)` }}
      initial={{ scale: 0.5, y: 120, opacity: 0, rotate: -4 }} animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
      <div className="scr-spot-left" style={{ background: c.shades[1] }}>
        <motion.div initial={{ scale: 0.92 }} animate={{ scale: [0.92, 1.08, 1] }} transition={{ delay: 0.2, duration: 0.5 }}>
          <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={280} mood={mood} ring />
        </motion.div>
        <div className="scr-spot-name">{team.name}</div>
      </div>
      <div className="scr-spot-right">
        {face && (
          <motion.div className="scr-spot-choice" style={{ background: face.color, boxShadow: `var(--sh)` }} initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25, type: 'spring', stiffness: 400, damping: 20 }}>
            <span className="scr-spot-chose">{chosenLabel}</span>
            {face.shape && <OptionShape shape={face.shape} color={face.dark} size={44} />}
            <span>{face.icon} {face.text}</span>
          </motion.div>
        )}
        <motion.div className="scr-spot-story" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>{story}</motion.div>
        <DeltaRow deltas={deltas} start={1100} />
        {bonus && <motion.div className="scr-spot-bonus" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.4, type: 'spring', stiffness: 400, damping: 14 }}>⭐ {bonus}</motion.div>}
        {extra}
      </div>
      {trap && (
        <motion.div className="scr-spot-raivan" initial={{ y: 200, rotate: 20 }} animate={{ y: 0, rotate: -6 }} transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 12 }}>
          <Raivan mood="laugh" size={220} />
          <div className="scr-trap-stamp is-static">rAIvan’s trick!</div>
        </motion.div>
      )}
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
