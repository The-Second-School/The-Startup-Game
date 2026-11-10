// Make teams: names fly from the pool into team boxes (shared layoutId), avatars hatch from eggs.
import { useEffect, useRef } from 'react';
import { LayoutGroup, motion } from 'motion/react';
import { Avatar, Bolt, SpeechBubble } from '../../ui';
import { makeTeams, suggestTeamCount } from '../../game/helpers';
import { useGame } from '../lib/ctx';
import { bus } from '../lib/bus';
import { lockInput } from '../lib/tap';
import { teamColors } from '../lib/game';
import { BigButton } from '../components/BigButton';
import { Tap } from '../components/Tap';
import { GRADE_COLORS } from './PlayersView';
import { useStableCallback } from '../hooks/useStableCallback';

export function TeamsView() {
  const { state, dispatch, live } = useGame();
  const count = state.settings.teamCount;
  const enough = state.players.length >= count;
  const has = state.teams.length > 0;
  const make = useStableCallback(() => {
    if (!live || !enough) return;
    dispatch({ type: 'MAKE_TEAMS', teams: makeTeams(state.players, count) });
    lockInput(1800);
  });
  useEffect(() => bus.on('makeTeams', make), [make]);
  // First visit: pre-select the team count that gives 4 to 5 kids per team (the host can still change it).
  const suggested = suggestTeamCount(state.players.length);
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !live || has || !state.players.length) return;
    seeded.current = true;
    if (count === 4 && suggested !== 4) dispatch({ type: 'SET_SETTING', key: 'teamCount', value: suggested });
  }, [live, has, state.players.length, count, suggested, dispatch]);
  const pickCount = (v: 3 | 4 | 5 | 6) => { if (live && v !== count) dispatch({ type: 'SET_SETTING', key: 'teamCount', value: v }); };
  const n = state.teams.length || count;
  const margin = 56, gap = n >= 5 ? 24 : 40;
  const colW = Math.floor((1920 - 2 * margin - (n - 1) * gap) / n);

  return (
    <div className="scr-full">
      <LayoutGroup id="teams">
        {!has && (
          <>
            <div className="scr-players-head">
              <div className="scr-players-bolt"><Bolt pose="think" size={130} talking /></div>
              <div>
                <div className="scr-h1">Time to make teams!</div>
                <div className="scr-players-bubble"><SpeechBubble text={enough ? `${count} teams, mixed classes. Ready?` : 'We need more players first!'} side="left" /></div>
              </div>
            </div>
            <div className="scr-bubbles" style={{ top: 360, bottom: 400 }}>
              {state.players.map((p, i) => (
                <motion.div key={p.id} layoutId={`pl-${p.id}`} className="scr-name-bubble" style={{ background: GRADE_COLORS[p.grade].bg, boxShadow: `var(--sh)`, fontSize: 40, rotate: ((i * 37) % 7) - 3 }}>
                  {p.name}
                </motion.div>
              ))}
            </div>
            <div className="scr-bottom-center" style={{ top: 700, gap: 28, alignItems: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 700, marginRight: 8 }}>How many teams?</div>
              {([3, 4, 5, 6] as const).map(v => {
                const on = v === count;
                const lo = Math.floor(state.players.length / v), per = state.players.length % v === 0 ? `${lo} kids each` : `${lo}-${lo + 1} kids each`;
                return (
                  <Tap key={v} id={`teamcount-${v}`} onTap={() => pickCount(v)} sound="pop" style={{ width: 190, height: 130 }}>
                    <div style={{
                      width: '100%', height: '100%', borderRadius: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: on ? 'var(--sun)' : 'var(--paper)', boxShadow: on ? '0 8px 0 var(--sun-edge)' : '0 8px 0 var(--paper-edge)', border: '6px solid #fff', transform: on ? 'translateY(-4px)' : undefined,
                    }}>
                      <span style={{ fontSize: 72, fontWeight: 800, lineHeight: 1 }}>{v}</span>
                      <span style={{ fontSize: 26, fontWeight: 700, opacity: 0.75 }}>{v === suggested ? 'best fit' : state.players.length ? per : 'teams'}</span>
                    </div>
                  </Tap>
                );
              })}
            </div>
            <div className="scr-bottom-center" style={{ top: 870 }}>
              <BigButton id="make-teams" onTap={make} disabled={!enough} width={560} height={150} bounce>
                {enough ? 'Make teams!' : 'Add players first'}
              </BigButton>
            </div>
          </>
        )}
        {has && (
          <>
            <div className="scr-team-cols" style={{ left: margin, right: margin, gap }}>
              {state.teams.map((t, ti) => {
                const c = teamColors(t);
                return (
                  <motion.div key={t.id} className="scr-team-col" style={{ width: colW, background: c.shades[0], boxShadow: `var(--sh)` }}
                    initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22, delay: ti * 0.08 }}>
                    <motion.div initial={{ scale: 0.3, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.3 + ti * 0.15 }}>
                      <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={n >= 5 ? 120 : 132} mood="wow" />
                    </motion.div>
                    <div className="scr-team-col-name">{t.name}</div>
                    <div className="scr-team-members">
                      {t.members.map((m, mi) => (
                        <motion.div key={m.playerId} layoutId={`pl-${m.playerId}`} className="scr-member-row" transition={{ type: 'spring', stiffness: 260, damping: 24, delay: (ti + mi * n) * 0.05 }}>
                          <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={m.shade} size={52} />
                          <span>{m.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="scr-bottom-center" style={{ top: 866 }}>
              <BigButton id="shuffle-teams" onTap={make} color="var(--paper)" edge="var(--paper-edge)" width={460} height={160}>Shuffle again</BigButton>
            </div>
          </>
        )}
      </LayoutGroup>
    </div>
  );
}
