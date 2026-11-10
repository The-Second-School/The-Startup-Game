// Pure game engine: (state, action) -> state. No randomness inside: callers pass random picks in actions.

import {
  AUCTION_OPEN, AUCTION_RESERVE, AUCTION_TICKETS, AWARDS, BUG, MEGA, METER_MAX, MOOD, PAIR_TALK_MS, PITCH_MS, PRICE,
  PRODUCTS, QUESTIONS, SCRIPT, START, STAGES, SUCCESS_DIVISOR, TALK_MS, productById,
} from './content';
import type {
  Action, AwardResult, Deltas, GameState, HistoryEntry, Step, StepState, Team,
} from './types';

// ---------- Selectors ----------

export const currentStep = (s: GameState): Step => SCRIPT[s.stepIndex];

export function success(t: Team): number {
  const raw = ((t.customers + t.happiness) * t.coins) / SUCCESS_DIVISOR;
  return Math.max(0, Math.min(100, Math.round(raw)));
}
export function stageOf(t: Team) {
  const v = success(t);
  return STAGES.find(st => v >= st.min && v <= st.max) ?? STAGES[0];
}
// Banana Peel (lowest wins). Hidden from the screen. Coins scaled down so they don't drown the meters; each rAIvan trick costs 5.
export const startupHealth = (t: Team) => Math.round(t.coins / 8) + t.customers + t.happiness - 5 * t.history.filter(h => h.trap).length;

export const teamById = (s: GameState, id: string | null | undefined) => s.teams.find(t => t.id === id) ?? null;
export const fill = (text: string, t: Team) =>
  text.replaceAll('{team}', t.name || 'This team').replaceAll('{product}', productById(t.productId)?.name ?? 'their product');

/** Most a team may bid in the auction (keeps a safety reserve so nobody goes broke). */
export const maxBid = (t: Team) => Math.max(0, t.coins - AUCTION_RESERVE);

export function canAfford(t: Team, coinsDelta: number) {
  return coinsDelta >= 0 || t.coins + coinsDelta >= 0;
}

/** Ranked list for one meter (for the live leaderboards). */
export function ranked(s: GameState, field: 'customers' | 'happiness' | 'coins') {
  return [...s.teams].sort((a, b) => b[field] - a[field]);
}

/** One short line per team about their last move, for act intros ("story so far"). */
export function recapLines(s: GameState): { teamId: string; icon: string; text: string }[] {
  return s.teams.map(t => {
    const last = [...t.history].reverse().find(h => h.act > 0);
    return { teamId: t.id, icon: last?.icon ?? '🌱', text: last ? last.story : `${t.name || 'This team'} is ready to start!` };
  });
}

export function averageVote(s: GameState, teamId: string): number {
  const v = Object.values(s.votes[teamId] ?? {});
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
}

// ---------- Helpers ----------

const clampMeter = (n: number) => Math.max(0, Math.min(METER_MAX, n));
const zero = (): Deltas => ({ coins: 0, customers: 0, happiness: 0 });

function applyDeltas(t: Team, d: Deltas, entry: Omit<HistoryEntry, 'deltas'> | null): Team {
  const customers = clampMeter(t.customers + d.customers);
  const happiness = clampMeter(t.happiness + d.happiness);
  const coins = Math.max(0, t.coins + d.coins);
  const real: Deltas = { coins: coins - t.coins, customers: customers - t.customers, happiness: happiness - t.happiness };
  return {
    ...t, customers, happiness, coins,
    history: entry ? [...t.history, { ...entry, deltas: real }] : t.history,
  };
}

function patchTeam(s: GameState, id: string, fn: (t: Team) => Team): GameState {
  return { ...s, teams: s.teams.map(t => (t.id === id ? fn(t) : t)) };
}

export function initialState(): GameState {
  return {
    version: 1,
    stepIndex: 0,
    step: { type: 'none' },
    players: [],
    teams: [],
    settings: { teamCount: 4, sound: true, voice: false },
    timer: { running: false, endsAt: null, remaining: 0, total: 0 },
    micPicked: [],
    votes: {},
    updatedAt: Date.now(),
  };
}

