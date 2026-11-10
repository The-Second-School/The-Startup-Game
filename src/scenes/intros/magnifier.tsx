// Intro: a giant magnifying glass hunts through the Techistan market and turns question marks into light bulbs.
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect, type CSSProperties } from 'react';
import { C, Dots, Root, Svg, Star, Sparkle, Abs } from '../artb/core';
import { Magnifier } from '../artb/props';

const MARKS: { x: number; y: number; s: number; c: string; e: string; d: number }[] = [
  { x: 250, y: 600, s: 120, c: C.blue, e: C.blueEdge, d: 0 }, { x: 470, y: 760, s: 100, c: C.pink, e: C.pinkEdge, d: 0.4 },
  { x: 800, y: 450, s: 110, c: C.orange, e: C.orangeEdge, d: 0.8 }, { x: 880, y: 800, s: 130, c: C.purple, e: C.purpleEdge, d: 0.2 },
  { x: 1180, y: 470, s: 100, c: C.blue, e: C.blueEdge, d: 0.6 }, { x: 1330, y: 660, s: 140, c: C.pink, e: C.pinkEdge, d: 0.1 },
  { x: 1560, y: 470, s: 110, c: C.good, e: C.goodEdge, d: 0.9 }, { x: 1520, y: 840, s: 120, c: C.orange, e: C.orangeEdge, d: 0.5 },
  { x: 120, y: 880, s: 100, c: C.purple, e: C.purpleEdge, d: 0.3 }, { x: 1750, y: 620, s: 110, c: C.blue, e: C.blueEdge, d: 0.7 },
  { x: 560, y: 460, s: 90, c: C.good, e: C.goodEdge, d: 1 }, { x: 1040, y: 560, s: 90, c: C.pink, e: C.pinkEdge, d: 0.35 },
];

function QMark({ s, c }: { s: number; c: string; e: string }) {
  return (
    <Svg vw={100} vh={130} w={s}>
      <g fill="none"><path d="M26 40 Q26 12 50 12 Q76 12 76 38 Q76 56 54 66 Q46 72 46 86" stroke="#fff" strokeWidth={34} /><circle cx={46} cy={112} r={14} fill="#fff" stroke="#fff" strokeWidth={10} />
        <path d="M26 40 Q26 12 50 12 Q76 12 76 38 Q76 56 54 66 Q46 72 46 86" stroke={c} strokeWidth={20} /></g>
      <circle cx={46} cy={112} r={13} fill={c} />
    </Svg>
  );
}
function Bulb({ s, c }: { s: number; c: string }) {
  return (
    <Svg vw={100} vh={130} w={s}>
      <g stroke="#fff" strokeWidth={10} fill="#fff"><circle cx={50} cy={52} r={36} /><rect x={32} y={80} width={36} height={34} rx={12} /></g>
      <rect x={32} y={80} width={36} height={34} rx={12} fill={C.steel} />
      <path d="M34 94 H66 M36 104 H64" stroke={C.steelEdge} strokeWidth={5} fill="none" />
      <circle cx={50} cy={50} r={36} fill={C.sun} />
      <path d="M26 40 A26 26 0 0 1 42 24" stroke={C.sunHi} strokeWidth={9} fill="none" />
      <path d="M40 66 L46 50 L54 62 L60 46" stroke={c} strokeWidth={5} fill="none" />
    </Svg>
  );
}

