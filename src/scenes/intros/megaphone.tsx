// Intro: a giant megaphone blasts sound waves, stars and notes; the little townspeople jump with surprise.
import { motion } from 'motion/react';
import { useEffect, useState, type CSSProperties } from 'react';
import { C, Abs, Root, Svg, Dots, Person, Note, Star, Sparkle } from '../artb/core';
import { Megaphone } from '../artb/props';

const WAVES = [C.sun, C.orange, C.bad, C.sun];
function Waves() {
  return (
    <div style={{ position: 'absolute', left: 560, top: 640 }}>
      {WAVES.map((c, i) => (
        <div key={i} className="ring" style={{ position: 'absolute', left: -150, top: -150, width: 300, height: 300, ['--d' as string]: '1.9s', ['--dl' as string]: `${i * 0.45}s`, transformOrigin: '0% 50%' } as CSSProperties}>
          <Svg vw={300} vh={300} w={300}><path d="M150 40 A110 110 0 0 1 150 260" stroke="#fff" strokeWidth={42} fill="none" /><path d="M150 40 A110 110 0 0 1 150 260" stroke={c} strokeWidth={26} fill="none" /></Svg>
        </div>
      ))}
    </div>
  );
}

export default function MegaphoneIntro() {
  const [beat, setBeat] = useState(0);
  useEffect(() => { const iv = setInterval(() => setBeat(b => b + 1), 1900); return () => clearInterval(iv); }, []);
  return (
    <Root>
      <Dots y={260} h={560} color={C.bg2} />
      {/* rays */}
      <Abs x={160 - 400} y={640 - 700} w={1600} h={1600} className="spin" style={{ ['--d' as string]: '50s', opacity: 0.5 } as CSSProperties}>
        <Svg vw={1600} vh={1600} w={1600}>{Array.from({ length: 14 }, (_, i) => <path key={i} d="M800 800 L720 -100 L880 -100Z" fill={C.bg2} transform={`rotate(${(i * 360) / 14} 800 800)`} />)}</Svg>
      </Abs>
      <div style={{ position: 'absolute', left: -400, top: 920, width: 2720, height: 160, background: C.road }} /><div style={{ position: 'absolute', left: -400, top: 920, width: 2720, height: 18, background: C.road2 }} />
      <Waves />
      {/* megaphone with recoil on each blast */}
      <Abs x={160} y={520}>
        <motion.div key={beat} initial={{ x: 0, scale: 1 }} animate={{ x: [0, -34, 0], scale: [1, 0.93, 1.06, 1], rotate: [-8, -12, -6, -8] }} transition={{ duration: 0.7, times: [0, 0.2, 0.55, 1], ease: 'easeOut' }}>
          <Megaphone s={560} />
        </motion.div>
      </Abs>
      {/* flying stuff */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <Abs key={i} x={720} y={600} className="burst" style={{ ['--tx' as string]: `${520 + i * 120}px`, ['--ty' as string]: `${-300 + i * 90 - (i % 2) * 180}px`, ['--rot' as string]: `${i * 70 - 120}deg`, ['--d' as string]: '1.9s', ['--dl' as string]: `${i * 0.28}s` } as CSSProperties}>
          {i % 3 === 0 ? <Star s={84} /> : i % 3 === 1 ? <Note s={70} color={C.rv} /> : <Sparkle s={60} color={C.pink} />}
        </Abs>
      ))}
      {/* townspeople reacting */}
      {[0, 1, 2, 3].map(i => (
        <motion.div key={`${i}-${beat}`} style={{ position: 'absolute', left: 1230 + i * 150, top: 640 - (i % 2) * 20 }} initial={{ y: 0 }} animate={{ y: [0, -70, 0], rotate: [0, i % 2 ? 10 : -10, 0] }} transition={{ duration: 0.7, delay: 0.55 + i * 0.07, ease: 'easeOut' }}>
          <Person seed={i * 3 + 2} mood="wow" arms="up" size={150} flip />
        </motion.div>
      ))}
    </Root>
  );
}
