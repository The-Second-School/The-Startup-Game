// Intro (Act 4, price): a price tag is tried three ways. Too high: shoppers walk away. Too low: the cash box stays empty.
// Just right: shoppers come back and the coins roll in.
import { motion } from 'motion/react';
import { C, Abs, Root, Dots, Person, Coin } from '../artb/core';
import { CashBox, PriceTag } from '../artb/props';
import { Stall } from '../artc/helpers';
import { Focus, Backdrop, Subject } from '../kit/focus';
import { Splash, useBeat } from './beats';

const TIMES = [0, 1000, 3000, 5000, 7000];
// beat 0 is the calm shop; beats 1..4 try the price tag three ways (beat 4 holds the last one)
const STEP = [
  null,
  { label: '₹99', tint: C.bad, edge: C.badEdge, hi: C.badHi, coins: 1, away: true },
  { label: '₹1', tint: C.blue, edge: C.blueEdge, hi: C.blueHi, coins: 0, away: false },
  { label: '₹50', tint: C.good, edge: C.goodEdge, hi: C.goodHi, coins: 8, away: false },
  { label: '₹50', tint: C.good, edge: C.goodEdge, hi: C.goodHi, coins: 8, away: false },
] as const;

export default function PriceIntro() {
  const beat = useBeat(TIMES);
  const st = STEP[beat];
  const away = st ? st.away : false;
  return (
    <Root>
      <Dots y={280} h={500} color={C.bg2} />
      <div style={{ position: 'absolute', left: -400, top: 900, width: 2720, height: 180, background: C.road }} />
      <div style={{ position: 'absolute', left: -400, top: 900, width: 2720, height: 18, background: C.road2 }} />
      <Focus active={beat >= 1}>
        <Backdrop>
          <Abs x={1340} y={560}><Stall s={420} color={st?.tint ?? C.sun} /></Abs>
          <Abs x={1180} y={730}><CashBox s={300} coins={st?.coins ?? 0} empty={(st?.coins ?? 0) === 0} /></Abs>
          {[0, 1, 2].map(n => (
            <motion.div key={n} style={{ position: 'absolute', left: 160 + n * 190, top: 640 }}
              animate={{ x: away ? -900 : 0 }} transition={{ duration: 1.6, ease: 'easeInOut', delay: n * 0.15 }}>
              <Person seed={n * 3 + 4} mood={away ? 'sad' : 'happy'} arms={away ? 'down' : 'up'} walk={away} flip={away} size={170} />
            </motion.div>
          ))}
        </Backdrop>
        {st && (
          <Subject at={{ x: 900, y: 560 }} scale={1.12}>
            <motion.div key={beat} initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 14 }}>
              <div style={{ position: 'relative', width: 420, height: 420 }}>
                <div style={{ position: 'absolute', left: 205, top: -20, width: 10, height: 80, background: C.ink, borderRadius: 5 }} />
                <PriceTag label={st.label} s={420} color={st.tint} edge={st.edge} hi={st.hi} textColor="#fff" />
              </div>
            </motion.div>
          </Subject>
        )}
      </Focus>
      {beat === 3 && <Splash key="coins" x={1330} y={700} n={12} r={260} />}
      {beat === 3 && <Abs x={1250} y={640}><motion.div initial={{ y: 0, opacity: 0 }} animate={{ y: -120, opacity: [0, 1, 0] }} transition={{ duration: 1.4 }}><Coin s={80} /></motion.div></Abs>}
    </Root>
  );
}
