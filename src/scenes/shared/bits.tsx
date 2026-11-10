// Shared bits for the act scenes (welcome, howto, act1..act3): a mover wrapper and rAIvan the 10-headed AI.
import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import { HUE, INK, SPRING } from '../kit';

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

const HEAD_HUES = [HUE.raivan, HUE.purple, HUE.raivan, HUE.pink, HUE.raivan, HUE.purple, HUE.raivan, HUE.pink, HUE.raivan, HUE.purple];

/** rAIvan, the 10-headed AI. 520 x 460 box, feet at the bottom. angry = red eyes + brows, smoke = puffs from the heads. */
export function Raivan({ size = 520, angry = false, smoke = false, style }: { size?: number; angry?: boolean; smoke?: boolean; style?: CSSProperties }) {
  const heads = Array.from({ length: 10 }, (_, i) => {
    const a = (-168 + (i * 156) / 9) * (Math.PI / 180);
    const rad = i % 2 ? 214 : 190;
    return { x: 260 + Math.cos(a) * rad * 1.15, y: 270 + Math.sin(a) * rad * 0.95, r: 40 + (i % 3) * 3, i };
  });
  return (
    <svg width={size} height={(size * 460) / 520} viewBox="0 0 520 460" style={{ overflow: 'visible', ...style }} strokeLinecap="round" strokeLinejoin="round">
      {/* necks */}
      {heads.map(h => <path key={`n${h.i}`} d={`M260 290 Q${(260 + h.x) / 2} ${(290 + h.y) / 2 + 30} ${h.x} ${h.y}`} stroke={HUE.raivan.edge} strokeWidth={26} fill="none" />)}
      {/* body */}
      <ellipse cx={260} cy={358} rx={150} ry={90} fill="#fff" />
      <ellipse cx={260} cy={358} rx={140} ry={86} fill={HUE.raivan.base} />
      <ellipse cx={210} cy={322} rx={56} ry={26} fill={HUE.raivan.hi} opacity={0.9} />
      <rect x={210} y={352} width={100} height={64} rx={22} fill="#fff" opacity={0.18} />
      <text x={260} y={398} textAnchor="middle" fontSize={44} fontWeight={800} fill="#fff" fontFamily="inherit">AI</text>
      {/* feet */}
      <ellipse cx={170} cy={440} rx={52} ry={20} fill={HUE.raivan.edge} /><ellipse cx={350} cy={440} rx={52} ry={20} fill={HUE.raivan.edge} />
      {/* heads */}
      {heads.map(h => {
        const hue = HEAD_HUES[h.i];
        return (
          <g key={h.i}>
            <g className="k-sway" style={{ ['--dur' as string]: `${2.2 + (h.i % 4) * 0.4}s`, ['--delay' as string]: `${h.i * 0.17}s`, ['--sway-a' as string]: '-5deg', ['--sway-b' as string]: '5deg', transformOrigin: '260px 300px' } as CSSProperties}>
              <g transform={`translate(${h.x} ${h.y})`}>
                <circle r={h.r + 6} fill="#fff" />
                <circle r={h.r} fill={hue.base} />
                <ellipse cx={-h.r * 0.35} cy={-h.r * 0.45} rx={h.r * 0.34} ry={h.r * 0.2} fill={hue.hi} />
                <circle cx={-h.r * 0.36} cy={-2} r={h.r * 0.27} fill="#fff" /><circle cx={h.r * 0.36} cy={-2} r={h.r * 0.27} fill="#fff" />
                <circle cx={-h.r * 0.34} cy={0} r={h.r * 0.13} fill={angry ? HUE.red.base : INK} /><circle cx={h.r * 0.38} cy={0} r={h.r * 0.13} fill={angry ? HUE.red.base : INK} />
                {angry
                  ? <><path d={`M${-h.r * 0.7} ${-h.r * 0.42} L${-h.r * 0.1} ${-h.r * 0.18}`} stroke={INK} strokeWidth={5} /><path d={`M${h.r * 0.7} ${-h.r * 0.42} L${h.r * 0.1} ${-h.r * 0.18}`} stroke={INK} strokeWidth={5} /><path d={`M${-h.r * 0.34} ${h.r * 0.5} Q0 ${h.r * 0.28} ${h.r * 0.34} ${h.r * 0.5}`} stroke={INK} strokeWidth={5} fill="none" /></>
                  : <path d={`M${-h.r * 0.36} ${h.r * 0.34} Q0 ${h.r * 0.7} ${h.r * 0.36} ${h.r * 0.34}`} stroke={INK} strokeWidth={5} fill="none" />}
                {smoke && (
                  <g transform={`translate(0 ${-h.r - 4})`}>
                    <g className="k-rise" style={{ ['--dur' as string]: '1.6s', ['--delay' as string]: `${(h.i % 5) * 0.3}s`, ['--rise' as string]: '-90px' } as CSSProperties}>
                      <circle r={14} fill="#fff" stroke="#E2D2F5" strokeWidth={4} />
                    </g>
                  </g>
                )}
              </g>
            </g>
          </g>
        );
      })}
    </svg>
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
