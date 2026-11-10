import { reduce, initialState, currentStep, success, stageOf, computeAwards } from '../src/game/engine';
import { makeTeams, suggestRoles, randomProduct } from '../src/game/helpers';
import { SCRIPT } from '../src/game/content';
import type { GameState, Action } from '../src/game/types';
let s: GameState = initialState();
const d = (a: Action) => { s = reduce(s, a); };
d({ type: 'NEXT' });
const names = ['Aarav','Riya','Kabir','Isha','Vihaan','Anaya','Arjun','Diya','Reyansh','Myra','Sai','Kiara','Ayaan','Saanvi','Krish','Aadhya','Dev','Pari','Om','Navya'];
names.forEach((n,i)=> d({ type:'ADD_PLAYER', player:{ id:'p'+i, name:n, grade: (5+(i%3)) as 5|6|7 } }));
let guard=0;
while (currentStep(s).kind !== 'end' && guard++ < 2000) {
  const step = currentStep(s); const st = s.step;
  if (step.kind==='setup_teams' && !s.teams.length) d({type:'MAKE_TEAMS', teams: makeTeams(s.players,4)});
  if (step.kind==='setup_roles') s.teams.forEach(t=>suggestRoles(t).forEach(r=>d({type:'SET_ROLES',teamId:t.id,playerId:r.playerId,roles:r.roles})));
  if (step.kind==='setup_products') s.teams.forEach(t=>{ if(!t.productId){ const p=randomProduct(s)!; d({type:'SET_PRODUCT',teamId:t.id,productId:p.id}); }});
  if (step.kind==='setup_names') s.teams.forEach((t,i)=>d({type:'SET_TEAM_NAME',teamId:t.id,name:['Rocket Kids','Chai Champs','Byte Bros','Star Girls'][i]}));
  if ((st.type==='question'||st.type==='price'||st.type==='megaorder') && st.phase==='open') s.teams.forEach((t,i)=>{ if(st.locks[t.id]===undefined) d({type:'LOCK',teamId:t.id,choice: st.type==='price'? 40 : st.type==='megaorder'? 0 : (i%4)}); });
  if (st.type==='bugsmash' && st.phase==='turn') { if (st.turnPhase==='ready') d({type:'BUG_START'}); if (s.step.type==='bugsmash' && s.step.turnPhase==='playing') d({type:'BUG_RESULT',teamId:s.teams[s.step.turn].id,bugs:12+s.step.turn*7}); }
  if (st.type==='auction' && st.phase==='bidding') d({type:'BID',by:s.teams[st.ticket].id,amount:40});
  if (st.type==='mic' && st.phase==='spin') d({type:'MIC_PICK',teamId:s.teams[0].id});
  if (st.type==='pitch' && st.phase==='voting') s.teams.forEach(v=>{ const p=s.teams[(s.step as any).index]; if(v.id!==p.id) d({type:'VOTE',pitcherId:p.id,voterId:v.id,stars:3+(v.id.length%3)}); });
  d({type:'NEXT'});
}
console.log('ended at', currentStep(s).id, 'guard', guard);
for (const t of s.teams) console.log(t.name, t.productId, 'C',t.customers,'H',t.happiness,'coins',t.coins,'success',success(t),stageOf(t).name,'history',t.history.length, t.members.map(m=>m.name+':'+m.roles.join('+')).join(' '));
console.log(computeAwards(s).map(a=>`${a.rank} ${a.title} -> ${s.teams.find(t=>t.id===a.teamId)!.name} | ${a.why.join('; ')}`).join('\n'));
console.log('steps', SCRIPT.length);

// ---------- Rules checks: odd and even team counts, awards, auction reserve, broke teams ----------
import assert from 'node:assert/strict';
import { maxBid } from '../src/game/engine';
import { PRODUCTS, QUESTIONS, AUCTION_RESERVE } from '../src/game/content';

