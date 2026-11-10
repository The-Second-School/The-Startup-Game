// Scenes artist B: theatre pieces shared by the mic intro and Show Day (curtains, spotlight beams, trophy, pedestal).
import type { CSSProperties } from 'react';
import { C, Svg, starPts, useUid } from './core';

type Sx = { style?: CSSProperties; className?: string };

/** Side curtain, 560 x 1080 natural; `side` picks which edge it hangs from. */
export function Curtain({ w = 560, side = 'left', color = C.bad, edge = C.badEdge, hi = C.badHi, style, className }: Sx & { w?: number; side?: 'left' | 'right'; color?: string; edge?: string; hi?: string }) {
  const u = useUid();
  const d = 'M0 0 H560 Q566 260 470 520 Q392 780 452 1080 H0Z';
  return (
    <Svg vw={560} vh={1080} w={w} style={{ transform: side === 'right' ? 'scaleX(-1)' : undefined, ...style }} className={className}>
      <defs><clipPath id={`cu${u}`}><path d={d} /></clipPath></defs>
      <path d={d} fill={color} />
      <g clipPath={`url(#cu${u})`}>
        {[70, 190, 310, 430].map((x, i) => (
          <path key={i} d={`M${x} -10 Q${x + 26} 400 ${x - 10} 1100 L${x + 62} 1100 Q${x + 92} 400 ${x + 52} -10Z`} fill={edge} />
        ))}
        {[34, 154, 274, 394].map((x, i) => (
          <path key={i} d={`M${x} -10 Q${x + 22} 400 ${x - 12} 1100 L${x + 12} 1100 Q${x + 40} 400 ${x + 16} -10Z`} fill={hi} opacity={0.55} />
        ))}
        <path d="M0 1040 Q140 1070 280 1040 T560 1050 V1100 H0Z" fill={edge} />
      </g>
      <path d={d} fill="none" stroke="#fff" strokeWidth={10} opacity={0.0} />
      {/* tie-back */}
      <g transform="translate(420 600)">
        <path d="M-120 -16 Q-40 8 40 -16 L44 20 Q-40 44 -124 20Z" fill="#fff" stroke="#fff" strokeWidth={6} />
        <path d="M-120 -22 Q-40 2 40 -22 L44 8 Q-40 32 -124 8Z" fill={C.sun} />
        <circle cx={60} cy={4} r={20} fill={C.sun} stroke="#fff" strokeWidth={6} paintOrder="stroke" />
        <path d="M44 22 L36 90 M60 24 V96 M76 22 L84 90" stroke={C.sunEdge} strokeWidth={9} fill="none" />
      </g>
    </Svg>
  );
}

/** Top valance with scallops and gold trim. */
export function Valance({ w = 1920, color = C.bad, edge = C.badEdge, style }: { w?: number; color?: string; edge?: string; style?: CSSProperties }) {
  const n = Math.round(w / 160);
  const cw = w / n;
  return (
    <svg width={w} height={190} viewBox={`0 0 ${w} 190`} style={{ display: 'block', overflow: 'visible', ...style }} strokeLinejoin="round" strokeLinecap="round">
      <rect x={0} y={0} width={w} height={120} fill={edge} />
      {Array.from({ length: n }, (_, i) => <path key={i} d={`M${i * cw} 100 H${(i + 1) * cw} V120 A${cw / 2} ${cw * 0.42} 0 0 1 ${i * cw} 120Z`} fill={i % 2 ? color : edge} />)}
      {Array.from({ length: n }, (_, i) => <ellipse key={`b${i}`} cx={i * cw + cw / 2} cy={118} rx={cw / 2} ry={cw * 0.42} fill={i % 2 ? color : C.badEdge} />)}
      <rect x={0} y={0} width={w} height={96} fill={color} />
      {Array.from({ length: n }, (_, i) => <path key={`f${i}`} d={`M${i * cw + 20} 0 Q${i * cw + cw / 2} 70 ${(i + 1) * cw - 20} 0Z`} fill={edge} opacity={0.5} />)}
      <rect x={0} y={74} width={w} height={22} fill={C.sun} />
      <rect x={0} y={76} width={w} height={6} fill={C.sunHi} />
    </svg>
  );
}

