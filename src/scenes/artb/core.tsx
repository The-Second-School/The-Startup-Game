// Scenes artist B: shared flat-art toolkit (colours, layout helpers, people, simple props).
// Flat colours only, light from the top-left, round joins and caps, white sticker borders on props and people.
import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';
import './artb.css';

export const C = {
  ink: '#4A3613', inkSoft: '#8A6F3E', bg: '#FFFCF3', bg2: '#FFF3D6', bg3: '#FFEBB4', bg4: '#FFE29A',
  paper: '#FFFFFF', paperEdge: '#EED9A0', cream: '#FFFBE6',
  sun: '#FFC800', sunEdge: '#E0A100', sunHi: '#FFE266',
  good: '#58CC02', goodEdge: '#46A302', goodHi: '#9BE45B', goodDeep: '#347A01',
  bad: '#FF4B4B', badEdge: '#D93636', badHi: '#FF9A9A',
  blue: '#1CB0F6', blueEdge: '#1290CC', blueHi: '#8DDBFD', blueDeep: '#0C74A8',
  purple: '#CE82FF', purpleEdge: '#A963DB', purpleHi: '#E8C3FF',
  orange: '#FF9600', orangeEdge: '#E07F00', orangeHi: '#FFC266',
  pink: '#FF6FB5', pinkEdge: '#E5539A', pinkHi: '#FFB3D8',
  coin: '#FFB800', coinEdge: '#D68F00', coinHi: '#FFE07A',
  rv: '#7B4BC9', rvEdge: '#5A2F9E', rvHi: '#A47AE8', rvDeep: '#3F2175',
  sky: '#E3F5FF', sky2: '#C9EAFC', water: '#6FCBF4', water2: '#46B0E8', water3: '#2E94D2',
  wood: '#D69A5B', woodEdge: '#A96E35', woodHi: '#F0BE86',
  steel: '#C3CED9', steelEdge: '#8C9BAD', steelHi: '#EEF3F8',
  road: '#F1E5BE', road2: '#E3D3A0', grass: '#BDEE8F', grass2: '#A2E070',
};
export const FONT = "'Baloo 2', system-ui, sans-serif";
export const EASE_POP = [0.34, 1.56, 0.64, 1] as const;
export const SPRING_POP = { type: 'spring', stiffness: 420, damping: 18 } as const;
export const SPRING_BIG = { type: 'spring', stiffness: 260, damping: 12 } as const;
export const SPRING_MOVE = { type: 'spring', stiffness: 160, damping: 22 } as const;

export const useUid = () => useId().replace(/[^a-zA-Z0-9]/g, '');

/** Absolutely positioned box (stage pixels). */
export function Abs({ x = 0, y = 0, w, h, z, origin, style, className, children }: {
  x?: number; y?: number; w?: number; h?: number; z?: number; origin?: string; style?: CSSProperties; className?: string; children?: ReactNode;
}) {
  return <div className={className} style={{ position: 'absolute', left: x, top: y, width: w, height: h, zIndex: z, transformOrigin: origin, ...style }}>{children}</div>;
}

/** SVG with a natural viewBox of vw x vh, shown w px wide. */
export function Svg({ vw, vh, w, children, style, className }: { vw: number; vh: number; w: number; children?: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <svg width={w} height={(w * vh) / vw} viewBox={`0 0 ${vw} ${vh}`} className={className} style={{ overflow: 'visible', display: 'block', ...style }}
      strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  );
}

/** Scene root: fills the stage, never takes pointer events. */
export function Root({ bg = C.bg, children }: { bg?: string; children?: ReactNode }) {
  return <div className="ab-root" style={{ background: bg, boxShadow: `0 0 0 600px ${bg}` }}>{children}</div>;
}

export const cssVars = (v: Record<string, string | number>) => v as CSSProperties;

