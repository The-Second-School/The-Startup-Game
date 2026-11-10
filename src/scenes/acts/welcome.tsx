// Welcome: sunny Techistan, the Mayor announces the Startup Festival, then rAIvan looms over the city.
import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties } from 'react';
import {
  Bunting, Burst, Bush, Clouds, FarSkyline, Flash, FlyingBus, FlyingRickshaw, Ground, HUE, Kid, Lightning, Mayor, NearSkyline,
  RobotChaiwala, SKIES, SPRING, Sky, Sparkle, Streetlight, Sun, Svg, Trophy, Tree, full, type KidMood, type KidPose, type SkyTone,
} from '../kit';
import { Mv, Raivan, Show } from '../shared/bits';
import type { SceneBodyProps } from '../types';

const CROWD: { x: number; skin: number; hair: number; hs: 0 | 1 | 2 | 3; shirt: keyof typeof HUE; size: number }[] = [
  { x: 150, skin: 0, hair: 0, hs: 1, shirt: 'sky', size: 250 },
  { x: 330, skin: 2, hair: 2, hs: 0, shirt: 'green', size: 230 },
  { x: 500, skin: 1, hair: 1, hs: 3, shirt: 'pink', size: 240 },
  { x: 1280, skin: 3, hair: 0, hs: 2, shirt: 'orange', size: 240 },
  { x: 1450, skin: 4, hair: 3, hs: 0, shirt: 'purple', size: 230 },
  { x: 1620, skin: 0, hair: 1, hs: 1, shirt: 'red', size: 250 },
  { x: 1790, skin: 2, hair: 2, hs: 3, shirt: 'mint', size: 235 },
];

