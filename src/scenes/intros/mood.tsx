// Intro (mood check): a grey rain cloud drives the grumpy customers away; then the sunny side brings happy customers who bring friends.
import { motion } from 'motion/react';
import { C, Abs, Root, Svg, Dots, Person, Cloud, Sun } from '../artb/core';
import { Heart } from '../artc/helpers';
import { Focus, Backdrop, Subject } from '../kit/focus';
import { useBeat } from './beats';

const TIMES = [0, 1000, 2800, 4600, 6200, 7600];
const CLOUD_AT = { x: 560, y: 560 };
const SUN_AT = { x: 1640, y: 520 };

/** Rain drops falling under the cloud (one-shot per drop: they fall from the cloud and stop at the floor). */
function Rain() {
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div key={i} style={{ position: 'absolute', left: 60 + i * 36, top: 260 }}
          initial={{ y: 0, opacity: 0 }} animate={{ y: [0, 300], opacity: [0, 1, 0] }}
          transition={{ duration: 0.9, delay: (i * 0.37) % 0.9, repeat: Infinity, ease: 'easeIn' }}>
          <Svg vw={20} vh={40} w={16}><path d="M10 2 Q20 22 10 36 Q0 22 10 2Z" fill={C.blue} stroke="#fff" strokeWidth={3} paintOrder="stroke" /></Svg>
        </motion.div>
      ))}
    </>
  );
}

export default function MoodIntro() {
  const beat = useBeat(TIMES);
  const sad = beat === 1;
  const sunny = beat >= 2;
  return (
    <Root>
      <Dots y={280} h={500} color={C.bg2} />
      <div style={{ position: 'absolute', left: -400, top: 900, width: 2720, height: 180, background: C.road }} />
      <div style={{ position: 'absolute', left: -400, top: 900, width: 2720, height: 18, background: C.road2 }} />
      <div style={{ position: 'absolute', left: 940, top: 380, width: 14, height: 520, borderRadius: 7, background: C.bg3 }} />
      <Focus active={beat >= 1}>
        <Backdrop>
          {/* grumpy customers: they walk off to the left once the cloud arrives */}
          {[0, 1, 2].map(i => (
            <motion.div key={i} style={{ position: 'absolute', left: 170 + i * 200, top: 640 }}
              animate={{ x: beat >= 1 ? -1000 : 0, opacity: beat >= 1 ? 0 : 1 }} transition={{ duration: 2.2, ease: 'easeIn', delay: i * 0.2 }}>
              <Person seed={i * 2 + 1} mood="sad" arms="down" walk flip size={190} />
            </motion.div>
          ))}
          {/* happy customers on the sunny side */}
          {[0, 1, 2].map(i => (
            <Abs key={i} x={1000 + i * 180} y={640}>
              <motion.div animate={{ y: sunny ? [0, -50, 0] : 0 }} transition={{ duration: 0.8, delay: i * 0.2, repeat: sunny ? Infinity : 0, repeatDelay: 0.2 }}>
                <Person seed={i * 3 + 4} mood="happy" arms="up" size={190} />
              </motion.div>
            </Abs>
          ))}
          {/* friends arrive */}
          {beat >= 3 && [0, 1].map(i => (
            <motion.div key={i} style={{ position: 'absolute', left: 1530 + i * 200, top: 660 }}
              initial={{ x: 420 }} animate={{ x: 0 }} transition={{ duration: 1.2, delay: i * 0.3, ease: 'easeOut' }}>
              <Person seed={i * 5 + 6} mood="happy" arms="wave" size={170} />
            </motion.div>
          ))}
          {beat >= 4 && [0, 1].map(i => <Abs key={i} x={1130 + i * 120} y={480 - i * 60}><Heart s={70} /></Abs>)}
        </Backdrop>
        {sad && (
          <Subject at={CLOUD_AT} scale={1.12}>
            <motion.div initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
              <div style={{ position: 'relative', width: 560, height: 420 }}>
                <Cloud w={520} color="#B8BFD6" shade="#8E96B4" style={{ position: 'absolute', left: 20, top: 0 }} />
                <Rain />
              </div>
            </motion.div>
          </Subject>
        )}
        {sunny && (
          <Subject at={SUN_AT} scale={1.12}>
            <motion.div initial={{ scale: 0.4, rotate: -40, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }}>
              <div style={{ width: 420, height: 420, display: 'grid', placeItems: 'center' }}>
                <Sun s={400} />
              </div>
            </motion.div>
          </Subject>
        )}
      </Focus>
    </Root>
  );
}
