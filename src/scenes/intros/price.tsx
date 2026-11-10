// Intro: a swinging price tag changes from too high (shoppers leave) to too low (empty cash box) to just right (happy crowd).
import { useEffect, useState } from 'react';
import { C, Abs, Root, Dots, Person, Coin, Burst, cssVars } from '../artb/core';
import { CashBox, PriceTag } from '../artb/props';
import { Stall } from '../artc/helpers';

const STEPS = [
  { label: '₹99', mood: 'sad' as const, away: true, coins: 1, tint: C.bad, edge: C.badEdge, hi: C.badHi },
  { label: '₹1', mood: 'happy' as const, away: false, coins: 0, tint: C.blue, edge: C.blueEdge, hi: C.blueHi },
  { label: '₹50', mood: 'happy' as const, away: false, coins: 8, tint: C.good, edge: C.goodEdge, hi: C.goodHi },
];

export default function PriceIntro() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(v => (v + 1) % 3), 1500); return () => clearInterval(t); }, []);
  const st = STEPS[i];
  return (
    <Root>
      <Dots y={280} h={500} color={C.bg2} />
      <div style={{ position: 'absolute', left: -400, top: 900, width: 2720, height: 180, background: C.road }} />
      <div style={{ position: 'absolute', left: -400, top: 900, width: 2720, height: 18, background: C.road2 }} />
      <Abs x={1340} y={560}><Stall s={420} color={st.tint} edge={st.edge} /></Abs>
      <Abs x={1180} y={730}><CashBox s={300} coins={st.coins} empty={st.coins === 0} /></Abs>
      {/* the tag */}
      <Abs x={760} y={330} className="sway" origin="50% 0%" style={cssVars({ '--ang': '7deg', '--d': '1.6s' })}>
        <div style={{ position: 'absolute', left: 205, top: 0, width: 10, height: 100, background: C.ink, borderRadius: 5 }} />
        <div key={i} style={{ marginTop: 80 }}><PriceTag label={st.label} s={420} color={st.tint} edge={st.edge} hi={st.hi} textColor="#fff" /></div>
      </Abs>
      {/* shoppers */}
      {[0, 1, 2].map(n => (
        <Abs key={n} x={160 + n * 190 + (st.away ? n * 20 : 0)} y={640} className={st.away ? 'shake' : 'hop'} style={cssVars({ '--d': st.away ? '.9s' : '.8s', '--dl': `${n * 0.15}s`, '--amp': '36px', transition: 'left .8s' })}>
          <Person seed={n * 3 + 4} mood={st.mood} arms={st.away ? 'down' : 'up'} walk={st.away} flip={st.away} size={170} />
        </Abs>
      ))}
      {i === 2 && <div key="b"><Burst x={1330} y={760} n={12} r={200} d={1.2} up /><Abs x={1250} y={640} className="rise" style={cssVars({ '--d': '1.2s', '--dy': '-140px' })}><Coin s={80} /></Abs></div>}
    </Root>
  );
}