function Stall({ color, x, y }: { color: string; edge: string; x: number; y: number }) {
  return (
    <Abs x={x} y={y}>
      <Svg vw={300} vh={260} w={300}>
        <rect x={34} y={96} width={14} height={150} rx={7} fill={C.woodEdge} /><rect x={252} y={96} width={14} height={150} rx={7} fill={C.woodEdge} />
        <rect x={20} y={168} width={260} height={80} rx={16} fill={C.wood} />
        <rect x={34} y={180} width={90} height={12} rx={6} fill={C.woodHi} />
        <circle cx={80} cy={160} r={18} fill={C.bad} /><circle cx={118} cy={162} r={16} fill={C.orange} /><circle cx={160} cy={158} r={18} fill={C.good} /><circle cx={202} cy={162} r={16} fill={C.sun} />
        {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${i * 56 + 8} 30 H${i * 56 + 64} V86 A28 28 0 0 1 ${i * 56 + 8} 86Z`} fill={i % 2 ? '#fff' : color} />)}
        <rect x={0} y={0} width={300} height={34} rx={17} fill={color} />
        <rect x={20} y={7} width={120} height={9} rx={4.5} fill="#fff" opacity={0.4} />
      </Svg>
    </Abs>
  );
}

function World({ found }: { found: boolean }) {
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, background: C.bg }}>
      <Dots y={260} h={460} color={C.bg2} />
      <div style={{ position: 'absolute', left: 0, top: 700, width: 1920, height: 380, background: C.road }} />
      <div style={{ position: 'absolute', left: 0, top: 700, width: 1920, height: 22, background: C.road2 }} />
      {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ position: 'absolute', left: 80 + i * 390, top: 900, width: 150, height: 18, borderRadius: 9, background: C.road2 }} />)}
      {[[40, C.bad, C.badEdge], [430, C.blue, C.blueEdge], [820, C.good, C.goodEdge], [1210, C.pink, C.pinkEdge], [1600, C.orange, C.orangeEdge]].map(([x, c, e], i) =>
        <Stall key={i} x={x as number} y={470} color={c as string} edge={e as string} />)}
      {MARKS.map((m, i) => (
        <Abs key={i} x={m.x - m.s / 2} y={m.y - m.s * 0.65} style={{ ['--amp' as string]: '14px', ['--d' as string]: `${2.6 + (i % 3) * 0.4}s`, ['--dl' as string]: `${-m.d * 2}s` } as CSSProperties} className="bob">
          {found ? <Bulb s={m.s} c={m.e} /> : <QMark s={m.s} c={m.c} e={m.e} />}
        </Abs>
      ))}
    </div>
  );
}

const M = 1.8, R = 118, ORG = 182; // magnification, lens radius, lens centre inside the 420px glass svg
export default function MagnifierIntro() {
  const cx = useMotionValue(-300), cy = useMotionValue(760);
  useEffect(() => {
    const times = [0, 0.19, 0.3, 0.46, 0.58, 0.74, 0.84, 1];
    const a = animate(cx, [-300, 420, 420, 880, 880, 1340, 1340, 2300], { duration: 9, times, ease: 'easeInOut', repeat: Infinity });
    const b = animate(cy, [760, 690, 690, 860, 860, 620, 620, 760], { duration: 9, times, ease: 'easeInOut', repeat: Infinity });
    return () => { a.stop(); b.stop(); };
  }, [cx, cy]);
  const gx = useTransform(cx, v => v - ORG), gy = useTransform(cy, v => v - ORG);
  const ix = useTransform(cx, v => R - M * v), iy = useTransform(cy, v => R - M * v);
  return (
    <Root>
      <World found={false} />
      {/* the lens: magnified world where question marks turn into bulbs */}
      <motion.div style={{ position: 'absolute', left: 0, top: 0, x: useTransform(cx, v => v - R), y: useTransform(cy, v => v - R), width: R * 2, height: R * 2, borderRadius: '50%', overflow: 'hidden', background: C.bg }}>
        <motion.div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, originX: 0, originY: 0, x: ix, y: iy, scale: M }}>
          <World found />
        </motion.div>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.sky, opacity: 0.18 }} />
      </motion.div>
      <motion.div style={{ position: 'absolute', left: 0, top: 0, x: gx, y: gy }}>
        <div className="sway" style={{ ['--ang' as string]: '5deg', ['--d' as string]: '1.8s', transformOrigin: `${ORG}px ${ORG}px` } as CSSProperties}>
          <Magnifier s={420} />
          <Abs x={ORG - 40} y={-40} className="twinkle"><Sparkle s={70} color="#fff" /></Abs>
        </div>
      </motion.div>
      <Abs x={1640} y={420} className="bob" style={{ ['--amp' as string]: '16px' } as CSSProperties}><Star s={90} /></Abs>
      <Abs x={160} y={440} className="bob" style={{ ['--amp' as string]: '12px', ['--dl' as string]: '-1s' } as CSSProperties}><Star s={70} color={C.pink} edge={C.pinkEdge} hi={C.pinkHi} /></Abs>
    </Root>
  );
}
