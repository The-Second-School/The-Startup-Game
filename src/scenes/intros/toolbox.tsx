// Intro: a red toolbox pops open and tools bounce out with squash and stretch.
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useState, type CSSProperties } from 'react';
import { C, Abs, Root, Svg, Dots, Sparkle, Star } from '../artb/core';

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

// landing spots relative to the box centre, and how high each flies
const SPOTS = [{ x: -560, r: -18, h: 320 }, { x: -380, r: 12, h: 300 }, { x: -210, r: -8, h: 260 }, { x: 220, r: 10, h: 280 }, { x: 400, r: -14, h: 320 }, { x: 570, r: 20, h: 290 }];
const BX = 960, BY = 800; // box centre on stage

function Flyer({ i }: { i: number }) {
  const sp = SPOTS[i];
  const x = useMotionValue(0), y = useMotionValue(0), r = useMotionValue(0), sc = useMotionValue(0.3), sy = useMotionValue(1), op = useMotionValue(0);
  useEffect(() => {
    const d = 0.9 + i * 0.2, up = 0.55, down = 0.42;
    const ctl = [
      animate(x, [0, sp.x], { duration: up + down, delay: d, ease: 'linear' }),
      animate(y, [0, -sp.h, 150], { duration: up + down, delay: d, times: [0, up / (up + down), 1], ease: ['easeOut', 'easeIn'] }),
      animate(r, [0, 540 + sp.r * 4, sp.r], { duration: up + down, delay: d, times: [0, 0.7, 1], ease: 'easeOut' }),
      animate(sc, [0.3, 1.15, 1], { duration: up, delay: d, ease: 'easeOut' }),
      animate(op, [0, 1], { duration: 0.05, delay: d }),
      animate(sy, [1, 1, 0.7, 1.12, 0.96, 1], { duration: 0.6, delay: d + up + down - 0.05, times: [0, 0.01, 0.2, 0.5, 0.8, 1] }),
    ];
    return () => ctl.forEach(c => c.stop());
  }, [i, sp, x, y, r, sc, sy, op]);
  const sx = useTransform(sy, v => 2 - v);
  return (
    <motion.div style={{ position: 'absolute', left: BX - 100, top: BY - 140, x, y, rotate: r, scale: sc, scaleY: sy, scaleX: sx, opacity: op, transformOrigin: '50% 100%' }}>
      <div className="wobble" style={{ ['--d' as string]: `${0.7 + i * 0.13}s`, animationDelay: `${1.9 + i * 0.2}s` } as CSSProperties}><Tool k={i} /></div>
    </motion.div>
  );
}

function Toolbox({ open }: { open: boolean }) {
  return (
    <Svg vw={440} vh={320} w={560}>
      <g fill="#fff" stroke="#fff" strokeWidth={14}><rect x={20} y={110} width={400} height={200} rx={44} /></g>
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
        <path d="M150 48 Q150 0 220 0 Q290 0 290 48" stroke="#fff" strokeWidth={34} fill="none" /><path d="M150 48 Q150 4 220 4 Q290 4 290 48" stroke={C.steelEdge} strokeWidth={20} fill="none" /><path d="M156 46 Q156 10 220 10" stroke={C.steel} strokeWidth={10} fill="none" />
      </g>
    </Svg>
  );
}

export default function ToolboxIntro() {
  const [run, setRun] = useState(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
    const t = setTimeout(() => setOpen(true), 500);
    const iv = setTimeout(() => setRun(r => r + 1), 8200);
    return () => { clearTimeout(t); clearTimeout(iv); };
  }, [run]);
  return (
    <Root>
      <Dots y={260} h={600} color={C.bg2} />
      <div style={{ position: 'absolute', left: -400, top: 860, width: 2720, height: 220, background: C.wood }} /><div style={{ position: 'absolute', left: -400, top: 860, width: 2720, height: 20, background: C.woodHi }} />
      <Abs x={BX - 700} y={880} style={{ width: 1400, height: 40, borderRadius: 20, background: C.woodEdge, opacity: 0.35 }} />
      <div key={run}>
        <motion.div style={{ position: 'absolute', left: BX - 280, top: BY - 180 }} initial={{ y: -300, scaleY: 1.2 }} animate={{ y: 0, scaleY: [1.2, 0.88, 1.04, 1] }} transition={{ duration: 0.5 }}>
          <motion.div animate={open ? { scaleY: [1, 0.9, 1.06, 1], scaleX: [1, 1.05, 0.98, 1] } : {}} transition={{ duration: 0.5 }} style={{ transformOrigin: '50% 100%' }}><Toolbox open={open} /></motion.div>
        </motion.div>
        {open && SPOTS.map((_, i) => <Flyer key={i} i={i} />)}
        {open && <><Abs x={BX - 150} y={BY - 260} className="twinkle"><Sparkle s={90} color={C.sunHi} /></Abs><Abs x={BX + 90} y={BY - 280} className="twinkle" style={{ ['--dl' as string]: '.5s' } as CSSProperties}><Star s={70} /></Abs></>}
      </div>
    </Root>
  );
}
