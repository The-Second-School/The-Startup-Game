// Techistan city pieces: skylines (far silhouette + near colourful), rooftop water tanks, temple, dome,
// bunting, singing streetlights, ground/road, trees. All return SVG <g> unless noted.
import type { CSSProperties } from 'react';
import { HUE, INK, type Hue } from './palette';
import { rng, Ball } from './shapes';

/** Mix a #rrggbb colour toward white by t (0..1): calmer pastel versions of the palette. */
export const tint = (hex: string, t: number) => {
  const n = parseInt(hex.slice(1), 16);
  const m = (v: number) => Math.round(v + (255 - v) * t).toString(16).padStart(2, '0');
  return `#${m((n >> 16) & 255)}${m((n >> 8) & 255)}${m(n & 255)}`;
};
const NEAR_HUES: Hue[] = [HUE.teal, HUE.coral, HUE.blue, HUE.cream, HUE.mint, HUE.pink, HUE.saffron, HUE.purple];
type Kind = 'tank' | 'dome' | 'temple' | 'antenna' | 'tiers' | 'round' | 'dish';

export type Bld = { x: number; w: number; h: number; hue: Hue; kind: Kind; seed: number };

/** Deterministic list of buildings that fill [0, width]. */
export function planSkyline(width: number, seed: number, minH: number, maxH: number, kinds: Kind[]) {
  const r = rng(seed);
  const out: Bld[] = [];
  let x = -40;
  let i = 0;
  while (x < width + 40) {
    const w = 150 + Math.floor(r() * 130);
    const kind = kinds[Math.floor(r() * kinds.length)];
    out.push({ x, w, h: minH + r() * (maxH - minH), hue: NEAR_HUES[(i * 3 + Math.floor(r() * 2)) % NEAR_HUES.length], kind, seed: Math.floor(r() * 1e6) });
    x += w + 8 + Math.floor(r() * 26);
    i++;
  }
  return out;
}

/** Black rooftop water tank (Sintex style) on little legs. (x, y) = bottom-centre. */
export function WaterTank({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-30} y={-14} width={8} height={14} rx={3} fill={HUE.tank.edge} />
      <rect x={22} y={-14} width={8} height={14} rx={3} fill={HUE.tank.edge} />
      <rect x={-38} y={-76} width={76} height={58} rx={16} fill={HUE.tank.base} />
      <rect x={-30} y={-70} width={16} height={44} rx={8} fill={HUE.tank.hi} opacity={0.7} />
      <rect x={-38} y={-52} width={76} height={6} fill={HUE.tank.edge} />
      <rect x={-38} y={-36} width={76} height={6} fill={HUE.tank.edge} />
      <rect x={-14} y={-88} width={28} height={16} rx={7} fill={HUE.tank.base} />
    </g>
  );
}

/** Temple spire (shikhara) with a waving saffron flag. (x, y) = bottom-centre, w = base width. */
export function Temple({ x, y, w = 150 }: { x: number; y: number; w?: number }) {
  const s = w / 150;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-75 0 L-75 -40 Q-75 -60 -55 -60 L55 -60 Q75 -60 75 -40 L75 0Z" fill={HUE.cream.edge} />
      <path d="M-56 -66 C-54 -150 -28 -205 0 -244 C28 -205 54 -150 56 -66Z" fill={HUE.saffron.base} />
      <path d="M-44 -80 C-42 -150 -22 -195 -2 -230 C-14 -180 -24 -140 -24 -80Z" fill={HUE.saffron.hi} opacity={0.8} />
      {[-110, -150, -190].map((yy, i) => <rect key={i} x={-48 + i * 10} y={yy} width={96 - i * 20} height={8} rx={4} fill={HUE.saffron.edge} />)}
      <circle cx={0} cy={-258} r={13} fill={HUE.gold.base} />
      <rect x={-3} y={-330} width={6} height={74} rx={3} fill={HUE.wood.edge} />
      <g transform="translate(3 -328)"><path className="k-flag" d="M0 0 L58 14 L0 30Z" fill={HUE.orange.base} stroke={HUE.orange.base} strokeWidth={6} strokeLinejoin="round" /></g>
      <rect x={-75} y={-60} width={150} height={60} rx={18} fill={HUE.cream.base} />
      <path d="M-20 0 L-20 -30 Q0 -52 20 -30 L20 0Z" fill={HUE.saffron.edge} />
    </g>
  );
}

