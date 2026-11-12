// Shared bits for the act scenes (welcome, howto, act1..act3): a mover wrapper and the scene version of Fibbot (wraps the ui Fibbot).
import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import { HUE, INK, SPRING } from '../kit';
import { Fibbot as UiFibbot, type FibbotMood } from '../../ui/characters';

export type MvState = { x?: number; y?: number; scale?: number; rotate?: number; opacity?: number };

/** Absolutely placed mover at (left, top); bc = children sit with bottom-centre exactly at (left, top) and scale from there that springs between transform states as the beat changes. */
export function Mv({ left = 0, top = 0, to, from, spring = SPRING.settle, origin = '50% 100%', bc = false, children, style, z }: {
  left?: number; top?: number; to: MvState; from?: MvState; spring?: object; origin?: string; bc?: boolean; children: ReactNode; style?: CSSProperties; z?: number;
}) {
  const f = from ?? to;
  return (
    <motion.div initial={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, ...f }} animate={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, ...to }}
      transition={spring} style={{ position: 'absolute', left, top, transformOrigin: bc ? '0px 0px' : origin, zIndex: z, ...style }}>
      {bc ? <div style={{ position: 'absolute', left: 0, bottom: 0, transform: 'translateX(-50%)', lineHeight: 0 }}>{children}</div> : children}
    </motion.div>
  );
}

/** Fibbot for the scenes: a thin wrapper around the one and only ui Fibbot. 520 x 460 box (scaled by `size`), feet at the bottom.
 *  angry = angry face, smoke = puffs from his antennas. */
export function Fibbot({ size = 520, angry = false, smoke = false, mood, style }: { size?: number; angry?: boolean; smoke?: boolean; mood?: FibbotMood; style?: CSSProperties }) {
  return (
    <div style={{ position: 'relative', width: size, height: (size * 460) / 520, ...style }}>
      <div style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)', lineHeight: 0 }}>
        <UiFibbot mood={mood ?? (angry ? 'angry' : 'sneaky')} size={size * 0.98} smoke={smoke} />
      </div>
    </div>
  );
}

/** Flat round coin with a ₹ mark. */
export function CoinBit({ size = 90, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible', ...style }}>
      <circle cx={50} cy={50} r={46} fill="#fff" /><circle cx={50} cy={50} r={40} fill={HUE.coin.base} />
      <circle cx={50} cy={50} r={29} fill="none" stroke={HUE.coin.hi} strokeWidth={5} />
      <text x={50} y={64} textAnchor="middle" fontSize={40} fontWeight={800} fill={HUE.coin.edge} fontFamily="inherit">₹</text>
      <ellipse cx={34} cy={30} rx={10} ry={6} fill="#fff" opacity={0.7} />
    </svg>
  );
}

/** Flat round heart. */
export function HeartBit({ size = 90, hue = HUE.pink, style }: { size?: number; hue?: typeof HUE.pink; style?: CSSProperties }) {
  const d = 'M50 88 C10 60 6 30 28 20 C42 14 50 26 50 32 C50 26 58 14 72 20 C94 30 90 60 50 88Z';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible', ...style }}>
      <path d={d} fill="#fff" stroke="#fff" strokeWidth={12} /><path d={d} fill={hue.base} />
      <ellipse cx={30} cy={34} rx={9} ry={6} fill={hue.hi} transform="rotate(-30 30 34)" />
    </svg>
  );
}

