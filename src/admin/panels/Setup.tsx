import { useRef, useState } from 'react';
import { PRODUCTS, ROLES, ROLE_PLAN, TEAM_COLORS, productById } from '../../game/content';
import { availableProducts, makeTeams, suggestRoles, suggestTeamCount, uid } from '../../game/helpers';
import { GRADES, type Grade, type RoleId, type Team } from '../../game/types';
import { useA } from '../ctx';
import { isDefaultName } from '../info';
import { Btn, Card, Chip, CommitInput, Fold, Label, TeamDot, TeamLine } from '../kit';

const ROLE_IDS = Object.keys(ROLES) as RoleId[];
const SHORT: Record<RoleId, string> = { ceo: 'CEO', money: 'Money', lock: 'Lock', speaker: 'Speaker', time: 'Time' };

/** Team sizes that makeTeams will produce for n players over c teams. */
export function teamSizes(n: number, c: number): number[] {
  const base = Math.floor(n / c), extra = n % c;
  return Array.from({ length: c }, (_, i) => base + (i < extra ? 1 : 0));
}

function TeamCount() {
  const { state, send } = useA();
  const c = state.settings.teamCount;
  const sizes = teamSizes(state.players.length, c);
  const min = Math.min(...sizes), max = Math.max(...sizes);
  const best = suggestTeamCount(state.players.length);
  const warn = state.players.length > 0 && (min < 3 || max > 5);
  return (
    <Card>
      <Label>How many teams?</Label>
      <div className="row">
        {([3, 4, 5, 6] as const).map(v => (
          <Chip key={v} on={c === v} onClick={() => send({ type: 'SET_SETTING', key: 'teamCount', value: v })} style={{ flex: 1 }}>{v}{v === best ? ' ★' : ''}</Chip>
        ))}
      </div>
      {state.players.length > 0 && <div className="hint">★ = best fit for {state.players.length} kids (4 to 5 kids per team).</div>}
      {state.players.length > 0 && (
        <div className={`hint ${warn ? 'hint-warn' : ''}`}>
          {c} teams of {sizes.join(', ')} kids.
          {min < 3 && ' Some teams have fewer than 3 kids. Add players or choose fewer teams.'}
          {max > 5 && ' Some teams have more than 5 kids. Choose more teams.'}
        </div>
      )}
    </Card>
  );
}

// ---------- Players ----------
export function PlayersPanel() {
  const { state, send } = useA();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<Grade>(5);
  const ref = useRef<HTMLInputElement>(null);
  const add = () => {
    const n = name.trim();
    if (!n) { ref.current?.focus(); return; }
    send({ type: 'ADD_PLAYER', player: { id: uid(), name: n.slice(0, 20), grade } });
    setName('');
    ref.current?.focus();
  };
  return (
    <>
      <Card>
        <Label>Type a player</Label>
        <form onSubmit={e => { e.preventDefault(); add(); }}>
          <input ref={ref} className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Name, then Add"
            maxLength={20} enterKeyHint="send" autoComplete="off" autoCorrect="off" autoCapitalize="words" />
          <div className="chips" style={{ marginTop: 10 }}>
            {GRADES.map(g => <Chip key={g} on={grade === g} onClick={() => { setGrade(g); ref.current?.focus(); }} style={{ flex: '1 0 30%' }}>Class {g}</Chip>)}
          </div>
          <div className="hint">Class only mixes the teams. It does not change any score.</div>
          <Btn type="submit" tone="good" size="lg" keepFocus style={{ width: '100%', marginTop: 10 }}>Add player</Btn>
        </form>
      </Card>
      <TeamCount />
      {state.players.length > 0 && (
        <Fold title={`Everyone so far (${state.players.length})`} hint="Tap a name to remove it">
          <div className="hint" style={{ marginTop: 0, marginBottom: 10 }}>
            {GRADES.map(g => ({ g, n: state.players.filter(p => p.grade === g).length })).filter(x => x.n > 0).map(x => `Class ${x.g}: ${x.n}`).join(' · ')}
          </div>
          <div className="chips">
            {[...state.players].reverse().map(p => (
              <button key={p.id} type="button" className="namechip" onClick={() => send({ type: 'REMOVE_PLAYER', playerId: p.id })} aria-label={`Remove ${p.name}`}>
                <span className={`grade grade-${p.grade}`}>{p.grade}</span>{p.name}<span className="x">×</span>
              </button>
            ))}
          </div>
        </Fold>
      )}
    </>
  );
}

// ---------- Teams ----------
export function TeamsPanel() {
  const { state, send } = useA();
  const { players, teams, settings } = state;
  const made = teams.length > 0;
  return (
    <>
      {!made && <TeamCount />}
      {made && (
        <>
          {teams.map(t => <TeamPreview key={t.id} team={t} />)}
          <Btn tone="soft" size="lg" disabled={players.length < settings.teamCount} onClick={() => send({ type: 'MAKE_TEAMS', teams: makeTeams(players, settings.teamCount) })} style={{ width: '100%' }}>Shuffle the teams again</Btn>
          {teams.length !== settings.teamCount && <div className="hint hint-warn">The big screen has {teams.length} teams but the setting says {settings.teamCount}. Shuffle to match.</div>}
        </>
      )}
    </>
  );
}

function TeamPreview({ team }: { team: Team }) {
  const c = TEAM_COLORS[team.colorIndex % TEAM_COLORS.length];
  return (
    <Card>
      <div className="row"><TeamDot team={team} /><b className="grow">{team.name}</b><span className="sub">{team.members.length} kids</span></div>
      <div className="chips" style={{ marginTop: 8 }}>
        {team.members.map(m => <span key={m.playerId} className="mchip" style={{ background: c.shades[m.shade % 5] }}>{m.name}</span>)}
      </div>
    </Card>
  );
}