/** Onion dome on a drum. (x, y) = bottom-centre, w = width. */
export function Dome({ x, y, w = 120, hue = HUE.cream }: { x: number; y: number; w?: number; hue?: Hue }) {
  const s = w / 120;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-50} y={-30} width={100} height={30} rx={8} fill={hue.edge} />
      <path d="M-54 -36 C-64 -90 -18 -108 0 -144 C18 -108 64 -90 54 -36Z" fill={hue.base} />
      <path d="M-40 -44 C-46 -86 -16 -102 -4 -126 C-10 -96 -24 -78 -18 -44Z" fill={hue.hi} />
      <rect x={-3} y={-178} width={6} height={32} rx={3} fill={HUE.gold.edge} />
      <circle cx={0} cy={-180} r={8} fill={HUE.gold.base} />
    </g>
  );
}

function Windows({ b, y0, lit = 0.35 }: { b: Bld; y0: number; lit?: number }) {
  const r = rng(b.seed);
  const cols = Math.max(2, Math.floor((b.w - 40) / 46));
  const rows = Math.max(1, Math.floor((b.h - 70) / 64));
  const gap = (b.w - 40 - cols * 30) / Math.max(1, cols - 1);
  const out = [];
  for (let row = 0; row < rows; row++) for (let c = 0; c < cols; c++) {
    const on = r() < lit;
    const blink = on && r() < 0.1;
    const x = b.x + 20 + c * (30 + gap);
    const y = y0 + 40 + row * 64;
    out.push(
      <g key={`${row}-${c}`}>
        <rect x={x} y={y} width={30} height={40} rx={10} fill={on ? '#FFF1A8' : tint(b.hue.base, 0.72)}
          className={blink ? 'k-blink' : undefined} style={blink ? { ['--dur' as string]: `${3 + r() * 5}s`, ['--delay' as string]: `${-r() * 6}s` } as CSSProperties : undefined} />
        {on && <rect x={x + 5} y={y + 5} width={8} height={14} rx={4} fill="#fff" opacity={0.8} />}
      </g>,
    );
  }
  return <>{out}</>;
}

function Roof({ b, top }: { b: Bld; top: number }) {
  const cx = b.x + b.w / 2;
  switch (b.kind) {
    case 'tank': return <><WaterTank x={b.x + b.w * 0.3} y={top} s={0.9} />{b.w > 210 && <WaterTank x={b.x + b.w * 0.72} y={top} s={0.75} />}</>;
    case 'dome': return <Dome x={cx} y={top} w={Math.min(130, b.w * 0.62)} />;
    case 'temple': return <Temple x={cx} y={top} w={Math.min(140, b.w * 0.7)} />;
    case 'antenna': return (
      <g>
        <rect x={cx - 5} y={top - 120} width={10} height={120} rx={5} fill={HUE.steel.edge} />
        <rect x={cx - 30} y={top - 70} width={60} height={9} rx={4} fill={HUE.steel.edge} />
        <circle cx={cx} cy={top - 126} r={13} fill={HUE.red.base} className="k-blink" style={{ ['--dur' as string]: '1.6s' }} />
      </g>
    );
    case 'dish': return (
      <g>
        <rect x={cx + 10} y={top - 40} width={10} height={40} rx={5} fill={HUE.steel.edge} />
        <g transform={`translate(${cx + 15} ${top - 52}) rotate(-30)`}><path d="M-46 0 A46 30 0 0 0 46 0Z" fill={HUE.steel.base} /><path d="M-46 0 L46 0" stroke={HUE.steel.edge} strokeWidth={8} /></g>
      </g>
    );
    case 'tiers': return (
      <g>
        <rect x={b.x + b.w * 0.18} y={top - 76} width={b.w * 0.64} height={74} rx={16} fill={b.hue.base} />
        <rect x={b.x + b.w * 0.34} y={top - 120} width={b.w * 0.32} height={50} rx={14} fill={b.hue.hi} />
      </g>
    );
    case 'round': return (
      <g>
        <ellipse cx={cx} cy={top - 6} rx={b.w / 2 - 6} ry={b.w * 0.34} fill={b.hue.base} />
        <ellipse cx={cx - b.w * 0.16} cy={top - b.w * 0.16} rx={b.w * 0.14} ry={b.w * 0.08} fill={b.hue.hi} />
        <ellipse cx={cx} cy={top - b.w * 0.36} rx={b.w * 0.62} ry={18} fill="none" stroke="#fff" strokeWidth={10} opacity={0.9} />
      </g>
    );
  }
}

