// Step 3, Launch it: an empty shop with crickets, a party with no guests, then a billboard and a megaphone fill the street.
import { motion } from 'motion/react';
import { memo, type CSSProperties } from 'react';
import {
  Bunting, Burst, Bush, Clouds, FarSkyline, FlyingBus, Ground, HUE, INK, Kid, NearSkyline, SPRING, Sky, Slab,
  Streetlight, Svg, full, soft, useSubstep, type SkyTone,
} from '../kit';
import { Building, CoinBit, Mv, Show } from '../shared/bits';
import type { SceneBodyProps } from '../types';

const SX = 960, SY = 900; // shop stall position (bottom-centre)

const Cricket = ({ s = 1 }: { s?: number }) => (
  <svg width={70 * s} height={46 * s} viewBox="0 0 70 46" style={{ overflow: 'visible' }}>
    <path d="M14 36 L2 44 M30 36 L24 46 M46 36 L52 46" stroke={INK} strokeWidth={4} fill="none" />
    <ellipse cx={34} cy={22} rx={28} ry={16} fill={HUE.green.base} />
    <ellipse cx={22} cy={16} rx={12} ry={5} fill={HUE.green.hi} />
    <circle cx={60} cy={20} r={9} fill={HUE.green.base} /><circle cx={63} cy={18} r={3} fill={INK} />
    <path d="M64 12 Q70 2 76 4" stroke={INK} strokeWidth={3} fill="none" />
  </svg>
);

const Balloon = ({ hue, x, d }: { hue: typeof HUE.red; x: number; d: number }) => (
  <div className="k-bob" style={{ position: 'absolute', left: x, top: 0, ['--delay' as string]: `${d}s`, ['--dur' as string]: '3s', ['--bob' as string]: '14px' } as CSSProperties}>
    <svg width={90} height={200} viewBox="0 0 90 200" style={{ overflow: 'visible' }}>
      <path d="M45 118 Q30 160 48 200" stroke={INK} strokeWidth={3} fill="none" />
      <ellipse cx={45} cy={56} rx={42} ry={52} fill="#fff" /><ellipse cx={45} cy={56} rx={36} ry={46} fill={hue.base} />
      <ellipse cx={30} cy={36} rx={9} ry={14} fill={hue.hi} transform="rotate(20 30 36)" />
      <path d="M38 106 L45 98 L52 106Z" fill={hue.base} />
    </svg>
  </div>
);

const Billboard = () => (
  <svg width={760} height={620} viewBox="0 0 760 620" style={{ overflow: 'visible' }} strokeLinecap="round" strokeLinejoin="round">
    <rect x={150} y={300} width={34} height={320} rx={12} fill={HUE.steel.edge} /><rect x={576} y={300} width={34} height={320} rx={12} fill={HUE.steel.edge} />
    <rect x={150} y={300} width={12} height={320} rx={6} fill={HUE.steel.hi} /><rect x={576} y={300} width={12} height={320} rx={6} fill={HUE.steel.hi} />
    <Slab x={20} y={20} w={720} h={340} r={54} hue={soft(HUE.sun, 0.25)} border={12} />
    <rect x={56} y={56} width={648} height={268} rx={36} fill="#fff" />
    <g transform="translate(130 40) scale(.78)"><Shop /></g>
    <text x={520} y={150} textAnchor="middle" fontSize={78} fontWeight={800} fill={HUE.red.base} fontFamily="inherit">NOW</text>
    <text x={520} y={232} textAnchor="middle" fontSize={78} fontWeight={800} fill={HUE.blue.base} fontFamily="inherit">OPEN!</text>
    <path d="M410 262 H630" stroke={HUE.sun.base} strokeWidth={14} />
    {[100, 660].map(x => <circle key={x} cx={x} cy={40} r={11} fill={HUE.sun.edge} />)}
  </svg>
);
function Shop() {
  return <g><foreignObject x={0} y={0} width={220} height={300}><div style={{ lineHeight: 0 }}><Building kind={0} size={270} /></div></foreignObject></g>;
}

const Megaphone = () => (
  <svg width={300} height={240} viewBox="0 0 300 240" style={{ overflow: 'visible' }} strokeLinecap="round" strokeLinejoin="round">
    <path d="M40 90 L200 20 L200 200 L40 150Z" fill="#fff" stroke="#fff" strokeWidth={14} />
    <path d="M44 90 L196 22 L196 202 L44 150Z" fill={HUE.red.base} />
    <path d="M60 96 L190 38 L190 66 L60 116Z" fill={HUE.red.hi} opacity={0.8} />
    <rect x={10} y={80} width={50} height={80} rx={22} fill={HUE.sun.base} stroke="#fff" strokeWidth={6} />
    <rect x={56} y={140} width={34} height={80} rx={14} fill={HUE.steel.base} stroke="#fff" strokeWidth={6} />
    <ellipse cx={198} cy={112} rx={22} ry={86} fill={HUE.red.edge} />
  </svg>
);

