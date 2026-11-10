// Monte Carlo balance check. Run: npx -y tsx tests/sim.ts [games]
import { reduce, initialState, currentStep, success, computeAwards, bugSeconds, maxBid } from '../src/game/engine';
import { makeTeams, suggestRoles } from '../src/game/helpers';
import { PRODUCTS, QUESTIONS } from '../src/game/content';
import type { GameState, Action, Team } from '../src/game/types';

function mulberry32(a: number) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
let R = mulberry32(1);
Math.random = () => R();
const ri = (a: number, b: number) => a + Math.floor(R() * (b - a + 1));
const rf = (a: number, b: number) => a + R() * (b - a);
const pick = <T,>(a: T[]) => a[Math.floor(R() * a.length)];

type Strat = {
  name: string;
  q(qId: string, t: Team): number;
  price(t: Team): number;
  rate(): number;           // bugs per second
  value(): number;          // max auction valuation
  mega(): number;
  vote(): number;
};
const afford = (qId: string, t: Team) => QUESTIONS[qId].options.map((o, i) => (o.coins >= 0 || t.coins + o.coins >= 0 ? i : -1)).filter(i => i >= 0);
const near = (best: number, p: number) => Math.max(10, Math.min(100, best + (R() < p ? 0 : pick([-10, 10, -20, 20]))));
const bestOf = (t: Team) => PRODUCTS.find(p => p.id === t.productId)!.bestPrice;

const STRATS: Record<string, Strat> = {
  random: { name: 'random', q: (id, t) => pick(afford(id, t)), price: () => ri(1, 10) * 10, rate: () => rf(0.6, 2.0), value: () => rf(20, 120), mega: () => ri(0, 3), vote: () => ri(1, 5) },
  smart: {
    name: 'smart',
    q: (id, t) => ({ a1q1: 0, a1q2: pick([2, 3]), a2q1: 0, a3q1: t.happiness >= 20 ? 1 : 0, a4q2: 0, a5q1: pick([0, 3]) } as Record<string, number>)[id],
    price: t => near(bestOf(t), 0.6), rate: () => rf(0.9, 2.2), value: () => rf(35, 65), mega: () => 0, vote: () => ri(3, 5),
  },
  honest: {
    name: 'honest',
    q: (id) => ({ a1q1: 1, a1q2: 2, a2q1: 2, a3q1: 3, a4q2: 3, a5q1: 1 } as Record<string, number>)[id],
    price: t => near(bestOf(t) + 20, 0.2), rate: () => rf(0.6, 1.6), value: () => rf(25, 45), mega: () => 0, vote: () => ri(2, 4),
  },
  cheater: {
    name: 'cheater',
    q: (id) => Object.values(QUESTIONS[id].options).findIndex(o => o.trap),
    price: () => ri(1, 10) * 10, rate: () => rf(0.6, 2.0), value: () => rf(60, 120), mega: () => 1, vote: () => ri(1, 5),
  },
  rich: {
    name: 'rich',
    q: (id, t) => { const idx = afford(id, t); return idx.reduce((b, i) => QUESTIONS[id].options[i].coins > QUESTIONS[id].options[b].coins ? i : b, idx[0]); },
    price: () => ri(1, 10) * 10, rate: () => rf(0.6, 2.0), value: () => 0, mega: () => 1, vote: () => ri(1, 5),
  },
  kid: {
    name: 'kid',
    q: (id, t) => { const sm = STRATS.smart.q(id, t); const r = R(); const idx = afford(id, t); if (r < 0.5) return afford(id, t).includes(sm) ? sm : pick(idx); if (r < 0.65) { const tr = QUESTIONS[id].options.findIndex(o => o.trap); return afford(id, t).includes(tr) ? tr : pick(idx); } return pick(idx); },
    price: t => near(bestOf(t), 0.45), rate: () => rf(0.7, 1.8), value: () => rf(30, 70), mega: () => (R() < 0.8 ? 0 : 1), vote: () => ri(2, 5),
  },
  sneaky: {
    name: 'sneaky',
    q: (id, t) => STRATS.smart.q(id, t), price: t => near(bestOf(t), 0.6), rate: () => rf(0.9, 2.2), value: () => rf(35, 65), mega: () => 1, vote: () => ri(1, 3),
  },
};

interface Res { fin: {c:number;h:number;k:number}[]; champ: number; succ: number[]; strat: string[]; minCoins: number; leadChange: boolean; awardsDistinct: number; leaderAfter3: number; tied: boolean; zeroCoinTeams: number; }

