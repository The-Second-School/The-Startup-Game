// Mega Order: partner teams talk, both Lock Masters pick a deal, reveal per pair (handshake or broken heart).
import { motion } from 'motion/react';
import { Avatar, Confetti } from '../../ui';
import { MEGA } from '../../game/content';
import { teamById } from '../../game/engine';
import type { Deltas, MegaState, Team } from '../../game/types';
import { sfx } from '../../audio';
import { useEffect, useState } from 'react';
import { useGame } from '../lib/ctx';
import { moodFor, optionStyle, teamColors } from '../lib/game';
import { stripOrder } from '../lib/order';
import { Banner } from '../components/Banner';
import { DeltaRow } from '../components/DeltaRow';
import { Handshake, Heart } from '../components/art';
import { OptionTile, tileGeometry, type TileState } from '../components/OptionTile';
import { QuestionCard } from '../components/QuestionCard';
import { TeamStrip, type ChipFace } from '../components/TeamStrip';
import { TimerBadge } from '../components/TimerBadge';
import { ASLEEP, DoneBoards, IntroStage, useChooser, useRevealLock } from '../components/ChoiceParts';

const ZERO: Deltas = { coins: 0, customers: 0, happiness: 0 };
const INTRO = `A giant Festival order just arrived! It is too big for one team, so you must team up with your partner and agree on a fair deal. Talk it out!`;

export function MegaView() {
  const { state } = useGame();
  const st = state.step;
  if (st.type !== 'megaorder') return null;
  return <MegaBody st={st} />;
}

const SOLO_FACE: ChipFace = { color: '#FFE08A', dark: '#E0A800', icon: '📦', text: 'Own mini order' };

/** Odd team out: no partner, so a small order of its own. Shown after the pairs, when the reward lands. */
function SoloCard({ team, deltas }: { team: Team; deltas: Deltas }) {
  const c = teamColors(team);
  return (
    <motion.div
      style={{ position: 'absolute', left: 56, right: 56, top: 936, height: 120, borderRadius: 40, background: c.shades[1], boxShadow: 'var(--sh)', display: 'flex', alignItems: 'center', gap: 24, padding: '0 28px', zIndex: 5 }}
      initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
    >
      <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={92} mood="happy" ring />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.05 }}>{team.name}</div>
        <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.1 }}>📦 No partner this time: your own mini order!</div>
      </div>
      <DeltaRow deltas={deltas} start={1200} gap={400} size="md" />
    </motion.div>
  );
}

const faceFor = (i: number): ChipFace => {
  const os = optionStyle(i);
  const o = MEGA.options[i];
  return { color: os.base, dark: os.dark, shape: os.shape, icon: o.icon, text: o.text };
};

