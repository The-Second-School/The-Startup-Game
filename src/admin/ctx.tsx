import { createContext, useContext } from 'react';
import type { Action, GameState } from '../game/types';

export type Send = (a: Action | { type: 'UNDO' }) => void;
export interface AskOpts { title: string; body?: string; ok?: string; cancel?: string; danger?: boolean }
export interface Ctx {
  state: GameState;
  send: Send;
  room: string;
  ask: (o: AskOpts) => Promise<boolean>;
  connected: boolean;
}
export const AdminCtx = createContext<Ctx | null>(null);
export function useA(): Ctx {
  const c = useContext(AdminCtx);
  if (!c) throw new Error('AdminCtx missing');
  return c;
}
