// Show Day pitch: the pitching team on stage with a 45 s timer and its story as a slideshow.
// Voting: "Show 1 to 5 fingers!" and a tick per team that voted (the stars stay hidden). Bolt (top-left dock) narrates each phase.
import '../views2.css';
import '../board.css';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar, CheckBadge, DeltaPill, Num, ProductArt, TimerRing } from '../../ui';
import { PITCH_MS, RECIPE, productById } from '../../game/content';
import { timerRemaining } from '../../game/engine';
import { memberWithRole } from '../../game/helpers';
import type { PitchState, Team } from '../../game/types';
import { useGame } from '../lib/ctx';
import { teamBase, teamName } from '../lib/game';
import { Hand } from '../components/art';
import { ReadyHint } from '../components/ReadyHint';
import { useNow } from '../hooks/useNow';

export function PitchView() {
  const { state } = useGame();
  if (state.step.type !== 'pitch') return null;
  return <Pitch st={state.step} />;
}

function Pitch({ st }: { st: PitchState }) {
  const { state } = useGame();
  const team = state.teams[st.index];
  const total = state.teams.length;
  const done = st.phase === 'done' || !team;
  return (
    <AnimatePresence mode="wait">
      {done ? <PitchDone key="done" /> : <Stage key="stage" st={st} team={team} total={total} />}
    </AnimatePresence>
  );
}

function PitchDone() {
  const { state } = useGame();
  return (
    <motion.div className="bd-root" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
      <motion.div className="bd-card bd-pt-banner" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
        <div className="bd-pt-big">What a show!</div>
        <div className="bd-pt-sub">Every startup has pitched. Time for the Golden Trophy!</div>
      </motion.div>
      <div className="bd-pt-sumrow">
        {state.teams.map((t, i) => (
          <motion.div key={t.id} className="bd-card bd-pt-sum" initial={{ y: 80, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 80, opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.1 + i * 0.09 }}>
            <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={170} mood="wow" />
            <div className="bd-pt-sum-name">{teamName(t)}</div>
            <CheckBadge size={64} />
          </motion.div>
        ))}
      </div>
      <ReadyHint />
    </motion.div>
  );
}

