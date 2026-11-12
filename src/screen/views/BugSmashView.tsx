// Bug Smash: Fibbot's bugs make customers grumpy. One team at a time smashes them (tap only) to protect its startup.
// Intro (why + rules + what your score does) -> per team: ready (START) -> countdown -> playing -> result (real changes) -> wrap-up.
// Layout: Bolt (dock, drawn by ScreenApp) top-left, the team box right after him, the arena band from y 552 (kids reach y >= 560).
import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { Avatar, DeltaPill, Fibbot, MeterIcon, Num, TimerRing } from '../../ui';
import { BUG } from '../../game/content';
import { bugSeconds, timerRemaining } from '../../game/engine';
import { memberWithRole } from '../../game/helpers';
import type { BugState, Deltas, Team } from '../../game/types';
import { sfx } from '../../audio';
import { BUG_PENALTY, bugStats } from '../../narration/lines/bug';
import { useGame } from '../lib/ctx';
import { bus } from '../lib/bus';
import { acceptTap } from '../lib/tap';
import { teamBase, teamName } from '../lib/game';
import { CONTENT_TOP } from '../lib/layout';
import { BigButton } from '../components/BigButton';
import { ReadyHint } from '../components/ReadyHint';
import { useNow } from '../hooks/useNow';
import { useNarrBeat } from '../hooks/useNarrBeat';
import { useStableCallback } from '../hooks/useStableCallback';
import { useTimeline } from '../hooks/useTimeline';
import '../side.css';

// ---------- art ----------
// Ten vivid hues, each with its own body pattern, so kids can tell bugs apart by colour OR by pattern. No white, no black
// (the score chip is dark and unique).
type Pattern = 'dots' | 'stripes' | 'zigzag' | 'rings' | 'diamonds';
const BUG_PAL: { base: string; edge: string; hi: string; pattern: Pattern }[] = [
  { base: '#FF4B4B', edge: '#C92D2D', hi: '#FF9C9C', pattern: 'dots' },
  { base: '#FF9600', edge: '#C26F00', hi: '#FFC27A', pattern: 'stripes' },
  { base: '#FFC800', edge: '#B58A00', hi: '#FFE27A', pattern: 'zigzag' },
  { base: '#8BD400', edge: '#5C9400', hi: '#C4F06A', pattern: 'rings' },
  { base: '#1FBF6B', edge: '#0E8A4A', hi: '#7BE8AE', pattern: 'diamonds' },
  { base: '#14C7C7', edge: '#0A8F8F', hi: '#7BEBEB', pattern: 'dots' },
  { base: '#1CB0F6', edge: '#1278B0', hi: '#8ED8FF', pattern: 'stripes' },
  { base: '#5B73F0', edge: '#3A4CB8', hi: '#A5B3FF', pattern: 'zigzag' },
  { base: '#A55EEA', edge: '#7338B5', hi: '#D3A6FF', pattern: 'rings' },
  { base: '#FF5FA8', edge: '#C73A80', hi: '#FFA6D2', pattern: 'diamonds' },
];
const PAL_N = BUG_PAL.length;

export type BugKind = 'bug' | 'mama' | 'zig' | 'armor';
const LEGS = 'M46 78 L12 60 M44 100 L6 104 M48 124 L16 148 M114 78 L148 60 M116 100 L154 104 M112 124 L144 148 M68 24 Q60 6 44 4 M92 24 Q100 6 116 4';

function PatternArt({ p, color }: { p: Pattern; color: string }) {
  const o = 0.5;
  switch (p) {
    case 'dots': return <g fill={color} opacity={o}><circle cx={60} cy={94} r={8} /><circle cx={104} cy={118} r={9} /><circle cx={100} cy={88} r={6} /><circle cx={64} cy={128} r={7} /></g>;
    case 'stripes': return <g fill={color} opacity={o}><rect x={30} y={80} width={100} height={11} /><rect x={30} y={104} width={100} height={11} /><rect x={30} y={128} width={100} height={11} /></g>;
    case 'zigzag': return <path d="M30 84 L50 102 L70 84 L90 102 L110 84 L130 102 M30 120 L50 138 L70 120 L90 138 L110 120 L130 138" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={o} />;
    case 'rings': return <g stroke={color} strokeWidth={7} fill="none" opacity={o}><circle cx={80} cy={106} r={13} /><circle cx={80} cy={106} r={30} /></g>;
    default: return <g fill={color} opacity={o}><path d="M80 80 L97 98 L80 116 L63 98 Z" /><path d="M80 122 L92 134 L80 148 L68 134 Z" /></g>;
  }
}