export function newTeamStats() {
  return { customers: START.customers, happiness: START.happiness, coins: START.coins, history: [] as HistoryEntry[] };
}

/** Teams that a question applies to, in screen order. */
const order = (s: GameState) => s.teams.map(t => t.id);

function enterStep(s: GameState, index: number): GameState {
  const step = SCRIPT[Math.max(0, Math.min(SCRIPT.length - 1, index))];
  const base: GameState = { ...s, stepIndex: SCRIPT.indexOf(step), timer: { running: false, endsAt: null, remaining: 0, total: 0 } };
  let st: StepState = { type: 'none' };
  switch (step.kind) {
    case 'scene': st = { type: 'scene', beat: 0 }; break;
    case 'question': st = { type: 'question', phase: 'intro', selectedTeamId: null, locks: {}, pending: {}, stories: {}, spotlight: 0 }; break;
    case 'price': st = { type: 'price', phase: 'intro', selectedTeamId: null, locks: {}, pending: {}, stories: {}, verdict: {}, spotlight: 0 }; break;
    case 'bugsmash': st = { type: 'bugsmash', phase: 'intro', turn: 0, turnPhase: 'ready', results: {} }; break;
    case 'auction': {
      const n = Math.max(1, Math.min(AUCTION_TICKETS.length, Math.ceil(s.teams.length / 2)));
      st = { type: 'auction', phase: 'intro', tickets: AUCTION_TICKETS.slice(0, n), ticket: 0, bid: { by: 'raivan', amount: AUCTION_OPEN }, bidLog: [], winners: {} };
      break;
    }
    case 'megaorder': {
      // Pair strongest with weakest so the team-up mixes the room and helps comebacks.
      const sorted = [...s.teams].sort((a, b) => success(b) - success(a)).map(t => t.id);
      const pairs: [string, string][] = [];
      while (sorted.length >= 2) pairs.push([sorted.shift()!, sorted.pop()!]);
      // Odd number of teams: the middle team has no partner and gets a fair solo order instead (see MEGA.solo).
      st = { type: 'megaorder', phase: 'intro', pairs, solo: sorted[0], selectedTeamId: null, locks: {}, outcomes: {}, pending: {}, spotlight: 0 };
      break;
    }
    case 'mood': {
      const pending: Record<string, { customers: number; kind: 'left' | 'joined' | 'same' }> = {};
      for (const t of s.teams) {
        const gap = t.customers - t.happiness;
        let c = 0;
        if (gap >= 10) c = MOOD.rules[0].customers;
        else if (gap >= 1) c = MOOD.rules[1].customers;
        else if (gap <= -10) c = MOOD.rules[2].customers;
        pending[t.id] = { customers: c, kind: c < 0 ? 'left' : c > 0 ? 'joined' : 'same' };
      }
      st = { type: 'mood', phase: 'intro', index: 0, pending };
      break;
    }
    case 'mic': st = { type: 'mic', phase: 'spin', teamId: null }; break;
    case 'pitch': st = { type: 'pitch', index: 0, phase: 'ready' }; break;
    case 'awards': st = { type: 'awards', reveal: 0, results: computeAwards(s) }; break;
    default: st = { type: 'none' };
  }
  return { ...base, step: st };
}

// ---------- Reveal computations ----------

function computeQuestionReveal(s: GameState, qId: string) {
  const q = QUESTIONS[qId];
  const pending: Record<string, Deltas> = {};
  const stories: Record<string, string> = {};
  const st = s.step as Extract<StepState, { type: 'question' }>;
  for (const t of s.teams) {
    const idx = st.locks[t.id];
    if (idx === undefined) {
      pending[t.id] = zero();
      stories[t.id] = `${t.name} fell asleep and didn’t lock anything 😴`;
      continue;
    }
    const o = q.options[idx];
    let customers = o.customers;
    let story = o.story;
    if (o.ifHappinessAtLeast !== undefined && t.happiness < o.ifHappinessAtLeast) {
      customers = o.elseCustomers ?? 0;
      story = o.elseStory ?? story;
    }
    pending[t.id] = { coins: o.coins, customers, happiness: o.happiness };
    stories[t.id] = fill(story, t);
  }
  return { pending, stories };
}

