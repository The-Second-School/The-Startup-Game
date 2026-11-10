// Jobs: role cards on top (look only), the chosen team's members as big tiles (tap to cycle a job),
// team chips at the bottom to switch team.
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar, Bolt } from '../../ui';
import { ROLES } from '../../game/content';
import { suggestRoles } from '../../game/helpers';
import type { RoleId, Team } from '../../game/types';
import { useGame } from '../lib/ctx';
import { useUi } from '../lib/ui';
import { bus } from '../lib/bus';
import { missingRoles, roleCycle, ROLE_SHORT, sameRoles, teamColors } from '../lib/game';
import { Tap } from '../components/Tap';
import { TeamStrip } from '../components/TeamStrip';
import { useStableCallback } from '../hooks/useStableCallback';

const ROLE_ORDER: RoleId[] = ['ceo', 'money', 'lock', 'speaker', 'time'];
const ROLE_COLORS: Record<RoleId, [string, string]> = {
  ceo: ['#FFC800', '#E0A100'], money: ['#89DD45', '#46A302'], lock: ['#5CC8F9', '#1395D4'], speaker: ['#FF97C9', '#E5539A'], time: ['#DCA6FF', '#B05EE8'],
};

export function RolesView() {
  const { state, dispatch, live } = useGame();
  const rolesTeam = useUi(s => s.rolesTeam);
  const setRolesTeam = useUi(s => s.setRolesTeam);
  const team = state.teams.find(t => t.id === rolesTeam) ?? null;

  useEffect(() => {
    if (!state.teams.length) return;
    if (!team) setRolesTeam((state.teams.find(t => missingRoles(t).length) ?? state.teams[0]).id);
  }, [team, state.teams, setRolesTeam]);

  const fill = useStableCallback((t: Team | null) => {
    if (!live || !t) return;
    for (const r of suggestRoles(t)) dispatch({ type: 'SET_ROLES', teamId: t.id, playerId: r.playerId, roles: r.roles });
  });
  useEffect(() => bus.on('fillRoles', () => {
    const t = useUi.getState().rolesTeam;
    const cur = state.teams.find(x => x.id === t);
    if (cur) fill(cur);
  }), [fill, state.teams]);

  const cycle = (t: Team, playerId: string) => {
    const m = t.members.find(x => x.playerId === playerId);
    if (!m) return;
    const opts = roleCycle(t);
    const i = opts.findIndex(o => sameRoles(o, m.roles));
    dispatch({ type: 'SET_ROLES', teamId: t.id, playerId, roles: opts[(i + 1) % opts.length] });
  };

  const k = (team?.members.length ?? 4) + 1;
  const tileGap = k >= 6 ? 24 : 36;
  const tileW = Math.floor((1776 - (k - 1) * tileGap) / k);

  return (
    <div className="scr-full">
      <div className="scr-roles-head">
        <div className="scr-roles-bolt"><Bolt pose="point" size={120} talking /></div>
        <div className="scr-h1" style={{ fontSize: 88 }}>Pick your jobs!</div>
        <AnimatePresence mode="popLayout">
          {team && (
            <motion.div key={team.id} className="scr-roles-team" style={{ background: teamColors(team).shades[1], boxShadow: 'var(--sh)' }} initial={{ x: 120, opacity: 0, scale: 0.8 }} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: -120, opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 420, damping: 26 }}>
              {team.name}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="scr-role-cards">
        {ROLE_ORDER.map((r, i) => (
          <motion.div key={r} className="scr-role-card" style={{ background: ROLE_COLORS[r][0], boxShadow: `var(--sh)`, rotate: [-0.8, 0.6, -0.4, 0.8, -0.6][i] }}
            initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 18, delay: i * 0.08 }}>
            <div className="scr-role-card-name">{ROLES[r].icon} {ROLES[r].name}</div>
            <div className="scr-role-card-job">{ROLES[r].job}</div>
          </motion.div>
        ))}
      </div>
      <div className="scr-member-tiles">
        <AnimatePresence mode="popLayout">
          {team && [...team.members.map(m => {
            const roles = m.roles;
            const col = roles.length ? ROLE_COLORS[roles[0]] : ['#FFFFFF', '#EED9A0'];
            return (
              <motion.div key={`${team.id}-${m.playerId}`} style={{ width: tileW }} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0, transition: { duration: 0.15 } }} transition={{ type: 'spring', stiffness: 420, damping: 18 }}>
                <Tap id={`member-${m.playerId}`} onTap={() => cycle(team, m.playerId)} className="scr-member-tile" style={{ background: col[0], boxShadow: `var(--sh)` }}>
                  <Avatar seed={team.avatarSeed} colorIndex={team.colorIndex} shade={m.shade} size={72} />
                  <div className="scr-member-tile-name">{m.name}</div>
                  <motion.div key={roles.join('+') || 'none'} className="scr-member-tile-role" initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 600, damping: 14 }}>
                    {roles.length ? roles.map(r => ROLE_SHORT[r]).join(' + ') : 'Tap me'}
                  </motion.div>
                </Tap>
              </motion.div>
            );
          }), (
            <motion.div key={`${team.id}-fill`} style={{ width: tileW }} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.1 }}>
              <Tap id={`fill-${team.id}`} onTap={() => fill(team)} sound="pop" className="scr-member-tile is-fill">
                <div className="scr-member-tile-name is-fill-label">Fill jobs for us</div>
              </Tap>
            </motion.div>
          )]}
        </AnimatePresence>
      </div>
      <TeamStrip
        teams={state.teams}
        mode="plain"
        slim
        selectedId={team?.id}
        onChip={id => setRolesTeam(id)}
        extra={t => {
          const miss = missingRoles(t).length;
          return miss ? <span className="scr-chip-pill">{miss} job{miss > 1 ? 's' : ''} left</span> : <span className="scr-chip-pill is-locked">All jobs set</span>;
        }}
      />
    </div>
  );
}
