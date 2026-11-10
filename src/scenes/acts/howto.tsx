// How to play: the 3 scores, why you need all three, the growth ladder, locking answers, the reveal, and rAIvan's tricks.
import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import {
  BigLock, Burst, Bug, Clouds, HUE, INK, Kid, SPRING, Sky, Sparkle, StickerCard, Svg, ThoughtCloud, Trophy, full, useSubstep, type Hue,
} from '../kit';
import { Avatar } from '../../ui';
import { Building, CoinBit, HeartBit, Mv, Raivan, Show } from '../shared/bits';
import type { SceneBodyProps } from '../types';

const T = (s: number, c = INK, extra?: CSSProperties) => ({ fontSize: s, fontWeight: 800, color: c, lineHeight: 1, ...extra });

function ScoreCard({ title, hue, children }: { title: string; hue: Hue; children: ReactNode }) {
  return (
    <StickerCard w={460} h={520} hue={hue} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 36, gap: 18 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 30, height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{children}</div>
      <div style={T(62)}>{title}</div>
    </StickerCard>
  );
}

const LADDER: { kind: 0 | 1 | 2 | 3; x: number; h: number; label: string; hue: Hue }[] = [
  { kind: 0, x: 330, h: 230, label: 'Tiny Stall', hue: HUE.green },
  { kind: 1, x: 720, h: 290, label: 'Busy Shop', hue: HUE.orange },
  { kind: 2, x: 1120, h: 370, label: 'Big Office', hue: HUE.blue },
  { kind: 3, x: 1560, h: 470, label: 'Sky Tower', hue: HUE.purple },
];

