// Admin phone store: mirrors the screen's state, sends actions to it.

import { create } from 'zustand';
import type { Action, GameState } from '../game/types';
import { openChannel, roomCode, type Channel } from '../sync/channel';

const ME = `admin-${Math.random().toString(36).slice(2, 7)}`;

interface AdminStore {
  state: GameState | null;
  lastSeen: number;          // ms timestamp of last state from the screen
  clockOffset: number;       // screen clock minus phone clock (ms). Use screenNow() for timers
  room: string;
  channel: Channel | null;
  send: (a: Action | { type: 'UNDO' }) => void;
  connect: () => void;
}

export const useAdmin = create<AdminStore>((set, get) => ({
  state: null,
  lastSeen: 0,
  clockOffset: 0,
  room: roomCode(),
  channel: null,
  send: a => get().channel?.send({ kind: 'action', action: a, from: ME }),
  connect: () => {
    if (get().channel) return;
    const channel = openChannel(get().room);
    channel.onMessage(m => {
      if (m.kind !== 'state') return;
      const cur = get().state;
      // Heartbeat replies carry an identical state: refresh the clock only, so the whole phone UI does not re-render every 2 s.
      const same = cur !== null && cur.updatedAt === m.state.updatedAt && cur.stepIndex === m.state.stepIndex;
      set(same ? { lastSeen: Date.now(), clockOffset: m.now - Date.now() } : { state: m.state, lastSeen: Date.now(), clockOffset: m.now - Date.now() });
    });
    set({ channel });
    const hello = () => channel.send({ kind: 'hello', from: ME });
    hello();
    setInterval(() => { if (Date.now() - get().lastSeen > 4000) hello(); }, 2000);
  },
}));

/** The big screen's clock, as seen from the phone. Pass to timerRemaining(state, screenNow()). */
export const screenNow = () => Date.now() + useAdmin.getState().clockOffset;
