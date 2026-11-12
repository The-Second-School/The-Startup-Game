// Mic Time: a kid taps SPIN, the wheel picks a team, that team's Speaker answers the question (which depends on the
// team's own earlier choice), then everybody claps. Bolt (the narration dock, top-left) explains and reads the question;
// the box right after him shows what matters. Narration: src/narration/lines/mic.ts.
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, type TargetAndTransition } from 'motion/react';
import { Avatar, Confetti, useStageH } from '../../ui';
import { memberWithRole, randomMicTeam, micQuestionFor } from '../../game/helpers';
import type { MicState, Team } from '../../game/types';
import { sfx } from '../../audio';
import { micActOf, micChoiceOf, micSpinText, micTopic } from '../../narration/lines/mic';
import { useGame } from '../lib/ctx';
import { bus } from '../lib/bus';
import { lockInput, unlockInput } from '../lib/tap';
import { teamColors } from '../lib/game';
import { BigButton } from '../components/BigButton';
import { ReadyHint } from '../components/ReadyHint';
import { Hand, Microphone, Sparkle } from '../components/art';
import { Wheel, type Slice } from '../components/Wheel';
import { useStableCallback } from '../hooks/useStableCallback';
import '../side2.css';

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
  // The wheel grows with the frame (up to the width of its column) and sits centred between the title and the bottom.
  const H = useStageH();
  const wheelSize = Math.min(860, H - 300);
  const wheelTop = 246 + Math.round((H - 32 - 246 - wheelSize) / 2);
  const act = micActOf(state);
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

  // Host moved on ('Done talking'): the applause. The mascot's one-liner is spoken by the narration; the clapping and
  // the confetti follow right after it.
  useEffect(() => {
    if (st.phase !== 'done') return;
    const id = setTimeout(() => { sfx.play('clap'); setFire(f => f + 1); }, 1300);
    return () => clearTimeout(id);
  }, [st.phase]);

  const out = { opacity: 0, scale: 0.94, transition: { duration: 0.2 } };
  const stage = (st.phase === 'spin' || !team) ? 'spin' : 'picked';
  return (
    <div className="sd2-root">
      <Confetti fire={fire} />
      <AnimatePresence mode="wait">
        {stage === 'spin' ? (
          <motion.div key="spin" className="sd2-root" exit={out}>
            <motion.div className="sd2-mic-title" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.1 }}>
              <div className="sd2-mic-h1">Mic Time!</div>
              <div className="sd2-mic-sub">{micSpinText}</div>
            </motion.div>
            <motion.div className="sd2-wheel" style={{ top: wheelTop, width: wheelSize, height: wheelSize }} initial={{ x: -500, rotate: -40, opacity: 0 }} animate={{ x: 0, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 18 }}>
              <Wheel slices={slices} size={wheelSize} spin={spin} onDone={onDone} duration={4.6} artRadius={0.66} />
            </motion.div>
            <motion.div className="sd2-spin-right" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.3 }}>
              <div className="ui-float"><Microphone size={250} /></div>
              <div className="sd2-pick-pill">{spinning ? 'Who will it be?' : 'Who will speak?'}</div>
            </motion.div>
            <BigButton id="mic-spin" onTap={doSpin} disabled={!live || spinning} bounce width={760} height={200} style={{ position: 'absolute', left: 1020, top: H - 232 }}>
              {spinning ? 'Spinning...' : 'SPIN!'}
            </BigButton>
          </motion.div>
        ) : team ? (
          <MicPicked key="picked" team={team} st={st} speaker={speaker} question={micQuestionFor(team, act)} act={act} out={out} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MicPicked({ team, st, speaker, question, act, out }: { team: Team; st: MicState; speaker: { name: string } | null; question: string; act: number; out: TargetAndTransition }) {
  const c = teamColors(team);
  const done = st.phase === 'done';
  const H = useStageH();
  const avatarSize = 290 + Math.round((H - 1080) / 3);     // the speaker card grows with the frame
  const choice = micChoiceOf(team, act);
  const name = team.name.trim() || 'This team';
  return (
    <motion.div className="sd2-root" exit={out}>
      {/* right after Bolt: the question (or the applause line) */}
      <motion.div
        className="sd2-qbox"
        style={{ background: done ? 'var(--good-soft)' : c.shades[0] }}
        initial={{ scale: 0.8, opacity: 0, y: -30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 22, delay: 0.1 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="clap" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ type: 'spring', stiffness: 420, damping: 18 }}>
              <div className="sd2-q is-clap">Great answer!</div>
              <div className="sd2-q-sub">Give {name} a big clap!</div>
            </motion.div>
          ) : (
            <motion.div key="q" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ type: 'spring', stiffness: 380, damping: 26, delay: 0.25 }}>
              <div className="sd2-qchips">
                <span className="sd2-chip">About {micTopic(act)}</span>
                {choice && <span className={`sd2-chip ${choice.trap ? 'is-bad' : 'is-good'}`}>{choice.trap ? 'Your team fell for: ' : 'Your team chose: '}{choice.label}</span>}
              </div>
              <div className={`sd2-q${question.length > 95 ? ' is-long' : ''}`}>{question}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="sd2-pick"
        style={{ background: c.shades[1] }}
        initial={{ scale: 0.3, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: -1.5, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={avatarSize} mood={done ? 'wow' : 'cool'} ring />
        <div className="sd2-pick-name" style={{ fontSize: name.length > 12 ? 60 : 76 }}>{name}</div>
        <div className="sd2-pick-pill">{speaker ? `Speaker: ${speaker.name}` : 'Your Speaker answers'}</div>
      </motion.div>

      <div className="sd2-pick-right">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="clap" className="sd2-clap" exit={{ opacity: 0, transition: { duration: 0.1 } }}>
              <ClapHands />
            </motion.div>
          ) : (
            <motion.div key="mic" className="sd2-clap" initial={{ y: 240, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.5 }}>
              <div style={{ position: 'absolute', left: 280, top: 20 }}><div className="ui-float"><Microphone size={300} /></div></div>
              <div className="sd2-listen"><span>Everyone else listens</span></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ReadyHint text={done ? 'Next' : 'Done talking'} />
    </motion.div>
  );
}

/** Two big hands clapping, with a spark at every clap. */
function ClapHands() {
  const beat = { duration: 0.8, repeat: Infinity, repeatDelay: 0.15, ease: 'easeInOut' as const };
  return (
    <>
      <motion.div className="sd2-clap-hand" style={{ left: 40 }} initial={{ x: -300, opacity: 0 }} animate={{ x: [0, 150, 0], opacity: 1 }} transition={{ ...beat, opacity: { duration: 0.2 } }}>
        <div style={{ transform: 'rotate(28deg)' }}><Hand size={290} /></div>
      </motion.div>
      <motion.div className="sd2-clap-hand" style={{ left: 530 }} initial={{ x: 300, opacity: 0 }} animate={{ x: [0, -150, 0], opacity: 1 }} transition={{ ...beat, opacity: { duration: 0.2 } }}>
        <div style={{ transform: 'rotate(-28deg)' }}><div style={{ transform: 'scaleX(-1)' }}><Hand size={290} color="#E0A878" dark="#B98550" /></div></div>
      </motion.div>
      <motion.div className="sd2-clap-burst" initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.4, 1, 0], opacity: [0, 1, 1, 0] }} transition={{ ...beat, times: [0, 0.48, 0.62, 1] }}>
        <Sparkle size={120} />
      </motion.div>
      <div style={{ position: 'absolute', left: 120, top: 40 }}><Sparkle size={70} color="var(--good)" /></div>
      <div style={{ position: 'absolute', left: 700, top: 20 }}><Sparkle size={90} /></div>
      <div style={{ position: 'absolute', left: 640, top: 400 }}><Sparkle size={64} color="var(--bad-hi)" /></div>
    </>
  );
}
