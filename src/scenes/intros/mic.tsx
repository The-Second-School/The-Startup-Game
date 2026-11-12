// Intro (mic time): a microphone pops up on a stage, sound rings and stars burst out, then a speaker steps up to talk.
import { motion } from 'motion/react';
import { C, Root, Svg, Dots, Person } from '../artb/core';
import { Focus, Backdrop, Subject } from '../kit/focus';
import { Splash, useBeat } from './beats';

const TIMES = [0, 1000, 2800, 4400, 6200];

function Mic({ s = 240 }: { s?: number }) {
  return (
    <Svg vw={240} vh={520} w={s}>
      <path d="M120 250 V470 M70 500 H170" stroke="#fff" strokeWidth={36} fill="none" />
      <path d="M120 250 V470 M70 500 H170" stroke={C.steel} strokeWidth={16} fill="none" />
      <rect x={72} y={216} width={96} height={46} rx={18} fill="#fff" stroke="#fff" strokeWidth={10} /><rect x={72} y={216} width={96} height={46} rx={18} fill={C.bad} />
      <ellipse cx={120} cy={120} rx={78} ry={100} fill="#fff" stroke="#fff" strokeWidth={14} />
      <ellipse cx={120} cy={120} rx={78} ry={100} fill={C.steel} />
      {[-40, 0, 40].map(dx => <path key={dx} d={`M${120 + dx} 36 Q${120 + dx * 1.4} 120 ${120 + dx} 204`} stroke={C.steelEdge} strokeWidth={5} fill="none" />)}
      {[70, 120, 170].map(y => <path key={y} d={`M52 ${y} Q120 ${y + 18} 188 ${y}`} stroke={C.steelEdge} strokeWidth={5} fill="none" />)}
      <path d="M70 80 A56 70 0 0 1 112 30" stroke={C.steelHi} strokeWidth={12} fill="none" />
    </Svg>
  );
}

/** Rings that ripple out from the mic once, each a little later than the last. */
function Rings() {
  return (
    <>
      {[C.sun, C.pink, C.blue].map((c, i) => (
        <motion.div key={i} initial={{ scale: 0.4, opacity: 0.9 }} animate={{ scale: [0.4, 1.9], opacity: [0.9, 0] }}
          transition={{ duration: 1.6, delay: i * 0.5, ease: 'easeOut' }}
          style={{ position: 'absolute', left: -160, top: -160, width: 320, height: 320, borderRadius: '50%', border: `14px solid ${c}` }} />
      ))}
    </>
  );
}

export default function MicIntro() {
  const beat = useBeat(TIMES);
  return (
    <Root bg="#EEE8FB">
      <Dots y={300} h={520} color="#DED4F6" r={6} />
      <div style={{ position: 'absolute', left: -400, top: 880, width: 2720, height: 220, background: C.wood }} />
      <div style={{ position: 'absolute', left: -400, top: 880, width: 2720, height: 20, background: C.woodHi }} />
      <Focus active={beat >= 1}>
        <Backdrop>
          {/* the stage pool of light */}
          <div style={{ position: 'absolute', left: 560, top: 820, width: 800, height: 120, borderRadius: '50%', background: '#FFF6B8', opacity: 0.6 }} />
        </Backdrop>
        {beat === 1 && (
          <Subject at={{ x: 960, y: 580 }} scale={1.12}>
            <motion.div initial={{ y: -260, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 170, damping: 13 }}>
              <div style={{ position: 'relative', width: 240, height: 520 }}>
                <Rings />
                <Mic s={240} />
              </div>
            </motion.div>
          </Subject>
        )}
        {beat >= 2 && beat < 4 && (
          <Subject at={{ x: 960, y: 580 }} scale={1.12}>
            <div style={{ position: 'relative', width: 240, height: 520 }}>
              <motion.div animate={{ rotate: [0, -4, 4, 0] }} transition={{ duration: 0.6 }} style={{ position: 'absolute', left: 0, top: 0 }}>
                <Mic s={240} />
              </motion.div>
            </div>
          </Subject>
        )}
        {beat >= 4 && (
          <Subject at={{ x: 960, y: 620 }} scale={1.12}>
            <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 15 }}>
              <Person seed={6} mood="happy" arms="wave" size={260} />
            </motion.div>
          </Subject>
        )}
      </Focus>
      {beat >= 2 && beat < 4 && <Splash key={beat} x={960} y={460} n={12} r={300} />}
    </Root>
  );
}
