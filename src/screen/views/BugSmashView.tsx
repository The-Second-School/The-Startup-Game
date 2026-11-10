// Bug Smash: one team at a time taps rAIvan's bugs before the timer runs out.
// Intro -> (ready: START -> playing -> result) per team -> done summary.
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar, Bolt, CountUp, DeltaPill, Raivan, TimerRing } from '../../ui';
import { BUG } from '../../game/content';
import { bugSeconds, timerRemaining } from '../../game/engine';
import { memberWithRole } from '../../game/helpers';
import type { BugState, Team } from '../../game/types';
import { sfx } from '../../audio';
import { useGame } from '../lib/ctx';
import { bus } from '../lib/bus';
import { acceptTap } from '../lib/tap';
import { teamBase, teamName } from '../lib/game';
import { BigButton } from '../components/BigButton';
import { ReadyHint } from '../components/ReadyHint';
import { useNow } from '../hooks/useNow';
import { useStableCallback } from '../hooks/useStableCallback';

// ---------- art ----------
const BUG_PAL = [
  { base: '#7B4BC9', edge: '#5A2F9E', hi: '#A982E8', spot: '#5A2F9E' },
  { base: '#FF4B4B', edge: '#D93636', hi: '#FF9C9C', spot: '#D93636' },
  { base: '#FF9600', edge: '#E07F00', hi: '#FFC27A', spot: '#B36500' },
];