function priceVerdict(price: number, best: number) {
  const off = Math.abs(price - best);
  const tier = PRICE.tiers.find(x => off <= x.off)!;
  const verdict: 'right' | 'close' | 'high' | 'low' = tier.verdict ?? (price > best ? 'high' : 'low');
  return { tier, verdict };
}

function computeMega(s: GameState) {
  const st = s.step as Extract<StepState, { type: 'megaorder' }>;
  const pending: Record<string, Deltas> = {};
  const outcomes: Record<string, { kind: 'equal' | 'split' | 'nodeal' | 'broken'; text: string }> = {};
  st.pairs.forEach(([a, b], i) => {
    const la = st.locks[a], lb = st.locks[b];
    let kind: 'equal' | 'split' | 'nodeal' | 'broken' = 'broken';
    if (la === 3 || lb === 3) kind = 'nodeal';
    else if (la === 0 && lb === 0) kind = 'equal';
    else if ((la === 1 && lb === 2) || (la === 2 && lb === 1)) kind = 'split';
    if (kind === 'equal') {
      pending[a] = { coins: MEGA.equal.coins, customers: MEGA.equal.customers, happiness: MEGA.equal.happiness };
      pending[b] = { ...pending[a] };
    } else if (kind === 'split') {
      const big = la === 1 ? a : b, small = la === 1 ? b : a;
      pending[big] = { coins: MEGA.big.coins, customers: MEGA.big.customers, happiness: 0 };
      pending[small] = { coins: MEGA.small.coins, customers: MEGA.small.customers, happiness: 0 };
    } else if (kind === 'nodeal') {
      pending[a] = { coins: 0, customers: MEGA.noDeal.customers, happiness: 0 };
      pending[b] = { ...pending[a] };
    } else {
      pending[a] = { coins: 0, customers: 0, happiness: MEGA.broken.happiness };
      pending[b] = { ...pending[a] };
    }
    outcomes[i] = { kind, text: MEGA.text[kind] };
  });
  if (st.solo) pending[st.solo] = { coins: MEGA.solo.coins, customers: MEGA.solo.customers, happiness: 0 };
  return { pending, outcomes };
}

// ---------- Awards ----------

export function computeAwards(s: GameState): AwardResult[] {
  const teams = s.teams;
  if (!teams.length) return [];
  const tieBreak = (a: Team, b: Team) => b.happiness - a.happiness || b.coins - a.coins || teams.indexOf(a) - teams.indexOf(b);
  const champ = teams.slice().sort((a, b) => success(b) - success(a) || tieBreak(a, b))[0];

  // Awards 2 to 4 go to different teams (and not the champion) whenever there are 4 or more teams.
  // Each award goes to the team that ranks best for it, with no team winning twice: brute force the best match.
  const metrics: ((t: Team) => number)[] = [t => averageVote(s, t.id), t => t.happiness, t => t.customers]; // pitch, happiness, customers
  const rankScore = metrics.map(m => teams.map(t => teams.filter(o => m(o) < m(t)).length));
  let best: number[] = [], bestScore = -Infinity;
  const idx = teams.map((_, i) => i);
  for (const a of idx) for (const b of idx) for (const c of idx) {
    const pick3 = [a, b, c];
    const used = [teams.indexOf(champ), ...pick3];
    const dups = used.length - new Set(used).size;
    const score = rankScore[0][a] + rankScore[1][b] + rankScore[2][c] - 100 * dups;
    if (score > bestScore) { bestScore = score; best = pick3; }
  }
  const pitch = teams[best[0]], happy = teams[best[1]], cust = teams[best[2]];
  const contenders = teams.filter(t => t.id !== champ.id);
  const banana = (contenders.length ? contenders : teams).slice().sort((a, b) => startupHealth(a) - startupHealth(b) || teams.indexOf(a) - teams.indexOf(b))[0];

  const bananaWhy = (t: Team): string[] => {
    const lines: string[] = [];
    const traps = t.history.filter(h => h.trap).length;
    if (traps) lines.push(`Trusted rAIvan ${traps === 1 ? 'once' : `${traps} times`} 😈`);
    const worst = t.history.slice().sort((a, b) => (a.deltas.customers + a.deltas.happiness) - (b.deltas.customers + b.deltas.happiness))[0];
    if (worst && worst.deltas.customers + worst.deltas.happiness < 0) lines.push(`Biggest slip: “${worst.label}” (${worst.deltas.customers + worst.deltas.happiness} points)`);
    const spent = t.history.reduce((a, h) => a + Math.min(0, h.deltas.coins), 0);
    if (spent < 0) lines.push(`Spent ${-spent} coins along the way 🪙`);
    lines.push(`Ended with ${t.coins} coins, ${t.customers} customers and ${t.happiness} happiness`);
    return lines.slice(0, 3);
  };

  return [
    { rank: 5, id: 'banana', title: AWARDS.banana.title, icon: AWARDS.banana.icon, teamId: banana.id, why: bananaWhy(banana) },
    { rank: 4, id: 'pitch', title: AWARDS.pitch.title, icon: AWARDS.pitch.icon, teamId: pitch.id, why: [`${averageVote(s, pitch.id).toFixed(1)} ⭐ average from the other teams`] },
    { rank: 3, id: 'customer', title: AWARDS.customer.title, icon: AWARDS.customer.icon, teamId: cust.id, why: [`${cust.customers} customers`] },
    { rank: 2, id: 'happiness', title: AWARDS.happiness.title, icon: AWARDS.happiness.icon, teamId: happy.id, why: [`${happy.happiness} happiness`] },
    { rank: 1, id: 'champion', title: AWARDS.champion.title, icon: AWARDS.champion.icon, teamId: champ.id, why: [`Success ${success(champ)} out of 100`, `${champ.customers} 👥 · ${champ.happiness} 😊 · ${champ.coins} 🪙`] },
  ];
}

