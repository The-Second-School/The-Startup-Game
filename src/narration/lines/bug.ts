// Bug Smash narration: why we smash (customers hate bugs), ready / set / smash, what changed, and the wrap-up.
import { BONUS_WHY, BUG } from '../../game/content';
import { bugSeconds } from '../../game/engine';
import { memberWithRole } from '../../game/helpers';
import type { BugState, GameState, Team } from '../../game/types';
import type { Narration, NarrLine } from '../types';

/** The screen writes what really happened in a round here (smashed + friends hit); the score sent to the engine is smashed minus penalties. */
export const BUG_PENALTY = 2;
export const bugStats: Record<string, { smashed: number; hits: number }> = {};

const nameOf = (t: Team) => t.name.trim() || 'This team';
const tierOf = (n: number) => BUG.tiers.find(t => n >= t.min && n <= t.max) ?? BUG.tiers[0];
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "Happiness went up by 4 and 2 new customers joined" built from the real deltas. */
export function bugChangeText(happiness: number, customers: number): string {
  const parts: string[] = [];
  if (happiness > 0) parts.push(`happiness went up by ${happiness}`);
  else if (happiness < 0) parts.push(`happiness dropped by ${-happiness}`);
  if (customers > 0) parts.push(`${plural(customers, 'new customer')} joined`);
  else if (customers < 0) parts.push(`${plural(-customers, 'customer')} left`);
  if (!parts.length) return 'nothing changed for the customers';
  const s = parts.join(' and ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function lastBugDeltas(t: Team) {
  const e = [...t.history].reverse().find(h => h.stepId === 'bugsmash');
  return e ? e.deltas : null;
}

export function bugNarration(s: GameState): Narration | null {
  const st = s.step as BugState;
  if (st.type !== 'bugsmash') return null;

  if (st.phase === 'intro') {
    const lines: NarrLine[] = [
      { text: 'Bug Smash time! Jhootu sneaked bugs into your apps.', tone: 'excited', pose: 'point', gap: 700 },
      { text: 'Bugs make customers grumpy, and some customers even leave.', tone: 'normal', pose: 'shock', gap: 900 },
      { text: 'So every team gets a turn to smash bugs and protect its startup. More smashed bugs means happier customers!', tone: 'normal', pose: 'cheer', gap: 900 },
      { text: 'Careful: butterflies are friends, so do not tap them. Armoured bugs need two taps.', tone: 'normal', pose: 'point', gap: 900 },
      { text: 'Teams that tested early with friends get 5 extra seconds. Their app has fewer bugs to fix.', say: 'Teams that tested early with friends get five extra seconds. Their app has fewer bugs to fix.', tone: 'calm', pose: 'idle' },
    ];
    return { id: 'bugs-intro', lines, summary: 'Smash bugs to keep customers happy. Skip the butterflies. Tested early? +5 seconds!' };
  }

  const team = s.teams[st.turn];
  if (st.phase === 'turn' && team) {
    const name = nameOf(team);
    if (st.turnPhase === 'ready') {
      const lock = memberWithRole(team, 'lock');
      const tested = bugSeconds(team) > BUG.seconds;
      const lines: NarrLine[] = [
        { text: lock ? `${name}, ${lock.name} is the Lock Master. You are up!` : `${name}, you are up!`, tone: 'excited', pose: 'point', gap: 700 },
      ];
      if (tested) lines.push({ text: BONUS_WHY, say: BONUS_WHY.replace('5 extra', 'five extra'), tone: 'whisper', gap: 700 });
      lines.push({ text: 'Lock Master, tap START when your team is ready.', tone: 'normal' });
      return { id: `bugs-ready-${st.turn}`, lines, summary: tested ? 'You tested early, so you get extra time. Tap START!' : 'Tap START when ready.', showText: false };
    }
    if (st.turnPhase === 'playing') {
      return { id: `bugs-play-${st.turn}`, lines: [{ text: 'Ready, set, SMASH!', tone: 'cheer', pose: 'cheer', gap: 0 }], showText: false };
    }
    // result
    const n = st.results[team.id] ?? 0;
    const tier = tierOf(n);
    const d = lastBugDeltas(team);
    const happiness = d ? d.happiness : tier.happiness;
    const customers = d ? d.customers : tier.customers;
    const stat = bugStats[team.id];
    const first = stat && stat.hits > 0
      ? `${name} smashed ${plural(stat.smashed, 'bug')}, but hit ${plural(stat.hits, 'friend')}, so the score is ${n}.`
      : `${name} smashed ${plural(n, 'bug')}!`;
    const good = tier.happiness > 0;
    const bad = tier.happiness < 0;
    const lines: NarrLine[] = [
      { text: first, tone: good ? 'cheer' : 'excited', pose: good ? 'cheer' : bad ? 'sad' : 'idle', gap: 600 },
      { text: `${tier.text}.`, tone: 'normal', gap: 700 },
      { text: `${bugChangeText(happiness, customers)}.`, tone: good ? 'cheer' : 'normal', pose: good ? 'cheer' : bad ? 'sad' : 'idle' },
    ];
    return { id: `bugs-result-${st.turn}`, lines, summary: `${nameOf(team)} score ${n}: ${bugChangeText(happiness, customers).toLowerCase()}.`, showText: false };
  }

  // done: wrap-up
  const scores = s.teams.map(t => ({ t, n: st.results[t.id] ?? 0 }));
  const best = Math.max(0, ...scores.map(x => x.n));
  const champs = scores.filter(x => x.n === best).map(x => nameOf(x.t));
  const champText = champs.length === 1 ? champs[0] : champs.slice(0, -1).join(', ') + ' and ' + champs[champs.length - 1];
  const lines: NarrLine[] = [{ text: 'Bug report time!', tone: 'excited', pose: 'cheer', gap: 600 }];
  if (best >= BUG.tiers[1].min) {
    lines.push({ text: `${champText} smashed the most bugs, with ${plural(best, 'bug')}!`, tone: 'cheer', pose: 'cheer', gap: 800 });
  } else {
    lines.push({ text: 'Phew, lots of bugs got through this time. Customers were not happy.', tone: 'normal', pose: 'sad', gap: 800 });
  }
  lines.push({ text: 'Fewer bugs means happier customers and fewer customers leaving. Your meters have been updated!', tone: 'normal', pose: 'point' });
  return { id: 'bugs-done', lines, summary: best >= BUG.tiers[1].min ? `${champText} smashed the most bugs. Fewer bugs = happier customers.` : 'Too many bugs got through. Fewer bugs = happier customers.' };
}