const CUSTOMERS = [
  { fromL: true, x: 520, skin: 0, hair: 0, hs: 1, hue: HUE.orange }, { fromL: true, x: 640, skin: 2, hair: 2, hs: 0, hue: HUE.blue },
  { fromL: false, x: 1280, skin: 1, hair: 1, hs: 3, hue: HUE.pink }, { fromL: false, x: 1400, skin: 3, hair: 0, hs: 2, hue: HUE.green },
  { fromL: true, x: 330, skin: 4, hair: 3, hs: 1, hue: HUE.purple }, { fromL: false, x: 1560, skin: 0, hair: 2, hs: 0, hue: HUE.coral },
] as const;

const Backdrop = memo(function Backdrop() {
  return (
    <Svg>
      <FarSkyline baseY={780} />
      <NearSkyline baseY={830} seed={9} lit={0.25} />
      <Ground y={830} />
      <Bush x={140} y={860} s={0.8} /><Bush x={1820} y={860} s={0.9} hue={HUE.mint} />
    </Svg>
  );
});

export default function Act3({ beat }: SceneBodyProps) {
  const sub = useSubstep(beat, [600, 1800, 3000]);
  const tone: SkyTone = beat === 0 ? 'sunrise' : beat <= 2 ? 'sunrise' : 'gold';
  return (
    <div style={{ ...full, overflow: 'visible' }}>
      <Sky tone={tone} horizon={800} />
      <Clouds seed={6} count={4} yMin={330} yMax={560} />
      <Backdrop />
      <Show when={beat >= 2} k="bunting" y={0}><Svg><Bunting x1={420} y1={420} x2={1500} y2={420} sag={80} n={14} /></Svg></Show>
      <Svg><Streetlight x={260} y={850} h={320} singing={beat === 3} /><Streetlight x={1700} y={850} h={320} singing={beat === 3} delay={1} /></Svg>

      {/* the shop */}
      <Mv left={SX} top={SY} bc to={{ scale: 1 }} from={{ scale: 1 }}><div className="k-breathe" style={{ ['--dur' as string]: '4s' } as CSSProperties}><Building kind={0} size={520} /></div></Mv>
      <Mv left={SX} top={SY - 340} to={{ scale: 1 }} from={{ scale: 1 }} origin="50% 50%">
        <div style={{ marginLeft: -110, marginTop: -30, width: 220, padding: '10px 0', textAlign: 'center', borderRadius: 24, background: beat === 3 ? HUE.green.base : HUE.steel.base, border: '6px solid #fff', boxShadow: 'var(--sh-sm)', fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{beat === 3 ? 'OPEN!' : 'open?'}</div>
      </Mv>
      {/* the lonely owner */}
      <Mv left={SX} top={SY - 24} bc to={{ scale: 1, y: 0 }} from={{ scale: 0 }} spring={SPRING.pop}>
        <Kid size={260} skin={3} hair={1} hairStyle={0} shirt={HUE.sun} pose={beat === 3 ? 'cheer' : beat === 2 ? 'hold' : 'idle'} mood={beat === 3 ? 'grin' : 'sad'} />
      </Mv>

      {/* beat 1: crickets + tumbleweed on an empty street */}
      <Show when={beat <= 2} k="empty" y={0}>
        <>
          {[[420, 930], [720, 960], [1360, 940], [1620, 975]].map(([x, y], i) => (
            <div key={i} className="k-hop" style={{ position: 'absolute', left: x, top: y - 46, ['--delay' as string]: `${i * 0.4}s`, ['--dur' as string]: `${1.1 + i * 0.2}s`, ['--hop' as string]: '-30px', opacity: beat >= 1 ? 1 : 0, transition: 'opacity .5s' } as CSSProperties}><Cricket s={0.9} /></div>
          ))}
          {beat >= 1 && [0, 1].map(i => (
            <div key={i} className="k-note" style={{ position: 'absolute', left: 460 + i * 940, top: 870, ['--delay' as string]: `${i * 1.1}s`, ['--nx' as string]: '24px', fontSize: 40, fontWeight: 800, color: INK, whiteSpace: 'nowrap' } as CSSProperties}>chirp</div>
          ))}
          <div className="k-drift" style={{ position: 'absolute', left: -200, top: 930, ['--dx' as string]: '2400px', ['--dur' as string]: '12s', opacity: beat >= 1 ? 1 : 0 } as CSSProperties}>
            <div className="k-spin" style={{ ['--dur' as string]: '1.2s' } as CSSProperties}>
              <svg width={100} height={100} viewBox="-50 -50 100 100"><circle r={40} fill="none" stroke={HUE.wood.base} strokeWidth={6} /><path d="M-36 -10 Q0 -40 36 -10 M-30 20 Q0 -10 30 22 M-10 -38 Q-20 0 -8 38 M14 -38 Q24 0 10 38" stroke={HUE.wood.edge} strokeWidth={5} fill="none" /></svg>
            </div>
          </div>
        </>
      </Show>

      {/* beat 2: a party with no guests */}
      <Mv left={SX - 480} top={SY} bc to={{ scale: beat === 2 ? 1 : 0 }} from={{ scale: 0 }} spring={{ ...SPRING.hero, delay: 0.2 }}>
        <svg width={260} height={260} viewBox="0 0 260 260" style={{ overflow: 'visible' }}>
          <Slab x={10} y={150} w={240} h={100} r={26} hue={soft(HUE.wood, 0.2)} border={6} />
          <Slab x={40} y={96} w={180} h={70} r={30} hue={HUE.pink} border={5} /><rect x={50} y={104} width={160} height={14} rx={7} fill="#fff" />
          <rect x={126} y={52} width={8} height={40} rx={4} fill={HUE.sun.base} /><ellipse cx={130} cy={38} rx={10} ry={16} fill={HUE.orange.base} className="k-pulse" />
        </svg>
      </Mv>
      {[0, 1, 2, 3].map(i => (
        <Mv key={i} left={SX - 640 + i * 420} top={SY - 520} to={{ y: beat === 2 ? 0 : -220, opacity: beat === 2 ? 1 : 0 }} from={{ y: -220, opacity: 0 }} spring={{ ...SPRING.settle, delay: i * 0.18 }}>
          <Balloon hue={[HUE.red, HUE.blue, HUE.green, HUE.purple][i]} x={0} d={i * 0.4} />
        </Mv>
      ))}
      <Mv left={SX + 420} top={SY} bc to={{ scale: beat === 2 ? 1 : 0 }} from={{ scale: 0 }} spring={{ ...SPRING.pop, delay: 0.5 }}>
        <svg width={170} height={200} viewBox="0 0 170 200" style={{ overflow: 'visible' }}>
          <rect x={30} y={90} width={110} height={30} rx={14} fill={HUE.stone.base} /><rect x={30} y={90} width={20} height={110} rx={10} fill={HUE.stone.edge} /><rect x={120} y={120} width={20} height={80} rx={10} fill={HUE.stone.edge} /><rect x={30} y={20} width={20} height={110} rx={10} fill={HUE.stone.edge} />
        </svg>
      </Mv>

      {/* beat 3: billboard, megaphone, and the customers come running */}
      <Mv left={SX - 470} top={940} bc to={{ y: beat === 3 ? 0 : 900, scale: 1 }} from={{ y: 900 }} spring={{ type: 'spring', stiffness: 110, damping: 13, delay: 0.1 }} z={5}>
        <Billboard />
      </Mv>
      <Mv left={SX + 330} top={560} to={{ scale: beat === 3 ? 1 : 0, rotate: beat === 3 ? -8 : 0 }} from={{ scale: 0 }} spring={{ ...SPRING.hero, delay: 0.8 }} origin="20% 60%" z={6}>
        <Megaphone />
      </Mv>
      <Show when={beat === 3} k="rings" y={0}>{[0, 1, 2].map(i => (
        <motion.div key={i} initial={{ scale: 0.3, opacity: 0.9 }} animate={{ scale: 2.4, opacity: 0 }} transition={{ duration: 1.8, repeat: Infinity, delay: 1 + i * 0.5, ease: 'easeOut' }}
          style={{ position: 'absolute', left: SX + 660, top: 660, width: 160, height: 160, marginLeft: -80, marginTop: -80, borderRadius: 80, border: `10px solid ${HUE.red.base}`, zIndex: 6 }} />
      ))}</Show>
      {CUSTOMERS.map((c, i) => (
        <Mv key={i} left={c.x} top={965 + (i % 2) * 20} bc to={{ x: beat === 3 ? 0 : c.fromL ? -900 : 900, opacity: beat === 3 ? 1 : 0, scale: 1 }} from={{ x: c.fromL ? -900 : 900, opacity: 0 }}
          spring={{ type: 'spring', stiffness: 50, damping: 15, delay: 1.2 + i * 0.25 }} z={4}>
          <Kid size={250} skin={c.skin} hair={c.hair} hairStyle={c.hs as 0 | 1 | 2 | 3} shirt={c.hue} pose={beat === 3 && sub >= 2 ? 'cheer' : 'wave'} mood="grin" walking={beat === 3 && sub < 2} flip={!c.fromL} delay={i * 0.1} />
        </Mv>
      ))}
      <Mv left={SX + 130} top={SY - 380} to={{ scale: beat === 3 && sub >= 2 ? 1 : 0 }} from={{ scale: 0 }} spring={SPRING.hero} origin="50% 50%">
        <CoinBit size={110} />
      </Mv>
      <Show when={beat === 3 && sub >= 1} k="burst" y={0}><Burst fire={3} x={SX} y={600} count={60} /></Show>

      {/* the flying bus carries the news across the sky */}
      <Show when={beat === 3} k="bus" y={0}><div className="k-fly" style={{ position: 'absolute', left: 0, top: 390, ['--from' as string]: '2100px', ['--to' as string]: '-600px', ['--dur' as string]: '10s' } as CSSProperties}><div style={{ transform: 'scaleX(-1)' }}><FlyingBus size={300} hue={HUE.sun} /></div></div></Show>

    </div>
  );
}
