// Customer Mood check. First a short intro scene that explains the idea, then ONE TEAM AT A TIME (the host taps Next):
// the team's name + avatar big, a simple balance picture (customers won vs happiness earned), then the outcome
// (customers walking out / dancing in / staying) with one friendly sentence, the delta pill and the meter update.
// No maths symbols on screen. The narration (src/narration/lines/mood.ts) speaks every team; the reveal follows the voice.
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar, Building, CountUp, MeterIcon } from '../../ui';
import { currentStep, stageOf } from '../../game/engine';
import type { MoodResult, MoodState, Team } from '../../game/types';
import { sfx } from '../../audio';
import { useNarr } from '../../narration/store';
import { moodActOf, moodHeadline, moodIntroText, moodNarrId, moodResult, moodSpanText } from '../../narration/lines/mood';
import { useGame } from '../lib/ctx';
import { teamColors } from '../lib/game';
import { Crowd, type CrowdMode } from '../components/Crowd';
import { Heart, Person, RainCloud, Sparkle } from '../components/art';
import { ReadyHint } from '../components/ReadyHint';
import { TeamStrip } from '../components/TeamStrip';
import { IntroStage } from '../components/ChoiceParts';
import '../side2.css';

/** If the voice is off or late, the outcome still appears after this long. */
const REVEAL_FALLBACK_MS = 9000;
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');
const plain = (n: number) => (n < 0 ? `−${-n}` : String(n));
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const faceFor = (kind: MoodResult['kind']) => (kind === 'left' ? 'sad' : kind === 'joined' ? 'wow' : 'cool');

export function MoodView() {
  const { state } = useGame();
  const st = state.step;
  if (st.type !== 'mood') return null;
  return <MoodBody st={st} />;
}

function MoodBody({ st }: { st: MoodState }) {
  const { state } = useGame();
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const upto = moodActOf(state);
  const teams = state.teams;

  if (st.phase === 'intro') return <IntroStage anim="mood" text={moodIntroText(upto)} />;
  if (st.phase === 'done') return <MoodDone teams={teams} st={st} upto={upto} />;

  const team = teams[st.index];
  if (!team) return null;
  const m = moodResult(st, team, upto);
  const narrId = moodNarrId(currentStep(state).id, st.index, team.id);
  const revealed = revealedId === team.id;
  return (
    <div className="scr-full">
      <AnimatePresence mode="wait" initial={false}>
        <MoodTeam key={team.id} team={team} m={m} upto={upto} narrId={narrId} last={st.index + 1 >= teams.length} onReveal={setRevealedId} />
      </AnimatePresence>
      <MoodStrip teams={teams} team={team} m={m} revealed={revealed} />
    </div>
  );
}

/** The bottom strip keeps this team's customer meter at the OLD value until the outcome shows, then it rolls to the new one. */
function MoodStrip({ teams, team, m, revealed }: { teams: Team[]; team: Team; m: MoodResult; revealed: boolean }) {
  const shown = useMemo(
    () => teams.map(t => (t.id === team.id && !revealed ? { ...t, customers: t.customers - m.customers } : t)),
    [teams, team.id, revealed, m.customers],
  );
  return <TeamStrip teams={shown} mode="spotlight" spotIds={[team.id]} lag={0} />;
}

interface TeamProps { team: Team; m: MoodResult; upto: number; narrId: string; last: boolean; onReveal: (id: string) => void }

