// Narration for the leaderboards, the full-screen progress step, the host's progress overlay and the break.
// Also holds the small pure helpers the leaderboard view shares with its narration (who led, who climbed, who slipped).
import { currentStep } from '../../game/engine';
import { RECIPE } from '../../game/content';
import type { GameState, Team } from '../../game/types';
import { actOf, teamName } from '../../screen/lib/game';
import type { NarrLine, Narration } from '../types';

// ---------------------------------------------------------------- shared helpers
export type Field = 'customers' | 'happiness' | 'coins';
export const BOARD_FIELDS: Field[] = ['customers', 'happiness', 'coins'];
export const FIELD_LABEL: Record<Field, string> = { customers: 'Customers', happiness: 'Happiness', coins: 'Coins' };

/** Short facts about each act, used by the progress screen and its narration. Index = act - 1. */
export const ACT_INFO = [
  { name: 'Problem', tag: 'Find the problem', goal: 'find a real problem to solve', did: 'You found the problem', learned: 'You looked for a real problem to solve. Great startups start by listening.', hook: 'Let us build version 1!' },
  { name: 'Build', tag: 'Build version 1', goal: 'build version 1 of your product', did: 'You built version 1', learned: 'You built version 1. Start small, test with real people, then make it better.', hook: 'Let us make it real!' },
  { name: 'Launch', tag: 'Tell Techistan', goal: 'tell Techistan about your startup', did: 'You told Techistan', learned: 'You told Techistan about your startup. A great product needs people to know it.', hook: 'Let us tell Techistan!' },
  { name: 'Money', tag: 'Earn money', goal: 'set a smart price and earn money', did: 'You set your prices', learned: 'You set prices. Too high and customers walk away. Too low and you earn nothing.', hook: 'Time to earn some money!' },
  { name: 'Grow', tag: 'Grow bigger', goal: 'grow bigger and stronger', did: 'You grew your startup', learned: 'You grew your startup. Fair partners and happy customers grow together.', hook: 'Let us grow bigger!' },
  { name: 'Show Day', tag: 'Pitch and win', goal: 'pitch your startup on the big stage', did: 'You pitched on the big stage', learned: 'You told your story on the big stage.', hook: 'Time to pitch on the big stage!' },
] as const;

/** Value of a meter before the given act happened (current value minus what that act's history entries changed). */
export function valueBefore(t: Team, f: Field, act: number): number {
  const d = t.history.filter(h => h.act === act).reduce((s, h) => s + h.deltas[f], 0);
  return Math.max(0, t[f] - d);
}

/** Team ids ranked best first. Ties keep team order. */
export function rankedIds(teams: Team[], value: (t: Team) => number): string[] {
  return teams.map((t, i) => ({ t, i })).sort((a, b) => value(b.t) - value(a.t) || a.i - b.i).map(x => x.t.id);
}

/** 1 = best. Teams with the same value share a rank (dense competition ranking). */
export function rankOf(values: Record<string, number>, id: string): number {
  return 1 + Object.values(values).filter(v => v > values[id]).length;
}

export interface Move { team: Team; field: Field; from: number; to: number }   // 0-based positions, to < from = climbed

/** Positions that changed on the board of `field` during `act`. Empty when there was no ranking before (everybody level). */
export function movesFor(teams: Team[], field: Field, act: number): Move[] {
  const before: Record<string, number> = {};
  teams.forEach(t => { before[t.id] = valueBefore(t, field, act); });
  if (new Set(Object.values(before)).size < 2) return [];
  const a = rankedIds(teams, t => before[t.id]);
  const b = rankedIds(teams, t => t[field]);
  return teams.map(team => ({ team, field, from: a.indexOf(team.id), to: b.indexOf(team.id) })).filter(m => m.from !== m.to);
}

function leadersOf(teams: Team[], f: Field): Team[] {
  const best = Math.max(...teams.map(t => t[f]));
  return teams.filter(t => t[f] === best);
}

const joinNames = (ts: Team[]) => ts.map(teamName).join(' and ');
const joinWords = (w: string[]) => (w.length <= 1 ? w[0] ?? '' : `${w.slice(0, -1).join(', ')} and ${w[w.length - 1]}`);

/** "A leads Customers and Happiness. B leads Coins." One sentence per different leader. */
function leaderSentence(teams: Team[]): string {
  const groups: { key: string; ts: Team[]; fields: Field[] }[] = [];
  for (const f of BOARD_FIELDS) {
    const ts = leadersOf(teams, f);
    const key = ts.map(t => t.id).sort().join('+');
    const g = groups.find(x => x.key === key);
    if (g) g.fields.push(f); else groups.push({ key, ts, fields: [f] });
  }
  if (groups.length === 1 && groups[0].fields.length === 3) {
    const g = groups[0];
    return `${joinNames(g.ts)} ${g.ts.length > 1 ? 'lead' : 'leads'} all three boards!`;
  }
  return groups.map(g => `${joinNames(g.ts)} ${g.ts.length > 1 ? 'lead' : 'leads'} ${joinWords(g.fields.map(f => FIELD_LABEL[f]))}.`).join(' ');
}