function Stage({ st, team, total }: { st: PitchState; team: Team; total: number }) {
  const { state } = useGame();
  const now = useNow(state.timer.running, 200);
  const speaker = memberWithRole(team, 'speaker');
  const product = productById(team.productId);
  const voting = st.phase === 'voting';
  const talking = st.phase === 'talking';
  const story = team.history.filter(h => h.act > 0);
  const [slide, setSlide] = useState(0);

  useEffect(() => { setSlide(0); }, [team.id]);
  useEffect(() => {
    if (voting || story.length < 2) return;
    const id = setInterval(() => setSlide(s => s + 1), 3600);
    return () => clearInterval(id);
  }, [voting, story.length]);

  const rem = state.timer.total > 0 ? timerRemaining(state, now) : PITCH_MS;
  const tot = state.timer.total > 0 ? state.timer.total : PITCH_MS;
  const entry = story.length ? story[slide % story.length] : null;
  const voters = state.teams.filter(t => t.id !== team.id);
  const votes = state.votes[team.id] ?? {};
  const voted = voters.filter(v => votes[v.id] !== undefined).length;

  return (
    <motion.div className="bd-root" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
      {/* who is on stage (or who is being rated) */}
      <AnimatePresence mode="popLayout">
        <motion.div key={team.id} className="bd-card bd-pt-who" initial={{ x: -400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -400, opacity: 0, transition: { duration: 0.25 } }} transition={{ type: 'spring', stiffness: 220, damping: 20 }}>
          <motion.div animate={talking ? { y: [0, -12, 0] } : { y: 0 }} transition={talking ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : undefined}>
            <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={250} mood={voting ? 'wow' : 'happy'} />
          </motion.div>
          <div className="bd-pt-text">
            <div className="bd-pt-name" style={{ fontSize: team.name.length > 14 ? 76 : 100 }}>{teamName(team)}</div>
            <div className="bd-pill" style={{ ['--c' as string]: teamBase(team) }}>{speaker ? `${speaker.name} is pitching` : 'Our Speaker pitches'}</div>
            {product && <div className="bd-pt-prod">{product.icon} {product.name}: {product.does}</div>}
          </div>
          <span className="bd-pt-count-pill">Pitch <Num value={st.index + 1} /> of <Num value={total} /></span>
        </motion.div>
      </AnimatePresence>

      {/* the timer (while pitching) or the waving hand (while voting) */}
      <AnimatePresence mode="wait">
        {!voting ? (
          <motion.div key="timer" className="bd-pt-side" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 20, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}>
            <motion.div animate={talking ? { scale: [1, 1.035, 1] } : { scale: 1 }} transition={talking ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}>
              <TimerRing remainingMs={talking ? rem : PITCH_MS} totalMs={talking ? tot : PITCH_MS} size={270} />
            </motion.div>
            <AnimatePresence>
              {!talking && <motion.div key="ready" className="bd-pill is-warn" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>Get ready!</motion.div>}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="hand" className="bd-pt-side" initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.2 }}>
            <motion.div animate={{ rotate: [-6, 6, -6], y: [0, -10, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '50% 90%' }}>
              <Hand size={250} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!voting ? (
          <motion.div key="slides" className="bd-pt-slidewrap" exit={{ y: 120, opacity: 0, transition: { duration: 0.22 } }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={entry ? `${team.id}-${slide % story.length}` : `${team.id}-none`}
                className="bd-card bd-pt-slide"
                initial={{ x: 500, opacity: 0, rotate: 3 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                exit={{ x: -500, opacity: 0, rotate: -3, transition: { duration: 0.25 } }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                {entry ? (
                  <>
                    <div className="v2-slide-icon">{entry.icon}</div>
                    <div className="v2-slide-body">
                      <div className="bd-pill">{RECIPE.find(r => r.act === entry.act)?.icon} Step {entry.act}: {RECIPE.find(r => r.act === entry.act)?.name}</div>
                      <div className="v2-slide-label">{entry.label}</div>
                      <div className="v2-slide-story">{entry.story}</div>
                    </div>
                    <div className="v2-slide-deltas">
                      {([['customers', entry.deltas.customers], ['happiness', entry.deltas.happiness], ['coins', entry.deltas.coins]] as const)
                        .filter(([, v]) => v !== 0).map(([k, v]) => <DeltaPill key={k} value={v} kind={k} />)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="v2-slide-icon">{product ? <ProductArt productId={product.id} size={190} /> : '🌱'}</div>
                    <div className="v2-slide-body">
                      <div className="v2-slide-label">A brand new startup!</div>
                      <div className="v2-slide-story">{product ? `${product.name} is ready to meet Techistan.` : 'Ready to meet Techistan.'}</div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
            {story.length > 1 && (
              <div className="v2-slide-dots">
                {story.map((_, i) => <span key={i} className={i === slide % story.length ? 'is-on' : ''} />)}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="vote" className="bd-pt-vote" exit={{ opacity: 0, y: 80, transition: { duration: 0.22 } }}>
            <motion.div className="bd-pt-votetitle" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 16 }}>
              <div className="bd-pt-big">Show 1 to 5 fingers!</div>
              <div className="bd-pt-sub">Be fair. How good was the pitch?</div>
            </motion.div>
            <div className="bd-pt-voters">
              {voters.map((v, i) => {
                const done = votes[v.id] !== undefined;
                return (
                  <motion.div key={v.id} className={`bd-card bd-pt-voter${done ? ' is-done' : ''}`} initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.1 + i * 0.07 }}>
                    <Avatar seed={v.avatarSeed} colorIndex={v.colorIndex} shade={2} size={120} mood={done ? 'happy' : 'cool'} />
                    <div className="bd-pt-voter-name">{teamName(v)}</div>
                    <div className="bd-pt-voter-status">{done ? 'Voted!' : 'Thinking...'}</div>
                    <AnimatePresence>
                      {done && (
                        <motion.div className="bd-pt-tick" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 40 }} transition={{ type: 'spring', stiffness: 600, damping: 12 }}>
                          <CheckBadge size={84} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
            <div className="bd-pt-votecount"><Num value={voted} /> of <Num value={voters.length} /> teams voted</div>
          </motion.div>
        )}
      </AnimatePresence>
      <ReadyHint show={voting && voters.length > 0 && voted >= voters.length} />
    </motion.div>
  );
}
