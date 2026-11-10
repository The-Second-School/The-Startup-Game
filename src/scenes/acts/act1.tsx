// Step 1, The Problem: a school yard, a girl with a cold tiffin, a bright idea, then a street of people with different needs.
import { motion } from 'motion/react';
import { memo, type CSSProperties } from 'react';
import {
  Bush, Burst, Clouds, FarSkyline, Ground, HUE, INK, Kid, Layer, Lightbulb, NearSkyline, FlyingRickshaw, RecipeTrack, SPRING, Shape,
  Sky, Slab, Svg, ThoughtCloud, Tiffin, Tree, World, full, soft, useSubstep, type KidPose, type KidMood,
} from '../kit';
import { Mv, Show } from '../shared/bits';
import type { SceneBodyProps } from '../types';

const GX = 1130, GY = 905; // the girl's feet
const WALL = soft(HUE.coral, 0.45), ROOF = soft(HUE.red, 0.4), LAWN = { hi: '#C9F2A6', base: '#A9E67F', edge: '#8ED65E' };

const School = memo(function School() {
  return (
    <g transform="translate(60 0)">
      <Slab x={0} y={480} w={760} h={350} r={44} hue={WALL} border={8} />
      <Slab x={-30} y={420} w={820} h={90} r={40} hue={ROOF} border={8} />
      <Shape d="M300 420 L380 290 L460 420Z" hue={soft(HUE.sun, 0.3)} border={6} />
      <g transform="translate(380 360)"><circle r={36} fill="#fff" /><circle r={30} fill={HUE.cream.base} /><path d="M0 -18 V0 L12 8" stroke={INK} strokeWidth={6} fill="none" /></g>
      {[70, 190, 480, 600].map(x => <Slab key={x} x={x} y={540} w={90} h={110} r={30} hue={HUE.sky} border={4} />)}
      <Slab x={320} y={640} w={120} h={190} r={40} hue={soft(HUE.wood, 0.2)} border={4} />
      <circle cx={420} cy={740} r={9} fill={HUE.sun.base} />
      <rect x={380} y={236} width={8} height={56} rx={4} fill={INK} />
      <path className="k-flag" d="M388 240 L440 256 L388 272Z" fill={HUE.green.base} />
    </g>
  );
});

const Bench = memo(function Bench() {
  return (
    <g>
      <rect x={GX - 190} y={GY - 66} width={380} height={34} rx={17} fill={HUE.wood.base} />
      <rect x={GX - 190} y={GY - 66} width={380} height={12} rx={6} fill={HUE.wood.hi} />
      <rect x={GX - 160} y={GY - 30} width={24} height={34} rx={8} fill={HUE.wood.edge} /><rect x={GX + 136} y={GY - 30} width={24} height={34} rx={8} fill={HUE.wood.edge} />
    </g>
  );
});

/** Static far + near skylines (memoised: they never change). */
const Backdrop = memo(function Backdrop() {
  return (
    <>
      <Layer depth={0.3}><Svg><FarSkyline baseY={780} color="#CFE7F4" win="#EAF6FC" /></Svg></Layer>
      <Layer depth={0.6}><Svg w={1920}><NearSkyline baseY={830} seed={4} minH={200} maxH={380} lit={0.2} /></Svg></Layer>
    </>
  );
});

const Snow = ({ x, y, d }: { x: number; y: number; d: number }) => (
  <g transform={`translate(${x} ${y})`}><g className="k-fall" style={{ ['--delay' as string]: `${d}s`, ['--fall' as string]: '90px', ['--fx' as string]: '10px', ['--dur' as string]: '2.2s' } as CSSProperties}>
    <path d="M-12 0 H12 M0 -12 V12 M-8 -8 L8 8 M8 -8 L-8 8" stroke="#8ED6FA" strokeWidth={5} />
  </g></g>
);

const WANTS: { icon: string; hue: typeof HUE.sky; pose: KidPose; mood: KidMood; skin: number; hair: number; hs: 0 | 1 | 2 | 3 }[] = [
  { icon: '🍲', hue: HUE.orange, pose: 'think', mood: 'happy', skin: 0, hair: 0, hs: 1 },
  { icon: '📚', hue: HUE.blue, pose: 'point', mood: 'worried', skin: 2, hair: 2, hs: 0 },
  { icon: '🚲', hue: HUE.green, pose: 'think', mood: 'happy', skin: 1, hair: 1, hs: 3 },
  { icon: '🎨', hue: HUE.pink, pose: 'wave', mood: 'grin', skin: 3, hair: 3, hs: 2 },
  { icon: '🧸', hue: HUE.purple, pose: 'think', mood: 'worried', skin: 4, hair: 0, hs: 1 },
];