// ---------- NEXT: advance sub-phase, else next step ----------

function next(s: GameState): GameState {
  const step = currentStep(s);
  const st = s.step;
  const ids = order(s);
  const go = () => enterStep(s, s.stepIndex + 1);

  switch (st.type) {
    case 'scene': {
      if (step.kind !== 'scene') return go();
      return go(); // scenes auto-play beats on screen; NEXT skips to the next step
    }
    case 'question':
    case 'price': {
      if (st.phase === 'intro') return { ...s, step: { ...st, phase: 'open' }, timer: startTimer(TALK_MS) };
      if (st.phase === 'open') {
        if (st.type === 'question' && step.kind === 'question') {
          const { pending, stories } = computeQuestionReveal(s, step.qId);
          return { ...s, step: { ...st, phase: 'revealed', pending, stories, selectedTeamId: null }, timer: stopTimer() };
        }
        if (st.type === 'price') {
          const pending: Record<string, Deltas> = {}, stories: Record<string, string> = {};
          const verdict: Record<string, 'right' | 'close' | 'high' | 'low'> = {};
          for (const t of s.teams) {
            const p = st.locks[t.id];
            const best = productById(t.productId)?.bestPrice ?? 50;
            if (p === undefined) { pending[t.id] = zero(); stories[t.id] = `${t.name} forgot to set a price 😴`; verdict[t.id] = 'low'; continue; }
            const { tier, verdict: v } = priceVerdict(p, best);
            pending[t.id] = { coins: tier.coins, customers: 0, happiness: tier.happiness };
            verdict[t.id] = v;
            stories[t.id] = PRICE.text[v];
          }
          return { ...s, step: { ...st, phase: 'revealed', pending, stories, verdict, selectedTeamId: null }, timer: stopTimer() };
        }
      }
      if (st.phase === 'revealed') return applySpotlight({ ...s, step: { ...st, phase: 'spotlight', spotlight: 0 } }, 0);
      if (st.phase === 'spotlight') {
        if (st.spotlight + 1 < ids.length) return applySpotlight({ ...s, step: { ...st, spotlight: st.spotlight + 1 } }, st.spotlight + 1);
        return { ...s, step: { ...st, phase: 'done' } };
      }
      return go();
    }
    case 'bugsmash': {
      if (st.phase === 'intro') return { ...s, step: { ...st, phase: 'turn', turn: 0, turnPhase: 'ready' } };
      if (st.phase === 'turn') {
        if (st.turnPhase === 'ready') return s; // screen starts the round with BUG_START
        if (st.turnPhase === 'playing') return s;
        if (st.turn + 1 < ids.length) return { ...s, step: { ...st, turn: st.turn + 1, turnPhase: 'ready' } };
        return { ...s, step: { ...st, phase: 'done' } };
      }
      return go();
    }
    case 'auction': {
      if (st.phase === 'intro') return { ...s, step: { ...st, phase: 'bidding' } };
      if (st.phase === 'bidding') return sold(s);
      if (st.phase === 'sold') {
        if (st.ticket + 1 < st.tickets.length) return { ...s, step: { ...st, phase: 'bidding', ticket: st.ticket + 1, bid: { by: 'raivan', amount: AUCTION_OPEN }, bidLog: [] } };
        return { ...s, step: { ...st, phase: 'done' } };
      }
      return go();
    }
    case 'megaorder': {
      if (st.phase === 'intro') return { ...s, step: { ...st, phase: 'open' }, timer: startTimer(PAIR_TALK_MS) };
      if (st.phase === 'open') {
        const { pending, outcomes } = computeMega(s);
        return { ...s, step: { ...st, phase: 'revealed', pending, outcomes, selectedTeamId: null }, timer: stopTimer() };
      }
      if (st.phase === 'revealed') return applyPair({ ...s, step: { ...st, phase: 'spotlight', spotlight: 0 } }, 0);
      if (st.phase === 'spotlight') {
        if (st.spotlight + 1 < st.pairs.length) return applyPair({ ...s, step: { ...st, spotlight: st.spotlight + 1 } }, st.spotlight + 1);
        return applySolo({ ...s, step: { ...st, phase: 'done' } });
      }
      return go();
    }
    case 'mood': {
      if (st.phase === 'intro') return applyMood({ ...s, step: { ...st, phase: 'team', index: 0 } }, 0);
      if (st.phase === 'team') {
        if (st.index + 1 < ids.length) return applyMood({ ...s, step: { ...st, index: st.index + 1 } }, st.index + 1);
        return { ...s, step: { ...st, phase: 'done' } };
      }
      return go();
    }
    case 'mic': {
      if (st.phase === 'picked') return { ...s, step: { ...st, phase: 'done' } };
      if (st.phase === 'spin') return s; // screen spins the wheel and sends MIC_PICK
      return go();
    }
    case 'pitch': {
      if (st.phase === 'ready') return { ...s, step: { ...st, phase: 'talking' }, timer: startTimer(PITCH_MS) };
      if (st.phase === 'talking') return { ...s, step: { ...st, phase: 'voting' }, timer: stopTimer() };
      if (st.phase === 'voting') {
        if (st.index + 1 < ids.length) return { ...s, step: { ...st, index: st.index + 1, phase: 'ready' } };
        return { ...s, step: { ...st, phase: 'done' } };
      }
      return go();
    }
    case 'awards': {
      if (st.reveal < st.results.length) return { ...s, step: { ...st, reveal: st.reveal + 1 } };
      return go();
    }
    default:
      return go();
  }
}

