// Intro (Act 2, question 1): a red toolbox drops in and opens; each tool pops up on its own, then settles on the floor.
import { motion } from 'motion/react';
import { C, Abs, Root, Svg, Dots } from '../artb/core';
import { Focus, Backdrop, Subject } from '../kit/focus';
import { useBeat } from './beats';

const TIMES = [0, 900, 2000, 3000, 3900, 4800, 5700, 6600, 7500, 8600];
const TOOL_COUNT = 6;
// where each tool lands on the floor (centre x, y), around the box
const SPOTS = [[330, 690], [540, 860], [1390, 690], [1600, 860], [1500, 420], [400, 420]];
const BOX_X = 680, BOX_Y = 493;      // box top-left on the floor (560 wide, ends at y 900)

const Sil = ({ children }: { children: React.ReactNode }) => <g fill="#fff" stroke="#fff" strokeWidth={14}>{children}</g>;
function Tool({ k, s = 200 }: { k: number; s?: number }) {
  return (
    <Svg vw={120} vh={120} w={s}>
      {k === 0 && <g>
        <Sil><path d="M24 98 L68 54" strokeWidth={30} fill="none" /><rect x={42} y={12} width={52} height={30} rx={10} transform="rotate(42 68 27)" /></Sil>
        <path d="M24 97 L67 54" stroke={C.wood} strokeWidth={16} fill="none" />
        <rect x={42} y={12} width={52} height={30} rx={10} fill={C.steel} transform="rotate(42 68 27)" /><rect x={50} y={16} width={22} height={7} rx={3.5} fill={C.steelHi} transform="rotate(42 68 27)" /></g>}
      {k === 1 && <g>
        <Sil><path d="M30 94 L76 48" strokeWidth={26} fill="none" /><path d="M70 22 Q96 10 104 32 L90 36 L88 50 L74 52 Q54 42 70 22Z" /></Sil>
        <path d="M30 93 L75 48" stroke={C.steel} strokeWidth={14} fill="none" />
        <path d="M70 22 Q96 10 104 32 L90 36 L88 50 L74 52 Q54 42 70 22Z" fill={C.steel} stroke={C.steelEdge} strokeWidth={4} /><circle cx={82} cy={32} r={6} fill={C.steelEdge} /></g>}
      {k === 2 && <g>
        <Sil><path d="M22 100 L62 60" strokeWidth={26} fill="none" /><path d="M62 60 L94 28" strokeWidth={14} fill="none" /></Sil>
        <path d="M22 99 L61 60" stroke={C.bad} strokeWidth={18} fill="none" /><path d="M28 92 L40 80" stroke={C.badHi} strokeWidth={5} fill="none" />
        <path d="M62 60 L94 28" stroke={C.steelEdge} strokeWidth={9} fill="none" /><path d="M62 58 L92 28" stroke={C.steel} strokeWidth={5} fill="none" /></g>}
      {k === 3 && <g>
        <Sil><path d="M10 82 L104 40 L104 82Z" /><rect x={86} y={34} width={28} height={52} rx={12} /></Sil>
        <path d="M10 82 L104 40 L104 82Z" fill={C.steel} stroke={C.steelEdge} strokeWidth={4} />
        <path d="M18 82 l8 9 l8 -9 l8 9 l8 -9 l8 9 l8 -9 l8 9 l8 -9 l8 9" stroke={C.steelEdge} strokeWidth={5} fill="none" />
        <rect x={86} y={34} width={28} height={52} rx={12} fill={C.orange} /><rect x={92} y={42} width={7} height={26} rx={3.5} fill={C.orangeHi} /></g>}
      {k === 4 && <g>
        <Sil><rect x={8} y={36} width={104} height={46} rx={12} /></Sil>
        <rect x={8} y={36} width={104} height={46} rx={12} fill={C.sun} />
        {[24, 40, 56, 72, 88].map((x, i) => <path key={x} d={`M${x} 36 V${i % 2 ? 54 : 64}`} stroke={C.ink} strokeWidth={4} fill="none" />)}
        <rect x={14} y={70} width={40} height={6} rx={3} fill={C.sunHi} /></g>}
      {k === 5 && <g>
        <Sil><polygon points="60,16 98,38 98,82 60,104 22,82 22,38" /></Sil>
        <polygon points="60,16 98,38 98,82 60,104 22,82 22,38" fill={C.steel} />
        <circle cx={60} cy={62} r={21} fill={C.steelEdge} /><circle cx={60} cy={58} r={19} fill="#5E6C80" /><path d="M32 38 L56 24" stroke={C.steelHi} strokeWidth={6} fill="none" /></g>}
    </Svg>
  );
}