export default function HowTo({ beat, teams }: SceneBodyProps) {
  const sub = useSubstep(beat, [500, 1700, 2900, 4100]);
  const dark = beat === 5;
  const cardX = beat === 0 ? [380, 960, 1540] : [630, 960, 1290];
  const cardTo = () => (beat <= 1 ? { x: 0, y: beat === 0 ? 0 : -220, scale: beat === 0 ? 1 : 0.42, opacity: 1 } : { x: 0, y: 120, scale: 0.4, opacity: 0 });
  const hold = Math.min(teams.length, 6);

  return (
    <div style={{ ...full, overflow: 'hidden' }}>
      <Sky tone={dark ? 'storm' : 'gold'} horizon={820} />
      <Clouds seed={8} count={4} yMin={300} yMax={520} fill={dark ? '#9C84CC' : '#FFFFFF'} edge={dark ? '#8870BA' : '#FFE9B0'} />
      <Svg>
        <ellipse cx={400} cy={1020} rx={760} ry={140} fill={dark ? '#B8A2E0' : '#CBEFA6'} />
        <ellipse cx={1500} cy={1040} rx={820} ry={150} fill={dark ? '#A98FD8' : '#B9ECD9'} />
      </Svg>

      {/* 0 + 1: the three scores, and why you need all of them */}
      {[0, 1, 2].map(i => (
        <Mv key={i} left={cardX[i]} top={880} bc to={cardTo()} from={beat === 0 ? { y: 300, scale: 0.4, opacity: 0 } : undefined} spring={{ ...SPRING.hero, delay: beat === 0 ? 0.3 + i * 0.35 : 0 }}>
          <div className="k-bob" style={{ ['--dur' as string]: `${2.6 + i * 0.3}s`, ['--bob' as string]: '8px' } as CSSProperties}>
            {i === 0 && <ScoreCard title="Customers" hue={HUE.sky}>
              <div style={{ position: 'relative', width: 400, height: 280 }}>
                {[{ x: 0, s: 230, sk: 0, sh: HUE.orange }, { x: 110, s: 270, sk: 2, sh: HUE.green }, { x: 220, s: 230, sk: 1, sh: HUE.pink }].map((k, j) => (
                  <div key={j} style={{ position: 'absolute', left: k.x, bottom: 0, zIndex: j === 1 ? 2 : 1 }}><Kid size={k.s} skin={k.sk} hair={j} hairStyle={(j + 1) as 1 | 2 | 3} shirt={k.sh} pose={j === 1 ? 'cheer' : 'idle'} delay={j * 0.2} /></div>
                ))}
              </div>
            </ScoreCard>}
            {i === 1 && <ScoreCard title="Happiness" hue={HUE.pink}>
              <div className="k-pulse" style={{ ['--pulse' as string]: '1.1', ['--dur' as string]: '1.1s' } as CSSProperties}><HeartBit size={250} /></div>
              <div style={{ position: 'absolute', left: 70, top: 40 }}><Sparkle size={56} color="#FFF1A8" /></div><div style={{ position: 'absolute', right: 60, top: 90 }}><Sparkle size={44} color="#fff" delay={0.5} /></div>
            </ScoreCard>}
            {i === 2 && <ScoreCard title="Coins" hue={HUE.sun}>
              <div style={{ position: 'relative', width: 340, height: 260 }}>
                {[[10, 150], [130, 160], [240, 140], [70, 70], [180, 60]].map(([x, y], j) => <div key={j} className="k-bob" style={{ position: 'absolute', left: x, top: y, ['--delay' as string]: `${j * 0.25}s`, ['--bob' as string]: '6px' } as CSSProperties}><CoinBit size={110} /></div>)}
              </div>
            </ScoreCard>}
          </div>
        </Mv>
      ))}
      {/* plus signs + the trophy that needs all three */}
      {[795, 1125].map((x, i) => (
        <Mv key={x} left={x} top={555} to={{ scale: beat === 1 ? 1 : 0, opacity: beat === 1 ? 1 : 0 }} from={{ scale: 0, opacity: 0 }} spring={{ ...SPRING.pop, delay: 0.5 + i * 0.2 }} origin="50% 50%">
          <div style={{ marginLeft: -40, marginTop: -40, width: 80, height: 80, borderRadius: 40, background: '#fff', border: '6px solid #fff', boxShadow: 'var(--sh-sm)', display: 'grid', placeItems: 'center', ...T(64, HUE.green.edge) }}>+</div>
        </Mv>
      ))}
      <Mv left={960} top={1050} bc to={{ scale: beat === 1 ? 1 : 0.3, opacity: beat === 1 ? 1 : 0 }} from={{ scale: 0.3, opacity: 0 }} spring={{ ...SPRING.hero, delay: 0.9 }}>
        <div className="k-hero" style={{ ['--bob' as string]: '-10px' } as CSSProperties}><Trophy size={270} /></div>
      </Mv>
      <Show when={beat === 1} k="b1" y={0}><Burst fire={1} x={960} y={800} count={55} /></Show>

      {/* 2: the growth ladder */}
      <Svg><rect x={140} y={934} width={1640} height={26} rx={13} fill={HUE.stone.hi} opacity={beat === 2 ? 1 : 0} style={{ transition: 'opacity .5s' }} /></Svg>
      {LADDER.map((b, i) => (
        <Mv key={i} left={b.x} top={940} bc to={{ scale: beat === 2 && sub > i ? 1 : 0, y: 0, opacity: beat === 2 && sub > i ? 1 : 0 }} from={{ scale: 0, opacity: 0 }} spring={SPRING.hero}>
          <div style={{ position: 'relative' }}>
            <Building kind={b.kind} size={b.h} />
            <div style={{ position: 'absolute', left: '50%', bottom: -62, transform: 'translateX(-50%)', whiteSpace: 'nowrap', padding: '8px 22px', borderRadius: 30, background: b.hue.base, border: '5px solid #fff', boxShadow: 'var(--sh-sm)', ...T(38, '#fff') }}>{b.label}</div>
          </div>
        </Mv>
      ))}
      <Mv left={1250} top={960} bc to={{ scale: beat === 2 && sub >= 4 ? 1 : 0 }} from={{ scale: 0 }} spring={SPRING.pop}><Kid size={230} pose="cheer" mood="grin" skin={3} shirt={HUE.sun} /></Mv>

      {/* 3: talk, then the Lock Master locks it */}
      <Mv left={960} top={900} bc to={{ scale: beat === 3 ? 1 : 0.5, opacity: beat === 3 ? 1 : 0, y: beat === 3 ? 0 : 80 }} from={{ scale: 0.5, opacity: 0, y: 80 }} spring={SPRING.hero}>
        <StickerCard w={760} h={500} hue={HUE.paper} rotate={-1.5} style={{ padding: 34, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={T(46, INK_SOFTER)}>Which one?</div>
          {[HUE.blue, HUE.orange, HUE.green].map((h, i) => {
            const picked = sub >= 1 && i === 1;
            return (
              <motion.div key={i} animate={{ scale: picked ? [1, 1.06, 1.03] : 1, rotate: picked ? [0, -1.5, 0] : 0 }} transition={{ duration: 0.5 }}
                style={{ flex: 1, borderRadius: 28, background: h.base, border: '6px solid #fff', boxShadow: picked ? '0 0 0 8px #58CC02' : 'var(--sh-sm)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 22 }}>
                <div style={{ width: 52, height: 52, borderRadius: 26, background: '#fff', display: 'grid', placeItems: 'center', ...T(34, h.edge) }}>{'ABC'[i]}</div>
                <div style={{ flex: 1, height: 22, borderRadius: 11, background: '#fff', opacity: 0.75 }} />
              </motion.div>
            );
          })}
        </StickerCard>
      </Mv>
      <Mv left={1450} top={880} bc to={{ scale: beat === 3 ? (sub >= 2 ? 1.12 : 1) : 0.2, opacity: beat === 3 ? 1 : 0 }} from={{ scale: 0.2, opacity: 0 }} spring={SPRING.pop}>
        <BigLock size={280} locked={beat === 3 && sub >= 2} />
      </Mv>
      <Show when={beat === 3 && sub >= 2} k="b3" y={0}><Burst fire={2} x={1450} y={700} count={36} spread={500} up={400} colors={['#FFC800', '#fff', '#58CC02']} /></Show>
      {[0, 1, 2].map(i => (
        <Mv key={i} left={170 + i * 150} top={960} bc to={{ scale: beat === 3 ? 1 : 0, opacity: beat === 3 ? 1 : 0 }} from={{ scale: 0, opacity: 0 }} spring={{ ...SPRING.pop, delay: 0.2 + i * 0.15 }}>
          <Kid size={i === 1 ? 260 : 230} skin={[1, 0, 4][i]} hair={i} hairStyle={[0, 2, 1][i] as 0 | 1 | 2} shirt={[HUE.sky, HUE.coral, HUE.mint][i]} pose={i === 1 ? 'point' : 'think'} flip={i === 0} mood="happy" delay={i * 0.3} />
        </Mv>
      ))}
      <Mv left={360} top={560} to={{ scale: beat === 3 && sub >= 0 ? 1 : 0 }} from={{ scale: 0 }} spring={{ ...SPRING.pop, delay: 0.8 }} origin="0% 100%">
        <ThoughtCloud size={190}><text x={120} y={118} textAnchor="middle" fontSize={96} fontWeight={800} fill={HUE.blue.base} fontFamily="inherit">?</text></ThoughtCloud>
      </Mv>

      {/* 4: Bolt reveals what happened to each team */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 450, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', padding: '0 80px' }}>
        <AnimatePresence>
          {beat === 4 && teams.slice(0, hold).map((t, i) => {
            const c = (i * 7 + 4) % 9 + 3, h = (i * 5 + 3) % 8 + 2;
            return (
              <motion.div key={t.id} initial={{ y: 200, scale: 0.4, opacity: 0, rotate: i % 2 ? 8 : -8 }} animate={{ y: 0, scale: 1, opacity: 1, rotate: i % 2 ? 2 : -2 }} exit={{ y: 120, scale: 0.5, opacity: 0 }}
                transition={{ ...SPRING.hero, delay: 0.3 + i * 0.7 }}
                style={{ width: hold > 4 ? 250 : 330, background: '#fff', border: '6px solid #fff', borderRadius: 44, boxShadow: 'var(--sh-sm)', padding: '22px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} size={hold > 4 ? 110 : 140} mood="happy" />
                <div style={T(34)}>{t.name}</div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...SPRING.pop, delay: 0.9 + i * 0.7 }} style={{ display: 'flex', gap: 10 }}>
                  <span style={{ ...T(26, '#fff', { whiteSpace: 'nowrap' }), background: HUE.blue.base, borderRadius: 22, padding: '8px 12px' }}>+{c} 👥</span>
                  <span style={{ ...T(26, '#fff', { whiteSpace: 'nowrap' }), background: HUE.pink.base, borderRadius: 22, padding: '8px 12px' }}>+{h} 😊</span>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 5: rAIvan's tempting tricks */}
      <Mv left={1450} top={900} bc to={{ x: beat === 5 ? 0 : 500, opacity: beat === 5 ? 1 : 0, scale: 0.85 }} from={{ x: 500, opacity: 0 }} spring={{ type: 'spring', stiffness: 70, damping: 14 }}>
        <Raivan size={520} angry smoke />
      </Mv>
      <Mv left={820} top={880} bc to={{ scale: beat === 5 ? 1 : 0, rotate: beat === 5 ? -3 : 0 }} from={{ scale: 0 }} spring={{ ...SPRING.hero, delay: 0.3 }} z={3}>
        <div className="k-wiggle" style={{ ['--wig' as string]: '2deg', ['--dur' as string]: '0.9s' } as CSSProperties}>
          <StickerCard w={520} h={400} hue={HUE.sun} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={T(72, HUE.red.base, { textShadow: '0 4px 0 #fff' })}>FREE!</div>
            <div style={T(46)}>Copy it all! ✨</div>
            <div style={{ position: 'absolute', left: -20, top: -20 }}><Sparkle size={90} color="#fff" /></div><div style={{ position: 'absolute', right: -10, bottom: 10 }}><Sparkle size={70} color="#FFF1A8" delay={0.5} /></div>
          </StickerCard>
        </div>
      </Mv>
      <Mv left={610} top={760} to={{ x: beat === 5 ? 0 : -300, opacity: beat === 5 ? 1 : 0 }} from={{ x: -300, opacity: 0 }} spring={{ ...SPRING.move, delay: 1 }} z={4}><Bug size={140} /></Mv>
      <Mv left={230} top={960} bc to={{ scale: beat === 5 ? 1 : 0 }} from={{ scale: 0 }} spring={{ ...SPRING.pop, delay: 0.6 }}><Kid size={270} pose="think" mood="worried" skin={2} hair={2} hairStyle={2} shirt={HUE.mint} /></Mv>
      <Mv left={350} top={520} to={{ scale: beat === 5 ? 1 : 0 }} from={{ scale: 0 }} spring={{ ...SPRING.pop, delay: 1.2 }} origin="0% 100%">
        <ThoughtCloud size={200}><text x={120} y={118} textAnchor="middle" fontSize={96} fontWeight={800} fill={HUE.purple.edge} fontFamily="inherit">?</text></ThoughtCloud>
      </Mv>
    </div>
  );
}

const INK_SOFTER = '#8A6F3E';
