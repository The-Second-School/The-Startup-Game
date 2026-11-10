// Per-view game context. Each view element carries its own frozen `state`, so a view that is
// animating out (AnimatePresence) keeps rendering the state it was made for and never crashes
// on the next step's state.
import { createContext, useContext } from 'react';
import type { Action, GameState } from '../../game/types';

export type Dispatch = (a: Action | { type: 'UNDO' }) => void;
export interface GameCtx { state: GameState; dispatch: Dispatch; live: boolean }

export const Ctx = createContext<GameCtx | null>(null);

export function useGame(): GameCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useGame outside a view');
  return c;
}