function startTimer(ms: number) {
  const now = Date.now();
  return { running: true, endsAt: now + ms, remaining: ms, total: ms };
}
function stopTimer() { return { running: false, endsAt: null, remaining: 0, total: 0 }; }

function applySpotlight(s: GameState, i: number): GameState {
  const st = s.step as Extract<StepState, { type: 'question' | 'price' }>;
  const team = s.teams[i];
  if (!team) return s;
  const d = st.pending[team.id] ?? zero();
  const step = currentStep(s);
  let entry: Omit<HistoryEntry, 'deltas'>;
  if (st.type === 'question' && step.kind === 'question') {
    const q = QUESTIONS[step.qId];
    const idx = st.locks[team.id];
    const o = idx !== undefined ? q.options[idx] : null;
    entry = { stepId: step.id, act: q.act, icon: o?.icon ?? '😴', label: o?.label ?? 'Fell asleep', story: st.stories[team.id], trap: !!o?.trap };
  } else {
    const p = (st as Extract<StepState, { type: 'price' }>).locks[team.id];
    entry = { stepId: 'price', act: 4, icon: '🏷️', label: p ? `Price ₹${p}` : 'No price', story: st.stories[team.id] };
  }
  return patchTeam(s, team.id, t => applyDeltas(t, d, entry));
}

