// Intro (Act 4, money): a market street with customers walking by on foot. Four investors in smart clothes walk in one by one,
// each carrying a bag of coins: a kind mentor, Fibbot, a pushy boss, and the Mama-Mami couple. Then they all stand together.
import { motion } from 'motion/react';
import type { CSSProperties } from 'react';
import { C, Abs, Root, Dots, Person } from '../artb/core';
import { Stall } from '../artc/helpers';
import { Fibbot } from '../../ui';
import { Focus, Backdrop, Subject } from '../kit/focus';
import { useBeat } from './beats';

const TIMES = [0, 1200, 3000, 4800, 6600, 8200];
const FLOOR = 905;

type Look = {
  suit: string; tie: string; skin: string; hair: string; style: 'grey' | 'slick' | 'bun';
  face: 'kind' | 'pushy' | 'happy'; pose: 'bag' | 'point'; glasses?: boolean; stache?: boolean; dress?: boolean;
};

const MENTOR: Look = { suit: '#3D7A6E', tie: '#FFC800', skin: '#B97A50', hair: '#D9D9D9', style: 'grey', face: 'kind', pose: 'bag', glasses: true };
const BOSS: Look = { suit: '#2B2F45', tie: '#E8413C', skin: '#8C5A3C', hair: '#24170D', style: 'slick', face: 'pushy', pose: 'point' };
const MAMA: Look = { suit: '#6B4E9B', tie: '#FFC800', skin: '#C98B5E', hair: '#3A2414', style: 'slick', face: 'happy', pose: 'bag', stache: true };
const MAMI: Look = { suit: '#F08A4B', tie: '#FFFFFF', skin: '#A86B45', hair: '#24170D', style: 'bun', face: 'happy', pose: 'bag', dress: true };

// where each investor stands: centre x, top, box width and height (feet on FLOOR)
const SLOT = [
  { x: 360, top: 380, w: 260, h: 530 },   // mentor
  { x: 780, top: 510, w: 420, h: 420 },   // Jhootu
  { x: 1200, top: 380, w: 260, h: 530 },  // boss
  { x: 1620, top: 380, w: 560, h: 530 },  // Mama-Mami couple
];

/** A bag of coins (drawn in a 100 x 100 space, placed with its top-left at x, y). */
function BagG({ x, y }: { x: number; y: number }) {
  const sack = 'M18 40 Q50 22 82 40 L92 100 Q50 116 8 100 Z';
  return (
    <g transform={`translate(${x} ${y}) scale(0.9)`}>
      <path d="M34 30 Q50 6 66 30" stroke={C.coinEdge} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={sack} fill="#fff" stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
      <path d={sack} fill={C.sun} />
      <text x={50} y={86} textAnchor="middle" fontFamily="'Baloo 2', system-ui" fontWeight={800} fontSize={44} fill={C.sunEdge}>₹</text>
    </g>
  );
}

/** A smart-dressed grown-up: jacket (or dress), shirt, tie, hair, face. Drawn in a 260 x 530 box, feet at the bottom. */
function Smart({ l }: { l: Look }) {
  const ink = C.ink;
  const cap = l.style === 'grey'
    ? 'M79 96 C74 46 116 36 132 40 C170 42 186 66 181 98 C170 78 156 70 130 70 C104 70 90 80 79 96Z'
    : 'M78 100 C72 50 112 40 132 42 C172 44 188 68 182 100 C170 82 150 66 124 66 C104 68 88 80 78 100Z';
  return (
    <svg width={260} height={530} viewBox="0 0 260 530" style={{ overflow: 'visible', display: 'block' }} strokeLinecap="round" strokeLinejoin="round">
      {/* shoes and trousers (a dress covers the legs) */}
      {!l.dress && <><rect x={92} y={352} width={30} height={150} rx={14} fill="#2E3A59" /><rect x={138} y={352} width={30} height={150} rx={14} fill="#2E3A59" /></>}
      <ellipse cx={107} cy={512} rx={26} ry={12} fill={ink} /><ellipse cx={153} cy={512} rx={26} ry={12} fill={ink} />
      {/* jacket or dress */}
      {l.dress
        ? <path d="M84 170 L176 170 L218 500 L42 500 Z" fill={l.suit} />
        : <rect x={66} y={168} width={128} height={206} rx={44} fill={l.suit} />}
      {/* neck, shirt, tie */}
      <rect x={118} y={144} width={24} height={34} fill={l.skin} />
      {!l.dress && <>
        <path d="M104 172 L130 232 L156 172 Z" fill="#fff" />
        <path d="M122 186 L138 186 L142 252 L130 268 L118 252 Z" fill={l.tie} />
      </>}
      {/* back arm hangs down */}
      <path d="M72 186 Q50 262 56 340" stroke={l.suit} strokeWidth={26} fill="none" />
      <circle cx={57} cy={352} r={13} fill={l.skin} />
      {/* front arm: holds the bag, or points */}
      {l.pose === 'point' ? <>
        <path d="M188 186 Q228 170 246 124" stroke={l.suit} strokeWidth={26} fill="none" />
        <circle cx={248} cy={116} r={13} fill={l.skin} />
        <path d="M252 110 L272 82" stroke={l.skin} strokeWidth={10} fill="none" />
      </> : <>
        <path d="M188 186 Q206 262 200 340" stroke={l.suit} strokeWidth={26} fill="none" />
        <circle cx={200} cy={352} r={13} fill={l.skin} />
        <BagG x={158} y={326} />
      </>}
      {/* head and hair */}
      <circle cx={80} cy={104} r={11} fill={l.skin} /><circle cx={180} cy={104} r={11} fill={l.skin} />
      <circle cx={130} cy={100} r={52} fill={l.skin} />
      {l.style === 'bun' && <circle cx={130} cy={40} r={22} fill={l.hair} />}
      <path d={cap} fill={l.hair} />
      {/* face */}
      {l.face === 'pushy'
        ? <g stroke={ink} strokeWidth={5} fill="none"><path d="M96 86 L120 96" /><path d="M164 86 L140 96" /></g>
        : <g stroke={ink} strokeWidth={5} fill="none"><path d="M98 94 Q110 86 120 94" /><path d="M140 94 Q150 86 162 94" /></g>}
      <circle cx={110} cy={106} r={6} fill={ink} /><circle cx={150} cy={106} r={6} fill={ink} />
      {l.glasses && <g stroke={ink} strokeWidth={4} fill="none"><circle cx={110} cy={106} r={15} /><circle cx={150} cy={106} r={15} /><path d="M125 106 H135" /></g>}
      {l.stache && <path d="M114 120 Q130 110 146 120 Q130 126 114 120Z" fill="#2B1D10" />}
      {l.face === 'pushy'
        ? <path d="M112 124 Q130 148 148 124 Z" fill={ink} />
        : <path d="M114 124 Q130 140 146 124" stroke={ink} strokeWidth={5} fill="none" />}
    </svg>
  );
}