export default function Welcome({ beat }: SceneBodyProps) {
  const tone: SkyTone = beat <= 3 ? 'day' : beat <= 5 ? 'storm' : 'gold';
  const sk = SKIES[tone];
  const kidPose = (i: number): KidPose => (beat === 0 ? 'idle' : beat === 1 ? (i % 3 === 0 ? 'wave' : 'idle') : beat === 2 ? 'point' : beat === 3 ? 'cheer' : beat <= 5 ? 'gasp' : 'cheer');
  const kidMood: KidMood = beat === 3 || beat >= 6 ? 'grin' : beat >= 4 ? 'wow' : 'happy';
  const mayorPose = beat === 2 ? 'wave' : beat === 3 ? 'announce' : beat <= 5 ? 'gasp' : 'cheer';
  const rv = beat >= 4;
  const boss: { x: number; y: number; scale: number } = beat === 4 ? { x: 0, y: 0, scale: 0.85 } : beat === 5 ? { x: -100, y: 0, scale: 0.95 } : { x: 300, y: 120, scale: 0.5 };

  return (
    <div style={{ ...full, overflow: 'hidden' }}>
      <Sky tone={tone} horizon={780} />
      <Mv to={{ opacity: tone === 'storm' ? 0 : 1, scale: 1 }} spring={SPRING.settle}><Sun x={1560} y={330} r={100} /></Mv>
      <Clouds seed={4} count={5} yMin={290} yMax={520} speed={tone === 'storm' ? 2 : 1} fill={sk.cloud} edge={sk.cloudEdge} />
      {tone === 'storm' && <><Lightning x={430} y={0} h={520} delay={0} /><Lightning x={1560} y={0} h={440} delay={1.4} /></>}

      <Svg>
        <FarSkyline baseY={760} color={sk.far} win={sk.farWin} />
        <NearSkyline baseY={830} lit={tone === 'storm' ? 0.8 : 0.3} />
        <Ground y={830} />
        <Tree x={90} y={840} s={1.1} /><Bush x={760} y={850} s={0.8} /><Bush x={1180} y={850} s={0.9} hue={HUE.mint} />
        <Streetlight x={260} y={850} h={330} singing={beat >= 1 && beat <= 3} delay={0} />
        <Streetlight x={1050} y={850} h={330} singing={beat >= 1 && beat <= 3} delay={1.1} />
        <Streetlight x={1700} y={850} h={330} singing={beat >= 1 && beat <= 3} delay={2.2} />
      </Svg>

      {/* beat 1-3: the city is alive (fly-bys sit below the bubble) */}
      <Show when={beat >= 1 && beat <= 3} k="fly" y={0}>
        <div className="k-fly" style={{ position: 'absolute', left: 0, top: 410, ['--from' as string]: '-500px', ['--to' as string]: '2300px', ['--dur' as string]: '9s' } as CSSProperties}><FlyingBus size={340} /></div>
        <div className="k-fly" style={{ position: 'absolute', left: 0, top: 570, ['--from' as string]: '2200px', ['--to' as string]: '-500px', ['--dur' as string]: '12s', ['--delay' as string]: '-3s' } as CSSProperties}>
          <div style={{ transform: 'scaleX(-1)' }}><FlyingRickshaw size={220} /></div>
        </div>
      </Show>
      <Mv left={1560} top={960} bc to={{ scale: beat >= 1 && beat <= 3 ? 1 : 0, y: 0 }} from={{ scale: 0 }} spring={SPRING.pop}><div className="k-breathe"><RobotChaiwala size={330} /></div></Mv>

      {/* bunting for the festival */}
      <Svg style={{ pointerEvents: 'none' }}>
        <g style={{ opacity: beat >= 3 ? 1 : 0, transition: 'opacity .5s' }}><Bunting x1={0} y1={400} x2={1920} y2={420} sag={90} n={18} /></g>
      </Svg>

      {/* the crowd */}
      {CROWD.map((c, i) => (
        <Mv key={i} left={c.x} top={960} bc to={{ scale: beat >= 1 ? 1 : 0, y: 0 }} from={{ scale: 0 }} spring={{ ...SPRING.pop, delay: 0.1 + i * 0.1 }}>
          <Kid size={c.size} skin={c.skin} hair={c.hair} hairStyle={c.hs} shirt={HUE[c.shirt]} pose={kidPose(i)} mood={kidMood} delay={i * 0.12} flip={c.x > 960} />
        </Mv>
      ))}

      {/* the Mayor strolls in and announces */}
      <Mv left={820} top={970} bc to={{ x: beat >= 2 ? 0 : 1400, scale: beat >= 6 ? 1 : 1, rotate: 0 }} from={{ x: 1400 }} spring={{ type: 'spring', stiffness: 60, damping: 14 }}>
        <div className="k-breathe" style={{ ['--dur' as string]: '3.2s' } as CSSProperties}><Mayor size={440} pose={mayorPose} mood={beat >= 4 && beat <= 5 ? 'wow' : 'happy'} /></div>
      </Mv>
      <Mv left={1140} top={760} bc to={{ y: beat === 3 ? 0 : 140, scale: beat === 3 ? 1 : 0, opacity: beat === 3 ? 1 : 0 }} from={{ y: 140, scale: 0, opacity: 0 }} spring={SPRING.hero}>
        <div className="k-hero" style={{ ['--bob' as string]: '-12px' } as CSSProperties}><Trophy size={210} /></div>
      </Mv>
      <Show when={beat === 3} k="spark" y={0}><Burst fire={1} x={1140} y={560} count={50} /><Mv left={1010} top={470} to={{ scale: 1 }} from={{ scale: 0 }} spring={SPRING.pop}><Sparkle size={70} color="#FFF1A8" /></Mv></Show>

      {/* rAIvan rises behind the city */}
      <Mv left={1380} top={930} bc to={{ x: boss.x, y: beat >= 4 ? boss.y : 700, scale: boss.scale, opacity: rv ? 1 : 0 }} from={{ y: 700, scale: 0.8, opacity: 0 }} spring={{ type: 'spring', stiffness: 50, damping: 12 }} z={4}>
        <div className={beat >= 4 && beat <= 5 ? 'k-shake' : undefined}><Raivan size={600} angry={beat >= 5} smoke={beat === 5} /></div>
      </Mv>
      {/* beat 5: his three evil plans pop out of his heads */}
      <AnimatePresence>
        {beat === 5 && ['📄', '🃏', '💰'].map((e, i) => (
          <motion.div key={e} initial={{ scale: 0, y: 80, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ ...SPRING.pop, delay: 0.6 + i * 0.8 }}
            style={{ position: 'absolute', left: 230 + i * 210, top: 520 - (i % 2) * 60, width: 140, height: 140, borderRadius: 70, background: '#fff', border: '6px solid #fff', boxShadow: 'var(--sh-sm)', display: 'grid', placeItems: 'center', fontSize: 76, zIndex: 6 }}>{e}</motion.div>
        ))}
      </AnimatePresence>
      <Show when={beat === 4} k="flash" y={0}><Flash trigger="boom" color="#EBDDFF" /></Show>
      <Show when={beat === 6} k="conf" y={0}><Burst fire={2} x={820} y={620} count={50} colors={['#FFC800', '#58CC02', '#1CB0F6', '#FF6FB5']} /></Show>
    </div>
  );
}
