// Question step: intro animation -> choose + lock (Lock Master) -> everybody locked -> reveal -> spotlight per team -> done.
// Layout: Bolt (the dock, top-left) then the question card right after him; 4 tiles at y >= 560; a minimal team bar at the bottom.
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { BONUS_WHY, QUESTIONS } from '../../game/content';
import { canAfford, teamById } from '../../game/engine';
import type { Deltas, QuestionState } from '../../game/types';
import { sfx } from '../../audio';
import { useStageH, useStageW } from '../../ui';
import { whyText } from '../../narration/lines/question';
import { useGame } from '../lib/ctx';
import { coinText, optionStyle } from '../lib/game';
import { CONTENT_TOP, GAP, KID_TOP, MINI_CARD_H } from '../lib/layout';
import { OptionTile, tileGeometry, type TileState } from '../components/OptionTile';
import { CARD_TOP, QuestionCard, TIMER_SIZE, type CardSize } from '../components/QuestionCard';
import { TeamStrip, chipCenter, stripLayout, type ChipFace } from '../components/TeamStrip';
import { TimerBadge, useHoldTimerWhenLocked, useTimerLast } from '../components/TimerBadge';
import { FibbotPop } from '../components/FibbotPop';
import { ReadyHint } from '../components/ReadyHint';
import { ASLEEP, ChosenCards, DoneResults, IntroStage, SpotlightCard, WaitBig, useChooser, useReadyAfter, useRevealLock, useTranscript } from '../components/ChoiceParts';
import { useDockAt } from '../../narration/useDockAt';

const ZERO: Deltas = { coins: 0, customers: 0, happiness: 0 };
const REVEAL_TITLE_H = 76;          // 72px title, one line
const DONE_LEGEND_TOP = 150;        // beside Bolt, under the heading
const DONE_LEGEND_TOP_TALK = 314;   // pushed down when Bolt's transcript bubble sits at 150
const DONE_LEGEND_H = 124;          // the three-meter legend

/** Places the Jhootu/Bolt dock for this view (a hook needs a component to live in). */
function DockSlot({ x, y, w }: { x: number; y: number; w: number }) {
  useDockAt(x, y, w);
  return null;
}

export function QuestionView({ qId }: { qId: string }) {
  const { state } = useGame();
  const st = state.step;
  if (st.type !== 'question') return null;
  return <QuestionBody qId={qId} st={st} />;
}

