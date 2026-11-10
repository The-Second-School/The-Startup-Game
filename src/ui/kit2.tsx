// DeltaPill, TimerRing, Confetti, SpeechBubble, RecipeBar.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MeterIcon, RecipeIcon, CheckBadge } from './icons';
import { RECIPE } from '../game/content';
import { rng } from './svg';

// ---------------------------------------------------------------------------
export function DeltaPill({ value, kind, size = 'md' }: { value: number; kind: 'customers' | 'happiness' | 'coins'; size?: 'md' | 'lg' }) {
  const good = value >= 0;
  const big = size === 'lg';
  const fill = good ? '#58CC02' : '#FF4B4B';
  const edge = good ? '#46A302' : '#D93636';
  const light = good ? '#D7FFB8' : '#FFDCDC';
  const r = useMemo(() => rng(Math.abs(value) * 31 + kind.length), [value, kind]);
  const bits = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ a: (i / 8) * Math.PI * 2 + r(), d: 70 + r() * 50 })), [r]);
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      {bits.map((b, i) => (
        <motion.span key={i} initial={{ x: 0, y: 0, scale: 1, opacity: 1 }} animate={{ x: Math.cos(b.a) * b.d, y: Math.sin(b.a) * b.d, scale: 0, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ position: 'absolute', left: '50%', top: '50%', width: 18, height: 18, marginLeft: -9, marginTop: -9, borderRadius: i % 2 ? 4 : 99, background: i % 3 ? fill : '#FFC800' }} />
      ))}
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: big ? 16 : 12,
        background: light, color: '#4A3613', border: '6px solid #fff',
        borderRadius: 999, boxShadow: 'var(--sh-sm)',
        padding: big ? '12px 34px 10px 22px' : '8px 26px 6px 16px', fontWeight: 700, fontSize: big ? 64 : 44, lineHeight: 1,
      }}>
        <span style={{ display: 'grid', placeItems: 'center', width: big ? 76 : 56, height: big ? 76 : 56, borderRadius: 99, background: '#fff' }}>
          <MeterIcon kind={kind} size={big ? 62 : 46} />
        </span>
        <span style={{ color: edge, paddingTop: 6 }}>{good ? '+' : '−'}{Math.abs(value)}</span>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