/** The investor's figure (no position). */
function who(k: number) {
  if (k === 0) return <Smart l={MENTOR} />;
  if (k === 1) return (
    <div style={{ position: 'relative', width: 420, height: 420 }}>
      <Fibbot mood="sneaky" size={420} />
      <svg width={130} height={130} viewBox="0 0 130 130" style={{ position: 'absolute', left: 280, top: 250, overflow: 'visible' }}>
        <BagG x={0} y={0} />
      </svg>
    </div>
  );
  if (k === 2) return <Smart l={BOSS} />;
  return (
    <div style={{ position: 'relative', width: 560, height: 530 }}>
      <div style={{ position: 'absolute', left: 0, top: 0 }}><Smart l={MAMA} /></div>
      <div style={{ position: 'absolute', left: 300, top: 0 }}><Smart l={MAMI} /></div>
    </div>
  );
}

export default function InvestorsIntro() {
  const beat = useBeat(TIMES);
  const arriving = beat >= 1 && beat <= 4 ? beat - 1 : -1;   // the investor walking in right now
  return (
    <Root>
      <Dots y={280} h={500} color={C.bg2} />
      <div style={{ position: 'absolute', left: -400, top: FLOOR, width: 2720, height: 200, background: C.road }} />
      <div style={{ position: 'absolute', left: -400, top: FLOOR, width: 2720, height: 18, background: C.road2 }} />
      <Focus active={arriving >= 0}>
        <Backdrop>
          <Abs x={-20} y={470}><Stall s={280} color={C.bad} /></Abs>
          <Abs x={1040} y={470}><Stall s={280} color={C.good} /></Abs>
          {/* customers walking by on foot */}
          {[0, 1, 2, 3].map(i => (
            <Abs key={i} x={1950} y={FLOOR - 265} className="drift" style={{ ['--d' as string]: `${26 + i * 3}s`, ['--dx' as string]: '-2500px', ['--dl' as string]: `${-i * 7}s` } as CSSProperties}>
              <Person seed={i + 1} mood="happy" arms="wave" walk flip size={170} />
            </Abs>
          ))}
          {/* investors who have already arrived stay where they stood */}
          {SLOT.map((s, j) => beat > j + 1 && (
            <Abs key={j} x={s.x - s.w / 2} y={s.top}>{who(j)}</Abs>
          ))}
        </Backdrop>
        {arriving >= 0 && (
          <motion.div key={arriving} initial={{ x: 1100 }} animate={{ x: 0 }} transition={{ duration: 1.4, ease: 'easeOut' }}
            style={{ position: 'absolute', left: 0, top: 0 }}>
            <Subject at={{ x: SLOT[arriving].x, y: SLOT[arriving].top + SLOT[arriving].h / 2 }} scale={1.1}>
              {who(arriving)}
            </Subject>
          </motion.div>
        )}
      </Focus>
    </Root>
  );
}