/** Wait `ms` after mount (or after `key` changes) then flip true. */
export function useAfter(ms: number, key: unknown = 0) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(false);
    const t = setTimeout(() => setOn(true), ms);
    return () => clearTimeout(t);
  }, [ms, key]);
  return on;
}
/** Index that steps through `n` values every `ms`, starting after `startMs`. */
export function useStepper(n: number, ms: number, startMs = 0, key: unknown = 0) {
  const [i, setI] = useState(-1);
  useEffect(() => {
    setI(-1);
    let iv: ReturnType<typeof setInterval> | undefined;
    const t = setTimeout(() => { setI(0); iv = setInterval(() => setI(v => (v + 1) % n), ms); }, startMs);
    return () => { clearTimeout(t); if (iv) clearInterval(iv); };
  }, [n, ms, startMs, key]);
  return i;
}

// ---------- tiny geometry ----------
export const starPts = (cx: number, cy: number, R: number, r: number, n = 5) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / n; const rad = i % 2 ? r : R;
    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

/** Chunky rounded star sticker. */
export function Star({ s = 80, color = C.sun, edge: _e = C.sunEdge, hi = C.sunHi, border = true, style, className }: { s?: number; color?: string; edge?: string; hi?: string; border?: boolean; style?: CSSProperties; className?: string }) {
  return (
    <Svg vw={100} vh={100} w={s} style={style} className={className}>
      {border && <polygon points={starPts(50, 54, 40, 20)} fill="#fff" stroke="#fff" strokeWidth={20} />}
      <polygon points={starPts(50, 50, 38, 19)} fill={color} stroke={color} strokeWidth={10} />
      <polygon points="38,40 48,24 51,34" fill={hi} stroke={hi} strokeWidth={6} />
    </Svg>
  );
}

export function Sparkle({ s = 50, color = '#fff', style, className }: { s?: number; color?: string; style?: CSSProperties; className?: string }) {
  return (
    <Svg vw={100} vh={100} w={s} style={style} className={className}>
      <path d="M50 4 Q54 46 96 50 Q54 54 50 96 Q46 54 4 50 Q46 46 50 4Z" fill={color} stroke={color} strokeWidth={4} />
    </Svg>
  );
}

export function Coin({ s = 80, style, className }: { s?: number; style?: CSSProperties; className?: string }) {
  return (
    <Svg vw={100} vh={100} w={s} style={style} className={className}>
      <circle cx={50} cy={56} r={46} fill="#fff" />
      <circle cx={50} cy={50} r={40} fill={C.coin} />
      <circle cx={50} cy={50} r={28} fill={C.coin} stroke={C.coinEdge} strokeWidth={5} />
      <path d="M50 36 V64 M42 42 H58 M42 50 H56" stroke={C.coinEdge} strokeWidth={6} fill="none" />
      <path d="M24 40 A28 28 0 0 1 42 22" stroke={C.coinHi} strokeWidth={7} fill="none" />
    </Svg>
  );
}

/** Round soft cloud: flat base, a darker underside clipped, white border-free. */
export function Cloud({ w = 300, color = '#fff', shade: _s = '#FBEFC2', style, className }: { w?: number; color?: string; shade?: string; style?: CSSProperties; className?: string }) {
  const u = useUid();
  return (
    <Svg vw={300} vh={140} w={w} style={style} className={className}>
      <defs>
        <clipPath id={`cl${u}`}>
          <rect x={10} y={70} width={280} height={56} rx={28} />
          <circle cx={90} cy={72} r={46} /><circle cx={150} cy={52} r={56} /><circle cx={212} cy={74} r={42} />
        </clipPath>
      </defs>
      <g clipPath={`url(#cl${u})`}>
        <rect x={0} y={0} width={300} height={140} fill={color} />
      </g>
    </Svg>
  );
}

/** Full-width flat hill band. */
export function Hill({ y, h = 220, color, w = 1920, bump = 0.5, style }: { y: number; h?: number; color: string; w?: number; bump?: number; style?: CSSProperties }) {
  const p = `M0 ${h * 0.55} Q ${w * 0.18} ${h * (0.55 - bump)} ${w * 0.38} ${h * 0.42} T ${w * 0.75} ${h * 0.4} T ${w} ${h * 0.3} V ${h} H 0 Z`;
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', left: 0, top: y, display: 'block', ...style }}><path d={p} fill={color} /></svg>;
}