/** Near skyline: colourful buildings with windows and Indian rooftops. baseY = street line. */
export function NearSkyline({ width = 2720, baseY = 820, seed = 11, minH = 260, maxH = 520, lit = 0.35, kinds = ['tank', 'dome', 'temple', 'antenna', 'tiers', 'round', 'dish', 'tank'] as Kind[] }: { width?: number; baseY?: number; seed?: number; minH?: number; maxH?: number; lit?: number; kinds?: Kind[] }) {
  const blds = planSkyline(width, seed, minH, maxH, kinds);
  return (
    <g transform={width === 2720 ? 'translate(-400 0)' : undefined}>
      {blds.map((b, i) => {
        const top = baseY - b.h;
        return (
          <g key={i}>
            <Roof b={b} top={top + 4} />
            <rect x={b.x - 5} y={top - 5} width={b.w + 10} height={b.h + 50} rx={26} fill="#fff" />
            <rect x={b.x} y={top} width={b.w} height={b.h + 40} rx={22} fill={tint(b.hue.base, 0.38)} />
            <rect x={b.x + 12} y={top + 14} width={14} height={b.h - 30} rx={7} fill="#fff" opacity={0.45} />
            <Windows b={b} y0={top} lit={lit} />
          </g>
        );
      })}
    </g>
  );
}

/** Far skyline: one flat silhouette colour with a few pale windows. */
export function FarSkyline({ width = 2720, baseY = 760, seed = 5, color = '#FFC772', win = '#FFE7A8', minH = 200, maxH = 460 }: { width?: number; baseY?: number; seed?: number; color?: string; win?: string; minH?: number; maxH?: number }) {
  const blds = planSkyline(width, seed, minH, maxH, ['tiers', 'round', 'antenna', 'dome', 'tank', 'tiers']);
  const flat: Hue = { hi: color, base: color, edge: color };
  return (
    <g transform={width === 2720 ? 'translate(-400 0)' : undefined}>
      {blds.map((b, i) => {
        const top = baseY - b.h;
        const r = rng(b.seed);
        const fb: Bld = { ...b, hue: flat };
        return (
          <g key={i}>
            {b.kind === 'dome' ? <Dome x={b.x + b.w / 2} y={top + 4} w={b.w * 0.6} hue={flat} /> : b.kind === 'tank' ? (
              <g fill={color}><rect x={b.x + b.w * 0.2} y={top - 64} width={70} height={60} rx={16} /><rect x={b.x + b.w * 0.2 + 22} y={top - 78} width={26} height={16} rx={6} /></g>
            ) : <Roof b={fb} top={top + 4} />}
            <rect x={b.x} y={top} width={b.w} height={b.h + 300} rx={20} fill={color} />
            {Array.from({ length: 5 }, (_, k) => (
              <rect key={k} x={b.x + 20 + r() * (b.w - 60)} y={top + 30 + r() * (b.h - 80)} width={22} height={30} rx={8} fill={win} opacity={0.9} />
            ))}
          </g>
        );
      })}
    </g>
  );
}

/** Sagging string of triangle flags between two points; gently sways. */
export function Bunting({ x1, y1, x2, y2, sag = 70, colors = ['#FF4B4B', '#FFC800', '#58CC02', '#1CB0F6', '#FF6FB5', '#FF9600'], n = 12 }: { x1: number; y1: number; x2: number; y2: number; sag?: number; colors?: string[]; n?: number }) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag * 2;
  const pt = (t: number) => ({ x: (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2, y: (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2 });
  return (
    <g>
      <path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} fill="none" stroke={INK} strokeWidth={5} opacity={0.7} />
      {Array.from({ length: n }, (_, i) => {
        const p = pt((i + 0.5) / n);
        return (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <g className="k-sway k-origin-top" style={{ ['--dur' as string]: `${2 + (i % 3) * 0.4}s`, ['--delay' as string]: `${-i * 0.3}s`, ['--sway-a' as string]: '-8deg', ['--sway-b' as string]: '8deg' } as CSSProperties}>
              <path d="M-20 0 L20 0 L0 40Z" fill="#fff" stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
              <path d="M-20 0 L20 0 L0 40Z" fill={colors[i % colors.length]} stroke={colors[i % colors.length]} strokeWidth={3} strokeLinejoin="round" />
            </g>
          </g>
        );
      })}
    </g>
  );
}