function Toolbox({ open }: { open: boolean }) {
  return (
    <Svg vw={440} vh={320} w={560}>
      <rect x={20} y={110} width={400} height={200} rx={44} fill="#fff" stroke="#fff" strokeWidth={14} />
      <rect x={20} y={110} width={400} height={192} rx={44} fill={C.bad} />
      <rect x={20} y={110} width={400} height={64} rx={30} fill={C.blueDeep} />
      <rect x={20} y={120} width={400} height={30} fill={C.ink} opacity={0.35} />
      <rect x={20} y={170} width={400} height={12} fill={C.badEdge} />
      <rect x={40} y={192} width={110} height={16} rx={8} fill={C.badHi} />
      <rect x={190} y={182} width={60} height={50} rx={16} fill={C.sun} /><rect x={210} y={196} width={20} height={14} rx={7} fill={C.sunEdge} />
      <circle cx={70} cy={268} r={10} fill={C.badEdge} /><circle cx={370} cy={268} r={10} fill={C.badEdge} />
      {/* lid hinged on the left edge */}
      <g style={{ transformOrigin: '30px 118px', transform: open ? 'rotate(-112deg)' : 'rotate(0deg)', transition: 'transform .55s cubic-bezier(.34,1.56,.64,1)' }}>
        <rect x={20} y={46} width={400} height={78} rx={36} fill="#fff" stroke="#fff" strokeWidth={12} />
        <rect x={20} y={46} width={400} height={74} rx={36} fill={C.bad} />
        <rect x={40} y={56} width={120} height={14} rx={7} fill={C.badHi} />
        <path d="M150 48 Q150 0 220 0 Q290 0 290 48" stroke="#fff" strokeWidth={34} fill="none" /><path d="M150 48 Q150 4 220 4 Q290 4 290 48" stroke={C.steelEdge} strokeWidth={20} fill="none" />
      </g>
    </Svg>
  );
}

export default function ToolboxIntro() {
  const beat = useBeat(TIMES);
  const toolIndex = beat - 3;                 // which tool is the subject right now (0..5)
  const showTool = toolIndex >= 0 && toolIndex < TOOL_COUNT;
  const showBox = beat === 1 || beat === 2;   // the box is the subject while it drops and opens
  return (
    <Root>
      <Dots y={260} h={600} color={C.bg2} />
      <div style={{ position: 'absolute', left: -400, top: 900, width: 2720, height: 180, background: C.wood }} />
      <div style={{ position: 'absolute', left: -400, top: 900, width: 2720, height: 20, background: C.woodHi }} />
      <Focus active={beat >= 1 && beat <= 8}>
        <Backdrop>
          {beat >= 3 && <Abs x={BOX_X} y={BOX_Y}><Toolbox open /></Abs>}
          {SPOTS.map(([cx, cy], i) => i < toolIndex && (
            <Abs key={i} x={cx - 100} y={cy - 100}><Tool k={i} s={200} /></Abs>
          ))}
        </Backdrop>
        {showBox && (
          <motion.div key="box" initial={{ y: -420 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 14 }}
            style={{ position: 'absolute', left: 0, top: 0 }}>
            <Subject at={{ x: 960, y: 640 }} scale={1.12}><Toolbox open={beat === 2} /></Subject>
          </motion.div>
        )}
        {showTool && (
          <Subject key={`t${toolIndex}`} at={{ x: 960, y: 520 }} scale={1.15}>
            <motion.div initial={{ scale: 0.3, rotate: -25 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
              <Tool k={toolIndex} s={360} />
            </motion.div>
          </Subject>
        )}
      </Focus>
    </Root>
  );
}
