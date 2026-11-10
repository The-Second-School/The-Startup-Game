import type { GameState, Team } from '../../game/types';

/** Teams in the order the strip shows them (Mega Order groups partners side by side). */
export function stripOrder(s: GameState): Team[] {
  if (s.step.type === 'megaorder') {
    const ids = s.step.pairs.flat();
    const rest = s.teams.filter(t => !ids.includes(t.id));
    return [...ids.map(id => s.teams.find(t => t.id === id)!).filter(Boolean), ...rest];
  }
  return s.teams;
}
