// Intro: rAIvan's bugs crawl over an app screen; a big hammer smashes one with a splat, then they pop back.
import { motion } from 'motion/react';
import { C, Abs, Root, Svg, Dots, Sparkle, Star, cssVars } from '../artb/core';

function Bug({ s = 150, hue = C.rv, edge = C.rvEdge, hi = C.rvHi }: { s?: number; hue?: string; edge?: string; hi?: string }) {
  return (
    <Svg vw={140} vh={120} w={s}>
      <g stroke="#fff" strokeWidth={16} fill="none">{[34, 60, 86].map(y => <g key={y}><path d={`M44 ${y} L12 ${y - 14}`} /><path d={`M96 ${y} L128 ${y - 14}`} /></g>)}</g>
      <g stroke={C.ink} strokeWidth={7} fill="none">
        {[34, 60, 86].map((y, i) => <g key={y} className={i % 2 ? 'legA' : 'legB'} style={{ transformOrigin: '70px 60px', ['--wd' as string]: '.3s' } as React.CSSProperties}><path d={`M44 ${y} L12 ${y - 14}`} /><path d={`M96 ${y} L128 ${y - 14}`} /></g>)}
      </g>
      <path d="M58 28 Q50 8 34 6 M82 28 Q90 8 106 6" stroke="#fff" strokeWidth={14} fill="none" /><path d="M58 28 Q50 8 34 6 M82 28 Q90 8 106 6" stroke={C.ink} strokeWidth={6} fill="none" />
      <ellipse cx={70} cy={66} rx={44} ry={46} fill="#fff" stroke="#fff" strokeWidth={10} />
      <ellipse cx={70} cy={66} rx={44} ry={46} fill={hue} />
      <path d="M70 26 V108" stroke={edge} strokeWidth={5} /><circle cx={46} cy={78} r={8} fill={hi} /><circle cx={94} cy={82} r={8} fill={hi} />
      <circle cx={54} cy={46} r={12} fill="#fff" /><circle cx={86} cy={46} r={12} fill="#fff" />
      <circle cx={56} cy={48} r={6} fill={C.ink} /><circle cx={84} cy={48} r={6} fill={C.ink} />
      <path d="M54 62 Q70 54 86 62" stroke={C.ink} strokeWidth={4} fill="none" />
    </Svg>
  );
}

const BUGS = [
  { x: 640, y: 560, dx: 120, d: 2.1, s: 150 }, { x: 900, y: 700, dx: -160, d: 2.7, s: 130 }, { x: 1120, y: 520, dx: 100, d: 1.9, s: 140 },
  { x: 760, y: 440, dx: 140, d: 2.4, s: 120 }, { x: 1020, y: 780, dx: -120, d: 2.2, s: 150 },
];
const LOOP = 2.6;

export default function BugsIntro() {
  return (
    <Root>
      <Dots y={280} h={520} color={C.bg2} />
      {/* app screen */}
      <Abs x={500} y={330}>
        <div style={{ width: 920, height: 600, borderRadius: 56, background: '#fff', border: '8px solid #fff', boxShadow: 'var(--sh-sm)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: C.blueHi }} />
          <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 84, background: C.blue }} />
          {[0, 1, 2].map(i => <div key={i} style={{ position: 'absolute', left: 36 + i * 54, top: 28, width: 28, height: 28, borderRadius: 14, background: ['#fff', C.sun, C.good][i] }} />)}
          {[0, 1, 2].map(i => <div key={i} style={{ position: 'absolute', left: 60 + i * 290, top: 130, width: 250, height: 190, borderRadius: 30, background: '#fff' }}><div style={{ margin: 22, height: 84, borderRadius: 22, background: [C.pink, C.sun, C.good][i] }} /><div style={{ margin: '0 22px', height: 18, borderRadius: 9, background: C.steel }} /></div>)}
          <div style={{ position: 'absolute', left: 60, top: 360, width: 800, height: 60, borderRadius: 30, background: '#fff' }} />
          <div style={{ position: 'absolute', left: 60, top: 450, width: 560, height: 60, borderRadius: 30, background: '#fff' }} />
        </div>
      </Abs>
      {BUGS.map((b, i) => (
        <motion.div key={i} style={{ position: 'absolute', left: b.x - 70, top: b.y - 60, zIndex: 2 }} animate={{ x: [0, b.dx, 0], y: [0, i % 2 ? -26 : 26, 0] }} transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut' }}>
          <Bug s={b.s} />
        </motion.div>
      ))}
      {/* hammer */}
      <motion.div style={{ position: 'absolute', left: 1180, top: 300, zIndex: 3, transformOrigin: '90% 90%' }} animate={{ rotate: [30, 30, -42, -42, 30], y: [0, 0, 70, 70, 0] }} transition={{ duration: LOOP, times: [0, 0.35, 0.5, 0.72, 1], repeat: Infinity, ease: 'easeIn' }}>
        <Svg vw={300} vh={300} w={420}>
          <path d="M60 280 L210 120" stroke="#fff" strokeWidth={46} /><path d="M60 278 L208 121" stroke={C.wood} strokeWidth={26} />
          <rect x={140} y={34} width={150} height={90} rx={26} fill="#fff" stroke="#fff" strokeWidth={14} transform="rotate(-42 215 80)" />
          <rect x={140} y={34} width={150} height={90} rx={26} fill={C.bad} transform="rotate(-42 215 80)" />
          <rect x={156} y={44} width={60} height={14} rx={7} fill={C.badHi} transform="rotate(-42 215 80)" />
        </Svg>
      </motion.div>
      {/* splat at the moment of impact */}
      <motion.div style={{ position: 'absolute', left: 820, top: 590, zIndex: 3 }} animate={{ scale: [0, 0, 1.3, 1, 0], opacity: [0, 0, 1, 1, 0], rotate: [0, 0, 10, 0, 0] }} transition={{ duration: LOOP, times: [0, 0.48, 0.55, 0.72, 0.8], repeat: Infinity }}>
        <Star s={240} color={C.good} edge={C.goodEdge} hi={C.goodHi} />
      </motion.div>
      <Abs x={440} y={320} className="twinkle" style={cssVars({ '--d': '1.4s' })}><Sparkle s={64} /></Abs>
      <Abs x={1440} y={860} className="twinkle" style={cssVars({ '--d': '1.9s', '--dl': '.6s' })}><Sparkle s={54} /></Abs>
    </Root>
  );
}