/** Streetlight with a round lamp; `singing` floats music notes out of it. (x, y) = foot. */
export function Streetlight({ x, y, h = 300, singing = false, delay = 0 }: { x: number; y: number; h?: number; singing?: boolean; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-22} y={-24} width={44} height={24} rx={10} fill={HUE.steel.edge} />
      <rect x={-8} y={-h} width={16} height={h} rx={8} fill={HUE.steel.base} />
      <rect x={-8} y={-h} width={6} height={h} rx={3} fill={HUE.steel.hi} />
      <path d={`M0 ${-h + 6} Q0 ${-h - 46} 50 ${-h - 46}`} fill="none" stroke={HUE.steel.base} strokeWidth={14} />
      <g transform={`translate(62 ${-h - 30})`}>
        <circle r={36} fill="#FFF1A8" opacity={0.45} className="k-pulse" style={{ ['--delay' as string]: `${delay}s` }} />
        <path d="M-30 -14 Q0 -40 30 -14 Z" fill={HUE.steel.edge} />
        <circle cy={4} r={20} fill="#FFE680" />
        <circle cx={-6} cy={-2} r={6} fill="#fff" />
        {/* happy lamp face */}
        <circle cx={-6} cy={6} r={3} fill={INK} /><circle cx={7} cy={6} r={3} fill={INK} />
        <path d="M-6 13 Q0 18 6 13" stroke={INK} strokeWidth={3} fill="none" />
        {singing && [0, 1, 2].map(i => (
          <g key={i} transform={`translate(${20 + i * 6} -20)`}>
            <g className="k-note" style={{ ['--delay' as string]: `${delay + i * 0.8}s`, ['--nx' as string]: `${30 + i * 20}px` } as CSSProperties}>
              <path d="M0 0 L0 -30 L18 -36 L18 -6" fill="none" stroke={HUE.raivan.base} strokeWidth={5} />
              <ellipse cx={-5} cy={1} rx={8} ry={6} fill={HUE.raivan.base} /><ellipse cx={13} cy={-5} rx={8} ry={6} fill={HUE.raivan.base} />
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}

/** Pavement + road + kerb across `width`. y = top of the pavement. */
export function Ground({ y = 820, width = 2720, road = true, pave = HUE.cream, roadHue = HUE.road }: { y?: number; width?: number; road?: boolean; pave?: Hue; roadHue?: Hue }) {
  return (
    <g transform={width === 2720 ? 'translate(-400 0)' : undefined}>
      <rect x={-40} y={y} width={width + 80} height={1080 - y + 40} fill={pave.base} />
      <rect x={-40} y={y} width={width + 80} height={14} fill={pave.hi} />
      {Array.from({ length: Math.ceil(width / 120) + 1 }, (_, i) => <rect key={i} x={i * 120 - 4} y={y + 18} width={8} height={70} rx={4} fill={pave.edge} opacity={0.6} />)}
      {road && (
        <>
          <rect x={-40} y={y + 96} width={width + 80} height={18} fill={pave.edge} />
          <rect x={-40} y={y + 110} width={width + 80} height={1080} fill={roadHue.base} />
          {Array.from({ length: Math.ceil(width / 220) + 1 }, (_, i) => <rect key={`l${i}`} x={i * 220 + 30} y={y + 168} width={120} height={14} rx={7} fill="#fff" opacity={0.85} />)}
        </>
      )}
    </g>
  );
}

/** Round bush/tree. (x, y) = bottom-centre. */
export function Bush({ x, y, s = 1, hue = HUE.green }: { x: number; y: number; s?: number; hue?: Hue }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={-34} cy={-40} r={36} fill={hue.base} /><circle cx={30} cy={-42} r={40} fill={hue.base} /><circle cx={0} cy={-68} r={44} fill={hue.base} />
      <circle cx={-14} cy={-84} r={18} fill={hue.hi} opacity={0.8} />
    </g>
  );
}

/** Tree with trunk and round crown. (x, y) = foot. */
export function Tree({ x, y, s = 1, hue = HUE.green }: { x: number; y: number; s?: number; hue?: Hue }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-12} y={-130} width={24} height={130} rx={10} fill={HUE.wood.base} />
      <rect x={2} y={-130} width={10} height={130} rx={5} fill={HUE.wood.edge} />
      <g transform="translate(0 -150)"><g className="k-sway k-origin-bottom" style={{ ['--dur' as string]: '4s' }}>
        <circle cx={0} cy={0} r={86} fill={hue.base} />
        <circle cx={-30} cy={-32} r={34} fill={hue.hi} opacity={0.8} />
        <Ball cx={34} cy={18} r={10} hue={HUE.orange} glint={false} />
        <Ball cx={-40} cy={30} r={10} hue={HUE.orange} glint={false} />
      </g></g>
    </g>
  );
}
