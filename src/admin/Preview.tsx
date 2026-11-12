// DEV ONLY. Builds realistic fake game states with the real engine so each admin panel can be checked on its own.
// Open /#/admin-preview?step=auction&phase=bidding   (step = a SCRIPT id, phase = optional sub-phase, teams=4|6)
import { useMemo, useRef, useState } from 'react';
import { PRODUCTS, SCRIPT } from '../game/content';
import { initialState, reduce } from '../game/engine';
import { makeTeams, suggestRoles } from '../game/helpers';
import type { Action, GameState, Grade } from '../game/types';
import type { Send } from './ctx';
import Shell from './Shell';

const NAMES = ['Aarav', 'Diya', 'Kabir', 'Ananya', 'Vihaan', 'Isha', 'Rohan', 'Meera', 'Arjun', 'Saanvi', 'Yash', 'Tara', 'Dev', 'Riya', 'Neel', 'Kiara', 'Om', 'Anvi', 'Veer', 'Siya', 'Reyaan', 'Myra', 'Atharv', 'Pari'];
const TEAM_NAMES = ['Rocket Rangers', 'Cosmic Champs', 'Pixel Pandas', 'Turbo Tigers', 'Jugaad Jets', 'Spark Squad'];

function params() {
  const h = location.hash;
  const q = new URLSearchParams(h.includes('?') ? h.slice(h.indexOf('?') + 1) : location.search);
  return { step: q.get('step') ?? 'players', phase: q.get('phase'), teams: q.get('teams') === '6' ? 6 : 4 } as const;
}

