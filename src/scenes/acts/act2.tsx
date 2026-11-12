// Step 2, Build it: the Techistan Workshop, a little product comes together, and a bug hides in the corner.
import { motion } from 'motion/react';
import { memo, type CSSProperties } from 'react';
import {
  Bug, Burst, Gear, HUE, INK, Kid, Lightbulb, RecipeTrack, SPRING, Slab, Sparkle, Svg, full, soft, useSubstep,
} from '../kit';
import { Mv, Show } from '../shared/bits';
import { Backdrop as Dim, Focus, Subject } from '../kit/focus';
import type { SceneBodyProps } from '../types';

const WOOD = soft(HUE.wood, 0.45);
const Workshop = memo(function Workshop() {
  return (
    <Svg>
      <rect x={-400} width={2720} height={1080} fill="#FFF6E4" />
      <rect x={-400} y={0} width={2720} height={800} fill="#FFF1D8" />
      {/* pegboard dots */}
      {Array.from({ length: 22 }, (_, c) => Array.from({ length: 6 }, (_, r) => <circle key={`${c}-${r}`} cx={90 + c * 84} cy={330 + r * 80} r={6} fill="#F6DFB6" />))}
      {/* window with a sunbeam */}
      <Slab x={760} y={300} w={400} h={260} r={50} hue={soft(HUE.sky, 0.3)} border={10} />
      <rect x={955} y={300} width={10} height={260} fill="#fff" /><rect x={760} y={425} width={400} height={10} fill="#fff" />
      {/* shelf of tools */}
      <Slab x={110} y={520} w={520} h={26} r={13} hue={WOOD} border={0} />
      <g transform="translate(170 520)"><rect x={-8} y={-110} width={16} height={110} rx={8} fill={HUE.wood.base} /><rect x={-34} y={-140} width={68} height={34} rx={14} fill={HUE.steel.base} /></g>
      <g transform="translate(300 520)"><rect x={-9} y={-120} width={18} height={120} rx={9} fill={HUE.red.base} /><circle cy={-134} r={28} fill="none" stroke={HUE.steel.base} strokeWidth={14} /></g>
      <g transform="translate(450 520)"><rect x={-50} y={-90} width={100} height={90} rx={22} fill={HUE.red.base} /><rect x={-50} y={-90} width={100} height={30} rx={14} fill={HUE.red.edge} /></g>
      <g transform="translate(560 520)"><rect x={-30} y={-80} width={60} height={80} rx={22} fill={HUE.green.base} /><rect x={-16} y={-100} width={32} height={26} rx={8} fill="#fff" /></g>
      {/* floor */}
      <rect x={-400} y={880} width={2720} height={200} fill={WOOD.base} /><rect x={-400} y={880} width={2720} height={16} fill={WOOD.hi} />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={i * 240 + 40} y={930} width={150} height={10} rx={5} fill={WOOD.edge} opacity={0.4} />)}
      {/* workbench */}
      <Slab x={360} y={770} w={1000} h={40} r={20} hue={soft(HUE.wood, 0.15)} border={6} />
      <rect x={410} y={824} width={44} height={100} rx={14} fill={soft(HUE.wood, 0.15).base} /><rect x={1270} y={824} width={44} height={100} rx={14} fill={soft(HUE.wood, 0.15).base} />
    </Svg>
  );
});

function Product({ stage }: { stage: number }) {
  // the product is a cheerful little app-robot built in pieces
  return (
    <svg width={330} height={400} viewBox="0 0 330 400" style={{ overflow: 'visible' }} strokeLinecap="round" strokeLinejoin="round">
      <g opacity={stage >= 3 ? 1 : 0} style={{ transition: 'opacity .3s' }}>
        <rect x={158} y={14} width={14} height={70} rx={7} fill={HUE.steel.edge} /><circle cx={165} cy={14} r={20} fill="#fff" /><circle cx={165} cy={14} r={14} fill={HUE.red.base} className="k-pulse" />
      </g>
      <g opacity={stage >= 1 ? 1 : 0}>
        <Slab x={30} y={196} w={270} h={170} r={56} hue={HUE.blue} border={8} />
        <circle cx={165} cy={282} r={34} fill="#fff" opacity={0.5} />
      </g>
      <g opacity={stage >= 2 ? 1 : 0}>
        <Slab x={50} y={70} w={230} h={150} r={52} hue={HUE.sun} border={8} />
        <rect x={76} y={94} width={178} height={96} rx={34} fill={INK} />
        {stage >= 4 ? <><circle cx={126} cy={136} r={14} fill="#7FE8CF" /><circle cx={204} cy={136} r={14} fill="#7FE8CF" /><path d="M134 164 Q165 188 196 164" stroke="#7FE8CF" strokeWidth={8} fill="none" /></>
          : <><rect x={114} y={128} width={24} height={8} rx={4} fill="#7FE8CF" /><rect x={192} y={128} width={24} height={8} rx={4} fill="#7FE8CF" /></>}
      </g>
      <g opacity={stage >= 3 ? 1 : 0}><circle cx={26} cy={282} r={24} fill={HUE.sun.edge} /><circle cx={304} cy={282} r={24} fill={HUE.sun.edge} /></g>
    </svg>
  );
}

