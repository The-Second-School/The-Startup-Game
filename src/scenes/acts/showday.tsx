// Show Day: closed festival curtains open on a stage; teams take turns in the spotlight; stars fly in; the Golden Trophy appears.
import { memo, useEffect, useState } from 'react';
import { C, Abs, Root, Bunting, Person, Star, Sparkle, Burst, cssVars } from '../artb/core';
import { Balloon as B2 } from '../artb/props';
import { Beam, Curtain, Pedestal, Trophy, Valance } from '../artb/stage';
import { Avatar } from '../../ui';
import { Mv, V, H } from '../artc/helpers';
import { Show } from '../shared/bits';
import { Backdrop as Dim, Focus, Subject } from '../kit/focus';
import type { SceneBodyProps } from '../types';

const FLOOR = 770;
const WALL = '#EEE4FC', PILLAR = '#E0D0F7', BOARDS = '#F0D6B0', BOARDS_HI = '#F8E6CB';
const CUR = { color: '#FF7F7F', edge: '#F26565', hi: '#FFC1C1' };

/** Static backdrop: wall, pillars, floor. Memoised, it never changes. */
const Backdrop = memo(function Backdrop() {
  return (
    <>
      <div style={{ position: 'absolute', left: -400, top: 0, width: 2720, height: FLOOR, background: WALL }} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} style={{ position: 'absolute', left: 120 + i * 230, top: 220, width: 70, height: 420, borderRadius: 35, background: PILLAR }} />)}
      <div style={{ position: 'absolute', left: -400, top: FLOOR, width: 2720, height: 310, background: BOARDS }} />
      <div style={{ position: 'absolute', left: -400, top: FLOOR, width: 2720, height: 22, background: BOARDS_HI }} />
    </>
  );
});

/** The audience row. Memoised: its props never change between beats except the mood. */
const Audience = memo(function Audience({ wow }: { wow: boolean }) {
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => (
        <Abs key={i} x={60 + i * 215} y={950} className="hop" z={9} style={cssVars({ '--d': '.9s', '--dl': `${(i * 0.13) % 0.9}s`, '--amp': '26px' })}>
          <Person seed={i * 3 + 1} mood={wow ? 'wow' : 'happy'} arms="up" size={150} />
        </Abs>
      ))}
    </>
  );
});

