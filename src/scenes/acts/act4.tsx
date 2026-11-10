// Act 4 Money: customers queue and pay, price tags that are too high / too low, then investor boats sail into the harbour.
import { useEffect, useState } from 'react';
import { C, Abs, Root, Sun, Cloud, Person, Coin, Burst, RecipeStrip, Sparkle, cssVars } from '../artb/core';
import { Boat, CashBox, Dolphin, PriceTag, Shark } from '../artb/props';
import { Raivan } from '../../ui';
import { Mv, V, H, Pier, SeaBack, SeaFront, Stall } from '../artc/helpers';
import { Show } from '../shared/bits';
import type { SceneBodyProps } from '../types';

function PriceBeat() {
  const [k, setK] = useState(0);
  useEffect(() => { const t = setInterval(() => setK(v => (v + 1) % 2), 2000); return () => clearInterval(t); }, []);
  const hi = k === 0;
  return (
    <>
      <Abs x={470} y={300} className="sway" origin="50% 0%" style={cssVars({ '--ang': '6deg', '--d': '1.7s' })}>
        <div style={{ position: 'absolute', left: 205, top: 0, width: 10, height: 90, background: C.ink, borderRadius: 5 }} />
        <div style={{ marginTop: 70 }}><PriceTag label={hi ? '₹99' : '₹1'} s={400} color={hi ? C.bad : C.blue} edge={hi ? C.badEdge : C.blueEdge} hi={hi ? C.badHi : C.blueHi} textColor="#fff" /></div>
      </Abs>
      <Abs x={170} y={560}>
        {[0, 1, 2].map(n => (
          <Abs key={n} x={n * 120} y={0} className={hi ? 'shake' : 'hop'} style={cssVars({ '--d': hi ? '.8s' : '.7s', '--dl': `${n * 0.12}s`, '--amp': '30px' })}>
            <Person seed={n * 3 + 2} mood={hi ? 'sad' : 'happy'} arms={hi ? 'down' : 'up'} walk={hi} flip={hi} size={120} />
          </Abs>
        ))}
      </Abs>
    </>
  );
}

export default function Act4({ beat }: SceneBodyProps) {
  return (
    <Root bg={C.sky}>
      <Abs x={1520} y={290}><Sun s={230} /></Abs>
      <Abs x={160} y={300} className="drift" style={cssVars({ '--d': '50s', '--dx': '500px' })}><Cloud w={320} /></Abs>
      <Abs x={1000} y={360} className="drift" style={cssVars({ '--d': '70s', '--dx': '-500px' })}><Cloud w={260} /></Abs>
      <SeaBack y={700} />
      <Pier x={0} y={730} w={1060} />
      <Abs x={90} y={475} z={2} className="squish" style={cssVars({ '--sx': 1.012, '--sy': 0.988, '--d': '3.4s', transformOrigin: '50% 100%' })}><Stall s={380} /></Abs>
      <Abs x={560} y={555} z={2} className="bob" style={cssVars({ '--amp': '5px', '--d': '3.2s' })}><CashBox s={300} coins={beat >= 1 && beat !== 2 ? 7 : 2} empty={beat === 2} /></Abs>

      {/* beat 1: coin rain and a queue of customers */}
      <Show when={beat === 1} k="coins" y={0} style={{ zIndex: 3 }}>{[0, 1, 2, 3].map(i => (
        <Abs key={i} x={600 + i * 55} y={400} className="fall" z={3} style={cssVars({ '--d': '1.5s', '--dl': `${i * 0.35}s`, '--fx': '0px', '--fy': '200px', '--rot': '180deg' })}><Coin s={64} /></Abs>
      ))}</Show>
      {[0, 1, 2].map(n => (
        <Mv key={n} beat={beat} delay={n * 0.18} z={3} to={[H(760 + n * 130, 560), V(760 + n * 130, 560), H(760 + n * 130, 560), V(760 + n * 130, 560), V(760 + n * 130, 560), V(760 + n * 130, 560)]} from={H(1300 + n * 140, 560, 1)}>
          <div className={beat === 1 || beat >= 3 ? 'hop' : undefined} style={cssVars({ '--d': '.9s', '--dl': `${n * 0.2}s`, '--amp': '24px' })}><Person seed={n * 5 + 1} mood="happy" arms={beat >= 3 ? 'up' : 'down'} walk={beat === 1} size={120} /></div>
        </Mv>
      ))}

      {/* beat 2: too high / too low */}
      <Show when={beat === 2} k="price" y={0} style={{ zIndex: 3 }}><PriceBeat /></Show>

      {/* beat 3+: investor boats sail in */}
      {[
        { x: 1040, hull: C.blue, edge: C.blueEdge, hi: C.blueHi, who: 0 },
        { x: 1310, hull: C.steelEdge, edge: '#6D7F95', hi: C.steel, who: 1 },
        { x: 1580, hull: C.rv, edge: C.rvEdge, hi: C.rvHi, who: 2 },
      ].map((b, i) => (
        <Mv key={i} beat={beat} delay={i * 0.25} stiff={50} damp={14} to={[H(b.x + 700, 440, 1), H(b.x + 700, 440, 1), H(b.x + 700, 440, 1), V(b.x, 440), V(b.x, 440)]}>
          <div className="bob" style={cssVars({ '--amp': '12px', '--d': `${2.4 + i * 0.3}s`, '--dl': `${-i * 0.6}s` })}>
            <Boat s={290} hull={b.hull} edge={b.edge} hi={b.hi} flag={b.who === 2 ? C.ink : C.good}>
              <div style={{ position: 'absolute', left: 36, top: 54 }}>
                {b.who === 0 ? <Dolphin s={220} /> : b.who === 1 ? <Shark s={220} /> : <Raivan mood="sneaky" size={220} />}
              </div>
            </Boat>
          </div>
        </Mv>
      ))}
      <SeaFront y={780} />

      {/* beat 4: Step 4 stamp */}
      <Show when={beat >= 4} k="stamp" y={30} style={{ zIndex: 5 }}>
        <Abs x={1000} y={330} z={5}><Burst n={16} r={300} d={2.2} up /></Abs>
        <Mv beat={beat} to={[H(900, 280), H(900, 280), H(900, 280), H(900, 280), V(900, 270)]} z={5}>
          <div className="pulse" style={cssVars({ '--s': 1.12, '--d': '1.3s' })}><Coin s={190} /></div>
        </Mv>
        <Abs x={1180} y={300} className="twinkle" z={5}><Sparkle s={80} /></Abs>
        <RecipeStrip active={4} y={900} />
      </Show>
    </Root>
  );
}