function QuestionBody({ qId, st }: { qId: string; st: QuestionState }) {
  const { state, live, dispatch } = useGame();
  const q = QUESTIONS[qId];
  const teams = state.teams;
  const { pick, setPick, onChip } = useChooser(st);
  const sel = teamById(state, st.selectedTeamId);
  const geo = tileGeometry(4);
  const lockedIds = Object.keys(st.locks);
  const W = useStageW();
  const H = useStageH();
  const strip = stripLayout(teams.length, false, W, H);
  // Everything between the question card and the team bar belongs to the content. bottomY = where it must end.
  const bottomY = strip.top - GAP;
  const transcript = useTranscript();
  const lastMinute = useTimerLast(state);

  useRevealLock(st.phase, 1800);

  const open = st.phase === 'open';
  const allLocked = lockedIds.length >= teams.length && teams.length > 0;
  // Everybody locked: the clock stops on the big screen (the phone reads the same state).
  useHoldTimerWhenLocked(state, dispatch, allLocked, live && open);
  const trapCount = teams.filter(t => q.options[st.locks[t.id]]?.trap).length;

  // Jhootu slides in when the choices are revealed and stays until the host starts the first team's result.
  const [villain, setVillain] = useState(false);
  useEffect(() => {
    if (st.phase !== 'revealed' || !trapCount) { setVillain(false); return; }
    const id = setTimeout(() => { setVillain(true); sfx.play('evil'); }, 1300);
    return () => clearTimeout(id);
  }, [st.phase, trapCount]);

  // Spotlight: the host's current team, or a team that was already revealed and got tapped again (display only, never re-applied).
  const [viewIdx, setViewIdx] = useState<number | null>(null);
  useEffect(() => { setViewIdx(null); }, [st.phase, st.spotlight]);

  const ready = useReadyAfter(`${st.phase}-${st.spotlight}-${allLocked}`, st.phase === 'spotlight' ? 6500 : 1800);

  if (st.phase === 'intro') return <IntroStage anim={q.introAnim} text={q.boltIntro} />;

  const faceFor = (i: number): ChipFace => {
    const os = optionStyle(i);
    const o = q.options[i];
    return { color: os.base, dark: os.dark, shape: os.shape, icon: o.icon, text: o.text };
  };
  const faces: Record<string, ChipFace> = {};
  for (const t of teams) faces[t.id] = st.locks[t.id] !== undefined ? faceFor(st.locks[t.id]) : ASLEEP;

  const spotting = st.phase === 'spotlight';
  const shownIdx = viewIdx ?? st.spotlight;
  const spotTeam = spotting ? teams[shownIdx] : undefined;
  const cardTop = transcript ? CONTENT_TOP : CARD_TOP;
  const cardSize: CardSize = !open || allLocked ? 'mini' : lastMinute ? 'small' : 'main';
  const showTiles = open && !allLocked;
  // Below the mini card (when it is no longer the subject): the reveal title and the WaitBig / results start here.
  const freeTop = cardTop + MINI_CARD_H + GAP;
  const tileH = bottomY - KID_TOP;
  const spotH = bottomY - CONTENT_TOP;

  const tileState = (i: number): TileState => {
    if (!sel) return 'idle';
    if (!canAfford(sel, q.options[i].coins)) return 'broke';
    return pick === i ? 'picked' : 'active';
  };

  const spotBody = () => {
    if (!spotTeam) return null;
    const idx = st.locks[spotTeam.id];
    const opt = idx !== undefined ? q.options[idx] : null;
    const d = st.pending[spotTeam.id] ?? ZERO;
    const c = chipCenter(shownIdx, teams.length, false, W, H);
    return (
      <div key={spotTeam.id} className="cx-spot-wrap" style={{ left: 40, top: CONTENT_TOP, width: 1840 }}>
        <SpotlightCard
          height={spotH}
          team={spotTeam}
          question={q.title}
          face={faces[spotTeam.id]}
          story={st.stories[spotTeam.id] ?? ''}
          why={opt && idx !== undefined ? whyText(qId, idx, d) : undefined}
          deltas={d}
          tag={opt ? coinText(opt.coins) : undefined}
          trap={!!opt?.trap}
          bonus={opt?.bonus}
          bonusWhy={opt?.bonus ? BONUS_WHY : undefined}
          width={1840}
          from={{ x: c.x - 960, y: c.y - (CONTENT_TOP + spotH / 2) }}
        />
      </div>
    );
  };

  const onSpotChip = (id: string) => {
    if (!live) return;
    const i = teams.findIndex(t => t.id === id);
    if (i < 0 || i > st.spotlight) return;
    setViewIdx(i === st.spotlight ? null : i);
  };

  return (
    <div className="scr-full">
      <AnimatePresence>
        {(open || st.phase === 'revealed') && <QuestionCard key="q" title={q.title} sub={q.sub} size={cardSize} top={cardTop} bottom={KID_TOP - GAP} />}
      </AnimatePresence>
      <TimerBadge show={open && lastMinute && !allLocked} state={state} size={TIMER_SIZE} style={{ position: 'absolute', right: 40, top: cardTop }} />

      <AnimatePresence>
        {showTiles && q.options.map((o, i) => {
          const ts = tileState(i);
          const tappable = !!sel && live;
          return (
            <OptionTile
              key={i}
              index={i}
              icon={o.icon}
              text={o.text}
              tag={coinText(o.coins)}
              state={ts}
              trap={o.trap}
              onTap={tappable ? () => { setPick(pick === i ? null : i); if (ts !== 'broke') sfx.play('pop'); } : undefined}
              width={geo.width}
              left={geo.left(i)}
              top={KID_TOP}
              height={tileH}
            />
          );
        })}
      </AnimatePresence>

      {open && allLocked && (
        <WaitBig title="Everyone is locked in!" sub="Waiting for the reveal…" top={freeTop + Math.max(0, Math.floor((bottomY - freeTop - 400) / 2))} />
      )}

      {st.phase === 'revealed' && (
        <>
          <div className="cx-reveal-title" style={{ top: freeTop, left: 56, right: trapCount ? 460 : 56 }}>Here is what everybody chose!</div>
          <ChosenCards
            entries={teams.map(t => {
              const i = st.locks[t.id];
              return { team: t, face: faces[t.id], tag: i !== undefined ? coinText(q.options[i].coins) : undefined };
            })}
            top={freeTop + REVEAL_TITLE_H + GAP}
            bottomY={bottomY}
            right={trapCount ? 460 : 56}
            maxCols={trapCount ? 3 : 4}
          />
        </>
      )}

      <AnimatePresence>{spotTeam && spotBody()}</AnimatePresence>

      {st.phase === 'done' && (
        <>
          <DockSlot x={24} y={150} w={1400} />
          <DoneResults
            title="That is it for this question!"
            rows={teams.map(t => ({ team: t, deltas: st.pending[t.id] ?? ZERO }))}
            bottomY={bottomY}
            legendTop={transcript ? DONE_LEGEND_TOP_TALK : DONE_LEGEND_TOP}
            top={(transcript ? DONE_LEGEND_TOP_TALK : DONE_LEGEND_TOP) + DONE_LEGEND_H + GAP}
          />
        </>
      )}

      <FibbotPop show={villain} text={trapCount === 1 ? 'Hehe! One of you fell for my trick!' : `Hehe! ${trapCount} of you fell for my trick!`} style={{ right: 40, top: freeTop }} />

      <TeamStrip
        teams={teams}
        mode={open ? 'choose' : spotting ? 'spotlight' : 'plain'}
        selectedId={st.selectedTeamId}
        lockedIds={open ? lockedIds : undefined}
        pickReady={pick !== null}
        faces={spotting ? faces : undefined}
        spotIds={spotTeam ? [spotTeam.id] : []}
        tappableIds={spotting ? teams.slice(0, st.spotlight + 1).map(t => t.id) : undefined}
        onChip={open && live ? onChip : spotting && live ? onSpotChip : undefined}
        lag={3000}
      />
      <ReadyHint show={ready && ((open && allLocked) || st.phase !== 'open')} />
    </div>
  );
}
