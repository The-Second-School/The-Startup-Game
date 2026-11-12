// How to play. Beats (see SCENES.howto): 0 the three scores, 1-2 Coins, 3-4 Customers, 5-6 Happiness, 7 why both,
// 8 how Success is made, 9 the growth ladder, 10 locking answers, 11 the reveal, 12 Fibbot's tricks, 13 summary tableau.
// Every number on screen is a real one: the start values and Success formula from content.ts, and the "Ask 10 people" option.
import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import {
  BigLock, Burst, Bug, Clouds, HUE, INK, Kid, SPRING, Sky, Sparkle, StickerCard, Svg, ThoughtCloud, Trophy, full, useSubstep, type Hue,
} from '../kit';
import { Backdrop, Focus, Subject } from '../kit/focus';
import { Avatar, CountUp } from '../../ui';
import { START, SUCCESS_DIVISOR } from '../../game/content';
import { Building, CoinBit, HeartBit, Mv, Fibbot, Show } from '../shared/bits';
import type { SceneBodyProps } from '../types';

const T = (s: number, c = INK, extra?: CSSProperties) => ({ fontSize: s, fontWeight: 800, color: c, lineHeight: 1, ...extra });
const INK_SOFTER = '#8A6F3E';
// "Ask 10 people at the market" (content.ts): -10 coins, +3 customers, +7 happiness.
const ASK = { coins: 10, customers: 3, happiness: 7 };
// Success at the start, rounded the same way the engine does it.
const SUCCESS_START = Math.round(((START.customers + START.happiness) * START.coins) / SUCCESS_DIVISOR);

function ScoreCard({ title, hue, value, children }: { title: string; hue: Hue; value?: ReactNode; children: ReactNode }) {
  return (
    <StickerCard w={460} h={520} hue={hue} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 36, gap: 18 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 30, height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{children}</div>
      <div style={T(62)}>{title}</div>
      {value !== undefined && <div style={T(44, INK_SOFTER, { whiteSpace: 'nowrap' })}>{value}</div>}
    </StickerCard>
  );
}

function Pill({ text, hue }: { text: ReactNode; hue: Hue }) {
  return <span style={{ ...T(40, '#fff', { whiteSpace: 'nowrap' }), background: hue.base, border: '5px solid #fff', borderRadius: 30, padding: '10px 24px', boxShadow: 'var(--sh-sm)' }}>{text}</span>;
}

const CustomersArt = () => (
  <div style={{ position: 'relative', width: 400, height: 280 }}>
    {[{ x: 0, s: 230, sk: 0, sh: HUE.orange }, { x: 110, s: 270, sk: 2, sh: HUE.green }, { x: 220, s: 230, sk: 1, sh: HUE.pink }].map((k, j) => (
      <div key={j} style={{ position: 'absolute', left: k.x, bottom: 0, zIndex: j === 1 ? 2 : 1 }}><Kid size={k.s} skin={k.sk} hair={j} hairStyle={(j + 1) as 1 | 2 | 3} shirt={k.sh} pose={j === 1 ? 'cheer' : 'idle'} delay={j * 0.2} /></div>
    ))}
  </div>
);
const HappinessArt = () => (
  <>
    <div className="k-pulse" style={{ ['--pulse' as string]: '1.1', ['--dur' as string]: '1.1s' } as CSSProperties}><HeartBit size={250} /></div>
    <div style={{ position: 'absolute', left: 70, top: 40 }}><Sparkle size={56} color="#FFF1A8" /></div><div style={{ position: 'absolute', right: 60, top: 90 }}><Sparkle size={44} color="#fff" delay={0.5} /></div>
  </>
);
const CoinsArt = () => (
  <div style={{ position: 'relative', width: 340, height: 260 }}>
    {[[10, 150], [130, 160], [240, 140], [70, 70], [180, 60]].map(([x, y], j) => <div key={j} className="k-bob" style={{ position: 'absolute', left: x, top: y, ['--delay' as string]: `${j * 0.25}s`, ['--bob' as string]: '6px' } as CSSProperties}><CoinBit size={110} /></div>)}
  </div>
);

