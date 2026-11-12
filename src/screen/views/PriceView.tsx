// Price It Right (Act 4): pick a team, slide a price (Rs 10..100), lock; reveal the price tags; then one spotlight per team where
// ten customers decide, one by one, to buy or walk away. Bolt (the narration dock) is drawn by ScreenApp, never here.
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar, CountUp, Fibbot, MeterIcon, Num, ProductArt, useStageW } from '../../ui';
import { PRICE, TIMER_SHOW_MS, buyersAt, productById, type Product } from '../../game/content';
import { teamById, timerRemaining } from '../../game/engine';
import type { Deltas, PriceOutcome, PriceState, Team } from '../../game/types';
import { sfx } from '../../audio';
import { useNarr } from '../../narration/store';
import { shoppersAt } from '../../narration/lines/price';
import { useGame } from '../lib/ctx';
import { CONTENT_TOP, DOCK_TOP } from '../lib/layout';
import { moodFor, teamColors } from '../lib/game';
import { inputLocked } from '../lib/tap';
import { useNow } from '../hooks/useNow';
import { ShopperGrid } from '../components/Crowd';
import { DeltaRow } from '../components/DeltaRow';
import { ReadyHint } from '../components/ReadyHint';
import { Tap } from '../components/Tap';
import { STRIP_TOP, stripGeometry, TeamStrip } from '../components/TeamStrip';
import { TimerBadge } from '../components/TimerBadge';
import { DoneBoards, useChooser, useRevealLock } from '../components/ChoiceParts';
import '../price.css';

const PriceIntro = lazy(() => import('../../scenes/intros/price'));

const ZERO: Deltas = { coins: 0, customers: 0, happiness: 0 };
const TITLE_RIGHT = 40;
const FIRST_PRICE = 50;
const oneOf = (unit: string) => unit.replace(/^one\b/i, 'ONE');

/** 0 first, then `value` after `ms`: makes a rolling number count up once on reveal. */
function useAfter(value: number, ms: number) {
  const [v, setV] = useState(0);
  useEffect(() => { const id = window.setTimeout(() => setV(value), ms); return () => clearTimeout(id); }, [value, ms]);
  return v;
}

export function PriceView() {
  const { state } = useGame();
  const st = state.step;
  if (st.type !== 'price') return null;
  return <PriceBody st={st} />;
}

function PriceBody({ st }: { st: PriceState }) {
  const { state } = useGame();
  useRevealLock(st.phase, 1800);
  if (st.phase === 'intro') return <IntroStage />;
  if (st.phase === 'open') return <OpenStage st={st} />;
  if (st.phase === 'revealed') return <TagsStage st={st} teams={state.teams} />;
  if (st.phase === 'spotlight') return <SpotStage st={st} teams={state.teams} />;
  return <div className="scr-full"><DoneBoards teams={state.teams} title="Cash box check!" /></div>;
}

// ---------- intro: the price-tag animation while Bolt explains the task (see narration/lines/price.ts) ----------
function IntroStage() {
  const spoken = useNarr(s => s.id === 'price-intro' && s.done);
  return (
    <div className="scr-full">
      <div className="scr-intro-box" style={{ isolation: 'isolate' }}>
        <Suspense fallback={null}><PriceIntro /></Suspense>
      </div>
      <ReadyHint show={spoken} />
    </div>
  );
}

// ---------- open: set the price ----------
function OpenStage({ st }: { st: PriceState }) {
  const { state, live } = useGame();
  const teams = state.teams;
  const { pick, setPick, onChip } = useChooser(st);
  const sel = teamById(state, st.selectedTeamId);
  const lockedIds = Object.keys(st.locks);
  const allLocked = teams.length > 0 && lockedIds.length >= teams.length;
  const prod = sel ? productById(sel.productId) : null;

  // 5 minutes of talk time, but the timer only shows in the last minute: it pops in at the same place and the title card shrinks.
  const now = useNow(state.timer.running, 500);
  const showTimer = state.timer.total > 0 && timerRemaining(state, now) <= TIMER_SHOW_MS;

  const sub = allLocked ? '' : !sel ? 'Tap your team below to start' : pick === null ? 'Slide the coin, then tap your team again to lock' : 'Happy with it? Tap your team again to lock it!';
  const panelH = Math.min(360, STRIP_TOP - 16 - 560);

  return (
    <div className="scr-full">
      <div className="pr-title" style={{ right: showTimer ? TITLE_RIGHT + 152 : TITLE_RIGHT }}>
        <div className="pr-title-h">Pick the perfect price!</div>
        <AnimatePresence mode="wait" initial={false}>
          {sub && <motion.div key={sub} className="pr-title-sub" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>{sub}</motion.div>}
        </AnimatePresence>
      </div>
      <TimerBadge show={showTimer} state={state} size={128} style={{ position: 'absolute', right: 40, top: DOCK_TOP }} />

      {sel && prod ? (
        <>
          <ProductCard key={`card-${sel.id}`} prod={prod} />
          <PricePanel key={`panel-${sel.id}`} prod={prod} pick={pick} height={panelH} onPick={v => live && setPick(v)} />
        </>
      ) : (
        <StatusCard allLocked={allLocked} height={STRIP_TOP - 16 - 208} />
      )}

      <TeamStrip
        teams={teams}
        mode="choose"
        selectedId={st.selectedTeamId}
        lockedIds={lockedIds}
        pickReady={pick !== null}
        onChip={live ? onChip : undefined}
      />
    </div>
  );
}

