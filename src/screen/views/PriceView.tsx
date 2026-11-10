// Price It Right: pick a team, slide a price (Rs 10..100), lock; reveal price tags; spotlight with a reacting crowd.
import { useRef } from 'react';
import { motion } from 'motion/react';
import { Avatar, CountUp, ProductArt } from '../../ui';
import { PRICE, productById } from '../../game/content';
import { teamById } from '../../game/engine';
import type { Deltas, PriceState, Team } from '../../game/types';
import { sfx } from '../../audio';
import { useGame } from '../lib/ctx';
import { teamColors } from '../lib/game';
import { inputLocked } from '../lib/tap';
import { Banner } from '../components/Banner';
import { Crowd, type CrowdMode } from '../components/Crowd';
import { QuestionCard } from '../components/QuestionCard';
import { Tap } from '../components/Tap';
import { TILE_H, TILE_TOP } from '../components/OptionTile';
import { stripGeometry, TeamStrip, type ChipFace } from '../components/TeamStrip';
import { TimerBadge } from '../components/TimerBadge';
import { ASLEEP, DoneBoards, IntroStage, SpotlightCard, useChooser, useRevealLock } from '../components/ChoiceParts';

const ZERO: Deltas = { coins: 0, customers: 0, happiness: 0 };
const TITLE = 'Set the perfect price for your product!';
const INTRO = 'Time to set your price! Too high and customers walk away. Too low and your cash box stays empty. Find the sweet spot!';
const CROWD: Record<string, CrowdMode> = { right: 'cheer', close: 'nod', high: 'leave', low: 'packed' };

const priceFace = (p: number): ChipFace => ({ color: '#FFC800', dark: '#E0A100', icon: '🏷️', text: `₹${p}` });

export function PriceView() {
  const { state } = useGame();
  const st = state.step;
  if (st.type !== 'price') return null;
  return <PriceBody st={st} />;
}

function PriceBody({ st }: { st: PriceState }) {
  const { state, live } = useGame();
  const teams = state.teams;
  const { pick, setPick, onChip } = useChooser(st);
  const sel = teamById(state, st.selectedTeamId);
  const lockedIds = Object.keys(st.locks);
  useRevealLock(st.phase, 1800);

  if (st.phase === 'intro') return <IntroStage anim="price" text={INTRO} />;

  const faces: Record<string, ChipFace> = {};
  for (const t of teams) faces[t.id] = st.locks[t.id] !== undefined ? priceFace(st.locks[t.id]) : ASLEEP;

  if (st.phase === 'done') {
    return (
      <div className="scr-full">
        <DoneBoards teams={teams} title="Cash box check!" />
      </div>
    );
  }

  if (st.phase === 'spotlight') {
    const team = teams[st.spotlight];
    if (!team) return null;
    const verdict = st.verdict[team.id] ?? 'low';
    const best = productById(team.productId)?.bestPrice;
    const asleep = st.locks[team.id] === undefined;
    return (
      <div className="scr-full">
        <div className="scr-spot-wrap" style={{ left: 40, top: 150, width: 1840 }}>
          <SpotlightCard
            key={team.id}
            team={team}
            face={asleep ? ASLEEP : faces[team.id]}
            chosenLabel="priced it"
            story={st.stories[team.id] ?? ''}
            deltas={st.pending[team.id] ?? ZERO}
            width={1840}
            extra={!asleep && (
              <div className="scr-price-react">
                <Crowd key={team.id} mode={CROWD[verdict]} count={6} size={84} seed={team.avatarSeed} />
                {best !== undefined && <motion.div className="scr-price-best" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: 'spring', stiffness: 400, damping: 14 }}>Best price: ₹{best}</motion.div>}
              </div>
            )}
          />
        </div>
        <TeamStrip teams={teams} mode="spotlight" spotIds={[team.id]} faces={faces} lag={2200} />
      </div>
    );
  }

  const open = st.phase === 'open';
  const allLocked = lockedIds.length >= teams.length && teams.length > 0;
  const prod = sel ? productById(sel.productId) : null;

  let banner: { id: string; text: string; color?: string; edge?: string };
  if (!open) banner = { id: 'rev', text: 'The price tags are out!', color: 'var(--sun-hi)', edge: 'var(--sun-edge)' };
  else if (sel) {
    const c = teamColors(sel);
    banner = pick === null
      ? { id: `c-${sel.id}`, text: `${sel.name}: slide to set your price`, color: c.shades[1], edge: c.shades[3] }
      : { id: `l-${sel.id}`, text: `Happy? Tap ${sel.name} again to LOCK`, color: c.shades[1], edge: c.shades[3] };
  } else if (allLocked) banner = { id: 'all', text: 'Every price is locked in!', color: 'var(--good-soft)', edge: 'var(--good-edge)' };
  else banner = { id: 'tap', text: 'Tap your team first' };

  const sub = open && prod ? `${prod.icon} ${prod.name}, ${prod.unit}. ${prod.hint}` : open ? 'Not too high, not too low. Tap your team to start!' : 'Who found the sweet spot?';

  return (
    <div className="scr-full">
      <QuestionCard title={TITLE} sub={sub} pose={open ? 'talk' : 'shock'} right={open ? 260 : 40} />
      <TimerBadge show={open} state={state} size={190} style={{ position: 'absolute', right: 40, top: 156 }} />
      <Banner id={banner.id} color={banner.color} edge={banner.edge}>{banner.text}</Banner>
      {open ? (
        <motion.div className={sel ? 'scr-price-panel' : 'scr-price-panel is-off'} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 20 }}>
          {sel && prod ? (
            <>
              <div className="scr-price-art">
                <ProductArt productId={prod.id} size={170} />
                <div className="scr-price-prodname">{prod.name}</div>
              </div>
              <div className={pick === null ? 'scr-price-read is-ghost' : 'scr-price-read'}>
                <div className="scr-price-num">₹<CountUp value={pick ?? 50} duration={0.25} /></div>
                <div className="scr-price-unit">{prod.unit}</div>
              </div>
              <Tap id="price-minus" onTap={() => live && setPick(Math.max(PRICE.min, (pick ?? 50) - PRICE.step))} sound="tick" debounce={120} className="scr-price-step">−</Tap>
              <PriceSlider value={pick} onChange={v => live && setPick(v)} />
              <Tap id="price-plus" onTap={() => live && setPick(Math.min(PRICE.max, (pick ?? 50) + PRICE.step))} sound="tick" debounce={120} className="scr-price-step">+</Tap>
            </>
          ) : (
            <div className="scr-price-off">{allLocked ? 'All prices set!' : 'Tap your team to set a price'}</div>
          )}
        </motion.div>
      ) : (
        <PriceTags teams={teams} locks={st.locks} />
      )}
      <TeamStrip
        teams={teams}
        mode={open ? 'choose' : 'reveal'}
        selectedId={st.selectedTeamId}
        lockedIds={lockedIds}
        pickReady={pick !== null}
        faces={open ? undefined : faces}
        onChip={open && live ? onChip : undefined}
      />
    </div>
  );
}

