// Random helpers live outside the reducer. The screen calls these, then dispatches the result.

import { AVATAR_SHAPES, PRODUCTS, ROLE_PLAN, TEAM_COLORS } from './content';
import { newTeamStats } from './engine';
import { GRADES, type GameState, type Member, type Player, type RoleId, type Team } from './types';
import { MIC_QUESTIONS } from './content';

export const uid = () => Math.random().toString(36).slice(2, 9);
export const randInt = (n: number) => Math.floor(Math.random() * n);
export function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = randInt(i + 1); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

/** Split players into `count` teams, mixing grades evenly (snake draft per grade). */
export function makeTeams(players: Player[], count: number): Team[] {
  // Oldest class first, so each round of the snake hands the oldest kids to different teams (every team gets a mix of classes 5 to 10).
  const byGrade = GRADES.slice().reverse().flatMap(g => shuffle(players.filter(p => p.grade === g)));
  const buckets: Player[][] = Array.from({ length: count }, () => []);
  byGrade.forEach((p, i) => {
    const round = Math.floor(i / count);
    const pos = i % count;
    buckets[round % 2 === 0 ? pos : count - 1 - pos].push(p);
  });
  const colors = shuffle(TEAM_COLORS.map((_, i) => i)).slice(0, count);
  // Every team gets a different avatar shape (seed % AVATAR_SHAPES is the shape); the rest of the seed is just variety.
  const shapes = shuffle(Array.from({ length: AVATAR_SHAPES }, (_, i) => i));
  return buckets.map((list, i) => ({
    id: `t${i + 1}`,
    name: `Team ${i + 1}`,
    colorIndex: colors[i % colors.length],
    avatarSeed: randInt(50_000) * AVATAR_SHAPES + shapes[i % AVATAR_SHAPES],
    members: list.map((p, k): Member => ({ playerId: p.id, name: p.name, grade: p.grade, roles: [], shade: k % 5 })),
    productId: null,
    ...newTeamStats(),
  }));
}

/** Suggested roles by team size. Teams pick their own roles; this only pre-fills. */
export function suggestRoles(team: Team): { playerId: string; roles: RoleId[] }[] {
  const plan = ROLE_PLAN[Math.max(3, Math.min(5, team.members.length))] ?? ROLE_PLAN[4];
  return team.members.map((m, i) => ({ playerId: m.playerId, roles: plan[i] ?? [] }));
}

export function availableProducts(s: GameState) {
  const taken = new Set(s.teams.map(t => t.productId).filter(Boolean));
  return PRODUCTS.filter(p => !taken.has(p.id));
}
export function randomProduct(s: GameState) {
  const free = availableProducts(s);
  return free.length ? free[randInt(free.length)] : null;
}

/** Mic Time: random team among those not picked yet. */
export function randomMicTeam(s: GameState) {
  const left = s.teams.filter(t => !s.micPicked.includes(t.id));
  const pool = left.length ? left : s.teams;
  return pool[randInt(pool.length)] ?? null;
}

/** Member holding a role (first match). */
export function memberWithRole(team: Team, role: RoleId) {
  return team.members.find(m => m.roles.includes(role)) ?? null;
}

/** Team count that gives 4 to 5 kids per team (3 to 6 teams). 12 to 30 players is the design range. */
export function suggestTeamCount(players: number): 3 | 4 | 5 | 6 {
  if (players <= 15) return players >= 12 ? 4 : 3;
  if (players <= 20) return 4;
  if (players <= 25) return 5;
  return 6;
}

/** Mic Time question: depends on what the team chose this act (the trick they fell for, or the good choice they made). */
export function micQuestionFor(team: Team, act: number): string {
  const last = [...team.history].reverse().find(h => h.act === act && h.stepId !== 'bugsmash' && h.stepId !== 'auction' && !h.stepId.startsWith('mood'));
  const base = MIC_QUESTIONS[act] ?? 'What did your team learn so far?';
  if (!last || act === 4) return base;
  if (last.trap) return `Your team chose “${last.label}”. That was Jhootu’s trick! Why was it a risky choice, and what would you do next time?`;
  return `Your team chose “${last.label}”. Why was that a good idea for your startup? ${base}`;
}