export function Sun({ s = 220, style }: { s?: number; style?: CSSProperties }) {
  return (
    <Svg vw={200} vh={200} w={s} style={style}>
      <g className="spin" style={{ transformOrigin: '100px 100px', ['--d' as string]: '40s' } as CSSProperties}>
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={92} y={4} width={16} height={34} rx={8} fill={C.sun} transform={`rotate(${i * 30} 100 100)`} />)}
      </g>
      <circle cx={100} cy={100} r={58} fill={C.sun} />
      <path d="M64 84 A40 40 0 0 1 90 62" stroke={C.sunHi} strokeWidth={10} fill="none" />
    </Svg>
  );
}

/** Row of overlapping hills + a flat ground, with a soft pattern of dots. */
export function Dots({ x = -400, y = 0, w = 2720, h = 300, color = C.bg2, gap = 90, r = 8 }: { x?: number; y?: number; w?: number; h?: number; color?: string; gap?: number; r?: number }) {
  const cols = Math.ceil(w / gap), rows = Math.ceil(h / gap);
  return (
    <svg width={w} height={h} style={{ position: 'absolute', left: x, top: y }}>
      {Array.from({ length: cols * rows }, (_, i) => {
        const cx = (i % cols) * gap + ((Math.floor(i / cols) % 2) ? gap / 2 : 0) + gap / 2, cy = Math.floor(i / cols) * gap + gap / 2;
        return <circle key={i} cx={cx} cy={cy} r={r} fill={color} />;
      })}
    </svg>
  );
}

// ---------- people ----------
const SKINS = ['#F6D0A8', '#E2A878', '#C4814F', '#8F5B37'];
const SHIRTS = [C.blue, C.pink, C.orange, C.good, C.purple, C.bad, C.sun];
const SHIRT_EDGE: Record<string, string> = { [C.blue]: C.blueEdge, [C.pink]: C.pinkEdge, [C.orange]: C.orangeEdge, [C.good]: C.goodEdge, [C.purple]: C.purpleEdge, [C.bad]: C.badEdge, [C.sun]: C.sunEdge };
const HAIRS = ['#3A2A1A', '#26211C', '#6B3E1E', '#1C1A1A'];
export type Mood = 'happy' | 'sad' | 'neutral' | 'wow' | 'angry' | 'yawn';

