// Intro (Act 3, megaphone): a giant megaphone blasts three times; each blast sends out sound rings and stars, and the crowd jumps.
import { motion } from 'motion/react';
import { C, Root, Svg, Dots, Person } from '../artb/core';
import { Megaphone } from '../artb/props';
import { Focus, Backdrop, Subject } from '../kit/focus';
import { Splash, useBeat } from './beats';

const TIMES = [0, 1000, 2400, 3800, 5200, 6600];
const SUBJECT = { x: 800, y: 600 };
const WAVES = [C.sun, C.orange, C.bad];

/** Sound rings in front of the megaphone mouth. They ripple once per blast. */
function Waves({ blast }: { blast: number }) {
  return (
    <div style={{ position: 'absolute', left: 300, top: -20 }}>
      {WAVES.map((c, i) => (
        <motion.div key={`${blast}-${i}`} initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: [0.3, 1.2], opacity: [0.9, 0] }}
          transition={{ duration: 1.1, delay: i * 0.22, ease: 'easeOut' }}
          style={{ position: 'absolute', left: -150, top: -150, width: 300, height: 300 }}>
          <Svg vw={300} vh={300} w={300}><path d="M150 40 A110 110 0 0 1 150 260" stroke="#fff" strokeWidth={42} fill="none" /><path d="M150 40 A110 110 0 0 1 150 260" stroke={c} strokeWidth={26} fill="none" /></Svg>
        </motion.div>
      ))}
    </div>
  );
}

export default function MegaphoneIntro() {
  const beat = useBeat(TIMES);
  const blast = Math.max(0, beat - 1);        // blasts so far (beat 1 is the first)
  return (
    <Root>
      <Dots y={260} h={560} color={C.bg2} />
      <div style={{ position: 'absolute', left: -400, top: 900, width: 2720, height: 180, background: C.road }} />
      <div style={{ position: 'absolute', left: -400, top: 900, width: 2720, height: 18, background: C.road2 }} />
      <Focus active={beat >= 1}>
        <Backdrop>
          {/* the crowd: jumps on every blast */}
          {[0, 1, 2, 3].map(i => (
            <motion.div key={`${i}-${blast}`} style={{ position: 'absolute', left: 1230 + i * 150, top: 640 - (i % 2) * 20 }}
              initial={{ y: 0 }} animate={{ y: beat >= 2 ? [0, -70, 0] : 0, rotate: beat >= 2 ? [0, i % 2 ? 10 : -10, 0] : 0 }}
              transition={{ duration: 0.7, delay: 0.55 + i * 0.07, ease: 'easeOut' }}>
              <Person seed={i * 3 + 2} mood={beat >= 2 ? 'wow' : 'neutral'} arms="up" size={150} flip />
            </motion.div>
          ))}
        </Backdrop>
        <Subject at={SUBJECT} scale={1.12}>
          <div style={{ position: 'relative', width: 520, height: 520 }}>
            {/* recoil on each blast */}
            <motion.div key={blast} initial={{ x: 0, scale: 1 }} animate={{ x: blast ? [0, -34, 0] : 0, scale: blast ? [1, 0.93, 1.06, 1] : 1, rotate: [-8, -12, -6, -8] }}
              transition={{ duration: 0.7, times: [0, 0.2, 0.55, 1], ease: 'easeOut' }}>
              <Megaphone s={520} />
            </motion.div>
            {blast > 0 && <Waves key={blast} blast={blast} />}
          </div>
        </Subject>
      </Focus>
      {beat >= 2 && <Splash key={beat} x={1060} y={580} n={10} r={320} />}
    </Root>
  );
}