/** The one card that is the main subject of a focus beat (beats 1-8). */
function focusCard(beat: number, sub: number): ReactNode {
  const coins = beat === 2 && sub >= 1 ? START.coins - ASK.coins : START.coins; // spending 10 coins on the ask
  if (beat === 1 || beat === 2) return <ScoreCard title="Coins" hue={HUE.sun} value={<>🪙 <CountUp value={coins} /></>}><CoinsArt /></ScoreCard>;
  if (beat === 3 || beat === 4) return <ScoreCard title="Customers" hue={HUE.sky} value={<>👥 <CountUp value={START.customers} /></>}><CustomersArt /></ScoreCard>;
  if (beat === 5 || beat === 6) return <ScoreCard title="Happiness" hue={HUE.pink} value={<>😊 <CountUp value={START.happiness} /></>}><HappinessArt /></ScoreCard>;
  if (beat === 7) return (
    <StickerCard w={980} h={440} hue={HUE.paper} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 34 }}>
      <div style={T(58, HUE.blue.edge)}>👥 Customers bring the sales</div>
      <div style={T(58, HUE.pink.edge)}>😊 Happiness keeps them coming back</div>
    </StickerCard>
  );
  if (beat === 8) return (
    <StickerCard w={980} h={440} hue={HUE.sun} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 26 }}>
      <div style={T(64)}>(👥 + 😊) × 🪙 ÷ {SUCCESS_DIVISOR}</div>
      <div style={T(76, HUE.green.edge)}>= ⭐ Success</div>
      <div style={T(40, INK_SOFTER)}>Start: ({START.customers} + {START.happiness}) × {START.coins} ÷ {SUCCESS_DIVISOR} = <CountUp value={SUCCESS_START} /> ⭐</div>
    </StickerCard>
  );
  return null;
}

const LADDER: { kind: 0 | 1 | 2 | 3; x: number; h: number; label: string; hue: Hue }[] = [
  { kind: 0, x: 330, h: 230, label: 'Tiny Stall', hue: HUE.green },
  { kind: 1, x: 720, h: 290, label: 'Busy Shop', hue: HUE.orange },
  { kind: 2, x: 1120, h: 370, label: 'Big Office', hue: HUE.blue },
  { kind: 3, x: 1560, h: 470, label: 'Sky Tower', hue: HUE.purple },
];

const TABLEAU = [
  { x: 240, label: '👥 Customers', icon: <Kid size={250} pose="cheer" mood="grin" skin={0} hair={0} hairStyle={2} shirt={HUE.orange} /> },
  { x: 600, label: '😊 Happiness', icon: <HeartBit size={210} /> },
  { x: 940, label: '🪙 Coins', icon: <CoinBit size={210} /> },
  { x: 1280, label: '🔒 Lock in', icon: <BigLock size={220} locked /> },
  { x: 1620, label: '⭐ Success', icon: <Trophy size={250} /> },
];

