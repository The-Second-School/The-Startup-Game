// Intro (Act 5, mega order): two startups' puzzle pieces slide together and snap; then a giant MEGA order crate drops in.
import { motion } from 'motion/react';
import { C, Abs, Root, Svg, Dots, Person, Coin } from '../artb/core';
import { Crate } from '../artc/helpers';
import { Focus, Backdrop, Subject } from '../kit/focus';
import { Splash, useBeat } from './beats';

const TIMES = [0, 900, 2600, 4400, 6200];
const JOIN = { x: 960, y: 500 };

function Piece({ side }: { side: 'l' | 'r' }) {
  const LEFT = 'M0 0 H300 V300 H0Z';
  const RIGHT = 'M0 0 H300 V300 H0 V196 A46 46 0 0 1 0 104 Z';
  const c = side === 'l' ? C.blue : C.pink, hi = side === 'l' ? C.blueHi : C.pinkHi;
  const d = side === 'l' ? LEFT : RIGHT;
  return (
    <Svg vw={400} vh={340} w={400}>
      <g transform={side === 'l' ? 'translate(20 20)' : 'translate(80 20)'}>
        <g fill="#fff" stroke="#fff" strokeWidth={34}><path d={d} />{side === 'l' && <circle cx={300} cy={150} r={46} />}</g>
        <g fill={c} stroke={c} strokeWidth={20}><path d={d} />{side === 'l' && <circle cx={300} cy={150} r={46} />}</g>
        <rect x={30} y={26} width={110} height={14} rx={7} fill={hi} stroke="none" />
      </g>
    </Svg>
  );
}

/** The two halves of the puzzle. `enter` slides them in from the sides; `snap` gives the squish when they lock together. */
function Pieces({ enter, snap }: { enter: boolean; snap: boolean }) {
  const tail = { x: { duration: 0.9, ease: 'easeOut' as const }, scaleX: { duration: 0.5 } };
  return (
    <div style={{ position: 'relative', width: 800, height: 340 }}>
      <motion.div style={{ position: 'absolute', left: 0, top: 0 }} initial={{ x: enter ? -560 : 0, opacity: enter ? 0 : 1 }}
        animate={{ x: 0, opacity: 1, scaleX: snap ? [0.92, 1.06, 1] : 1 }} transition={tail}>
        <Piece side="l" />
      </motion.div>
      <motion.div style={{ position: 'absolute', left: 400, top: 0 }} initial={{ x: enter ? 560 : 0, opacity: enter ? 0 : 1 }}
        animate={{ x: 0, opacity: 1, scaleX: snap ? [0.92, 1.06, 1] : 1 }} transition={tail}>
        <Piece side="r" />
      </motion.div>
    </div>
  );
}

export default function MegaIntro() {
  const beat = useBeat(TIMES);
  return (
    <Root>
      <Dots y={280} h={520} color={C.bg2} />
      <div style={{ position: 'absolute', left: -400, top: 930, width: 2720, height: 150, background: C.road }} />
      <div style={{ position: 'absolute', left: -400, top: 930, width: 2720, height: 18, background: C.road2 }} />
      <Focus active={beat >= 1}>
        <Backdrop>
          <Abs x={170} y={560}><Person seed={2} mood="happy" arms="up" size={200} /></Abs>
          <Abs x={1550} y={560}><Person seed={5} mood="happy" arms="up" size={200} flip /></Abs>
          {beat >= 3 && <Abs x={JOIN.x - 400} y={JOIN.y - 170}><Pieces enter={false} snap={false} /></Abs>}
        </Backdrop>
        {beat >= 1 && beat < 3 && (
          <Subject at={JOIN} scale={1.1}><Pieces enter snap={beat === 2} /></Subject>
        )}
        {beat >= 3 && (
          <Subject at={{ x: 960, y: 560 }} scale={1.12}>
            <motion.div initial={{ y: -420, scale: 0.9 }} animate={{ y: [-420, 0, -60, 0], scale: [0.9, 1.1, 0.96, 1] }}
              transition={{ duration: 1.1, times: [0, 0.55, 0.8, 1], ease: 'easeOut' }} style={{ position: 'relative' }}>
              <Crate s={380} label="MEGA" />
              <Abs x={-30} y={-20} className="twinkle"><Coin s={90} /></Abs>
            </motion.div>
          </Subject>
        )}
      </Focus>
      {beat === 2 && <Splash key="snap" x={JOIN.x} y={JOIN.y} n={14} r={240} />}
      {beat === 4 && <Splash key="crate" x={960} y={560} n={12} r={260} />}
    </Root>
  );
}
