// Intro: rAIvan's Copy-O-Matic chugs out fake copies of everything while an angry rAIvan watches.
import { C, Abs, Root, Dots, Star, Coin, Puff, cssVars } from '../artb/core';
import { Copier, FakeSheet } from '../artb/props';
import { Raivan } from '../../ui';

const SHEETS = [{ fx: -260, rot: -40 }, { fx: 150, rot: 30 }, { fx: -80, rot: -12 }, { fx: 300, rot: 55 }, { fx: -380, rot: 20 }];

export default function CopierIntro() {
  return (
    <Root>
      <Dots y={280} h={500} color={C.bg2} />
      <div style={{ position: 'absolute', left: 0, top: 900, width: 1920, height: 180, background: C.road }} />
      <div style={{ position: 'absolute', left: 0, top: 900, width: 1920, height: 18, background: C.road2 }} />
      {/* smoke from the machine */}
      <Abs x={480} y={420}>{[0, 1, 2].map(i => <Puff key={i} s={60} color={C.rvHi} d={2.2} dl={i * 0.7} dy={-200} dx={i * 30 - 30} />)}</Abs>
      {/* fake copies pour out of the slot */}
      {SHEETS.map((p, i) => (
        <Abs key={i} x={540} y={720} className="fall" style={cssVars({ '--d': '2.4s', '--dl': `${i * 0.45}s`, '--fx': `${p.fx}px`, '--fy': `${190 + (i % 2) * 20}px`, '--rot': `${p.rot}deg` })}>
          <FakeSheet s={150}>{i % 2 ? <Star s={90} /> : <Coin s={90} />}</FakeSheet>
        </Abs>
      ))}
      <Abs x={220} y={380} className="shake" style={cssVars({ '--d': '.5s' })}><Copier s={640} mood="sneaky" /></Abs>
      <Abs x={1180} y={420} className="bob" style={cssVars({ '--amp': '14px', '--d': '1.2s' })}><Raivan mood="angry" size={520} /></Abs>
      {[0, 1, 2].map(i => <Abs key={i} x={1340 + i * 120} y={400}><Puff s={50} color="#fff" d={1.6} dl={i * 0.5} dy={-150} /></Abs>)}
    </Root>
  );
}