function playGame(teamCount: number, playerCount: number, pickOption: (i: number) => number) {
  let g: GameState = initialState();
  const dd = (a: Action) => { g = reduce(g, a); };
  dd({ type: 'NEXT' });
  for (let i = 0; i < playerCount; i++) dd({ type: 'ADD_PLAYER', player: { id: 'p' + i, name: 'P' + i, grade: (5 + (i % 3)) as 5 | 6 | 7 } });
  let n = 0;
  while (currentStep(g).kind !== 'end' && n++ < 3000) {
    const step = currentStep(g), st = g.step;
    if (step.kind === 'setup_teams' && !g.teams.length) dd({ type: 'MAKE_TEAMS', teams: makeTeams(g.players, teamCount) });
    if (step.kind === 'setup_products') g.teams.forEach((t, i) => dd({ type: 'SET_PRODUCT', teamId: t.id, productId: PRODUCTS[i].id }));
    if ((st.type === 'question' || st.type === 'price' || st.type === 'megaorder') && st.phase === 'open') {
      g.teams.forEach((t, i) => dd({ type: 'LOCK', teamId: t.id, choice: st.type === 'price' ? 40 : st.type === 'megaorder' ? (i % 4) : pickOption(i) }));
    }
    if (st.type === 'bugsmash' && st.phase === 'turn') {
      if (st.turnPhase === 'ready') dd({ type: 'BUG_START' });
      const b = g.step as any;
      if (b.turnPhase === 'playing') dd({ type: 'BUG_RESULT', teamId: g.teams[b.turn].id, bugs: 15 });
    }
    if (st.type === 'auction' && st.phase === 'bidding') {
      const t = g.teams[st.ticket % g.teams.length];
      dd({ type: 'BID', by: t.id, amount: t.coins }); // try to bid everything: must be refused above the reserve
      assert.ok(g.teams.every(x => x.coins >= 0));
      dd({ type: 'BID', by: t.id, amount: 40 });
    }
    if (st.type === 'mic' && st.phase === 'spin') dd({ type: 'MIC_PICK', teamId: g.teams[0].id });
    if (st.type === 'pitch' && st.phase === 'voting') g.teams.forEach(v => { const p = g.teams[(g.step as any).index]; if (v.id !== p.id) dd({ type: 'VOTE', pitcherId: p.id, voterId: v.id, stars: 3 }); });
    dd({ type: 'NEXT' });
  }
  return g;
}
for (const [teams, players] of [[3, 12], [4, 20], [5, 20], [5, 25], [6, 30], [4, 12]] as const) {
  const g = playGame(teams, players, i => i % 4);
  assert.equal(currentStep(g).kind, 'end', `${teams} teams reaches the end`);
  for (const t of g.teams) {
    assert.ok(t.coins >= 0 && t.customers >= 0 && t.customers <= 50 && t.happiness >= 0 && t.happiness <= 50);
    assert.ok(success(t) >= 0 && success(t) <= 100);
    assert.ok(t.history.some(h => h.stepId === 'mega'), `every team gets a Mega Order result (${teams} teams)`);
    assert.ok(t.coins >= 0);
  }
  const aw = computeAwards(g);
  assert.equal(aw.length, 5);
  const ids = new Set(aw.filter(a => a.rank <= 4).map(a => a.teamId));
  assert.ok(ids.size >= Math.min(4, teams), `awards 1-4 go to ${Math.min(4, teams)} different teams (${teams} teams)`);
  if (teams > 1) assert.notEqual(aw.find(a => a.rank === 5)!.teamId, aw.find(a => a.rank === 1)!.teamId, 'banana is not the champion');
}
// Auction bids respect the reserve
{
  let g = initialState();
  g = reduce(g, { type: 'MAKE_TEAMS', teams: makeTeams(Array.from({ length: 8 }, (_, i) => ({ id: 'x' + i, name: 'X' + i, grade: 5 as const })), 4) });
  const idx = SCRIPT.findIndex(x => x.kind === 'auction');
  g = reduce(g, { type: 'JUMP', stepIndex: idx });
  g = reduce(g, { type: 'NEXT' });
  const t = g.teams[0];
  assert.equal(maxBid(t), t.coins - AUCTION_RESERVE);
  const before = (g.step as any).bid.amount;
  g = reduce(g, { type: 'BID', by: t.id, amount: t.coins });
  assert.equal((g.step as any).bid.amount, before, 'bid above max is refused');
  g = reduce(g, { type: 'BID', by: t.id, amount: maxBid(t) });
  assert.equal((g.step as any).bid.by, t.id);
}
// A team with 0 coins can still lock a free option and nothing goes negative
{
  let g = initialState();
  g = reduce(g, { type: 'MAKE_TEAMS', teams: makeTeams(Array.from({ length: 8 }, (_, i) => ({ id: 'x' + i, name: 'X' + i, grade: 5 as const })), 4) });
  g = reduce(g, { type: 'ADJUST', teamId: 't1', field: 'coins', delta: -999 });
  g = reduce(g, { type: 'JUMP', stepIndex: SCRIPT.findIndex(x => x.id === 'a1q1') });
  g = reduce(g, { type: 'NEXT' });
  g = reduce(g, { type: 'LOCK', teamId: 't1', choice: 0 });
  assert.equal((g.step as any).locks.t1, undefined, 'broke team cannot lock a paid option');
  g = reduce(g, { type: 'LOCK', teamId: 't1', choice: 1 });
  assert.equal((g.step as any).locks.t1, 1, 'broke team can lock the free option');
}
// Every question has at least one free, honest option so a broke team is never forced into rAIvan's trap
for (const q of Object.values(QUESTIONS)) assert.ok(q.options.some(o => o.coins >= 0 && !o.trap), q.id + ' has a free honest option');
// Mega Order with 3 and 5 teams: exactly one solo team, outside every pair, rewarded once, with the solo story text
for (const n of [3, 5, 4, 6]) {
  let g = initialState();
  g = reduce(g, { type: 'MAKE_TEAMS', teams: makeTeams(Array.from({ length: n * 4 }, (_, i) => ({ id: 'x' + i, name: 'X' + i, grade: 5 as const })), n as 3 | 4 | 5 | 6) });
  g = reduce(g, { type: 'JUMP', stepIndex: SCRIPT.findIndex(x => x.kind === 'megaorder') });
  const st0 = g.step as any;
  assert.equal(st0.pairs.length, Math.floor(n / 2));
  assert.equal(!!st0.solo, n % 2 === 1, `solo only with odd teams (${n})`);
  if (st0.solo) assert.ok(!st0.pairs.flat().includes(st0.solo), 'solo team is not in a pair');
  g = reduce(g, { type: 'NEXT' }); // open
  g.teams.forEach(t => { if (t.id !== st0.solo) g = reduce(g, { type: 'LOCK', teamId: t.id, choice: 0 }); }); // solo team never needs a lock
  g = reduce(g, { type: 'NEXT' }); // revealed
  const soloBefore = st0.solo ? g.teams.find(t => t.id === st0.solo)!.customers : 0;
  while ((g.step as any).phase !== 'done') g = reduce(g, { type: 'NEXT' });
  if (st0.solo) {
    const t = g.teams.find(x => x.id === st0.solo)!;
    assert.equal(t.history.filter(h => h.label === 'Solo order').length, 1, 'solo order applied once');
    assert.ok(t.customers >= soloBefore && t.history.some(h => h.story.startsWith('No partner this time')), 'solo story text');
  }
  for (const t of g.teams) assert.ok(t.history.some(h => h.stepId === 'mega'), `team ${t.id} has a mega result (${n} teams)`);
}
// Customer mood: one NEXT per team applies that team's change exactly once, then the board; extra NEXT leaves the step
for (const n of [3, 5]) {
  let g = initialState();
  g = reduce(g, { type: 'MAKE_TEAMS', teams: makeTeams(Array.from({ length: n * 4 }, (_, i) => ({ id: 'x' + i, name: 'X' + i, grade: 5 as const })), n as 3 | 5) });
  g = reduce(g, { type: 'ADJUST', teamId: g.teams[0].id, field: 'happiness', delta: -20 });
  g = reduce(g, { type: 'JUMP', stepIndex: SCRIPT.findIndex(x => x.kind === 'mood') });
  g = reduce(g, { type: 'NEXT' });
  let taps = 0;
  while ((g.step as any).phase === 'team') { assert.equal((g.step as any).index, taps); g = reduce(g, { type: 'NEXT' }); taps++; }
  assert.equal(taps, n, `mood shows ${n} teams`);
  assert.equal((g.step as any).phase, 'done');
  for (const t of g.teams) assert.ok(t.history.filter(h => h.label === 'Customer mood').length <= 1);
}
console.log('rules checks passed');
