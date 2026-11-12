// Mega Order: partner teams talk, both Lock Masters pick a deal, reveal per pair (handshake or broken heart).
// Same layout as the questions: Bolt (dock) then the card right after him, 4 deal tiles at y >= 560, minimal team bar.
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, Confetti, OptionShape, useStageH, useStageW } from '../../ui';
import { lighten } from '../../ui/palette';
import { MEGA } from '../../game/content';
import { teamById } from '../../game/engine';
import type { Deltas, MegaState, Team } from '../../game/types';
import { sfx } from '../../audio';
import { useEffect, useState } from 'react';
import { useGame } from '../lib/ctx';
import { cx, moodFor, optionStyle, teamColors } from '../lib/game';
import { CONTENT_TOP, GAP, KID_TOP, MINI_CARD_H } from '../lib/layout';
import { stripOrder } from '../lib/order';
import { DeltaRow } from '../components/DeltaRow';
import { Handshake, Heart } from '../components/art';
import { OptionTile, tileGeometry, type TileState } from '../components/OptionTile';
import { CARD_TOP, QuestionCard, TIMER_SIZE, type CardSize } from '../components/QuestionCard';
import { TeamStrip, stripLayout, type ChipFace } from '../components/TeamStrip';
import { TimerBadge, useHoldTimerWhenLocked, useTimerLast } from '../components/TimerBadge';
import { ReadyHint } from '../components/ReadyHint';
import { ASLEEP, ChosenCards, DoneSummary, IntroStage, WaitBig, useChooser, useReadyAfter, useRevealLock, useTranscript } from '../components/ChoiceParts';

const ZERO: Deltas = { coins: 0, customers: 0, happiness: 0 };
const INTRO = `A giant Festival order just arrived! It is too big for one team, so you must team up with your partner and agree on a fair deal. Talk it out!`;

export function MegaView() {
  const { state } = useGame();
  const st = state.step;
  if (st.type !== 'megaorder') return null;
  return <MegaBody st={st} />;
}

const SOLO_FACE: ChipFace = { color: '#FFE08A', dark: '#E0A800', icon: '📦', text: 'Own mini order' };

/** Odd team out: no partner, so a small order of its own. Shown when the reward lands. */
function SoloCard({ team, deltas }: { team: Team; deltas: Deltas }) {
  const c = teamColors(team);
  return (
    <motion.div
      className="cx-solo"
      style={{ background: lighten(c.shades[1], 0.1) }}
      initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.7 }}
    >
      <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={92} mood="happy" ring />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.05 }}>{team.name}</div>
        <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1 }}>📦 No partner this time: your own mini order!</div>
      </div>
      <DeltaRow deltas={deltas} start={1500} gap={450} size="md" />
    </motion.div>
  );
}

const faceFor = (i: number): ChipFace => {
  const os = optionStyle(i);
  const o = MEGA.options[i];
  return { color: os.base, dark: os.dark, shape: os.shape, icon: o.icon, text: o.text };
};