const Hammer = () => (
  <svg width={190} height={190} viewBox="0 0 120 120" style={{ overflow: 'visible' }}>
    <path d="M24 100 L66 54" stroke="#fff" strokeWidth={26} /><path d="M24 100 L66 54" stroke={HUE.wood.base} strokeWidth={16} />
    <rect x={40} y={14} width={56} height={32} rx={11} fill="#fff" transform="rotate(46 68 30)" strokeWidth={10} stroke="#fff" /><rect x={42} y={16} width={52} height={30} rx={10} fill={HUE.steel.edge} transform="rotate(46 68 30)" /><rect x={42} y={14} width={52} height={24} rx={10} fill={HUE.steel.base} transform="rotate(46 68 30)" />
  </svg>
);

export default function Act2({ beat }: SceneBodyProps) {
  const sub = useSubstep(beat, [500, 1400, 2300, 3200, 4200]);
  const stage = beat === 0 ? 0 : beat === 1 ? Math.min(sub, 2) : beat === 2 ? 3 + (sub >= 3 ? 1 : 0) : 4;
  const dark = beat === 3;
  // Main subject: the product while it is being built (beat 1 once its first part is on the bench, beat 2), then the bug (beat 3).
  const productOn = (beat === 1 && sub >= 1) || beat === 2;
  const bugOn = beat === 3;
  const focusOn = productOn || bugOn;
  return (
    <div style={{ ...full, overflow: 'visible' }}>
      <Focus active={focusOn}>
        {/* the workshop and the crew: dimmed while the product or the bug has focus */}
        <Dim blur={0} dim={0.55}>
          <Workshop />

          {/* big gears at the back */}
          <Mv left={1560} top={430} to={{ scale: beat >= 1 ? 1 : 0.4, opacity: beat >= 1 ? 1 : 0 }} from={{ scale: 0.4, opacity: 0 }} spring={SPRING.hero} origin="50% 50%"><Gear size={320} spin={9} hue={HUE.orange} /></Mv>
          <Mv left={1390} top={570} to={{ scale: beat >= 1 ? 1 : 0.4, opacity: beat >= 1 ? 1 : 0 }} from={{ scale: 0.4, opacity: 0 }} spring={{ ...SPRING.hero, delay: 0.2 }} origin="50% 50%"><Gear size={190} spin={-5.4} hue={HUE.teal} teeth={8} /></Mv>

          {/* parts that fly onto the bench, one per beat 2 step */}
          {[0, 1, 2].map(i => (
            <Mv key={i} left={[500, 1260, 700][i]} top={[690, 700, 500][i]} to={{ scale: beat === 2 ? 1 : 0, rotate: beat === 2 ? [0, 14, -10][i] : 0 }} from={{ scale: 0 }} spring={{ ...SPRING.pop, delay: i * 0.2 }} origin="50% 50%">
              {i === 0 && <Gear size={110} spin={4} hue={HUE.sun} teeth={8} />}
              {i === 1 && <Lightbulb size={100} />}
              {i === 2 && <Sparkle size={70} color="#FFF1A8" />}
            </Mv>
          ))}

          {/* builders */}
          <Mv left={330} top={940} bc to={{ scale: beat >= 1 ? 1 : 0, x: 0 }} from={{ scale: 0 }} spring={SPRING.pop}>
            <Kid size={320} skin={2} hair={1} hairStyle={0} shirt={HUE.orange} pose={beat === 3 ? 'gasp' : beat === 4 ? 'cheer' : 'point'} mood={beat === 3 ? 'wow' : 'grin'} delay={0.1} />
          </Mv>
          <Mv left={1390} top={950} bc to={{ scale: beat >= 1 ? 1 : 0, x: 0 }} from={{ scale: 0 }} spring={{ ...SPRING.pop, delay: 0.15 }}>
            <Kid size={320} skin={1} hair={0} hairStyle={2} shirt={HUE.mint} pose={beat === 3 ? 'gasp' : beat === 4 ? 'cheer' : 'hold'} mood={beat === 3 ? 'wow' : 'happy'} flip />
          </Mv>
          {/* hammer banging beside the bench */}
          <Mv left={640} top={700} to={{ scale: beat >= 2 && beat < 4 ? 1 : 0 }} from={{ scale: 0 }} spring={SPRING.pop} origin="50% 100%">
            <div className="k-hammer" style={{ transformOrigin: '20% 85%' }}><Hammer /></div>
          </Mv>
          {/* sparks flying while we build */}
          <Show when={beat >= 2 && beat <= 3} k="sparks" y={0}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="k-fall" style={{ position: 'absolute', left: 760 + i * 45, top: 690, ['--delay' as string]: `${i * 0.35}s`, ['--dur' as string]: '1.4s', ['--fall' as string]: '-110px', ['--fx' as string]: `${(i - 1.5) * 40}px` } as CSSProperties}>
                <Sparkle size={34} color="#FFC800" />
              </div>
            ))}
          </Show>

          {/* the crate the bug hides behind */}
          <Svg style={{ zIndex: 5 }}><Slab x={1610} y={780} w={200} h={160} r={30} hue={soft(HUE.wood, 0.15)} border={6} /><path d="M1632 800 H1790 M1632 860 H1790" stroke={HUE.wood.edge} strokeWidth={8} opacity={0.6} /></Svg>
        </Dim>

        {/* the product: the subject while it is built */}
        <Subject at={{ x: 865, y: 776 }} w={330} h={400} anchor="bc" on={productOn} scale={1.12}>
          <Mv left={165} top={400} bc to={{ scale: beat >= 1 ? 1 : 0.5, opacity: beat >= 1 ? 1 : 0, y: 0 }} from={{ scale: 0.5, opacity: 0 }} spring={SPRING.hero}>
            <motion.div key={stage} initial={{ scale: 0.88, y: -26 }} animate={{ scale: 1, y: 0 }} transition={SPRING.pop} style={{ transformOrigin: '50% 100%' }}>
              <div className="k-breathe" style={{ ['--dur' as string]: '3s' } as CSSProperties}><Product stage={stage} /></div>
            </motion.div>
          </Mv>
        </Subject>

        {/* the bug: the subject on beat 3 (it creeps out from behind the crate) */}
        <Subject at={{ x: 1710, y: 800 }} w={170} h={170} anchor="bc" on={bugOn} scale={1.2}>
          <Mv left={85} top={170} bc to={{ y: beat === 3 ? -42 : beat >= 4 ? 130 : 160, opacity: beat >= 3 && beat < 4 ? 1 : 0 }} from={{ y: 160, opacity: 0 }} spring={{ ...SPRING.snappy, delay: beat === 3 ? 0.9 : 0 }}>
            <div className="k-wiggle" style={{ ['--wig' as string]: '4deg' } as CSSProperties}><Bug size={170} /></div>
          </Mv>
        </Subject>
        <Mv left={1710} top={560} to={{ scale: beat === 3 ? 1 : 0 }} from={{ scale: 0 }} spring={{ ...SPRING.pop, delay: 1.4 }} origin="50% 100%" z={6}>
          <div style={{ marginLeft: -50, width: 100, height: 100, borderRadius: 50, background: HUE.red.base, border: '6px solid #fff', boxShadow: 'var(--sh-sm)', display: 'grid', placeItems: 'center', fontSize: 74, fontWeight: 800, color: '#fff', lineHeight: 1 }}>!</div>
        </Mv>
      </Focus>

      {/* spooky tint for the bug beat, opacity only */}
      <motion.div animate={{ opacity: dark ? 0.1 : 0 }} transition={{ duration: 0.8 }} style={{ ...full, background: '#5A2F9E', pointerEvents: 'none', zIndex: 8 }} />

      <Show when={beat >= 1 && stage >= 1 && beat < 3} k="b" y={0}><Burst key={stage} fire={stage} x={865} y={640} count={18} spread={280} up={260} colors={['#FFC800', '#fff', '#1CB0F6']} /></Show>

      {/* beat 4: step 2 of the recipe (the product is the picture, nothing is dimmed) */}
      <Show when={beat === 4} k="recipe" y={40} style={{ zIndex: 9 }}>
        <div style={{ position: 'absolute', left: 80, top: 400 }}><RecipeTrack active={2} /></div>
        <Burst fire={5} x={960} y={640} count={60} />
      </Show>
    </div>
  );
}
