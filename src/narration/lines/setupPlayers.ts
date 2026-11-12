// Narration for the lobby, the players step and the team-names step (Bolt speaks, transcript sits in the dock).
// Ids stay stable inside a phase: adding a player never re-speaks the intro, only crossing a milestone gives one short cheer.
import { currentStep } from '../../game/engine';
import type { GameState } from '../../game/types';
import type { Narration } from '../types';

const isDefaultName = (name: string) => !name.trim() || /^Team \d+$/.test(name.trim());

const MILESTONES = [6, 12, 18, 24, 30, 40];
let bestMilestone = 0;           // highest cheer already earned (never goes back, so deleting players does not repeat the intro)

const CHEERS = ['Great name!', 'Love it!', 'Super cool!', 'Awesome name!', 'Wow, nice one!', 'That is a winner!'];
const seenNames: Record<string, string> = {};
let recentName = '';

function lobby(): Narration {
  return {
    id: 'lobby',
    lines: [{ text: 'Welcome to The Startup Game! Get ready to build your very own startup!', tone: 'excited', pose: 'wave', gap: 700 }],
  };
}

function players(s: GameState): Narration {
  const n = s.players.length;
  if (n === 0) bestMilestone = 0;
  const hit = MILESTONES.filter(m => n >= m).pop() ?? 0;
  if (hit > bestMilestone) bestMilestone = hit;
  if (bestMilestone > 0) {
    return {
      id: `players-m${bestMilestone}`,
      lines: [{ text: `Wow, more than ${bestMilestone} founders! Keep them coming!`, tone: 'cheer', pose: 'cheer' }],
    };
  }
  return {
    id: 'players-intro',
    lines: [
      { text: 'Who is playing? Add your name and your class!', tone: 'excited', pose: 'point', gap: 600 },
      { text: 'Tell us your class so we can make fair, mixed teams! Class is never scored.', tone: 'normal', pose: 'talk', gap: 700 },
    ],
    summary: 'Add your name and class. Class only helps make fair, mixed teams!',
  };
}

function names(s: GameState): Narration | null {
  const teams = s.teams;
  if (teams.length === 0) return null;
  const named = teams.filter(t => !isDefaultName(t.name));
  const k = named.length;
  if (k === 0) {
    for (const key of Object.keys(seenNames)) delete seenNames[key];
    recentName = '';
    return {
      id: 'names-start',
      lines: [
        { text: 'Name your team!', tone: 'excited', pose: 'point', gap: 600 },
        { text: 'Talk it over together, then type your team name.', tone: 'normal', pose: 'talk', gap: 700 },
      ],
      summary: 'Talk it over, then type your team name on the keyboard.',
    };
  }
  // remember which team was named last (the engine keeps no recency)
  for (const t of named) {
    if (seenNames[t.id] !== t.name) { recentName = t.name; seenNames[t.id] = t.name; }
  }
  if (k < teams.length) {
    const left = teams.length - k;
    return {
      id: `names-${k}-${named.map(t => t.name).join('|')}`,
      lines: [{ text: `${CHEERS[(k - 1) % CHEERS.length]} ${recentName}! ${left === 1 ? 'One team left!' : 'Next team, your turn!'}`, tone: 'cheer', pose: 'cheer' }],
    };
  }
  const list = teams.map(t => t.name.trim());
  const meet = list.length === 1 ? list[0] : `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
  return {
    id: `names-done-${list.join('|')}`,
    lines: [
      { text: 'All teams are named!', tone: 'excited', pose: 'cheer', gap: 700 },
      { text: `Meet the teams: ${meet}!`, tone: 'excited', pose: 'cheer', gap: 900 },
    ],
    summary: `Meet the teams: ${meet}!`,
  };
}

export function setupPlayersNarration(s: GameState): Narration | null {
  switch (currentStep(s).kind) {
    case 'lobby': return lobby();
    case 'setup_players': return players(s);
    case 'setup_names': return names(s);
    default: return null;
  }
}