export function Face({ mood, cx = 60, cy = 52, spread = 13, er = 5.5, mouthW = 14, ink = C.ink }: { mood: Mood; cx?: number; cy?: number; spread?: number; er?: number; mouthW?: number; ink?: string }) {
  const lx = cx - spread, rx = cx + spread, my = cy + 16;
  const sad = mood === 'sad', ang = mood === 'angry';
  return (
    <g>
      {(mood === 'happy') ? (
        <>
          <path d={`M${lx - 6} ${cy + 2} Q${lx} ${cy - 8} ${lx + 6} ${cy + 2}`} stroke={ink} strokeWidth={4.5} fill="none" />
          <path d={`M${rx - 6} ${cy + 2} Q${rx} ${cy - 8} ${rx + 6} ${cy + 2}`} stroke={ink} strokeWidth={4.5} fill="none" />
        </>
      ) : mood === 'yawn' ? (
        <>
          <path d={`M${lx - 6} ${cy} Q${lx} ${cy + 6} ${lx + 6} ${cy}`} stroke={ink} strokeWidth={4.5} fill="none" />
          <path d={`M${rx - 6} ${cy} Q${rx} ${cy + 6} ${rx + 6} ${cy}`} stroke={ink} strokeWidth={4.5} fill="none" />
        </>
      ) : (
        <>
          <g className="blink" style={{ transformOrigin: `${lx}px ${cy}px` }}><circle cx={lx} cy={cy} r={er} fill={ink} /><circle cx={lx - 1.8} cy={cy - 2} r={er * 0.32} fill="#fff" /></g>
          <g className="blink" style={{ transformOrigin: `${rx}px ${cy}px` }}><circle cx={rx} cy={cy} r={er} fill={ink} /><circle cx={rx - 1.8} cy={cy - 2} r={er * 0.32} fill="#fff" /></g>
        </>
      )}
      {sad && (<>
        <path d={`M${lx - 8} ${cy - 11} L${lx + 6} ${cy - 16}`} stroke={ink} strokeWidth={4} fill="none" />
        <path d={`M${rx + 8} ${cy - 11} L${rx - 6} ${cy - 16}`} stroke={ink} strokeWidth={4} fill="none" />
        <path d={`M${lx - 2} ${cy + 10} q-4 8 0 11 q4 -3 0 -11z`} fill={C.blueHi} stroke={C.blueHi} strokeWidth={2} />
      </>)}
      {ang && (<>
        <path d={`M${lx - 8} ${cy - 16} L${lx + 7} ${cy - 9}`} stroke={ink} strokeWidth={4.5} fill="none" />
        <path d={`M${rx + 8} ${cy - 16} L${rx - 7} ${cy - 9}`} stroke={ink} strokeWidth={4.5} fill="none" />
      </>)}
      {mood === 'happy' && <path d={`M${cx - mouthW} ${my - 2} Q${cx} ${my + 20} ${cx + mouthW} ${my - 2} Z`} fill={ink} stroke={ink} strokeWidth={3} />}
      {mood === 'happy' && <path d={`M${cx - 7} ${my + 7} Q${cx} ${my + 3} ${cx + 7} ${my + 7} Q${cx} ${my + 13} ${cx - 7} ${my + 7}Z`} fill={C.pink} />}
      {mood === 'neutral' && <path d={`M${cx - 8} ${my + 2} H${cx + 8}`} stroke={ink} strokeWidth={4.5} fill="none" />}
      {sad && <path d={`M${cx - 9} ${my + 8} Q${cx} ${my - 4} ${cx + 9} ${my + 8}`} stroke={ink} strokeWidth={4.5} fill="none" />}
      {ang && <path d={`M${cx - 9} ${my + 6} Q${cx} ${my - 2} ${cx + 9} ${my + 6}`} stroke={ink} strokeWidth={4.5} fill="none" />}
      {mood === 'wow' && <ellipse cx={cx} cy={my + 4} rx={7} ry={9} fill={ink} />}
      {mood === 'yawn' && <ellipse cx={cx} cy={my + 6} rx={9} ry={13} fill={ink} />}
      {(mood === 'happy' || mood === 'wow') && <><circle cx={lx - 10} cy={cy + 14} r={6} fill={C.pink} opacity={0.5} /><circle cx={rx + 10} cy={cy + 14} r={6} fill={C.pink} opacity={0.5} /></>}
    </g>
  );
}

