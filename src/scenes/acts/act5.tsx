// Act 5 Grow: startups grow stall -> shop -> office -> tower; Fibbot fumes and plots; a huge Festival order arrives; rocket launch.
// Beats (see SCENES.act5): 0 recap, 1 growth, 2 Fibbot fumes (the subject: he is enlarged, the city dims), 3 the plot and the huge order, 4 rocket.
import { C, Abs, Root, Sun, Cloud, Person, Bunting, Puff, Sparkle, Star, RocketIcon, RecipeStrip, cssVars } from '../artb/core';
import { Copier, FakeSheet } from '../artb/props';
import { Fibbot } from '../../ui';
import { Mv, V, H, Skyline, Bld, Crate } from '../artc/helpers';
import { Show } from '../shared/bits';
import { Backdrop, Focus, Subject } from '../kit/focus';
import type { SceneBodyProps } from '../types';

const GROUND = 900;
const HUES = [[C.orange, C.orangeEdge, C.orangeHi], [C.pink, C.pinkEdge, C.pinkHi], [C.blue, C.blueEdge, C.blueHi], [C.good, C.goodEdge, C.goodHi]] as const;

export default function Act5({ beat }: SceneBodyProps) {
  const fumes = beat === 2;
  return (
    <Root bg={fumes ? '#E7DDF5' : C.sky}>
      {/* the city: dimmed while Fibbot fumes (the main subject), no blur on this moving scene */}
      <Focus active={fumes}>
        <Backdrop blur={0} dim={0.55}>
          <Show when={!fumes} k="sun" y={0}><Abs x={1560} y={300}><Sun s={220} /></Abs></Show>
          <Abs x={120} y={310} className="drift" style={cssVars({ '--d': '60s', '--dx': '500px' })}><Cloud w={300} color={fumes ? '#B8BFD6' : '#fff'} shade={fumes ? '#8E96B4' : '#FBEFC2'} /></Abs>
          <Skyline y={GROUND - 30} color={fumes ? '#C8B8E8' : C.sky2} accent={fumes ? '#D9CCF0' : C.sky} />
          <div style={{ position: 'absolute', left: -400, top: GROUND - 30, width: 2720, height: 210, background: C.grass2 }} />
          <div style={{ position: 'absolute', left: -400, top: GROUND - 30, width: 2720, height: 24, background: C.grass }} />
          <div style={{ position: 'absolute', left: -400, top: GROUND + 60, width: 2720, height: 120, background: C.road }} />
          <Abs x={-400} y={380} z={2}><Bunting w={2720} sag={40} n={14} /></Abs>

          {/* the four growing startups */}
          {[0, 1, 2, 3].map(k => {
            const x = [130, 520, 910, 1300][k], sz = [230, 260, 280, 300][k], [h, e, hi] = HUES[k];
            const bottom = GROUND + 18;
            const top = bottom - sz * 2.1;
            const shrink = k > 0 ? 0.55 : 0.6;
            return (
              <Mv key={k} beat={beat} delay={k * 0.35} stiff={170} damp={12} origin="50% 100%" z={2}
                to={[H(x, top, 0.2), V(x, top), V(x, top, shrink, 0), V(x, top, 0.7), V(x, top)]}
                from={H(x, top, 0.2)}>
                <div className="squish" style={cssVars({ '--sx': 1.015, '--sy': 0.985, '--d': `${3 + k * 0.4}s`, transformOrigin: '50% 100%' })}><Bld k={k as 0 | 1 | 2 | 3} s={sz} hue={h} edge={e} hi={hi} /></div>
              </Mv>
            );
          })}
          {/* happy crowd */}
          {[0, 1, 2, 3, 4].map(n => (
            <Abs key={n} x={260 + n * 330} y={GROUND - 120} className="hop" z={3} style={cssVars({ '--d': '.9s', '--dl': `${n * 0.17}s`, '--amp': '30px', opacity: beat === 2 || beat === 3 ? 0.9 : 1 })}>
              <Person seed={n * 4 + 3} mood={beat === 2 ? 'wow' : 'happy'} arms={beat === 2 ? 'down' : 'up'} size={140} />
            </Abs>
          ))}
        </Backdrop>
      </Focus>

      {/* beat 2: Fibbot fumes, and he is the main subject: a little bigger, centred above the city */}
      {/* (his box is 520 x 460; y 450 keeps the enlarged top edge below the Bolt bubble) */}
      <Mv beat={beat} z={4} origin="50% 100%" stiff={110} damp={11} to={[H(1330, 420, 0.3), H(1330, 420, 0.3), V(1220, 450, fumes ? 1.22 : 1.05), V(1400, 520, 0.7), H(1700, 520, 0.4)]}>
        <div style={{ position: 'relative', width: 520, height: 460 }}>
          <Subject at={{ x: 260, y: 230 }} w={520} h={460} anchor="c" on={fumes} scale={1}>
            <div className={fumes ? 'shake' : 'bob'} style={cssVars({ '--d': fumes ? '.4s' : '1.2s', '--amp': '8px' })}><Fibbot mood={fumes ? 'angry' : 'sneaky'} size={520} /></div>
          </Subject>
        </div>
      </Mv>
      <Show when={fumes} k="puffs" y={0} style={{ zIndex: 5 }}>{[0, 1, 2, 3, 4, 5].map(i => (
        <Abs key={i} x={1300 + i * 60} y={470} z={5}><Puff s={70} color="#8A8AA8" d={1.6} dl={i * 0.25} dy={-120} dx={(i - 3) * 20} /></Abs>
      ))}</Show>

      {/* beat 3: plot + the huge Festival order */}
      <Mv beat={beat} z={3} to={[H(240, 120), H(240, 120), H(240, 120), V(180, 540, 1), H(180, 540, 0.5)]} stiff={120} damp={10}>
        <div className="hop" style={cssVars({ '--d': '1.4s', '--amp': '20px' })}><Crate s={400} label="HUGE" /></div>
      </Mv>
      <Mv beat={beat} z={3} to={[H(1100, 560), H(1100, 560), H(1100, 560), V(1050, 520), H(1050, 520)]}>
        <Copier s={430} mood="sneaky" />
      </Mv>
      <Show when={beat === 3} k="plot" y={0} style={{ zIndex: 4 }}>
        <Abs x={1130} y={700} className="fall" z={4} style={cssVars({ '--d': '2.2s', '--fx': '60px', '--fy': '170px', '--rot': '30deg' })}><FakeSheet s={90}><Star s={50} /></FakeSheet></Abs>
        <Abs x={640} y={470} className="twinkle" z={4}><Sparkle s={90} /></Abs>
      </Show>

      {/* beat 4: rocket */}
      <Show when={beat >= 4} k="rocket" y={0} style={{ zIndex: 6 }}>
        <Mv beat={beat} to={[H(900, 800), H(900, 800), H(900, 800), H(900, 800), V(880, 380, 1.1)]} z={6}><div className="bob" style={cssVars({ '--amp': '18px', '--d': '1.1s' })}><RocketIcon s={360} /></div></Mv>
        {[0, 1, 2].map(i => <Abs key={i} x={900 + i * 40} y={720} z={5}><Puff s={90} color="#fff" d={1.4} dl={i * 0.4} dy={140} dx={i * 20 - 20} /></Abs>)}
        <RecipeStrip active={5} y={900} />
      </Show>
    </Root>
  );
}
