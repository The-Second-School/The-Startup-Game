// Jobs. One tall card per teammate. Every kid taps ONE of the jobs that are still free: a job that is taken
// disappears from the other teammates' lists. Tap a chosen job to give it back. A thin team selector sits at the bottom.
import '../setup2.css';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar, Confetti, CountUp } from '../../ui';
import { ROLES } from '../../game/content';
import { suggestRoles } from '../../game/helpers';
import type { Member, RoleId, Team } from '../../game/types';
import { sfx } from '../../audio';
import { useGame } from '../lib/ctx';
import { useUi } from '../lib/ui';
import { bus } from '../lib/bus';
import { ROLE_SHORT, roleCycle, teamColors, teamName } from '../lib/game';
import { Tap } from '../components/Tap';
import { useStableCallback } from '../hooks/useStableCallback';

const ROLE_ORDER: RoleId[] = ['ceo', 'money', 'lock', 'speaker', 'time'];
const ROLE_COLORS: Record<RoleId, [string, string]> = {
  ceo: ['#FFC800', '#E0A100'], money: ['#89DD45', '#46A302'], lock: ['#5CC8F9', '#1395D4'], speaker: ['#FF97C9', '#E5539A'], time: ['#DCA6FF', '#B05EE8'],
};
const ROLE_HINT: Record<RoleId, string> = {
  ceo: 'Has the final say', money: 'Watches the coins', lock: 'Locks the answer', speaker: 'Talks at Mic Time', time: 'Watches the clock',
};

// ---- job maths (a "bundle" is what one kid picks: one job, or CEO + Money in a team of 3)
const bundlesOf = (t: Team): RoleId[][] => roleCycle(t).slice(1);
const heldBy = (t: Team, except?: string) => new Set(t.members.filter(m => m.playerId !== except).flatMap(m => m.roles));
const bundleLabel = (b: RoleId[]) => b.map(r => ROLE_SHORT[r]).join(' + ');
/** Jobs still to hand out. A team of 2 only has 2 jobs to give, so it can still finish. */
function jobsLeft(t: Team): number {
  const bs = bundlesOf(t);
  const have = heldBy(t);
  const taken = bs.filter(b => b.some(r => have.has(r))).length;
  return Math.max(0, Math.min(bs.length, t.members.length) - taken);
}
/** The jobs a teammate can still pick: only bundles nobody else holds. */
const freeFor = (t: Team, m: Member) => {
  const others = heldBy(t, m.playerId);
  return bundlesOf(t).filter(b => !b.some(r => others.has(r)));
};

