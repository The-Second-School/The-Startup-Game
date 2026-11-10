// Question step: intro animation -> choose + lock (Lock Master) -> reveal -> spotlight per team -> leaderboard.
import { useEffect, useState } from 'react';
import { QUESTIONS } from '../../game/content';
import { canAfford, teamById } from '../../game/engine';
import type { Deltas, QuestionState } from '../../game/types';
import { sfx } from '../../audio';
import { useGame } from '../lib/ctx';
import { coinText, optionStyle, teamColors } from '../lib/game';
import { Banner } from '../components/Banner';
import { OptionTile, tileGeometry, type TileState } from '../components/OptionTile';
import { QuestionCard } from '../components/QuestionCard';
import { TeamStrip, type ChipFace } from '../components/TeamStrip';
import { TimerBadge } from '../components/TimerBadge';
import { RaivanPop } from '../components/RaivanPop';
import { ASLEEP, DoneBoards, IntroStage, SpotlightCard, useChooser, useRevealLock } from '../components/ChoiceParts';

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

  useRevealLock(st.phase, 1800);

  // rAIvan pops in (after the flip) when somebody fell for his trick.
  const anyTrap = Object.values(st.locks).some(i => q.options[i]?.trap);
  const [pop, setPop] = useState(false);
  useEffect(() => {
    setPop(false);
    if (st.phase !== 'revealed' || !anyTrap) return;
    const a = setTimeout(() => { setPop(true); sfx.play('evil'); }, 1600);
    const b = setTimeout(() => setPop(false), 5600);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [st.phase, anyTrap]);

  if (st.phase === 'intro') return <IntroStage anim={q.introAnim} text={q.boltIntro} />;

  const faceFor = (i: number): ChipFace => {
    const os = optionStyle(i);
    const o = q.options[i];
    return { color: os.base, dark: os.dark, shape: os.shape, icon: o.icon, text: o.text };
  };
  const faces: Record<string, ChipFace> = {};
  for (const t of teams) faces[t.id] = st.locks[t.id] !== undefined ? faceFor(st.locks[t.id]) : ASLEEP;

  if (st.phase === 'done') {
    return (
      <div className="scr-full">
        <DoneBoards teams={teams} />
      </div>
    );
  }

  if (st.phase === 'spotlight') {
    const team = teams[st.spotlight];
    if (!team) return null;
    const idx = st.locks[team.id];
    const opt = idx !== undefined ? q.options[idx] : null;
    return (
      <div className="scr-full">
        <div className="scr-spot-wrap" style={{ left: 40, top: 150, width: 1840 }}>
          <SpotlightCard
            key={team.id}
            team={team}
            face={faces[team.id]}
            story={st.stories[team.id] ?? ''}
            deltas={st.pending[team.id] ?? ZERO}
            trap={!!opt?.trap}
            bonus={opt?.bonus}
            width={1840}
          />
        </div>
        <TeamStrip teams={teams} mode="spotlight" spotIds={[team.id]} faces={faces} lag={2200} />
      </div>
    );
  }

  const open = st.phase === 'open';
  const allLocked = lockedIds.length >= teams.length && teams.length > 0;
  const tileState = (i: number): TileState => {
    if (!open) return 'revealed';
    if (!sel) return 'idle';
    if (!canAfford(sel, q.options[i].coins)) return 'broke';
    return pick === i ? 'picked' : 'active';
  };

  let banner: { id: string; text: string; color?: string; edge?: string };
  if (!open) banner = { id: 'rev', text: 'Here is what everybody chose!', color: 'var(--sun-hi)', edge: 'var(--sun-edge)' };
  else if (sel) {
    const c = teamColors(sel);
    banner = pick === null
      ? { id: `c-${sel.id}`, text: `${sel.name} is choosing… tap an answer`, color: c.shades[1], edge: c.shades[3] }
      : { id: `l-${sel.id}-${pick}`, text: `Tap ${sel.name} again to LOCK`, color: c.shades[1], edge: c.shades[3] };
  } else if (allLocked) banner = { id: 'all', text: 'Everyone is locked in!', color: 'var(--good-soft)', edge: 'var(--good-edge)' };
  else banner = { id: 'tap', text: 'Tap your team first' };

  return (
    <div className="scr-full">
      <QuestionCard title={q.title} sub={q.sub} pose={open ? 'talk' : 'shock'} right={open ? 260 : pop ? 580 : 40} />
      <TimerBadge show={open} state={state} size={190} style={{ position: 'absolute', right: 40, top: 156 }} />
      <Banner id={banner.id} color={banner.color} edge={banner.edge}>{banner.text}</Banner>
      {q.options.map((o, i) => {
        const ts = tileState(i);
        const tappable = open && !!sel && live;
        return (
          <OptionTile
            key={i}
            index={i}
            icon={o.icon}
            text={o.text}
            tag={coinText(o.coins)}
            state={ts}
            empty={!teams.some(t => st.locks[t.id] === i)}
            trap={o.trap}
            onTap={tappable ? () => { setPick(pick === i ? null : i); if (ts !== 'broke') sfx.play('pop'); } : undefined}
            width={geo.width}
            left={geo.left(i)}
          />
        );
      })}
      <TeamStrip
        teams={teams}
        mode={open ? 'choose' : 'reveal'}
        selectedId={st.selectedTeamId}
        lockedIds={lockedIds}
        pickReady={pick !== null}
        faces={open ? undefined : faces}
        onChip={open && live ? onChip : undefined}
      />
      <RaivanPop show={pop} text="Hehe! Some of you fell for my trick!" style={{ right: 24, top: 132 }} />
    </div>
  );
}