export default function HowTo({ beat, teams }: SceneBodyProps) {
  const sub = useSubstep(beat, [500, 1700, 2900, 4100]);
  const dark = beat === 12;
  const focusOn = beat >= 1 && beat <= 8;
  const hold = Math.min(teams.length, 6);
  const cardX = [380, 960, 1540];

  return (
    <div style={{ ...full, overflow: 'visible' }}>
      {/* the scene backdrop: dimmed and blurred while one card is the main subject */}
      <Focus active={focusOn}>
        <Backdrop>
          <Sky tone={dark ? 'storm' : 'gold'} horizon={820} />
          <Clouds seed={8} count={4} yMin={300} yMax={520} fill={dark ? '#9C84CC' : '#FFFFFF'} edge={dark ? '#8870BA' : '#FFE9B0'} />
          <Svg>
            <ellipse cx={400} cy={1020} rx={760} ry={140} fill={dark ? '#B8A2E0' : '#CBEFA6'} />
            <ellipse cx={1500} cy={1040} rx={820} ry={150} fill={dark ? '#A98FD8' : '#B9ECD9'} />
          </Svg>
        </Backdrop>
        <Subject at={{ x: 960, y: 640 }} scale={1.12}>{focusCard(beat, sub)}</Subject>
      </Focus>

      {/* 0: the three scores, shown side by side before we explain each one */}
      {[
        <ScoreCard key="c" title="Customers" hue={HUE.sky} value={<>👥 <CountUp value={START.customers} /></>}><CustomersArt /></ScoreCard>,
        <ScoreCard key="h" title="Happiness" hue={HUE.pink} value={<>😊 <CountUp value={START.happiness} /></>}><HappinessArt /></ScoreCard>,
        <ScoreCard key="k" title="Coins" hue={HUE.sun} value={<>🪙 <CountUp value={START.coins} /></>}><CoinsArt /></ScoreCard>,
      ].map((card, i) => (
        <Mv key={i} left={cardX[i]} top={880} bc to={{ scale: beat === 0 ? 1 : 0, opacity: beat === 0 ? 1 : 0 }} from={{ scale: 0, opacity: 0 }} spring={{ ...SPRING.hero, delay: beat === 0 ? 0.3 + i * 0.35 : 0 }}>
          <div className="k-bob" style={{ ['--dur' as string]: `${2.6 + i * 0.3}s`, ['--bob' as string]: '8px' } as CSSProperties}>{card}</div>
        </Mv>
      ))}

      {/* beat 2: the coins we spend on the ask */}
      <Show when={beat === 2} k="spend" y={0}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center', gap: 28 }}>
          <Pill text={<>−<CountUp value={ASK.coins} /> 🪙 spent asking</>} hue={HUE.red} /><Pill text="+ 🪙 earned from sales" hue={HUE.green} />
        </div>
      </Show>
      {/* 4 and 6: asking real people brings new customers and happy friends */}
      <Show when={beat === 4 || beat === 6} k="moves" y={0}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center', gap: 28 }}>
          <Pill text={beat === 4 ? <>+<CountUp value={ASK.customers} /> 👥 new customers</> : <>+<CountUp value={ASK.happiness} /> 😊 happy friends</>} hue={HUE.green} />
          <Pill text={beat === 4 ? '− walk away' : '− bugs and tricks'} hue={HUE.red} />
        </div>
      </Show>
      <Show when={beat === 1} k="coinsfall" y={0}>{[0, 1, 2, 3].map(i => (
        <div key={i} className="k-fall" style={{ position: 'absolute', left: 820 + i * 70, top: 300, ['--delay' as string]: `${i * 0.35}s`, ['--dur' as string]: '1.6s', ['--fall' as string]: '260px', ['--fx' as string]: '0px' } as CSSProperties}><CoinBit size={70} /></div>
      ))}</Show>

      {/* 9: the growth ladder */}
      <Svg><rect x={140} y={934} width={1640} height={26} rx={13} fill={HUE.stone.hi} opacity={beat === 9 ? 1 : 0} style={{ transition: 'opacity .5s' }} /></Svg>
      {LADDER.map((b, i) => (
        <Mv key={i} left={b.x} top={940} bc to={{ scale: beat === 9 && sub > i ? 1 : 0, y: 0, opacity: beat === 9 && sub > i ? 1 : 0 }} from={{ scale: 0, opacity: 0 }} spring={SPRING.hero}>
          <div style={{ position: 'relative' }}>
            <Building kind={b.kind} size={b.h} />
            <div style={{ position: 'absolute', left: '50%', bottom: -62, transform: 'translateX(-50%)', whiteSpace: 'nowrap', padding: '8px 22px', borderRadius: 30, background: b.hue.base, border: '5px solid #fff', boxShadow: 'var(--sh-sm)', ...T(38, '#fff') }}>{b.label}</div>
          </div>
        </Mv>
      ))}
      <Mv left={1250} top={960} bc to={{ scale: beat === 9 && sub >= 4 ? 1 : 0 }} from={{ scale: 0 }} spring={SPRING.pop}><Kid size={230} pose="cheer" mood="grin" skin={3} shirt={HUE.sun} /></Mv>

      {/* 10: talk, then the Lock Master locks it */}
      <Mv left={960} top={900} bc to={{ scale: beat === 10 ? 1 : 0.5, opacity: beat === 10 ? 1 : 0, y: beat === 10 ? 0 : 80 }} from={{ scale: 0.5, opacity: 0, y: 80 }} spring={SPRING.hero}>
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
      <Mv left={1450} top={880} bc to={{ scale: beat === 10 ? (sub >= 2 ? 1.12 : 1) : 0.2, opacity: beat === 10 ? 1 : 0 }} from={{ scale: 0.2, opacity: 0 }} spring={SPRING.pop}>
        <BigLock size={280} locked={beat === 10 && sub >= 2} />
      </Mv>
      <Show when={beat === 10 && sub >= 2} k="b10" y={0}><Burst fire={2} x={1450} y={700} count={36} spread={500} up={400} colors={['#FFC800', '#fff', '#58CC02']} /></Show>
      {[0, 1, 2].map(i => (
        <Mv key={i} left={170 + i * 150} top={960} bc to={{ scale: beat === 10 ? 1 : 0, opacity: beat === 10 ? 1 : 0 }} from={{ scale: 0, opacity: 0 }} spring={{ ...SPRING.pop, delay: 0.2 + i * 0.15 }}>
          <Kid size={i === 1 ? 260 : 230} skin={[1, 0, 4][i]} hair={i} hairStyle={[0, 2, 1][i] as 0 | 1 | 2} shirt={[HUE.sky, HUE.coral, HUE.mint][i]} pose={i === 1 ? 'point' : 'think'} flip={i === 0} mood="happy" delay={i * 0.3} />
        </Mv>
      ))}
      <Mv left={360} top={560} to={{ scale: beat === 10 && sub >= 0 ? 1 : 0 }} from={{ scale: 0 }} spring={{ ...SPRING.pop, delay: 0.8 }} origin="0% 100%">
        <ThoughtCloud size={190}><text x={120} y={118} textAnchor="middle" fontSize={96} fontWeight={800} fill={HUE.blue.base} fontFamily="inherit">?</text></ThoughtCloud>
      </Mv>

      {/* 11: Bolt reveals what happened to each team (the cards show what asking 10 real people does) */}
      <Show when={beat === 11} k="rcap" y={0}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', ...T(44, INK) }}>Example: a team asked 10 real people</div>
      </Show>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 450, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', padding: '0 80px' }}>
        <AnimatePresence>
          {beat === 11 && teams.slice(0, hold).map((t, i) => (
            <motion.div key={t.id} initial={{ y: 200, scale: 0.4, opacity: 0, rotate: i % 2 ? 8 : -8 }} animate={{ y: 0, scale: 1, opacity: 1, rotate: i % 2 ? 2 : -2 }} exit={{ y: 120, scale: 0.5, opacity: 0 }}
              transition={{ ...SPRING.hero, delay: 0.3 + i * 0.7 }}
              style={{ width: hold > 4 ? 250 : 330, background: '#fff', border: '6px solid #fff', borderRadius: 44, boxShadow: 'var(--sh-sm)', padding: '22px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} size={hold > 4 ? 110 : 140} mood="happy" />
              <div style={T(34)}>{t.name}</div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...SPRING.pop, delay: 0.9 + i * 0.7 }} style={{ display: 'flex', gap: 10 }}>
                <span style={{ ...T(26, '#fff', { whiteSpace: 'nowrap' }), background: HUE.blue.base, borderRadius: 22, padding: '8px 12px' }}>+<CountUp value={ASK.customers} /> 👥</span>
                <span style={{ ...T(26, '#fff', { whiteSpace: 'nowrap' }), background: HUE.pink.base, borderRadius: 22, padding: '8px 12px' }}>+<CountUp value={ASK.happiness} /> 😊</span>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 12: Fibbot's tempting tricks */}
      <Mv left={1450} top={900} bc to={{ x: beat === 12 ? 0 : 500, opacity: beat === 12 ? 1 : 0, scale: 0.85 }} from={{ x: 500, opacity: 0 }} spring={{ type: 'spring', stiffness: 70, damping: 14 }}>
        <Fibbot size={520} angry smoke />
      </Mv>
      <Mv left={820} top={880} bc to={{ scale: beat === 12 ? 1 : 0, rotate: beat === 12 ? -3 : 0 }} from={{ scale: 0 }} spring={{ ...SPRING.hero, delay: 0.3 }} z={3}>
        <div className="k-wiggle" style={{ ['--wig' as string]: '2deg', ['--dur' as string]: '0.9s' } as CSSProperties}>
          <StickerCard w={520} h={400} hue={HUE.sun} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={T(72, HUE.red.base, { textShadow: '0 4px 0 #fff' })}>Free!</div>
            <div style={T(46)}>Copy it all! ✨</div>
            <div style={{ position: 'absolute', left: -20, top: -20 }}><Sparkle size={90} color="#fff" /></div><div style={{ position: 'absolute', right: -10, bottom: 10 }}><Sparkle size={70} color="#FFF1A8" delay={0.5} /></div>
          </StickerCard>
        </div>
      </Mv>
      <Mv left={610} top={760} to={{ x: beat === 12 ? 0 : -300, opacity: beat === 12 ? 1 : 0 }} from={{ x: -300, opacity: 0 }} spring={{ ...SPRING.move, delay: 1 }} z={4}><Bug size={140} /></Mv>
      <Mv left={230} top={960} bc to={{ scale: beat === 12 ? 1 : 0 }} from={{ scale: 0 }} spring={{ ...SPRING.pop, delay: 0.6 }}><Kid size={270} pose="think" mood="worried" skin={2} hair={2} hairStyle={2} shirt={HUE.mint} /></Mv>
      <Mv left={350} top={520} to={{ scale: beat === 12 ? 1 : 0 }} from={{ scale: 0 }} spring={{ ...SPRING.pop, delay: 1.2 }} origin="0% 100%">
        <ThoughtCloud size={200}><text x={120} y={118} textAnchor="middle" fontSize={96} fontWeight={800} fill={HUE.purple.edge} fontFamily="inherit">?</text></ThoughtCloud>
      </Mv>

      {/* 13: summary tableau of the whole flow, all pieces together */}
      <Show when={beat === 13} k="tableau" y={0}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', ...T(60, INK) }}>Coins, customers and happiness, then lock and reveal</div>
        {TABLEAU.map((item, i) => (
          <Mv key={item.label} left={item.x} top={800} bc to={{ scale: 1, opacity: 1 }} from={{ scale: 0, opacity: 0 }} spring={{ ...SPRING.pop, delay: 0.3 + i * 0.45 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
              {item.icon}
              <div style={{ ...T(38, '#fff', { whiteSpace: 'nowrap' }), background: INK_SOFTER, borderRadius: 30, padding: '8px 22px', border: '5px solid #fff' }}>{item.label}</div>
            </div>
          </Mv>
        ))}
      </Show>
    </div>
  );
}