function play(stratNames: string[]): Res {
  const n = stratNames.length;
  let s: GameState = initialState();
  const d = (a: Action) => { s = reduce(s, a); };
  d({ type: 'NEXT' });
  for (let i = 0; i < n * 5; i++) d({ type: 'ADD_PLAYER', player: { id: 'p' + i, name: 'P' + i, grade: (5 + (i % 3)) as 5 | 6 | 7 } });
  const strat = (t: Team) => STRATS[stratNames[s.teams.findIndex(x => x.id === t.id)]];
  let guard = 0, minCoins = 1e9, leaderAfter3 = -1, zero = 0;
  while (currentStep(s).kind !== 'end' && guard++ < 3000) {
    const step = currentStep(s); const st = s.step;
    if (step.kind === 'setup_teams' && !s.teams.length) d({ type: 'MAKE_TEAMS', teams: makeTeams(s.players, n) });
    if (step.kind === 'setup_roles') s.teams.forEach(t => suggestRoles(t).forEach(r => d({ type: 'SET_ROLES', teamId: t.id, playerId: r.playerId, roles: r.roles })));
    if (step.kind === 'setup_products') {
      const pool = PRODUCTS.map(p => p.id).sort(() => R() - 0.5);
      s.teams.forEach((t, i) => d({ type: 'SET_PRODUCT', teamId: t.id, productId: pool[i] }));
    }
    if (step.kind === 'setup_names') s.teams.forEach((t, i) => d({ type: 'SET_TEAM_NAME', teamId: t.id, name: 'T' + i }));
    if ((st.type === 'question' || st.type === 'price' || st.type === 'megaorder') && st.phase === 'open') {
      for (const t of s.teams) {
        const sg = strat(t);
        const choice = st.type === 'question' ? sg.q((step as any).qId, t) : st.type === 'price' ? sg.price(t) : sg.mega();
        d({ type: 'LOCK', teamId: t.id, choice });
      }
    }
    if (st.type === 'bugsmash' && st.phase === 'turn') {
      if (st.turnPhase === 'ready') d({ type: 'BUG_START' });
      const s2 = s.step as any;
      if (s2.turnPhase === 'playing') { const t = s.teams[s2.turn]; d({ type: 'BUG_RESULT', teamId: t.id, bugs: Math.round(strat(t).rate() * bugSeconds(t)) }); }
    }
    if (st.type === 'auction' && st.phase === 'bidding') {
      const vals: Record<string, number> = {};
      s.teams.forEach(t => (vals[t.id] = strat(t).value()));
      for (let k = 0; k < 40; k++) {
        const cur = (s.step as any).bid;
        const cands = s.teams.filter(t => t.id !== cur.by && vals[t.id] >= cur.amount + 10 && t.coins >= cur.amount + 10 && maxBid(t) >= cur.amount + 10 && !Object.values((s.step as any).winners).some((w: any) => w.by === t.id));
        if (!cands.length) break;
        d({ type: 'BID', by: pick(cands).id, amount: cur.amount + 10 });
      }
    }
    if (st.type === 'mic' && st.phase === 'spin') d({ type: 'MIC_PICK', teamId: pick(s.teams).id });
    if (st.type === 'pitch' && st.phase === 'voting') s.teams.forEach(v => { const p = s.teams[(s.step as any).index]; if (v.id !== p.id) d({ type: 'VOTE', pitcherId: p.id, voterId: v.id, stars: strat(v).vote() }); });
    if (step.id === 'board3' && leaderAfter3 < 0) leaderAfter3 = s.teams.reduce((b, t, i) => (success(t) > success(s.teams[b]) ? i : b), 0);
    s.teams.forEach(t => { minCoins = Math.min(minCoins, t.coins); });
    d({ type: 'NEXT' });
  }
  s.teams.forEach(t => { if (t.coins === 0) zero++; });
  const sc = s.teams.map(success);
  const top = Math.max(...sc);
  const champ = computeAwards(s)[4].teamId;
  const ci = s.teams.findIndex(t => t.id === champ);
  const aw = computeAwards(s).filter(a => a.rank <= 4);
  return { fin: s.teams.map(t => ({ c: t.customers, h: t.happiness, k: t.coins })), champ: ci, succ: sc, strat: stratNames, minCoins, leadChange: leaderAfter3 !== ci, awardsDistinct: new Set(aw.map(a => a.teamId)).size, leaderAfter3, tied: sc.filter(x => x === top).length > 1, zeroCoinTeams: zero };
}

