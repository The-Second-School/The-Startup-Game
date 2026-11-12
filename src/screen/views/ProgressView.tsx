// Full-screen "journey" view: a road through the six acts. Finished acts are filled with colour and a check, the current act is
// lifted with a coloured border that hugs the card, the next act is hinted, and a little traveller walks the road.
// Used as (a) the mandatory step after each act ("Act N done!") and (b) the host's overlay (dim, blurred background).
// Narration: narration/lines/board.ts (progress and overlay).
import '../board.css';
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { CheckBadge, Confetti, Num, RecipeIcon } from '../../ui';
import { sfx } from '../../audio';
import { RECIPE } from '../../game/content';
import { ACT_INFO } from '../../narration/lines/board';
import { Person } from '../components/art';
import { useTimeline } from '../hooks/useTimeline';

const COLORS = ['#1CB0F6', '#FF9600', '#FF6FB5', '#58CC02', '#CE82FF', '#FFC800'];   // same colours as the slim rail
const N = RECIPE.length;
const CELL = 274, GAP = 28, STEP = CELL + GAP;          // 6 cards across the 1784 px inside the panel
const cx = (i: number) => i * STEP + CELL / 2;           // x of the centre of act i (0-based)
const WALKER_W = 84;

const tint = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export function ProgressScreen({ act, overlay, intro }: { act: number; overlay?: boolean; intro?: boolean }) {
  const a = Math.max(0, Math.min(N, Math.round(act)));
  const live = !overlay;                                   // step mode: the traveller walks, then the act turns into a check
  const phase = useTimeline(`${a}-${overlay ? 'o' : 's'}`, live ? [2900] : []);
  const arrived = !live || phase >= 1;
  const [fire, setFire] = useState(0);
  useEffect(() => {
    if (!live || !arrived || a < 1) return;
    sfx.play('ding');
    const id = setTimeout(() => { sfx.play('cheer', { volume: 0.7 }); setFire(f => f + 1); }, 180);
    return () => clearTimeout(id);
  }, [live, arrived, a]);

  const info = a >= 1 ? ACT_INFO[a - 1] : null;
  const next = a < N ? ACT_INFO[a] : null;                 // a = 0 -> Problem is "next"
  const nextAct = a + 1;

  // ----- words -----
  let title: ReactNode, sub: string;
  if (overlay) {
    title = a >= 1 ? <>We are on Act <Num value={a} /> of {N}</> : 'Getting ready';
    sub = info ? (intro ? `${info.name}: ${info.goal}.` : `${info.name}: ${info.goal}. A short pause, we continue soon.`) : 'The game starts soon. Get ready to build a startup!';
  } else if (a >= N) {
    title = <>All <Num value={N} /> acts done!</>;
    sub = 'You built real startups in Techistan.';
  } else {
    title = <>Act <Num value={a} /> done!</>;
    sub = info ? info.learned : '';
  }

  // ----- the road -----
  const done = (i: number) => i < a || (i === a && !overlay && arrived);   // act number (1-based)
  const fromNode = live ? (a >= 2 ? a - 2 : -1) : a - 1;                   // 0-based node the traveller starts from
  const toNode = a >= 1 ? a - 1 : 0;
  const x = (node: number) => (node < 0 ? cx(0) - 190 : cx(node) - 66) - WALKER_W / 2;   // the traveller stands just left of the node
  const walks = live && a >= 1;

  return (
    <div className="pg-root">
      <Confetti fire={fire} count={120} />
      {overlay && <div className="pg-dim" />}

      <motion.div className="pg-panel" initial={{ y: 40, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
        {/* heading: what just happened, and what comes next */}
        <div className="pg-head">
          <div className="pg-head-text">
            <motion.div className="pg-title" initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.15 }}>{title}</motion.div>
            <motion.div className="pg-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>{sub}</motion.div>
          </div>
          {next && (
            <motion.div className="pg-next-card" style={{ ['--pc' as string]: COLORS[a], ['--pt' as string]: tint(COLORS[a], 0.2) }} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.45 }}>
              <RecipeIcon act={nextAct} size={84} />
              <div>
                <div className="pg-next-name">{a === 0 ? 'First' : 'Next'}: {next.name}</div>
                <div className="pg-next-hook">{overlay ? next.tag : next.hook}</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* the six act cards */}
        <div className="pg-cards">
          {RECIPE.map((r, i) => {
            const n = i + 1;
            const isDone = done(n);
            const cur = n === a;
            const isNext = n === a + 1;
            const state = isDone ? 'done' : cur ? 'cur' : isNext ? 'next' : 'later';
            return (
              <motion.div key={r.act} className={`pg-card is-${state}${cur ? ' is-cur' : ''}`} style={{ ['--pc' as string]: COLORS[i], ['--pt' as string]: tint(COLORS[i], 0.22) }}
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: cur ? -12 : 0, opacity: 1, scale: cur ? 1.04 : 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.1 + i * 0.07 }}>
                {isNext && (
                  <motion.span className="pg-tag" animate={{ y: [0, -4, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>Next</motion.span>
                )}
                {cur && overlay && <span className="pg-tag is-here">We are here</span>}
                {isDone && (
                  <motion.span className="pg-check" initial={cur && live ? { scale: 0, rotate: -40 } : false} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 12 }}>
                    <CheckBadge size={68} />
                  </motion.span>
                )}
                <motion.div className="pg-icon" animate={cur && isDone && live ? { scale: [1, 1.18, 1], rotate: [0, -8, 6, 0] } : undefined} transition={{ duration: 0.8 }}>
                  <RecipeIcon act={r.act} size={150} />
                </motion.div>
                <div className="pg-name">{r.name}</div>
                <div className="pg-card-tag">{ACT_INFO[i].tag}</div>
              </motion.div>
            );
          })}
        </div>

        {/* the road with the traveller */}
        <div className="pg-road">
          <div className="pg-track" style={{ left: cx(0), width: cx(N - 1) - cx(0) }} />
          {Array.from({ length: N - 1 }, (_, k) => {
            const full = live ? k < a - 2 : k < a - 1;
            const growing = live && k === a - 2;
            if (!full && !growing) return null;
            return (
              <motion.i key={k} className="pg-seg" style={{ left: cx(k), width: STEP + 1, background: COLORS[k], originX: 0 }}
                initial={{ scaleX: growing ? 0 : 1 }} animate={{ scaleX: 1 }} transition={{ duration: 2, delay: 0.6, ease: [0.45, 0, 0.3, 1] }} />
            );
          })}
          {RECIPE.map((r, i) => {
            const n = i + 1;
            const isDone = done(n);
            const cur = n === a;
            const isNext = n === a + 1;
            return (
              <motion.span key={r.act} className={`pg-node${isDone ? ' is-done' : ''}${cur ? ' is-cur' : ''}${isNext ? ' is-next' : ''}`}
                style={{ left: cx(i), ['--pc' as string]: COLORS[i] }}
                animate={isDone && cur && live ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.6 }}>
                {isDone
                  ? <svg width="40" height="40" viewBox="0 0 40 40"><path d="M9 21 L17 29 L31 12" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : n}
              </motion.span>
            );
          })}
          <motion.div className="pg-walker" initial={{ x: x(fromNode) }} animate={{ x: x(toNode) }}
            transition={walks ? { duration: 2, delay: 0.6, ease: [0.45, 0, 0.3, 1] } : { duration: 0 }}>
            <motion.div style={{ transformOrigin: '50% 100%' }}
              animate={walks && !arrived ? { y: [0, -14, 0], rotate: [-4, 4, -4] } : arrived && live ? { y: [0, -26, 0, -16, 0] } : { y: [0, -6, 0] }}
              transition={walks && !arrived ? { duration: 0.42, repeat: Infinity, ease: 'easeInOut', delay: 0.6 } : arrived && live ? { duration: 1, repeat: 1 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
              <Person i={Math.max(0, a - 1)} size={WALKER_W} mood={arrived ? 'wow' : 'happy'} />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