/** ONE clear card: what you sell, what ONE sale is, what it costs you to make one. */
function ProductCard({ prod }: { prod: Product }) {
  return (
    <motion.div className="pr-card" initial={{ y: -30, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 24 }}>
      <div className="pr-card-art" style={{ background: `${prod.color}26` }}><ProductArt productId={prod.id} size={230} /></div>
      <div className="pr-card-text">
        <div className="pr-card-name">{prod.name}</div>
        <div className="pr-card-set">You are setting the price of</div>
        <div className="pr-card-one">{oneOf(prod.unit)}</div>
        <div className="pr-card-hint">💡 {prod.hint}</div>
      </div>
      <div className="pr-card-cost">
        <div className="pr-card-cost-l">It costs you to make one</div>
        <div className="pr-card-cost-n">₹{prod.cost}</div>
      </div>
    </motion.div>
  );
}

/** Calm "nothing to do here" states: tap a team, or everybody is done. Nothing else is shown. */
function StatusCard({ allLocked, height }: { allLocked: boolean; height: number }) {
  return (
    <motion.div className={allLocked ? 'pr-status is-done' : 'pr-status'} style={{ height }} initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
      {allLocked ? (
        <>
          <motion.div className="pr-status-big" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 14, delay: 0.1 }}>✅</motion.div>
          <div className="pr-status-text">All prices set!</div>
        </>
      ) : (
        <>
          <div className="pr-status-big scr-bounce-y">👇</div>
          <div className="pr-status-text">Tap your team to set its price</div>
        </>
      )}
    </motion.div>
  );
}

/** The touch zone: big price, what each sale earns, how many customers would buy, and the slider. */
function PricePanel({ prod, pick, height, onPick }: { prod: Product; pick: number | null; height: number; onPick: (v: number) => void }) {
  const v = pick ?? FIRST_PRICE;
  const profit = v - prod.cost;
  const buyers = buyersAt(prod, v);
  const step = (d: number) => onPick(Math.max(PRICE.min, Math.min(PRICE.max, v + d)));
  return (
    <motion.div className="pr-panel" style={{ height }} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 22 }}>
      <div className="pr-read">
        <div className={pick === null ? 'pr-num is-ghost' : 'pr-num'}>₹<CountUp value={v} duration={250} /></div>
        <div className="pr-lines">
          {pick === null ? (
            <div className="pr-line is-hint">Slide to pick your price</div>
          ) : (
            <>
              <div className={profit > 0 ? 'pr-line is-gain' : profit < 0 ? 'pr-line is-loss' : 'pr-line'}>
                <MeterIcon kind="coins" size={40} />
                {profit > 0 ? <span>You earn ₹<b><Num value={profit} duration={250} /></b> on each sale</span>
                  : profit < 0 ? <span>You lose ₹<Num value={-profit} duration={250} /> on each sale</span>
                  : <span>You earn nothing on each sale</span>}
              </div>
              <div className="pr-line">
                <MeterIcon kind="customers" size={40} />
                <span>About <Num value={buyers} duration={250} /> of 10 would buy</span>
              </div>
            </>
          )}
        </div>
      </div>
      <Tap id="price-minus" onTap={() => step(-PRICE.step)} sound="tick" debounce={120} className="pr-step">−</Tap>
      <PriceSlider prod={prod} value={pick} onChange={onPick} />
      <Tap id="price-plus" onTap={() => step(PRICE.step)} sound="tick" debounce={120} className="pr-step">+</Tap>
    </motion.div>
  );
}

const SLIDER_W = 688, SLIDER_PAD = 56;

