// Intro: rAIvan's sneaky spy-bot tiptoes towards a nervous idea notebook, freezing whenever it "feels watched".
import { animate, motion, useMotionValue } from 'motion/react';
import { useEffect, useState, type CSSProperties } from 'react';
import { C, Abs, Root, Svg, Dots, Cloud, Sparkle, Burst } from '../artb/core';

function SpyBot({ look, caught }: { look: boolean; caught: boolean }) {
  return (
    <Svg vw={240} vh={390} w={270}>
      {/* legs */}
      <g className={caught || look ? undefined : 'legA'} style={{ transformOrigin: '100px 270px', ['--wd' as string]: '.55s' } as CSSProperties}>
        <rect x={90} y={268} width={22} height={90} rx={11} fill={C.rvEdge} stroke="#fff" strokeWidth={7} paintOrder="stroke" /><ellipse cx={104} cy={366} rx={26} ry={12} fill={C.ink} />
      </g>
      <g className={caught || look ? undefined : 'legB'} style={{ transformOrigin: '140px 270px', ['--wd' as string]: '.55s' } as CSSProperties}>
        <rect x={128} y={268} width={22} height={90} rx={11} fill={C.rvEdge} stroke="#fff" strokeWidth={7} paintOrder="stroke" /><ellipse cx={146} cy={366} rx={26} ry={12} fill={C.ink} />
      </g>
      <g style={{ transform: look ? 'rotate(-6deg)' : undefined, transformOrigin: '120px 340px', transition: 'transform .25s' }}>
        {/* coat */}
        <path d="M62 150 Q60 290 74 304 H166 Q180 290 178 150Z" fill="#fff" stroke="#fff" strokeWidth={12} />
        <path d="M62 150 Q60 290 74 304 H166 Q180 290 178 150Z" fill={C.rvEdge} />
        <path d="M120 170 V304" stroke={C.rvDeep} strokeWidth={6} fill="none" />
        <rect x={62} y={226} width={116} height={14} fill={C.rvDeep} /><rect x={110} y={222} width={20} height={22} rx={5} fill={C.sun} />
        <path d="M70 160 Q80 290 90 300" stroke={C.rv} strokeWidth={8} fill="none" opacity={0.7} />
        <path d="M120 156 L84 184 L106 200Z M120 156 L156 184 L134 200Z" fill={C.rvHi} stroke="#fff" strokeWidth={5} paintOrder="stroke" />
        {/* arms */}
        <g style={{ transform: caught ? 'rotate(-30deg)' : look ? 'rotate(10deg)' : undefined, transformOrigin: '66px 170px', transition: 'transform .2s' }}>
          <path d="M66 170 Q30 200 36 250" stroke="#fff" strokeWidth={34} fill="none" /><path d="M66 170 Q30 200 36 250" stroke={C.rvEdge} strokeWidth={22} fill="none" /><circle cx={36} cy={254} r={15} fill={C.rvHi} stroke="#fff" strokeWidth={6} paintOrder="stroke" />
        </g>
        <path d="M176 170 Q216 190 214 240" stroke="#fff" strokeWidth={34} fill="none" /><path d="M176 170 Q216 190 214 240" stroke={C.rvEdge} strokeWidth={22} fill="none" /><circle cx={214} cy={244} r={15} fill={C.rvHi} stroke="#fff" strokeWidth={6} paintOrder="stroke" />
        {/* head */}
        <line x1={120} y1={54} x2={120} y2={22} stroke={C.rvDeep} strokeWidth={7} /><circle cx={120} cy={18} r={11} fill={C.bad} className="pulse" style={{ transformOrigin: '120px 18px', ['--d' as string]: '.7s' } as CSSProperties} />
        <rect x={64} y={52} width={112} height={108} rx={42} fill="#fff" stroke="#fff" strokeWidth={12} />
        <rect x={64} y={50} width={112} height={108} rx={42} fill={C.rv} />
        <rect x={76} y={62} width={40} height={14} rx={7} fill={C.rvHi} />
        {/* sunglasses */}
        <rect x={72} y={90} width={96} height={36} rx={16} fill={C.ink} /><rect x={80} y={96} width={30} height={9} rx={4.5} fill="#fff" opacity={0.55} /><rect x={130} y={96} width={26} height={9} rx={4.5} fill="#fff" opacity={0.55} />
        <path d="M84 138 Q120 150 156 138" stroke={C.ink} strokeWidth={7} fill="none" />
        <path d="M150 142 Q160 138 166 130" stroke={C.ink} strokeWidth={0} fill="none" />
        {caught && <path d="M96 140 Q120 120 144 140" stroke={C.ink} strokeWidth={7} fill="none" />}
        {/* fedora */}
        <ellipse cx={120} cy={56} rx={76} ry={15} fill={C.ink} stroke="#fff" strokeWidth={7} paintOrder="stroke" />
        <path d="M76 54 Q74 14 120 12 Q166 14 164 54Z" fill={C.ink} stroke="#fff" strokeWidth={7} paintOrder="stroke" />
        <rect x={76} y={40} width={88} height={13} fill={C.bad} />
        <path d="M84 28 Q92 16 108 14" stroke="#fff" strokeWidth={5} fill="none" opacity={0.35} />
      </g>
    </Svg>
  );
}

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
      {/* worried eyes */}
      <circle cx={80} cy={78} r={22} fill="#fff" /><circle cx={134} cy={78} r={22} fill="#fff" />
      <g style={{ transform: scared ? 'translateX(-5px)' : 'translateX(6px)', transition: 'transform .3s' }}><circle cx={82} cy={80} r={11} fill={C.ink} /><circle cx={136} cy={80} r={11} fill={C.ink} /><circle cx={78} cy={74} r={4} fill="#fff" /><circle cx={132} cy={74} r={4} fill="#fff" /></g>
      <path d="M62 52 L96 58 M152 52 L118 58" stroke={C.ink} strokeWidth={6} fill="none" />
      <path d="M92 118 Q108 108 124 118" stroke={C.ink} strokeWidth={6} fill="none" />
      {scared && <path d="M172 60 q-8 16 0 22 q8 -6 0 -22z" fill={C.blueHi} stroke="#fff" strokeWidth={3} />}
    </Svg>
  );
}

