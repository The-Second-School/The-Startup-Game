// Props for scenes. Each renders its own <svg> sized by `size` (width unless noted), centred on its own box.
import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'motion/react';
import { RECIPE } from '../../game/content';
import { HUE, INK, type Hue } from './palette';
import { Ball, gearPath, Slab, starPath } from './shapes';
import { SPRING } from './motion';

type S = { size?: number; style?: CSSProperties; className?: string };
const svgBox = (w: number, h: number, size: number, style?: CSSProperties, className?: string) => ({
  width: size, height: (size * h) / w, viewBox: `0 0 ${w} ${h}`, className, style: { overflow: 'visible' as const, ...style },
});

/** Golden trophy with a star, shine sliver and a wooden base. Square 200x240 box. */
export function Trophy({ size = 200, style, className, shine = true }: S & { shine?: boolean }) {
  return (
    <svg {...svgBox(200, 240, size, style, className)}>
      {shine && <g transform="translate(100 90)"><g className="k-rays" style={{ ['--dur' as string]: '14s' }}>
        {Array.from({ length: 10 }, (_, i) => <path key={i} d="M-14 -70 L0 -150 L14 -70Z" fill="#FFF1A8" opacity={0.85} transform={`rotate(${i * 36})`} />)}
      </g></g>}
      <path d="M44 50 C0 50 6 120 62 116" stroke={HUE.gold.edge} strokeWidth={16} fill="none" />
      <path d="M156 50 C200 50 194 120 138 116" stroke={HUE.gold.edge} strokeWidth={16} fill="none" />
      <path d="M40 30 L160 30 Q160 136 100 144 Q40 136 40 30Z" fill={HUE.gold.base} />
      <path d="M56 40 L76 40 Q76 110 96 130 Q60 118 56 40Z" fill={HUE.gold.hi} />
      <rect x={34} y={20} width={132} height={22} rx={11} fill={HUE.gold.hi} />
      <path d={starPath(24)} transform="translate(112 80)" fill="#fff" />
      <rect x={86} y={140} width={28} height={36} rx={8} fill={HUE.gold.edge} />
      <rect x={58} y={172} width={84} height={22} rx={10} fill={HUE.gold.base} />
      <rect x={44} y={190} width={112} height={38} rx={14} fill={HUE.wood.base} />
      <rect x={70} y={202} width={60} height={14} rx={7} fill={HUE.gold.base} />
    </svg>
  );
}

/** Lightbulb idea with rays. lit = rays + glow. 160x200 box. */
export function Lightbulb({ size = 160, lit = true, style, className }: S & { lit?: boolean }) {
  return (
    <svg {...svgBox(160, 200, size, style, className)}>
      {lit && <g transform="translate(80 74)">
        <circle r={78} fill="#FFF1A8" opacity={0.6} className="k-pulse" />
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-7} y={-112} width={14} height={30} rx={7} fill={HUE.sun.base} transform={`rotate(${i * 45})`} />)}
      </g>}
      <circle cx={80} cy={74} r={56} fill={lit ? '#FFE34D' : HUE.steel.base} />
      <ellipse cx={58} cy={52} rx={16} ry={22} fill="#fff" opacity={0.8} transform="rotate(30 58 52)" />
      <path d="M64 96 Q80 76 96 96" stroke={lit ? HUE.sun.edge : HUE.steel.edge} strokeWidth={7} fill="none" />
      <rect x={56} y={126} width={48} height={18} rx={9} fill={HUE.steel.edge} />
      <rect x={56} y={144} width={48} height={18} rx={9} fill={HUE.steel.base} />
      <rect x={66} y={162} width={28} height={14} rx={7} fill={HUE.steel.edge} />
    </svg>
  );
}

