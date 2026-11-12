// Intro (Act 5, copies): Jhootu's Copy-O-Matic spits out fake copies; then an angry Jhootu steps up to watch them pile up.
import { motion } from 'motion/react';
import { C, Abs, Root, Dots, Star, Coin } from '../artb/core';
import { Copier, FakeSheet } from '../artb/props';
import { Fibbot } from '../../ui';
import { Focus, Backdrop, Subject } from '../kit/focus';
import { useBeat } from './beats';

const TIMES = [0, 1000, 2800, 4800, 6800];
const COPIER_AT = { x: 700, y: 620 };
const FIBBOT_AT = { x: 1420, y: 690 };
const SHEETS = [{ fx: -150, rot: -30, d: 0 }, { fx: 130, rot: 26, d: 0.35 }, { fx: -40, rot: -10, d: 0.7 }];
const PILE = [{ x: 380, y: 760, r: -12 }, { x: 560, y: 790, r: 9 }, { x: 740, y: 760, r: -4 }, { x: 900, y: 800, r: 14 }];

export default function CopierIntro() {
  const beat = useBeat(TIMES);
  const onCopier = beat === 1 || beat === 2;
  return (
    <Root>
      <Dots y={280} h={500} color={C.bg2} />
      <div style={{ position: 'absolute', left: -400, top: 900, width: 2720, height: 180, background: C.road }} />
      <div style={{ position: 'absolute', left: -400, top: 900, width: 2720, height: 18, background: C.road2 }} />
      <Focus active={beat >= 1}>
        <Backdrop>
          {beat >= 3 && <Abs x={COPIER_AT.x - 260} y={COPIER_AT.y - 220}><Copier s={520} mood="sneaky" /></Abs>}
          {beat >= 3 && PILE.slice(0, beat - 1).map((p, i) => (
            <Abs key={i} x={p.x - 60} y={p.y - 70} style={{ transform: `rotate(${p.r}deg)` }}>
              <FakeSheet s={120}>{i % 2 ? <Star s={60} /> : <Coin s={60} />}</FakeSheet>
            </Abs>
          ))}
        </Backdrop>
        {beat >= 1 && (
          <Subject at={onCopier ? COPIER_AT : FIBBOT_AT} scale={1.12}>
            {onCopier ? (
              <motion.div key="copier" initial={{ y: -300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
                <div style={{ position: 'relative', width: 520, height: 440 }}>
                  <Copier s={520} mood="sneaky" />
                  {beat === 2 && SHEETS.map((p, i) => (
                    <motion.div key={i} initial={{ x: 200, y: 200, opacity: 0, rotate: 0 }} animate={{ x: 200 + p.fx, y: 330, opacity: 1, rotate: p.rot }}
                      transition={{ duration: 1.0, delay: p.d, ease: 'easeIn' }} style={{ position: 'absolute', left: 0, top: 0 }}>
                      <FakeSheet s={120}>{i % 2 ? <Star s={60} /> : <Coin s={60} />}</FakeSheet>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="fibbot" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
                <Fibbot mood="angry" size={460} />
              </motion.div>
            )}
          </Subject>
        )}
      </Focus>
    </Root>
  );
}