export function BugArt({ pal = 0, size = 160, big }: { pal?: number; size?: number; big?: boolean }) {
  const c = BUG_PAL[pal % BUG_PAL.length];
  const legs = 'M46 78 L12 60 M44 100 L6 104 M48 124 L16 148 M114 78 L148 60 M116 100 L154 104 M112 124 L144 148 M68 24 Q60 6 44 4 M92 24 Q100 6 116 4';
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" style={{ overflow: 'visible' }}>
      <g stroke="#fff" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" fill="#fff">
        <path d={legs} fill="none" />
        <ellipse cx={80} cy={102} rx={42} ry={50} />
        <circle cx={80} cy={44} r={26} />
      </g>
      <path d={legs} stroke={c.edge} strokeWidth={9} strokeLinecap="round" fill="none" />
      <ellipse cx={80} cy={108} rx={42} ry={50} fill={c.edge} />
      <ellipse cx={80} cy={102} rx={42} ry={50} fill={c.base} />
      <circle cx={80} cy={46} r={26} fill={c.edge} />
      <circle cx={80} cy={42} r={26} fill={c.base} />
      <path d="M80 62 V150" stroke={c.edge} strokeWidth={6} strokeLinecap="round" />
      {big && <path d="M52 92 L68 104 L58 118 L74 130" stroke={c.edge} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
      <circle cx={58} cy={96} r={8} fill={c.spot} opacity={0.55} />
      <circle cx={104} cy={118} r={9} fill={c.spot} opacity={0.55} />
      <circle cx={100} cy={90} r={6} fill={c.spot} opacity={0.55} />
      <ellipse cx={62} cy={80} rx={10} ry={20} fill={c.hi} opacity={0.75} transform="rotate(14 62 80)" />
      <circle cx={68} cy={40} r={11} fill="#fff" /><circle cx={92} cy={40} r={11} fill="#fff" />
      <circle cx={70} cy={42} r={5.5} fill="#4A3613" /><circle cx={90} cy={42} r={5.5} fill="#4A3613" />
      <circle cx={72} cy={40} r={2} fill="#fff" /><circle cx={92} cy={40} r={2} fill="#fff" />
      <path d="M72 56 Q80 62 88 56" stroke="#4A3613" strokeWidth={4} strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Splat({ color, size = 200 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
      <path d="M100 30 C118 30 124 52 144 54 C168 56 176 78 164 94 C180 108 172 134 150 138 C148 160 124 168 108 156 C94 172 66 168 62 146 C38 148 26 124 40 108 C24 92 34 66 58 64 C62 42 82 30 100 30 Z" fill="#fff" stroke="#fff" strokeWidth={14} strokeLinejoin="round" />
      <path d="M100 34 C116 34 122 56 142 58 C164 60 172 80 160 94 C176 108 168 130 148 134 C146 156 124 164 108 152 C94 168 68 164 64 144 C42 144 30 124 44 108 C28 92 38 68 60 68 C64 46 84 34 100 34 Z" fill={color} />
      <ellipse cx={78} cy={70} rx={16} ry={8} fill="#fff" opacity={0.5} transform="rotate(-20 78 70)" />
      <circle cx={178} cy={44} r={9} fill={color} /><circle cx={24} cy={152} r={8} fill={color} /><circle cx={170} cy={168} r={7} fill={color} />
    </svg>
  );
}

// ---------- arena ----------
interface Bug { id: number; x: number; y: number; dx: number; dy: number; dur: number; size: number; big: boolean; pal: number; rot: number }
interface SplatItem { id: number; x: number; y: number; color: string }

const BAND = { x0: 70, x1: 1850, y0: 576, y1: 1028 };
const MAX_BUGS = 8;
let nextId = 1;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function mkBug(o: { x?: number; y?: number; big?: boolean; dirX?: number } = {}): Bug {
  const big = !!o.big;
  const size = big ? 210 : 160;
  const x = clamp(o.x ?? rand(BAND.x0, BAND.x1 - size), BAND.x0, BAND.x1 - size);
  const y = clamp(o.y ?? rand(BAND.y0, BAND.y1 - size), BAND.y0, BAND.y1 - size);
  const ex = clamp(x + (o.dirX ?? (Math.random() < 0.5 ? -1 : 1)) * rand(180, 460), BAND.x0, BAND.x1 - size);
  const ey = clamp(y + rand(-110, 110), BAND.y0, BAND.y1 - size);
  const dx = ex - x, dy = ey - y;
  return { id: nextId++, x, y, dx, dy, dur: big ? rand(4.6, 6) : rand(3.4, 5), size, big, pal: Math.floor(Math.random() * BUG_PAL.length), rot: (Math.atan2(dy, dx) * 180) / Math.PI + 90 };
}

function Arena({ running, paused, onSmash }: { running: boolean; paused: boolean; onSmash: () => void }) {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [splats, setSplats] = useState<SplatItem[]>([]);
  const smashed = useRef(0);
  const smash = useStableCallback((b: Bug) => {
    smashed.current += 1;
    sfx.play('splat');
    onSmash();
    const pal = BUG_PAL[b.pal];
    setSplats(s => [...s.slice(-6), { id: nextId++, x: b.x + b.size / 2 - 100, y: b.y + b.size / 2 - 100, color: pal.base }]);
    setBugs(list => {
      const rest = list.filter(x => x.id !== b.id);
      if (b.big) return [...rest, mkBug({ x: b.x - 30, y: b.y, dirX: -1 }), mkBug({ x: b.x + 40, y: b.y, dirX: 1 })];
      return rest;
    });
  });

  useEffect(() => {
    if (!running) return;
    setBugs(l => (l.length ? l : Array.from({ length: 5 }, (_, i) => mkBug({ big: i === 2 }))));
    const id = setInterval(() => {
      setBugs(l => (l.length >= MAX_BUGS ? l : [...l, mkBug({ big: smashed.current % 4 === 3 && Math.random() < 0.5 })]));
    }, 320);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div className={`v2-arena${paused ? ' is-paused' : ''}`}>
      {splats.map(s => (
        <div key={s.id} className="v2-splat" style={{ left: s.x, top: s.y }} onAnimationEnd={() => setSplats(l => l.filter(x => x.id !== s.id))}>
          <Splat color={s.color} />
        </div>
      ))}
      {bugs.map(b => (
        <div
          key={b.id}
          className="v2-bug"
          style={{ left: b.x, top: b.y, width: b.size, height: b.size, ['--dx' as string]: `${b.dx}px`, ['--dy' as string]: `${b.dy}px`, ['--dur' as string]: `${b.dur}s` }}
          onAnimationEnd={e => { if (e.animationName === 'v2-crawl') setBugs(l => l.filter(x => x.id !== b.id)); }}
          onPointerDown={e => { if (acceptTap(e, `bug-${b.id}`, { debounce: 0, ignoreLock: true })) smash(b); }}
        >
          <div className="v2-bug-pop">
            <div style={{ transform: `rotate(${b.rot}deg)` }}>
              <div className="v2-wiggle" style={{ ['--d' as string]: `${-(b.id % 7) * 0.13}s` }}><BugArt pal={b.pal} size={b.size} big={b.big} /></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const SLEEPERS = [[120, 640, 0], [420, 880, 1], [1720, 620, 2], [1660, 860, 0], [260, 760, 2], [1380, 900, 1]] as const;
function Sleepers() {
  return (
    <>
      {SLEEPERS.map(([x, y, p], i) => (
        <div key={i} className="v2-sleeper" style={{ left: x, top: y, ['--d' as string]: `${-i * 0.4}s` }}>
          <BugArt pal={p} size={130} />
        </div>
      ))}
    </>
  );
}

const tierOf = (n: number) => BUG.tiers.find(t => n >= t.min && n <= t.max) ?? BUG.tiers[0];

// ---------- one team's turn ----------
function Turn({ st, team, index, total }: { st: BugState; team: Team; index: number; total: number }) {
  const { state, dispatch, live } = useGame();
  const secs = bugSeconds(team);
  const tested = secs > BUG.seconds;
  const playing = st.turnPhase === 'playing';
  const result = st.turnPhase === 'result';
  const ready = st.turnPhase === 'ready';
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const sent = useRef(false);
  const now = useNow(state.timer.running, 100);
  const hasTimer = state.timer.total > 0;
  const rem = hasTimer ? timerRemaining(state, now) : secs * 1000;
  const total_ms = hasTimer ? state.timer.total : secs * 1000;
  const running = playing && state.timer.running && rem > 0;
  const speaker = memberWithRole(team, 'lock');
  const final = st.results[team.id] ?? count;
  const tier = tierOf(final);

  useEffect(() => {
    if (live && playing && state.timer.total === 0) dispatch({ type: 'TIMER_START', ms: secs * 1000, now: Date.now() });
  }, [live, playing, state.timer.total, secs, dispatch]);

  useEffect(() => {
    if (!live || !playing || sent.current || !state.timer.running || rem > 0) return;
    sent.current = true;
    dispatch({ type: 'BUG_RESULT', teamId: team.id, bugs: countRef.current });
    dispatch({ type: 'TIMER_STOP' });
  }, [live, playing, state.timer.running, rem, team.id, dispatch]);

  const start = useStableCallback(() => { if (live && ready) dispatch({ type: 'BUG_START' }); });
  useEffect(() => (ready ? bus.on('start', start) : undefined), [ready, start]);

  useEffect(() => {
    if (!result) return;
    sfx.play(tier.happiness > 0 ? 'fanfare' : tier.happiness < 0 ? 'loss' : 'ding');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const mood = result ? (tier.happiness > 0 ? 'wow' : tier.happiness < 0 ? 'sad' : 'happy') : 'happy';
  const nameSize = team.name.length > 16 ? 72 : 96;

  return (
    <>
      <motion.div className="v2-card v2-top v2-bug-hud" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
        <div className="v2-bug-who">
          <motion.div key={team.id} initial={{ scale: 0.3, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}>
            <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={190} mood={mood} />
          </motion.div>
          <div>
            <div className="v2-pill" style={{ ['--c' as string]: teamBase(team) }}>Team {index + 1} of {total}</div>
            <div className="v2-bug-name" style={{ fontSize: nameSize }}>{teamName(team)}</div>
            <div className="v2-sub">{speaker ? `${speaker.name} is the Lock Master` : 'Lock Master, you are up!'}</div>
            {tested && <div className="v2-pill is-good">+{BUG.testedBonusSeconds} seconds: you tested with friends!</div>}
          </div>
        </div>
        <motion.div key={count} className="v2-bug-count" initial={{ scale: 1.35 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 600, damping: 14 }}>
          <BugArt pal={0} size={110} />
          <span>{result ? final : count}</span>
        </motion.div>
        <div className="v2-bug-timer">
          <TimerRing remainingMs={result ? 0 : rem} totalMs={total_ms} size={250} />
          {playing && !state.timer.running && rem > 0 && <div className="v2-pill is-warn">Paused</div>}
        </div>
      </motion.div>

      <div className="v2-band" />
      {playing && <Arena running={running} paused={!state.timer.running} onSmash={() => { countRef.current += 1; setCount(c => c + 1); }} />}

      <AnimatePresence>
        {ready && (
          <motion.div key="ready" className="v2-arena" exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}>
            <Sleepers />
            <motion.div className="v2-bug-prompt" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              Lock Master: tap START, then smash every bug!
            </motion.div>
            <div style={{ pointerEvents: 'auto' }}>
              <BigButton id="bug-start" onTap={start} disabled={!live} color="var(--good)" edge="var(--good-edge)" width={560} height={190} bounce style={{ position: 'absolute', left: 680, top: 790 }}>
                START!
              </BigButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
      {result && (
        <motion.div key="result" className="v2-card v2-bug-result" initial={{ scale: 0.4, opacity: 0, rotate: -6 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 380, damping: 18 }}>
          <div className="v2-bug-result-num"><CountUp value={final} duration={900} /></div>
          <div className="v2-bug-result-label">bugs smashed</div>
          <div className="v2-bug-result-tier">{tier.text}</div>
          <div className="v2-row-center">
            {tier.happiness !== 0
              ? <motion.div initial={{ scale: 0.2, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.9 }}><DeltaPill value={tier.happiness} kind="happiness" size="lg" /></motion.div>
              : <span className="v2-sub">No change</span>}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
      <ReadyHint show={!!result} text={index + 1 < total ? 'Next team' : 'Finish'} />
    </>
  );
}

// ---------- view ----------
export function BugSmashView() {
  const { state } = useGame();
  const st = state.step;
  if (st.type !== 'bugsmash') return null;
  const team = state.teams[st.turn];

  if (st.phase === 'turn' && team) {
    return <div className="v2-root"><Turn key={st.turn} st={st} team={team} index={st.turn} total={state.teams.length} /></div>;
  }

  if (st.phase === 'done') {
    const best = Math.max(...state.teams.map(t => st.results[t.id] ?? 0));
    return (
      <div className="v2-root">
        <motion.div className="v2-card v2-top" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
          <div className="v2-top-bolt"><Bolt pose="cheer" size={250} /></div>
          <div className="v2-top-body"><div className="v2-top-title">Bug report!</div><div className="v2-sub">Every team squashed some of rAIvan’s bugs 🐛</div></div>
        </motion.div>
        <div className="v2-band" />
        <div className="v2-sumrow">
          {state.teams.map((t, i) => {
            const n = st.results[t.id] ?? 0;
            const tr = tierOf(n);
            return (
              <motion.div key={t.id} className={`v2-card v2-sum${n === best && n > 0 ? ' is-best' : ''}`} initial={{ y: 80, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.1 + i * 0.09 }}>
                <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={120} mood={tr.happiness > 0 ? 'wow' : tr.happiness < 0 ? 'sad' : 'happy'} />
                <div className="v2-sum-name">{teamName(t)}</div>
                <div className="v2-sum-num"><CountUp value={n} /></div>
                <div className="v2-sum-label">bugs</div>
              </motion.div>
            );
          })}
        </div>
        <ReadyHint />
      </div>
    );
  }

  // intro
  return (
    <div className="v2-root">
      <motion.div className="v2-card v2-top" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
        <div className="v2-top-bolt"><Bolt pose="point" size={250} talking /></div>
        <div className="v2-top-body">
          <div className="v2-top-title">Bug Smash!</div>
          <div className="v2-sub">rAIvan’s bugs are crawling into your app. Smash as many as you can before time runs out!</div>
        </div>
        <motion.div className="v2-top-raivan" initial={{ x: 300, rotate: 20 }} animate={{ x: 0, rotate: -6 }} transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.5 }}>
          <Raivan mood="sneaky" size={270} />
        </motion.div>
      </motion.div>
      <div className="v2-band" />
      <Sleepers />
      <ReadyHint text="Start turns" />
    </div>
  );
}