/** A gear with a centre icon slot (children placed at 0,0 in a -100..100 box). spin = seconds per turn (negative reverses). */
export function Gear({ size = 300, hue = HUE.sun, teeth = 10, spin = 8, style, children }: S & { hue?: Hue; teeth?: number; spin?: number; children?: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="-110 -110 220 220" style={{ overflow: 'visible', ...style }}>
      <g className={spin > 0 ? 'k-spin' : 'k-spin-rev'} style={{ ['--dur' as string]: `${Math.abs(spin)}s` }}>
        <path d={gearPath(100, teeth, 18)} fill="#fff" stroke="#fff" strokeWidth={12} />
        <path d={gearPath(100, teeth, 18)} fill={hue.base} />
        <circle r={62} fill={hue.hi} opacity={0.5} />
      </g>
      <circle r={56} fill="#fff" />
      {children}
    </svg>
  );
}

/** Big padlock; `locked` animates the shackle down. 200x240 box. */
export function BigLock({ size = 200, locked = true, hue = HUE.sun, style }: S & { locked?: boolean; hue?: Hue }) {
  return (
    <svg {...svgBox(200, 240, size, style)}>
      <motion.g initial={false} animate={{ y: locked ? 0 : -34 }} transition={SPRING.snappy}>
        <path d="M54 110 L54 70 Q54 20 100 20 Q146 20 146 70 L146 110" stroke="#fff" strokeWidth={36} fill="none" />
        <path d="M54 110 L54 70 Q54 20 100 20 Q146 20 146 70 L146 110" stroke={HUE.steel.edge} strokeWidth={24} fill="none" />
        <path d="M54 100 L54 70 Q54 30 90 24" stroke={HUE.steel.hi} strokeWidth={8} fill="none" />
      </motion.g>
      <rect x={18} y={92} width={164} height={136} rx={36} fill="#fff" />
      <rect x={26} y={98} width={148} height={114} rx={30} fill={hue.base} />
      <ellipse cx={62} cy={124} rx={24} ry={14} fill={hue.hi} />
      <circle cx={100} cy={146} r={18} fill={INK} />
      <rect x={93} y={150} width={14} height={36} rx={7} fill={INK} />
    </svg>
  );
}

/** Steel tiffin box (dabba). open = lid lifted. 200x200 box. */
export function Tiffin({ size = 200, open = false, cold = false, hot = false, style }: S & { open?: boolean; cold?: boolean; hot?: boolean }) {
  const tier = (y: number, i: number) => (
    <g key={i}>
      <rect x={30} y={y} width={140} height={44} rx={16} fill={HUE.steel.base} />
      <rect x={40} y={y + 8} width={30} height={12} rx={6} fill="#fff" opacity={0.8} />
    </g>
  );
  return (
    <svg {...svgBox(200, 220, size, style)}>
      <path d="M44 120 L44 30 Q100 -6 156 30 L156 120" stroke={HUE.steel.edge} strokeWidth={10} fill="none" />
      {tier(150, 0)}{tier(104, 1)}
      <motion.g initial={false} animate={open ? { y: -70, rotate: -24, x: -40 } : { y: 0, rotate: 0, x: 0 }} transition={SPRING.pop} style={{ transformOrigin: '30px 80px' }}>
        <rect x={26} y={60} width={148} height={30} rx={14} fill={HUE.steel.base} />
        <rect x={86} y={46} width={28} height={18} rx={8} fill={HUE.steel.edge} />
      </motion.g>
      {open && (
        <g>
          <rect x={40} y={96} width={120} height={16} rx={8} fill={cold ? '#CDEBFA' : '#FFB44D'} />
          {cold && [50, 80, 112, 140].map((x, i) => <path key={i} d={`M${x} 98 l8 -14 l8 14Z`} fill="#fff" />)}
          {(hot || !cold) && [70, 100, 130].map((x, i) => (
            <g key={i} transform={`translate(${x} 90)`}><path className="k-steam" d="M0 0 Q-10 -16 0 -30 Q10 -44 0 -58" stroke="#fff" strokeWidth={8} fill="none" style={{ ['--delay' as string]: `${i * 0.5}s`, ['--rise' as string]: '-50px' }} /></g>
          ))}
        </g>
      )}
    </svg>
  );
}