function applyPair(s: GameState, i: number): GameState {
  const st = s.step as Extract<StepState, { type: 'megaorder' }>;
  const pair = st.pairs[i];
  if (!pair) return s;
  let out = s;
  for (const id of pair) {
    const d = st.pending[id] ?? zero();
    const o = st.outcomes[i];
    out = patchTeam(out, id, t => applyDeltas(t, d, { stepId: 'mega', act: 5, icon: o.kind === 'equal' ? '🤝' : o.kind === 'broken' ? '💔' : '📦', label: 'Mega Order', story: o.text }));
  }
  return out;
}

/** The team without a partner (odd team count) gets its solo order when the pairs are finished. */
function applySolo(s: GameState): GameState {
  const st = s.step as Extract<StepState, { type: 'megaorder' }>;
  const id = st.solo;
  const team = teamById(s, id);
  if (!id || !team) return s;
  const d = st.pending[id] ?? zero();
  return patchTeam(s, id, t => applyDeltas(t, d, { stepId: 'mega', act: 5, icon: '📦', label: 'Solo order', story: fill(MEGA.text.solo, t) }));
}

function applyMood(s: GameState, i: number): GameState {
  const st = s.step as Extract<StepState, { type: 'mood' }>;
  const team = s.teams[i];
  if (!team) return s;
  const m = st.pending[team.id];
  if (!m || m.customers === 0) return s;
  const step = currentStep(s);
  const act = 'act' in step ? step.act : 0;
  const story = m.kind === 'left' ? MOOD.text.left(-m.customers) : MOOD.text.joined(m.customers);
  return patchTeam(s, team.id, t => applyDeltas(t, { coins: 0, customers: m.customers, happiness: 0 }, { stepId: step.id, act, icon: m.kind === 'left' ? '😢' : '🥳', label: 'Customer mood', story }));
}

function sold(s: GameState): GameState {
  const st = s.step as Extract<StepState, { type: 'auction' }>;
  const ticket = st.tickets[st.ticket];
  let out: GameState = { ...s, step: { ...st, phase: 'sold', winners: { ...st.winners, [ticket.id]: st.bid } } };
  if (st.bid.by !== 'raivan') {
    out = patchTeam(out, st.bid.by, t => applyDeltas(t, { ...ticket.deltas, coins: -st.bid.amount }, {
      stepId: 'auction', act: 3, icon: ticket.icon, label: `Won: ${ticket.title}`, story: `${t.name} won the ${ticket.title} for ${st.bid.amount} coins! ${ticket.icon}`,
    }));
  }
  return out;
}

// ---------- Reducer ----------

export function reduce(s: GameState, a: Action): GameState {
  const out = reduceInner(s, a);
  return out === s ? s : { ...out, updatedAt: Date.now() };
}