/** Tiny shop/office/tower pieces for the growth ladder in howto. size = height-ish. */
export function Building({ kind, size = 240 }: { kind: 0 | 1 | 2 | 3; size?: number }) {
  const W = 240, H = 300;
  const win = (x: number, y: number, k: string | number) => <rect key={k} x={x} y={y} width={26} height={30} rx={9} fill="#CDEBFA" />;
  return (
    <svg width={(size * W) / H} height={size} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }} strokeLinecap="round" strokeLinejoin="round">
      {kind === 0 && <g>
        <rect x={26} y={150} width={188} height={150} rx={26} fill="#fff" />
        <rect x={40} y={170} width={20} height={130} rx={6} fill={HUE.wood.edge} /><rect x={180} y={170} width={20} height={130} rx={6} fill={HUE.wood.edge} />
        <rect x={50} y={236} width={140} height={64} rx={14} fill={HUE.wood.base} /><rect x={50} y={236} width={140} height={14} rx={7} fill={HUE.wood.hi} />
        <path d="M20 160 Q120 80 220 160 L220 176 L20 176Z" fill="#fff" />
        {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${24 + i * 39} 166 Q${24 + i * 39 + 20} 112 ${24 + i * 39 + 39} 166Z`} fill={i % 2 ? '#fff' : HUE.red.base} stroke={HUE.red.edge} strokeWidth={3} />)}
        <circle cx={90} cy={226} r={13} fill={HUE.orange.base} /><circle cx={120} cy={226} r={13} fill={HUE.green.base} /><circle cx={150} cy={226} r={13} fill={HUE.red.base} />
      </g>}
      {kind === 1 && <g>
        <rect x={20} y={110} width={200} height={190} rx={30} fill="#fff" />
        <rect x={30} y={114} width={180} height={180} rx={26} fill={HUE.coral.base} />
        <rect x={20} y={100} width={200} height={50} rx={22} fill={HUE.red.base} stroke="#fff" strokeWidth={6} />
        {[0, 1, 2, 3].map(i => <rect key={i} x={30 + i * 48} y={104} width={24} height={42} rx={8} fill="#fff" opacity={0.85} />)}
        <rect x={50} y={170} width={140} height={74} rx={18} fill="#CDEBFA" /><rect x={62} y={178} width={36} height={14} rx={7} fill="#fff" />
        <rect x={96} y={240} width={48} height={56} rx={16} fill={HUE.wood.base} />
      </g>}
      {kind === 2 && <g>
        <rect x={34} y={50} width={172} height={250} rx={34} fill="#fff" />
        <rect x={44} y={54} width={152} height={236} rx={30} fill={HUE.blue.base} />
        <rect x={54} y={62} width={40} height={200} rx={20} fill={HUE.blue.hi} opacity={0.7} />
        {[0, 1, 2].map(r => [0, 1, 2].map(c => win(66 + c * 40, 80 + r * 56, `${r}${c}`)))}
        <rect x={96} y={246} width={48} height={50} rx={16} fill={HUE.wood.base} />
      </g>}
      {kind === 3 && <g>
        <rect x={116} y={-30} width={8} height={44} rx={4} fill={INK} /><circle cx={120} cy={-34} r={10} fill={HUE.red.base} className="k-pulse" />
        <path d="M70 70 Q120 6 170 70 L170 300 L70 300Z" fill="#fff" stroke="#fff" strokeWidth={10} />
        <path d="M78 70 Q120 16 162 70 L162 296 L78 296Z" fill={HUE.purple.base} />
        <path d="M78 70 Q100 30 124 20 Q94 60 94 296 L78 296Z" fill={HUE.purple.hi} opacity={0.8} />
        <rect x={34} y={150} width={172} height={30} rx={15} fill={HUE.sun.base} stroke="#fff" strokeWidth={6} />
        {[0, 1, 2, 3, 4].map(r => <rect key={r} x={106} y={84 + r * 38} width={28} height={22} rx={8} fill="#FFF6DE" />)}
        
      </g>}
    </svg>
  );
}

/** Mounts children with a soft fade + drift and unmounts them with an exit (opacity/transform only).
 *  Use for things that appear for a few beats: they never pop out abruptly. Full-stage, click-through box. */
export function Show({ when, children, y = 24, x = 0, style, k = 'show' }: { when: boolean; children: ReactNode; y?: number; x?: number; style?: CSSProperties; k?: string }) {
  return (
    <AnimatePresence>
      {when && (
        <motion.div key={k} initial={{ opacity: 0, y, x }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: y / 2, x: x / 2, transition: { duration: 0.25 } }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, pointerEvents: 'none', ...style }}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
