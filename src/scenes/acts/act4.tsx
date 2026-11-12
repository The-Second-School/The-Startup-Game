// Step 4, Money: a busy market. Customers walk in on foot to the stalls, price tags that are too high or too low
// change who buys, and investors stroll through the market later. No water, no boats.
// Beats (see SCENES.act4): 0 recap, 1 customers arrive, 2 price too high / too low, 3 investors walk the market, 4 the step stamp.
import { memo, useEffect, useState, type CSSProperties } from 'react';
import { Bunting, Burst, Clouds, FarSkyline, Ground, HUE, INK, Kid, NearSkyline, RecipeTrack, Sky, Svg, Tree, Bush, full, type Hue } from '../kit';
import { Backdrop, Focus, Subject } from '../kit/focus';
import { CoinBit, Mv, Show } from '../shared/bits';
import type { SceneBodyProps } from '../types';

const GROUND = 960; // shoppers' feet

/** A market stall: striped awning, a counter, and goods on display. Feet on the ground line. */
const Stall = memo(function Stall({ x, hue, goods }: { x: number; hue: Hue; goods: string[] }) {
  return (
    <svg width={340} height={300} viewBox="0 0 340 300" style={{ position: 'absolute', left: x, top: 560, overflow: 'visible' }} strokeLinecap="round" strokeLinejoin="round">
      <rect x={30} y={110} width={14} height={190} rx={7} fill={HUE.steel.edge} /><rect x={296} y={110} width={14} height={190} rx={7} fill={HUE.steel.edge} />
      {[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x={18 + i * 52} y={50} width={52} height={70} fill={i % 2 ? '#fff' : hue.base} />)}
      {[0, 1, 2, 3, 4, 5].map(i => <path key={`s${i}`} d={`M${18 + i * 52} 120 Q${44 + i * 52} 140 ${70 + i * 52} 120`} fill={i % 2 ? '#fff' : hue.base} />)}
      <rect x={14} y={38} width={312} height={22} rx={11} fill={hue.edge} />
      <rect x={20} y={200} width={300} height={34} rx={12} fill={HUE.wood.base} /><rect x={20} y={200} width={300} height={10} rx={5} fill={HUE.wood.hi} />
      {goods.map((c, i) => <circle key={i} cx={58 + i * 46} cy={184} r={20} fill={c} stroke="#fff" strokeWidth={5} />)}
    </svg>
  );
});

const SHOPPERS = [
  { from: 'L', x: 560, skin: 0, hair: 0, hs: 1, shirt: HUE.orange },
  { from: 'R', x: 1340, skin: 2, hair: 2, hs: 0, shirt: HUE.blue },
  { from: 'L', x: 380, skin: 4, hair: 3, hs: 1, shirt: HUE.purple },
  { from: 'R', x: 1520, skin: 1, hair: 1, hs: 3, shirt: HUE.pink },
] as const;

const INVESTORS = [
  { x: 1800, shirt: HUE.blue, skin: 3, hair: 1, hs: 0 as const },
  { x: 1920, shirt: HUE.steel, skin: 1, hair: 2, hs: 2 as const },
  { x: 2040, shirt: HUE.tank, skin: 0, hair: 0, hs: 1 as const },
];

/** The price tag that is too high or too low, cycling every 2 s. */
function PriceTag({ hi }: { hi: boolean }) {
  const color = hi ? HUE.red : HUE.blue;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 10, height: 80, background: INK, borderRadius: 5 }} />
      <div style={{ width: 400, padding: '24px 0', borderRadius: 60, background: color.base, border: '8px solid #fff', boxShadow: 'var(--sh-sm)', textAlign: 'center', color: '#fff', fontSize: 120, fontWeight: 800, lineHeight: 1 }}>
        {hi ? '₹99' : '₹1'}
      </div>
      <div style={{ marginTop: 18, padding: '8px 26px', borderRadius: 30, background: '#fff', fontSize: 44, fontWeight: 800, color: INK, border: '5px solid #fff' }}>
        {hi ? 'Too high!' : 'Too low!'}
      </div>
    </div>
  );
}

function PriceCycle() {
  const [k, setK] = useState(0);
  useEffect(() => { const t = setInterval(() => setK(v => (v + 1) % 2), 2000); return () => clearInterval(t); }, []);
  return <PriceTag hi={k === 0} />;
}

const pill: CSSProperties = { position: 'absolute', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 40, fontWeight: 800, color: INK, background: '#fff', border: '5px solid #fff', borderRadius: 30, padding: '8px 22px', boxShadow: 'var(--sh-sm)' };