/** Chunky slider: drag anywhere, snaps to Rs 10. Softly marks the loss zone, the usual prices and Fibbot's copy price. */
function PriceSlider({ prod, value, onChange }: { prod: Product; value: number | null; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const W = SLIDER_W, PAD = SLIDER_PAD;
  const span = PRICE.max - PRICE.min;
  const steps = Math.round(span / PRICE.step);
  const xOf = (p: number) => ((Math.max(PRICE.min, Math.min(PRICE.max, p)) - PRICE.min) / span) * W;
  const i = Math.round(((value ?? FIRST_PRICE) - PRICE.min) / PRICE.step);

  const setFrom = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * (W + 2 * PAD) - PAD;
    const k = Math.max(0, Math.min(steps, Math.round((x / W) * steps)));
    const next = PRICE.min + k * PRICE.step;
    if (next !== value) { sfx.play('tick'); onChange(next); }
  };

  const lossW = prod.cost > PRICE.min ? xOf(prod.cost) : 0;
  const lo = xOf(prod.rival - 5), hi = xOf(prod.rival + 15);
  const fx = xOf(prod.rival);
  const flip = fx > 420;

  return (
    <div
      ref={ref}
      className="pr-slider"
      style={{ width: W + 2 * PAD }}
      onPointerDown={e => {
        if (!e.isPrimary || inputLocked()) return;
        drag.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        setFrom(e.clientX);
      }}
      onPointerMove={e => { if (drag.current) setFrom(e.clientX); }}
      onPointerUp={() => { drag.current = false; }}
      onPointerCancel={() => { drag.current = false; }}
    >
      <div className="pr-band is-market" style={{ left: PAD + lo - 10, width: hi - lo + 20 }} />
      {lossW > 0 && <div className="pr-band is-loss" style={{ left: PAD - 14, width: lossW + 14 }} />}
      <div className="pr-track" style={{ left: PAD, width: W }}>
        {Array.from({ length: steps + 1 }).map((_, k) => (
          <span key={k} className={k <= i ? 'pr-tick is-on' : 'pr-tick'} style={{ left: (k / steps) * W }} />
        ))}
        <div className="pr-fill" style={{ width: (i / steps) * W }} />
      </div>
      <div className="pr-stem" style={{ left: PAD + fx }} />
      <div className={flip ? 'pr-fibbot is-left' : 'pr-fibbot'} style={{ left: PAD + fx - 32 }}>
        <Fibbot mood="sneaky" size={64} />
        <span className="pr-fibbot-l">Fibbot’s copy ₹{prod.rival}</span>
      </div>
      <motion.div
        className={value === null ? 'pr-knob is-ghost' : 'pr-knob'}
        style={{ left: PAD - 52 }}
        animate={{ x: (i / steps) * W, scale: value === null ? 1 : 1.08 }}
        transition={{ type: 'spring', stiffness: 520, damping: 26 }}
      >
        🪙
      </motion.div>
      <div className="pr-end" style={{ left: PAD }}>₹{PRICE.min}</div>
      <div className="pr-end" style={{ left: PAD + W }}>₹{PRICE.max}</div>
    </div>
  );
}

// ---------- revealed: the price tags are out (each price appears ONCE, on a big tag above its team) ----------
function TagsStage({ st, teams }: { st: PriceState; teams: Team[] }) {
  const W = useStageW();
  const geo = stripGeometry(teams.length, false, W);
  const bleed = (W - 1920) / 2;
  const top = 320;
  const height = Math.min(500, STRIP_TOP - 16 - top);
  return (
    <div className="scr-full">
      <motion.div className="pr-tags-head" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>The price tags are out!</motion.div>
      {teams.map((t, i) => (
        <PriceTag key={t.id} team={t} price={st.locks[t.id]} index={i} left={geo.margin - bleed + i * (geo.width + geo.gap)} width={geo.width} top={top} height={height} />
      ))}
      <TeamStrip teams={teams} mode="plain" />
    </div>
  );
}

function PriceTag({ team, price, index, left, width, top, height }: { team: Team; price: number | undefined; index: number; left: number; width: number; top: number; height: number }) {
  const c = teamColors(team);
  const prod = productById(team.productId);
  const shown = useAfter(price ?? 0, 450 + index * 90);
  return (
    <motion.div
      className="pr-tag"
      style={{ left, width, top, height }}
      initial={{ y: 140, rotate: -8, opacity: 0 }}
      animate={{ y: 0, rotate: index % 2 ? 1.5 : -1.5, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 + index * 0.09 }}
    >
      <div className="pr-tag-band" style={{ background: c.shades[1] }} />
      <div className="pr-tag-hole" />
      {price !== undefined && prod ? (
        <>
          <ProductArt productId={prod.id} size={Math.min(190, height - 250)} />
          <div className="pr-tag-prod">{prod.name}</div>
          <div className="pr-tag-price">₹<Num value={shown} duration={500} /></div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 120, lineHeight: 1 }}>😴</div>
          <div className="pr-tag-zzz">No price</div>
        </>
      )}
    </motion.div>
  );
}