/** Big chunky slider: drag anywhere on the track, snaps to Rs 10 steps. */
function PriceSlider({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const steps = Math.round((PRICE.max - PRICE.min) / PRICE.step);
  const W = 540, PAD = 60;
  const v = value ?? 50;
  const i = Math.round((v - PRICE.min) / PRICE.step);

  const setFrom = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * (W + 2 * PAD) - PAD;
    const k = Math.max(0, Math.min(steps, Math.round((x / W) * steps)));
    const next = PRICE.min + k * PRICE.step;
    if (next !== value) { sfx.play('tick'); onChange(next); }
  };

  return (
    <div
      ref={ref}
      className="scr-price-slider"
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
      <div className="scr-price-track" style={{ left: PAD, width: W }}>
        {Array.from({ length: steps + 1 }).map((_, k) => (
          <span key={k} className={k <= i ? 'scr-price-tick is-on' : 'scr-price-tick'} style={{ left: (k / steps) * W }} />
        ))}
        <div className="scr-price-fill" style={{ width: (i / steps) * W }} />
      </div>
      <motion.div
        className={value === null ? 'scr-price-knob is-ghost' : 'scr-price-knob'}
        style={{ left: PAD - 52 }}
        animate={{ x: (i / steps) * W, scale: value === null ? 1 : 1.08 }}
        transition={{ type: 'spring', stiffness: 520, damping: 26 }}
      >
        🪙
      </motion.div>
      <div className="scr-price-end is-lo" style={{ left: PAD }}>₹{PRICE.min}</div>
      <div className="scr-price-end is-hi" style={{ left: PAD + W }}>₹{PRICE.max}</div>
    </div>
  );
}

/** After the reveal: one price tag per team, lined up above its chip. */
function PriceTags({ teams, locks }: { teams: Team[]; locks: Record<string, number> }) {
  const geo = stripGeometry(teams.length);
  return (
    <>
      {teams.map((t, i) => {
        const c = teamColors(t);
        const p = locks[t.id];
        const prod = productById(t.productId);
        return (
          <motion.div
            key={t.id}
            className="scr-ptag"
            style={{ left: geo.margin + i * (geo.width + geo.gap), width: geo.width, top: TILE_TOP, height: TILE_H - 20, background: c.shades[0], boxShadow: `var(--sh)` }}
            initial={{ y: 120, rotate: -8, opacity: 0 }}
            animate={{ y: 0, rotate: i % 2 ? 2 : -2, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 + i * 0.09 }}
          >
            <div className="scr-ptag-hole" />
            <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={72} />
            <div className="scr-ptag-price">{p !== undefined ? `₹${p}` : '😴'}</div>
            {prod && <div className="scr-ptag-prod">{prod.name}</div>}
          </motion.div>
        );
      })}
    </>
  );
}