export function BugArt({ pal = 0, size = 160, kind = 'bug', cracked }: { pal?: number; size?: number; kind?: BugKind; cracked?: boolean }) {
  const c = BUG_PAL[pal % PAL_N];
  const uid = useId().replace(/:/g, '');
  const rx = kind === 'zig' ? 34 : 42;
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" style={{ overflow: 'visible' }} aria-hidden>
      <defs><clipPath id={`bc${uid}`}><ellipse cx={80} cy={102} rx={rx} ry={50} /></clipPath></defs>
      <g stroke="#fff" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" fill="#fff">
        <path d={LEGS} fill="none" />
        <ellipse cx={80} cy={102} rx={rx} ry={50} />
        <circle cx={80} cy={44} r={26} />
      </g>
      <path d={LEGS} stroke={c.edge} strokeWidth={9} strokeLinecap="round" fill="none" />
      <ellipse cx={80} cy={108} rx={rx} ry={50} fill={c.edge} />
      <ellipse cx={80} cy={102} rx={rx} ry={50} fill={c.base} />
      <g clipPath={`url(#bc${uid})`}><PatternArt p={c.pattern} color={c.edge} /></g>
      <path d="M80 62 V150" stroke={c.edge} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      <ellipse cx={rx > 36 ? 62 : 66} cy={80} rx={9} ry={18} fill={c.hi} opacity={0.75} transform="rotate(14 62 80)" />
      {kind === 'armor' && (
        <g transform={cracked ? 'rotate(-5 80 110) translate(-2 4)' : undefined} opacity={cracked ? 0.9 : 1}>
          <path d="M34 106 Q34 72 80 70 Q126 72 126 106 L126 118 Q126 152 80 156 Q34 152 34 118 Z" fill="#fff" stroke="#fff" strokeWidth={12} strokeLinejoin="round" />
          <path d="M34 106 Q34 72 80 70 Q126 72 126 106 L126 118 Q126 152 80 156 Q34 152 34 118 Z" fill="#7C8896" />
          <path d="M34 104 Q34 72 80 70 Q126 72 126 104 L126 114 Q126 148 80 152 Q34 148 34 114 Z" fill="#B9C3CF" />
          <path d="M46 98 Q50 80 78 78" stroke="#fff" strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.7} />
          <path d="M80 72 V154" stroke="#7C8896" strokeWidth={5} />
          {[[48, 104], [112, 104], [52, 132], [108, 132]].map(([x, y]) => <circle key={x + '-' + y} cx={x} cy={y} r={5} fill="#7C8896" />)}
          {cracked && <path d="M74 72 L86 96 L70 112 L90 134 L80 154" stroke="#4A5360" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
        </g>
      )}
      <circle cx={80} cy={46} r={26} fill={c.edge} />
      <circle cx={80} cy={42} r={26} fill={c.base} />
      {kind === 'mama' && <path d="M58 22 L62 4 L72 14 L80 0 L88 14 L98 4 L102 22 Z" fill="#FFC800" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />}
      <circle cx={68} cy={40} r={11} fill="#fff" /><circle cx={92} cy={40} r={11} fill="#fff" />
      <circle cx={70} cy={42} r={5.5} fill="#4A3613" /><circle cx={90} cy={42} r={5.5} fill="#4A3613" />
      <circle cx={72} cy={40} r={2} fill="#fff" /><circle cx={92} cy={40} r={2} fill="#fff" />
      {kind === 'armor'
        ? <path d="M60 28 L76 34 M100 28 L84 34 M72 57 H88" stroke="#4A3613" strokeWidth={4} strokeLinecap="round" fill="none" />
        : <path d="M72 56 Q80 62 88 56" stroke="#4A3613" strokeWidth={4} strokeLinecap="round" fill="none" />}
    </svg>
  );
}