// ---------- spotlight: one team at a time, ten customers decide ----------
const VERDICT: Record<string, { text: string; color: string }> = {
  right: { text: 'Perfect price! 🎯', color: 'var(--good-soft)' },
  close: { text: 'Nearly there! 👍', color: 'var(--sun-hi)' },
  high: { text: 'Too high 😬', color: 'var(--bad-soft)' },
  low: { text: 'Too low 😬', color: 'var(--bad-soft)' },
};

function SpotStage({ st, teams }: { st: PriceState; teams: Team[] }) {
  const team = teams[st.spotlight];
  if (!team) return null;
  const height = Math.max(560, STRIP_TOP - 16 - CONTENT_TOP);
  return (
    <div className="scr-full">
      <SpotCard key={team.id} team={team} outcome={st.outcomes[team.id]} verdict={st.verdict[team.id] ?? 'low'} deltas={st.pending[team.id] ?? ZERO} height={height} />
      <TeamStrip teams={teams} mode="spotlight" spotIds={[team.id]} lag={2200} />
    </div>
  );
}

function SpotCard({ team, outcome, verdict, deltas, height }: { team: Team; outcome: PriceOutcome | undefined; verdict: string; deltas: Deltas; height: number }) {
  const c = teamColors(team);
  const prod = productById(team.productId);
  const [decided, setDecided] = useState(false);
  const asleep = !outcome || !prod;
  const price = outcome?.price;
  const shoppers = useMemo(() => (prod && price !== undefined ? shoppersAt(prod, price) : []), [prod, price]);
  const v = VERDICT[verdict] ?? VERDICT.low;
  return (
    <motion.div className="pr-spot" style={{ height }} initial={{ scale: 0.6, y: 120, opacity: 0, rotate: -3 }} animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
      <div className="pr-spot-left" style={{ background: c.shades[1] }}>
        <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={200} mood={asleep ? 'sad' : moodFor(deltas)} ring />
        <div className="pr-spot-name">{team.name}</div>
        {!asleep && (
          <>
            <motion.div className="pr-spot-price" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 420, damping: 16 }}>
              <ProductArt productId={prod.id} size={84} />
              <b>₹{outcome.price}</b>
            </motion.div>
            <div className="pr-spot-unit">for {oneOf(prod.unit)}</div>
            {decided && (
              <motion.div className="pr-verdict" style={{ background: v.color }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 14 }}>{v.text}</motion.div>
            )}
          </>
        )}
      </div>
      {asleep ? (
        <div className="pr-asleep">
          <span>😴</span>
          <div>{team.name} forgot to set a price</div>
          <DeltaRow deltas={deltas} start={900} />
        </div>
      ) : (
        <div className="pr-spot-right">
          <ShopperGrid shoppers={shoppers} seed={team.avatarSeed} onDone={() => setDecided(true)} />
          <div className="pr-sum">{decided && <SumLine o={outcome} />}</div>
          <div className="pr-spot-deltas">{decided && <DeltaRow deltas={deltas} start={1500} />}</div>
        </div>
      )}
    </motion.div>
  );
}

/** Price - Cost = profit on each sale x sales = total. One line, chips popping in one after another. */
function SumLine({ o }: { o: PriceOutcome }) {
  const total = useAfter(o.totalProfit, 1500);
  const p = o.profitPerUnit;
  const items: { key: string; node: ReactNode }[] = [
    { key: 'p', node: <span className="pr-sum-chip is-price">Price ₹{o.price}</span> },
    { key: 'o1', node: <span className="pr-sum-op">−</span> },
    { key: 'c', node: <span className="pr-sum-chip is-cost">Cost ₹{o.cost}</span> },
    { key: 'o2', node: <span className="pr-sum-op">=</span> },
    { key: 'g', node: <span className={p > 0 ? 'pr-sum-chip is-gain' : p < 0 ? 'pr-sum-chip is-loss' : 'pr-sum-chip is-neutral'}>{p < 0 ? `₹${-p} loss` : `₹${p} profit`}</span> },
    { key: 'o3', node: <span className="pr-sum-op">×</span> },
    { key: 's', node: <span className="pr-sum-chip is-neutral">{o.buyers} {o.buyers === 1 ? 'sale' : 'sales'}</span> },
    { key: 'o4', node: <span className="pr-sum-op">=</span> },
    { key: 't', node: <span className="pr-sum-chip is-total">{total < 0 ? '−' : ''}₹<Num value={Math.abs(total)} duration={600} /></span> },
  ];
  return (
    <>
      {items.map((it, k) => (
        <motion.span key={it.key} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: k * 0.12, type: 'spring', stiffness: 460, damping: 18 }} style={{ display: 'inline-flex' }}>{it.node}</motion.span>
      ))}
    </>
  );
}