export default function Act4({ beat }: SceneBodyProps) {
  const priceFocus = beat === 2;
  return (
    <div style={{ ...full, overflow: 'visible' }}>
      {/* the market, dimmed and blurred while the price tag is the main subject */}
      <Focus active={priceFocus}>
        <Backdrop>
          <Sky tone={beat === 4 ? 'gold' : 'day'} horizon={830} />
          <Clouds seed={5} count={4} yMin={260} yMax={460} fill="#fff" edge="#DDF0FB" />
          <Svg>
            <FarSkyline baseY={780} color="#CFE7F4" win="#EAF6FC" />
            <NearSkyline baseY={830} seed={4} lit={0.25} />
            <Ground y={830} />
            <Bunting x1={-200} y1={300} x2={2120} y2={330} sag={70} n={16} />
            <Tree x={70} y={850} s={1.1} /><Tree x={1830} y={850} s={1.2} hue={HUE.mint} />
            <Bush x={1000} y={860} s={0.7} />
          </Svg>
          <Stall x={70} hue={HUE.red} goods={[HUE.orange.base, HUE.red.base, HUE.sun.base]} />
          <Stall x={500} hue={HUE.green} goods={[HUE.green.base, HUE.blue.base, HUE.pink.base]} />
          <Stall x={930} hue={HUE.blue} goods={[HUE.sun.base, HUE.purple.base, HUE.mint.base]} />
          <Stall x={1360} hue={HUE.pink} goods={[HUE.teal.base, HUE.orange.base, HUE.green.base]} />
          {/* shoppers arrive on foot from both sides, and walk to a stall */}
          {SHOPPERS.map((c, i) => (
            <Mv key={i} left={c.x} top={GROUND} bc
              to={{ x: beat >= 1 ? 0 : c.from === 'L' ? -900 : 900, opacity: 1, scale: 1 }}
              from={{ x: c.from === 'L' ? -900 : 900, opacity: 0 }}
              spring={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.3 + i * 0.25 }} z={4}>
              <Kid size={250} skin={c.skin} hair={c.hair} hairStyle={c.hs} shirt={c.shirt} pose={beat >= 3 ? 'cheer' : beat === 2 ? 'gasp' : 'wave'} mood={beat === 2 ? 'worried' : 'grin'} walking={beat === 1} flip={c.from === 'R'} delay={i * 0.1} />
            </Mv>
          ))}
        </Backdrop>
        <Subject at={{ x: 960, y: 580 }} scale={1.15}>{priceFocus ? <PriceCycle /> : null}</Subject>
      </Focus>

      {/* beat 1: the coins start to fall as the first sales happen */}
      <Show when={beat === 1} k="coins" y={0} style={{ zIndex: 3 }}>{[0, 1, 2, 3].map(i => (
        <div key={i} className="k-fall" style={{ position: 'absolute', left: 620 + i * 70, top: 520, zIndex: 3, ['--delay' as string]: `${i * 0.35}s`, ['--dur' as string]: '1.5s', ['--fall' as string]: '300px', ['--fx' as string]: '0px' } as CSSProperties}>
          <CoinBit size={64} />
        </div>
      ))}</Show>

      {/* beat 3: investors walk through the market, from the right to the left */}
      {INVESTORS.map((v, i) => (
        <Mv key={i} left={v.x} top={GROUND + i * 10} bc z={6}
          to={{ x: beat >= 3 ? -2200 : 0, opacity: beat >= 3 ? 1 : 0 }} from={{ x: 0, opacity: 0 }}
          spring={{ x: { type: 'tween', duration: 12, ease: 'linear', delay: i * 0.6 }, opacity: { duration: 0.5, delay: i * 0.6 } }}>
          <div style={{ position: 'relative' }}>
            <Kid size={240} skin={v.skin} hair={v.hair} hairStyle={v.hs} shirt={v.shirt} pose="hold" mood="grin" walking flip delay={i * 0.1} />
            <div style={{ ...pill, left: '50%', top: -70 }}>💼 Investor</div>
          </div>
        </Mv>
      ))}

      {/* beat 4: step 4 of the recipe */}
      <Show when={beat === 4} k="recipe" y={40} style={{ zIndex: 9 }}>
        <div style={{ position: 'absolute', left: 80, top: 400 }}><RecipeTrack active={4} /></div>
        <Burst fire={4} x={960} y={640} count={60} />
      </Show>
    </div>
  );
}
