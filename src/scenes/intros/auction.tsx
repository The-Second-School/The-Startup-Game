// Intro: bidding paddles pop up one after another, then the gavel bangs "SOLD" on a shiny ticket.
import { motion } from 'motion/react';
import { C, Abs, Root, Svg, Dots, Person, Star, Sparkle, Burst, cssVars } from '../artb/core';

const LOOP = 3.4;
const PADDLES = [
  { x: 260, n: '20', c: C.blue, e: C.blueEdge, t: 0.12, seed: 3 },
  { x: 560, n: '30', c: C.pink, e: C.pinkEdge, t: 0.28, seed: 7 },
  { x: 1180, n: '40', c: C.good, e: C.goodEdge, t: 0.44, seed: 10 },
  { x: 1480, n: '50', c: C.orange, e: C.orangeEdge, t: 0.58, seed: 5 },
];

function Paddle({ n, c }: { n: string; c: string; e: string }) {
  return (
    <Svg vw={160} vh={300} w={150}>
      <rect x={64} y={110} width={32} height={180} rx={14} fill="#fff" stroke="#fff" strokeWidth={10} /><rect x={64} y={110} width={32} height={180} rx={14} fill={C.wood} />
      <circle cx={80} cy={80} r={68} fill="#fff" stroke="#fff" strokeWidth={10} /><circle cx={80} cy={80} r={68} fill={c} />
      <path d="M32 60 A50 50 0 0 1 64 34" stroke="#fff" strokeWidth={8} fill="none" opacity={0.6} />
      <text x={80} y={104} textAnchor="middle" fontFamily="'Baloo 2', system-ui" fontWeight={800} fontSize={64} fill="#fff">{n}</text>
    </Svg>
  );
}

export default function AuctionIntro() {
  return (
    <Root>
      <Dots y={280} h={500} color={C.bg2} />
      <div style={{ position: 'absolute', left: 0, top: 930, width: 1920, height: 150, background: C.road }} />
      <div style={{ position: 'absolute', left: 0, top: 930, width: 1920, height: 18, background: C.road2 }} />
      {/* the prize ticket */}
      <Abs x={650} y={330} className="sway" origin="50% 100%" style={cssVars({ '--ang': '3deg', '--d': '2.2s' })}>
        <div style={{ width: 620, height: 340, borderRadius: 48, background: C.sun, border: '8px solid #fff', boxShadow: 'var(--sh-sm)', position: 'relative', display: 'grid', placeItems: 'center' }}>
          <div style={{ position: 'absolute', left: -34, top: 130, width: 60, height: 80, borderRadius: 30, background: C.bg }} /><div style={{ position: 'absolute', right: -34, top: 130, width: 60, height: 80, borderRadius: 30, background: C.bg }} />
          <div style={{ position: 'absolute', left: 38, top: 20, width: 200, height: 18, borderRadius: 9, background: C.sunHi }} />
          <div style={{ fontSize: 170, lineHeight: 1 }}>🎟️</div>
          <div style={{ position: 'absolute', bottom: 18, fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 56, color: C.ink }}>Who bids more?</div>
        </div>
      </Abs>
      {/* bidders */}
      {PADDLES.map(p => (
        <div key={p.n}>
          <Abs x={p.x} y={700}><div className="bob" style={cssVars({ '--amp': '8px', '--d': '1.6s', '--dl': `${p.t}s` })}><Person seed={p.seed} mood="happy" arms="down" size={180} /></div></Abs>
          <motion.div style={{ position: 'absolute', left: p.x - 10, top: 560 }} animate={{ y: [200, 200, -10, 0, 0, 200, 200], opacity: [0, 0, 1, 1, 1, 0, 0], rotate: [0, 0, -8, 4, 0, 0, 0] }} transition={{ duration: LOOP, times: [0, p.t, p.t + 0.08, p.t + 0.12, 0.8, 0.88, 1], repeat: Infinity }}>
            <Paddle n={p.n} c={p.c} e={p.e} />
          </motion.div>
        </div>
      ))}
      {/* gavel */}
      <motion.div style={{ position: 'absolute', left: 1330, top: 360, transformOrigin: '12% 90%', zIndex: 3 }} animate={{ rotate: [-10, -10, -70, 0, 0, -10], y: [0, 0, 0, 40, 40, 0] }} transition={{ duration: LOOP, times: [0, 0.62, 0.74, 0.8, 0.9, 1], repeat: Infinity }}>
        <Svg vw={300} vh={260} w={400}>
          <path d="M20 240 L180 100" stroke="#fff" strokeWidth={44} /><path d="M22 238 L178 101" stroke={C.wood} strokeWidth={24} />
          <rect x={130} y={20} width={150} height={96} rx={26} fill="#fff" stroke="#fff" strokeWidth={14} transform="rotate(40 205 68)" />
          <rect x={130} y={20} width={150} height={96} rx={26} fill={C.wood} transform="rotate(40 205 68)" />
          <rect x={146} y={30} width={50} height={14} rx={7} fill={C.woodHi} transform="rotate(40 205 68)" />
        </Svg>
      </motion.div>
      <Abs x={1330} y={820}>
        <div style={{ width: 360, height: 90, borderRadius: 30, background: C.wood, border: '6px solid #fff' }} />
      </Abs>
      {/* SOLD pop */}
      <motion.div style={{ position: 'absolute', left: 1500, top: 700, zIndex: 4 }} animate={{ scale: [0, 0, 1.3, 1, 1, 0], rotate: [0, 0, 12, -6, -6, 0], opacity: [0, 0, 1, 1, 1, 0] }} transition={{ duration: LOOP, times: [0, 0.78, 0.84, 0.88, 0.96, 1], repeat: Infinity }}>
        <div style={{ position: 'relative' }}><Star s={240} color={C.bad} edge={C.badEdge} hi={C.badHi} />
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 48, color: '#fff', transform: 'rotate(-8deg)' }}>SOLD!</div></div>
      </motion.div>
      <Abs x={1560} y={760} className="twinkle" style={cssVars({ '--d': '1s' })}><Sparkle s={60} /></Abs>
      <div style={{ position: 'absolute', left: 1480, top: 880 }}><Burst n={10} r={160} d={LOOP} delay={LOOP * 0.8} /></div>
    </Root>
  );
}
