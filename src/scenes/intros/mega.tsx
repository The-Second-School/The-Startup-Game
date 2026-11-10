// Intro: two startups slide two puzzle pieces together; they snap, sparkle, and a giant MEGA order crate bounces.
import { motion } from 'motion/react';
import { C, Abs, Root, Svg, Dots, Person, Sparkle, Burst, Coin, Star } from '../artb/core';
import { Crate } from '../artc/helpers';

const LOOP = 3.4;
const LEFT = 'M0 0 H300 V300 H0Z';
const RIGHT = 'M0 0 H300 V300 H0 V196 A46 46 0 0 1 0 104 Z';

function Piece({ side }: { side: 'l' | 'r' }) {
  const c = side === 'l' ? C.blue : C.pink, hi = side === 'l' ? C.blueHi : C.pinkHi;
  return (
    <Svg vw={400} vh={340} w={400}>
      <g transform={side === 'l' ? 'translate(20 20)' : 'translate(80 20)'}>
        <g fill="#fff" stroke="#fff" strokeWidth={34}><path d={side === 'l' ? LEFT : RIGHT} />{side === 'l' && <circle cx={300} cy={150} r={46} />}</g>
        <g fill={c} stroke={c} strokeWidth={20}><path d={side === 'l' ? LEFT : RIGHT} />{side === 'l' && <circle cx={300} cy={150} r={46} />}</g>
        <rect x={30} y={26} width={110} height={14} rx={7} fill={hi} stroke="none" />
      </g>
    </Svg>
  );
}

export default function MegaIntro() {
  return (
    <Root>
      <Dots y={280} h={520} color={C.bg2} />
      <div style={{ position: 'absolute', left: -400, top: 930, width: 2720, height: 150, background: C.road }} />
      <div style={{ position: 'absolute', left: -400, top: 930, width: 2720, height: 18, background: C.road2 }} />
      {/* puzzle pieces slide together */}
      <motion.div style={{ position: 'absolute', left: 420, top: 340 }} animate={{ x: [-560, 0, 0, 0, -560], scaleX: [1, 0.92, 1.05, 1, 1], opacity: [0, 1, 1, 1, 0] }} transition={{ duration: LOOP, times: [0, 0.3, 0.36, 0.8, 1], repeat: Infinity, ease: 'easeOut' }}><Piece side="l" /></motion.div>
      <motion.div style={{ position: 'absolute', left: 800, top: 340 }} animate={{ x: [560, 0, 0, 0, 560], scaleX: [1, 0.92, 1.05, 1, 1], opacity: [0, 1, 1, 1, 0] }} transition={{ duration: LOOP, times: [0, 0.3, 0.36, 0.8, 1], repeat: Infinity, ease: 'easeOut' }}><Piece side="r" /></motion.div>
      <motion.div style={{ position: 'absolute', left: 740, top: 360, width: 0, height: 0 }} animate={{ scale: [0, 0, 1.2, 1, 0], opacity: [0, 0, 1, 1, 0] }} transition={{ duration: LOOP, times: [0, 0.32, 0.4, 0.75, 0.82], repeat: Infinity }}>
        <Abs x={-40} y={-50}><Sparkle s={90} /></Abs><Abs x={90} y={250}><Sparkle s={70} /></Abs>
      </motion.div>
      <div style={{ position: 'absolute', left: 840, top: 540 }}><Burst n={14} r={240} d={LOOP} delay={LOOP * 0.33} /></div>
      {/* the two teams */}
      <Abs x={180} y={640} className="hop" style={{ ['--d' as string]: `${LOOP / 2}s` } as React.CSSProperties}><Person seed={2} mood="happy" arms="up" size={200} /></Abs>
      <Abs x={1500} y={640} className="hop" style={{ ['--d' as string]: `${LOOP / 2}s`, ['--dl' as string]: '.1s' } as React.CSSProperties}><Person seed={5} mood="happy" arms="up" size={200} flip /></Abs>
      {/* the mega order crate drops in */}
      <motion.div style={{ position: 'absolute', left: 1130, top: 400 }} animate={{ y: [-110, -110, 0, -50, 0, 0], scale: [1, 1, 1.1, 0.95, 1, 1], opacity: [0, 0, 1, 1, 1, 0] }} transition={{ duration: LOOP, times: [0, 0.4, 0.5, 0.56, 0.62, 1], repeat: Infinity }}>
        <Crate s={380} label="MEGA" />
        <Abs x={-30} y={-20} className="twinkle"><Star s={90} /></Abs><Abs x={330} y={-10} className="twinkle" style={{ ['--dl' as string]: '.5s' } as React.CSSProperties}><Coin s={90} /></Abs>
      </motion.div>
    </Root>
  );
}