/** A spotlight beam: lamp at the top, flat translucent cone below. Beam width at the bottom = spread. */
export function Beam({ len = 900, spread = 420, color = '#FFF6B8', opacity = 0.55, style, className }: { len?: number; spread?: number; color?: string; opacity?: number; style?: CSSProperties; className?: string }) {
  const w = spread + 80;
  return (
    <svg width={w} height={len + 60} viewBox={`0 0 ${w} ${len + 60}`} className={className} style={{ overflow: 'visible', display: 'block', ...style }} strokeLinejoin="round" strokeLinecap="round">
      <path d={`M${w / 2 - 30} 40 L${w / 2 + 30} 40 L${w} ${len + 40} Q${w / 2} ${len + 80} 0 ${len + 40}Z`} fill={color} opacity={opacity} />
      <path d={`M${w / 2 - 14} 40 L${w / 2 + 14} 40 L${w * 0.72} ${len} Q${w / 2} ${len + 20} ${w * 0.28} ${len}Z`} fill="#fff" opacity={opacity * 0.5} />
      <rect x={w / 2 - 44} y={-4} width={88} height={22} rx={11} fill={C.ink} />
      <path d={`M${w / 2 - 50} 14 H${w / 2 + 50} L${w / 2 + 62} 52 H${w / 2 - 62}Z`} fill={C.steelEdge} stroke="#fff" strokeWidth={6} paintOrder="stroke" />
      <path d={`M${w / 2 - 40} 20 H${w / 2 + 10} L${w / 2 + 16} 36 H${w / 2 - 48}Z`} fill={C.steel} />
      <ellipse cx={w / 2} cy={52} rx={50} ry={10} fill={C.sunHi} />
    </svg>
  );
}

export function Trophy({ s = 320, style, className }: Sx & { s?: number }) {
  const u = useUid();
  const cup = 'M40 40 H200 Q204 130 160 170 Q140 186 132 206 H108 Q100 186 80 170 Q36 130 40 40Z';
  return (
    <Svg vw={240} vh={360} w={s} style={style} className={className}>
      <defs><clipPath id={`tr${u}`}><path d={cup} /></clipPath></defs>
      <g fill="none" stroke="#fff" strokeWidth={34}><path d="M44 60 Q-6 56 8 100 Q22 140 70 140" /><path d="M196 60 Q246 56 232 100 Q218 140 170 140" /></g>
      <g fill="#fff" stroke="#fff" strokeWidth={14}><path d={cup} /><rect x={104} y={196} width={32} height={74} rx={12} /><rect x={50} y={266} width={140} height={62} rx={20} /></g>
      <g fill="none" strokeWidth={20}><path d="M44 60 Q-6 56 8 100 Q22 140 70 140" stroke={C.coinEdge} /><path d="M196 60 Q246 56 232 100 Q218 140 170 140" stroke={C.coinEdge} /></g>
      <g fill="none" strokeWidth={14}><path d="M44 56 Q2 52 14 92 Q26 130 68 134" stroke={C.coin} /><path d="M196 56 Q238 52 226 92 Q214 130 172 134" stroke={C.coin} /></g>
      <rect x={104} y={196} width={32} height={74} rx={12} fill={C.coin} />
      <rect x={50} y={262} width={140} height={62} rx={20} fill={C.coin} />
      <rect x={66} y={266} width={60} height={12} rx={6} fill={C.coinHi} />
      <path d={cup} fill={C.coin} />
      <g clipPath={`url(#tr${u})`}>
        <ellipse cx={196} cy={150} rx={44} ry={150} fill={C.coinEdge} opacity={0.55} />
        <ellipse cx={74} cy={74} rx={14} ry={46} fill={C.coinHi} transform="rotate(8 74 74)" />
        <rect className="glint" x={-50} y={20} width={34} height={240} fill="#fff" opacity={0.8} transform="rotate(20 120 120)" />
      </g>
      <polygon points={starPts(120, 96, 38, 18)} fill="#fff" stroke="#fff" strokeWidth={8} />
      <polygon points={starPts(120, 96, 28, 13)} fill={C.sunHi} stroke={C.sunHi} strokeWidth={6} />
    </Svg>
  );
}

export function Pedestal({ w = 420, h = 300, style }: { w?: number; h?: number; style?: CSSProperties }) {
  return (
    <svg width={w} height={h} viewBox="0 0 420 300" style={{ overflow: 'visible', display: 'block', ...style }} strokeLinejoin="round" strokeLinecap="round">
      <rect x={10} y={150} width={400} height={150} rx={30} fill="#fff" stroke="#fff" strokeWidth={10} />
      <rect x={50} y={6} width={320} height={156} rx={30} fill="#fff" stroke="#fff" strokeWidth={10} />
      <rect x={10} y={150} width={400} height={150} rx={30} fill={C.cream} />
      <rect x={50} y={6} width={320} height={156} rx={30} fill={C.cream} />
      <rect x={72} y={22} width={110} height={14} rx={7} fill="#fff" />
      <rect x={34} y={166} width={90} height={14} rx={7} fill="#fff" />
      <polygon points={starPts(210, 222, 30, 14)} fill={C.sun} stroke={C.sun} strokeWidth={8} />
      <polygon points={starPts(210, 76, 26, 12)} fill={C.sunHi} stroke={C.sunHi} strokeWidth={6} />
    </svg>
  );
}