/** A friendly butterfly: do NOT smash it. A very different shape (big soft wings, hearts) and a pale colour no bug has. */
export function FriendArt({ size = 150 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" style={{ overflow: 'visible' }} aria-hidden>
      <g fill="#fff" stroke="#fff" strokeWidth={14} strokeLinejoin="round">
        <ellipse cx={46} cy={58} rx={38} ry={34} transform="rotate(-22 46 58)" /><ellipse cx={114} cy={58} rx={38} ry={34} transform="rotate(22 114 58)" />
        <ellipse cx={54} cy={108} rx={26} ry={24} transform="rotate(16 54 108)" /><ellipse cx={106} cy={108} rx={26} ry={24} transform="rotate(-16 106 108)" />
        <rect x={70} y={44} width={20} height={86} rx={10} />
      </g>
      <g fill="#CDEBFF" stroke="#1CB0F6" strokeWidth={5}>
        <ellipse cx={46} cy={58} rx={38} ry={34} transform="rotate(-22 46 58)" /><ellipse cx={114} cy={58} rx={38} ry={34} transform="rotate(22 114 58)" />
        <ellipse cx={54} cy={108} rx={26} ry={24} transform="rotate(16 54 108)" /><ellipse cx={106} cy={108} rx={26} ry={24} transform="rotate(-16 106 108)" />
      </g>
      <g fill="#FF5FA8">
        <path d="M38 52 q-8-10 0-14 q6 0 8 6 q2-6 8-6 q8 4 0 14 l-8 8 Z" transform="translate(-2 4)" />
        <path d="M112 52 q-8-10 0-14 q6 0 8 6 q2-6 8-6 q8 4 0 14 l-8 8 Z" transform="translate(-2 4)" />
        <circle cx={52} cy={108} r={7} /><circle cx={108} cy={108} r={7} />
      </g>
      <rect x={72} y={46} width={16} height={82} rx={8} fill="#6B4FA0" />
      <circle cx={80} cy={40} r={19} fill="#6B4FA0" />
      <path d="M72 26 Q66 8 52 8 M88 26 Q94 8 108 8" stroke="#6B4FA0" strokeWidth={5} strokeLinecap="round" fill="none" />
      <circle cx={74} cy={38} r={5} fill="#fff" /><circle cx={86} cy={38} r={5} fill="#fff" />
      <circle cx={74} cy={39} r={2.4} fill="#4A3613" /><circle cx={86} cy={39} r={2.4} fill="#4A3613" />
      <path d="M73 47 Q80 53 87 47" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" fill="none" />
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
type Kind = BugKind | 'friend';
interface Bug { id: number; kind: Kind; x: number; y: number; way: number[]; dur: number; size: number; pal: number; rot: number; hp: number; hits: number }
interface Pop { id: number; x: number; y: number; color: string; text?: string }

const BAND = { x0: 70, x1: 1850, y0: 576, y1: 1028 };
let nextId = 1;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const SIZE: Record<Kind, number> = { bug: 160, mama: 210, zig: 130, armor: 190, friend: 150 };

/** Three way-points (relative to the start) a bug visits at 1/3, 2/3 and the end of its life. */
function waypoints(kind: Kind, x: number, y: number, size: number, dirX: number): number[] {
  const minX = BAND.x0, maxX = BAND.x1 - size, minY = BAND.y0, maxY = BAND.y1 - size;
  const out: number[] = [];
  let cx = x, cy = y;
  if (kind === 'zig') {
    let up = Math.random() < 0.5 ? -1 : 1;
    for (let i = 0; i < 3; i++) {
      cx = clamp(cx + dirX * rand(150, 240), minX, maxX);
      cy = clamp(cy + up * rand(120, 200), minY, maxY);
      up = -up;
      out.push(cx - x, cy - y);
    }
  } else if (kind === 'friend') {
    for (let i = 0; i < 3; i++) {
      cx = clamp(cx + dirX * rand(120, 200), minX, maxX);
      cy = clamp(y + (i % 2 ? 1 : -1) * rand(50, 110), minY, maxY);
      out.push(cx - x, cy - y);
    }
  } else {
    const ex = clamp(x + dirX * rand(220, 520), minX, maxX);
    const ey = clamp(y + rand(-130, 130), minY, maxY);
    for (let i = 1; i <= 3; i++) out.push(((ex - x) * i) / 3, ((ey - y) * i) / 3);
  }
  return out;
}

/** p = 0..1 progress through the round. Bugs get faster the longer you play. */
function mkBug(kind: Kind, p: number, o: { x?: number; y?: number; size?: number; dirX?: number } = {}): Bug {
  const size = o.size ?? SIZE[kind];
  const x = clamp(o.x ?? rand(BAND.x0, BAND.x1 - size), BAND.x0, BAND.x1 - size);
  const y = clamp(o.y ?? rand(BAND.y0, BAND.y1 - size), BAND.y0, BAND.y1 - size);
  const dirX = o.dirX ?? (x < 960 ? (Math.random() < 0.72 ? 1 : -1) : (Math.random() < 0.72 ? -1 : 1));
  const way = waypoints(kind, x, y, size, dirX);
  const speed = lerp(1, 0.6, p);
  const base = { bug: rand(3.6, 4.8), mama: rand(4.6, 5.6), zig: rand(2.7, 3.4), armor: rand(5.2, 6.2), friend: rand(5.4, 6.4) }[kind];
  return {
    id: nextId++, kind, x, y, way, size, dur: +(base * speed).toFixed(2), pal: Math.floor(Math.random() * PAL_N),
    rot: kind === 'friend' ? 0 : (Math.atan2(way[5], way[4]) * 180) / Math.PI + 90,
    hp: kind === 'armor' ? 2 : 1, hits: 0,
  };
}

function Arena({ running, paused, progress, onSmash, onFriend }: { running: boolean; paused: boolean; progress: { current: number }; onSmash: () => void; onFriend: () => void }) {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [pops, setPops] = useState<Pop[]>([]);
  const addPop = (p: Omit<Pop, 'id'>) => setPops(s => [...s.slice(-6), { ...p, id: nextId++ }]);

  const smash = useStableCallback((b: Bug) => {
    const centre = { x: b.x + b.size / 2 - 100, y: b.y + b.size / 2 - 100 };
    if (b.kind === 'friend') {
      sfx.play('loss');
      onFriend();
      addPop({ ...centre, color: '#FF5FA8', text: `−${BUG_PENALTY}` });
      setBugs(l => l.filter(x => x.id !== b.id));
      return;
    }
    if (b.hp > 1) {
      sfx.play('tap');
      setBugs(l => l.map(x => (x.id === b.id ? { ...x, hp: x.hp - 1, hits: x.hits + 1 } : x)));
      return;
    }
    sfx.play('splat');
    onSmash();
    addPop({ ...centre, color: BUG_PAL[b.pal].base });
    setBugs(l => {
      const rest = l.filter(x => x.id !== b.id);
      if (b.kind === 'mama') {
        const p = progress.current;
        return [...rest, mkBug('bug', p, { x: b.x - 30, y: b.y, dirX: -1, size: 130 }), mkBug('bug', p, { x: b.x + 50, y: b.y, dirX: 1, size: 130 })];
      }
      return rest;
    });
  });

  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  useEffect(() => {
    if (!running) return;
    setBugs(l => (l.length ? l : [mkBug('bug', 0), mkBug('bug', 0), mkBug('bug', 0), mkBug('zig', 0), mkBug('bug', 0), mkBug('bug', 0)]));
    let t: ReturnType<typeof setTimeout>;
    let friends = 0;
    const tick = () => {
      const p = progress.current;
      if (!pausedRef.current) {
        setBugs(l => {
          if (l.length >= Math.round(lerp(8, 10, p))) return l;
          const r = Math.random();
          let kind: Kind = 'bug';
          if (p > 0.08) {
            if (r < 0.14 && friends < 5 && !l.some(b => b.kind === 'friend')) { kind = 'friend'; friends++; }
            else if (r < 0.40 && l.filter(b => b.kind === 'armor').length < 2) kind = 'armor';
            else if (r < 0.60) kind = 'zig';
            else if (r < 0.68) kind = 'mama';
          }
          return [...l, mkBug(kind, p)];
        });
      }
      t = setTimeout(tick, lerp(520, 300, progress.current));
    };
    t = setTimeout(tick, 380);
    return () => clearTimeout(t);
  }, [running, progress]);

  return (
    <div className={`v2-arena${paused ? ' is-paused' : ''}`}>
      {pops.map(s => (
        <div key={s.id} className={s.text ? 'sd-pop-text' : 'v2-splat'} style={{ left: s.x, top: s.y }} onAnimationEnd={() => setPops(l => l.filter(x => x.id !== s.id))}>
          {s.text ? <span>{s.text}</span> : <Splat color={s.color} />}
        </div>
      ))}
      {bugs.map(b => {
        const [x1, y1, x2, y2, x3, y3] = b.way;
        return (
          <div
            key={b.id}
            className="sd-bug"
            style={{ left: b.x, top: b.y, width: b.size, height: b.size, ['--x1' as string]: `${x1}px`, ['--y1' as string]: `${y1}px`, ['--x2' as string]: `${x2}px`, ['--y2' as string]: `${y2}px`, ['--x3' as string]: `${x3}px`, ['--y3' as string]: `${y3}px`, ['--dur' as string]: `${b.dur}s` }}
            onAnimationEnd={e => { if (e.animationName === 'sd-path') setBugs(l => l.filter(x => x.id !== b.id)); }}
            onPointerDown={e => { if (acceptTap(e, `bug-${b.id}`, { debounce: 0, ignoreLock: true })) smash(b); }}
          >
            <div className="sd-bug-pop">
              <div style={{ transform: `rotate(${b.rot}deg)` }}>
                <motion.div key={b.hits} initial={b.hits ? { scale: 1.25, rotate: -10 } : false} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 700, damping: 12 }}>
                  <div className={b.kind === 'friend' ? 'sd-flap' : 'v2-wiggle'} style={{ ['--d' as string]: `${-(b.id % 7) * 0.13}s` }}>
                    {b.kind === 'friend' ? <FriendArt size={b.size} /> : <BugArt pal={b.pal} size={b.size} kind={b.kind} cracked={b.hp < 2 && b.kind === 'armor'} />}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const SLEEPERS = [[120, 640, 0], [420, 880, 3], [1720, 620, 6], [1660, 860, 9], [260, 760, 5], [1380, 900, 8], [900, 700, 2]] as const;
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
const TIER_NAME = ['Too many got through', 'Bugs under control', 'Bug buster!', 'BUG LEGEND!'];
const tierRange = (i: number) => { const t = BUG.tiers[i]; return t.max >= 999 ? `${t.min} or more` : `${t.min} to ${t.max}`; };

/** The real change of a team's Bug Smash (clamped by the engine), from its history. Falls back to the tier. */
function bugDeltas(team: Team, n: number): Deltas {
  const e = [...team.history].reverse().find(h => h.stepId === 'bugsmash');
  if (e) return e.deltas;
  const t = tierOf(n);
  return { coins: 0, customers: t.customers, happiness: t.happiness };
}

/** The three bug types, as a legend. */
function Legend({ compact }: { compact?: boolean }) {
  const s = compact ? 72 : 60;
  return (
    <div className="sd-legend">
      <div className="sd-legend-item"><BugArt pal={6} size={s} /><span>Smash it!</span></div>
      <div className="sd-legend-item"><BugArt pal={4} size={s} kind="armor" /><span>Armour: 2 taps</span></div>
      <div className="sd-legend-item is-friend"><FriendArt size={s} /><span>Friend: don’t tap!</span></div>
    </div>
  );
}

// ---------- one team's turn ----------
function Turn({ st, team, index, total }: { st: BugState; team: Team; index: number; total: number }) {
  const { state, dispatch, live } = useGame();
  const secs = bugSeconds(team);
  const tested = secs > BUG.seconds;
  const playing = st.turnPhase === 'playing';
  const result = st.turnPhase === 'result';
  const ready = st.turnPhase === 'ready';
  const [smashed, setSmashed] = useState(0);
  const [hits, setHits] = useState(0);
  const smashedRef = useRef(0);
  const hitsRef = useRef(0);
  const sent = useRef(false);
  const now = useNow(state.timer.running, 100);
  const hasTimer = state.timer.total > 0;
  const rem = hasTimer ? timerRemaining(state, now) : secs * 1000;
  const total_ms = hasTimer ? state.timer.total : secs * 1000;
  const running = playing && state.timer.running && rem > 0;
  const speaker = memberWithRole(team, 'lock');
  const score = Math.max(0, smashed - BUG_PENALTY * hits);
  const final = st.results[team.id] ?? score;
  const tier = tierOf(final);
  const delta = result ? bugDeltas(team, final) : { coins: 0, customers: tier.customers, happiness: tier.happiness };

  // How far through the round we are (0..1): the bugs speed up with it.
  const progress = useRef(0);
  progress.current = hasTimer && playing ? Math.max(0, Math.min(1, 1 - rem / total_ms)) : 0;

  // Ready, set, SMASH! (a short countdown before the clock starts)
  const beat = useTimeline(`${team.id}-${st.turnPhase}`, playing ? [600, 1200, 1800] : []);
  useEffect(() => {
    if (!playing) return;
    if (beat === 1 || beat === 2) sfx.play('tick');
    if (beat === 3) sfx.play('pop');
  }, [beat, playing]);
  const go = playing && beat >= 3;
  useEffect(() => {
    if (live && go && state.timer.total === 0) dispatch({ type: 'TIMER_START', ms: secs * 1000, now: Date.now() });
  }, [live, go, state.timer.total, secs, dispatch]);

  useEffect(() => {
    if (!live || !playing || sent.current || !state.timer.running || rem > 0) return;
    sent.current = true;
    const n = Math.max(0, smashedRef.current - BUG_PENALTY * hitsRef.current);
    bugStats[team.id] = { smashed: smashedRef.current, hits: hitsRef.current };
    dispatch({ type: 'BUG_RESULT', teamId: team.id, bugs: n });
    dispatch({ type: 'TIMER_STOP' });
  }, [live, playing, state.timer.running, rem, team.id, dispatch]);

  const start = useStableCallback(() => { if (live && ready) dispatch({ type: 'BUG_START' }); });
  useEffect(() => (ready ? bus.on('start', start) : undefined), [ready, start]);

  useEffect(() => {
    if (!result) return;
    sfx.play(tier.happiness > 0 ? 'fanfare' : tier.happiness < 0 ? 'loss' : 'ding');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  // The team's meters: they roll to the new values a moment after the result pops, so kids SEE the effect.
  const before = useRef({ h: team.happiness, c: team.customers });
  if (!result) before.current = { h: team.happiness, c: team.customers };
  const rolled = useTimeline(`roll-${result}`, result ? [1300] : []) >= 1;
  const shownH = result && !rolled ? before.current.h : team.happiness;
  const shownC = result && !rolled ? before.current.c : team.customers;

  const bump = useAnimationControls();
  useEffect(() => { if (smashed > 0) bump.start({ scale: [1.28, 1], transition: { duration: 0.22, ease: 'easeOut' } }); }, [smashed, bump]);
  const friendBump = useAnimationControls();
  useEffect(() => { if (hits > 0) friendBump.start({ scale: [1.3, 1], rotate: [-6, 0], transition: { duration: 0.3, ease: 'easeOut' } }); }, [hits, friendBump]);

  const mood = result ? (tier.happiness > 0 ? 'wow' : tier.happiness < 0 ? 'sad' : 'happy') : 'happy';
  const nameSize = team.name.length > 16 ? 64 : 80;
  const cd = ['Ready?', 'Set…', 'SMASH!', 'SMASH!'][Math.min(3, beat)];

  return (
    <>
      <motion.div className="sd-box sd-hud" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
        <div className="sd-hud-who">
          <motion.div key={team.id} initial={{ scale: 0.3, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}>
            <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={170} mood={mood} />
          </motion.div>
          <div className="sd-hud-text">
            <div className="v2-pill" style={{ ['--c' as string]: teamBase(team) }}>Team {index + 1} of {total}</div>
            <div className="sd-hud-name" style={{ fontSize: nameSize }}>{teamName(team)}</div>
            <div className="v2-sub">{speaker ? `${speaker.name} is the Lock Master` : 'Lock Master, you are up!'}</div>
          </div>
        </div>
        <div className="sd-hud-score">
          <motion.div className="sd-chip" animate={bump}>
            <div className="sd-chip-label">Bugs smashed</div>
            <div className="sd-chip-num"><Num value={result ? final : smashed} duration={250} /></div>
          </motion.div>
          <AnimatePresence>
            {hits > 0 && (
              <motion.div key="hits" className="sd-hit-pill" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <motion.span animate={friendBump} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span>Friends hit: <Num value={hits} duration={250} /></span><span>(<Num value={`−${hits * BUG_PENALTY}`} duration={250} />)</span>
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="sd-hud-timer">
          <TimerRing remainingMs={result ? 0 : rem} totalMs={total_ms} size={230} />
          {playing && !state.timer.running && rem > 0 && go && <div className="v2-pill is-warn">Paused</div>}
        </div>
      </motion.div>

      <motion.div className="sd-box sd-strip" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.08 }}>
        <Legend compact />
        <div className="sd-meters">
          <div className="sd-meter"><MeterIcon kind="happiness" size={64} /><b><Num value={shownH} duration={900} /></b></div>
          <div className="sd-meter"><MeterIcon kind="customers" size={64} /><b><Num value={shownC} duration={900} /></b></div>
        </div>
      </motion.div>

      <div className="v2-band" />
      {playing && go && <Arena running={running} paused={!state.timer.running} progress={progress} onSmash={() => { smashedRef.current += 1; setSmashed(c => c + 1); }} onFriend={() => { hitsRef.current += 1; setHits(c => c + 1); }} />}

      <AnimatePresence>
        {playing && !go && (
          <motion.div key={`cd${beat}`} className="sd-countdown" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.4, opacity: 0, transition: { duration: 0.15 } }} transition={{ type: 'spring', stiffness: 500, damping: 16 }}>
            {cd}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ready && (
          <motion.div key="ready" className="v2-arena" exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}>
            <Sleepers />
            <motion.div className="v2-bug-prompt" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div>Lock Master: tap START, then smash the bugs!</div>
              {tested && <div className="sd-bonus">+{BUG.testedBonusSeconds} seconds: you tested early, so there are fewer bugs to fix</div>}
            </motion.div>
            <div style={{ pointerEvents: 'auto' }}>
              <BigButton id="bug-start" onTap={start} disabled={!live} color="var(--good)" edge="var(--good-edge)" width={560} height={170} bounce style={{ position: 'absolute', left: 680, top: 840 }}>
                START!
              </BigButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div key="result" className="sd-box sd-result" initial={{ scale: 0.5, opacity: 0, rotate: -4 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.2 } }} transition={{ type: 'spring', stiffness: 380, damping: 20 }}>
            <div className="sd-result-score">
              <div className="sd-result-label">{hits > 0 ? 'Score' : 'Bugs smashed'}</div>
              <div className="sd-result-num"><Num value={final} duration={900} /></div>
              {hits > 0 && <div className="sd-result-sub">{smashed} smashed − {hits * BUG_PENALTY} for friends</div>}
            </div>
            <div className="sd-result-main">
              <div className="sd-result-tier">{tier.text}</div>
              <div className="sd-result-label">What changed for {teamName(team)}</div>
              <div className="sd-result-pills">
                {delta.happiness !== 0 && <motion.div initial={{ scale: 0.2, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.8 }}><DeltaPill value={delta.happiness} kind="happiness" size="lg" /></motion.div>}
                {delta.customers !== 0 && <motion.div initial={{ scale: 0.2, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 1.0 }}><DeltaPill value={delta.customers} kind="customers" size="lg" /></motion.div>}
                {delta.happiness === 0 && delta.customers === 0 && <span className="v2-sub">No change: customers noticed nothing</span>}
              </div>
              <div className="sd-result-why">{delta.happiness < 0 || delta.customers < 0 ? 'Bugs make customers unhappy, and unhappy customers leave.' : delta.happiness > 0 ? 'Fewer bugs make customers happy, and happy customers bring friends.' : 'A smooth product keeps customers calm.'}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playing && !go && <motion.div key="hint" className="sd-countdown-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Get your finger ready!</motion.div>}
      </AnimatePresence>
      <ReadyHint show={!!result} text={index + 1 < total ? 'Next team' : 'Finish'} />
    </>
  );
}

// ---------- intro ----------
function Intro({ teams }: { teams: Team[] }) {
  const beat = useNarrBeat('bugs-intro');
  const bonus = teams.filter(t => bugSeconds(t) > BUG.seconds);
  const show = (k: number) => beat >= k;
  const card = { initial: { y: 50, opacity: 0, scale: 0.9 }, animate: { y: 0, opacity: 1, scale: 1 }, transition: { type: 'spring' as const, stiffness: 340, damping: 22 } };
  return (
    <>
      <div className="sd-intro-row" style={{ top: CONTENT_TOP }}>
        <AnimatePresence>
          {show(0) && (
            <motion.div key="s1" className="sd-box sd-step" {...card}>
              <div className="sd-step-no">1</div>
              <div className="sd-step-art"><Fibbot mood="sneaky" size={150} /><BugArt pal={0} size={120} /><BugArt pal={8} size={140} kind="armor" /></div>
              <div className="sd-step-text">Fibbot hides bugs in your app</div>
            </motion.div>
          )}
          {show(1) && (
            <motion.div key="s2" className="sd-box sd-step" {...card}>
              <div className="sd-step-no">2</div>
              <div className="sd-step-art"><Avatar seed={7} colorIndex={1} shade={2} size={150} mood="sad" /><DeltaPill value={-3} kind="happiness" /><DeltaPill value={-2} kind="customers" /></div>
              <div className="sd-step-text">Bugs make customers grumpy. Some leave!</div>
            </motion.div>
          )}
          {show(2) && (
            <motion.div key="s3" className="sd-box sd-step" {...card}>
              <div className="sd-step-no">3</div>
              <div className="sd-step-art"><Avatar seed={7} colorIndex={1} shade={2} size={150} mood="wow" /><DeltaPill value={4} kind="happiness" /><DeltaPill value={2} kind="customers" /></div>
              <div className="sd-step-text">Smash bugs to protect your startup</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="sd-intro-bottom">
        <AnimatePresence>
          {show(2) && (
            <motion.div key="tiers" className="sd-box sd-tiers" {...card}>
              <div className="sd-box-title">Your score decides what happens</div>
              {BUG.tiers.map((t, i) => (
                <div key={i} className="sd-tier">
                  <div className="sd-tier-range"><b>{tierRange(i)}</b> bugs</div>
                  <div className="sd-tier-name">{TIER_NAME[i]}</div>
                  <div className="sd-tier-pills">
                    {t.happiness !== 0 ? <DeltaPill value={t.happiness} kind="happiness" /> : <span className="sd-tier-none">no change</span>}
                    {t.customers !== 0 && <DeltaPill value={t.customers} kind="customers" />}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="sd-intro-right">
          <AnimatePresence>
            {show(3) && (
              <motion.div key="legend" className="sd-box sd-legend-box" {...card}>
                <div className="sd-box-title">Watch out!</div>
                <Legend />
                
              </motion.div>
            )}
            {show(4) && (
              <motion.div key="bonus" className="sd-box sd-bonus-box" {...card}>
                <div className="sd-box-title">+{BUG.testedBonusSeconds} seconds for early testers</div>
                <div className="sd-bonus-why">They tested with friends, so there are fewer bugs to fix.</div>
                <div className="sd-bonus-teams">
                  {bonus.length === 0 && <span className="v2-sub">Nobody tested early this time</span>}
                  {bonus.map(t => <div key={t.id} className="sd-bonus-team"><Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={64} mood="cool" /><span>{teamName(t)}</span></div>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <ReadyHint text="Start turns" show={beat >= 4} />
    </>
  );
}

// ---------- wrap-up ----------
function Done({ st, teams }: { st: BugState; teams: Team[] }) {
  const rows = teams.map((t, i) => ({ t, i, n: st.results[t.id] ?? 0 })).sort((a, b) => b.n - a.n || a.i - b.i);
  const best = rows[0]?.n ?? 0;
  const avail = 1040 - (CONTENT_TOP + 112);
  const h = Math.min(132, Math.floor((avail - (rows.length - 1) * 12) / Math.max(1, rows.length)));
  return (
    <>
      <motion.div className="sd-box sd-done-head" style={{ top: CONTENT_TOP }} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
        <span className="sd-done-title">Bug report!</span>
        <span className="v2-sub">Who protected their startup best?</span>
      </motion.div>
      <div className="sd-done-rows" style={{ top: CONTENT_TOP + 112 }}>
        {rows.map(({ t, n }, r) => {
          const d = bugDeltas(t, n);
          const top = n === best && n > 0;
          return (
            <motion.div key={t.id} className={`sd-box sd-done-row${top ? ' is-best' : ''}`} style={{ height: h }} initial={{ x: 120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 360, damping: 22, delay: 0.1 + r * 0.1 }}>
              <div className="sd-done-rank">{top ? '🏆' : r + 1}</div>
              <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={Math.min(104, h - 20)} mood={tierOf(n).happiness > 0 ? 'wow' : tierOf(n).happiness < 0 ? 'sad' : 'happy'} />
              <div className="sd-done-name">{teamName(t)}{top && <span className="sd-done-best">Best protector!</span>}</div>
              <div className="sd-done-bugs"><b><Num value={n} duration={800} /></b> bugs</div>
              <div className="sd-done-pills">
                {d.happiness !== 0 && <DeltaPill value={d.happiness} kind="happiness" />}
                {d.customers !== 0 && <DeltaPill value={d.customers} kind="customers" />}
                {d.happiness === 0 && d.customers === 0 && <span className="sd-tier-none">no change</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
      <ReadyHint />
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
  if (st.phase === 'done') return <div className="v2-root"><Done st={st} teams={state.teams} /></div>;
  return <div className="v2-root"><Intro teams={state.teams} /></div>;
}