function reduceInner(s: GameState, a: Action): GameState {
  const st = s.step;
  switch (a.type) {
    case 'NEXT': {
      // First entry: lobby has no state yet
      if (s.step.type === 'none' && s.stepIndex === 0 && SCRIPT[0].kind === 'lobby') return enterStep(s, 1);
      return next(s);
    }
    case 'JUMP': return enterStep(s, a.stepIndex);
    case 'RESET': return initialState();
    case 'SET_SETTING': return { ...s, settings: { ...s.settings, [a.key]: a.value } };
    case 'ADD_PLAYER': return s.players.some(p => p.id === a.player.id) ? s : { ...s, players: [...s.players, a.player] };
    case 'REMOVE_PLAYER': return { ...s, players: s.players.filter(p => p.id !== a.playerId) };
    case 'MAKE_TEAMS': return { ...s, teams: a.teams };
    case 'SET_ROLES': return patchTeam(s, a.teamId, t => ({ ...t, members: t.members.map(m => (m.playerId === a.playerId ? { ...m, roles: a.roles } : m)) }));
    case 'SET_PRODUCT': {
      if (s.teams.some(t => t.productId === a.productId && t.id !== a.teamId)) return s;
      if (!PRODUCTS.some(p => p.id === a.productId)) return s;
      return patchTeam(s, a.teamId, t => ({ ...t, productId: a.productId }));
    }
    case 'SET_TEAM_NAME': return patchTeam(s, a.teamId, t => ({ ...t, name: a.name.slice(0, 24) }));
    case 'SELECT_TEAM': {
      if (st.type === 'question' || st.type === 'price' || st.type === 'megaorder') {
        if (st.phase !== 'open') return s;
        return { ...s, step: { ...st, selectedTeamId: a.teamId } };
      }
      return s;
    }
    case 'LOCK': {
      if ((st.type === 'question' || st.type === 'price' || st.type === 'megaorder') && st.phase === 'open') {
        const team = teamById(s, a.teamId);
        if (!team) return s;
        if (st.type === 'question') {
          const step = currentStep(s);
          if (step.kind !== 'question') return s;
          const o = QUESTIONS[step.qId].options[a.choice];
          if (!o || !canAfford(team, o.coins)) return s;
        }
        if (st.type === 'megaorder' && (!Number.isInteger(a.choice) || a.choice < 0 || a.choice > 3)) return s;
        if (st.type === 'price' && (a.choice < PRICE.min || a.choice > PRICE.max || a.choice % PRICE.step !== 0)) return s;
        return { ...s, step: { ...st, locks: { ...st.locks, [a.teamId]: a.choice }, selectedTeamId: null } };
      }
      return s;
    }
    case 'CLEAR_LOCK': {
      if ((st.type === 'question' || st.type === 'price' || st.type === 'megaorder') && st.phase === 'open') {
        const locks = { ...st.locks };
        delete locks[a.teamId];
        return { ...s, step: { ...st, locks } };
      }
      return s;
    }
    case 'BUG_START': {
      if (st.type === 'bugsmash' && st.phase === 'turn' && st.turnPhase === 'ready') return { ...s, step: { ...st, turnPhase: 'playing' } };
      return s;
    }
    case 'BUG_RESULT': {
      if (st.type !== 'bugsmash' || st.phase !== 'turn' || st.turnPhase === 'result') return s;
      if (s.teams[st.turn]?.id !== a.teamId) return s;
      const tier = BUG.tiers.find(x => a.bugs >= x.min && a.bugs <= x.max)!;
      const out = { ...s, step: { ...st, turnPhase: 'result' as const, results: { ...st.results, [a.teamId]: a.bugs } } };
      return patchTeam(out, a.teamId, t => applyDeltas(t, { coins: 0, customers: 0, happiness: tier.happiness }, {
        stepId: 'bugsmash', act: 2, icon: '🐛', label: `Smashed ${a.bugs} bugs`, story: `${t.name} smashed ${a.bugs} bugs! ${tier.text}`,
      }));
    }
    case 'BID': {
      if (st.type !== 'auction' || st.phase !== 'bidding') return s;
      if (a.by !== 'raivan') {
        const team = teamById(s, a.by);
        if (!team || a.amount > maxBid(team)) return s;
        const already = Object.values(st.winners).some(w => w.by === a.by);
        if (already) return s;
      }
      if (a.amount <= st.bid.amount) return s;
      return { ...s, step: { ...st, bid: { by: a.by, amount: a.amount }, bidLog: [...st.bidLog, { by: a.by, amount: a.amount }] } };
    }
    case 'SOLD': return st.type === 'auction' && st.phase === 'bidding' ? sold(s) : s;
    case 'MIC_PICK': {
      if (st.type !== 'mic' || st.phase !== 'spin') return s;
      const picked = s.micPicked.length >= s.teams.length ? [a.teamId] : [...s.micPicked, a.teamId];
      return { ...s, micPicked: picked, step: { ...st, phase: 'picked', teamId: a.teamId } };
    }
    case 'PITCH_START': {
      if (st.type === 'pitch' && st.phase === 'ready') return { ...s, step: { ...st, phase: 'talking' }, timer: startTimer(PITCH_MS) };
      return s;
    }
    case 'VOTE': {
      if (a.pitcherId === a.voterId) return s;
      const stars = Math.max(1, Math.min(5, Math.round(a.stars)));
      return { ...s, votes: { ...s.votes, [a.pitcherId]: { ...(s.votes[a.pitcherId] ?? {}), [a.voterId]: stars } } };
    }
    case 'ADJUST': {
      const out = patchTeam(s, a.teamId, t => applyDeltas(t, { ...zero(), [a.field]: a.delta }, null));
      // Awards not revealed yet: keep them in line with the fix
      if (out.step.type === 'awards' && out.step.reveal === 0) return { ...out, step: { ...out.step, results: computeAwards(out) } };
      return out;
    }
    case 'TIMER_START': return { ...s, timer: startTimer(a.ms) };
    case 'TIMER_PAUSE': {
      if (!s.timer.running || !s.timer.endsAt) return s;
      return { ...s, timer: { ...s.timer, running: false, remaining: Math.max(0, s.timer.endsAt - Date.now()), endsAt: null } };
    }
    case 'TIMER_RESUME': {
      if (s.timer.running) return s;
      return { ...s, timer: { ...s.timer, running: true, endsAt: Date.now() + s.timer.remaining } };
    }
    case 'TIMER_ADD': {
      const t = s.timer;
      return { ...s, timer: { ...t, endsAt: t.endsAt ? t.endsAt + a.ms : null, remaining: t.remaining + a.ms, total: t.total + a.ms } };
    }
    case 'TIMER_STOP': return { ...s, timer: stopTimer() };
  }
}