// ---------- Roles ----------
function missingRoles(team: Team): RoleId[] {
  const plan = ROLE_PLAN[Math.max(3, Math.min(5, team.members.length))] ?? ROLE_PLAN[4];
  return plan.flat().filter(r => !team.members.some(m => m.roles.includes(r)));
}

export function RolesPanel() {
  const { state, send } = useA();
  const { teams } = state;
  const suggest = (t: Team) => suggestRoles(t).forEach(r => send({ type: 'SET_ROLES', teamId: t.id, playerId: r.playerId, roles: r.roles }));
  const toggle = (t: Team, playerId: string, role: RoleId) => {
    const me = t.members.find(m => m.playerId === playerId);
    if (!me) return;
    if (me.roles.includes(role)) { send({ type: 'SET_ROLES', teamId: t.id, playerId, roles: me.roles.filter(r => r !== role) }); return; }
    t.members.forEach(m => { if (m.playerId !== playerId && m.roles.includes(role)) send({ type: 'SET_ROLES', teamId: t.id, playerId: m.playerId, roles: m.roles.filter(r => r !== role) }); });
    send({ type: 'SET_ROLES', teamId: t.id, playerId, roles: [...me.roles, role] });
  };
  if (!teams.length) return null;
  return (
    <>
      <Btn tone="soft" size="lg" onClick={() => teams.forEach(suggest)} style={{ width: '100%' }}>Fill every team’s roles for them</Btn>
      {teams.map(t => {
        const miss = missingRoles(t);
        return (
          <Fold key={t.id} title={t.name} hint={miss.length ? `Missing ${miss.map(r => SHORT[r]).join(', ')}` : 'All roles covered'}>
            <div className="stack">
              {t.members.map(m => (
                <div key={m.playerId}>
                  <div className="mrow-name">{m.name}</div>
                  <div className="chips">
                    {ROLE_IDS.map(r => <Chip key={r} on={m.roles.includes(r)} onClick={() => toggle(t, m.playerId, r)}>{SHORT[r]}</Chip>)}
                  </div>
                </div>
              ))}
              <Btn tone="soft" onClick={() => suggest(t)}>Suggest roles for this team</Btn>
            </div>
          </Fold>
        );
      })}
    </>
  );
}

// ---------- Products ----------
export function ProductsPanel() {
  const { state, send } = useA();
  const [open, setOpen] = useState<string | null>(null);
  const { teams } = state;
  if (!teams.length) return null;
  const free = availableProducts(state);
  const nextSpin = teams.find(t => !t.productId);
  return (
    <Card className="list">
      {teams.map(t => {
        const p = productById(t.productId);
        return (
          <TeamLine key={t.id} team={t} hot={nextSpin?.id === t.id}
            right={<Btn tone={p ? 'soft' : 'sun'} onClick={() => setOpen(open === t.id ? null : t.id)}>{p ? 'Change' : 'Pick for them'}</Btn>}
            below={
              <>
                <div className="sub">{p ? `${p.icon} ${p.name}` : nextSpin?.id === t.id ? 'Spinning next on the big screen' : 'Waiting for the wheel'}</div>
                {open === t.id && (
                  <div className="pgrid">
                    {free.length === 0 && <div className="empty">No free products left.</div>}
                    {free.map(f => (
                      <Btn key={f.id} tone="soft" onClick={() => { send({ type: 'SET_PRODUCT', teamId: t.id, productId: f.id }); setOpen(null); }} style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                        {f.icon} {f.name}
                      </Btn>
                    ))}
                  </div>
                )}
              </>
            } />
        );
      })}
      <div className="hint center">{free.length} of {PRODUCTS.length} products still free</div>
    </Card>
  );
}

// ---------- Names ----------
const FUN = ['Rocket Rangers', 'Turbo Tigers', 'Cosmic Champs', 'Pixel Pandas', 'Lightning Labs', 'Jugaad Jets', 'Cosmic Cubs', 'Maker Mavericks', 'Desi Dragons', 'Bolt Buddies', 'Mighty Monkeys', 'Techistan Titans', 'Pixel Pilots', 'Zoom Zebras', 'Spark Squad', 'Brain Bhai'];

export function NamesPanel() {
  const { state, send } = useA();
  const [seed, setSeed] = useState(0);
  const { teams } = state;
  if (!teams.length) return null;
  const ideas = (t: Team, i: number): string[] => {
    const p = productById(t.productId);
    const out = [FUN[(i * 3 + seed * 5) % FUN.length], FUN[(i * 3 + seed * 5 + 7) % FUN.length]];
    if (p) out.unshift(`${p.name} Heroes`);
    return out;
  };
  return (
    <>
      {teams.map((t, i) => (
        <Card key={t.id}>
          <div className="row"><TeamDot team={t} /><div className="grow"><CommitInput value={isDefaultName(t.name) ? '' : t.name} placeholder={`Name for team ${i + 1}`} onCommit={v => v && send({ type: 'SET_TEAM_NAME', teamId: t.id, name: v })} /></div></div>
          <div className="chips" style={{ marginTop: 8 }}>
            {ideas(t, i).map(n => <Chip key={n} onClick={() => send({ type: 'SET_TEAM_NAME', teamId: t.id, name: n })}>{n}</Chip>)}
          </div>
        </Card>
      ))}
      <Btn tone="soft" onClick={() => setSeed(seed + 1)} style={{ alignSelf: 'flex-start' }}>Show other name ideas</Btn>
    </>
  );
}

