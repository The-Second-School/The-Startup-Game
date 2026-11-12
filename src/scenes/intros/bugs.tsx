// Intro (Act 2, bug smash): a bug crawls onto the app screen, a hammer comes down on it with a splat, and a new bug arrives. Bugs keep coming.
import { motion } from 'motion/react';
import { C, Abs, Root, Svg, Dots, Star } from '../artb/core';
import { Focus, Backdrop, Subject } from '../kit/focus';
import { Splash, useBeat } from './beats';

const TIMES = [0, 900, 2600, 4200, 5800, 7400];
const SCREEN = { x: 960, y: 600, w: 860, h: 520 };

function Bug({ s = 150 }: { s?: number }) {
  const hue = C.rv, edge = C.rvEdge, hi = C.rvHi;
  return (
    <Svg vw={140} vh={120} w={s}>
      <g stroke="#fff" strokeWidth={16} fill="none">{[34, 60, 86].map(y => <g key={y}><path d={`M44 ${y} L12 ${y - 14}`} /><path d={`M96 ${y} L128 ${y - 14}`} /></g>)}</g>
      <g stroke={C.ink} strokeWidth={7} fill="none">
        {[34, 60, 86].map((y, i) => <g key={y} className={i % 2 ? 'legA' : 'legB'} style={{ transformOrigin: '70px 60px' }}><path d={`M44 ${y} L12 ${y - 14}`} /><path d={`M96 ${y} L128 ${y - 14}`} /></g>)}
      </g>
      <path d="M58 28 Q50 8 34 6 M82 28 Q90 8 106 6" stroke="#fff" strokeWidth={14} fill="none" /><path d="M58 28 Q50 8 34 6 M82 28 Q90 8 106 6" stroke={C.ink} strokeWidth={6} fill="none" />
      <ellipse cx={70} cy={66} rx={44} ry={46} fill="#fff" stroke="#fff" strokeWidth={10} />
      <ellipse cx={70} cy={66} rx={44} ry={46} fill={hue} />
      <path d="M70 26 V108" stroke={edge} strokeWidth={5} /><circle cx={46} cy={78} r={8} fill={hi} /><circle cx={94} cy={82} r={8} fill={hi} />
      <circle cx={54} cy={46} r={12} fill="#fff" /><circle cx={86} cy={46} r={12} fill="#fff" />
      <circle cx={56} cy={48} r={6} fill={C.ink} /><circle cx={84} cy={48} r={6} fill={C.ink} />
      <path d="M54 62 Q70 54 86 62" stroke={C.ink} strokeWidth={4} fill="none" />
    </Svg>
  );
}

/** The app screen: a calm little layout with a header, cards and a list. */
function AppScreen() {
  return (
    <div style={{ width: SCREEN.w, height: SCREEN.h, borderRadius: 56, background: '#fff', border: '8px solid #fff', boxShadow: 'var(--sh-sm)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: C.blueHi }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 84, background: C.blue }} />
      {[0, 1, 2].map(i => <div key={i} style={{ position: 'absolute', left: 36 + i * 54, top: 28, width: 28, height: 28, borderRadius: 14, background: ['#fff', C.sun, C.good][i] }} />)}
      {[0, 1, 2].map(i => <div key={i} style={{ position: 'absolute', left: 60 + i * 260, top: 130, width: 230, height: 180, borderRadius: 30, background: '#fff' }}><div style={{ margin: 22, height: 80, borderRadius: 22, background: [C.pink, C.sun, C.good][i] }} /><div style={{ margin: '0 22px', height: 18, borderRadius: 9, background: C.steel }} /></div>)}
      <div style={{ position: 'absolute', left: 60, top: 350, width: 740, height: 56, borderRadius: 28, background: '#fff' }} />
      <div style={{ position: 'absolute', left: 60, top: 436, width: 520, height: 56, borderRadius: 28, background: '#fff' }} />
    </div>
  );
}

export default function BugsIntro() {
  const beat = useBeat(TIMES);
  return (
    <Root>
      <Dots y={280} h={520} color={C.bg2} />
      <Focus active={beat >= 1}>
        <Backdrop>
          {/* once the screen is no longer the subject it sits calmly behind */}
          {beat >= 2 && <Abs x={SCREEN.x - SCREEN.w / 2} y={SCREEN.y - SCREEN.h / 2}><AppScreen /></Abs>}
          {beat >= 2 && beat < 4 && <Abs x={700} y={520}><Bug s={140} /></Abs>}
          {beat >= 2 && beat < 4 && <Abs x={1180} y={700}><Bug s={130} /></Abs>}
        </Backdrop>
        {beat === 1 && (
          <motion.div key="screen" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            style={{ position: 'absolute', left: 0, top: 0 }}>
            <Subject at={{ x: SCREEN.x, y: SCREEN.y }} scale={1.08}><AppScreen /></Subject>
          </motion.div>
        )}
        {beat === 2 && (
          <Subject at={{ x: SCREEN.x, y: 600 }} scale={1.12}>
            <motion.div initial={{ x: -260, y: 40 }} animate={{ x: [-260, 40, 40, -40], y: [40, 0, 0, -10] }} transition={{ duration: 1.5, ease: 'easeInOut' }}>
              <Bug s={320} />
            </motion.div>
          </Subject>
        )}
        {beat === 3 && (
          <Subject at={{ x: SCREEN.x, y: 540 }} scale={1.12}>
            <motion.div style={{ transformOrigin: '90% 90%' }} initial={{ rotate: 30, y: -90 }} animate={{ rotate: -42, y: 0 }} transition={{ duration: 0.6, ease: 'easeIn' }}>
              <Svg vw={300} vh={300} w={420}>
                <path d="M60 280 L210 120" stroke="#fff" strokeWidth={46} /><path d="M60 278 L208 121" stroke={C.wood} strokeWidth={26} />
                <rect x={140} y={34} width={150} height={90} rx={26} fill="#fff" stroke="#fff" strokeWidth={14} transform="rotate(-42 215 80)" />
                <rect x={140} y={34} width={150} height={90} rx={26} fill={C.bad} transform="rotate(-42 215 80)" />
                <rect x={156} y={44} width={60} height={14} rx={7} fill={C.badHi} transform="rotate(-42 215 80)" />
              </Svg>
            </motion.div>
          </Subject>
        )}
        {beat === 4 && (
          <Subject at={{ x: SCREEN.x, y: 600 }} scale={1.1}>
            <motion.div initial={{ scale: 0.2, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 12 }}>
              <div style={{ position: 'relative' }}>
                <Star s={340} color={C.good} edge={C.goodEdge} hi={C.goodHi} />
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 56, color: '#fff', transform: 'rotate(-8deg)' }}>SMASH!</div>
              </div>
            </motion.div>
          </Subject>
        )}
        {beat === 5 && (
          <Subject at={{ x: 1440, y: 640 }} scale={1.12}>
            <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 16 }}>
              <Bug s={300} />
            </motion.div>
          </Subject>
        )}
      </Focus>
      {beat === 4 && <Splash key="splat" x={SCREEN.x} y={600} n={14} r={260} />}
    </Root>
  );
}