/** Remaining timer ms on this device. */
export function timerRemaining(s: GameState, now = Date.now()) {
  const t = s.timer;
  if (t.running && t.endsAt) return Math.max(0, t.endsAt - now);
  return t.remaining;
}

/** Bug Smash seconds for a team (extra time if they tested with friends). */
export function bugSeconds(t: Team) {
  const tested = t.history.some(h => h.stepId === BUG.testedOption.qId && h.label === QUESTIONS[BUG.testedOption.qId].options[BUG.testedOption.index].label);
  return BUG.seconds + (tested ? BUG.testedBonusSeconds : 0);
}

/** What the admin's NEXT button will do right now (for its label). */
export function nextLabel(s: GameState): string {
  const st = s.step;
  switch (st.type) {
    case 'question': case 'price':
      return st.phase === 'intro' ? 'Open choices ▶' : st.phase === 'open' ? 'REVEAL 🎉' : st.phase === 'revealed' ? 'Show first team' : st.phase === 'spotlight' ? (st.spotlight + 1 < s.teams.length ? 'Next team ▶' : 'Finish ✓') : 'Next step ▶';
    case 'megaorder':
      return st.phase === 'intro' ? 'Start talking ▶' : st.phase === 'open' ? 'REVEAL 🎉' : st.phase === 'revealed' ? 'Show first pair' : st.phase === 'spotlight' ? 'Next pair ▶' : 'Next step ▶';
    case 'bugsmash':
      return st.phase === 'intro' ? 'Start turns ▶' : st.phase === 'turn' ? (st.turnPhase === 'result' ? (st.turn + 1 < s.teams.length ? 'Next team ▶' : 'Finish ✓') : 'Waiting for the game…') : 'Next step ▶';
    case 'auction':
      return st.phase === 'intro' ? 'Start bidding ▶' : st.phase === 'bidding' ? 'SOLD! 🔨' : st.phase === 'sold' ? 'Next ticket ▶' : 'Next step ▶';
    case 'mood': return st.phase === 'done' ? 'Next step ▶' : st.phase === 'intro' ? 'Start ▶' : 'Skip ▶';
    case 'mic': return st.phase === 'spin' ? 'Waiting for the wheel…' : st.phase === 'picked' ? 'Done talking ✓' : 'Next step ▶';
    case 'pitch': return st.phase === 'ready' ? 'Start pitch ⏱️' : st.phase === 'talking' ? 'Stop, go to votes' : st.phase === 'voting' ? 'Next team ▶' : 'Next step ▶';
    case 'awards': return st.reveal < st.results.length ? `Reveal #${5 - st.reveal}` : 'Finish ▶';
    default: return 'Next ▶';
  }
}
