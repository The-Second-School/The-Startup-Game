// Skies, sun, clouds, stars, lightning. All flat bands, no gradients.
import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties } from 'react';
import { SKIES, type SkyTone } from './palette';
import { Ball, CloudShape, starPath, rng } from './shapes';
import { full } from './motion';

/** Flat banded sky that crossfades when `tone` changes. Fills the stage. */
export function Sky({ tone = 'sunrise', horizon = 760 }: { tone?: SkyTone; horizon?: number }) {
  return (
    <div style={full}>
      <AnimatePresence initial={false}>
        <motion.svg key={tone} width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}>
          {SKIES[tone].bands.map((c, i) => {
            const y = (horizon / SKIES[tone].bands.length) * i;
            return <rect key={i} x={-400} y={i === 0 ? -400 : y} width={2720} height={1080 + (i === 0 ? 800 : 400) - (i === 0 ? 0 : y)} fill={c} rx={i === 0 ? 0 : 0} />;
          })}
          {/* soft rounded band edges so it is not a flat stripe chart */}
          {SKIES[tone].bands.slice(1).map((c, i) => {
            const y = (horizon / SKIES[tone].bands.length) * (i + 1);
            return <g key={`w${i}`} fill={c}>{Array.from({ length: 13 }, (_, k) => <ellipse key={k} cx={k * 240 - 360 + (i % 2) * 120} cy={y} rx={170} ry={22} />)}</g>;
          })}
        </motion.svg>
      </AnimatePresence>
    </div>
  );
}

/** Sun with halo rings and slowly turning rays. (x, y) = centre in stage px. */
export function Sun({ x = 1500, y = 300, r = 110, rays = true, style }: { x?: number; y?: number; r?: number; rays?: boolean; style?: CSSProperties }) {
  const S = r * 3.2;
  return (
    <div style={{ position: 'absolute', left: x - S, top: y - S, width: S * 2, height: S * 2, pointerEvents: 'none', ...style }}>
      <svg width={S * 2} height={S * 2} viewBox={`${-S} ${-S} ${S * 2} ${S * 2}`} style={{ overflow: 'visible' }}>
        <circle r={r * 2.3} fill="#FFFFFF" opacity={0.22} />
        <circle r={r * 1.65} fill="#FFFFFF" opacity={0.28} />
        {rays && (
          <g className="k-rays" style={{ ['--dur' as string]: '40s' }}>
            {Array.from({ length: 12 }, (_, i) => (
              <path key={i} d={`M${-r * 0.18} ${-r * 1.25} L0 ${-r * 2.05} L${r * 0.18} ${-r * 1.25}Z`} fill="#FFE680" transform={`rotate(${i * 30})`} strokeLinejoin="round" stroke="#FFE680" strokeWidth={14} />
            ))}
          </g>
        )}
        <Ball cx={0} cy={0} r={r} hue={{ hi: '#FFF1A8', base: '#FFD21A', edge: '#F5B400' }} />
      </svg>
    </div>
  );
}

type CloudsProps = { seed?: number; count?: number; yMin?: number; yMax?: number; minW?: number; maxW?: number; speed?: number; fill?: string; edge?: string; opacity?: number };
/** Clouds drifting left-to-right forever across the stage (CSS loops, negative delays so they are spread out). */
export function Clouds({ seed = 3, count = 6, yMin = 120, yMax = 460, minW = 200, maxW = 380, speed = 1, fill = '#FFFFFF', edge = '#FFD9A8', opacity = 1 }: CloudsProps) {
  const r = rng(seed);
  const list = Array.from({ length: count }, (_, i) => {
    const w = minW + r() * (maxW - minW);
    const dur = (70 + r() * 50) / speed;
    return { i, w, y: yMin + r() * (yMax - yMin), dur, delay: -((i + r() * 0.7) / count) * dur };
  });
  return (
    <div style={{ ...full, pointerEvents: 'none', opacity }}>
      {list.map(c => (
        <div key={c.i} className="k-fly" style={{ position: 'absolute', left: 0, top: c.y, ['--from' as string]: `${-c.w - 40}px`, ['--to' as string]: '1960px', ['--dur' as string]: `${c.dur}s`, ['--delay' as string]: `${c.delay}s` } as CSSProperties}>
          <svg width={c.w} height={c.w * 0.45} viewBox={`0 0 ${c.w} ${c.w * 0.45}`} style={{ overflow: 'visible' }}>
            <CloudShape x={0} y={0} w={c.w} fill={fill} edge={edge} />
          </svg>
        </div>
      ))}
    </div>
  );
}

/** Twinkling little stars (for night / storm / stage). */
export function Stars({ seed = 9, count = 26, yMax = 500, color = '#FFE680' }: { seed?: number; count?: number; yMax?: number; color?: string }) {
  const r = rng(seed);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: count }, (_, i) => {
        const x = r() * 2400 - 240, y = 40 + r() * yMax, s = 8 + r() * 12;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path className="k-twinkle" d={starPath(s, s * 0.45, 4)} fill={color} style={{ ['--dur' as string]: `${1.6 + r() * 2}s`, ['--delay' as string]: `${-r() * 3}s` }} />
          </g>
        );
      })}
    </svg>
  );
}

/** A zig-zag cartoon lightning bolt, scaled to height h, flashing on a loop. */
export function Lightning({ x, y, h = 380, delay = 0, dur = 3.2 }: { x: number; y: number; h?: number; delay?: number; dur?: number }) {
  const s = h / 380;
  return (
    <svg width={200 * s} height={h} viewBox="0 0 200 380" style={{ position: 'absolute', left: x, top: y, overflow: 'visible', pointerEvents: 'none' }}>
      <g className="k-flash" style={{ ['--dur' as string]: `${dur}s`, ['--delay' as string]: `${delay}s` }}>
        <path d="M120 0 L40 170 L100 170 L50 380 L170 140 L105 140 L160 0Z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={22} strokeLinejoin="round" />
        <path d="M120 0 L40 170 L100 170 L50 380 L170 140 L105 140 L160 0Z" fill="#FFE34D" stroke="#FFE34D" strokeWidth={6} strokeLinejoin="round" />
      </g>
    </svg>
  );
}
