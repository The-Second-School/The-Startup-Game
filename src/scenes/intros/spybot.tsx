// Intro (Act 1, question 2): Jhootu tiptoes to a nervous idea notebook, freezes when he feels watched, then gets caught.
import { motion } from 'motion/react';
import { C, Abs, Root, Svg, Dots, Cloud } from '../artb/core';
import { Fibbot } from '../../ui';
import { Focus, Backdrop, Subject } from '../kit/focus';
import { Splash, useBeat } from './beats';

const TIMES = [0, 1200, 2800, 4200, 5600, 7000];
const MOOD = ['sneaky', 'sneaky', 'shock', 'sneaky', 'angry', 'angry'] as const;
const X = [-600, 0, 0, 420, 420, 420];  // Jhootu's walk, relative to his stop at x 760
const SUBJECT_X = 760, SUBJECT_Y = 700;

function Notebook({ scared }: { scared: boolean }) {
  return (
    <Svg vw={210} vh={270} w={250}>
      <rect x={14} y={16} width={186} height={246} rx={28} fill="#fff" stroke="#fff" strokeWidth={12} />
      <rect x={14} y={16} width={186} height={246} rx={28} fill={C.blue} />
      <rect x={24} y={28} width={60} height={12} rx={6} fill={C.blueHi} />
      {[50, 100, 150, 200].map(y => <rect key={y} x={4} y={y} width={26} height={14} rx={7} fill={C.steelHi} stroke={C.steelEdge} strokeWidth={4} />)}
      <rect x={56} y={150} width={110} height={84} rx={20} fill="#fff" />
      <circle cx={111} cy={188} r={22} fill={C.sun} /><rect x={100} y={206} width={22} height={14} rx={5} fill={C.steel} />
      <path d="M98 190 L106 180 L114 190 L122 178" stroke={C.sunEdge} strokeWidth={4} fill="none" />
      <circle cx={80} cy={78} r={22} fill="#fff" /><circle cx={134} cy={78} r={22} fill="#fff" />
      <g style={{ transform: scared ? 'translateX(-5px)' : 'translateX(6px)', transition: 'transform .3s' }}>
        <circle cx={82} cy={80} r={11} fill={C.ink} /><circle cx={136} cy={80} r={11} fill={C.ink} />
      </g>
      <path d="M62 52 L96 58 M152 52 L118 58" stroke={C.ink} strokeWidth={6} fill="none" />
      <path d="M92 118 Q108 108 124 118" stroke={C.ink} strokeWidth={6} fill="none" />
      {scared && <path d="M172 60 q-8 16 0 22 q8 -6 0 -22z" fill={C.blueHi} stroke="#fff" strokeWidth={3} />}
    </Svg>
  );
}

export default function SpyBotIntro() {
  const beat = useBeat(TIMES);
  const caught = beat >= 4;
  return (
    <Root>
      <Focus active={beat >= 1}>
        <Backdrop>
          <Dots y={260} h={500} color={C.bg2} />
          <Abs x={170} y={400}>
            <div style={{ width: 380, height: 300, borderRadius: 40, background: C.sky, border: '12px solid #fff', boxShadow: 'var(--sh-sm)', position: 'relative', overflow: 'hidden' }}>
              <Abs x={30} y={40}><Cloud w={140} /></Abs>
            </div>
          </Abs>
          <div style={{ position: 'absolute', left: -400, top: 880, width: 2720, height: 200, background: C.wood }} />
          <div style={{ position: 'absolute', left: -400, top: 880, width: 2720, height: 20, background: C.woodHi }} />
          <Abs x={1300} y={680}><div style={{ width: 520, height: 60, borderRadius: 24, background: C.wood, border: '5px solid #fff' }} /></Abs>
          <Abs x={1380} y={400}><Notebook scared={beat === 2 || caught} /></Abs>
        </Backdrop>
        {/* Jhootu walks in, sneaks up to the notebook, then is caught */}
        <motion.div initial={false} animate={{ x: X[beat], opacity: beat ? 1 : 0 }}
          transition={{ x: { duration: 1.2, ease: 'easeInOut' }, opacity: { duration: 0.4 } }}
          style={{ position: 'absolute', left: 0, top: 0 }}>
          <Subject at={{ x: SUBJECT_X, y: SUBJECT_Y }} scale={1.12}>
            <Fibbot mood={MOOD[beat]} size={380} />
          </Subject>
        </motion.div>
      </Focus>
      {caught && <Splash x={1505} y={560} />}
    </Root>
  );
}