function MegaBody({ st }: { st: MegaState }) {
  const { state, live, dispatch } = useGame();
  const teams = stripOrder(state);
  const { pick, setPick, onChip } = useChooser(st);
  const sel = teamById(state, st.selectedTeamId);
  const geo = tileGeometry(4);
  const soloTeam = st.solo ? teamById(state, st.solo) : null;
  // The solo team has no partner and no deal to lock: it always shows as done, and tapping it does nothing.
  const lockedIds = [...Object.keys(st.locks), ...(soloTeam ? [soloTeam.id] : [])];
  const W = useStageW();
  const H = useStageH();
  const strip = stripLayout(teams.length, true, W, H);
  // Everything between the card and the team bar belongs to the content. bottomY = where it must end.
  const bottomY = strip.top - GAP;
  const transcript = useTranscript();
  const lastMinute = useTimerLast(state);
  useRevealLock(st.phase, 1800);

  const open = st.phase === 'open';
  const pairedCount = st.pairs.length * 2;
  const lockedPairs = Object.keys(st.locks).filter(id => id !== st.solo).length;
  const allLocked = pairedCount > 0 && lockedPairs >= pairedCount;
  // Every pair locked: the clock stops (no timer badge either, see the show rule below).
  useHoldTimerWhenLocked(state, dispatch, allLocked, live && open);
  const spotting = st.phase === 'spotlight';
  const pair = spotting ? st.pairs[st.spotlight] : undefined;
  const ready = useReadyAfter(`${st.phase}-${st.spotlight}-${allLocked}`, spotting ? 8000 : 1800);

  if (st.phase === 'intro') return <IntroStage anim="mega" text={INTRO} />;

  const faces: Record<string, ChipFace> = {};
  for (const t of teams) faces[t.id] = t.id === st.solo ? SOLO_FACE : st.locks[t.id] !== undefined ? faceFor(st.locks[t.id]) : ASLEEP;

  const cardTop = transcript ? CONTENT_TOP : CARD_TOP;
  const cardSize: CardSize = !open || allLocked ? 'mini' : lastMinute ? 'small' : 'main';
  const showTiles = open && !allLocked;
  // Below the mini card (once it is no longer the subject): the reveal title and the WaitBig start here.
  const freeTop = cardTop + MINI_CARD_H + GAP;
  const tileH = bottomY - KID_TOP;
  const tileState = (i: number): TileState => (!sel ? 'idle' : pick === i ? 'picked' : 'active');
  const sub = `Team up with your partner: share ${MEGA.prize.customers} customers + ${MEGA.prize.coins} coins. Talk, then both lock the same deal.${soloTeam ? ` ${soloTeam.name}: no partner this time, you get your own mini order. Just cheer!` : ''}`;

  return (
    <div className="scr-full">
      <AnimatePresence>
        {(open || st.phase === 'revealed') && <QuestionCard key="q" title="Festival Mega Order!" sub={sub} size={cardSize} top={cardTop} bottom={KID_TOP - GAP} />}
      </AnimatePresence>
      <TimerBadge show={open && lastMinute && !allLocked} state={state} size={TIMER_SIZE} style={{ position: 'absolute', right: 40, top: cardTop }} />

      <AnimatePresence>
        {showTiles && MEGA.options.map((o, i) => {
          const tappable = !!sel && live;
          return (
            <OptionTile
              key={i}
              index={i}
              icon={o.icon}
              text={o.text}
              detail={o.detail}
              state={tileState(i)}
              onTap={tappable ? () => { setPick(pick === i ? null : i); sfx.play('pop'); } : undefined}
              width={geo.width}
              left={geo.left(i)}
              top={KID_TOP}
              height={tileH}
            />
          );
        })}
      </AnimatePresence>

      {open && allLocked && <WaitBig title="All set!" sub="Every pair locked its deal. Waiting for the reveal…" icon="🤝" top={freeTop + Math.max(0, Math.floor((bottomY - freeTop - 400) / 2))} />}

      {st.phase === 'revealed' && (
        <>
          <div className="cx-reveal-title" style={{ top: freeTop }}>Did the partners agree?</div>
          <ChosenCards entries={teams.map(t => ({ team: t, face: faces[t.id] }))} top={freeTop + 76 + GAP} bottomY={bottomY} paired />
        </>
      )}

      {pair && <PairStage key={st.spotlight} st={st} teams={state.teams} pair={pair} height={bottomY - CONTENT_TOP} />}

      {st.phase === 'done' && (
        <DoneSummary title="The Festival order is done!">
          {soloTeam && <SoloCard team={soloTeam} deltas={st.pending[soloTeam.id] ?? ZERO} />}
        </DoneSummary>
      )}

      <TeamStrip
        teams={teams}
        mode={open ? 'choose' : spotting ? 'spotlight' : 'plain'}
        paired
        selectedId={st.selectedTeamId}
        lockedIds={open ? lockedIds : undefined}
        pickReady={pick !== null}
        faces={spotting ? faces : undefined}
        spotIds={pair ? [...pair] : []}
        onChip={open && live ? (id: string) => { if (id !== st.solo) onChip(id); } : undefined}
        lag={7000}
      />
      <ReadyHint show={ready && ((open && allLocked) || st.phase !== 'open')} />
    </div>
  );
}