export default function ShowDay({ beat, teams }: SceneBodyProps) {
  const n = Math.max(1, teams.length);
  const size = n > 4 ? 190 : 230;
  const gap = n > 4 ? 270 : 330;
  const x0 = 960 - ((n - 1) * gap) / 2;
  const [spot, setSpot] = useState(0);
  useEffect(() => { const t = setInterval(() => setSpot(v => (v + 1) % n), 1500); return () => clearInterval(t); }, [n]);
  const spotX = beat === 2 ? 960 : beat === 3 ? 960 : x0 + spot * gap;

  return (
    <Root bg={WALL}>
      {/* the golden trophy is the main subject on beat 3: the stage behind it dims */}
      <Focus active={beat === 3}><Dim blur={0} dim={0.55}><Backdrop /></Dim></Focus>
      <Abs x={-400} y={190} z={2}><Bunting w={2720} sag={60} n={14} seed={2} /></Abs>

      {/* teams on stage (beats 1-2) */}
      {teams.map((t, i) => {
        const x = x0 + i * gap - size / 2;
        const lit = beat === 1 ? i === spot : beat === 2 ? i === 0 : false;
        return (
          <Mv key={t.id} beat={beat} delay={i * 0.12} z={3} stiff={150} damp={12}
            to={[H(x, FLOOR - size - 10, 0.4), lit ? V(x, FLOOR - size - 50, 1.25) : V(x, FLOOR - size - 10, 1), V(beat === 2 && i === 0 ? 960 - size / 2 : x, FLOOR - size - (i === 0 ? 70 : 10), i === 0 ? 1.6 : 0.9), H(x, FLOOR - size, 0.7)]}
            from={H(x, FLOOR - size - 10, 0.4)}>
            <div className={lit ? 'hop' : undefined} style={cssVars({ '--d': '.9s', '--amp': '18px' })}>
              <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} size={size} mood={lit ? 'cool' : 'happy'} ring={lit} />
            </div>
          </Mv>
        );
      })}

      {/* spotlights */}
      <Abs x={spotX - 270} y={110} z={4} style={{ transition: 'left .7s ease-in-out', opacity: beat === 0 ? 0 : 1 }}><Beam len={700} spread={460} opacity={0.42} /></Abs>
      <Abs x={400} y={110} z={4} className="sway" origin="50% 0%" style={cssVars({ '--ang': '8deg', '--d': '3s', opacity: beat === 0 ? 0.7 : 0.35 })}><Beam len={760} spread={300} color="#BDEBFF" opacity={0.4} /></Abs>
      <Abs x={1220} y={110} z={4} className="sway" origin="50% 0%" style={cssVars({ '--ang': '8deg', '--d': '3.4s', '--dl': '-1s', opacity: beat === 0 ? 0.7 : 0.35 })}><Beam len={760} spread={300} color="#FFC9E4" opacity={0.4} /></Abs>

      {/* beat 2: stars fly from the crowd to the star team */}
      <Show when={beat === 2} k="stars" y={0} style={{ zIndex: 6 }}>{[0, 1, 2, 3, 4, 5].map(i => (
        <Abs key={i} x={260 + i * 280} y={900} className="burst" z={6} style={cssVars({ '--tx': `${960 - (260 + i * 280)}px`, '--ty': '-480px', '--rot': `${i * 40}deg`, '--d': '2s', '--dl': `${i * 0.28}s` })}><Star s={90} /></Abs>
      ))}
      {[0, 1, 2, 3, 4].map(i => (
        <Mv key={i} beat={beat} delay={0.5 + i * 0.25} z={6} to={[H(960, 400), H(960, 400), V(560 + i * 200, 360 + (i % 2) * 40, 1, (i - 2) * 8), H(960, 400)]}><Star s={110} /></Mv>
      ))}</Show>

      {/* beat 3: the Golden Trophy */}
      {/* (the trophy sits at y 420: its enlarged top edge stays below the Bolt bubble) */}
      <Mv beat={beat} z={5} stiff={90} damp={11} to={[H(690, 1000), H(690, 1000), H(690, 1000), V(750, 420, beat === 3 ? 1.2 : 1)]}>
        <div style={{ position: 'relative', width: 360, height: 360 }}>
          <Subject at={{ x: 180, y: 180 }} w={360} h={360} anchor="c" on={beat === 3} scale={1.06}>
            <Trophy s={360} className="pulse" style={cssVars({ '--s': 1.04, '--d': '1.6s' })} />
            <Abs x={380} y={20} className="twinkle"><Sparkle s={80} /></Abs><Abs x={-40} y={120} className="twinkle" style={cssVars({ '--dl': '.7s' })}><Sparkle s={64} /></Abs>
          </Subject>
        </div>
      </Mv>
      <Mv beat={beat} z={4} to={[H(750, 1000), H(750, 1000), H(750, 1000), V(750, 720, 1)]}><Pedestal w={420} h={300} /></Mv>
      <Show when={beat === 3} k="burst" y={0} style={{ zIndex: 6 }}><Abs x={960} y={620} z={6}><Burst n={18} r={320} d={2.4} up /></Abs></Show>

      {/* curtains: closed on beat 0, tied back after */}
      <Mv beat={beat} to={[V(420, 0), V(-40, 0), V(-40, 0), V(-40, 0)]} z={7} stiff={60} damp={16} origin="0% 0%"><Curtain w={560} side="left" {...CUR} /></Mv>
      <Mv beat={beat} to={[V(940, 0), V(1400, 0), V(1400, 0), V(1400, 0)]} z={7} stiff={60} damp={16} origin="0% 0%"><Curtain w={560} side="right" {...CUR} /></Mv>
      <Abs x={-400} y={-10} z={8}><Valance w={2720} color={CUR.color} edge={CUR.edge} /></Abs>

      {/* beat 0: balloons + excited crowd */}
      <Show when={beat === 0} k="balloons" y={0} style={{ zIndex: 9 }}>{[C.bad, C.sun, C.blue, C.good, C.pink].map((c, i) => (
        <Abs key={i} x={200 + i * 340} y={620} className="rise" z={9} style={cssVars({ '--d': '3.6s', '--dl': `${i * 0.5}s`, '--dy': '-420px', '--s2': 1 })}><B2 s={110} color={c} /></Abs>
      ))}</Show>
      <Audience wow={beat === 3} />
    </Root>
  );
}
