// Intro (Act 1, question 1): a magnifier checks three question marks in the market; each one it inspects lights up as an idea bulb.
import { motion } from 'motion/react';
import { C, Abs, Root, Svg, Dots } from '../artb/core';
import { Magnifier } from '../artb/props';
import { Stall } from '../artc/helpers';
import { Focus, Backdrop, Subject } from '../kit/focus';
import { useBeat } from './beats';

const TIMES = [0, 1000, 2400, 3800, 5200, 6600, 8000];
const MARKS = [420, 960, 1500];       // x of the three question marks (centres)
const MARK_Y = 500;
const WHERE = [0, 0, 0, 1, 1, 2, 2];  // which mark the lens sits over, per beat
const LIT_FROM = [2, 4, 6];           // beat at which each mark turns into a bulb
const MARK_C = [C.blue, C.pink, C.orange];

function QMark({ s, c }: { s: number; c: string }) {
  const d = 'M26 40 Q26 12 50 12 Q76 12 76 38 Q76 56 54 66 Q46 72 46 86';
  return (
    <Svg vw={100} vh={130} w={s}>
      <path d={d} stroke="#fff" strokeWidth={34} fill="none" /><circle cx={46} cy={112} r={14} fill="#fff" stroke="#fff" strokeWidth={10} />
      <path d={d} stroke={c} strokeWidth={20} fill="none" />
      <circle cx={46} cy={112} r={13} fill={c} />
    </Svg>
  );
}

function Bulb({ s }: { s: number }) {
  return (
    <Svg vw={100} vh={130} w={s}>
      <g stroke="#fff" strokeWidth={10} fill="#fff"><circle cx={50} cy={52} r={36} /><rect x={32} y={80} width={36} height={34} rx={12} /></g>
      <rect x={32} y={80} width={36} height={34} rx={12} fill={C.steel} />
      <path d="M34 94 H66 M36 104 H64" stroke={C.steelEdge} strokeWidth={5} fill="none" />
      <circle cx={50} cy={50} r={36} fill={C.sun} />
      <path d="M26 40 A26 26 0 0 1 42 24" stroke={C.sunHi} strokeWidth={9} fill="none" />
      <path d="M40 66 L46 50 L54 62 L60 46" stroke={C.good} strokeWidth={5} fill="none" />
    </Svg>
  );
}

export default function MagnifierIntro() {
  const beat = useBeat(TIMES);
  const lensX = MARKS[WHERE[beat]];
  return (
    <Root>
      <Focus active={beat >= 1}>
        <Backdrop>
          <Dots y={280} h={420} color={C.bg2} />
          <div style={{ position: 'absolute', left: -400, top: 830, width: 2720, height: 250, background: C.road }} />
          <div style={{ position: 'absolute', left: -400, top: 830, width: 2720, height: 18, background: C.road2 }} />
          <Abs x={0} y={560}><Stall s={300} color={C.bad} /></Abs>
          <Abs x={1620} y={560}><Stall s={300} color={C.good} /></Abs>
          {MARKS.map((mx, i) => (
            <Abs key={i} x={mx - 90} y={MARK_Y - 117}>
              {beat >= LIT_FROM[i] ? <Bulb s={180} /> : <QMark s={180} c={MARK_C[i]} />}
            </Abs>
          ))}
        </Backdrop>
        {/* the lens sits on the mark it is checking; the outer box glides, the subject scales inside it */}
        <motion.div initial={false} animate={{ x: lensX - 932, y: MARK_Y - 572, opacity: beat ? 1 : 0 }}
          transition={{ x: { type: 'spring', stiffness: 90, damping: 18 }, y: { type: 'spring', stiffness: 90, damping: 18 }, opacity: { duration: 0.4 } }}
          style={{ position: 'absolute', left: 0, top: 0 }}>
          <Subject at={{ x: 960, y: 600 }} scale={1.12}>
            <Magnifier s={420} />
          </Subject>
        </motion.div>
      </Focus>
    </Root>
  );
}