export function RolesView() {
  const { state, dispatch, live } = useGame();
  const rolesTeam = useUi(s => s.rolesTeam);
  const setRolesTeam = useUi(s => s.setRolesTeam);
  const team = state.teams.find(t => t.id === rolesTeam) ?? null;
  const [fire, setFire] = useState(0);

  useEffect(() => {
    if (!state.teams.length) return;
    if (!team) setRolesTeam((state.teams.find(t => jobsLeft(t) > 0) ?? state.teams[0]).id);
  }, [team, state.teams, setRolesTeam]);

  const fill = useStableCallback((t: Team | null) => {
    if (!live || !t) return;
    for (const r of suggestRoles(t)) dispatch({ type: 'SET_ROLES', teamId: t.id, playerId: r.playerId, roles: r.roles });
  });
  useEffect(() => bus.on('fillRoles', () => {
    const cur = state.teams.find(x => x.id === useUi.getState().rolesTeam);
    if (cur) fill(cur);
  }), [fill, state.teams]);

  const assign = (t: Team, playerId: string, roles: RoleId[]) => {
    if (live) dispatch({ type: 'SET_ROLES', teamId: t.id, playerId, roles });
  };

  // A team just finished: ding, hop to the next team that still needs jobs; everybody finished: cheer + confetti.
  const doneIds = state.teams.filter(t => jobsLeft(t) === 0).map(t => t.id);
  const doneKey = doneIds.join(',');
  const prevDone = useRef(new Set(doneIds));
  useEffect(() => {
    const prev = prevDone.current;
    const fresh = doneIds.filter(id => !prev.has(id));
    prevDone.current = new Set(doneIds);
    if (!fresh.length) return;
    if (doneIds.length === state.teams.length) { sfx.play('cheer'); setFire(f => f + 1); return; }
    sfx.play('ding');
    const cur = useUi.getState().rolesTeam;
    if (!cur || !fresh.includes(cur)) return;
    const i = state.teams.findIndex(t => t.id === cur);
    const next = [...state.teams.slice(i + 1), ...state.teams.slice(0, i)].find(t => jobsLeft(t) > 0);
    if (!next) return;
    const id = setTimeout(() => setRolesTeam(next.id), 1700);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneKey]);

  const k = team?.members.length ?? 4;
  const tileGap = k >= 7 ? 14 : k >= 6 ? 20 : 28;
  const tileW = Math.floor((1808 - (k - 1) * tileGap) / Math.max(1, k));
  const left = team ? jobsLeft(team) : 0;
  const plan = team ? new Set(bundlesOf(team).flat()) : new Set<RoleId>();
  const have = team ? heldBy(team) : new Set<RoleId>();

  return (
    <div className="scr-full">
      <div className="s2-r-top">
        <div className="s2-title">Pick your jobs!</div>
        <div className="s2-r-legend">
          {ROLE_ORDER.map(r => {
            const mood = have.has(r) ? 'is-taken' : plan.has(r) ? 'is-open' : 'is-off';
            return (
              <div key={r} className={`s2-r-badge ${mood}`} style={{ '--rc': ROLE_COLORS[r][0], '--re': ROLE_COLORS[r][1] } as React.CSSProperties}>
                <span>{ROLES[r].icon}</span>{ROLE_SHORT[r]}{have.has(r) && <b>✓</b>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="s2-r-banner">
        <AnimatePresence mode="wait" initial={false}>
          {team && (
            <motion.div key={team.id} className="s2-r-team" initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -80, opacity: 0, transition: { duration: 0.12 } }} transition={{ type: 'spring', stiffness: 420, damping: 28 }}>
              <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={2} size={64} mood="happy" />
              <span className="s2-r-team-name" style={{ color: teamColors(team).shades[4] }}>{teamName(team)}</span>
              <span className={`s2-r-left${left === 0 ? ' is-done' : ''}`}>
                {left === 0 ? 'All jobs set ✓' : <><CountUp value={left} /> job{left > 1 ? 's' : ''} left</>}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`s2-r-tiles${tileW < 250 ? ' is-narrow' : ''}`} style={{ gap: tileGap }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {team && team.members.map((m, i) => {
            const c = teamColors(team);
            const free = freeFor(team, m);
            const mine = m.roles;
            return (
              <motion.div key={`${team.id}-${m.playerId}`} className="s2-r-tile" style={{ width: tileW, background: c.shades[0] }}
                initial={{ y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0, transition: { duration: 0.12 } }} transition={{ type: 'spring', stiffness: 380, damping: 24, delay: i * 0.04 }}>
                <div className="s2-r-head">
                  <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={m.shade} size={84} mood={mine.length ? 'happy' : 'cool'} />
                  <div className="s2-r-name">{m.name}</div>
                </div>
                <div className="s2-r-pick">
                  {mine.length ? (
                    <Tap id={`job-clear-${m.playerId}`} onTap={() => assign(team, m.playerId, [])} className="s2-r-got" style={{ background: ROLE_COLORS[mine[0]][0], boxShadow: `0 6px 0 ${ROLE_COLORS[mine[0]][1]}` }}>
                      <motion.div className="s2-r-got-in" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 520, damping: 15 }}>
                        <div className="s2-r-got-icon">{mine.map(r => ROLES[r].icon).join('')}</div>
                        <div className="s2-r-got-name">{mine.map(r => ROLES[r].name).join(' + ')}</div>
                        <div className="s2-r-got-hint">{mine.map(r => ROLE_HINT[r]).join(' + ')}</div>
                        <div className="s2-r-got-undo">Tap to change</div>
                      </motion.div>
                    </Tap>
                  ) : free.length ? (
                    <AnimatePresence mode="popLayout" initial={false}>
                      {free.map(b => (
                        <motion.div key={b.join('+')} layout className="s2-r-opt" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.14 } }} transition={{ type: 'spring', stiffness: 500, damping: 26 }}>
                          <Tap id={`job-${m.playerId}-${b.join('+')}`} onTap={() => assign(team, m.playerId, b)} className="s2-r-opt-tap" style={{ background: ROLE_COLORS[b[0]][0], boxShadow: `0 6px 0 ${ROLE_COLORS[b[0]][1]}` }}>
                            <span className="s2-r-opt-icon">{b.map(r => ROLES[r].icon).join('')}</span>
                            <span className="s2-r-opt-name">{bundleLabel(b)}</span>
                          </Tap>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  ) : (
                    <div className="s2-r-helper"><span>🌟</span>Team helper<small>All jobs are taken</small></div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="s2-r-bar">
        <div className="s2-r-teams">
          {state.teams.map(t => {
            const c = teamColors(t);
            const bs = bundlesOf(t);
            const hv = heldBy(t);
            const on = t.id === team?.id;
            const dn = jobsLeft(t) === 0;
            return (
              <Tap key={t.id} id={`chip-${t.id}`} onTap={() => setRolesTeam(t.id)} sound="tap" className="s2-r-pill-tap">
                <motion.div className={`s2-r-pill${on ? ' is-on' : ''}${dn ? ' is-done' : ''}`} animate={{ y: on ? -6 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  style={{ background: on ? c.shades[1] : c.shades[0], '--ce': c.shades[3] } as React.CSSProperties}>
                  <Avatar seed={t.avatarSeed} colorIndex={t.colorIndex} shade={2} size={52} />
                  <div className="s2-r-pill-text">
                    <div className="s2-r-pill-name">{teamName(t)}</div>
                    <div className="s2-r-pips">
                      {bs.slice(0, Math.max(1, Math.min(bs.length, t.members.length))).map((b, i) => <span key={i} className={b.some(r => hv.has(r)) ? 'is-on' : ''} />)}
                    </div>
                  </div>
                </motion.div>
              </Tap>
            );
          })}
        </div>
        <AnimatePresence initial={false}>
          {team && left > 0 && (
            <motion.div key="fill" className="s2-r-fill-wrap" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 26 }}>
              <Tap id={`fill-${team.id}`} onTap={() => fill(team)} className="s2-r-fill">✨ Fill for us</Tap>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Confetti fire={fire} count={110} />
    </div>
  );
}
