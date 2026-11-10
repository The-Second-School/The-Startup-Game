// Intro: a spotlight finds a microphone on stage; sound rings, stars and notes pop out between the curtains.
import { C, Abs, Root, Svg, Dots, Person, Note, Star, Sparkle, cssVars } from '../artb/core';
import { Beam, Curtain, Valance } from '../artb/stage';

function Mic({ s = 520 }: { s?: number }) {
  return (
    <Svg vw={240} vh={520} w={s}>
      <path d="M120 250 V470 M70 500 H170" stroke="#fff" strokeWidth={36} />
      <path d="M120 250 V470 M70 500 H170" stroke={C.steel} strokeWidth={16} />
      <rect x={72} y={216} width={96} height={46} rx={18} fill="#fff" stroke="#fff" strokeWidth={10} /><rect x={72} y={216} width={96} height={46} rx={18} fill={C.bad} />
      <ellipse cx={120} cy={120} rx={78} ry={100} fill="#fff" stroke="#fff" strokeWidth={14} />
      <ellipse cx={120} cy={120} rx={78} ry={100} fill={C.steel} />
      {[-40, 0, 40].map(dx => <path key={dx} d={`M${120 + dx} 36 Q${120 + dx * 1.4} 120 ${120 + dx} 204`} stroke={C.steelEdge} strokeWidth={5} fill="none" />)}
      {[70, 120, 170].map(y => <path key={y} d={`M52 ${y} Q120 ${y + 18} 188 ${y}`} stroke={C.steelEdge} strokeWidth={5} fill="none" />)}
      <path d="M70 80 A56 70 0 0 1 112 30" stroke={C.steelHi} strokeWidth={12} fill="none" />
    </Svg>
  );
}

export default function MicIntro() {
  return (
    <Root bg="#EEE8FB">
      <Dots y={300} h={520} color="#DED4F6" r={6} />
      <div style={{ position: 'absolute', left: -400, top: 820, width: 2720, height: 260, background: C.wood }} />
      <div style={{ position: 'absolute', left: -400, top: 820, width: 2720, height: 20, background: C.woodHi }} />
      <Abs x={760} y={150} className="sway" origin="50% 0%" style={cssVars({ '--ang': '2deg', '--d': '4s' })}><Beam len={760} spread={460} opacity={0.5} /></Abs>
      <Abs x={0} y={0} z={3}><Curtain w={420} side="left" /></Abs>
      <Abs x={1500} y={0} z={3}><Curtain w={420} side="right" /></Abs>
      <Abs x={-400} y={-10} z={4}><Valance w={2720} /></Abs>
      {/* sound rings */}
      {[0, 1, 2].map(i => (
        <Abs key={i} x={800} y={380} w={320} h={320} className="ring" style={cssVars({ '--d': '1.8s', '--dl': `${i * 0.6}s` })}>
          <div style={{ width: 320, height: 320, borderRadius: '50%', border: `14px solid ${[C.sun, C.pink, C.blue][i]}` }} />
        </Abs>
      ))}
      <Abs x={840} y={330} className="wobble" origin="50% 100%" style={cssVars({ '--d': '.9s' })}><Mic s={440} /></Abs>
      {[0, 1, 2, 3].map(i => (
        <Abs key={i} x={960} y={540} className="burst" style={cssVars({ '--tx': `${(i % 2 ? 1 : -1) * (300 + i * 60)}px`, '--ty': `${-80 - i * 30}px`, '--rot': `${i * 60 - 90}deg`, '--d': '2s', '--dl': `${i * 0.45}s` })}>
          {i % 2 ? <Note s={70} color={C.sun} /> : <Star s={80} />}
        </Abs>
      ))}
      <Abs x={330} y={700} className="hop" style={cssVars({ '--d': '.9s', '--amp': '30px' })}><Person seed={6} mood="happy" arms="wave" size={190} /></Abs>
      <Abs x={1400} y={700} className="hop" style={cssVars({ '--d': '.9s', '--dl': '.3s', '--amp': '30px' })}><Person seed={9} mood="wow" arms="up" size={190} flip /></Abs>
      <Abs x={650} y={420} className="twinkle"><Sparkle s={70} /></Abs>
    </Root>
  );
}