export default function Act1({ beat }: SceneBodyProps) {
  const sub = useSubstep(beat, [700, 1900, 3200]);
  const zoom = beat === 1 || beat === 2;
  const cam = zoom ? { x: (GX - 960) * 1.5, y: (GY - 300 - 640) * 1.5, zoom: 1.5 } : beat === 3 ? { x: 400, y: 0, zoom: 1 } : { x: 0, y: 0, zoom: 1 };
  return (
    <div style={{ ...full, overflow: 'hidden' }}>
      <Sky tone={beat === 4 ? 'gold' : 'day'} horizon={800} />
      <Clouds seed={2} count={5} yMin={300} yMax={560} fill="#fff" edge="#DDF0FB" />
      <World cam={cam}>
        <Backdrop />
        <Layer depth={1}>
          <Svg w={2400}>
            <Ground y={830} width={2400} road={false} pave={HUE.cream} />
            <rect x={-40} y={920} width={2480} height={200} fill={LAWN.base} /><rect x={-40} y={920} width={2480} height={14} fill={LAWN.hi} />
            <School />
            <Tree x={900} y={850} s={1.2} /><Tree x={1680} y={850} s={1.4} hue={HUE.mint} /><Bush x={1480} y={860} s={0.8} />
            <Bench />
            {/* the problem: cold air */}
            {beat === 1 && [0, 1, 2, 3].map(i => <Snow key={i} x={GX - 60 + i * 50} y={GY - 360 + (i % 2) * 24} d={i * 0.5} />)}
          </Svg>

          {/* kids arriving at school */}
          {beat === 0 && [0, 1, 2].map(i => (
            <div key={i} className="k-stroll" style={{ position: 'absolute', left: 120 + i * 190, top: 640, ['--dx' as string]: '260px', ['--dur' as string]: `${6 + i}s`, ['--delay' as string]: `${-i * 2}s` } as CSSProperties}>
              <Kid size={230} walking skin={[0, 2, 1][i]} hair={i} hairStyle={[1, 0, 2][i] as 0 | 1 | 2} shirt={[HUE.sky, HUE.green, HUE.pink][i]} />
            </div>
          ))}
          {/* beat 0: a big problem sign over the school */}
          <Mv left={440} top={330} to={{ scale: beat === 0 ? 1 : 0, rotate: beat === 0 ? -6 : 0, opacity: beat === 0 ? 1 : 0 }} from={{ scale: 0, opacity: 0 }} spring={{ ...SPRING.hero, delay: 0.8 }} origin="50% 100%">
            <div className="k-bob" style={{ ['--bob' as string]: '12px' } as CSSProperties}>
              <svg width={260} height={300} viewBox="0 0 260 300" style={{ overflow: 'visible' }}>
                <circle cx={130} cy={130} r={118} fill="#fff" /><circle cx={130} cy={130} r={106} fill={HUE.red.base} />
                <ellipse cx={92} cy={82} rx={30} ry={18} fill={HUE.red.hi} opacity={0.6} />
                <text x={130} y={186} textAnchor="middle" fontSize={170} fontWeight={800} fill="#fff" fontFamily="inherit">?</text>
              </svg>
            </div>
          </Mv>

          {/* the girl on the bench */}
          <Mv left={GX} top={GY} bc to={{ scale: beat <= 2 || beat === 4 ? 1 : 0, y: beat === 2 && sub >= 1 ? -20 : 0 }} from={{ scale: beat === 0 ? 0 : 1 }} spring={{ ...SPRING.pop, delay: beat === 0 ? 1.2 : 0 }}>
            <Kid size={340} skin={0} hair={0} hairStyle={2} shirt={HUE.sun}
              pose={beat === 4 ? 'cheer' : beat <= 1 ? 'hold' : sub >= 1 ? 'cheer' : 'hold'} mood={beat === 1 ? 'cold' : beat === 4 || (beat === 2 && sub >= 1) ? 'grin' : 'happy'} />
          </Mv>
          <Mv left={GX} top={GY - 60} bc to={{ scale: beat === 1 || beat === 2 ? 1 : 0, y: 0 }} from={{ scale: 0 }} spring={SPRING.pop}>
            <div className={beat === 1 ? 'k-shiver' : undefined}><Tiffin size={105} open cold={beat === 1} hot={beat === 2 && sub >= 1} /></div>
          </Mv>
          {/* beat 2: the idea + a flying rickshaw bringing hot lunch to school */}
          <Mv left={GX + 90} top={GY - 540} to={{ scale: beat === 2 && sub >= 1 ? 1 : 0, y: 0 }} from={{ scale: 0 }} spring={SPRING.hero} origin="50% 100%"><div className="k-hero" style={{ ['--bob' as string]: '-8px' } as CSSProperties}><Lightbulb size={190} /></div></Mv>
          <Mv left={GX - 500} top={GY - 470} to={{ scale: beat === 2 && sub >= 2 ? 1 : 0 }} from={{ scale: 0 }} spring={SPRING.pop} origin="100% 100%">
            <ThoughtCloud size={320}>
              <g transform="translate(120 96) scale(0.34)"><g transform="translate(-130 -110)"><FlyingRickshawArt /></g></g>
            </ThoughtCloud>
          </Mv>
          <Show when={beat === 2 && sub >= 1} k="burst" y={0}><Burst fire={1} x={960} y={500} count={44} spread={600} up={500} colors={['#FFC800', '#fff', '#FF9600']} /></Show>
        </Layer>
      </World>

      {/* beat 3: who needs what? */}
      <Show when={beat === 3} k="who" y={0}>
        {WANTS.map((w, i) => (
          <Mv key={i} left={230 + i * 330} top={960} bc to={{ scale: 1, y: 0, opacity: 1 }} from={{ scale: 0, y: 120, opacity: 0 }} spring={{ ...SPRING.pop, delay: 0.2 + i * 0.25 }}>
            <Kid size={290 - (i % 2) * 20} skin={w.skin} hair={w.hair} hairStyle={w.hs} shirt={w.hue} pose={w.pose} mood={w.mood} delay={i * 0.2} />
          </Mv>
        ))}
        {WANTS.map((w, i) => (
          <Mv key={`t${i}`} left={230 + i * 330 + 40} top={640 - (i % 2) * 40} to={{ scale: sub >= 1 ? 1 : 0 }} from={{ scale: 0 }} spring={{ ...SPRING.pop, delay: i * 0.3 }} origin="0% 100%">
            <ThoughtCloud size={210}><text x={120} y={118} textAnchor="middle" fontSize={84} fontFamily="inherit">{sub >= 3 ? w.icon : '?'}</text></ThoughtCloud>
          </Mv>
        ))}
        <Mv left={960} top={520} to={{ scale: 1 }} from={{ scale: 0 }} spring={SPRING.hero}>
          <motion.div animate={{ x: [-700, 700, -700] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}><Magnifier /></motion.div>
        </Mv>
      </Show>

      {/* beat 4: step 1 of the recipe */}
      <Show when={beat === 4} k="recipe" y={40}>
        <div style={{ position: 'absolute', left: 80, top: 400 }}><RecipeTrack active={1} /></div>
        <Burst fire={2} x={960} y={640} count={60} />
      </Show>
    </div>
  );
}

function Magnifier() {
  return (
    <svg width={260} height={260} viewBox="-50 -50 100 100" style={{ overflow: 'visible' }}>
      <path d="M14 14 L40 40" stroke="#fff" strokeWidth={24} /><path d="M14 14 L40 40" stroke={HUE.wood.base} strokeWidth={14} />
      <circle cx={-8} cy={-8} r={40} fill="#fff" /><circle cx={-8} cy={-8} r={34} fill={HUE.steel.base} /><circle cx={-8} cy={-8} r={26} fill="#CDEBFA" />
      <path d="M-22 -20 Q-12 -30 0 -22" stroke="#fff" strokeWidth={6} fill="none" />
    </svg>
  );
}

/** Just the rickshaw art at its native 260x220 box, for use inside a thought cloud. */
function FlyingRickshawArt() {
  return <foreignObject width={260} height={220}><div style={{ lineHeight: 0 }}><FlyingRickshaw size={260} /></div></foreignObject>;
}