function MegaBody({ st }: { st: MegaState }) {
  const { state, live } = useGame();
  const teams = stripOrder(state);
  const { pick, setPick, onChip } = useChooser(st);
  const sel = teamById(state, st.selectedTeamId);
  const geo = tileGeometry(4);
  const soloTeam = st.solo ? teamById(state, st.solo) : null;
  // The solo team has no partner and no deal to lock: it always shows as done, and tapping it does nothing.
  const lockedIds = [...Object.keys(st.locks), ...(soloTeam ? [soloTeam.id] : [])];
  useRevealLock(st.phase, 1800);

  if (st.phase === 'intro') return <IntroStage anim="mega" text={INTRO} />;

  const faces: Record<string, ChipFace> = {};
  for (const t of teams) faces[t.id] = t.id === st.solo ? SOLO_FACE : st.locks[t.id] !== undefined ? faceFor(st.locks[t.id]) : ASLEEP;

  if (st.phase === 'done') {
    return (
      <div className="scr-full">
        <DoneBoards teams={state.teams} title="Festival leaderboard!" />
        {soloTeam && <SoloCard team={soloTeam} deltas={st.pending[soloTeam.id] ?? ZERO} />}
      </div>
    );
  }

  if (st.phase === 'spotlight') {
    const pair = st.pairs[st.spotlight];
    if (!pair) return null;
    return (
      <div className="scr-full">
        <PairStage key={st.spotlight} st={st} teams={state.teams} pair={pair} />
        <TeamStrip teams={teams} mode="spotlight" paired spotIds={[...pair]} faces={faces} lag={2800} />
      </div>
    );
  }

  const open = st.phase === 'open';
  const partnerOf = (id: string) => {
    const p = st.pairs.find(x => x.includes(id));
    return p ? teamById(state, p[0] === id ? p[1] : p[0]) : null;
  };
  const partner = sel ? partnerOf(sel.id) : null;
  const pairedCount = st.pairs.length * 2;
  const lockedPairs = Object.keys(st.locks).filter(id => id !== st.solo).length;

  let banner: { id: string; text: string; color?: string; edge?: string };
  if (!open) banner = { id: 'rev', text: 'Did the partners agree?', color: 'var(--sun-hi)', edge: 'var(--sun-edge)' };
  else if (sel && sel.id === st.solo) {
    const c = teamColors(sel);
    banner = { id: `solo-${sel.id}`, text: `${sel.name}: no partner this time, your own mini order!`, color: c.shades[1], edge: c.shades[3] };
  } else if (sel) {
    const c = teamColors(sel);
    banner = pick === null
      ? { id: `c-${sel.id}`, text: partner ? MEGA.combos(sel.name, partner.name) : `${sel.name} is choosing…`, color: c.shades[1], edge: c.shades[3] }
      : { id: `l-${sel.id}`, text: `Tap ${sel.name} again to LOCK`, color: c.shades[1], edge: c.shades[3] };
  } else if (lockedPairs >= pairedCount && pairedCount > 0) banner = { id: 'all', text: 'Everyone is locked in!', color: 'var(--good-soft)', edge: 'var(--good-edge)' };
  else banner = { id: 'tap', text: 'Tap your team first' };

  const tileState = (i: number): TileState => (!open ? 'revealed' : !sel ? 'idle' : pick === i ? 'picked' : 'active');

  return (
    <div className="scr-full">
      <QuestionCard
        title="Festival Mega Order! Team up with your partner!"
        sub={soloTeam
          ? `Share ${MEGA.prize.customers} customers + ${MEGA.prize.coins} coins. Talk, then both teams lock the same deal. ${soloTeam.name}: no partner this time, you get your own mini order. Just cheer!`
          : `Share ${MEGA.prize.customers} customers + ${MEGA.prize.coins} coins. Talk, then both teams lock the same deal.`}
        pose={open ? 'talk' : 'shock'}
        right={open ? 260 : 40}
      />
      <TimerBadge show={open} state={state} size={190} style={{ position: 'absolute', right: 40, top: 156 }} />
      <Banner id={banner.id} color={banner.color} edge={banner.edge}>{banner.text}</Banner>
      {MEGA.options.map((o, i) => {
        const tappable = open && !!sel && live;
        return (
          <OptionTile
            key={i}
            index={i}
            icon={o.icon}
            text={o.text}
            detail={o.detail}
            state={tileState(i)}
            empty={!teams.some(t => st.locks[t.id] === i)}
            onTap={tappable ? () => { setPick(pick === i ? null : i); sfx.play('pop'); } : undefined}
            width={geo.width}
            left={geo.left(i)}
          />
        );
      })}
      <TeamStrip
        teams={teams}
        mode={open ? 'choose' : 'reveal'}
        paired
        selectedId={st.selectedTeamId}
        lockedIds={lockedIds}
        pickReady={pick !== null}
        faces={open ? undefined : faces}
        onChip={open && live ? (id: string) => { if (id !== st.solo) onChip(id); } : undefined}
      />
    </div>
  );
}

/** One pair on stage: both teams, the deal between them, then each team's gains. */
function PairStage({ st, teams, pair }: { st: MegaState; teams: Team[]; pair: [string, string] }) {
  const outcome = st.outcomes[st.spotlight];
  const [fire, setFire] = useState(0);
  useEffect(() => {
    if (!outcome) return;
    const id = setTimeout(() => {
      if (outcome.kind === 'broken') sfx.play('splat');
      else { sfx.play('cheer'); setFire(f => f + 1); }
    }, 700);
    return () => clearTimeout(id);
  }, [outcome]);
  if (!outcome) return null;
  const [a, b] = pair.map(id => teams.find(t => t.id === id)).filter((t): t is Team => !!t);
  if (!a || !b) return null;
  return (
    <div className="scr-pair-stage">
      <PairHalf team={a} side="left" choice={st.locks[a.id]} deltas={st.pending[a.id] ?? ZERO} />
      <div className="scr-pair-mid">
        <motion.div className="scr-pair-art" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 12 }}>
          {outcome.kind === 'broken' ? <Heart size={230} broken />
            : outcome.kind === 'nodeal' ? <span className="scr-pair-walk scr-trudge">🚶</span>
            : <Handshake size={300} left={teamColors(a).base} right={teamColors(b).base} />}
        </motion.div>
        <motion.div className="scr-pair-text" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>{outcome.text}</motion.div>
      </div>
      <PairHalf team={b} side="right" choice={st.locks[b.id]} deltas={st.pending[b.id] ?? ZERO} />
      <Confetti fire={fire} />
    </div>
  );
}

function PairHalf({ team, side, choice, deltas }: { team: Team; side: 'left' | 'right'; choice: number | undefined; deltas: Deltas }) {
  const c = teamColors(team);
  const face = choice !== undefined ? faceFor(choice) : ASLEEP;
  return (
    <motion.div
      className="scr-pair-half"
      style={{ background: c.shades[1], boxShadow: `var(--sh)` }}
      initial={{ x: side === 'left' ? -500 : 500, opacity: 0, rotate: side === 'left' ? -6 : 6 }}
      animate={{ x: 0, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    >
      <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={210} mood={moodFor(deltas)} ring />
      <div className="scr-pair-name">{team.name}</div>
      <div className="scr-pair-choice" style={{ background: face.color, boxShadow: `var(--sh)` }}>{face.icon} {face.text}</div>
      <DeltaRow deltas={deltas} start={1500} gap={450} size="md" />
    </motion.div>
  );
}
