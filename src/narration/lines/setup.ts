import { currentStep } from '../../game/engine';
import type { GameState } from '../../game/types';
import type { Narration } from '../types';
import { setupPlayersNarration } from './setupPlayers';
import { setupTeamsNarration } from './setupTeams';

/** lobby, players, names -> setupPlayers.ts. teams, roles, products -> setupTeams.ts */
export function setupNarration(s: GameState): Narration | null {
  const k = currentStep(s).kind;
  return k === 'setup_teams' || k === 'setup_roles' || k === 'setup_products' ? setupTeamsNarration(s) : setupPlayersNarration(s);
}
