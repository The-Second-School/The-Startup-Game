// Mic Time: a kid taps SPIN, the wheel picks a team, then the Speaker answers Bolt's question.
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, type TargetAndTransition } from 'motion/react';
import { Avatar, Bolt, Confetti, SpeechBubble } from '../../ui';
import { MIC_QUESTIONS, SCRIPT } from '../../game/content';
import { memberWithRole, randomMicTeam } from '../../game/helpers';
import type { MicState, Team } from '../../game/types';
import { sfx } from '../../audio';
import { useGame } from '../lib/ctx';
import { bus } from '../lib/bus';
import { lockInput, unlockInput } from '../lib/tap';
import { teamColors, teamName } from '../lib/game';
import { BigButton } from '../components/BigButton';
import { ReadyHint } from '../components/ReadyHint';
import { Microphone } from '../components/art';
import { Wheel, type Slice } from '../components/Wheel';
import { useStableCallback } from '../hooks/useStableCallback';

export function MicView() {
  const { state } = useGame();
  if (state.step.type !== 'mic') return null;
  return <Mic st={state.step} />;
}

function Mic({ st }: { st: MicState }) {
  const { state, dispatch, live } = useGame();
  const [spin, setSpin] = useState<{ index: number; id: number; teamId: string } | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [fire, setFire] = useState(0);
  const step = SCRIPT[state.stepIndex];
  const act = step && 'act' in step ? step.act : 1;
  const question = MIC_QUESTIONS[act] ?? 'Tell us what you learned!';
  const team = st.teamId ? state.teams.find(t => t.id === st.teamId) ?? null : null;
  const speaker = team ? memberWithRole(team, 'speaker') : null;

  const allPicked = state.micPicked.length >= state.teams.length;
  const slices: Slice[] = useMemo(() => state.teams.map(t => {
    const c = teamColors(t);
    return {
      key: t.id, color: c.base, edge: c.shades[4],
      faded: !allPicked && state.micPicked.includes(t.id),
      art: <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={3} size={state.teams.length > 4 ? 100 : 120} ring />,
    };
  }), [state.teams, state.micPicked, allPicked]);

  const doSpin = useStableCallback(() => {
    if (!live || spinning || st.phase !== 'spin') return;
    const t = randomMicTeam(state);
    if (!t) return;
    setSpinning(true);
    lockInput(6500);
    setSpin({ index: state.teams.indexOf(t), id: Date.now(), teamId: t.id });
  });
  useEffect(() => (st.phase === 'spin' ? bus.on('spin', doSpin) : undefined), [doSpin, st.phase]);

  const onDone = () => {
    if (!spin) return;
    setSpinning(false);
    unlockInput();
    sfx.play('fanfare');
    setFire(f => f + 1);
    dispatch({ type: 'MIC_PICK', teamId: spin.teamId });
  };

  const out = { opacity: 0, scale: 0.94, transition: { duration: 0.2 } };
  const stage = (st.phase === 'spin' || !team) ? 'spin' : 'picked';
  return (
    <div className="v2-root">
      <Confetti fire={fire} />
      <AnimatePresence mode="wait">
        {stage === 'spin' ? (
          <motion.div key="spin" className="v2-root" exit={out}>
        <motion.div className="v2-wheelwrap" initial={{ x: -500, rotate: -40, opacity: 0 }} animate={{ x: 0, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 18 }}>
          <Wheel slices={slices} size={800} spin={spin} onDone={onDone} duration={4.6} artRadius={0.66} />
        </motion.div>
        <motion.div className="v2-mic-head" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.15 }}>
          <div className="v2-top-title">Mic Time!</div>
          <div className="v2-sub">Spin the wheel. The team it picks answers Bolt’s question!</div>
        </motion.div>
        <div className="v2-mic-mid">
          <Bolt pose={spinning ? 'shock' : 'point'} size={280} talking={!spinning} />
          <motion.div className="ui-float"><Microphone size={170} /></motion.div>
        </div>
        <BigButton id="mic-spin" onTap={doSpin} disabled={!live || spinning} bounce width={560} height={190} style={{ position: 'absolute', left: 1160, top: 800 }}>
          {spinning ? 'Spinning...' : 'SPIN!'}
        </BigButton>
          </motion.div>
        ) : team ? (
          <MicPicked key="picked" team={team} st={st} speaker={speaker} question={question} out={out} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MicPicked({ team, st, speaker, question, out }: { team: Team; st: MicState; speaker: { name: string } | null; question: string; out: TargetAndTransition }) {
  const c = teamColors(team);
  return (
    <motion.div className="v2-root" exit={out}>
      <motion.div className="v2-card v2-micteam" style={{ ['--c' as string]: c.shades[0], ['--e' as string]: c.shades[3] }} initial={{ scale: 0.3, rotate: -10, opacity: 0 }} animate={{ scale: 1, rotate: -1.5, opacity: 1, y: st.phase === 'done' ? 0 : [0, -8, 0] }} transition={{ type: 'spring', stiffness: 300, damping: 15, y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 } }}>
        <div className="v2-micteam-avatar"><Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={360} mood={st.phase === 'done' ? 'wow' : 'cool'} /></div>
        <div className="v2-micteam-name" style={{ fontSize: team.name.length > 12 ? 64 : 84 }}>{teamName(team)}</div>
        <div className="v2-pill is-big" style={{ ['--c' as string]: c.base }}>{speaker ? speaker.name : 'Speaker'}</div>
        <div className="v2-sub">{speaker ? 'is the Speaker. Over to you!' : 'Your Speaker answers!'}</div>
      </motion.div>

      <motion.div className="v2-mic-bolt" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.3 }}>
        <Bolt pose={st.phase === 'done' ? 'cheer' : 'talk'} size={320} talking={st.phase !== 'done'} />
      </motion.div>
      <motion.div className="v2-mic-q" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 360, damping: 20, delay: 0.5 }}>
        <SpeechBubble text={st.phase === 'done' ? 'Great answer! Give them a clap!' : question} side="left" size="lg" typing />
      </motion.div>
      <motion.div className="v2-mic-stand" initial={{ y: 300 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.7 }}>
        <Microphone size={190} />
      </motion.div>
      <ReadyHint text={st.phase === 'done' ? 'Next' : 'Done talking'} />
    </motion.div>
  );
}