const N = Number(process.argv[2] ?? 400);
if (process.argv[3] === 'audit') {
  const base = ['kid', 'kid', 'kid', 'kid'];
  const avg = (fn: (r: Res) => number, setup: () => void) => { let sum = 0; for (let g = 0; g < N; g++) { R = mulberry32(g * 104729 + 7); setup(); sum += fn(play(base)); } return sum / N; };
  const orig = STRATS.kid.q, origP = STRATS.kid.price;
  const baseline = avg(r => r.succ[0], () => {});
  console.log('baseline kid team0 success', baseline.toFixed(1));
  for (const qId of Object.keys(QUESTIONS)) {
    QUESTIONS[qId].options.forEach((o, i) => {
      STRATS.kid.q = (id, t) => (id === qId ? i : orig(id, t));
      // only team 0 forced: wrap by checking team id
      STRATS.kid.q = (id, t) => (id === qId && t.id === 't1' ? i : orig(id, t));
      const v = avg(r => r.succ[0], () => {});
      console.log(`${qId} opt${i} ${o.trap ? '[TRAP]' : '      '} ${o.text.padEnd(42)} -> ${v.toFixed(1)} (${(v - baseline >= 0 ? '+' : '') + (v - baseline).toFixed(1)})`);
    });
  }
  STRATS.kid.q = orig;
  for (const off of [0, 10, 20, 30, 50]) {
    STRATS.kid.price = t => (t.id === 't1' ? Math.max(10, Math.min(100, bestOf(t) + (bestOf(t) + off > 100 ? -off : off))) : origP(t));
    const v = avg(r => r.succ[0], () => {});
    console.log(`price off by ${off}: ${v.toFixed(1)} (${(v - baseline).toFixed(1)})`);
  }
  process.exit(0);
}
const scenarios: [string, string[]][] = [
  ['4 kids', ['kid', 'kid', 'kid', 'kid']],
  ['5 kids', ['kid', 'kid', 'kid', 'kid', 'kid']],
  ['3 kids', ['kid', 'kid', 'kid']],
  ['6 kids', ['kid', 'kid', 'kid', 'kid', 'kid', 'kid']],
  ['smart + 3 kids', ['smart', 'kid', 'kid', 'kid']],
  ['honest + 3 kids', ['honest', 'kid', 'kid', 'kid']],
  ['cheater + 3 kids', ['cheater', 'kid', 'kid', 'kid']],
  ['all random x4', ['random', 'random', 'random', 'random']],
  ['all smart x4', ['smart', 'smart', 'smart', 'smart']],
  ['smart,honest,rich,cheater', ['smart', 'honest', 'rich', 'cheater']],
  ['smart,random,random,random', ['smart', 'random', 'random', 'random']],
  ['honest x2,smart x2', ['honest', 'honest', 'smart', 'smart']],
  ['smart,sneaky,honest,random', ['smart', 'sneaky', 'honest', 'random']],
  ['5 teams mixed', ['smart', 'honest', 'random', 'cheater', 'rich']],
  ['5 teams all smart/random', ['smart', 'random', 'smart', 'random', 'random']],
  ['3 teams mixed', ['smart', 'honest', 'cheater']],
  ['6 teams mixed', ['smart', 'honest', 'random', 'cheater', 'rich', 'random']],
];
for (const [label, names] of scenarios) {
  const wins: Record<string, number> = {}; let lc = 0, tied = 0, close = 0, lowAw = 0, zeroT = 0, sumTop = 0, sumGap = 0, minC = 1e9, mean = 0, cnt = 0, mn = 1e9, mx = 0, stall = 0;
  const per: Record<string, number> = {}; const meters: Record<string, number[]> = {};
  for (let g = 0; g < N; g++) {
    R = mulberry32(g * 7919 + 13);
    const r = play(names);
    const nm = r.strat[r.champ] + '#' + r.champ;
    wins[r.strat[r.champ]] = (wins[r.strat[r.champ]] ?? 0) + 1 / N;
    if (r.leadChange) lc++;
    if (r.tied) tied++;
    const sorted = [...r.succ].sort((a, b) => b - a);
    sumTop += sorted[0]; sumGap += sorted[0] - sorted[1]; if (sorted[0] - sorted[1] <= 5) close++;
    if (r.awardsDistinct < Math.min(4, names.length)) lowAw++;
    minC = Math.min(minC, r.minCoins); zeroT += r.zeroCoinTeams;
    r.succ.forEach((x, i) => { mean += x; cnt++; mn = Math.min(mn, x); mx = Math.max(mx, x); per[r.strat[i]] = (per[r.strat[i]] ?? 0) + x; const m = (meters[r.strat[i]] ??= [0, 0, 0, 0]); m[0] += r.fin[i].c; m[1] += r.fin[i].h; m[2] += r.fin[i].k; m[3]++; if (x <= 25) stall++; });
    void nm;
  }
  const perAvg = Object.entries(per).map(([k, v]) => `${k}:${(v / (N * names.filter(x => x === k).length)).toFixed(0)}`).join(' ');
  console.log(`\n${label}  (N=${N})`);
  console.log(' champion share:', Object.entries(wins).map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`).join(', '));
  console.log(` avg success by strat: ${perAvg} | overall mean ${(mean / cnt).toFixed(1)} min ${mn} max ${mx} | top avg ${(sumTop / N).toFixed(1)} gap1-2 avg ${(sumGap / N).toFixed(1)}`);
  console.log(' meters C/H/coins:', Object.entries(meters).map(([k, m]) => `${k} ${(m[0] / m[3]).toFixed(0)}/${(m[1] / m[3]).toFixed(0)}/${(m[2] / m[3]).toFixed(0)}`).join(' | '));
  console.log(` finish within 5 pts: ${(close / N * 100).toFixed(0)}% | champ != leader after act3: ${(lc / N * 100).toFixed(0)}% | tied top: ${(tied / N * 100).toFixed(0)}% | teams ending in Tiny Stall(<=25): ${(stall / cnt * 100).toFixed(0)}% | min coins ever ${minC} | awards-1-4 not distinct: ${lowAw}`);
}
