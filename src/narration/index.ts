// The registry: one function per area returns the narration for the current game state (or null = nothing to say here /
// the screen narrates itself). Each area file owns the words for its screens.
import { currentStep } from '../game/engine';
import type { GameState } from '../game/types';
import type { Narration } from './types';
import { setupNarration } from './lines/setup';
import { questionNarration } from './lines/question';
import { sideNarration } from './lines/side';
import { boardNarration } from './lines/board';
import { showNarration } from './lines/show';

export type { Narration, NarrLine, Tone, Mascot } from './types';

export function narrationFor(s: GameState): Narration | null {
  if (s.progressView) return boardNarration(s);      // the host switched the progress overlay on
  const step = currentStep(s);
  switch (step.kind) {
    case 'lobby': case 'setup_players': case 'setup_teams': case 'setup_names': case 'setup_roles': case 'setup_products':
      return setupNarration(s);
    case 'question': case 'price': case 'megaorder':
      return questionNarration(s);
    case 'bugsmash': case 'auction': case 'mood': case 'mic':
      return sideNarration(s);
    case 'board': case 'progress': case 'break':
      return boardNarration(s);
    case 'pitch': case 'awards': case 'end':
      return showNarration(s);
    default:
      return null;   // scenes narrate themselves
  }
}