/** A flat little townsperson. Width = size, height = size * 5/3. */
export function Person({ seed = 0, mood = 'neutral', arms = 'down', walk = false, size = 110, flip = false, hat = false, shirt, style, className }: {
  seed?: number; mood?: Mood; arms?: 'down' | 'up' | 'wave'; walk?: boolean; size?: number; flip?: boolean; hat?: boolean; shirt?: string; style?: CSSProperties; className?: string;
}) {
  const sk = SKINS[seed % 4], sh = shirt ?? SHIRTS[(seed * 3 + 1) % SHIRTS.length], she = SHIRT_EDGE[sh] ?? C.ink, hr = HAIRS[(seed + 1) % 4], hs = (seed >> 1) % 4;
  const pants = ['#6C5BB5', '#4E8F5D', '#B9743D', '#3C6EA5'][seed % 4];
  const u = useUid();
  return (
    <Svg vw={120} vh={200} w={size} style={{ transform: flip ? 'scaleX(-1)' : undefined, ...style }} className={className}>
      <defs><clipPath id={`pb${u}`}><rect x={28} y={76} width={64} height={72} rx={30} /></clipPath></defs>
      {/* white sticker silhouette */}
      <g fill="#fff" stroke="#fff" strokeWidth={11}>
        <circle cx={60} cy={48} r={34} /><rect x={28} y={76} width={64} height={72} rx={30} />
        <rect x={36} y={132} width={20} height={56} rx={10} /><rect x={64} y={132} width={20} height={56} rx={10} />
        {arms === 'down' ? <><path d="M34 96 L18 134" strokeWidth={26} /><path d="M86 96 L102 134" strokeWidth={26} /></> : arms === 'up' ? <><path d="M34 96 L14 56" strokeWidth={26} /><path d="M86 96 L106 56" strokeWidth={26} /></> : <><path d="M34 96 L18 134" strokeWidth={26} /><path d="M86 96 L106 56" strokeWidth={26} /></>}
      </g>
      {/* legs */}
      <g className={walk ? 'legA' : undefined} style={{ transformOrigin: '46px 136px' }}><rect x={36} y={132} width={20} height={52} rx={10} fill={pants} /><ellipse cx={44} cy={187} rx={15} ry={8} fill={C.ink} /></g>
      <g className={walk ? 'legB' : undefined} style={{ transformOrigin: '74px 136px' }}><rect x={64} y={132} width={20} height={52} rx={10} fill={pants} /><ellipse cx={76} cy={187} rx={15} ry={8} fill={C.ink} /></g>
      {/* arms */}
      {arms === 'down' && <><path d="M34 96 L18 134" stroke={she} strokeWidth={15} fill="none" /><circle cx={17} cy={138} r={9} fill={sk} /><path d="M86 96 L102 134" stroke={she} strokeWidth={15} fill="none" /><circle cx={103} cy={138} r={9} fill={sk} /></>}
      {arms === 'up' && <>
        <g className="sway" style={{ transformOrigin: '34px 96px', ['--ang' as string]: '14deg', ['--d' as string]: '.5s' } as CSSProperties}><path d="M34 96 L14 56" stroke={she} strokeWidth={15} fill="none" /><circle cx={13} cy={50} r={9} fill={sk} /></g>
        <g className="sway" style={{ transformOrigin: '86px 96px', ['--ang' as string]: '14deg', ['--d' as string]: '.5s', ['--dl' as string]: '.2s' } as CSSProperties}><path d="M86 96 L106 56" stroke={she} strokeWidth={15} fill="none" /><circle cx={107} cy={50} r={9} fill={sk} /></g></>}
      {arms === 'wave' && <>
        <path d="M34 96 L18 134" stroke={she} strokeWidth={15} fill="none" /><circle cx={17} cy={138} r={9} fill={sk} />
        <g className="sway" style={{ transformOrigin: '86px 96px', ['--ang' as string]: '16deg', ['--d' as string]: '.6s' } as CSSProperties}><path d="M86 96 L106 56" stroke={she} strokeWidth={15} fill="none" /><circle cx={107} cy={50} r={9} fill={sk} /></g></>}
      {/* body */}
      <rect x={28} y={76} width={64} height={72} rx={30} fill={sh} />
      <g clipPath={`url(#pb${u})`}><ellipse cx={42} cy={86} rx={14} ry={8} fill="#fff" opacity={0.35} /></g>
      {/* head */}
      <circle cx={60} cy={48} r={34} fill={sk} />
      <path d="M32 40 A30 30 0 0 1 60 14" stroke="#fff" strokeWidth={6} opacity={0.3} fill="none" />
      {/* hair */}
      {hs === 0 && <path d="M26 46 A34 34 0 0 1 94 46 Q78 26 60 30 Q42 26 26 46Z" fill={hr} />}
      {hs === 1 && <><path d="M26 48 A34 34 0 0 1 94 48 Q80 34 60 38 Q40 34 26 48Z" fill={hr} /><circle cx={60} cy={10} r={13} fill={hr} /></>}
      {hs === 2 && <path d="M25 52 A35 35 0 0 1 95 52 Q94 30 78 28 Q60 20 42 28 Q26 32 25 52Z" fill={hr} />}
      {hs === 3 && <><path d="M24 50 A36 36 0 0 1 96 50 Q96 30 78 24 Q60 18 42 24 Q24 30 24 50Z" fill={hr} /><path d="M22 52 Q16 78 30 84 Q30 62 34 50Z" fill={hr} /><path d="M98 52 Q104 78 90 84 Q90 62 86 50Z" fill={hr} /></>}
      {hat && <><ellipse cx={60} cy={22} rx={36} ry={9} fill={C.badEdge} /><path d="M34 22 Q34 -4 60 -4 Q86 -4 86 22Z" fill={C.bad} /></>}
      <Face mood={mood} />
    </Svg>
  );
}