export function TimerRing({ remainingMs, totalMs, size = 200 }: { remainingMs: number; totalMs: number; size?: number }) {
  const secs = Math.ceil(remainingMs / 1000);
  const frac = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  const low = remainingMs > 0 && secs <= 10;
  const R = 42, C = 2 * Math.PI * R;
  const fill = low ? '#FF4B4B' : frac > 0.5 ? '#58CC02' : '#FFC800';
  return (
    <motion.div style={{ width: size, height: size, position: 'relative' }}
      animate={low ? { rotate: [0, -6, 6, -4, 0], scale: [1, 1.08, 1] } : { rotate: 0, scale: 1 }}
      transition={low ? { duration: 0.5, repeat: Infinity, repeatDelay: 0.5 } : { duration: 0.2 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="ui-svg-art">
        <circle cx={50} cy={50} r={48} fill="#fff" />
        <circle cx={50} cy={50} r={R} fill="#FFF3CF" />
        <circle cx={50} cy={50} r={R} fill="none" stroke="#F1E2B4" strokeWidth={10} />
        <circle cx={50} cy={50} r={R} fill="none" stroke={fill} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={`${C * frac} ${C}`} transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 0.25s linear, stroke 0.3s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: size * 0.34, color: low ? '#D93636' : '#4A3613', paddingTop: size * 0.05 }}>
        {secs}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
const CONF_COLORS = ['#FFC800', '#FF4B4B', '#1CB0F6', '#58CC02', '#CE82FF', '#FF9600', '#FF6FB5'];
export function Confetti({ fire, count = 120, originY = 1100 }: { fire: number; count?: number; originY?: number }) {
  const [bursts, setBursts] = useState<number[]>([]);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; if (!fire) return; }
    if (!fire) return;
    setBursts(b => [...b.slice(-2), fire]);
    const id = setTimeout(() => setBursts(b => b.filter(x => x !== fire)), 3600);
    return () => clearTimeout(id);
  }, [fire]);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>
      {bursts.map(b => <Burst key={b} seed={b} count={count} originY={originY} />)}
    </div>
  );
}
function Burst({ seed, count, originY }: { seed: number; count: number; originY: number }) {
  const pieces = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, (_, i) => {
      const left = i % 2 === 0;
      return {
        x0: left ? -20 : 1940, y0: originY * (0.55 + r() * 0.3),
        dx: (left ? 1 : -1) * (300 + r() * 900), up: 500 + r() * 700, fall: 700 + r() * 500,
        rot: (r() - 0.5) * 1440, color: CONF_COLORS[Math.floor(r() * CONF_COLORS.length)],
        w: 18 + r() * 18, h: 10 + r() * 22, round: r() > 0.6, dur: 2.2 + r() * 1.2, delay: r() * 0.25,
      };
    });
  }, [seed, count, originY]);
  return (
    <>
      {pieces.map((p, i) => (
        <motion.div key={i}
          initial={{ x: p.x0, y: p.y0, rotate: 0, opacity: 1 }}
          animate={{ x: [p.x0, p.x0 + p.dx * 0.7, p.x0 + p.dx], y: [p.y0, p.y0 - p.up, p.y0 - p.up + p.fall], rotate: p.rot, opacity: [1, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, times: [0, 0.4, 1], ease: 'easeOut' }}
          style={{ position: 'absolute', left: 0, top: 0, width: p.w, height: p.round ? p.w : p.h, borderRadius: p.round ? 99 : 4, background: p.color }} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
export function SpeechBubble({ text, side = 'left', typing, size = 'md', style }: { text: string; side?: 'left' | 'right' | 'bottom'; typing?: boolean; size?: 'md' | 'lg'; style?: CSSProperties }) {
  const [n, setN] = useState(typing ? 0 : text.length);
  useEffect(() => {
    if (!typing) { setN(text.length); return; }
    setN(0);
    const chars = Array.from(text);
    let i = 0;
    const id = setInterval(() => { i += 2; setN(Math.min(chars.length, i)); if (i >= chars.length) clearInterval(id); }, 28);
    return () => clearInterval(id);
  }, [text, typing]);
  const chars = Array.from(text);
  const tail: CSSProperties = side === 'left' ? { left: -40, top: 34 } : side === 'right' ? { right: -40, top: 34, transform: 'scaleX(-1)' } : { left: 70, bottom: -46, transform: 'rotate(-90deg)' };
  return (
    <div className={`ui-bubble ui-bubble-${size}`} style={style}>
      <svg className="ui-bubble-tail" style={tail} viewBox="0 0 64 64">
        <path d="M60 6 C40 10 18 14 4 30 C22 30 40 40 60 50 Z" fill="#fff" />
      </svg>
      <span className="ui-bubble-text">
        <span>{chars.slice(0, n).join('')}</span>
        <span className="ui-ghost">{chars.slice(n).join('')}</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
const STEP_COLORS = ['#1CB0F6', '#FF9600', '#FF6FB5', '#58CC02', '#CE82FF', '#FFC800'];
export function RecipeBar({ act }: { act: number }) {
  return (
    <div className="ui-recipe">
      <svg className="ui-recipe-road" style={{ overflow: 'visible' }} width="100%" height={4}>
        <line x1="0" y1="0" x2="100%" y2="0" stroke="#EBCB6B" strokeWidth={8} strokeDasharray="2 22" strokeLinecap="round" />
      </svg>
      {RECIPE.map((r, i) => {
        const done = act > r.act, cur = act === r.act;
        const bg = cur ? STEP_COLORS[i] : done ? '#fff' : '#FFF7D9';
        return (
          <motion.div key={r.act} className="ui-recipe-step"
            animate={cur ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={cur ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { type: 'spring', stiffness: 300, damping: 24 }}
            style={{ background: bg, opacity: done || cur ? 1 : 0.7, border: '5px solid #fff', boxShadow: 'var(--sh-sm)', color: '#4A3613' }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 54, height: 54, borderRadius: 99, background: '#fff' }}>
              <RecipeIcon act={r.act} size={44} />
            </span>
            <span className="ui-recipe-name">{r.name}</span>
            <AnimatePresence>
              {done && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }} style={{ position: 'absolute', right: -12, top: -14 }}>
                  <CheckBadge size={36} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