const STOPS = [380, 700, 960, 1130];
export default function SpyBotIntro() {
  const x = useMotionValue(-340);
  const [look, setLook] = useState(false);
  const [caught, setCaught] = useState(false);
  const [moving, setMoving] = useState(false);
  const [boom, setBoom] = useState(0);
  useEffect(() => {
    let alive = true;
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    (async () => {
      while (alive) {
        x.set(-340); setCaught(false); setLook(false);
        await sleep(400);
        for (let i = 0; i < STOPS.length && alive; i++) {
          setMoving(true); setLook(false);
          await animate(x, STOPS[i], { duration: 1.05, ease: 'easeInOut' });
          setMoving(false);
          if (i < STOPS.length - 1) { setLook(true); await sleep(900); }
        }
        if (!alive) return;
        setCaught(true); setBoom(b => b + 1);
        await sleep(1100);
        setMoving(true);
        await animate(x, -420, { duration: 0.9, ease: 'easeIn' });
        setMoving(false);
        await sleep(400);
      }
    })();
    return () => { alive = false; };
  }, [x]);
  return (
    <Root>
      <Dots y={260} h={500} color={C.bg2} />
      {/* wall window */}
      <Abs x={170} y={400}><div style={{ width: 380, height: 300, borderRadius: 40, background: C.sky, border: '12px solid #fff', boxShadow: 'var(--sh-sm)' }}>
        <div style={{ position: 'absolute', left: 190, top: 20, width: 12, height: 270, background: '#fff' }} /><div style={{ position: 'absolute', left: 20, top: 130, width: 340, height: 12, background: '#fff' }} />
        <Abs x={30} y={40} className="drift" style={{ ['--dx' as string]: '200px', ['--d' as string]: '30s' } as CSSProperties}><Cloud w={140} /></Abs></div></Abs>
      <div style={{ position: 'absolute', left: 0, top: 880, width: 1920, height: 200, background: C.wood }} />
      <div style={{ position: 'absolute', left: 0, top: 880, width: 1920, height: 20, background: C.woodHi }} />
      {[0, 1, 2, 3, 4, 5].map(i => <div key={i} style={{ position: 'absolute', left: i * 340 + 40, top: 940, width: 220, height: 12, borderRadius: 6, background: C.woodEdge, opacity: 0.5 }} />)}
      {/* desk with notebook */}
      <Abs x={1330} y={640}>
        <div style={{ position: 'relative', width: 520, height: 260 }}>
          <div style={{ position: 'absolute', left: 30, top: 48, width: 40, height: 212, borderRadius: 14, background: C.woodEdge }} /><div style={{ position: 'absolute', right: 30, top: 48, width: 40, height: 212, borderRadius: 14, background: C.woodEdge }} />
          <div style={{ position: 'absolute', left: 0, top: 0, width: 520, height: 52, borderRadius: 24, background: C.wood, border: '5px solid #fff' }} />
        </div>
      </Abs>
      <motion.div style={{ position: 'absolute', left: 1450, top: 420 }} animate={caught ? { y: [0, -50, 0], rotate: [0, 12, -8, 0] } : { y: 0 }} transition={{ duration: 0.7 }}>
        <div className={look ? 'shake' : 'bob'} style={{ ['--amp' as string]: '6px', ['--d' as string]: look ? '.2s' : '2.4s' } as CSSProperties}><Notebook scared={look || caught} /></div>
      </motion.div>
      {/* shadow + spy */}
      <motion.div style={{ position: 'absolute', left: 0, top: 0, x }}>
        <div style={{ position: 'absolute', left: 30, top: 880, width: 200, height: 36, borderRadius: '50%', background: C.woodEdge, opacity: 0.5 }} />
        <Abs x={0} y={520}>
          <div className={moving ? 'step' : undefined} style={{ ['--wd' as string]: '.3s' } as CSSProperties}><SpyBot look={look} caught={caught} /></div>
          {look && <Abs x={190} y={-10}><motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}><Sparkle s={64} color={C.sun} /></motion.div></Abs>}
        </Abs>
      </motion.div>
      {boom > 0 && <div key={boom}><Burst x={1500} y={560} n={12} r={190} d={1.2} colors={[C.sun, C.rvHi, '#fff', C.blueHi]} /></div>}
    </Root>
  );
}