export function build(stepId: string, phase: string | null, teamCount: 4 | 6): GameState {
  let s = initialState();
  const d = (a: Action) => { s = reduce(s, a); };
  const target = Math.max(0, SCRIPT.findIndex(x => x.id === stepId));
  const idx = (id: string) => SCRIPT.findIndex(x => x.id === id);
  d({ type: 'SET_SETTING', key: 'teamCount', value: teamCount });

  const nPlayers = stepId === 'players' ? 9 : teamCount === 6 ? 24 : 18;
  NAMES.slice(0, nPlayers).forEach((n, i) => d({ type: 'ADD_PLAYER', player: { id: `p${i}`, name: n, grade: (5 + (i % 6)) as Grade } }));
  if (target > idx('players') || (stepId === 'teams' && phase === 'made')) d({ type: 'MAKE_TEAMS', teams: makeTeams(s.players, teamCount) });
  if (target > idx('roles')) s.teams.forEach(t => suggestRoles(t).forEach(r => d({ type: 'SET_ROLES', teamId: t.id, playerId: r.playerId, roles: r.roles })));
  if (stepId === 'roles') {
    s.teams.slice(0, 1).forEach(t => suggestRoles(t).forEach(r => d({ type: 'SET_ROLES', teamId: t.id, playerId: r.playerId, roles: r.roles })));
    const t2 = s.teams[1];
    if (t2) suggestRoles(t2).slice(0, 2).forEach(r => d({ type: 'SET_ROLES', teamId: t2.id, playerId: r.playerId, roles: r.roles }));
  }
  if (target > idx('products')) s.teams.forEach((t, i) => d({ type: 'SET_PRODUCT', teamId: t.id, productId: PRODUCTS[i * 2 % PRODUCTS.length].id }));
  if (stepId === 'products') s.teams.slice(0, 2).forEach((t, i) => d({ type: 'SET_PRODUCT', teamId: t.id, productId: PRODUCTS[i * 3].id }));
  if (target > idx('names')) s.teams.forEach((t, i) => d({ type: 'SET_TEAM_NAME', teamId: t.id, name: TEAM_NAMES[i] }));
  if (stepId === 'names') s.teams.slice(0, 1).forEach((t, i) => d({ type: 'SET_TEAM_NAME', teamId: t.id, name: TEAM_NAMES[i] }));
  if (target > idx('howto')) {
    s.teams.forEach((t, i) => {
      d({ type: 'ADJUST', teamId: t.id, field: 'customers', delta: i * 4 - 1 });
      d({ type: 'ADJUST', teamId: t.id, field: 'happiness', delta: 6 - i * 2 });
      d({ type: 'ADJUST', teamId: t.id, field: 'coins', delta: 40 - i * 55 });
    });
  }
  if (stepId === 'awards') {
    const ids0 = s.teams.map(t => t.id);
    ids0.forEach((pid, i) => ids0.filter(v => v !== pid).forEach((v, k) => d({ type: 'VOTE', pitcherId: pid, voterId: v, stars: 2 + ((i * 2 + k) % 4) })));
  }
  d({ type: 'JUMP', stepIndex: target });
  const kind = SCRIPT[target].kind;
  const next = () => d({ type: 'NEXT' });
  const ids = () => s.teams.map(t => t.id);
  const until = (pred: () => boolean) => { for (let i = 0; i < 40 && !pred(); i++) next(); };
  const ph = () => (s.step as { phase?: string }).phase;

  if (kind === 'question' || kind === 'price' || kind === 'megaorder') {
    const p = phase ?? 'intro';
    if (p !== 'intro') {
      next(); // open
      const lockN = p === 'open' ? 2 : 99;
      ids().slice(0, lockN).forEach((id, i) => d({ type: 'LOCK', teamId: id, choice: kind === 'price' ? 30 + i * 20 : kind === 'megaorder' ? [0, 0, 1, 2, 3, 0][i] : i % 4 }));
      if (p !== 'open') until(() => ph() === p);
    }
  } else if (kind === 'auction') {
    const p = phase ?? 'intro';
    if (p !== 'intro') {
      next();
      const [a, b] = ids();
      // Jhootu counter-bids inside the engine after each team bid, so only team bids are sent here.
      d({ type: 'BID', by: a, amount: 30 }); d({ type: 'BID', by: b, amount: 60 });
      if (p === 'sold') next();
      if (p === 'bidding2') { next(); next(); d({ type: 'BID', by: ids()[2], amount: 30 }); }
    }
  } else if (kind === 'bugsmash') {
    const p = phase ?? 'intro';
    if (p !== 'intro') {
      next();
      if (p === 'playing' || p === 'result') d({ type: 'BUG_START' });
      if (p === 'result') d({ type: 'BUG_RESULT', teamId: ids()[0], bugs: 23 });
    }
  } else if (kind === 'mood') {
    if (phase === 'team') next();
  } else if (kind === 'mic') {
    if (phase === 'picked') d({ type: 'MIC_PICK', teamId: ids()[1] });
  } else if (kind === 'pitch') {
    const p = phase ?? 'ready';
    if (p !== 'ready') next();
    if (p === 'voting') {
      next();
      const [a, b, c] = ids();
      d({ type: 'VOTE', pitcherId: a, voterId: b, stars: 4 }); d({ type: 'VOTE', pitcherId: a, voterId: c, stars: 5 });
    }
  } else if (kind === 'awards') {
    for (let i = 0; i < (phase ? parseInt(phase, 10) : 2); i++) next();
  }
  return s;
}

export default function Preview() {
  const p = useMemo(params, []);
  const initial = useMemo(() => build(p.step, p.phase, p.teams), [p]);
  const [state, setState] = useState(initial);
  const ref = useRef(initial);
  const past = useRef<GameState[]>([]);
  const send: Send = a => {
    const cur = ref.current;
    let nxt: GameState;
    if (a.type === 'UNDO') { const prev = past.current.pop(); if (!prev) return; nxt = prev; }
    else { nxt = reduce(cur, a); if (nxt === cur) return; past.current.push(cur); }
    ref.current = nxt;
    setState(nxt);
  };
  return <Shell state={state} send={send} room="PREV" connected />;
}