/** Firework burst at (x, y) on the stage, looping. */
export function Firework({ x, y, r = 140, color = HUE.pink.base, delay = 0, dur = 2.2 }: { x: number; y: number; r?: number; color?: string; delay?: number; dur?: number }) {
  return (
    <svg width={r * 2.4} height={r * 2.4} viewBox={`${-r * 1.2} ${-r * 1.2} ${r * 2.4} ${r * 2.4}`} style={{ position: 'absolute', left: x - r * 1.2, top: y - r * 1.2, overflow: 'visible', pointerEvents: 'none' }}>
      <g className="k-burst" style={{ ['--delay' as string]: `${delay}s`, ['--dur' as string]: `${dur}s` }}>
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 30})`}>
            <rect x={-7} y={-r} width={14} height={r * 0.42} rx={7} fill={color} />
            <circle cx={0} cy={-r * 0.42} r={7} fill={i % 2 ? '#fff' : color} />
          </g>
        ))}
        <circle r={r * 0.16} fill="#fff" />
      </g>
    </svg>
  );
}

/** Cartoon "POOF" cloud of puffs that blooms out (motion, plays once on mount). */
export function Poof({ size = 500, color = '#FFFFFF', edge: _e = '#E2D2F5' }: { size?: number; color?: string; edge?: string }) {
  const puffs = [[0, 0, 70], [-70, -20, 52], [70, -24, 56], [-40, 46, 48], [46, 44, 50], [0, -66, 46], [-96, 34, 34], [100, 30, 36]];
  return (
    <svg width={size} height={size} viewBox="-150 -150 300 300" style={{ overflow: 'visible' }}>
      {puffs.map(([x, y, r], i) => (
        <motion.g key={i} initial={{ scale: 0, x: 0, y: 0, opacity: 1 }} animate={{ scale: [0, 1.25, 1], x, y, opacity: [1, 1, 1, 0] }}
          transition={{ duration: 1.6, delay: i * 0.03, times: [0, 0.3, 0.7, 1], ease: 'easeOut' }}>
          <circle r={r} fill={color} />
        </motion.g>
      ))}
    </svg>
  );
}

/** 4-point sparkle that twinkles. */
export function Sparkle({ size = 60, color = '#FFFFFF', delay = 0, style }: S & { color?: string; delay?: number }) {
  return (
    <svg width={size} height={size} viewBox="-30 -30 60 60" style={{ overflow: 'visible', ...style }}>
      <path className="k-twinkle" d={starPath(28, 8, 4)} fill={color} style={{ ['--delay' as string]: `${delay}s` }} />
    </svg>
  );
}

/** Fibbot's cute purple bug with wiggling legs. 120x100 box. */
export function Bug({ size = 120, hue = HUE.fibbot, style, className }: S & { hue?: Hue }) {
  return (
    <svg {...svgBox(120, 100, size, style, className)}>
      {[30, 60, 90].map((x, i) => (
        <g key={i}>
          <g className="k-wiggle" style={{ ['--delay' as string]: `${i * 0.1}s`, ['--dur' as string]: '0.3s', ['--wig' as string]: '18deg' }}><path d={`M${x} 60 L${x - 14} 92`} stroke={INK} strokeWidth={7} /></g>
          <g className="k-wiggle" style={{ ['--delay' as string]: `${i * 0.1 + 0.15}s`, ['--dur' as string]: '0.3s', ['--wig' as string]: '18deg' }}><path d={`M${x} 60 L${x + 14} 92`} stroke={INK} strokeWidth={7} /></g>
        </g>
      ))}
      <ellipse cx={60} cy={52} rx={50} ry={34} fill={hue.base} />
      <path d="M60 20 L60 86" stroke={hue.edge} strokeWidth={5} />
      <circle cx={40} cy={44} r={7} fill={hue.hi} /><circle cx={80} cy={58} r={9} fill={hue.hi} />
      <circle cx={104} cy={44} r={22} fill={INK} />
      <circle cx={100} cy={38} r={7} fill="#fff" /><circle cx={114} cy={40} r={7} fill="#fff" />
      <circle cx={102} cy={39} r={3.5} fill={INK} /><circle cx={116} cy={41} r={3.5} fill={INK} />
      <path d="M100 26 Q96 6 84 4 M112 26 Q118 6 130 6" stroke={INK} strokeWidth={5} fill="none" />
      <path d="M100 52 Q108 58 116 52" stroke="#fff" strokeWidth={4} fill="none" />
    </svg>
  );
}

/** Thought cloud with content inside (children in a 0..240 x 0..180 box). */
export function ThoughtCloud({ size = 240, children, style }: S & { children?: ReactNode }) {
  return (
    <svg {...svgBox(240, 230, size, style)}>
      <circle cx={40} cy={214} r={10} fill="#fff" /><circle cx={64} cy={190} r={16} fill="#fff" />
      {[[120, 90, 86], [52, 100, 50], [190, 96, 48], [86, 40, 44], [160, 40, 44], [120, 140, 56]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" />)}
      {children}
    </svg>
  );
}

/** Spotlight cone from the top (flat translucent shape). x = centre bottom, w = bottom width. */
export function SpotCone({ x, w = 700, top = -40, bottom = 1000, color = '#FFE680', opacity = 0.35, style }: { x: number; w?: number; top?: number; bottom?: number; color?: string; opacity?: number; style?: CSSProperties }) {
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', ...style }}>
      <path d={`M${x - 80} ${top} L${x + 80} ${top} L${x + w / 2} ${bottom} L${x - w / 2} ${bottom}Z`} fill={color} opacity={opacity} />
      <ellipse cx={x} cy={bottom} rx={w / 2} ry={w * 0.09} fill={color} opacity={opacity + 0.2} />
    </svg>
  );
}

/** Techistan flying bus (hover-pads with flames). 360x180 box. Faces right. */
export function FlyingBus({ size = 360, hue = HUE.coral, style }: S & { hue?: Hue }) {
  return (
    <svg {...svgBox(360, 190, size, style)}>
      <rect x={30} y={30} width={300} height={120} rx={44} fill="#fff" />
      <rect x={38} y={36} width={286} height={104} rx={38} fill={hue.base} />
      <rect x={52} y={44} width={120} height={18} rx={9} fill={hue.hi} />
      {[64, 120, 176, 232].map((x, i) => <rect key={i} x={x} y={62} width={44} height={36} rx={12} fill={i === 3 ? HUE.sky.hi : '#CDEBFA'} />)}
      <rect x={286} y={62} width={34} height={44} rx={14} fill="#CDEBFA" />
      {/* passengers peeking */}
      {[86, 142, 198].map((x, i) => <circle key={i} cx={x} cy={92} r={12} fill={['#C98B5E', '#A86B45', '#E0A97F'][i]} />)}
      <rect x={38} y={112} width={286} height={14} fill={HUE.sun.base} />
      <circle cx={330} cy={124} r={10} fill="#FFF1A8" />
      {[90, 270].map(x => (
        <g key={x}>
          <rect x={x - 40} y={146} width={80} height={22} rx={11} fill={HUE.steel.edge} />
          <g transform={`translate(${x} 172)`}><path className="k-pulse" d="M-26 0 Q0 40 26 0Z" fill={HUE.orange.base} style={{ ['--dur' as string]: '0.25s', ['--pulse' as string]: '1.25' }} /></g>
        </g>
      ))}
    </svg>
  );
}

/** Flying auto-rickshaw with a spinning propeller. 260x220 box. Faces right. */
export function FlyingRickshaw({ size = 260, style }: S) {
  return (
    <svg {...svgBox(260, 220, size, style)}>
      <rect x={126} y={4} width={8} height={30} rx={4} fill={INK} />
      <g transform="translate(130 10)"><g className="k-prop"><rect x={-80} y={-6} width={160} height={12} rx={6} fill={INK} opacity={0.75} /></g></g>
      <path d="M40 140 L40 80 Q40 34 110 34 L180 34 Q226 34 230 90 L234 140Z" fill="#fff" />
      <path d="M48 140 L48 84 Q48 42 112 42 L178 42 Q218 42 222 92 L226 140Z" fill={HUE.sun.base} />
      <path d="M58 70 Q60 52 100 50 L100 82 L58 82Z" fill={HUE.sun.hi} />
      <path d="M150 50 L178 50 Q212 50 214 96 L150 96Z" fill="#CDEBFA" />
      <rect x={40} y={112} width={200} height={56} rx={24} fill={HUE.green.base} />
      <rect x={52} y={118} width={70} height={14} rx={7} fill={HUE.green.hi} />
      <circle cx={232} cy={136} r={10} fill="#FFF1A8" />
      <circle cx={84} cy={100} r={16} fill="#A86B45" />
      {[80, 200].map(x => <g key={x}><circle cx={x} cy={180} r={22} fill={INK} /><circle cx={x} cy={180} r={9} fill={HUE.steel.base} /></g>)}
      <g transform="translate(36 150)"><path className="k-pulse" d="M0 -14 Q-40 0 0 14Z" fill={HUE.orange.base} style={{ ['--dur' as string]: '0.25s' }} /></g>
    </svg>
  );
}

// ---------- Recipe step icons + track ----------
export type StepKind = 'problem' | 'build' | 'launch' | 'money' | 'grow' | 'show';
const STEP_KINDS: StepKind[] = ['problem', 'build', 'launch', 'money', 'grow', 'show'];
/** Our own SVG icon for each Startup Recipe step (magnifier, hammer, megaphone, coin, rocket, trophy). -50..50 box. */
export function StepIcon({ kind, size = 100 }: { kind: StepKind; size?: number }) {
  const body: Record<StepKind, ReactNode> = {
    problem: <g><circle cx={-8} cy={-10} r={30} fill={HUE.steel.base} /><circle cx={-8} cy={-10} r={20} fill="#CDEBFA" /><path d="M-16 -20 Q-8 -26 0 -20" stroke="#fff" strokeWidth={5} fill="none" /><path d="M14 14 L36 36" stroke={HUE.wood.base} strokeWidth={14} /></g>,
    build: <g><path d="M-30 30 L14 -14" stroke={HUE.wood.base} strokeWidth={13} /><rect x={-6} y={-44} width={50} height={26} rx={10} fill={HUE.steel.base} transform="rotate(45 19 -26)" /></g>,
    launch: <g><path d="M-34 -12 L10 -32 L10 32 L-34 12Z" fill={HUE.red.base} /><rect x={-40} y={-14} width={16} height={28} rx={6} fill={HUE.red.edge} /><path d="M18 -14 Q30 0 18 14 M26 -26 Q44 0 26 26" stroke={HUE.orange.base} strokeWidth={6} fill="none" /></g>,
    money: <g><Ball cx={0} cy={0} r={34} hue={HUE.coin} /><path d="M-10 -16 L12 -16 M-10 -6 L12 -6 M-10 -16 Q8 -16 8 -4 Q8 6 -8 6 L10 20" stroke={HUE.coin.edge} strokeWidth={5} fill="none" /></g>,
    grow: <g transform="rotate(40)"><path d="M0 -42 Q20 -20 18 20 L-18 20 Q-20 -20 0 -42Z" fill="#fff" /><path d="M0 -42 Q20 -20 18 20 L0 20Z" fill={HUE.steel.base} /><circle cx={0} cy={-8} r={9} fill={HUE.blue.base} /><path d="M-18 6 L-30 26 L-16 22Z M18 6 L30 26 L16 22Z" fill={HUE.red.base} /><path d="M-10 22 Q0 46 10 22Z" fill={HUE.orange.base} /></g>,
    show: <g><path d="M-26 -30 L26 -30 Q26 12 0 16 Q-26 12 -26 -30Z" fill={HUE.gold.base} /><path d="M-26 -22 Q-44 -22 -40 -6 Q-36 6 -22 4 M26 -22 Q44 -22 40 -6 Q36 6 22 4" stroke={HUE.gold.edge} strokeWidth={6} fill="none" /><rect x={-6} y={14} width={12} height={12} fill={HUE.gold.edge} /><rect x={-20} y={26} width={40} height={12} rx={5} fill={HUE.wood.base} /><path d="M-14 -24 L-6 -24 Q-6 0 2 8 Q-14 2 -14 -24Z" fill={HUE.gold.hi} /></g>,
  };
  return <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ overflow: 'visible' }}>{body[kind]}</svg>;
}

/** Big Startup Recipe track: 6 chips with icons and names; `active` (1..6) lights up and stamps in; earlier ones get a tick. */
export function RecipeTrack({ active, width = 1760, style }: { active: number; width?: number; style?: CSSProperties }) {
  const chipW = width / 6 - 20;
  return (
    <div style={{ display: 'flex', gap: 20, width, ...style }}>
      {RECIPE.map((r, i) => {
        const on = r.act === active, done = r.act < active;
        const hue = on ? HUE.sun : done ? HUE.green : HUE.cream;
        return (
          <motion.div key={r.act} initial={{ y: 80, opacity: 0 }} animate={on ? { y: [-0, -36, 0], scale: [1, 1.18, 1.1], opacity: 1 } : { y: 0, scale: 1, opacity: 1 }}
            transition={on ? { delay: 0.6 + i * 0.07, duration: 0.7, ease: 'easeOut' } : { ...SPRING.pop, delay: i * 0.07 }}
            style={{ width: chipW, position: 'relative', zIndex: on ? 2 : 1 }}>
            <svg width={chipW} height={230} viewBox={`0 0 ${chipW} 230`} style={{ overflow: 'visible' }}>
              <Slab x={0} y={0} w={chipW} h={210} r={40} hue={hue} border={6} />
              <g transform={`translate(${chipW / 2} 70)`}><g opacity={on || done ? 1 : 0.55}><StepIcon kind={STEP_KINDS[i]} size={96} /></g></g>
              {done && <g transform={`translate(${chipW - 30} 26)`}><circle r={26} fill="#fff" /><circle r={20} fill={HUE.green.edge} /><path d="M-9 0 L-2 8 L10 -8" stroke="#fff" strokeWidth={6} fill="none" /></g>}
            </svg>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontSize: 44, fontWeight: 800, color: INK, lineHeight: 1 }}>{r.name}</div>
            {on && <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 1.1, duration: 0.5 }}
              style={{ position: 'absolute', left: -14, right: -14, top: -14, bottom: -4, borderRadius: 54, border: '10px solid #FF9600', pointerEvents: 'none' }} />}
          </motion.div>
        );
      })}
    </div>
  );
}

/** A plain white sticker card (DOM) with even border + soft shadow; for labels and product cards inside scenes. */
export function StickerCard({ children, w, h, hue = HUE.paper, style, rotate = 0 }: { children?: ReactNode; w: number; h: number; hue?: Hue; style?: CSSProperties; rotate?: number }) {
  return (
    <div style={{ width: w, height: h, borderRadius: 48, background: hue.base, border: '6px solid #fff', boxShadow: 'var(--sh)', transform: `rotate(${rotate}deg)`, position: 'relative', boxSizing: 'border-box', ...style }}>
      {children}
    </div>
  );
}