function MoodTeam({ team, m, upto, narrId, last, onReveal }: TeamProps) {
  const c = teamColors(team);
  const nid = useNarr(s => s.id);
  const nIndex = useNarr(s => s.index);
  const nDone = useNarr(s => s.done);
  const [counted, setCounted] = useState(false);   // the two numbers roll in
  const [tilted, setTilted] = useState(false);     // the balance moves
  const [late, setLate] = useState(false);         // fallback reveal
  const [dv, setDv] = useState(0);                 // delta pill value

  useEffect(() => {
    const ids = [setTimeout(() => setCounted(true), 600), setTimeout(() => setTilted(true), 2000), setTimeout(() => setLate(true), REVEAL_FALLBACK_MS)];
    return () => ids.forEach(clearTimeout);
  }, []);

  // The outcome shows when the voice reaches the outcome line (the second line), or after the fallback time.
  const revealed = late || (nid === narrId && (nIndex >= 1 || nDone));
  const swing = tilted || revealed;

  useEffect(() => { if (tilted) sfx.play('pop'); }, [tilted]);
  useEffect(() => {
    if (!revealed) return;
    onReveal(team.id);
    const ids = [setTimeout(() => setDv(m.customers), 350)];
    if (m.kind === 'left') ids.push(setTimeout(() => sfx.play('loss'), 250));
    else if (m.kind === 'joined') ids.push(setTimeout(() => sfx.play('gain'), 200), setTimeout(() => sfx.play('cheer'), 900));
    else ids.push(setTimeout(() => sfx.play('pop'), 200));
    return () => ids.forEach(clearTimeout);
  }, [revealed]); // eslint-disable-line react-hooks/exhaustive-deps

  const n = Math.abs(m.customers);
  const tilt = m.kind === 'same' ? 0 : Math.min(14, 6 + n * 1.4);
  const beam = !swing ? [0] : m.kind === 'same' ? [0, -4, 3, -1.5, 0] : [m.kind === 'left' ? -tilt : tilt];
  const beamTo = beam.length === 1 ? beam[0] : beam;
  const hangTo = beam.length === 1 ? -beam[0] : beam.map(v => -v);
  const swingTr = m.kind === 'same' ? { duration: 1.4, ease: 'easeInOut' as const } : { type: 'spring' as const, stiffness: 50, damping: 7 };

  const mode: CrowdMode = revealed ? (m.kind === 'left' ? 'leave' : m.kind === 'joined' ? 'join' : 'stay') : 'stay';
  const crowdN = m.kind === 'joined' ? clamp(n + 1, 4, 5) : m.kind === 'left' ? clamp(n, 3, 5) : 4;
  const showCrowd = revealed || m.kind !== 'joined';

  return (
    <motion.div className="sd2-root" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
      <motion.div
        className="sd2-head"
        style={{ background: c.shades[1] }}
        initial={{ y: -60, opacity: 0, scale: 0.94 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      >
        <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={140} mood={revealed ? faceFor(m.kind) : 'cool'} ring />
        <div className="sd2-head-body">
          <div className="sd2-team">{team.name.trim() || 'This team'}</div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={revealed ? 'out' : 'ask'}
              className="sd2-line"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.12 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            >
              {revealed ? moodHeadline(m.kind, n) : 'Did its happiness keep up with the customers it won?'}
            </motion.div>
          </AnimatePresence>
        </div>
        <span className="sd2-chip">Looking at {moodSpanText(upto)}</span>
      </motion.div>

      {/* the balance: customers won on the left, happiness earned on the right */}
      <div className="sd2-scale">
        <div className="sd2-post" />
        <div className="sd2-base" />
        <motion.div className="sd2-beam" animate={{ rotate: beamTo }} transition={swingTr}>
          <motion.div className="sd2-hanger is-l" animate={{ rotate: hangTo }} transition={swingTr}>
            <div className="sd2-string" />
            <motion.div className="sd2-pan is-cust" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.25 }}>
              <div className="sd2-icons">
                {counted && Array.from({ length: Math.min(8, m.gained) }, (_, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 520, damping: 16, delay: i * 0.07 }}>
                    <Person i={i + team.avatarSeed} size={52} mood="happy" />
                  </motion.div>
                ))}
              </div>
              <div className="sd2-pan-label">Customers won</div>
              <div className="sd2-pan-num"><CountUp value={counted ? m.gained : 0} duration={900} /></div>
            </motion.div>
          </motion.div>
          <motion.div className="sd2-hanger is-r" animate={{ rotate: hangTo }} transition={swingTr}>
            <div className="sd2-string" />
            <motion.div className="sd2-pan is-hap" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.4 }}>
              <div className="sd2-icons">
                {counted && m.happy > 0 && Array.from({ length: Math.min(8, m.happy) }, (_, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 520, damping: 16, delay: 0.2 + i * 0.07 }}>
                    <MeterIcon kind="happiness" size={52} />
                  </motion.div>
                ))}
                {counted && m.happy < 0 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 520, damping: 16 }}><Heart size={84} broken /></motion.div>
                )}
              </div>
              <div className="sd2-pan-label">Happiness earned</div>
              <div className="sd2-pan-num"><CountUp value={counted ? m.happy : 0} duration={900} format={plain} /></div>
            </motion.div>
          </motion.div>
        </motion.div>
        <div className="sd2-pivot" />
      </div>

      {/* what happened to the shop */}
      <div className="sd2-out">
        <div className="sd2-ground" />
        <motion.div className="sd2-shop" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}>
          <Building stage={stageOf(team).id} color={c.base} size={330} />
        </motion.div>
        {revealed && m.kind === 'left' && (
          <motion.div className="sd2-cloud" initial={{ y: -140, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 160, damping: 14 }}>
            <RainCloud size={300} />
          </motion.div>
        )}
        {revealed && m.kind === 'joined' && (
          <>
            <div className="sd2-sparkle" style={{ left: 40, top: 40 }}><Sparkle size={84} /></div>
            <div className="sd2-sparkle" style={{ left: 250, top: 10 }}><Sparkle size={64} color="var(--good)" /></div>
            <div className="sd2-sparkle" style={{ left: 690, top: 300 }}><Sparkle size={90} /></div>
          </>
        )}
        {showCrowd && (
          <div className="sd2-crowd">
            <Crowd key={mode} mode={mode} count={crowdN} size={90} seed={team.avatarSeed} />
          </div>
        )}
        {revealed && (
          <motion.div
            className={`sd2-delta ${m.kind === 'left' ? 'is-bad' : m.kind === 'joined' ? 'is-good' : 'is-same'}`}
            initial={{ scale: 0.4, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 16 }}
          >
            <MeterIcon kind="customers" size={60} />
            {m.kind === 'same' ? <span>All stay</span> : <CountUp value={dv} format={signed} duration={700} />}
          </motion.div>
        )}
      </div>
      <ReadyHint show={revealed} text={last ? 'Wrap up' : 'Next team'} />
    </motion.div>
  );
}

