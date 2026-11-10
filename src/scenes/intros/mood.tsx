// Intro: under a rain cloud grumpy customers trudge away; on the sunny side happy customers dance and bring friends.
import { C, Abs, Root, Svg, Dots, Person, Cloud, Sun, cssVars } from '../artb/core';
import { Heart } from '../artc/helpers';

export default function MoodIntro() {
  return (
    <Root>
      <Dots y={280} h={500} color={C.bg2} />
      <div style={{ position: 'absolute', left: 0, top: 900, width: 1920, height: 180, background: C.road }} />
      <div style={{ position: 'absolute', left: 0, top: 900, width: 1920, height: 18, background: C.road2 }} />
      <div style={{ position: 'absolute', left: 940, top: 380, width: 14, height: 520, borderRadius: 7, background: C.bg3 }} />
      {/* sad side */}
      <Abs x={90} y={350} className="bob" style={cssVars({ '--amp': '10px', '--d': '3s' })}><Cloud w={760} color="#B8BFD6" shade="#8E96B4" /></Abs>
      {Array.from({ length: 14 }, (_, i) => (
        <Abs key={i} x={170 + i * 46} y={500} className="fall" style={cssVars({ '--d': '.9s', '--dl': `${(i * 0.37) % 0.9}s`, '--fx': '-14px', '--fy': '300px', '--rot': '0deg' })}>
          <Svg vw={20} vh={40} w={16}><path d="M10 2 Q20 22 10 36 Q0 22 10 2Z" fill={C.blue} stroke="#fff" strokeWidth={3} paintOrder="stroke" /></Svg>
        </Abs>
      ))}
      {[0, 1, 2].map(i => (
        <Abs key={i} x={170 + i * 200} y={640} className="drift" style={cssVars({ '--d': '3.2s', '--dx': '-120px', '--dl': `${-i * 0.6}s` })}>
          <Person seed={i * 2 + 1} mood="sad" arms="down" walk flip size={190} />
        </Abs>
      ))}
      {/* happy side */}
      <Abs x={1420} y={350} className="spin" style={cssVars({ '--d': '40s' })}><Sun s={240} /></Abs>
      {[0, 1, 2].map(i => (
        <Abs key={i} x={1060 + i * 200} y={640} className="hop" style={cssVars({ '--d': '.8s', '--dl': `${i * 0.2}s`, '--amp': '50px' })}>
          <Person seed={i * 3 + 4} mood="happy" arms="up" size={190} />
        </Abs>
      ))}
      {[0, 1].map(i => <Abs key={i} x={1130 + i * 360} y={540} className="rise" style={cssVars({ '--d': '1.8s', '--dl': `${i * 0.9}s`, '--dy': '-200px' })}><Heart s={70} /></Abs>)}
    </Root>
  );
}