// The unfolding of one pair is a slow, staged story (about 7 seconds), so kids can follow every step while Bolt tells it:
// both teams slide in, each choice pops, the deal appears (handshake or broken heart), the result line, then the gains.
const T_CHOICE_A = 1.2, T_CHOICE_B = 2.1, T_ART = 3.4, T_TEXT = 4.5, T_DELTA = 5.6;

function PairStage({ st, teams, pair, height }: { st: MegaState; teams: Team[]; pair: [string, string]; height: number }) {
  const outcome = st.outcomes[st.spotlight];
  const [fire, setFire] = useState(0);
  useEffect(() => {
    if (!outcome) return;
    const ids = [
      setTimeout(() => sfx.play('pop'), T_CHOICE_A * 1000),
      setTimeout(() => sfx.play('pop'), T_CHOICE_B * 1000),
      setTimeout(() => {
        if (outcome.kind === 'broken') sfx.play('splat');
        else if (outcome.kind === 'nodeal') sfx.play('buzz');
        else { sfx.play('cheer'); setFire(f => f + 1); }
      }, T_ART * 1000),
    ];
    return () => ids.forEach(clearTimeout);
  }, [outcome]);
  if (!outcome) return null;
  const [a, b] = pair.map(id => teams.find(t => t.id === id)).filter((t): t is Team => !!t);
  if (!a || !b) return null;
  return (
    <div className="scr-pair-stage" style={{ top: CONTENT_TOP, height }}>
      <PairHalf team={a} side="left" choice={st.locks[a.id]} deltas={st.pending[a.id] ?? ZERO} choiceDelay={T_CHOICE_A} />
      <div className="scr-pair-mid">
        <motion.div className="scr-pair-art" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: T_ART, type: 'spring', stiffness: 220, damping: 12 }}>
          {outcome.kind === 'broken' ? <Heart size={230} broken />
            : outcome.kind === 'nodeal' ? <span className="scr-pair-walk scr-trudge">🚶</span>
            : <Handshake size={300} left={teamColors(a).base} right={teamColors(b).base} />}
        </motion.div>
        <motion.div className="scr-pair-text" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: T_TEXT }}>{outcome.text}</motion.div>
      </div>
      <PairHalf team={b} side="right" choice={st.locks[b.id]} deltas={st.pending[b.id] ?? ZERO} choiceDelay={T_CHOICE_B} />
      <Confetti fire={fire} />
    </div>
  );
}

function PairHalf({ team, side, choice, deltas, choiceDelay }: { team: Team; side: 'left' | 'right'; choice: number | undefined; deltas: Deltas; choiceDelay: number }) {
  const c = teamColors(team);
  const face = choice !== undefined ? faceFor(choice) : ASLEEP;
  return (
    <motion.div
      className="scr-pair-half"
      style={{ background: lighten(c.shades[1], 0.1), boxShadow: 'var(--sh)' }}
      initial={{ x: side === 'left' ? -500 : 500, opacity: 0, rotate: side === 'left' ? -6 : 6 }}
      animate={{ x: 0, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 170, damping: 20 }}
    >
      <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={210} mood={moodFor(deltas)} ring />
      <div className="scr-pair-name">{team.name}</div>
      <motion.div
        className={cx('scr-pair-choice')}
        style={{ background: lighten(face.color, 0.1), boxShadow: 'var(--sh-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
        initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: choiceDelay, type: 'spring', stiffness: 380, damping: 16 }}
      >
        {face.shape && <OptionShape shape={face.shape} color={face.dark} size={46} />}
        <span>{face.icon} {face.text}</span>
      </motion.div>
      <DeltaRow deltas={deltas} start={T_DELTA * 1000} gap={650} size="md" />
    </motion.div>
  );
}