/** Wrap-up: one simple card per team showing what happened and how many customers it has now. */
function MoodDone({ teams, st, upto }: { teams: Team[]; st: MoodState; upto: number }) {
  const [rolled, setRolled] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setRolled(true), 900);
    return () => clearTimeout(id);
  }, []);
  const big = teams.length <= 4;
  return (
    <div className="sd2-root">
      <motion.div
        className="sd2-head"
        style={{ height: 132, background: 'var(--sun-hi)' }}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      >
        <div className="sd2-done-title">Mood check done!</div>
        <div style={{ flex: 1 }} />
        <span className="sd2-chip">Looked at {moodSpanText(upto)}</span>
      </motion.div>
      <div className="sd2-done-cards">
        {teams.map((t, i) => {
          const m = moodResult(st, t, upto);
          const tc = teamColors(t);
          const before = t.customers - m.customers;
          return (
            <motion.div
              key={t.id}
              className="sd2-dcard"
              style={{ background: tc.shades[1] }}
              initial={{ y: 70, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 + i * 0.1 }}
            >
              <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={big ? 230 : 170} mood={faceFor(m.kind)} ring />
              <div className="sd2-dname">{t.name.trim() || 'This team'}</div>
              <div
                className={`sd2-delta ${m.kind === 'left' ? 'is-bad' : m.kind === 'joined' ? 'is-good' : 'is-same'}`}
                style={{ position: 'relative', left: 0, top: 0, fontSize: 54 }}
              >
                <MeterIcon kind="customers" size={52} />
                {m.kind === 'same' ? <span>All stay</span> : <CountUp value={rolled ? m.customers : 0} format={signed} duration={700} />}
              </div>
              <div className="sd2-dnow">
                <span>now</span>
                <MeterIcon kind="customers" size={40} />
                <CountUp value={rolled ? t.customers : before} duration={900} />
              </div>
            </motion.div>
          );
        })}
      </div>
      <ReadyHint />
    </div>
  );
}