// ---------- decorations ----------
const BUNT = [C.bad, C.sun, C.blue, C.good, C.pink, C.orange, C.purple];
/** String of triangle flags along a gentle curve. Width w, sag s. */
export function Bunting({ w = 1000, sag = 60, n = 9, style, seed = 0 }: { w?: number; sag?: number; n?: number; style?: CSSProperties; seed?: number }) {
  const pts = Array.from({ length: n }, (_, i) => { const t = (i + 0.5) / n; return { x: t * w, y: sag * 4 * t * (1 - t) + 6 }; });
  return (
    <svg width={w} height={sag + 120} viewBox={`0 0 ${w} ${sag + 120}`} style={{ overflow: 'visible', display: 'block', ...style }} strokeLinecap="round" strokeLinejoin="round">
      <path d={`M0 6 Q${w / 2} ${sag * 2 + 6} ${w} 6`} stroke={C.ink} strokeWidth={5} fill="none" />
      {pts.map((p, i) => (
        <g key={i} className="sway" style={{ transformOrigin: `${p.x}px ${p.y}px`, ['--ang' as string]: '6deg', ['--d' as string]: `${2.2 + (i % 3) * 0.4}s`, ['--dl' as string]: `${-i * 0.3}s` } as CSSProperties}>
          <path d={`M${p.x - 34} ${p.y} L${p.x + 34} ${p.y} L${p.x} ${p.y + 84}Z`} fill={BUNT[(i + seed) % BUNT.length]} stroke="#fff" strokeWidth={6} />
          <path d={`M${p.x - 24} ${p.y + 8} L${p.x - 4} ${p.y + 8} L${p.x - 14} ${p.y + 30}Z`} fill="#fff" opacity={0.4} />
        </g>
      ))}
    </svg>
  );
}

/** Burst of confetti bits from a point; loops. */
export function Burst({ n = 14, r = 260, colors = [C.bad, C.sun, C.blue, C.good, C.pink, C.orange], d = 1.8, x = 0, y = 0, delay = 0, up = false }: { n?: number; r?: number; colors?: string[]; d?: number; x?: number; y?: number; delay?: number; up?: boolean }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + (i % 2) * 0.2, rr = r * (0.55 + ((i * 37) % 10) / 22);
        const tx = Math.cos(a) * rr, ty = (up ? -Math.abs(Math.sin(a)) : Math.sin(a)) * rr;
        const shape = i % 3;
        return (
          <div key={i} className="burst" style={{ position: 'absolute', left: -9, top: -9, width: 18 + (i % 3) * 5, height: shape === 1 ? 18 : 12 + (i % 3) * 4, background: colors[i % colors.length], borderRadius: shape === 0 ? 4 : 999, ['--tx' as string]: `${tx}px`, ['--ty' as string]: `${ty}px`, ['--rot' as string]: `${(i * 97) % 360}deg`, ['--d' as string]: `${d}s`, ['--dl' as string]: `${delay + (i % 4) * 0.05}s` } as CSSProperties} />
        );
      })}
    </div>
  );
}

/** A music note (flat). */
export function Note({ s = 60, color = C.rv, style, className }: { s?: number; color?: string; style?: CSSProperties; className?: string }) {
  return (
    <Svg vw={60} vh={80} w={s} style={style} className={className}>
      <path d="M38 8 V54" stroke={color} strokeWidth={9} fill="none" />
      <path d="M38 8 Q52 14 50 32" stroke={color} strokeWidth={9} fill="none" />
      <ellipse cx={26} cy={58} rx={16} ry={12} fill={color} transform="rotate(-20 26 58)" />
    </Svg>
  );
}

/** A little puff of steam / smoke: flat circle that rises and fades. */
export function Puff({ s = 70, color = '#fff', d = 2, dl = 0, dy = -240, dx = 0 }: { s?: number; color?: string; d?: number; dl?: number; dy?: number; dx?: number }) {
  return <div className="rise" style={{ position: 'absolute', left: -s / 2, top: -s / 2, width: s, height: s, borderRadius: '50%', background: color, ['--d' as string]: `${d}s`, ['--dl' as string]: `${dl}s`, ['--dy' as string]: `${dy}px`, ['--dxr' as string]: `${dx}px`, ['--s2' as string]: 1.8 } as CSSProperties} />;
}

