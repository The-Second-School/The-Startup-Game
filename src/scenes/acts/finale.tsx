// Finale: Jhootu's tricks fail, he gets dizzy, goes POOF, runs away; Techistan celebrates and the Golden Trophy rises.
import { C, Abs, Root, Sun, Cloud, Person, Bunting, Burst, Puff, Star, Sparkle, Coin, cssVars } from '../artb/core';
import { Copier, FakeSheet } from '../artb/props';
import { Trophy } from '../artb/stage';
import { Avatar, Fibbot } from '../../ui';
import { Mv, V, H, Skyline, Bld, Heart } from '../artc/helpers';
import { Show } from '../shared/bits';
import { Backdrop as Dim, Focus, Subject } from '../kit/focus';
import type { SceneBodyProps } from '../types';

const GROUND = 900;

export default function Finale({ beat, teams }: SceneBodyProps) {
  const n = Math.max(1, teams.length);
  const gap = Math.min(300, 1500 / n);
  const x0 = 960 - ((n - 1) * gap) / 2;
  const win = beat >= 4;
  // Jhootu is the main subject on beats 0-2 (his tricks, his shock, his dizziness). Beat 3 (POOF and the sign) is a tableau.
  const fibbotOn = beat <= 2;
  return (
    <Root bg={win ? C.bg3 : C.sky}>
      <Focus active={fibbotOn}>
        {/* the city, the heroes and the crowd: dimmed while Jhootu has focus */}
        <Dim blur={0} dim={0.55}>
          <Show when={!win} k="sun" y={0}><Abs x={1600} y={300}><Sun s={200} /></Abs></Show>
          <Abs x={160} y={320} className="drift" style={cssVars({ '--d': '60s', '--dx': '400px' })}><Cloud w={300} /></Abs>
          <Skyline y={GROUND - 30} color={win ? C.bg4 : C.sky2} accent={win ? C.bg2 : C.sky} seed={5} />
          {[0, 1, 2, 3].map(k => <Abs key={k} x={120 + k * 470} y={GROUND - 30 - 300 * 2.1 + 28}><Bld k={k as 0 | 1 | 2 | 3} s={300} hue={[C.orange, C.pink, C.blue, C.good][k]} edge={[C.orangeEdge, C.pinkEdge, C.blueEdge, C.goodEdge][k]} hi={[C.orangeHi, C.pinkHi, C.blueHi, C.goodHi][k]} /></Abs>)}
          <div style={{ position: 'absolute', left: -400, top: GROUND - 30, width: 2720, height: 210, background: C.grass2 }} />
          <div style={{ position: 'absolute', left: -400, top: GROUND - 30, width: 2720, height: 24, background: C.grass }} />
          <Abs x={-400} y={280} z={2}><Bunting w={2720} sag={50} n={14} seed={win ? 3 : 0} /></Abs>

          {/* beat 0: Jhootu's tricks: copy, cheat, trick */}
          <Mv beat={beat} z={3} to={[V(110, 520), H(110, 520), H(110, 520), H(110, 520), H(110, 520)]} stiff={120}><Copier s={420} mood="sneaky" /></Mv>
          <Mv beat={beat} z={3} to={[V(560, 760, 1, -10), H(560, 760), H(560, 760), H(560, 760), H(560, 760)]}><FakeSheet s={120}><Star s={70} color={C.rv} edge={C.rvEdge} hi={C.rvHi} /></FakeSheet></Mv>
          <Show when={beat === 0} k="tricks" y={0} style={{ zIndex: 4 }}>
            {[0, 1, 2, 3, 4].map(i => <Abs key={i} x={420 + i * 70} y={460 + (i % 2) * 40} z={4} className="hop" style={cssVars({ '--d': '1s', '--dl': `${i * 0.15}s`, '--amp': '24px' })}><Star s={70} color={C.rv} edge={C.rvEdge} hi={C.rvHi} /></Abs>)}
            <Abs x={800} y={520} z={4} className="pulse" style={cssVars({ '--d': '.9s' })}><Coin s={80} /></Abs>
          </Show>

          {/* heroes: team avatars cheer from beat 1 on */}
          {teams.map((t, i) => (
            <Mv key={t.id} beat={beat} delay={i * 0.1} z={5} stiff={160} damp={11}
              to={[H(x0 + i * gap - 80, 700, 0.5), V(x0 + i * gap - 90, 700, 0.95), V(x0 + i * gap - 90, 700, 0.95), V(x0 + i * gap - 90, 690, 1), V(x0 + i * gap - 90, 650, 1.05)]}>
              <div className="hop" style={cssVars({ '--d': beat >= 3 ? '.7s' : '1s', '--dl': `${i * 0.12}s`, '--amp': '34px' })}><Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} size={190} mood={beat >= 1 ? 'happy' : 'wow'} /></div>
            </Mv>
          ))}
          <Show when={beat >= 1 && beat <= 3} k="hearts" y={0} style={{ zIndex: 6 }}>{[0, 1, 2, 3].map(i => <Abs key={i} x={x0 + i * (gap * Math.max(1, (n - 1) / 3)) - 20} y={620} z={6} className="rise" style={cssVars({ '--d': '2.2s', '--dl': `${i * 0.55}s`, '--dy': '-200px', '--s2': 1.1 })}><Heart s={64} /></Abs>)}</Show>

          {/* crowd */}
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <Abs key={i} x={90 + i * 275} y={GROUND + 30} z={6} className="hop" style={cssVars({ '--d': '.85s', '--dl': `${(i * 0.19) % 0.85}s`, '--amp': '28px' })}>
              <Person seed={i * 5 + 2} mood="happy" arms="up" size={150} />
            </Abs>
          ))}
        </Dim>

        {/* Jhootu: sneaky, then dizzy, then runs away. His Subject sits inside his moving box, so the halo travels with him. */}
        <Mv beat={beat} z={4} stiff={70} damp={12} origin="50% 80%"
          to={[V(1200, 400, 1), V(1250, 420, 0.8, 4), V(1020, 400, 1.1), V(2300, 640, 0.5, 20), H(2300, 640, 0.3)]} from={H(1900, 400, 0.8)}>
          <div style={{ position: 'relative', width: 560, height: 560 }}>
            <Subject at={{ x: 280, y: 280 }} w={560} h={560} anchor="c" on={fibbotOn} scale={1.12}>
              <div className={beat === 2 ? 'wobble' : beat === 3 ? 'step' : 'bob'} style={cssVars({ '--d': beat === 3 ? '.2s' : beat === 2 ? '.3s' : '2s', '--amp': '10px' })}>
                <Fibbot mood={beat === 0 ? 'sneaky' : beat === 1 ? 'shock' : beat === 2 ? 'dizzy' : 'laugh'} size={560} />
              </div>
            </Subject>
          </div>
        </Mv>
      </Focus>

      <Show when={beat === 2} k="dizzy" y={0} style={{ zIndex: 6 }}>{[0, 1, 2, 3, 4].map(i => (
        <Abs key={i} x={1020 + 280} y={440} z={6} className="spin" style={cssVars({ '--d': `${1.2 + (i % 2) * 0.3}s`, transformOrigin: '0 0' })}>
          <div style={{ position: 'absolute', left: Math.cos(i * 1.256) * 240 - 40, top: Math.sin(i * 1.256) * 90 - 40 }}><Star s={80} /></div>
        </Abs>
      ))}</Show>

      {/* beat 3: POOF and "I'll be back" (a tableau: Jhootu has gone, nothing is dimmed) */}
      <Show when={beat === 3} k="poof" y={0} style={{ zIndex: 7 }}>
        <Abs x={1300} y={640} z={7}><Burst n={22} r={340} d={1.8} colors={[C.rv, C.rvHi, '#fff', C.rvEdge]} /></Abs>
        {[0, 1, 2, 3, 4].map(i => <Abs key={i} x={1000 + i * 90} y={820} z={7}><Puff s={110} color="#fff" d={1.2} dl={i * 0.15} dy={-120} dx={i * 30} /></Abs>)}
        <Mv beat={beat} z={8} to={[H(520, 440), H(520, 440), H(520, 440), V(480, 440, 1, -3)]}>
          <div style={{ background: '#fff', border: '6px solid #fff', borderRadius: 40, padding: '14px 30px', boxShadow: 'var(--sh-sm)', fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 52, color: C.rv, whiteSpace: 'nowrap' }}>I'll be back next year!</div>
        </Mv>
      </Show>

      {/* beat 4: fireworks + trophy rises (the trophy is the subject) */}
      <Show when={win} k="win" y={0} style={{ zIndex: 3 }}>
        <Abs x={300} y={440} z={3}><Burst n={16} r={240} d={1.8} delay={0} /></Abs>
        <Abs x={1620} y={440} z={3}><Burst n={16} r={240} d={1.8} delay={0.7} /></Abs>
        <Abs x={960} y={440} z={3}><Burst n={20} r={300} d={2.2} delay={0.3} /></Abs>
        <Mv beat={beat} z={9} stiff={80} damp={10} to={[H(780, 1100), H(780, 1100), H(780, 1100), H(780, 1100), V(780, 420, 1.2)]}>
          <div style={{ position: 'relative', width: 380, height: 380 }}>
            <Subject at={{ x: 190, y: 190 }} w={380} h={380} anchor="c" on={beat >= 4} scale={1.06}>
              <div className="bob" style={cssVars({ '--amp': '14px', '--d': '2s' })}><Trophy s={380} /></div>
            </Subject>
          </div>
        </Mv>
        <Abs x={760} y={380} z={10} className="twinkle"><Sparkle s={90} /></Abs>
        <Abs x={1140} y={470} z={10} className="twinkle" style={cssVars({ '--dl': '.6s' })}><Sparkle s={70} /></Abs>
      </Show>
    </Root>
  );
}
