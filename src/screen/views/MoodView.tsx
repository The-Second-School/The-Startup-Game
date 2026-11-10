// Customer Mood: one team at a time (about 2.5 s of motion). Cartoon crowds walk away under a rain cloud or
// dance in. Never any maths on screen: only the friendly line from MOOD.text.
import { useEffect } from 'react';
import { ReadyHint } from '../components/ReadyHint';
import { motion } from 'motion/react';
import { Avatar, Building } from '../../ui';
import { MOOD } from '../../game/content';
import { stageOf } from '../../game/engine';
import type { MoodState, Team } from '../../game/types';
import { sfx } from '../../audio';
import { useGame } from '../lib/ctx';
import { teamColors } from '../lib/game';
import { Crowd, type CrowdMode } from '../components/Crowd';
import { RainCloud, Sparkle } from '../components/art';
import { TeamStrip } from '../components/TeamStrip';
import { DoneBoards, IntroStage } from '../components/ChoiceParts';

/** Each team's mood scene plays for this long, then the screen moves on by itself (the host's Next only skips ahead). */
export const MOOD_TEAM_MS = 4000;
const INTRO = 'Customer Mood check! Are your customers happy and telling their friends, or are they getting bored and walking away? Let’s see!';

export function MoodView() {
  const { state } = useGame();
  const st = state.step;
  if (st.type !== 'mood') return null;
  return <MoodBody st={st} />;
}

function MoodBody({ st }: { st: MoodState }) {
  const { state, dispatch, live } = useGame();
  const teams = state.teams;
  const team = st.phase === 'team' ? teams[st.index] : undefined;
  const m = team ? st.pending[team.id] : undefined;
  const kind = m?.kind ?? 'same';

  // Sound that matches the story, a moment after the crowd starts moving.
  useEffect(() => {
    if (!team) return;
    const ids = kind === 'left'
      ? [setTimeout(() => sfx.play('loss'), 900)]
      : kind === 'joined'
        ? [setTimeout(() => sfx.play('gain'), 600), setTimeout(() => sfx.play('cheer'), 1300)]
        : [setTimeout(() => sfx.play('pop'), 500)];
    return () => ids.forEach(clearTimeout);
  }, [team?.id, kind]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance: team by team after the host starts it, ending on the board. The reducer stays pure;
  // this view just sends the same NEXT the host button sends. A host tap (skip) changes index and restarts the clock.
  useEffect(() => {
    if (!live || st.phase !== 'team') return;
    const id = setTimeout(() => dispatch({ type: 'NEXT' }), MOOD_TEAM_MS);
    return () => clearTimeout(id);
  }, [live, st.phase, st.index, dispatch]);

  if (st.phase === 'intro') return <IntroStage anim="mood" text={INTRO} />;
  if (st.phase === 'done') {
    return (
      <div className="scr-full">
        <DoneBoards teams={teams} title="Mood check done!" />
        <TeamStrip teams={teams} mode="plain" lag={0} />
        <ReadyHint />
      </div>
    );
  }
  if (!team || !m) return null;

  const text = kind === 'left' ? MOOD.text.left(-m.customers) : kind === 'joined' ? MOOD.text.joined(m.customers) : MOOD.text.same;
  return (
    <div className="scr-full">
      <MoodScene key={team.id} team={team} kind={kind} count={Math.abs(m.customers)} text={text} />
      <TeamStrip teams={teams} mode="spotlight" spotIds={[team.id]} lag={2600} />
    </div>
  );
}

function MoodScene({ team, kind, count, text }: { team: Team; kind: 'left' | 'joined' | 'same'; count: number; text: string }) {
  const c = teamColors(team);
  const mode: CrowdMode = kind === 'left' ? 'leave' : kind === 'joined' ? 'join' : 'stay';
  const n = kind === 'left' ? Math.max(3, Math.min(8, count)) : kind === 'joined' ? Math.max(4, Math.min(8, count + 2)) : 5;
  const stage = stageOf(team).id;
  return (
    <>
      <motion.div
        className="scr-mood-head"
        style={{ background: c.shades[1], boxShadow: `var(--sh)` }}
        initial={{ y: -80, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      >
        <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={150} mood={kind === 'left' ? 'sad' : kind === 'joined' ? 'wow' : 'cool'} ring />
        <div>
          <div className="scr-mood-team">{team.name}</div>
          <motion.div className="scr-mood-text" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>{text}</motion.div>
        </div>
      </motion.div>
      <div className="scr-mood-ground" />
      <motion.div className="scr-mood-shop" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
        <Building stage={stage} color={c.base} size={380} />
      </motion.div>
      {kind === 'left' && (
        <motion.div className="scr-mood-cloud" initial={{ y: -120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 160, damping: 14 }}>
          <RainCloud size={330} />
        </motion.div>
      )}
      {kind === 'joined' && (
        <>
          <div className="scr-mood-sparkle" style={{ left: 760, top: 360 }}><Sparkle size={80} /></div>
          <div className="scr-mood-sparkle" style={{ left: 1260, top: 330 }}><Sparkle size={64} color="var(--good)" /></div>
          <div className="scr-mood-sparkle" style={{ left: 1560, top: 400 }}><Sparkle size={90} /></div>
        </>
      )}
      <div className="scr-mood-crowd">
        <Crowd mode={mode} count={n} size={118} seed={team.avatarSeed} />
      </div>
    </>
  );
}
