// Intro: three boats sail into the harbour: a dolphin, a shark in a suit, and a sneaky rAIvan, all with coin bags.
import { C, Abs, Root, Sun, cssVars, Cloud, Coin, Sparkle } from '../artb/core';
import { Boat, Dolphin, Shark } from '../artb/props';
import { Raivan } from '../../ui';
import { SeaBack, SeaFront } from '../artc/helpers';

const BOATS = [
  { x: 120, hull: C.blue, edge: C.blueEdge, hi: C.blueHi, flag: C.good, who: 'dolphin' },
  { x: 770, hull: C.steelEdge, edge: '#6D7F95', hi: C.steel, flag: C.bad, who: 'shark' },
  { x: 1420, hull: C.rv, edge: C.rvEdge, hi: C.rvHi, flag: C.ink, who: 'raivan' },
] as const;

export default function SharksIntro() {
  return (
    <Root bg={C.sky}>
      <Abs x={1560} y={330}><Sun s={220} /></Abs>
      <Abs x={100} y={380} className="drift" style={cssVars({ '--d': '40s', '--dx': '500px' })}><Cloud w={300} /></Abs>
      <Abs x={900} y={420} className="drift" style={cssVars({ '--d': '55s', '--dx': '-500px' })}><Cloud w={240} /></Abs>
      <SeaBack y={720} />
      {BOATS.map((b, i) => (
        <Abs key={b.who} x={b.x} y={440} className="bob" style={cssVars({ '--amp': '14px', '--d': `${2.4 + i * 0.3}s`, '--dl': `${-i * 0.7}s` })}>
          <div className="sway" style={cssVars({ '--ang': '2.5deg', '--d': `${3 + i * 0.4}s`, transformOrigin: '50% 90%' })}>
            <Boat s={400} hull={b.hull} edge={b.edge} hi={b.hi} flag={b.flag}>
              <div style={{ position: 'absolute', left: 90, top: 56 }}>
                {b.who === 'dolphin' && <Dolphin s={250} />}
                {b.who === 'shark' && <Shark s={250} />}
                {b.who === 'raivan' && <div style={{ marginTop: -6 }}><Raivan mood="sneaky" size={250} /></div>}
              </div>
            </Boat>
          </div>
          {/* coin bag bobbing over each boat */}
          <Abs x={150} y={-20} className="hop" style={cssVars({ '--amp': '34px', '--d': '1.3s', '--dl': `${-i * 0.4}s` })}><Coin s={90} /></Abs>
          <Abs x={250} y={-50} className="twinkle" style={cssVars({ '--dl': `${i * 0.5}s` })}><Sparkle s={50} color="#fff" /></Abs>
        </Abs>
      ))}
      <SeaFront y={850} />
    </Root>
  );
}
