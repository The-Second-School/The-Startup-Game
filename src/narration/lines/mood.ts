// Customer Mood check. The engine (moodFor) does the weighted maths; here we only turn each team's result into a few simple,
// kid-friendly sentences. Every team gets its own narration (the id carries the step, the team index AND the team id), the
// team is named in every line, and the 'stayed' case is narrated just like leaving and joining.
import { currentStep, moodFor } from '../../game/engine';
import type { GameState, MoodResult, MoodState, Team } from '../../game/types';
import type { Narration, NarrLine } from '../types';

/** The act this mood check belongs to (it looks at acts 1..upto). */
export function moodActOf(s: GameState): number {
  const step = currentStep(s);
  return 'act' in step ? step.act : 2;
}

export const moodSpanText = (upto: number) => (upto <= 2 ? 'Acts 1 and 2' : 'all 5 acts');

/** The concept, said once before the first team. Spoken by the intro scene itself, shown big on screen. */
export function moodIntroText(upto: number): string {
  const tail = upto <= 2
    ? 'Let us see how each startup did over Acts 1 and 2.'
    : 'This time we look at all 5 acts, and the later acts count double.';
  return `Customer Mood check! Customers who are not happy get bored and leave. Very happy ones bring their friends. ${tail}`;
}

/** Unique per step + team index + team, so every team (first, middle, last, stayed or not) is spoken. */
export const moodNarrId = (stepId: string, index: number, teamId: string) => `mood-${stepId}-team${index}-${teamId}`;

/** The pending result for a team (computed on the spot in the rare case the team joined after the step started). */
export function moodResult(st: MoodState, team: Team, upto: number): MoodResult {
  return st.pending[team.id] ?? moodFor(team, upto);
}

const customersWord = (n: number) => (n === 1 ? 'customer' : 'customers');
const teamLabel = (t: Team) => t.name.trim() || 'This team';

/** Short on-screen sentence (the team name is already big next to it). */
export function moodHeadline(kind: MoodResult['kind'], n: number): string {
  if (kind === 'left') return `Not happy enough, so ${n} ${customersWord(n)} got bored and left.`;
  if (kind === 'joined') return `So happy that ${n} ${n === 1 ? 'friend' : 'friends'} came along!`;
  return 'Happy enough, so everyone stays.';
}

function teamLines(team: Team, m: MoodResult, upto: number): { lines: NarrLine[]; summary: string } {
  const name = teamLabel(team);
  const n = Math.abs(m.customers);
  const span = moodSpanText(upto);
  const won = m.gained === 0 ? 'no new customers' : `${m.gained} new ${customersWord(m.gained)}`;
  const hap = m.happy > 0 ? `earned ${m.happy} happiness` : m.happy === 0 ? 'earned no happiness' : `lost ${-m.happy} happiness`;
  const first: NarrLine = {
    text: `Over ${span}, ${name} won ${won}${m.kind === 'left' ? ', but' : ' and'} ${hap}.`,
    gap: 700,
  };
  if (m.kind === 'left') {
    return {
      lines: [first, { text: `${name}’s customers were not happy enough, so ${n} got bored and left.`, tone: 'calm', pose: 'sad', gap: 1000 }],
      summary: `${name} lost ${n} ${customersWord(n)} who got bored.`,
    };
  }
  if (m.kind === 'joined') {
    return {
      lines: [first, { text: `${name}’s customers were so happy, they brought ${n} ${n === 1 ? 'friend' : 'friends'}!`, tone: 'cheer', pose: 'cheer', gap: 1000 }],
      summary: `${name} gained ${n} ${customersWord(n)} from happy friends.`,
    };
  }
  return {
    lines: [first, { text: `${name}’s customers are happy enough, so everyone stays.`, tone: 'normal', pose: 'idle', gap: 1000 }],
    summary: `${name}: nobody left and nobody joined.`,
  };
}

function nameList(ts: Team[]): string {
  if (ts.length > 3) return `${ts.length} teams`;
  const names = ts.map(teamLabel);
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export function moodNarration(s: GameState): Narration | null {
  const st = s.step;
  if (st.type !== 'mood') return null;
  const step = currentStep(s);
  const upto = moodActOf(s);

  // The intro scene speaks the concept itself (see MoodView), so nothing to add here.
  if (st.phase === 'intro') return null;

  if (st.phase === 'team') {
    const team = s.teams[st.index];
    if (!team) return null;
    const { lines, summary } = teamLines(team, moodResult(st, team, upto), upto);
    return { id: moodNarrId(step.id, st.index, team.id), lines, summary, showText: false };
  }

  // done: one-line wrap-up
  const results = s.teams.map(t => ({ t, m: moodResult(st, t, upto) }));
  const gained = results.filter(r => r.m.kind === 'joined').map(r => r.t);
  const lost = results.filter(r => r.m.kind === 'left').map(r => r.t);
  const parts: string[] = [];
  if (gained.length) parts.push(`${nameList(gained)} got new customers from happy friends`);
  if (lost.length) parts.push(`${nameList(lost)} lost customers who got bored`);
  const text = parts.length
    ? `Mood check done! ${parts.join(', and ')}.`
    : 'Mood check done! Every startup kept its customers, nice and steady.';
  return {
    id: `mood-${step.id}-done`,
    lines: [{ text, tone: gained.length && !lost.length ? 'excited' : 'normal', pose: gained.length && !lost.length ? 'cheer' : 'idle' }],
  };
}