/** Bold round text used rarely inside art (>= 44 px). */
export function Label({ children, size = 56, color = C.ink, style }: { children: ReactNode; size?: number; color?: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: Math.max(44, size), lineHeight: 1, color, whiteSpace: 'nowrap', ...style }}>{children}</div>;
}

/** Rocket sticker icon, used by recipe strip and finale gags. */
export function RocketIcon({ s = 120 }: { s?: number }) {
  return (
    <Svg vw={100} vh={100} w={s}>
      <g transform="rotate(35 50 50)">
        <g fill="#fff" stroke="#fff" strokeWidth={10}><path d="M50 6 Q74 30 70 66 H30 Q26 30 50 6Z" /><path d="M30 50 L12 74 L32 70Z" /><path d="M70 50 L88 74 L68 70Z" /></g>
        <path d="M50 74 Q40 92 50 98 Q60 92 50 74Z" fill={C.orange} />
        <path d="M30 50 L12 74 L32 70Z" fill={C.bad} /><path d="M70 50 L88 74 L68 70Z" fill={C.badEdge} />
        <path d="M50 6 Q74 30 70 66 H30 Q26 30 50 6Z" fill="#fff" stroke={C.steel} strokeWidth={4} />
        <path d="M50 6 Q62 18 66 36 H34 Q38 18 50 6Z" fill={C.bad} />
        <circle cx={50} cy={50} r={10} fill={C.blue} stroke={C.blueEdge} strokeWidth={4} />
        <path d="M34 24 Q40 14 46 10" stroke="#fff" strokeWidth={5} fill="none" opacity={0.8} />
      </g>
    </Svg>
  );
}

/** Own SVG icons for the five recipe steps (+ trophy as step 6 is drawn in showday). */
function StepIcon({ k, s = 76 }: { k: number; s?: number }) {
  const common = { vw: 100, vh: 100, w: s } as const;
  if (k === 0) return (<Svg {...common}><circle cx={44} cy={44} r={26} fill={C.blueHi} stroke={C.ink} strokeWidth={9} /><path d="M64 64 L86 86" stroke={C.ink} strokeWidth={13} /><path d="M32 34 A16 16 0 0 1 44 28" stroke="#fff" strokeWidth={6} fill="none" /></Svg>);
  if (k === 1) return (<Svg {...common}><path d="M22 84 L58 48" stroke={C.wood} strokeWidth={16} /><rect x={42} y={14} width={44} height={28} rx={8} fill={C.steel} stroke={C.steelEdge} strokeWidth={5} transform="rotate(40 64 28)" /></Svg>);
  if (k === 2) return (<Svg {...common}><path d="M20 40 L66 22 V78 L20 60Z" fill={C.bad} stroke={C.badEdge} strokeWidth={6} /><rect x={12} y={38} width={16} height={24} rx={6} fill={C.sun} stroke={C.sunEdge} strokeWidth={4} /><path d="M76 34 Q88 50 76 66" stroke={C.ink} strokeWidth={7} fill="none" /></Svg>);
  if (k === 3) return <Coin s={s} />;
  return <RocketIcon s={s} />;
}
/** Bottom strip showing the 5 steps, with step `active` (1..5) highlighted. */
export function RecipeStrip({ active, y = 880 }: { active: number; y?: number }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', gap: 30 }}>
      {[0, 1, 2, 3, 4].map(i => {
        const on = i + 1 === active, done = i + 1 < active;
        return (
          <div key={i} className={on ? 'pulse' : undefined} style={{ ['--s' as string]: 1.1, ['--d' as string]: '1.2s', width: 130, height: 130, borderRadius: '50%', background: on ? C.sun : done ? C.goodHi : '#fff', border: '6px solid #fff', boxShadow: 'var(--sh-sm)', display: 'grid', placeItems: 'center', opacity: on || done ? 1 : 0.8 } as CSSProperties}>
            <StepIcon k={i} s={on ? 84 : 70} />
          </div>
        );
      })}
    </div>
  );
}
