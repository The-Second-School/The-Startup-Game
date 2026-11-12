import { currentStep } from '../../game/engine';
import type { GameState } from '../../game/types';
import type { Narration } from '../types';
import { bugNarration } from './bug';
import { auctionNarration } from './auction';
import { moodNarration } from './mood';
import { micNarration } from './mic';

export function sideNarration(s: GameState): Narration | null {
  switch (currentStep(s).kind) {
    case 'bugsmash': return bugNarration(s);
    case 'auction': return auctionNarration(s);
    case 'mood': return moodNarration(s);
    case 'mic': return micNarration(s);
    default: return null;
  }
}
