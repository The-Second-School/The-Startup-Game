// Question step: intro animation -> choose + lock (Lock Master) -> everybody locked -> reveal -> spotlight per team -> done.
// Layout: Bolt (the dock, top-left) then the question card right after him; 4 tiles at y >= 560; a minimal team bar at the bottom.
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { BONUS_WHY, QUESTIONS } from '../../game/content';
import { canAfford, teamById } from '../../game/engine';
import type { Deltas, QuestionState } from '../../game/types';
import { sfx } from '../../audio';
import { useStageW } from '../../ui';
import { whyText } from '../../narration/lines/question';
import { useGame } from '../lib/ctx';
import { coinText, optionStyle } from '../lib/game';
import { CONTENT_TOP } from '../lib/layout';
import { OptionTile, tileGeometry, type TileState } from '../components/OptionTile';
import { CARD_TOP, QuestionCard, TIMER_SIZE, type CardSize } from '../components/QuestionCard';
import { TeamStrip, chipCenter, stripLayout, type ChipFace } from '../components/TeamStrip';
import { TimerBadge, useTimerLast } from '../components/TimerBadge';
import { FibbotPop } from '../components/FibbotPop';
import { ReadyHint } from '../components/ReadyHint';
import { ASLEEP, ChosenCards, DoneSummary, IntroStage, SpotlightCard, WaitBig, useChooser, useReadyAfter, useRevealLock, useTranscript } from '../components/ChoiceParts';

const ZERO: Deltas = { coins: 0, customers: 0, happiness: 0 };

export function QuestionView({ qId }: { qId: string }) {
  const { state } = useGame();
  const st = state.step;
  if (st.type !== 'question') return null;
  return <QuestionBody qId={qId} st={st} />;
}

function QuestionBody({ qId, st }: { qId: string; st: QuestionState }) {
  const { state, live } = useGame();
  const q = QUESTIONS[qId];
  const teams = state.teams;
  const { pick, setPick, onChip } = useChooser(st);
  const sel = teamById(state, st.selectedTeamId);
  const geo = tileGeometry(4);
  const lockedIds = Object.keys(st.locks);
  const W = useStageW();
  const strip = stripLayout(teams.length, false, W);
  const transcript = useTranscript();
  const lastMinute = useTimerLast(state);

  useRevealLock(st.phase, 1800);

  const open = st.phase === 'open';
  const allLocked = lockedIds.length >= teams.length && teams.length > 0;
  const trapCount = teams.filter(t => q.options[st.locks[t.id]]?.trap).length;

  // Fibbot slides in when the choices are revealed and stays until the host starts the first team's result.
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
  const barGap = 1080 - strip.top + 24;

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
    const c = chipCenter(shownIdx, teams.length, false, W);
    return (
      <div key={spotTeam.id} className="cx-spot-wrap" style={{ left: 40, top: CONTENT_TOP, width: 1840 }}>
        <SpotlightCard
          team={spotTeam}
          face={faces[spotTeam.id]}
          story={st.stories[spotTeam.id] ?? ''}
          why={opt && idx !== undefined ? whyText(qId, idx, d) : undefined}
          deltas={d}
          tag={opt ? coinText(opt.coins) : undefined}
          trap={!!opt?.trap}
          bonus={opt?.bonus}
          bonusWhy={opt?.bonus ? BONUS_WHY : undefined}
          width={1840}
          from={{ x: c.x - 960, y: c.y - (CONTENT_TOP + 300) }}
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
        {(open || st.phase === 'revealed') && <QuestionCard key="q" title={q.title} sub={q.sub} size={cardSize} top={cardTop} />}
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
            />
          );
        })}
      </AnimatePresence>

      {open && allLocked && (
        <WaitBig title="Everyone is locked in!" sub="Waiting for the reveal…" top={300} />
      )}

      {st.phase === 'revealed' && (
        <>
          <div className="cx-reveal-title" style={{ top: 226, left: 56, right: trapCount ? 460 : 56 }}>Here is what everybody chose!</div>
          <ChosenCards
            entries={teams.map(t => {
              const i = st.locks[t.id];
              return { team: t, face: faces[t.id], tag: i !== undefined ? coinText(q.options[i].coins) : undefined };
            })}
            top={316}
            bottom={barGap}
            right={trapCount ? 460 : 56}
            maxCols={trapCount ? 3 : 4}
          />
        </>
      )}

      <AnimatePresence>{spotTeam && spotBody()}</AnimatePresence>

      {st.phase === 'done' && <DoneSummary title="That is it for this question!" />}

      <FibbotPop show={villain} text={trapCount === 1 ? 'Hehe! One of you fell for my trick!' : `Hehe! ${trapCount} of you fell for my trick!`} style={{ right: 40, top: 232 }} />

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