// ---------------------------------------------------------------- leaderboards
function boardNarr(s: GameState, stepId: string, act: number, recap: boolean): Narration {
  const lines: NarrLine[] = [];
  const leaders = leaderSentence(s.teams);
  const hint: NarrLine = { text: 'But shh! The real winner is a secret mix of everything. We will not tell you how!', tone: 'whisper', pose: 'idle' };

  if (recap) {
    lines.push({ text: 'Welcome back! Here is where everyone stands.', tone: 'excited', pose: 'cheer', gap: 600 });
    lines.push({ text: leaders, pose: 'point', gap: 600 });
    lines.push(hint);
    return { id: `board-${stepId}`, lines, summary: `Welcome back! ${leaders} The real winner is a secret mix.` };
  }

  lines.push({ text: `Act ${act} is done! Time for the leaderboards!`, tone: 'excited', pose: 'cheer', gap: 500 });
  lines.push({ text: leaders, pose: 'point', gap: 600 });

  const moves = BOARD_FIELDS.flatMap(f => movesFor(s.teams, f, act));
  const fieldRank = (f: Field) => (f === 'coins' ? 0 : 1);   // customers and happiness matter most
  const risers = moves.filter(m => m.to < m.from)
    .sort((a, b) => Number(b.to === 0) - Number(a.to === 0) || fieldRank(b.field) - fieldRank(a.field) || (b.from - b.to) - (a.from - a.to));
  const fallers = moves.filter(m => m.to > m.from)
    .sort((a, b) => fieldRank(b.field) - fieldRank(a.field) || (b.to - b.from) - (a.to - a.from));

  if (risers[0]) {
    const r = risers[0];
    const text = r.to === 0
      ? `${teamName(r.team)} jumped to the top of ${FIELD_LABEL[r.field]}! Wow!`
      : `${teamName(r.team)} climbed up in ${FIELD_LABEL[r.field]}! Great job!`;
    lines.push({ text, tone: 'cheer', pose: 'cheer', gap: 600 });
  }
  if (fallers[0]) {
    const f = fallers[0];
    lines.push({ text: `${teamName(f.team)} slipped down a little in ${FIELD_LABEL[f.field]}. Do not worry, you can climb back!`, tone: 'calm', pose: 'sad', gap: 700 });
  }
  if (!risers[0] && !fallers[0]) {
    lines.push({ text: 'Everyone is just getting started, so anything can happen!', pose: 'talk', gap: 600 });
  }
  lines.push(hint);
  return { id: `board-${stepId}`, lines, summary: `${leaders} The real winner is a secret mix of everything.` };
}

// ---------------------------------------------------------------- progress step (after each act)
function progressNarr(stepId: string, act: number): Narration | null {
  if (act < 1) return null;
  const a = Math.min(6, act);
  const info = ACT_INFO[a - 1];
  const next = ACT_INFO[a];
  if (!next) {
    return {
      id: `progress-${stepId}`, showText: false,
      lines: [
        { text: 'All six acts are done! What a journey!', tone: 'cheer', pose: 'cheer', gap: 600 },
        { text: 'You built real startups in Techistan.', pose: 'talk' },
      ],
      summary: 'All six acts are done! You built real startups.',
    };
  }
  return {
    id: `progress-${stepId}`,
    showText: false,   // the same words are big on the screen
    lines: [
      { text: `Act ${a} done!`, tone: 'excited', pose: 'cheer', gap: 600 },
      { text: info.learned, pose: 'talk', gap: 800 },
      { text: `Next up: ${next.name}. ${next.hook}`, tone: 'excited', pose: 'point' },
    ],
    summary: `Act ${a} done! ${info.did}. Next: ${next.name}.`,
  };
}

// ---------------------------------------------------------------- host's progress overlay
function overlayNarr(s: GameState): Narration {
  const act = actOf(currentStep(s));
  const stepId = currentStep(s).id;
  if (act < 1) {
    return { id: `pv-0-${stepId}`, lines: [{ text: 'Taking a short pause. The game starts soon!', tone: 'calm', pose: 'idle' }] };
  }
  const a = Math.min(6, act);
  const info = ACT_INFO[a - 1];
  return {
    id: `pv-${a}-${stepId}`,
    lines: [
      { text: `We are on act ${a} of 6, taking a short pause.`, tone: 'calm', pose: 'idle', gap: 700 },
      { text: `Act ${a} is ${info.name}: ${info.goal}. Take a breath, we continue in a moment!`, tone: 'calm', pose: 'talk' },
    ],
    summary: `Act ${a} of 6: ${info.name}. A short pause, we continue soon.`,
  };
}

// ---------------------------------------------------------------- break
function breakNarr(): Narration {
  return {
    id: 'break',
    lines: [
      { text: 'Time for a break. You worked hard!', tone: 'calm', pose: 'idle', gap: 900 },
      { text: 'Take a slow, deep breath in... and out.', tone: 'calm', pose: 'idle', gap: 1400 },
      { text: 'Stretch your arms up high, have some water and walk around a little.', tone: 'calm', pose: 'talk', gap: 900 },
      { text: 'We will continue soon!', tone: 'calm', pose: 'wave' },
    ],
    summary: 'Breathe, stretch, have some water and walk around a little. We continue soon.',
  };
}

export function boardNarration(s: GameState): Narration | null {
  if (s.progressView) return overlayNarr(s);
  const step = currentStep(s);
  switch (step.kind) {
    case 'board': return boardNarr(s, step.id, step.act, !!step.recap);
    case 'progress': return progressNarr(step.id, step.act);
    case 'break': return breakNarr();
    default: return null;
  }
}

/** The recipe entry for an act (1..6), if any. */
export const recipeOf = (act: number) => RECIPE.find(r => r.act === act);
